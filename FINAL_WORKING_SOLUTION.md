# ✅ FINAL WORKING SOLUTION

The "Database error querying schema" happens because we're trying to insert directly into `auth.users`. **DON'T DO THAT!**

## 🎯 The Right Way (3 Steps)

### Step 1: Run SQL Migration (1 minute)

1. Go to Supabase SQL Editor
2. Copy ALL of `WORKING_SETUP.sql`
3. Paste and click RUN
4. Should see: "Tables created successfully!"

### Step 2: Create Admin via Signup Page (30 seconds)

**DO NOT create admin in SQL!** Use the app instead:

1. Go to: http://localhost:5173/signup
2. Fill in:
   - **Full Name:** Admin User
   - **Email:** admin@millenniumpotter.com
   - **Phone:** +234 800 000 0000
   - **Role:** Admin
   - **Password:** Password123!
   - **Confirm Password:** Password123!
3. Click "Create Account"
4. Should see: "Account created successfully!"

### Step 3: Login (10 seconds)

1. Go to: http://localhost:5173/login
2. Enter:
   - **Email:** admin@millenniumpotter.com
   - **Password:** Password123!
3. Click "Sign In"
4. **YOU'RE IN!** 🎉

---

## 🔧 Why This Works

**The Problem:**
- Inserting directly into `auth.users` corrupts the auth schema
- Supabase's auth system has internal triggers and validations
- Bypassing them causes "Database error querying schema"

**The Solution:**
- Let Supabase handle auth user creation (via signup)
- Use a trigger to auto-create the profile in `public.users`
- This keeps the auth schema clean and working

---

## 📝 Summary

1. ✅ Run `WORKING_SETUP.sql` - Creates tables + trigger
2. ✅ Use `/signup` page - Creates admin properly
3. ✅ Login - Works perfectly!

**No more "Database error querying schema"!**
