import { useNavigate } from 'react-router'
import { Bell, BellOff, Bookmark, Heart, Play, Trash2 } from 'lucide-react'
import { useMarketplace } from '@/context/MarketplaceContext'
import { PROPERTIES } from '@/data/properties'
import PropertyCard from '@/components/PropertyCard'
import { fmtCompact } from '@/lib/mortgage'
import { Switch } from '@/components/ui/switch'

function describeFilters(s: { query: string; type: string; minPrice: number | null; maxPrice: number | null; minBeds: number; minBaths: number }) {
  const parts: string[] = []
  if (s.query) parts.push(`"${s.query}"`)
  if (s.type !== 'Any') parts.push(s.type)
  if (s.minPrice !== null || s.maxPrice !== null) {
    parts.push(
      `${s.minPrice !== null ? fmtCompact(s.minPrice) : 'Any'} – ${s.maxPrice !== null ? fmtCompact(s.maxPrice) : 'Any'}`,
    )
  }
  if (s.minBeds > 0) parts.push(`${s.minBeds}+ bd`)
  if (s.minBaths > 0) parts.push(`${s.minBaths}+ ba`)
  return parts.length ? parts.join(' · ') : 'All homes'
}

export default function SavedPage() {
  const navigate = useNavigate()
  const { favorites, savedSearches, deleteSearch, toggleSearchAlerts, matchCount } = useMarketplace()
  const savedHomes = PROPERTIES.filter((p) => favorites.includes(p.id))

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
      <section className="py-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">Saved</h1>
        <p className="mt-1 text-stone-500">Your saved searches and favorite homes, kept on this device.</p>
      </section>

      {/* Saved searches */}
      <section>
        <h2 className="flex items-center gap-2 font-display text-xl font-bold text-stone-900">
          <Bookmark className="h-5 w-5 text-forest-700" /> Saved searches
          <span className="text-sm font-normal text-stone-400">({savedSearches.length})</span>
        </h2>

        {savedSearches.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
            <p className="font-medium text-stone-700">No saved searches yet</p>
            <p className="mt-1 text-sm text-stone-500">
              Set filters on the Buy page and hit <span className="font-bold">Save search</span> to keep them here.
            </p>
          </div>
        ) : (
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {savedSearches.map((s) => (
              <li key={s.id} className="flex flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-stone-900">{s.name}</p>
                    <p className="mt-0.5 text-sm text-stone-500">{describeFilters(s.filters)}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-forest-50 px-2.5 py-1 text-xs font-bold text-forest-800">
                    {matchCount(s.filters)} matches
                  </span>
                </div>
                <p className="mt-1 text-xs text-stone-400">
                  Saved {new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                <div className="mt-4 flex flex-1 items-end gap-2 border-t border-stone-100 pt-4">
                  <button
                    onClick={() => navigate('/', { state: { filters: s.filters } })}
                    className="flex h-9 items-center gap-1.5 rounded-lg bg-forest-800 px-3.5 text-sm font-bold text-white hover:bg-forest-900"
                  >
                    <Play className="h-3.5 w-3.5" /> Run search
                  </button>
                  <button
                    onClick={() => deleteSearch(s.id)}
                    className="flex h-9 items-center gap-1.5 rounded-lg border border-stone-200 px-3.5 text-sm font-medium text-stone-600 hover:border-rose-200 hover:text-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                  <span className="ml-auto flex items-center gap-2 text-sm text-stone-500">
                    {s.alerts ? <Bell className="h-4 w-4 text-forest-700" /> : <BellOff className="h-4 w-4" />}
                    Alerts
                    <Switch checked={s.alerts} onCheckedChange={() => toggleSearchAlerts(s.id)} />
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Saved homes */}
      <section className="mt-12">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold text-stone-900">
          <Heart className="h-5 w-5 text-rose-500" /> Saved homes
          <span className="text-sm font-normal text-stone-400">({savedHomes.length})</span>
        </h2>
        {savedHomes.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
            <p className="font-medium text-stone-700">No saved homes yet</p>
            <p className="mt-1 text-sm text-stone-500">Tap the heart on any listing to keep it here.</p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {savedHomes.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
