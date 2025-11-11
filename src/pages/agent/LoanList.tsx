import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoanService } from '../../services/loanService';
import { Button } from '../../components/shared/Button';
import { Table } from '../../components/shared/Table';
import { LoanStatusBadge } from '../../components/shared/Badge';
import { BackgroundAnimation } from '../../components/shared/BackgroundAnimation';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const LoanList = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loans, setLoans] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    try {
      if (!profile) return;
      setLoading(true);
      const data = await LoanService.getLoansByAgent(profile.id);
      setLoans(data);
      
      // Calculate stats
      const stats = {
        total: data.length,
        pending: data.filter(l => l.status === 'pending').length,
        approved: data.filter(l => l.status === 'approved').length,
        rejected: data.filter(l => l.status === 'rejected').length,
        totalAmount: data.filter(l => l.status === 'approved').reduce((sum, l) => sum + l.amount, 0),
      };
      setStats(stats);
    } catch (err) {
      console.error('Failed to load loans:', err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'customer_name',
      header: 'Customer',
      render: (loan: any) => (
        <div>
          <p className="font-semibold text-white">{loan.customer_name}</p>
          <p className="text-sm text-gray-400">ID: {loan.id.slice(0, 8)}...</p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Loan Amount',
      render: (loan: any) => (
        <div>
          <p className="font-semibold text-white">{formatCurrency(loan.amount)}</p>
          <p className="text-sm text-gray-400">{loan.interest_rate}% interest</p>
        </div>
      ),
    },
    {
      key: 'weekly_payment',
      header: 'Weekly Payment',
      render: (loan: any) => (
        <div>
          <p className="font-semibold text-green-400">{formatCurrency(loan.weekly_payment)}</p>
          <p className="text-sm text-gray-400">{loan.duration_weeks} weeks</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (loan: any) => <LoanStatusBadge status={loan.status} />,
    },
    {
      key: 'application_date',
      header: 'Applied',
      render: (loan: any) => (
        <div>
          <p className="text-white">{formatDate(loan.application_date)}</p>
          {loan.approval_date && (
            <p className="text-sm text-green-400">Approved: {formatDate(loan.approval_date)}</p>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (loan: any) => (
        <div className="flex gap-2">
          {loan.status === 'approved' && (
            <Button
              variant="gold"
              size="sm"
              onClick={() => navigate('/agent/payments')}
            >
              Track Payments
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 relative" style={{ backgroundColor: '#0F172A' }}>
      <BackgroundAnimation />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="secondary" onClick={() => navigate('/agent/dashboard')}>
            ← Back to Dashboard
          </Button>
          <Button variant="gold" onClick={() => navigate('/agent/apply-loan')}>
            + Apply for New Loan
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="glass-card p-4">
            <p className="text-sm text-gray-400">Total Loans</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-gray-400">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-gray-400">Approved</p>
            <p className="text-2xl font-bold text-green-400">{stats.approved}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-gray-400">Rejected</p>
            <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-gray-400">Total Disbursed</p>
            <p className="text-xl font-bold text-green-400">{formatCurrency(stats.totalAmount)}</p>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My Loan Applications</h1>
              <p className="text-gray-400">Track all your submitted loan applications</p>
            </div>
          </div>

          <Table
            data={loans}
            columns={columns}
            loading={loading}
            emptyMessage="No loan applications found. Apply for your first loan!"
          />

          {!loading && loans.length > 0 && (
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Success Rate</p>
                  <p className="text-white font-semibold">
                    {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Average Loan</p>
                  <p className="text-white font-semibold">
                    {stats.approved > 0 ? formatCurrency(stats.totalAmount / stats.approved) : '₦0'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Pending Review</p>
                  <p className="text-white font-semibold">{stats.pending}</p>
                </div>
                <div>
                  <p className="text-gray-400">Active Loans</p>
                  <p className="text-white font-semibold">{stats.approved}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};