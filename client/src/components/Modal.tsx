import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: 'fadeIn 0.2s ease' }}
      />

      {/* Panel */}
      <div
        className={`relative w-full ${maxWidth} rounded-2xl overflow-hidden`}
        style={{
          background: '#12151C',
          border: '1px solid rgba(30, 35, 48, 0.9)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.1)',
          animation: 'fadeUp 0.3s ease',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
          <h2 className="font-display text-lg font-semibold text-off-white">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-off-white hover:bg-white/[0.08] transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
