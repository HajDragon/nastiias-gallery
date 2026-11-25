import { useEffect, useState } from "react"

// Hash routes stand in for the main project's Laravel routes, because the
// prototype is a static Vite build without a server router.
export const routes = {
  home: "#top",
  gallery: "#gallery",
  login: "#login",
  register: "#register",
  forgotPassword: "#forgot-password",
  resetPassword: "#reset-password",
  verifyEmail: "#verify-email",
  twoFactorChallenge: "#two-factor-challenge",
  confirmPassword: "#confirm-password",
  profile: "#settings/profile",
  security: "#settings/security",
  appearance: "#settings/appearance",
} as const

export type Route = keyof typeof routes

const byHash = Object.fromEntries(
  Object.entries(routes).map(([name, hash]) => [hash, name as Route]),
) as Record<string, Route>

const routeFromHash = (hash: string): Route | null => {
  if (hash === "" || hash === "#") return "home"
  return byHash[hash.split("?")[0]] ?? null
}

export function navigate(route: Route): void {
  window.location.hash = routes[route]
}

/** Hash query parameters, e.g. `#reset-password?email=a@b.c`. */
export function hashParams(): URLSearchParams {
  return new URLSearchParams(window.location.hash.split("?")[1] ?? "")
}

/**
 * Current page. Hashes that are not routes (#contact, #art-library) only
 * scroll, so they keep the page that is already showing.
 */
export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(
    () => (typeof window === "undefined" ? "home" : (routeFromHash(window.location.hash) ?? "home")),
  )

  useEffect(() => {
    const sync = () => {
      const next = routeFromHash(window.location.hash)
      if (next) {
        setRoute(next)
        if (next !== "home" && next !== "gallery") window.scrollTo(0, 0)
      }
    }

    window.addEventListener("hashchange", sync)
    return () => window.removeEventListener("hashchange", sync)
  }, [])

  return route
}
