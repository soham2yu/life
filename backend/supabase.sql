-- LifeScore Database Schema for Supabase PostgreSQL
-- This schema includes all tables, constraints, indexes, and triggers

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');
CREATE TYPE test_status AS ENUM ('started', 'in_progress', 'completed', 'abandoned');
CREATE TYPE endorsement_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE certificate_status AS ENUM ('active', 'revoked', 'expired');

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    role user_role DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    is_banned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    avatar_url VARCHAR(500),
    github_username VARCHAR(255),
    linkedin_url VARCHAR(500),
    website_url VARCHAR(500),
    location VARCHAR(255),
    skills TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_github_username ON profiles(github_username);

-- ============================================
-- AUTH PROVIDERS TABLE
-- ============================================
CREATE TABLE auth_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(provider, provider_user_id)
);

CREATE INDEX idx_auth_providers_user_id ON auth_providers(user_id);

-- ============================================
-- SESSIONS TABLE
-- ============================================
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- ============================================
-- COGNITIVE TESTS TABLE
-- ============================================
CREATE TABLE cognitive_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    test_type VARCHAR(100) NOT NULL,
    status test_status DEFAULT 'started',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    time_taken_seconds INTEGER,
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_cognitive_tests_user_id ON cognitive_tests(user_id);
CREATE INDEX idx_cognitive_tests_status ON cognitive_tests(status);
CREATE INDEX idx_cognitive_tests_created_at ON cognitive_tests(created_at DESC);

-- ============================================
-- COGNITIVE SCORES TABLE
-- ============================================
CREATE TABLE cognitive_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    test_id UUID NOT NULL REFERENCES cognitive_tests(id) ON DELETE CASCADE,
    accuracy_score DECIMAL(5,2) NOT NULL CHECK (accuracy_score >= 0 AND accuracy_score <= 100),
    speed_score DECIMAL(5,2) NOT NULL CHECK (speed_score >= 0 AND speed_score <= 100),
    difficulty_score DECIMAL(5,2) NOT NULL CHECK (difficulty_score >= 0 AND difficulty_score <= 100),
    composite_score DECIMAL(5,2) NOT NULL CHECK (composite_score >= 0 AND composite_score <= 100),
    percentile DECIMAL(5,2),
    score_breakdown JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(test_id)
);

CREATE INDEX idx_cognitive_scores_user_id ON cognitive_scores(user_id);
CREATE INDEX idx_cognitive_scores_test_id ON cognitive_scores(test_id);
CREATE INDEX idx_cognitive_scores_composite_score ON cognitive_scores(composite_score DESC);

-- ============================================
-- GITHUB REPOSITORIES TABLE
-- ============================================
CREATE TABLE github_repos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    repo_name VARCHAR(255) NOT NULL,
    repo_url VARCHAR(500) NOT NULL,
    description TEXT,
    stars INTEGER DEFAULT 0,
    forks INTEGER DEFAULT 0,
    primary_language VARCHAR(100),
    tech_stack TEXT[],
    last_commit_date TIMESTAMP WITH TIME ZONE,
    created_date TIMESTAMP WITH TIME ZONE,
    is_fork BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_github_repos_user_id ON github_repos(user_id);
CREATE INDEX idx_github_repos_stars ON github_repos(stars DESC);
CREATE INDEX idx_github_repos_last_commit ON github_repos(last_commit_date DESC);

-- ============================================
-- GITHUB METRICS TABLE
-- ============================================
CREATE TABLE github_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_repos INTEGER DEFAULT 0,
    total_stars INTEGER DEFAULT 0,
    total_commits INTEGER DEFAULT 0,
    total_prs INTEGER DEFAULT 0,
    total_issues INTEGER DEFAULT 0,
    languages JSONB,
    contributions_last_year INTEGER DEFAULT 0,
    account_age_days INTEGER,
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_github_metrics_user_id ON github_metrics(user_id);
CREATE INDEX idx_github_metrics_analyzed_at ON github_metrics(analyzed_at DESC);

-- ============================================
-- PORTFOLIO SCORES TABLE
-- ============================================
CREATE TABLE portfolio_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    metrics_id UUID REFERENCES github_metrics(id) ON DELETE SET NULL,
    repo_quality_score DECIMAL(5,2) NOT NULL CHECK (repo_quality_score >= 0 AND repo_quality_score <= 100),
    activity_score DECIMAL(5,2) NOT NULL CHECK (activity_score >= 0 AND activity_score <= 100),
    impact_score DECIMAL(5,2) NOT NULL CHECK (impact_score >= 0 AND impact_score <= 100),
    composite_score DECIMAL(5,2) NOT NULL CHECK (composite_score >= 0 AND composite_score <= 100),
    score_breakdown JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_portfolio_scores_user_id ON portfolio_scores(user_id);
CREATE INDEX idx_portfolio_scores_composite_score ON portfolio_scores(composite_score DESC);
CREATE INDEX idx_portfolio_scores_created_at ON portfolio_scores(created_at DESC);

-- ============================================
-- ENDORSEMENTS TABLE
-- ============================================
CREATE TABLE endorsements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endorser_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill VARCHAR(255) NOT NULL,
    message TEXT,
    status endorsement_status DEFAULT 'pending',
    weight DECIMAL(3,2) DEFAULT 1.00 CHECK (weight >= 0 AND weight <= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (user_id != endorser_id)
);

CREATE INDEX idx_endorsements_user_id ON endorsements(user_id);
CREATE INDEX idx_endorsements_endorser_id ON endorsements(endorser_id);
CREATE INDEX idx_endorsements_status ON endorsements(status);

-- ============================================
-- LIFESCORE HISTORY TABLE
-- ============================================
CREATE TABLE lifescore_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cognitive_score DECIMAL(5,2) CHECK (cognitive_score >= 0 AND cognitive_score <= 100),
    portfolio_score DECIMAL(5,2) CHECK (portfolio_score >= 0 AND portfolio_score <= 100),
    endorsement_score DECIMAL(5,2) CHECK (endorsement_score >= 0 AND endorsement_score <= 100),
    composite_score DECIMAL(5,2) NOT NULL CHECK (composite_score >= 0 AND composite_score <= 100),
    score_breakdown JSONB,
    rank INTEGER,
    percentile DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_lifescore_history_user_id ON lifescore_history(user_id);
CREATE INDEX idx_lifescore_history_composite_score ON lifescore_history(composite_score DESC);
CREATE INDEX idx_lifescore_history_created_at ON lifescore_history(created_at DESC);

-- ============================================
-- CERTIFICATES TABLE
-- ============================================
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lifescore_id UUID REFERENCES lifescore_history(id) ON DELETE SET NULL,
    certificate_hash VARCHAR(255) UNIQUE NOT NULL,
    score DECIMAL(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    status certificate_status DEFAULT 'active',
    metadata JSONB,
    blockchain_tx_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_certificates_user_id ON certificates(user_id);
CREATE INDEX idx_certificates_certificate_hash ON certificates(certificate_hash);
CREATE INDEX idx_certificates_status ON certificates(status);
CREATE INDEX idx_certificates_issued_at ON certificates(issued_at DESC);

-- ============================================
-- ACTIVITY LOGS TABLE
-- ============================================
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_resource ON activity_logs(resource_type, resource_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_github_repos_updated_at BEFORE UPDATE ON github_repos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_endorsements_updated_at BEFORE UPDATE ON endorsements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- Latest scores per user
CREATE VIEW latest_cognitive_scores AS
SELECT DISTINCT ON (user_id)
    user_id,
    composite_score,
    accuracy_score,
    speed_score,
    difficulty_score,
    created_at
FROM cognitive_scores
ORDER BY user_id, created_at DESC;

CREATE VIEW latest_portfolio_scores AS
SELECT DISTINCT ON (user_id)
    user_id,
    composite_score,
    repo_quality_score,
    activity_score,
    impact_score,
    created_at
FROM portfolio_scores
ORDER BY user_id, created_at DESC;

CREATE VIEW latest_lifescores AS
SELECT DISTINCT ON (user_id)
    user_id,
    composite_score,
    cognitive_score,
    portfolio_score,
    endorsement_score,
    rank,
    percentile,
    created_at
FROM lifescore_history
ORDER BY user_id, created_at DESC;

-- User leaderboard
CREATE VIEW user_leaderboard AS
SELECT
    u.id,
    u.display_name,
    u.email,
    ls.composite_score as lifescore,
    ls.cognitive_score,
    ls.portfolio_score,
    ls.endorsement_score,
    ls.rank,
    ls.percentile
FROM users u
LEFT JOIN latest_lifescores ls ON u.id = ls.user_id
WHERE u.is_active = TRUE AND u.is_banned = FALSE
ORDER BY ls.composite_score DESC NULLS LAST;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Calculate endorsement score for a user
CREATE OR REPLACE FUNCTION calculate_endorsement_score(p_user_id UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    v_score DECIMAL(5,2);
BEGIN
    SELECT COALESCE(
        LEAST(
            (COUNT(*) FILTER (WHERE status = 'approved') * 5.0 + 
             SUM(weight) FILTER (WHERE status = 'approved') * 10.0),
            100.0
        ),
        0.0
    )
    INTO v_score
    FROM endorsements
    WHERE user_id = p_user_id;
    
    RETURN v_score;
END;
$$ LANGUAGE plpgsql;

-- Get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS TABLE (
    total_tests INTEGER,
    avg_cognitive_score DECIMAL(5,2),
    latest_portfolio_score DECIMAL(5,2),
    total_endorsements INTEGER,
    current_lifescore DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*)::INTEGER FROM cognitive_tests WHERE user_id = p_user_id AND status = 'completed'),
        (SELECT COALESCE(AVG(composite_score), 0)::DECIMAL(5,2) FROM cognitive_scores WHERE user_id = p_user_id),
        (SELECT composite_score FROM latest_portfolio_scores WHERE user_id = p_user_id),
        (SELECT COUNT(*)::INTEGER FROM endorsements WHERE user_id = p_user_id AND status = 'approved'),
        (SELECT composite_score FROM latest_lifescores WHERE user_id = p_user_id);
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust based on your Supabase setup)
-- GRANT USAGE ON SCHEMA public TO anon, authenticated;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

COMMENT ON TABLE users IS 'Core user accounts linked to Firebase authentication';
COMMENT ON TABLE profiles IS 'Extended user profile information';
COMMENT ON TABLE cognitive_tests IS 'Records of cognitive test attempts';
COMMENT ON TABLE cognitive_scores IS 'Calculated scores from cognitive tests';
COMMENT ON TABLE github_repos IS 'GitHub repository information for portfolio analysis';
COMMENT ON TABLE github_metrics IS 'Aggregated GitHub metrics per user';
COMMENT ON TABLE portfolio_scores IS 'Calculated portfolio scores based on GitHub activity';
COMMENT ON TABLE endorsements IS 'Peer endorsements for skills';
COMMENT ON TABLE lifescore_history IS 'Historical LifeScore calculations';
COMMENT ON TABLE certificates IS 'LifeScore certificates (SBT-compatible)';
COMMENT ON TABLE activity_logs IS 'Audit trail of user and system actions';
