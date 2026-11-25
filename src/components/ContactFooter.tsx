import { useState, type FormEvent } from "react"
import { delay } from "@/lib/demo-auth"
import { useTranslation } from "@/lib/i18n"

const empty = { name: "", email: "", message: "", consent: false }

const inputClass =
  "rounded-lg border border-[#F0F7FF]/20 bg-white px-4 py-3 text-base tracking-normal text-[#293241] normal-case outline-none transition-colors placeholder:text-[#293241]/40 focus:border-primary-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue dark:border-border dark:bg-background dark:text-foreground dark:placeholder:text-muted-foreground/60"

const labelClass =
  "grid gap-2 text-[10px] font-semibold tracking-[0.18em] text-[#F0F7FF] uppercase dark:text-card-foreground"

export default function ContactFooter() {
  const { t } = useTranslation()
  const [data, setData] = useState(empty)
  const [processing, setProcessing] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const set = <K extends keyof typeof empty>(key: K, value: (typeof empty)[K]) => setData((current) => ({ ...current, [key]: value }))

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setProcessing(true)
    // The main project stores the message and emails the admins; the
    // prototype has no backend, so it only simulates the round trip.
    await delay(700)
    setProcessing(false)
    setData(empty)
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 4000)
  }

  return (
    <footer
      id="contact"
      className="border-t border-transparent bg-header text-header-foreground dark:border-border dark:bg-card dark:text-card-foreground"
    >
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-12 lg:py-20">
        <div className="flex flex-col justify-between gap-10">
          <div>
            <p className="mb-4 text-[10px] font-semibold tracking-[0.22em] text-primary-blue uppercase">{t("contact.eyebrow")}</p>
            <h2 className="max-w-md font-display text-4xl leading-[0.95] tracking-[-0.04em] sm:text-5xl lg:text-6xl">{t("contact.title")}</h2>
            <p className="mt-5 max-w-sm text-sm leading-6 text-[#F0F7FF]/65 dark:text-muted-foreground">{t("contact.body")}</p>
          </div>
        </div>

        <form className="grid gap-6" aria-label={t("contact.aria_form")} onSubmit={submit}>
          <div className="grid gap-6 sm:grid-cols-2">
            <label className={labelClass}>
              {t("contact.name")}
              <input
                type="text"
                name="name"
                value={data.name}
                onChange={(event) => set("name", event.target.value)}
                maxLength={255}
                autoComplete="name"
                required
                placeholder={t("contact.your_name")}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              {t("contact.email")}
              <input
                type="email"
                name="email"
                value={data.email}
                onChange={(event) => set("email", event.target.value)}
                maxLength={255}
                autoComplete="email"
                required
                placeholder="you@example.com"
                className={inputClass}
              />
            </label>
          </div>
          <label className={labelClass}>
            {t("contact.message")}
            <textarea
              name="message"
              value={data.message}
              onChange={(event) => set("message", event.target.value)}
              maxLength={10000}
              required
              rows={4}
              placeholder={t("contact.message_placeholder")}
              className={`resize-none leading-6 ${inputClass}`}
            />
          </label>
          <label className="flex items-start gap-3 text-xs leading-5 text-[#F0F7FF]/75 dark:text-muted-foreground">
            <input
              type="checkbox"
              name="consent"
              checked={data.consent}
              onChange={(event) => set("consent", event.target.checked)}
              required
              className="mt-0.5 h-4 w-4 shrink-0 accent-primary-blue"
            />
            <span>{t("contact.consent")}</span>
          </label>
          {submitted && (
            <p role="status" className="text-sm text-primary-blue">
              {t("contact.submitted")}
            </p>
          )}
          <button
            type="submit"
            disabled={processing}
            className="mt-2 flex w-full items-center justify-between rounded-full bg-primary-blue px-6 py-4 text-xs font-semibold tracking-[0.18em] text-primary-on-blue uppercase transition-colors hover:bg-white hover:text-[#293241] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-blue disabled:opacity-60 sm:w-auto sm:min-w-52 dark:hover:bg-primary-blue/80 dark:hover:text-primary-on-blue"
          >
            {processing ? t("contact.sending") : t("contact.send")}
            <span aria-hidden="true">→</span>
          </button>
        </form>
      </div>
    </footer>
  )
}
