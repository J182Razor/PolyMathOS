"""
Unified Agent Orchestrator
Provides a single interface for all multi-agent patterns in PolyMathOS
Integrates with Zero workflows, HDAM, and TigerDB
"""

import os
import logging
import asyncio
from typing import Dict, Any, List, Optional, Union
from datetime import datetime
import json
import uuid

logger = logging.getLogger(__name__)

# Import HDAM for memory
try:
    from .hdam import get_hdam
    HDAM_AVAILABLE = True
except ImportError:
    HDAM_AVAILABLE = False
    logger.warning("HDAM not available")

# Import TigerDB for persistence
try:
    from app.core.tigerdb_init import TigerDBInitializer
    TIGERDB_AVAILABLE = True
except ImportError:
    TIGERDB_AVAILABLE = False
    logger.warning("TigerDB not available")

# Import existing agent systems
try:
    from .swarms_agentic_system import agentic_system
    SWARMS_AGENTIC_AVAILABLE = True
except ImportError:
    SWARMS_AGENTIC_AVAILABLE = False
    agentic_system = None

# Pattern imports (will be lazy-loaded)
ADVANCED_RESEARCH_AVAILABLE = False
LLAMAINDEX_AVAILABLE = False
CHROMADB_AVAILABLE = False
MALT_AVAILABLE = False
HIERARCHICAL_SWARM_AVAILABLE = False
GROUP_CHAT_AVAILABLE = False
MULTI_AGENT_ROUTER_AVAILABLE = False
FEDERATED_SWARM_AVAILABLE = False
DFS_SWARM_AVAILABLE = False
AGENT_MATRIX_AVAILABLE = False


class UnifiedAgentOrchestrator:
    """
    Unified orchestrator for all multi-agent patterns.
    Provides single interface for executing any agent pattern.
    """
    
    def __init__(self, config: Optional[Dict] = None):
        self.config = config or {}
        self.hdam = None
        self.tigerdb = None
        
        # Initialize HDAM
        if HDAM_AVAILABLE:
            try:
                self.hdam = get_hdam()
                logger.info("HDAM initialized for agent orchestrator")
            except Exception as e:
                logger.warning(f"HDAM initialization failed: {e}")
        
        # Initialize TigerDB connection
        if TIGERDB_AVAILABLE:
            try:
                connection_string = os.getenv("DATABASE_URL") or os.getenv("TIGERDB_URL")
                if connection_string:
                    self.tigerdb = TigerDBInitializer(connection_string)
                    if self.tigerdb.available:
                        logger.info("TigerDB connected for agent orchestrator")
            except Exception as e:
                logger.warning(f"TigerDB initialization failed: {e}")
        
        # Pattern registry
        self.patterns: Dict[str, Any] = {}
        self._initialize_patterns()
        
        logger.info("Unified Agent Orchestrator initialized")
    
    def _initialize_patterns(self):
        """Lazy-load pattern implementations"""
        # AdvancedResearch
        try:
            from .advanced_research_orchestrator import AdvancedResearchOrchestrator
            self.patterns["advanced_research"] = AdvancedResearchOrchestrator(self.config)
            global ADVANCED_RESEARCH_AVAILABLE
            ADVANCED_RESEARCH_AVAILABLE = True
        except ImportError:
            logger.warning("AdvancedResearch orchestrator not available")
        
        # LlamaIndex RAG
        try:
            from .llamaindex_rag import LlamaIndexRAG
            self.patterns["llamaindex_rag"] = LlamaIndexRAG(self.config)
            global LLAMAINDEX_AVAILABLE
            LLAMAINDEX_AVAILABLE = True
        except ImportError:
            logger.warning("LlamaIndex RAG not available")
        
        # ChromaDB Memory
        try:
            from .chromadb_memory import ChromaDBMemory
            self.patterns["chromadb_memory"] = ChromaDBMemory(self.config)
            global CHROMADB_AVAILABLE
            CHROMADB_AVAILABLE = True
        except ImportError:
            logger.warning("ChromaDB Memory not available")
        
        # AgentRearrange
        try:
            from .agent_rearrange import AgentRearrangePattern
            self.patterns["agent_rearrange"] = AgentRearrangePattern(self.config)
        except ImportError:
            logger.warning("AgentRearrange not available")
        
        # MALT
        try:
            from .malt_integration import MALTIntegration
            self.patterns["malt"] = MALTIntegration(self.config)
            global MALT_AVAILABLE
            MALT_AVAILABLE = True
        except ImportError:
            logger.warning("MALT not available")
        
        # HierarchicalSwarm
        try:
            from .hierarchical_swarm import HierarchicalSwarmPattern
            self.patterns["hierarchical_swarm"] = HierarchicalSwarmPattern(self.config)
            global HIERARCHICAL_SWARM_AVAILABLE
            HIERARCHICAL_SWARM_AVAILABLE = True
        except ImportError:
            logger.warning("HierarchicalSwarm not available")
        
        # GroupChat
        try:
            from .group_chat import GroupChatPattern
            self.patterns["group_chat"] = GroupChatPattern(self.config)
            global GROUP_CHAT_AVAILABLE
            GROUP_CHAT_AVAILABLE = True
        except ImportError:
            logger.warning("GroupChat not available")
        
        # MultiAgentRouter
        try:
            from .multi_agent_router import MultiAgentRouterPattern
            self.patterns["multi_agent_router"] = MultiAgentRouterPattern(self.config)
            global MULTI_AGENT_ROUTER_AVAILABLE
            MULTI_AGENT_ROUTER_AVAILABLE = True
        except ImportError:
            logger.warning("MultiAgentRouter not available")
        
        # FederatedSwarm
        try:
            from .federated_swarm import FederatedSwarmPattern
            self.patterns["federated_swarm"] = FederatedSwarmPattern(self.config)
            global FEDERATED_SWARM_AVAILABLE
            FEDERATED_SWARM_AVAILABLE = True
        except ImportError:
            logger.warning("FederatedSwarm not available")
        
        # DFSSwarm
        try:
            from .dfs_swarm import DFSSwarmPattern
            self.patterns["dfs_swarm"] = DFSSwarmPattern(self.config)
            global DFS_SWARM_AVAILABLE
            DFS_SWARM_AVAILABLE = True
        except ImportError:
            logger.warning("DFSSwarm not available")
        
        # AgentMatrix
        try:
            from .agent_matrix import AgentMatrixPattern
            self.patterns["agent_matrix"] = AgentMatrixPattern(self.config)
            global AGENT_MATRIX_AVAILABLE
            AGENT_MATRIX_AVAILABLE = True
        except ImportError:
            logger.warning("AgentMatrix not available")
    
    async def execute_pattern(
        self,
        pattern_type: str,
        pattern_config: Dict[str, Any],
        task: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Execute any agent pattern through unified interface.
        
        Args:
            pattern_type: Type of pattern to execute
            pattern_config: Configuration for the pattern
            task: Task to execute
            context: Additional context (user_id, learning_plan_id, etc.)
        
        Returns:
            Execution result with metadata
        """
        execution_id = str(uuid.uuid4())
        start_time = datetime.utcnow()
        
        try:
            # Get pattern implementation
            if pattern_type not in self.patterns:
                return {
                    "status": "error",
                    "message": f"Pattern '{pattern_type}' not available",
                    "execution_id": execution_id
                }
            
            pattern = self.patterns[pattern_type]
            
            # Store in HDAM if available
            if self.hdam:
                try:
                    # Store task context in HDAM
                    await self._store_in_hdam(task, context, execution_id)
                except Exception as e:
                    logger.warning(f"HDAM storage failed: {e}")
            
            # Execute pattern
            logger.info(f"Executing pattern '{pattern_type}' with task: {task[:100]}...")
            result = await pattern.execute(task, pattern_config, context or {})
            
            # Calculate execution time
            execution_time = (datetime.utcnow() - start_time).total_seconds()
            
            # Store execution metadata in TigerDB
            if self.tigerdb and self.tigerdb.available:
                try:
                    await self._store_execution_metadata(
                        execution_id, pattern_type, task, result, execution_time, context
                    )
                except Exception as e:
                    logger.warning(f"TigerDB storage failed: {e}")
            
            return {
                "status": "success",
                "execution_id": execution_id,
                "pattern_type": pattern_type,
                "result": result,
                "execution_time": execution_time,
                "timestamp": start_time.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Pattern execution failed: {e}", exc_info=True)
            execution_time = (datetime.utcnow() - start_time).total_seconds()
            
            return {
                "status": "error",
                "execution_id": execution_id,
                "pattern_type": pattern_type,
                "error": str(e),
                "execution_time": execution_time,
                "timestamp": start_time.isoformat()
            }
    
    async def _store_in_hdam(self, task: str, context: Optional[Dict], execution_id: str):
        """Store task context in HDAM"""
        if not self.hdam:
            return
        
        try:
            # Encode task
            task_embedding = self.hdam.encode_texts([task])[0]
            
            # Store in HDAM
            metadata = {
                "execution_id": execution_id,
                "context": context or {},
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Use HDAM learning method
            await self.hdam.learn(
                query=task,
                knowledge=task,
                context=context.get("user_id") if context else "general"
            )
        except Exception as e:
            logger.warning(f"HDAM storage error: {e}")
    
    def _check_tigerdb_connection(self) -> bool:
        """Check if TigerDB connection is healthy and reconnect if needed"""
        if not self.tigerdb or not self.tigerdb.available:
            return False
        
        try:
            conn = self.tigerdb.conn
            if not conn:
                return False
            
            # Check if connection is closed
            if conn.closed:
                logger.warning("TigerDB connection is closed, attempting to reconnect...")
                return self._reconnect_tigerdb()
            
            # Test connection with a simple query
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
                cur.fetchone()
            return True
        except Exception as e:
            logger.warning(f"TigerDB connection check failed: {e}, attempting to reconnect...")
            return self._reconnect_tigerdb()
    
    def _reconnect_tigerdb(self) -> bool:
        """Reconnect to TigerDB if connection is lost"""
        if not self.tigerdb:
            return False
        
        try:
            # Close existing connection if it exists
            if self.tigerdb.conn and not self.tigerdb.conn.closed:
                try:
                    self.tigerdb.conn.close()
                except:
                    pass
            
            # Reinitialize connection
            connection_string = self.tigerdb.connection_string
            if not connection_string:
                connection_string = os.getenv("DATABASE_URL") or os.getenv("TIGERDB_URL")
            
            if not connection_string:
                logger.error("Cannot reconnect: No connection string available")
                return False
            
            import psycopg2
            from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
            
            self.tigerdb.conn = psycopg2.connect(connection_string)
            self.tigerdb.conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
            self.tigerdb.available = True
            logger.info("Successfully reconnected to TigerDB")
            return True
        except Exception as e:
            logger.error(f"Failed to reconnect to TigerDB: {e}")
            self.tigerdb.available = False
            return False
    
    async def _store_execution_metadata(
        self,
        execution_id: str,
        pattern_type: str,
        task: str,
        result: Dict,
        execution_time: float,
        context: Optional[Dict]
    ):
        """Store execution metadata in TigerDB with retry logic and connection health checks"""
        if not self.tigerdb or not self.tigerdb.available:
            return
        
        # Check connection health before proceeding
        if not self._check_tigerdb_connection():
            logger.warning("TigerDB connection not available, skipping metadata storage")
            return
        
        max_retries = 3
        retry_delay = 1  # seconds
        
        for attempt in range(max_retries):
            try:
                import psycopg2
                from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
                
                conn = self.tigerdb.conn
                if not conn or conn.closed:
                    if not self._reconnect_tigerdb():
                        logger.warning("Cannot store metadata: TigerDB connection unavailable")
                        return
                    conn = self.tigerdb.conn
                
                # Ensure autocommit is set
                if conn.isolation_level != ISOLATION_LEVEL_AUTOCOMMIT:
                    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
                
                with conn.cursor() as cur:
                    # Get workflow_id from context, or use NULL for standalone pattern executions
                    workflow_id = context.get("workflow_id") if context else None
                    
                    # For pattern executions without a workflow, workflow_id can be NULL
                    # This allows pattern executions to be stored independently
                    cur.execute("""
                        INSERT INTO workflow_executions (
                            execution_id, workflow_id, user_id, trigger_data, result, 
                            status, error, execution_time_seconds, created_at
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, (
                        execution_id,
                        workflow_id,  # NULL is allowed for standalone pattern executions
                        context.get("user_id") if context else None,
                        json.dumps({"task": task, "pattern_type": pattern_type}),
                        json.dumps(result),
                        result.get("status", "success"),
                        result.get("error"),
                        execution_time,
                        datetime.utcnow()
                    ))
                
                # Explicit commit (even with autocommit, this ensures data is written)
                conn.commit()
                logger.debug(f"Successfully stored execution metadata for {execution_id}")
                return
                
            except psycopg2.OperationalError as e:
                # Connection error - try to reconnect
                logger.warning(f"TigerDB operational error (attempt {attempt + 1}/{max_retries}): {e}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(retry_delay * (attempt + 1))  # Exponential backoff
                    if not self._reconnect_tigerdb():
                        continue
                else:
                    logger.error(f"Failed to store metadata after {max_retries} attempts")
            except Exception as e:
                logger.error(f"TigerDB metadata storage error: {e}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(retry_delay * (attempt + 1))
                else:
                    break
    
    def list_available_patterns(self) -> List[Dict[str, Any]]:
        """List all available agent patterns"""
        patterns = []
        for pattern_type, pattern_instance in self.patterns.items():
            patterns.append({
                "type": pattern_type,
                "available": pattern_instance is not None,
                "description": getattr(pattern_instance, "description", ""),
                "capabilities": getattr(pattern_instance, "capabilities", [])
            })
        return patterns
    
    def get_pattern_status(self, pattern_type: str) -> Dict[str, Any]:
        """Get status of a specific pattern"""
        if pattern_type not in self.patterns:
            return {"status": "unavailable", "message": "Pattern not found"}
        
        pattern = self.patterns[pattern_type]
        return {
            "status": "available" if pattern else "unavailable",
            "pattern_type": pattern_type,
            "capabilities": getattr(pattern, "capabilities", []) if pattern else []
        }
    
    def health_check(self) -> Dict[str, Any]:
        """Perform health check"""
        return {
            "status": "healthy",
            "hdam_available": self.hdam is not None,
            "tigerdb_available": self.tigerdb is not None and (self.tigerdb.available if self.tigerdb else False),
            "patterns_available": len([p for p in self.patterns.values() if p is not None]),
            "total_patterns": len(self.patterns),
            "patterns": {pt: (p is not None) for pt, p in self.patterns.items()}
        }


# Global instance
_orchestrator_instance: Optional[UnifiedAgentOrchestrator] = None


def get_unified_orchestrator(config: Optional[Dict] = None) -> UnifiedAgentOrchestrator:
    """Get or create unified orchestrator instance"""
    global _orchestrator_instance
    if _orchestrator_instance is None:
        _orchestrator_instance = UnifiedAgentOrchestrator(config)
    return _orchestrator_instance

