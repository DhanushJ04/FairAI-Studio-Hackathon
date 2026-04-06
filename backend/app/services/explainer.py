import pandas as pd
import numpy as np
from typing import Dict, Any, List

def calculate_shap(model, X: pd.DataFrame, is_tree=False) -> List[Dict[str, Any]]:
    """Calculates SHAP global feature importances."""
    try:
        import shap
    except ImportError:
        print("SHAP is not installed, returning empty list.")
        return []
    # Subsample background data for speed
    # A smaller background sample is usually sufficient for global importance
    bg_sample_size = 50 if len(X) > 500 else 100
    X_sample = shap.sample(X, bg_sample_size) if len(X) > bg_sample_size else X
    
    try:
        if is_tree:
            # TreeExplainer is much faster for Random Forest
            explainer = shap.TreeExplainer(model)
            # Use smaller subset for SHAP values to avoid OOM or timeout
            val_sample = shap.sample(X, 100) if len(X) > 100 else X
            shap_values = explainer.shap_values(val_sample)
        else:
            explainer = shap.Explainer(model, X_sample)
            shap_values = explainer(X_sample).values
            
        # For classification, shap_values might be a list of arrays (one per class). We take class 1.
        if isinstance(shap_values, list):
            # If multiple classes (usually 2 for classification), take the positive class (1)
            shap_values = shap_values[1] if len(shap_values) > 1 else shap_values[0]
            
        # If 3D array (e.g. from multiclass), take mean over classes or just 1st class
        if len(shap_values.shape) == 3:
           shap_values = shap_values[:, :, 1]
           
        mean_abs_shap = np.abs(shap_values).mean(axis=0)
        
        features = X.columns
        result = []
        # Ensure we have data for correlation
        current_X = val_sample if is_tree else X_sample
        
        for i, f in enumerate(features):
            # approximate direction by looking at correlation of feature value and shap value
            if len(current_X) > 1:
                corr = np.corrcoef(current_X.iloc[:, i], shap_values[:, i])[0, 1]
            else:
                corr = 1.0
                
            direction = "positive" if corr > 0 else "negative"
            # Handle NaN correlation
            if np.isnan(corr): direction = "positive"
            
            result.append({
                "feature": f,
                "importance": float(mean_abs_shap[i]),
                "direction": direction
            })
            
        # Sort by importance descending
        result = sorted(result, key=lambda x: x["importance"], reverse=True)
        return result
        
    except Exception as e:
        print(f"SHAP explanation failed: {e}")
        return []

def calculate_lime(model, X: pd.DataFrame, num_samples=3) -> List[Dict[str, Any]]:
    """Calculates LIME local explanations for a few samples."""
    categorical_features = []
    for i, col in enumerate(X.columns):
        if X[col].dtype == 'object' or str(X[col].dtype) == 'category':
            categorical_features.append(i)
            
    # Need numpy array for LIME
    X_np = X.values
    
    try:
        import lime.lime_tabular
        explainer = lime.lime_tabular.LimeTabularExplainer(
            X_np,
            feature_names=X.columns.tolist(),
            class_names=['Class 0', 'Class 1'],
            categorical_features=categorical_features,
            mode='classification'
        )
        
        # Predict fn required by lime must return probabilities
        def predict_fn(x):
            return model.predict_proba(x)
            
        results = []
        # Take up to num_samples rows from the dataset to explain
        samples_to_explain = min(num_samples, len(X))
        for i in range(samples_to_explain):
            exp = explainer.explain_instance(X_np[i], predict_fn, num_features=5)
            # exp.as_list() returns [('feature_name <= x', weight), ...]
            
            features_list = [{"feature": item[0], "weight": float(item[1])} for item in exp.as_list()]
            
            # get the actual prediction for this instance
            pred_class = int(model.predict(X_np[i].reshape(1, -1))[0])
            
            results.append({
                "instance_index": i,
                "prediction": float(pred_class),
                "features": features_list
            })
            
        return results
        
    except Exception as e:
        print(f"LIME explanation failed: {e}")
        return []
