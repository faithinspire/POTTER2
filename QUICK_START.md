# 🚀 Quick Start Guide - Millennium Potter

Get up and running in 10 minutes!

## ⚡ Super Quick Setup

### Step 1: Install Dependencies (2 minutes)

```bash
npm install
```

### Step 2: Setup Supabase (5 minutes)

1. **Create Supabase Project**
   - Go to https://supabase.com/dashboard
   - Click "New Project"
   - Name: `millennium-potter`
   - Choose region closest to you
   - Wait 2-3 minutes

2. **Get Your Credentials**
   - Go to Settings > API
   - Copy:
     - Project URL
     - anon public key

3. **Configure Environment**
   ```bash
   # Create .env file
   echo "VITE_SUPABASE_URL=your-url-here" > .env
   echo "VITE_SUPABASE_ANON_KEY=your-key-here" >> .env
   ```

### Step 3: Setup Database (3 minutes)

1. **Go to SQL Editor** in Supabase Dashboard

2. **Run migrations** (copy/paste each file):
   - `supabase/migrations/001_create_branches_table.sql`
   - `supabase/migrations/002_create_users_table.sql`
   - `supabase/migrations/003_create_customers_guarantors_tables.sql`
   - `supabase/migrations/004_create_loans_table.sql`
   - `supabase/migrations/005_create_payments_table.sql`
   - `supabase/migrations/006_enable_rls_and_policies.sql`
   - `supabase/migrations/007_create_triggers_and_functions.sql`
   - `supabase/migrations/008_seed_initial_data.sql`

### Step 4: Create Test User (2 minutes)

1. **Go to Authentication > Users** in Supabase

2. **Add User**:
   - Email: `admin@millenniumpotter.com`
   - Password: `Admin@123456`
   - Auto Confirm: ✅

3. **Copy User ID** (the UUID)

4. **Go to SQL Editor** and run:
   ```sql
   INSERT INTO users (id, email, role, branch_id, full_name, phone) 
   VALUES 
   ('PASTE_USER_ID_HERE', 'admin@millenniumpotter.com', 'admin', NULL, 'Admin User', '+234 800 000 0000');
   ```

### Step 5: Start Development Server

```bash
npm run dev
```

Open http://localhost:5173 🎉

## 🎨 What You'll See

- ✨ Beautiful landing page
- 🏦 Bank building background
- 💎 Floating currency animations
- 📊 Premium glassmorphism design
- 🎯 Stats cards and feature showcase

## 📝 Test Credentials

After creating users:
- **Admin**: admin@millenniumpotter.com / Admin@123456

## 🔧 Troubleshooting

### "Missing Supabase environment variables"
- Check `.env` file exists
- Verify URL and key are correct
- Restart dev server

### "relation does not exist"
- Run all migrations in order
- Check SQL Editor for errors

### "permission denied"
- Verify RLS policies ran
- Check user has correct role

## 📚 Full Documentation

- **Complete Setup**: See `SUPABASE_SETUP.md`
- **Deployment**: See `DEPLOYMENT.md`
- **Visual Preview**: See `VISUAL_PREVIEW.md`
- **Project Status**: See `PROJECT_STATUS.md`

## 🎯 Next Steps

1. ✅ Project running locally
2. ⏭️ Implement authentication pages
3. ⏭️ Build dashboard layouts
4. ⏭️ Create customer forms
5. ⏭️ Add payment tracking

## 💡 Pro Tips

### Use Supabase Local Development
```bash
npx supabase init
npx supabase start
```

### Hot Reload
Changes to code auto-reload in browser

### Database Queries
Test queries in Supabase SQL Editor before coding

### Component Testing
Use React DevTools to inspect components

## 🆘 Need Help?

1. Check browser console for errors
2. Review migration files
3. Verify environment variables
4. Check Supabase logs

## 🎉 You're Ready!

The foundation is complete. Now you can:
- Build authentication system
- Create dashboard pages
- Implement forms
- Add real-time features

---

**Time to complete**: ~10 minutes
**Difficulty**: Easy
**Result**: Fully functional development environment with premium design! 🚀
