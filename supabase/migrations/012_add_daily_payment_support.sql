-- Migration 012: Add daily payment support to loans
-- This migration adds proper support for daily payment calculations

-- Add daily_payment column if it doesn't exist
ALTER TABLE loans ADD COLUMN IF NOT EXISTS daily_payment DECIMAL(15, 2);

-- Update duration_days for existing loans (if not already set)
UPDATE loans 
SET duration_days = duration_weeks * 7 
WHERE duration_days IS NULL;

-- Calculate daily_payment for existing loans
UPDATE loans 
SET daily_payment = ROUND(weekly_payment / 7, 2)
WHERE daily_payment IS NULL AND weekly_payment IS NOT NULL;

-- Create function to auto-calculate daily payment on insert/update
CREATE OR REPLACE FUNCTION calculate_daily_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-calculate duration_days from duration_weeks
  IF NEW.duration_days IS NULL AND NEW.duration_weeks IS NOT NULL THEN
    NEW.duration_days := NEW.duration_weeks * 7;
  END IF;
  
  -- Auto-calculate daily_payment from weekly_payment
  IF NEW.daily_payment IS NULL AND NEW.weekly_payment IS NOT NULL THEN
    NEW.daily_payment := ROUND(NEW.weekly_payment / 7, 2);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate daily payment
DROP TRIGGER IF EXISTS trigger_calculate_daily_payment ON loans;
CREATE TRIGGER trigger_calculate_daily_payment
  BEFORE INSERT OR UPDATE ON loans
  FOR EACH ROW
  EXECUTE FUNCTION calculate_daily_payment();

-- Add comment for documentation
COMMENT ON COLUMN loans.daily_payment IS 'Auto-calculated from weekly_payment (weekly_payment / 7)';
COMMENT ON COLUMN loans.duration_days IS 'Auto-calculated from duration_weeks (duration_weeks * 7)';
