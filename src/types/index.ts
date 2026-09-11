export type PropertyType = 'House' | 'Condo' | 'Townhouse' | 'Cabin' | 'Villa'

export interface Property {
  id: string
  title: string
  address: string
  city: string
  state: string
  price: number
  beds: number
  baths: number
  sqft: number
  lotSqft?: number
  type: PropertyType
  yearBuilt: number
  image: string
  images: string[]
  features: string[]
  isNew?: boolean
  openHouse?: string
  description: string
  pricePerSqft: number
}

export type SortOption = 'recommended' | 'price-asc' | 'price-desc' | 'beds' | 'sqft' | 'newest'

export interface SearchFilters {
  query: string
  type: PropertyType | 'Any'
  minPrice: number | null
  maxPrice: number | null
  minBeds: number
  minBaths: number
  sort: SortOption
}

export interface SavedSearch {
  id: string
  name: string
  filters: SearchFilters
  alerts: boolean
  createdAt: number
}

export const DEFAULT_FILTERS: SearchFilters = {
  query: '',
  type: 'Any',
  minPrice: null,
  maxPrice: null,
  minBeds: 0,
  minBaths: 0,
  sort: 'recommended',
}

export const PROPERTY_TYPES: PropertyType[] = ['House', 'Condo', 'Townhouse', 'Cabin', 'Villa']

export type ListingStatus = 'pending' | 'active' | 'rejected' | 'sold' | 'withdrawn'

export interface Listing {
  id: string
  title: string
  address: string
  city: string
  state: string
  price: number
  beds: number
  baths: number
  sqft: number
  lot_sqft: number | null
  property_type: PropertyType
  year_built: number
  description: string
  image_url: string | null
  seller_name: string
  seller_email: string
  seller_phone: string | null
  status: ListingStatus
  rejection_reason: string | null
  created_at: string
  updated_at: string
}

export function listingToProperty(l: Listing): Property {
  return {
    id: l.id,
    title: l.title,
    address: l.address,
    city: l.city,
    state: l.state,
    price: l.price,
    beds: l.beds,
    baths: l.baths,
    sqft: l.sqft,
    lotSqft: l.lot_sqft ?? undefined,
    type: l.property_type,
    yearBuilt: l.year_built,
    image: l.image_url ?? '/images/h1.jpg',
    images: l.image_url ? [l.image_url] : ['/images/h1.jpg', '/images/h1b.jpg', '/images/h1c.jpg'],
    features: [],
    isNew: true,
    description: l.description,
    pricePerSqft: l.sqft > 0 ? Math.round(l.price / l.sqft) : 0,
  }
}
