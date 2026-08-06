import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router'
import { Search, SearchX } from 'lucide-react'
import { DEFAULT_FILTERS, PROPERTY_TYPES, type PropertyType, type SearchFilters } from '@/types'
import { PROPERTIES } from '@/data/properties'
import { filterProperties } from '@/context/MarketplaceContext'
import { fmtCompact } from '@/lib/mortgage'
import FilterBar from '@/components/FilterBar'
import PropertyCard from '@/components/PropertyCard'

const TYPE_ART: Record<PropertyType, string> = {
  House: '/images/h1.jpg',
  Condo: '/images/h9.jpg',
  Townhouse: '/images/h6.jpg',
  Cabin: '/images/h11.jpg',
  Villa: '/images/h5.jpg',
}

export default function BrowsePage() {
  const location = useLocation()
  const [params] = useSearchParams()
  const [filters, setFilters] = useState<SearchFilters>(() => ({
    ...DEFAULT_FILTERS,
    query: params.get('q') ?? '',
  }))
  const [heroQuery, setHeroQuery] = useState('')
  const listingsRef = useRef<HTMLDivElement>(null)

  // Applying a saved search navigates here with filters in location.state
  useEffect(() => {
    const incoming = (location.state as { filters?: SearchFilters } | null)?.filters
    if (incoming) {
      setFilters({ ...DEFAULT_FILTERS, ...incoming })
      window.history.replaceState({}, '')
    }
  }, [location.state])

  const results = useMemo(() => filterProperties(filters), [filters])
  const cities = useMemo(() => new Set(PROPERTIES.map((p) => p.city)).size, [])
  const avgPpsf = useMemo(
    () => Math.round(PROPERTIES.reduce((s, p) => s + p.pricePerSqft, 0) / PROPERTIES.length),
    [],
  )

  const applyHeroSearch = () => {
    setFilters((f) => ({ ...f, query: heroQuery }))
    listingsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const pickType = (t: PropertyType) => {
    setFilters((f) => ({ ...f, type: f.type === t ? 'Any' : t }))
    listingsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <img src="/images/hero.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-950/70 via-forest-950/45 to-forest-950/75" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 pb-24 pt-20 text-center sm:px-6 sm:pt-28">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-brass-300">
            Homes across the West & beyond
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl font-bold leading-[1.05] tracking-tight text-cream sm:text-6xl">
            Find the place you'll love to live
          </h1>
          <p className="mt-5 max-w-xl text-lg text-stone-200">
            Distinctive homes, honest numbers. Browse curated listings and know your payment before you fall in love.
          </p>

          <div className="mt-9 flex w-full max-w-xl items-center gap-2 rounded-full bg-white/95 p-2 shadow-2xl backdrop-blur">
            <Search className="ml-3 h-5 w-5 shrink-0 text-stone-400" />
            <input
              value={heroQuery}
              onChange={(e) => setHeroQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyHeroSearch()}
              placeholder="Try &quot;Portland&quot; or &quot;cottage&quot;…"
              className="w-full bg-transparent text-[15px] text-stone-900 outline-none placeholder:text-stone-400"
            />
            <button
              onClick={applyHeroSearch}
              className="shrink-0 rounded-full bg-forest-800 px-6 py-2.5 text-sm font-bold text-cream transition-colors hover:bg-forest-900"
            >
              Search
            </button>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-8 sm:gap-16">
            {[
              { v: String(PROPERTIES.length), l: 'Curated listings' },
              { v: String(cities), l: 'Cities covered' },
              { v: `$${avgPpsf}`, l: 'Avg $/sqft' },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <p className="font-display text-3xl font-bold text-cream sm:text-4xl">{s.v}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-stone-300">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by style */}
      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-brass-600">Collections</p>
            <h2 className="mt-1 font-display text-3xl font-bold text-stone-900">Browse by style</h2>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {PROPERTY_TYPES.map((t) => {
            const count = PROPERTIES.filter((p) => p.type === t).length
            const active = filters.type === t
            return (
              <button
                key={t}
                onClick={() => pickType(t)}
                className={`group relative overflow-hidden rounded-2xl text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${
                  active ? 'ring-2 ring-forest-700 ring-offset-2' : ''
                }`}
              >
                <img src={TYPE_ART[t]} alt={t} className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/75 via-stone-950/10 to-transparent" />
                <div className="absolute inset-x-3 bottom-3">
                  <p className="font-display text-lg font-bold text-white">{t}s</p>
                  <p className="text-xs font-medium text-white/75">{count} {count === 1 ? 'home' : 'homes'}</p>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Listings */}
      <div ref={listingsRef} className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-20 pt-14 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-brass-600">On the market</p>
            <h2 className="mt-1 font-display text-3xl font-bold text-stone-900">
              Homes for sale
              <span className="ml-2 text-lg font-normal text-stone-400">
                {results.length > 0 && `from ${fmtCompact(Math.min(...results.map((r) => r.price)))}`}
              </span>
            </h2>
          </div>
        </div>

        <div className="mt-6">
          <FilterBar filters={filters} onChange={setFilters} resultCount={results.length} />
        </div>

        {results.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
              <SearchX className="h-8 w-8 text-stone-400" />
            </span>
            <h2 className="mt-4 text-lg font-bold text-stone-800">No homes match these filters</h2>
            <p className="mt-1 text-sm text-stone-500">Try widening your price range or removing a filter or two.</p>
            <button
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="mt-4 rounded-full bg-forest-800 px-5 py-2 text-sm font-bold text-cream hover:bg-forest-900"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
