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

class QuantumOptimizationRequest(BaseModel):
    user_id: str
    domains: List[str]
    constraints: dict

class CollaborationRequest(BaseModel):
    problem_statement: dict
    user_id: Optional[str] = None

class PatternRecognitionRequest(BaseModel):
    user_id: str
    pattern_type: str = "abstract_reasoning"

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

@app.post("/quantum/optimize-path")
def quantum_optimize_path(request: QuantumOptimizationRequest):
    """Optimize learning paths using quantum algorithms"""
    try:
        return genius_system.quantum_learning_path_optimization(
            request.user_id, request.domains, request.constraints
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/collaboration/solve")
def collaborative_solve(request: CollaborationRequest):
    """Solve complex problems using multi-agent collaboration"""
    try:
        return genius_system.collaborative_problem_solving(
            request.problem_statement, request.user_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/quantum/pattern-recognition")
def quantum_pattern_recognition(request: PatternRecognitionRequest):
    """Quantum-enhanced pattern recognition training"""
    try:
        return genius_system.quantum_pattern_recognition_session(
            request.user_id, request.pattern_type
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/system/status")
def system_status():
    """Get system status and capabilities"""
    return {
        "status": "active",
        "quantum_available": genius_system.quantum_optimizer is not None,
        "multi_agent_available": genius_system.collaboration_swarm is not None,
        "modules": {
            "quantum_optimization": True,
            "quantum_pattern_recognition": True,
            "multi_agent_collaboration": genius_system.collaboration_swarm is not None,
            "neuroplasticity": True,
            "metacognitive_training": True
        }
    }

