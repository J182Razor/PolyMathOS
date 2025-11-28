import os
import sys
import json
import uuid
from datetime import datetime

# Add backend directory to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.core.enhanced_system import genius_system

def test_persistence():
    print("Testing Learning Persistence...")
    
    if not genius_system.database.available:
        print("Database not available. Skipping tests.")
        return

    # 1. Test Quiz Persistence
    print("\n1. Testing Quiz Persistence")
    quiz_id = str(uuid.uuid4())
    quiz_data = {
        "id": quiz_id,
        "topic": "Test Topic",
        "questions": [{"id": "q1", "question": "Test?"}],
        "bloom_distribution": {"remember": 1.0},
        "adaptive_difficulty": True,
        "fsrs_integration": False,
        "created_at": datetime.now()
    }
    
    if genius_system.database.save_quiz(quiz_data):
        print("  - save_quiz: SUCCESS")
    else:
        print("  - save_quiz: FAILED")
        
    loaded_quiz = genius_system.database.get_quiz(quiz_id)
    if loaded_quiz and loaded_quiz['id'] == quiz_id:
        print("  - get_quiz: SUCCESS")
    else:
        print("  - get_quiz: FAILED")

    # 2. Test Feynman Persistence
    print("\n2. Testing Feynman Persistence")
    session_id = str(uuid.uuid4())
    session_data = {
        "id": session_id,
        "concept": "Test Concept",
        "topic": "Test Topic",
        "target_audience": "child",
        "iterations": [{"explanation": "Simple explanation"}],
        "status": "active",
        "created_at": datetime.now()
    }
    
    if genius_system.database.save_feynman_session(session_data):
        print("  - save_feynman_session: SUCCESS")
    else:
        print("  - save_feynman_session: FAILED")
        
    loaded_session = genius_system.database.get_feynman_session(session_id)
    if loaded_session and loaded_session['id'] == session_id:
        print("  - get_feynman_session: SUCCESS")
    else:
        print("  - get_feynman_session: FAILED")

    # 3. Test Memory Palace Persistence
    print("\n3. Testing Memory Palace Persistence")
    palace_id = str(uuid.uuid4())
    palace_data = {
        "id": palace_id,
        "name": "Test Palace",
        "template": "home",
        "user_id": "test_user",
        "description": "A test palace",
        "loci": [{"id": "l1", "name": "Door"}],
        "journey": ["l1"],
        "review_count": 0,
        "retention_rate": 0.0,
        "created_at": datetime.now()
    }
    
    if genius_system.database.save_memory_palace(palace_data):
        print("  - save_memory_palace: SUCCESS")
    else:
        print("  - save_memory_palace: FAILED")
        
    loaded_palace = genius_system.database.get_memory_palace(palace_id)
    if loaded_palace and loaded_palace['id'] == palace_id:
        print("  - get_memory_palace: SUCCESS")
    else:
        print("  - get_memory_palace: FAILED")

if __name__ == "__main__":
    test_persistence()
