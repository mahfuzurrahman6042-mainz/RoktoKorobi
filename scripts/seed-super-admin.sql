-- =====================================================
-- OFFLINE SUPER ADMIN CREATION SCRIPT
-- Run this in Supabase SQL Editor to create Super Admin
-- =====================================================

-- Step 1: Create a test Super Admin user (if you don't have one yet)
-- This creates a user with email: admin@roktokorobi.com
-- You can change the email to your preferred one

INSERT INTO auth.users (
    id,
    email,
    email_confirmed_at,
    phone,
    phone_confirmed_at,
    created_at,
    updated_at,
    last_sign_in_at,
    raw_user_meta_data,
    raw_app_meta_data,
    is_super_admin,
    role
) VALUES (
    gen_random_uuid(), -- Auto-generate UUID
    'admin@roktokorobi.com', -- Change this to your email
    NOW(),
    NULL,
    NULL,
    NOW(),
    NOW(),
    NOW(),
    '{}',
    '{}',
    false,
    'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Step 2: Get the user ID for the created user
-- Run this to find the user ID, then use it in Step 4
SELECT id, email FROM auth.users WHERE email = 'admin@roktokorobi.com';

-- Step 3: Get the Super Admin role ID
SELECT id, name FROM roles WHERE name = 'super_admin';

-- Step 4: Assign Super Admin role (replace with actual IDs from above)
-- First, find your user ID by running the query in Step 2
-- Then find the Super Admin role ID by running the query in Step 3
-- Finally, run this INSERT with the actual IDs:

-- Example (replace the UUIDs with your actual IDs):
INSERT INTO user_roles (
    user_id, 
    role_id, 
    is_active,
    assigned_at
) VALUES (
    'YOUR_USER_ID_HERE', -- Replace with actual user ID from Step 2
    'YOUR_ROLE_ID_HERE', -- Replace with actual role ID from Step 3
    true,
    NOW()
) ON CONFLICT (user_id, role_id) DO NOTHING;

-- Step 5: Create user profile for the Super Admin
-- Replace the user_id with your actual user ID
INSERT INTO user_profiles (
    user_id,
    full_name,
    is_verified,
    is_suspended,
    created_at,
    updated_at
) VALUES (
    'YOUR_USER_ID_HERE', -- Replace with actual user ID
    'Super Admin',
    true,
    false,
    NOW(),
    NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- Step 6: Verify everything is set up correctly
SELECT 
    u.email,
    up.full_name,
    r.name as role_name,
    ur.is_active,
    ur.assigned_at
FROM user_roles ur
JOIN auth.users u ON ur.user_id = u.id
JOIN roles r ON ur.role_id = r.id
JOIN user_profiles up ON ur.user_id = up.user_id
WHERE r.name = 'super_admin';

-- =====================================================
-- INSTRUCTIONS:
-- 1. Run Step 1 to create the user
-- 2. Run Step 2 to get your user ID
-- 3. Run Step 3 to get the Super Admin role ID
-- 4. Update Step 4 with your actual IDs and run it
-- 5. Update Step 5 with your user ID and run it
-- 6. Run Step 6 to verify the setup
-- =====================================================
