import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../services/authService';
import { Input } from '../../components/shared/Input';
import { Button } from '../../components/shared/Button';
import { BackgroundAnimation } from '../../components/shared/BackgroundAnimation';

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔵 handleLogin called!');
    console.log('Email:', email);
    console.log('Password length:', password.length);
    
    setError('');
    setLoading(true);

    try {
      console.log('🔵 Step 1: Attempting login with:', email);
      const result = await AuthService.signIn(email, password);
      
      console.log('🔵 Step 2: Login result:', result);
      console.log('✅ Login successful, profile:', result.profile);
      
      if (!result.profile) {
        console.error('❌ No profile returned');
        throw new Error('User profile not found. Make sure you inserted the user into the users table.');
      }

      const targetPath = result.profile.role === 'admin' 
        ? '/admin/dashboard'
        : result.profile.role === 'subadmin'
        ? '/subadmin/dashboard'
        : '/agent/dashboard';

      console.log('🔵 Step 3: Navigating to:', targetPath);
      
      // Force page reload to reinitialize AuthContext
      window.location.href = targetPath;
      
      console.log('✅ Navigation complete');
    } catch (err: any) {
      console.error('❌ Login error:', err);
      console.error('Error details:', err.message, err.code);
      setError(err.message || 'Invalid email or password. Check console for details.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 relative flex items-center justify-center p-4" style={{ backgroundColor: '#0F172A' }}>
      <BackgroundAnimation />
      
      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* Logo/Title */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Millennium Potter
          </h1>
          <p className="text-lg sm:text-xl font-semibold" style={{ color: '#3B82F6' }}>
            Fintech Platform
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 text-center">
            Sign In to Your Account
          </h2>

          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
            <Input
              type="email"
              label="Email Address"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              }
            />

            <Input
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />

            <Button
              type="submit"
              variant="gold"
              fullWidth
              loading={loading}
              disabled={loading}
              onClick={(e) => {
                console.log('🟢 Button clicked!', e);
              }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-4 sm:mt-6 text-center space-y-3">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <button
                type="button"
                className="text-blue-400 hover:text-blue-300 transition-colors font-semibold"
                onClick={() => navigate('/signup')}
              >
                Sign Up
              </button>
            </p>
            <button
              type="button"
              className="text-xs sm:text-sm text-gray-500 hover:text-gray-400 transition-colors"
              onClick={() => alert('Contact your administrator to reset password')}
            >
              Forgot Password?
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-4 sm:mt-6 glass-card p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-gray-400 text-center mb-2 font-semibold">
            🎉 New User? Create an account above!
          </p>
          <p className="text-xs text-gray-500 text-center">
            Sign up to get started with Millennium Potter Fintech Platform
          </p>
        </div>
      </div>
    </div>
  );
};
