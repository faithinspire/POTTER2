-- ============================================
-- TRIGGER: Auto-update timestamps
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at column
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

COMMENT ON FUNCTION update_updated_at_column IS 'Automatically updates the updated_at timestamp';

-- ============================================
-- TRIGGER: Link agent to sub-admin on creation
-- ============================================

CREATE OR REPLACE FUNCTION link_agent_to_subadmin()
RETURNS TRIGGER AS $$
DECLARE
  v_subadmin_id UUID;
BEGIN
  -- Only process for agents with a branch
  IF NEW.role = 'agent' AND NEW.branch_id IS NOT NULL THEN
    -- Find the sub-admin for this branch
    SELECT id INTO v_subadmin_id
    FROM users
    WHERE role = 'subadmin' 
    AND branch_id = NEW.branch_id
    LIMIT 1;
    
    -- Log the linkage (you can add a notification table later)
    RAISE NOTICE 'Agent % linked to sub-admin % in branch %', NEW.id, v_subadmin_id, NEW.branch_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_link_agent_to_subadmin
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION link_agent_to_subadmin();

COMMENT ON FUNCTION link_agent_to_subadmin IS 'Links newly created agents to their branch sub-admin';

-- ============================================
-- TRIGGER: Auto-set loan subadmin_id
-- ============================================

CREATE OR REPLACE FUNCTION set_loan_subadmin()
RETURNS TRIGGER AS $$
DECLARE
  v_subadmin_id UUID;
BEGIN
  -- Find the sub-admin for the loan's branch
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

COMMENT ON FUNCTION set_loan_subadmin IS 'Automatically assigns loan to branch sub-admin';

-- ============================================
-- FUNCTION: Calculate weekly payment
-- ============================================

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
  -- Calculate total amount with interest
  v_total_amount := p_amount * (1 + (p_interest_rate / 100));
  
  -- Calculate weekly payment
  v_weekly_payment := v_total_amount / p_duration_weeks;
  
  -- Round to 2 decimal places
  RETURN ROUND(v_weekly_payment, 2);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_weekly_payment IS 'Calculates weekly payment amount including interest';

-- ============================================
-- FUNCTION: Get branch statistics
-- ============================================

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

COMMENT ON FUNCTION get_branch_stats IS 'Returns comprehensive statistics for a branch';

-- ============================================
-- FUNCTION: Get agent performance
-- ============================================

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

COMMENT ON FUNCTION get_agent_performance IS 'Returns performance metrics for an agent';

-- ============================================
-- FUNCTION: Generate weekly payment schedule
-- ============================================

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
  -- Get loan details
  SELECT * INTO v_loan FROM loans WHERE id = p_loan_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Loan not found: %', p_loan_id;
  END IF;
  
  -- Start from approval date or current date
  v_start_date := COALESCE(v_loan.approval_date::DATE, CURRENT_DATE);
  
  -- Generate weekly schedule
  FOR v_week IN 1..v_loan.duration_weeks LOOP
    week_number := v_week;
    payment_date := v_start_date + (v_week * 7);
    amount_due := v_loan.weekly_payment;
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_payment_schedule IS 'Generates weekly payment schedule for a loan';

-- ============================================
-- VIEW: Loan details with customer info
-- ============================================

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

COMMENT ON VIEW loan_details_view IS 'Comprehensive loan information with related data';
