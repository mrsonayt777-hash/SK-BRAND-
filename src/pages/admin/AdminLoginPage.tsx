import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface AdminLoginPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onNavigate }) => {
  const { loginAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await loginAdmin(email, password);
      if (result.success) {
        onNavigate('admin-dashboard');
      } else {
        setError(result.message || 'Invalid administrator credentials.');
      }
    } catch {
      setError('Connection failure. Please check server status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Lock Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-950 text-white flex flex-col items-center justify-center mx-auto shadow-xl border border-slate-800">
            <Shield className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black font-serif text-slate-950">SK BRAND Administration</h1>
            <p className="text-xs text-slate-500 mt-1">
              Restricted owner management console • Protected by server-side authorization
            </p>
          </div>
        </div>

        {/* Login Form Box */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5 text-xs">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-800">Admin Username / Email *</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="admin@skbrand.in"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-slate-900 focus:outline-hidden focus:bg-white focus:border-slate-900"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800">Admin Password *</label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-10 py-2.5 text-slate-900 focus:outline-hidden focus:bg-white focus:border-slate-900"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Authenticating Owner Session...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-sky-400" />
                  <span>Enter Admin Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Seed credentials notice for testing & first owner setup */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[11px] text-slate-500">
            <p className="font-semibold text-slate-700">Initial Owner Setup Credentials:</p>
            <p>Username: <code className="bg-white px-1 py-0.5 rounded border border-slate-200 text-slate-800">admin@skbrand.in</code></p>
            <p>Password: <code className="bg-white px-1 py-0.5 rounded border border-slate-200 text-slate-800">Admin@SKBrand2026</code></p>
            <p className="text-[10px] text-slate-400 pt-1">
              (You can change the owner password anytime inside Dashboard → Security & Activity Logs)
            </p>
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={() => onNavigate('home')}
              className="text-xs text-slate-500 hover:text-slate-950 hover:underline cursor-pointer"
            >
              ← Return to Customer Storefront
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
