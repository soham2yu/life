from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class LifeScoreCalculateRequest(BaseModel):
    user_id: Optional[str] = None


class LifeScoreResponse(BaseModel):
    id: str
    user_id: str
    cognitive_score: Optional[float] = None
    portfolio_score: Optional[float] = None
    endorsement_score: Optional[float] = None
    composite_score: float
    score_breakdown: Optional[Dict[str, Any]] = None
    rank: Optional[int] = None
    percentile: Optional[float] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class LifeScoreHistoryResponse(BaseModel):
    scores: list[LifeScoreResponse]
    growth_metrics: Dict[str, Any]


class UserStatsResponse(BaseModel):
    total_tests: int
    avg_cognitive_score: float
    latest_portfolio_score: Optional[float] = None
    total_endorsements: int
    current_lifescore: Optional[float] = None
