"""
LlamaIndex RAG System
Document indexing and querying using LlamaIndex with VectorStoreIndex
"""

import os
import logging
from typing import Dict, Any, List, Optional
from pathlib import Path

logger = logging.getLogger(__name__)

# Try to import LlamaIndex
try:
    from llama_index.core import SimpleDirectoryReader, VectorStoreIndex
    LLAMAINDEX_AVAILABLE = True
except ImportError:
    LLAMAINDEX_AVAILABLE = False
    logger.warning("LlamaIndex not available. Install: pip install llama-index llama-index-core")
    SimpleDirectoryReader = None
    VectorStoreIndex = None


class LlamaIndexRAG:
    """
    LlamaIndex-based RAG system for document indexing and querying.
    Provides semantic search over indexed documents.
    """
    
    def __init__(self, config: Optional[Dict] = None):
        self.config = config or {}
        self.available = LLAMAINDEX_AVAILABLE
        self.index = None
        self.data_dir = self.config.get("data_dir", "docs")
        
        if not self.available:
            logger.warning("LlamaIndex not available")
            return
        
        try:
            # Initialize index from data directory
            data_path = Path(self.data_dir)
            if data_path.exists():
                documents = SimpleDirectoryReader(
                    self.data_dir,
                    filename_as_id=self.config.get("filename_as_id", True),
                    recursive=self.config.get("recursive", True),
                    required_exts=self.config.get("required_exts"),
                    exclude_hidden=self.config.get("exclude_hidden", True)
                ).load_data()
                
                self.index = VectorStoreIndex.from_documents(
                    documents,
                    similarity_top_k=self.config.get("similarity_top_k", 10)
                )
                logger.info(f"LlamaIndex RAG initialized with {len(documents)} documents")
            else:
                logger.warning(f"Data directory not found: {self.data_dir}")
        except Exception as e:
            logger.error(f"Failed to initialize LlamaIndex RAG: {e}")
            self.available = False
    
    async def execute(
        self,
        task: str,
        pattern_config: Dict[str, Any],
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute RAG query using LlamaIndex.
        
        Args:
            task: Query string
            pattern_config: Configuration (similarity_top_k, streaming, etc.)
            context: Additional context
        
        Returns:
            Query results
        """
        if not self.available or not self.index:
            return {
                "status": "error",
                "message": "LlamaIndex RAG not available or no documents indexed"
            }
        
        try:
            # Get query engine
            query_engine = self.index.as_query_engine(
                similarity_top_k=pattern_config.get("similarity_top_k", 10),
                streaming=pattern_config.get("streaming", False),
                response_mode=pattern_config.get("response_mode", "compact")
            )
            
            # Execute query
            response = query_engine.query(task)
            
            return {
                "status": "success",
                "query": task,
                "response": str(response),
                "metadata": getattr(response, "metadata", {}) if hasattr(response, "metadata") else {}
            }
        except Exception as e:
            logger.error(f"LlamaIndex query failed: {e}")
            return {
                "status": "error",
                "message": str(e)
            }
    
    @property
    def description(self) -> str:
        return "RAG system using LlamaIndex for document indexing and semantic search"
    
    @property
    def capabilities(self) -> List[str]:
        return [
            "document_indexing",
            "semantic_search",
            "vector_retrieval",
            "context_aware_queries"
        ]

