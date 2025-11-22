from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.core.enhanced_system import genius_system

app = FastAPI(title="PolyMathOS Genius Engine")

class UserEnrollment(BaseModel):
    user_id: str
    interests: List[str]

class GeniusModeRequest(BaseModel):
    user_id: str

class SessionRequest(BaseModel):
    user_id: str
    session_type: str

@app.get("/")
def read_root():
    return {"status": "active", "system": "PolyMathOS Genius Engine"}

@app.post("/enroll")
def enroll_user(enrollment: UserEnrollment):
    try:
        path = genius_system.enroll_user(enrollment.user_id, enrollment.interests)
        return path
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/activity/{user_id}")
def get_activity(user_id: str):
    try:
        return genius_system.get_next_activity(user_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.post("/genius/activate")
def activate_genius(request: GeniusModeRequest):
    return genius_system.activate_genius_mode(request.user_id)

@app.post("/genius/session")
def start_session(request: SessionRequest):
    return genius_system.cognitive_amplification_session(request.user_id, request.session_type)

@app.get("/progress/{user_id}")
def get_progress(user_id: str):
    return genius_system.get_progress_report(user_id)

