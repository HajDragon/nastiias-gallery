import { useSyncExternalStore } from "react"
import type { Comment, Passkey, User } from "@/types/auth"

// The prototype has no backend. This store stands in for the Laravel session,
// database and controllers of the main project, persisted in localStorage so
// a reload keeps the demo account, likes and comments.

type DemoState = {
  user: User | null
  // Registered accounts (email -> user + password) so login can check them.
  accounts: Record<string, { user: User; password: string }>
  passkeys: Passkey[]
  twoFactorPending: boolean
  likes: Record<string, boolean>
  likeCounts: Record<string, number>
  comments: Record<string, Comment[]>
}

const STORAGE_KEY = "nastiia-demo-state"

const initialState: DemoState = {
  user: null,
  accounts: {},
  passkeys: [],
  twoFactorPending: false,
  likes: {},
  likeCounts: {},
  comments: {},
}

const load = (): DemoState => {
  if (typeof window === "undefined") return initialState
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...initialState, ...(JSON.parse(raw) as Partial<DemoState>) } : initialState
  } catch {
    return initialState
  }
}

let state: DemoState = load()
const listeners = new Set<() => void>()

const subscribe = (callback: () => void) => {
  listeners.add(callback)
  return () => {
    listeners.delete(callback)
  }
}

export function setDemoState(update: (current: DemoState) => DemoState): void {
  state = update(state)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // shortcut: a large avatar data URL can exceed the localStorage quota; the
    // in-memory state still works until reload. Upgrade to IndexedDB if needed.
  }
  listeners.forEach((listener) => listener())
}

export function useDemoState(): DemoState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => initialState,
  )
}

export function getDemoState(): DemoState {
  return state
}

const now = () => new Date().toISOString()

export function makeUser(display_name: string, email: string): User {
  return {
    id: Date.now(),
    display_name,
    email,
    role: "user",
    locale: null,
    avatar: null,
    email_verified_at: null,
    notify_on_new_artwork: null,
    notify_on_contact_message: false,
    two_factor_enabled: false,
    created_at: now(),
    updated_at: now(),
  }
}

export function updateUser(patch: Partial<User>): void {
  setDemoState((current) => {
    if (!current.user) return current
    const previousEmail = current.user.email
    const user = { ...current.user, ...patch, updated_at: now() }
    const account = current.accounts[previousEmail]
    if (!account) return { ...current, user }

    // Accounts are keyed by email, so an email change moves the entry.
    const accounts = { ...current.accounts }
    delete accounts[previousEmail]
    accounts[user.email] = { ...account, user }
    return { ...current, user, accounts }
  })
}

export function logout(): void {
  setDemoState((current) => ({ ...current, user: null, twoFactorPending: false }))
}
