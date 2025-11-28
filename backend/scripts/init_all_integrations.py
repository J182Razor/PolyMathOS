#!/usr/bin/env python3
"""
Complete Integration Initialization Script
Initializes all integrated components:
- TigerDB
- SwarmDB
- Swarms Tools
- Alpha Evolve
"""

import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.integration_manager import initialize_integrations
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


def main():
    """Main initialization function"""
    logger.info("=" * 60)
    logger.info("PolyMathOS Complete Integration Initialization")
    logger.info("=" * 60)
    
    # Load configuration from environment
    config = {
        "database_url": os.getenv("DATABASE_URL") or os.getenv("TIGERDB_URL"),
        "swarmdb": {
            "url": os.getenv("SWARMDB_URL"),
        },
        "swarms_tools": {
            "twitter": {
                "apiKey": os.getenv("TWITTER_API_KEY"),
                "apiSecretKey": os.getenv("TWITTER_API_SECRET_KEY"),
                "accessToken": os.getenv("TWITTER_ACCESS_TOKEN"),
                "accessTokenSecret": os.getenv("TWITTER_ACCESS_TOKEN_SECRET"),
            }
        }
    }
    
    # Initialize all integrations
    results = initialize_integrations(config)
    
    # Summary
    logger.info("\n" + "=" * 60)
    logger.info("Initialization Summary:")
    logger.info("=" * 60)
    
    all_success = True
    for component, success in results.items():
        status = "✓" if success else "✗"
        logger.info(f"  {status} {component}")
        if not success:
            all_success = False
    
    logger.info("=" * 60)
    
    if all_success:
        logger.info("\n✓ All integrations initialized successfully!")
        return 0
    else:
        logger.warning("\n⚠ Some integrations failed to initialize")
        logger.warning("Check the logs above for details")
        return 1


if __name__ == "__main__":
    exit(main())

