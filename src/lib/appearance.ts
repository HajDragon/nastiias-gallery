import { useSyncExternalStore } from "react"

export type ResolvedAppearance = "light" | "dark"
export type Appearance = ResolvedAppearance | "system"

const STORAGE_KEY = "appearance"
const listeners = new Set<() => void>()
let currentAppearance: Appearance = "system"

const prefersDark = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-color-scheme: dark)").matches

const isDarkMode = (appearance: Appearance): boolean =>
  appearance === "dark" || (appearance === "system" && prefersDark())

const applyTheme = (appearance: Appearance): void => {
  if (typeof document === "undefined") return

  const isDark = isDarkMode(appearance)
  document.documentElement.classList.toggle("dark", isDark)
  document.documentElement.style.colorScheme = isDark ? "dark" : "light"
}

const subscribe = (callback: () => void) => {
  listeners.add(callback)

  return () => {
    listeners.delete(callback)
  }
}

const notify = (): void => listeners.forEach((listener) => listener())

export function initializeTheme(): void {
  if (typeof window === "undefined") return

  currentAppearance =
    (localStorage.getItem(STORAGE_KEY) as Appearance | null) ?? "system"
  applyTheme(currentAppearance)

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => applyTheme(currentAppearance))
}

export function useAppearance() {
  const appearance = useSyncExternalStore(
    subscribe,
    () => currentAppearance,
    () => "system" as Appearance,
  )

  const resolvedAppearance: ResolvedAppearance = isDarkMode(appearance)
    ? "dark"
    : "light"

  const updateAppearance = (mode: Appearance): void => {
    currentAppearance = mode
    localStorage.setItem(STORAGE_KEY, mode)
    applyTheme(mode)
    notify()
  }

  return { appearance, resolvedAppearance, updateAppearance }
}
