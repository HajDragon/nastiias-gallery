import { KeyRound, Trash2 } from "lucide-react"
import { useState, type FormEvent } from "react"
import Heading from "@/components/heading"
import InputError from "@/components/input-error"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogDescription, DialogFooter, DialogTitle, Label } from "@/components/ui/primitives"
import { deletePasskey, listPasskeys, passkeysSupported, registerPasskey } from "@/lib/demo-auth"
import { useTranslation } from "@/lib/i18n"
import type { Passkey, User } from "@/types/auth"

const relativeTime = (locale: string) => {
  const format = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })
  return (timestamp: number) => {
    const minutes = Math.round((timestamp - Date.now()) / 60_000)
    if (Math.abs(minutes) < 60) return format.format(minutes, "minute")
    const hours = Math.round(minutes / 60)
    if (Math.abs(hours) < 24) return format.format(hours, "hour")
    return format.format(Math.round(hours / 24), "day")
  }
}

function PasskeyItem({ passkey, onDelete }: { passkey: Passkey; onDelete: (id: number) => void }) {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-between border-b p-4 last:border-b-0">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
          <KeyRound className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="font-medium tracking-tight">{passkey.name}</p>
          <p className="text-sm text-muted-foreground">
            {t("passkeys.added", { time: passkey.created_at_diff })}
            {passkey.last_used_at_diff && (
              <>
                <span className="mx-1 text-muted-foreground/50">/</span>
                {t("passkeys.last_used", { time: passkey.last_used_at_diff })}
              </>
            )}
          </p>
        </div>
      </div>

      <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setOpen(true)}>
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">{t("passkeys.remove")}</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTitle>{t("passkeys.remove_title")}</DialogTitle>
        <DialogDescription>{t("passkeys.remove_description", { name: passkey.name })}</DialogDescription>
        <DialogFooter className="gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button variant="destructive" onClick={() => onDelete(passkey.id)}>
            {t("passkeys.remove_confirm")}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}

function defaultPasskeyName(): string {
  const ua = navigator.userAgent
  const browser = [
    { pattern: /Edg|Edge/, name: "Edge" },
    { pattern: /OPR|Opera|OPiOS/, name: "Opera" },
    { pattern: /Firefox|FxiOS/, name: "Firefox" },
    { pattern: /Chrome|CriOS/, name: "Chrome" },
    { pattern: /Safari/, name: "Safari" },
  ].find(({ pattern }) => pattern.test(ua))?.name
  const os = [
    { pattern: /iPhone/, name: "iPhone" },
    { pattern: /iPad|Macintosh(?=.*Mobile)/, name: "iPad" },
    { pattern: /Android/, name: "Android" },
    { pattern: /Mac/, name: "Mac" },
    { pattern: /Windows/, name: "Windows" },
  ].find(({ pattern }) => pattern.test(ua))?.name

  return [browser, os].filter(Boolean).join(" on ")
}

function PasskeyRegistration({ user, onSuccess }: { user: User; onSuccess: () => void }) {
  const { t } = useTranslation()
  const [name, setName] = useState(defaultPasskeyName)
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>()

  if (!passkeysSupported()) return <div className="text-sm text-muted-foreground">{t("passkeys.unsupported")}</div>

  if (!showForm) {
    return (
      <Button variant="outline" onClick={() => setShowForm(true)}>
        {t("passkeys.add")}
      </Button>
    )
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return
    setIsLoading(true)
    setError(undefined)
    try {
      await registerPasskey(user, name.trim())
      setShowForm(false)
      setName("")
      onSuccess()
    } catch {
      setError(t("errors.something_wrong"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-lg border border-border bg-muted/50 p-4">
      <div className="grid gap-2">
        <Label htmlFor="passkey-name">{t("passkeys.name")}</Label>
        <Input
          id="passkey-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={t("passkeys.name_placeholder")}
          className="mt-1 block w-full border-foreground/20"
          autoFocus
        />
        <p className="text-xs text-muted-foreground">{t("passkeys.name_hint")}</p>
      </div>

      <InputError message={error} />

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading || !name.trim()}>
          {isLoading ? t("passkeys.registering") : t("passkeys.register")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setShowForm(false)
            setName("")
          }}
        >
          {t("common.cancel")}
        </Button>
      </div>
    </form>
  )
}

export default function ManagePasskeys({ user }: { user: User }) {
  const { t, locale } = useTranslation()
  const [, refresh] = useState(0)
  const passkeys = listPasskeys(user, relativeTime(locale))

  return (
    <div className="space-y-6">
      <Heading variant="small" title={t("passkeys.heading")} description={t("passkeys.description")} />

      <div className="overflow-hidden rounded-lg border border-border">
        {passkeys.length > 0 ? (
          passkeys.map((passkey) => (
            <PasskeyItem
              key={passkey.id}
              passkey={passkey}
              onDelete={(id) => {
                deletePasskey(id)
                refresh((value) => value + 1)
              }}
            />
          ))
        ) : (
          <div className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <KeyRound className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="font-medium">{t("passkeys.empty_title")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("passkeys.empty_description")}</p>
          </div>
        )}
      </div>

      <PasskeyRegistration user={user} onSuccess={() => refresh((value) => value + 1)} />
    </div>
  )
}
