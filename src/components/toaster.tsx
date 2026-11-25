import { useToasts } from "@/lib/toast"
import { cn } from "@/lib/utils"

export default function Toaster() {
  const toasts = useToasts()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 left-1/2 z-[80] flex w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 flex-col gap-2" aria-live="polite">
      {toasts.map((item) => (
        <div
          key={item.id}
          role="status"
          className={cn(
            "rounded-lg border bg-popover px-4 py-3 text-sm text-popover-foreground shadow-lg",
            item.kind === "error" && "border-destructive/40 text-destructive",
          )}
        >
          {item.message}
        </div>
      ))}
    </div>
  )
}
