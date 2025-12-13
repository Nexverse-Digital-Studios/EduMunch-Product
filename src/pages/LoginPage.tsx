import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { uiConfig } from '@/config/ui.config';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, error, isLoading, resetError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    resetError();

    if (!email || !password) {
      setLocalError('Email and password are required');
      return;
    }

    await login(email, password);
    // If login is successful, the useAuthStore will handle navigation via app-level routing
    // We navigate here for immediate feedback
    setTimeout(() => {
      const authState = useAuthStore.getState();
      if (authState.isAuthenticated) {
        navigate('/');
      }
    }, 500);
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">EduMunch</h1>
          <p className="text-gray-400">School Management System</p>
        </div>

        {/* Login Card */}
        <div
          className="rounded-lg border p-8"
          style={{
            backgroundColor: '#1f2937',
            borderColor: uiConfig.colors.primary['500'],
          }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">Welcome Back</h2>

          {displayError && (
            <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/50">
              <p className="text-red-400 text-sm">{displayError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                placeholder="superadmin@demoinstitute.com"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
              />
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-400">
                <input
                  type="checkbox"
                  className="mr-2 rounded"
                  disabled={isLoading}
                />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="text-indigo-400 hover:text-indigo-300"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
              style={{
                backgroundColor: uiConfig.colors.primary['500'],
                color: 'white',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.opacity = '0.9';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 h-px bg-gray-600"></div>
            <span className="px-3 text-sm text-gray-400">OR</span>
            <div className="flex-1 h-px bg-gray-600"></div>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-gray-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="mt-8 p-4 rounded-lg bg-blue-500/10 border border-blue-500/50">
          <p className="text-sm text-blue-300 mb-2">Demo Credentials:</p>
          <p className="text-xs text-blue-400">
            Email: <code className="bg-blue-500/20 px-2 py-1 rounded">superadmin@demoinstitute.com</code>
          </p>
          <p className="text-xs text-blue-400 mt-1">
            Password: <code className="bg-blue-500/20 px-2 py-1 rounded">your-password</code>
          </p>
        </div>
      </div>
    </div>
  );
}
