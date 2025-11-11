# 🔍 Troubleshooting "Failed to fetch" Error

## Quick Checks

### 1️⃣ Is the App Running?
- Open browser: `http://localhost:5173`
- You should see the login page
- If not, check the terminal for errors

### 2️⃣ Did You Run the Database Migration?
**This is the most common issue!**

Go to Supabase Dashboard:
1. Open: https://supabase.com/dashboard/project/azuokmzqtxsuszowxckm
2. Click **SQL Editor** (left sidebar)
3. Copy ALL contents from `RUN_ALL_MIGRATIONS.sql`
4. Paste and click **RUN**
5. Should see: "Database setup complete!"

### 3️⃣ Check Supabase Connection
Open browser console (F12) and check for errors:
- Red errors about "fetch failed"?
- CORS errors?
- 401 Unauthorized?

### 4️⃣ Verify Admin User Exists
In Supabase Dashboard:
1. Go to **Authentication** → **Users**
2. Look for: `admin@millenniumpotter.com`
3. If not there, the migration didn't run

### 5️⃣ Check Database Tables
In Supabase Dashboard:
1. Go to **Table Editor**
2. Should see tables: branches, users, customers, loans, payments, disbursements
3. If not there, run the migration!

---

## 🎯 Most Likely Solution

**You haven't run the database migration yet!**

### Do This Now:

1. **Open Supabase Dashboard:**
   https://supabase.com/dashboard/project/azuokmzqtxsuszowxckm

2. **Click "SQL Editor"** (left sidebar)

3. **Copy this entire file:** `RUN_ALL_MIGRATIONS.sql`

4. **Paste in SQL Editor**

5. **Click "RUN"** (bottom right)

6. **Wait for:** "Database setup complete!"

7. **Try logging in again:**
   - Email: `admin@millenniumpotter.com`
   - Password: `Password123!`

---

## 🐛 Still Not Working?

### Check Browser Console:
1. Press F12 (open DevTools)
2. Go to "Console" tab
3. Try logging in again
4. Look for error messages
5. Share the error with me

### Common Errors:

**"Invalid login credentials"**
- Migration ran, but admin user wasn't created
- Run this SQL separately:
```sql
-- See CREATE_ADMIN_ONLY.sql
```

**"relation 'users' does not exist"**
- Tables weren't created
- Run RUN_ALL_MIGRATIONS.sql again

**"Failed to fetch"**
- Can't connect to Supabase
- Check internet connection
- Verify Supabase project is active

**"CORS error"**
- Supabase URL is wrong in .env
- Check VITE_SUPABASE_URL matches your project

---

## ✅ Quick Test

Run this in browser console (F12):
```javascript
fetch('https://azuokmzqtxsuszowxckm.supabase.co/rest/v1/')
  .then(r => console.log('Connected!', r.status))
  .catch(e => console.error('Failed:', e))
```

If you see "Connected! 200" → Supabase is reachable
If you see "Failed" → Network or URL issue

---

## 📞 Need Help?

Tell me:
1. Did you run RUN_ALL_MIGRATIONS.sql? (Yes/No)
2. What do you see in browser console? (F12 → Console tab)
3. Do you see tables in Supabase Table Editor? (Yes/No)
