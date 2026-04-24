-- Donation Confirmation System Schema
-- Add confirmation fields to blood_requests table

ALTER TABLE blood_requests
ADD COLUMN IF NOT EXISTS donor_id UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS donation_center_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'arrived', 'completed', 'cancelled')),
ADD COLUMN IF NOT EXISTS donor_confirmed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recipient_confirmed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS geofence_triggered_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Add comments to explain the fields
COMMENT ON COLUMN blood_requests.donor_id IS 'Reference to donor profile who accepted the request';
COMMENT ON COLUMN blood_requests.donation_center_id IS 'ID of the donation center/hospital';
COMMENT ON COLUMN blood_requests.status IS 'Request status: pending, accepted, arrived, completed, cancelled';
COMMENT ON COLUMN blood_requests.donor_confirmed IS 'Whether donor has confirmed donation completion';
COMMENT ON COLUMN blood_requests.recipient_confirmed IS 'Whether recipient has confirmed blood receipt';
COMMENT ON COLUMN blood_requests.geofence_triggered_at IS 'Timestamp when donor arrived at donation center (geofence trigger)';
COMMENT ON COLUMN blood_requests.completed_at IS 'Timestamp when donation was completed (both confirmed)';

-- Add index for faster queries on status
CREATE INDEX IF NOT EXISTS idx_blood_requests_status ON blood_requests(status);
CREATE INDEX IF NOT EXISTS idx_blood_requests_donor ON blood_requests(donor_id);
