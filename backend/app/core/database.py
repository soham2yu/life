import asyncpg
from typing import Optional
from contextlib import asynccontextmanager
from app.config.settings import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class Database:
    """Database connection manager using asyncpg"""
    
    def __init__(self):
        self.pool: Optional[asyncpg.Pool] = None
    
    async def connect(self):
        """Create database connection pool"""
        if not settings.DATABASE_URL:
            logger.warning("DATABASE_URL not set, database operations will fail")
            return
        
        try:
            self.pool = await asyncpg.create_pool(
                settings.DATABASE_URL,
                min_size=5,
                max_size=settings.DB_POOL_SIZE,
                max_inactive_connection_lifetime=300,
            )
            logger.info("Database pool created successfully")
        except Exception as e:
            logger.error(f"Failed to create database pool: {e}")
            raise
    
    async def disconnect(self):
        """Close database connection pool"""
        if self.pool:
            await self.pool.close()
            logger.info("Database pool closed")
    
    @asynccontextmanager
    async def get_connection(self):
        """Get a database connection from the pool"""
        if not self.pool:
            raise RuntimeError("Database pool not initialized")
        
        async with self.pool.acquire() as connection:
            yield connection
    
    async def execute(self, query: str, *args):
        """Execute a query without returning results"""
        async with self.get_connection() as conn:
            return await conn.execute(query, *args)
    
    async def fetch_one(self, query: str, *args):
        """Fetch a single row as dict"""
        async with self.get_connection() as conn:
            row = await conn.fetchrow(query, *args)
            return dict(row) if row else None
    
    async def fetch_all(self, query: str, *args):
        """Fetch all rows as list of dicts"""
        async with self.get_connection() as conn:
            rows = await conn.fetch(query, *args)
            return [dict(row) for row in rows]
    
    async def fetch_val(self, query: str, *args):
        """Fetch a single value"""
        async with self.get_connection() as conn:
            return await conn.fetchval(query, *args)


# Global database instance
db = Database()


async def get_db() -> Database:
    """Dependency for getting database instance"""
    return db
