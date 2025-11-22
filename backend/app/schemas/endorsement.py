from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class EndorsementCreate(BaseModel):
    user_id: str
    skill: str
    message: Optional[str] = None


class EndorsementUpdate(BaseModel):
    status: str
    weight: Optional[float] = None


class EndorsementResponse(BaseModel):
    id: str
    user_id: str
    endorser_id: str
    skill: str
    message: Optional[str] = None
    status: str
    weight: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EndorsementList(BaseModel):
    endorsements: List[EndorsementResponse]
