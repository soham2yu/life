from typing import Dict, Any
from app.repositories.cognitive_repository import CognitiveRepository
from app.core.database import Database
from app.core.logging import get_logger

logger = get_logger(__name__)


class CognitiveService:
    """Service for cognitive test business logic"""
    
    def __init__(self, db: Database):
        self.repo = CognitiveRepository(db)
    
    async def start_test(self, user_id: str, test_type: str):
        """Start a new cognitive test"""
        return await self.repo.create_test(user_id, test_type)
    
    async def submit_test(self, test_id: str, user_id: str, answers: Dict[str, Any], time_taken: int):
        """Submit test answers and calculate score"""
        test = await self.repo.get_test(test_id)
        
        if not test:
            raise ValueError("Test not found")
        
        if str(test['user_id']) != user_id:
            raise ValueError("Unauthorized")
        
        if test['status'] == 'completed':
            raise ValueError("Test already completed")
        
        raw_data = {
            "answers": answers,
            "time_taken": time_taken
        }
        
        await self.repo.complete_test(test_id, time_taken, raw_data)
        
        scores = self._calculate_scores(answers, time_taken, test['test_type'])
        
        score_record = await self.repo.create_score(
            user_id,
            test_id,
            scores['accuracy_score'],
            scores['speed_score'],
            scores['difficulty_score'],
            scores['composite_score'],
            scores['breakdown']
        )
        
        return score_record
    
    def _calculate_scores(self, answers: Dict[str, Any], time_taken: int, test_type: str) -> Dict[str, Any]:
        """Calculate cognitive test scores"""
        total_questions = len(answers)
        correct_answers = sum(1 for answer in answers.values() if answer.get('correct', False))
        
        accuracy_percentage = (correct_answers / total_questions * 100) if total_questions > 0 else 0
        
        expected_time = total_questions * 30
        speed_score = max(0, min(100, (expected_time / max(time_taken, 1)) * 100))
        
        difficulty_weights = {q_id: answer.get('difficulty', 1.0) for q_id, answer in answers.items()}
        weighted_correct = sum(
            difficulty_weights.get(q_id, 1.0)
            for q_id, answer in answers.items()
            if answer.get('correct', False)
        )
        total_weighted = sum(difficulty_weights.values())
        difficulty_score = (weighted_correct / total_weighted * 100) if total_weighted > 0 else 0
        
        composite_score = (
            accuracy_percentage * 0.5 +
            speed_score * 0.25 +
            difficulty_score * 0.25
        )
        
        return {
            'accuracy_score': round(accuracy_percentage, 2),
            'speed_score': round(speed_score, 2),
            'difficulty_score': round(difficulty_score, 2),
            'composite_score': round(composite_score, 2),
            'breakdown': {
                'total_questions': total_questions,
                'correct_answers': correct_answers,
                'accuracy_percentage': round(accuracy_percentage, 2),
                'time_taken': time_taken,
                'expected_time': expected_time
            }
        }
    
    async def get_score(self, test_id: str):
        """Get score for a specific test"""
        return await self.repo.get_score_by_test_id(test_id)
    
    async def get_user_scores(self, user_id: str, limit: int = 10):
        """Get all scores for a user"""
        return await self.repo.get_user_scores(user_id, limit)
