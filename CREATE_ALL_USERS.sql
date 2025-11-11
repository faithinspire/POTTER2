-- ============================================
-- CREATE ALL USERS - Admin, Sub-Admins, Agents
-- This creates a complete set of users for testing
-- ============================================

-- Step 1: Drop trigger and disable security
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, postgres;

-- Step 2: Ensure branches exist
INSERT INTO public.branches (name, address, phone)
VALUES 
  ('Igando', 'Igando, Lagos', '+234 800 000 0001'),
  ('Abule-Egba', 'Abule-Egba, Lagos', '+234 800 000 0002')
ON CONFLICT (name) DO NOTHING;

-- Step 3: Create all users
DO $$
DECLARE
  v_user_id UUID;
  v_igando_branch_id UUID;
  v_abuleegba_branch_id UUID;
BEGIN
  -- Get branch IDs
  SELECT id INTO v_igando_branch_id FROM public.branches WHERE name = 'Igando';
  SELECT id INTO v_abuleegba_branch_id FROM public.branches WHERE name = 'Abule-Egba';
  
  -- ============================================
  -- 1. CREATE ADMIN USER
  -- ============================================
  v_user_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 'admin@test.com', crypt('admin123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
  INSERT INTO public.users (id, email, full_name, phone, role, branch_id)
  VALUES (v_user_id, 'admin@test.com', 'Admin User', '+234 800 000 0000', 'admin', NULL);
  RAISE NOTICE 'Created: Admin (admin@test.com / admin123)';
  
  -- ============================================
  -- 2. CREATE IGANDO SUB-ADMIN
  -- ============================================
  v_user_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 'subadmin.igando@test.com', crypt('subadmin123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
  INSERT INTO public.users (id, email, full_name, phone, role, branch_id)
  VALUES (v_user_id, 'subadmin.igando@test.com', 'Igando Manager', '+234 800 000 0001', 'subadmin', v_igando_branch_id);
  RAISE NOTICE 'Created: Igando Sub-Admin (subadmin.igando@test.com / subadmin123)';
  
  -- ============================================
  -- 3. CREATE ABULE-EGBA SUB-ADMIN
  -- ============================================
  v_user_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 'subadmin.abuleegba@test.com', crypt('subadmin123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
  INSERT INTO public.users (id, email, full_name, phone, role, branch_id)
  VALUES (v_user_id, 'subadmin.abuleegba@test.com', 'Abule-Egba Manager', '+234 800 000 0002', 'subadmin', v_abuleegba_branch_id);
  RAISE NOTICE 'Created: Abule-Egba Sub-Admin (subadmin.abuleegba@test.com / subadmin123)';
  
  -- ============================================
  -- 4. CREATE IGANDO AGENTS
  -- ============================================
  v_user_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 'agent1.igando@test.com', crypt('agent123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
  INSERT INTO public.users (id, email, full_name, phone, role, branch_id)
  VALUES (v_user_id, 'agent1.igando@test.com', 'Agent One Igando', '+234 801 000 0001', 'agent', v_igando_branch_id);
  RAISE NOTICE 'Created: Igando Agent 1 (agent1.igando@test.com / agent123)';
  
  v_user_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 'agent2.igando@test.com', crypt('agent123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
  INSERT INTO public.users (id, email, full_name, phone, role, branch_id)
  VALUES (v_user_id, 'agent2.igando@test.com', 'Agent Two Igando', '+234 801 000 0002', 'agent', v_igando_branch_id);
  RAISE NOTICE 'Created: Igando Agent 2 (agent2.igando@test.com / agent123)';
  
  -- ============================================
  -- 5. CREATE ABULE-EGBA AGENTS
  -- ============================================
  v_user_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 'agent1.abuleegba@test.com', crypt('agent123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
  INSERT INTO public.users (id, email, full_name, phone, role, branch_id)
  VALUES (v_user_id, 'agent1.abuleegba@test.com', 'Agent One Abule-Egba', '+234 802 000 0001', 'agent', v_abuleegba_branch_id);
  RAISE NOTICE 'Created: Abule-Egba Agent 1 (agent1.abuleegba@test.com / agent123)';
  
  v_user_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 'agent2.abuleegba@test.com', crypt('agent123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
  INSERT INTO public.users (id, email, full_name, phone, role, branch_id)
  VALUES (v_user_id, 'agent2.abuleegba@test.com', 'Agent Two Abule-Egba', '+234 802 000 0002', 'agent', v_abuleegba_branch_id);
  RAISE NOTICE 'Created: Abule-Egba Agent 2 (agent2.abuleegba@test.com / agent123)';
  
END $$;

-- Step 4: Show all created users
SELECT 
  u.email,
  u.role,
  u.full_name,
  b.name as branch
FROM public.users u
LEFT JOIN public.branches b ON u.branch_id = b.id
ORDER BY 
  CASE u.role 
    WHEN 'admin' THEN 1 
    WHEN 'subadmin' THEN 2 
    WHEN 'agent' THEN 3 
  END,
  b.name,
  u.email;

-- Step 5: Show login credentials
SELECT '
============================================
ALL USERS CREATED SUCCESSFULLY!
============================================

ADMIN:
  Email: admin@test.com
  Password: admin123
  Access: All branches

IGANDO BRANCH:
  Sub-Admin: subadmin.igando@test.com / subadmin123
  Agent 1: agent1.igando@test.com / agent123
  Agent 2: agent2.igando@test.com / agent123

ABULE-EGBA BRANCH:
  Sub-Admin: subadmin.abuleegba@test.com / subadmin123
  Agent 1: agent1.abuleegba@test.com / agent123
  Agent 2: agent2.abuleegba@test.com / agent123

LOGIN AT: http://localhost:5179/login
============================================
' as "LOGIN CREDENTIALS";
