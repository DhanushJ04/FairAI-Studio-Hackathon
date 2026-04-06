import os
import joblib
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from app.database import get_db
from app.models import UploadedFile, AuditReport, User
from app.deps import get_current_active_user
from app.schemas import AnalysisRequest, AnalysisResponse
from app.services.data_parser import load_data
from app.services.bias_detector import calculate_bias_metrics
from app.services.explainer import calculate_shap, calculate_lime
from app.services.mitigator import generate_mitigation_strategies

router = APIRouter()

@router.post("/analyze-bias", response_model=AnalysisResponse)
async def analyze_bias(request: AnalysisRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    # 1. Fetch file info
    result = await db.execute(select(UploadedFile).where(UploadedFile.id == request.file_id, UploadedFile.user_id == current_user.id))
    file_record = result.scalars().first()
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found.")
        
    filepath = file_record.filepath
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Physical file missing.")

    # 2. Load and Prepare Data
    df = load_data(filepath, request.target_column)
    if df.empty:
        raise HTTPException(status_code=400, detail="Dataset is empty after cleaning.")
        
    # Ensure all sensitive attributes are present
    for attr in request.sensitive_attributes:
        if attr not in df.columns:
            raise HTTPException(status_code=400, detail=f"Sensitive attribute '{attr}' not found in dataset.")

    # Convert object columns to category or numeric for modeling
    le_dict = {}
    X = df.drop(columns=[request.target_column])
    for col in X.columns:
        if X[col].dtype == 'object' or str(X[col].dtype) == 'category':
            le = LabelEncoder()
            X[col] = le.fit_transform(X[col])
            le_dict[col] = le
            
    # Target encoding
    y = df[request.target_column]
    if y.dtype == 'object' or str(y.dtype) == 'category':
        y_le = LabelEncoder()
        y = pd.Series(y_le.fit_transform(y), name=y.name)
    
    # Identify favorable label (1 usually)
    favorable_label = 1
    if request.favorable_label:
        if request.favorable_label.isdigit() or request.favorable_label in ["0", "1"]:
             favorable_label = int(request.favorable_label)
        elif 'y_le' in locals():
            try:
                favorable_label = int(y_le.transform([request.favorable_label])[0])
            except:
                pass
                
    # 3. Model Handling
    model = None
    if request.model_file_id:
        m_res = await db.execute(select(UploadedFile).where(UploadedFile.id == request.model_file_id, UploadedFile.user_id == current_user.id))
        m_record = m_res.scalars().first()
        if m_record and os.path.exists(m_record.filepath):
            try:
                model = joblib.load(m_record.filepath)
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Could not load model: {str(e)}")
    
    if model is None:
        model = RandomForestClassifier(n_estimators=50, random_state=42)
        model.fit(X, y)
        
    # 4. Predictions
    y_pred = pd.Series(model.predict(X))
    sensitive_features = df[request.sensitive_attributes]
    
    # 5. Bias Metrics
    bias_results = calculate_bias_metrics(y, y_pred, sensitive_features, favorable_label)
    
    # 6. Explainability
    shap_features = calculate_shap(model, X, is_tree=isinstance(model, RandomForestClassifier))
    lime_explanations = calculate_lime(model, X, num_samples=3)
    
    # 7. Mitigation Strategies
    mitigations = generate_mitigation_strategies(bias_results["metrics"])
    
    # 8. Save Report to DB
    report = AuditReport(
        user_id=current_user.id,
        file_id=request.file_id,
        filename=file_record.filename,
        target_column=request.target_column,
        sensitive_attributes=request.sensitive_attributes,
        favorable_label=str(request.favorable_label),
        disparate_impact=next((m["value"] for m in bias_results["metrics"] if "Disparate Impact" in m["name"]), None),
        statistical_parity_diff=next((m["value"] for m in bias_results["metrics"] if "Statistical Parity Difference" in m["name"]), None),
        overall_fairness_score=bias_results["overall_fairness_score"],
        metrics_json=bias_results["metrics"],
        group_metrics_json=bias_results["group_metrics"],
        shap_summary_json=shap_features,
        lime_summary_json=lime_explanations,
        mitigation_json=mitigations,
        status="completed"
    )
    
    db.add(report)
    await db.commit()
    await db.refresh(report)
    
    return {
        "report_id": report.id,
        "filename": file_record.filename,
        "target_column": request.target_column,
        "sensitive_attributes": request.sensitive_attributes,
        "overall_fairness_score": bias_results["overall_fairness_score"],
        "metrics": bias_results["metrics"],
        "group_metrics": bias_results["group_metrics"],
        "shap_features": shap_features,
        "lime_explanations": lime_explanations,
        "mitigation_strategies": mitigations,
        "created_at": report.created_at
    }

@router.get("/metrics/{report_id}")
async def get_metrics(report_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    result = await db.execute(select(AuditReport).where(AuditReport.id == report_id, AuditReport.user_id == current_user.id))
    report = result.scalars().first()
    if not report: raise HTTPException(404, "Report not found")
    return {"metrics": report.metrics_json, "group_metrics": report.group_metrics_json}

@router.get("/summary/{report_id}")
async def get_summary(report_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    result = await db.execute(select(AuditReport).where(AuditReport.id == report_id, AuditReport.user_id == current_user.id))
    report = result.scalars().first()
    if not report: raise HTTPException(404, "Report not found")
    return {
        "report_id": report.id,
        "filename": report.filename,
        "target_column": report.target_column,
        "sensitive_attributes": report.sensitive_attributes,
        "overall_score": report.overall_fairness_score,
        "metrics": report.metrics_json,
        "group_metrics": report.group_metrics_json,
        "shap": report.shap_summary_json,
        "lime": report.lime_summary_json,
        "mitigations": report.mitigation_json,
        "created_at": report.created_at.isoformat() if report.created_at else None,
    }

@router.get("/mitigation/{report_id}")
async def get_mitigation(report_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    result = await db.execute(select(AuditReport).where(AuditReport.id == report_id, AuditReport.user_id == current_user.id))
    report = result.scalars().first()
    if not report: raise HTTPException(404, "Report not found")
    return {"mitigations": report.mitigation_json}
