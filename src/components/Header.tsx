import { LogOut, Menu, Settings, X } from "lucide-react"
import { useState } from "react"
import type { MouseEvent } from "react"
import LanguageSwitcher from "@/components/language-switcher"
import ThemeToggle from "@/components/ThemeToggle"
import Sheet from "@/components/ui/sheet"
import { Avatar, DropdownMenu, dropdownItemClass } from "@/components/ui/primitives"
import { useAppearance } from "@/hooks/use-appearance"
import { useInitials } from "@/hooks/use-initials"
import { logout, useDemoState } from "@/lib/demo-store"
import { useTranslation } from "@/lib/i18n"
import { navigate, routes, useRoute } from "@/lib/router"
import type { User } from "@/types/auth"

function AccountMenuItems({ user, close }: { user: User; close: () => void }) {
  const { t } = useTranslation()

  return (
    <>
      <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
        <span className="font-medium">{user.display_name}</span>
        <span className="text-xs text-muted-foreground">{user.email}</span>
      </div>
      <div className="-mx-1 my-1 h-px bg-border" />
      <a href={routes.profile} onClick={close} className={dropdownItemClass} role="menuitem">
        <Settings className="mr-2 size-4" />
        {t("nav.settings")}
      </a>
      <div className="-mx-1 my-1 h-px bg-border" />
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          close()
          logout()
          navigate("home")
        }}
        className={`${dropdownItemClass} text-destructive`}
      >
        <LogOut className="mr-2 size-4" />
        {t("nav.log_out")}
      </button>
    </>
  )
}

export default function Header() {
  const route = useRoute()
  const { t } = useTranslation()
  const { resolvedAppearance, updateAppearance } = useAppearance()
  const { user } = useDemoState()
  const getInitials = useInitials()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isHome = route === "home"
  const isGallery = route === "gallery"

  const scrollToContact = (event: MouseEvent<Element>) => {
    const target = document.getElementById("contact")
    if (!target) return
    event.preventDefault()
    target.scrollIntoView({ behavior: "smooth" })
    setMobileMenuOpen(false)
  }

  const toggleTheme = (checked: boolean) => updateAppearance(checked ? "dark" : "light")

  const navigationLinks = [
    { href: routes.home, label: t("nav.home"), active: isHome },
    { href: routes.gallery, label: t("nav.gallery"), active: isGallery },
    { href: "#contact", label: t("nav.contact"), active: false, onClick: scrollToContact },
  ]

  const avatar = (size: string) =>
    user && (
      <Avatar
        src={user.avatar}
        alt={user.display_name}
        className={size}
        fallback={getInitials(user.display_name)}
        fallbackClassName="rounded-lg bg-neutral-200 text-black"
      />
    )

  return (
    <>
      {/* Mobile header with left sidebar */}
      <header className="border-b border-border/15 bg-header text-header-foreground lg:hidden">
        <div className="grid h-16 w-full grid-cols-[1fr_auto_1fr] items-center sm:h-20 md:h-24">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="grid size-10 place-items-center justify-self-start rounded-md transition-colors hover:bg-header-foreground/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-header-foreground"
            aria-label={t("nav.menu")}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>

          <a href={routes.home} className="flex min-w-0 items-center justify-self-center" aria-label={t("nav.home")}>
            <img
              src="/nastias-gallery-logo.png"
              alt=""
              width={1067}
              height={772}
              className="h-12 w-auto max-w-[55vw] object-contain object-center invert sm:h-16 md:h-20"
            />
          </a>

          <div className="w-10" aria-hidden="true" />
        </div>

        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} label={t("nav.main")}>
          <nav className="flex flex-1 flex-col overflow-y-auto px-4 py-6" aria-label={t("nav.main")}>
            <div className="flex items-center gap-3 px-2 pb-2">
              <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-header">
                <img src="/nastias-gallery-logo.png" alt="" className="h-6 w-auto object-contain invert" />
              </span>
              <span className="min-w-0 truncate font-display text-lg tracking-tight text-foreground">nastia.gallery</span>
            </div>

            {user ? (
              <DropdownMenu
                align="start"
                className="w-56"
                trigger={(props) => (
                  <button
                    type="button"
                    {...props}
                    className="flex w-full items-center justify-start gap-3 rounded-lg px-4 py-3 text-sm font-medium text-foreground hover:bg-accent"
                  >
                    {avatar("size-8")}
                    <span className="flex-1 truncate text-left">{user.display_name}</span>
                  </button>
                )}
              >
                {(close) => (
                  <AccountMenuItems
                    user={user}
                    close={() => {
                      close()
                      setMobileMenuOpen(false)
                    }}
                  />
                )}
              </DropdownMenu>
            ) : (
              <a
                href={routes.login}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
              >
                {t("nav.account")}
              </a>
            )}

            <div className="mt-2 flex items-center justify-between gap-4 border-t border-border/15 pt-4">
              <span className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                {t("settings.appearance")}
              </span>
              <ThemeToggle
                checked={resolvedAppearance === "dark"}
                onChange={toggleTheme}
                label={t("settings.appearance")}
                size={11}
              />
            </div>
            <div className="mt-3">
              <LanguageSwitcher />
            </div>

            <div className="mt-4 flex flex-col space-y-2">
              {navigationLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={link.onClick ?? (() => setMobileMenuOpen(false))}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    link.active ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-accent hover:text-foreground"
                  }`}
                  aria-current={link.active ? "page" : undefined}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </nav>
        </Sheet>
      </header>

      {/* Desktop header */}
      <header className="hidden border-b border-border/15 bg-header text-header-foreground lg:flex">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-4 px-5 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-8 lg:px-12">
          <a href={routes.home} className="flex shrink-0" aria-label={t("nav.home")}>
            <img
              src="/nastias-gallery-logo.png"
              alt=""
              width={1067}
              height={772}
              className="m-0 h-[5.6rem] w-auto max-w-[60vw] object-contain object-center invert sm:h-28"
            />
          </a>
          <nav
            className="flex w-full min-w-0 items-center justify-end gap-1 rounded-full border border-border/15 p-1 sm:w-auto sm:gap-2"
            aria-label={t("nav.main")}
          >
            {navigationLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={link.onClick}
                className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold tracking-[0.14em] whitespace-nowrap uppercase transition-colors sm:px-5 sm:py-2.5 sm:text-sm ${
                  link.active ? "bg-header-foreground text-header" : "hover:bg-header-foreground/10"
                }`}
                aria-current={link.active ? "page" : undefined}
              >
                {link.label}
              </a>
            ))}
            {user ? (
              <DropdownMenu
                className="w-56"
                trigger={(props) => (
                  <button
                    type="button"
                    {...props}
                    className="grid size-10 place-items-center rounded-full p-1 transition-colors hover:bg-header-foreground/10"
                    aria-label={user.display_name}
                  >
                    {avatar("size-8")}
                  </button>
                )}
              >
                {(close) => <AccountMenuItems user={user} close={close} />}
              </DropdownMenu>
            ) : (
              <a
                href={routes.login}
                className="shrink-0 rounded-full px-3 py-2 text-xs font-semibold tracking-[0.14em] whitespace-nowrap uppercase transition-colors hover:bg-header-foreground/10 sm:px-5 sm:py-2.5 sm:text-sm"
              >
                {t("nav.account")}
              </a>
            )}

            <LanguageSwitcher className="sm:ml-1" />
            <div className="flex shrink-0 items-center sm:ml-1">
              <ThemeToggle
                checked={resolvedAppearance === "dark"}
                onChange={toggleTheme}
                label={t("settings.appearance")}
                size={10}
              />
            </div>
          </nav>
        </div>
      </header>
    </>
  )
}
