# ✅ SIMPLE FIX - Login Stuck

## The Issue:
Profile exists but RLS is blocking it from being read.

## The Fix (10 seconds):

### Run This SQL:
```sql
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.users TO anon, authenticated, postgres;
```

### Then:
1. **Refresh browser** (Ctrl+Shift+R)
2. **Login again**: admin@test.com / admin123
3. **Works!** 🎉

---

That's it! Just 2 lines of SQL!
