import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CustomerService } from '../../services/customerService';
import { LoanService } from '../../services/loanService';
import { Input, Select } from '../../components/shared/Input';
import { Button } from '../../components/shared/Button';
import { BackgroundAnimation } from '../../components/shared/BackgroundAnimation';
import { formatCurrency } from '../../utils/formatters';
import { calculateInterest, calculateTotalRepayment, calculateWeeklyPayment, formatInterestBreakdown, validateLoanAmount } from '../../utils/interestCalculator';

export const ApplyLoan = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);

  const [loan, setLoan] = useState({
    customer_id: '',
    amount: '',
    duration_weeks: '12',
  });

  const [interestBreakdown, setInterestBreakdown] = useState<any>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (loan.amount && loan.duration_weeks) {
      const amount = parseFloat(loan.amount);
      const weeks = parseInt(loan.duration_weeks);
      
      if (amount > 0 && weeks > 0) {
        const validation = validateLoanAmount(amount);
        if (validation.isValid) {
          const breakdown = formatInterestBreakdown(amount);
          const weeklyPayment = calculateWeeklyPayment(amount, weeks);
          setInterestBreakdown({
            ...breakdown,
            weeklyPayment,
            totalWeeks: weeks
          });
          setError('');
        } else {
          setError(validation.message || '');
          setInterestBreakdown(null);
        }
      } else {
        setInterestBreakdown(null);
      }
    }
  }, [loan.amount, loan.duration_weeks]);

  const loadCustomers = async () => {
    try {
      if (!profile) return;
      const data = await CustomerService.getCustomersByAgent(profile.id);
      setCustomers(data);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!profile) throw new Error('User profile not found');

      const amount = parseFloat(loan.amount);
      const weeks = parseInt(loan.duration_weeks);
      const interest = calculateInterest(amount);
      const interestRate = (interest / amount) * 100;

      await LoanService.createLoan({
        customer_id: loan.customer_id,
        agent_id: profile.id,
        branch_id: profile.branch_id!,
        amount: amount,
        interest_rate: interestRate,
        duration_weeks: weeks,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/agent/loans');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit loan application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 relative" style={{ backgroundColor: '#0F172A' }}>
      <BackgroundAnimation />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="secondary" onClick={() => navigate('/agent/dashboard')}>
            ← Back to Dashboard
          </Button>
        </div>

        <div className="glass-card p-8 max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Apply for Loan</h1>
          <p className="text-gray-400 mb-8">Submit a loan application for your customer</p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200">
              ✅ Loan application submitted successfully! Redirecting...
            </div>
          )}

          {loadingCustomers ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 border-4 border-primary-blue/30 border-t-primary-gold rounded-full animate-spin"></div>
              <p className="text-gray-400 mt-4">Loading customers...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No customers found. Please register a customer first.</p>
              <Button variant="gold" onClick={() => navigate('/agent/register-customer')}>
                Register Customer
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Select
                label="Select Customer"
                value={loan.customer_id}
                onChange={(e) => setLoan({ ...loan, customer_id: e.target.value })}
                options={customers.map(c => ({ value: c.id, label: `${c.full_name} - ${c.phone}` }))}
                required
              />

              <Input
                label="Loan Amount (₦)"
                type="number"
                value={loan.amount}
                onChange={(e) => setLoan({ ...loan, amount: e.target.value })}
                placeholder="10000"
                required
                min="5000"
                max="1000000"
                step="1000"
              />

              <Input
                label="Duration (Weeks)"
                type="number"
                value={loan.duration_weeks}
                onChange={(e) => setLoan({ ...loan, duration_weeks: e.target.value })}
                required
                min="4"
                max="52"
                placeholder="12"
              />

              {/* Interest Calculation Display */}
              {interestBreakdown && (
                <div className="p-6 bg-gradient-to-r from-yellow-500/10 to-green-500/10 border border-yellow-500/30 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">💰 Loan Calculation</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-400">Principal Amount</p>
                      <p className="text-xl font-bold text-white">{formatCurrency(interestBreakdown.principal)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Interest Amount</p>
                      <p className="text-xl font-bold text-yellow-400">{formatCurrency(interestBreakdown.interest)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Total Repayment</p>
                      <p className="text-xl font-bold text-green-400">{formatCurrency(interestBreakdown.total)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Weekly Payment</p>
                      <p className="text-xl font-bold text-blue-400">{formatCurrency(interestBreakdown.weeklyPayment)}</p>
                    </div>
                  </div>
                  
                  <div className="bg-black/20 p-4 rounded-lg">
                    <p className="text-sm text-gray-400 mb-2">Interest Rate: {interestBreakdown.interestRate.toFixed(1)}%</p>
                    <p className="text-sm text-gray-300">{interestBreakdown.breakdown}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      * Interest calculated as: (₦{interestBreakdown.principal.toLocaleString()} ÷ ₦10,000) × ₦1,800 = ₦{interestBreakdown.interest.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" variant="gold" loading={loading} fullWidth>
                  {loading ? 'Submitting...' : 'Submit Loan Application'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => navigate('/agent/dashboard')}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
