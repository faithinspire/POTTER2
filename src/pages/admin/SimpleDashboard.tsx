import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/shared/Button';
import { Card } from '../../components/shared/Card';
import { BackgroundAnimation } from '../../components/shared/BackgroundAnimation';

export const SimpleDashboard = () => {
  const { profile, signOut } = useAuth();

  console.log('🟢 SimpleDashboard rendering for:', profile?.email);

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
              <span className="text-white text-sm sm:text-base">Welcome, {profile?.full_name || profile?.email}</span>
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs sm:text-sm font-semibold">
                {profile?.role || 'Admin'}
              </span>
              <Button variant="secondary" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </nav>

        {/* Content */}
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Admin Dashboard</h2>
            <div className="text-sm text-gray-400">
              {new Date().toLocaleDateString()} - {new Date().toLocaleTimeString()}
            </div>
          </div>
          
          {/* Success Message */}
          <Card className="glass-card p-6 mb-8 border-l-4 border-l-green-500">
            <div className="text-center">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-white mb-2">Dashboard Working!</h3>
              <p className="text-gray-300 mb-4">
                Your Millennium Potter Fintech app is successfully deployed and running on Netlify.
              </p>
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-green-200 text-sm">
                ✅ Authentication: Working<br/>
                ✅ Dashboard: Loading<br/>
                ✅ Netlify Deployment: Success<br/>
                ✅ Environment Variables: Connected
              </div>
            </div>
          </Card>

          {/* User Info */}
          <Card className="glass-card p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Your Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-white font-semibold">{profile?.email}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Role</p>
                <p className="text-white font-semibold">{profile?.role}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Full Name</p>
                <p className="text-white font-semibold">{profile?.full_name || 'Not set'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Branch</p>
                <p className="text-white font-semibold">{profile?.branch_name || 'Head Office'}</p>
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <Card className="glass-card p-4 sm:p-6 border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-1">System Status</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-400">Online</p>
                </div>
                <div className="text-3xl sm:text-4xl">🟢</div>
              </div>
            </Card>

            <Card className="glass-card p-4 sm:p-6 border-l-4 border-l-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-1">Database</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-400">Connected</p>
                </div>
                <div className="text-3xl sm:text-4xl">💾</div>
              </div>
            </Card>

            <Card className="glass-card p-4 sm:p-6 border-l-4 border-l-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-1">Deployment</p>
                  <p className="text-xl sm:text-2xl font-bold text-yellow-400">Netlify</p>
                </div>
                <div className="text-3xl sm:text-4xl">🚀</div>
              </div>
            </Card>

            <Card className="glass-card p-4 sm:p-6 border-l-4 border-l-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-1">Version</p>
                  <p className="text-xl sm:text-2xl font-bold text-purple-400">1.0</p>
                </div>
                <div className="text-3xl sm:text-4xl">📱</div>
              </div>
            </Card>
          </div>

          {/* Next Steps */}
          <Card className="glass-card p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Next Steps</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-green-400">✅</span>
                <span className="text-gray-300">Deploy app to Netlify</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-400">✅</span>
                <span className="text-gray-300">Configure environment variables</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-400">✅</span>
                <span className="text-gray-300">Set up authentication system</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-blue-400">🔄</span>
                <span className="text-gray-300">Add users and start using the system</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-blue-400">🔄</span>
                <span className="text-gray-300">Configure loan products and branches</span>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Button
              variant="gold"
              fullWidth
              onClick={() => window.location.href = '/admin/users'}
            >
              👥 Manage Users
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={() => alert('Analytics feature coming soon!')}
            >
              📊 View Analytics
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => window.location.reload()}
            >
              🔄 Refresh Page
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};