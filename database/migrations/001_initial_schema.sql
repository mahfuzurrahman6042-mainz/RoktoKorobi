-- RoktoKorobi Initial Database Schema
-- Run this first in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('user', 'admin', 'super_admin', 'org_advocate');
CREATE TYPE blood_group AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
CREATE TYPE request_status AS ENUM ('pending', 'accepted', 'fulfilled', 'expired', 'cancelled');
CREATE TYPE request_urgency AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE donation_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

-- Profiles table (users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  blood_group blood_group NOT NULL,
  date_of_birth DATE NOT NULL,
  age INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth))) STORED,
  district VARCHAR(100) NOT NULL,
  location TEXT NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  is_donor BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  role user_role DEFAULT 'user',
  area_name TEXT,
  area_lat DECIMAL(10, 8),
  area_lon DECIMAL(11, 8),
  total_donations INTEGER DEFAULT 0,
  last_donation DATE,
  privacy_consent BOOLEAN DEFAULT false,
  age_declaration BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT profiles_age_check CHECK (age >= 13 AND age <= 120),
  CONSTRAINT profiles_weight_check CHECK (weight >= 30 AND weight <= 200),
  CONSTRAINT profiles_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT profiles_phone_format CHECK (phone ~* '^[0-9+\-\s()]+$')
);

-- Blood requests table
CREATE TABLE IF NOT EXISTS blood_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_name VARCHAR(255) NOT NULL,
  patient_age INTEGER NOT NULL,
  blood_group blood_group NOT NULL,
  units_needed INTEGER NOT NULL,
  hospital_name VARCHAR(255) NOT NULL,
  hospital_address TEXT NOT NULL,
  district VARCHAR(100) NOT NULL,
  location TEXT NOT NULL,
  contact_person VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(20) NOT NULL,
  urgency_level request_urgency DEFAULT 'medium',
  status request_status DEFAULT 'pending',
  requested_by UUID REFERENCES profiles(id),
  accepted_by UUID REFERENCES profiles(id),
  fulfilled_by UUID REFERENCES profiles(id),
  request_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  needed_by DATE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  fulfilled_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT blood_requests_age_check CHECK (patient_age >= 0 AND patient_age <= 120),
  CONSTRAINT blood_requests_units_check CHECK (units_needed > 0 AND units_needed <= 10),
  CONSTRAINT blood_requests_urgency_check CHECK (urgency_level IN ('low', 'medium', 'high', 'critical'))
);

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  donor_id UUID NOT NULL REFERENCES profiles(id),
  recipient_id UUID REFERENCES profiles(id),
  blood_request_id UUID REFERENCES blood_requests(id),
  donation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  location VARCHAR(255) NOT NULL,
  units_donated INTEGER NOT NULL,
  status donation_status DEFAULT 'pending',
  verified_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT donations_units_check CHECK (units_donated > 0 AND units_donated <= 2)
);

-- User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  
  -- Constraints
  CONSTRAINT user_sessions_expiry_check CHECK (expires_at > created_at)
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100),
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Login attempts table
CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  ip_address INET,
  success BOOLEAN NOT NULL,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT
);

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address TEXT NOT NULL,
  district VARCHAR(100) NOT NULL,
  description TEXT,
  verified BOOLEAN DEFAULT false,
  contact_person VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  author_id UUID REFERENCES profiles(id),
  organization UUID REFERENCES organizations(id),
  featured_image_url VARCHAR(500),
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT blog_posts_slug_format CHECK (slug ~* '^[a-z0-9-]+$')
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  blog_post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id),
  parent_id UUID REFERENCES comments(id),
  content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'approved',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Illustrations table
CREATE TABLE IF NOT EXISTS illustrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500) NOT NULL,
  author_id UUID REFERENCES profiles(id),
  section_id UUID,
  status VARCHAR(20) DEFAULT 'pending',
  featured BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_type VARCHAR(50) NOT NULL,
  badge_name VARCHAR(100) NOT NULL,
  badge_description TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT badges_unique_user_type UNIQUE (user_id, badge_type)
);

-- Donor locations table
CREATE TABLE IF NOT EXISTS donor_locations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  donor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT donor_locations_lat_check CHECK (latitude >= -90 AND latitude <= 90),
  CONSTRAINT donor_locations_lon_check CHECK (longitude >= -180 AND longitude <= 180)
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blood_requests_updated_at BEFORE UPDATE ON blood_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON donations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_illustrations_updated_at BEFORE UPDATE ON illustrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE illustrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE donor_locations ENABLE ROW LEVEL SECURITY;

-- RLS Policies (basic ones - will be expanded)
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Public can view blood requests" ON blood_requests FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create blood requests" ON blood_requests FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can view own donations" ON donations FOR SELECT USING (auth.uid()::text = donor_id::text);
CREATE POLICY "Public can view published blog posts" ON blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Public can view approved comments" ON comments FOR SELECT USING (status = 'approved');
CREATE POLICY "Public can view approved illustrations" ON illustrations FOR SELECT USING (status = 'approved');
