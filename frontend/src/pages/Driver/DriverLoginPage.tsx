import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginDriver } from '@/lib/api';
import { useDriverAuthStore } from '@/store/driverAuthStore';
import { motion } from 'framer-motion';
import { Car, Mail, Lock, AlertCircle, ArrowLeft } from 'lucide-react';

export default function DriverLoginPage() {
  const navigate = useNavigate();
  const setDriver = useDriverAuthStore((s) => s.setDriver);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatusMessage('');
    setLoading(true);

    try {
      const res = await loginDriver({ email, password });
      setDriver(res.data);
      navigate('/driver/dashboard');
    } catch (err: any) {
      const data = err?.response?.data;
      if (data?.status === 'pending') {
        setStatusMessage('Your registration is pending admin approval. Please check back later.');
      } else if (data?.status === 'rejected') {
        setStatusMessage('Your registration has been rejected. Please contact the administrator.');
      } else {
        setError(data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-slate-100 p-5 font-sans relative overflow-hidden">
      {/* Ambient glow */}
      <div className="fixed -top-[30%] -left-[10%] w-[60vw] h-[60vw] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed -bottom-[20%] -right-[10%] w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none z-0" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-[440px] relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30"
          >
            <Car className="w-7 h-7 text-white" />
          </motion.div>
          <h1 className="text-white text-2xl font-extrabold tracking-tight">
            Driver Portal
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Sign in to manage your trips
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl shadow-black/50">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-5 flex items-start gap-2"
            >
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="text-red-300 text-sm font-medium">{error}</div>
            </motion.div>
          )}

          {statusMessage && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className={`border rounded-xl p-3 mb-5 flex items-start gap-2 ${
                statusMessage.includes('pending') 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' 
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm font-medium leading-snug">{statusMessage}</div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-slate-300 text-sm font-semibold mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-slate-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="driver@email.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-900/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-slate-500"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-slate-300 text-sm font-semibold mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-slate-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-900/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-slate-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl border-none cursor-pointer font-bold text-sm text-white tracking-wide transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
              style={{
                background: loading ? 'rgba(79, 70, 229, 0.5)' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              }}
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Signing In…
                </>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="text-center mt-6 pt-5 border-t border-slate-700/50">
            <p className="text-slate-400 text-sm">
              Don't have an account?{' '}
              <Link to="/driver/register" className="text-indigo-400 no-underline font-semibold hover:text-indigo-300 transition-colors">
                Register as a Driver
              </Link>
            </p>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-slate-500 text-sm no-underline hover:text-slate-300 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Guest Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
