# 🔍 Debug Login Issue - Stuck Loading

## 🔴 Problem: Login Button Keeps Loading

This means there's an error happening. Let's find out what it is!

## 🔍 Step 1: Check Browser Console

1. **Open your browser** (where the app is running)
2. **Press F12** (or right-click → Inspect)
3. **Click "Console" tab**
4. **Try logging in again**
5. **Look for RED error messages**

### Common Errors You Might See:

#### Error 1: "User not found in users table"
**Meaning**: You created the auth user but didn't insert into users table

**Fix**: Run this SQL in Supabase:
```sql
-- First, get your user ID from Authentication tab
-- Then run this (replace UUID):
INSERT INTO users (id, email, role, branch_id, full_name, phone) 
VALUES 
('YOUR_UUID_HERE', 'admin@millenniumpotter.com', 'admin', NULL, 'System Administrator', '+234 800 000 0000');
```

#### Error 2: "Invalid login credentials"
**Meaning**: Wrong email or password

**Fix**: 
- Check email is exactly: `admin@millenniumpotter.com`
- Check password is exactly: `Admin@123456`
- Make sure user is confirmed in Supabase Auth

#### Error 3: "Failed to fetch" or "Network error"
**Meaning**: Can't connect to Supabase

**Fix**: 
- Check `.env` file has correct credentials
- Restart dev server: `Ctrl+C` then `npm run dev`

#### Error 4: "Row Level Security policy violation"
**Meaning**: RLS policies blocking access

**Fix**: Run the full migration to set up RLS policies

## 🔍 Step 2: Verify User Exists

### Check Auth User:
1. Go to: https://supabase.com/project/jprovhgmhoerajhkdnop/auth/users
2. Look for: `admin@millenniumpotter.com`
3. Check: ✅ Confirmed (should be green checkmark)

### Check Users Table:
1. Go to: https://supabase.com/project/jprovhgmhoerajhkdnop/editor
2. Click "users" table
3. Look for your admin user
4. Should see:
   - email: admin@millenniumpotter.com
   - role: admin
   - branch_id: NULL

## 🔍 Step 3: Test Database Connection

Run this in SQL Editor:

```sql
-- Test 1: Check if users table exists
SELECT COUNT(*) FROM users;

-- Test 2: Check if your user exists
SELECT * FROM users WHERE email = 'admin@millenniumpotter.com';

-- Test 3: Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'users';
```

**Expected results**:
- Test 1: Should return a number (0 or more)
- Test 2: Should show your admin user
- Test 3: Should show `rowsecurity = true`

## 🔍 Step 4: Check Environment Variables

1. Open `.env` file in your project
2. Verify it has:
```
VITE_SUPABASE_URL=https://jprovhgmhoerajhkdnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. If missing or wrong, fix it and restart server

## 🔧 Quick Fixes

### Fix 1: Restart Dev Server
```bash
# Press Ctrl+C to stop
npm run dev
```

### Fix 2: Clear Browser Cache
- Press `Ctrl+Shift+Delete`
- Clear cache
- Refresh page

### Fix 3: Check User is Confirmed
1. Go to Supabase Auth Users
2. Find your user
3. If not confirmed, click "..." → "Confirm user"

### Fix 4: Recreate User
If nothing works, delete and recreate:

1. **Delete from users table**:
```sql
DELETE FROM users WHERE email = 'admin@millenniumpotter.com';
```

2. **Delete from auth** (in Supabase Auth UI)

3. **Create again** (follow CREATE_USER_NOW.md)

## 📋 Debugging Checklist

- [ ] Opened browser console (F12)
- [ ] Saw error message in console
- [ ] User exists in Authentication tab
- [ ] User is confirmed (green checkmark)
- [ ] User exists in users table
- [ ] Email and password are correct
- [ ] .env file has correct credentials
- [ ] Dev server is running
- [ ] No network errors in console

## 🆘 Still Stuck?

### Share These Details:

1. **Error message from console** (copy the red text)
2. **Screenshot of console**
3. **Result of this SQL**:
```sql
SELECT * FROM users WHERE email = 'admin@millenniumpotter.com';
```

## 💡 Most Common Issue

**90% of the time it's**: User created in Authentication but NOT inserted into users table!

**Solution**:
1. Go to Auth tab, copy user UUID
2. Go to SQL Editor
3. Run INSERT INTO users... (with the UUID)
4. Try login again

---

**After fixing, restart dev server and try again!**
