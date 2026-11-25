import { useState, type FormEvent } from "react"
import InputError from "@/components/input-error"
import PasswordInput from "@/components/password-input"
import TextLink from "@/components/text-link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/primitives"
import { Spinner } from "@/components/ui/spinner"
import AuthLayout from "@/layouts/auth-layout"
import { delay, register } from "@/lib/demo-auth"
import { useTranslation } from "@/lib/i18n"
import { navigate, routes } from "@/lib/router"

export default function Register() {
  const { t } = useTranslation()
  const [processing, setProcessing] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setProcessing(true)
    await delay()
    const result = register(
      String(data.get("display_name")),
      String(data.get("email")),
      String(data.get("password")),
      String(data.get("password_confirmation")),
    )
    setProcessing(false)

    if (result.ok) return navigate("verifyEmail")

    setErrors({ [result.field ?? "email"]: t(result.error) })
    for (const name of ["password", "password_confirmation"]) {
      const input = form.elements.namedItem(name) as HTMLInputElement | null
      if (input) input.value = ""
    }
  }

  return (
    <AuthLayout title="auth.register.title" description="auth.register.description">
      <form onSubmit={submit} className="flex flex-col gap-6">
        <fieldset disabled={processing} className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="display_name">{t("auth.fields.display_name")}</Label>
            <Input
              id="display_name"
              type="text"
              required
              autoFocus
              tabIndex={1}
              autoComplete="name"
              name="display_name"
              placeholder={t("auth.fields.full_name")}
            />
            <InputError message={errors.display_name} className="mt-2" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">{t("auth.fields.email")}</Label>
            <Input
              id="email"
              type="email"
              required
              tabIndex={2}
              autoComplete="email"
              name="email"
              placeholder={t("auth.fields.email_placeholder")}
            />
            <InputError message={errors.email} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">{t("auth.fields.password")}</Label>
            <PasswordInput
              id="password"
              required
              tabIndex={3}
              autoComplete="new-password"
              name="password"
              placeholder={t("auth.fields.password")}
            />
            <InputError message={errors.password} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password_confirmation">{t("auth.fields.confirm_password")}</Label>
            <PasswordInput
              id="password_confirmation"
              required
              tabIndex={4}
              autoComplete="new-password"
              name="password_confirmation"
              placeholder={t("auth.fields.confirm_password")}
            />
            <InputError message={errors.password_confirmation} />
          </div>

          <Button type="submit" className="mt-2 w-full" tabIndex={5}>
            {processing && <Spinner />}
            {t("auth.register.create")}
          </Button>
        </fieldset>

        <div className="text-center text-sm text-muted-foreground">
          {t("auth.register.have_account")}{" "}
          <TextLink href={routes.login} tabIndex={6}>
            {t("auth.register.log_in")}
          </TextLink>
        </div>
      </form>
    </AuthLayout>
  )
}
