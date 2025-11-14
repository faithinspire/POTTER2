# Supabase Setup Guide for Millennium Potter

This guide will walk you through setting up Supabase for the Millennium Potter fintech platform.

## Prerequisites

- Supabase account (sign up at https://supabase.com)
- Node.js 18+ installed
- Git installed

## Step 1: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Fill in project details:
   - **Name**: millennium-potter
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to Nigeria (e.g., Frankfurt or Singapore)
4. Click **"Create new project"**
5. Wait 2-3 minutes for project to be ready

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, click **"Settings"** (gear icon)
2. Click **"API"** in the sidebar
3. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

## Step 3: Configure Environment Variables

1. In your project root, create a `.env` file:

```bash
VITE_SUPABASE_URL=https://jprovhgmhoerajhkdnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impwcm92aGdtaG9lcmFqaGtkbm9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NTQ4MDgsImV4cCI6MjA3ODEzMDgwOH0.-1DbmjKfQuZwZXIUPOYGf2lFPWDnDD0BIBA8uBlJy6Q
```

2. Replace the values with your actual Supabase credentials

## Step 4: Run Database Migrations

### Option A: Using Supabase Dashboard (Recommended for beginners)

1. Go to your Supabase project dashboard
2. Click **"SQL Editor"** in the sidebar
3. Click **"New query"**
4. Copy and paste each migration file in order:

   **Migration 1: Branches Table**
   ```sql
   -- Copy content from: supabase/migrations/001_create_branches_table.sql
   ```
   Click **"Run"**

   **Migration 2: Users Table**
   ```sql
   -- Copy content from: supabase/migrations/002_create_users_table.sql
   ```
   Click **"Run"**

   **Migration 3: Customers & Guarantors**
   ```sql
   -- Copy content from: supabase/migrations/003_create_customers_guarantors_tables.sql
   ```
   Click **"Run"**

   **Migration 4: Loans Table**
   ```sql
   -- Copy content from: supabase/migrations/004_create_loans_table.sql
   ```
   Click **"Run"**

   **Migration 5: Payments Table**
   ```sql
   -- Copy content from: supabase/migrations/005_create_payments_table.sql
   ```
   Click **"Run"**

   **Migration 6: Row Level Security**
   ```sql
   -- Copy content from: supabase/migrations/006_enable_rls_and_policies.sql
   ```
   Click **"Run"**

   **Migration 7: Triggers & Functions**
   ```sql
   -- Copy content from: supabase/migrations/007_create_triggers_and_functions.sql
   ```
   Click **"Run"**

   **Migration 8: Seed Data**
   ```sql
   -- Copy content from: supabase/migrations/008_seed_initial_data.sql
   ```
   Click **"Run"**

### Option B: Using Supabase CLI (Advanced)

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link your project:
```bash
supabase link --project-ref your-project-ref
```

4. Push migrations:
```bash
supabase db push
```

## Step 5: Create Test Users

### Create Admin User

1. Go to **Authentication** > **Users** in Supabase dashboard
2. Click **"Add user"** > **"Create new user"**
3. Fill in:
   - **Email**: `admin@millenniumpotter.com`
   - **Password**: `Admin@123456` (change this!)
   - **Auto Confirm User**: ✅ Check this
4. Click **"Create user"**
5. **Copy the User ID** (UUID)

6. Go to **SQL Editor** and run:
```sql
INSERT INTO users (id, email, role, branch_id, full_name, phone) VALUES
  ('PASTE_ADMIN_USER_ID_HERE', 'admin@millenniumpotter.com', 'admin', NULL, 'System Administrator', '+234 800 000 0000');
```

### Create Sub-Admin Users

1. Get branch IDs first:
```sql
SELECT id, name FROM branches;
```
Copy the IDs for Igando and Abule-Egba

2. Create auth users for sub-admins:
   - **Igando Sub-Admin**: `subadmin.igando@millenniumpotter.com` / `SubAdmin@123456`
   - **Abule-Egba Sub-Admin**: `subadmin.abuleegba@millenniumpotter.com` / `SubAdmin@123456`

3. Insert into users table:
```sql
-- Replace USER_IDs and BRANCH_IDs with actual values
INSERT INTO users (id, email, role, branch_id, full_name, phone) VALUES
  ('IGANDO_SUBADMIN_USER_ID', 'subadmin.igando@millenniumpotter.com', 'subadmin', 'IGANDO_BRANCH_ID', 'Igando Branch Manager', '+234 801 000 0001'),
  ('ABULEEGBA_SUBADMIN_USER_ID', 'subadmin.abuleegba@millenniumpotter.com', 'subadmin', 'ABULEEGBA_BRANCH_ID', 'Abule-Egba Branch Manager', '+234 801 000 0002');
```

### Create Agent Users

1. Create auth users for agents:
   - **Igando Agent 1**: `agent1.igando@millenniumpotter.com` / `Agent@123456`
   - **Igando Agent 2**: `agent2.igando@millenniumpotter.com` / `Agent@123456`
   - **Abule-Egba Agent 1**: `agent1.abuleegba@millenniumpotter.com` / `Agent@123456`

2. Insert into users table:
```sql
-- Replace USER_IDs and BRANCH_IDs with actual values
INSERT INTO users (id, email, role, branch_id, full_name, phone) VALUES
  ('AGENT1_IGANDO_USER_ID', 'agent1.igando@millenniumpotter.com', 'agent', 'IGANDO_BRANCH_ID', 'John Okafor', '+234 802 111 2222'),
  ('AGENT2_IGANDO_USER_ID', 'agent2.igando@millenniumpotter.com', 'agent', 'IGANDO_BRANCH_ID', 'Mary Adeyemi', '+234 802 333 4444'),
  ('AGENT1_ABULEEGBA_USER_ID', 'agent1.abuleegba@millenniumpotter.com', 'agent', 'ABULEEGBA_BRANCH_ID', 'David Okonkwo', '+234 802 555 6666');
```

## Step 6: Verify Setup

1. Go to **Table Editor** in Supabase dashboard
2. Check that all tables exist:
   - ✅ branches (should have 2 rows)
   - ✅ users (should have your test users)
   - ✅ customers
   - ✅ guarantors
   - ✅ loans
   - ✅ payments

3. Test RLS policies:
   - Go to **Authentication** > **Policies**
   - Verify policies are enabled for all tables

## Step 7: Test the Application

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open browser to `http://localhost:5173`

4. Try logging in with test credentials:
   - **Admin**: admin@millenniumpotter.com / Admin@123456
   - **Sub-Admin**: subadmin.igando@millenniumpotter.com / SubAdmin@123456
   - **Agent**: agent1.igando@millenniumpotter.com / Agent@123456

## Database Schema Overview

```
branches
├── id (UUID, PK)
├── name (Igando | Abule-Egba)
├── address
├── phone
└── created_at

users (extends auth.users)
├── id (UUID, PK, FK to auth.users)
├── email
├── role (admin | subadmin | agent)
├── branch_id (FK to branches) - NULL for admin
├── full_name
├── phone
├── created_at
└── updated_at

customers
├── id (UUID, PK)
├── full_name
├── phone
├── email
├── address
├── id_type (NIN | BVN | Drivers License | Voters Card)
├── id_number
├── branch_id (FK to branches)
├── agent_id (FK to users)
├── created_at
└── updated_at

guarantors
├── id (UUID, PK)
├── customer_id (FK to customers)
├── full_name
├── phone
├── address
├── relationship
├── id_type
├── id_number
└── created_at

loans
├── id (UUID, PK)
├── customer_id (FK to customers)
├── agent_id (FK to users)
├── branch_id (FK to branches)
├── subadmin_id (FK to users) - auto-assigned
├── amount
├── interest_rate
├── duration_weeks
├── weekly_payment - auto-calculated
├── status (pending | approved | rejected | active | completed | defaulted)
├── application_date
├── approval_date
├── approved_by (FK to users)
├── rejection_reason
├── created_at
└── updated_at

payments
├── id (UUID, PK)
├── loan_id (FK to loans)
├── customer_id (FK to customers)
├── agent_id (FK to users)
├── branch_id (FK to branches)
├── amount_due
├── amount_paid
├── payment_date
├── recorded_at
├── status (paid | unpaid | partial | overdue) - auto-set
└── notes
```

## Security Features

### Row Level Security (RLS)

All tables have RLS enabled with policies:

- **Admin**: Full access to all data across branches
- **Sub-Admin**: Access to data in their assigned branch only
- **Agent**: Access to their own customers, loans, and payments only

### Automatic Features

1. **Timestamps**: `updated_at` automatically updates on record changes
2. **Agent-SubAdmin Linking**: Agents automatically linked to branch sub-admin
3. **Loan SubAdmin Assignment**: Loans automatically assigned to branch sub-admin
4. **Payment Status**: Payment status auto-calculated based on amount paid
5. **Weekly Payment Calculation**: Automatic calculation including interest

## Useful SQL Queries

### Get branch statistics:
```sql
SELECT * FROM get_branch_stats('BRANCH_ID_HERE');
```

### Get agent performance:
```sql
SELECT * FROM get_agent_performance('AGENT_ID_HERE');
```

### Generate loan payment schedule:
```sql
SELECT * FROM generate_payment_schedule('LOAN_ID_HERE');
```

### View loan details:
```sql
SELECT * FROM loan_details_view WHERE id = 'LOAN_ID_HERE';
```

## Troubleshooting

### Issue: "relation does not exist"
- **Solution**: Make sure all migrations ran successfully in order

### Issue: "permission denied for table"
- **Solution**: Check RLS policies are enabled and user has correct role

### Issue: "new row violates check constraint"
- **Solution**: Verify data matches constraints (e.g., valid role, branch assignment)

### Issue: Can't login
- **Solution**: 
  1. Check user exists in auth.users
  2. Check user profile exists in users table
  3. Verify email confirmation if required

## Next Steps

1. ✅ Database setup complete
2. ⏭️ Continue with Task 3: Authentication system implementation
3. ⏭️ Build dashboard pages
4. ⏭️ Implement real-time features

## Support

For issues or questions:
- Check Supabase docs: https://supabase.com/docs
- Review migration files in `supabase/migrations/`
- Check application logs in browser console

---

**Important**: Change all default passwords before deploying to production!
