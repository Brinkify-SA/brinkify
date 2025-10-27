// app/auth/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // ✅ Replace this with your real password reset logic
    // e.g., Firebase: sendPasswordResetEmail(auth, email)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // For demo: assume success
      setSuccess(true);
    } catch (err) {
      setError('Failed to send reset email. Please check your address and try again.');
    } finally {
      setLoading(false);
    }
  };

  const navigate = (path: string) => router.push(path);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <header className="py-6 px-4 text-left max-w-md w-full mx-auto">
        <button
          onClick={() => navigate('/auth/login')}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          <ArrowLeft size={18} />
          Back to Login
        </button>
      </header>

      {/* Main */}
      <main className="flex-grow flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md">
          {!success ? (
            <>
              <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                  <Mail className="text-blue-600 dark:text-blue-400" size={28} />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-3">
                  Forgot Your Password?
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Enter your email and we’ll send you a link to reset it.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition ${
                    loading
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 shadow-md hover:shadow-lg'
                  }`}
                >
                  {loading ? 'Sending Link...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            /* Success State */
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-green-600 dark:text-green-400 w-8 h-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">Check Your Inbox</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We’ve sent a password reset link to{' '}
                <span className="font-medium text-blue-600 dark:text-blue-400">{email}</span>.
                <br />
                Didn’t receive it? Check your spam folder.
              </p>
              <button
                onClick={() => navigate('/auth/login')}
                className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
              >
                Back to Login
              </button>
            </div>
          )}

          {/* Sign Up Link */}
          <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Remember your password?{' '}
            <button
              onClick={() => navigate('/auth/login')}
              className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              Sign In
            </button>
            <br />
            Don’t have an account?{' '}
            <button
              onClick={() => navigate('/auth/signup')}
              className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              Sign Up
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm mx-4 mb-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30">
        © {new Date().getFullYear()}{' '}
        <span className="text-blue-600 dark:text-blue-400 font-semibold">Brinkify SA</span>. Empowering local talent.
      </footer>
    </div>
  );
}