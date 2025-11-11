import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/shared/Button';
import { Card } from '../../components/shared/Card';
import { BackgroundAnimation } from '../../components/shared/BackgroundAnimation';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { DisbursementService } from '../../services/disbursementService';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const AgentDashboard = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [totalDisbursed, setTotalDisbursed] = useState(0);
  const [recentDisbursements, setRecentDisbursements] = useState<any[]>([]);

  useEffect(() => {
    loadDisbursements();
  }, [profile]);

  const loadDisbursements = async () => {
    if (!profile?.id || !profile?.branch_id) return;

    try {
      setLoading(true);
      const [total, allDisbursements] = await Promise.all([
        DisbursementService.getAgentTotalDisbursed(profile.id),
        DisbursementService.getDisbursementsByBranch(profile.branch_id),
      ]);

      setTotalDisbursed(total);
      // Filter to show only this agent's disbursements
      const myDisbursements = allDisbursements.filter(d => d.agent_id === profile.id);
      setRecentDisbursements(myDisbursements.slice(0, 5));
    } catch (error) {
      console.error('Error loading disbursements:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 relative" style={{ backgroundColor: '#0F172A' }}>
      <BackgroundAnimation />
      
      <div className="relative z-10">
        {/* Navbar */}
        <nav className="glass-navbar p-4">
          <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Millennium Potter
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
              <span className="text-white text-sm sm:text-base">Welcome, {profile?.full_name}</span>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs sm:text-sm font-semibold">
                Agent - {profile?.branch_name}
              </span>
              <Button variant="secondary" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </nav>

        {/* Content */}
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Agent Dashboard</h2>
          <p className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8">{profile?.branch_name} Branch</p>
          
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <Card className="glass-card p-4 sm:p-6 border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-1">My Customers</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">0</p>
                </div>
                <div className="text-3xl sm:text-4xl">👥</div>
              </div>
            </Card>

            <Card className="glass-card p-4 sm:p-6 border-l-4 border-l-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-1">Loans Submitted</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">0</p>
                </div>
                <div className="text-3xl sm:text-4xl">📝</div>
              </div>
            </Card>

            <Card className="glass-card p-4 sm:p-6 border-l-4 border-l-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-1">Today's Collections</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">₦0</p>
                </div>
                <div className="text-3xl sm:text-4xl">💵</div>
              </div>
            </Card>

            <Card className="glass-card p-4 sm:p-6 border-l-4 border-l-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-1">Total Disbursed</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-400">
                    {loading ? '...' : formatCurrency(totalDisbursed)}
                  </p>
                </div>
                <div className="text-3xl sm:text-4xl">💰</div>
              </div>
            </Card>
          </div>

          {/* Daily Disbursements Section */}
          <Card className="glass-card p-4 sm:p-6 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-white">My Disbursements</h3>
                <p className="text-xs sm:text-sm text-gray-400">Money received from branch manager</p>
              </div>
              <Button variant="primary" size="sm" onClick={loadDisbursements}>
                🔄 Refresh
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <LoadingSpinner />
              </div>
            ) : recentDisbursements.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No disbursements yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Your branch manager will disburse money to you daily or weekly
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left text-gray-400 pb-3 px-2">Date</th>
                      <th className="text-left text-gray-400 pb-3 px-2">Amount</th>
                      <th className="text-left text-gray-400 pb-3 px-2">Period</th>
                      <th className="text-left text-gray-400 pb-3 px-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentDisbursements.map((disbursement) => (
                      <tr key={disbursement.id} className="border-b border-gray-700/50">
                        <td className="py-3 px-2 text-gray-400">
                          {formatDate(disbursement.disbursement_date)}
                        </td>
                        <td className="py-3 px-2 text-green-400 font-semibold">
                          {formatCurrency(disbursement.amount)}
                        </td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            disbursement.period_type === 'daily' 
                              ? 'bg-blue-500/20 text-blue-400' 
                              : 'bg-purple-500/20 text-purple-400'
                          }`}>
                            {disbursement.period_type}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-gray-400 text-xs">
                          {disbursement.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <Card className="glass-card p-4 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 text-center">
              🎉 Quick Actions
            </h3>
            <p className="text-sm sm:text-base text-gray-300 mb-6 text-center">
              Start managing your customers and loans
            </p>
            <div className="space-y-2 text-left max-w-2xl mx-auto mb-6 text-sm sm:text-base">
              <p className="text-gray-400">✅ Register new customers with guarantors</p>
              <p className="text-gray-400">✅ Submit loan applications</p>
              <p className="text-gray-400">✅ Track daily payments (Mon-Sat)</p>
              <p className="text-gray-400">✅ Record daily collections</p>
              <p className="text-gray-400">✅ View your performance metrics</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <Button variant="gold" fullWidth onClick={() => navigate('/agent/register-customer')}>
                👤 Register Customer
              </Button>
              <Button variant="primary" fullWidth onClick={() => navigate('/agent/apply-loan')}>
                💰 Apply for Loan
              </Button>
              <Button variant="primary" fullWidth onClick={() => navigate('/agent/payments')}>
                💵 Daily Payments
              </Button>
              <Button variant="secondary" fullWidth onClick={() => navigate('/agent/customers')}>
                📋 My Customers
              </Button>
              <Button variant="secondary" fullWidth onClick={() => navigate('/agent/loans')}>
                📊 My Loans
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
