from typing import List, Dict, Optional
import asyncio
import os
from .hdam import initialize_hdam
from .file_processor import FileProcessor

class PolyMathOSLearningSystem:
    """Main integration point for PolyMathOS learning system"""
    
    def __init__(self, supabase_url: str = None, supabase_key: str = None):
        self.hdam = initialize_hdam(supabase_url, supabase_key)
        self.file_processor = FileProcessor(self.hdam)
        self.learning_paths = {}  # Store created learning paths
        
    async def onboard_user_with_files(self, user_interests: List[str], 
                                    uploaded_files: List[Dict]) -> Dict:
        """Onboard user with their uploaded files and interests"""
        # Process uploaded files
        processed_files = []
        for file_info in uploaded_files:
            result = await self.file_processor.process_file(
                file_content=file_info["content"],
                filename=file_info["filename"],
                domains=user_interests,  # Associate with user interests
                metadata=file_info.get("metadata", {})
            )
            processed_files.append(result)
        
        # Create learning associations
        associations = await self.create_learning_associations(user_interests)
        
        return {
            "processed_files": processed_files,
            "associations": associations,
            "status": "onboarding_complete"
        }
    
    async def create_learning_associations(self, domains: List[str]) -> Dict:
        """Create associations between user interests and learning resources"""
        associations = {}
        
        for domain in domains:
            # Find related resources for each domain
            resources = await self.hdam.find_related_resources(
                f"fundamentals of {domain}",
                domains=[domain],
                top_k=5
            )
            
            associations[domain] = {
                "resources": resources,
                "count": len(resources)
            }
        
        return associations
    
    async def recommend_learning_path(self, user_query: str, 
                                    preferred_domains: List[str] = None) -> Dict:
        """Recommend a personalized learning path"""
        # Find related resources
        resources = await self.hdam.find_related_resources(
            user_query,
            domains=preferred_domains
        )
        
        # Cross-domain reasoning
        # Fallback if hdam is not EnhancedHDAM or missing method, but initialize_hdam returns EnhancedHDAM
        if hasattr(self.hdam, 'cross_domain_reasoning'):
            domain_analysis = self.hdam.cross_domain_reasoning(
                user_query,
                preferred_domains or list(self.hdam.skill_networks.keys())
            )
        else:
            domain_analysis = {"best_domain": "general", "confidence": 0.0}
        
        # Create learning path
        learning_path = {
            "query": user_query,
            "recommended_domain": domain_analysis.get("best_domain"),
            "confidence": domain_analysis.get("confidence"),
            "resources": resources[:10],  # Top 10 resources
            "estimated_duration": len(resources[:10]) * 30,  # Minutes
            "created_at": "now"
        }
        
        # Store learning path
        path_id = f"path_{len(self.learning_paths) + 1}"
        self.learning_paths[path_id] = learning_path
        
        return {
            "path_id": path_id,
            "learning_path": learning_path
        }
    
    async def get_personalized_insights(self, user_id: str) -> Dict:
        """Generate personalized learning insights"""
        # This would integrate with user progress tracking
        # For now, return sample insights
        return {
            "strengths": ["mathematics", "problem_solving"],
            "areas_for_improvement": ["advanced_physics", "machine_learning_theory"],
            "recommended_next_steps": [
                "Explore quantum computing fundamentals",
                "Practice calculus applications",
                "Study neural network architectures"
            ],
            "estimated_completion_time": "4-6 weeks"
        }

# Example usage function
async def main():
    # Initialize the learning system
    learning_system = PolyMathOSLearningSystem(
        supabase_url=os.getenv("SUPABASE_URL"),
        supabase_key=os.getenv("SUPABASE_KEY")
    )
    
    # Simulate user onboarding with files
    user_files = [
        {
            "filename": "linear_algebra_notes.pdf",
            "content": b"PDF content bytes here...",
            "metadata": {"course": "Math 101", "semester": "Fall 2023"}
        },
        {
            "filename": "machine_learning_research.docx",
            "content": b"DOCX content bytes here...",
            "metadata": {"topic": "Neural Networks", "author": "Student"}
        }
    ]
    
    # Onboard user
    onboarding_result = await learning_system.onboard_user_with_files(
        user_interests=["mathematics", "computer_science", "physics"],
        uploaded_files=user_files
    )
    
    print("Onboarding Result:", onboarding_result)
    
    # Recommend learning path
    learning_path = await learning_system.recommend_learning_path(
        "I want to understand how linear algebra applies to machine learning"
    )
    
    print("Learning Path:", learning_path)

if __name__ == "__main__":
    asyncio.run(main())

