import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, Integer, Float, JSON
from app.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=True)
    role = Column(String(50), default="analyst")
    auth_provider = Column(String(50), nullable=True)
    provider_id = Column(String(255), nullable=True, index=True)
    full_name = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Integer, default=1)


class UploadedFile(Base):
    __tablename__ = "uploaded_files"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    filepath = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)  # 'csv' or 'model'
    columns = Column(JSON, nullable=True)
    row_count = Column(Integer, nullable=True)
    file_size = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class AuditReport(Base):
    __tablename__ = "audit_reports"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, nullable=False, index=True)
    file_id = Column(String, nullable=False)
    filename = Column(String(255), nullable=False)
    target_column = Column(String(255), nullable=False)
    sensitive_attributes = Column(JSON, nullable=False)
    favorable_label = Column(String(100), nullable=True)
    model_type = Column(String(100), nullable=True)

    # Bias Metrics
    disparate_impact = Column(Float, nullable=True)
    statistical_parity_diff = Column(Float, nullable=True)
    equal_opportunity_diff = Column(Float, nullable=True)
    average_odds_diff = Column(Float, nullable=True)
    theil_index = Column(Float, nullable=True)
    overall_fairness_score = Column(Float, nullable=True)

    # Detailed results
    metrics_json = Column(JSON, nullable=True)
    group_metrics_json = Column(JSON, nullable=True)
    shap_summary_json = Column(JSON, nullable=True)
    lime_summary_json = Column(JSON, nullable=True)
    mitigation_json = Column(JSON, nullable=True)
    feature_importance_json = Column(JSON, nullable=True)

    status = Column(String(50), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
