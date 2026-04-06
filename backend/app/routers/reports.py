import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database import get_db
from app.models import AuditReport, User
from app.deps import get_current_active_user
from app.services.pdf_generator import generate_pdf_report

router = APIRouter()


@router.get("/reports")
async def list_reports(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    """Returns a list of all completed audit reports."""
    result = await db.execute(
        select(AuditReport)
        .where(AuditReport.status == "completed", AuditReport.user_id == current_user.id)
        .order_by(desc(AuditReport.created_at))
    )
    reports = result.scalars().all()
    return [
        {
            "id": r.id,
            "filename": r.filename,
            "target_column": r.target_column,
            "sensitive_attributes": r.sensitive_attributes,
            "overall_fairness_score": r.overall_fairness_score,
            "disparate_impact": r.disparate_impact,
            "status": r.status,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in reports
    ]


@router.delete("/reports/{report_id}")
async def delete_report(report_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    """Deletes an audit report by ID."""
    result = await db.execute(select(AuditReport).where(AuditReport.id == report_id, AuditReport.user_id == current_user.id))
    report = result.scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")
    await db.delete(report)
    await db.commit()
    return {"message": "Report deleted successfully."}


@router.get("/generate-report/{report_id}")
async def generate_report(report_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    """Generates and streams a PDF audit report."""
    result = await db.execute(select(AuditReport).where(AuditReport.id == report_id, AuditReport.user_id == current_user.id))
    report_record = result.scalars().first()

    if not report_record:
        raise HTTPException(status_code=404, detail="Audit report not found.")

    if report_record.status != "completed":
        raise HTTPException(status_code=400, detail="Audit report is not yet completed.")

    data_for_pdf = {
        "filename": report_record.filename,
        "target_column": report_record.target_column,
        "sensitive_attributes": report_record.sensitive_attributes,
        "overall_fairness_score": report_record.overall_fairness_score,
        "metrics": report_record.metrics_json,
        "mitigation_strategies": report_record.mitigation_json,
    }

    try:
        pdf_path = generate_pdf_report(report_record.id, data_for_pdf)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")

    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=500, detail="PDF generation failed silently.")

    return FileResponse(
        path=pdf_path,
        filename="AI_Bias_Audit.pdf",
        media_type="application/pdf",
    )
