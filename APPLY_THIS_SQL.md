# 🔧 Apply This SQL - Step by Step

## ⚡ Quick Fix (2 Minutes)

### Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"** button

### Step 2: Copy This EXACT SQL

```sql
-- Drop existing
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_branch_id UUID;
BEGIN
  SELECT id INTO v_branch_id FROM public.branches LIMIT 1;
  
  INSERT INTO public.users (
    id, email, full_name, phone, role, branch_id
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'agent')::user_role,
    CASE 
      WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'agent') = 'admin' 
      THEN NULL
      ELSE COALESCE((NEW.raw_user_meta_data->>'branch_id')::UUID, v_branch_id)
    END
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
```

### Step 3: Run It

1. Paste the SQL above into the editor
2. Click **"Run"** button (or press Ctrl+Enter)
3. You should see: **"Success. No rows returned"**
4. Done! ✅

---

## ✅ What This Does

When someone signs up:
1. Supabase Auth creates the account
2. This trigger automatically creates their profile in the `users` table
3. They can login immediately
4. No manual SQL needed!

---

## 🎯 After Running This

### Test It:

1. Go to: **http://localhost:5179/signup**
2. Create an account
3. Login
4. Dashboard loads! 🎉

---

## 🐛 If You Get an Error

### Error: "relation auth.users does not exist"
**Solution**: You're in the wrong database. Make sure you selected your project.

### Error: "type user_role does not exist"
**Solution**: Run the earlier migrations first (001-009).

### Error: "table branches does not exist"
**Solution**: Run migration 001 first to create branches.

---

## 📋 Verify It Worked

Run this to check:

```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Check if function exists
SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
```

You should see results for both!

---

## 🚀 Next Steps

1. ✅ SQL applied
2. Go to http://localhost:5179/signup
3. Create your account
4. Login
5. Start using the app!

**That's it! Your app now has automatic user registration! 🎉**
