# LifeScore Platform
LifeScore – Real Ability Scoring Using GitLab + AI + Blockchain

Video: <YouTube link>


🔧 GitLab API Usage

List exact endpoints you used.


## Overview
Production-grade full-stack application for cognitive testing and portfolio analysis with composite LifeScore calculation.

## Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.11)
- **Database**: Supabase PostgreSQL (asyncpg)
- **Authentication**: Firebase Admin SDK
- **Logging**: Loguru
- **API Documentation**: Swagger/ReDoc

### Frontend
- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth SDK

## Project Structure

```
/backend
  /app
    /core         - Database, Firebase, security, logging
    /config       - Settings and configuration
    /models       - Database models
    /schemas      - Pydantic schemas
    /services     - Business logic
    /repositories - Database operations
    /routes       - API endpoints
    /utils        - Utility functions
  supabase.sql    - Complete database schema
  requirements.txt
  Dockerfile

/frontend
  /app            - Next.js 15 app directory
  /components     - React components
  /lib            - Firebase and API utilities
  package.json

.gitlab-ci.yml    - CI/CD pipeline
.env.example      - Environment variable template
```

## Features

### Backend API Endpoints

#### Authentication (`/api/v1/auth`)
- `GET /me` - Get current user
- `POST /verify` - Verify Firebase token

#### Cognitive Tests (`/api/v1/cognitive`)
- `POST /start` - Start cognitive test
- `POST /submit` - Submit test answers
- `GET /score/{test_id}` - Get test score
- `GET /scores` - Get user's test history

#### Portfolio (`/api/v1/portfolio`)
- `POST /analyze-github` - Analyze GitHub profile
- `GET /score` - Get latest portfolio score

#### LifeScore (`/api/v1/lifescore`)
- `POST /calculate` - Calculate composite LifeScore
- `GET /current` - Get current LifeScore
- `GET /history` - Get LifeScore history
- `GET /leaderboard` - Global leaderboard (public)

#### Certificates (`/api/v1/certificate`)
- `POST /create` - Create certificate
- `GET /{certificate_id}` - Get certificate (public)
- `GET /verify/{hash}` - Verify certificate (public)
- `GET /user/all` - Get user certificates

#### Endorsements (`/api/v1/endorsement`)
- `POST /create` - Create endorsement
- `GET /received` - Get received endorsements
- `PATCH /{id}` - Update endorsement (moderator)
- `DELETE /{id}` - Delete endorsement

#### Admin (`/api/v1/admin`)
- `GET /users` - List all users (moderator)
- `GET /users/{id}` - User details (moderator)
- `GET /scores` - All scores (moderator)
- `POST /users/{id}/ban` - Ban user (admin)
- `DELETE /users/{id}` - Delete user (admin)
- `GET /activity-logs` - Activity logs (moderator)

### Frontend Pages
- `/` - Landing page
- `/login` - Authentication
- `/dashboard` - User dashboard with scores
- `/test/cognitive` - Cognitive testing interface
- `/portfolio` - GitHub portfolio analysis

## Database Schema

### Main Tables
- `users` - User accounts
- `profiles` - Extended user profiles
- `cognitive_tests` - Test attempts
- `cognitive_scores` - Calculated scores
- `github_repos` - Repository data
- `github_metrics` - Aggregated metrics
- `portfolio_scores` - Portfolio scores
- `lifescore_history` - LifeScore history
- `endorsements` - Peer endorsements
- `certificates` - SBT-compatible certificates
- `activity_logs` - Audit trail
- `auth_providers` - Auth provider links
- `sessions` - User sessions

## Environment Variables

### Backend
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
DATABASE_URL=
GITHUB_TOKEN=
REDIS_URL=
SECRET_KEY=
```

### Frontend
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Setup Instructions

### 1. Database Setup
1. Create a Supabase project
2. Run `backend/supabase.sql` in Supabase SQL editor
3. Copy database connection string

### 2. Firebase Setup
1. Create Firebase project
2. Enable Email/Password and Google authentication
3. Download service account credentials
4. Enable Firebase Auth

### 3. Backend Setup
```bash
cd backend
pip install -r requirements.txt
# Configure .env file
python -m app.main
```

### 4. Frontend Setup
```bash
cd frontend
npm install
# Configure .env.local
npm run dev
```

## Development

### Running Locally
- Backend: `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
- Frontend: `npm run dev` (runs on port 5000)

### API Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## LifeScore Calculation

Composite score formula:
- **50%** Cognitive Score
- **30%** Portfolio Score
- **20%** Endorsement Score

All scores normalized to 0-100 scale.

## Security
- JWT token verification via Firebase Admin SDK
- Role-based access control (user, moderator, admin)
- Activity logging for all mutations
- Rate limiting ready (configure in settings)

## Recent Changes
- 2025-11-21: Initial implementation of complete LifeScore platform
  - Full backend API with all required endpoints
  - Complete database schema with views and functions
  - Minimal Next.js 15 frontend for testing
  - GitLab CI/CD pipeline configuration
  - Docker support for backend
  - **CRITICAL FIX**: Database layer (backend/app/core/database.py) now converts asyncpg.Record to dicts in fetch_one/fetch_all methods, preventing AttributeError across all repositories and services
