from fastapi import APIRouter, Depends, HTTPException, Request
from app.core.security import get_current_user, AuthUser, require_moderator, log_activity
from app.core.database import get_db, Database
from app.repositories.endorsement_repository import EndorsementRepository
from app.schemas.endorsement import (
    EndorsementCreate,
    EndorsementUpdate,
    EndorsementResponse
)
from app.core.logging import get_logger

router = APIRouter(prefix="/endorsement", tags=["Endorsements"])
logger = get_logger(__name__)


@router.post("/create", response_model=EndorsementResponse)
async def create_endorsement(
    endorsement_data: EndorsementCreate,
    current_user: AuthUser = Depends(get_current_user),
    db: Database = Depends(get_db),
    request: Request = None
):
    """Create an endorsement for another user"""
    if endorsement_data.user_id == current_user.user_id:
        raise HTTPException(status_code=400, detail="Cannot endorse yourself")
    
    repo = EndorsementRepository(db)
    endorsement = await repo.create(
        user_id=endorsement_data.user_id,
        endorser_id=current_user.user_id,
        skill=endorsement_data.skill,
        message=endorsement_data.message
    )
    
    await log_activity(
        db,
        current_user.user_id,
        "endorsement.create",
        "endorsement",
        str(endorsement['id']),
        {"user_id": endorsement_data.user_id, "skill": endorsement_data.skill},
        request
    )
    
    return endorsement


@router.get("/received")
async def get_received_endorsements(
    status: str = None,
    current_user: AuthUser = Depends(get_current_user),
    db: Database = Depends(get_db)
):
    """Get endorsements received by current user"""
    repo = EndorsementRepository(db)
    endorsements = await repo.get_user_endorsements(current_user.user_id, status)
    return endorsements


@router.patch("/{endorsement_id}", response_model=EndorsementResponse)
async def update_endorsement(
    endorsement_id: str,
    update_data: EndorsementUpdate,
    current_user: AuthUser = Depends(require_moderator),
    db: Database = Depends(get_db),
    request: Request = None
):
    """Update endorsement status (moderator only)"""
    repo = EndorsementRepository(db)
    
    endorsement = await repo.get_by_id(endorsement_id)
    if not endorsement:
        raise HTTPException(status_code=404, detail="Endorsement not found")
    
    updated = await repo.update_status(
        endorsement_id,
        update_data.status,
        update_data.weight
    )
    
    await log_activity(
        db,
        current_user.user_id,
        "endorsement.update",
        "endorsement",
        endorsement_id,
        {"status": update_data.status},
        request
    )
    
    return updated


@router.delete("/{endorsement_id}")
async def delete_endorsement(
    endorsement_id: str,
    current_user: AuthUser = Depends(get_current_user),
    db: Database = Depends(get_db)
):
    """Delete an endorsement (creator or moderator only)"""
    repo = EndorsementRepository(db)
    
    endorsement = await repo.get_by_id(endorsement_id)
    if not endorsement:
        raise HTTPException(status_code=404, detail="Endorsement not found")
    
    if str(endorsement['endorser_id']) != current_user.user_id and not current_user.is_moderator():
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    await repo.delete(endorsement_id)
    
    return {"message": "Endorsement deleted"}
