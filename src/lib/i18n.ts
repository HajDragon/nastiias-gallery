import { useCallback, useSyncExternalStore } from "react"
import en from "@/locales/en.json"
import uk from "@/locales/uk.json"

// Ported from the main project's lib/i18n.ts. There Laravel shares the
// dictionaries as page props; here they ship as JSON exported from lang/*/ui.php.

export type TranslationTree = {
  [key: string]: string | TranslationTree
}

export type TranslationReplacements = Record<string, string | number>

export const availableLocales = {
  en: "English",
  uk: "Українська",
} as const

export type Locale = keyof typeof availableLocales

const dictionaries: Record<Locale, TranslationTree> = { en, uk }
const fallbackLocale: Locale = "en"
const STORAGE_KEY = "locale"

const listeners = new Set<() => void>()

const isLocale = (value: string | null): value is Locale =>
  value !== null && value in availableLocales

let currentLocale: Locale = (() => {
  if (typeof window === "undefined") return fallbackLocale
  const stored = localStorage.getItem(STORAGE_KEY)
  return isLocale(stored) ? stored : fallbackLocale
})()

if (typeof document !== "undefined") document.documentElement.lang = currentLocale

export function setLocale(locale: Locale): void {
  currentLocale = locale
  localStorage.setItem(STORAGE_KEY, locale)
  document.documentElement.lang = locale
  listeners.forEach((listener) => listener())
}

const subscribe = (callback: () => void) => {
  listeners.add(callback)
  return () => {
    listeners.delete(callback)
  }
}

/**
 * Resolve a dot-notated translation key from a nested dictionary.
 */
function lookup(dictionary: TranslationTree | undefined, key: string): string | undefined {
  if (!dictionary) return undefined

  let value: string | TranslationTree | undefined = dictionary

  for (const segment of key.split(".")) {
    if (typeof value !== "object" || value === null) return undefined
    value = value[segment]
  }

  return typeof value === "string" ? value : undefined
}

/**
 * Replace `:placeholder` tokens with the provided values.
 */
function interpolate(value: string, replacements?: TranslationReplacements): string {
  if (!replacements) return value

  return value.replace(/:([a-zA-Z0-9_]+)/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(replacements, name) ? String(replacements[name]) : match,
  )
}

/**
 * Translate interface strings. Missing keys fall back to English before
 * returning the key itself, which keeps untranslated strings visible.
 */
export function useTranslation() {
  const locale = useSyncExternalStore(
    subscribe,
    () => currentLocale,
    () => fallbackLocale,
  )

  const t = useCallback(
    (key: string, replacements?: TranslationReplacements): string => {
      const value =
        lookup(dictionaries[locale], key) ?? lookup(dictionaries[fallbackLocale], key) ?? key

      return interpolate(value, replacements)
    },
    [locale],
  )

  return { t, locale }
}
