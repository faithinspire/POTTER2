# 🚀 Quick Login Fix

## 🔥 Fix Timeout Error (30 seconds)

### Step 1: Open Supabase
Go to: Supabase Dashboard → SQL Editor

### Step 2: Run This
```sql
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
```

### Step 3: Login
```
Email: admin@millenniumpotter.com
Password: Password123!
```

## ✅ Done!

That's it! Your login should work now.

---

## 📋 All Credentials

**Admin:**
- admin@millenniumpotter.com / Password123!

**Sub-Admin (Ikeja):**
- subadmin.ikeja@millenniumpotter.com / Password123!

**Sub-Admin (Lekki):**
- subadmin.lekki@millenniumpotter.com / Password123!

**Agent 1:**
- agent1.ikeja@millenniumpotter.com / Password123!

**Agent 2:**
- agent2.ikeja@millenniumpotter.com / Password123!

---

## 🆘 Still Not Working?

Check if user exists:
```sql
SELECT email, role FROM public.users WHERE email = 'admin@millenniumpotter.com';
```

If no result, run the seed data migration again.
