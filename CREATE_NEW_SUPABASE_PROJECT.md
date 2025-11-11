# 🚀 Create New Supabase Project (5 Minutes)

Your current Supabase project has a corrupted auth schema. Fastest fix: **Create a new project**.

## Step 1: Create New Project (2 minutes)

1. Go to: https://supabase.com/dashboard
2. Click **"New Project"**
3. Fill in:
   - **Name:** Millennium Potter
   - **Database Password:** (save this somewhere!)
   - **Region:** Choose closest to you
4. Click **"Create new project"**
5. **Wait 2-3 minutes** for it to initialize

---

## Step 2: Get New Credentials (1 minute)

Once the project is ready:

1. Click **"Settings"** (bottom left)
2. Click **"API"**
3. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

---

## Step 3: Update .env File (30 seconds)

Replace your `.env` file with the new credentials:

```env
VITE_SUPABASE_URL=https://YOUR_NEW_PROJECT_URL.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_NEW_ANON_KEY_HERE
```

---

## Step 4: Run Migration (1 minute)

1. In new Supabase project, click **"SQL Editor"**
2. Copy ALL of `COMPLETE_FRESH_START.sql`
3. Paste and click **"RUN"**
4. Should see: "SUCCESS! Database is ready!"

---

## Step 5: Restart Dev Server (30 seconds)

In your terminal:
```bash
# Stop current server (Ctrl+C)
npm run dev
```

---

## Step 6: Login! (10 seconds)

Go to: http://localhost:5173/login

**Credentials:**
- Email: `admin@millenniumpotter.com`
- Password: `Password123!`

---

## ✅ Done!

Your app should now work perfectly with the new Supabase project.

---

## 🔄 Alternative: Wait for Supabase Support

If you don't want to create a new project:
1. Contact Supabase support
2. Report the "Database error querying schema" issue
3. Wait for them to fix it (could take hours/days)

**Creating a new project is MUCH faster!**
