import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/shared/Button';
import { Card } from '../../components/shared/Card';
import { Modal } from '../../components/shared/Modal';
import { Input } from '../../components/shared/Input';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { BackgroundAnimation } from '../../components/shared/BackgroundAnimation';
import { DisbursementService } from '../../services/disbursementService';
import { UserService } from '../../services/userService';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const Disbursements = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [disbursements, setDisbursements] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [showDisbursementModal, setShowDisbursementModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [formData, setFormData] = useState({
    agent_id: '',
    amount: '',
    period_type: 'daily' as 'daily' | 'weekly',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, [profile]);

  const loadData = async () => {
    if (!profile?.branch_id) return;

    try {
      setLoading(true);
      const [disbursementsData, agentsData] = await Promise.all([
        DisbursementService.getDisbursementsByBranch(profile.branch_id),
        UserService.getUsersByBranch(profile.branch_id),
      ]);

      setDisbursements(disbursementsData);
      setAgents(agentsData.filter(u => u.role === 'agent'));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDisbursement = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile?.branch_id || !profile?.id) {
      alert('Missing profile information');
      return;
    }

    try {
      setCreating(true);
      await DisbursementService.createDisbursement({
        branch_id: profile.branch_id,
        agent_id: formData.agent_id,
        amount: parseFloat(formData.amount),
        disbursed_by: profile.id,
        period_type: formData.period_type,
        notes: formData.notes,
      });

      alert('Disbursement created successfully!');
      setShowDisbursementModal(false);
      setFormData({
        agent_id: '',
        amount: '',
        period_type: 'daily',
        notes: '',
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create disbursement');
    } finally {
      setCreating(false);
    }
  };

  const downloadReport = () => {
    setDownloading(true);
    try {
      // Convert to CSV
      const headers = ['Date', 'Agent', 'Amount', 'Period', 'Disbursed By', 'Notes'];
      const rows = disbursements.map(d => [
        formatDate(d.disbursement_date),
        d.agent_name,
        d.amount,
        d.period_type,
        d.disbursed_by_name,
        d.notes || '',
      ]);

      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

      // Download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `disbursements_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report');
    } finally {
      setDownloading(false);
    }
  };

  // Calculate totals per agent
  const agentTotals = agents.map(agent => {
    const total = disbursements
      .filter(d => d.agent_id === agent.id)
      .reduce((sum, d) => sum + Number(d.amount), 0);
    return { ...agent, total_disbursed: total };
  });

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

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
              <Button variant="secondary" size="sm" onClick={() => navigate('/subadmin/dashboard')}>
                ← Back
              </Button>
              <span className="text-white text-sm sm:text-base">Welcome, {profile?.full_name}</span>
              <Button variant="secondary" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </nav>

        {/* Content */}
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Agent Disbursements</h2>
              <p className="text-gray-400">Manage daily and weekly disbursements to agents</p>
            </div>
            <div className="flex gap-2">
              <Button variant="gold" onClick={() => setShowDisbursementModal(true)}>
                💰 New Disbursement
              </Button>
              <Button variant="primary" onClick={downloadReport} disabled={downloading}>
                📥 Download Report
              </Button>
            </div>
          </div>

          {/* Agent Totals */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {agentTotals.map(agent => (
              <Card key={agent.id} className="glass-card p-4 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-white font-semibold">{agent.full_name}</p>
                    <p className="text-xs text-gray-400">{agent.phone}</p>
                  </div>
                  <div className="text-2xl">👤</div>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-gray-400 mb-1">Total Disbursed</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-400">
                    {formatCurrency(agent.total_disbursed)}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {/* Disbursement History */}
          <Card className="glass-card p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Disbursement History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-400 pb-3 px-2">Date</th>
                    <th className="text-left text-gray-400 pb-3 px-2">Agent</th>
                    <th className="text-left text-gray-400 pb-3 px-2">Amount</th>
                    <th className="text-left text-gray-400 pb-3 px-2">Period</th>
                    <th className="text-left text-gray-400 pb-3 px-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {disbursements.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-gray-400 py-8">
                        No disbursements yet
                      </td>
                    </tr>
                  ) : (
                    disbursements.map((disbursement) => (
                      <tr key={disbursement.id} className="border-b border-gray-700/50">
                        <td className="py-3 px-2 text-gray-400">
                          {formatDate(disbursement.disbursement_date)}
                        </td>
                        <td className="py-3 px-2 text-white">{disbursement.agent_name}</td>
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {/* Create Disbursement Modal */}
      <Modal
        isOpen={showDisbursementModal}
        onClose={() => setShowDisbursementModal(false)}
        title="💰 New Disbursement"
      >
        <form onSubmit={handleCreateDisbursement} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Agent
            </label>
            <select
              value={formData.agent_id}
              onChange={(e) => setFormData({ ...formData, agent_id: e.target.value })}
              className="w-full px-4 py-2 bg-white/10 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-gold"
              required
            >
              <option value="">Choose an agent</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.full_name} - {agent.phone}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="Enter amount"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Period Type
            </label>
            <select
              value={formData.period_type}
              onChange={(e) => setFormData({ ...formData, period_type: e.target.value as any })}
              className="w-full px-4 py-2 bg-white/10 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-gold"
              required
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 bg-white/10 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-gold"
              rows={3}
              placeholder="Add any notes..."
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" variant="gold" loading={creating} fullWidth>
              {creating ? 'Creating...' : 'Create Disbursement'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowDisbursementModal(false)}
              disabled={creating}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
