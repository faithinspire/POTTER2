import React, { useState, useEffect } from 'react';
import { Card } from '../../components/shared/Card';
import { Button } from '../../components/shared/Button';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { AnalyticsChart } from '../../components/analytics/AnalyticsChart';
import { AnalyticsService } from '../../services/analyticsService';
import { ExportService } from '../../services/exportService';
import { useAuth } from '../../contexts/AuthContext';
import { format, subDays } from 'date-fns';

export const AdvancedAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loanTrends, setLoanTrends] = useState<any[]>([]);
  const [paymentTrends, setPaymentTrends] = useState<any[]>([]);
  const [agentPerformance, setAgentPerformance] = useState<any[]>([]);
  const [weeklyCollection, setWeeklyCollection] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [selectedBranch, setSelectedBranch] = useState<string>('all');

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod, selectedBranch]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const branchId = selectedBranch === 'all' ? undefined : selectedBranch;
      
      const [
        analyticsData,
        loanTrendsData,
        paymentTrendsData,
        agentPerformanceData,
        weeklyCollectionData
      ] = await Promise.all([
        AnalyticsService.getBranchAnalytics(branchId),
        AnalyticsService.getLoanTrends(branchId, selectedPeriod),
        AnalyticsService.getPaymentTrends(branchId, selectedPeriod),
        AnalyticsService.getAgentPerformance(branchId),
        AnalyticsService.getWeeklyCollectionSummary(branchId)
      ]);

      setAnalytics(analyticsData);
      setLoanTrends(loanTrendsData || []);
      setPaymentTrends(paymentTrendsData || []);
      setAgentPerformance(agentPerformanceData || []);
      setWeeklyCollection(weeklyCollectionData);
    } catch (error) {
      console.error('Load analytics error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const branchId = selectedBranch === 'all' ? undefined : selectedBranch;
      await ExportService.exportAnalyticsReport(branchId);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const formatLoanTrendsData = () => {
    return loanTrends.map(trend => ({
      label: format(new Date(trend.date), 'MMM d'),
      value: trend.applications
    }));
  };

  const formatPaymentTrendsData = () => {
    return paymentTrends.map(trend => ({
      label: format(new Date(trend.date), 'MMM d'),
      value: Math.round(trend.rate)
    }));
  };

  const formatAgentPerformanceData = () => {
    return agentPerformance.slice(0, 10).map(agent => ({
      label: agent.full_name.split(' ')[0], // First name only for chart
      value: agent.totalCollected,
      color: agent.conversionRate > 80 ? '#059669' : agent.conversionRate > 60 ? '#D4AF37' : '#DC2626'
    }));
  };

  const formatWeeklyCollectionData = () => {
    if (!weeklyCollection) return [];
    
    return Object.entries(weeklyCollection).map(([day, data]: [string, any]) => ({
      label: day.charAt(0).toUpperCase() + day.slice(1, 3),
      value: Math.round(data.rate)
    }));
  };

  const formatLoanStatusData = () => {
    if (!analytics) return [];
    
    return [
      { label: 'Pending', value: analytics.pendingLoans, color: '#F59E0B' },
      { label: 'Approved', value: analytics.approvedLoans, color: '#059669' },
      { label: 'Active', value: analytics.activeLoans, color: '#1E3A8A' }
    ];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📊 Advanced Analytics
            </h1>
            <p className="text-gray-600">
              Comprehensive insights and performance metrics
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
            {/* Period Selector */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>

            {/* Branch Selector */}
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Branches</option>
              <option value="igando">Igando</option>
              <option value="abule-egba">Abule-Egba</option>
            </select>

            <Button onClick={handleExportReport} variant="secondary">
              📄 Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Customers</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalCustomers}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <span className="text-2xl">👥</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Disbursed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₦{analytics.totalDisbursed?.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Collected</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₦{analytics.totalCollected?.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <span className="text-2xl">📈</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Collection Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.collectionRate?.toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <span className="text-2xl">🎯</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Loan Applications Trend */}
          <AnalyticsChart
            title="Loan Applications Trend"
            data={formatLoanTrendsData()}
            type="line"
            height={300}
          />

          {/* Payment Collection Rate */}
          <AnalyticsChart
            title="Daily Collection Rate (%)"
            data={formatPaymentTrendsData()}
            type="area"
            height={300}
          />

          {/* Loan Status Distribution */}
          <AnalyticsChart
            title="Loan Status Distribution"
            data={formatLoanStatusData()}
            type="pie"
            height={300}
          />

          {/* Weekly Collection Performance */}
          <AnalyticsChart
            title="Weekly Collection Rate (%)"
            data={formatWeeklyCollectionData()}
            type="bar"
            height={300}
          />
        </div>

        {/* Agent Performance */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <AnalyticsChart
              title="Top Agent Performance (Total Collections)"
              data={formatAgentPerformanceData()}
              type="bar"
              height={400}
            />
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              🏆 Agent Rankings
            </h3>
            <div className="space-y-4">
              {agentPerformance.slice(0, 5).map((agent, index) => (
                <div key={agent.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-yellow-600' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{agent.full_name}</p>
                      <p className="text-sm text-gray-500">
                        {agent.totalCustomers} customers • {agent.totalLoans} loans
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ₦{agent.totalCollected?.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {agent.conversionRate?.toFixed(1)}% rate
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};