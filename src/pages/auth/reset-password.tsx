import { useState, type FormEvent } from "react"
import InputError from "@/components/input-error"
import PasswordInput from "@/components/password-input"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/primitives"
import { Spinner } from "@/components/ui/spinner"
import AuthLayout from "@/layouts/auth-layout"
import { delay, resetPassword } from "@/lib/demo-auth"
import { useTranslation } from "@/lib/i18n"
import { hashParams, navigate } from "@/lib/router"

export default function ResetPassword() {
  const { t } = useTranslation()
  const [email] = useState(() => hashParams().get("email") ?? "")
  const [processing, setProcessing] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setProcessing(true)
    await delay()
    const result = resetPassword(email, String(data.get("password")), String(data.get("password_confirmation")))
    setProcessing(false)

    if (result.ok) return navigate("login")

    setErrors({ [result.field ?? "email"]: t(result.error) })
    form.reset()
  }

  return (
    <AuthLayout title="auth.reset.title" description="auth.reset.description">
      <form onSubmit={submit}>
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">{t("auth.reset.email")}</Label>
            <Input id="email" type="email" name="email" autoComplete="email" value={email} className="mt-1 block w-full" readOnly />
            <InputError message={errors.email} className="mt-2" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">{t("auth.fields.password")}</Label>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
              className="mt-1 block w-full"
              autoFocus
              required
              placeholder={t("auth.fields.password")}
            />
            <InputError message={errors.password} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password_confirmation">{t("auth.fields.confirm_password")}</Label>
            <PasswordInput
              id="password_confirmation"
              name="password_confirmation"
              autoComplete="new-password"
              className="mt-1 block w-full"
              required
              placeholder={t("auth.fields.confirm_password")}
            />
            <InputError message={errors.password_confirmation} className="mt-2" />
          </div>

          <Button type="submit" className="mt-4 w-full" disabled={processing}>
            {processing && <Spinner />}
            {t("auth.reset.submit")}
          </Button>
        </div>
      </form>
    </AuthLayout>
  )
}
