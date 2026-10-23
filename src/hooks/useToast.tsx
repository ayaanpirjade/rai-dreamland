import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Heart, Info, TriangleAlert } from 'lucide-react'

export type ToastTone = 'success' | 'error' | 'info' | 'love'

export interface Toast {
  id: number
  message: string
  tone: ToastTone
}

interface ToastContextValue {
  notify: (message: string, tone?: ToastTone) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const TONE_META: Record<ToastTone, { icon: typeof Info; label: string }> = {
  success: { icon: CheckCircle2, label: 'Success' },
  error: { icon: TriangleAlert, label: 'Error' },
  info: { icon: Info, label: 'Info' },
  love: { icon: Heart, label: 'Love' },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counter = useRef(0)

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const notify = useCallback(
    (message: string, tone: ToastTone = 'info') => {
      counter.current += 1
      const id = counter.current
      setToasts((prev) => [...prev.slice(-3), { id, message, tone }])
      window.setTimeout(() => dismiss(id), tone === 'error' ? 5200 : 3800)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ notify }), [notify])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="toast-stack"
        role="status"
        aria-live="polite"
        aria-atomic="false"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => {
            const meta = TONE_META[toast.tone]
            const Icon = meta.icon
            return (
              <motion.div
                key={toast.id}
                className={`toast toast--${toast.tone}`}
                initial={{ opacity: 0, y: 24, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                onClick={() => dismiss(toast.id)}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{toast.message}</span>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

/** Polite screen-reader announcement without any visual chrome. */
export function useAnnouncer() {
  const [message, setMessage] = useState('')
  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(() => setMessage(''), 4000)
    return () => window.clearTimeout(timer)
  }, [message])
  return {
    message,
    announce: setMessage,
  }
}
