import { useState, type FormEvent } from "react"
import InputError from "@/components/input-error"
import PasskeyVerify from "@/components/passkey-verify"
import PasswordInput from "@/components/password-input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/primitives"
import { Spinner } from "@/components/ui/spinner"
import AuthLayout from "@/layouts/auth-layout"
import { checkPassword, delay } from "@/lib/demo-auth"
import { useTranslation } from "@/lib/i18n"
import { navigate } from "@/lib/router"

// The main project asks for this before opening the security settings.
export const PASSWORD_CONFIRMED_KEY = "nastiia-demo-password-confirmed-at"

const confirmed = () => {
  sessionStorage.setItem(PASSWORD_CONFIRMED_KEY, String(Date.now()))
  navigate("security")
}

export default function ConfirmPassword() {
  const { t } = useTranslation()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string>()

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const password = String(new FormData(form).get("password"))
    setProcessing(true)
    await delay()
    setProcessing(false)

    if (checkPassword(password)) return confirmed()

    setError(t("demo.password_incorrect"))
    form.reset()
  }

  return (
    <AuthLayout title="auth.confirm.title" description="auth.confirm.description">
      <PasskeyVerify
        onSuccess={confirmed}
        label={t("auth.confirm.with_passkey")}
        loadingLabel={t("auth.confirm.confirming")}
        separator={t("auth.confirm.or_with_password")}
      />

      <form onSubmit={submit}>
        <div className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="password">{t("auth.fields.password")}</Label>
            <PasswordInput
              id="password"
              name="password"
              required
              placeholder={t("auth.fields.password")}
              autoComplete="current-password"
              autoFocus
            />
            <InputError message={error} />
          </div>

          <div className="flex items-center">
            <Button className="w-full" disabled={processing}>
              {processing && <Spinner />}
              {t("auth.confirm.submit")}
            </Button>
          </div>
        </div>
      </form>
    </AuthLayout>
  )
}
