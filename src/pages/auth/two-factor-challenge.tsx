import { REGEXP_ONLY_DIGITS } from "input-otp"
import { useState, type FormEvent } from "react"
import InputError from "@/components/input-error"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import AuthLayout from "@/layouts/auth-layout"
import { twoFactorChallenge } from "@/lib/demo-auth"
import { useTranslation } from "@/lib/i18n"
import { navigate } from "@/lib/router"

export const OTP_MAX_LENGTH = 6

export default function TwoFactorChallenge() {
  const { t } = useTranslation()
  const [showRecoveryInput, setShowRecoveryInput] = useState(false)
  const [code, setCode] = useState("")
  const [recoveryCode, setRecoveryCode] = useState("")
  const [processing, setProcessing] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const config = showRecoveryInput
    ? {
        title: "auth.two_factor.recovery_title",
        description: "auth.two_factor.recovery_description",
        toggleText: t("auth.two_factor.auth_toggle"),
      }
    : {
        title: "auth.two_factor.auth_title",
        description: "auth.two_factor.auth_description",
        toggleText: t("auth.two_factor.recovery_toggle"),
      }

  const toggleRecoveryMode = () => {
    setShowRecoveryInput(!showRecoveryInput)
    setErrors({})
    setCode("")
    setRecoveryCode("")
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setProcessing(true)
    const result = await twoFactorChallenge(showRecoveryInput ? { recovery_code: recoveryCode } : { code })
    setProcessing(false)

    if (result.ok) return navigate("home")

    setErrors({ [result.field ?? "code"]: t(result.error) })
    setCode("")
    setRecoveryCode("")
  }

  return (
    <AuthLayout title={config.title} description={config.description}>
      <div className="space-y-6">
        <form onSubmit={submit} className="space-y-4">
          {showRecoveryInput ? (
            <>
              <Input
                name="recovery_code"
                type="text"
                value={recoveryCode}
                onChange={(event) => setRecoveryCode(event.target.value)}
                placeholder={t("auth.two_factor.recovery_placeholder")}
                autoFocus
                required
              />
              <InputError message={errors.recovery_code} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-3 text-center">
              <div className="flex w-full items-center justify-center">
                <InputOTP
                  name="code"
                  maxLength={OTP_MAX_LENGTH}
                  value={code}
                  onChange={(value) => setCode(value)}
                  disabled={processing}
                  pattern={REGEXP_ONLY_DIGITS}
                  autoFocus
                >
                  <InputOTPGroup>
                    {Array.from({ length: OTP_MAX_LENGTH }, (_, index) => (
                      <InputOTPSlot key={index} index={index} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <InputError message={errors.code} />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={processing}>
            {t("auth.two_factor.continue")}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <span>{t("auth.two_factor.or_you_can")}</span>
            <button
              type="button"
              className="cursor-pointer text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
              onClick={toggleRecoveryMode}
            >
              {config.toggleText}
            </button>
          </div>
        </form>
      </div>
    </AuthLayout>
  )
}
