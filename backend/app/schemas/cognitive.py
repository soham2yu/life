from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class CognitiveTestBase(BaseModel):
    score: float
    details: dict


class CognitiveTestCreate(CognitiveTestBase):
    pass


class CognitiveTestSubmit(BaseModel):
    score: float
    details: dict


class CognitiveTestResponse(CognitiveTestBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime


class CognitiveTestList(BaseModel):
    tests: List[CognitiveTestResponse]
