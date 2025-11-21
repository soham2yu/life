from fastapi import APIRouter, Depends, HTTPException, Request
from ..core.security import get_current_user, AuthUser, log_activity
from ..core.database import get_db, Database
from ..services.cognitive_service import CognitiveService
from ..schemas.cognitive import CognitiveTestCreate, CognitiveTestResponse, CognitiveTestList
from ..core.logging import get_logger

router = APIRouter(prefix="/cognitive", tags=["Cognitive Tests"])
logger = get_logger(__name__)


@router.post("/test", response_model=CognitiveTestResponse)
async def create_cognitive_test(
    test_data: CognitiveTestSubmit,
    current_user: AuthUser = Depends(get_current_user),
    db: Database = Depends(get_db),
    request: Request = None
):
    """Create a new cognitive test"""
    service = CognitiveService(db)

    try:
        test = await service.create_test(current_user.user_id, test_data.dict())

        await log_activity(
            db,
            current_user.user_id,
            "cognitive.create",
            "cognitive_test",
            str(test['id']),
            {"score": float(test['score'])},
            request
        )

        return test
    except Exception as e:
        logger.error(f"Cognitive test creation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tests", response_model=CognitiveTestList)
async def get_cognitive_tests(
    limit: int = 10,
    current_user: AuthUser = Depends(get_current_user),
    db: Database = Depends(get_db)
):
    """Get user's cognitive test history"""
    service = CognitiveService(db)
    tests = await service.get_user_tests(current_user.user_id, limit)
    return {"tests": tests}


@router.get("/test/{test_id}", response_model=CognitiveTestResponse)
async def get_cognitive_test(
    test_id: int,
    current_user: AuthUser = Depends(get_current_user),
    db: Database = Depends(get_db)
):
    """Get specific cognitive test"""
    service = CognitiveService(db)
    test = await service.get_test(test_id, current_user.user_id)
    
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    return test
