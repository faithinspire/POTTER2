import { useState, useEffect } from 'react';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';
import { Badge } from '../shared/Badge';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { LoanService } from '../../services/loanService';
import { PaymentService } from '../../services/paymentService';
import { CustomerService } from '../../services/customerService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { LoanWithDetails } from '../../types/loan';

interface LoanTrackerProps {
  branchId?: string;
  agentId?: string;
  showAllBranches?: boolean;
}

export const CompleteLoanTracker: React.FC<LoanTrackerProps> = ({ 
  branchId, 
  agentId,
  showAllBranches = false 
}) => {
  const [loans, setLoans] = useState<LoanWithDetails[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<LoanWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState<LoanWithDetails | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loanDetails, setLoanDetails] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadLoans();
  }, [branchId, agentId]);

  useEffect(() => {
    filterLoans();
  }, [loans, statusFilter, searchTerm]);

  const loadLoans = async () => {
    try {
      setLoading(true);
      let loansData: LoanWithDetails[];

      if (agentId) {
        loansData = await LoanService.getLoansByAgent(agentId);
      } else if (branchId && !showAllBranches) {
        loansData = await LoanService.getLoansByBranch(branchId);
      } else {
        loansData = await LoanService.getAllLoans();
      }

      setLoans(loansData);
    } catch (error) {
      console.error('Error loading loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLoans = () => {
    let filtered = loans;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(loan => loan.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(loan =>
        loan.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.agent_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLoans(filtered);
  };

  const handleLoanClick = async (loan: LoanWithDetails) => {
    setSelectedLoan(loan);
    setShowModal(true);

    try {
      const details = await PaymentService.getLoanPaymentSummary(loan.id);
      const customerData = await CustomerService.getCustomerDetails(loan.customer_id);
      setLoanDetails({ ...details, customer: customerData });
    } catch (error) {
      console.error('Error loading loan details:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'active':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-blue-500';
      case 'rejected':
      case 'defaulted':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
      case 'defaulted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStats = () => {
    const total = filteredLoans.length;
    const active = filteredLoans.filter(l => l.status === 'active' || l.status === 'approved').length;
    const pending = filteredLoans.filter(l => l.status === 'pending').length;
    const completed = filteredLoans.filter(l => l.status === 'completed').length;
    const defaulted = filteredLoans.filter(l => l.status === 'defaulted').length;
    const totalAmount = filteredLoans.reduce((sum, l) => sum + l.amount, 0);

    return { total, active, pending, completed, defaulted, totalAmount };
  };

  const stats = getStats();

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
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-gray-400">Total Loans</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{stats.active}</div>
            <div className="text-sm text-gray-400">Active</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
            <div className="text-sm text-gray-400">Pending</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.completed}</div>
            <div className="text-sm text-gray-400">Completed</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{stats.defaulted}</div>
            <div className="text-sm text-gray-400">Defaulted</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-lg font-bold text-white">{formatCurrency(stats.totalAmount)}</div>
            <div className="text-sm text-gray-400">Total Value</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by customer or agent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 bg-white/10 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-500"
          />
          <div className="flex gap-2 flex-wrap">
            {['all', 'active', 'pending', 'approved', 'completed', 'defaulted'].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Loans Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-3 text-white font-semibold">Customer</th>
                {showAllBranches && <th className="text-left p-3 text-white font-semibold">Branch</th>}
                <th className="text-left p-3 text-white font-semibold">Agent</th>
                <th className="text-left p-3 text-white font-semibold">Amount</th>
                <th className="text-left p-3 text-white font-semibold">Weekly Payment</th>
                <th className="text-left p-3 text-white font-semibold">Status</th>
                <th className="text-left p-3 text-white font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={showAllBranches ? 7 : 6} className="text-center py-8 text-gray-400">
                    No loans found
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan) => (
                  <tr
                    key={loan.id}
                    onClick={() => handleLoanClick(loan)}
                    className="border-b border-gray-700/50 hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <td className="p-3 text-white font-medium">{loan.customer_name}</td>
                    {showAllBranches && <td className="p-3 text-gray-300">{loan.branch_name}</td>}
                    <td className="p-3 text-gray-300">{loan.agent_name}</td>
                    <td className="p-3 text-white font-semibold">{formatCurrency(loan.amount)}</td>
                    <td className="p-3 text-green-400">{formatCurrency(loan.weekly_payment)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(loan.status)}`}></div>
                        <Badge className={getStatusBadgeColor(loan.status)}>
                          {loan.status}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-3 text-gray-400">{formatDate(loan.application_date)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Loan Detail Modal */}
      {showModal && selectedLoan && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Loan Details"
        >
          <div className="space-y-4">
            <div className="bg-slate-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">{selectedLoan.customer_name}</h3>
              <p className="text-sm text-gray-400">Agent: {selectedLoan.agent_name}</p>
              <p className="text-sm text-gray-400">Branch: {selectedLoan.branch_name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800 p-4 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Loan Amount</p>
                <p className="text-xl font-bold text-white">
                  {formatCurrency(selectedLoan.amount)}
                </p>
              </div>
              <div className="bg-slate-800 p-4 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Weekly Payment</p>
                <p className="text-xl font-bold text-blue-400">
                  {formatCurrency(selectedLoan.weekly_payment)}
                </p>
              </div>
              {loanDetails && (
                <>
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">Total Paid</p>
                    <p className="text-xl font-bold text-green-400">
                      {formatCurrency(loanDetails.totalPaid)}
                    </p>
                  </div>
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">Balance Left</p>
                    <p className="text-xl font-bold text-yellow-400">
                      {formatCurrency(loanDetails.balanceLeft)}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="bg-slate-800 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-2">Loan Status</p>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full ${getStatusColor(selectedLoan.status)}`}></div>
                <span className="text-white font-semibold capitalize">{selectedLoan.status}</span>
              </div>
            </div>

            {loanDetails?.customer && (
              <div className="bg-slate-800 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">Customer Details</p>
                <div className="space-y-1 text-sm text-white">
                  <p>Phone: {loanDetails.customer.phone}</p>
                  <p>Address: {loanDetails.customer.address}</p>
                  {loanDetails.customer.occupation && <p>Occupation: {loanDetails.customer.occupation}</p>}
                </div>
              </div>
            )}

            <div className="flex gap-3">
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
