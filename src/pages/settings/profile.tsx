import { useRef, useState, type ChangeEvent, type FormEvent } from "react"
import DeleteUser from "@/components/delete-user"
import Heading from "@/components/heading"
import InputError from "@/components/input-error"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, Checkbox, Label } from "@/components/ui/primitives"
import { Spinner } from "@/components/ui/spinner"
import { useInitials } from "@/hooks/use-initials"
import SettingsLayout from "@/layouts/settings-layout"
import { delay } from "@/lib/demo-auth"
import { updateUser } from "@/lib/demo-store"
import { availableLocales, setLocale, useTranslation, type Locale } from "@/lib/i18n"
import { routes } from "@/lib/router"
import { toast } from "@/lib/toast"
import type { User } from "@/types/auth"

const MAX_PHOTO_BYTES = 2 * 1024 * 1024

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

export default function Profile({ user }: { user: User }) {
  const { t, locale } = useTranslation()
  const isAdmin = user.role === "admin" || user.role === "super_admin"
  const [contactEmails, setContactEmails] = useState(user.notify_on_contact_message)
  const getInitials = useInitials()
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [removingPhoto, setRemovingPhoto] = useState(false)
  const [photoError, setPhotoError] = useState<string>()
  const [processing, setProcessing] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)

  const handlePhotoSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    // Reset the input so selecting the same file again still triggers a change event.
    event.target.value = ""
    if (!file) return

    setPhotoError(undefined)
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > MAX_PHOTO_BYTES) {
      setPhotoError(t("profile.photo_hint"))
      return
    }

    setUploading(true)
    const avatar = await readAsDataUrl(file)
    await delay()
    updateUser({ avatar })
    setUploading(false)
  }

  const handleRemovePhoto = async () => {
    if (removingPhoto) return
    setRemovingPhoto(true)
    await delay()
    updateUser({ avatar: null })
    setRemovingPhoto(false)
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const email = String(data.get("email")).trim().toLowerCase()
    const nextLocale = String(data.get("locale")) as Locale
    setProcessing(true)
    await delay()
    updateUser({
      display_name: String(data.get("display_name")).trim(),
      // Changing the email address resets verification, as in Laravel.
      ...(email !== user.email ? { email, email_verified_at: null } : {}),
      locale: nextLocale,
      notify_on_new_artwork: data.get("notify_on_new_artwork") === "1",
      ...(isAdmin ? { notify_on_contact_message: contactEmails } : {}),
    })
    if (nextLocale !== locale) setLocale(nextLocale)
    setProcessing(false)
    toast.success(t("demo.saved"))
  }

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <Heading variant="small" title={t("profile.heading")} description={t("profile.description")} />

        <div className="flex flex-col gap-4 rounded-lg border border-border bg-muted/50 p-4 sm:flex-row sm:items-center">
          <Avatar
            src={user.avatar}
            alt={user.display_name}
            className="size-20 shrink-0"
            fallback={getInitials(user.display_name)}
            fallbackClassName="bg-primary-blue/35 text-lg font-semibold"
          />

          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <p className="text-sm font-medium text-foreground">{t("profile.photo")}</p>
              <p className="text-sm text-muted-foreground">{t("profile.photo_hint")}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handlePhotoSelected}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading || removingPhoto}
                onClick={() => photoInputRef.current?.click()}
              >
                {uploading && <Spinner />}
                {user.avatar ? t("profile.photo_change") : t("profile.photo_upload")}
              </Button>
              {user.avatar && (
                <Button type="button" variant="ghost" size="sm" disabled={uploading || removingPhoto} onClick={handleRemovePhoto}>
                  {removingPhoto && <Spinner />}
                  {t("profile.photo_remove")}
                </Button>
              )}
            </div>

            <InputError message={photoError} />
          </div>
        </div>

        <form onSubmit={submit} className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="display_name">{t("profile.display_name")}</Label>
            <Input
              id="display_name"
              className="mt-1 block w-full border-border bg-background focus-visible:border-primary"
              defaultValue={user.display_name}
              name="display_name"
              required
              autoComplete="name"
              placeholder={t("profile.display_name_placeholder")}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">{t("profile.email")}</Label>
            <Input
              id="email"
              type="email"
              className="mt-1 block w-full border-border bg-background focus-visible:border-primary"
              defaultValue={user.email}
              name="email"
              required
              autoComplete="username"
              placeholder={t("profile.email_placeholder")}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="locale">{t("profile.language")}</Label>
            <select
              id="locale"
              name="locale"
              defaultValue={user.locale ?? locale}
              className="mt-1 block h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-base text-foreground shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm"
            >
              {Object.entries(availableLocales).map(([code, label]) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
            <p className="text-sm text-muted-foreground">{t("profile.language_hint")}</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notify_on_new_artwork">{t("profile.notifications")}</Label>
            <label
              htmlFor="notify_on_new_artwork"
              className="mt-1 flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-muted/50 p-4"
            >
              <Checkbox
                id="notify_on_new_artwork"
                name="notify_on_new_artwork"
                value="1"
                defaultChecked={user.notify_on_new_artwork === true}
                className="mt-0.5"
              />
              <span className="space-y-1">
                <span className="block text-sm font-medium text-foreground">{t("profile.notify_new_artwork")}</span>
                <span className="block text-sm text-muted-foreground">{t("profile.notify_new_artwork_hint")}</span>
              </span>
            </label>
          </div>

          {user.email_verified_at === null && (
            <div>
              <p className="-mt-4 text-sm text-muted-foreground">
                {t("profile.unverified")}{" "}
                <button
                  type="button"
                  onClick={() => setVerificationSent(true)}
                  className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                >
                  {t("profile.resend")}
                </button>
              </p>

              {verificationSent && (
                <div className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
                  {t("profile.verification_sent")}{" "}
                  <a href={routes.verifyEmail} className="underline">
                    {t("auth.verify.title")}
                  </a>
                </div>
              )}
            </div>
          )}

          {isAdmin && (
            <div className="grid gap-2">
              <label className="flex items-center gap-3 text-sm font-medium">
                <input
                  type="checkbox"
                  role="switch"
                  checked={contactEmails}
                  onChange={(event) => setContactEmails(event.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
                {t("profile.notify_contact")}
              </label>
              <p className="text-sm text-muted-foreground">{t("profile.notify_contact_hint")}</p>
            </div>
          )}

          <div className="flex items-center gap-4">
            <Button disabled={processing} className="bg-primary text-primary-foreground transition-colors hover:bg-primary/90">
              {processing && <Spinner />}
              {t("profile.save")}
            </Button>
          </div>
          <hr className="my-5 border-border" />
        </form>
      </div>

      <DeleteUser user={user} />
    </SettingsLayout>
  )
}
