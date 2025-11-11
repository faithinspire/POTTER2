import { LoanStatus } from '../../types/loan';
import { PaymentStatus } from '../../types/payment';
import { LOAN_STATUSES, PAYMENT_STATUSES } from '../../utils/constants';

interface BadgeProps {
  variant: 'success' | 'warning' | 'danger' | 'neutral';
  children: React.ReactNode;
}

export const Badge = ({ variant, children }: BadgeProps) => {
  const variantClasses = {
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    neutral: 'badge-neutral',
  };

  return (
    <span className={variantClasses[variant]}>
      {children}
    </span>
  );
};

interface LoanStatusBadgeProps {
  status: LoanStatus;
}

export const LoanStatusBadge = ({ status }: LoanStatusBadgeProps) => {
  const config = LOAN_STATUSES[status];
  
  const variantMap: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
    'text-green-500': 'success',
    'text-yellow-500': 'warning',
    'text-blue-500': 'neutral',
    'text-red-500': 'danger',
    'text-red-700': 'danger',
    'text-gray-500': 'neutral',
  };

  return (
    <Badge variant={variantMap[config.color] || 'neutral'}>
      {config.label}
    </Badge>
  );
};

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

export const PaymentStatusBadge = ({ status }: PaymentStatusBadgeProps) => {
  const config = PAYMENT_STATUSES[status];
  
  const variantMap: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
    'text-green-700': 'success',
    'text-yellow-700': 'warning',
    'text-red-700': 'danger',
    'text-gray-700': 'neutral',
  };

  return (
    <Badge variant={variantMap[config.color] || 'neutral'}>
      <div className={`w-2 h-2 rounded-full ${config.bgColor.replace('bg-', 'bg-opacity-100 ')}`} />
      {config.label}
    </Badge>
  );
};
