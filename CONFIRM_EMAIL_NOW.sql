-- ============================================
-- CONFIRM YOUR EMAIL - RUN THIS NOW
-- Replace 'youremail@gmail.com' with YOUR email
-- ============================================

-- Confirm your email (replace with your actual email)
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'youremail@gmail.com';

-- Verify it worked
SELECT 
  email,
  email_confirmed_at,
  'Email confirmed! Now you can login.' as status
FROM auth.users 
WHERE email = 'youremail@gmail.com';

-- ============================================
-- Now try logging in again - it will work!
-- ============================================
