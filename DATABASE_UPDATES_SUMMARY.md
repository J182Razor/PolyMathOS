# TigerDB Database Schema Updates for Dynamic Workflows

## Overview

The TigerDB schema has been updated to support the dynamic workflow system. New tables have been added to track workflow executions, adaptations, and progress.

## New Tables Added

### 1. **workflow_executions** (Time-Series Hypertable)
Tracks all workflow executions with time-series optimization.

**Columns:**
- `execution_id` (VARCHAR(255)) - Primary key (part of composite)
- `workflow_id` (VARCHAR(255)) - Foreign key to workflow_definitions
- `user_id` (VARCHAR(255)) - User who triggered the execution
- `trigger_data` (JSONB) - Data that triggered the workflow
- `result` (JSONB) - Execution result
- `status` (VARCHAR(50)) - Execution status (success, error, etc.)
- `error` (TEXT) - Error message if execution failed
- `execution_time_seconds` (FLOAT) - Time taken to execute
- `created_at` (TIMESTAMPTZ) - Timestamp (part of composite primary key)

**Indexes:**
- `idx_workflow_exec_workflow` - On workflow_id
- `idx_workflow_exec_user` - On user_id
- `idx_workflow_exec_status` - On status

**Hypertable:** Yes (optimized for time-series queries)

### 2. **workflow_adaptations** (Time-Series Hypertable)
Tracks all workflow adaptations over time.

**Columns:**
- `adaptation_id` (VARCHAR(255)) - Primary key (part of composite)
- `workflow_id` (VARCHAR(255)) - Foreign key to workflow_definitions
- `user_id` (VARCHAR(255)) - User whose workflow was adapted
- `learning_plan_id` (VARCHAR(255)) - Associated learning plan
- `adaptation_type` (VARCHAR(100)) - Type of adaptation (remediation, acceleration, etc.)
- `reason` (TEXT) - Reason for adaptation
- `changes` (JSONB) - Changes made to the workflow
- `progress_data` (JSONB) - Progress data that triggered adaptation
- `created_at` (TIMESTAMPTZ) - Timestamp (part of composite primary key)

**Indexes:**
- `idx_workflow_adapt_workflow` - On workflow_id
- `idx_workflow_adapt_user` - On user_id
- `idx_workflow_adapt_plan` - On learning_plan_id

**Hypertable:** Yes (optimized for time-series queries)

### 3. **workflow_progress** (Time-Series Hypertable)
Tracks workflow progress over time for analytics.

**Columns:**
- `progress_id` (VARCHAR(255)) - Primary key (part of composite)
- `workflow_id` (VARCHAR(255)) - Foreign key to workflow_definitions
- `learning_plan_id` (VARCHAR(255)) - Associated learning plan
- `user_id` (VARCHAR(255)) - User
- `progress_percentage` (FLOAT) - Overall progress percentage
- `comprehension` (FLOAT) - Current comprehension level
- `target_comprehension` (FLOAT) - Target comprehension level
- `activities_completed` (INTEGER) - Number of activities completed
- `total_activities` (INTEGER) - Total number of activities
- `efficiency_score` (FLOAT) - Calculated efficiency score
- `recorded_at` (TIMESTAMPTZ) - Timestamp (part of composite primary key)

**Indexes:**
- `idx_workflow_prog_workflow` - On workflow_id
- `idx_workflow_prog_user` - On user_id
- `idx_workflow_prog_plan` - On learning_plan_id

**Hypertable:** Yes (optimized for time-series queries)

## Updated Tables

### **workflow_definitions**
Enhanced with additional fields for better workflow management.

**New Columns:**
- `workflow_type` (VARCHAR(100)) - Type of workflow (lesson_plan, resource_discovery, etc.)
- `learning_plan_id` (VARCHAR(255)) - Associated learning plan

**New Indexes:**
- `idx_workflows_type` - On workflow_type
- `idx_workflows_plan` - On learning_plan_id

### **learning_plans**
Enhanced to store workflow IDs.

**New Columns:**
- `workflow_id` (VARCHAR(255)) - Main lesson plan workflow ID
- `multi_phase_workflow_id` (VARCHAR(255)) - Multi-phase workflow ID
- `assessment_workflow_id` (VARCHAR(255)) - Assessment workflow ID

**New Indexes:**
- `idx_plans_workflow` - On workflow_id

## Schema Verification

The `verify_tables()` method has been updated to include the new tables:

```python
required_tables = [
    # ... existing tables ...
    # Dynamic workflow tables
    'workflow_executions', 
    'workflow_adaptations', 
    'workflow_progress'
]
```

## Usage

### Initialize Database

```python
from app.core.tigerdb_init import initialize_tigerdb

# Initialize all tables including new workflow tables
success = initialize_tigerdb()
```

### Verify Tables

```python
from app.core.tigerdb_init import TigerDBInitializer

initializer = TigerDBInitializer()
verification = initializer.verify_tables()

print(f"Tables: {verification['existing']}/{verification['total_required']} exist")
print(f"Missing: {verification['missing_tables']}")
```

## Benefits

1. **Time-Series Optimization**: All workflow tracking tables are hypertables, optimized for time-series queries
2. **Comprehensive Tracking**: Track executions, adaptations, and progress separately for better analytics
3. **Efficient Queries**: Indexes on common query patterns (user_id, workflow_id, learning_plan_id)
4. **Scalability**: TimescaleDB hypertables handle large volumes of time-series data efficiently
5. **Analytics Ready**: Progress tracking enables detailed analytics and reporting

## Next Steps

1. **Run Migration**: Execute the updated schema to create new tables
2. **Verify**: Use `verify_tables()` to confirm all tables exist
3. **Test**: Test workflow execution and adaptation tracking
4. **Monitor**: Use workflow_progress table for analytics and reporting

## Notes

- All new tables use TimescaleDB hypertables for optimal time-series performance
- JSONB columns allow flexible storage of workflow data
- Foreign keys ensure data integrity
- Indexes optimize common query patterns
- The schema is backward compatible with existing tables

