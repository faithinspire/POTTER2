import { useState, useEffect } from 'react';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';
import { Input } from '../shared/Input';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { LoanService } from '../../services/loanService';
import { PaymentService } from '../../services/paymentService';
import { calculateLoanSchedule, calculateRemainingBalance } from '../../utils/loanCalculator';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAuth } from '../../contexts/AuthContext';

interface LoanWithPayments {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  amount: number;
  status: string;
  application_date: string;
  totalPaid: number;
}

export const DailyPaymentCollector = () => {
  const { profile } = useAuth();
  const [loans, setLoans] = useState<LoanWithPayments[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState<LoanWithPayments | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    try {
      setLoading(true);
      if (!profile) return;

      const loansData = await LoanService.getLoansByAgent(profile.id);
      const activeLoans = loansData.filter(l => l.status === 'active' || l.status === 'approved');

      // Get payment totals for each loan
      const loansWithPayments = await Promise.all(
        activeLoans.map(async (loan) => {
          try {
            const summary = await PaymentService.getLoanPaymentSummary(loan.id);
            return {
              ...loan,
              totalPaid: summary.totalPaid
            };
          } catch (error) {
            return {
              ...loan,
              totalPaid: 0
            };
          }
        })
      );

      setLoans(loansWithPayments);
    } catch (error) {
      console.error('Error loading loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoanClick = (loan: LoanWithPayments) => {
    setSelectedLoan(loan);
    setShowModal(true);
    
    // Pre-fill with expected daily payment
    const schedule = calculateLoanSchedule(loan.amount);
    setPaymentAmount(schedule.dailyPayment.toString());
  };

  const handleSubmitPayment = async () => {
    if (!selectedLoan || !profile) return;
    
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      setSubmitting(true);

      await PaymentService.recordDailyPayment({
        customer_id: selectedLoan.customer_id,
        amount,
        payment_type: 'daily',
        payment_date: new Date().toISOString().split('T')[0],
        notes: `Daily payment collected by ${profile.full_name}`
      });

      alert('Payment recorded successfully!');
      setShowModal(false);
      setPaymentAmount('');
      loadLoans(); // Reload to update balances
    } catch (error: any) {
      console.error('Error recording payment:', error);
      alert(error.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredLoans = loans.filter(loan =>
    loan.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.customer_phone.includes(searchTerm)
  );

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card className="p-4">
        <Input
          type="text"
          placeholder="Search by customer name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Card>

      {/* Loans List */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-white mb-4">Active Loans - Collect Payment</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-3 text-white font-semibold">Customer</th>
                <th className="text-left p-3 text-white font-semibold">Phone</th>
                <th className="text-left p-3 text-white font-semibold">Loan Amount</th>
                <th className="text-left p-3 text-white font-semibold">Total Paid</th>
                <th className="text-left p-3 text-white font-semibold">Balance</th>
                <th className="text-left p-3 text-white font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    No active loans found
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan) => {
                  const balance = calculateRemainingBalance(loan.amount, loan.totalPaid);
                  const schedule = calculateLoanSchedule(loan.amount);
                  
                  return (
                    <tr
                      key={loan.id}
                      className="border-b border-gray-700/50 hover:bg-white/5 cursor-pointer"
                      onClick={() => handleLoanClick(loan)}
                    >
                      <td className="p-3 text-white font-medium">{loan.customer_name}</td>
                      <td className="p-3 text-gray-300">{loan.customer_phone}</td>
                      <td className="p-3 text-white">{formatCurrency(loan.amount)}</td>
                      <td className="p-3 text-green-400">{formatCurrency(loan.totalPaid)}</td>
                      <td className="p-3 text-yellow-400 font-semibold">
                        {formatCurrency(balance.remainingBalance)}
                      </td>
                      <td className="p-3">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLoanClick(loan);
                          }}
                        >
                          Collect ₦{schedule.dailyPayment}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Payment Modal */}
      {showModal && selectedLoan && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Collect Daily Payment"
        >
          <div className="space-y-4">
            {/* Customer Info */}
            <div className="bg-slate-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">{selectedLoan.customer_name}</h3>
              <p className="text-sm text-gray-400">Phone: {selectedLoan.customer_phone}</p>
              <p className="text-sm text-gray-400">Date: {formatDate(new Date())}</p>
            </div>

            {/* Loan Details */}
            {(() => {
              const schedule = calculateLoanSchedule(selectedLoan.amount);
              const balance = calculateRemainingBalance(selectedLoan.amount, selectedLoan.totalPaid);
              
              return (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">Loan Amount</p>
                      <p className="text-xl font-bold text-white">
                        {formatCurrency(selectedLoan.amount)}
                      </p>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">Interest</p>
                      <p className="text-xl font-bold text-blue-400">
                        {formatCurrency(schedule.totalInterest)}
                      </p>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">Total Repayment</p>
                      <p className="text-xl font-bold text-purple-400">
                        {formatCurrency(schedule.totalRepayment)}
                      </p>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">Expected Daily</p>
                      <p className="text-xl font-bold text-blue-400">
                        {formatCurrency(schedule.dailyPayment)}
                      </p>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">Total Paid</p>
                      <p className="text-xl font-bold text-green-400">
                        {formatCurrency(selectedLoan.totalPaid)}
                      </p>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">Balance Left</p>
                      <p className="text-xl font-bold text-yellow-400">
                        {formatCurrency(balance.remainingBalance)}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>Payment Progress</span>
                      <span>{balance.percentagePaid.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all"
                        style={{ width: `${Math.min(balance.percentagePaid, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Payment Schedule Info */}
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-sm text-blue-200">
                      <strong>Payment Schedule:</strong> ₦{schedule.dailyPayment.toLocaleString()} per day for {schedule.numberOfDays} days
                    </p>
                  </div>
                </>
              );
            })()}

            {/* Payment Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount Collected Today
              </label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount"
                min="0"
                step="100"
              />
              <p className="text-xs text-gray-400 mt-1">
                Enter the actual amount collected from customer
              </p>
            </div>

            {/* New Balance Preview */}
            {paymentAmount && !isNaN(parseFloat(paymentAmount)) && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-sm text-green-200">
                  <strong>New Balance After Payment:</strong>{' '}
                  {formatCurrency(
                    calculateRemainingBalance(
                      selectedLoan.amount,
                      selectedLoan.totalPaid + parseFloat(paymentAmount)
                    ).remainingBalance
                  )}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={handleSubmitPayment}
                disabled={submitting || !paymentAmount}
                className="flex-1"
                loading={submitting}
              >
                {submitting ? 'Recording...' : 'Record Payment'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
