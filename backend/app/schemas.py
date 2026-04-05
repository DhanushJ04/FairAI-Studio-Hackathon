from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, EmailStr


# ─── Auth Schemas ─────────────────────────────────────────────
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    full_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ─── Upload Schemas ───────────────────────────────────────────
class ColumnInfo(BaseModel):
    name: str
    dtype: str
    unique_count: int
    null_count: int
    sample_values: List[Any]


class UploadResponse(BaseModel):
    file_id: str
    filename: str
    file_type: str
    columns: List[ColumnInfo]
    row_count: int
    preview: List[Dict[str, Any]]


# ─── Analysis Schemas ─────────────────────────────────────────
class AnalysisRequest(BaseModel):
    file_id: str
    target_column: str
    sensitive_attributes: List[str]
    favorable_label: Optional[str] = None
    model_file_id: Optional[str] = None


class BiasMetric(BaseModel):
    name: str
    value: float
    threshold: float
    status: str  # "fair", "warning", "biased"
    description: str


class GroupMetric(BaseModel):
    group_name: str
    group_value: str
    positive_rate: float
    true_positive_rate: float
    false_positive_rate: float
    accuracy: float
    count: int


class ShapFeature(BaseModel):
    feature: str
    importance: float
    direction: str  # "positive" or "negative"


class LimeExplanation(BaseModel):
    instance_index: int
    prediction: float
    features: List[Dict[str, Any]]
    group: Optional[str] = None


class MitigationStrategy(BaseModel):
    name: str
    category: str  # "pre-processing", "in-processing", "post-processing"
    description: str
    severity: str  # "low", "medium", "high"
    recommended: bool


class AnalysisResponse(BaseModel):
    report_id: str
    filename: str
    target_column: str
    sensitive_attributes: List[str]
    overall_fairness_score: float
    metrics: List[BiasMetric]
    group_metrics: List[GroupMetric]
    shap_features: List[ShapFeature]
    lime_explanations: List[LimeExplanation]
    mitigation_strategies: List[MitigationStrategy]
    created_at: datetime


# ─── Report Schemas ───────────────────────────────────────────
class ReportSummary(BaseModel):
    id: str
    filename: str
    target_column: str
    sensitive_attributes: List[str]
    overall_fairness_score: Optional[float]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
