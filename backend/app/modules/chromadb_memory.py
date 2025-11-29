"""
ChromaDB Memory System
Long-term memory storage for agents using ChromaDB
"""

import os
import logging
from typing import Dict, Any, List, Optional
from pathlib import Path

logger = logging.getLogger(__name__)

# Try to import ChromaDB
try:
    import chromadb
    from chromadb.config import Settings
    CHROMADB_AVAILABLE = True
except ImportError:
    CHROMADB_AVAILABLE = False
    logger.warning("ChromaDB not available. Install: pip install chromadb")
    chromadb = None

# Try to import swarms-memory
try:
    from swarms_memory import ChromaDB as SwarmsChromaDB
    SWARMS_MEMORY_AVAILABLE = True
except ImportError:
    SWARMS_MEMORY_AVAILABLE = False
    logger.warning("swarms-memory not available. Install: pip install swarms-memory")
    SwarmsChromaDB = None


class ChromaDBMemory:
    """
    ChromaDB-based long-term memory system for agents.
    Provides persistent vector storage for agent conversations and knowledge.
    """
    
    def __init__(self, config: Optional[Dict] = None):
        self.config = config or {}
        self.available = CHROMADB_AVAILABLE
        
        if not self.available:
            logger.warning("ChromaDB not available")
            return
        
        try:
            # Configuration
            persist_directory = self.config.get("chromadb_path", "./chromadb")
            collection_name = self.config.get("collection_name", "polymathos_memory")
            metric = self.config.get("metric", "cosine")
            
            # Initialize ChromaDB client
            self.client = chromadb.PersistentClient(
                path=persist_directory,
                settings=Settings(anonymized_telemetry=False)
            )
            
            # Get or create collection
            self.collection = self.client.get_or_create_collection(
                name=collection_name,
                metadata={"description": "PolyMathOS agent memory"},
                embedding_function=None  # Use default
            )
            
            # Try to use swarms-memory wrapper if available
            if SWARMS_MEMORY_AVAILABLE:
                self.swarms_memory = SwarmsChromaDB(
                    metric=metric,
                    output_dir=persist_directory,
                    docs_folder=self.config.get("docs_folder", "artifacts")
                )
            else:
                self.swarms_memory = None
            
            logger.info(f"ChromaDB Memory initialized: {collection_name}")
        except Exception as e:
            logger.error(f"Failed to initialize ChromaDB Memory: {e}")
            self.available = False
    
    async def execute(
        self,
        task: str,
        pattern_config: Dict[str, Any],
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute memory operation (store or retrieve).
        
        Args:
            task: Operation description or query
            pattern_config: Configuration (operation: "store" or "query", content, etc.)
            context: Additional context
        
        Returns:
            Operation result
        """
        if not self.available:
            return {
                "status": "error",
                "message": "ChromaDB Memory not available"
            }
        
        try:
            operation = pattern_config.get("operation", "query")
            
            if operation == "store":
                # Store content in memory
                content = pattern_config.get("content", task)
                metadata = pattern_config.get("metadata", {})
                doc_id = pattern_config.get("doc_id")
                
                self.collection.add(
                    documents=[content],
                    metadatas=[metadata],
                    ids=[doc_id] if doc_id else None
                )
                
                return {
                    "status": "success",
                    "operation": "store",
                    "doc_id": doc_id,
                    "message": "Content stored in memory"
                }
            
            elif operation == "query":
                # Query memory
                query_texts = [task]
                n_results = pattern_config.get("n_results", 5)
                
                results = self.collection.query(
                    query_texts=query_texts,
                    n_results=n_results
                )
                
                return {
                    "status": "success",
                    "operation": "query",
                    "query": task,
                    "results": {
                        "documents": results.get("documents", []),
                        "metadatas": results.get("metadatas", []),
                        "distances": results.get("distances", [])
                    }
                }
            
            else:
                return {
                    "status": "error",
                    "message": f"Unknown operation: {operation}"
                }
        except Exception as e:
            logger.error(f"ChromaDB operation failed: {e}")
            return {
                "status": "error",
                "message": str(e)
            }
    
    @property
    def description(self) -> str:
        return "Long-term memory system using ChromaDB for persistent agent knowledge storage"
    
    @property
    def capabilities(self) -> List[str]:
        return [
            "vector_storage",
            "semantic_search",
            "persistent_memory",
            "metadata_filtering"
        ]

