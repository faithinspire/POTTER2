import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PaymentService } from '../../services/paymentService';
import { Button } from '../../components/shared/Button';
import { BackgroundAnimation } from '../../components/shared/BackgroundAnimation';
import { Modal } from '../../components/shared/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { startOfWeek, addDays, format } from 'date-fns';

export const WeeklyPayments = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [stats, setStats] = useState({ total: 0, paid: 0, amount: 0 });
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [loanDetails, setLoanDetails] = useState<Record<string, any>>({});

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    loadPayments();
  }, [weekStart]);

  const loadPayments = async () => {
    try {
      if (!profile) return;
      setLoading(true);
      const data = await PaymentService.getWeeklyPayments(profile.id, weekStart);
      setPayments(data);
      
      // Load loan details for each unique loan
      const uniqueLoanIds = [...new Set(data.map((p: any) => p.loan_id))];
      const details: Record<string, any> = {};
      
      for (const loanId of uniqueLoanIds) {
        const loanData = await PaymentService.getLoanPaymentSummary(loanId);
        details[loanId] = loanData;
      }
      setLoanDetails(details);
      
      // Calculate stats for today
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayStats = await PaymentService.getPaymentStats(profile.id, today);
      setStats(todayStats);
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCellClick = (cell: any) => {
    setSelectedPayment(cell);
    setShowModal(true);
  };

  const handlePaymentToggle = async (cell: any) => {
    try {
      if (!profile) {
        alert('Please login again');
        return;
      }
      
      const newStatus = cell.status === 'paid' ? 'unpaid' : 'paid';
      const amountPaid = newStatus === 'paid' ? cell.amount_due : 0;

      await PaymentService.recordPayment({
        loan_id: cell.loan_id,
        customer_id: cell.customer_id,
        agent_id: profile.id,
        branch_id: profile.branch_id!,
        amount_due: cell.amount_due,
        amount_paid: amountPaid,
        payment_date: format(cell.date, 'yyyy-MM-dd'),
      });

      // Reload payments
      setShowModal(false);
      await loadPayments();
      alert('Payment updated successfully!');
    } catch (err: any) {
      console.error('Failed to record payment:', err);
      alert('Error: ' + (err.message || 'Failed to record payment'));
    }
  };

  // Group payments by customer
  const customerGroups = payments.reduce((acc: any, payment) => {
    if (!acc[payment.customer_id]) {
      acc[payment.customer_id] = {
        customer_name: payment.customer_name,
        payments: [],
      };
    }
    acc[payment.customer_id].payments.push(payment);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-900 relative" style={{ backgroundColor: '#0F172A' }}>
      <BackgroundAnimation />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="secondary" onClick={() => navigate('/agent/dashboard')}>
            ← Back to Dashboard
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setWeekStart(addDays(weekStart, -7))}>
              ← Previous Week
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}>
              This Week
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setWeekStart(addDays(weekStart, 7))}>
              Next Week →
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="glass-card p-4">
            <p className="text-sm text-gray-400">Today's Collections</p>
            <p className="text-2xl font-bold text-green-400">{formatCurrency(stats.amount)}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-gray-400">Payments Collected</p>
            <p className="text-2xl font-bold text-white">{stats.paid} / {stats.total}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-gray-400">Collection Rate</p>
            <p className="text-2xl font-bold text-blue-400">
              {stats.total > 0 ? Math.round((stats.paid / stats.total) * 100) : 0}%
            </p>
          </div>
        </div>

        <div className="glass-card p-6">
          <h1 className="text-2xl font-bold text-white mb-2">Weekly Payment Tracking</h1>
          <p className="text-gray-400 mb-6">
            Week of {formatDate(weekStart)} - {formatDate(addDays(weekStart, 5))}
          </p>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 border-4 border-primary-blue/30 border-t-primary-gold rounded-full animate-spin"></div>
              <p className="text-gray-400 mt-4">Loading payments...</p>
            </div>
          ) : Object.keys(customerGroups).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No active loans found for this week.</p>
              <Button variant="gold" onClick={() => navigate('/agent/apply-loan')}>
                Apply for Loan
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-3 text-white font-semibold">Customer</th>
                    {days.map((day, i) => (
                      <th key={day} className="text-center p-3 text-white font-semibold">
                        {day}<br/>
                        <span className="text-xs text-gray-400">{format(addDays(weekStart, i), 'MMM d')}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(customerGroups).map(([customerId, group]: [string, any]) => (
                    <tr key={customerId} className="border-b border-gray-700/50">
                      <td className="p-3 text-white font-medium">{group.customer_name}</td>
                      {group.payments.slice(0, 6).map((payment: any, i: number) => (
                        <td key={i} className="p-3 text-center">
                          <button
                            onClick={() => handleCellClick(payment)}
                            className={`w-12 h-12 rounded-lg font-bold transition-all hover:scale-110 cursor-pointer ${
                              payment.status === 'paid'
                                ? 'bg-green-500 text-white hover:bg-green-600'
                                : payment.status === 'overdue'
                                ? 'bg-red-500/20 text-red-400 border-2 border-red-500 hover:bg-red-500/30'
                                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                            }`}
                          >
                            {payment.status === 'paid' ? '✓' : '○'}
                          </button>
                          <p className="text-xs text-gray-500 mt-1">{formatCurrency(payment.amount_due)}</p>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-gray-400 mb-2">Legend:</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-500 rounded"></div>
                <span className="text-gray-300">Paid</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-700 rounded"></div>
                <span className="text-gray-300">Unpaid</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-red-500/20 border-2 border-red-500 rounded"></div>
                <span className="text-gray-300">Overdue</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Detail Modal */}
      {showModal && selectedPayment && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Payment Details"
        >
          <div className="space-y-4">
            <div className="bg-slate-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">{selectedPayment.customer_name}</h3>
              <p className="text-sm text-gray-400">Payment Date: {formatDate(selectedPayment.date)}</p>
            </div>

            {loanDetails[selectedPayment.loan_id] && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800 p-4 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Loan Amount</p>
                  <p className="text-xl font-bold text-white">
                    {formatCurrency(loanDetails[selectedPayment.loan_id].loanAmount)}
                  </p>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Daily Payment</p>
                  <p className="text-xl font-bold text-blue-400">
                    {formatCurrency(selectedPayment.amount_due)}
                  </p>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Total Paid</p>
                  <p className="text-xl font-bold text-green-400">
                    {formatCurrency(loanDetails[selectedPayment.loan_id].totalPaid)}
                  </p>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Balance Left</p>
                  <p className="text-xl font-bold text-yellow-400">
                    {formatCurrency(loanDetails[selectedPayment.loan_id].balanceLeft)}
                  </p>
                </div>
              </div>
            )}

            <div className="bg-slate-800 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-2">Payment Status</p>
              <div className={`inline-block px-4 py-2 rounded-lg font-semibold ${
                selectedPayment.status === 'paid'
                  ? 'bg-green-500 text-white'
                  : selectedPayment.status === 'overdue'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-600 text-white'
              }`}>
                {selectedPayment.status.toUpperCase()}
              </div>
            </div>

            <div className="flex gap-3">
              {selectedPayment.status !== 'paid' ? (
                <Button
                  variant="primary"
                  onClick={() => handlePaymentToggle(selectedPayment)}
                  className="flex-1"
                >
                  Mark as Paid
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => handlePaymentToggle(selectedPayment)}
                  className="flex-1"
                >
                  Mark as Unpaid
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={() => setShowModal(false)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
