-- ============================================
-- ALL MIGRATIONS CONSOLIDATED
-- Run this ENTIRE file in Supabase SQL Editor
-- This creates everything you need
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. BRANCHES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'subadmin', 'agent')),
  branch_id UUID REFERENCES branches(id),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_branch ON users(branch_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- 3. CUSTOMERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT NOT NULL,
  id_type TEXT NOT NULL,
  id_number TEXT NOT NULL,
  passport_photo_url TEXT,
  id_photo_url TEXT,
  branch_id UUID NOT NULL REFERENCES branches(id),
  agent_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_agent ON customers(agent_id);
CREATE INDEX IF NOT EXISTS idx_customers_branch ON customers(branch_id);

-- ============================================
-- 4. GUARANTORS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS guarantors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  relationship TEXT NOT NULL,
  id_type TEXT NOT NULL,
  id_number TEXT NOT NULL,
  passport_photo_url TEXT,
  id_photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guarantors_customer ON guarantors(customer_id);

-- ============================================
-- 5. LOANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS loans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id),
  agent_id UUID NOT NULL REFERENCES users(id),
  branch_id UUID NOT NULL REFERENCES branches(id),
  subadmin_id UUID NOT NULL REFERENCES users(id),
  amount DECIMAL(15, 2) NOT NULL,
  interest_rate DECIMAL(5, 2) NOT NULL,
  duration_weeks INTEGER NOT NULL,
  duration_days INTEGER,
  weekly_payment DECIMAL(15, 2) NOT NULL,
  daily_payment DECIMAL(15, 2),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'completed', 'defaulted')),
  application_date DATE NOT NULL DEFAULT CURRENT_DATE,
  approval_date DATE,
  approved_by UUID REFERENCES users(id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loans_customer ON loans(customer_id);
CREATE INDEX IF NOT EXISTS idx_loans_agent ON loans(agent_id);
CREATE INDEX IF NOT EXISTS idx_loans_branch ON loans(branch_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);

-- Function to auto-calculate daily payment and duration in days
CREATE OR REPLACE FUNCTION calculate_daily_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-calculate duration_days from duration_weeks
  IF NEW.duration_days IS NULL AND NEW.duration_weeks IS NOT NULL THEN
    NEW.duration_days := NEW.duration_weeks * 7;
  END IF;
  
  -- Auto-calculate daily_payment from weekly_payment
  IF NEW.daily_payment IS NULL AND NEW.weekly_payment IS NOT NULL THEN
    NEW.daily_payment := ROUND(NEW.weekly_payment / 7, 2);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate daily payment
DROP TRIGGER IF EXISTS trigger_calculate_daily_payment ON loans;
CREATE TRIGGER trigger_calculate_daily_payment
  BEFORE INSERT OR UPDATE ON loans
  FOR EACH ROW
  EXECUTE FUNCTION calculate_daily_payment();

-- ============================================
-- 6. PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_id UUID NOT NULL REFERENCES loans(id),
  branch_id UUID NOT NULL REFERENCES branches(id),
  agent_id UUID NOT NULL REFERENCES users(id),
  amount_paid DECIMAL(15, 2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  week_number INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_loan ON payments(loan_id);
CREATE INDEX IF NOT EXISTS idx_payments_agent ON payments(agent_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);

-- ============================================
-- 7. DISBURSEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS disbursements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  agent_id UUID NOT NULL REFERENCES users(id),
  amount DECIMAL(15, 2) NOT NULL,
  disbursed_by UUID NOT NULL REFERENCES users(id),
  disbursement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('daily', 'weekly')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_disbursements_agent ON disbursements(agent_id);
CREATE INDEX IF NOT EXISTS idx_disbursements_branch ON disbursements(branch_id);

-- ============================================
-- 8. DISABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE branches DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE guarantors DISABLE ROW LEVEL SECURITY;
ALTER TABLE loans DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE disbursements DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 9. INSERT BRANCHES (Igando & Abule-Egba)
-- ============================================
INSERT INTO branches (name, address, phone)
VALUES 
  ('Igando', '123 Igando Road, Lagos', '+234 800 000 0001'),
  ('Abule-Egba', '456 Abule-Egba Street, Lagos', '+234 800 000 0002')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 10. CREATE ADMIN USER
-- ============================================
DO $$
DECLARE
  admin_id UUID := gen_random_uuid();
BEGIN
  -- Create in auth.users
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    admin_id,
    'authenticated',
    'authenticated',
    'admin@millenniumpotter.com',
    crypt('Password123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    ''
  );
  
  -- Create in public.users
  INSERT INTO users (id, email, full_name, phone, role, branch_id)
  VALUES (
    admin_id,
    'admin@millenniumpotter.com',
    'Admin User',
    '+234 800 000 0000',
    'admin',
    NULL
  );
END $$;

-- ============================================
-- 11. VERIFY SETUP
-- ============================================
SELECT 
  'Database setup complete!' as status,
  (SELECT COUNT(*) FROM branches) as branches_count,
  (SELECT COUNT(*) FROM users) as users_count,
  (SELECT email FROM users WHERE role = 'admin') as admin_email;

-- ============================================
-- DONE! Login with:
-- Email: admin@millenniumpotter.com
-- Password: Password123!
-- ============================================
