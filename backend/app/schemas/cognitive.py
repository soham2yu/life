from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime


class CognitiveTestStart(BaseModel):
    test_type: str = Field(..., description="Type of cognitive test")


class CognitiveTestStartResponse(BaseModel):
    test_id: str
    test_type: str
    started_at: datetime


class CognitiveTestSubmit(BaseModel):
    test_id: str
    answers: Dict[str, Any]
    time_taken_seconds: int


class ScoreBreakdown(BaseModel):
    total_questions: int
    correct_answers: int
    accuracy_percentage: float
    speed_score: float
    difficulty_score: float
    time_taken: int


class CognitiveScoreResponse(BaseModel):
    id: str
    test_id: str
    user_id: str
    accuracy_score: float
    speed_score: float
    difficulty_score: float
    composite_score: float
    percentile: Optional[float] = None
    score_breakdown: Optional[Dict[str, Any]] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class CognitiveTestResponse(BaseModel):
    id: str
    user_id: str
    test_type: str
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    time_taken_seconds: Optional[int] = None
    score: Optional[CognitiveScoreResponse] = None
    
    class Config:
        from_attributes = True
