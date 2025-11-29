"""
Integration Manager
Coordinates all integrated components:
- TigerDB initialization and management
- SwarmDB integration
- Swarms Tools integration
- Alpha Evolve system
- HDAM (Holographic Associative Memory)
- MonteCarloSwarm
- Education Swarm
- SwarmShield
- Zero
- doc-master, OmniParse, AgentParse
- Research-Paper-Hive, AdvancedResearch
- AgentRAGProtocol, Multi-Agent-RAG
- OmniDB
- swarms-utils
- Custom-Swarms-Spec-Template
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
        
        # New Swarm Corporation components
        self.hdam = None
        self.monte_carlo_swarm = None
        self.education_swarm = None
        self.swarm_shield = None
        self.zero = None
        self.doc_master = None
        self.omniparse = None
        self.agentparse = None
        self.research_paper_hive = None
        self.advanced_research = None
        self.agent_rag_protocol = None
        self.multi_agent_rag = None
        self.omnidb = None
        self.swarms_utils = None
        self.custom_swarms_spec = None
        
        # Dynamic workflow system
        self.dynamic_workflow_generator = None
        self.workflow_orchestrator = None
        
        # Unified agent orchestrator
        self.unified_orchestrator = None
        
        self.initialized = False
    
    def initialize_all(self) -> Dict[str, bool]:
        """Initialize all components"""
        results = {
            "tigerdb": False,
            "swarmdb": False,
            "swarms_tools": False,
            "alpha_evolve": False,
            "hdam": False,
            "monte_carlo_swarm": False,
            "education_swarm": False,
            "swarm_shield": False,
            "zero": False,
            "doc_master": False,
            "omniparse": False,
            "agentparse": False,
            "research_paper_hive": False,
            "advanced_research": False,
            "agent_rag_protocol": False,
            "multi_agent_rag": False,
            "omnidb": False,
            "swarms_utils": False,
            "custom_swarms_spec": False
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
        
        # Initialize HDAM (Holographic Associative Memory) - Priority 1
        logger.info("Initializing HDAM...")
        try:
            from app.modules.hdam import initialize_hdam
            hdam_config = self.config.get("hdam", {})
            self.hdam = initialize_hdam(
                supabase_url=hdam_config.get("supabase_url") or os.getenv("SUPABASE_URL"),
                supabase_key=hdam_config.get("supabase_key") or os.getenv("SUPABASE_KEY"),
                enable_quantum=hdam_config.get("enable_quantum", False) or os.getenv("ENABLE_QUANTUM", "false").lower() == "true"
            )
            results["hdam"] = True
            logger.info("HDAM initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize HDAM: {e}")
        
        # Initialize MonteCarloSwarm
        logger.info("MonteCarloSwarm available (lazy initialization)")
        results["monte_carlo_swarm"] = True
        
        # Initialize Education Swarm
        logger.info("Initializing Education Swarm...")
        try:
            from app.modules.education_swarm import EducationSwarm
            edu_config = self.config.get("education_swarm", {})
            self.education_swarm = EducationSwarm(
                api_key=edu_config.get("api_key") or os.getenv("OPENAI_API_KEY"),
                model_name=edu_config.get("model_name", "gpt-4o-mini")
            )
            results["education_swarm"] = self.education_swarm.available
            if results["education_swarm"]:
                logger.info("Education Swarm initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Education Swarm: {e}")
        
        # Initialize SwarmShield
        logger.info("Initializing SwarmShield...")
        try:
            from app.modules.swarm_shield_integration import get_swarm_shield_integration
            shield_config = self.config.get("swarm_shield", {})
            self.swarm_shield = get_swarm_shield_integration(shield_config)
            results["swarm_shield"] = self.swarm_shield.available
            if results["swarm_shield"]:
                logger.info("SwarmShield initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize SwarmShield: {e}")
        
        # Initialize Zero
        logger.info("Initializing Zero...")
        try:
            from app.modules.zero_integration import get_zero_integration
            zero_config = self.config.get("zero", {})
            self.zero = get_zero_integration(zero_config)
            results["zero"] = self.zero.available
            if results["zero"]:
                logger.info("Zero initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Zero: {e}")
        
        # Initialize Dynamic Workflow Generator (depends on Zero)
        logger.info("Initializing Dynamic Workflow Generator...")
        try:
            from app.modules.dynamic_workflow_generator import get_dynamic_workflow_generator
            self.dynamic_workflow_generator = get_dynamic_workflow_generator()
            logger.info("Dynamic Workflow Generator initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Dynamic Workflow Generator: {e}")
        
        # Initialize Workflow Orchestrator
        logger.info("Initializing Workflow Orchestrator...")
        try:
            from app.modules.workflow_orchestrator import get_workflow_orchestrator
            self.workflow_orchestrator = get_workflow_orchestrator()
            logger.info("Workflow Orchestrator initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Workflow Orchestrator: {e}")
        
        # Initialize Unified Agent Orchestrator
        logger.info("Initializing Unified Agent Orchestrator...")
        try:
            from app.modules.unified_agent_orchestrator import get_unified_orchestrator
            self.unified_orchestrator = get_unified_orchestrator(self.config)
            logger.info("Unified Agent Orchestrator initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Unified Agent Orchestrator: {e}")
        
        # Initialize doc-master
        logger.info("Initializing doc-master...")
        try:
            from app.modules.doc_master_integration import get_doc_master_integration
            doc_config = self.config.get("doc_master", {})
            self.doc_master = get_doc_master_integration(doc_config)
            results["doc_master"] = self.doc_master.available
            if results["doc_master"]:
                logger.info("doc-master initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize doc-master: {e}")
        
        # Initialize OmniParse
        logger.info("Initializing OmniParse...")
        try:
            from app.modules.omniparse_integration import get_omniparse_integration
            parse_config = self.config.get("omniparse", {})
            self.omniparse = get_omniparse_integration(parse_config)
            results["omniparse"] = self.omniparse.available
            if results["omniparse"]:
                logger.info("OmniParse initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize OmniParse: {e}")
        
        # Initialize AgentParse
        logger.info("Initializing AgentParse...")
        try:
            from app.modules.agentparse_integration import get_agentparse_integration
            agentparse_config = self.config.get("agentparse", {})
            self.agentparse = get_agentparse_integration(agentparse_config)
            results["agentparse"] = self.agentparse.available
            if results["agentparse"]:
                logger.info("AgentParse initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize AgentParse: {e}")
        
        # Initialize Research-Paper-Hive
        logger.info("Initializing Research-Paper-Hive...")
        try:
            from app.modules.research_paper_hive_integration import get_research_paper_hive_integration
            hive_config = self.config.get("research_paper_hive", {})
            self.research_paper_hive = get_research_paper_hive_integration(hive_config)
            results["research_paper_hive"] = self.research_paper_hive.available
            if results["research_paper_hive"]:
                logger.info("Research-Paper-Hive initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Research-Paper-Hive: {e}")
        
        # Initialize AdvancedResearch
        logger.info("Initializing AdvancedResearch...")
        try:
            from app.modules.advanced_research_integration import get_advanced_research_integration
            adv_research_config = self.config.get("advanced_research", {})
            self.advanced_research = get_advanced_research_integration(adv_research_config)
            results["advanced_research"] = self.advanced_research.available
            if results["advanced_research"]:
                logger.info("AdvancedResearch initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize AdvancedResearch: {e}")
        
        # Initialize AgentRAGProtocol
        logger.info("Initializing AgentRAGProtocol...")
        try:
            from app.modules.agent_rag_protocol_integration import get_agent_rag_protocol_integration
            rag_config = self.config.get("agent_rag_protocol", {})
            self.agent_rag_protocol = get_agent_rag_protocol_integration(rag_config)
            results["agent_rag_protocol"] = self.agent_rag_protocol.available
            if results["agent_rag_protocol"]:
                logger.info("AgentRAGProtocol initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize AgentRAGProtocol: {e}")
        
        # Initialize Multi-Agent-RAG
        logger.info("Initializing Multi-Agent-RAG...")
        try:
            from app.modules.multi_agent_rag_integration import get_multi_agent_rag_integration
            multi_rag_config = self.config.get("multi_agent_rag", {})
            self.multi_agent_rag = get_multi_agent_rag_integration(multi_rag_config)
            results["multi_agent_rag"] = self.multi_agent_rag.available
            if results["multi_agent_rag"]:
                logger.info("Multi-Agent-RAG initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Multi-Agent-RAG: {e}")
        
        # Initialize OmniDB (optional, service-based)
        logger.info("Initializing OmniDB...")
        try:
            from app.modules.omnidb_integration import get_omnidb_integration
            omnidb_config = self.config.get("omnidb", {})
            self.omnidb = get_omnidb_integration(omnidb_config)
            # Check health asynchronously
            import asyncio
            try:
                loop = asyncio.get_event_loop()
            except RuntimeError:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
            health = loop.run_until_complete(self.omnidb.health_check())
            results["omnidb"] = health.get("available", False)
            if results["omnidb"]:
                logger.info("OmniDB initialized successfully")
        except Exception as e:
            logger.warning(f"OmniDB not available (optional): {e}")
        
        # Initialize swarms-utils
        logger.info("Initializing swarms-utils...")
        try:
            from app.modules.swarms_utils_integration import get_swarms_utils_integration
            utils_config = self.config.get("swarms_utils", {})
            self.swarms_utils = get_swarms_utils_integration(utils_config)
            results["swarms_utils"] = self.swarms_utils.available
            if results["swarms_utils"]:
                logger.info("swarms-utils initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize swarms-utils: {e}")
        
        # Initialize Custom-Swarms-Spec-Template
        logger.info("Initializing Custom-Swarms-Spec-Template...")
        try:
            from app.modules.custom_swarms_spec import get_custom_swarms_spec
            spec_config = self.config.get("custom_swarms_spec", {})
            self.custom_swarms_spec = get_custom_swarms_spec(spec_config)
            results["custom_swarms_spec"] = True  # Always available (has fallback)
            logger.info("Custom-Swarms-Spec-Template initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Custom-Swarms-Spec-Template: {e}")
        
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
    
    def get_hdam(self):
        """Get HDAM instance"""
        return self.hdam
    
    def get_swarm_shield(self):
        """Get SwarmShield instance"""
        return self.swarm_shield
    
    def get_zero(self):
        """Get Zero instance"""
        return self.zero
    
    def get_doc_master(self):
        """Get doc-master instance"""
        return self.doc_master
    
    def get_omniparse(self):
        """Get OmniParse instance"""
        return self.omniparse
    
    def get_agentparse(self):
        """Get AgentParse instance"""
        return self.agentparse
    
    def get_research_paper_hive(self):
        """Get Research-Paper-Hive instance"""
        return self.research_paper_hive
    
    def get_advanced_research(self):
        """Get AdvancedResearch instance"""
        return self.advanced_research
    
    def get_agent_rag_protocol(self):
        """Get AgentRAGProtocol instance"""
        return self.agent_rag_protocol
    
    def get_multi_agent_rag(self):
        """Get Multi-Agent-RAG instance"""
        return self.multi_agent_rag
    
    def get_omnidb(self):
        """Get OmniDB instance"""
        return self.omnidb
    
    def get_swarms_utils(self):
        """Get swarms-utils instance"""
        return self.swarms_utils
    
    def get_custom_swarms_spec(self):
        """Get Custom-Swarms-Spec instance"""
        return self.custom_swarms_spec
    
    def get_dynamic_workflow_generator(self):
        """Get Dynamic Workflow Generator instance"""
        return self.dynamic_workflow_generator
    
    def get_workflow_orchestrator(self):
        """Get Workflow Orchestrator instance"""
        return self.workflow_orchestrator
    
    def get_unified_orchestrator(self):
        """Get Unified Agent Orchestrator instance"""
        return self.unified_orchestrator
    
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
        
        # Check HDAM
        health["components"]["hdam"] = {
            "status": "healthy" if self.hdam else "unavailable",
            "available": self.hdam is not None
        }
        
        # Check MonteCarloSwarm
        health["components"]["monte_carlo_swarm"] = {"status": "available"}
        
        # Check Education Swarm
        if self.education_swarm:
            health["components"]["education_swarm"] = {
                "status": "healthy" if self.education_swarm.available else "unavailable"
            }
        else:
            health["components"]["education_swarm"] = {"status": "unavailable"}
        
        # Check SwarmShield
        if self.swarm_shield:
            health["components"]["swarm_shield"] = self.swarm_shield.health_check()
        else:
            health["components"]["swarm_shield"] = {"status": "unavailable"}
        
        # Check Zero
        if self.zero:
            health["components"]["zero"] = self.zero.health_check()
        else:
            health["components"]["zero"] = {"status": "unavailable"}
        
        # Check Dynamic Workflow Generator
        if self.dynamic_workflow_generator:
            health["components"]["dynamic_workflow_generator"] = {
                "status": "healthy",
                "available": True,
                "templates": len(self.dynamic_workflow_generator.workflow_templates)
            }
        else:
            health["components"]["dynamic_workflow_generator"] = {"status": "unavailable"}
        
        # Check Workflow Orchestrator
        if self.workflow_orchestrator:
            active_count = len(self.workflow_orchestrator.active_workflows)
            health["components"]["workflow_orchestrator"] = {
                "status": "healthy",
                "available": True,
                "active_workflows": active_count
            }
        else:
            health["components"]["workflow_orchestrator"] = {"status": "unavailable"}
        
        # Check Unified Agent Orchestrator
        if self.unified_orchestrator:
            orchestrator_health = self.unified_orchestrator.health_check()
            health["components"]["unified_orchestrator"] = orchestrator_health
        else:
            health["components"]["unified_orchestrator"] = {"status": "unavailable"}
        
        # Check doc-master
        if self.doc_master:
            health["components"]["doc_master"] = self.doc_master.health_check()
        else:
            health["components"]["doc_master"] = {"status": "unavailable"}
        
        # Check OmniParse
        if self.omniparse:
            health["components"]["omniparse"] = self.omniparse.health_check()
        else:
            health["components"]["omniparse"] = {"status": "unavailable"}
        
        # Check AgentParse
        if self.agentparse:
            health["components"]["agentparse"] = self.agentparse.health_check()
        else:
            health["components"]["agentparse"] = {"status": "unavailable"}
        
        # Check Research-Paper-Hive
        if self.research_paper_hive:
            health["components"]["research_paper_hive"] = self.research_paper_hive.health_check()
        else:
            health["components"]["research_paper_hive"] = {"status": "unavailable"}
        
        # Check AdvancedResearch
        if self.advanced_research:
            health["components"]["advanced_research"] = self.advanced_research.health_check()
        else:
            health["components"]["advanced_research"] = {"status": "unavailable"}
        
        # Check AgentRAGProtocol
        if self.agent_rag_protocol:
            health["components"]["agent_rag_protocol"] = self.agent_rag_protocol.health_check()
        else:
            health["components"]["agent_rag_protocol"] = {"status": "unavailable"}
        
        # Check Multi-Agent-RAG
        if self.multi_agent_rag:
            health["components"]["multi_agent_rag"] = self.multi_agent_rag.health_check()
        else:
            health["components"]["multi_agent_rag"] = {"status": "unavailable"}
        
        # Check OmniDB
        if self.omnidb:
            try:
                import asyncio
                try:
                    loop = asyncio.get_event_loop()
                except RuntimeError:
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
                health["components"]["omnidb"] = loop.run_until_complete(self.omnidb.health_check())
            except Exception as e:
                health["components"]["omnidb"] = {"status": "unavailable", "error": str(e)}
        else:
            health["components"]["omnidb"] = {"status": "unavailable"}
        
        # Check swarms-utils
        if self.swarms_utils:
            health["components"]["swarms_utils"] = self.swarms_utils.health_check()
        else:
            health["components"]["swarms_utils"] = {"status": "unavailable"}
        
        # Check Custom-Swarms-Spec
        if self.custom_swarms_spec:
            health["components"]["custom_swarms_spec"] = self.custom_swarms_spec.health_check()
        else:
            health["components"]["custom_swarms_spec"] = {"status": "unavailable"}
        
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

