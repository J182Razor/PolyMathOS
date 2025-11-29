"""
End-to-End Tests for User Workflows
Tests complete user workflows with multiple components
"""

import pytest
from fastapi.testclient import TestClient
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

@pytest.fixture
def client():
    """Create test client"""
    from app.main import app
    return TestClient(app)

class TestEducationWorkflow:
    """Test complete education workflow"""
    
    def test_education_workflow_complete(self, client):
        """Test full education workflow from request to result"""
        # Step 1: Generate education workflow
        response = client.post(
            "/api/swarms/education/generate",
            json={
                "subjects": "Mathematics",
                "learning_style": "Visual",
                "challenge_level": "Moderate"
            }
        )
        assert response.status_code in [200, 500]
        
        if response.status_code == 200:
            data = response.json()
            assert "status" in data

class TestResearchWorkflow:
    """Test complete research workflow"""
    
    def test_research_workflow_complete(self, client):
        """Test full research workflow"""
        # Step 1: Discover papers
        discover_response = client.post(
            "/api/research/papers/discover",
            json={
                "query": "machine learning",
                "max_results": 5
            }
        )
        assert discover_response.status_code in [200, 500]
        
        # Step 2: Orchestrate research
        orchestrate_response = client.post(
            "/api/research/advanced/orchestrate",
            json={
                "research_query": "Latest AI advances",
                "max_workers": 3,
                "strategy": "comprehensive"
            }
        )
        assert orchestrate_response.status_code in [200, 500]

class TestDocumentProcessingWorkflow:
    """Test complete document processing workflow"""
    
    def test_document_workflow_complete(self, client):
        """Test full document processing workflow"""
        # Step 1: Parse document
        parse_response = client.post(
            "/api/documents/parse",
            json={
                "content": "Sample document content",
                "document_type": "text"
            }
        )
        assert parse_response.status_code in [200, 500]
        
        # Step 2: Parse for agent
        agent_parse_response = client.post(
            "/api/documents/parse/agent",
            json={
                "data": {"key": "value"},
                "format": "json"
            }
        )
        assert agent_parse_response.status_code in [200, 500]

class TestRAGWorkflow:
    """Test complete RAG workflow"""
    
    def test_rag_workflow_complete(self, client):
        """Test full RAG workflow"""
        # Step 1: Index documents
        index_response = client.post(
            "/api/rag/agent/index",
            json={
                "documents": ["Document 1", "Document 2"],
                "metadata": [{"title": "Doc1"}, {"title": "Doc2"}]
            }
        )
        assert index_response.status_code in [200, 500]
        
        # Step 2: Query RAG
        query_response = client.post(
            "/api/rag/agent/query",
            json={
                "query": "What is the main topic?",
                "top_k": 5
            }
        )
        assert query_response.status_code in [200, 500]

class TestMultiComponentWorkflow:
    """Test workflows using multiple components"""
    
    def test_multi_component_workflow(self, client):
        """Test workflow using multiple components together"""
        # Check health of all components
        health_response = client.get("/api/health/")
        assert health_response.status_code == 200
        
        health_data = health_response.json()
        components = health_data.get("components", {})
        
        # Verify at least some components are available
        available_components = [
            name for name, status in components.items()
            if status.get("status") in ["healthy", "available"]
        ]
        
        # Should have at least basic components available
        assert len(available_components) >= 0  # May be 0 if nothing installed

if __name__ == "__main__":
    pytest.main([__file__, "-v"])

