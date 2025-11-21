from typing import Dict, Any, Optional, List
from app.core.database import Database
from app.core.logging import get_logger
import json

logger = get_logger(__name__)


class PortfolioRepository:
    """Repository for portfolio/GitHub operations"""
    
    def __init__(self, db: Database):
        self.db = db
    
    async def create_repo(
        self,
        user_id: str,
        repo_name: str,
        repo_url: str,
        description: Optional[str] = None,
        stars: int = 0,
        forks: int = 0,
        primary_language: Optional[str] = None,
        tech_stack: Optional[List[str]] = None,
        last_commit_date = None,
        created_date = None,
        is_fork: bool = False
    ):
        """Create or update a GitHub repository record"""
        query = """
            INSERT INTO github_repos 
            (user_id, repo_name, repo_url, description, stars, forks, primary_language,
             tech_stack, last_commit_date, created_date, is_fork)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (user_id, repo_name) 
            DO UPDATE SET
                description = EXCLUDED.description,
                stars = EXCLUDED.stars,
                forks = EXCLUDED.forks,
                primary_language = EXCLUDED.primary_language,
                tech_stack = EXCLUDED.tech_stack,
                last_commit_date = EXCLUDED.last_commit_date,
                updated_at = NOW()
            RETURNING id, user_id, repo_name, repo_url, description, stars, forks,
                      primary_language, tech_stack, last_commit_date, created_date, is_fork
        """
        return await self.db.fetch_one(
            query,
            user_id,
            repo_name,
            repo_url,
            description,
            stars,
            forks,
            primary_language,
            tech_stack,
            last_commit_date,
            created_date,
            is_fork
        )
    
    async def get_user_repos(self, user_id: str):
        """Get all repositories for a user"""
        query = """
            SELECT id, user_id, repo_name, repo_url, description, stars, forks,
                   primary_language, tech_stack, last_commit_date, created_date, is_fork
            FROM github_repos
            WHERE user_id = $1
            ORDER BY stars DESC, last_commit_date DESC
        """
        return await self.db.fetch_all(query, user_id)
    
    async def create_metrics(
        self,
        user_id: str,
        total_repos: int,
        total_stars: int,
        total_commits: int,
        total_prs: int,
        total_issues: int,
        languages: Dict[str, Any],
        contributions_last_year: int,
        account_age_days: Optional[int] = None
    ):
        """Create GitHub metrics record"""
        query = """
            INSERT INTO github_metrics
            (user_id, total_repos, total_stars, total_commits, total_prs, total_issues,
             languages, contributions_last_year, account_age_days)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id, user_id, total_repos, total_stars, total_commits, total_prs,
                      total_issues, languages, contributions_last_year, account_age_days, analyzed_at
        """
        return await self.db.fetch_one(
            query,
            user_id,
            total_repos,
            total_stars,
            total_commits,
            total_prs,
            total_issues,
            json.dumps(languages),
            contributions_last_year,
            account_age_days
        )
    
    async def create_score(
        self,
        user_id: str,
        metrics_id: Optional[str],
        repo_quality_score: float,
        activity_score: float,
        impact_score: float,
        composite_score: float,
        score_breakdown: Optional[Dict[str, Any]] = None
    ):
        """Create a portfolio score"""
        query = """
            INSERT INTO portfolio_scores
            (user_id, metrics_id, repo_quality_score, activity_score, impact_score,
             composite_score, score_breakdown)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, user_id, metrics_id, repo_quality_score, activity_score,
                      impact_score, composite_score, score_breakdown, created_at
        """
        return await self.db.fetch_one(
            query,
            user_id,
            metrics_id,
            repo_quality_score,
            activity_score,
            impact_score,
            composite_score,
            json.dumps(score_breakdown) if score_breakdown else None
        )
    
    async def get_latest_score(self, user_id: str):
        """Get the latest portfolio score for a user"""
        query = """
            SELECT composite_score
            FROM latest_portfolio_scores
            WHERE user_id = $1
        """
        result = await self.db.fetch_one(query, user_id)
        return result['composite_score'] if result else None
