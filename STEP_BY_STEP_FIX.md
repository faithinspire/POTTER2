# 🔧 STEP BY STEP FIX

## The Error
"Could not find the function public.authenticate_user" means you haven't run the SQL yet!

## ✅ DO THIS NOW:

### Step 1: Open Supabase SQL Editor
Go to: https://supabase.com/dashboard/project/wzsgulkmehebakotxlyt/sql

### Step 2: Copy the SQL
Open the file: `CUSTOM_AUTH_SETUP.sql`
Copy EVERYTHING (all 250+ lines)

### Step 3: Paste and RUN
1. Paste in SQL Editor
2. Click the green "RUN" button
3. Wait for it to complete
4. Should see: "Custom auth setup complete!"

### Step 4: Verify Functions Exist
Run this to check:
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('authenticate_user', 'create_user');
```

Should return 2 rows showing both functions exist.

### Step 5: Try Login Again
1. Go to http://localhost:5173/login
2. Email: admin@millenniumpotter.com
3. Password: Password123!
4. Click Sign In

## ⚠️ Important
You MUST run the SQL in Supabase before the app will work!

The functions `authenticate_user()` and `create_user()` are created by that SQL file.
