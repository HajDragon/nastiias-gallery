import { useEffect, useState } from "react"
import ArtworkModal from "@/components/artwork-modal"
import ContactFooter from "@/components/ContactFooter"
import Header from "@/components/Header"
import NewArtworkOptIn from "@/components/new-artwork-opt-in"
import Toaster from "@/components/toaster"
import { useDemoState } from "@/lib/demo-store"
import { navigate, routes, useRoute, type Route } from "@/lib/router"
import ConfirmPassword, { PASSWORD_CONFIRMED_KEY } from "@/pages/auth/confirm-password"
import ForgotPassword from "@/pages/auth/forgot-password"
import Login from "@/pages/auth/login"
import Register from "@/pages/auth/register"
import ResetPassword from "@/pages/auth/reset-password"
import TwoFactorChallenge from "@/pages/auth/two-factor-challenge"
import VerifyEmail from "@/pages/auth/verify-email"
import Gallery from "@/pages/gallery"
import Home from "@/pages/home"
import Appearance from "@/pages/settings/appearance"
import Profile from "@/pages/settings/profile"
import Security from "@/pages/settings/security"
import type { Artwork } from "@/types/artwork"

// Same rules as the main project's route middleware: guests only on the
// login/register pages, auth on settings, and a fresh password confirmation
// (3 hours, Laravel's default) before the security page.
const guestOnly: Route[] = ["login", "register", "forgotPassword", "resetPassword", "twoFactorChallenge"]
const authOnly: Route[] = ["verifyEmail", "profile", "security", "appearance", "confirmPassword"]
const PASSWORD_TIMEOUT_MS = 3 * 60 * 60 * 1000

function redirectFor(route: Route, signedIn: boolean): Route | null {
  // A navigate() that has not fired its hashchange yet wins over the guards,
  // e.g. login sets the user and then moves on to the next page.
  if (window.location.hash.split("?")[0] !== routes[route] && !(route === "home" && window.location.hash === "")) return null
  if (signedIn && guestOnly.includes(route)) return "home"
  if (!signedIn && authOnly.includes(route)) return "login"
  if (route === "twoFactorChallenge" && !sessionStorage.getItem("nastia-demo-2fa-email")) return "login"
  if (route === "security") {
    const confirmedAt = Number(sessionStorage.getItem(PASSWORD_CONFIRMED_KEY) ?? 0)
    if (Date.now() - confirmedAt > PASSWORD_TIMEOUT_MS) return "confirmPassword"
  }
  return null
}

export default function App() {
  const route = useRoute()
  const { user } = useDemoState()
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)
  const redirect = redirectFor(route, user !== null)

  useEffect(() => {
    if (redirect) navigate(redirect)
  }, [redirect])

  if (redirect) return null

  const page = (() => {
    switch (route) {
      case "login":
        return <Login />
      case "register":
        return <Register />
      case "forgotPassword":
        return <ForgotPassword />
      case "resetPassword":
        return <ResetPassword />
      case "verifyEmail":
        return <VerifyEmail />
      case "twoFactorChallenge":
        return <TwoFactorChallenge />
      case "confirmPassword":
        return <ConfirmPassword />
      case "profile":
        return <Profile user={user!} />
      case "security":
        return <Security user={user!} />
      case "appearance":
        return <Appearance />
      default:
        return (
          <div className="min-h-screen bg-background text-foreground">
            <Header />
            {route === "gallery" ? <Gallery onSelect={setSelectedArtwork} /> : <Home onSelect={setSelectedArtwork} />}
            <ContactFooter />
          </div>
        )
    }
  })()

  return (
    <>
      <NewArtworkOptIn />
      {page}
      {selectedArtwork && <ArtworkModal artwork={selectedArtwork} onClose={() => setSelectedArtwork(null)} />}
      <Toaster />
    </>
  )
}
