import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoanService } from '../../services/loanService';
import { Button } from '../../components/shared/Button';
import { Modal } from '../../components/shared/Modal';
import { TextArea } from '../../components/shared/Input';
import { BackgroundAnimation } from '../../components/shared/BackgroundAnimation';
import { LoanStatusBadge } from '../../components/shared/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const LoanApprovals = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loans, setLoans] = useState<any[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    try {
      if (!profile?.branch_id) return;
      setLoading(true);
      const data = await LoanService.getPendingLoansByBranch(profile.branch_id);
      setLoans(data);
    } catch (err) {
      console.error('Failed to load loans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (loan: any, actionType: 'approve' | 'reject') => {
    setSelectedLoan(loan);
    setAction(actionType);
    setShowModal(true);
  };

  const handleConfirm = async () => {
    if (!selectedLoan || !profile) return;

    try {
      setProcessing(true);
      
      if (action === 'approve') {
        await LoanService.approveLoan(selectedLoan.id, profile.id);
      } else {
        if (!rejectionReason.trim()) {
          alert('Please provide a reason for rejection');
          return;
        }
        await LoanService.rejectLoan(selectedLoan.id, rejectionReason);
      }

      setShowModal(false);
      setRejectionReason('');
      loadLoans();
    } catch (err: any) {
      alert(err.message || 'Failed to process loan');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 relative" style={{ backgroundColor: '#0F172A' }}>
      <BackgroundAnimation />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="secondary" onClick={() => navigate('/subadmin/dashboard')}>
            ← Back to Dashboard
          </Button>
        </div>

        <div className="glass-card p-6">
          <h1 className="text-3xl font-bold text-white mb-2">Pending Loan Approvals</h1>
          <p className="text-gray-400 mb-6">Review and approve loan applications from your branch</p>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 border-4 border-primary-blue/30 border-t-primary-gold rounded-full animate-spin"></div>
              <p className="text-gray-400 mt-4">Loading loans...</p>
            </div>
          ) : loans.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No pending loan applications at this time.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {loans.map((loan) => (
                <div key={loan.id} className="p-6 bg-white/5 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{loan.customer_name}</h3>
                      <p className="text-sm text-gray-400">Applied by: {loan.agent_name}</p>
                      <p className="text-xs text-gray-500">{formatDate(loan.application_date)}</p>
                    </div>
                    <LoanStatusBadge status={loan.status} />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Loan Amount</p>
                      <p className="text-lg font-bold text-white">{formatCurrency(loan.amount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Interest Rate</p>
                      <p className="text-lg font-bold text-white">{loan.interest_rate}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="text-lg font-bold text-white">{loan.duration_weeks} weeks</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Weekly Payment</p>
                      <p className="text-lg font-bold text-green-400">{formatCurrency(loan.weekly_payment)}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={() => handleAction(loan, 'approve')}
                    >
                      ✓ Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleAction(loan, 'reject')}
                    >
                      ✗ Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={action === 'approve' ? 'Approve Loan' : 'Reject Loan'}
      >
        <div className="space-y-4">
          {selectedLoan && (
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="text-white font-semibold">{selectedLoan.customer_name}</p>
              <p className="text-gray-400">Amount: {formatCurrency(selectedLoan.amount)}</p>
              <p className="text-gray-400">Weekly Payment: {formatCurrency(selectedLoan.weekly_payment)}</p>
            </div>
          )}

          {action === 'reject' && (
            <TextArea
              label="Reason for Rejection"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a reason..."
              required
              rows={4}
            />
          )}

          <p className="text-gray-400 text-sm">
            {action === 'approve'
              ? 'Are you sure you want to approve this loan application?'
              : 'This action cannot be undone. The agent will be notified.'}
          </p>

          <div className="flex gap-3">
            <Button
              variant={action === 'approve' ? 'gold' : 'danger'}
              onClick={handleConfirm}
              loading={processing}
              fullWidth
            >
              {processing ? 'Processing...' : action === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
            </Button>
            <Button variant="secondary" onClick={() => setShowModal(false)} disabled={processing}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
