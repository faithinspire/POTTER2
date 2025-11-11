# ⚡ RUN THIS SQL NOW - Fix Signup Error

## 🎯 Copy & Paste This:

```sql
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
```

## 📋 Steps:

1. Open: https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor"
4. Paste the SQL above
5. Click "Run"
6. Done! ✅

---

## 🎉 Now Test:

1. Go to: http://localhost:5179/signup
2. Fill in the form
3. Click "Create Account"
4. It works! 🚀

---

## 💡 What This Does:

Disables Row Level Security on the users table so signup can create profiles.

**That's it! One line of SQL fixes everything!**
