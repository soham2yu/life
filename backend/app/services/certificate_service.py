from typing import Optional
from app.repositories.certificate_repository import CertificateRepository
from app.repositories.lifescore_repository import LifeScoreRepository
from app.core.database import Database
from app.core.logging import get_logger
from app.config.settings import settings

logger = get_logger(__name__)


class CertificateService:
    """Service for certificate generation and verification"""
    
    def __init__(self, db: Database):
        self.cert_repo = CertificateRepository(db)
        self.lifescore_repo = LifeScoreRepository(db)
    
    async def create_certificate(self, user_id: str):
        """Create a certificate for a user based on their latest LifeScore"""
        logger.info(f"Creating certificate for user: {user_id}")
        
        lifescore = await self.lifescore_repo.get_latest_score(user_id)
        
        if not lifescore:
            raise ValueError("No LifeScore found for user")
        
        score = float(lifescore['composite_score'])
        
        metadata = {
            'cognitive_score': float(lifescore['cognitive_score']) if lifescore.get('cognitive_score') else None,
            'portfolio_score': float(lifescore['portfolio_score']) if lifescore.get('portfolio_score') else None,
            'endorsement_score': float(lifescore['endorsement_score']) if lifescore.get('endorsement_score') else None,
            'rank': lifescore.get('rank'),
            'percentile': float(lifescore['percentile']) if lifescore.get('percentile') else None,
            'issued_by': 'LifeScore Platform',
            'version': '1.0'
        }
        
        certificate = await self.cert_repo.create_certificate(
            user_id=user_id,
            lifescore_id=lifescore['id'],
            score=score,
            metadata=metadata,
            expires_in_days=365
        )
        
        return certificate
    
    async def get_certificate(self, certificate_id: str):
        """Get certificate by ID"""
        return await self.cert_repo.get_by_id(certificate_id)
    
    async def verify_certificate(self, certificate_hash: str):
        """Verify a certificate by its hash"""
        certificate = await self.cert_repo.get_by_hash(certificate_hash)
        
        if not certificate:
            return {
                'valid': False,
                'message': 'Certificate not found'
            }
        
        if certificate['status'] == 'revoked':
            return {
                'valid': False,
                'certificate': certificate,
                'message': 'Certificate has been revoked'
            }
        
        if certificate['status'] == 'expired':
            return {
                'valid': False,
                'certificate': certificate,
                'message': 'Certificate has expired'
            }
        
        return {
            'valid': True,
            'certificate': certificate,
            'message': 'Certificate is valid'
        }
    
    async def get_user_certificates(self, user_id: str):
        """Get all certificates for a user"""
        return await self.cert_repo.get_user_certificates(user_id)
    
    async def revoke_certificate(self, certificate_id: str):
        """Revoke a certificate"""
        await self.cert_repo.revoke_certificate(certificate_id)
    
    def get_verification_url(self, certificate_id: str) -> str:
        """Get public verification URL for a certificate"""
        base_url = settings.SUPABASE_URL or "https://lifescore.app"
        return f"{base_url}/api/v1/certificate/verify/{certificate_id}"
