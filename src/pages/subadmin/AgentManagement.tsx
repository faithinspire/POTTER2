import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserService } from '../../services/userService';
import { Button } from '../../components/shared/Button';
import { Modal } from '../../components/shared/Modal';
import { Input } from '../../components/shared/Input';
import { BackgroundAnimation } from '../../components/shared/BackgroundAnimation';
import { formatCurrency } from '../../utils/formatters';

interface AgentMetrics {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  customers: number;
  loans: number;
  activeLoans: number;
  totalCollections: number;
  collectionRate: number;
}

export const AgentManagement = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<AgentMetrics[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentMetrics | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      if (!profile?.branch_id) return;
      setLoading(true);
      const data = await UserService.getAgentPerformance(profile.branch_id);
      setAgents(data);
    } catch (err) {
      console.error('Failed to load agents:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAgents = agents.filter(agent =>
    agent.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.phone.includes(searchTerm)
  );

  const handleViewDetails = (agent: AgentMetrics) => {
    setSelectedAgent(agent);
    setShowDetailsModal(true);
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Agent Management</h1>
              <p className="text-gray-400">Manage and monitor agents in your branch</p>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 border-4 border-primary-blue/30 border-t-primary-gold rounded-full animate-spin"></div>
              <p className="text-gray-400 mt-4">Loading agents...</p>
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">
                {searchTerm ? 'No agents found matching your search.' : 'No agents in this branch yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Agent</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Contact</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-semibold">Customers</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-semibold">Loans</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-semibold">Active</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-semibold">Collections</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-semibold">Rate</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAgents.map((agent) => (
                    <tr key={agent.id} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4">
                        <p className="text-white font-semibold">{agent.full_name}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-400">{agent.email}</p>
                        <p className="text-sm text-gray-500">{agent.phone}</p>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-white font-semibold">{agent.customers}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-white font-semibold">{agent.loans}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-green-400 font-semibold">{agent.activeLoans}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-white font-semibold">{formatCurrency(agent.totalCollections)}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`font-semibold ${
                          agent.collectionRate >= 80 ? 'text-green-400' :
                          agent.collectionRate >= 60 ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {agent.collectionRate}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleViewDetails(agent)}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Summary Stats */}
          {!loading && agents.length > 0 && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white/5 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Total Agents</p>
                <p className="text-2xl font-bold text-white">{agents.length}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Total Customers</p>
                <p className="text-2xl font-bold text-white">
                  {agents.reduce((sum, a) => sum + a.customers, 0)}
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Active Loans</p>
                <p className="text-2xl font-bold text-green-400">
                  {agents.reduce((sum, a) => sum + a.activeLoans, 0)}
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Total Collections</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(agents.reduce((sum, a) => sum + a.totalCollections, 0))}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Agent Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Agent Performance Details"
      >
        {selectedAgent && (
          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <h3 className="text-xl font-bold text-white mb-2">{selectedAgent.full_name}</h3>
              <p className="text-gray-400">{selectedAgent.email}</p>
              <p className="text-gray-400">{selectedAgent.phone}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Customers Registered</p>
                <p className="text-2xl font-bold text-white">{selectedAgent.customers}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Total Loans</p>
                <p className="text-2xl font-bold text-white">{selectedAgent.loans}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Active Loans</p>
                <p className="text-2xl font-bold text-green-400">{selectedAgent.activeLoans}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Collection Rate</p>
                <p className={`text-2xl font-bold ${
                  selectedAgent.collectionRate >= 80 ? 'text-green-400' :
                  selectedAgent.collectionRate >= 60 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {selectedAgent.collectionRate}%
                </p>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Total Collections</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(selectedAgent.totalCollections)}</p>
            </div>

            <Button variant="secondary" onClick={() => setShowDetailsModal(false)} fullWidth>
              Close
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};
