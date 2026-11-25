import { Mail } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { updateUser, useDemoState } from "@/lib/demo-store"
import { useTranslation } from "@/lib/i18n"
import { toast } from "@/lib/toast"

/**
 * Small consent card asking logged-in users whether they want to receive an
 * email whenever a new artwork is uploaded. Shown only to users who have not
 * made a choice yet (notify_on_new_artwork === null).
 */
export default function NewArtworkOptIn() {
  const { user } = useDemoState()
  const { t } = useTranslation()
  const undecided = user?.notify_on_new_artwork === null
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!undecided) {
      setVisible(false)
      return
    }

    // Give the page a moment to settle before the card slides in.
    const timer = setTimeout(() => setVisible(true), 1200)
    return () => clearTimeout(timer)
  }, [undecided])

  const respond = (subscribed: boolean) => {
    updateUser({ notify_on_new_artwork: subscribed })
    setVisible(false)
    toast.success(subscribed ? t("notifications.subscribed") : t("notifications.unsubscribed"))
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label={t("notifications.new_artwork_aria")}
      aria-live="polite"
      className="fixed right-4 bottom-4 z-[70] w-[calc(100vw-2rem)] max-w-sm"
    >
      <div className="rounded-xl border border-main-line bg-main-surface p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-main-chip text-main-blue"
          >
            <Mail className="size-4" />
          </span>
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-main-ink">{t("notifications.new_artwork_heading")}</h2>
            <p className="text-xs leading-relaxed text-main-muted">{t("notifications.new_artwork_description")}</p>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" size="sm" className="text-main-ink hover:bg-main-chip" onClick={() => respond(false)}>
            {t("notifications.decline")}
          </Button>
          <Button size="sm" className="bg-main-blue text-main-on-blue hover:bg-main-blue/90" onClick={() => respond(true)}>
            {t("notifications.accept")}
          </Button>
        </div>
      </div>
    </div>
  )
}
