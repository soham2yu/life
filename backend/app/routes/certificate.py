from fastapi import APIRouter, Depends, HTTPException, Request, Path
from app.core.security import get_current_user, AuthUser, log_activity
from app.core.database import get_db, Database
from app.services.certificate_service import CertificateService
from app.schemas.certificate import CertificateResponse, CertificateVerifyResponse
from app.core.logging import get_logger

router = APIRouter(prefix="/certificate", tags=["Certificates"])
logger = get_logger(__name__)


@router.post("/create", response_model=CertificateResponse)
async def create_certificate(
    current_user: AuthUser = Depends(get_current_user),
    db: Database = Depends(get_db),
    request: Request = None
):
    """Create a certificate based on current LifeScore"""
    service = CertificateService(db)
    
    try:
        certificate = await service.create_certificate(current_user.user_id)
        
        cert_response = dict(certificate)
        cert_response['verification_url'] = service.get_verification_url(str(certificate['id']))
        
        await log_activity(
            db,
            current_user.user_id,
            "certificate.create",
            "certificate",
            str(certificate['id']),
            {"score": float(certificate['score'])},
            request
        )
        
        return cert_response
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{certificate_id}", response_model=CertificateResponse)
async def get_certificate(
    certificate_id: str = Path(..., description="Certificate ID"),
    db: Database = Depends(get_db)
):
    """Get certificate by ID (public endpoint)"""
    service = CertificateService(db)
    certificate = await service.get_certificate(certificate_id)
    
    if not certificate:
        raise HTTPException(status_code=404, detail="Certificate not found")
    
    cert_response = dict(certificate)
    cert_response['verification_url'] = service.get_verification_url(certificate_id)
    
    return cert_response


@router.get("/verify/{certificate_hash}", response_model=CertificateVerifyResponse)
async def verify_certificate(
    certificate_hash: str = Path(..., description="Certificate hash"),
    db: Database = Depends(get_db)
):
    """Verify certificate by hash (public endpoint)"""
    service = CertificateService(db)
    result = await service.verify_certificate(certificate_hash)
    
    if result.get('certificate'):
        result['certificate']['verification_url'] = service.get_verification_url(
            str(result['certificate']['id'])
        )
    
    return result


@router.get("/user/all")
async def get_user_certificates(
    current_user: AuthUser = Depends(get_current_user),
    db: Database = Depends(get_db)
):
    """Get all certificates for current user"""
    service = CertificateService(db)
    certificates = await service.get_user_certificates(current_user.user_id)
    
    for cert in certificates:
        cert['verification_url'] = service.get_verification_url(str(cert['id']))
    
    return certificates
