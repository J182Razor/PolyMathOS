"""
Storage and Persistence Layer for PolyMathOS
Handles local filesystem, Supabase cloud storage, and artifact management
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

# Try to import Supabase
try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    logger.warning("Supabase not available. Cloud storage will be disabled.")

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

class SupabaseStorage:
    """Supabase cloud storage integration"""
    
    def __init__(self, supabase_url: Optional[str] = None, supabase_key: Optional[str] = None):
        self.client: Optional[Client] = None
        self.available = False
        
        if SUPABASE_AVAILABLE and supabase_url and supabase_key:
            try:
                self.client = create_client(supabase_url, supabase_key)
                self.available = True
                logger.info("Supabase storage initialized")
            except Exception as e:
                logger.error(f"Failed to initialize Supabase: {e}")
    
    def upload_artifact(
        self,
        artifact_id: str,
        content: Any,
        task_id: str,
        bucket: str = "artifacts"
    ) -> Optional[str]:
        """Upload artifact to Supabase storage"""
        if not self.available or not self.client:
            return None
        
        try:
            # Convert content to JSON string
            content_str = json.dumps(content) if not isinstance(content, str) else content
            
            # Generate file path
            file_path = f"{task_id}/{artifact_id}.json"
            
            # Upload to storage
            response = self.client.storage.from_(bucket).upload(
                file_path,
                content_str.encode('utf-8'),
                file_options={"content-type": "application/json"}
            )
            
            # Get public URL
            public_url = self.client.storage.from_(bucket).get_public_url(file_path)
            
            logger.info(f"Uploaded artifact {artifact_id} to Supabase")
            return public_url
            
        except Exception as e:
            logger.error(f"Failed to upload artifact to Supabase: {e}")
            return None
    
    def download_artifact(self, file_path: str, bucket: str = "artifacts") -> Optional[Dict]:
        """Download artifact from Supabase storage"""
        if not self.available or not self.client:
            return None
        
        try:
            response = self.client.storage.from_(bucket).download(file_path)
            content = json.loads(response.decode('utf-8'))
            return content
        except Exception as e:
            logger.error(f"Failed to download artifact from Supabase: {e}")
            return None

class DatabasePersistence:
    """PostgreSQL database persistence for PolyMathOS"""
    
    def __init__(self, connection_string: Optional[str] = None):
        self.connection_string = connection_string or os.getenv("DATABASE_URL")
        self.available = False
        
        if self.connection_string:
            try:
                import psycopg2
                self.conn = psycopg2.connect(self.connection_string)
                self.available = True
                self._initialize_tables()
                logger.info("Database persistence initialized")
            except Exception as e:
                logger.warning(f"Database not available: {e}")
                self.available = False
    
    def _initialize_tables(self):
        """Initialize database tables"""
        if not self.available:
            return
        
        try:
            with self.conn.cursor() as cur:
                # Tasks table
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS tasks (
                        task_id VARCHAR(255) PRIMARY KEY,
                        user_id VARCHAR(255),
                        task_type VARCHAR(100),
                        status VARCHAR(50),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        metadata JSONB
                    )
                """)
                
                # Executions table
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS executions (
                        execution_id VARCHAR(255) PRIMARY KEY,
                        task_id VARCHAR(255) REFERENCES tasks(task_id),
                        agent_id VARCHAR(255),
                        status VARCHAR(50),
                        result JSONB,
                        error TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        execution_time FLOAT
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
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                # Projects/Features/Tasks hierarchy
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS projects (
                        project_id VARCHAR(255) PRIMARY KEY,
                        name VARCHAR(255),
                        description TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        metadata JSONB
                    )
                """)
                
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS features (
                        feature_id VARCHAR(255) PRIMARY KEY,
                        project_id VARCHAR(255) REFERENCES projects(project_id),
                        name VARCHAR(255),
                        description TEXT,
                        status VARCHAR(50),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                # Document versioning
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS document_versions (
                        version_id VARCHAR(255) PRIMARY KEY,
                        document_id VARCHAR(255),
                        version_number INTEGER,
                        content JSONB,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        created_by VARCHAR(255)
                    )
                """)
                
                self.conn.commit()
                logger.info("Database tables initialized")
        except Exception as e:
            logger.error(f"Failed to initialize database tables: {e}")
            self.conn.rollback()
    
    def save_task(self, task_id: str, user_id: str, task_type: str, metadata: Dict) -> bool:
        """Save task to database"""
        if not self.available:
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
    
    def save_execution(self, execution_id: str, task_id: str, agent_id: str, 
                      status: str, result: Dict, execution_time: float, error: Optional[str] = None) -> bool:
        """Save execution to database"""
        if not self.available:
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
        if not self.available:
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

# Global storage instances
artifact_manager = ArtifactManager()
supabase_storage = SupabaseStorage(
    supabase_url=os.getenv("SUPABASE_URL"),
    supabase_key=os.getenv("SUPABASE_ANON_KEY")
)
database_persistence = DatabasePersistence()

