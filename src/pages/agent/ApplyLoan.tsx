import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CustomerService } from '../../services/customerService';
import { LoanService } from '../../services/loanService';
import { Input, Select } from '../../components/shared/Input';
import { Button } from '../../components/shared/Button';
import { BackgroundAnimation } from '../../components/shared/BackgroundAnimation';
import { formatCurrency } from '../../utils/formatters';

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
    interest_rate: '10',
    duration_weeks: '12',
  });

  const [weeklyPayment, setWeeklyPayment] = useState(0);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (loan.amount && loan.interest_rate && loan.duration_weeks) {
      const payment = LoanService.calculateWeeklyPayment(
        parseFloat(loan.amount),
        parseFloat(loan.interest_rate),
        parseInt(loan.duration_weeks)
      );
      setWeeklyPayment(payment);
    }
  }, [loan.amount, loan.interest_rate, loan.duration_weeks]);

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

      await LoanService.createLoan({
        customer_id: loan.customer_id,
        agent_id: profile.id,
        branch_id: profile.branch_id!,
        amount: parseFloat(loan.amount),
        interest_rate: parseFloat(loan.interest_rate),
        duration_weeks: parseInt(loan.duration_weeks),
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
                placeholder="50000"
                required
                min="1000"
              />

              <Input
                label="Interest Rate (%)"
                type="number"
                value={loan.interest_rate}
                onChange={(e) => setLoan({ ...loan, interest_rate: e.target.value })}
                required
                min="0"
                max="100"
                step="0.1"
              />

              <Input
                label="Duration (Weeks)"
                type="number"
                value={loan.duration_weeks}
                onChange={(e) => setLoan({ ...loan, duration_weeks: e.target.value })}
                required
                min="1"
                max="104"
              />

              {weeklyPayment > 0 && (
                <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-sm text-gray-400 mb-2">Weekly Payment Amount:</p>
                  <p className="text-3xl font-bold text-green-400">{formatCurrency(weeklyPayment)}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Total Repayment: {formatCurrency(weeklyPayment * parseInt(loan.duration_weeks || '0'))}
                  </p>
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
