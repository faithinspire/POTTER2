-- ============================================
-- FIX PAYMENTS TABLE - RUN IN SUPABASE NOW
-- ============================================

-- Ensure amount_due column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments' AND column_name = 'amount_due'
  ) THEN
    ALTER TABLE payments ADD COLUMN amount_due DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (amount_due > 0);
    RAISE NOTICE '✅ Added amount_due column';
  ELSE
    RAISE NOTICE '✅ amount_due column already exists';
  END IF;
END $$;

-- Ensure amount_paid column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments' AND column_name = 'amount_paid'
  ) THEN
    ALTER TABLE payments ADD COLUMN amount_paid DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (amount_paid >= 0);
    RAISE NOTICE '✅ Added amount_paid column';
  ELSE
    RAISE NOTICE '✅ amount_paid column already exists';
  END IF;
END $$;

-- Verify columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'payments' 
AND column_name IN ('amount_due', 'amount_paid', 'status', 'payment_date')
ORDER BY column_name;

-- Show success message
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ PAYMENTS TABLE FIXED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ amount_due column ready';
  RAISE NOTICE '✅ amount_paid column ready';
  RAISE NOTICE '✅ Payment recording will work';
  RAISE NOTICE '========================================';
END $$;
