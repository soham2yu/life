from typing import Dict, Any, Optional
from app.core.database import Database
from app.core.logging import get_logger
import json

logger = get_logger(__name__)


class LifeScoreRepository:
    """Repository for LifeScore operations"""
    
    def __init__(self, db: Database):
        self.db = db
    
    async def create_score(
        self,
        user_id: str,
        cognitive_score: Optional[float],
        portfolio_score: Optional[float],
        endorsement_score: Optional[float],
        composite_score: float,
        score_breakdown: Optional[Dict[str, Any]] = None
    ):
        """Create a LifeScore record"""
        query = """
            INSERT INTO lifescore_history
            (user_id, cognitive_score, portfolio_score, endorsement_score,
             composite_score, score_breakdown)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, user_id, cognitive_score, portfolio_score, endorsement_score,
                      composite_score, score_breakdown, rank, percentile, created_at
        """
        return await self.db.fetch_one(
            query,
            user_id,
            cognitive_score,
            portfolio_score,
            endorsement_score,
            composite_score,
            json.dumps(score_breakdown) if score_breakdown else None
        )
    
    async def get_latest_score(self, user_id: str):
        """Get the latest LifeScore for a user"""
        query = """
            SELECT id, user_id, cognitive_score, portfolio_score, endorsement_score,
                   composite_score, score_breakdown, rank, percentile, created_at
            FROM latest_lifescores
            WHERE user_id = $1
        """
        return await self.db.fetch_one(query, user_id)
    
    async def get_score_history(self, user_id: str, limit: int = 10):
        """Get LifeScore history for a user"""
        query = """
            SELECT id, user_id, cognitive_score, portfolio_score, endorsement_score,
                   composite_score, score_breakdown, rank, percentile, created_at
            FROM lifescore_history
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT $2
        """
        return await self.db.fetch_all(query, user_id, limit)
    
    async def update_rankings(self):
        """Update rankings for all users (run periodically)"""
        query = """
            WITH ranked_scores AS (
                SELECT 
                    id,
                    user_id,
                    composite_score,
                    ROW_NUMBER() OVER (ORDER BY composite_score DESC) as rank,
                    PERCENT_RANK() OVER (ORDER BY composite_score) * 100 as percentile
                FROM lifescore_history
                WHERE id IN (
                    SELECT DISTINCT ON (user_id) id
                    FROM lifescore_history
                    ORDER BY user_id, created_at DESC
                )
            )
            UPDATE lifescore_history ls
            SET rank = rs.rank,
                percentile = rs.percentile
            FROM ranked_scores rs
            WHERE ls.id = rs.id
        """
        await self.db.execute(query)
    
    async def get_leaderboard(self, limit: int = 100):
        """Get the global leaderboard"""
        query = """
            SELECT id, display_name, email, lifescore, cognitive_score,
                   portfolio_score, endorsement_score, rank, percentile
            FROM user_leaderboard
            LIMIT $1
        """
        return await self.db.fetch_all(query, limit)
