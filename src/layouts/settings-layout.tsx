import type { ReactNode } from "react"
import Header from "@/components/Header"
import { useTranslation } from "@/lib/i18n"
import { routes, useRoute, type Route } from "@/lib/router"

// Port of layouts/site-layout.tsx + layouts/settings/layout.tsx.
const sidebarNavItems: { title: string; route: Route }[] = [
  { title: "settings.profile", route: "profile" },
  { title: "settings.security", route: "security" },
  { title: "settings.appearance", route: "appearance" },
]

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const route = useRoute()
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main id="top" className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 sm:py-12 lg:px-12">
        <div className="py-2">
          <header className="mb-8 space-y-2">
            <h1 className="font-display text-[clamp(2.25rem,6vw,3.5rem)] leading-[0.95] tracking-[-0.04em]">
              {t("settings.heading_prefix")} <span className="text-primary-blue italic">{t("settings.heading_accent")}</span>
            </h1>
            <p className="max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">{t("settings.description")}</p>
          </header>

          <div className="flex flex-col gap-6 lg:flex-row lg:gap-12">
            <aside className="lg:w-48 lg:shrink-0">
              <nav className="flex flex-wrap gap-2 lg:flex-col lg:items-start" aria-label={t("settings.title")}>
                {sidebarNavItems.map((item) => {
                  const active = route === item.route

                  return (
                    <a
                      key={item.route}
                      href={routes[item.route]}
                      aria-current={active ? "page" : undefined}
                      className={`shrink-0 rounded-full border px-4 py-2 text-[10px] font-semibold tracking-[0.15em] uppercase transition-colors sm:text-[11px] ${
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-foreground hover:border-primary-blue hover:bg-primary-blue/20"
                      }`}
                    >
                      {t(item.title)}
                    </a>
                  )
                })}
              </nav>
            </aside>

            <div className="min-w-0 flex-1">
              <section className="max-w-2xl space-y-10 rounded-xl border border-border bg-card p-6 text-card-foreground sm:p-8">
                {children}
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
