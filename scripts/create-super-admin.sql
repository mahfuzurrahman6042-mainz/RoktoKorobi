-- =====================================================
-- CREATE SUPER ADMIN ACCOUNT - LOCAL SCRIPT
-- =====================================================
-- Run this script in your Supabase SQL Editor to create Super Admin

-- Step 1: Find your user ID (replace with your actual email)
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Step 2: Get Super Admin role ID
SELECT id, name FROM roles WHERE name = 'super_admin';

-- Step 3: Assign Super Admin role (replace with actual IDs from above)
INSERT INTO user_roles (
    user_id, 
    role_id, 
    is_active,
    assigned_at
) VALUES (
    'YOUR_USER_ID_HERE', -- Replace with actual user ID
    'YOUR_SUPER_ADMIN_ROLE_ID_HERE', -- Replace with actual role ID
    true,
    NOW()
) ON CONFLICT (user_id, role_id) DO NOTHING;

-- Step 4: Verify the assignment
SELECT 
    u.email,
    r.name as role_name,
    ur.is_active,
    ur.assigned_at
FROM user_roles ur
JOIN auth.users u ON ur.user_id = u.id
JOIN roles r ON ur.role_id = r.id
WHERE r.name = 'super_admin';
