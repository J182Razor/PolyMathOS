from .modules.researcher import ScholarlyResearcher
from .modules.rl_trainer import ReinforcementLearningTrainer
from .modules.hdam import HDAM
from .modules.curriculum import CurriculumGenerator

class PolyMathOS:
    """Main PolyMathOS system integrating all components"""
    
    def __init__(self):
        print("🚀 Initializing PolyMathOS - The Ultimate Learning Acceleration System")
        self.hdam = HDAM()  # Your existing HDAM system
        self.researcher = ScholarlyResearcher()
        self.rl_trainer = ReinforcementLearningTrainer(self.hdam)
        self.curriculum_gen = CurriculumGenerator(self.hdam, self.researcher, self.rl_trainer)
        self.active_sessions = {}
        
    def enroll_user(self, user_id: str, interests: list) -> dict:
        """Enroll a new user and generate initial learning path"""
        print(f"👤 Enrolling user: {user_id}")
        
        # Generate personalized learning path
        learning_path = self.curriculum_gen.create_learning_path(user_id, interests)
        
        self.active_sessions[user_id] = {
            'learning_path': learning_path,
            'current_module': 0,
            'current_lesson': 0,
            'progress': 0.0,
            'performance_metrics': []
        }
        
        return learning_path
    
    def get_next_activity(self, user_id: str) -> dict:
        """Get next recommended learning activity for user"""
        if user_id not in self.active_sessions:
            raise ValueError("User not enrolled in PolyMathOS")
        
        session = self.active_sessions[user_id]
        current_module_idx = session['current_module']
        module = session['learning_path']['modules'][current_module_idx]
        
        # Get user profile for RL decision
        user_profile = self.curriculum_gen.user_profiles[user_id]
        state = self.rl_trainer.get_learning_state(user_profile, module['skill'])
        action = self.rl_trainer.select_training_action(state)
        
        activity = {
            'type': action,
            'module': module['skill'],
            'content': self._get_content_for_action(action, module),
            'estimated_duration': self._get_duration_for_action(action),
            'state': state
        }
        
        return activity
    
    def _get_content_for_action(self, action: str, module: dict) -> dict:
        """Retrieve appropriate content for learning action"""
        if action == 'flashcards':
            return {'cards': [{'front': concept, 'back': 'Definition'} 
                            for concept in module['lessons'][0]['key_concepts']]}
        elif action == 'interactive_quiz':
            return {'questions': module['quizzes']}
        elif action == 'video_lecture':
            return {'topic': module['skill'], 'duration': 30}
        elif action == 'hands_on_project':
            return {'project': module['projects'][0]}
        elif action == 'reading_assignment':
            return {'text': module['lessons'][0]['content'][:500]}
        elif action == 'discussion_forum':
            return {'topic': f"Discussion on {module['skill']}", 'participants': 5}
        else:
            return {'message': 'Default learning activity'}
    
    def _get_duration_for_action(self, action: str) -> int:
        """Estimate duration for learning activity"""
        durations = {
            'flashcards': 15,
            'interactive_quiz': 20,
            'video_lecture': 30,
            'hands_on_project': 120,
            'reading_assignment': 45,
            'discussion_forum': 30
        }
        return durations.get(action, 30)
    
    def record_performance(self, user_id: str, activity_state: str, 
                          action: str, performance_score: float):
        """Record user performance for RL optimization"""
        # Calculate reward (could be more sophisticated)
        reward = performance_score * 2 - 1  # Scale to [-1, 1]
        
        # Update RL trainer
        next_state = activity_state  # Simplified for demo
        self.rl_trainer.update_q_value(activity_state, action, reward, next_state)
        
        # Update user profile
        if user_id in self.curriculum_gen.user_profiles:
            profile = self.curriculum_gen.user_profiles[user_id]
            profile['proficiency'] = min(1.0, profile['proficiency'] + 0.05 * performance_score)
            profile['time_spent'] += self._get_duration_for_action(action)
    
    def get_progress_report(self, user_id: str) -> dict:
        """Generate progress report for user"""
        if user_id not in self.active_sessions:
            return {"error": "User not found"}
        
        session = self.active_sessions[user_id]
        profile = self.curriculum_gen.user_profiles[user_id]
        
        return {
            'user_id': user_id,
            'overall_progress': session['progress'],
            'skills_mastered': len([m for m in session['learning_path']['modules'] 
                                  if m.get('completed', False)]),
            'total_modules': len(session['learning_path']['modules']),
            'current_proficiency': profile['proficiency'],
            'time_invested': profile['time_spent'],
            'recommended_next_steps': self._get_recommendations(user_id)
        }
    
    def _get_recommendations(self, user_id: str) -> list:
        """Generate learning recommendations"""
        session = self.active_sessions[user_id]
        current_module = session['current_module']
        modules = session['learning_path']['modules']
        
        if current_module < len(modules) - 1:
            next_module = modules[current_module + 1]
            return [f"Continue to {next_module['skill']} module"]
        else:
            return ["Explore advanced topics in your mastered skills"]

