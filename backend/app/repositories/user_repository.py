from typing import Optional, List
from uuid import UUID
from app.core.database import Database
from app.core.logging import get_logger

logger = get_logger(__name__)


class UserRepository:
    """Repository for user-related database operations"""
    
    def __init__(self, db: Database):
        self.db = db
    
    async def get_by_id(self, user_id: str):
        """Get user by ID"""
        query = """
            SELECT id, firebase_uid, email, display_name, role, is_active, is_banned,
                   created_at, updated_at, last_login
            FROM users
            WHERE id = $1
        """
        return await self.db.fetch_one(query, user_id)
    
    async def get_by_firebase_uid(self, firebase_uid: str):
        """Get user by Firebase UID"""
        query = """
            SELECT id, firebase_uid, email, display_name, role, is_active, is_banned,
                   created_at, updated_at, last_login
            FROM users
            WHERE firebase_uid = $1
        """
        return await self.db.fetch_one(query, firebase_uid)
    
    async def get_by_email(self, email: str):
        """Get user by email"""
        query = """
            SELECT id, firebase_uid, email, display_name, role, is_active, is_banned,
                   created_at, updated_at, last_login
            FROM users
            WHERE email = $1
        """
        return await self.db.fetch_one(query, email)
    
    async def create(self, firebase_uid: str, email: str, display_name: Optional[str] = None):
        """Create a new user"""
        query = """
            INSERT INTO users (firebase_uid, email, display_name)
            VALUES ($1, $2, $3)
            RETURNING id, firebase_uid, email, display_name, role, is_active, created_at
        """
        return await self.db.fetch_one(query, firebase_uid, email, display_name)
    
    async def update(self, user_id: str, **kwargs):
        """Update user fields"""
        fields = []
        values = []
        idx = 1
        
        for key, value in kwargs.items():
            if value is not None:
                fields.append(f"{key} = ${idx}")
                values.append(value)
                idx += 1
        
        if not fields:
            return await self.get_by_id(user_id)
        
        values.append(user_id)
        query = f"""
            UPDATE users
            SET {', '.join(fields)}
            WHERE id = ${idx}
            RETURNING id, firebase_uid, email, display_name, role, is_active, updated_at
        """
        return await self.db.fetch_one(query, *values)
    
    async def get_all(self, limit: int = 100, offset: int = 0):
        """Get all users with pagination"""
        query = """
            SELECT id, firebase_uid, email, display_name, role, is_active, is_banned,
                   created_at, last_login
            FROM users
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2
        """
        return await self.db.fetch_all(query, limit, offset)
    
    async def ban_user(self, user_id: str):
        """Ban a user"""
        query = "UPDATE users SET is_banned = TRUE WHERE id = $1"
        await self.db.execute(query, user_id)
    
    async def delete(self, user_id: str):
        """Delete a user"""
        query = "DELETE FROM users WHERE id = $1"
        await self.db.execute(query, user_id)
