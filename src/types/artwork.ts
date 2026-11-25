export interface Artwork {
  id: number
  title: string | null
  description: string | null
  alt_text: string
  image_url: string
  category: { name: string; slug: string } | null
  view_count: number
  like_count: number
  created_at: string | null
}
