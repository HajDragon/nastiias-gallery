import QRCode from "qrcode"
import { getDemoState, makeUser, setDemoState, updateUser } from "@/lib/demo-store"
import type { Passkey, User } from "@/types/auth"

// Client-side stand-ins for the main project's Fortify / passkey endpoints.
// Errors are translation keys under `demo.*`.

export type Result = { ok: true } | { ok: false; error: string; field?: string }

const ok: Result = { ok: true }
const fail = (error: string, field?: string): Result => ({ ok: false, error, field })

/** Resolve after a short delay so the ported spinners and disabled states show. */
export const delay = (ms = 450) => new Promise((resolve) => setTimeout(resolve, ms))

const secrets: Record<string, { secret: string; confirmed: boolean; recovery: string[] }> = (() => {
  try {
    return JSON.parse(localStorage.getItem("nastia-demo-2fa") ?? "{}")
  } catch {
    return {}
  }
})()
const saveSecrets = () => localStorage.setItem("nastia-demo-2fa", JSON.stringify(secrets))

export function login(email: string, password: string): Result | "two-factor" {
  const account = getDemoState().accounts[email.trim().toLowerCase()]
  if (!account || account.password !== password) return fail("demo.credentials_failed", "email")

  if (account.user.two_factor_enabled) {
    setDemoState((current) => ({ ...current, twoFactorPending: true, user: null }))
    sessionStorage.setItem("nastia-demo-2fa-email", account.user.email)
    return "two-factor"
  }

  setDemoState((current) => ({ ...current, user: account.user }))
  return ok
}

export function register(display_name: string, email: string, password: string, confirmation: string): Result {
  const key = email.trim().toLowerCase()
  if (getDemoState().accounts[key]) return fail("demo.email_taken", "email")
  if (password.length < 8) return fail("demo.password_short", "password")
  if (password !== confirmation) return fail("demo.password_mismatch", "password_confirmation")

  const user = makeUser(display_name.trim(), key)
  setDemoState((current) => ({ ...current, user, accounts: { ...current.accounts, [key]: { user, password } } }))
  return ok
}

export function checkPassword(password: string): boolean {
  const { user, accounts } = getDemoState()
  return !!user && accounts[user.email]?.password === password
}

export function updatePassword(current: string, password: string, confirmation: string): Result {
  if (!checkPassword(current)) return fail("demo.password_incorrect", "current_password")
  if (password.length < 8) return fail("demo.password_short", "password")
  if (password !== confirmation) return fail("demo.password_mismatch", "password_confirmation")

  setDemoState((state) => {
    const email = state.user!.email
    return { ...state, accounts: { ...state.accounts, [email]: { ...state.accounts[email], password } } }
  })
  return ok
}

export function resetPassword(email: string, password: string, confirmation: string): Result {
  const key = email.trim().toLowerCase()
  if (!getDemoState().accounts[key]) return fail("demo.credentials_failed", "email")
  if (password.length < 8) return fail("demo.password_short", "password")
  if (password !== confirmation) return fail("demo.password_mismatch", "password_confirmation")

  setDemoState((state) => ({ ...state, accounts: { ...state.accounts, [key]: { ...state.accounts[key], password } } }))
  return ok
}

export function deleteAccount(password: string): Result {
  if (!checkPassword(password)) return fail("demo.password_incorrect", "password")

  setDemoState((state) => {
    const accounts = { ...state.accounts }
    delete accounts[state.user!.email]
    return { ...state, user: null, accounts }
  })
  return ok
}

// --- Two-factor authentication (real RFC 6238 TOTP, checked in the browser) ---

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"

function randomBase32(length = 32): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(bytes, (byte) => BASE32[byte % 32]).join("")
}

function base32ToBytes(input: string): Uint8Array<ArrayBuffer> {
  let bits = ""
  for (const char of input.replace(/=+$/, "")) bits += BASE32.indexOf(char).toString(2).padStart(5, "0")
  const bytes = new Uint8Array(Math.floor(bits.length / 8))
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(bits.slice(i * 8, i * 8 + 8), 2)
  return bytes
}

async function totp(secret: string, counter: number): Promise<string> {
  const key = await crypto.subtle.importKey("raw", base32ToBytes(secret), { name: "HMAC", hash: "SHA-1" }, false, ["sign"])
  const message = new ArrayBuffer(8)
  new DataView(message).setBigUint64(0, BigInt(counter))
  const hmac = new Uint8Array(await crypto.subtle.sign("HMAC", key, message))
  const offset = hmac[hmac.length - 1] & 0xf
  const code = ((hmac[offset] & 0x7f) << 24) | (hmac[offset + 1] << 16) | (hmac[offset + 2] << 8) | hmac[offset + 3]
  return String(code % 1_000_000).padStart(6, "0")
}

async function verifyTotp(secret: string, code: string): Promise<boolean> {
  const step = Math.floor(Date.now() / 30_000)
  // Accept one step of clock drift either way, like Fortify's default window.
  for (const drift of [-1, 0, 1]) if ((await totp(secret, step + drift)) === code) return true
  return false
}

const makeRecoveryCodes = () =>
  Array.from({ length: 8 }, () => `${randomBase32(10).toLowerCase()}-${randomBase32(10).toLowerCase()}`)

export function twoFactorState(email: string) {
  return secrets[email]
}

export async function enableTwoFactor(user: User): Promise<{ svg: string; key: string }> {
  const existing = secrets[user.email]
  const secret = existing && !existing.confirmed ? existing.secret : randomBase32()
  secrets[user.email] = { secret, confirmed: false, recovery: existing?.recovery ?? makeRecoveryCodes() }
  saveSecrets()

  const uri = `otpauth://totp/${encodeURIComponent(`nastia.gallery:${user.email}`)}?secret=${secret}&issuer=nastia.gallery`
  const svg = await QRCode.toString(uri, { type: "svg", margin: 0 })
  return { svg, key: secret }
}

export async function confirmTwoFactor(user: User, code: string): Promise<Result> {
  const entry = secrets[user.email]
  if (!entry || !(await verifyTotp(entry.secret, code))) return fail("demo.code_invalid", "code")

  entry.confirmed = true
  saveSecrets()
  updateUser({ two_factor_enabled: true })
  return ok
}

export function disableTwoFactor(user: User): void {
  delete secrets[user.email]
  saveSecrets()
  updateUser({ two_factor_enabled: false })
}

export function recoveryCodes(user: User): string[] {
  return secrets[user.email]?.recovery ?? []
}

export function regenerateRecoveryCodes(user: User): string[] {
  const entry = secrets[user.email]
  if (!entry) return []
  entry.recovery = makeRecoveryCodes()
  saveSecrets()
  return entry.recovery
}

export async function twoFactorChallenge(input: { code?: string; recovery_code?: string }): Promise<Result> {
  const email = sessionStorage.getItem("nastia-demo-2fa-email") ?? ""
  const account = getDemoState().accounts[email]
  const entry = secrets[email]
  if (!account || !entry) return fail("demo.credentials_failed", "code")

  if (input.recovery_code !== undefined) {
    const index = entry.recovery.indexOf(input.recovery_code.trim())
    if (index === -1) return fail("demo.recovery_invalid", "recovery_code")
    entry.recovery.splice(index, 1)
    saveSecrets()
  } else if (!(await verifyTotp(entry.secret, input.code ?? ""))) {
    return fail("demo.code_invalid", "code")
  }

  sessionStorage.removeItem("nastia-demo-2fa-email")
  setDemoState((current) => ({ ...current, user: account.user, twoFactorPending: false }))
  return ok
}

// --- Passkeys (WebAuthn in the browser; without a server the signature is
// not verified, so this only demonstrates the flow) ---

export const passkeysSupported = () => typeof window !== "undefined" && "PublicKeyCredential" in window

const toBase64 = (buffer: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buffer)))
const fromBase64 = (value: string) => Uint8Array.from(atob(value), (char) => char.charCodeAt(0))

type StoredPasskey = Passkey & { credentialId: string; email: string; createdAt: number; lastUsedAt: number | null }

const storedPasskeys = (): StoredPasskey[] => {
  try {
    return JSON.parse(localStorage.getItem("nastia-demo-passkeys") ?? "[]")
  } catch {
    return []
  }
}
const savePasskeys = (list: StoredPasskey[]) => localStorage.setItem("nastia-demo-passkeys", JSON.stringify(list))

export function listPasskeys(user: User, relative: (ms: number) => string): Passkey[] {
  return storedPasskeys()
    .filter((item) => item.email === user.email)
    .map((item) => ({
      ...item,
      created_at_diff: relative(item.createdAt),
      last_used_at_diff: item.lastUsedAt ? relative(item.lastUsedAt) : null,
    }))
}

export async function registerPasskey(user: User, name: string): Promise<void> {
  const credential = (await navigator.credentials.create({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rp: { name: "nastia.gallery" },
      user: { id: new TextEncoder().encode(user.email), name: user.email, displayName: user.display_name },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },
        { type: "public-key", alg: -257 },
      ],
      authenticatorSelection: { residentKey: "preferred", userVerification: "preferred" },
    },
  })) as PublicKeyCredential | null
  if (!credential) throw new Error("cancelled")

  const list = storedPasskeys()
  list.push({
    id: Date.now(),
    name,
    authenticator: null,
    created_at_diff: "",
    last_used_at_diff: null,
    credentialId: toBase64(credential.rawId),
    email: user.email,
    createdAt: Date.now(),
    lastUsedAt: null,
  })
  savePasskeys(list)
}

export function deletePasskey(id: number): void {
  savePasskeys(storedPasskeys().filter((item) => item.id !== id))
}

/** Sign in (or confirm) with any passkey registered in this browser. */
export async function verifyPasskey(): Promise<Result> {
  const list = storedPasskeys()
  if (list.length === 0) return fail("demo.passkey_none")

  const assertion = (await navigator.credentials.get({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      allowCredentials: list.map((item) => ({ type: "public-key" as const, id: fromBase64(item.credentialId) })),
      userVerification: "preferred",
    },
  })) as PublicKeyCredential | null
  const match = assertion && list.find((item) => item.credentialId === toBase64(assertion.rawId))
  const account = match && getDemoState().accounts[match.email]
  if (!match || !account) return fail("demo.passkey_none")

  match.lastUsedAt = Date.now()
  savePasskeys(list)
  setDemoState((current) => ({ ...current, user: account.user }))
  return ok
}
