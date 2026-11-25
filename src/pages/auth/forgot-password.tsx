import { LoaderCircle } from "lucide-react"
import { useState, type FormEvent } from "react"
import TextLink from "@/components/text-link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/primitives"
import AuthLayout from "@/layouts/auth-layout"
import { delay } from "@/lib/demo-auth"
import { useTranslation } from "@/lib/i18n"
import { routes } from "@/lib/router"

export default function ForgotPassword() {
  const { t } = useTranslation()
  const [processing, setProcessing] = useState(false)
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<string | null>(null)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setProcessing(true)
    await delay()
    setProcessing(false)
    // Like Laravel, always answer the same way so emails cannot be probed.
    setStatus(t("demo.reset_link_sent"))
  }

  return (
    <AuthLayout title="auth.forgot.title" description="auth.forgot.description">
      {status && (
        <div className="mb-4 space-y-2 text-center text-sm font-medium text-green-600">
          <p>{status}</p>
          {/* No mailbox in the prototype: offer the link the email would contain. */}
          <TextLink href={`${routes.resetPassword}?email=${encodeURIComponent(email)}`}>{t("auth.reset.title")}</TextLink>
        </div>
      )}

      <div className="space-y-6">
        <form onSubmit={submit}>
          <div className="grid gap-2">
            <Label htmlFor="email">{t("auth.fields.email")}</Label>
            <Input
              id="email"
              type="email"
              name="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="off"
              autoFocus
              placeholder={t("auth.fields.email_placeholder")}
            />
          </div>

          <div className="my-6 flex items-center justify-start">
            <Button className="w-full" disabled={processing}>
              {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
              {t("auth.forgot.submit")}
            </Button>
          </div>
        </form>

        <div className="space-x-1 text-center text-sm text-muted-foreground">
          <span>{t("auth.forgot.or_return")}</span>
          <TextLink href={routes.login}>{t("auth.forgot.log_in")}</TextLink>
        </div>
      </div>
    </AuthLayout>
  )
}
