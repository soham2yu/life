from fastapi import APIRouter, Depends, HTTPException, Request
from ..core.security import get_current_user, AuthUser, log_activity
from ..core.database import get_db, Database
from ..services.endorsement_service import EndorsementService
from ..schemas.endorsement import EndorsementCreate, EndorsementResponse, EndorsementList
from ..core.logging import get_logger

router = APIRouter(prefix="/endorsement", tags=["Endorsements"])
logger = get_logger(__name__)


@router.post("/", response_model=EndorsementResponse)
async def create_endorsement(
    endorsement_data: EndorsementCreate,
    current_user: AuthUser = Depends(get_current_user),
    db: Database = Depends(get_db),
    request: Request = None
):
    """Create a new endorsement"""
    service = EndorsementService(db)
    
    try:
        endorsement = await service.create_endorsement(current_user.user_id, endorsement_data.dict())
        
        await log_activity(
            db,
            current_user.user_id,
            "endorsement.create",
            "endorsement",
            str(endorsement['id']),
            {"skill": endorsement['skill']},
            request
        )
        
        return endorsement
    except Exception as e:
        logger.error(f"Endorsement creation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=EndorsementList)
async def get_endorsements(
    limit: int = 10,
    current_user: AuthUser = Depends(get_current_user),
    db: Database = Depends(get_db)
):
    """Get user's endorsements"""
    service = EndorsementService(db)
    endorsements = await service.get_user_endorsements(current_user.user_id, limit)
    return {"endorsements": endorsements}


@router.get("/{endorsement_id}", response_model=EndorsementResponse)
async def get_endorsement(
    endorsement_id: int,
    current_user: AuthUser = Depends(get_current_user),
    db: Database = Depends(get_db)
):
    """Get specific endorsement"""
    service = EndorsementService(db)
    endorsement = await service.get_endorsement(endorsement_id, current_user.user_id)
    
    if not endorsement:
        raise HTTPException(status_code=404, detail="Endorsement not found")
    
    return endorsement


@router.put("/{endorsement_id}")
async def update_endorsement(
    endorsement_id: int,
    endorsement_data: EndorsementCreate,
    current_user: AuthUser = Depends(get_current_user),
    db: Database = Depends(get_db),
    request: Request = None
):
    """Update endorsement"""
    service = EndorsementService(db)
    
    try:
        endorsement = await service.update_endorsement(endorsement_id, current_user.user_id, endorsement_data.dict())
        
        await log_activity(
            db,
            current_user.user_id,
            "endorsement.update",
            "endorsement",
            str(endorsement_id),
            {"skill": endorsement['skill']},
            request
        )
        
        return endorsement
    except Exception as e:
        logger.error(f"Endorsement update failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{endorsement_id}")
async def delete_endorsement(
    endorsement_id: int,
    current_user: AuthUser = Depends(get_current_user),
    db: Database = Depends(get_db),
    request: Request = None
):
    """Delete endorsement"""
    service = EndorsementService(db)
    
    try:
        await service.delete_endorsement(endorsement_id, current_user.user_id)
        
        await log_activity(
            db,
            current_user.user_id,
            "endorsement.delete",
            "endorsement",
            str(endorsement_id),
            {},
            request
        )
        
        return {"message": "Endorsement deleted successfully"}
    except Exception as e:
        logger.error(f"Endorsement deletion failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
