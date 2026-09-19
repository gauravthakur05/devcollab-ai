import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="text-center">
        <Compass size={32} className="text-muted mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-ink mb-1">Page not found</h1>
        <p className="text-sm text-muted mb-5">The page you're looking for doesn't exist.</p>
        <Link to="/dashboard" className="btn-primary inline-flex">Back to Dashboard</Link>
      </div>
    </div>
  );
}
