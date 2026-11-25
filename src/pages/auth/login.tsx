import { useState, type FormEvent } from "react"
import InputError from "@/components/input-error"
import PasskeyVerify from "@/components/passkey-verify"
import PasswordInput from "@/components/password-input"
import TextLink from "@/components/text-link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox, Label } from "@/components/ui/primitives"
import { Spinner } from "@/components/ui/spinner"
import AuthLayout from "@/layouts/auth-layout"
import { delay, login } from "@/lib/demo-auth"
import { useTranslation } from "@/lib/i18n"
import { navigate, routes } from "@/lib/router"

export default function Login() {
  const { t } = useTranslation()
  const [processing, setProcessing] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setProcessing(true)
    await delay()
    const result = login(String(data.get("email")), String(data.get("password")))
    setProcessing(false)

    if (result === "two-factor") return navigate("twoFactorChallenge")
    if (result.ok) return navigate("home")

    setErrors({ [result.field ?? "email"]: t(result.error) })
    const password = form.elements.namedItem("password") as HTMLInputElement | null
    if (password) password.value = ""
  }

  return (
    <AuthLayout title="auth.login.title" description="auth.login.description">
      <PasskeyVerify onSuccess={() => navigate("home")} />

      <form onSubmit={submit} className="flex flex-col gap-6">
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">{t("auth.fields.email")}</Label>
            <Input
              id="email"
              type="email"
              name="email"
              required
              autoFocus
              tabIndex={1}
              autoComplete="email"
              placeholder={t("auth.fields.email_placeholder")}
            />
            <InputError message={errors.email} />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">{t("auth.fields.password")}</Label>
              <TextLink href={routes.forgotPassword} className="ml-auto text-sm" tabIndex={5}>
                {t("auth.login.forgot")}
              </TextLink>
            </div>
            <PasswordInput
              id="password"
              name="password"
              required
              tabIndex={2}
              autoComplete="current-password"
              placeholder={t("auth.fields.password")}
            />
            <InputError message={errors.password} />
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox id="remember" name="remember" tabIndex={3} />
            <Label htmlFor="remember">{t("auth.login.remember")}</Label>
          </div>

          <Button type="submit" className="mt-4 w-full" tabIndex={4} disabled={processing}>
            {processing && <Spinner />}
            {t("auth.login.heading")}
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          {t("auth.login.no_account")}{" "}
          <TextLink href={routes.register} tabIndex={5}>
            {t("auth.login.sign_up")}
          </TextLink>
        </div>
      </form>
    </AuthLayout>
  )
}
