"""
Integration Manager
Coordinates all integrated components:
- TigerDB initialization and management
- SwarmDB integration
- Swarms Tools integration
- Alpha Evolve system
"""

import os
import logging
from typing import Optional, Dict, Any
from pathlib import Path

from app.core.tigerdb_init import TigerDBInitializer, initialize_tigerdb
from app.modules.swarmdb_integration import SwarmDBIntegration, get_swarmdb_integration
from app.modules.swarms_tools_integration import SwarmsToolsIntegration, get_swarms_tools_integration
from app.modules.alpha_evolve import AdvancedAlphaEvolve

logger = logging.getLogger(__name__)


class IntegrationManager:
    """Manages all integrated components"""
    
    def __init__(self, config: Optional[Dict] = None):
        self.config = config or {}
        self.tigerdb: Optional[TigerDBInitializer] = None
        self.swarmdb: Optional[SwarmDBIntegration] = None
        self.swarms_tools: Optional[SwarmsToolsIntegration] = None
        self.alpha_evolve: Optional[AdvancedAlphaEvolve] = None
        
        self.initialized = False
    
    def initialize_all(self) -> Dict[str, bool]:
        """Initialize all components"""
        results = {
            "tigerdb": False,
            "swarmdb": False,
            "swarms_tools": False,
            "alpha_evolve": False
        }
        
        # Initialize TigerDB
        logger.info("Initializing TigerDB...")
        try:
            connection_string = self.config.get("database_url") or os.getenv("DATABASE_URL") or os.getenv("TIGERDB_URL")
            self.tigerdb = TigerDBInitializer(connection_string)
            if self.tigerdb.available:
                results["tigerdb"] = self.tigerdb.initialize_all_tables()
                verification = self.tigerdb.verify_tables()
                logger.info(f"TigerDB: {verification.get('existing', 0)}/{verification.get('total_required', 0)} tables exist")
            else:
                logger.warning("TigerDB not available")
        except Exception as e:
            logger.error(f"Failed to initialize TigerDB: {e}")
        
        # Initialize SwarmDB
        logger.info("Initializing SwarmDB...")
        try:
            swarmdb_config = self.config.get("swarmdb", {})
            self.swarmdb = SwarmDBIntegration(
                connection_string=swarmdb_config.get("url") or os.getenv("SWARMDB_URL"),
                config=swarmdb_config
            )
            results["swarmdb"] = self.swarmdb.available
            if results["swarmdb"]:
                logger.info("SwarmDB initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize SwarmDB: {e}")
        
        # Initialize Swarms Tools
        logger.info("Initializing Swarms Tools...")
        try:
            swarms_tools_config = self.config.get("swarms_tools", {})
            self.swarms_tools = SwarmsToolsIntegration(swarms_tools_config)
            results["swarms_tools"] = self.swarms_tools.available
            if results["swarms_tools"]:
                logger.info("Swarms Tools initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Swarms Tools: {e}")
        
        # Initialize Alpha Evolve (lazy initialization)
        logger.info("Alpha Evolve available (lazy initialization)")
        results["alpha_evolve"] = True
        
        self.initialized = True
        
        # Log summary
        logger.info("=" * 50)
        logger.info("Integration Summary:")
        for component, status in results.items():
            status_str = "✓" if status else "✗"
            logger.info(f"  {status_str} {component}")
        logger.info("=" * 50)
        
        return results
    
    def get_tigerdb(self) -> Optional[TigerDBInitializer]:
        """Get TigerDB instance"""
        return self.tigerdb
    
    def get_swarmdb(self) -> Optional[SwarmDBIntegration]:
        """Get SwarmDB instance"""
        return self.swarmdb
    
    def get_swarms_tools(self) -> Optional[SwarmsToolsIntegration]:
        """Get Swarms Tools instance"""
        return self.swarms_tools
    
    def get_alpha_evolve(self, **kwargs) -> AdvancedAlphaEvolve:
        """Get or create Alpha Evolve instance"""
        if self.alpha_evolve is None:
            self.alpha_evolve = AdvancedAlphaEvolve(**kwargs)
        return self.alpha_evolve
    
    def health_check(self) -> Dict[str, Any]:
        """Perform health check on all components"""
        health = {
            "status": "healthy",
            "components": {}
        }
        
        # Check TigerDB
        if self.tigerdb and self.tigerdb.available:
            verification = self.tigerdb.verify_tables()
            health["components"]["tigerdb"] = {
                "status": "healthy" if verification.get("status") == "success" else "degraded",
                "tables": verification.get("existing", 0),
                "total": verification.get("total_required", 0)
            }
        else:
            health["components"]["tigerdb"] = {"status": "unavailable"}
        
        # Check SwarmDB
        if self.swarmdb and self.swarmdb.available:
            health["components"]["swarmdb"] = {"status": "healthy"}
        else:
            health["components"]["swarmdb"] = {"status": "unavailable"}
        
        # Check Swarms Tools
        if self.swarms_tools and self.swarms_tools.available:
            health["components"]["swarms_tools"] = {"status": "healthy"}
        else:
            health["components"]["swarms_tools"] = {"status": "unavailable"}
        
        # Check Alpha Evolve
        health["components"]["alpha_evolve"] = {
            "status": "available",
            "initialized": self.alpha_evolve is not None
        }
        
        # Overall status
        all_healthy = all(
            comp.get("status") in ["healthy", "available"]
            for comp in health["components"].values()
        )
        if not all_healthy:
            health["status"] = "degraded"
        
        return health
    
    def shutdown(self):
        """Shutdown all components"""
        logger.info("Shutting down integration manager...")
        
        if self.tigerdb:
            self.tigerdb.close()
        
        logger.info("Integration manager shut down")


# Global instance
integration_manager: Optional[IntegrationManager] = None

def get_integration_manager(config: Optional[Dict] = None) -> IntegrationManager:
    """Get or create integration manager instance"""
    global integration_manager
    if integration_manager is None:
        integration_manager = IntegrationManager(config)
    return integration_manager


def initialize_integrations(config: Optional[Dict] = None) -> Dict[str, bool]:
    """Convenience function to initialize all integrations"""
    manager = get_integration_manager(config)
    return manager.initialize_all()

