import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { ApiError } from '@/lib/apiError'
import styles from './Toast.module.css'

type ToastTone = 'success' | 'error' | 'info'

interface Toast {
  id: number
  tone: ToastTone
  title: string
  message?: string
}

interface ToastApi {
  success: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  /** Reports a failed mutation using the server's own explanation. */
  fromError: (title: string, error: unknown) => void
}

const ToastContext = createContext<ToastApi | null>(null)

/** How long each tone stays. Errors linger: they usually need reading, not glancing at. */
const DURATION: Record<ToastTone, number> = {
  success: 4000,
  info: 5000,
  error: 9000,
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)
  const timers = useRef(new Map<number, number>())

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      window.clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const push = useCallback(
    (tone: ToastTone, title: string, message?: string) => {
      const id = nextId.current++
      setToasts((current) => [...current, { id, tone, title, message }])
      timers.current.set(
        id,
        window.setTimeout(() => dismiss(id), DURATION[tone]),
      )
    },
    [dismiss],
  )

  // Any timer still pending when the provider unmounts would fire into nothing.
  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((timer) => window.clearTimeout(timer))
  }, [])

  const api = useMemo<ToastApi>(
    () => ({
      success: (title, message) => push('success', title, message),
      info: (title, message) => push('info', title, message),
      error: (title, message) => push('error', title, message),
      fromError: (title, error) => push('error', title, ApiError.from(error).userMessage()),
    }),
    [push],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <div className={styles.region} role="region" aria-live="polite" aria-label="Notifications">
          {toasts.map((toast) => (
            <div key={toast.id} className={[styles.toast, styles[toast.tone]].join(' ')}>
              <div className={styles.text}>
                <p className={styles.title}>{toast.title}</p>
                {toast.message && <p className={styles.message}>{toast.message}</p>}
              </div>
              <button
                className={styles.dismiss}
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss"
                type="button"
              >
                ×
              </button>
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside a ToastProvider')
  return context
}
