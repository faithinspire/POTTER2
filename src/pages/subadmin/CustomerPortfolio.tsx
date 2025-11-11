import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CustomerService } from '../../services/customerService';
import { Button } from '../../components/shared/Button';
import { Modal } from '../../components/shared/Modal';
import { Input } from '../../components/shared/Input';
import { BackgroundAnimation } from '../../components/shared/BackgroundAnimation';
import { formatDate } from '../../utils/formatters';

export const CustomerPortfolio = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAgent, setFilterAgent] = useState('all');
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (!profile?.branch_id) return;
      setLoading(true);
      
      // Load customers
      const customerData = await CustomerService.getCustomersByBranch(profile.branch_id);
      setCustomers(customerData);

      // Extract unique agents
      const uniqueAgents = Array.from(
        new Map(customerData.map(c => [c.agent_id, { id: c.agent_id, name: c.agent_name }])).values()
      );
      setAgents(uniqueAgents);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (customer: any) => {
    try {
      const details = await CustomerService.getCustomerDetails(customer.id);
      setSelectedCustomer(details);
      setShowDetailsModal(true);
    } catch (err) {
      console.error('Failed to load customer details:', err);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.id_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAgent = filterAgent === 'all' || customer.agent_id === filterAgent;
    
    return matchesSearch && matchesAgent;
  });

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
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Customer Portfolio</h1>
            <p className="text-gray-400">View and manage all customers in your branch</p>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Input
              type="text"
              placeholder="Search by name, phone, or ID number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              value={filterAgent}
              onChange={(e) => setFilterAgent(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-gold"
            >
              <option value="all">All Agents</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 border-4 border-primary-blue/30 border-t-primary-gold rounded-full animate-spin"></div>
              <p className="text-gray-400 mt-4">Loading customers...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">
                {searchTerm || filterAgent !== 'all' ? 'No customers found matching your filters.' : 'No customers in this branch yet.'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Customer</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Contact</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">ID Number</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Agent</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Registered</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                        <td className="py-4 px-4">
                          <p className="text-white font-semibold">{customer.full_name}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-400">{customer.phone}</p>
                          <p className="text-sm text-gray-500">{customer.email || 'N/A'}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-400">{customer.id_number}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-400">{customer.agent_name}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-400">{formatDate(customer.created_at)}</p>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleViewDetails(customer)}
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="mt-6 p-4 bg-white/5 rounded-lg">
                <p className="text-gray-400">
                  Showing <span className="text-white font-semibold">{filteredCustomers.length}</span> of{' '}
                  <span className="text-white font-semibold">{customers.length}</span> customers
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Customer Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Customer Details"
      >
        {selectedCustomer && (
          <div className="space-y-4">
            {/* Personal Info */}
            <div className="p-4 bg-white/5 rounded-lg">
              <h3 className="text-lg font-bold text-white mb-3">Personal Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Full Name:</span>
                  <span className="text-white font-semibold">{selectedCustomer.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Phone:</span>
                  <span className="text-white">{selectedCustomer.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Email:</span>
                  <span className="text-white">{selectedCustomer.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Date of Birth:</span>
                  <span className="text-white">{formatDate(selectedCustomer.date_of_birth)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">ID Number:</span>
                  <span className="text-white">{selectedCustomer.id_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Address:</span>
                  <span className="text-white text-right">{selectedCustomer.address}</span>
                </div>
              </div>
            </div>

            {/* Guarantors */}
            {selectedCustomer.guarantors && selectedCustomer.guarantors.length > 0 && (
              <div className="p-4 bg-white/5 rounded-lg">
                <h3 className="text-lg font-bold text-white mb-3">Guarantors</h3>
                <div className="space-y-3">
                  {selectedCustomer.guarantors.map((guarantor: any, index: number) => (
                    <div key={guarantor.id} className="p-3 bg-white/5 rounded">
                      <p className="text-white font-semibold mb-1">Guarantor {index + 1}</p>
                      <p className="text-sm text-gray-400">{guarantor.full_name}</p>
                      <p className="text-sm text-gray-400">{guarantor.phone}</p>
                      <p className="text-sm text-gray-500">{guarantor.relationship}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Loan History */}
            {selectedCustomer.loans && selectedCustomer.loans.length > 0 && (
              <div className="p-4 bg-white/5 rounded-lg">
                <h3 className="text-lg font-bold text-white mb-3">Loan History</h3>
                <div className="space-y-2">
                  {selectedCustomer.loans.map((loan: any) => (
                    <div key={loan.id} className="flex justify-between items-center p-2 bg-white/5 rounded">
                      <div>
                        <p className="text-white font-semibold">₦{loan.amount.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{formatDate(loan.application_date)}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        loan.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        loan.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        loan.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {loan.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button variant="secondary" onClick={() => setShowDetailsModal(false)} fullWidth>
              Close
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};
