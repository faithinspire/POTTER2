-- ============================================
-- CONFIRM YOUR EMAIL
-- Replace 'YOUR_EMAIL_HERE' with your actual email
-- ============================================

-- Step 1: Confirm your email
UPDATE auth.users 
SET email_confirmed_at = NOW(),
    confirmation_token = '',
    email_change_token_new = '',
    email_change_token_current = ''
WHERE email = 'YOUR_EMAIL_HERE';

-- Step 2: Verify it worked
SELECT 
  email,
  email_confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN 'Email confirmed! You can login now.'
    ELSE 'Email NOT confirmed. Check the email address.'
  END as status
FROM auth.users 
WHERE email = 'YOUR_EMAIL_HERE';

-- ============================================
-- If you see "Email confirmed!", try logging in!
-- ============================================
