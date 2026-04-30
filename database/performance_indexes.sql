-- Performance indexes for RoktoKorobi application
-- Run these on your Supabase database to improve performance

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_donor ON profiles(is_donor);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_blood_group ON profiles(blood_group);
CREATE INDEX IF NOT EXISTS idx_profiles_district ON profiles(district);
CREATE INDEX IF NOT EXISTS idx_profiles_email_verified ON profiles(email_verified);

-- Blood requests table indexes
CREATE INDEX IF NOT EXISTS idx_blood_requests_status ON blood_requests(status);
CREATE INDEX IF NOT EXISTS idx_blood_requests_blood_group ON blood_requests(blood_group);
CREATE INDEX IF NOT EXISTS idx_blood_requests_district ON blood_requests(district);
CREATE INDEX IF NOT EXISTS idx_blood_requests_created_at ON blood_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blood_requests_urgency ON blood_requests(urgency_level);
CREATE INDEX IF NOT EXISTS idx_blood_requests_hospital_id ON blood_requests(hospital_id);

-- Donor locations table indexes
CREATE INDEX IF NOT EXISTS idx_donor_locations_donor_id ON donor_locations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donor_locations_created_at ON donor_locations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donor_locations_latitude ON donor_locations(latitude);
CREATE INDEX IF NOT EXISTS idx_donor_locations_longitude ON donor_locations(longitude);

-- Blog posts table indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_is_published ON blog_posts(is_published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_organization ON blog_posts(organization);

-- Illustrations table indexes
CREATE INDEX IF NOT EXISTS idx_illustrations_author_id ON illustrations(author_id);
CREATE INDEX IF NOT EXISTS idx_illustrations_created_at ON illustrations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_illustrations_status ON illustrations(status);
CREATE INDEX IF NOT EXISTS idx_illustrations_section_id ON illustrations(section_id);

-- Comments table indexes
CREATE INDEX IF NOT EXISTS idx_comments_illustration_id ON comments(illustration_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);

-- User sessions table indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_user_sessions_created_at ON user_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Audit logs table indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON audit_logs(ip_address);

-- Login attempts table indexes
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_created_at ON login_attempts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_address ON login_attempts(ip_address);

-- Gamification/leaderboard indexes
CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_badges_user_id ON badges(user_id);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_profiles_donor_district_blood ON profiles(is_donor, district, blood_group) WHERE is_donor = true;
CREATE INDEX IF NOT EXISTS idx_blood_requests_status_created ON blood_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_illustrations_status_section ON illustrations(status, section_id, created_at DESC);

-- Full-text search indexes (if supported)
-- CREATE INDEX IF NOT EXISTS idx_profiles_name_search ON profiles USING gin(to_tsvector('english', name || ' ' || COALESCE(district, '')));
-- CREATE INDEX IF NOT EXISTS idx_blog_posts_search ON blog_posts USING gin(to_tsvector('english', title || ' ' || COALESCE(content, '')));

-- Analyze tables after creating indexes
ANALYZE profiles;
ANALYZE blood_requests;
ANALYZE donor_locations;
ANALYZE blog_posts;
ANALYZE illustrations;
ANALYZE comments;
ANALYZE user_sessions;
ANALYZE audit_logs;
ANALYZE login_attempts;
ANALYZE donations;
ANALYZE badges;
