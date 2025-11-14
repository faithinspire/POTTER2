-- ============================================
-- CUSTOM AUTH SETUP - NO SUPABASE AUTH!
-- This bypasses Supabase Auth completely
-- Uses direct database authentication with bcrypt
-- ============================================

-- Step 1: Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Step 2: Create branches table
CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Create users table WITH PASSWORD
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'subadmin', 'agent')),
  branch_id UUID REFERENCES branches(id),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_branch ON users(branch_id);

-- Step 4: Create customers table
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

CREATE INDEX idx_customers_agent ON customers(agent_id);
CREATE INDEX idx_customers_branch ON customers(branch_id);

-- Step 5: Create guarantors table
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

CREATE INDEX idx_guarantors_customer ON guarantors(customer_id);

-- Step 6: Create loans table
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

CREATE INDEX idx_loans_customer ON loans(customer_id);
CREATE INDEX idx_loans_agent ON loans(agent_id);
CREATE INDEX idx_loans_branch ON loans(branch_id);
CREATE INDEX idx_loans_status ON loans(status);

-- Step 7: Create payments table
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

CREATE INDEX idx_payments_loan ON payments(loan_id);
CREATE INDEX idx_payments_agent ON payments(agent_id);
CREATE INDEX idx_payments_date ON payments(payment_date);

-- Step 8: Create disbursements table
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

CREATE INDEX idx_disbursements_agent ON disbursements(agent_id);
CREATE INDEX idx_disbursements_branch ON disbursements(branch_id);

-- Step 9: Disable RLS on all tables
ALTER TABLE branches DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE guarantors DISABLE ROW LEVEL SECURITY;
ALTER TABLE loans DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE disbursements DISABLE ROW LEVEL SECURITY;

-- Step 10: Insert branches
INSERT INTO branches (name, address, phone)
VALUES 
  ('Igando', '123 Igando Road, Lagos', '+234 800 000 0001'),
  ('Abule-Egba', '456 Abule-Egba Street, Lagos', '+234 800 000 0002')
ON CONFLICT (name) DO NOTHING;

-- Step 11: Create admin user with bcrypt password
-- Password: Password123!
INSERT INTO users (email, password_hash, full_name, phone, role, branch_id)
VALUES (
  'admin@millenniumpotter.com',
  crypt('Password123!', gen_salt('bf')),
  'Admin User',
  '+234 800 000 0000',
  'admin',
  NULL
)
ON CONFLICT (email) DO NOTHING;

-- Step 12: Create authentication function
CREATE OR REPLACE FUNCTION authenticate_user(
  user_email TEXT,
  user_password TEXT
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  role TEXT,
  branch_id UUID,
  branch_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.full_name,
    u.phone,
    u.role,
    u.branch_id,
    b.name as branch_name
  FROM users u
  LEFT JOIN branches b ON b.id = u.branch_id
  WHERE u.email = user_email
    AND u.password_hash = crypt(user_password, u.password_hash)
    AND u.is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 13: Create user creation function
CREATE OR REPLACE FUNCTION create_user(
  user_email TEXT,
  user_password TEXT,
  user_full_name TEXT,
  user_phone TEXT,
  user_role TEXT,
  user_branch_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
BEGIN
  INSERT INTO users (email, password_hash, full_name, phone, role, branch_id)
  VALUES (
    user_email,
    crypt(user_password, gen_salt('bf')),
    user_full_name,
    user_phone,
    user_role,
    user_branch_id
  )
  RETURNING id INTO new_user_id;
  
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 14: Verify setup
SELECT 
  'Custom auth setup complete!' as status,
  (SELECT COUNT(*) FROM branches) as branches_count,
  (SELECT COUNT(*) FROM users) as users_count,
  (SELECT email FROM users WHERE role = 'admin') as admin_email;

-- ============================================
-- DONE! You can now login with:
-- Email: admin@millenniumpotter.com
-- Password: Password123!
-- ============================================
