import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AnalyticsService } from '../../services/analyticsService';
import { UserService } from '../../services/userService';
import { Button } from '../../components/shared/Button';
import { BackgroundAnimation } from '../../components/shared/BackgroundAnimation';
import { AnalyticsChart } from '../../components/analytics/AnalyticsChart';
import { formatCurrency } from '../../utils/formatters';

export const BranchAnalytics = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [collectionTrends, setCollectionTrends] = useState<any[]>([]);
  const [loanTrends, setLoanTrends] = useState<any[]>([]);
  const [agentPerformance, setAgentPerformance] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any>(null);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      if (!profile?.branch_id) return;
      setLoading(true);

      // Load KPIs
      const kpiData = await AnalyticsService.getBranchKPIs(profile.branch_id);
      setKpis(kpiData);

      // Load collection trends
      const collectionData = await AnalyticsService.getCollectionTrends(profile.branch_id, timeRange);
      setCollectionTrends(collectionData);

      // Load loan trends
      const loanData = await AnalyticsService.getLoanTrends(profile.branch_id, timeRange);
      setLoanTrends(loanData);

      // Load agent performance
      const agentData = await UserService.getAgentPerformance(profile.branch_id);
      setAgentPerformance(agentData.sort((a, b) => b.totalCollections - a.totalCollections));
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
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

        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Branch Analytics</h1>
              <p className="text-gray-400">Performance insights and trends for your branch</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={timeRange === 'week' ? 'gold' : 'secondary'}
                size="sm"
                onClick={() => setTimeRange('week')}
              >
                Week
              </Button>
              <Button
                variant={timeRange === 'month' ? 'gold' : 'secondary'}
                size="sm"
                onClick={() => setTimeRange('month')}
              >
                Month
              </Button>
              <Button
                variant={timeRange === 'year' ? 'gold' : 'secondary'}
                size="sm"
                onClick={() => setTimeRange('year')}
              >
                Year
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 border-4 border-primary-blue/30 border-t-primary-gold rounded-full animate-spin"></div>
              <p className="text-gray-400 mt-4">Loading analytics...</p>
            </div>
          ) : (
            <>
              {/* KPIs */}
              {kpis && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Total Customers</p>
                    <p className="text-2xl font-bold text-white">{kpis.totalCustomers}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Active Loans</p>
                    <p className="text-2xl font-bold text-green-400">{kpis.activeLoans}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Total Disbursed</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(kpis.totalDisbursed)}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Collection Rate</p>
                    <p className={`text-2xl font-bold ${
                      kpis.collectionRate >= 80 ? 'text-green-400' :
                      kpis.collectionRate >= 60 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {kpis.collectionRate}%
                    </p>
                  </div>
                </div>
              )}

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <AnalyticsChart
                  title="Collection Trends"
                  data={collectionTrends.map(item => ({
                    label: item.date,
                    value: item.amount,
                    color: '#10B981'
                  }))}
                  type="area"
                  height={250}
                />
                <AnalyticsChart
                  title="Loan Disbursement"
                  data={loanTrends.map(item => ({
                    label: item.date,
                    value: item.count,
                    color: '#F59E0B'
                  }))}
                  type="bar"
                  height={250}
                />
              </div>

              {/* Agent Leaderboard */}
              <div className="p-4 bg-white/5 rounded-lg">
                <h3 className="text-lg font-bold text-white mb-4">Agent Performance Leaderboard</h3>
                {agentPerformance.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No agent data available</p>
                ) : (
                  <div className="space-y-3">
                    {agentPerformance.map((agent, index) => (
                      <div key={agent.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-500 text-black' :
                          index === 1 ? 'bg-gray-400 text-black' :
                          index === 2 ? 'bg-orange-600 text-white' :
                          'bg-white/10 text-gray-400'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-semibold">{agent.full_name}</p>
                          <div className="flex gap-4 text-sm text-gray-400 mt-1">
                            <span>{agent.customers} customers</span>
                            <span>{agent.activeLoans} active loans</span>
                            <span className={
                              agent.collectionRate >= 80 ? 'text-green-400' :
                              agent.collectionRate >= 60 ? 'text-yellow-400' :
                              'text-red-400'
                            }>
                              {agent.collectionRate}% rate
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold">{formatCurrency(agent.totalCollections)}</p>
                          <p className="text-xs text-gray-500">Total Collections</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
