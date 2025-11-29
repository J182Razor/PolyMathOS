from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import json
from app.core.enhanced_system import genius_system
from app.core.config_manager import config_manager

# Import integration manager
try:
    from app.core.integration_manager import get_integration_manager
    INTEGRATION_MANAGER_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Integration manager not available: {e}")
    INTEGRATION_MANAGER_AVAILABLE = False

# Import Learning AI router for the Genius Professor system
try:
    from app.api import learning_ai, auth
    LEARNING_AI_AVAILABLE = True
    AUTH_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Learning AI or Auth router not available: {e}")
    LEARNING_AI_AVAILABLE = False
    AUTH_AVAILABLE = False
    learning_ai = None
    auth = None

# Import new Swarm Corporation routers
try:
    from app.api import hdam, swarms, documents, research, rag, security, workflows, database
    HDAM_AVAILABLE = True
    SWARMS_AVAILABLE = True
    DOCUMENTS_AVAILABLE = True
    RESEARCH_AVAILABLE = True
    RAG_AVAILABLE = True
    SECURITY_AVAILABLE = True
    WORKFLOWS_AVAILABLE = True
    DATABASE_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Some Swarm Corporation routers not available: {e}")
    HDAM_AVAILABLE = False
    SWARMS_AVAILABLE = False
    DOCUMENTS_AVAILABLE = False
    RESEARCH_AVAILABLE = False
    RAG_AVAILABLE = False
    SECURITY_AVAILABLE = False
    WORKFLOWS_AVAILABLE = False
    DATABASE_AVAILABLE = False
    hdam = None
    swarms = None
    documents = None
    research = None
    rag = None
    security = None
    workflows = None
    database = None

app = FastAPI(
    title="PolyMathOS Genius Engine",
    description="A comprehensive cognitive enhancement and learning system implementing the Polymath Stack",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Learning AI routes (Genius Professor system)
if LEARNING_AI_AVAILABLE and learning_ai:
    app.include_router(learning_ai.router)
    print("[OK] Learning AI (Genius Professor) routes registered")

# Include Auth routes
if AUTH_AVAILABLE and auth:
    app.include_router(auth.router)
    print("[OK] Auth routes registered")

# Include HDAM routes
if HDAM_AVAILABLE and hdam:
    app.include_router(hdam.router)
    print("[OK] HDAM routes registered")

# Include Swarms routes
if SWARMS_AVAILABLE and swarms:
    app.include_router(swarms.router)
    print("[OK] Swarms routes registered")

# Include Documents routes
if DOCUMENTS_AVAILABLE and documents:
    app.include_router(documents.router)
    print("[OK] Documents routes registered")

# Include Research routes
if RESEARCH_AVAILABLE and research:
    app.include_router(research.router)
    print("[OK] Research routes registered")

# Include RAG routes
if RAG_AVAILABLE and rag:
    app.include_router(rag.router)
    print("[OK] RAG routes registered")

# Include Security routes
if SECURITY_AVAILABLE and security:
    app.include_router(security.router)
    print("[OK] Security routes registered")

# Include Workflows routes
if WORKFLOWS_AVAILABLE and workflows:
    app.include_router(workflows.router)
    print("[OK] Workflows routes registered")

# Include Database routes
if DATABASE_AVAILABLE and database:
    app.include_router(database.router)
    print("[OK] Database routes registered")

# Include Health check routes
try:
    from app.api import health
    app.include_router(health.router)
    print("[OK] Health check routes registered")
except ImportError as e:
    print(f"Warning: Health check router not available: {e}")

class UserEnrollment(BaseModel):
    user_id: str
    interests: List[str]

class SetupRequest(BaseModel):
    config: Dict[str, str]

@app.post("/setup/config")
async def update_config(request: SetupRequest):
    """Update system configuration and save to .env"""
    try:
        results = config_manager.update_bulk(request.config)
        # Reload system components if necessary
        # genius_system.reload_config() # Future implementation
        return {"status": "success", "updated": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/setup/config")
async def get_public_config():
    """Get non-sensitive configuration"""
    # Only return safe keys to frontend
    safe_keys = ["NEXT_PUBLIC_API_URL", "VITE_API_URL", "N8N_WEBHOOK_URL"]
    return {k: config_manager.get(k, "") for k in safe_keys}

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

class LLMSelectionRequest(BaseModel):
    task_type: str
    priority: str = "quality"
    required_context: int = 0
    requires_reasoning: bool = False
    requires_creativity: bool = False
    requires_code: bool = False

class AgentEvolutionRequest(BaseModel):
    agent_id: str
    task_results: dict
    performance_feedback: dict

class ArtifactStoreRequest(BaseModel):
    artifact_id: str
    content: dict
    task_id: str
    artifact_type: str = "output"
    metadata: Optional[dict] = None

class LearningPathRequest(BaseModel):
    user_query: str
    preferred_domains: Optional[List[str]] = None

@app.get("/")
def read_root():
    return {"status": "active", "system": "PolyMathOS Genius Engine"}

@app.post("/learning/onboard")
async def onboard_learning(
    interests: str = Form(...),
    files: List[UploadFile] = File(None)
):
    """Onboard user with interests and optional files"""
    try:
        user_interests = json.loads(interests)
        uploaded_files_data = []
        
        if files:
            for file in files:
                content = await file.read()
                uploaded_files_data.append({
                    "filename": file.filename,
                    "content": content,
                    "metadata": {"content_type": file.content_type}
                })
        
        result = await genius_system.learning_system.onboard_user_with_files(
            user_interests, uploaded_files_data
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/learning/path")
async def recommend_learning_path(request: LearningPathRequest):
    """Generate a personalized learning path based on query and memory"""
    try:
        return await genius_system.learning_system.recommend_learning_path(
            request.user_query, request.preferred_domains
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/learning/upload")
async def upload_resource(
    domains: str = Form(...),
    file: UploadFile = File(...)
):
    """Upload a single learning resource"""
    try:
        domain_list = json.loads(domains)
        content = await file.read()
        
        # Use the file processor directly through the system
        result = await genius_system.learning_system.file_processor.process_file(
            file_content=content,
            filename=file.filename,
            domains=domain_list,
            metadata={"content_type": file.content_type}
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
    status = {
        "status": "active",
        "version": "2.0.0",
        "quantum_available": genius_system.quantum_optimizer is not None,
        "multi_agent_available": genius_system.collaboration_swarm is not None,
        "llm_router_available": genius_system.llm_router is not None,
        "lemon_ai_available": genius_system.lemon_ai is not None,
        "learning_ai_available": LEARNING_AI_AVAILABLE,
        "storage_available": {
            "artifacts": genius_system.artifact_manager is not None,
            "supabase": genius_system.supabase_storage.available if genius_system.supabase_storage else False,
            "database": genius_system.database.available if genius_system.database else False
        },
        "modules": {
            "quantum_optimization": True,
            "quantum_pattern_recognition": True,
            "multi_agent_collaboration": genius_system.collaboration_swarm is not None,
            "neuroplasticity": True,
            "metacognitive_training": True,
            "intelligent_llm_routing": True,
            "self_evolving_agents": True,
            # Genius Professor Learning System (Polymath Stack)
            "genius_professor": LEARNING_AI_AVAILABLE,
            "fsrs_spaced_repetition": LEARNING_AI_AVAILABLE,
            "dynamic_quiz_generation": LEARNING_AI_AVAILABLE,
            "feynman_technique_engine": LEARNING_AI_AVAILABLE,
            "memory_palace_ai": LEARNING_AI_AVAILABLE,
            "zettelkasten_knowledge_graph": LEARNING_AI_AVAILABLE,
            "comprehension_tracking": LEARNING_AI_AVAILABLE
        },
        "polymath_stack": {
            "structure": "Zettelkasten (Luhmann Method)",
            "process": "Feynman Technique",
            "visualization": "Memory Palace (Method of Loci)"
        }
    }
    
    # Add integration status if available
    if INTEGRATION_MANAGER_AVAILABLE:
        try:
            manager = get_integration_manager()
            health = manager.health_check()
            status["integrations"] = health
        except Exception as e:
            status["integrations"] = {"status": "error", "message": str(e)}
    
    return status

@app.get("/integrations/status")
def integrations_status():
    """Get detailed integration status"""
    if not INTEGRATION_MANAGER_AVAILABLE:
        return {"status": "unavailable", "message": "Integration manager not available"}
    
    try:
        manager = get_integration_manager()
        health = manager.health_check()
        return health
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/integrations/initialize")
def initialize_integrations():
    """Initialize all integrations"""
    if not INTEGRATION_MANAGER_AVAILABLE:
        return {"status": "error", "message": "Integration manager not available"}
    
    try:
        manager = get_integration_manager()
        results = manager.initialize_all()
        return {"status": "success", "results": results}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/llm/select")
def select_optimal_llm(request: LLMSelectionRequest):
    """Intelligently select optimal LLM for a task"""
    try:
        from app.modules.llm_router import TaskRequirements
        
        requirements = TaskRequirements(
            task_type=request.task_type,
            priority=request.priority,
            required_context=request.required_context,
            requires_reasoning=request.requires_reasoning,
            requires_creativity=request.requires_creativity,
            requires_code=request.requires_code
        )
        
        llm_key, config = genius_system.llm_router.select_optimal_llm(requirements)
        
        return {
            "llm_key": llm_key,
            "model_name": config.model_name,
            "provider": config.provider.value,
            "reasoning": {
                "quality_score": config.quality_score,
                "speed_score": config.speed_score,
                "cost_per_1k": config.cost_per_1k_tokens,
                "context_window": config.context_window
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/llm/performance")
def get_llm_performance():
    """Get LLM performance metrics"""
    try:
        return genius_system.llm_router.get_performance_report()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/agents/evolve")
def evolve_agent(request: AgentEvolutionRequest):
    """Evolve an agent based on performance feedback"""
    try:
        result = genius_system.lemon_ai.evolve_agent(
            request.agent_id,
            request.task_results,
            request.performance_feedback
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/agents/{agent_id}/evolution")
def get_agent_evolution(agent_id: str):
    """Get evolution history for an agent"""
    try:
        return genius_system.lemon_ai.get_agent_evolution_history(agent_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/storage/artifact")
def store_artifact(request: ArtifactStoreRequest):
    """Store an artifact with versioning"""
    try:
        artifact = genius_system.artifact_manager.store_artifact(
            request.artifact_id,
            request.content,
            request.task_id,
            request.artifact_type,
            request.metadata
        )
        
        # Optionally upload to Supabase
        if genius_system.supabase_storage.available:
            public_url = genius_system.supabase_storage.upload_artifact(
                request.artifact_id,
                request.content,
                request.task_id
            )
            artifact["public_url"] = public_url
        
        return artifact
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/storage/artifact/{artifact_id}")
def get_artifact(artifact_id: str, version: Optional[int] = None):
    """Retrieve an artifact"""
    try:
        artifact = genius_system.artifact_manager.get_artifact(artifact_id, version)
        if artifact:
            return artifact
        raise HTTPException(status_code=404, detail="Artifact not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/storage/task/{task_id}/artifacts")
def list_task_artifacts(task_id: str):
    """List all artifacts for a task"""
    try:
        return genius_system.artifact_manager.list_artifacts_by_task(task_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

