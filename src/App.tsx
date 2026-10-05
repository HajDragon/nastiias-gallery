import { useEffect, useRef, useState } from "react"
import IntroAnimation from "./components/ui/scroll-morph-hero"

const categories = [
  "Abstract",

  "Geometric",

  "Color Field",

  "Expressionism",

  "Minimalism",
] as const

type Category = typeof categories[number]

type Page = "home" | "gallery"

const paintings = [
  {
    name: "Vermilion Weather",

    category: "Expressionism",

    image:
      "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&w=1200&q=85",

    alt: "Red, blue, and yellow abstract painting",
  },

  {
    name: "A Quiet Current",

    category: "Minimalism",

    image:
      "https://images.unsplash.com/photo-1618331833071-ce81bd50d300?auto=format&fit=crop&w=1200&q=85",

    alt: "Blue, white, and yellow abstract painting",
  },

  {
    name: "The Shape of Memory",

    category: "Geometric",

    image:
      "https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=1200&q=85",

    alt: "Colorful geometric abstract painting",
  },

  {
    name: "Soft Geometry",

    category: "Geometric",

    image:
      "https://images.unsplash.com/photo-1533208087231-c3618eab623c?auto=format&fit=crop&w=1200&q=85",

    alt: "Pastel abstract painting",
  },

  {
    name: "In Bloom",

    category: "Abstract",

    image:
      "https://images.unsplash.com/photo-1533157950006-c38844053d55?auto=format&fit=crop&w=1200&q=85",

    alt: "White and red abstract painting",
  },

  {
    name: "Blue Hour",

    category: "Color Field",

    image:
      "https://images.unsplash.com/photo-1531489956451-20957fab52f2?auto=format&fit=crop&w=1200&q=85",

    alt: "Deep blue abstract painting",
  },

  {
    name: "Garden After Rain",

    category: "Abstract",

    image:
      "https://images.unsplash.com/photo-1618331835717-801e976710b2?auto=format&fit=crop&w=1200&q=85",

    alt: "Yellow, green, and white abstract painting",
  },

  {
    name: "Between Two Tides",

    category: "Expressionism",

    image:
      "https://images.unsplash.com/photo-1586032788085-d75f745f26e0?auto=format&fit=crop&w=1200&q=85",

    alt: "Red, blue, and white abstract painting",
  },

  {
    name: "The Last Light",

    category: "Color Field",

    image:
      "https://images.unsplash.com/photo-1531913764164-f85c52e6e654?auto=format&fit=crop&w=1200&q=85",

    alt: "Blue and red abstract painting",
  },
]

type Painting = typeof paintings[number]

const masonryAspects = [
  "aspect-[3/4]",

  "aspect-[1/1]",

  "aspect-[4/5]",

  "aspect-[5/6]",

  "aspect-[3/4]",

  "aspect-[4/3]",
] as const

function FilterBar({
  active,

  onChange,
}: {
  active: "All" | Category

  onChange: (category: "All" | Category) => void
}) {
  return (
    <div className="mb-10 border-y border-[#293241]/15 py-3 sm:mb-12">
      <div
        className="-mx-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden"
        role="group"
        aria-label="Filter paintings by category"
      >
        {(["All", ...categories] as const).map((category) => {
          const isActive = active === category

          return (
            <button
              key={category}
              type="button"
              onClick={() => onChange(category)}
              className={`shrink-0 rounded-full border px-4 py-2 text-[10px] font-semibold tracking-[0.15em] uppercase transition-colors sm:text-[11px] ${
                isActive
                  ? "border-[#293241] bg-[#293241] text-[#F0F7FF]"
                  : "border-[#293241]/20 text-[#293241] hover:border-[#98C1D9] hover:bg-[#98C1D9]/20"
              }`}
              aria-pressed={isActive}
            >
              {category}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ArtworkHoverCue() {
  return (
    <span
      className="artwork-hover-cue pointer-events-none absolute inset-0 z-10 grid place-items-center bg-[#293241]/10 opacity-0 group-hover/image:animate-[fadeCue_1.5s_ease-in-out_forwards]"
      aria-hidden="true"
    >
      <span className="relative flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-full bg-[#F0F7FF]/95 text-[#293241] shadow-xl backdrop-blur-sm">
        <span className="artwork-click-ring absolute inset-0 rounded-full border border-[#F0F7FF]" />
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <path
            d="m8.5 3.5 8.8 8.8-4 .9 2.3 4-2.2 1.3-2.3-4-2.9 3.1.3-14.1Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M14.5 3v-2M19 5l1.5-1.5M20.5 9h2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <span className="text-[9px] font-semibold tracking-[0.14em] uppercase">
          Click me!
        </span>
      </span>
    </span>
  )
}

function FeedCard({
  painting,
  liked,
  onSelect,
  onLike,
}: {
  painting: Painting
  liked: boolean
  onSelect: (painting: Painting) => void
  onLike: (painting: Painting) => void
}) {
  const lastTapRef = useRef(0)
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const burstTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [burstKey, setBurstKey] = useState(0)
  // landscape/square art gets letterbox bars so the whole piece stays visible;
  // portrait art fills the screen edge to edge (no bars)
  const [fitMode, setFitMode] = useState<"cover" | "contain">("cover")

  useEffect(() => {
    return () => {
      if (openTimerRef.current) clearTimeout(openTimerRef.current)
      if (burstTimerRef.current) clearTimeout(burstTimerRef.current)
    }
  }, [])

  const handleTap = () => {
    const now = Date.now()

    // second tap within 300ms = like, cancel the pending open
    if (now - lastTapRef.current < 300) {
      lastTapRef.current = 0

      if (openTimerRef.current) clearTimeout(openTimerRef.current)

      onLike(painting)
      setBurstKey((key) => key + 1)

      // hard guarantee: heart element is removed exactly 1s after the double-tap
      if (burstTimerRef.current) clearTimeout(burstTimerRef.current)
      burstTimerRef.current = setTimeout(() => setBurstKey(0), 1000)
      return
    }

    lastTapRef.current = now
    openTimerRef.current = setTimeout(() => onSelect(painting), 300)
  }

  return (
    <article className="relative h-[100dvh] snap-start snap-always touch-manipulation overflow-hidden bg-[#293241]">
      <button
        type="button"
        onClick={handleTap}
        className="group/image absolute inset-0 block w-full text-left"
        aria-label={`Double-tap ${painting.name} to like, tap to open`}
      >
        <img
          src={painting.image}
          alt={painting.alt}
          className={`h-full w-full ${
            fitMode === "contain" ? "object-contain" : "object-cover"
          }`}
          loading="lazy"
          onLoad={(event) => {
            const img = event.currentTarget
            setFitMode(
              img.naturalWidth >= img.naturalHeight ? "contain" : "cover",
            )
          }}
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#293241]/85 via-[#293241]/30 to-transparent" />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-5 pb-8">
          <div className="min-w-0">
            <h2 className="font-display text-3xl text-[#F0F7FF] drop-shadow-sm">
              {painting.name}
            </h2>
            <p className="mt-1.5 text-[10px] font-semibold tracking-[0.18em] text-[#F0F7FF]/75 uppercase">
              {painting.category}
            </p>
          </div>
          <svg
            viewBox="0 0 24 24"
            className={`h-7 w-7 shrink-0 drop-shadow-md ${
              liked ? "text-[#E63946]" : "text-[#F0F7FF]/40"
            }`}
            aria-hidden="true"
          >
            <path
              d="M20.8 4.9a5.5 5.5 0 0 0-7.8 0L12 5.9l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.5l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8Z"
              fill={liked ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <ArtworkHoverCue />

        {burstKey > 0 && (
          <span
            key={burstKey}
            className="heart-burst pointer-events-none absolute inset-0 z-20 grid place-items-center"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-40 w-40 drop-shadow-[0_8px_24px_rgba(41,50,65,0.45)]"
            >
              <path
                d="M20.8 4.9a5.5 5.5 0 0 0-7.8 0L12 5.9l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.5l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8Z"
                fill="#F0F7FF"
                stroke="#293241"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
      </button>
    </article>
  )
}

function ArtworkModal({
  painting,

  liked,

  comments,

  onClose,

  onToggleLike,

  onAddComment,
}: {
  painting: Painting

  liked: boolean

  comments: string[]

  onClose: () => void

  onToggleLike: () => void

  onAddComment: (comment: string) => void
}) {
  const [comment, setComment] = useState("")

  const submitComment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedComment = comment.trim()

    if (!trimmedComment) return

    onAddComment(trimmedComment)

    setComment("")
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#293241]/85 p-0 backdrop-blur-sm sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        className="grid h-full w-full overflow-hidden bg-[#F0F7FF] shadow-2xl sm:h-auto sm:max-h-[88vh] sm:max-w-5xl sm:grid-cols-[1.15fr_0.85fr]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="artwork-dialog-title"
      >
        <div className="min-h-0 bg-[#293241] sm:h-[min(82vh,760px)]">
          <img
            src={painting.image}
            alt={painting.alt}
            className="h-full max-h-[46vh] w-full object-contain sm:max-h-none"
          />
        </div>

        <div className="flex min-h-0 flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-[#293241]/15 px-5 py-5 sm:px-6">
            <div>
              <p className="mb-1 text-[9px] font-semibold tracking-[0.18em] text-[#293241]/50 uppercase">
                {painting.category}
              </p>
              <h2
                id="artwork-dialog-title"
                className="font-display text-2xl tracking-[-0.025em] sm:text-3xl"
              >
                {painting.name}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#293241]/15 transition-colors hover:bg-[#98C1D9]/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#293241]"
              aria-label="Close artwork"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path
                  d="M6 6l12 12M18 6 6 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            {comments.length > 0 ? (
              <div className="space-y-5">
                {comments.map((item, index) => (
                  <div
                    key={`${painting.name}-comment-${index}`}
                    className="flex gap-3"
                  >
                    <span
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#98C1D9]/35 text-[10px] font-semibold"
                      aria-hidden="true"
                    >
                      Y
                    </span>
                    <p className="pt-1 text-sm leading-6">
                      <span className="mr-2 font-semibold">You</span>
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full min-h-24 items-center justify-center text-center">
                <div>
                  <p className="font-display text-xl">
                    Start the conversation.
                  </p>
                  <p className="mt-1 text-xs text-[#293241]/55">
                    Share what this piece makes you feel.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-[#293241]/15">
            <button
              type="button"
              onClick={onToggleLike}
              className={`flex w-full items-center gap-3 px-5 py-4 text-left text-xs font-semibold tracking-[0.15em] uppercase transition-colors sm:px-6 ${
                liked
                  ? "text-[#293241]"
                  : "text-[#293241]/65 hover:text-[#293241]"
              }`}
              aria-pressed={liked}
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
                <path
                  d="M20.8 4.9a5.5 5.5 0 0 0-7.8 0L12 5.9l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.5l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8Z"
                  fill={liked ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
              {liked ? "Liked" : "Like this artwork"}
            </button>

            <form
              className="flex items-center gap-3 border-t border-[#293241]/15 px-5 py-3 sm:px-6"
              onSubmit={submitComment}
            >
              <label htmlFor="artwork-comment" className="sr-only">
                Add a comment
              </label>
              <input
                id="artwork-comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Add a comment..."
                className="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm outline-none placeholder:text-[#293241]/40"
              />
              <button
                type="submit"
                disabled={!comment.trim()}
                className="text-[10px] font-semibold tracking-[0.16em] uppercase transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
              >
                Post
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [activeCategory, setActiveCategory] = useState<"All" | Category>("All")

  const [selectedPainting, setSelectedPainting] = useState<Painting | null>(
    null,
  )

  const [likedPaintings, setLikedPaintings] = useState<Set<string>>(new Set())

  const [comments, setComments] = useState<Record<string, string[]>>({})

  const [page, setPage] = useState<Page>(() => {
    if (typeof window === "undefined") return "home"

    if (window.location.hash === "#gallery") return "gallery"

    return "home"
  })

  const visiblePaintings =
    activeCategory === "All"
      ? paintings
      : paintings.filter((painting) => painting.category === activeCategory)

  useEffect(() => {
    const syncPageWithHash = () => {
      const hash = window.location.hash

      if (hash === "#gallery") {
        setPage("gallery")
      } else if (hash === "#top") {
        setPage("home")
      }

      // other hashes (#contact) scroll without changing page
    }

    window.addEventListener("hashchange", syncPageWithHash)

    return () => window.removeEventListener("hashchange", syncPageWithHash)
  }, [])

  useEffect(() => {
    if (!selectedPainting) return

    const previousOverflow = document.body.style.overflow

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedPainting(null)
    }

    document.body.style.overflow = "hidden"

    window.addEventListener("keydown", closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow

      window.removeEventListener("keydown", closeOnEscape)
    }
  }, [selectedPainting])

  const likePainting = (painting: Painting) => {
    setLikedPaintings((current) => {
      if (current.has(painting.name)) return current

      const next = new Set(current)

      next.add(painting.name)

      return next
    })
  }

  const toggleSelectedPaintingLike = () => {
    if (!selectedPainting) return

    setLikedPaintings((current) => {
      const next = new Set(current)

      if (next.has(selectedPainting.name)) {
        next.delete(selectedPainting.name)
      } else {
        next.add(selectedPainting.name)
      }

      return next
    })
  }

  const addSelectedPaintingComment = (comment: string) => {
    if (!selectedPainting) return

    setComments((current) => ({
      ...current,

      [selectedPainting.name]: [
        ...(current[selectedPainting.name] ?? []),

        comment,
      ],
    }))
  }

  return (
    <div className="min-h-screen bg-[#F0F7FF] text-[#293241]">
      <header className="border-b border-[#F0F7FF]/15 bg-[#293241] text-[#F0F7FF]">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-4 px-5 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-5 sm:px-8 lg:px-12">
          <a
            href="#top"
            className="flex w-full justify-center"
            aria-label="Nastiia's Gallery home"
          >
            <img
              src="/nastias-gallery-logo.png"
              alt=""
              width={1067}
              height={772}
              className="m-0 h-32 w-auto max-w-[80vw] pt-4 object-contain object-center invert"
            />
          </a>
          <nav
            className="flex w-full min-w-0 items-center justify-between gap-1 overflow-x-auto rounded-full border border-[#F0F7FF]/15 p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:w-auto sm:justify-start"
            aria-label="Main"
          >
            <a
              href="#top"
              className={`shrink-0 rounded-full px-2.5 py-2 text-[8px] font-semibold tracking-[0.14em] uppercase transition-colors whitespace-nowrap sm:px-4 sm:text-[10px] ${
                page === "home"
                  ? "bg-[#F0F7FF] text-[#293241]"
                  : "hover:bg-[#F0F7FF]/10"
              }`}
              aria-current={page === "home" ? "page" : undefined}
            >
              Home
            </a>
            <a
              href="#gallery"
              className={`shrink-0 rounded-full px-2.5 py-2 text-[8px] font-semibold tracking-[0.14em] uppercase transition-colors whitespace-nowrap sm:px-4 sm:text-[10px] ${
                page === "gallery"
                  ? "bg-[#F0F7FF] text-[#293241]"
                  : "hover:bg-[#F0F7FF]/10"
              }`}
              aria-current={page === "gallery" ? "page" : undefined}
            >
              Gallery
            </a>
            <a
              href="#contact"
              className="shrink-0 rounded-full px-2.5 py-2 text-[8px] font-semibold tracking-[0.14em] uppercase transition-colors whitespace-nowrap hover:bg-[#F0F7FF]/10 sm:px-4 sm:text-[10px]"
            >
              Contact us
            </a>
          </nav>
        </div>
      </header>

      {page === "home" ? (
        <main id="top">
          <section
            className="h-[100dvh] overflow-hidden"
            aria-label="Intro animation"
          >
            <IntroAnimation
              items={paintings}
              onSelect={(index) => setSelectedPainting(paintings[index])}
            />
          </section>

          <section
            id="art-library"
            className="mx-auto max-w-[1440px] px-5 pb-20 sm:px-8 sm:pb-28 lg:px-12"
            aria-label="Painting collection"
          >
            <h2 className="mb-6 font-display text-[clamp(2.5rem,7vw,4.5rem)] leading-[0.9] tracking-[-0.045em] sm:mb-8 pt-8">
              My <span className="italic text-[#98C1D9]">Art library</span>
            </h2>
            <p className="mb-8 max-w-2xl text-sm leading-7 text-[#293241]/70 sm:text-base sm:leading-8">
              Every canvas here is a quiet invitation — to pause, to feel, and
              to find the piece that speaks the moment you see it. Stay a while;
              the right work has a way of finding you.
            </p>

            <div className="sticky top-0 z-30 -mx-5 bg-[#F0F7FF] px-5 sm:static sm:z-auto sm:mx-0 sm:px-0">
              <FilterBar active={activeCategory} onChange={setActiveCategory} />
            </div>

            <p className="mt-2 mb-2 text-center text-[11px] font-semibold tracking-[0.3em] text-[#293241]/55 uppercase sm:hidden">
              Scroll ! ↓
            </p>

            <div className="h-[100dvh] snap-y snap-mandatory overflow-y-scroll [scrollbar-width:none] sm:hidden [&::-webkit-scrollbar]:hidden">
              {visiblePaintings.map((painting) => (
                <FeedCard
                  key={painting.name}
                  painting={painting}
                  liked={likedPaintings.has(painting.name)}
                  onSelect={setSelectedPainting}
                  onLike={likePainting}
                />
              ))}
            </div>

            <div className="hidden sm:grid grid-cols-1 gap-x-6 gap-y-12 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
              {visiblePaintings.map((painting, index) => (
                <article key={painting.name} className="group">
                  <button
                    type="button"
                    onClick={() => setSelectedPainting(painting)}
                    className="group/image relative block aspect-[4/5] w-full cursor-zoom-in overflow-hidden bg-[#98C1D9]/25 text-left hover:z-10"
                    aria-label={`Open ${painting.name}`}
                  >
                    <img
                      src={painting.image}
                      alt={painting.alt}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover/image:scale-[1.035]"
                      loading={index < 3 ? "eager" : "lazy"}
                      fetchPriority={index === 0 ? "high" : undefined}
                    />
                    <span className="absolute top-4 right-4 grid h-8 w-8 place-items-center rounded-full bg-[#F0F7FF]/90 text-[10px] font-semibold backdrop-blur-sm">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <ArtworkHoverCue />
                  </button>
                  <div className="mt-4 border-b border-[#293241]/20 pb-4">
                    <div className="flex items-baseline justify-between gap-4">
                      <h2 className="font-display text-2xl leading-tight tracking-[-0.02em] sm:text-[1.65rem]">
                        {painting.name}
                      </h2>
                      <span
                        className="h-2 w-2 shrink-0 rounded-full bg-[#98C1D9] transition-transform duration-300 group-hover:scale-150"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="mt-2 text-[10px] font-semibold tracking-[0.18em] text-[#293241]/55 uppercase">
                      {painting.category}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>
      ) : (
        <main id="gallery">
          <section className="mx-auto max-w-[1440px] px-5 pt-14 pb-10 sm:px-8 sm:pt-20 sm:pb-12 lg:px-12 lg:pt-24">
            <div className="lg:text-center">
              <p className="mb-5 flex items-center gap-3 text-[10px] font-semibold tracking-[0.24em] uppercase sm:text-xs lg:justify-center">
                <span className="h-px w-8 bg-[#98C1D9]" />
                The dense hang
              </p>
              <h1 className="font-display max-w-4xl text-[clamp(3.75rem,10vw,8.75rem)] leading-[0.82] tracking-[-0.055em] lg:mx-auto">
                Wall to
                <br />
                <span className="italic text-[#98C1D9]">wall.</span>
              </h1>
              <div className="mt-8 flex items-end justify-between border-t border-[#293241]/20 pt-4 lg:mx-auto lg:mt-12 lg:w-72 lg:flex-col lg:items-center lg:gap-3 lg:text-center">
                <p className="max-w-48 text-sm leading-6 text-[#293241]/70 lg:max-w-none">
                  Two columns on mobile, six on desktop — every work in one
                  frame.
                </p>
              </div>
            </div>
          </section>

          <section
            className="mx-auto max-w-[1440px] px-5 pb-20 sm:px-8 sm:pb-28 lg:px-12"
            aria-label="Painting masonry collection"
          >
            <FilterBar active={activeCategory} onChange={setActiveCategory} />

            <div className="columns-2 gap-4 sm:columns-3 sm:gap-5 lg:columns-6 lg:gap-6">
              {visiblePaintings.map((painting, index) => (
                <article
                  key={painting.name}
                  className="group relative mb-4 break-inside-avoid hover:z-20 sm:mb-5 lg:mb-6"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedPainting(painting)}
                    className={`group/image relative block w-full cursor-zoom-in overflow-visible bg-[#98C1D9]/25 hover:z-10 ${
                      masonryAspects[index % masonryAspects.length]
                    }`}
                    aria-label={`Open ${painting.name}`}
                  >
                    <img
                      src={painting.image}
                      alt={painting.alt}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover/image:scale-[1.3]"
                      loading="lazy"
                    />
                    <ArtworkHoverCue />
                  </button>
                  <div className="flex items-center justify-between gap-2 border-b border-[#293241]/20 py-3">
                    <h2 className="font-display text-base leading-tight tracking-[-0.02em] sm:text-lg">
                      {painting.name}
                    </h2>
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#98C1D9] transition-transform duration-300 group-hover:scale-150"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="mt-1.5 text-[9px] font-semibold tracking-[0.18em] text-[#293241]/55 uppercase">
                    {painting.category}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </main>
      )}

      {selectedPainting && (
        <ArtworkModal
          painting={selectedPainting}
          liked={likedPaintings.has(selectedPainting.name)}
          comments={comments[selectedPainting.name] ?? []}
          onClose={() => setSelectedPainting(null)}
          onToggleLike={toggleSelectedPaintingLike}
          onAddComment={addSelectedPaintingComment}
        />
      )}

      <footer id="contact" className="bg-[#293241] text-[#F0F7FF]">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-12 lg:py-20">
          <div className="flex flex-col justify-between gap-10">
            <div>
              <p className="mb-4 text-[10px] font-semibold tracking-[0.22em] text-[#98C1D9] uppercase">
                Contact us
              </p>
              <h2 className="font-display max-w-md text-4xl leading-[0.95] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                Let&apos;s talk about art.
              </h2>
              <p className="mt-5 max-w-sm text-sm leading-6 text-[#F0F7FF]/65">
                Questions about a work, an artist, or a future visit? Send us a
                note and we&apos;ll be in touch.
              </p>
            </div>
          </div>

          <form
            className="grid gap-6"
            aria-label="Contact Stillhouse Gallery"
            onSubmit={(event) => event.preventDefault()}
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="grid gap-2 text-[10px] font-semibold tracking-[0.18em] uppercase">
                Name
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  required
                  placeholder="Your name"
                  className="border-0 border-b border-[#F0F7FF]/30 bg-transparent px-0 py-3 text-base tracking-normal text-[#F0F7FF] normal-case outline-none transition-colors placeholder:text-[#F0F7FF]/35 focus:border-[#98C1D9]"
                />
              </label>
              <label className="grid gap-2 text-[10px] font-semibold tracking-[0.18em] uppercase">
                Email
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  className="border-0 border-b border-[#F0F7FF]/30 bg-transparent px-0 py-3 text-base tracking-normal text-[#F0F7FF] normal-case outline-none transition-colors placeholder:text-[#F0F7FF]/35 focus:border-[#98C1D9]"
                />
              </label>
            </div>
            <label className="grid gap-2 text-[10px] font-semibold tracking-[0.18em] uppercase">
              Message
              <textarea
                name="message"
                required
                rows={4}
                placeholder="Tell us how we can help"
                className="resize-none border-0 border-b border-[#F0F7FF]/30 bg-transparent px-0 py-3 text-base leading-6 tracking-normal text-[#F0F7FF] normal-case outline-none transition-colors placeholder:text-[#F0F7FF]/35 focus:border-[#98C1D9]"
              />
            </label>
            <button
              type="submit"
              className="mt-2 flex w-full items-center justify-between rounded-full bg-[#98C1D9] px-6 py-4 text-xs font-semibold tracking-[0.18em] text-[#293241] uppercase transition-colors hover:bg-[#F0F7FF] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#98C1D9] sm:w-auto sm:min-w-52"
            >
              Send message
              <span aria-hidden="true">→</span>
            </button>
          </form>
        </div>
      </footer>
    </div>
  )
}
