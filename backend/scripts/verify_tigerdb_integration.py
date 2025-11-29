"""
Comprehensive TigerDB Integration Verification Script
Tests all integration points between unified agent orchestrator and TigerDB
"""

import os
import sys
import asyncio
import json
from datetime import datetime
from typing import Dict, Any, List

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Test results storage
test_results: List[Dict[str, Any]] = []


def print_section(title: str):
    """Print a formatted section header"""
    print(f"\n{'='*70}")
    print(f"  {title}")
    print(f"{'='*70}\n")


def log_test(test_name: str, passed: bool, message: str = "", details: Dict = None):
    """Log a test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status}: {test_name}")
    if message:
        print(f"   {message}")
    if details:
        print(f"   Details: {json.dumps(details, indent=2, default=str)}")
    
    test_results.append({
        "test": test_name,
        "passed": passed,
        "message": message,
        "details": details or {}
    })


def test_connection():
    """Test 1: Database Connection"""
    print_section("Test 1: Database Connection")
    
    try:
        connection_string = os.getenv("DATABASE_URL") or os.getenv("TIGERDB_URL")
        if not connection_string:
            log_test("Connection String Available", False, "DATABASE_URL or TIGERDB_URL not set")
            return None
        
        log_test("Connection String Available", True, f"Found connection string")
        
        conn = psycopg2.connect(connection_string)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        log_test("Connection Established", True, "Successfully connected to TigerDB")
        
        # Test connection health
        with conn.cursor() as cur:
            cur.execute("SELECT version()")
            version = cur.fetchone()[0]
            log_test("Connection Health Check", True, f"PostgreSQL version: {version[:50]}...")
        
        return conn
    except Exception as e:
        log_test("Connection Established", False, str(e))
        return None


def test_extensions(conn):
    """Test 2: Required Extensions"""
    print_section("Test 2: Required Extensions")
    
    if not conn:
        log_test("Extensions Check", False, "No connection available")
        return
    
    try:
        with conn.cursor() as cur:
            # Check vector extension
            cur.execute("SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'vector')")
            vector_exists = cur.fetchone()[0]
            log_test("Vector Extension", vector_exists, "pgvector extension" + (" installed" if vector_exists else " not installed"))
            
            # Check timescaledb extension
            cur.execute("SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'timescaledb')")
            timescale_exists = cur.fetchone()[0]
            log_test("TimescaleDB Extension", timescale_exists, "TimescaleDB extension" + (" installed" if timescale_exists else " not installed"))
    except Exception as e:
        log_test("Extensions Check", False, str(e))


def test_tables(conn):
    """Test 3: Required Tables"""
    print_section("Test 3: Required Tables")
    
    if not conn:
        log_test("Tables Check", False, "No connection available")
        return
    
    required_tables = [
        'workflow_executions',
        'workflow_progress',
        'workflow_definitions',
        'workflow_adaptations',
        'swarm_conversations',
        'rag_vectors'
    ]
    
    try:
        with conn.cursor() as cur:
            for table in required_tables:
                cur.execute("""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = 'public' 
                        AND table_name = %s
                    )
                """, (table,))
                exists = cur.fetchone()[0]
                log_test(f"Table: {table}", exists, "Table" + (" exists" if exists else " missing"))
    except Exception as e:
        log_test("Tables Check", False, str(e))


def test_hypertables(conn):
    """Test 4: Time-Series Hypertables"""
    print_section("Test 4: Time-Series Hypertables")
    
    if not conn:
        log_test("Hypertables Check", False, "No connection available")
        return
    
    hypertables = ['workflow_executions', 'workflow_progress', 'workflow_adaptations']
    
    try:
        with conn.cursor() as cur:
            for table in hypertables:
                cur.execute("""
                    SELECT EXISTS (
                        SELECT FROM timescaledb_information.hypertables 
                        WHERE hypertable_name = %s
                    )
                """, (table,))
                is_hypertable = cur.fetchone()[0]
                log_test(f"Hypertable: {table}", is_hypertable, "Table" + (" is hypertable" if is_hypertable else " is not hypertable"))
    except Exception as e:
        log_test("Hypertables Check", False, str(e))


def test_indexes(conn):
    """Test 5: Required Indexes"""
    print_section("Test 5: Required Indexes")
    
    if not conn:
        log_test("Indexes Check", False, "No connection available")
        return
    
    required_indexes = [
        ('idx_workflow_exec_workflow', 'workflow_executions'),
        ('idx_workflow_exec_user', 'workflow_executions'),
        ('idx_workflow_exec_status', 'workflow_executions'),
        ('idx_workflow_prog_workflow', 'workflow_progress'),
        ('idx_workflow_prog_user', 'workflow_progress'),
    ]
    
    try:
        with conn.cursor() as cur:
            for index_name, table_name in required_indexes:
                cur.execute("""
                    SELECT EXISTS (
                        SELECT FROM pg_indexes 
                        WHERE indexname = %s AND tablename = %s
                    )
                """, (index_name, table_name))
                exists = cur.fetchone()[0]
                log_test(f"Index: {index_name}", exists, f"Index on {table_name}" + (" exists" if exists else " missing"))
    except Exception as e:
        log_test("Indexes Check", False, str(e))


def test_write_operations(conn):
    """Test 6: Write Operations"""
    print_section("Test 6: Write Operations")
    
    if not conn:
        log_test("Write Operations", False, "No connection available")
        return
    
    test_execution_id = f"test_{datetime.utcnow().strftime('%Y%m%d_%H%M%S_%f')}"
    
    try:
        with conn.cursor() as cur:
            # Test INSERT into workflow_executions with NULL workflow_id (standalone pattern execution)
            cur.execute("""
                INSERT INTO workflow_executions (
                    execution_id, workflow_id, user_id, trigger_data, result, 
                    status, error, execution_time_seconds, created_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                test_execution_id,
                None,  # NULL workflow_id for standalone pattern execution
                "test_user",
                json.dumps({"test": True, "pattern_type": "test_pattern"}),
                json.dumps({"status": "success", "test": True}),
                "success",
                None,
                1.5,
                datetime.utcnow()
            ))
            conn.commit()
            log_test("INSERT workflow_executions (NULL workflow_id)", True, f"Inserted test execution: {test_execution_id}")
            
            # Verify the insert
            cur.execute("SELECT COUNT(*) FROM workflow_executions WHERE execution_id = %s", (test_execution_id,))
            count = cur.fetchone()[0]
            log_test("Verify INSERT", count == 1, f"Found {count} record(s) with test execution_id")
            
            # Test INSERT with a workflow_id (if workflow exists)
            test_workflow_id = f"test_workflow_{datetime.utcnow().strftime('%Y%m%d_%H%M%S_%f')}"
            test_execution_id2 = f"test2_{datetime.utcnow().strftime('%Y%m%d_%H%M%S_%f')}"
            
            # Create a test workflow definition
            cur.execute("""
                INSERT INTO workflow_definitions (
                    workflow_id, user_id, name, description, workflow_def, status
                ) VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (workflow_id) DO NOTHING
            """, (
                test_workflow_id,
                "test_user",
                "Test Workflow",
                "Test workflow for verification",
                json.dumps({"test": True}),
                "active"
            ))
            conn.commit()
            
            # Insert execution with workflow_id
            cur.execute("""
                INSERT INTO workflow_executions (
                    execution_id, workflow_id, user_id, trigger_data, result, 
                    status, error, execution_time_seconds, created_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                test_execution_id2,
                test_workflow_id,
                "test_user",
                json.dumps({"test": True}),
                json.dumps({"status": "success", "test": True}),
                "success",
                None,
                2.0,
                datetime.utcnow()
            ))
            conn.commit()
            log_test("INSERT workflow_executions (with workflow_id)", True, f"Inserted test execution: {test_execution_id2}")
            
            # Clean up test data
            cur.execute("DELETE FROM workflow_executions WHERE execution_id IN (%s, %s)", (test_execution_id, test_execution_id2))
            cur.execute("DELETE FROM workflow_definitions WHERE workflow_id = %s", (test_workflow_id,))
            conn.commit()
            log_test("Cleanup Test Data", True, "Test data removed")
            
    except Exception as e:
        log_test("Write Operations", False, str(e))


def test_read_operations(conn):
    """Test 7: Read Operations"""
    print_section("Test 7: Read Operations")
    
    if not conn:
        log_test("Read Operations", False, "No connection available")
        return
    
    try:
        with conn.cursor() as cur:
            # Test SELECT from workflow_executions
            cur.execute("SELECT COUNT(*) FROM workflow_executions")
            count = cur.fetchone()[0]
            log_test("SELECT workflow_executions", True, f"Found {count} execution record(s)")
            
            # Test time-series query
            cur.execute("""
                SELECT COUNT(*) 
                FROM workflow_executions 
                WHERE created_at > NOW() - INTERVAL '1 day'
            """)
            recent_count = cur.fetchone()[0]
            log_test("Time-Series Query", True, f"Found {recent_count} execution(s) in last 24 hours")
            
            # Test JOIN query
            cur.execute("""
                SELECT COUNT(*) 
                FROM workflow_executions we
                LEFT JOIN workflow_definitions wd ON we.workflow_id = wd.workflow_id
                LIMIT 10
            """)
            join_count = cur.fetchone()[0]
            log_test("JOIN Query", True, f"JOIN query executed successfully")
            
    except Exception as e:
        log_test("Read Operations", False, str(e))


def test_unified_orchestrator_integration():
    """Test 8: Unified Orchestrator Integration"""
    print_section("Test 8: Unified Orchestrator Integration")
    
    try:
        # Try to import, but handle torch/transformers compatibility issues gracefully
        try:
            from app.modules.unified_agent_orchestrator import get_unified_orchestrator
        except Exception as import_error:
            error_msg = str(import_error)
            if "torch" in error_msg or "transformers" in error_msg or "pytree" in error_msg:
                log_test("Orchestrator Initialization", False, 
                        f"Import failed due to dependency version conflict: {error_msg[:100]}...")
                log_test("TigerDB Integration", False, "Cannot test - orchestrator not available")
                log_test("Connection Health Check", False, "Cannot test - orchestrator not available")
                log_test("Orchestrator Health Check", False, "Cannot test - orchestrator not available")
                return
            else:
                raise
        
        orchestrator = get_unified_orchestrator()
        log_test("Orchestrator Initialization", orchestrator is not None, "Unified orchestrator created")
        
        if orchestrator:
            # Check TigerDB integration
            tigerdb_available = orchestrator.tigerdb is not None and (
                orchestrator.tigerdb.available if orchestrator.tigerdb else False
            )
            log_test("TigerDB Integration", tigerdb_available, "TigerDB" + (" connected" if tigerdb_available else " not connected"))
            
            # Test connection health check
            if tigerdb_available:
                try:
                    health_check = orchestrator._check_tigerdb_connection()
                    log_test("Connection Health Check", health_check, "Connection health check" + (" passed" if health_check else " failed"))
                except Exception as e:
                    log_test("Connection Health Check", False, f"Health check error: {str(e)[:100]}")
            
            # Test health check method
            try:
                health = orchestrator.health_check()
                log_test("Orchestrator Health Check", health.get("status") == "healthy", 
                        f"Status: {health.get('status')}, Patterns: {health.get('patterns_available')}/{health.get('total_patterns')}")
            except Exception as e:
                log_test("Orchestrator Health Check", False, f"Health check error: {str(e)[:100]}")
            
    except Exception as e:
        log_test("Unified Orchestrator Integration", False, str(e))


async def test_async_storage():
    """Test 9: Async Storage Operations"""
    print_section("Test 9: Async Storage Operations")
    
    try:
        # Try to import, but handle torch/transformers compatibility issues gracefully
        try:
            from app.modules.unified_agent_orchestrator import get_unified_orchestrator
        except Exception as import_error:
            error_msg = str(import_error)
            if "torch" in error_msg or "transformers" in error_msg or "pytree" in error_msg:
                log_test("Async Storage", False, 
                        f"Import failed due to dependency version conflict: {error_msg[:100]}...")
                log_test("Async Storage Execution", False, "Cannot test - orchestrator not available")
                log_test("Async Storage Cleanup", False, "Cannot test - orchestrator not available")
                return
            else:
                raise
        
        orchestrator = get_unified_orchestrator()
        if not orchestrator or not orchestrator.tigerdb or not orchestrator.tigerdb.available:
            log_test("Async Storage", False, "Orchestrator or TigerDB not available")
            return
        
        # Create test workflow first to satisfy foreign key
        test_workflow_id = f"async_test_workflow_{datetime.utcnow().strftime('%Y%m%d_%H%M%S_%f')}"
        conn = orchestrator.tigerdb.conn
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO workflow_definitions (
                    workflow_id, user_id, name, description, workflow_def, status
                ) VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (workflow_id) DO NOTHING
            """, (
                test_workflow_id,
                "test_user",
                "Async Test Workflow",
                "Test workflow for async storage",
                json.dumps({"test": True}),
                "active"
            ))
            conn.commit()
        
        # Test async storage method
        test_execution_id = f"async_test_{datetime.utcnow().strftime('%Y%m%d_%H%M%S_%f')}"
        await orchestrator._store_execution_metadata(
            execution_id=test_execution_id,
            pattern_type="test_pattern",
            task="Test async storage",
            result={"status": "success", "test": True},
            execution_time=0.5,
            context={"user_id": "test_user", "workflow_id": test_workflow_id}
        )
        
        # Verify storage
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM workflow_executions WHERE execution_id = %s", (test_execution_id,))
            count = cur.fetchone()[0]
            log_test("Async Storage Execution", count == 1, f"Found {count} record(s) with async test execution_id")
            
            # Cleanup
            if count > 0:
                cur.execute("DELETE FROM workflow_executions WHERE execution_id = %s", (test_execution_id,))
                cur.execute("DELETE FROM workflow_definitions WHERE workflow_id = %s", (test_workflow_id,))
                conn.commit()
                log_test("Async Storage Cleanup", True, "Test data removed")
        
    except Exception as e:
        log_test("Async Storage Operations", False, str(e))


def generate_report():
    """Generate final test report"""
    print_section("Test Summary Report")
    
    total_tests = len(test_results)
    passed_tests = sum(1 for r in test_results if r["passed"])
    failed_tests = total_tests - passed_tests
    
    print(f"Total Tests: {total_tests}")
    print(f"✅ Passed: {passed_tests}")
    print(f"❌ Failed: {failed_tests}")
    print(f"Success Rate: {(passed_tests/total_tests*100):.1f}%")
    
    if failed_tests > 0:
        print("\nFailed Tests:")
        for result in test_results:
            if not result["passed"]:
                print(f"  ❌ {result['test']}: {result['message']}")
    
    # Save report to file
    report_file = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "tigerdb_verification_report.json"
    )
    with open(report_file, 'w') as f:
        json.dump({
            "timestamp": datetime.utcnow().isoformat(),
            "summary": {
                "total": total_tests,
                "passed": passed_tests,
                "failed": failed_tests,
                "success_rate": passed_tests/total_tests*100
            },
            "results": test_results
        }, f, indent=2, default=str)
    
    print(f"\n📄 Detailed report saved to: {report_file}")
    
    return passed_tests == total_tests


def main():
    """Run all verification tests"""
    print("\n" + "="*70)
    print("  TigerDB Integration Verification Script")
    print("="*70)
    
    # Test 1: Connection
    conn = test_connection()
    
    if conn:
        # Test 2-7: Database operations
        test_extensions(conn)
        test_tables(conn)
        test_hypertables(conn)
        test_indexes(conn)
        test_write_operations(conn)
        test_read_operations(conn)
        
        # Close connection
        try:
            conn.close()
        except:
            pass
    
    # Test 8-9: Integration tests
    test_unified_orchestrator_integration()
    asyncio.run(test_async_storage())
    
    # Generate report
    all_passed = generate_report()
    
    print("\n" + "="*70)
    if all_passed:
        print("  ✅ All Tests Passed!")
    else:
        print("  ⚠️  Some Tests Failed - Review the report above")
    print("="*70 + "\n")
    
    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())

