import { UserRole, BranchName } from '../types/user';
import { LoanStatus } from '../types/loan';
import { PaymentStatus } from '../types/payment';

export const USER_ROLES: Record<UserRole, string> = {
  admin: 'Admin',
  subadmin: 'Sub-Admin',
  agent: 'Agent',
};

export const BRANCHES: Record<BranchName, string> = {
  'Igando': 'Igando Branch',
  'Abule-Egba': 'Abule-Egba Branch',
};

export const LOAN_STATUSES: Record<LoanStatus, { label: string; color: string }> = {
  pending: { label: 'Pending Approval', color: 'text-yellow-500' },
  approved: { label: 'Approved', color: 'text-blue-500' },
  rejected: { label: 'Rejected', color: 'text-red-500' },
  active: { label: 'Active', color: 'text-green-500' },
  completed: { label: 'Completed', color: 'text-gray-500' },
  defaulted: { label: 'Defaulted', color: 'text-red-700' },
};

export const PAYMENT_STATUSES: Record<PaymentStatus, { label: string; color: string; bgColor: string }> = {
  paid: { label: 'Paid', color: 'text-green-700', bgColor: 'bg-green-100' },
  unpaid: { label: 'Unpaid', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  partial: { label: 'Partial', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  overdue: { label: 'Overdue', color: 'text-red-700', bgColor: 'bg-red-100' },
};

export const CURRENCY_SYMBOLS = ['$', '€', '£', '₦', '¥', 'C$'];

export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const ID_TYPES = ['NIN', 'BVN', 'Drivers License', 'Voters Card'];

export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
  'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

export const MARITAL_STATUS = [
  'Single',
  'Married',
  'Widowed'
];
