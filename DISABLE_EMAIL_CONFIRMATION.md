# 🔧 Disable Email Confirmation in Supabase

The "Database error querying schema" might be caused by email confirmation settings.

## Fix: Disable Email Confirmation

1. **Go to Supabase Dashboard:**
   https://supabase.com/dashboard/project/wzsgulkmehebakotxlyt

2. **Click "Authentication"** (left sidebar)

3. **Click "Providers"** tab

4. **Scroll down to "Email"**

5. **UNCHECK "Confirm email"**

6. **Click "Save"**

7. **Try signing up/logging in again**

---

## Also Check: Auth Settings

1. **Go to "Authentication" → "Settings"**

2. **Make sure these are set:**
   - ✅ **Enable email signups:** ON
   - ❌ **Confirm email:** OFF
   - ❌ **Secure email change:** OFF (optional)
   - ✅ **Enable phone signups:** OFF (we're not using it)

3. **Click "Save"**

---

## Test Again

1. **Create a brand new Supabase project** (4th time's the charm!)
2. **BEFORE running ANY SQL:**
   - Disable email confirmation (steps above)
3. **Then run `WORKING_SETUP.sql`**
4. **Use signup page to create admin**
5. **Login**

This should work!
