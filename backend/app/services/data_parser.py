import pandas as pd
import numpy as np
from typing import Dict, Any, List

def process_data_file(filepath: str) -> Dict[str, Any]:
    """Reads a CSV or Excel file, parses columns and provides summary info."""
    if filepath.endswith(".xlsx"):
        df = pd.read_excel(filepath)
    else:
        df = pd.read_csv(filepath)
    
    columns_info = []
    for col in df.columns:
        dtype = str(df[col].dtype)
        unique_count = int(df[col].nunique())
        null_count = int(df[col].isnull().sum())
        
        # Get up to 5 non-null sample values
        samples = df[col].dropna().head(5).tolist()
        
        columns_info.append({
            "name": col,
            "dtype": dtype,
            "unique_count": unique_count,
            "null_count": null_count,
            "sample_values": samples
        })
        
    return {
        "columns": columns_info,
        "row_count": len(df),
        "preview": df.head(5).replace({np.nan: None}).to_dict(orient="records")
    }

def load_data(filepath: str, target: str) -> pd.DataFrame:
    """Load data and drop fully null rows etc."""
    if filepath.endswith(".xlsx"):
        df = pd.read_excel(filepath)
    else:
        df = pd.read_csv(filepath)
    
    # Basic cleaning
    # For categorical targets, just fill na with mode or drop
    if df[target].isnull().any():
        df.dropna(subset=[target], inplace=True)
        
    # Handle other missing values
    for col in df.columns:
        if df[col].isnull().sum() > 0:
            if df[col].dtype == 'object':
                df[col] = df[col].fillna(df[col].mode()[0])
            else:
                df[col] = df[col].fillna(df[col].median())
                
    return df
