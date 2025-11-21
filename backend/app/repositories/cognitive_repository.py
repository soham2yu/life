from typing import Optional, Dict, Any
from ..core.database import Database
from ..core.logging import get_logger
import json

logger = get_logger(__name__)


class CognitiveRepository:
    """Repository for cognitive test operations"""
    
    def __init__(self, db: Database):
        self.db = db
    
    async def create_test(self, user_id: str, test_type: str):
        """Create a new cognitive test"""
        query = """
            INSERT INTO cognitive_tests (user_id, test_type, status)
            VALUES ($1, $2, 'started')
            RETURNING id, user_id, test_type, status, started_at, created_at
        """
        return await self.db.fetch_one(query, user_id, test_type)
    
    async def get_test(self, test_id: str):
        """Get a test by ID"""
        query = """
            SELECT id, user_id, test_type, status, started_at, completed_at,
                   time_taken_seconds, raw_data, created_at
            FROM cognitive_tests
            WHERE id = $1
        """
        return await self.db.fetch_one(query, test_id)
    
    async def complete_test(self, test_id: str, time_taken: int, raw_data: Dict[str, Any]):
        """Mark test as completed"""
        query = """
            UPDATE cognitive_tests
            SET status = 'completed',
                completed_at = NOW(),
                time_taken_seconds = $2,
                raw_data = $3
            WHERE id = $1
            RETURNING id, user_id, test_type, status, completed_at, time_taken_seconds
        """
        return await self.db.fetch_one(query, test_id, time_taken, json.dumps(raw_data))
    
    async def create_score(
        self,
        user_id: str,
        test_id: str,
        accuracy_score: float,
        speed_score: float,
        difficulty_score: float,
        composite_score: float,
        score_breakdown: Optional[Dict[str, Any]] = None
    ):
        """Create a cognitive score"""
        query = """
            INSERT INTO cognitive_scores 
            (user_id, test_id, accuracy_score, speed_score, difficulty_score, 
             composite_score, score_breakdown)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, user_id, test_id, accuracy_score, speed_score, 
                      difficulty_score, composite_score, percentile, score_breakdown, created_at
        """
        return await self.db.fetch_one(
            query,
            user_id,
            test_id,
            accuracy_score,
            speed_score,
            difficulty_score,
            composite_score,
            json.dumps(score_breakdown) if score_breakdown else None
        )
    
    async def get_score_by_test_id(self, test_id: str):
        """Get score for a specific test"""
        query = """
            SELECT id, user_id, test_id, accuracy_score, speed_score, difficulty_score,
                   composite_score, percentile, score_breakdown, created_at
            FROM cognitive_scores
            WHERE test_id = $1
        """
        return await self.db.fetch_one(query, test_id)
    
    async def get_user_scores(self, user_id: str, limit: int = 10):
        """Get all scores for a user"""
        query = """
            SELECT cs.id, cs.user_id, cs.test_id, cs.accuracy_score, cs.speed_score,
                   cs.difficulty_score, cs.composite_score, cs.percentile, 
                   cs.score_breakdown, cs.created_at, ct.test_type
            FROM cognitive_scores cs
            JOIN cognitive_tests ct ON cs.test_id = ct.id
            WHERE cs.user_id = $1
            ORDER BY cs.created_at DESC
            LIMIT $2
        """
        return await self.db.fetch_all(query, user_id, limit)
    
    async def get_latest_score(self, user_id: str):
        """Get the latest cognitive score for a user"""
        query = """
            SELECT composite_score
            FROM latest_cognitive_scores
            WHERE user_id = $1
        """
        result = await self.db.fetch_one(query, user_id)
        return result['composite_score'] if result else None
