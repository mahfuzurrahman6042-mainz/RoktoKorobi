-- Performance Indexes for RoktoKorobi Application
-- Run after initial schema migration

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_donor ON profiles(is_donor);
CREATE INDEX IF NOT EXISTS idx_profiles_is_available ON profiles(is_available);
CREATE INDEX IF NOT EXISTS idx_profiles_blood_group ON profiles(blood_group);
CREATE INDEX IF NOT EXISTS idx_profiles_district ON profiles(district);
CREATE INDEX IF NOT EXISTS idx_profiles_email_verified ON profiles(email_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_location_coords ON profiles(area_lat, area_lon) WHERE area_lat IS NOT NULL AND area_lon IS NOT NULL;

-- Blood requests table indexes
CREATE INDEX IF NOT EXISTS idx_blood_requests_status ON blood_requests(status);
CREATE INDEX IF NOT EXISTS idx_blood_requests_blood_group ON blood_requests(blood_group);
CREATE INDEX IF NOT EXISTS idx_blood_requests_district ON blood_requests(district);
CREATE INDEX IF NOT EXISTS idx_blood_requests_urgency_level ON blood_requests(urgency_level);
CREATE INDEX IF NOT EXISTS idx_blood_requests_requested_by ON blood_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_blood_requests_accepted_by ON blood_requests(accepted_by);
CREATE INDEX IF NOT EXISTS idx_blood_requests_fulfilled_by ON blood_requests(fulfilled_by);
CREATE INDEX IF NOT EXISTS idx_blood_requests_created_at ON blood_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blood_requests_needed_by ON blood_requests(needed_by);
CREATE INDEX IF NOT EXISTS idx_blood_requests_expires_at ON blood_requests(expires_at);

-- Donations table indexes
CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_recipient_id ON donations(recipient_id);
CREATE INDEX IF NOT EXISTS idx_donations_blood_request_id ON donations(blood_request_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_donation_date ON donations(donation_date DESC);
CREATE INDEX IF NOT EXISTS idx_donations_verified_by ON donations(verified_by);

-- User sessions table indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_created_at ON user_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_accessed ON user_sessions(last_accessed DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active) WHERE is_active = true;

-- Audit logs table indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON audit_logs(ip_address);

-- Login attempts table indexes
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_address ON login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_success ON login_attempts(success);
CREATE INDEX IF NOT EXISTS idx_login_attempts_attempted_at ON login_attempts(attempted_at DESC);

-- Organizations table indexes
CREATE INDEX IF NOT EXISTS idx_organizations_email ON organizations(email);
CREATE INDEX IF NOT EXISTS idx_organizations_district ON organizations(district);
CREATE INDEX IF NOT EXISTS idx_organizations_verified ON organizations(verified);
CREATE INDEX IF NOT EXISTS idx_organizations_created_at ON organizations(created_at DESC);

-- Blog posts table indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_organization ON blog_posts(organization);
CREATE INDEX IF NOT EXISTS idx_blog_posts_is_published ON blog_posts(is_published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);

-- Comments table indexes
CREATE INDEX IF NOT EXISTS idx_comments_blog_post_id ON comments(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- Illustrations table indexes
CREATE INDEX IF NOT EXISTS idx_illustrations_author_id ON illustrations(author_id);
CREATE INDEX IF NOT EXISTS idx_illustrations_section_id ON illustrations(section_id);
CREATE INDEX IF NOT EXISTS idx_illustrations_status ON illustrations(status);
CREATE INDEX IF NOT EXISTS idx_illustrations_featured ON illustrations(featured);
CREATE INDEX IF NOT EXISTS idx_illustrations_created_at ON illustrations(created_at DESC);

-- Badges table indexes
CREATE INDEX IF NOT EXISTS idx_badges_user_id ON badges(user_id);
CREATE INDEX IF NOT EXISTS idx_badges_badge_type ON badges(badge_type);
CREATE INDEX IF NOT EXISTS idx_badges_earned_at ON badges(earned_at DESC);

-- Donor locations table indexes
CREATE INDEX IF NOT EXISTS idx_donor_locations_donor_id ON donor_locations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donor_locations_timestamp ON donor_locations(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_donor_locations_coords ON donor_locations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_donor_locations_accuracy ON donor_locations(accuracy) WHERE accuracy IS NOT NULL;

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_profiles_donor_available_blood ON profiles(is_donor, is_available, blood_group) WHERE is_donor = true AND is_available = true;
CREATE INDEX IF NOT EXISTS idx_profiles_donor_district_blood ON profiles(is_donor, district, blood_group, created_at DESC) WHERE is_donor = true;
CREATE INDEX IF NOT EXISTS idx_blood_requests_status_created ON blood_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blood_requests_blood_district_status ON blood_requests(blood_group, district, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_donor_date ON donations(donor_id, donation_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active_user ON user_sessions(user_id, is_active, expires_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action_time ON audit_logs(user_id, action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email_time ON login_attempts(email, attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_created ON blog_posts(is_published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_status_created ON comments(blog_post_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_illustrations_status_featured_created ON illustrations(status, featured, created_at DESC);

-- Full-text search indexes (PostgreSQL specific)
CREATE INDEX IF NOT EXISTS idx_profiles_name_search ON profiles USING gin(to_tsvector('english', name || ' ' || COALESCE(district, '')));
CREATE INDEX IF NOT EXISTS idx_blog_posts_search ON blog_posts USING gin(to_tsvector('english', title || ' ' || COALESCE(content, '') || ' ' || COALESCE(excerpt, '')));
CREATE INDEX IF NOT EXISTS idx_organizations_search ON organizations USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Partial indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_active_donors ON profiles(district, blood_group, area_lat, area_lon) WHERE is_donor = true AND is_available = true AND email_verified = true;
CREATE INDEX IF NOT EXISTS idx_blood_requests_active ON blood_requests(blood_group, district, needed_by, created_at) WHERE status = 'pending' AND expires_at > NOW();
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(user_id, token_hash, expires_at) WHERE is_active = true AND expires_at > NOW();
CREATE INDEX IF NOT EXISTS idx_donations_pending ON donations(donor_id, blood_request_id, status) WHERE status = 'pending';

-- Analyze tables after creating indexes
ANALYZE profiles;
ANALYZE blood_requests;
ANALYZE donations;
ANALYZE user_sessions;
ANALYZE audit_logs;
ANALYZE login_attempts;
ANALYZE organizations;
ANALYZE blog_posts;
ANALYZE comments;
ANALYZE illustrations;
ANALYZE badges;
ANALYZE donor_locations;
