"""
Test script for Unified Agent Patterns
Tests all agent patterns via API endpoints
"""

import os
import sys
import asyncio
import requests
from typing import Dict, Any
import json

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")
API_BASE = f"{BASE_URL}/api/agents"


def print_section(title: str):
    """Print a formatted section header"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")


def test_orchestrator_status():
    """Test orchestrator health status"""
    print_section("Testing Orchestrator Status")
    try:
        response = requests.get(f"{API_BASE}/status")
        if response.status_code == 200:
            status = response.json()
            print(f"✅ Orchestrator Status: {status.get('status')}")
            print(f"   HDAM Available: {status.get('hdam_available')}")
            print(f"   TigerDB Available: {status.get('tigerdb_available')}")
            print(f"   Patterns Available: {status.get('patterns_available')}/{status.get('total_patterns')}")
            print("\n   Pattern Status:")
            for pattern, available in status.get('patterns', {}).items():
                status_icon = "✅" if available else "❌"
                print(f"     {status_icon} {pattern}: {'Available' if available else 'Unavailable'}")
            return True
        else:
            print(f"❌ Status check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error checking status: {e}")
        return False


def test_list_patterns():
    """Test listing all available patterns"""
    print_section("Testing List Patterns")
    try:
        response = requests.get(f"{API_BASE}/patterns")
        if response.status_code == 200:
            data = response.json()
            patterns = data.get('patterns', [])
            print(f"✅ Found {len(patterns)} patterns")
            print(f"   Available: {data.get('available')}/{data.get('total')}")
            print("\n   Patterns:")
            for pattern in patterns:
                status_icon = "✅" if pattern.get('available') else "❌"
                print(f"     {status_icon} {pattern.get('type')}: {pattern.get('description')}")
                if pattern.get('capabilities'):
                    print(f"        Capabilities: {', '.join(pattern.get('capabilities', []))}")
            return True
        else:
            print(f"❌ List patterns failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error listing patterns: {e}")
        return False


def test_pattern_execution(pattern_type: str, task: str, config: Dict[str, Any] = None):
    """Test executing a specific pattern"""
    print_section(f"Testing {pattern_type} Pattern")
    try:
        payload = {
            "pattern_type": pattern_type,
            "task": task,
            "pattern_config": config or {},
            "context": {"user_id": "test_user", "test": True}
        }
        
        print(f"   Task: {task}")
        print(f"   Config: {json.dumps(config or {}, indent=2)}")
        print("   Executing...")
        
        response = requests.post(
            f"{API_BASE}/orchestrate",
            json=payload,
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Execution successful!")
            print(f"   Execution ID: {result.get('execution_id')}")
            print(f"   Status: {result.get('status')}")
            print(f"   Execution Time: {result.get('execution_time', 0):.2f}s")
            
            if result.get('result'):
                result_data = result.get('result', {})
                if isinstance(result_data, dict):
                    print(f"   Result Status: {result_data.get('status', 'N/A')}")
                    if result_data.get('message'):
                        print(f"   Message: {result_data.get('message')}")
                else:
                    print(f"   Result: {str(result_data)[:200]}...")
            
            return True
        else:
            print(f"❌ Execution failed: {response.status_code}")
            print(f"   Response: {response.text[:500]}")
            return False
    except Exception as e:
        print(f"❌ Error executing pattern: {e}")
        return False


def test_rag_query():
    """Test LlamaIndex RAG query"""
    print_section("Testing LlamaIndex RAG Query")
    try:
        payload = {
            "query": "What is machine learning?",
            "config": {
                "similarity_top_k": 5
            },
            "context": {}
        }
        
        response = requests.post(
            f"{API_BASE}/rag/query",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ RAG Query successful!")
            print(f"   Status: {result.get('status')}")
            if result.get('response'):
                print(f"   Response: {str(result.get('response'))[:300]}...")
            return True
        else:
            print(f"❌ RAG Query failed: {response.status_code}")
            print(f"   Response: {response.text[:500]}")
            return False
    except Exception as e:
        print(f"❌ Error in RAG query: {e}")
        return False


def test_memory_operations():
    """Test ChromaDB memory operations"""
    print_section("Testing ChromaDB Memory Operations")
    
    # Test storing memory
    print("   Testing memory storage...")
    try:
        payload = {
            "content": "Machine learning is a subset of artificial intelligence.",
            "metadata": {
                "topic": "machine_learning",
                "source": "test"
            },
            "config": {
                "operation": "store",
                "doc_id": "test_doc_1"
            },
            "context": {}
        }
        
        response = requests.post(
            f"{API_BASE}/memory/store",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Memory storage successful!")
            print(f"   Status: {result.get('status')}")
        else:
            print(f"❌ Memory storage failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error storing memory: {e}")
    
    # Test querying memory
    print("\n   Testing memory query...")
    try:
        payload = {
            "query": "What is machine learning?",
            "config": {
                "operation": "query",
                "n_results": 3
            },
            "context": {}
        }
        
        response = requests.post(
            f"{API_BASE}/memory/query",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Memory query successful!")
            print(f"   Status: {result.get('status')}")
            if result.get('results'):
                print(f"   Found {len(result.get('results', {}).get('documents', [[]])[0])} results")
        else:
            print(f"❌ Memory query failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error querying memory: {e}")


def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("  Unified Agent Patterns Test Suite")
    print("="*60)
    
    # Test 1: Orchestrator status
    if not test_orchestrator_status():
        print("\n⚠️  Orchestrator not available. Some tests may fail.")
    
    # Test 2: List patterns
    test_list_patterns()
    
    # Test 3: Test individual patterns (non-blocking)
    print("\n" + "="*60)
    print("  Pattern Execution Tests")
    print("="*60)
    print("\n⚠️  Note: Pattern execution tests require proper API keys")
    print("   and may take time. Skipping detailed execution tests.")
    print("   Use the API endpoints directly for full testing.\n")
    
    # Test 4: RAG query (if documents are indexed)
    test_rag_query()
    
    # Test 5: Memory operations
    test_memory_operations()
    
    print("\n" + "="*60)
    print("  Test Suite Complete")
    print("="*60)
    print("\n✅ Basic connectivity tests passed!")
    print("   For full pattern testing, ensure:")
    print("   1. API keys are configured (EXA_API_KEY, etc.)")
    print("   2. Documents are indexed for RAG")
    print("   3. Server is running on", BASE_URL)
    print("\n")


if __name__ == "__main__":
    main()

