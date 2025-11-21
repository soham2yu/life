from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class GitHubAnalyzeRequest(BaseModel):
    github_username: str


class GitHubRepoResponse(BaseModel):
    id: str
    repo_name: str
    repo_url: str
    description: Optional[str] = None
    stars: int
    forks: int
    primary_language: Optional[str] = None
    tech_stack: Optional[List[str]] = None
    last_commit_date: Optional[datetime] = None
    created_date: Optional[datetime] = None
    is_fork: bool
    
    class Config:
        from_attributes = True


class GitHubMetricsResponse(BaseModel):
    id: str
    user_id: str
    total_repos: int
    total_stars: int
    total_commits: int
    total_prs: int
    total_issues: int
    languages: Optional[Dict[str, Any]] = None
    contributions_last_year: int
    account_age_days: Optional[int] = None
    analyzed_at: datetime
    
    class Config:
        from_attributes = True


class PortfolioScoreResponse(BaseModel):
    id: str
    user_id: str
    repo_quality_score: float
    activity_score: float
    impact_score: float
    composite_score: float
    score_breakdown: Optional[Dict[str, Any]] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class PortfolioAnalysisResponse(BaseModel):
    metrics: GitHubMetricsResponse
    repositories: List[GitHubRepoResponse]
    score: PortfolioScoreResponse
