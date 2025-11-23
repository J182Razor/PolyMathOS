-- Create extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- Embeddings table for general HDAM storage
CREATE TABLE IF NOT EXISTS embeddings (
    id TEXT PRIMARY KEY,
    embedding VECTOR(384),  -- Adjust dimension based on your model (384 for all-MiniLM-L6-v2)
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Learning resources table for uploaded files
CREATE TABLE IF NOT EXISTS learning_resources (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id TEXT UNIQUE,
    embedding VECTOR(384),
    content TEXT,
    domains TEXT[],
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_embeddings_metadata ON embeddings USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_learning_resources_domains ON learning_resources USING GIN (domains);
CREATE INDEX IF NOT EXISTS idx_learning_resources_metadata ON learning_resources USING GIN (metadata);

