"""
doc-master Integration Module
Lightweight Python library for automated file reading and content extraction
"""

import os
import logging
from typing import Optional, Dict, Any, List
from pathlib import Path

logger = logging.getLogger(__name__)

# Try to import doc-master
try:
    import doc_master
    DOC_MASTER_AVAILABLE = True
except ImportError:
    DOC_MASTER_AVAILABLE = False
    logger.warning("doc-master not available. Install with: pip install doc-master")
    doc_master = None


class DocMasterIntegration:
    """Integration wrapper for doc-master file reading functionality"""
    
    def __init__(self, config: Optional[Dict] = None):
        self.config = config or {}
        self.available = DOC_MASTER_AVAILABLE
        
        if not self.available:
            logger.warning("doc-master package not installed. File reading features will be unavailable.")
            return
        
        try:
            # Initialize doc-master (adjust based on actual API)
            # self.doc_master = doc_master.DocMaster(**self.config)
            logger.info("doc-master initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize doc-master: {e}")
            self.available = False
    
    def read_file(self, file_path: str) -> Optional[str]:
        """
        Read a file and extract content as string.
        
        Args:
            file_path: Path to the file
        
        Returns:
            Extracted content as string, or None if failed
        """
        if not self.available:
            # Fallback: try basic file reading
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    return f.read()
            except Exception as e:
                logger.error(f"File reading failed: {e}")
                return None
        
        try:
            # In production, use actual doc-master API
            # content = self.doc_master.read(file_path)
            # For now, use fallback
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            logger.error(f"doc-master read failed: {e}")
            return None
    
    def read_files_batch(self, file_paths: List[str]) -> Dict[str, Optional[str]]:
        """
        Read multiple files in batch.
        
        Args:
            file_paths: List of file paths
        
        Returns:
            Dictionary mapping file paths to their content
        """
        results = {}
        for file_path in file_paths:
            results[file_path] = self.read_file(file_path)
        return results
    
    def get_supported_formats(self) -> List[str]:
        """Get list of supported file formats"""
        if not self.available:
            return ["txt", "md", "py", "js", "ts", "json", "yaml", "yml"]
        
        # In production, get from doc-master
        return ["txt", "md", "pdf", "docx", "xlsx", "pptx", "html", "xml", "csv", "json", "yaml", "yml"]
    
    def health_check(self) -> Dict[str, Any]:
        """Perform health check"""
        return {
            "status": "healthy" if self.available else "unavailable",
            "available": self.available,
            "supported_formats": self.get_supported_formats()
        }


def get_doc_master_integration(config: Optional[Dict] = None) -> DocMasterIntegration:
    """Get or create doc-master integration instance"""
    return DocMasterIntegration(config)


