# TigerDB Schema Verification

## Complete Table List

The TigerDB schema includes **34 tables** covering all PolyMathOS functionality:

### Core Application Tables (10)
1. `users` - User accounts
2. `tasks` - Task management
3. `learning_sessions` - Learning session tracking (hypertable)
4. `rpe_events` - Reward Prediction Error events (hypertable)
5. `spaced_repetition_items` - Spaced repetition cards
6. `executions` - Agent execution tracking (hypertable)
7. `agent_evolution` - Agent evolution history
8. `user_analytics` - User analytics (hypertable)
9. `artifacts` - Artifact storage
10. `embeddings` - Vector embeddings (pgvector)

### Quiz System Tables (3)
11. `quizzes` - Quiz definitions
12. `quiz_sessions` - Quiz session tracking (hypertable)
13. `quiz_questions` - Quiz question pool

### FSRS Spaced Repetition Tables (2)
14. `fsrs_cards` - FSRS spaced repetition cards
15. `fsrs_reviews` - FSRS review history (hypertable)

### Zettelkasten Knowledge Graph Tables (3)
16. `zettel_notes` - Zettelkasten notes
17. `note_embeddings` - Note embeddings (pgvector)
18. `elaboration_sessions` - Elaboration sessions

### Memory Palace Tables (2)
19. `memory_palaces` - Memory palace definitions
20. `palace_reviews` - Palace review sessions (hypertable)

### Feynman Technique Tables (2)
21. `feynman_sessions` - Feynman technique sessions
22. `feynman_iterations` - Feynman iterations

### Learning Plans Tables (2)
23. `learning_plans` - Learning plan definitions
24. `learning_progress` - Learning progress tracking (hypertable)

### Comprehension Metrics (1)
25. `comprehension_metrics` - Comprehension metrics over time (hypertable)

### Swarm Corporation Integration Tables (6)
26. `swarm_conversations` - SwarmShield encrypted conversations
27. `document_metadata` - Document metadata (doc-master, OmniParse)
28. `research_papers` - Research papers (Research-Paper-Hive)
29. `rag_vectors` - RAG vectors (AgentRAGProtocol, Multi-Agent-RAG)
30. `workflow_definitions` - Zero workflow definitions
31. `custom_swarm_specs` - Custom swarm specifications

### Dynamic Workflow Tables (3)
32. `workflow_executions` - Workflow execution tracking (hypertable)
33. `workflow_adaptations` - Workflow adaptation history (hypertable)
34. `workflow_progress` - Workflow progress tracking (hypertable)

## Extensions Required

- `vector` - pgvector extension for vector similarity search
- `timescaledb` - TimescaleDB extension for time-series optimization

## Hypertables (Time-Series Optimized)

The following tables are configured as TimescaleDB hypertables for optimal time-series performance:

1. `learning_sessions`
2. `rpe_events`
3. `executions`
4. `user_analytics`
5. `quiz_sessions`
6. `fsrs_reviews`
7. `palace_reviews`
8. `learning_progress`
9. `comprehension_metrics`
10. `workflow_executions`
11. `workflow_adaptations`
12. `workflow_progress`

## Continuous Aggregates

- `daily_comprehension_summary` - Daily comprehension metrics
- `weekly_progress_summary` - Weekly learning progress

## Verification

Run the verification script:

```python
from app.core.tigerdb_init import TigerDBInitializer

initializer = TigerDBInitializer()
verification = initializer.verify_tables()

print(f"Tables: {verification['existing']}/{verification['total_required']} exist")
if verification['missing_tables']:
    print(f"Missing: {verification['missing_tables']}")
```

## Environment Variables Required

See `backend/env.example` for complete environment variable configuration.

**Required:**
- `DATABASE_URL` or `TIGERDB_URL` - Database connection string
- `SUPABASE_URL` - Supabase project URL (for HDAM)
- `SUPABASE_KEY` - Supabase anon key (for HDAM)

**Recommended:**
- `OPENAI_API_KEY` - For LLM functionality
- At least one other LLM API key (Anthropic, Google, Groq, NVIDIA)

**Optional:**
- Quantum computing keys (D-Wave, IBM)
- SwarmDB, Zero, OmniDB configurations
- n8n integration settings

## Schema Status

✅ **Complete** - All 34 tables defined
✅ **Hypertables** - 12 time-series tables optimized
✅ **Indexes** - All tables properly indexed
✅ **Extensions** - pgvector and timescaledb enabled
✅ **Workflows** - Dynamic workflow tables included
✅ **Swarm Integration** - All Swarm Corporation tables included

