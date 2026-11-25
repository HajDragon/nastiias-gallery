import type { ReactNode } from "react"
import { useTranslation } from "@/lib/i18n"
import { routes } from "@/lib/router"

// Port of layouts/auth-layout.tsx + layouts/auth/auth-simple-layout.tsx.
export default function AuthLayout({
  title = "",
  description = "",
  children,
}: {
  title?: string
  description?: string
  children: ReactNode
}) {
  const { t } = useTranslation()
  const heading = title ? t(title) : ""

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col items-center gap-4">
            <a href={routes.home} className="flex flex-col items-center gap-2">
              <img src="/nastias-gallery-logo.png" alt={heading} className="h-28 w-auto dark:invert" />
              <span className="sr-only">{heading}</span>
            </a>

            <div className="space-y-2 text-center">
              <h1 className="font-display text-2xl text-foreground">{heading}</h1>
              <p className="text-center text-sm text-muted-foreground">{description ? t(description) : ""}</p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">{children}</div>
        </div>
      </div>
    </div>
  )
}
