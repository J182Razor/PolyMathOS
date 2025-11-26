"""
Learning AI Database Models for TimescaleDB
Defines schemas for quiz sessions, FSRS cards, Zettelkasten notes,
Memory Palaces, and comprehension metrics with time-series support.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional, Dict, Any
import json
import os
import logging

logger = logging.getLogger(__name__)

# SQL Schema for TimescaleDB
TIMESCALE_SCHEMA = """
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";

-- ============ Quiz System Tables ============

-- Quiz definitions
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user ON quiz_sessions(user_id);
-- Convert to hypertable for time-series optimization
SELECT create_hypertable('quiz_sessions', 'created_at', if_not_exists => TRUE);

-- Quiz questions pool
CREATE TABLE IF NOT EXISTS quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    review_time TIMESTAMPTZ DEFAULT NOW()
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    note_id VARCHAR(50) REFERENCES zettel_notes(id) ON DELETE CASCADE,
    embedding vector(1536),
    model VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_note_embeddings_note ON note_embeddings(note_id);

-- Elaboration sessions
CREATE TABLE IF NOT EXISTS elaboration_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    palace_id UUID REFERENCES memory_palaces(id),
    user_id UUID NOT NULL,
    technique VARCHAR(50) DEFAULT 'forward',
    locus_results JSONB,
    overall_score FLOAT,
    start_time TIMESTAMPTZ DEFAULT NOW(),
    end_time TIMESTAMPTZ
);
SELECT create_hypertable('palace_reviews', 'start_time', if_not_exists => TRUE);

-- ============ Feynman Technique Tables ============

-- Feynman sessions
CREATE TABLE IF NOT EXISTS feynman_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    goals JSONB NOT NULL,
    phases JSONB NOT NULL,
    current_phase_index INTEGER DEFAULT 0,
    archetype VARCHAR(50),
    start_date TIMESTAMPTZ DEFAULT NOW(),
    estimated_end_date TIMESTAMPTZ,
    actual_end_date TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_plans_user ON learning_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_plans_status ON learning_plans(status);

-- Learning progress tracking (time-series)
CREATE TABLE IF NOT EXISTS learning_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    plan_id UUID REFERENCES learning_plans(id),
    topic VARCHAR(255),
    activity_type VARCHAR(50),
    activity_id UUID,
    time_spent_seconds INTEGER,
    score FLOAT,
    comprehension_delta FLOAT,
    notes TEXT,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_progress_user ON learning_progress(user_id);
SELECT create_hypertable('learning_progress', 'recorded_at', if_not_exists => TRUE);

-- ============ Comprehension Metrics (Time-Series) ============

-- Comprehension metrics over time
CREATE TABLE IF NOT EXISTS comprehension_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    topic VARCHAR(255),
    dimension VARCHAR(50) NOT NULL,
    score FLOAT NOT NULL,
    source VARCHAR(50),
    measured_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_metrics_user ON comprehension_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_metrics_topic ON comprehension_metrics(topic);
CREATE INDEX IF NOT EXISTS idx_metrics_dimension ON comprehension_metrics(dimension);
SELECT create_hypertable('comprehension_metrics', 'measured_at', if_not_exists => TRUE);

-- RPE (Reward Prediction Error) events for dopamine optimization
CREATE TABLE IF NOT EXISTS rpe_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    activity_type VARCHAR(50),
    activity_id UUID,
    confidence_before FLOAT,
    actual_outcome FLOAT,
    rpe_value FLOAT,
    is_hyper_correction BOOLEAN DEFAULT FALSE,
    dopamine_impact FLOAT,
    learning_value FLOAT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rpe_user ON rpe_events(user_id);
SELECT create_hypertable('rpe_events', 'timestamp', if_not_exists => TRUE);

-- User analytics aggregates
CREATE TABLE IF NOT EXISTS user_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    metric_type VARCHAR(50) NOT NULL,
    metric_value FLOAT NOT NULL,
    period VARCHAR(20),
    metadata JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_analytics_user ON user_analytics(user_id);
SELECT create_hypertable('user_analytics', 'timestamp', if_not_exists => TRUE);

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
"""


@dataclass
class QuizSession:
    """Quiz session data model"""
    id: str
    user_id: str
    quiz_id: Optional[str]
    topic: str
    questions: List[Dict[str, Any]]
    answers: List[Dict[str, Any]]
    results: Dict[str, Any]
    score: int
    max_score: int
    percent_correct: float
    comprehension_score: float
    time_spent_seconds: int
    created_at: datetime = field(default_factory=datetime.now)


@dataclass
class FSRSCard:
    """FSRS card data model"""
    id: str
    user_id: str
    content: Dict[str, Any]
    difficulty: float = 0.3
    stability: float = 0
    retrievability: float = 1.0
    last_review: Optional[datetime] = None
    next_review: datetime = field(default_factory=datetime.now)
    reps: int = 0
    lapses: int = 0
    state: str = "new"
    elapsed_days: int = 0
    scheduled_days: int = 0
    created_at: datetime = field(default_factory=datetime.now)


@dataclass
class ZettelNote:
    """Zettelkasten note data model"""
    id: str
    user_id: str
    title: str
    content: str
    note_type: str = "permanent"
    maturity: str = "seedling"
    links: List[str] = field(default_factory=list)
    backlinks: List[str] = field(default_factory=list)
    tags: List[str] = field(default_factory=list)
    source: Optional[Dict[str, Any]] = None
    elaboration_score: float = 0
    feynman_score: Optional[float] = None
    memory_palace_locus: Optional[str] = None
    review_count: int = 0
    last_reviewed_at: Optional[datetime] = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class MemoryPalace:
    """Memory palace data model"""
    id: str
    user_id: str
    name: str
    description: str
    template: str = "home"
    loci: List[Dict[str, Any]] = field(default_factory=list)
    journey: List[str] = field(default_factory=list)
    image_style: str = "vivid"
    review_count: int = 0
    retention_rate: float = 0
    vr_ready: bool = True
    last_reviewed_at: Optional[datetime] = None
    created_at: datetime = field(default_factory=datetime.now)


@dataclass
class FeynmanSession:
    """Feynman session data model"""
    id: str
    user_id: str
    concept: str
    topic: str
    target_audience: str = "child"
    status: str = "in_progress"
    iterations: List[Dict[str, Any]] = field(default_factory=list)
    final_analysis: Optional[Dict[str, Any]] = None
    started_at: datetime = field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None


@dataclass
class LearningPlan:
    """Learning plan data model"""
    id: str
    user_id: str
    goals: Dict[str, Any]
    phases: List[Dict[str, Any]]
    current_phase_index: int = 0
    archetype: Optional[str] = None
    start_date: datetime = field(default_factory=datetime.now)
    estimated_end_date: Optional[datetime] = None
    status: str = "active"
    created_at: datetime = field(default_factory=datetime.now)


@dataclass
class ComprehensionMetric:
    """Comprehension metric data point"""
    id: str
    user_id: str
    topic: str
    dimension: str  # memory, understanding, application, analysis, synthesis, creation
    score: float
    source: str  # quiz, feynman, fsrs, etc.
    measured_at: datetime = field(default_factory=datetime.now)


class LearningModelsManager:
    """Manager for learning database operations"""
    
    def __init__(self, connection_string: Optional[str] = None):
        self.connection_string = connection_string or os.getenv("DATABASE_URL")
        self.available = False
        self.conn = None
        
        if self.connection_string:
            try:
                import psycopg2
                self.conn = psycopg2.connect(self.connection_string)
                self.available = True
                logger.info("LearningModelsManager connected to TimescaleDB")
            except Exception as e:
                logger.warning(f"TimescaleDB not available: {e}")
    
    def initialize_schema(self) -> bool:
        """Initialize the database schema"""
        if not self.available or not self.conn:
            logger.warning("Cannot initialize schema - database not available")
            return False
        
        try:
            with self.conn.cursor() as cur:
                # Execute schema SQL in parts to handle errors gracefully
                statements = TIMESCALE_SCHEMA.split(';')
                for statement in statements:
                    statement = statement.strip()
                    if statement and not statement.startswith('--'):
                        try:
                            cur.execute(statement + ';')
                        except Exception as e:
                            # Log but continue - some statements may fail if already exists
                            logger.debug(f"Schema statement skipped: {e}")
                
                self.conn.commit()
                logger.info("Learning schema initialized successfully")
                return True
        except Exception as e:
            logger.error(f"Failed to initialize schema: {e}")
            self.conn.rollback()
            return False
    
    def save_quiz_session(self, session: QuizSession) -> bool:
        """Save a quiz session to the database"""
        if not self.available:
            return False
        
        try:
            with self.conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO quiz_sessions 
                    (id, user_id, quiz_id, topic, questions, answers, results, 
                     score, max_score, percent_correct, comprehension_score, time_spent_seconds)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    session.id, session.user_id, session.quiz_id, session.topic,
                    json.dumps(session.questions), json.dumps(session.answers),
                    json.dumps(session.results), session.score, session.max_score,
                    session.percent_correct, session.comprehension_score, 
                    session.time_spent_seconds
                ))
                self.conn.commit()
                return True
        except Exception as e:
            logger.error(f"Failed to save quiz session: {e}")
            self.conn.rollback()
            return False
    
    def save_comprehension_metric(self, metric: ComprehensionMetric) -> bool:
        """Save a comprehension metric"""
        if not self.available:
            return False
        
        try:
            with self.conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO comprehension_metrics 
                    (id, user_id, topic, dimension, score, source)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (
                    metric.id, metric.user_id, metric.topic,
                    metric.dimension, metric.score, metric.source
                ))
                self.conn.commit()
                return True
        except Exception as e:
            logger.error(f"Failed to save comprehension metric: {e}")
            self.conn.rollback()
            return False
    
    def get_comprehension_history(
        self, user_id: str, topic: Optional[str] = None, days: int = 30
    ) -> List[Dict[str, Any]]:
        """Get comprehension history for time-series analysis"""
        if not self.available:
            return []
        
        try:
            with self.conn.cursor() as cur:
                query = """
                    SELECT dimension, score, measured_at
                    FROM comprehension_metrics
                    WHERE user_id = %s 
                    AND measured_at > NOW() - INTERVAL '%s days'
                """
                params = [user_id, days]
                
                if topic:
                    query += " AND topic = %s"
                    params.append(topic)
                
                query += " ORDER BY measured_at DESC"
                
                cur.execute(query, params)
                rows = cur.fetchall()
                
                return [
                    {"dimension": row[0], "score": row[1], "measured_at": row[2]}
                    for row in rows
                ]
        except Exception as e:
            logger.error(f"Failed to get comprehension history: {e}")
            return []
    
    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()


# Global instance
learning_models_manager: Optional[LearningModelsManager] = None

def get_learning_models_manager() -> LearningModelsManager:
    """Get or create the learning models manager"""
    global learning_models_manager
    if learning_models_manager is None:
        learning_models_manager = LearningModelsManager()
    return learning_models_manager

