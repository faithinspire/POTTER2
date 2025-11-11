# 🚀 Supabase Quick Setup - 5 Minutes!

## Step 1: Create Supabase Project (2 minutes)

1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Fill in:
   - Name: `millennium-potter`
   - Database Password: (create a strong password)
   - Region: Choose closest to you
4. Click **"Create new project"**
5. Wait 2-3 minutes ⏳

## Step 2: Run Database Setup (1 minute)

1. In your Supabase project, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Open the file: `supabase/ALL_MIGRATIONS.sql`
4. **Copy ALL the content** (Ctrl+A, Ctrl+C)
5. **Paste** into Supabase SQL Editor (Ctrl+V)
6. Click **"Run"** button (or press Ctrl+Enter)
7. Wait for "Success" message ✅

**That's it!** Your database is now set up with:
- ✅ 6 tables created
- ✅ 2 branches (Igando & Abule-Egba)
- ✅ Row Level Security enabled
- ✅ All triggers and functions
- ✅ All indexes for performance

## Step 3: Get Your Credentials (1 minute)

1. Click **"Settings"** (gear icon) in left sidebar
2. Click **"API"**
3. Copy these two values:

```
Project URL: https://xxxxx.supabase.co
anon public key: eyJxxx...
```

## Step 4: Configure Your App (1 minute)

1. Create `.env` file in your project root:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

2. Replace with your actual values from Step 3

## Step 5: Create Test Users (Optional - 2 minutes)

### Create Admin User

1. Go to **Authentication** > **Users**
2. Click **"Add user"** > **"Create new user"**
3. Fill in:
   - Email: `admin@millenniumpotter.com`
   - Password: `Admin@123456`
   - Auto Confirm User: ✅ **Check this!**
4. Click **"Create user"**
5. **Copy the User ID** (UUID shown in the list)

6. Go back to **SQL Editor** and run:

```sql
-- Replace 'USER_ID_HERE' with the actual UUID you copied
INSERT INTO users (id, email, role, branch_id, full_name, phone) 
VALUES 
('USER_ID_HERE', 'admin@millenniumpotter.com', 'admin', NULL, 'System Administrator', '+234 800 000 0000');
```

### Create Sub-Admin Users (Optional)

First, get branch IDs:

```sql
SELECT id, name FROM branches;
```

Copy the IDs, then create sub-admin auth users and insert:

```sql
-- Replace USER_IDs and BRANCH_IDs with actual values
INSERT INTO users (id, email, role, branch_id, full_name, phone) VALUES
('IGANDO_SUBADMIN_USER_ID', 'subadmin.igando@millenniumpotter.com', 'subadmin', 'IGANDO_BRANCH_ID', 'Igando Manager', '+234 801 000 0001'),
('ABULEEGBA_SUBADMIN_USER_ID', 'subadmin.abuleegba@millenniumpotter.com', 'subadmin', 'ABULEEGBA_BRANCH_ID', 'Abule-Egba Manager', '+234 801 000 0002');
```

## ✅ Verification

Check that everything is set up:

1. Go to **Table Editor**
2. You should see these tables:
   - ✅ branches (2 rows)
   - ✅ users (your test users)
   - ✅ customers (empty)
   - ✅ guarantors (empty)
   - ✅ loans (empty)
   - ✅ payments (empty)

## 🎉 Done!

Your Supabase database is ready!

Now run your app:

```bash
npm install
npm run dev
```

Open http://localhost:5173

## 📍 Where to Find the SQL File

The complete database setup is in:
```
supabase/ALL_MIGRATIONS.sql
```

This single file contains ALL 7 migrations combined!

## 🆘 Troubleshooting

### "relation already exists"
- This is OK! It means tables are already created
- The script uses `IF NOT EXISTS` to prevent errors

### "permission denied"
- Make sure you're logged into Supabase
- Check you're in the correct project

### "syntax error"
- Make sure you copied the ENTIRE file
- Check you didn't miss any part

### Can't find the SQL file
- It's in: `supabase/ALL_MIGRATIONS.sql`
- Or use individual files in `supabase/migrations/` folder

## 📚 Need More Details?

See the complete guide: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

---

**Total Time**: ~5 minutes
**Difficulty**: Easy
**Result**: Production-ready database! 🚀
