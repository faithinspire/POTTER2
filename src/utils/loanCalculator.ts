/**
 * Loan Calculator with Custom Interest Rules
 * Interest: ₦1,800 per ₦10,000 per month
 */

export interface LoanSchedule {
  loanAmount: number;
  totalInterest: number;
  totalRepayment: number;
  dailyPayment: number;
  numberOfDays: number;
}

/**
 * Calculate loan repayment schedule
 * Rules:
 * - ₦10,000 = ₦1,800 interest, pay ₦1,000/day for 10 days
 * - ₦20,000 = ₦3,600 interest, pay ₦1,000/day for 20 days
 * - ₦30,000 = ₦5,400 interest, pay ₦1,000/day for 30 days
 * - ₦40,000 = ₦7,200 interest, pay ₦1,500/day for 27 days
 * - And so on...
 */
export function calculateLoanSchedule(loanAmount: number): LoanSchedule {
  const interestPer10k = 1800;
  const units = loanAmount / 10000; // How many ₦10,000 units
  
  let dailyPayment: number;
  let numberOfDays: number;
  let totalInterest: number;
  
  // Calculate based on loan amount
  if (loanAmount <= 30000) {
    // ₦10k-₦30k: ₦1,000/day
    dailyPayment = 1000;
    totalInterest = units * interestPer10k;
    numberOfDays = Math.ceil((loanAmount + totalInterest) / dailyPayment);
  } else if (loanAmount <= 100000) {
    // ₦40k-₦100k: ₦1,500/day
    dailyPayment = 1500;
    totalInterest = units * interestPer10k;
    numberOfDays = Math.ceil((loanAmount + totalInterest) / dailyPayment);
  } else if (loanAmount <= 200000) {
    // ₦110k-₦200k: ₦2,000/day
    dailyPayment = 2000;
    totalInterest = units * interestPer10k;
    numberOfDays = Math.ceil((loanAmount + totalInterest) / dailyPayment);
  } else if (loanAmount <= 300000) {
    // ₦210k-₦300k: ₦3,000/day
    dailyPayment = 3000;
    totalInterest = units * interestPer10k;
    numberOfDays = Math.ceil((loanAmount + totalInterest) / dailyPayment);
  } else if (loanAmount <= 400000) {
    // ₦310k-₦400k: ₦4,000/day
    dailyPayment = 4000;
    totalInterest = units * interestPer10k;
    numberOfDays = Math.ceil((loanAmount + totalInterest) / dailyPayment);
  } else {
    // ₦410k-₦500k: ₦5,000/day
    dailyPayment = 5000;
    totalInterest = units * interestPer10k;
    numberOfDays = Math.ceil((loanAmount + totalInterest) / dailyPayment);
  }
  
  const totalRepayment = loanAmount + totalInterest;
  
  return {
    loanAmount,
    totalInterest,
    totalRepayment,
    dailyPayment,
    numberOfDays
  };
}

/**
 * Calculate remaining balance after payments
 */
export function calculateRemainingBalance(
  loanAmount: number,
  totalPaid: number
): {
  totalRepayment: number;
  totalPaid: number;
  remainingBalance: number;
  percentagePaid: number;
} {
  const schedule = calculateLoanSchedule(loanAmount);
  const remainingBalance = Math.max(0, schedule.totalRepayment - totalPaid);
  const percentagePaid = (totalPaid / schedule.totalRepayment) * 100;
  
  return {
    totalRepayment: schedule.totalRepayment,
    totalPaid,
    remainingBalance,
    percentagePaid
  };
}

/**
 * Get loan schedule examples for reference
 */
export function getLoanScheduleExamples() {
  return [
    { amount: 10000, ...calculateLoanSchedule(10000) },
    { amount: 20000, ...calculateLoanSchedule(20000) },
    { amount: 30000, ...calculateLoanSchedule(30000) },
    { amount: 40000, ...calculateLoanSchedule(40000) },
    { amount: 50000, ...calculateLoanSchedule(50000) },
    { amount: 100000, ...calculateLoanSchedule(100000) },
    { amount: 200000, ...calculateLoanSchedule(200000) },
    { amount: 300000, ...calculateLoanSchedule(300000) },
    { amount: 400000, ...calculateLoanSchedule(400000) },
    { amount: 500000, ...calculateLoanSchedule(500000) },
  ];
}
