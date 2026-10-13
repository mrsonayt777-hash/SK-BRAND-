import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, User } from 'lucide-react';

interface CustomerAuthProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  isRegister?: boolean;
}

export const CustomerAuthPage: React.FC<CustomerAuthProps> = ({ onNavigate, isRegister = false }) => {
  const { loginCustomer, registerCustomer } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (isRegister) {
      if (!fullName.trim() || !email.trim() || !password.trim()) {
        setError('Please fill in all required fields.');
        setLoading(false);
        return;
      }
      const res = await registerCustomer(fullName, email, password, phone);
      if (res.success) {
        onNavigate('customer-profile');
      } else {
        setError(res.message || 'Registration failed.');
      }
    } else {
      if (!email.trim() || !password.trim()) {
        setError('Please enter both email and password.');
        setLoading(false);
        return;
      }
      const res = await loginCustomer(email, password);
      if (res.success) {
        onNavigate('customer-profile');
      } else {
        setError(res.message || 'Login failed.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-slate-950 text-white flex flex-col items-center justify-center mx-auto mb-2">
          <span className="text-sm font-black">SK</span>
          <span className="text-[6px] font-bold text-sky-400">BRAND</span>
        </div>
        <h1 className="text-2xl font-black font-serif text-slate-950">
          {isRegister ? 'Create Customer Account' : 'Welcome Back'}
        </h1>
        <p className="text-xs text-slate-500">
          {isRegister
            ? 'Sign up for saved addresses and fast order tracking'
            : 'Access your order history and account preferences'}
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isRegister && (
            <>
              <div className="space-y-1">
                <label className="font-semibold text-slate-800">Full Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Rajesh Kumar"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-slate-900 focus:outline-hidden focus:bg-white focus:border-slate-900"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-800">Mobile Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-hidden focus:bg-white focus:border-slate-900"
                />
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="font-semibold text-slate-800">Email Address *</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-slate-900 focus:outline-hidden focus:bg-white focus:border-slate-900"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-800">Password *</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-slate-900 focus:outline-hidden focus:bg-white focus:border-slate-900"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>Please wait...</span>
            ) : (
              <>
                <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-600">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => onNavigate('customer-login')}
                className="font-bold text-slate-950 hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don&apos;t have an account yet?{' '}
              <button
                onClick={() => onNavigate('customer-register')}
                className="font-bold text-slate-950 hover:underline cursor-pointer"
              >
                Register here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
