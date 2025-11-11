-- ============================================
-- SEED DATA: Initial setup for testing
-- ============================================

-- Note: This assumes you've already created auth users in Supabase Auth
-- You'll need to replace these UUIDs with actual auth.users IDs

-- ============================================
-- SEED: Admin User
-- ============================================
-- Instructions: 
-- 1. Create admin user in Supabase Auth dashboard (email: admin@millenniumpotter.com)
-- 2. Copy the user ID and replace 'ADMIN_USER_ID_HERE' below
-- 3. Run this migration

-- Example (replace with actual ID):
-- INSERT INTO users (id, email, role, branch_id, full_name, phone) VALUES
--   ('ADMIN_USER_ID_HERE', 'admin@millenniumpotter.com', 'admin', NULL, 'System Administrator', '+234 800 000 0000');

-- ============================================
-- SEED: Sub-Admin Users
-- ============================================
-- Instructions:
-- 1. Create sub-admin users in Supabase Auth dashboard
--    - subadmin.igando@millenniumpotter.com
--    - subadmin.abuleegba@millenniumpotter.com
-- 2. Get branch IDs from branches table
-- 3. Replace IDs below and uncomment

-- Get Igando branch ID
-- DO $$
-- DECLARE
--   v_igando_branch_id UUID;
--   v_abuleegba_branch_id UUID;
-- BEGIN
--   SELECT id INTO v_igando_branch_id FROM branches WHERE name = 'Igando';
--   SELECT id INTO v_abuleegba_branch_id FROM branches WHERE name = 'Abule-Egba';
  
--   -- Insert Igando Sub-Admin
--   INSERT INTO users (id, email, role, branch_id, full_name, phone) VALUES
--     ('IGANDO_SUBADMIN_ID_HERE', 'subadmin.igando@millenniumpotter.com', 'subadmin', v_igando_branch_id, 'Igando Branch Manager', '+234 800 000 0001');
  
--   -- Insert Abule-Egba Sub-Admin
--   INSERT INTO users (id, email, role, branch_id, full_name, phone) VALUES
--     ('ABULEEGBA_SUBADMIN_ID_HERE', 'subadmin.abuleegba@millenniumpotter.com', 'subadmin', v_abuleegba_branch_id, 'Abule-Egba Branch Manager', '+234 800 000 0002');
-- END $$;

-- ============================================
-- SEED: Sample Agent Users
-- ============================================
-- Instructions:
-- 1. Create agent users in Supabase Auth dashboard
--    - agent1.igando@millenniumpotter.com
--    - agent2.igando@millenniumpotter.com
--    - agent1.abuleegba@millenniumpotter.com
-- 2. Replace IDs below and uncomment

-- DO $$
-- DECLARE
--   v_igando_branch_id UUID;
--   v_abuleegba_branch_id UUID;
-- BEGIN
--   SELECT id INTO v_igando_branch_id FROM branches WHERE name = 'Igando';
--   SELECT id INTO v_abuleegba_branch_id FROM branches WHERE name = 'Abule-Egba';
  
--   -- Igando Agents
--   INSERT INTO users (id, email, role, branch_id, full_name, phone) VALUES
--     ('AGENT1_IGANDO_ID_HERE', 'agent1.igando@millenniumpotter.com', 'agent', v_igando_branch_id, 'John Okafor', '+234 801 234 5671'),
--     ('AGENT2_IGANDO_ID_HERE', 'agent2.igando@millenniumpotter.com', 'agent', v_igando_branch_id, 'Mary Adeyemi', '+234 801 234 5672');
  
--   -- Abule-Egba Agents
--   INSERT INTO users (id, email, role, branch_id, full_name, phone) VALUES
--     ('AGENT1_ABULEEGBA_ID_HERE', 'agent1.abuleegba@millenniumpotter.com', 'agent', v_abuleegba_branch_id, 'David Okonkwo', '+234 801 234 5673');
-- END $$;

-- ============================================
-- HELPER: Create test user function
-- ============================================

CREATE OR REPLACE FUNCTION create_test_users()
RETURNS TEXT AS $$
BEGIN
  RETURN 'To create test users:
  
1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add User" and create:
   - admin@millenniumpotter.com (password: Admin@123)
   - subadmin.igando@millenniumpotter.com (password: SubAdmin@123)
   - subadmin.abuleegba@millenniumpotter.com (password: SubAdmin@123)
   - agent1.igando@millenniumpotter.com (password: Agent@123)
   - agent2.igando@millenniumpotter.com (password: Agent@123)
   - agent1.abuleegba@millenniumpotter.com (password: Agent@123)

3. After creating auth users, run the seed_users.sql script with actual user IDs
4. Or use the Supabase client to insert users programmatically';
END;
$$ LANGUAGE plpgsql;

-- Call this function to see instructions
SELECT create_test_users();

-- ============================================
-- SAMPLE DATA: Demo customers and loans
-- ============================================
-- Uncomment after creating actual users

-- Sample customer for testing (replace agent_id and branch_id)
-- INSERT INTO customers (full_name, phone, email, address, id_type, id_number, branch_id, agent_id) VALUES
--   ('Chinedu Eze', '+234 802 345 6789', 'chinedu@example.com', '15 Market Street, Igando, Lagos', 'NIN', '12345678901', 
--    (SELECT id FROM branches WHERE name = 'Igando'), 
--    (SELECT id FROM users WHERE email = 'agent1.igando@millenniumpotter.com'));

-- Sample guarantor
-- INSERT INTO guarantors (customer_id, full_name, phone, address, relationship, id_type, id_number) VALUES
--   ((SELECT id FROM customers WHERE phone = '+234 802 345 6789'), 
--    'Ngozi Eze', '+234 803 456 7890', '15 Market Street, Igando, Lagos', 'Spouse', 'NIN', '98765432109');

-- Sample loan
-- INSERT INTO loans (customer_id, agent_id, branch_id, amount, interest_rate, duration_weeks, weekly_payment, status) VALUES
--   ((SELECT id FROM customers WHERE phone = '+234 802 345 6789'),
--    (SELECT id FROM users WHERE email = 'agent1.igando@millenniumpotter.com'),
--    (SELECT id FROM branches WHERE name = 'Igando'),
--    50000.00, 10.00, 12, 
--    calculate_weekly_payment(50000.00, 10.00, 12),
--    'pending');

COMMENT ON FUNCTION create_test_users IS 'Displays instructions for creating test users';
