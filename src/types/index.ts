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
