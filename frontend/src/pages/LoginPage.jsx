import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Boxes, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address';
    if (!password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const result = await login({ email: email.trim(), password, rememberMe });
    setSubmitting(false);
    if (result.success) {
      toast.success('Welcome back!');
      const redirectTo = location.state?.from?.pathname || '/dashboard';
      navigate(redirectTo, { replace: true });
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
            <Boxes size={19} className="text-white" />
          </div>
          <span className="font-semibold text-lg text-ink tracking-tight">DevCollab <span className="text-accent">AI</span></span>
        </div>

        <div className="card p-6 shadow-glass">
          <h1 className="text-lg font-semibold text-ink mb-1">Sign in to your workspace</h1>
          <p className="text-sm text-muted mb-6">Ship, review, and collaborate — faster.</p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              {errors.email && <p className="text-xs text-danger mt-1">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-muted">Password</label>
                <Link to="/forgot-password" className="text-xs text-accent hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-danger mt-1">{errors.password}</p>}
            </div>

            <label className="flex items-center gap-2 text-sm text-muted cursor-pointer select-none">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="rounded border-border bg-surface2 text-accent focus:ring-accent/50" />
              Remember me
            </label>

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting && <Loader2 size={16} className="animate-spin" />}
              Sign in
            </button>
          </form>

          <p className="text-xs text-muted text-center mt-5 bg-surface2 border border-border rounded-lg p-2.5">
            Demo account: <span className="text-ink font-mono">demo@devcollab.com</span> / <span className="text-ink font-mono">Demo@123</span>
          </p>
        </div>

        <p className="text-sm text-muted text-center mt-5">
          Don't have an account? <Link to="/register" className="text-accent hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}
