from typing import List, Dict, Any
from ..repositories.endorsement_repository import EndorsementRepository
from ..core.database import Database
from ..core.logging import get_logger

logger = get_logger(__name__)


class EndorsementService:
    """Service for endorsement operations"""

    def __init__(self, db: Database):
        self.repo = EndorsementRepository(db)

    async def create_endorsement(self, endorser_id: str, endorsement_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new endorsement"""
        logger.info(f"Creating endorsement for user {endorsement_data['user_id']} by {endorser_id}")

        endorsement = await self.repo.create(
            user_id=endorsement_data['user_id'],
            endorser_id=endorser_id,
            skill=endorsement_data['skill'],
            message=endorsement_data.get('message')
        )

        return endorsement

    async def get_user_endorsements(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get endorsements for a user"""
        endorsements = await self.repo.get_user_endorsements(user_id)
        return endorsements[:limit] if limit else endorsements

    async def get_endorsement(self, endorsement_id: int, user_id: str) -> Dict[str, Any]:
        """Get specific endorsement"""
        endorsement = await self.repo.get_by_id(str(endorsement_id))

        if not endorsement or endorsement['user_id'] != user_id:
            return None

        return endorsement

    async def update_endorsement(self, endorsement_id: int, user_id: str, endorsement_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update endorsement"""
        # Check if endorsement exists and belongs to user
        existing = await self.repo.get_by_id(str(endorsement_id))
        if not existing or existing['user_id'] != user_id:
            raise ValueError("Endorsement not found or access denied")

        # Update status and weight
        status = endorsement_data.get('status', existing['status'])
        weight = endorsement_data.get('weight', existing['weight'])

        updated = await self.repo.update_status(str(endorsement_id), status, weight)
        return updated

    async def delete_endorsement(self, endorsement_id: int, user_id: str) -> None:
        """Delete endorsement"""
        # Check if endorsement exists and belongs to user
        existing = await self.repo.get_by_id(str(endorsement_id))
        if not existing or existing['user_id'] != user_id:
            raise ValueError("Endorsement not found or access denied")

        await self.repo.delete(str(endorsement_id))
