# 🔐 Login Credentials & Fix

## 🚨 CRITICAL: Fix Login Timeout First!

### The Problem
"Profile fetch timeout after 10 seconds" means RLS is blocking the database query.

### The Solution (30 seconds)
1. Open Supabase Dashboard → SQL Editor
2. Copy and paste this:
```sql
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
```
3. Click **Run**
4. Refresh your browser
5. Try logging in again

---

## 🔑 Default Login Credentials

### Admin Account
```
Email: admin@millenniumpotter.com
Password: Password123!
```

### Sub-Admin Accounts
```
Ikeja Branch:
Email: subadmin.ikeja@millenniumpotter.com
Password: Password123!

Lekki Branch:
Email: subadmin.lekki@millenniumpotter.com
Password: Password123!
```

### Agent Accounts
```
Agent 1 (Ikeja):
Email: agent1.ikeja@millenniumpotter.com
Password: Password123!

Agent 2 (Ikeja):
Email: agent2.ikeja@millenniumpotter.com
Password: Password123!
```

---

## 📋 Step-by-Step Login Process

### Step 1: Fix Database (If Not Done)
```sql
-- Run in Supabase SQL Editor
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
```

### Step 2: Login
1. Go to your app (http://localhost:5176 or your URL)
2. Enter credentials:
   - Email: `admin@millenniumpotter.com`
   - Password: `Password123!`
3. Click "Sign In"
4. Should redirect to Admin Dashboard

### Step 3: Verify
- You should see "Welcome, Admin User"
- Dashboard should load with stats
- No timeout errors

---

## 🐛 Troubleshooting

### Still Getting Timeout?

**Check 1: RLS Status**
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'users';
```
Should show `rowsecurity = false`

**Check 2: User Exists**
```sql
SELECT id, email, role 
FROM public.users 
WHERE email = 'admin@millenniumpotter.com';
```
Should return one row

**Check 3: Auth User Exists**
```sql
SELECT id, email 
FROM auth.users 
WHERE email = 'admin@millenniumpotter.com';
```
Should return one row

### User Doesn't Exist?

Run this to create admin user:
```sql
-- Create admin user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@millenniumpotter.com',
  crypt('Password123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW()
)
RETURNING id;

-- Then create profile (use the ID from above)
INSERT INTO public.users (
  id,
  email,
  full_name,
  phone,
  role,
  branch_id
)
VALUES (
  '[PASTE_ID_FROM_ABOVE]',
  'admin@millenniumpotter.com',
  'Admin User',
  '+234 800 000 0000',
  'admin',
  NULL
);
```

### Wrong Password?

Reset password:
```sql
UPDATE auth.users 
SET encrypted_password = crypt('Password123!', gen_salt('bf'))
WHERE email = 'admin@millenniumpotter.com';
```

---

## ✅ Quick Verification

After fixing, verify everything works:

1. **Login Test**
   - Email: admin@millenniumpotter.com
   - Password: Password123!
   - Should login successfully

2. **Dashboard Test**
   - Should see Admin Dashboard
   - Stats should load
   - No errors in console

3. **Navigation Test**
   - Click "Manage Users"
   - Should see user list
   - Can create new users

---

## 📱 All Login Credentials Summary

| Role | Email | Password | Branch |
|------|-------|----------|--------|
| Admin | admin@millenniumpotter.com | Password123! | - |
| Sub-Admin | subadmin.ikeja@millenniumpotter.com | Password123! | Ikeja |
| Sub-Admin | subadmin.lekki@millenniumpotter.com | Password123! | Lekki |
| Agent | agent1.ikeja@millenniumpotter.com | Password123! | Ikeja |
| Agent | agent2.ikeja@millenniumpotter.com | Password123! | Ikeja |

---

## 🎯 What to Do Right Now

1. **Open Supabase SQL Editor**
2. **Run this one line:**
   ```sql
   ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
   ```
3. **Refresh your browser**
4. **Login with:**
   - Email: admin@millenniumpotter.com
   - Password: Password123!
5. **Done!** ✅

---

## 💡 Pro Tips

1. **Remember the password:** Password123!
2. **Case sensitive:** Use exact email
3. **Clear browser cache** if issues persist
4. **Check browser console** (F12) for errors
5. **Use incognito mode** to test fresh

---

## 🎉 After Successful Login

You'll have access to:
- ✅ Admin Dashboard
- ✅ User Management
- ✅ Create/Delete Users
- ✅ View Analytics
- ✅ Download Reports
- ✅ All Admin Features

**Login now and start using your app!** 🚀
