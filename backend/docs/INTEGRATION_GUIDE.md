# PolyMathOS Integration Guide

This guide covers the integration of TigerDB, SwarmDB, Swarms Tools, and OpenAlphaEvolve into PolyMathOS.

## Overview

The integration includes:
- **TigerDB**: TimescaleDB cloud database with comprehensive table initialization
- **SwarmDB**: Enhanced database functionality with message queues and load balancing
- **Swarms Tools**: Extended agent capabilities (financial data, web scraping, social media, etc.)
- **OpenAlphaEvolve**: Advanced neural architecture evolution system

## Quick Start

### 1. Install Dependencies

```bash
# Install Python dependencies
pip install -r requirements.txt

# Install Swarms Tools
pip install swarms-tools

# Install SwarmDB (from source)
git clone https://github.com/The-Swarm-Corporation/SwarmDB.git
cd SwarmDB
pip install -e .
```

### 2. Set Environment Variables

```bash
# TigerDB connection (required)
export DATABASE_URL="postgresql://user:password@host:port/database"

# Or use TIGERDB_URL
export TIGERDB_URL="postgresql://user:password@host:port/database"

# SwarmDB connection (optional)
export SWARMDB_URL="your_swarmdb_connection_string"

# Twitter API credentials (optional, for swarms-tools)
export TWITTER_API_KEY="your_key"
export TWITTER_API_SECRET_KEY="your_secret"
export TWITTER_ACCESS_TOKEN="your_token"
export TWITTER_ACCESS_TOKEN_SECRET="your_token_secret"
```

### 3. Initialize TigerDB

```bash
# Initialize all tables in TigerDB
python backend/scripts/init_tigerdb.py
```

This will:
- Create all required tables
- Set up TimescaleDB hypertables for time-series optimization
- Create indexes for optimal performance
- Verify table creation

### 4. Initialize All Integrations

```bash
# Initialize all components
python backend/scripts/init_all_integrations.py
```

## Component Details

### TigerDB Integration

**Location**: `backend/app/core/tigerdb_init.py`

**Features**:
- Comprehensive table initialization
- TimescaleDB hypertable configuration
- Table verification
- Health checks

**Usage**:
```python
from app.core.tigerdb_init import TigerDBInitializer

# Initialize
initializer = TigerDBInitializer(connection_string)
initializer.initialize_all_tables()

# Verify
verification = initializer.verify_tables()
print(f"Tables: {verification['existing']}/{verification['total_required']}")
```

**Tables Created**:
- Core: users, tasks, learning_sessions, rpe_events, executions
- Quiz System: quizzes, quiz_sessions, quiz_questions
- FSRS: fsrs_cards, fsrs_reviews
- Zettelkasten: zettel_notes, note_embeddings, elaboration_sessions
- Memory Palaces: memory_palaces, palace_reviews
- Feynman: feynman_sessions, feynman_iterations
- Learning Plans: learning_plans, learning_progress
- Analytics: comprehension_metrics, user_analytics

### SwarmDB Integration

**Location**: `backend/app/modules/swarmdb_integration.py`

**Features**:
- Message queue system for agent communication
- LLM backend load balancing
- Production-grade multi-agent support

**Usage**:
```python
from app.modules.swarmdb_integration import get_swarmdb_integration

swarmdb = get_swarmdb_integration()

# Send message
swarmdb.send_message("agent_queue", {"task": "process_data"})

# Receive message
message = swarmdb.receive_message("agent_queue")

# Balance LLM requests
balanced_requests = swarmdb.balance_llm_requests(requests)
```

### Swarms Tools Integration

**Location**: `backend/app/modules/swarms_tools_integration.py`

**Features**:
- Financial data: HTX, Yahoo Finance, CoinGecko, DeFi
- Web scraping
- Social media: Twitter, Telegram
- Development: GitHub, Code Executor
- Tool orchestration

**Usage**:
```python
from app.modules.swarms_tools_integration import get_swarms_tools_integration

tools = get_swarms_tools_integration()

# Financial data
stock_data = tools.get_yahoo_finance_data("AAPL")
crypto_data = tools.get_crypto_data("bitcoin")

# Web scraping
content = tools.scrape_url("https://example.com")

# Social media
tools.post_tweet("Hello from PolyMathOS!")

# Development
repo_info = tools.get_github_repo("user/repo")
result = tools.execute_code("print('Hello')")
```

### OpenAlphaEvolve Integration

**Location**: `backend/app/modules/alpha_evolve.py`

**Features**:
- Neural architecture evolution
- Novelty search for behavioral diversity
- Population Based Training (PBT)
- Multi-objective optimization

**Usage**:
```python
from app.modules.alpha_evolve import AdvancedAlphaEvolve
from torch.utils.data import DataLoader

# Initialize
alpha_evolve = AdvancedAlphaEvolve(
    population_size=20,
    use_novelty_search=True,
    use_pbt=True,
    multi_objective=True
)

# Run evolution
best_agent = alpha_evolve.run_evolution(
    train_dataloader=train_loader,
    val_dataloader=val_loader,
    generations=50,
    device='cuda' if torch.cuda.is_available() else 'cpu'
)
```

## Integration Manager

**Location**: `backend/app/core/integration_manager.py`

The IntegrationManager coordinates all components:

```python
from app.core.integration_manager import get_integration_manager

# Initialize all
manager = get_integration_manager(config)
results = manager.initialize_all()

# Access components
tigerdb = manager.get_tigerdb()
swarmdb = manager.get_swarmdb()
swarms_tools = manager.get_swarms_tools()
alpha_evolve = manager.get_alpha_evolve()

# Health check
health = manager.health_check()
```

## Verification

### Check TigerDB Tables

```bash
python backend/scripts/init_tigerdb.py
```

### Check All Integrations

```bash
python backend/scripts/init_all_integrations.py
```

### Programmatic Health Check

```python
from app.core.integration_manager import get_integration_manager

manager = get_integration_manager()
health = manager.health_check()
print(health)
```

## Troubleshooting

### TigerDB Connection Issues

1. Verify connection string format:
   ```
   postgresql://user:password@host:port/database
   ```

2. Check network connectivity
3. Verify credentials
4. Ensure TimescaleDB extension is enabled

### SwarmDB Not Available

SwarmDB is optional. If not installed:
- Clone from: https://github.com/The-Swarm-Corporation/SwarmDB.git
- Install from source
- Set SWARMDB_URL environment variable

### Swarms Tools Import Errors

Install swarms-tools:
```bash
pip install swarms-tools
```

Or install from source:
```bash
git clone https://github.com/The-Swarm-Corporation/swarms-tools.git
cd swarms-tools
pip install -e .
```

### Missing Tables

Re-run initialization:
```bash
python backend/scripts/init_tigerdb.py
```

## Next Steps

1. **Configure TigerDB**: Set up your TigerDB connection string
2. **Initialize Tables**: Run the initialization script
3. **Test Integrations**: Use the health check to verify
4. **Start Using**: Integrate components into your application

## Support

For issues:
- TigerDB: Check TimescaleDB documentation
- SwarmDB: See https://github.com/The-Swarm-Corporation/SwarmDB.git
- Swarms Tools: See https://github.com/The-Swarm-Corporation/swarms-tools.git

