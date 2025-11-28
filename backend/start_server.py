#!/usr/bin/env python3
"""
Start PolyMathOS Server
Convenience script to start the FastAPI server with proper configuration
"""

import uvicorn
import os
import sys
from pathlib import Path

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))

if __name__ == "__main__":
    # Get configuration from environment or use defaults
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    reload = os.getenv("RELOAD", "true").lower() == "true"
    
    print("=" * 60)
    print("PolyMathOS Genius Engine")
    print("=" * 60)
    print(f"Starting server on http://{host}:{port}")
    print(f"Reload mode: {reload}")
    print("=" * 60)
    print("\nAvailable endpoints:")
    print("  - http://localhost:8000/ - Root endpoint")
    print("  - http://localhost:8000/docs - API documentation")
    print("  - http://localhost:8000/system/status - System status")
    print("  - http://localhost:8000/integrations/status - Integration status")
    print("=" * 60)
    print("\nPress Ctrl+C to stop the server\n")
    
    try:
        uvicorn.run(
            "app.main:app",
            host=host,
            port=port,
            reload=reload,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n\nServer stopped by user")
    except Exception as e:
        print(f"\n\nError starting server: {e}")
        sys.exit(1)

