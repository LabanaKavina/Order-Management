import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastVariant = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (opts: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export { ToastContext };

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

const ICONS: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />,
  error:   <XCircle     size={18} className="text-destructive shrink-0" />,
  info:    <Info        size={18} className="text-sky-500 shrink-0" />,
};

const BORDER: Record<ToastVariant, string> = {
  success: 'border-emerald-200 bg-emerald-50',
  error:   'border-destructive/20 bg-destructive/5',
  info:    'border-sky-200 bg-sky-50',
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const duration = toast.duration ?? 5000;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => onDismiss(toast.id), duration);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [toast.id, duration, onDismiss]);

  return (
    <motion.div layout initial={{ opacity: 0, x: 60, scale: 0.94 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 60, scale: 0.94 }} transition={{ type: 'spring', stiffness: 400, damping: 32 }}
      className={cn('relative flex items-start gap-3 rounded-xl border px-4 pt-3 pb-4 shadow-lg w-full max-w-sm pointer-events-auto overflow-hidden', BORDER[toast.variant])}
      role="alert" aria-live="polite"
    >
      {ICONS[toast.variant]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground leading-snug">{toast.title}</p>
        {toast.description && <p className="mt-0.5 text-xs text-muted-foreground">{toast.description}</p>}
      </div>
      <button onClick={() => onDismiss(toast.id)} className="shrink-0 rounded-md p-0.5 text-muted-foreground hover:text-foreground transition-colors" aria-label="dismiss">
        <X size={14} />
      </button>
      <motion.div
        className={cn('absolute bottom-0 left-0 h-0.5 rounded-full', toast.variant === 'success' ? 'bg-emerald-400' : toast.variant === 'error' ? 'bg-destructive' : 'bg-sky-400')}
        initial={{ width: '100%' }} animate={{ width: '0%' }} transition={{ duration: duration / 1000, ease: 'linear' }}
      />
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const dismiss = useCallback((id: string) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);
  const toast = useCallback((opts: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...opts, id }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 items-end pointer-events-none sm:top-6 sm:right-6">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => <ToastItem key={t.id} toast={t} onDismiss={dismiss} />)}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
