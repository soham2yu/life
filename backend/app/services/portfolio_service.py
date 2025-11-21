import httpx
from typing import Dict, Any, List, Optional
from datetime import datetime
from ..repositories.portfolio_repository import PortfolioRepository
from ..core.database import Database
from ..core.logging import get_logger
from ..config.settings import settings

logger = get_logger(__name__)


class PortfolioService:
    """Service for portfolio/GitHub analysis"""
    
    def __init__(self, db: Database):
        self.repo = PortfolioRepository(db)
    
    async def analyze_github(self, user_id: str, github_username: str):
        """Analyze a user's GitHub profile"""
        logger.info(f"Analyzing GitHub profile: {github_username}")
        
        headers = {}
        if settings.GITHUB_TOKEN:
            headers['Authorization'] = f"token {settings.GITHUB_TOKEN}"
        
        async with httpx.AsyncClient() as client:
            user_data = await self._fetch_github_user(client, github_username, headers)
            repos_data = await self._fetch_github_repos(client, github_username, headers)
            
            repos = []
            for repo in repos_data:
                if not repo.get('fork', False) or repo.get('stargazers_count', 0) > 5:
                    repo_record = await self.repo.create_repo(
                        user_id=user_id,
                        repo_name=repo['name'],
                        repo_url=repo['html_url'],
                        description=repo.get('description'),
                        stars=repo.get('stargazers_count', 0),
                        forks=repo.get('forks_count', 0),
                        primary_language=repo.get('language'),
                        tech_stack=[repo.get('language')] if repo.get('language') else [],
                        last_commit_date=self._parse_date(repo.get('pushed_at')),
                        created_date=self._parse_date(repo.get('created_at')),
                        is_fork=repo.get('fork', False)
                    )
                    repos.append(repo_record)
            
            languages = self._extract_languages(repos_data)
            
            total_stars = sum(repo.get('stargazers_count', 0) for repo in repos_data)
            total_forks = sum(repo.get('forks_count', 0) for repo in repos_data)
            
            account_created = self._parse_date(user_data.get('created_at'))
            account_age_days = (datetime.utcnow() - account_created).days if account_created else None
            
            metrics = await self.repo.create_metrics(
                user_id=user_id,
                total_repos=len(repos_data),
                total_stars=total_stars,
                total_commits=0,
                total_prs=0,
                total_issues=0,
                languages=languages,
                contributions_last_year=0,
                account_age_days=account_age_days
            )
            
            score = await self._calculate_portfolio_score(user_id, metrics, repos)
            
            return {
                'metrics': metrics,
                'repositories': repos,
                'score': score
            }
    
    async def _fetch_github_user(self, client: httpx.AsyncClient, username: str, headers: dict):
        """Fetch GitHub user data"""
        try:
            response = await client.get(f"https://api.github.com/users/{username}", headers=headers)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to fetch GitHub user: {e}")
            return {}
    
    async def _fetch_github_repos(self, client: httpx.AsyncClient, username: str, headers: dict):
        """Fetch GitHub repositories"""
        try:
            response = await client.get(
                f"https://api.github.com/users/{username}/repos",
                headers=headers,
                params={'per_page': 100, 'sort': 'updated'}
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to fetch GitHub repos: {e}")
            return []
    
    def _extract_languages(self, repos: List[Dict]) -> Dict[str, int]:
        """Extract language statistics from repos"""
        languages = {}
        for repo in repos:
            lang = repo.get('language')
            if lang:
                languages[lang] = languages.get(lang, 0) + 1
        return languages
    
    def _parse_date(self, date_str: Optional[str]) -> Optional[datetime]:
        """Parse ISO date string"""
        if not date_str:
            return None
        try:
            return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        except:
            return None
    
    async def _calculate_portfolio_score(self, user_id: str, metrics: Dict, repos: List[Dict]) -> Dict:
        """Calculate portfolio score"""
        total_repos = metrics['total_repos']
        total_stars = metrics['total_stars']
        
        repo_quality_score = min(100, (total_repos / 10) * 50 + (total_stars / 100) * 50)
        
        recent_repos = sum(1 for repo in repos if repo.get('last_commit_date'))
        activity_score = min(100, (recent_repos / max(total_repos, 1)) * 100)
        
        avg_stars = total_stars / max(total_repos, 1)
        impact_score = min(100, avg_stars * 10)
        
        composite_score = (
            repo_quality_score * 0.4 +
            activity_score * 0.3 +
            impact_score * 0.3
        )
        
        score_breakdown = {
            'repo_quality_score': round(repo_quality_score, 2),
            'activity_score': round(activity_score, 2),
            'impact_score': round(impact_score, 2),
            'total_repos': total_repos,
            'total_stars': total_stars,
            'avg_stars': round(avg_stars, 2)
        }
        
        return await self.repo.create_score(
            user_id=user_id,
            metrics_id=metrics['id'],
            repo_quality_score=round(repo_quality_score, 2),
            activity_score=round(activity_score, 2),
            impact_score=round(impact_score, 2),
            composite_score=round(composite_score, 2),
            score_breakdown=score_breakdown
        )
