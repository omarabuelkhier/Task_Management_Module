import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

type ToastType = 'info' | 'success' | 'error'
type Toast = { id: number; message: string; type: ToastType }

type ToastContextType = {
  push: (message: string, type?: ToastType, durationMs?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

// Global registration so non-React modules (like axios client) can show toasts.
// Provider will register its push function here on mount.
type ToastFn = (message: string, type?: ToastType, durationMs?: number) => void
let toastRegistrar: ToastFn | null = null

export function showToast(message: string, opts?: { type?: ToastType; durationMs?: number }) {
  const type = opts?.type || 'info'
  const durationMs = opts?.durationMs ?? 3000
  if (toastRegistrar) return toastRegistrar(message, type, durationMs)
  // Fallback: console (avoid blocking alerts)
  console.info(`[toast:${type}]`, message)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const idRef = useRef(1)

  const remove = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const push = useCallback((message: string, type: ToastType = 'info', durationMs: number = 3000) => {
    const id = idRef.current++
    setToasts(prev => [...prev, { id, message, type }])
    if (durationMs > 0) {
      window.setTimeout(() => remove(id), durationMs)
    }
  }, [remove])

  useEffect(() => {
    toastRegistrar = push
    return () => { toastRegistrar = null }
  }, [push])

  const value = useMemo(() => ({ push }), [push])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Viewport */}
      <div aria-live="polite" aria-atomic="true" className="pointer-events-none fixed bottom-4 right-4 z-[100] flex max-w-full flex-col gap-2 sm:right-6 sm:bottom-6">
        {toasts.map(t => (
          <div
            key={t.id}
            role="status"
            className={[
              'pointer-events-auto shadow-lg rounded-md px-3 py-2 text-sm sm:text-base backdrop-blur',
              'border flex items-start gap-2',
              'bg-white/90 dark:bg-gray-900/90',
              t.type === 'success' ? 'border-emerald-300 dark:border-emerald-600 text-emerald-800 dark:text-emerald-200' :
              t.type === 'error' ? 'border-red-300 dark:border-red-600 text-red-800 dark:text-red-200' :
                                   'border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200'
            ].join(' ')}
          >
            <span className="mt-0.5 inline-block">
              {t.type === 'success' && (<svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>)}
              {t.type === 'error' && (<svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10s10-4.5 10-10S17.5 2 12 2m1 15h-2v-2h2zm0-4h-2V7h2z"/></svg>)}
              {t.type === 'info' && (<svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2m1 15h-2v-6h2zm0-8h-2V7h2z"/></svg>)}
            </span>
            <div className="flex-1">{t.message}</div>
            <button onClick={() => remove(t.id)} className="ml-2 rounded p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" aria-label="Dismiss">
              <svg width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12Z"/></svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
