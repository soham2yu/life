from fastapi import APIRouter, Depends, HTTPException, Request
from ..core.security import get_current_user, AuthUser, log_activity
from ..core.database import get_db, Database
from ..services.portfolio_service import PortfolioService
from ..schemas.portfolio import GitHubAnalyzeRequest, PortfolioAnalysisResponse
from ..core.logging import get_logger

router = APIRouter(prefix="/portfolio", tags=["Portfolio"])
logger = get_logger(__name__)


@router.post("/analyze-github")
async def analyze_github_profile(
    request_data: GitHubAnalyzeRequest,
    current_user: AuthUser = Depends(get_current_user),
    db: Database = Depends(get_db),
    request: Request = None
):
    """Analyze GitHub profile and calculate portfolio score"""
    service = PortfolioService(db)
    
    try:
        result = await service.analyze_github(current_user.user_id, request_data.github_username)
        
        await log_activity(
            db,
            current_user.user_id,
            "portfolio.analyze_github",
            "portfolio_score",
            str(result['score']['id']),
            {"github_username": request_data.github_username},
            request
        )
        
        return result
    except Exception as e:
        logger.error(f"GitHub analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze GitHub profile: {str(e)}")


@router.get("/score")
async def get_portfolio_score(
    current_user: AuthUser = Depends(get_current_user),
    db: Database = Depends(get_db)
):
    """Get latest portfolio score for current user"""
    query = """
        SELECT id, user_id, repo_quality_score, activity_score, impact_score,
               composite_score, score_breakdown, created_at
        FROM latest_portfolio_scores
        WHERE user_id = $1
    """
    score = await db.fetch_one(query, current_user.user_id)
    
    if not score:
        raise HTTPException(status_code=404, detail="No portfolio score found")
    
    return score
