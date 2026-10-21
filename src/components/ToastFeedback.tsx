import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Copy, Phone, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { Biometrics } from '../services/biometrics';

export interface ToastMessage {
  id: string;
  title: string;
  subtitle?: string;
  type?: 'success' | 'copy' | 'call' | 'security' | 'sync' | 'error';
}

interface ToastContextType {
  showToast: (title: string, subtitle?: string, type?: ToastMessage['type']) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (title: string, subtitle?: string, type: ToastMessage['type'] = 'success') => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts(prev => [...prev.slice(-2), { id, title, subtitle, type }]);

      // Trigger iOS audio & haptic
      if (type === 'copy' || type === 'success') {
        Biometrics.triggerHaptic('success');
        Biometrics.playFeedbackTone('success');
      } else if (type === 'call') {
        Biometrics.triggerHaptic('light');
        Biometrics.playFeedbackTone('click');
      } else if (type === 'error') {
        Biometrics.triggerHaptic('error');
      }

      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 2600);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Floating Apple Island / HUD Toast Container */}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none w-full max-w-[340px] px-4">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              className="pointer-events-auto w-full flex items-center gap-3 px-4 py-3 bg-slate-900/95 dark:bg-slate-800/95 text-white backdrop-blur-xl rounded-2xl shadow-xl shadow-black/25 border border-white/10"
            >
              <div className="shrink-0 w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                {toast.type === 'copy' && <Copy className="w-4 h-4 text-emerald-400" />}
                {toast.type === 'call' && <Phone className="w-4 h-4 text-blue-400" />}
                {toast.type === 'security' && <ShieldCheck className="w-4 h-4 text-teal-400" />}
                {toast.type === 'sync' && <RefreshCw className="w-4 h-4 text-sky-400 animate-spin" />}
                {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
                {(!toast.type || toast.type === 'success') && (
                  <Check className="w-4 h-4 text-emerald-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">{toast.title}</p>
                {toast.subtitle && (
                  <p className="text-[11px] text-slate-300 truncate">{toast.subtitle}</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
