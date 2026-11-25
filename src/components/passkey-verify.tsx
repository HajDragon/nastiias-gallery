import { KeyRound } from "lucide-react"
import { useState } from "react"
import InputError from "@/components/input-error"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/primitives"
import { Spinner } from "@/components/ui/spinner"
import { passkeysSupported, verifyPasskey } from "@/lib/demo-auth"
import { useTranslation } from "@/lib/i18n"

type Props = {
  onSuccess: () => void
  label?: string
  loadingLabel?: string
  separator?: string
}

export default function PasskeyVerify({ onSuccess, label, loadingLabel, separator }: Props) {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!passkeysSupported()) return null

  const verify = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await verifyPasskey()
      if (result.ok) onSuccess()
      else setError(t(result.error))
    } catch {
      setError(t("errors.something_wrong"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="grid gap-2">
        <Button type="button" variant="outline" className="w-full" onClick={verify} disabled={isLoading}>
          {isLoading ? <Spinner /> : <KeyRound className="h-4 w-4" />}
          {isLoading ? (loadingLabel ?? t("auth.passkey.authenticating")) : (label ?? t("auth.passkey.sign_in"))}
        </Button>
        {error && <InputError message={error} className="text-center" />}
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">{separator ?? t("auth.passkey.or_continue_email")}</span>
        </div>
      </div>
    </>
  )
}
