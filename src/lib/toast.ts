import { useSyncExternalStore } from "react"

// Tiny stand-in for the main project's sonner toasts.
export type Toast = { id: number; message: string; kind: "success" | "error" }

let toasts: Toast[] = []
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((listener) => listener())

function push(message: string, kind: Toast["kind"]) {
  const id = Date.now() + Math.random()
  toasts = [...toasts, { id, message, kind }]
  emit()
  setTimeout(() => {
    toasts = toasts.filter((item) => item.id !== id)
    emit()
  }, 4000)
}

export const toast = {
  success: (message: string) => push(message, "success"),
  error: (message: string) => push(message, "error"),
}

export function useToasts(): Toast[] {
  return useSyncExternalStore(
    (callback) => {
      listeners.add(callback)
      return () => {
        listeners.delete(callback)
      }
    },
    () => toasts,
    () => toasts,
  )
}
