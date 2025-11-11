-- Enable Row Level Security on all tables
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE guarantors ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- BRANCHES TABLE POLICIES
-- ============================================

-- Everyone can read branches (needed for dropdowns)
CREATE POLICY "Anyone can view branches"
  ON branches FOR SELECT
  USING (true);

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Sub-admins can view users in their branch
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

-- Admins can insert/update/delete users
CREATE POLICY "Admins can manage users"
  ON users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- CUSTOMERS TABLE POLICIES
-- ============================================

-- Agents can view their own customers
CREATE POLICY "Agents can view own customers"
  ON customers FOR SELECT
  USING (
    agent_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'subadmin')
    )
  );

-- Sub-admins can view customers in their branch
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

-- Admins can view all customers
CREATE POLICY "Admins can view all customers"
  ON customers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Agents can insert customers
CREATE POLICY "Agents can create customers"
  ON customers FOR INSERT
  WITH CHECK (
    agent_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'agent'
    )
  );

-- Agents can update their own customers
CREATE POLICY "Agents can update own customers"
  ON customers FOR UPDATE
  USING (agent_id = auth.uid());

-- Admins and sub-admins can update customers
CREATE POLICY "Admins and sub-admins can update customers"
  ON customers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'subadmin')
    )
  );

-- ============================================
-- GUARANTORS TABLE POLICIES
-- ============================================

-- Inherit customer access (if you can see customer, you can see guarantors)
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

-- Agents can insert guarantors for their customers
CREATE POLICY "Agents can create guarantors"
  ON guarantors FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.id = guarantors.customer_id
      AND c.agent_id = auth.uid()
    )
  );

-- Agents can update guarantors for their customers
CREATE POLICY "Agents can update guarantors"
  ON guarantors FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.id = guarantors.customer_id
      AND c.agent_id = auth.uid()
    )
  );

-- ============================================
-- LOANS TABLE POLICIES
-- ============================================

-- Agents can view their own loans
CREATE POLICY "Agents can view own loans"
  ON loans FOR SELECT
  USING (
    agent_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'subadmin')
    )
  );

-- Sub-admins can view loans in their branch
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

-- Admins can view all loans
CREATE POLICY "Admins can view all loans"
  ON loans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Agents can create loans
CREATE POLICY "Agents can create loans"
  ON loans FOR INSERT
  WITH CHECK (
    agent_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'agent'
    )
  );

-- Sub-admins can update loans in their branch (for approval)
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

-- Admins can update all loans
CREATE POLICY "Admins can update all loans"
  ON loans FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- PAYMENTS TABLE POLICIES
-- ============================================

-- Agents can view their own payments
CREATE POLICY "Agents can view own payments"
  ON payments FOR SELECT
  USING (
    agent_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'subadmin')
    )
  );

-- Sub-admins can view payments in their branch
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

-- Admins can view all payments
CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Agents can create payments
CREATE POLICY "Agents can create payments"
  ON payments FOR INSERT
  WITH CHECK (
    agent_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'agent'
    )
  );

-- Agents can update their own payments
CREATE POLICY "Agents can update own payments"
  ON payments FOR UPDATE
  USING (agent_id = auth.uid());

-- Admins and sub-admins can update payments
CREATE POLICY "Admins and sub-admins can update payments"
  ON payments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'subadmin')
    )
  );

-- Add comments
COMMENT ON POLICY "Anyone can view branches" ON branches IS 'Public read access for branch selection';
COMMENT ON POLICY "Admins can view all users" ON users IS 'Admin has global user visibility';
COMMENT ON POLICY "Agents can view own customers" ON customers IS 'Agents see only their registered customers';
