# 🔧 Fix "Database error querying schema"

This error means Supabase's auth schema is corrupted or the database is in a bad state.

## 🎯 Solution: Restart Supabase Database

### Option 1: Pause and Unpause Database (Recommended)

1. **Go to Supabase Dashboard:**
   https://supabase.com/dashboard/project/azuokmzqtxsuszowxckm

2. **Click "Settings"** (bottom left)

3. **Click "General"**

4. **Scroll down to "Pause project"**

5. **Click "Pause project"** and wait 30 seconds

6. **Click "Unpause project"** and wait for it to restart

7. **Try logging in again**

---

### Option 2: Check Database Health

1. **Go to Supabase Dashboard**

2. **Click "Database"** → **"Backups"**

3. **Check if there are any recent backups**

4. **If yes, consider restoring to a working backup**

---

### Option 3: Reset Auth Schema (Nuclear Option)

**⚠️ WARNING: This will delete ALL users!**

Run this in SQL Editor:

```sql
-- Reset auth schema
DROP SCHEMA IF EXISTS auth CASCADE;
CREATE SCHEMA auth;

-- Reinstall auth
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;
```

Then contact Supabase support to reinitialize the auth schema.

---

### Option 4: Create New Supabase Project

If nothing works, you may need to:

1. **Create a new Supabase project**
2. **Update your .env file** with new credentials
3. **Run COMPLETE_FRESH_START.sql** in the new project

---

## 🔍 Check Current Status

Run this in SQL Editor to see what's wrong:

```sql
-- Check if auth schema exists
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name = 'auth';

-- Check auth tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'auth';

-- Check if admin user exists
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'admin@millenniumpotter.com';
```

---

## 💡 Most Likely Fix

**Just pause and unpause your Supabase project.** This resets the database connections and often fixes schema errors.

After restarting:
1. Run `COMPLETE_FRESH_START.sql` again
2. Try logging in

---

## 🆘 Still Not Working?

The Supabase project might be corrupted. You have two options:

1. **Contact Supabase Support** (if on paid plan)
2. **Create a new project** and migrate

Let me know which option you want to try!
