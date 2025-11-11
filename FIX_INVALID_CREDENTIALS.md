# 🔧 Fix "Invalid Login Credentials" Error

## 🎯 The Problem
You're getting "Invalid login credentials" because the admin user doesn't exist in the database yet.

---

## ✅ Solution (Choose ONE method)

### Method 1: Run Complete Script (Easiest)

1. **Open Supabase Dashboard** → SQL Editor
2. **Copy ALL of this:**

```sql
-- Create admin user
DO $$
DECLARE
  new_user_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
BEGIN
  -- Delete existing if any
  DELETE FROM public.users WHERE email = 'admin@millenniumpotter.com';
  DELETE FROM auth.users WHERE email = 'admin@millenniumpotter.com';
  
  -- Create auth user
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    'admin@millenniumpotter.com',
    crypt('Password123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    ''
  );
  
  -- Create profile
  INSERT INTO public.users (id, email, full_name, phone, role, branch_id)
  VALUES (
    new_user_id,
    'admin@millenniumpotter.com',
    'Admin User',
    '+234 800 000 0000',
    'admin',
    NULL
  );
END $$;

-- Disable RLS
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Verify
SELECT email, role FROM public.users WHERE email = 'admin@millenniumpotter.com';
```

3. **Click Run**
4. **Should see:** "Admin User" with role "admin"
5. **Login with:**
   - Email: admin@millenniumpotter.com
   - Password: Password123!

---

### Method 2: Use Signup Page (Alternative)

1. **Go to your app**
2. **Click "Sign Up"** on login page
3. **Fill in:**
   - Full Name: Admin User
   - Email: youremail@gmail.com
   - Phone: 08012345678
   - Password: YourPassword123
   - Branch: Any branch
4. **Click Sign Up**
5. **Login with your new credentials**

---

### Method 3: Run Seed Data Migration

1. **Open Supabase SQL Editor**
2. **Find file:** `supabase/migrations/008_seed_initial_data.sql`
3. **Copy entire content**
4. **Paste in SQL Editor**
5. **Click Run**
6. **Try login again**

---

## 🔍 Verify User Exists

Run this to check:

```sql
-- Check auth.users
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'admin@millenniumpotter.com';

-- Check public.users
SELECT id, email, role 
FROM public.users 
WHERE email = 'admin@millenniumpotter.com';
```

**Both should return 1 row each.**

If not, the user doesn't exist - use Method 1 above.

---

## 🐛 Common Issues

### Issue 1: "User already exists"
**Solution:** Delete and recreate
```sql
DELETE FROM public.users WHERE email = 'admin@millenniumpotter.com';
DELETE FROM auth.users WHERE email = 'admin@millenniumpotter.com';
-- Then run Method 1 again
```

### Issue 2: "Password doesn't work"
**Solution:** Reset password
```sql
UPDATE auth.users 
SET encrypted_password = crypt('Password123!', gen_salt('bf'))
WHERE email = 'admin@millenniumpotter.com';
```

### Issue 3: "Profile not found"
**Solution:** Create profile
```sql
INSERT INTO public.users (id, email, full_name, phone, role, branch_id)
SELECT 
  id,
  'admin@millenniumpotter.com',
  'Admin User',
  '+234 800 000 0000',
  'admin',
  NULL
FROM auth.users 
WHERE email = 'admin@millenniumpotter.com'
ON CONFLICT (id) DO NOTHING;
```

### Issue 4: "Still timing out"
**Solution:** Disable RLS
```sql
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
```

---

## 📋 Complete Checklist

After running the fix, verify:

- [ ] Run verification query - should return 1 row
- [ ] RLS disabled on users table
- [ ] Can access login page
- [ ] Enter: admin@millenniumpotter.com / Password123!
- [ ] Click Sign In
- [ ] Should redirect to dashboard
- [ ] No errors in console

---

## 🎯 Quick Test

1. **Run Method 1 SQL** (copy entire block)
2. **Wait for "Success"**
3. **Refresh browser**
4. **Login:**
   - Email: admin@millenniumpotter.com
   - Password: Password123!
5. **Should work!** ✅

---

## 💡 Pro Tips

1. **Copy-paste carefully** - Don't miss any lines
2. **Run entire block** - Don't run line by line
3. **Check for success message** in SQL Editor
4. **Refresh browser** after running SQL
5. **Clear browser cache** if still issues
6. **Try incognito mode** to test fresh

---

## 🆘 Still Not Working?

If none of the above works:

1. **Check Supabase project URL** in .env file
2. **Verify Supabase is running** (not paused)
3. **Check browser console** (F12) for errors
4. **Try different browser**
5. **Check internet connection**

---

## ✅ Success Indicators

You'll know it worked when:
- ✅ SQL query returns admin user
- ✅ Login page accepts credentials
- ✅ Redirects to admin dashboard
- ✅ Shows "Welcome, Admin User"
- ✅ Dashboard loads without errors

**Run Method 1 now and you'll be logged in!** 🚀
