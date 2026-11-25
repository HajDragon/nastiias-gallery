// Same shapes as the main project's types/auth.ts.
export type User = {
  id: number
  display_name: string
  email: string
  role: "user" | "admin" | "super_admin"
  locale?: string | null
  avatar?: string | null
  email_verified_at: string | null
  notify_on_new_artwork: boolean | null
  notify_on_contact_message: boolean
  two_factor_enabled?: boolean
  created_at: string
  updated_at: string
}

export type Passkey = {
  id: number
  name: string
  authenticator: string | null
  created_at_diff: string
  last_used_at_diff: string | null
}

export type Comment = {
  id: number
  body: string
  user: { display_name: string; avatar: string | null }
  created_at: string | null
}
