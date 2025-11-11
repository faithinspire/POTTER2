import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/shared/Button';
import { StatsCard } from '../../components/shared/Card';
import { BackgroundAnimation } from '../../components/shared/BackgroundAnimation';

export const SubAdminDashboard = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

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
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs sm:text-sm font-semibold">
                Sub-Admin - {profile?.branch_name}
              </span>
              <Button variant="secondary" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </nav>

        {/* Content */}
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {profile?.branch_name} Branch Dashboard
          </h2>
          <p className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8">Sub-Admin Portal</p>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Branch Agents"
              value="0"
              icon="👥"
              variant="primary"
            />
            <StatsCard
              title="Branch Customers"
              value="0"
              icon="👤"
              variant="success"
            />
            <StatsCard
              title="Pending Approvals"
              value="0"
              icon="⏳"
              variant="warning"
            />
            <StatsCard
              title="Active Loans"
              value="0"
              icon="💰"
              variant="success"
            />
          </div>

          {/* Welcome Message */}
          <div className="glass-card p-4 sm:p-8 text-center">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
              🎉 Welcome to Your Branch Dashboard!
            </h3>
            <p className="text-sm sm:text-base text-gray-300 mb-6">
              You are managing the <strong>{profile?.branch_name}</strong> branch.
              <br className="hidden sm:block" />
              <span className="block sm:inline"> You have access to all operations within your branch.</span>
            </p>
            <div className="space-y-2 text-left max-w-2xl mx-auto text-sm sm:text-base">
              <p className="text-gray-400">✅ Manage agents in your branch</p>
              <p className="text-gray-400">✅ Approve or reject loan applications</p>
              <p className="text-gray-400">✅ View branch customer portfolio</p>
              <p className="text-gray-400">✅ Monitor branch performance</p>
              <p className="text-gray-400">✅ Generate branch reports</p>
            </div>
            <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <Button variant="gold" onClick={() => navigate('/subadmin/loan-approvals')}>
                📋 Loan Approvals
              </Button>
              <Button variant="gold" onClick={() => navigate('/subadmin/disbursements')}>
                💰 Disbursements
              </Button>
              <Button variant="primary" onClick={() => navigate('/subadmin/agents')}>
                👥 Agents
              </Button>
              <Button variant="primary" onClick={() => navigate('/subadmin/customers')}>
                👤 Customers
              </Button>
              <Button variant="primary" onClick={() => navigate('/subadmin/analytics')}>
                📊 Analytics
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
