import os
import shutil
import uuid
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.config import UPLOAD_DIR
from app.models import UploadedFile
from app.schemas import UploadResponse
from app.services.data_parser import process_data_file

router = APIRouter()

@router.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    if not file.filename.endswith(".csv") and not file.filename.endswith(".xlsx") and not file.filename.endswith((".pkl", ".joblib")):
        raise HTTPException(status_code=400, detail="Only CSV, Excel (.xlsx), or model files are supported.")
        
    file_id = str(uuid.uuid4())
    ext = file.filename.split(".")[-1]
    safe_filename = f"{file_id}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, safe_filename)
    
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    file_type = "csv" if ext in ["csv", "xlsx"] else "model"
    
    # If CSV, process to get columns
    columns_data = []
    row_count = 0
    preview = []
    
    if file_type == "csv":
        try:
            info = process_data_file(filepath)
            columns_data = info["columns"]
            row_count = info["row_count"]
            preview = info["preview"]
        except Exception as e:
            os.remove(filepath)
            raise HTTPException(status_code=400, detail=f"Failed to process dataset: {str(e)}")
            
    # Save to db
    db_file = UploadedFile(
        id=file_id,
        user_id="dummy-user-id", # Bypassing auth
        filename=file.filename,
        filepath=filepath,
        file_type=file_type,
        columns=columns_data,
        row_count=row_count,
        file_size=os.path.getsize(filepath)
    )
    
    db.add(db_file)
    await db.commit()
    
    return {
        "file_id": file_id,
        "filename": file.filename,
        "file_type": file_type,
        "columns": columns_data,
        "row_count": row_count,
        "preview": preview
    }
