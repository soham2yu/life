from app.core.database import Database
from app.core.logging import get_logger

logger = get_logger(__name__)


class EndorsementRepository:
    """Repository for endorsement operations"""
    
    def __init__(self, db: Database):
        self.db = db
    
    async def create(
        self,
        user_id: str,
        endorser_id: str,
        skill: str,
        message: str = None
    ):
        """Create a new endorsement"""
        query = """
            INSERT INTO endorsements (user_id, endorser_id, skill, message)
            VALUES ($1, $2, $3, $4)
            RETURNING id, user_id, endorser_id, skill, message, status, weight, created_at, updated_at
        """
        return await self.db.fetch_one(query, user_id, endorser_id, skill, message)
    
    async def get_by_id(self, endorsement_id: str):
        """Get endorsement by ID"""
        query = """
            SELECT id, user_id, endorser_id, skill, message, status, weight, created_at, updated_at
            FROM endorsements
            WHERE id = $1
        """
        return await self.db.fetch_one(query, endorsement_id)
    
    async def get_user_endorsements(self, user_id: str, status: str = None):
        """Get endorsements for a user"""
        if status:
            query = """
                SELECT id, user_id, endorser_id, skill, message, status, weight, created_at
                FROM endorsements
                WHERE user_id = $1 AND status = $2
                ORDER BY created_at DESC
            """
            return await self.db.fetch_all(query, user_id, status)
        else:
            query = """
                SELECT id, user_id, endorser_id, skill, message, status, weight, created_at
                FROM endorsements
                WHERE user_id = $1
                ORDER BY created_at DESC
            """
            return await self.db.fetch_all(query, user_id)
    
    async def update_status(self, endorsement_id: str, status: str, weight: float = None):
        """Update endorsement status"""
        if weight is not None:
            query = """
                UPDATE endorsements
                SET status = $2, weight = $3, updated_at = NOW()
                WHERE id = $1
                RETURNING id, user_id, endorser_id, skill, status, weight, updated_at
            """
            return await self.db.fetch_one(query, endorsement_id, status, weight)
        else:
            query = """
                UPDATE endorsements
                SET status = $2, updated_at = NOW()
                WHERE id = $1
                RETURNING id, user_id, endorser_id, skill, status, weight, updated_at
            """
            return await self.db.fetch_one(query, endorsement_id, status)
    
    async def calculate_endorsement_score(self, user_id: str) -> float:
        """Calculate endorsement score for a user"""
        query = "SELECT calculate_endorsement_score($1)"
        result = await self.db.fetch_val(query, user_id)
        return float(result) if result else 0.0
    
    async def delete(self, endorsement_id: str):
        """Delete an endorsement"""
        query = "DELETE FROM endorsements WHERE id = $1"
        await self.db.execute(query, endorsement_id)
