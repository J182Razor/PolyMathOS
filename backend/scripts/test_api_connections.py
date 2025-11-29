"""
Test API Connections
Tests all backend API endpoints to verify connectivity
"""

import requests
import time
import sys
from typing import Dict, List, Tuple

API_BASE_URL = "http://localhost:8000"

def test_endpoint(endpoint: str, method: str = "GET", data: dict = None) -> Tuple[bool, str, float]:
    """Test a single endpoint"""
    url = f"{API_BASE_URL}{endpoint}"
    start_time = time.time()
    
    try:
        if method == "GET":
            response = requests.get(url, timeout=5)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=5)
        else:
            return False, f"Unsupported method: {method}", 0
        
        response_time = (time.time() - start_time) * 1000  # Convert to ms
        
        if response.status_code == 200:
            return True, f"OK ({response.status_code})", response_time
        else:
            return False, f"HTTP {response.status_code}: {response.status_text}", response_time
    except requests.exceptions.Timeout:
        response_time = (time.time() - start_time) * 1000
        return False, "Request timed out after 5 seconds", response_time
    except requests.exceptions.ConnectionError:
        response_time = (time.time() - start_time) * 1000
        return False, "Connection refused - server may not be running", response_time
    except Exception as e:
        response_time = (time.time() - start_time) * 1000
        return False, f"Error: {str(e)}", response_time

def main():
    """Run all API connection tests"""
    print("=" * 60)
    print("PolyMathOS API Connection Test")
    print("=" * 60)
    print()
    
    # Test endpoints
    endpoints = [
        ("/health", "GET"),
        ("/api/agents/status", "GET"),
        ("/api/agents/patterns", "GET"),
        ("/api/workflows/zero/status", "GET"),
        ("/api/hdam/health", "GET"),
        ("/api/documents/formats", "GET"),
        ("/api/research/status", "GET"),
        ("/api/rag/status", "GET"),
    ]
    
    results = []
    total_time = 0
    
    for endpoint, method in endpoints:
        print(f"Testing {method} {endpoint}...", end=" ")
        success, message, response_time = test_endpoint(endpoint, method)
        total_time += response_time
        
        status = "✅" if success else "❌"
        print(f"{status} {message} ({response_time:.0f}ms)")
        results.append((endpoint, success, message, response_time))
    
    print()
    print("=" * 60)
    print("Summary")
    print("=" * 60)
    
    successful = sum(1 for _, success, _, _ in results if success)
    failed = len(results) - successful
    avg_time = total_time / len(results) if results else 0
    
    print(f"Total Endpoints: {len(results)}")
    print(f"✅ Successful: {successful}")
    print(f"❌ Failed: {failed}")
    print(f"⏱️  Average Response Time: {avg_time:.0f}ms")
    print()
    
    if failed > 0:
        print("Failed Endpoints:")
        for endpoint, success, message, _ in results:
            if not success:
                print(f"  ❌ {endpoint}: {message}")
        print()
        return 1
    else:
        print("🎉 All endpoints are working correctly!")
        return 0

if __name__ == "__main__":
    sys.exit(main())

