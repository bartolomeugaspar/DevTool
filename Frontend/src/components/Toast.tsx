import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

function ToastItem({ message, type = 'success', duration = 3500, onClose }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Slide in
    const show = setTimeout(() => setVisible(true), 10);
    // Slide out then close
    const hide = setTimeout(() => setVisible(false), duration - 400);
    const close = setTimeout(onClose, duration);
    return () => { clearTimeout(show); clearTimeout(hide); clearTimeout(close); };
  }, [duration, onClose]);

  const config = {
    success: {
      icon: (
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(49,236,198,0.15)' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#31ECC6" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
      ),
      bar: '#31ECC6',
    },
    error: {
      icon: (
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(248,113,113,0.15)' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#f87171" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      ),
      bar: '#f87171',
    },
    info: {
      icon: (
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(99,179,237,0.15)' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#63b3ed" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      ),
      bar: '#63b3ed',
    },
  };

  const { icon, bar } = config[type];

  return (
    <div
      role="alert"
      style={{
        background: '#0e1e35',
        border: '1px solid #1a3557',
        boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.35s ease',
        minWidth: '280px',
        maxWidth: '360px',
      }}
      className="relative flex items-center gap-3 px-4 py-3 rounded-2xl overflow-hidden"
    >
      {/* Progress bar */}
      <div
        className="absolute bottom-0 left-0 h-[2px] rounded-full"
        style={{
          background: bar,
          width: visible ? '0%' : '100%',
          transition: `width ${duration - 400}ms linear`,
          transitionDelay: '10ms',
        }}
      />

      {icon}

      <p className="text-sm font-medium text-white leading-snug flex-1">{message}</p>

      <button
        onClick={() => { setVisible(false); setTimeout(onClose, 350); }}
        className="ml-1 flex-shrink-0 opacity-40 hover:opacity-80 transition-opacity"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ─── Global toast state ───────────────────────────────────────────────────────

interface ToastEntry {
  id: number;
  message: string;
  type: ToastType;
  duration?: number;
}

let _listeners: Array<(toasts: ToastEntry[]) => void> = [];
let _toasts: ToastEntry[] = [];
let _nextId = 0;

function notify(toasts: ToastEntry[]) {
  _toasts = toasts;
  _listeners.forEach(fn => fn(toasts));
}

export const toast = {
  show(message: string, type: ToastType = 'success', duration?: number) {
    const id = ++_nextId;
    notify([..._toasts, { id, message, type, duration }]);
    return id;
  },
  success: (msg: string, duration?: number) => toast.show(msg, 'success', duration),
  error: (msg: string, duration?: number) => toast.show(msg, 'error', duration),
  info: (msg: string, duration?: number) => toast.show(msg, 'info', duration),
};

// ─── Provider (mount once in App) ────────────────────────────────────────────

export function ToastProvider() {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);

  useEffect(() => {
    _listeners.push(setToasts);
    return () => { _listeners = _listeners.filter(fn => fn !== setToasts); };
  }, []);

  const remove = (id: number) => notify(_toasts.filter(t => t.id !== id));

  return createPortal(
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 items-end pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem
            message={t.message}
            type={t.type}
            duration={t.duration}
            onClose={() => remove(t.id)}
          />
        </div>
      ))}
    </div>,
    document.body,
  );
}
