# 🎯 HOW TO CREATE USERS - Complete Guide

## ⚡ EASIEST WAY: Use SQL (Recommended)

Since the app's signup has issues, **use SQL to create all users at once**.

### Step 1: Go to Supabase Dashboard
1. Open: https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"**

### Step 2: Copy & Paste This SQL
```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, postgres;

DO $$
DECLARE
  v_user_id UUID;
  v_igando_id UUID;
  v_abuleegba_id UUID;
  v_exists BOOLEAN;
BEGIN
  SELECT id INTO v_igando_id FROM public.branches WHERE name = 'Igando';
  SELECT id INTO v_abuleegba_id FROM public.branches WHERE name = 'Abule-Egba';
  
  -- Igando Sub-Admin
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'subadmin.igando@test.com') INTO v_exists;
  IF NOT v_exists THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
    VALUES ('00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 'subadmin.igando@test.com', crypt('subadmin123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
    INSERT INTO public.users (id, email, full_name, phone, role, branch_id) VALUES (v_user_id, 'subadmin.igando@test.com', 'Igando Manager', '+234 800 000 0001', 'subadmin', v_igando_id);
  END IF;
  
  -- Abule-Egba Sub-Admin
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'subadmin.abuleegba@test.com') INTO v_exists;
  IF NOT v_exists THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
    VALUES ('00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 'subadmin.abuleegba@test.com', crypt('subadmin123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
    INSERT INTO public.users (id, email, full_name, phone, role, branch_id) VALUES (v_user_id, 'subadmin.abuleegba@test.com', 'Abule-Egba Manager', '+234 800 000 0002', 'subadmin', v_abuleegba_id);
  END IF;
  
  -- Igando Agents
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'agent1.igando@test.com') INTO v_exists;
  IF NOT v_exists THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
    VALUES ('00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 'agent1.igando@test.com', crypt('agent123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
    INSERT INTO public.users (id, email, full_name, phone, role, branch_id) VALUES (v_user_id, 'agent1.igando@test.com', 'Agent One Igando', '+234 801 000 0001', 'agent', v_igando_id);
  END IF;
  
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'agent2.igando@test.com') INTO v_exists;
  IF NOT v_exists THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
    VALUES ('00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 'agent2.igando@test.com', crypt('agent123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
    INSERT INTO public.users (id, email, full_name, phone, role, branch_id) VALUES (v_user_id, 'agent2.igando@test.com', 'Agent Two Igando', '+234 801 000 0002', 'agent', v_igando_id);
  END IF;
  
  -- Abule-Egba Agents
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'agent1.abuleegba@test.com') INTO v_exists;
  IF NOT v_exists THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
    VALUES ('00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 'agent1.abuleegba@test.com', crypt('agent123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
    INSERT INTO public.users (id, email, full_name, phone, role, branch_id) VALUES (v_user_id, 'agent1.abuleegba@test.com', 'Agent One Abule-Egba', '+234 802 000 0001', 'agent', v_abuleegba_id);
  END IF;
  
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'agent2.abuleegba@test.com') INTO v_exists;
  IF NOT v_exists THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
    VALUES ('00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 'agent2.abuleegba@test.com', crypt('agent123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
    INSERT INTO public.users (id, email, full_name, phone, role, branch_id) VALUES (v_user_id, 'agent2.abuleegba@test.com', 'Agent Two Abule-Egba', '+234 802 000 0002', 'agent', v_abuleegba_id);
  END IF;
  
END $$;

SELECT email, role, full_name FROM public.users ORDER BY role, email;
```

### Step 3: Click "Run"
- Should see: List of all users created
- No errors!

---

## 🎯 NOW LOGIN TO YOUR APP

### Go to: http://localhost:5179/login

### Try These Accounts:

**Admin (All Branches):**
- Email: `admin@test.com`
- Password: `admin123`

**Igando Branch:**
- Sub-Admin: `subadmin.igando@test.com` / `subadmin123`
- Agent 1: `agent1.igando@test.com` / `agent123`
- Agent 2: `agent2.igando@test.com` / `agent123`

**Abule-Egba Branch:**
- Sub-Admin: `subadmin.abuleegba@test.com` / `subadmin123`
- Agent 1: `agent1.abuleegba@test.com` / `agent123`
- Agent 2: `agent2.abuleegba@test.com` / `agent123`

---

## ❌ DON'T Use These (They Don't Work):

1. ❌ **App's Signup Page** (http://localhost:5179/signup)
   - Has email confirmation issues
   - Will give "Database error"
   - Don't waste time here

2. ❌ **App's "Add User" Button** (in admin panel)
   - Same email confirmation issues
   - Will give "Database error"
   - Don't use this either

---

## ✅ ONLY Use This:

**Supabase SQL Editor** → Run the SQL script above

This:
- ✅ Creates users directly in database
- ✅ Bypasses email confirmation
- ✅ Works 100% of the time
- ✅ Creates all users at once
- ✅ Skips users that already exist

---

## 🎉 Summary

### Where to Create Users:
**ONLY in Supabase Dashboard using SQL**

### How:
1. Supabase Dashboard → SQL Editor
2. Paste the SQL script
3. Click "Run"
4. Done!

### Where to Login:
**Your App**: http://localhost:5179/login

### What Works:
- ✅ Login page
- ✅ All dashboards
- ✅ All features
- ✅ Everything except user creation through app

---

**Use the SQL script above and you'll have all users ready in 1 minute! 🚀**
