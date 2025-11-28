"""
Storage and Persistence Layer for PolyMathOS
Handles local filesystem, TimescaleDB cloud storage, and artifact management
"""

import os
import json
import shutil
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime
import logging
import hashlib
import uuid

logger = logging.getLogger(__name__)

class ArtifactManager:
    """Manages artifacts with versioning and organization"""
    
    def __init__(self, base_path: str = "./artifacts"):
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)
        self.artifact_index: Dict[str, Dict] = {}
        self._load_index()
    
    def _load_index(self):
        """Load artifact index"""
        index_file = self.base_path / ".index.json"
        if index_file.exists():
            with open(index_file, 'r') as f:
                self.artifact_index = json.load(f)
    
    def _save_index(self):
        """Save artifact index"""
        index_file = self.base_path / ".index.json"
        with open(index_file, 'w') as f:
            json.dump(self.artifact_index, f, indent=2)
    
    def store_artifact(
        self,
        artifact_id: str,
        content: Any,
        task_id: str,
        artifact_type: str = "output",
        metadata: Optional[Dict] = None
    ) -> Dict:
        """Store an artifact with versioning"""
        artifact_dir = self.base_path / task_id / artifact_type
        artifact_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate version
        version = self._get_next_version(artifact_id)
        
        # Create artifact file
        artifact_file = artifact_dir / f"{artifact_id}_v{version}.json"
        
        artifact_data = {
            "artifact_id": artifact_id,
            "version": version,
            "task_id": task_id,
            "artifact_type": artifact_type,
            "content": content,
            "metadata": metadata or {},
            "created_at": datetime.now().isoformat(),
            "file_path": str(artifact_file)
        }
        
        with open(artifact_file, 'w') as f:
            json.dump(artifact_data, f, indent=2)
        
        # Update index
        if artifact_id not in self.artifact_index:
            self.artifact_index[artifact_id] = {
                "versions": [],
                "latest_version": version,
                "task_id": task_id
            }
        
        self.artifact_index[artifact_id]["versions"].append(version)
        self.artifact_index[artifact_id]["latest_version"] = version
        self._save_index()
        
        logger.info(f"Stored artifact {artifact_id} v{version}")
        
        return artifact_data
    
    def _get_next_version(self, artifact_id: str) -> int:
        """Get next version number for artifact"""
        if artifact_id in self.artifact_index:
            versions = self.artifact_index[artifact_id]["versions"]
            return max(versions) + 1 if versions else 1
        return 1
    
    def get_artifact(self, artifact_id: str, version: Optional[int] = None) -> Optional[Dict]:
        """Retrieve an artifact"""
        if artifact_id not in self.artifact_index:
            return None
        
        if version is None:
            version = self.artifact_index[artifact_id]["latest_version"]
        
        task_id = self.artifact_index[artifact_id]["task_id"]
        artifact_file = self.base_path / task_id / f"{artifact_id}_v{version}.json"
        
        if artifact_file.exists():
            with open(artifact_file, 'r') as f:
                return json.load(f)
        
        return None
    
    def list_artifacts_by_task(self, task_id: str) -> List[Dict]:
        """List all artifacts for a task"""
        task_dir = self.base_path / task_id
        if not task_dir.exists():
            return []
        
        artifacts = []
        for artifact_type_dir in task_dir.iterdir():
            if artifact_type_dir.is_dir():
                for artifact_file in artifact_type_dir.glob("*.json"):
                    with open(artifact_file, 'r') as f:
                        artifacts.append(json.load(f))
        
        return artifacts


class TimescaleDBStorage:
    """TimescaleDB cloud storage integration for vectors and time-series data"""
    
    def __init__(self, connection_string: Optional[str] = None):
        self.connection_string = connection_string or os.getenv("DATABASE_URL")
        self.available = False
        self.conn = None
        
        if self.connection_string:
            try:
                import psycopg2
                self.conn = psycopg2.connect(self.connection_string)
                self.available = True
                self._initialize_storage_tables()
                logger.info("TimescaleDB storage initialized")
            except ImportError:
                logger.warning("psycopg2 not available. Install with: pip install psycopg2-binary")
            except Exception as e:
                logger.warning(f"TimescaleDB storage not available: {e}")
    
    def _initialize_storage_tables(self):
        """Initialize storage tables in TimescaleDB"""
        if not self.available or not self.conn:
            return
        
        try:
            with self.conn.cursor() as cur:
                # Artifacts storage table
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS artifacts (
                        artifact_id VARCHAR(255) PRIMARY KEY,
                        task_id VARCHAR(255),
                        artifact_type VARCHAR(100),
                        content JSONB,
                        metadata JSONB,
                        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                # Vector embeddings table (for pgvector if available)
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS embeddings (
                        id VARCHAR(255) PRIMARY KEY,
                        content_id VARCHAR(255),
                        content_type VARCHAR(100),
                        embedding_text TEXT,
                        metadata JSONB,
                        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                # Try to enable pgvector extension
                try:
                    cur.execute("CREATE EXTENSION IF NOT EXISTS vector")
                    cur.execute("""
                        ALTER TABLE embeddings 
                        ADD COLUMN IF NOT EXISTS embedding vector(1536)
                    """)
                    logger.info("pgvector extension enabled")
                except Exception as e:
                    logger.info(f"pgvector not available, using text embeddings: {e}")
                
                self.conn.commit()
                logger.info("TimescaleDB storage tables initialized")
        except Exception as e:
            logger.error(f"Failed to initialize TimescaleDB storage tables: {e}")
            self.conn.rollback()
    
    def upload_artifact(
        self,
        artifact_id: str,
        content: Any,
        task_id: str,
        artifact_type: str = "output",
        metadata: Optional[Dict] = None
    ) -> Optional[str]:
        """Upload artifact to TimescaleDB"""
        if not self.available or not self.conn:
            return None
        
        try:
            with self.conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO artifacts (artifact_id, task_id, artifact_type, content, metadata)
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (artifact_id) DO UPDATE SET
                        content = EXCLUDED.content,
                        metadata = EXCLUDED.metadata,
                        updated_at = CURRENT_TIMESTAMP
                    RETURNING artifact_id
                """, (artifact_id, task_id, artifact_type, 
                      json.dumps(content), json.dumps(metadata or {})))
                
                self.conn.commit()
                logger.info(f"Uploaded artifact {artifact_id} to TimescaleDB")
                return artifact_id
                
        except Exception as e:
            logger.error(f"Failed to upload artifact to TimescaleDB: {e}")
            self.conn.rollback()
            return None
    
    def download_artifact(self, artifact_id: str) -> Optional[Dict]:
        """Download artifact from TimescaleDB"""
        if not self.available or not self.conn:
            return None
        
        try:
            with self.conn.cursor() as cur:
                cur.execute("""
                    SELECT content, metadata, created_at 
                    FROM artifacts 
                    WHERE artifact_id = %s
                """, (artifact_id,))
                
                row = cur.fetchone()
                if row:
                    return {
                        "content": row[0],
                        "metadata": row[1],
                        "created_at": row[2].isoformat() if row[2] else None
                    }
                return None
        except Exception as e:
            logger.error(f"Failed to download artifact from TimescaleDB: {e}")
            return None
    
    def store_embedding(
        self,
        content_id: str,
        content_type: str,
        embedding_text: str,
        embedding_vector: Optional[List[float]] = None,
        metadata: Optional[Dict] = None
    ) -> bool:
        """Store embedding in TimescaleDB"""
        if not self.available or not self.conn:
            return False
        
        try:
            with self.conn.cursor() as cur:
                if embedding_vector:
                    cur.execute("""
                        INSERT INTO embeddings (id, content_id, content_type, embedding_text, embedding, metadata)
                        VALUES (%s, %s, %s, %s, %s, %s)
                        ON CONFLICT (id) DO UPDATE SET
                            embedding_text = EXCLUDED.embedding_text,
                            embedding = EXCLUDED.embedding,
                            metadata = EXCLUDED.metadata
                    """, (str(uuid.uuid4()), content_id, content_type, embedding_text,
                          embedding_vector, json.dumps(metadata or {})))
                else:
                    cur.execute("""
                        INSERT INTO embeddings (id, content_id, content_type, embedding_text, metadata)
                        VALUES (%s, %s, %s, %s, %s)
                        ON CONFLICT (id) DO UPDATE SET
                            embedding_text = EXCLUDED.embedding_text,
                            metadata = EXCLUDED.metadata
                    """, (str(uuid.uuid4()), content_id, content_type, embedding_text,
                          json.dumps(metadata or {})))
                
                self.conn.commit()
                return True
        except Exception as e:
            logger.error(f"Failed to store embedding: {e}")
            self.conn.rollback()
            return False


class DatabasePersistence:
    """TimescaleDB database persistence for PolyMathOS"""
    
    def __init__(self, connection_string: Optional[str] = None):
        self.connection_string = connection_string or os.getenv("DATABASE_URL")
        self.available = False
        self.conn = None
        
        if self.connection_string:
            try:
                import psycopg2
                self.conn = psycopg2.connect(self.connection_string)
                self.available = True
                self._initialize_tables()
                logger.info("TimescaleDB persistence initialized")
            except ImportError:
                logger.warning("psycopg2 not available. Install with: pip install psycopg2-binary")
            except Exception as e:
                logger.warning(f"Database not available: {e}")
                self.available = False
    
    def _initialize_tables(self):
        """Initialize database tables with TimescaleDB hypertables for time-series"""
        if not self.available or not self.conn:
            return
        
        try:
            with self.conn.cursor() as cur:
                # Users table
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS users (
                        user_id VARCHAR(255) PRIMARY KEY,
                        email VARCHAR(255) UNIQUE,
                        first_name VARCHAR(100),
                        last_name VARCHAR(100),
                        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                        metadata JSONB
                    )
                """)

                # Learning Plans table
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS learning_plans (
                        plan_id VARCHAR(255) PRIMARY KEY,
                        user_id VARCHAR(255),
                        topic VARCHAR(500),
                        mode VARCHAR(50),
                        modules JSONB,
                        sources JSONB,
                        status VARCHAR(50),
                        progress JSONB,
                        metadata JSONB,
                        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
                    )
                """)

                # Quizzes table
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS quizzes (
                        quiz_id VARCHAR(255) PRIMARY KEY,
                        topic VARCHAR(500),
                        questions JSONB,
                        bloom_distribution JSONB,
                        adaptive_difficulty BOOLEAN,
                        fsrs_integration BOOLEAN,
                        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                        metadata JSONB
                    )
                """)

                # Quiz Attempts table
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS quiz_attempts (
                        attempt_id VARCHAR(255) PRIMARY KEY,
                        quiz_id VARCHAR(255),
                        user_id VARCHAR(255),
                        answers JSONB,
                        score INTEGER,
                        max_score INTEGER,
                        percent_correct FLOAT,
                        timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
                    )
                """)

                # Feynman Sessions table
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS feynman_sessions (
                        session_id VARCHAR(255) PRIMARY KEY,
                        concept VARCHAR(500),
                        topic VARCHAR(500),
                        target_audience VARCHAR(100),
                        iterations JSONB,
                        status VARCHAR(50),
                        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
                    )
                """)

                # Memory Palaces table
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS memory_palaces (
                        palace_id VARCHAR(255) PRIMARY KEY,
                        name VARCHAR(255),
                        template VARCHAR(100),
                        user_id VARCHAR(255),
                        description TEXT,
                        loci JSONB,
                        journey JSONB,
                        review_count INTEGER DEFAULT 0,
                        retention_rate FLOAT DEFAULT 0,
                        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                # Tasks table
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS tasks (
                        task_id VARCHAR(255) PRIMARY KEY,
                        user_id VARCHAR(255),
                        task_type VARCHAR(100),
                        status VARCHAR(50),
                        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                        metadata JSONB
                    )
                """)
                
                # Learning sessions table (time-series)
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS learning_sessions (
                        session_id VARCHAR(255),
                        user_id VARCHAR(255),
                        session_type VARCHAR(100),
                        topic VARCHAR(500),
                        started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                        ended_at TIMESTAMPTZ,
                        duration_minutes INTEGER,
                        score FLOAT,
                        rpe_events INTEGER DEFAULT 0,
                        metadata JSONB,
                        PRIMARY KEY (session_id, started_at)
                    )
                """)
                
                # RPE events table (time-series)
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS rpe_events (
                        event_id VARCHAR(255),
                        user_id VARCHAR(255),
                        session_id VARCHAR(255),
                        item_id VARCHAR(255),
                        confidence FLOAT,
                        was_correct BOOLEAN,
                        rpe_value FLOAT,
                        dopamine_impact FLOAT,
                        learning_value FLOAT,
                        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                        PRIMARY KEY (event_id, created_at)
                    )
                """)
                
                # Spaced repetition items
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS spaced_repetition_items (
                        item_id VARCHAR(255) PRIMARY KEY,
                        user_id VARCHAR(255),
                        content TEXT,
                        question TEXT,
                        answer TEXT,
                        difficulty INTEGER DEFAULT 0,
                        interval_days INTEGER DEFAULT 1,
                        repetitions INTEGER DEFAULT 0,
                        ease_factor FLOAT DEFAULT 2.5,
                        last_review_at TIMESTAMPTZ,
                        next_review_at TIMESTAMPTZ,
                        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                # Executions table
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS executions (
                        execution_id VARCHAR(255),
                        task_id VARCHAR(255),
                        agent_id VARCHAR(255),
                        status VARCHAR(50),
                        result JSONB,
                        error TEXT,
                        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                        execution_time FLOAT,
                        PRIMARY KEY (execution_id, created_at)
                    )
                """)
                
                # Agent evolution table
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS agent_evolution (
                        evolution_id VARCHAR(255) PRIMARY KEY,
                        agent_id VARCHAR(255),
                        version INTEGER,
                        improvements JSONB,
                        performance_before JSONB,
                        performance_after JSONB,
                        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                # User analytics (aggregated time-series)
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS user_analytics (
                        analytics_id VARCHAR(255),
                        user_id VARCHAR(255),
                        period_start TIMESTAMPTZ,
                        period_end TIMESTAMPTZ,
                        total_sessions INTEGER,
                        total_duration_minutes INTEGER,
                        average_score FLOAT,
                        retention_rate FLOAT,
                        rpe_summary JSONB,
                        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                        PRIMARY KEY (analytics_id, period_start)
                    )
                """)
                
                # Try to convert to hypertables for time-series optimization
                try:
                    cur.execute("""
                        SELECT create_hypertable('learning_sessions', 'started_at', if_not_exists => TRUE)
                    """)
                    cur.execute("""
                        SELECT create_hypertable('rpe_events', 'created_at', if_not_exists => TRUE)
                    """)
                    cur.execute("""
                        SELECT create_hypertable('executions', 'created_at', if_not_exists => TRUE)
                    """)
                    cur.execute("""
                        SELECT create_hypertable('user_analytics', 'period_start', if_not_exists => TRUE)
                    """)
                    logger.info("TimescaleDB hypertables created for time-series data")
                except Exception as e:
                    logger.info(f"Hypertables not created (may already exist or TimescaleDB extension not available): {e}")
                
                self.conn.commit()
                logger.info("Database tables initialized")
        except Exception as e:
            logger.error(f"Failed to initialize database tables: {e}")
            if self.conn:
                self.conn.rollback()
    
    def save_task(self, task_id: str, user_id: str, task_type: str, metadata: Dict) -> bool:
        """Save task to database"""
        if not self.available or not self.conn:
            return False
        
        try:
            with self.conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO tasks (task_id, user_id, task_type, status, metadata)
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (task_id) DO UPDATE SET
                        status = EXCLUDED.status,
                        updated_at = CURRENT_TIMESTAMP,
                        metadata = EXCLUDED.metadata
                """, (task_id, user_id, task_type, "pending", json.dumps(metadata)))
                self.conn.commit()
                return True
        except Exception as e:
            logger.error(f"Failed to save task: {e}")
            self.conn.rollback()
            return False
    
    def save_learning_session(self, session_data: Dict) -> bool:
        """Save learning session to TimescaleDB"""
        if not self.available or not self.conn:
            return False
        
        try:
            with self.conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO learning_sessions 
                    (session_id, user_id, session_type, topic, duration_minutes, score, rpe_events, metadata)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    session_data.get('session_id', str(uuid.uuid4())),
                    session_data.get('user_id'),
                    session_data.get('session_type'),
                    session_data.get('topic'),
                    session_data.get('duration_minutes'),
                    session_data.get('score'),
                    session_data.get('rpe_events', 0),
                    json.dumps(session_data.get('metadata', {}))
                ))
                self.conn.commit()
                return True
        except Exception as e:
            logger.error(f"Failed to save learning session: {e}")
            self.conn.rollback()
            return False
    
    def save_rpe_event(self, rpe_data: Dict) -> bool:
        """Save RPE event to TimescaleDB"""
        if not self.available or not self.conn:
            return False
        
        try:
            with self.conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO rpe_events 
                    (event_id, user_id, session_id, item_id, confidence, was_correct, 
                     rpe_value, dopamine_impact, learning_value)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    rpe_data.get('event_id', str(uuid.uuid4())),
                    rpe_data.get('user_id'),
                    rpe_data.get('session_id'),
                    rpe_data.get('item_id'),
                    rpe_data.get('confidence'),
                    rpe_data.get('was_correct'),
                    rpe_data.get('rpe_value'),
                    rpe_data.get('dopamine_impact'),
                    rpe_data.get('learning_value')
                ))
                self.conn.commit()
                return True
        except Exception as e:
            logger.error(f"Failed to save RPE event: {e}")
            self.conn.rollback()
            return False
    
    def save_execution(self, execution_id: str, task_id: str, agent_id: str, 
                      status: str, result: Dict, execution_time: float, error: Optional[str] = None) -> bool:
        """Save execution to database"""
        if not self.available or not self.conn:
            return False
        
        try:
            with self.conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO executions (execution_id, task_id, agent_id, status, result, error, execution_time)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (execution_id, task_id, agent_id, status, json.dumps(result), error, execution_time))
                self.conn.commit()
                return True
        except Exception as e:
            logger.error(f"Failed to save execution: {e}")
            self.conn.rollback()
            return False
    
    def save_agent_evolution(self, evolution_id: str, agent_id: str, version: int,
                            improvements: List[Dict], performance_before: Dict, 
                            performance_after: Dict) -> bool:
        """Save agent evolution record"""
        if not self.available or not self.conn:
            return False
        
        try:
            with self.conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO agent_evolution 
                    (evolution_id, agent_id, version, improvements, performance_before, performance_after)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (evolution_id, agent_id, version, json.dumps(improvements),
                     json.dumps(performance_before), json.dumps(performance_after)))
                self.conn.commit()
                return True
        except Exception as e:
            logger.error(f"Failed to save agent evolution: {e}")
            self.conn.rollback()
            return False
    
    def get_user_analytics(self, user_id: str, days: int = 30) -> Optional[Dict]:
        """Get user analytics from TimescaleDB"""
        if not self.available or not self.conn:
            return None
        
        try:
            with self.conn.cursor() as cur:
                cur.execute("""
                    SELECT 
                        COUNT(*) as total_sessions,
                        COALESCE(SUM(duration_minutes), 0) as total_duration,
                        COALESCE(AVG(score), 0) as average_score,
                        COALESCE(SUM(rpe_events), 0) as total_rpe_events
                    FROM learning_sessions
                    WHERE user_id = %s 
                    AND started_at >= NOW() - INTERVAL '%s days'
                """, (user_id, days))
                
                row = cur.fetchone()
                if row:
                    return {
                        "total_sessions": row[0],
                        "total_duration_minutes": row[1],
                        "average_score": float(row[2]) if row[2] else 0,
                        "total_rpe_events": row[3]
                    }
                return None
        except Exception as e:
            logger.error(f"Failed to get user analytics: {e}")
            return None
    def save_learning_plan(self, plan_data: Dict) -> bool:
        """Save learning plan to database"""
        if not self.available or not self.conn:
            return False
        
        try:
            with self.conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO learning_plans 
                    (plan_id, user_id, topic, mode, modules, sources, status, progress, metadata)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (plan_id) DO UPDATE SET
                        modules = EXCLUDED.modules,
                        sources = EXCLUDED.sources,
                        status = EXCLUDED.status,
                        progress = EXCLUDED.progress,
                        metadata = EXCLUDED.metadata,
                        updated_at = CURRENT_TIMESTAMP
                """, (
                    plan_data.get('id'),
                    plan_data.get('user_id'),
                    plan_data.get('goals', {}).get('topic', 'Unknown'),
                    plan_data.get('mode', 'polymath'),
                    json.dumps(plan_data.get('phases', [])), # Mapping phases to modules
                    json.dumps(plan_data.get('sources', [])),
                    plan_data.get('status', 'active'),
                    json.dumps(plan_data.get('progress', {})),
                    json.dumps(plan_data.get('goals', {})) # Store goals in metadata/goals
                ))
                self.conn.commit()
                return True
        except Exception as e:
            logger.error(f"Failed to save learning plan: {e}")
            self.conn.rollback()
            return False

    def get_learning_plan(self, plan_id: str) -> Optional[Dict]:
        """Get learning plan from database"""
        if not self.available or not self.conn:
            return None
        
        try:
            with self.conn.cursor() as cur:
                cur.execute("""
                    SELECT plan_id, user_id, topic, mode, modules, sources, status, progress, metadata, created_at
                    FROM learning_plans
                    WHERE plan_id = %s
                """, (plan_id,))
                
                row = cur.fetchone()
                if row:
                    # Reconstruct to match LearningPlanResponse structure
                    metadata = row[8] or {}
                    return {
                        "id": row[0],
                        "user_id": row[1],
                        "goals": metadata, # Assuming goals are stored in metadata
                        "phases": row[4], # modules -> phases
                        "current_phase_index": 0, # Default
                        "start_date": row[9].isoformat() if row[9] else None,
                        "estimated_end_date": None, # Calculate or store
                        "progress": row[7],
                        "created_at": row[9].isoformat() if row[9] else None
                    }
                return None
        except Exception as e:
            logger.error(f"Failed to get learning plan: {e}")
            return None

    def get_user_learning_plans(self, user_id: str) -> List[Dict]:
        """Get all learning plans for a user"""
        if not self.available or not self.conn:
            return []
        
        try:
            with self.conn.cursor() as cur:
                cur.execute("""
                    SELECT plan_id, user_id, topic, mode, modules, sources, status, progress, metadata, created_at
                    FROM learning_plans
                    WHERE user_id = %s
                    ORDER BY created_at DESC
                """, (user_id,))
                
                plans = []
                for row in cur.fetchall():
                    metadata = row[8] or {}
                    plans.append({
                        "id": row[0],
                        "user_id": row[1],
                        "goals": metadata,
                        "phases": row[4],
                        "current_phase_index": 0,
                        "start_date": row[9].isoformat() if row[9] else None,
                        "estimated_end_date": None,
                        "progress": row[7],
                        "created_at": row[9].isoformat() if row[9] else None
                    })
                return plans
        except Exception as e:
            logger.error(f"Failed to get user learning plans: {e}")
            return []

    def save_quiz(self, quiz_data: Dict) -> bool:
        """Save quiz to database"""
        if not self.available or not self.conn:
            return False
        
        try:
            with self.conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO quizzes 
                    (quiz_id, topic, questions, bloom_distribution, adaptive_difficulty, fsrs_integration, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (quiz_id) DO NOTHING
                """, (
                    quiz_data.get('id'),
                    quiz_data.get('topic'),
                    json.dumps(quiz_data.get('questions', [])),
                    json.dumps(quiz_data.get('bloom_distribution', {})),
                    quiz_data.get('adaptive_difficulty', True),
                    quiz_data.get('fsrs_integration', True),
                    quiz_data.get('created_at')
                ))
                self.conn.commit()
                return True
        except Exception as e:
            logger.error(f"Failed to save quiz: {e}")
            self.conn.rollback()
            return False

    def get_quiz(self, quiz_id: str) -> Optional[Dict]:
        """Get quiz from database"""
        if not self.available or not self.conn:
            return None
        
        try:
            with self.conn.cursor() as cur:
                cur.execute("""
                    SELECT quiz_id, topic, questions, bloom_distribution, adaptive_difficulty, fsrs_integration, created_at
                    FROM quizzes
                    WHERE quiz_id = %s
                """, (quiz_id,))
                
                row = cur.fetchone()
                if row:
                    return {
                        "id": row[0],
                        "topic": row[1],
                        "questions": row[2],
                        "bloom_distribution": row[3],
                        "adaptive_difficulty": row[4],
                        "fsrs_integration": row[5],
                        "created_at": row[6].isoformat() if row[6] else None
                    }
                return None
        except Exception as e:
            logger.error(f"Failed to get quiz: {e}")
            return None

    def save_quiz_attempt(self, attempt_data: Dict) -> bool:
        """Save quiz attempt to database"""
        if not self.available or not self.conn:
            return False
        
        try:
            with self.conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO quiz_attempts 
                    (attempt_id, quiz_id, user_id, answers, score, max_score, percent_correct, timestamp)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    attempt_data.get('id'),
                    attempt_data.get('quiz_id'),
                    attempt_data.get('user_id'),
                    json.dumps(attempt_data.get('answers', [])),
                    attempt_data.get('score'),
                    attempt_data.get('max_score'),
                    attempt_data.get('percent_correct'),
                    attempt_data.get('timestamp')
                ))
                self.conn.commit()
                return True
        except Exception as e:
            logger.error(f"Failed to save quiz attempt: {e}")
            self.conn.rollback()
            return False

    def get_user_quiz_attempts(self, user_id: str) -> List[Dict]:
        """Get all quiz attempts for a user"""
        if not self.available or not self.conn:
            return []
        
        try:
            with self.conn.cursor() as cur:
                cur.execute("""
                    SELECT attempt_id, quiz_id, user_id, answers, score, max_score, percent_correct, timestamp
                    FROM quiz_attempts
                    WHERE user_id = %s
                    ORDER BY timestamp DESC
                """, (user_id,))
                
                attempts = []
                for row in cur.fetchall():
                    attempts.append({
                        "id": row[0],
                        "quiz_id": row[1],
                        "user_id": row[2],
                        "answers": row[3],
                        "score": row[4],
                        "max_score": row[5],
                        "percent_correct": row[6],
                        "timestamp": row[7].isoformat() if row[7] else None
                    })
                return attempts
        except Exception as e:
            logger.error(f"Failed to get user quiz attempts: {e}")
            return []

    def save_feynman_session(self, session_data: Dict) -> bool:
        """Save Feynman session to database"""
        if not self.available or not self.conn:
            return False
        
        try:
            with self.conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO feynman_sessions 
                    (session_id, concept, topic, target_audience, iterations, status, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (session_id) DO UPDATE SET
                        iterations = EXCLUDED.iterations,
                        status = EXCLUDED.status,
                        updated_at = CURRENT_TIMESTAMP
                """, (
                    session_data.get('id'),
                    session_data.get('concept'),
                    session_data.get('topic'),
                    session_data.get('target_audience'),
                    json.dumps(session_data.get('iterations', [])),
                    session_data.get('status', 'active'),
                    session_data.get('created_at')
                ))
                self.conn.commit()
                return True
        except Exception as e:
            logger.error(f"Failed to save Feynman session: {e}")
            self.conn.rollback()
            return False

    def get_feynman_session(self, session_id: str) -> Optional[Dict]:
        """Get Feynman session from database"""
        if not self.available or not self.conn:
            return None
        
        try:
            with self.conn.cursor() as cur:
                cur.execute("""
                    SELECT session_id, concept, topic, target_audience, iterations, status, created_at
                    FROM feynman_sessions
                    WHERE session_id = %s
                """, (session_id,))
                
                row = cur.fetchone()
                if row:
                    return {
                        "id": row[0],
                        "concept": row[1],
                        "topic": row[2],
                        "target_audience": row[3],
                        "iterations": row[4],
                        "status": row[5],
                        "created_at": row[6].isoformat() if row[6] else None
                    }
                return None
        except Exception as e:
            logger.error(f"Failed to get Feynman session: {e}")
            return None

    def save_memory_palace(self, palace_data: Dict) -> bool:
        """Save Memory Palace to database"""
        if not self.available or not self.conn:
            return False
        
        try:
            with self.conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO memory_palaces 
                    (palace_id, name, template, user_id, description, loci, journey, review_count, retention_rate, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (palace_id) DO UPDATE SET
                        name = EXCLUDED.name,
                        description = EXCLUDED.description,
                        loci = EXCLUDED.loci,
                        journey = EXCLUDED.journey,
                        review_count = EXCLUDED.review_count,
                        retention_rate = EXCLUDED.retention_rate,
                        updated_at = CURRENT_TIMESTAMP
                """, (
                    palace_data.get('id'),
                    palace_data.get('name'),
                    palace_data.get('template'),
                    palace_data.get('user_id'),
                    palace_data.get('description'),
                    json.dumps(palace_data.get('loci', [])),
                    json.dumps(palace_data.get('journey', [])),
                    palace_data.get('review_count', 0),
                    palace_data.get('retention_rate', 0),
                    palace_data.get('created_at')
                ))
                self.conn.commit()
                return True
        except Exception as e:
            logger.error(f"Failed to save Memory Palace: {e}")
            self.conn.rollback()
            return False

    def get_memory_palace(self, palace_id: str) -> Optional[Dict]:
        """Get Memory Palace from database"""
        if not self.available or not self.conn:
            return None
        
        try:
            with self.conn.cursor() as cur:
                cur.execute("""
                    SELECT palace_id, name, template, user_id, description, loci, journey, review_count, retention_rate, created_at
                    FROM memory_palaces
                    WHERE palace_id = %s
                """, (palace_id,))
                
                row = cur.fetchone()
                if row:
                    return {
                        "id": row[0],
                        "name": row[1],
                        "template": row[2],
                        "user_id": row[3],
                        "description": row[4],
                        "loci": row[5],
                        "journey": row[6],
                        "review_count": row[7],
                        "retention_rate": row[8],
                        "created_at": row[9].isoformat() if row[9] else None
                    }
                return None
        except Exception as e:
            logger.error(f"Failed to get Memory Palace: {e}")
            return None

# Global storage instances
artifact_manager = ArtifactManager()

# Initialize TimescaleDB storage (replaces Supabase)
timescale_storage = TimescaleDBStorage()

# Alias for backwards compatibility
supabase_storage = timescale_storage  # Legacy alias

# Database persistence
database_persistence = DatabasePersistence()
