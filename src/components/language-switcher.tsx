import { Languages } from "lucide-react"
import { availableLocales, setLocale, useTranslation, type Locale } from "@/lib/i18n"
import { cn } from "@/lib/utils"

const shortLabels: Record<string, string> = {
  en: "EN",
  uk: "UA",
}

export default function LanguageSwitcher({ className }: { className?: string }) {
  const { t, locale } = useTranslation()

  return (
    <div
      className={cn(
        "lang-switcher flex shrink-0 items-center gap-0.5 rounded-full border border-[var(--ls-border)]/30 bg-[var(--ls-bg)] p-1",
        className,
      )}
      role="group"
      aria-label={t("common.language")}
    >
      <Languages className="ml-1.5 h-3.5 w-3.5 text-[var(--ls-fg)]/60" aria-hidden="true" />
      {(Object.keys(availableLocales) as Locale[]).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => code !== locale && setLocale(code)}
          aria-pressed={locale === code}
          aria-label={availableLocales[code]}
          title={availableLocales[code]}
          className={cn(
            "rounded-full px-2 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase transition-colors",
            locale === code
              ? "bg-[var(--ls-accent)] text-[var(--ls-accent-fg)]"
              : "text-[var(--ls-fg)]/60 hover:bg-[var(--ls-accent)]/20 hover:text-[var(--ls-fg)]",
          )}
        >
          {shortLabels[code] ?? code.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
