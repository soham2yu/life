from typing import Optional, Dict, Any
from app.repositories.lifescore_repository import LifeScoreRepository
from app.repositories.cognitive_repository import CognitiveRepository
from app.repositories.portfolio_repository import PortfolioRepository
from app.repositories.endorsement_repository import EndorsementRepository
from app.core.database import Database
from app.core.logging import get_logger

logger = get_logger(__name__)


class LifeScoreService:
    """Service for LifeScore calculation"""
    
    def __init__(self, db: Database):
        self.lifescore_repo = LifeScoreRepository(db)
        self.cognitive_repo = CognitiveRepository(db)
        self.portfolio_repo = PortfolioRepository(db)
        self.endorsement_repo = EndorsementRepository(db)
    
    async def calculate_lifescore(self, user_id: str):
        """Calculate composite LifeScore for a user"""
        logger.info(f"Calculating LifeScore for user: {user_id}")
        
        cognitive_score = await self.cognitive_repo.get_latest_score(user_id)
        portfolio_score = await self.portfolio_repo.get_latest_score(user_id)
        endorsement_score = await self.endorsement_repo.calculate_endorsement_score(user_id)
        
        weights = {
            'cognitive': 0.50,
            'portfolio': 0.30,
            'endorsement': 0.20
        }
        
        composite_score = 0.0
        score_components = {}
        
        if cognitive_score is not None:
            composite_score += float(cognitive_score) * weights['cognitive']
            score_components['cognitive'] = float(cognitive_score)
        
        if portfolio_score is not None:
            composite_score += float(portfolio_score) * weights['portfolio']
            score_components['portfolio'] = float(portfolio_score)
        
        if endorsement_score is not None:
            composite_score += float(endorsement_score) * weights['endorsement']
            score_components['endorsement'] = float(endorsement_score)
        
        score_breakdown = {
            'weights': weights,
            'components': score_components,
            'composite_calculation': {
                'cognitive_contribution': score_components.get('cognitive', 0) * weights['cognitive'],
                'portfolio_contribution': score_components.get('portfolio', 0) * weights['portfolio'],
                'endorsement_contribution': score_components.get('endorsement', 0) * weights['endorsement']
            }
        }
        
        lifescore = await self.lifescore_repo.create_score(
            user_id=user_id,
            cognitive_score=cognitive_score,
            portfolio_score=portfolio_score,
            endorsement_score=endorsement_score,
            composite_score=round(composite_score, 2),
            score_breakdown=score_breakdown
        )
        
        await self.lifescore_repo.update_rankings()
        
        return lifescore
    
    async def get_lifescore(self, user_id: str):
        """Get latest LifeScore for a user"""
        return await self.lifescore_repo.get_latest_score(user_id)
    
    async def get_history(self, user_id: str, limit: int = 10):
        """Get LifeScore history"""
        scores = await self.lifescore_repo.get_score_history(user_id, limit)
        
        growth_metrics = self._calculate_growth_metrics(scores)
        
        return {
            'scores': scores,
            'growth_metrics': growth_metrics
        }
    
    def _calculate_growth_metrics(self, scores: list) -> Dict[str, Any]:
        """Calculate growth metrics from score history"""
        if not scores or len(scores) < 2:
            return {
                'total_change': 0,
                'percentage_change': 0,
                'trend': 'stable'
            }
        
        latest_score = float(scores[0]['composite_score'])
        earliest_score = float(scores[-1]['composite_score'])
        
        total_change = latest_score - earliest_score
        percentage_change = (total_change / earliest_score * 100) if earliest_score > 0 else 0
        
        if total_change > 5:
            trend = 'improving'
        elif total_change < -5:
            trend = 'declining'
        else:
            trend = 'stable'
        
        return {
            'total_change': round(total_change, 2),
            'percentage_change': round(percentage_change, 2),
            'trend': trend,
            'latest_score': latest_score,
            'earliest_score': earliest_score,
            'data_points': len(scores)
        }
    
    async def get_leaderboard(self, limit: int = 100):
        """Get global leaderboard"""
        return await self.lifescore_repo.get_leaderboard(limit)
