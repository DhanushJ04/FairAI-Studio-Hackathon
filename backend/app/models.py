"""
MongoDB document helpers.

Instead of SQLAlchemy ORM models, we use plain dicts for MongoDB documents.
These helper functions create properly structured documents with defaults.
"""
import uuid
from datetime import datetime, timezone


def generate_uuid():
    return str(uuid.uuid4())


def create_user_doc(
    username: str,
    email: str,
    hashed_password: str = None,
    role: str = "analyst",
    auth_provider: str = None,
    provider_id: str = None,
    full_name: str = None,
) -> dict:
    return {
        "_id": generate_uuid(),
        "username": username,
        "email": email,
        "hashed_password": hashed_password,
        "role": role,
        "auth_provider": auth_provider,
        "provider_id": provider_id,
        "full_name": full_name,
        "created_at": datetime.now(timezone.utc),
        "is_active": 1,
    }


def create_uploaded_file_doc(
    file_id: str,
    user_id: str,
    filename: str,
    filepath: str,
    file_type: str,
    columns=None,
    row_count: int = 0,
    file_size: int = 0,
) -> dict:
    return {
        "_id": file_id,
        "user_id": user_id,
        "filename": filename,
        "filepath": filepath,
        "file_type": file_type,
        "columns": columns,
        "row_count": row_count,
        "file_size": file_size,
        "created_at": datetime.now(timezone.utc),
    }


def create_audit_report_doc(
    user_id: str,
    file_id: str,
    filename: str,
    target_column: str,
    sensitive_attributes: list,
    favorable_label: str = None,
    model_type: str = None,
    disparate_impact: float = None,
    statistical_parity_diff: float = None,
    equal_opportunity_diff: float = None,
    average_odds_diff: float = None,
    theil_index: float = None,
    overall_fairness_score: float = None,
    metrics_json=None,
    group_metrics_json=None,
    shap_summary_json=None,
    lime_summary_json=None,
    mitigation_json=None,
    feature_importance_json=None,
    status: str = "pending",
) -> dict:
    return {
        "_id": generate_uuid(),
        "user_id": user_id,
        "file_id": file_id,
        "filename": filename,
        "target_column": target_column,
        "sensitive_attributes": sensitive_attributes,
        "favorable_label": favorable_label,
        "model_type": model_type,
        "disparate_impact": disparate_impact,
        "statistical_parity_diff": statistical_parity_diff,
        "equal_opportunity_diff": equal_opportunity_diff,
        "average_odds_diff": average_odds_diff,
        "theil_index": theil_index,
        "overall_fairness_score": overall_fairness_score,
        "metrics_json": metrics_json,
        "group_metrics_json": group_metrics_json,
        "shap_summary_json": shap_summary_json,
        "lime_summary_json": lime_summary_json,
        "mitigation_json": mitigation_json,
        "feature_importance_json": feature_importance_json,
        "status": status,
        "created_at": datetime.now(timezone.utc),
        "completed_at": None,
    }
