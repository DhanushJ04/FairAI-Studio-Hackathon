from typing import List, Dict, Any

def generate_mitigation_strategies(metrics: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Analyzes calculated metrics and suggests mitigations."""
    strategies = []
    
    # Check if we have high bias in Disparate Impact
    di_metrics = [m for m in metrics if "Disparate Impact" in m["name"]]
    has_di_bias = any(m["status"] == "biased" for m in di_metrics)
    
    # Check Statistical Parity Difference
    spd_metrics = [m for m in metrics if "Statistical Parity Difference" in m["name"]]
    has_spd_bias = any(m["status"] == "biased" for m in spd_metrics)
    
    # Check Equal Opportunity
    eod_metrics = [m for m in metrics if "Equal Opportunity Difference" in m["name"]]
    has_eod_bias = any(m["status"] == "biased" for m in eod_metrics)

    if has_di_bias or has_spd_bias:
        strategies.append({
            "name": "Reweighing (AIF360)",
            "category": "pre-processing",
            "description": "Applies weights to the training dataset to ensure fair representation before training the model.",
            "severity": "high",
            "recommended": True
        })
        strategies.append({
            "name": "Disparate Impact Remover",
            "category": "pre-processing",
            "description": "Edits feature values to increase group fairness while preserving rank-ordering.",
            "severity": "medium",
            "recommended": False
        })
        
    if has_eod_bias:
        strategies.append({
            "name": "Equalized Odds Post-processing (Fairlearn)",
            "category": "post-processing",
            "description": "Adjusts the model's predictions to satisfy equalized odds constraints.",
            "severity": "high",
            "recommended": True
        })
        
    if not strategies:
        strategies.append({
            "name": "Monitor Configuration",
            "category": "ongoing",
            "description": "No significant bias detected. Continue monitoring model behavior over time.",
            "severity": "low",
            "recommended": True
        })

    return strategies
