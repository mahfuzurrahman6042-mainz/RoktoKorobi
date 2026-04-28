-- Hospitals table for verified hospital partnerships
CREATE TABLE IF NOT EXISTS hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  name_bn VARCHAR(255),
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone VARCHAR(20),
  email VARCHAR(255),
  blood_bank_available BOOLEAN DEFAULT true,
  has_donation_center BOOLEAN DEFAULT false,
  appointment_required BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id),
  operating_hours JSONB,
  blood_groups_available TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for hospitals table
CREATE INDEX IF NOT EXISTS idx_hospitals_district ON hospitals(district);
CREATE INDEX IF NOT EXISTS idx_hospitals_city ON hospitals(city);
CREATE INDEX IF NOT EXISTS idx_hospitals_verified ON hospitals(verified);
CREATE INDEX IF NOT EXISTS idx_hospitals_blood_bank ON hospitals(blood_bank_available);

-- Comments for documentation
COMMENT ON TABLE hospitals IS 'Verified hospitals and blood donation centers';
COMMENT ON COLUMN hospitals.verified IS 'Whether the hospital is verified by admin';
COMMENT ON COLUMN hospitals.blood_bank_available IS 'Whether the hospital has a blood bank';
COMMENT ON COLUMN hospitals.has_donation_center IS 'Whether the hospital has a dedicated donation center';
COMMENT ON COLUMN hospitals.appointment_required IS 'Whether appointments are required for donations';
COMMENT ON COLUMN hospitals.operating_hours IS 'JSON object with operating hours for each day';
COMMENT ON COLUMN hospitals.blood_groups_available IS 'Array of blood groups available at this hospital';

-- Enable RLS on hospitals table
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hospitals
CREATE POLICY "Anyone can view verified hospitals"
ON hospitals FOR SELECT
USING (verified = true);

CREATE POLICY "Admins can view all hospitals"
ON hospitals FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin' OR role = 'super_admin'
  )
);

CREATE POLICY "Admins can insert hospitals"
ON hospitals FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin' OR role = 'super_admin'
  )
);

CREATE POLICY "Admins can update hospitals"
ON hospitals FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin' OR role = 'super_admin'
  )
);

CREATE POLICY "Admins can delete hospitals"
ON hospitals FOR DELETE
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin' OR role = 'super_admin'
  )
);
