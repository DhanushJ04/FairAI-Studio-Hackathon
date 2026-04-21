import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from app.database import get_db
from app.deps import get_current_active_user
from app.services.pdf_generator import generate_pdf_report

router = APIRouter()


@router.get("/reports")
async def list_reports(db=Depends(get_db), current_user: dict = Depends(get_current_active_user)):
    """Returns a list of all completed audit reports with only necessary columns."""
    cursor = db.audit_reports.find(
        {"status": "completed", "user_id": current_user["_id"]},
        {
            "_id": 1,
            "filename": 1,
            "target_column": 1,
            "sensitive_attributes": 1,
            "overall_fairness_score": 1,
            "disparate_impact": 1,
            "status": 1,
            "created_at": 1,
        },
    ).sort("created_at", -1)

    reports = await cursor.to_list(length=None)
    return [
        {
            "id": r["_id"],
            "filename": r.get("filename"),
            "target_column": r.get("target_column"),
            "sensitive_attributes": r.get("sensitive_attributes"),
            "overall_fairness_score": r.get("overall_fairness_score"),
            "disparate_impact": r.get("disparate_impact"),
            "status": r.get("status"),
            "created_at": r["created_at"].isoformat() if r.get("created_at") else None,
        }
        for r in reports
    ]


@router.get("/reports/stats")
async def get_report_stats(db=Depends(get_db), current_user: dict = Depends(get_current_active_user)):
    """Returns summary statistics for the user's audit reports."""
    pipeline = [
        {"$match": {"user_id": current_user["_id"], "status": "completed"}},
        {
            "$group": {
                "_id": None,
                "total": {"$sum": 1},
                "fair": {
                    "$sum": {
                        "$cond": [{"$gte": ["$overall_fairness_score", 0.7]}, 1, 0]
                    }
                },
            }
        },
    ]
    result = await db.audit_reports.aggregate(pipeline).to_list(length=1)
    if result:
        total = result[0]["total"]
        fair = result[0]["fair"]
    else:
        total = 0
        fair = 0
    return {"total": total, "fair": fair, "biased": total - fair}


@router.get("/reports/global-stats")
async def get_global_stats(db=Depends(get_db)):
    """Returns global summary statistics for all audit reports."""
    pipeline = [
        {"$match": {"status": "completed"}},
        {
            "$group": {
                "_id": None,
                "total": {"$sum": 1},
                "fair": {
                    "$sum": {
                        "$cond": [{"$gte": ["$overall_fairness_score", 0.7]}, 1, 0]
                    }
                },
            }
        },
    ]
    result = await db.audit_reports.aggregate(pipeline).to_list(length=1)
    if result:
        total = result[0]["total"]
        fair = result[0]["fair"]
    else:
        total = 0
        fair = 0
    return {"total": total, "fair": fair, "biased": total - fair}


@router.delete("/reports/{report_id}")
async def delete_report(report_id: str, db=Depends(get_db), current_user: dict = Depends(get_current_active_user)):
    """Deletes an audit report by ID."""
    result = await db.audit_reports.delete_one({"_id": report_id, "user_id": current_user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Report not found.")
    return {"message": "Report deleted successfully."}


@router.get("/generate-report/{report_id}")
async def generate_report(report_id: str, db=Depends(get_db), current_user: dict = Depends(get_current_active_user)):
    """Generates and streams a PDF audit report."""
    report_record = await db.audit_reports.find_one({"_id": report_id, "user_id": current_user["_id"]})

    if not report_record:
        raise HTTPException(status_code=404, detail="Audit report not found.")

    if report_record.get("status") != "completed":
        raise HTTPException(status_code=400, detail="Audit report is not yet completed.")

    data_for_pdf = {
        "filename": report_record["filename"],
        "target_column": report_record["target_column"],
        "sensitive_attributes": report_record["sensitive_attributes"],
        "overall_fairness_score": report_record.get("overall_fairness_score"),
        "metrics": report_record.get("metrics_json"),
        "mitigation_strategies": report_record.get("mitigation_json"),
    }

    try:
        pdf_path = generate_pdf_report(report_record["_id"], data_for_pdf)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")

    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=500, detail="PDF generation failed silently.")

    return FileResponse(
        path=pdf_path,
        filename="AI_Bias_Audit.pdf",
        media_type="application/pdf",
    )
