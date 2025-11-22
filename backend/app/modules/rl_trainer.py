import random
from collections import deque

class ReinforcementLearningTrainer:
    """RL agent that optimizes learning strategies based on performance feedback"""
    
    def __init__(self, hdam_system=None):
        self.q_table = {}  # State-action value table
        self.learning_rate = 0.1
        self.discount_factor = 0.95
        self.epsilon = 0.1  # Exploration rate
        self.hdam = hdam_system
        self.performance_history = deque(maxlen=100)
        
    def get_learning_state(self, user_profile: dict, content_type: str) -> str:
        """Create a state representation for RL decision making"""
        proficiency = user_profile.get('proficiency', 0.5)
        engagement = user_profile.get('engagement', 0.5)
        time_spent = user_profile.get('time_spent', 0)
        
        # Discretize continuous values
        prof_level = int(proficiency * 5)  # 0-4 levels
        eng_level = int(engagement * 5)   # 0-4 levels
        time_level = min(int(time_spent / 30), 4)  # 0-4 levels (in 30-min blocks)
        
        return f"{content_type}_{prof_level}_{eng_level}_{time_level}"
    
    def select_training_action(self, state: str) -> str:
        """Select optimal training action using epsilon-greedy policy"""
        actions = ['flashcards', 'interactive_quiz', 'video_lecture', 
                  'hands_on_project', 'reading_assignment', 'discussion_forum']
        
        if random.random() < self.epsilon or state not in self.q_table:
            return random.choice(actions)
        
        # Select action with highest Q-value
        q_values = self.q_table[state]
        return max(q_values, key=q_values.get)
    
    def update_q_value(self, state: str, action: str, reward: float, next_state: str):
        """Update Q-table based on observed reward"""
        actions = ['flashcards', 'interactive_quiz', 'video_lecture', 
                 'hands_on_project', 'reading_assignment', 'discussion_forum']

        if state not in self.q_table:
            self.q_table[state] = {a: 0.0 for a in actions}
        
        if next_state not in self.q_table:
            self.q_table[next_state] = {a: 0.0 for a in actions}
        
        # Q-learning update rule
        old_value = self.q_table[state][action]
        next_max = max(self.q_table[next_state].values())
        new_value = old_value + self.learning_rate * (
            reward + self.discount_factor * next_max - old_value
        )
        self.q_table[state][action] = new_value
        
        self.performance_history.append(reward)

