import { useState, type FormEvent } from "react"
import TextLink from "@/components/text-link"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import AuthLayout from "@/layouts/auth-layout"
import { delay } from "@/lib/demo-auth"
import { logout, updateUser } from "@/lib/demo-store"
import { useTranslation } from "@/lib/i18n"
import { navigate, routes } from "@/lib/router"

export default function VerifyEmail() {
  const { t } = useTranslation()
  const [processing, setProcessing] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setProcessing(true)
    await delay()
    setProcessing(false)
    setSent(true)
  }

  return (
    <AuthLayout title="auth.verify.title" description="auth.verify.description">
      {sent && (
        <div className="mb-4 space-y-2 text-center text-sm font-medium text-green-600">
          <p>{t("auth.verify.sent")}</p>
          {/* No mailbox in the prototype: this stands in for the emailed link. */}
          <TextLink
            href={routes.home}
            onClick={() => updateUser({ email_verified_at: new Date().toISOString() })}
          >
            {t("auth.verify.title")} →
          </TextLink>
        </div>
      )}

      <form onSubmit={submit} className="space-y-6 text-center">
        <Button disabled={processing} variant="secondary">
          {processing && <Spinner />}
          {t("auth.verify.resend")}
        </Button>

        <TextLink
          href={routes.home}
          onClick={(event) => {
            event.preventDefault()
            logout()
            navigate("home")
          }}
          className="mx-auto block text-sm"
        >
          {t("auth.verify.log_out")}
        </TextLink>
      </form>
    </AuthLayout>
  )
}
