from fastapi import APIRouter, Depends, HTTPException, Request
from app.core.security import get_current_user, AuthUser, log_activity
from app.core.database import get_db, Database
from app.services.cognitive_service import CognitiveService
from app.schemas.cognitive import (
    CognitiveTestStart,
    CognitiveTestStartResponse,
    CognitiveTestSubmit,
    CognitiveScoreResponse
)
from app.core.logging import get_logger

router = APIRouter(prefix="/cognitive", tags=["Cognitive Tests"])
logger = get_logger(__name__)


@router.post("/start", response_model=CognitiveTestStartResponse)
async def start_test(
    test_data: CognitiveTestStart,
    current_user: AuthUser = Depends(get_current_user),
    db: Database = Depends(get_db),
    request: Request = None
):
    """Start a new cognitive test"""
    service = CognitiveService(db)
    test = await service.start_test(current_user.user_id, test_data.test_type)
    
    await log_activity(
        db,
        current_user.user_id,
        "cognitive.start_test",
        "cognitive_test",
        str(test['id']),
        {"test_type": test_data.test_type},
        request
    )
    
    return test


@router.post("/submit", response_model=CognitiveScoreResponse)
async def submit_test(
    submission: CognitiveTestSubmit,
    current_user: AuthUser = Depends(get_current_user),
    db: Database = Depends(get_db),
    request: Request = None
):
    """Submit cognitive test answers and get score"""
    service = CognitiveService(db)
    
    try:
        score = await service.submit_test(
            submission.test_id,
            current_user.user_id,
            submission.answers,
            submission.time_taken_seconds
        )
        
        await log_activity(
            db,
            current_user.user_id,
            "cognitive.submit_test",
            "cognitive_score",
            str(score['id']),
            {"test_id": submission.test_id, "score": float(score['composite_score'])},
            request
        )
        
        return score
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/score/{test_id}", response_model=CognitiveScoreResponse)
async def get_test_score(
    test_id: str,
    current_user: AuthUser = Depends(get_current_user),
    db: Database = Depends(get_db)
):
    """Get score for a specific test"""
    service = CognitiveService(db)
    score = await service.get_score(test_id)
    
    if not score:
        raise HTTPException(status_code=404, detail="Score not found")
    
    if str(score['user_id']) != current_user.user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    return score


@router.get("/scores")
async def get_user_scores(
    limit: int = 10,
    current_user: AuthUser = Depends(get_current_user),
    db: Database = Depends(get_db)
):
    """Get all cognitive scores for current user"""
    service = CognitiveService(db)
    scores = await service.get_user_scores(current_user.user_id, limit)
    return scores
