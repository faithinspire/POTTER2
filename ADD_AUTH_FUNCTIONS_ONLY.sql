-- Add password_hash column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- Update existing users table to make password_hash NOT NULL after adding it
-- First, set a default hash for any existing users without one
UPDATE users 
SET password_hash = crypt('ChangeMe123!', gen_salt('bf'))
WHERE password_hash IS NULL;

-- Create admin user if doesn't exist
INSERT INTO users (email, password_hash, full_name, phone, role, branch_id, is_active)
VALUES (
  'admin@millenniumpotter.com',
  crypt('Password123!', gen_salt('bf')),
  'Admin User',
  '+234 800 000 0000',
  'admin',
  NULL,
  TRUE
)
ON CONFLICT (email) 
DO UPDATE SET password_hash = crypt('Password123!', gen_salt('bf'));

-- Create authentication function
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

-- Create user creation function
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
  INSERT INTO users (email, password_hash, full_name, phone, role, branch_id, is_active)
  VALUES (
    user_email,
    crypt(user_password, gen_salt('bf')),
    user_full_name,
    user_phone,
    user_role,
    user_branch_id,
    TRUE
  )
  RETURNING id INTO new_user_id;
  
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the functions
SELECT 
  'Functions created successfully!' as status,
  (SELECT COUNT(*) FROM users WHERE email = 'admin@millenniumpotter.com') as admin_exists;

-- Test authentication
SELECT * FROM authenticate_user('admin@millenniumpotter.com', 'Password123!');
