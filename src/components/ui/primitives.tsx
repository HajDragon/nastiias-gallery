import { CheckIcon, XIcon } from "lucide-react"
import * as React from "react"
import { createPortal } from "react-dom"
import { useTranslation } from "@/lib/i18n"
import { cn } from "@/lib/utils"

// Dependency-free stand-ins for the radix primitives the main project uses
// (label, checkbox, separator, avatar, dialog, dropdown menu), with the same
// shadcn classes so the ported pages look identical.

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn(
        "text-sm leading-none font-medium text-foreground select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  )
}

export function Checkbox({ className, ...props }: Omit<React.ComponentProps<"input">, "type">) {
  return (
    <span className={cn("relative inline-grid size-4 shrink-0", className)}>
      <input
        type="checkbox"
        className="peer size-4 cursor-pointer appearance-none rounded-[4px] border border-input shadow-xs transition-shadow outline-none checked:border-primary checked:bg-primary focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
      />
      <CheckIcon className="pointer-events-none absolute inset-0 m-auto hidden size-3.5 text-primary-foreground peer-checked:block" />
    </span>
  )
}

export function Separator({ className }: { className?: string }) {
  return <div role="separator" className={cn("h-px w-full shrink-0 bg-border", className)} />
}

export function Avatar({
  src,
  alt,
  fallback,
  className,
  fallbackClassName,
}: {
  src?: string | null
  alt?: string
  fallback: React.ReactNode
  className?: string
  fallbackClassName?: string
}) {
  const [failed, setFailed] = React.useState(false)
  React.useEffect(() => setFailed(false), [src])

  return (
    <span className={cn("relative flex size-8 shrink-0 overflow-hidden rounded-full", className)}>
      {src && !failed ? (
        <img src={src} alt={alt} onError={() => setFailed(true)} className="aspect-square size-full object-cover" />
      ) : (
        <span className={cn("flex size-full items-center justify-center rounded-full bg-muted", fallbackClassName)}>
          {fallback}
        </span>
      )}
    </span>
  )
}

export function Dialog({
  open,
  onOpenChange,
  children,
  className,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  className?: string
}) {
  const { t } = useTranslation()

  React.useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onOpenChange(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onOpenChange])

  if (!open) return null

  return createPortal(
    <>
      <div className="fixed inset-0 z-50 bg-black/80" onClick={() => onOpenChange(false)} />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 text-foreground shadow-lg sm:max-w-lg",
          className,
        )}
      >
        {children}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden [&_svg]:size-4"
        >
          <XIcon />
          <span className="sr-only">{t("common.close")}</span>
        </button>
      </div>
    </>,
    document.body,
  )
}

export function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-2 text-center sm:text-left", className)} {...props} />
}

export function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />
}

export function DialogTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 className={cn("text-lg leading-none font-semibold", className)} {...props} />
}

export function DialogDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />
}

/** Click-to-open menu with the shadcn dropdown look; closes on outside click. */
export function DropdownMenu({
  trigger,
  children,
  align = "end",
  className,
}: {
  trigger: (props: { onClick: () => void; "aria-expanded": boolean }) => React.ReactNode
  children: (close: () => void) => React.ReactNode
  align?: "start" | "end"
  className?: string
}) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    const onDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false)
    document.addEventListener("mousedown", onDown)
    window.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      window.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      {trigger({ onClick: () => setOpen((value) => !value), "aria-expanded": open })}
      {open && (
        <div
          role="menu"
          className={cn(
            "absolute top-full z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
            align === "end" ? "right-0" : "left-0",
            className,
          )}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  )
}

export const dropdownItemClass =
  "relative flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent [&_svg]:size-4 [&_svg]:shrink-0"
