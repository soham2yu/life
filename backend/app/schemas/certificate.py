from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class CertificateCreateRequest(BaseModel):
    user_id: Optional[str] = None


class CertificateResponse(BaseModel):
    id: str
    user_id: str
    certificate_hash: str
    score: float
    issued_at: datetime
    expires_at: Optional[datetime] = None
    status: str
    metadata: Optional[Dict[str, Any]] = None
    blockchain_tx_hash: Optional[str] = None
    verification_url: str
    
    class Config:
        from_attributes = True


class CertificateVerifyResponse(BaseModel):
    valid: bool
    certificate: Optional[CertificateResponse] = None
    message: str
