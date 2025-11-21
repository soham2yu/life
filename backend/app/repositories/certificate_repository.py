from typing import Dict, Any, Optional
from ..core.database import Database
from ..core.logging import get_logger
import json
import hashlib
from datetime import datetime, timedelta

logger = get_logger(__name__)


class CertificateRepository:
    """Repository for certificate operations"""
    
    def __init__(self, db: Database):
        self.db = db
    
    def generate_certificate_hash(self, user_id: str, score: float, issued_at: datetime) -> str:
        """Generate a unique certificate hash"""
        data = f"{user_id}:{score}:{issued_at.isoformat()}"
        return hashlib.sha256(data.encode()).hexdigest()
    
    async def create_certificate(
        self,
        user_id: str,
        lifescore_id: Optional[str],
        score: float,
        metadata: Optional[Dict[str, Any]] = None,
        expires_in_days: Optional[int] = None
    ):
        """Create a new certificate"""
        issued_at = datetime.utcnow()
        certificate_hash = self.generate_certificate_hash(user_id, score, issued_at)
        expires_at = issued_at + timedelta(days=expires_in_days) if expires_in_days else None
        
        query = """
            INSERT INTO certificates
            (user_id, lifescore_id, certificate_hash, score, issued_at, expires_at, metadata)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, user_id, lifescore_id, certificate_hash, score, issued_at,
                      expires_at, status, metadata, blockchain_tx_hash, created_at
        """
        return await self.db.fetch_one(
            query,
            user_id,
            lifescore_id,
            certificate_hash,
            score,
            issued_at,
            expires_at,
            json.dumps(metadata) if metadata else None
        )
    
    async def get_by_id(self, certificate_id: str):
        """Get certificate by ID"""
        query = """
            SELECT id, user_id, lifescore_id, certificate_hash, score, issued_at,
                   expires_at, status, metadata, blockchain_tx_hash, created_at
            FROM certificates
            WHERE id = $1
        """
        return await self.db.fetch_one(query, certificate_id)
    
    async def get_by_hash(self, certificate_hash: str):
        """Get certificate by hash"""
        query = """
            SELECT id, user_id, lifescore_id, certificate_hash, score, issued_at,
                   expires_at, status, metadata, blockchain_tx_hash, created_at
            FROM certificates
            WHERE certificate_hash = $1
        """
        return await self.db.fetch_one(query, certificate_hash)
    
    async def get_user_certificates(self, user_id: str):
        """Get all certificates for a user"""
        query = """
            SELECT id, user_id, lifescore_id, certificate_hash, score, issued_at,
                   expires_at, status, metadata, blockchain_tx_hash, created_at
            FROM certificates
            WHERE user_id = $1
            ORDER BY issued_at DESC
        """
        return await self.db.fetch_all(query, user_id)
    
    async def revoke_certificate(self, certificate_id: str):
        """Revoke a certificate"""
        query = """
            UPDATE certificates
            SET status = 'revoked'
            WHERE id = $1
        """
        await self.db.execute(query, certificate_id)
    
    async def update_blockchain_hash(self, certificate_id: str, tx_hash: str):
        """Update certificate with blockchain transaction hash"""
        query = """
            UPDATE certificates
            SET blockchain_tx_hash = $2
            WHERE id = $1
        """
        await self.db.execute(query, certificate_id, tx_hash)
