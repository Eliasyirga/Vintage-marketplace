export type ProductCondition = 'Brand New' | 'Like New' | 'Lightly Used' | 'Well Used' | 'Refurbished'

export interface Category {
  id: string
  name: string
  slug: string
  icon: string
  count: number
  description?: string
}

export interface Product {
  id: string
  title: string
  price: number // Price in ETB
  image: string
  condition: ProductCondition
  category: string
  location: string
  subCity?: string
  createdAt: string
  isFavorite?: boolean
  isVerifiedSeller?: boolean
  sellerName?: string
  sellerPhone?: string
  views?: number
  featured?: boolean
}
