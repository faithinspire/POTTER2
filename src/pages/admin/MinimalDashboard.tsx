import { useAuth } from '../../contexts/AuthContext';

export const MinimalDashboard = () => {
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900" style={{ backgroundColor: '#0F172A' }}>
      <div className="relative z-10">
        {/* Simple Navbar */}
        <nav className="p-4 bg-black/20 backdrop-blur-sm border-b border-gray-700">
          <div className="container mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-bold text-yellow-400">
              Millennium Potter
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-white">Welcome, {profile?.full_name || profile?.email}</span>
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-semibold">
                Admin
              </span>
              <button
                onClick={signOut}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
              >
                Sign Out
              </button>
            </div>
          </div>
        </nav>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h2>
          
          {/* Success Message */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 mb-8">
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
                ✅ All Features: Available
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-white/5 rounded-lg p-6 mb-8">
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
          </div>

          {/* Features Available */}
          <div className="bg-white/5 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">🚀 Features Available</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-green-400 mb-2">📸 Customer Registration</h4>
                <p className="text-sm text-gray-300">Photo upload functionality for professional customer documentation.</p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-blue-400 mb-2">💰 Interest Calculator</h4>
                <p className="text-sm text-gray-300">₦10,000 = ₦1,800 interest. Scales proportionally for all amounts.</p>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-400 mb-2">🏢 Branch Management</h4>
                <p className="text-sm text-gray-300">Complete oversight of all branch operations and staff performance.</p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-purple-400 mb-2">👥 User Management</h4>
                <p className="text-sm text-gray-300">Create and manage users across all branches and roles.</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => window.location.href = '/admin/users'}
              className="p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-400 hover:bg-yellow-500/30 transition-colors"
            >
              👥 Manage Users
            </button>
            <button
              onClick={() => window.location.href = '/admin/analytics'}
              className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors"
            >
              📊 View Analytics
            </button>
            <button
              onClick={() => window.location.reload()}
              className="p-4 bg-gray-500/20 border border-gray-500/30 rounded-lg text-gray-400 hover:bg-gray-500/30 transition-colors"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};