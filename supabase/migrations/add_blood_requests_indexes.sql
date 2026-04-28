-- Add indexes to blood_requests table for better query performance
-- This will improve performance for filtering and searching blood requests

-- Index on status for filtering pending/accepted requests
CREATE INDEX IF NOT EXISTS idx_blood_requests_status 
ON blood_requests(status);

-- Index on blood_group for filtering by blood type
CREATE INDEX IF NOT EXISTS idx_blood_requests_blood_group 
ON blood_requests(blood_group);

-- Index on hospital_district for location-based filtering
CREATE INDEX IF NOT EXISTS idx_blood_requests_hospital_district 
ON blood_requests(hospital_district);

-- Index on urgency for filtering by urgency level
CREATE INDEX IF NOT EXISTS idx_blood_requests_urgency 
ON blood_requests(urgency);

-- Index on donor_id for tracking donor's accepted requests
CREATE INDEX IF NOT EXISTS idx_blood_requests_donor_id 
ON blood_requests(donor_id);

-- Index on created_at for sorting by date
CREATE INDEX IF NOT EXISTS idx_blood_requests_created_at 
ON blood_requests(created_at DESC);

-- Composite index for common filter combinations (status + blood_group + district)
CREATE INDEX IF NOT EXISTS idx_blood_requests_status_blood_district 
ON blood_requests(status, blood_group, hospital_district);

-- Composite index for donor tracking (donor_id + status)
CREATE INDEX IF NOT EXISTS idx_blood_requests_donor_status 
ON blood_requests(donor_id, status);

-- Add comments for documentation
COMMENT ON INDEX idx_blood_requests_status IS 'Index for filtering by request status (pending, accepted, completed)';
COMMENT ON INDEX idx_blood_requests_blood_group IS 'Index for filtering by blood group';
COMMENT ON INDEX idx_blood_requests_hospital_district IS 'Index for location-based filtering by district';
COMMENT ON INDEX idx_blood_requests_urgency IS 'Index for filtering by urgency level';
COMMENT ON INDEX idx_blood_requests_donor_id IS 'Index for tracking donor requests';
COMMENT ON INDEX idx_blood_requests_created_at IS 'Index for sorting by creation date';
COMMENT ON INDEX idx_blood_requests_status_blood_district IS 'Composite index for common filter combinations';
COMMENT ON INDEX idx_blood_requests_donor_status IS 'Composite index for donor request tracking';
