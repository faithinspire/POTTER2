# 🔧 FIX: Infinite Recursion Error

## 🔴 The Error You're Seeing:

```
Error code: 42P17
Error message: infinite recursion detected in policy for relation "users"
```

## ✅ The Fix (2 Minutes):

### Step 1: Go to Supabase SQL Editor

👉 https://supabase.com/project/jprovhgmhoerajhkdnop/sql

### Step 2: Run This SQL

Click "New query" and paste this:

```sql
-- Drop problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Sub-admins can view branch users" ON users;
DROP POLICY IF EXISTS "Admins can manage users" ON users;

-- Create simple, working policies
CREATE POLICY "users_select_own"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_select_authenticated"
  ON users FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "users_all_service_role"
  ON users FOR ALL
  USING (auth.role() = 'service_role');
```

### Step 3: Click RUN

You should see: `Success. No rows returned`

### Step 4: Try Login Again!

Go to http://localhost:5173 and login with:
- Email: `admin@millenniumpotter.com`
- Password: `Admin@123456`

**It should work now!** 🎉

## 🎯 What This Does:

The old policies were checking the users table while reading the users table, causing infinite recursion.

The new policies:
- ✅ Let users read their own profile
- ✅ Let authenticated users read all users (simplified)
- ✅ Let service role do everything

This fixes the recursion issue!

## 🆘 If Still Not Working:

### Check 1: User Exists in Users Table

```sql
SELECT * FROM users WHERE email = 'admin@millenniumpotter.com';
```

Should show your admin user.

### Check 2: User is Confirmed

Go to: https://supabase.com/project/jprovhgmhoerajhkdnop/auth/users

Your user should have a green checkmark (confirmed).

### Check 3: Restart Dev Server

```bash
# Press Ctrl+C
npm run dev
```

## ✅ Success Looks Like:

After running the SQL and trying login:
- ✅ No "infinite recursion" error
- ✅ Login button stops loading
- ✅ You see the Admin Dashboard
- ✅ Welcome message with your name

---

**Status**: RLS policies causing recursion
**Fix**: Run the SQL above
**Result**: Login works! 🚀
