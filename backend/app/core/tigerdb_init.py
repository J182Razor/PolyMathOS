"""
TigerDB Database Initialization Script
Ensures all required tables are created and configured for PolyMathOS
Works with TigerDB (TimescaleDB Cloud) for optimal time-series performance
"""

import os
import logging
from typing import Optional
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

logger = logging.getLogger(__name__)

# Combined schema from all models
TIGERDB_COMPLETE_SCHEMA = """
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "timescaledb";

-- ============ Core Application Tables ============

-- Users table
CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    task_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    task_type VARCHAR(100),
    status VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);
CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Learning sessions table (time-series)
CREATE TABLE IF NOT EXISTS learning_sessions (
    session_id VARCHAR(255),
    user_id VARCHAR(255),
    session_type VARCHAR(100),
    topic VARCHAR(500),
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMPTZ,
    duration_minutes INTEGER,
    score FLOAT,
    rpe_events INTEGER DEFAULT 0,
    metadata JSONB,
    PRIMARY KEY (session_id, started_at)
);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_user ON learning_sessions(user_id);
SELECT create_hypertable('learning_sessions', 'started_at', if_not_exists => TRUE);

-- RPE events table (time-series)
CREATE TABLE IF NOT EXISTS rpe_events (
    event_id VARCHAR(255),
    user_id VARCHAR(255),
    session_id VARCHAR(255),
    item_id VARCHAR(255),
    confidence FLOAT,
    was_correct BOOLEAN,
    rpe_value FLOAT,
    dopamine_impact FLOAT,
    learning_value FLOAT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (event_id, created_at)
);
CREATE INDEX IF NOT EXISTS idx_rpe_events_user ON rpe_events(user_id);
SELECT create_hypertable('rpe_events', 'created_at', if_not_exists => TRUE);

-- Spaced repetition items
CREATE TABLE IF NOT EXISTS spaced_repetition_items (
    item_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    content TEXT,
    question TEXT,
    answer TEXT,
    difficulty INTEGER DEFAULT 0,
    interval_days INTEGER DEFAULT 1,
    repetitions INTEGER DEFAULT 0,
    ease_factor FLOAT DEFAULT 2.5,
    last_review_at TIMESTAMPTZ,
    next_review_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_spaced_rep_user ON spaced_repetition_items(user_id);
CREATE INDEX IF NOT EXISTS idx_spaced_rep_next_review ON spaced_repetition_items(next_review_at);

-- Executions table (time-series)
CREATE TABLE IF NOT EXISTS executions (
    execution_id VARCHAR(255),
    task_id VARCHAR(255),
    agent_id VARCHAR(255),
    status VARCHAR(50),
    result JSONB,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    execution_time FLOAT,
    PRIMARY KEY (execution_id, created_at)
);
CREATE INDEX IF NOT EXISTS idx_executions_task ON executions(task_id);
SELECT create_hypertable('executions', 'created_at', if_not_exists => TRUE);

-- Agent evolution table
CREATE TABLE IF NOT EXISTS agent_evolution (
    evolution_id VARCHAR(255) PRIMARY KEY,
    agent_id VARCHAR(255),
    version INTEGER,
    improvements JSONB,
    performance_before JSONB,
    performance_after JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_agent_evolution_agent ON agent_evolution(agent_id);

-- User analytics (aggregated time-series)
CREATE TABLE IF NOT EXISTS user_analytics (
    analytics_id VARCHAR(255),
    user_id VARCHAR(255),
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,
    total_sessions INTEGER,
    total_duration_minutes INTEGER,
    average_score FLOAT,
    retention_rate FLOAT,
    rpe_summary JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (analytics_id, period_start)
);
CREATE INDEX IF NOT EXISTS idx_user_analytics_user ON user_analytics(user_id);
SELECT create_hypertable('user_analytics', 'period_start', if_not_exists => TRUE);

-- Artifacts storage table
CREATE TABLE IF NOT EXISTS artifacts (
    artifact_id VARCHAR(255) PRIMARY KEY,
    task_id VARCHAR(255),
    artifact_type VARCHAR(100),
    content JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_artifacts_task ON artifacts(task_id);

-- Vector embeddings table (for pgvector)
CREATE TABLE IF NOT EXISTS embeddings (
    id VARCHAR(255) PRIMARY KEY,
    content_id VARCHAR(255),
    content_type VARCHAR(100),
    embedding_text TEXT,
    embedding vector(1536),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_embeddings_content ON embeddings(content_id);

-- ============ Quiz System Tables ============

-- Quiz definitions
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    topic VARCHAR(255) NOT NULL,
    title VARCHAR(500),
    questions JSONB NOT NULL,
    bloom_distribution JSONB,
    adaptive_difficulty BOOLEAN DEFAULT TRUE,
    fsrs_integration BOOLEAN DEFAULT TRUE,
    time_limit_minutes INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_quizzes_user ON quizzes(user_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_topic ON quizzes(topic);

-- Quiz sessions with time-series tracking
CREATE TABLE IF NOT EXISTS quiz_sessions (
    id UUID DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    quiz_id UUID REFERENCES quizzes(id),
    topic VARCHAR(255),
    questions JSONB,
    answers JSONB,
    results JSONB,
    score INTEGER,
    max_score INTEGER,
    percent_correct FLOAT,
    comprehension_score FLOAT,
    time_spent_seconds INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id, created_at)
);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user ON quiz_sessions(user_id);
SELECT create_hypertable('quiz_sessions', 'created_at', if_not_exists => TRUE);

-- Quiz questions pool
CREATE TABLE IF NOT EXISTS quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic VARCHAR(255) NOT NULL,
    subtopic VARCHAR(255),
    question_type VARCHAR(50) NOT NULL,
    bloom_level VARCHAR(50) NOT NULL,
    question_text TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    distractors JSONB,
    hints JSONB,
    explanation TEXT,
    difficulty INTEGER DEFAULT 5,
    mnemonic_aid JSONB,
    prerequisite_knowledge JSONB,
    tags TEXT[],
    times_asked INTEGER DEFAULT 0,
    times_correct INTEGER DEFAULT 0,
    average_time_seconds FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_topic ON quiz_questions(topic);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_bloom ON quiz_questions(bloom_level);

-- ============ FSRS Spaced Repetition Tables ============

-- FSRS cards for spaced repetition
CREATE TABLE IF NOT EXISTS fsrs_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    content JSONB NOT NULL,
    difficulty FLOAT DEFAULT 0.3,
    stability FLOAT DEFAULT 0,
    retrievability FLOAT DEFAULT 1.0,
    last_review TIMESTAMPTZ,
    next_review TIMESTAMPTZ DEFAULT NOW(),
    reps INTEGER DEFAULT 0,
    lapses INTEGER DEFAULT 0,
    state VARCHAR(20) DEFAULT 'new',
    elapsed_days INTEGER DEFAULT 0,
    scheduled_days INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_fsrs_cards_user ON fsrs_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_fsrs_cards_next_review ON fsrs_cards(next_review);
CREATE INDEX IF NOT EXISTS idx_fsrs_cards_state ON fsrs_cards(state);

-- FSRS review history (time-series)
CREATE TABLE IF NOT EXISTS fsrs_reviews (
    id UUID DEFAULT gen_random_uuid(),
    card_id UUID REFERENCES fsrs_cards(id),
    user_id UUID NOT NULL,
    rating INTEGER NOT NULL,
    state_before VARCHAR(20),
    state_after VARCHAR(20),
    difficulty_before FLOAT,
    difficulty_after FLOAT,
    stability_before FLOAT,
    stability_after FLOAT,
    retrievability FLOAT,
    elapsed_days INTEGER,
    scheduled_days INTEGER,
    review_time TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id, review_time)
);
CREATE INDEX IF NOT EXISTS idx_fsrs_reviews_card ON fsrs_reviews(card_id);
SELECT create_hypertable('fsrs_reviews', 'review_time', if_not_exists => TRUE);

-- ============ Zettelkasten Knowledge Graph Tables ============

-- Zettelkasten notes
CREATE TABLE IF NOT EXISTS zettel_notes (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    note_type VARCHAR(20) DEFAULT 'permanent',
    maturity VARCHAR(20) DEFAULT 'seedling',
    links TEXT[],
    backlinks TEXT[],
    tags TEXT[],
    source JSONB,
    elaboration_score FLOAT DEFAULT 0,
    feynman_score FLOAT,
    memory_palace_locus VARCHAR(100),
    review_count INTEGER DEFAULT 0,
    last_reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_zettel_user ON zettel_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_zettel_type ON zettel_notes(note_type);
CREATE INDEX IF NOT EXISTS idx_zettel_maturity ON zettel_notes(maturity);
CREATE INDEX IF NOT EXISTS idx_zettel_tags ON zettel_notes USING GIN(tags);

-- Note embeddings for semantic search (using pgvector)
CREATE TABLE IF NOT EXISTS note_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id VARCHAR(50) REFERENCES zettel_notes(id) ON DELETE CASCADE,
    embedding vector(1536),
    model VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_note_embeddings_note ON note_embeddings(note_id);

-- Elaboration sessions
CREATE TABLE IF NOT EXISTS elaboration_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id VARCHAR(50) REFERENCES zettel_notes(id),
    user_id UUID NOT NULL,
    questions JSONB,
    answers JSONB,
    suggested_edits JSONB,
    suggested_connections JSONB,
    score_before FLOAT,
    score_after FLOAT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ Memory Palace Tables ============

-- Memory palaces
CREATE TABLE IF NOT EXISTS memory_palaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template VARCHAR(50) DEFAULT 'home',
    loci JSONB NOT NULL,
    journey TEXT[],
    image_style VARCHAR(50) DEFAULT 'vivid',
    review_count INTEGER DEFAULT 0,
    retention_rate FLOAT DEFAULT 0,
    vr_ready BOOLEAN DEFAULT TRUE,
    last_reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_palaces_user ON memory_palaces(user_id);

-- Palace review sessions (time-series)
CREATE TABLE IF NOT EXISTS palace_reviews (
    id UUID DEFAULT gen_random_uuid(),
    palace_id UUID REFERENCES memory_palaces(id),
    user_id UUID NOT NULL,
    technique VARCHAR(50) DEFAULT 'forward',
    locus_results JSONB,
    overall_score FLOAT,
    start_time TIMESTAMPTZ DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    PRIMARY KEY (id, start_time)
);
SELECT create_hypertable('palace_reviews', 'start_time', if_not_exists => TRUE);

-- ============ Feynman Technique Tables ============

-- Feynman sessions
CREATE TABLE IF NOT EXISTS feynman_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    concept VARCHAR(500) NOT NULL,
    topic VARCHAR(255),
    target_audience VARCHAR(50) DEFAULT 'child',
    status VARCHAR(20) DEFAULT 'in_progress',
    final_analysis JSONB,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_feynman_user ON feynman_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_feynman_status ON feynman_sessions(status);

-- Feynman iterations
CREATE TABLE IF NOT EXISTS feynman_iterations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES feynman_sessions(id),
    iteration_number INTEGER,
    explanation TEXT NOT NULL,
    analysis JSONB,
    novice_questions JSONB,
    user_responses JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_feynman_iter_session ON feynman_iterations(session_id);

-- ============ Learning Plans Tables ============

-- Learning plans
CREATE TABLE IF NOT EXISTS learning_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    goals JSONB NOT NULL,
    phases JSONB NOT NULL,
    current_phase_index INTEGER DEFAULT 0,
    archetype VARCHAR(50),
    workflow_id VARCHAR(255),
    multi_phase_workflow_id VARCHAR(255),
    assessment_workflow_id VARCHAR(255),
    start_date TIMESTAMPTZ DEFAULT NOW(),
    estimated_end_date TIMESTAMPTZ,
    actual_end_date TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add workflow columns if they don't exist (for existing tables)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'learning_plans' AND column_name = 'workflow_id') THEN
        ALTER TABLE learning_plans ADD COLUMN workflow_id VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'learning_plans' AND column_name = 'multi_phase_workflow_id') THEN
        ALTER TABLE learning_plans ADD COLUMN multi_phase_workflow_id VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'learning_plans' AND column_name = 'assessment_workflow_id') THEN
        ALTER TABLE learning_plans ADD COLUMN assessment_workflow_id VARCHAR(255);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_plans_user ON learning_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_plans_status ON learning_plans(status);
CREATE INDEX IF NOT EXISTS idx_plans_workflow ON learning_plans(workflow_id);

-- Learning progress tracking (time-series)
CREATE TABLE IF NOT EXISTS learning_progress (
    id UUID DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    plan_id UUID REFERENCES learning_plans(id),
    topic VARCHAR(255),
    activity_type VARCHAR(50),
    activity_id UUID,
    time_spent_seconds INTEGER,
    score FLOAT,
    comprehension_delta FLOAT,
    notes TEXT,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id, recorded_at)
);
CREATE INDEX IF NOT EXISTS idx_progress_user ON learning_progress(user_id);
SELECT create_hypertable('learning_progress', 'recorded_at', if_not_exists => TRUE);

-- ============ Comprehension Metrics (Time-Series) ============

-- Comprehension metrics over time
CREATE TABLE IF NOT EXISTS comprehension_metrics (
    id UUID DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    topic VARCHAR(255),
    dimension VARCHAR(50) NOT NULL,
    score FLOAT NOT NULL,
    source VARCHAR(50),
    measured_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id, measured_at)
);
CREATE INDEX IF NOT EXISTS idx_metrics_user ON comprehension_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_metrics_topic ON comprehension_metrics(topic);
CREATE INDEX IF NOT EXISTS idx_metrics_dimension ON comprehension_metrics(dimension);
SELECT create_hypertable('comprehension_metrics', 'measured_at', if_not_exists => TRUE);

-- ============ Continuous Aggregates for Analytics ============

-- Daily comprehension summary
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_comprehension_summary
WITH (timescaledb.continuous) AS
SELECT 
    user_id,
    topic,
    time_bucket('1 day', measured_at) AS day,
    dimension,
    AVG(score) as avg_score,
    COUNT(*) as measurement_count
FROM comprehension_metrics
GROUP BY user_id, topic, day, dimension
WITH NO DATA;

-- Weekly learning progress summary  
CREATE MATERIALIZED VIEW IF NOT EXISTS weekly_progress_summary
WITH (timescaledb.continuous) AS
SELECT
    user_id,
    time_bucket('1 week', recorded_at) AS week,
    SUM(time_spent_seconds) as total_time_seconds,
    AVG(score) as avg_score,
    COUNT(*) as activities_completed
FROM learning_progress
GROUP BY user_id, week
WITH NO DATA;

-- ============ Swarm Corporation Integration Tables ============

-- SwarmShield encrypted conversations
CREATE TABLE IF NOT EXISTS swarm_conversations (
    conversation_id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);
CREATE INDEX IF NOT EXISTS idx_swarm_conv_user ON swarm_conversations(user_id);

-- Document metadata (doc-master, OmniParse)
CREATE TABLE IF NOT EXISTS document_metadata (
    document_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    filename VARCHAR(500),
    file_type VARCHAR(50),
    file_size BIGINT,
    content_hash VARCHAR(64),
    parsed_data JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);
CREATE INDEX IF NOT EXISTS idx_doc_meta_user ON document_metadata(user_id);
CREATE INDEX IF NOT EXISTS idx_doc_meta_type ON document_metadata(file_type);

-- Research papers (Research-Paper-Hive)
CREATE TABLE IF NOT EXISTS research_papers (
    paper_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    title TEXT,
    authors TEXT[],
    abstract TEXT,
    year INTEGER,
    venue VARCHAR(255),
    doi VARCHAR(255),
    arxiv_id VARCHAR(255),
    url TEXT,
    engagement_data JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_research_papers_user ON research_papers(user_id);
CREATE INDEX IF NOT EXISTS idx_research_papers_year ON research_papers(year);

-- RAG vectors (AgentRAGProtocol, Multi-Agent-RAG)
CREATE TABLE IF NOT EXISTS rag_vectors (
    vector_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    document_id VARCHAR(255),
    content TEXT,
    embedding vector(384),  -- Adjust dimension as needed
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_rag_vectors_user ON rag_vectors(user_id);
CREATE INDEX IF NOT EXISTS idx_rag_vectors_doc ON rag_vectors(document_id);
CREATE INDEX IF NOT EXISTS idx_rag_vectors_embedding ON rag_vectors USING ivfflat (embedding vector_cosine_ops);

-- Workflow definitions (Zero)
CREATE TABLE IF NOT EXISTS workflow_definitions (
    workflow_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    workflow_def JSONB NOT NULL,
    workflow_type VARCHAR(100),
    learning_plan_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_workflows_user ON workflow_definitions(user_id);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflow_definitions(status);
CREATE INDEX IF NOT EXISTS idx_workflows_type ON workflow_definitions(workflow_type);
CREATE INDEX IF NOT EXISTS idx_workflows_plan ON workflow_definitions(learning_plan_id);

-- Workflow executions (time-series)
CREATE TABLE IF NOT EXISTS workflow_executions (
    execution_id VARCHAR(255),
    workflow_id VARCHAR(255) REFERENCES workflow_definitions(workflow_id) ON DELETE SET NULL,
    user_id VARCHAR(255),
    trigger_data JSONB,
    result JSONB,
    status VARCHAR(50),
    error TEXT,
    execution_time_seconds FLOAT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (execution_id, created_at)
);
-- Make workflow_id nullable to allow pattern executions without workflow definitions
ALTER TABLE workflow_executions ALTER COLUMN workflow_id DROP NOT NULL;
CREATE INDEX IF NOT EXISTS idx_workflow_exec_workflow ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_exec_user ON workflow_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_exec_status ON workflow_executions(status);
SELECT create_hypertable('workflow_executions', 'created_at', if_not_exists => TRUE);

-- Workflow adaptations (time-series)
CREATE TABLE IF NOT EXISTS workflow_adaptations (
    adaptation_id VARCHAR(255),
    workflow_id VARCHAR(255) REFERENCES workflow_definitions(workflow_id),
    user_id VARCHAR(255),
    learning_plan_id VARCHAR(255),
    adaptation_type VARCHAR(100),
    reason TEXT,
    changes JSONB,
    progress_data JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (adaptation_id, created_at)
);
CREATE INDEX IF NOT EXISTS idx_workflow_adapt_workflow ON workflow_adaptations(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_adapt_user ON workflow_adaptations(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_adapt_plan ON workflow_adaptations(learning_plan_id);
SELECT create_hypertable('workflow_adaptations', 'created_at', if_not_exists => TRUE);

-- Workflow progress tracking (time-series)
CREATE TABLE IF NOT EXISTS workflow_progress (
    progress_id VARCHAR(255),
    workflow_id VARCHAR(255) REFERENCES workflow_definitions(workflow_id),
    learning_plan_id VARCHAR(255),
    user_id VARCHAR(255),
    progress_percentage FLOAT,
    comprehension FLOAT,
    target_comprehension FLOAT,
    activities_completed INTEGER,
    total_activities INTEGER,
    efficiency_score FLOAT,
    recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (progress_id, recorded_at)
);
CREATE INDEX IF NOT EXISTS idx_workflow_prog_workflow ON workflow_progress(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_prog_user ON workflow_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_prog_plan ON workflow_progress(learning_plan_id);
SELECT create_hypertable('workflow_progress', 'recorded_at', if_not_exists => TRUE);

-- Custom swarm specifications
CREATE TABLE IF NOT EXISTS custom_swarm_specs (
    spec_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    spec JSONB NOT NULL,
    validation_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_custom_swarms_user ON custom_swarm_specs(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_swarms_status ON custom_swarm_specs(validation_status);
"""


class TigerDBInitializer:
    """Initialize and verify TigerDB database schema"""
    
    def __init__(self, connection_string: Optional[str] = None):
        self.connection_string = connection_string or os.getenv("DATABASE_URL") or os.getenv("TIGERDB_URL")
        self.conn = None
        self.available = False
        
        if not self.connection_string:
            logger.warning("No database connection string provided. Set DATABASE_URL or TIGERDB_URL environment variable.")
            return
        
        try:
            self.conn = psycopg2.connect(self.connection_string)
            self.conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
            self.available = True
            logger.info("Connected to TigerDB successfully")
        except Exception as e:
            logger.error(f"Failed to connect to TigerDB: {e}")
            self.available = False
    
    def initialize_all_tables(self) -> bool:
        """Initialize all required tables in TigerDB"""
        if not self.available or not self.conn:
            logger.error("Cannot initialize tables - database not available")
            return False
        
        try:
            with self.conn.cursor() as cur:
                # Execute the entire schema as a single block
                logger.info("Executing schema...")
                cur.execute(TIGERDB_COMPLETE_SCHEMA)
                logger.info("Schema execution completed")
                return True
                
        except Exception as e:
            logger.error(f"Failed to initialize schema: {e}")
            return False
    
    def check_connection_health(self) -> bool:
        """Check if database connection is healthy"""
        if not self.available or not self.conn:
            return False
        
        try:
            # Check if connection is closed
            if self.conn.closed:
                return False
            
            # Test connection with a simple query
            with self.conn.cursor() as cur:
                cur.execute("SELECT 1")
                cur.fetchone()
            return True
        except Exception as e:
            logger.warning(f"Connection health check failed: {e}")
            return False
    
    def reconnect(self) -> bool:
        """Reconnect to the database"""
        if not self.connection_string:
            logger.error("Cannot reconnect: No connection string available")
            return False
        
        try:
            # Close existing connection if it exists
            if self.conn and not self.conn.closed:
                try:
                    self.conn.close()
                except:
                    pass
            
            # Reconnect
            self.conn = psycopg2.connect(self.connection_string)
            self.conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
            self.available = True
            logger.info("Successfully reconnected to TigerDB")
            return True
        except Exception as e:
            logger.error(f"Failed to reconnect to TigerDB: {e}")
            self.available = False
            return False
    
    def verify_tables(self) -> dict:
        """Verify that all required tables exist"""
        if not self.available or not self.conn:
            return {"status": "error", "message": "Database not available"}
        
        # Check connection health first
        if not self.check_connection_health():
            logger.warning("Connection unhealthy, attempting to reconnect...")
            if not self.reconnect():
                return {"status": "error", "message": "Database connection failed"}
        
        required_tables = [
            'users', 'tasks', 'learning_sessions', 'rpe_events',
            'spaced_repetition_items', 'executions', 'agent_evolution',
            'user_analytics', 'artifacts', 'embeddings',
            'quizzes', 'quiz_sessions', 'quiz_questions',
            'fsrs_cards', 'fsrs_reviews',
            'zettel_notes', 'note_embeddings', 'elaboration_sessions',
            'memory_palaces', 'palace_reviews',
            'feynman_sessions', 'feynman_iterations',
            'learning_plans', 'learning_progress',
            'comprehension_metrics',
            # Swarm Corporation integration tables
            'swarm_conversations', 'document_metadata', 'research_papers',
            'rag_vectors', 'workflow_definitions', 'custom_swarm_specs',
            # Dynamic workflow tables
            'workflow_executions', 'workflow_adaptations', 'workflow_progress'
        ]
        
        try:
            with self.conn.cursor() as cur:
                cur.execute("""
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public'
                """)
                existing_tables = [row[0] for row in cur.fetchall()]
                
                missing_tables = [t for t in required_tables if t not in existing_tables]
                existing_count = len([t for t in required_tables if t in existing_tables])
                
                return {
                    "status": "success",
                    "total_required": len(required_tables),
                    "existing": existing_count,
                    "missing": len(missing_tables),
                    "missing_tables": missing_tables,
                    "all_tables": existing_tables
                }
        except Exception as e:
            logger.error(f"Failed to verify tables: {e}")
            return {"status": "error", "message": str(e)}
    
    def check_hypertables(self) -> dict:
        """Check which tables are configured as hypertables"""
        if not self.available or not self.conn:
            return {"status": "error", "message": "Database not available"}
        
        try:
            with self.conn.cursor() as cur:
                cur.execute("""
                    SELECT hypertable_name 
                    FROM timescaledb_information.hypertables
                """)
                hypertables = [row[0] for row in cur.fetchall()]
                
                return {
                    "status": "success",
                    "hypertables": hypertables,
                    "count": len(hypertables)
                }
        except Exception as e:
            logger.warning(f"Could not check hypertables (TimescaleDB may not be available): {e}")
            return {"status": "warning", "message": str(e)}
    
    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()
            logger.info("TigerDB connection closed")


def initialize_tigerdb(connection_string: Optional[str] = None) -> bool:
    """Convenience function to initialize TigerDB"""
    initializer = TigerDBInitializer(connection_string)
    if not initializer.available:
        return False
    
    success = initializer.initialize_all_tables()
    verification = initializer.verify_tables()
    hypertables = initializer.check_hypertables()
    
    logger.info(f"Initialization: {'SUCCESS' if success else 'FAILED'}")
    logger.info(f"Tables: {verification.get('existing', 0)}/{verification.get('total_required', 0)} exist")
    logger.info(f"Hypertables: {hypertables.get('count', 0)} configured")
    
    initializer.close()
    return success


if __name__ == "__main__":
    # Run initialization if called directly
    logging.basicConfig(level=logging.INFO)
    success = initialize_tigerdb()
    exit(0 if success else 1)
