-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity TIMESTAMPTZ,
    learning_style TEXT,
    daily_commitment INTEGER DEFAULT 60,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Domains table
CREATE TABLE IF NOT EXISTS domains (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'primary', 'secondary', 'exploratory'
    proficiency INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0,
    items_memorized INTEGER DEFAULT 0,
    sessions_completed INTEGER DEFAULT 0,
    last_accessed TIMESTAMPTZ,
    UNIQUE(user_id, name)
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    xp_reward INTEGER NOT NULL,
    unlock_condition TEXT,
    icon TEXT
);

-- User Achievements (many-to-many)
CREATE TABLE IF NOT EXISTS user_achievements (
    user_id TEXT REFERENCES users(id),
    achievement_id TEXT REFERENCES achievements(id),
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, achievement_id)
);

-- Flashcards table
CREATE TABLE IF NOT EXISTS flashcards (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    domain_id INTEGER REFERENCES domains(id),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    next_review TIMESTAMPTZ,
    interval INTEGER DEFAULT 0,
    ease_factor FLOAT DEFAULT 2.5,
    review_count INTEGER DEFAULT 0
);

-- Memory Palaces table
CREATE TABLE IF NOT EXISTS memory_palaces (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    name TEXT NOT NULL,
    domain_id INTEGER REFERENCES domains(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Memory Palace Items table
CREATE TABLE IF NOT EXISTS memory_palace_items (
    id SERIAL PRIMARY KEY,
    palace_id INTEGER REFERENCES memory_palaces(id),
    loci TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    audio_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_reviewed TIMESTAMPTZ
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'in_progress',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Learning Plans table (for PolyMath Mode)
CREATE TABLE IF NOT EXISTS learning_plans (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    topic TEXT NOT NULL,
    mode TEXT NOT NULL, -- 'fast', 'polymath'
    content JSONB NOT NULL,
    sources JSONB, -- Array of source objects
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assessment Data table
CREATE TABLE IF NOT EXISTS assessment_data (
    user_id TEXT PRIMARY KEY REFERENCES users(id),
    dopamine_profile JSONB,
    meta_learning_skills JSONB,
    learning_style_preferences JSONB,
    personal_goals JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
