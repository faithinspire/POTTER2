-- Confirm admin email (in case it's not confirmed)
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'admin@millenniumpotter.com';

-- Verify it worked
SELECT 
  email, 
  email_confirmed_at,
  created_at
FROM auth.users 
WHERE email = 'admin@millenniumpotter.com';
