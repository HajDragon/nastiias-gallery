import { useState } from "react"
import type { MouseEvent } from "react"
import Sheet from "./ui/sheet"
import ThemeToggle from "./ThemeToggle"
import { useAppearance } from "../lib/appearance"

type HeaderProps = {
  page: "home" | "gallery"
}

const navigationLinks = [
  { href: "#top", label: "Home" },
  { href: "#gallery", label: "Gallery" },
  { href: "#contact", label: "Contact us" },
] as const

export default function Header({ page }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { resolvedAppearance, updateAppearance } = useAppearance()

  const closeMenu = () => setMobileMenuOpen(false)

  const scrollToContact = (event: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById("contact")
    if (target) {
      event.preventDefault()
      target.scrollIntoView({ behavior: "smooth" })
    }
    closeMenu()
  }

  const isActive = (href: string) =>
    (href === "#top" && page === "home") ||
    (href === "#gallery" && page === "gallery")

  const toggleTheme = (checked: boolean) =>
    updateAppearance(checked ? "dark" : "light")

  return (
    <>
      {/* Mobile header with left sidebar */}
      <header className="border-b border-border/15 bg-header text-header-foreground lg:hidden">
        <Sheet
          open={mobileMenuOpen}
          onOpenChange={setMobileMenuOpen}
          label="Main menu"
        >
          <div className="grid h-16 w-full grid-cols-[1fr_auto_1fr] items-center sm:h-20 md:h-24">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="grid size-10 place-items-center justify-self-start rounded-md transition-colors hover:bg-header-foreground/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-header-foreground"
              aria-label="Open menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
                  <path
                    d="M18 6 6 18M6 6l12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
                  <path
                    d="M4 6h16M4 12h16M4 18h16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>

            <a
              href="#top"
              onClick={closeMenu}
              className="flex min-w-0 items-center justify-self-center"
              aria-label="Nastiia's Gallery home"
            >
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

          <nav
            className="flex flex-1 flex-col overflow-y-auto px-4 py-6"
            aria-label="Main"
          >
            <div className="flex items-center gap-3 px-2 pb-2">
              <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-header">
                <img
                  src="/nastias-gallery-logo.png"
                  alt=""
                  className="h-6 w-auto object-contain invert"
                />
              </span>
              <span className="min-w-0 truncate font-display text-lg tracking-tight text-foreground">
                nastiia.gallery
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between gap-4 border-t border-border/15 pt-4">
              <span className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                Appearance
              </span>
              <ThemeToggle
                checked={resolvedAppearance === "dark"}
                onChange={toggleTheme}
                size={11}
              />
            </div>

            <div className="mt-4 flex flex-col space-y-2">
              {navigationLinks.map((link) => {
                const active = isActive(link.href)

                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={
                      link.href === "#contact" ? scrollToContact : closeMenu
                    }
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground/70 hover:bg-accent hover:text-foreground"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    {link.label}
                  </a>
                )
              })}
            </div>
          </nav>
        </Sheet>
      </header>

      {/* Desktop header */}
      <header className="hidden border-b border-border/15 bg-header text-header-foreground lg:flex">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-4 px-5 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-8 lg:px-12">
          <a
            href="#top"
            className="flex shrink-0"
            aria-label="Nastiia's Gallery home"
          >
            <img
              src="/nastias-gallery-logo.png"
              alt=""
              width={1067}
              height={772}
              className="m-0 h-[5.6rem] w-auto max-w-[60vw] object-contain object-center invert sm:h-28"
            />
          </a>
          <nav
            className="flex w-full min-w-0 items-center justify-end gap-1 overflow-x-auto rounded-full border border-border/15 p-1 [scrollbar-width:none] sm:w-auto sm:gap-2 [&::-webkit-scrollbar]:hidden"
            aria-label="Main"
          >
            {navigationLinks.map((link) => {
              const active = isActive(link.href)

              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={
                    link.href === "#contact" ? scrollToContact : undefined
                  }
                  className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold tracking-[0.14em] whitespace-nowrap uppercase transition-colors sm:px-5 sm:py-2.5 sm:text-sm ${
                    active
                      ? "bg-header-foreground text-header"
                      : "hover:bg-header-foreground/10"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                </a>
              )
            })}
            <div className="ml-auto flex shrink-0 items-center pl-1 sm:ml-1">
              <ThemeToggle
                checked={resolvedAppearance === "dark"}
                onChange={toggleTheme}
                size={10}
              />
            </div>
          </nav>
        </div>
      </header>
    </>
  )
}
