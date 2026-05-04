export interface Product {
  id: string
  name: string
  slug: string
  price: number
  originalPrice?: number
  category: string
  description: string
  image: string
  badge?: "nouveau" | "promo" | "bestseller"
  stock: number
  createdAt: string
}

export const categories = [
  { id: "maison", name: "Maison" },
  { id: "mode", name: "Mode" },
  { id: "beaute", name: "Beauté" },
  { id: "tech", name: "Tech" },
  { id: "cuisine", name: "Cuisine" },
  { id: "sport", name: "Sport" },
]

export function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}
