# 🚀 Apply Auto-Registration Setup

## ⚡ Quick Setup (Run This Once)

### Step 1: Apply the Database Migration

Open your Supabase SQL Editor and run this:

```sql
-- ============================================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- ============================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $
DECLARE
  v_branch_id UUID;
BEGIN
  -- Get the first branch (Igando) as default
  SELECT id INTO v_branch_id FROM public.branches LIMIT 1;

  -- Insert into public.users table
  INSERT INTO public.users (
    id,
    email,
    full_name,
    phone,
    role,
    branch_id
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'agent')::user_role,
    CASE 
      WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'agent') = 'admin' THEN NULL
      ELSE COALESCE((NEW.raw_user_meta_data->>'branch_id')::UUID, v_branch_id)
    END
  );

  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
```

### Step 2: Test It!

1. Open http://localhost:5179/
2. Click "Sign Up"
3. Fill in the form
4. Submit
5. Login with your new account!

---

## ✅ What This Does

### Automatic User Profile Creation
When someone signs up:
1. ✅ Supabase Auth creates the auth user
2. ✅ Trigger automatically creates profile in `users` table
3. ✅ User can login immediately
4. ✅ No manual SQL needed!

### Default Values:
- **Role**: Agent (can be changed during signup)
- **Branch**: First branch (Igando) if not specified
- **Full Name**: From signup form or email username
- **Phone**: From signup form

---

## 🎯 New Features

### 1. Public Signup Page (/signup)
- Anyone can create an account
- Choose role (Agent, Sub-Admin, Admin)
- Select branch
- Set password
- Auto-registered in database

### 2. Updated Login Page
- "Sign Up" link added
- Cleaner design
- Better mobile responsiveness

### 3. Seamless Registration
- No admin approval needed
- Instant access after signup
- Profile auto-created
- Ready to use immediately

---

## 🔐 Test Accounts

### Create Your Own!
1. Go to http://localhost:5179/signup
2. Fill in your details
3. Choose your role
4. Submit
5. Login!

### Or Use Admin Panel:
1. Login as admin (if you have one)
2. Go to "Manage Users"
3. Click "+ Add New User"
4. Create accounts

---

## 📋 Migration File Location

The migration is saved at:
```
supabase/migrations/010_auto_create_user_profile.sql
```

You can also apply it via Supabase CLI:
```bash
supabase db push
```

---

## 🎉 Benefits

### Before:
- ❌ Had to create users via SQL
- ❌ Manual profile creation
- ❌ Complex setup process
- ❌ Admin-only user creation

### After:
- ✅ Public signup page
- ✅ Auto profile creation
- ✅ Instant registration
- ✅ Anyone can sign up
- ✅ Seamless login

---

## 🚀 Ready to Use!

Your app now has:
- ✅ Public signup (/signup)
- ✅ Auto-registration trigger
- ✅ Seamless user creation
- ✅ No SQL needed
- ✅ Instant access

**Go to http://localhost:5179/signup and create your first account!**
