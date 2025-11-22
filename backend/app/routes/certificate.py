from fastapi import APIRouter, Depends, HTTPException, Request
from ..core.security import get_current_user, AuthUser, log_activity
from ..core.database import get_db, Database
from ..services.certificate_service import CertificateService
from ..schemas.certificate import CertificateCreateRequest, CertificateResponse, CertificateVerifyResponse
from ..core.logging import get_logger

router = APIRouter(prefix="/certificate", tags=["Certificates"])
logger = get_logger(__name__)


@router.post("/", response_model=CertificateResponse)
async def create_certificate(
    cert_data: CertificateCreateRequest,
    current_user: AuthUser = Depends(get_current_user),
    db: Database = Depends(get_db),
    request: Request = None
):
    """Create a new certificate"""
    service = CertificateService(db)
    
    try:
        certificate = await service.create_certificate(current_user.user_id, cert_data.dict())
        
        await log_activity(
            db,
            current_user.user_id,
            "certificate.create",
            "certificate",
            str(certificate['id']),
            {"title": certificate['title']},
            request
        )
        
        return certificate
    except Exception as e:
        logger.error(f"Certificate creation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def get_certificates(
    limit: int = 10,
    current_user: AuthUser = Depends(get_current_user),
    db: Database = Depends(get_db)
):
    """Get user's certificates"""
    service = CertificateService(db)
    certificates = await service.get_user_certificates(current_user.user_id, limit)
    return {"certificates": certificates}


@router.get("/{certificate_id}", response_model=CertificateResponse)
async def get_certificate(
    certificate_id: int,
    current_user: AuthUser = Depends(get_current_user),
    db: Database = Depends(get_db)
):
    """Get specific certificate"""
    service = CertificateService(db)
    certificate = await service.get_certificate(certificate_id, current_user.user_id)
    
    if not certificate:
        raise HTTPException(status_code=404, detail="Certificate not found")
    
    return certificate


@router.put("/{certificate_id}")
async def update_certificate(
    certificate_id: int,
    cert_data: CertificateCreateRequest,
    current_user: AuthUser = Depends(get_current_user),
    db: Database = Depends(get_db),
    request: Request = None
):
    """Update certificate"""
    service = CertificateService(db)
    
    try:
        certificate = await service.update_certificate(certificate_id, current_user.user_id, cert_data.dict())
        
        await log_activity(
            db,
            current_user.user_id,
            "certificate.update",
            "certificate",
            str(certificate_id),
            {"title": certificate['title']},
            request
        )
        
        return certificate
    except Exception as e:
        logger.error(f"Certificate update failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{certificate_id}")
async def delete_certificate(
    certificate_id: int,
    current_user: AuthUser = Depends(get_current_user),
    db: Database = Depends(get_db),
    request: Request = None
):
    """Delete certificate"""
    service = CertificateService(db)
    
    try:
        await service.delete_certificate(certificate_id, current_user.user_id)
        
        await log_activity(
            db,
            current_user.user_id,
            "certificate.delete",
            "certificate",
            str(certificate_id),
            {},
            request
        )
        
        return {"message": "Certificate deleted successfully"}
    except Exception as e:
        logger.error(f"Certificate deletion failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
