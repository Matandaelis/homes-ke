import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { PROPERTIES } from '@/data/properties'
import { DEFAULT_FILTERS, type Property, type SavedSearch, type SearchFilters } from '@/types'

interface MarketplaceState {
  favorites: string[]
  toggleFavorite: (id: string) => void
  isFavorite: (id: string) => boolean
  savedSearches: SavedSearch[]
  saveSearch: (name: string, filters: SearchFilters, alerts: boolean) => SavedSearch
  deleteSearch: (id: string) => void
  toggleSearchAlerts: (id: string) => void
  matchCount: (filters: SearchFilters) => number
  compareList: string[]
  toggleCompare: (id: string) => void
  isInCompare: (id: string) => boolean
  clearCompare: () => void
}

const MarketplaceContext = createContext<MarketplaceState | null>(null)

export function filterProperties(filters: SearchFilters, list: Property[] = PROPERTIES): Property[] {
  const q = filters.query.trim().toLowerCase()
  let out = list.filter((p) => {
    if (q && !`${p.title} ${p.address} ${p.city} ${p.state}`.toLowerCase().includes(q)) return false
    if (filters.type !== 'Any' && p.type !== filters.type) return false
    if (filters.minPrice !== null && p.price < filters.minPrice) return false
    if (filters.maxPrice !== null && p.price > filters.maxPrice) return false
    if (p.beds < filters.minBeds) return false
    if (p.baths < filters.minBaths) return false
    return true
  })
  switch (filters.sort) {
    case 'price-asc':
      out = [...out].sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      out = [...out].sort((a, b) => b.price - a.price)
      break
    case 'beds':
      out = [...out].sort((a, b) => b.beds - a.beds)
      break
    case 'sqft':
      out = [...out].sort((a, b) => b.sqft - a.sqft)
      break
    case 'newest':
      out = [...out].sort((a, b) => b.yearBuilt - a.yearBuilt)
      break
    default:
      break
  }
  return out
}

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useLocalStorage<string[]>('nestora:favorites', [])
  const [savedSearches, setSavedSearches] = useLocalStorage<SavedSearch[]>('nestora:saved-searches', [])
  const [compareList, setCompareList] = useLocalStorage<string[]>('nestora:compare', [])

  const toggleFavorite = useCallback(
    (id: string) => {
      setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
    },
    [setFavorites],
  )

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites])

  const saveSearch = useCallback(
    (name: string, filters: SearchFilters, alerts: boolean) => {
      const search: SavedSearch = {
        id: `s${Date.now()}`,
        name,
        filters,
        alerts,
        createdAt: Date.now(),
      }
      setSavedSearches((prev) => [search, ...prev])
      return search
    },
    [setSavedSearches],
  )

  const deleteSearch = useCallback(
    (id: string) => setSavedSearches((prev) => prev.filter((s) => s.id !== id)),
    [setSavedSearches],
  )

  const toggleSearchAlerts = useCallback(
    (id: string) => setSavedSearches((prev) => prev.map((s) => (s.id === id ? { ...s, alerts: !s.alerts } : s))),
    [setSavedSearches],
  )

  const matchCount = useCallback((filters: SearchFilters) => filterProperties({ ...DEFAULT_FILTERS, ...filters }).length, [])

  const toggleCompare = useCallback(
    (id: string) => {
      setCompareList((prev) =>
        prev.includes(id) ? prev.filter((c) => c !== id) : prev.length >= 3 ? prev : [...prev, id],
      )
    },
    [setCompareList],
  )

  const isInCompare = useCallback((id: string) => compareList.includes(id), [compareList])

  const clearCompare = useCallback(() => setCompareList([]), [setCompareList])

  const value = useMemo(
    () => ({
      favorites,
      toggleFavorite,
      isFavorite,
      savedSearches,
      saveSearch,
      deleteSearch,
      toggleSearchAlerts,
      matchCount,
      compareList,
      toggleCompare,
      isInCompare,
      clearCompare,
    }),
    [favorites, toggleFavorite, isFavorite, savedSearches, saveSearch, deleteSearch, toggleSearchAlerts, matchCount, compareList, toggleCompare, isInCompare, clearCompare],
  )

  return <MarketplaceContext.Provider value={value}>{children}</MarketplaceContext.Provider>
}

export function useMarketplace() {
  const ctx = useContext(MarketplaceContext)
  if (!ctx) throw new Error('useMarketplace must be used within MarketplaceProvider')
  return ctx
}
