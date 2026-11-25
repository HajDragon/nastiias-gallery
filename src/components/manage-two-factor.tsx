import { REGEXP_ONLY_DIGITS } from "input-otp"
import { Check, Copy, Eye, EyeOff, LockKeyhole, RefreshCw, ScanLine, ShieldCheck } from "lucide-react"
import { useEffect, useRef, useState, type FormEvent } from "react"
import Heading from "@/components/heading"
import InputError from "@/components/input-error"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Dialog, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/primitives"
import { Spinner } from "@/components/ui/spinner"
import { useAppearance } from "@/hooks/use-appearance"
import { useClipboard } from "@/hooks/use-clipboard"
import {
  confirmTwoFactor,
  delay,
  disableTwoFactor,
  enableTwoFactor,
  recoveryCodes,
  regenerateRecoveryCodes,
} from "@/lib/demo-auth"
import { useTranslation } from "@/lib/i18n"
import type { User } from "@/types/auth"

const OTP_MAX_LENGTH = 6

function GridScanIcon() {
  return (
    <div className="mb-3 rounded-full border border-border bg-card p-0.5 shadow-sm">
      <div className="relative overflow-hidden rounded-full border border-border bg-muted p-2.5">
        <div className="absolute inset-0 grid grid-cols-5 opacity-50">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={`col-${i + 1}`} className="border-r border-border last:border-r-0" />
          ))}
        </div>
        <div className="absolute inset-0 grid grid-rows-5 opacity-50">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={`row-${i + 1}`} className="border-b border-border last:border-b-0" />
          ))}
        </div>
        <ScanLine className="relative z-20 size-6 text-foreground" />
      </div>
    </div>
  )
}

function SetupStep({ setup, onNext }: { setup: { svg: string; key: string } | null; onNext: () => void }) {
  const { resolvedAppearance } = useAppearance()
  const [copiedText, copy] = useClipboard()
  const { t } = useTranslation()
  const IconComponent = setup && copiedText === setup.key ? Check : Copy

  return (
    <>
      <div className="mx-auto flex max-w-md overflow-hidden">
        <div className="mx-auto aspect-square w-64 rounded-lg border border-border">
          <div className="z-10 flex h-full w-full items-center justify-center p-5">
            {setup ? (
              <div
                className="aspect-square w-full rounded-lg bg-white p-2 [&_svg]:size-full"
                dangerouslySetInnerHTML={{ __html: setup.svg }}
                style={{ filter: resolvedAppearance === "dark" ? "invert(1) brightness(1.5)" : undefined }}
              />
            ) : (
              <Spinner />
            )}
          </div>
        </div>
      </div>

      <div className="flex w-full space-x-5">
        <Button className="w-full" onClick={onNext}>
          {t("common.continue")}
        </Button>
      </div>

      <div className="relative flex w-full items-center justify-center">
        <div className="absolute inset-0 top-1/2 h-px w-full bg-border" />
        <span className="relative bg-background px-2 py-1">{t("two_factor.manual")}</span>
      </div>

      <div className="flex w-full space-x-2">
        <div className="flex w-full items-stretch overflow-hidden rounded-xl border border-border">
          {!setup ? (
            <div className="flex h-full w-full items-center justify-center bg-muted p-3">
              <Spinner />
            </div>
          ) : (
            <>
              <input type="text" readOnly value={setup.key} className="h-full w-full bg-background p-3 text-foreground outline-none" />
              <button type="button" onClick={() => copy(setup.key)} className="border-l border-border px-3 hover:bg-muted">
                <IconComponent className="w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}

function VerificationStep({ user, onDone, onBack }: { user: User; onDone: () => void; onBack: () => void }) {
  const [code, setCode] = useState("")
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string>()
  const { t } = useTranslation()

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setProcessing(true)
    const result = await confirmTwoFactor(user, code)
    setProcessing(false)
    if (result.ok) return onDone()
    setError(t(result.error))
    setCode("")
  }

  return (
    <form onSubmit={submit} className="relative w-full space-y-3">
      <div className="flex w-full flex-col items-center space-y-3 py-2">
        <InputOTP
          id="otp"
          name="code"
          maxLength={OTP_MAX_LENGTH}
          value={code}
          onChange={setCode}
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
        <InputError message={error} />
      </div>

      <div className="flex w-full space-x-5">
        <Button type="button" variant="outline" className="flex-1" onClick={onBack} disabled={processing}>
          {t("two_factor.back")}
        </Button>
        <Button type="submit" className="flex-1" disabled={processing || code.length < OTP_MAX_LENGTH}>
          {t("two_factor.confirm")}
        </Button>
      </div>
    </form>
  )
}

function RecoveryCodes({ user }: { user: User }) {
  const [codes, setCodes] = useState<string[]>(() => recoveryCodes(user))
  const [visible, setVisible] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()
  const Icon = visible ? EyeOff : Eye

  const toggle = () => {
    setVisible(!visible)
    if (!visible) setTimeout(() => sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }))
  }

  const regenerate = async () => {
    setRegenerating(true)
    await delay()
    setCodes(regenerateRecoveryCodes(user))
    setRegenerating(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex gap-3">
          <LockKeyhole className="size-4" aria-hidden="true" />
          {t("two_factor.recovery_codes_title")}
        </CardTitle>
        <CardDescription>{t("two_factor.recovery_codes_description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3 select-none sm:flex-row sm:items-center sm:justify-between">
          <Button onClick={toggle} className="w-fit" aria-expanded={visible} aria-controls="recovery-codes-section">
            <Icon className="size-4" aria-hidden="true" />
            {visible ? t("two_factor.hide_codes") : t("two_factor.show_codes")}
          </Button>

          {visible && codes.length > 0 && (
            <Button variant="secondary" onClick={regenerate} disabled={regenerating} aria-describedby="regenerate-warning">
              <RefreshCw /> {t("two_factor.regenerate")}
            </Button>
          )}
        </div>
        <div
          id="recovery-codes-section"
          className={`relative overflow-hidden transition-all duration-300 ${visible ? "h-auto opacity-100" : "h-0 opacity-0"}`}
          aria-hidden={!visible}
        >
          <div className="mt-3 space-y-3">
            <div ref={sectionRef} className="grid gap-1 rounded-lg bg-muted p-4 font-mono text-sm" role="list" aria-label={t("two_factor.recovery_aria")}>
              {codes.map((code) => (
                <div key={code} role="listitem" className="select-text">
                  {code}
                </div>
              ))}
            </div>
            <div className="text-xs text-muted-foreground select-none">
              <p id="regenerate-warning">{t("two_factor.recovery_note")}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ManageTwoFactor({ user }: { user: User }) {
  const { t } = useTranslation()
  const enabled = user.two_factor_enabled === true
  const [open, setOpen] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [setup, setSetup] = useState<{ svg: string; key: string } | null>(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (open && !setup) void enableTwoFactor(user).then(setSetup)
  }, [open, setup, user])

  const close = () => {
    setOpen(false)
    setVerifying(false)
  }

  const disable = async () => {
    setProcessing(true)
    await delay()
    disableTwoFactor(user)
    setSetup(null)
    setProcessing(false)
  }

  return (
    <div className="space-y-6">
      <Heading variant="small" title={t("two_factor.heading")} description={t("two_factor.description")} />
      {enabled ? (
        <div className="flex flex-col items-start justify-start space-y-4">
          <p className="text-sm text-muted-foreground">{t("two_factor.enabled_info")}</p>
          <Button variant="destructive" onClick={disable} disabled={processing}>
            {t("two_factor.disable")}
          </Button>
          <RecoveryCodes user={user} />
        </div>
      ) : (
        <div className="flex flex-col items-start justify-start space-y-4">
          <p className="text-sm text-muted-foreground">{t("two_factor.disabled_info")}</p>
          <Button onClick={() => setOpen(true)}>
            {setup && <ShieldCheck />}
            {setup ? t("two_factor.continue_setup") : t("two_factor.enable")}
          </Button>
        </div>
      )}

      <Dialog open={open} onOpenChange={(value) => !value && close()} className="sm:max-w-md">
        <DialogHeader className="flex items-center justify-center">
          <GridScanIcon />
          <DialogTitle>{verifying ? t("two_factor.verify_title") : t("two_factor.setup_title")}</DialogTitle>
          <DialogDescription className="text-center">
            {verifying ? t("two_factor.verify_description") : t("two_factor.setup_description")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-5">
          {verifying ? (
            <VerificationStep
              user={user}
              onBack={() => setVerifying(false)}
              onDone={() => {
                setSetup(null)
                close()
              }}
            />
          ) : (
            <SetupStep setup={setup} onNext={() => setVerifying(true)} />
          )}
        </div>
      </Dialog>
    </div>
  )
}
