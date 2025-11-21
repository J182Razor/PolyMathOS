-- PolyMathOS Database Schema for Supabase/PostgreSQL
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning sessions table
CREATE TABLE IF NOT EXISTS learning_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_type VARCHAR(50),
  topic VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active',
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  rpe_events INTEGER DEFAULT 0,
  confidence_scores JSONB DEFAULT '[]'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  final_score DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RPE events table
CREATE TABLE IF NOT EXISTS rpe_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES learning_sessions(id) ON DELETE CASCADE,
  item_id VARCHAR(255),
  confidence DECIMAL(5,2),
  was_correct BOOLEAN,
  rpe_value DECIMAL(5,2),
  is_hyper_correction BOOLEAN DEFAULT FALSE,
  dopamine_impact DECIMAL(5,2),
  learning_value DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spaced repetition items table
CREATE TABLE IF NOT EXISTS spaced_repetition_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_id VARCHAR(255) NOT NULL,
  content TEXT,
  current_stage VARCHAR(20) DEFAULT 'learning',
  next_review_date TIMESTAMP WITH TIME ZONE,
  last_review_date TIMESTAMP WITH TIME ZONE,
  review_count INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- LLM interactions table
CREATE TABLE IF NOT EXISTS llm_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID,
  provider VARCHAR(50),
  message TEXT,
  response TEXT,
  tokens_used INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User analytics table
CREATE TABLE IF NOT EXISTS user_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  total_sessions INTEGER DEFAULT 0,
  avg_score DECIMAL(5,2),
  total_minutes INTEGER DEFAULT 0,
  total_rpe_events INTEGER DEFAULT 0,
  avg_rpe DECIMAL(5,2),
  hyper_corrections INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Environment variables table
CREATE TABLE IF NOT EXISTS environment_variables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  key VARCHAR(255) NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  is_secret BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, key)
);

-- Polymath users table
CREATE TABLE IF NOT EXISTS polymath_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  learning_style VARCHAR(50),
  daily_commitment INTEGER DEFAULT 60,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  image_stream_sessions INTEGER DEFAULT 0,
  deep_work_blocks INTEGER DEFAULT 0,
  mind_maps_created INTEGER DEFAULT 0,
  cross_domain_projects INTEGER DEFAULT 0,
  total_study_time INTEGER DEFAULT 0,
  motivation_level INTEGER DEFAULT 7,
  goal_alignment_score INTEGER DEFAULT 85,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_learning_sessions_user_id ON learning_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_status ON learning_sessions(status);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_started_at ON learning_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_rpe_events_user_id ON rpe_events(user_id);
CREATE INDEX IF NOT EXISTS idx_rpe_events_session_id ON rpe_events(session_id);
CREATE INDEX IF NOT EXISTS idx_rpe_events_created_at ON rpe_events(created_at);
CREATE INDEX IF NOT EXISTS idx_spaced_repetition_user_id ON spaced_repetition_items(user_id);
CREATE INDEX IF NOT EXISTS idx_spaced_repetition_next_review ON spaced_repetition_items(next_review_date);
CREATE INDEX IF NOT EXISTS idx_spaced_repetition_status ON spaced_repetition_items(status);
CREATE INDEX IF NOT EXISTS idx_llm_interactions_user_id ON llm_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_llm_interactions_created_at ON llm_interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_period ON user_analytics(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_env_vars_user_id ON environment_variables(user_id);
CREATE INDEX IF NOT EXISTS idx_env_vars_key ON environment_variables(key);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_sessions_updated_at BEFORE UPDATE ON learning_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spaced_repetition_updated_at BEFORE UPDATE ON spaced_repetition_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_env_vars_updated_at BEFORE UPDATE ON environment_variables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rpe_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaced_repetition_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE llm_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE environment_variables ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view own sessions" ON learning_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own RPE events" ON rpe_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own spaced repetition items" ON spaced_repetition_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own LLM interactions" ON llm_interactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own analytics" ON user_analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own env variables" ON environment_variables
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own data
CREATE POLICY "Users can insert own sessions" ON learning_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own RPE events" ON rpe_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own spaced repetition items" ON spaced_repetition_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own LLM interactions" ON llm_interactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own env variables" ON environment_variables
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own sessions" ON learning_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can update own spaced repetition items" ON spaced_repetition_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can update own env variables" ON environment_variables
    FOR UPDATE USING (auth.uid() = user_id);

