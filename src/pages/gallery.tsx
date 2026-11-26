import { ChevronLeft } from "lucide-react"
import { useEffect, useState } from "react"
import ArtworkHoverCue from "@/components/ArtworkHoverCue"
import FilterBar from "@/components/FilterBar"
import { artworks, categories } from "@/data/artworks"
import { useTranslation } from "@/lib/i18n"
import type { Artwork } from "@/types/artwork"

// Port of pages/gallery/index.tsx. The main project pages 18 artworks per
// request; the prototype paginates the same way on the client.
const PER_PAGE = 18

const masonryAspects = ["aspect-[3/4]", "aspect-[1/1]", "aspect-[4/5]", "aspect-[5/6]", "aspect-[3/4]", "aspect-[4/3]"] as const

export default function Gallery({ onSelect }: { onSelect: (artwork: Artwork) => void }) {
  const { t } = useTranslation()
  const [activeCategory, setActiveCategory] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const filtered = activeCategory === "" ? artworks : artworks.filter((artwork) => artwork.category?.name === activeCategory)
  const lastPage = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const pageItems = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

  useEffect(() => setCurrentPage(1), [activeCategory])

  const goTo = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const pageButton = "flex h-10 w-10 items-center justify-center rounded-full border border-border/15 text-foreground transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"

  return (
    <main id="gallery">
      <section className="mx-auto max-w-[1440px] px-5 pt-14 pb-10 sm:px-8 sm:pt-20 sm:pb-12 lg:px-12 lg:pt-24">
        <div className="text-center">
          <p className="mb-5 flex items-center gap-3 text-[10px] font-semibold tracking-[0.24em] uppercase sm:text-xs justify-center">
            <span className="h-px w-8 bg-primary-blue" />
            {t("gallery.eyebrow")}
          </p>
          <h1 className="max-w-4xl font-display text-[clamp(3.75rem,10vw,8.75rem)] leading-[0.82] tracking-[-0.055em] mx-auto">
            {t("gallery.heading_1")}
            <br />
            <span className="text-primary-blue italic">{t("gallery.heading_2")}</span>
          </h1>
          <div className="mx-auto mt-8 flex w-72 max-w-full flex-col items-center gap-3 border-t border-border/20 pt-4 text-center lg:mt-12">
            <p className="text-sm leading-6 text-muted-foreground">{t("gallery.quote")}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 pb-20 sm:px-8 sm:pb-28 lg:px-12" aria-label={t("gallery.aria_collection")}>
        <FilterBar active={activeCategory} onChange={setActiveCategory} categories={categories.map((category) => category.name)} />

        <div className="columns-2 gap-4 sm:columns-3 sm:gap-5 lg:columns-6 lg:gap-6">
          {pageItems.map((artwork, index) => (
            <article key={artwork.id} className="group break-inside-avoid bg-card hover:z-20">
              <button
                type="button"
                onClick={() => onSelect(artwork)}
                className="group/image relative block w-full cursor-zoom-in overflow-hidden hover:z-10"
                aria-label={t("artwork.open", { title: artwork.title || t("artwork.untitled") })}
              >
                <div className={`bg-card ${masonryAspects[index % masonryAspects.length]}`}>
                  <img
                    src={artwork.image_url}
                    alt={artwork.alt_text}
                    className="h-full w-full rounded-lg object-contain transition-transform duration-700 ease-out group-hover/image:scale-[1.3]"
                    loading="lazy"
                  />
                </div>
                <ArtworkHoverCue />
              </button>
              <div className="border-t border-border/15 p-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-display text-base leading-tight tracking-[-0.02em] sm:text-lg">{artwork.title || t("artwork.untitled")}</h2>
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-blue transition-transform duration-300 group-hover:scale-150" aria-hidden="true" />
                </div>
                <p className="mt-1.5 text-[9px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  {artwork.category?.name || t("artwork.gallery_piece")}
                </p>
              </div>
            </article>
          ))}
        </div>

        {lastPage > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            {currentPage > 1 && (
              <button type="button" onClick={() => goTo(currentPage - 1)} className={pageButton} aria-label={t("gallery.previous_page")}>
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <span className="text-sm text-muted-foreground">{t("gallery.page_of", { current: currentPage, last: lastPage })}</span>
            {currentPage < lastPage && (
              <button type="button" onClick={() => goTo(currentPage + 1)} className={pageButton} aria-label={t("gallery.next_page")}>
                <ChevronLeft className="h-5 w-5 rotate-180" />
              </button>
            )}
          </div>
        )}
      </section>
    </main>
  )
}
