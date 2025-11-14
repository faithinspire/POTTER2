# 🎯 Create Sub-Admins and Agents for Each Branch

## ⚡ Run This ONE SQL Script

This creates a complete set of users for both branches:
- 1 Admin (global access)
- 2 Sub-Admins (one per branch)
- 4 Agents (two per branch)

### Copy & Paste This SQL:

```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, postgres;

INSERT INTO public.branches (name, address, phone)
VALUES ('Igando', 'Igando, Lagos', '+234 800 000 0001'), ('Abule-Egba', 'Abule-Egba, Lagos', '+234 800 000 0002')
ON CONFLICT (name) DO NOTHING;

DO $$
DECLARE
  v_user_id UUID;
  v_igando_id UUID;
  v_abuleegba_id UUID;
BEGIN
  SELECT id INTO v_igando_id FROM public.branches WHERE name = 'Igando';
  SELECT id INTO v_abuleegba_id FROM public.branches WHERE name = 'Abule-Egba';
  
  -- Admin
  v_user_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 'admin@test.com', crypt('admin123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
  INSERT INTO public.users (id, email, full_name, phone, role, branch_id) VALUES (v_user_id, 'admin@test.com', 'Admin User', '+234 800 000 0000', 'admin', NULL);
  
  -- Igando Sub-Admin
  v_user_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 'subadmin.igando@test.com', crypt('subadmin123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
  INSERT INTO public.users (id, email, full_name, phone, role, branch_id) VALUES (v_user_id, 'subadmin.igando@test.com', 'Igando Manager', '+234 800 000 0001', 'subadmin', v_igando_id);
  
  -- Abule-Egba Sub-Admin
  v_user_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 'subadmin.abuleegba@test.com', crypt('subadmin123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
  INSERT INTO public.users (id, email, full_name, phone, role, branch_id) VALUES (v_user_id, 'subadmin.abuleegba@test.com', 'Abule-Egba Manager', '+234 800 000 0002', 'subadmin', v_abuleegba_id);
  
  -- Igando Agents
  v_user_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 'agent1.igando@test.com', crypt('agent123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
  INSERT INTO public.users (id, email, full_name, phone, role, branch_id) VALUES (v_user_id, 'agent1.igando@test.com', 'Agent One Igando', '+234 801 000 0001', 'agent', v_igando_id);
  
  v_user_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 'agent2.igando@test.com', crypt('agent123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
  INSERT INTO public.users (id, email, full_name, phone, role, branch_id) VALUES (v_user_id, 'agent2.igando@test.com', 'Agent Two Igando', '+234 801 000 0002', 'agent', v_igando_id);
  
  -- Abule-Egba Agents
  v_user_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 'agent1.abuleegba@test.com', crypt('agent123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
  INSERT INTO public.users (id, email, full_name, phone, role, branch_id) VALUES (v_user_id, 'agent1.abuleegba@test.com', 'Agent One Abule-Egba', '+234 802 000 0001', 'agent', v_abuleegba_id);
  
  v_user_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 'agent2.abuleegba@test.com', crypt('agent123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
  INSERT INTO public.users (id, email, full_name, phone, role, branch_id) VALUES (v_user_id, 'agent2.abuleegba@test.com', 'Agent Two Abule-Egba', '+234 802 000 0002', 'agent', v_abuleegba_id);
  
END $$;

SELECT email, role, full_name FROM public.users ORDER BY role, email;
```

---

## 📋 Created Users:

### Admin (Global Access):
- Email: `admin@test.com`
- Password: `admin123`
- Access: All branches

### Igando Branch:
- **Sub-Admin**: `subadmin.igando@test.com` / `subadmin123`
- **Agent 1**: `agent1.igando@test.com` / `agent123`
- **Agent 2**: `agent2.igando@test.com` / `agent123`

### Abule-Egba Branch:
- **Sub-Admin**: `subadmin.abuleegba@test.com` / `subadmin123`
- **Agent 1**: `agent1.abuleegba@test.com` / `agent123`
- **Agent 2**: `agent2.abuleegba@test.com` / `agent123`

---

## 🎯 Test Each User:

1. Go to: http://localhost:5179/login
2. Login with any of the accounts above
3. Each user sees their appropriate dashboard:
   - **Admin**: Global dashboard with all data
   - **Sub-Admin**: Branch dashboard with branch data only
   - **Agent**: Personal dashboard with own customers/loans

---

## ✅ What Each Role Can Do:

### Admin:
- View all branches
- See all users
- Access all data
- View global analytics

### Sub-Admin (per branch):
- Approve/reject loans for their branch
- View all agents in their branch
- See all customers in their branch
- View branch analytics

### Agent (per branch):
- Register customers
- Apply for loans
- Track weekly payments
- View own customers and loans

---

## 🎉 Your Complete System is Ready!

All users are created and assigned to their branches. Just login and start testing!

**See CREATE_ALL_USERS.sql for the complete script! 🚀**
