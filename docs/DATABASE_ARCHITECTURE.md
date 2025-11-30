# PolyMathOS Database Architecture

## Overview

PolyMathOS uses a multi-tier database architecture optimized for different data types:

1. **TigerDB (TimescaleDB)** - Primary database for all application data
2. **ChromaDB** - Primary vector storage (default)
3. **Supabase** - Alternative vector storage (optional)

## Database Roles

### TigerDB (TimescaleDB) - Primary Database

**Purpose**: Main database for all application data

**Stores**:
- User accounts and profiles
- Learning plans and curricula
- Learning sessions and progress
- Workflow definitions and executions
- Agent pattern executions
- Research papers metadata
- Document metadata
- All time-series data (progress tracking, analytics)

**Configuration**:
```env
DATABASE_URL=postgresql://user:password@host:port/database
TIGERDB_URL=postgresql://user:password@host:port/database
```

**Features**:
- Time-series optimization (TimescaleDB)
- Vector similarity search (pgvector extension)
- Full ACID compliance
- Scalable and production-ready

### ChromaDB - Primary Vector Storage

**Purpose**: Default vector storage for HDAM (Holographic Associative Memory)

**Stores**:
- Document embeddings
- Knowledge vectors
- Semantic search indices
- HDAM holographic patterns

**Configuration**:
```env
CHROMADB_PATH=./chromadb
CHROMADB_COLLECTION=polymathos_memory
```

**Features**:
- Automatic setup (no configuration required)
- Local file-based storage
- Fast similarity search
- Works out of the box

**Usage**: ChromaDB is used by default. No additional setup is required.

### Supabase - Alternative Vector Storage

**Purpose**: Optional alternative/additional vector storage for HDAM

**Stores**:
- Same as ChromaDB (embeddings, vectors, patterns)
- Can be used alongside ChromaDB or as replacement

**Configuration**:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
```

**Features**:
- Cloud-based storage
- Persistent across deployments
- Can be used for backup/redundancy
- Requires Supabase account

**Usage**: Only used if `SUPABASE_URL` and `SUPABASE_KEY` are configured. If not configured, HDAM uses ChromaDB-only mode.

## Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│              PolyMathOS Application            │
└─────────────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
    ┌────────┐  ┌────────┐  ┌────────┐
    │TigerDB │  │ChromaDB│  │Supabase│
    │(Main)  │  │(Vector)│  │(Vector)│
    └────────┘  └────────┘  └────────┘
     Required    Default    Optional
```

## Data Flow

### Application Data Flow
1. User data → TigerDB
2. Learning plans → TigerDB
3. Progress tracking → TigerDB (time-series)
4. Workflows → TigerDB

### Vector Storage Flow
1. Document uploaded → Text extracted
2. Embeddings generated → Stored in ChromaDB (default)
3. If Supabase configured → Also stored in Supabase (optional)
4. HDAM queries → ChromaDB first, Supabase as fallback/alternative

## Setup Instructions

### 1. TigerDB Setup (Required)

```bash
# Install TigerDB CLI
curl -fsSL https://cli.tigerdata.com | sh

# Create service
tiger service create

# Get connection string
tiger db connection-string --with-password

# Initialize schema
cd backend
python scripts/init_tigerdb.py
```

### 2. ChromaDB Setup (Automatic)

ChromaDB requires no setup. It automatically:
- Creates storage directory at `CHROMADB_PATH` (default: `./chromadb`)
- Initializes collection on first use
- Works out of the box

### 3. Supabase Setup (Optional)

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Enable `vector` extension in SQL Editor:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
4. Get credentials from Project Settings → API
5. Add to `.env`:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-supabase-anon-key
   ```

## Configuration Priority

HDAM vector storage priority:

1. **ChromaDB** (always available, default)
2. **Supabase** (if configured, used as alternative/additional)

If Supabase is not configured:
- HDAM uses ChromaDB-only mode
- All vector operations use ChromaDB
- No functionality is lost

If Supabase is configured:
- HDAM can use both ChromaDB and Supabase
- Supabase provides cloud persistence
- ChromaDB provides local fast access

## Migration

### From Supabase-only to ChromaDB

1. ChromaDB is already the default
2. Simply don't configure Supabase
3. HDAM will use ChromaDB automatically

### From ChromaDB to Supabase

1. Configure Supabase credentials
2. HDAM will use both (or Supabase if preferred)
3. Existing ChromaDB data remains accessible

## Best Practices

1. **Always use TigerDB** for application data
2. **Use ChromaDB** for vector storage (default, no setup)
3. **Add Supabase** only if you need:
   - Cloud persistence
   - Multi-instance deployments
   - Backup/redundancy

## Troubleshooting

### ChromaDB Issues

- **Permission errors**: Check `CHROMADB_PATH` directory permissions
- **Storage full**: Increase disk space or configure Supabase

### Supabase Issues

- **Connection failed**: Verify credentials
- **Extension missing**: Run `CREATE EXTENSION vector;` in Supabase SQL Editor
- **Not used**: Check that credentials are not placeholders

### TigerDB Issues

- **Connection failed**: Verify `DATABASE_URL`
- **Schema not initialized**: Run `python scripts/init_tigerdb.py`
- **Extensions missing**: Ensure TimescaleDB and pgvector are enabled

## Summary

- **TigerDB**: Main database (required)
- **ChromaDB**: Vector storage (default, automatic)
- **Supabase**: Alternative vector storage (optional)

All three work together seamlessly, with ChromaDB providing the default vector storage that requires no configuration.

