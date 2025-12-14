import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { signup, error, isLoading, resetError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');
    resetError();

    // Validation
    if (!email || !displayName || !password || !confirmPassword) {
      setLocalError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    if (!agreedToTerms) {
      setLocalError('You must agree to the terms and conditions');
      return;
    }

    await signup(email, password, displayName);
    
    // Show success message
    setTimeout(() => {
      const authState = useAuthStore.getState();
      if (authState.error?.includes('successful')) {
        setSuccessMessage('Check your email to verify your account!');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    }, 500);
  };

  const displayErrorMessage = localError || (error && !error.includes('successful') ? error : '');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-dark-bg-primary dark:via-gray-900 dark:to-dark-bg-primary p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white dark:text-white mb-2">EduMunch</h1>
          <p className="text-gray-400 dark:text-slate-400">School Management System</p>
        </div>

        {/* Register Card */}
        <div className="rounded-lg border border-indigo-500 dark:border-indigo-600 p-8 bg-gray-800 dark:bg-dark-surface-primary">
          <h2 className="text-2xl font-bold text-white dark:text-white mb-6">Create Account</h2>

          {displayErrorMessage && (
            <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/50">
              <p className="text-red-400 text-sm">{displayErrorMessage}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-4 rounded-lg bg-green-500/10 border border-green-500/50">
              <p className="text-green-400 text-sm">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 dark:text-white mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={isLoading}
                placeholder="John Doe"
                className="w-full px-4 py-2 bg-gray-700 dark:bg-dark-surface-secondary border border-gray-600 dark:border-dark-border-primary rounded-lg text-white dark:text-dark-text-primary placeholder-gray-400 dark:placeholder-dark-text-tertiary focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
              />
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 dark:text-white mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                placeholder="john.doe@example.com"
                className="w-full px-4 py-2 bg-gray-700 dark:bg-dark-surface-secondary border border-gray-600 dark:border-dark-border-primary rounded-lg text-white dark:text-dark-text-primary placeholder-gray-400 dark:placeholder-dark-text-tertiary focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 dark:text-white mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-gray-700 dark:bg-dark-surface-secondary border border-gray-600 dark:border-dark-border-primary rounded-lg text-white dark:text-dark-text-primary placeholder-gray-400 dark:placeholder-dark-text-tertiary focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
              />
              <p className="text-xs text-gray-400 dark:text-slate-400 mt-1">
                At least 6 characters
              </p>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 dark:text-white mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-gray-700 dark:bg-dark-surface-secondary border border-gray-600 dark:border-dark-border-primary rounded-lg text-white dark:text-dark-text-primary placeholder-gray-400 dark:placeholder-dark-text-tertiary focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
              />
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                disabled={isLoading}
                className="mr-2 rounded bg-gray-700 dark:bg-dark-surface-secondary border-gray-600 dark:border-dark-border-primary text-indigo-600 focus:ring-indigo-500 focus:ring-offset-gray-800 dark:focus:ring-offset-dark-surface-primary disabled:opacity-50"
              />
              <label htmlFor="terms" className="text-sm text-gray-400 dark:text-dark-text-secondary cursor-pointer">
                I agree to the{' '}
                <a href="#" className="text-indigo-400 hover:text-indigo-300">
                  terms and conditions
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 h-px bg-gray-600 dark:bg-dark-border-primary"></div>
            <span className="px-3 text-sm text-gray-400 dark:text-dark-text-secondary">OR</span>
            <div className="flex-1 h-px bg-gray-600 dark:bg-dark-border-primary"></div>
          </div>

          {/* Sign In Link */}
          <p className="text-center text-gray-400 dark:text-dark-text-secondary">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
