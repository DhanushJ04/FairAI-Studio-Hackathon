from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests
from datetime import datetime, timedelta
from jose import jwt
import os

from app.database import get_db
from app.models import create_user_doc
from app.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

class GoogleTokenRequest(BaseModel):
    id_token: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/google", response_model=TokenResponse)
async def authenticate_google(token_request: GoogleTokenRequest, db=Depends(get_db)):
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google Authentication is not configured on the server")

    try:
        # Validate the token using Google's libraries
        idinfo = id_token.verify_oauth2_token(token_request.id_token, requests.Request(), GOOGLE_CLIENT_ID)

        # Extracted info
        google_user_id = idinfo.get("sub")
        email = idinfo.get("email")
        name = idinfo.get("name")
        
        # Check if user exists
        user = await db.users.find_one({"email": email})

        if not user:
            # Create new user assigned as analyst
            user = create_user_doc(
                username=email.split("@")[0] + "_" + google_user_id[:5],
                email=email,
                full_name=name,
                auth_provider="google",
                provider_id=google_user_id,
                role="analyst",
            )
            await db.users.insert_one(user)
        else:
            # Update provider id if it was missing 
            if not user.get("provider_id"):
                await db.users.update_one(
                    {"_id": user["_id"]},
                    {"$set": {"provider_id": google_user_id, "auth_provider": "google"}}
                )
                user["provider_id"] = google_user_id
                user["auth_provider"] = "google"

        # Generate internal JWT 
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["_id"], "role": user.get("role")}, expires_delta=access_token_expires
        )

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user={
                "id": user["_id"],
                "email": user["email"],
                "name": user.get("full_name"),
                "role": user.get("role")
            }
        )

    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")
