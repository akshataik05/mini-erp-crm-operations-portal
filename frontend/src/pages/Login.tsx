import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { Building2, LogIn, Key, Mail, ShieldAlert, Eye, EyeOff, Sun, Moon, CheckCircle2, ShieldCheck, Layers, PackageCheck } from 'lucide-react';
import { Role } from '../types';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        login(res.data.data.token, res.data.data.user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please verify email and password.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillQuickCredentials = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        setEmail('admin@minierp.com');
        setPassword('Admin@123');
        break;
      case 'SALES':
        setEmail('sales@minierp.com');
        setPassword('Sales@123');
        break;
      case 'WAREHOUSE':
        setEmail('warehouse@minierp.com');
        setPassword('Warehouse@123');
        break;
      case 'ACCOUNTS':
        setEmail('accounts@minierp.com');
        setPassword('Accounts@123');
        break;
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Theme Toggle in Top Corner */}
      <div className="absolute top-5 right-5 z-20">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2.5 rounded-lg bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-sm transition"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>

      {/* Left Column - Enterprise SaaS Visual & Value Proposition */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-sky-900 dark:bg-slate-900 border-r border-sky-800 dark:border-slate-800 text-white relative overflow-hidden">
        <div className="z-10">
          <div className="flex items-center space-x-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-white text-sky-700 flex items-center justify-center font-bold shadow-md">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight">Mini ERP + CRM</h1>
              <p className="text-xs text-sky-200 dark:text-slate-400 font-medium">Operations & Inventory Portal</p>
            </div>
          </div>

          <div className="max-w-md mt-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
              Streamline enterprise operations, CRM leads & stock movements.
            </h2>
            <p className="mt-4 text-sm text-sky-100 dark:text-slate-300 leading-relaxed font-normal">
              A robust multi-role operations portal engineered with role-based access control, atomic PostgreSQL inventory transactions, and line-item snapshot delivery challans.
            </p>

            <div className="mt-8 space-y-4 text-sm font-medium">
              <div className="flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-sky-300 shrink-0 mt-0.5" />
                <span>Strict Role-Based Access Control (Admin, Sales, Warehouse, Accounts)</span>
              </div>
              <div className="flex items-start space-x-3">
                <PackageCheck className="w-5 h-5 text-sky-300 shrink-0 mt-0.5" />
                <span>Transaction-safe atomic inventory deductions & Movement Audit Logs</span>
              </div>
              <div className="flex items-start space-x-3">
                <Layers className="w-5 h-5 text-sky-300 shrink-0 mt-0.5" />
                <span>Customer CRM lead tracking, pricing snapshots & PDF invoice exports</span>
              </div>
            </div>
          </div>
        </div>

        <div className="z-10 pt-8 border-t border-sky-800/80 dark:border-slate-800 text-xs text-sky-200 dark:text-slate-400 flex items-center justify-between">
          <span>Enterprise SaaS Platform</span>
          <span>Version 1.0 Production Edition</span>
        </div>
      </div>

      {/* Right Column - Clean Login Form */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 z-10">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-sky-600 text-white mb-3 shadow-md">
              <Building2 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Mini ERP + CRM Operations Portal
            </h2>
          </div>

          <div className="text-left mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Sign in to your account
            </h2>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-normal">
              Enter your corporate credentials to access the operations portal
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start space-x-3 text-rose-700 dark:text-rose-300 text-xs font-medium">
              <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{error}</p>
                <p className="mt-1 text-slate-600 dark:text-slate-400">
                  Tip: Click one of the quick demo role buttons below to auto-fill system credentials.
                </p>
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Corporate Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@minierp.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                  title={showPassword ? 'Hide Password' : 'Show Password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center space-x-2 cursor-pointer text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-sky-600 focus:ring-sky-500"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                className="text-sky-600 dark:text-sky-400 hover:underline font-semibold"
                onClick={() => alert('Please contact your System Administrator to reset your password.')}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center items-center space-x-2 py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950 shadow-sm disabled:opacity-50 transition"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Test Role Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 text-left">
              Quick Test Accounts (Click to Auto-fill)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillQuickCredentials('ADMIN')}
                className="px-3 py-2 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-lg text-xs font-semibold transition text-left"
              >
                Admin Role
              </button>
              <button
                type="button"
                onClick={() => fillQuickCredentials('SALES')}
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-semibold transition text-left"
              >
                Sales Role
              </button>
              <button
                type="button"
                onClick={() => fillQuickCredentials('WAREHOUSE')}
                className="px-3 py-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-lg text-xs font-semibold transition text-left"
              >
                Warehouse Role
              </button>
              <button
                type="button"
                onClick={() => fillQuickCredentials('ACCOUNTS')}
                className="px-3 py-2 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 rounded-lg text-xs font-semibold transition text-left"
              >
                Accounts Role
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
