import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Boxes, ArrowLeft, MailCheck } from 'lucide-react';

// UI-only per spec (item 3: "Forgot password UI"). No backend endpoint is
// wired up yet — this presents the flow and a clear confirmation state.
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSent(true);
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
          {sent ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-xl bg-mint-soft text-mint flex items-center justify-center mx-auto mb-4">
                <MailCheck size={22} />
              </div>
              <h1 className="text-lg font-semibold text-ink mb-1">Check your inbox</h1>
              <p className="text-sm text-muted">If an account exists for {email}, we've sent a link to reset your password.</p>
            </div>
          ) : (
            <>
              <h1 className="text-lg font-semibold text-ink mb-1">Reset your password</h1>
              <p className="text-sm text-muted mb-6">Enter your email and we'll send you a reset link.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1.5">Email</label>
                  <input type="email" className="input" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <button type="submit" className="btn-primary w-full">Send reset link</button>
              </form>
            </>
          )}
        </div>

        <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-muted hover:text-ink mt-5">
          <ArrowLeft size={14} /> Back to sign in
        </Link>
      </div>
    </div>
  );
}
