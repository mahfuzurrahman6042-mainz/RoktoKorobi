-- Sample Blood Requests for Testing Dashboard Features
-- Run this in your Supabase SQL Editor to populate test data

INSERT INTO blood_requests (
  id,
  patient_name,
  patient_age,
  blood_group,
  units_needed,
  hospital_name,
  hospital_address,
  district,
  location,
  contact_person,
  contact_phone,
  urgency_level,
  status,
  needed_by,
  request_date,
  expires_at,
  notes,
  created_at
) VALUES 
  -- Critical Request
  (
    gen_random_uuid(),
    'Ahmed Rahman',
    35,
    'O+',
    3,
    'Dhaka Medical College Hospital',
    'Shahbag, Dhaka',
    'Dhaka',
    'Shahbag, Dhaka, Dhaka',
    'Ahmed Rahman',
    '01712345678',
    'critical',
    'pending',
    NOW() + INTERVAL '1 hour',
    NOW(),
    NOW() + INTERVAL '7 days',
    'Critical emergency - surgery patient needs O+ blood immediately',
    NOW()
  ),
  
  -- High Priority Request
  (
    gen_random_uuid(),
    'Fatema Begum',
    28,
    'A-',
    2,
    'Square Hospital',
    'Panthapath, Dhaka',
    'Dhaka',
    'Panthapath, Dhaka, Dhaka',
    'Fatema Begum',
    '01823456789',
    'high',
    'pending',
    NOW() + INTERVAL '6 hours',
    NOW() - INTERVAL '2 hours',
    NOW() + INTERVAL '7 days',
    'High priority - maternity case needs A- blood',
    NOW() - INTERVAL '2 hours'
  ),
  
  -- Medium Priority Request
  (
    gen_random_uuid(),
    'Mohammed Ali',
    42,
    'B+',
    1,
    'United Hospital',
    'Gulshan-1, Dhaka',
    'Dhaka',
    'Gulshan-1, Dhaka, Dhaka',
    'Mohammed Ali',
    '01934567890',
    'medium',
    'pending',
    NOW() + INTERVAL '12 hours',
    NOW() - INTERVAL '4 hours',
    NOW() + INTERVAL '7 days',
    'Medium priority - surgery scheduled for tomorrow',
    NOW() - INTERVAL '4 hours'
  ),
  
  -- Low Priority Request
  (
    gen_random_uuid(),
    'Sultana Parveen',
    55,
    'AB+',
    2,
    'Labaid Hospital',
    'Dhanmondi, Dhaka',
    'Dhaka',
    'Dhanmondi, Dhaka, Dhaka',
    'Sultana Parveen',
    '01645678901',
    'low',
    'pending',
    NOW() + INTERVAL '24 hours',
    NOW() - INTERVAL '6 hours',
    NOW() + INTERVAL '7 days',
    'Low priority - planned surgery needs AB+ blood',
    NOW() - INTERVAL '6 hours'
  ),
  
  -- Another Critical Request
  (
    gen_random_uuid(),
    'Karim Uddin',
    30,
    'O-',
    4,
    'Bangabandhu Sheikh Mujib Medical University',
    'Shahbag, Dhaka',
    'Dhaka',
    'Shahbag, Dhaka, Dhaka',
    'Karim Uddin',
    '01756789012',
    'critical',
    'pending',
    NOW() + INTERVAL '1 hour',
    NOW() - INTERVAL '1 hour',
    NOW() + INTERVAL '7 days',
    'Critical - trauma patient needs rare O- blood',
    NOW() - INTERVAL '1 hour'
  );

-- Create some sample donors for donor matching feature
INSERT INTO donors (
  id,
  name,
  blood_group,
  location,
  phone,
  email,
  age,
  gender,
  last_donation,
  available,
  created_at
) VALUES 
  -- O+ donors
  (gen_random_uuid(), 'Rahim Khan', 'O+', 'Dhaka', '01711111111', 'rahim@email.com', 25, 'male', NOW() - INTERVAL '90 days', true, NOW()),
  (gen_random_uuid(), 'Khaled Ahmed', 'O+', 'Dhaka', '01722222222', 'khaled@email.com', 32, 'male', NOW() - INTERVAL '60 days', true, NOW()),
  
  -- A- donors
  (gen_random_uuid(), 'Nasreen Sultana', 'A-', 'Dhaka', '01833333333', 'nasreen@email.com', 28, 'female', NOW() - INTERVAL '120 days', true, NOW()),
  (gen_random_uuid(), 'Jamal Uddin', 'A-', 'Dhaka', '01844444444', 'jamal@email.com', 35, 'male', NOW() - INTERVAL '45 days', true, NOW()),
  
  -- B+ donors
  (gen_random_uuid(), 'Farzana Begum', 'B+', 'Dhaka', '01955555555', 'farzana@email.com', 30, 'female', NOW() - INTERVAL '75 days', true, NOW()),
  
  -- AB+ donors
  (gen_random_uuid(), 'Sakib Al Hasan', 'AB+', 'Dhaka', '01666666666', 'sakib@email.com', 27, 'male', NOW() - INTERVAL '30 days', true, NOW()),
  
  -- O- donors (rare type)
  (gen_random_uuid(), 'Mirza Abbas', 'O-', 'Dhaka', '01777777777', 'mirza@email.com', 38, 'male', NOW() - INTERVAL '180 days', true, NOW());
