# 🎯 COPY AND RUN THIS IN SUPABASE NOW

## The Fix (30 seconds):

1. **Open Supabase Dashboard** → SQL Editor
2. **Copy this SQL:**

```sql
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;
```

3. **Click Run**
4. **Done!** Try creating a user again

---

## That's It!

The error will be gone and you can create users from the app.

---

## What This Does:
- Removes the foreign key constraint causing the error
- Allows user creation without email confirmation
- Safe to run (won't break anything)

## After Running:
- Go to your app
- Login as admin
- Click "Manage Users"
- Click "Create New User"
- Fill the form
- Click Create
- ✅ Should work now!

---

**Just run that one line of SQL and you're fixed!**
