-- Blood Requests Schema with Geolocation Support
-- This schema enables location tracking between donors and requesters

CREATE TABLE IF NOT EXISTS blood_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  donor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Patient and hospital information
  patient_name VARCHAR(100) NOT NULL,
  hospital_name VARCHAR(200) NOT NULL,
  blood_group VARCHAR(5) NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  urgency VARCHAR(20) DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  
  -- Location information
  hospital_address TEXT,
  hospital_city VARCHAR(100),
  hospital_district VARCHAR(100),
  hospital_latitude DECIMAL(10, 8),
  hospital_longitude DECIMAL(11, 8),
  
  -- Donor location (when donor accepts request)
  donor_latitude DECIMAL(10, 8),
  donor_longitude DECIMAL(11, 8),
  donor_location_shared_at TIMESTAMP WITH TIME ZONE,
  
  -- Request status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'fulfilled', 'cancelled')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fulfilled_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for location-based queries
CREATE INDEX IF NOT EXISTS idx_blood_requests_status ON blood_requests(status);
CREATE INDEX IF NOT EXISTS idx_blood_requests_blood_group ON blood_requests(blood_group);
CREATE INDEX IF NOT EXISTS idx_blood_requests_urgency ON blood_requests(urgency);
CREATE INDEX IF NOT EXISTS idx_blood_requests_location ON blood_requests(hospital_latitude, hospital_longitude);
CREATE INDEX IF NOT EXISTS idx_blood_requests_donor_id ON blood_requests(donor_id);

-- Create organizations table for partner institutions
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  district VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  description TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_organizations_verified ON organizations(verified);
CREATE INDEX IF NOT EXISTS idx_organizations_location ON organizations(latitude, longitude);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_blood_requests_updated_at
  BEFORE UPDATE ON blood_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
