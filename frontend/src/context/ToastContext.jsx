import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, type = 'info') => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => remove(id), 4000);
    },
    [remove]
  );

  const toast = {
    success: (msg) => push(msg, 'success'),
    error: (msg) => push(msg, 'error'),
    info: (msg) => push(msg, 'info'),
  };

  const icons = { success: CheckCircle2, error: XCircle, info: Info };
  const colors = { success: 'text-mint border-mint/30 bg-mint-soft', error: 'text-danger border-danger/30 bg-danger/10', info: 'text-info border-info/30 bg-info/10' };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80 max-w-[90vw]">
        {toasts.map((t) => {
          const Icon = icons[t.type];
          return (
            <div key={t.id} className={`card border flex items-start gap-2 p-3 shadow-glass animate-in fade-in slide-in-from-bottom-2 ${colors[t.type]}`}>
              <Icon size={18} className="mt-0.5 shrink-0" />
              <p className="text-sm text-ink flex-1">{t.message}</p>
              <button onClick={() => remove(t.id)} className="text-muted hover:text-ink">
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
