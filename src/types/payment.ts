export type PaymentStatus = 'paid' | 'unpaid' | 'partial' | 'overdue';

export interface Payment {
  id: string;
  loan_id: string;
  customer_id: string;
  agent_id: string;
  branch_id: string;
  amount_due: number;
  amount_paid: number;
  payment_date: string;
  recorded_at: string;
  status: PaymentStatus;
  notes: string | null;
}

export interface PaymentCell {
  customer_id: string;
  customer_name: string;
  loan_id: string;
  date: Date;
  amount_due: number;
  amount_paid: number;
  status: PaymentStatus;
  payment_id: string | null;
}

export interface WeeklyPaymentGrid {
  weekStartDate: Date;
  customers: {
    id: string;
    name: string;
    loan_id: string;
    weekly_amount: number;
  }[];
  payments: PaymentCell[];
}
