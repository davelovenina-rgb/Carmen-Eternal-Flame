
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Save, Download, Upload } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface SystemToastProps {
  message: string;
  type?: ToastType;
  isVisible: boolean;
  onClose: () => void;
}

export const SystemToast: React.FC<SystemToastProps> = ({ message, type = 'success', isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const config = {
    success: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-950/90', border: 'border-emerald-500/30' },
    error: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-950/90', border: 'border-red-500/30' },
    info: { icon: Save, color: 'text-indigo-400', bg: 'bg-indigo-950/90', border: 'border-indigo-500/30' }
  };

  const { icon: Icon, color, bg, border } = config[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]"
        >
          <div className={`flex items-center gap-3 px-6 py-3 rounded-full backdrop-blur-md shadow-2xl border ${bg} ${border}`}>
            <Icon size={18} className={color} />
            <span className="text-sm font-medium text-white tracking-wide">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
