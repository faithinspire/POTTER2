# 🔧 Fix "Database error saving new user"

## 🎯 The Problem

The error happens because Row Level Security (RLS) is blocking the user profile creation.

## ⚡ QUICK FIX (1 Minute)

### Run This SQL in Supabase:

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"**
4. Click **"New Query"**
5. Paste this:

```sql
-- Disable RLS temporarily for testing
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Add policy to allow signup
DROP POLICY IF EXISTS "Allow public signup" ON public.users;
CREATE POLICY "Allow public signup"
  ON public.users
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Add policy to allow users to read their own data
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);
```

6. Click **"Run"**
7. Done! ✅

---

## 🎯 Now Test Signup

1. Go to: http://localhost:5179/signup
2. Fill in the form:
   ```
   Full Name: Test User
   Email: test@example.com
   Phone: +234 800 000 0000
   Role: Admin
   Password: test123
   Confirm Password: test123
   ```
3. Click **"Create Account"**
4. Should work now! ✅

---

## 🔐 Alternative: Create Admin Manually

If signup still doesn't work, create admin manually:

### Step 1: Create Auth User
1. Supabase Dashboard → **Authentication** → **Users**
2. Click **"Add User"**
3. Email: `admin@test.com`
4. Password: `admin123`
5. Click **"Create User"**
6. **Copy the User ID**

### Step 2: Create Profile
1. Go to **SQL Editor**
2. Run this (replace YOUR_USER_ID):

```sql
INSERT INTO public.users (id, email, full_name, phone, role, branch_id)
VALUES (
  'YOUR_USER_ID'::uuid,
  'admin@test.com',
  'Admin User',
  '+234 800 000 0000',
  'admin',
  NULL
);
```

### Step 3: Login
1. Go to: http://localhost:5179/login
2. Email: `admin@test.com`
3. Password: `admin123`
4. Done! ✅

---

## 🐛 Why This Happens

### The Issue:
- Row Level Security (RLS) is enabled on the `users` table
- RLS policies block anonymous users from inserting data
- Signup tries to create a profile but gets blocked

### The Fix:
- Disable RLS temporarily (for testing)
- OR add a policy that allows public signup
- OR create users manually via Supabase Dashboard

---

## ✅ Verification

After running the SQL, check:

```sql
-- Check if RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'users';
```

Should show:
- `rowsecurity = false` (RLS disabled)
- OR policies that allow INSERT

---

## 🎉 Success!

After applying the fix:
- ✅ Signup works
- ✅ Can create accounts
- ✅ Can login
- ✅ Dashboard loads

---

## 🔒 Security Note

**For Production:**
- Re-enable RLS
- Add proper policies
- Use backend API for user creation
- Validate roles server-side

**For Testing/Development:**
- Disabling RLS is fine
- Allows quick testing
- Can re-enable later

---

## 🚀 Quick Commands

### Disable RLS (Testing):
```sql
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
```

### Enable RLS (Production):
```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
```

### Check RLS Status:
```sql
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'users';
```

---

## 💡 What to Do Now

1. ✅ Run the SQL fix above
2. ✅ Test signup at /signup
3. ✅ Or create admin manually
4. ✅ Login and use the app!

**Your signup should work now! 🎉**
