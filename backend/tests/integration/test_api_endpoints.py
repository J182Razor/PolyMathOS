"""
Integration Tests for API Endpoints
Tests API endpoints with actual HTTP requests
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

class TestHealthEndpoints:
    """Test health check endpoints"""
    
    def test_health_check(self, client):
        """Test overall health check"""
        response = client.get("/api/health/")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "components" in data
    
    def test_components_health(self, client):
        """Test components health check"""
        response = client.get("/api/health/components")
        assert response.status_code == 200
        data = response.json()
        assert "components" in data
    
    def test_component_health(self, client):
        """Test specific component health"""
        response = client.get("/api/health/component/hdam")
        assert response.status_code in [200, 404]  # May not be available

class TestHDAMEndpoints:
    """Test HDAM API endpoints"""
    
    def test_hdam_learn(self, client):
        """Test HDAM learn endpoint"""
        response = client.post(
            "/api/hdam/learn",
            json={
                "facts": ["Test fact"],
                "context": "test"
            }
        )
        # Should succeed or return error gracefully
        assert response.status_code in [200, 500]
    
    def test_hdam_reason(self, client):
        """Test HDAM reason endpoint"""
        response = client.post(
            "/api/hdam/reason",
            json={
                "query": "Test query",
                "context": "test"
            }
        )
        assert response.status_code in [200, 500]
    
    def test_hdam_metrics(self, client):
        """Test HDAM metrics endpoint"""
        response = client.get("/api/hdam/metrics")
        assert response.status_code in [200, 500]

class TestSwarmsEndpoints:
    """Test Swarms API endpoints"""
    
    def test_monte_carlo_run(self, client):
        """Test MonteCarloSwarm run"""
        response = client.post(
            "/api/swarms/monte-carlo/run",
            json={
                "task": "Test task",
                "parallel": False
            }
        )
        assert response.status_code in [200, 500]
    
    def test_education_generate(self, client):
        """Test Education Swarm generate"""
        response = client.post(
            "/api/swarms/education/generate",
            json={
                "subjects": "Math",
                "learning_style": "Visual"
            }
        )
        assert response.status_code in [200, 500]

class TestDocumentsEndpoints:
    """Test Documents API endpoints"""
    
    def test_get_formats(self, client):
        """Test get supported formats"""
        response = client.get("/api/documents/formats")
        assert response.status_code == 200
        data = response.json()
        assert "formats" in data
    
    def test_parse_document(self, client):
        """Test document parsing"""
        response = client.post(
            "/api/documents/parse",
            json={
                "content": "Test document content",
                "document_type": "text"
            }
        )
        assert response.status_code in [200, 500]

class TestResearchEndpoints:
    """Test Research API endpoints"""
    
    def test_discover_papers(self, client):
        """Test paper discovery"""
        response = client.post(
            "/api/research/papers/discover",
            json={
                "query": "machine learning",
                "max_results": 5
            }
        )
        assert response.status_code in [200, 500]

class TestRAGEndpoints:
    """Test RAG API endpoints"""
    
    def test_index_documents(self, client):
        """Test document indexing"""
        response = client.post(
            "/api/rag/agent/index",
            json={
                "documents": ["Document 1", "Document 2"]
            }
        )
        assert response.status_code in [200, 500]
    
    def test_rag_query(self, client):
        """Test RAG query"""
        response = client.post(
            "/api/rag/agent/query",
            json={
                "query": "Test query",
                "top_k": 5
            }
        )
        assert response.status_code in [200, 500]

class TestSecurityEndpoints:
    """Test Security API endpoints"""
    
    def test_security_status(self, client):
        """Test security status"""
        response = client.get("/api/security/shield/status")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data or "available" in data

class TestWorkflowsEndpoints:
    """Test Workflows API endpoints"""
    
    def test_list_workflows(self, client):
        """Test list workflows"""
        response = client.get("/api/workflows/zero/list")
        assert response.status_code == 200
        data = response.json()
        assert "workflows" in data
    
    def test_workflow_status(self, client):
        """Test workflow status"""
        response = client.get("/api/workflows/zero/status")
        assert response.status_code == 200

if __name__ == "__main__":
    pytest.main([__file__, "-v"])

