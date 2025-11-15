# 🔧 Fix Customer Registration Error - "business_address column not found"

## 🚨 Problem
Error when registering customer: `Could not find the 'business_address' column of 'customers' in the schema cache`

## ⚡ QUICK FIX (2 minutes)

### Step 1: Run SQL in Supabase

1. **Go to Supabase Dashboard**: https://app.supabase.com
2. **Click SQL Editor**
3. **Copy and paste this:**

```sql
-- Remove business_address column if it exists
ALTER TABLE customers DROP COLUMN IF EXISTS business_address;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
```

4. **Click Run**
5. **Wait for "Success"**

### Step 2: Test Registration

1. **Go back to your app**
2. **Try registering a customer again**
3. **Should work!** ✅

---

## 🔍 What Happened?

The error occurs because:
1. Supabase's schema cache thinks `business_address` column exists
2. But it doesn't actually exist in the database
3. Or it exists but your code doesn't use it

---

## 📋 Alternative Fixes

### Option A: Add the Column (if you need it)

```sql
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS business_address TEXT;
```

### Option B: Refresh Schema Cache Only

```sql
-- Force Supabase to reload the schema
NOTIFY pgrst, 'reload schema';

-- Or restart PostgREST
SELECT pg_notify('pgrst', 'reload schema');
```

### Option C: Check Current Columns

```sql
-- See what columns actually exist
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'customers'
ORDER BY ordinal_position;
```

---

## ✅ Verify Fix

After running the SQL:

1. **Check customers table** in Supabase Table Editor
2. **Verify columns** match your Customer type
3. **Try registration** again
4. **Should work without errors**

---

## 🎯 Expected Columns in customers Table

Based on your Customer type, these columns should exist:

- `id` (uuid)
- `full_name` (text)
- `phone` (text)
- `email` (text, nullable)
- `address` (text)
- `id_type` (text)
- `id_number` (text)
- `passport_photo_url` (text, nullable)
- `id_photo_url` (text, nullable)
- `branch_id` (uuid)
- `agent_id` (uuid)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**New columns from migration:**
- `photo_url` (text, nullable)
- `state_of_origin` (varchar)
- `occupation` (varchar)
- `marital_status` (varchar)
- `next_of_kin_name` (varchar)
- `next_of_kin_phone` (varchar)
- `next_of_kin_relationship` (varchar)
- `union_name` (varchar)
- `registration_notes` (text)

**NOT included:**
- ❌ `business_address` (this is causing the error)

---

## 🔧 If Error Persists

### 1. Clear Supabase Cache

In Supabase Dashboard:
- Go to **Settings** → **API**
- Click **Restart API** (if available)
- Or wait 5 minutes for cache to clear

### 2. Check Your Code

Search your codebase for `business_address`:
```bash
# In your project folder
grep -r "business_address" src/
```

If found, remove or update those references.

### 3. Verify Migration Ran

Check if the enhanced features migration ran:
```sql
-- Check if new columns exist
SELECT column_name 
FROM information_schema.columns
WHERE table_name = 'customers'
AND column_name IN ('photo_url', 'state_of_origin', 'occupation');
```

Should return 3 rows if migration ran successfully.

---

## 📞 Still Having Issues?

### Check These:

1. **Supabase Dashboard** → Table Editor → customers
   - What columns do you see?
   - Is `business_address` there?

2. **Browser Console** (F12)
   - What's the full error message?
   - Any other errors?

3. **Network Tab** (F12)
   - Check the failed request
   - What data is being sent?

---

## ✅ Success Checklist

- [ ] Ran SQL to drop business_address column
- [ ] Refreshed schema cache
- [ ] Verified customers table structure
- [ ] Tested customer registration
- [ ] Registration works without errors
- [ ] Customer appears in database

---

**🚀 Run the SQL fix now and registration will work immediately!**