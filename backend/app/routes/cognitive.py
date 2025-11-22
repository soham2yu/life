from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import get_current_user
from ..schemas.cognitive import CognitiveTestCreate, CognitiveTestSubmit, CognitiveTestResponse
from ..services.cognitive_service import CognitiveService
from pydantic import BaseModel
from typing import Dict, Any

class TestSubmission(BaseModel):
    test_id: str
    answers: Dict[str, Any]
    time_taken_seconds: int

router = APIRouter()

@router.post("/start", response_model=dict)
async def start_test(
    test_data: dict,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = CognitiveService(db)
    return service.start_test(current_user["uid"], test_data)

@router.post("/submit", response_model=dict)
async def submit_test(
    test_data: TestSubmission,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = CognitiveService(db)
    return service.submit_test(current_user["uid"], test_data.dict())
