#!/usr/bin/env python3
"""
TigerDB Initialization Script
Run this script to initialize all required tables in TigerDB
"""

import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.tigerdb_init import initialize_tigerdb, TigerDBInitializer
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


def main():
    """Main initialization function"""
    logger.info("=" * 60)
    logger.info("TigerDB Initialization Script")
    logger.info("=" * 60)
    
    # Get connection string from environment
    connection_string = os.getenv("DATABASE_URL") or os.getenv("TIGERDB_URL")
    
    if not connection_string:
        logger.error("No database connection string found!")
        logger.error("Please set DATABASE_URL or TIGERDB_URL environment variable")
        logger.info("\nExample:")
        logger.info("  export DATABASE_URL='postgresql://user:pass@host:port/dbname'")
        logger.info("  python scripts/init_tigerdb.py")
        return 1
    
    logger.info(f"Connecting to TigerDB...")
    
    # Initialize database
    success = initialize_tigerdb(connection_string)
    
    if success:
        logger.info("\n" + "=" * 60)
        logger.info("✓ TigerDB initialization completed successfully!")
        logger.info("=" * 60)
        
        # Verify tables
        initializer = TigerDBInitializer(connection_string)
        if initializer.available:
            verification = initializer.verify_tables()
            hypertables = initializer.check_hypertables()
            
            logger.info(f"\nVerification Results:")
            logger.info(f"  Tables: {verification.get('existing', 0)}/{verification.get('total_required', 0)}")
            logger.info(f"  Hypertables: {hypertables.get('count', 0)}")
            
            if verification.get('missing_tables'):
                logger.warning(f"  Missing tables: {verification.get('missing_tables')}")
            
            initializer.close()
        
        return 0
    else:
        logger.error("\n" + "=" * 60)
        logger.error("✗ TigerDB initialization failed!")
        logger.error("=" * 60)
        return 1


if __name__ == "__main__":
    exit(main())

