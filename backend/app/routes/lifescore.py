from fastapi import APIRouter, Depends, HTTPException, Request
from app.core.security import get_current_user, AuthUser, log_activity
from app.core.database import get_db, Database
from app.services.lifescore_service import LifeScoreService
from app.schemas.lifescore import LifeScoreResponse, LifeScoreHistoryResponse
from app.core.logging import get_logger

router = APIRouter(prefix="/lifescore", tags=["LifeScore"])
logger = get_logger(__name__)


@router.post("/calculate", response_model=LifeScoreResponse)
async def calculate_lifescore(
    current_user: AuthUser = Depends(get_current_user),
    db: Database = Depends(get_db),
    request: Request = None
):
    """Calculate composite LifeScore for current user"""
    service = LifeScoreService(db)
    
    try:
        lifescore = await service.calculate_lifescore(current_user.user_id)
        
        await log_activity(
            db,
            current_user.user_id,
            "lifescore.calculate",
            "lifescore",
            str(lifescore['id']),
            {"score": float(lifescore['composite_score'])},
            request
        )
        
        return lifescore
    except Exception as e:
        logger.error(f"LifeScore calculation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/current", response_model=LifeScoreResponse)
async def get_current_lifescore(
    current_user: AuthUser = Depends(get_current_user),
    db: Database = Depends(get_db)
):
    """Get current LifeScore for user"""
    service = LifeScoreService(db)
    lifescore = await service.get_lifescore(current_user.user_id)
    
    if not lifescore:
        raise HTTPException(status_code=404, detail="No LifeScore found. Please calculate first.")
    
    return lifescore


@router.get("/history", response_model=LifeScoreHistoryResponse)
async def get_lifescore_history(
    limit: int = 10,
    current_user: AuthUser = Depends(get_current_user),
    db: Database = Depends(get_db)
):
    """Get LifeScore history with growth metrics"""
    service = LifeScoreService(db)
    history = await service.get_history(current_user.user_id, limit)
    return history


@router.get("/leaderboard")
async def get_leaderboard(
    limit: int = 100,
    db: Database = Depends(get_db)
):
    """Get global LifeScore leaderboard (public)"""
    service = LifeScoreService(db)
    leaderboard = await service.get_leaderboard(limit)
    return leaderboard
