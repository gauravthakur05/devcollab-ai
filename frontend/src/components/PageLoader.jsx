import React from 'react';
import { Loader2 } from 'lucide-react';

export default function PageLoader() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-bg">
      <div className="flex flex-col items-center gap-3 text-muted">
        <Loader2 className="animate-spin text-accent" size={28} />
        <p className="text-sm">Loading DevCollab AI…</p>
      </div>
    </div>
  );
}
