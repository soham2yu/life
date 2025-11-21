# LifeScore Platform - Deployment Guide

## Prerequisites

1. **Supabase Account** (for PostgreSQL database)
2. **Firebase Project** (for authentication)
3. **GitHub Personal Access Token** (optional, for portfolio analysis)
4. **Docker** (for containerized deployment)
5. **GitLab** (for CI/CD pipeline)

## Step 1: Database Setup (Supabase)

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down the project URL and keys

### 1.2 Run Database Schema
1. Navigate to SQL Editor in Supabase dashboard
2. Copy the entire contents of `backend/supabase.sql`
3. Execute the SQL script
4. Verify all tables, views, and functions are created

### 1.3 Get Database Connection String
1. Go to Project Settings > Database
2. Copy the connection string (URI format)
3. Format: `postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres`

## Step 2: Firebase Setup

### 2.1 Create Firebase Project
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project
3. Enable Google Analytics (optional)

### 2.2 Enable Authentication
1. Go to Authentication > Sign-in method
2. Enable **Email/Password** authentication
3. Enable **Google** authentication
4. Configure OAuth consent screen if using Google

### 2.3 Generate Service Account Credentials
1. Go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Extract the following values:
   - `project_id`
   - `client_email`
   - `private_key` (keep the `\n` newlines)

### 2.4 Get Web App Credentials
1. Go to Project Settings > General
2. Scroll to "Your apps"
3. Click "Add app" > Web
4. Register the app
5. Copy the Firebase configuration object:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

## Step 3: Environment Configuration

### 3.1 Backend Environment (.env)
Create `backend/.env`:

```env
# Supabase
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
SUPABASE_ANON_KEY=[anon-key]

# Database
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# Firebase
FIREBASE_PROJECT_ID=[your-project-id]
FIREBASE_CLIENT_EMAIL=[service-account-email]
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[your-key]\n-----END PRIVATE KEY-----\n"

# Optional
GITHUB_TOKEN=[your-github-pat]
REDIS_URL=[redis-connection-string]

# API Config
API_V1_PREFIX=/api/v1
SECRET_KEY=[generate-random-secret]
ENVIRONMENT=production
```

### 3.2 Frontend Environment (.env.local)
Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api/v1

NEXT_PUBLIC_FIREBASE_API_KEY=[firebase-api-key]
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=[project-id].firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=[project-id]
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=[project-id].appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=[sender-id]
NEXT_PUBLIC_FIREBASE_APP_ID=[app-id]
```

## Step 4: Local Development

### 4.1 Backend
```bash
cd backend
pip install -r requirements.txt
python -m app.main
```

Backend runs on: http://localhost:8000
API Docs: http://localhost:8000/docs

### 4.2 Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:5000

## Step 5: Docker Deployment

### 5.1 Build Backend Image
```bash
cd backend
docker build -t lifescore-backend:latest .
```

### 5.2 Run Backend Container
```bash
docker run -d \
  --name lifescore-backend \
  -p 8000:8000 \
  --env-file .env \
  lifescore-backend:latest
```

### 5.3 Frontend Docker (Create Dockerfile)
Create `frontend/Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

Build and run:
```bash
cd frontend
docker build -t lifescore-frontend:latest .
docker run -d \
  --name lifescore-frontend \
  -p 5000:5000 \
  --env-file .env.local \
  lifescore-frontend:latest
```

## Step 6: Production Deployment

### Option A: Replit Deployments

#### Backend Deployment
1. Click "Deploy" in Replit
2. Select "Autoscale" deployment
3. Configure environment variables
4. Deploy backend

#### Frontend Deployment
1. Frontend is already configured to run on port 5000
2. Click "Deploy"
3. Select "Autoscale" deployment
4. Configure environment variables
5. Deploy frontend

### Option B: Cloud Platform (AWS/GCP/Azure)

#### Backend
1. Use provided Dockerfile
2. Deploy to:
   - AWS: Elastic Beanstalk / ECS / Fargate
   - GCP: Cloud Run / App Engine
   - Azure: App Service / Container Instances
3. Set environment variables in platform
4. Configure load balancer

#### Frontend
1. Build Next.js app: `npm run build`
2. Deploy to:
   - Vercel (recommended for Next.js)
   - AWS Amplify
   - GCP Cloud Run
   - Netlify
3. Set environment variables
4. Configure custom domain

### Option C: Traditional VPS

#### Setup
```bash
# Install dependencies
sudo apt update
sudo apt install python3.11 python3-pip nodejs npm postgresql-client

# Clone repository
git clone [your-repo-url]
cd lifescore

# Backend
cd backend
pip install -r requirements.txt
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000

# Frontend
cd ../frontend
npm install
npm run build
npm start
```

#### Process Manager (PM2)
```bash
npm install -g pm2

# Backend
pm2 start "gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000" --name lifescore-backend

# Frontend
cd frontend
pm2 start "npm start" --name lifescore-frontend
pm2 save
pm2 startup
```

## Step 7: GitLab CI/CD Setup

### 7.1 Configure GitLab Variables
Go to Settings > CI/CD > Variables and add:

**Backend Variables:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `SECRET_KEY`

**Frontend Variables:**
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### 7.2 Pipeline Stages
The `.gitlab-ci.yml` includes:
1. **Install**: Install dependencies
2. **Build**: Build applications
3. **Test**: Run tests and linters
4. **Deploy**: Build Docker images and deploy

### 7.3 Configure Deployment
Modify the `deploy` stage in `.gitlab-ci.yml` to match your deployment target.

## Step 8: SSL/TLS Configuration

### Using Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Step 9: Monitoring & Logging

### Backend Logging
Logs are stored in `backend/logs/`:
- `app.log` - Application logs
- `error.log` - Error logs

### Monitoring Recommendations
1. **Application Performance**:
   - Sentry (error tracking)
   - New Relic / DataDog (APM)

2. **Database**:
   - Supabase built-in monitoring
   - pganalyze (PostgreSQL)

3. **Infrastructure**:
   - CloudWatch (AWS)
   - Cloud Monitoring (GCP)
   - Azure Monitor

## Step 10: Security Checklist

- [ ] Environment variables secured (not committed to git)
- [ ] Firebase security rules configured
- [ ] Supabase RLS policies enabled
- [ ] HTTPS/SSL enabled
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] API authentication required
- [ ] Regular security updates
- [ ] Backup strategy implemented
- [ ] Monitoring and alerts configured

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check Supabase project is not paused
- Verify IP whitelist in Supabase (allow all: 0.0.0.0/0 for testing)

### Firebase Authentication Issues
- Verify Firebase credentials are correct
- Check Firebase project has authentication enabled
- Verify authorized domains in Firebase console

### CORS Errors
- Add frontend domain to `CORS_ORIGINS` in backend settings
- Verify API URL in frontend `.env.local`

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Python cache: `find . -type d -name __pycache__ -exec rm -r {} +`
- Verify all environment variables are set

## Support & Documentation

- API Documentation: http://your-backend-url/docs
- ReDoc: http://your-backend-url/redoc
- GitHub Issues: [your-repo]/issues
- Supabase Docs: https://supabase.com/docs
- Firebase Docs: https://firebase.google.com/docs
- FastAPI Docs: https://fastapi.tiangolo.com
- Next.js Docs: https://nextjs.org/docs
