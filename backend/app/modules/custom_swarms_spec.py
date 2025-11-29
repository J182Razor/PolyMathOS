"""
Custom-Swarms-Spec-Template Integration Module
Specification template for custom swarm development
"""

import os
import logging
from typing import Optional, Dict, Any, List
import json
import yaml

logger = logging.getLogger(__name__)

# Try to import Custom-Swarms-Spec-Template
try:
    import custom_swarms_spec_template
    CUSTOM_SWARMS_SPEC_AVAILABLE = True
except ImportError:
    CUSTOM_SWARMS_SPEC_AVAILABLE = False
    logger.warning("Custom-Swarms-Spec-Template not available. Install from: https://github.com/The-Swarm-Corporation/Custom-Swarms-Spec-Template.git")
    custom_swarms_spec_template = None


class CustomSwarmsSpec:
    """Integration wrapper for Custom-Swarms-Spec-Template functionality"""
    
    def __init__(self, config: Optional[Dict] = None):
        self.config = config or {}
        self.available = CUSTOM_SWARMS_SPEC_AVAILABLE
        self.specs: Dict[str, Dict[str, Any]] = {}  # Store custom specs
        
        if not self.available:
            logger.warning("Custom-Swarms-Spec-Template package not installed. Custom swarm features will be limited.")
            return
        
        try:
            # Initialize (adjust based on actual API)
            # self.spec_template = custom_swarms_spec_template.SpecTemplate(**self.config)
            logger.info("Custom-Swarms-Spec-Template initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Custom-Swarms-Spec-Template: {e}")
            self.available = False
    
    def create_spec(
        self,
        name: str,
        spec: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Create a custom swarm specification.
        
        Args:
            name: Name of the swarm
            spec: Specification dictionary
        
        Returns:
            Created spec with ID
        """
        try:
            spec_id = f"custom_{name.lower().replace(' ', '_')}"
            
            # Validate spec structure
            required_fields = ["agents", "workflow"]
            for field in required_fields:
                if field not in spec:
                    raise ValueError(f"Missing required field: {field}")
            
            # Store spec
            self.specs[spec_id] = {
                "id": spec_id,
                "name": name,
                "spec": spec,
                "created_at": str(os.path.getmtime(__file__))  # Placeholder
            }
            
            logger.info(f"Custom swarm spec created: {spec_id}")
            return self.specs[spec_id]
        except Exception as e:
            logger.error(f"Spec creation failed: {e}")
            return {"status": "error", "message": str(e)}
    
    def get_spec(self, spec_id: str) -> Optional[Dict[str, Any]]:
        """Get a custom swarm specification"""
        return self.specs.get(spec_id)
    
    def list_specs(self) -> List[Dict[str, Any]]:
        """List all custom swarm specifications"""
        return list(self.specs.values())
    
    def validate_spec(self, spec: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate a swarm specification.
        
        Args:
            spec: Specification dictionary
        
        Returns:
            Validation result
        """
        errors = []
        warnings = []
        
        # Check required fields
        required_fields = ["agents", "workflow"]
        for field in required_fields:
            if field not in spec:
                errors.append(f"Missing required field: {field}")
        
        # Check agents structure
        if "agents" in spec:
            if not isinstance(spec["agents"], list):
                errors.append("agents must be a list")
            elif len(spec["agents"]) == 0:
                warnings.append("No agents defined")
        
        # Check workflow structure
        if "workflow" in spec:
            if not isinstance(spec["workflow"], dict):
                errors.append("workflow must be a dictionary")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings
        }
    
    def health_check(self) -> Dict[str, Any]:
        """Perform health check"""
        return {
            "status": "healthy" if self.available else "unavailable",
            "available": self.available,
            "specs_count": len(self.specs)
        }


def get_custom_swarms_spec(config: Optional[Dict] = None) -> CustomSwarmsSpec:
    """Get or create Custom-Swarms-Spec instance"""
    return CustomSwarmsSpec(config)


