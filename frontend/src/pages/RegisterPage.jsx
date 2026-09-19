import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Boxes, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ fullName: '', username: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!form.username.trim()) errs.username = 'Username is required';
    else if (form.username.trim().length < 3) errs.username = 'Username must be at least 3 characters';
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username.trim())) errs.username = 'Only letters, numbers and underscores allowed';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address';
    if (!form.password) errs.password = 'Password is required';
    else if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(form.password)) errs.password = 'At least 8 characters, with a letter and a number';
    if (form.confirmPassword !== form.password) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const result = await register({
      fullName: form.fullName.trim(),
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
      confirmPassword: form.confirmPassword,
    });
    setSubmitting(false);
    if (result.success) {
      toast.success('Account created! Welcome to DevCollab AI.');
      navigate('/dashboard', { replace: true });
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
            <Boxes size={19} className="text-white" />
          </div>
          <span className="font-semibold text-lg text-ink tracking-tight">DevCollab <span className="text-accent">AI</span></span>
        </div>

        <div className="card p-6 shadow-glass">
          <h1 className="text-lg font-semibold text-ink mb-1">Create your account</h1>
          <p className="text-sm text-muted mb-6">Start collaborating with your team in minutes.</p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Full name</label>
              <input className="input" placeholder="Ada Lovelace" value={form.fullName} onChange={update('fullName')} autoComplete="name" />
              {errors.fullName && <p className="text-xs text-danger mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Username</label>
              <input className="input" placeholder="ada.lovelace" value={form.username} onChange={update('username')} autoComplete="username" />
              {errors.username && <p className="text-xs text-danger mt-1">{errors.username}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Email</label>
              <input type="email" className="input" placeholder="you@company.com" value={form.email} onChange={update('email')} autoComplete="email" />
              {errors.email && <p className="text-xs text-danger mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} className="input pr-10" placeholder="At least 8 characters" value={form.password} onChange={update('password')} autoComplete="new-password" />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-danger mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Confirm password</label>
              <input type={showPassword ? 'text' : 'password'} className="input" placeholder="Re-enter your password" value={form.confirmPassword} onChange={update('confirmPassword')} autoComplete="new-password" />
              {errors.confirmPassword && <p className="text-xs text-danger mt-1">{errors.confirmPassword}</p>}
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting && <Loader2 size={16} className="animate-spin" />}
              Create account
            </button>
          </form>
        </div>

        <p className="text-sm text-muted text-center mt-5">
          Already have an account? <Link to="/login" className="text-accent hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
