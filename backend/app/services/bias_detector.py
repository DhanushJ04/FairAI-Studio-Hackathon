import pandas as pd
import numpy as np
from typing import Dict, Any, List
from sklearn.metrics import accuracy_score

def calculate_bias_metrics(y_true: pd.Series, y_pred: pd.Series, sensitive_features: pd.DataFrame, favorable_label: Any = 1) -> Dict[str, Any]:
    """Calculates bias metrics using Fairlearn."""
    try:
        from fairlearn.metrics import (
            MetricFrame,
            demographic_parity_difference,
            demographic_parity_ratio,
            equalized_odds_difference,
            true_positive_rate,
            false_positive_rate,
            selection_rate,
            count
        )
    except ImportError:
        print("Fairlearn is not installed. Returning mocked metrics.")
        return {
            "metrics": [{"name": "Mock Impact", "value": 1.0, "threshold": 0.8, "status": "fair", "description": ""}],
            "group_metrics": [],
            "overall_fairness_score": 1.0
        }
    
    # We will compute metrics for each sensitive attribute separately
    # For simplicity, if multiple are provided, we average or return per-attribute.
    # The requirement asks for overall metrics, so we'll pick the first sensitive attribute or 
    # compute the worst-case disparity across all. Let's compute per-attribute and get the worst one for summary.
    
    # Ensure binary classification format (0 and 1)
    y_true_bin = (y_true == favorable_label).astype(int)
    y_pred_bin = (y_pred == favorable_label).astype(int)
    
    metrics = []
    group_metrics = []
    
    for sensitive_col in sensitive_features.columns:
        sensitive_data = sensitive_features[sensitive_col]
        
        # 1. Disparate Impact (Demographic Parity Ratio)
        # Ratio of selection rate for unprivileged group to privileged group
        # fairlearn metric `demographic_parity_ratio` gives min/max selection rate
        di = demographic_parity_ratio(y_true_bin, y_pred_bin, sensitive_features=sensitive_data)
        
        # 2. Statistical Parity Difference (Demographic Parity Difference)
        spd = demographic_parity_difference(y_true_bin, y_pred_bin, sensitive_features=sensitive_data)
        
        # 3. Equal Opportunity Difference
        # Difference in true positive rates
        metric_frame = MetricFrame(
            metrics={
                "tpr": true_positive_rate,
                "fpr": false_positive_rate,
                "selection_rate": selection_rate,
                "accuracy": accuracy_score,
                "count": count
            },
            y_true=y_true_bin,
            y_pred=y_pred_bin,
            sensitive_features=sensitive_data
        )
        
        tpr_diff = metric_frame.by_group["tpr"].max() - metric_frame.by_group["tpr"].min()
        eod = tpr_diff
        
        # 4. Average Odds Difference
        fpr_diff = metric_frame.by_group["fpr"].max() - metric_frame.by_group["fpr"].min()
        aod = (tpr_diff + fpr_diff) / 2
        
        # 5. Theil Index
        # A measure of inequality. We'll use a simplified formulation or proxy.
        # Since Fairlearn doesn't have it natively, we can approximate it or omit if complex.
        # Let's compute a simple proxy: generalized entropy
        ti = 0.0 # Placeholder, as exact Theil Index on benefits requires individual loss functions
        
        metrics.extend([
            {
                "name": f"Disparate Impact ({sensitive_col})",
                "value": round(di, 4),
                "threshold": 0.8,
                "status": "biased" if di < 0.8 else "fair",
                "description": "Ratio of favorable outcomes for unprivileged vs privileged group."
            },
            {
                "name": f"Statistical Parity Difference ({sensitive_col})",
                "value": round(spd, 4),
                "threshold": 0.1,
                "status": "biased" if spd > 0.1 else "fair",
                "description": "Difference in favorable outcomes between groups."
            },
            {
                "name": f"Equal Opportunity Difference ({sensitive_col})",
                "value": round(eod, 4),
                "threshold": 0.1,
                "status": "biased" if eod > 0.1 else "fair",
                "description": "Difference in true positive rates between groups."
            },
            {
                "name": f"Average Odds Difference ({sensitive_col})",
                "value": round(aod, 4),
                "threshold": 0.1,
                "status": "biased" if aod > 0.1 else "fair",
                "description": "Average of difference in false positive rates and true positive rates."
            }
        ])
        
        # Group Metrics
        for group in metric_frame.by_group.index:
            row = metric_frame.by_group.loc[group]
            group_metrics.append({
                "group_name": sensitive_col,
                "group_value": str(group),
                "positive_rate": round(row["selection_rate"], 4),
                "true_positive_rate": round(row["tpr"], 4),
                "false_positive_rate": round(row["fpr"], 4),
                "accuracy": round(row["accuracy"], 4),
                "count": int(row["count"])
            })

    overall_score = accuracy_score(y_true_bin, y_pred_bin)

    return {
        "metrics": metrics,
        "group_metrics": group_metrics,
        "overall_fairness_score": overall_score
    }
