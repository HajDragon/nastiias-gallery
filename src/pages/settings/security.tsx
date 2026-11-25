import { useRef, useState, type FormEvent } from "react"
import Heading from "@/components/heading"
import InputError from "@/components/input-error"
import ManagePasskeys from "@/components/manage-passkeys"
import ManageTwoFactor from "@/components/manage-two-factor"
import PasswordInput from "@/components/password-input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/primitives"
import { Spinner } from "@/components/ui/spinner"
import SettingsLayout from "@/layouts/settings-layout"
import { delay, updatePassword } from "@/lib/demo-auth"
import { useTranslation } from "@/lib/i18n"
import { toast } from "@/lib/toast"
import type { User } from "@/types/auth"

export default function Security({ user }: { user: User }) {
  const passwordInput = useRef<HTMLInputElement>(null)
  const currentPasswordInput = useRef<HTMLInputElement>(null)
  const { t } = useTranslation()
  const [processing, setProcessing] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setProcessing(true)
    await delay()
    const result = updatePassword(
      String(data.get("current_password")),
      String(data.get("password")),
      String(data.get("password_confirmation")),
    )
    setProcessing(false)
    form.reset()

    if (result.ok) {
      setErrors({})
      toast.success(t("demo.password_updated"))
      return
    }

    setErrors({ [result.field ?? "password"]: t(result.error) })
    if (result.field === "current_password") currentPasswordInput.current?.focus()
    else passwordInput.current?.focus()
  }

  const inputClass = "mt-1 block w-full border-border bg-background focus-visible:border-primary"

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <Heading variant="small" title={t("security.password_heading")} description={t("security.password_description")} />

        <form onSubmit={submit} className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="current_password">{t("security.current_password")}</Label>
            <PasswordInput
              id="current_password"
              ref={currentPasswordInput}
              name="current_password"
              className={inputClass}
              autoComplete="current-password"
              placeholder={t("security.current_password")}
            />
            <InputError message={errors.current_password} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">{t("security.new_password")}</Label>
            <PasswordInput
              id="password"
              ref={passwordInput}
              name="password"
              className={inputClass}
              autoComplete="new-password"
              placeholder={t("security.new_password")}
            />
            <InputError message={errors.password} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password_confirmation">{t("security.confirm_password")}</Label>
            <PasswordInput
              id="password_confirmation"
              name="password_confirmation"
              className={inputClass}
              autoComplete="new-password"
              placeholder={t("security.confirm_password")}
            />
            <InputError message={errors.password_confirmation} />
          </div>

          <div className="flex items-center gap-4">
            <Button disabled={processing} className="bg-primary text-primary-foreground transition-colors hover:bg-primary/90">
              {processing && <Spinner />}
              {t("security.save")}
            </Button>
          </div>
        </form>
      </div>

      <ManageTwoFactor user={user} />
      <ManagePasskeys user={user} />
    </SettingsLayout>
  )
}
