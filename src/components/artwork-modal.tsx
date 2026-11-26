import { Heart, X } from "lucide-react"
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent, type MouseEvent } from "react"
import { Avatar } from "@/components/ui/primitives"
import { useInitials } from "@/hooks/use-initials"
import { delay } from "@/lib/demo-auth"
import { setDemoState, useDemoState } from "@/lib/demo-store"
import { useTranslation } from "@/lib/i18n"
import { navigate } from "@/lib/router"
import type { Artwork } from "@/types/artwork"

const MAX_COMMENT = 280

/** Like state shared by the modal and the mobile feed's double-tap. */
export function useArtworkLike(artwork: Artwork) {
  const { user, likes, likeCounts } = useDemoState()
  const key = user ? `${user.email}:${artwork.id}` : null
  const liked = key ? likes[key] === true : false
  const likeCount = artwork.like_count + (likeCounts[artwork.id] ?? 0)

  const setLiked = (next: boolean) => {
    if (!key) return navigate("login")
    if (next === liked) return
    setDemoState((current) => ({
      ...current,
      likes: { ...current.likes, [key]: next },
      likeCounts: { ...current.likeCounts, [artwork.id]: (current.likeCounts[artwork.id] ?? 0) + (next ? 1 : -1) },
    }))
  }

  return { liked, likeCount, setLiked }
}

// Port of pages/gallery/show.tsx (ArtworkModal). The main project fetches and
// posts comments and likes over HTTP; here they live in the demo store.
export default function ArtworkModal({ artwork, onClose }: { artwork: Artwork; onClose: () => void }) {
  const { user, comments: allComments } = useDemoState()
  const { liked, likeCount, setLiked } = useArtworkLike(artwork)
  const comments = allComments[artwork.id] ?? []
  const [newComment, setNewComment] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)
  const commentTextareaRef = useRef<HTMLTextAreaElement>(null)
  const { t } = useTranslation()
  const getInitials = useInitials()

  useEffect(() => {
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    window.addEventListener("keydown", handleEscape)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      window.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose()
  }

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = commentTextareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${Math.min(textarea.scrollHeight, 128)}px`
    }
  }

  const handleCommentChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setNewComment(event.target.value)
    requestAnimationFrame(adjustTextareaHeight)
  }

  const handleCommentKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      event.currentTarget.closest("form")?.requestSubmit()
    }
  }

  const submitComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = newComment.trim()
    if (!trimmed || submittingComment) return
    if (!user) return navigate("login")

    setSubmittingComment(true)
    await delay(300)
    const comment = {
      id: Date.now(),
      body: trimmed,
      user: { display_name: user.display_name, avatar: user.avatar ?? null },
      created_at: new Date().toISOString(),
    }
    setDemoState((current) => ({
      ...current,
      comments: { ...current.comments, [artwork.id]: [comment, ...(current.comments[artwork.id] ?? [])] },
    }))
    setNewComment("")
    requestAnimationFrame(adjustTextareaHeight)
    setSubmittingComment(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#293241]/85 backdrop-blur-sm sm:p-6"
      role="presentation"
      onMouseDown={handleBackdropClick}
    >
      <div
        className="grid h-full w-full min-w-0 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-card shadow-2xl sm:h-[min(82vh,760px)] sm:max-w-5xl sm:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] sm:grid-rows-[minmax(0,1fr)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="artwork-dialog-title"
      >
        <div className="min-h-0 min-w-0 bg-[#293241] sm:h-full">
          <img src={artwork.image_url} alt={artwork.alt_text} className="h-full max-h-[46vh] w-full object-contain sm:max-h-none" />
        </div>

        <div className="flex min-h-0 min-w-0 flex-col sm:h-full">
          <div className="flex min-w-0 shrink-0 items-center gap-3 border-b border-border/15 px-4 py-3 sm:px-5">
            <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-[#293241]">
              <img src="/nastias-gallery-logo.png" alt="" className="h-5 w-auto object-contain invert" />
            </span>
            <p className="min-w-0 flex-1 truncate text-sm font-semibold">nastia.gallery</p>
            <button
              type="button"
              onClick={onClose}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border/15 transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              aria-label={t("artwork.close")}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="flex min-w-0 shrink-0 items-center gap-4 border-b border-border/15 px-4 py-3 sm:px-5">
            <button
              type="button"
              onClick={() => setLiked(!liked)}
              aria-pressed={liked}
              className={`flex items-center gap-2 text-xs font-semibold tracking-[0.15em] uppercase transition-colors ${
                liked ? "text-destructive" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Heart
                className="h-6 w-6"
                aria-hidden="true"
                fill={liked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinejoin="round"
              />
              {liked ? t("artwork.liked") : t("artwork.like")}
              <span className="text-sm">{likeCount}</span>
            </button>
          </div>

          <div className="min-h-0 min-w-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
            <div className="flex min-w-0 gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full bg-[#293241]">
                <img src="/nastias-gallery-logo.png" alt="" className="h-4 w-auto object-contain invert" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 id="artwork-dialog-title" className="font-display text-xl leading-tight tracking-[-0.02em] sm:text-2xl">
                  {artwork.title || t("artwork.untitled")}
                </h2>
                <p className="mt-1 text-[9px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  {artwork.category?.name || t("artwork.gallery_piece")}
                </p>
                <p className="mt-3 text-sm leading-6 [overflow-wrap:anywhere] text-foreground/85">
                  <span className="mr-1.5 font-semibold text-foreground">nastia.gallery</span>
                  {artwork.description || t("artwork.no_description")}
                </p>
              </div>
            </div>

            <div className="mt-5 border-t border-border/15 pt-5">
              {comments.length > 0 ? (
                <div className="space-y-5">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex min-w-0 gap-3">
                      <Avatar
                        src={comment.user.avatar}
                        alt={comment.user.display_name}
                        className="size-8 shrink-0"
                        fallback={getInitials(comment.user.display_name)}
                        fallbackClassName="bg-accent text-[10px] font-semibold text-accent-foreground"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="pt-1 text-sm leading-6 [overflow-wrap:anywhere] whitespace-pre-wrap">
                          <span className="mr-2 shrink-0 font-semibold">{comment.user.display_name}</span>
                          {comment.body}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-3 text-center">
                  <p className="font-display text-lg">{t("gallery.start_conversation")}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t("gallery.share_feeling")}</p>
                </div>
              )}
            </div>
          </div>

          <form
            className="flex min-w-0 shrink-0 flex-col gap-2 border-t border-border/15 px-4 py-3 sm:flex-row sm:items-center sm:px-5"
            onSubmit={submitComment}
          >
            <label htmlFor="artwork-comment" className="sr-only">
              {t("artwork.add_comment")}
            </label>
            <div className="min-w-0 flex-1">
              <textarea
                ref={commentTextareaRef}
                id="artwork-comment"
                value={newComment}
                onChange={handleCommentChange}
                onKeyDown={handleCommentKeyDown}
                placeholder={t("artwork.comment_placeholder")}
                maxLength={MAX_COMMENT}
                rows={1}
                className="w-full min-w-0 resize-none overflow-y-auto border-0 bg-transparent py-2 text-sm [overflow-wrap:anywhere] outline-none placeholder:text-muted-foreground/60"
                style={{ height: "auto", maxHeight: "128px" }}
              />
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span
                className={`text-[10px] font-semibold tracking-[0.16em] uppercase ${newComment.length > 250 ? "text-destructive" : "text-muted-foreground"}`}
              >
                {newComment.length}/{MAX_COMMENT}
              </span>
              <button
                type="submit"
                disabled={!newComment.trim() || submittingComment}
                className="text-[10px] font-semibold tracking-[0.16em] uppercase transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
              >
                {submittingComment ? t("artwork.posting") : t("artwork.post")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
