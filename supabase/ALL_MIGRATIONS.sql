-- ============================================
-- MILLENNIUM POTTER FINTECH PLATFORM
-- COMPLETE DATABASE SETUP
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- ============================================
-- MIGRATION 1: CREATE BRANCHES TABLE
-- ============================================

-- Create branches table
CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE CHECK (name IN ('Igando', 'Abule-Egba')),
  address TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment
COMMENT ON TABLE branches IS 'Stores branch information for Igando and Abule-Egba locations';

-- Insert initial branches
INSERT INTO branches (name, address, phone) VALUES
  ('Igando', 'Igando, Lagos State, Nigeria', '+234 800 000 0001'),
  ('Abule-Egba', 'Abule-Egba, Lagos State, Nigeria', '+234 800 000 0002')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- MIGRATION 2: CREATE USERS TABLE
-- ============================================

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'subadmin', 'agent')),
  branch_id UUID REFERENCES branches(id),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_branch_assignment CHECK (
    (role = 'admin' AND branch_id IS NULL) OR
    (role IN ('subadmin', 'agent') AND branch_id IS NOT NULL)
  )
);

-- Add comments
COMMENT ON TABLE users IS 'User profiles with role-based access control';
COMMENT ON COLUMN users.role IS 'User role: admin (global), subadmin (branch manager), agent (field agent)';
COMMENT ON COLUMN users.branch_id IS 'Branch assignment for subadmin and agent roles';

-- Create index for faster queries
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_branch ON users(branch_id);
CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- MIGRATION 3: CREATE CUSTOMERS & GUARANTORS TABLES
-- ============================================

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT NOT NULL,
  id_type TEXT NOT NULL CHECK (id_type IN ('NIN', 'BVN', 'Drivers License', 'Voters Card')),
  id_number TEXT NOT NULL,
  branch_id UUID NOT NULL REFERENCES branches(id),
  agent_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint for ID number per branch
  CONSTRAINT unique_customer_id_per_branch UNIQUE (id_number, branch_id)
);

-- Add comments
COMMENT ON TABLE customers IS 'Customer records registered by agents';
COMMENT ON COLUMN customers.id_type IS 'Type of identification: NIN, BVN, Drivers License, or Voters Card';
COMMENT ON COLUMN customers.agent_id IS 'Agent who registered this customer';

-- Create indexes
CREATE INDEX idx_customers_branch ON customers(branch_id);
CREATE INDEX idx_customers_agent ON customers(agent_id);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_id_number ON customers(id_number);
CREATE INDEX idx_customers_name ON customers(full_name);

-- Create guarantors table
CREATE TABLE IF NOT EXISTS guarantors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  relationship TEXT NOT NULL,
  id_type TEXT NOT NULL CHECK (id_type IN ('NIN', 'BVN', 'Drivers License', 'Voters Card')),
  id_number TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE guarantors IS 'Guarantor information for customer loan applications';
COMMENT ON COLUMN guarantors.relationship IS 'Relationship to customer (e.g., spouse, sibling, friend)';

-- Create indexes
CREATE INDEX idx_guarantors_customer ON guarantors(customer_id);
CREATE INDEX idx_guarantors_phone ON guarantors(phone);

-- ============================================
-- MIGRATION 4: CREATE LOANS TABLE
-- ============================================

-- Create loans table
CREATE TABLE IF NOT EXISTS loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id),
  agent_id UUID NOT NULL REFERENCES users(id),
  branch_id UUID NOT NULL REFERENCES branches(id),
  subadmin_id UUID NOT NULL REFERENCES users(id),
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  interest_rate DECIMAL(5,2) NOT NULL CHECK (interest_rate >= 0 AND interest_rate <= 100),
  duration_weeks INTEGER NOT NULL CHECK (duration_weeks > 0 AND duration_weeks <= 104),
  weekly_payment DECIMAL(12,2) NOT NULL CHECK (weekly_payment > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'completed', 'defaulted')),
  application_date TIMESTAMPTZ DEFAULT NOW(),
  approval_date TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_approval CHECK (
    (status = 'approved' AND approval_date IS NOT NULL AND approved_by IS NOT NULL) OR
    (status = 'rejected' AND rejection_reason IS NOT NULL) OR
    (status NOT IN ('approved', 'rejected'))
  )
);

-- Add comments
COMMENT ON TABLE loans IS 'Loan applications and their lifecycle status';
COMMENT ON COLUMN loans.status IS 'Loan status: pending, approved, rejected, active, completed, defaulted';
COMMENT ON COLUMN loans.weekly_payment IS 'Calculated weekly payment amount including interest';
COMMENT ON COLUMN loans.duration_weeks IS 'Loan duration in weeks (max 104 weeks = 2 years)';
COMMENT ON COLUMN loans.subadmin_id IS 'Sub-admin responsible for approving this loan';

-- Create indexes for performance
CREATE INDEX idx_loans_customer ON loans(customer_id);
CREATE INDEX idx_loans_agent ON loans(agent_id);
CREATE INDEX idx_loans_branch ON loans(branch_id);
CREATE INDEX idx_loans_subadmin ON loans(subadmin_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_application_date ON loans(application_date);
CREATE INDEX idx_loans_branch_status ON loans(branch_id, status);

-- ============================================
-- MIGRATION 5: CREATE PAYMENTS TABLE
-- ============================================

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id),
  agent_id UUID NOT NULL REFERENCES users(id),
  branch_id UUID NOT NULL REFERENCES branches(id),
  amount_due DECIMAL(12,2) NOT NULL CHECK (amount_due > 0),
  amount_paid DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),
  payment_date DATE NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('paid', 'unpaid', 'partial', 'overdue')),
  notes TEXT,
  
  -- Unique constraint: one payment record per loan per date
  CONSTRAINT unique_payment_per_loan_date UNIQUE (loan_id, payment_date)
);

-- Add comments
COMMENT ON TABLE payments IS 'Daily payment records for loan tracking';
COMMENT ON COLUMN payments.status IS 'Payment status: paid (full), unpaid, partial, overdue';
COMMENT ON COLUMN payments.payment_date IS 'The date this payment was due/made';
COMMENT ON COLUMN payments.recorded_at IS 'Timestamp when payment was recorded in system';

-- Create indexes for performance
CREATE INDEX idx_payments_loan ON payments(loan_id);
CREATE INDEX idx_payments_customer ON payments(customer_id);
CREATE INDEX idx_payments_agent ON payments(agent_id);
CREATE INDEX idx_payments_branch ON payments(branch_id);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_branch_date ON payments(branch_id, payment_date);
CREATE INDEX idx_payments_agent_date ON payments(agent_id, payment_date);

-- Create function to automatically set payment status based on amount
CREATE OR REPLACE FUNCTION set_payment_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.amount_paid >= NEW.amount_due THEN
    NEW.status := 'paid';
  ELSIF NEW.amount_paid > 0 THEN
    NEW.status := 'partial';
  ELSIF NEW.payment_date < CURRENT_DATE THEN
    NEW.status := 'overdue';
  ELSE
    NEW.status := 'unpaid';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-set payment status
CREATE TRIGGER trigger_set_payment_status
  BEFORE INSERT OR UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION set_payment_status();

COMMENT ON FUNCTION set_payment_status IS 'Automatically determines payment status based on amount paid';

-- ============================================
-- MIGRATION 6: ENABLE RLS AND POLICIES
-- ============================================

-- Enable Row Level Security on all tables
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE guarantors ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- BRANCHES TABLE POLICIES
CREATE POLICY "Anyone can view branches"
  ON branches FOR SELECT
  USING (true);

-- USERS TABLE POLICIES
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Sub-admins can view branch users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role = 'subadmin' 
      AND u.branch_id = users.branch_id
    )
  );

CREATE POLICY "Admins can manage users"
  ON users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- CUSTOMERS TABLE POLICIES
CREATE POLICY "Agents can view own customers"
  ON customers FOR SELECT
  USING (
    agent_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'subadmin')
    )
  );

CREATE POLICY "Sub-admins can view branch customers"
  ON customers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role = 'subadmin' 
      AND u.branch_id = customers.branch_id
    )
  );

CREATE POLICY "Admins can view all customers"
  ON customers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Agents can create customers"
  ON customers FOR INSERT
  WITH CHECK (
    agent_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'agent'
    )
  );

CREATE POLICY "Agents can update own customers"
  ON customers FOR UPDATE
  USING (agent_id = auth.uid());

CREATE POLICY "Admins and sub-admins can update customers"
  ON customers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'subadmin')
    )
  );

-- GUARANTORS TABLE POLICIES
CREATE POLICY "View guarantors with customer access"
  ON guarantors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.id = guarantors.customer_id
      AND (
        c.agent_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users u 
          WHERE u.id = auth.uid() 
          AND (
            u.role = 'admin' OR
            (u.role = 'subadmin' AND u.branch_id = c.branch_id)
          )
        )
      )
    )
  );

CREATE POLICY "Agents can create guarantors"
  ON guarantors FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.id = guarantors.customer_id
      AND c.agent_id = auth.uid()
    )
  );

CREATE POLICY "Agents can update guarantors"
  ON guarantors FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.id = guarantors.customer_id
      AND c.agent_id = auth.uid()
    )
  );

-- LOANS TABLE POLICIES
CREATE POLICY "Agents can view own loans"
  ON loans FOR SELECT
  USING (
    agent_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'subadmin')
    )
  );

CREATE POLICY "Sub-admins can view branch loans"
  ON loans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role = 'subadmin' 
      AND u.branch_id = loans.branch_id
    )
  );

CREATE POLICY "Admins can view all loans"
  ON loans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Agents can create loans"
  ON loans FOR INSERT
  WITH CHECK (
    agent_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'agent'
    )
  );

CREATE POLICY "Sub-admins can update branch loans"
  ON loans FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role = 'subadmin' 
      AND u.branch_id = loans.branch_id
    )
  );

CREATE POLICY "Admins can update all loans"
  ON loans FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- PAYMENTS TABLE POLICIES
CREATE POLICY "Agents can view own payments"
  ON payments FOR SELECT
  USING (
    agent_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'subadmin')
    )
  );

CREATE POLICY "Sub-admins can view branch payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role = 'subadmin' 
      AND u.branch_id = payments.branch_id
    )
  );

CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Agents can create payments"
  ON payments FOR INSERT
  WITH CHECK (
    agent_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'agent'
    )
  );

CREATE POLICY "Agents can update own payments"
  ON payments FOR UPDATE
  USING (agent_id = auth.uid());

CREATE POLICY "Admins and sub-admins can update payments"
  ON payments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'subadmin')
    )
  );

-- ============================================
-- MIGRATION 7: CREATE TRIGGERS AND FUNCTIONS
-- ============================================

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_timestamp
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_timestamp
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loans_timestamp
  BEFORE UPDATE ON loans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Link agent to sub-admin on creation
CREATE OR REPLACE FUNCTION link_agent_to_subadmin()
RETURNS TRIGGER AS $$
DECLARE
  v_subadmin_id UUID;
BEGIN
  IF NEW.role = 'agent' AND NEW.branch_id IS NOT NULL THEN
    SELECT id INTO v_subadmin_id
    FROM users
    WHERE role = 'subadmin' 
    AND branch_id = NEW.branch_id
    LIMIT 1;
    
    RAISE NOTICE 'Agent % linked to sub-admin % in branch %', NEW.id, v_subadmin_id, NEW.branch_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_link_agent_to_subadmin
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION link_agent_to_subadmin();

-- Auto-set loan subadmin_id
CREATE OR REPLACE FUNCTION set_loan_subadmin()
RETURNS TRIGGER AS $$
DECLARE
  v_subadmin_id UUID;
BEGIN
  SELECT id INTO v_subadmin_id
  FROM users
  WHERE role = 'subadmin' 
  AND branch_id = NEW.branch_id
  LIMIT 1;
  
  IF v_subadmin_id IS NULL THEN
    RAISE EXCEPTION 'No sub-admin found for branch %', NEW.branch_id;
  END IF;
  
  NEW.subadmin_id := v_subadmin_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_loan_subadmin
  BEFORE INSERT ON loans
  FOR EACH ROW
  EXECUTE FUNCTION set_loan_subadmin();

-- Calculate weekly payment
CREATE OR REPLACE FUNCTION calculate_weekly_payment(
  p_amount DECIMAL,
  p_interest_rate DECIMAL,
  p_duration_weeks INTEGER
)
RETURNS DECIMAL AS $$
DECLARE
  v_total_amount DECIMAL;
  v_weekly_payment DECIMAL;
BEGIN
  v_total_amount := p_amount * (1 + (p_interest_rate / 100));
  v_weekly_payment := v_total_amount / p_duration_weeks;
  RETURN ROUND(v_weekly_payment, 2);
END;
$$ LANGUAGE plpgsql;

-- Get branch statistics
CREATE OR REPLACE FUNCTION get_branch_stats(p_branch_id UUID)
RETURNS TABLE (
  total_customers BIGINT,
  total_loans BIGINT,
  active_loans BIGINT,
  total_disbursed DECIMAL,
  total_collected DECIMAL,
  collection_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT c.id) as total_customers,
    COUNT(DISTINCT l.id) as total_loans,
    COUNT(DISTINCT CASE WHEN l.status = 'active' THEN l.id END) as active_loans,
    COALESCE(SUM(DISTINCT l.amount), 0) as total_disbursed,
    COALESCE(SUM(p.amount_paid), 0) as total_collected,
    CASE 
      WHEN SUM(p.amount_due) > 0 THEN 
        ROUND((SUM(p.amount_paid) / SUM(p.amount_due) * 100), 2)
      ELSE 0 
    END as collection_rate
  FROM customers c
  LEFT JOIN loans l ON c.id = l.customer_id
  LEFT JOIN payments p ON l.id = p.loan_id
  WHERE c.branch_id = p_branch_id;
END;
$$ LANGUAGE plpgsql;

-- Get agent performance
CREATE OR REPLACE FUNCTION get_agent_performance(p_agent_id UUID)
RETURNS TABLE (
  customers_registered BIGINT,
  loans_submitted BIGINT,
  loans_approved BIGINT,
  total_disbursed DECIMAL,
  payments_collected BIGINT,
  collection_amount DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT c.id) as customers_registered,
    COUNT(DISTINCT l.id) as loans_submitted,
    COUNT(DISTINCT CASE WHEN l.status IN ('approved', 'active') THEN l.id END) as loans_approved,
    COALESCE(SUM(DISTINCT CASE WHEN l.status IN ('approved', 'active') THEN l.amount END), 0) as total_disbursed,
    COUNT(DISTINCT CASE WHEN p.status = 'paid' THEN p.id END) as payments_collected,
    COALESCE(SUM(CASE WHEN p.status = 'paid' THEN p.amount_paid END), 0) as collection_amount
  FROM customers c
  LEFT JOIN loans l ON c.id = l.customer_id AND l.agent_id = p_agent_id
  LEFT JOIN payments p ON l.id = p.loan_id AND p.agent_id = p_agent_id
  WHERE c.agent_id = p_agent_id;
END;
$$ LANGUAGE plpgsql;

-- Generate weekly payment schedule
CREATE OR REPLACE FUNCTION generate_payment_schedule(p_loan_id UUID)
RETURNS TABLE (
  week_number INTEGER,
  payment_date DATE,
  amount_due DECIMAL
) AS $$
DECLARE
  v_loan RECORD;
  v_start_date DATE;
  v_week INTEGER;
BEGIN
  SELECT * INTO v_loan FROM loans WHERE id = p_loan_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Loan not found: %', p_loan_id;
  END IF;
  
  v_start_date := COALESCE(v_loan.approval_date::DATE, CURRENT_DATE);
  
  FOR v_week IN 1..v_loan.duration_weeks LOOP
    week_number := v_week;
    payment_date := v_start_date + (v_week * 7);
    amount_due := v_loan.weekly_payment;
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Loan details view
CREATE OR REPLACE VIEW loan_details_view AS
SELECT 
  l.*,
  c.full_name as customer_name,
  c.phone as customer_phone,
  c.address as customer_address,
  u_agent.full_name as agent_name,
  u_subadmin.full_name as subadmin_name,
  b.name as branch_name,
  COALESCE(SUM(p.amount_paid), 0) as total_paid,
  l.amount - COALESCE(SUM(p.amount_paid), 0) as balance_remaining
FROM loans l
JOIN customers c ON l.customer_id = c.id
JOIN users u_agent ON l.agent_id = u_agent.id
JOIN users u_subadmin ON l.subadmin_id = u_subadmin.id
JOIN branches b ON l.branch_id = b.id
LEFT JOIN payments p ON l.id = p.loan_id
GROUP BY l.id, c.id, u_agent.id, u_subadmin.id, b.id;

-- ============================================
-- SETUP COMPLETE!
-- ============================================

-- Verify setup
SELECT 'Database setup complete!' as message;
SELECT 'Branches created: ' || COUNT(*)::TEXT FROM branches;
SELECT 'Tables created: 6 (branches, users, customers, guarantors, loans, payments)' as info;
SELECT 'RLS enabled on all tables' as security;
SELECT 'Triggers and functions created' as automation;
