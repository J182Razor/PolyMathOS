from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
from typing import Optional
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import uuid
import json

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "polymath_secret_key_change_me_in_prod")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 1 week

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Database connection
def get_db_connection():
    conn_str = os.getenv("DATABASE_URL")
    if not conn_str:
        raise HTTPException(status_code=500, detail="Database configuration error")
    try:
        conn = psycopg2.connect(conn_str)
        return conn
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")

# Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    metadata: Optional[dict] = None

# ... (Token model)

# ... (endpoints)

@router.put("/update-profile")
def update_profile(update: UserUpdate, token: str):
    # Verify token (simplified for brevity, ideally use dependency)
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
        
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        updates = []
        values = []
        if update.first_name:
            updates.append("first_name = %s")
            values.append(update.first_name)
        if update.last_name:
            updates.append("last_name = %s")
            values.append(update.last_name)
        if update.metadata:
            updates.append("metadata = %s")
            values.append(json.dumps(update.metadata))
            
        if not updates:
            return {"message": "No changes"}
            
        values.append(user_id)
        query = f"UPDATE users SET {', '.join(updates)} WHERE user_id = %s RETURNING user_id, email, first_name, last_name, metadata"
        
        cur.execute(query, tuple(values))
        updated_user = cur.fetchone()
        conn.commit()
        
        if not updated_user:
            raise HTTPException(status_code=404, detail="User not found")
            
        return updated_user
        
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()
