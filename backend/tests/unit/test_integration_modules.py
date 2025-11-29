"""
Unit Tests for Integration Modules
Tests all Swarm Corporation integration modules with mocked dependencies
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

class TestHDAMIntegration:
    """Test HDAM integration"""
    
    @patch('app.modules.hdam.SentenceTransformer')
    def test_hdam_initialization(self, mock_transformer):
        """Test HDAM initialization"""
        from app.modules.hdam import initialize_hdam
        
        mock_transformer.return_value.get_sentence_embedding_dimension.return_value = 384
        
        hdam = initialize_hdam(
            supabase_url="test_url",
            supabase_key="test_key",
            enable_quantum=False
        )
        
        assert hdam is not None
        assert hdam.embedding_dim == 384
    
    @pytest.mark.asyncio
    async def test_hdam_learn(self):
        """Test HDAM learn functionality"""
        from app.modules.hdam import initialize_hdam
        
        with patch('app.modules.hdam.SentenceTransformer'):
            hdam = initialize_hdam(enable_quantum=False)
            result = await hdam.learn(["Test fact"], context="test")
            assert result["stored_facts"] == 1

class TestMonteCarloSwarm:
    """Test MonteCarloSwarm"""
    
    def test_swarm_initialization(self):
        """Test swarm initialization"""
        from app.modules.monte_carlo_swarm import MonteCarloSwarm
        
        # Mock agents
        agents = [Mock() for _ in range(3)]
        for agent in agents:
            agent.run = Mock(return_value="Result")
        
        swarm = MonteCarloSwarm(agents, parallel=False)
        assert swarm.agents == agents
        assert swarm.parallel == False
    
    def test_swarm_sequential_run(self):
        """Test sequential execution"""
        from app.modules.monte_carlo_swarm import MonteCarloSwarm
        
        agents = [Mock() for _ in range(2)]
        agents[0].run = Mock(return_value="Result 1")
        agents[1].run = Mock(return_value="Result 2")
        
        swarm = MonteCarloSwarm(agents, parallel=False)
        result = swarm.run("Test task")
        
        assert len(result) == 2
        agents[0].run.assert_called_once_with("Test task")
        agents[1].run.assert_called_once_with("Result 1")

class TestSwarmShieldIntegration:
    """Test SwarmShield integration"""
    
    def test_shield_initialization_unavailable(self):
        """Test SwarmShield when package not available"""
        from app.modules.swarm_shield_integration import SwarmShieldIntegration
        
        with patch('app.modules.swarm_shield_integration.SWARM_SHIELD_AVAILABLE', False):
            shield = SwarmShieldIntegration()
            assert shield.available == False
            assert shield.protect_message("agent", "message") == "message"
    
    def test_shield_health_check(self):
        """Test health check"""
        from app.modules.swarm_shield_integration import SwarmShieldIntegration
        
        shield = SwarmShieldIntegration()
        health = shield.health_check()
        assert "status" in health
        assert "available" in health

class TestDocumentProcessing:
    """Test document processing integrations"""
    
    def test_doc_master_unavailable(self):
        """Test doc-master when unavailable"""
        from app.modules.doc_master_integration import DocMasterIntegration
        
        with patch('app.modules.doc_master_integration.DOC_MASTER_AVAILABLE', False):
            doc_master = DocMasterIntegration()
            # Should fallback to basic file reading
            result = doc_master.read_file("test.txt")
            # Result may be None if file doesn't exist, but shouldn't crash
            assert doc_master.available == False
    
    def test_omniparse_unavailable(self):
        """Test OmniParse when unavailable"""
        from app.modules.omniparse_integration import OmniParseIntegration
        
        with patch('app.modules.omniparse_integration.OMNIPARSE_AVAILABLE', False):
            omniparse = OmniParseIntegration()
            result = omniparse.parse_document("Test content")
            assert result is not None
            assert result.get("parsed") == False

class TestRAGIntegration:
    """Test RAG integrations"""
    
    def test_agent_rag_unavailable(self):
        """Test AgentRAGProtocol when unavailable"""
        from app.modules.agent_rag_protocol_integration import AgentRAGProtocolIntegration
        
        with patch('app.modules.agent_rag_protocol_integration.AGENT_RAG_PROTOCOL_AVAILABLE', False):
            rag = AgentRAGProtocolIntegration()
            result = rag.index_documents(["doc1", "doc2"])
            assert result["status"] == "error"
            assert "not available" in result["message"].lower()

class TestIntegrationManager:
    """Test IntegrationManager"""
    
    def test_manager_initialization(self):
        """Test IntegrationManager initialization"""
        from app.core.integration_manager import IntegrationManager
        
        manager = IntegrationManager()
        assert manager.initialized == False
    
    def test_manager_health_check(self):
        """Test health check"""
        from app.core.integration_manager import IntegrationManager
        
        manager = IntegrationManager()
        health = manager.health_check()
        assert "status" in health
        assert "components" in health

if __name__ == "__main__":
    pytest.main([__file__, "-v"])

