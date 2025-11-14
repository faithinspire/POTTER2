/**
 * Interest Calculation Utility
 * 
 * Business Rule: 
 * - Base: ₦10,000 = ₦1,800 interest
 * - Formula: (loan_amount / 10,000) * 1,800
 * 
 * Examples:
 * - ₦10,000 → ₦1,800 interest
 * - ₦30,000 → ₦5,400 interest (3 × ₦1,800)
 * - ₦50,000 → ₦9,000 interest (5 × ₦1,800)
 */

const BASE_AMOUNT = 10000; // ₦10,000
const BASE_INTEREST = 1800; // ₦1,800

export const calculateInterest = (loanAmount: number): number => {
  if (loanAmount <= 0) return 0;
  
  // Calculate multiplier based on base amount
  const multiplier = loanAmount / BASE_AMOUNT;
  
  // Calculate interest
  const interest = multiplier * BASE_INTEREST;
  
  return Math.round(interest); // Round to nearest naira
};

export const calculateTotalRepayment = (loanAmount: number): number => {
  const interest = calculateInterest(loanAmount);
  return loanAmount + interest;
};

export const calculateWeeklyPayment = (loanAmount: number, weeks: number = 12): number => {
  const totalRepayment = calculateTotalRepayment(loanAmount);
  return Math.round(totalRepayment / weeks);
};

export const getInterestRate = (loanAmount: number): number => {
  if (loanAmount <= 0) return 0;
  const interest = calculateInterest(loanAmount);
  return (interest / loanAmount) * 100; // Return as percentage
};

// Validation function
export const validateLoanAmount = (amount: number): { isValid: boolean; message?: string } => {
  if (amount <= 0) {
    return { isValid: false, message: 'Loan amount must be greater than zero' };
  }
  
  if (amount < 5000) {
    return { isValid: false, message: 'Minimum loan amount is ₦5,000' };
  }
  
  if (amount > 1000000) {
    return { isValid: false, message: 'Maximum loan amount is ₦1,000,000' };
  }
  
  return { isValid: true };
};

// Format interest calculation for display
export const formatInterestBreakdown = (loanAmount: number) => {
  const interest = calculateInterest(loanAmount);
  const total = calculateTotalRepayment(loanAmount);
  const weekly = calculateWeeklyPayment(loanAmount);
  const rate = getInterestRate(loanAmount);
  
  return {
    principal: loanAmount,
    interest,
    total,
    weeklyPayment: weekly,
    interestRate: rate,
    breakdown: `₦${loanAmount.toLocaleString()} + ₦${interest.toLocaleString()} interest = ₦${total.toLocaleString()} total`
  };
};