-- Add tracking fields to blood_requests table
-- This migration adds fields needed for donor GPS tracking

-- Add accepted_donor_id column for tracking which donor accepted the request
ALTER TABLE blood_requests 
ADD COLUMN IF NOT EXISTS accepted_donor_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Add contact column for phone number
ALTER TABLE blood_requests 
ADD COLUMN IF NOT EXISTS contact VARCHAR(20) NOT NULL DEFAULT '';

-- Add units_needed column
ALTER TABLE blood_requests 
ADD COLUMN IF NOT EXISTS units_needed INTEGER DEFAULT 1 CHECK (units_needed > 0 AND units_needed <= 10);

-- Add index for accepted_donor_id
CREATE INDEX IF NOT EXISTS idx_blood_requests_accepted_donor_id ON blood_requests(accepted_donor_id);

-- Add comment
COMMENT ON COLUMN blood_requests.accepted_donor_id IS 'ID of the donor who accepted this request (for GPS tracking)';
COMMENT ON COLUMN blood_requests.contact IS 'Contact phone number for the blood request';
COMMENT ON COLUMN blood_requests.units_needed IS 'Number of blood units needed (1-10)';
