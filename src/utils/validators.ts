/**
 * Validate email address
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate Nigerian phone number
 */
export const isValidPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  // Nigerian numbers: 11 digits starting with 0, or 10 digits without 0
  return (cleaned.length === 11 && cleaned.startsWith('0')) || cleaned.length === 10;
};

/**
 * Validate NIN (National Identification Number)
 */
export const isValidNIN = (nin: string): boolean => {
  const cleaned = nin.replace(/\D/g, '');
  return cleaned.length === 11;
};

/**
 * Validate BVN (Bank Verification Number)
 */
export const isValidBVN = (bvn: string): boolean => {
  const cleaned = bvn.replace(/\D/g, '');
  return cleaned.length === 11;
};

/**
 * Validate loan amount
 */
export const isValidLoanAmount = (amount: number, min: number = 1000, max: number = 10000000): boolean => {
  return amount >= min && amount <= max;
};

/**
 * Validate interest rate
 */
export const isValidInterestRate = (rate: number): boolean => {
  return rate >= 0 && rate <= 100;
};

/**
 * Validate loan duration in weeks
 */
export const isValidDuration = (weeks: number): boolean => {
  return weeks >= 1 && weeks <= 104; // Max 2 years
};

/**
 * Validate required field
 */
export const isRequired = (value: string | number | null | undefined): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

/**
 * Validate minimum length
 */
export const minLength = (value: string, min: number): boolean => {
  return value.trim().length >= min;
};

/**
 * Validate maximum length
 */
export const maxLength = (value: string, max: number): boolean => {
  return value.trim().length <= max;
};
