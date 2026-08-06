import { useState } from 'react'
import { Search, Bookmark, RotateCcw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PROPERTY_TYPES, type SearchFilters, type SortOption } from '@/types'
import { useMarketplace } from '@/context/MarketplaceContext'
import { cn } from '@/lib/utils'

const PRICE_STEPS = [250_000, 500_000, 750_000, 1_000_000, 1_500_000, 2_000_000, 3_000_000, 5_000_000]

function priceLabel(v: number) {
  return v >= 1_000_000 ? `$${v / 1_000_000}M` : `$${v / 1_000}K`
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-stone-400">
      {children}
    </span>
  )
}

interface Props {
  filters: SearchFilters
  onChange: (f: SearchFilters) => void
  resultCount: number
}

export default function FilterBar({ filters, onChange, resultCount }: Props) {
  const { saveSearch } = useMarketplace()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [searchName, setSearchName] = useState('')
  const [alerts, setAlerts] = useState(true)
  const [savedFlash, setSavedFlash] = useState(false)

  const set = (patch: Partial<SearchFilters>) => onChange({ ...filters, ...patch })

  const handleSave = () => {
    const name =
      searchName.trim() ||
      [filters.type !== 'Any' ? filters.type : 'Homes', filters.query || 'Anywhere'].join(' in ')
    saveSearch(name, filters, alerts)
    setDialogOpen(false)
    setSearchName('')
    setSavedFlash(true)
    window.setTimeout(() => setSavedFlash(false), 2000)
  }

  const isDefault =
    !filters.query &&
    filters.type === 'Any' &&
    filters.minPrice === null &&
    filters.maxPrice === null &&
    filters.minBeds === 0 &&
    filters.minBaths === 0

  const triggerCls = 'h-10 w-full'

  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
      {/* Row 1: search + selects */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-[1fr_150px_130px_130px_170px]">
        <div className="col-span-2 sm:col-span-3 lg:col-span-1">
          <FieldLabel>Location or keyword</FieldLabel>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <Input
              value={filters.query}
              onChange={(e) => set({ query: e.target.value })}
              placeholder="City, address, or name…"
              className="h-10 pl-9"
            />
          </div>
        </div>

        <div>
          <FieldLabel>Type</FieldLabel>
          <Select value={filters.type} onValueChange={(v) => set({ type: v as SearchFilters['type'] })}>
            <SelectTrigger className={triggerCls}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Any">Any type</SelectItem>
              {PROPERTY_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <FieldLabel>Min price</FieldLabel>
          <Select
            value={filters.minPrice === null ? 'any' : String(filters.minPrice)}
            onValueChange={(v) => set({ minPrice: v === 'any' ? null : Number(v) })}
          >
            <SelectTrigger className={triggerCls}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">No min</SelectItem>
              {PRICE_STEPS.map((p) => (
                <SelectItem key={p} value={String(p)}>
                  {priceLabel(p)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <FieldLabel>Max price</FieldLabel>
          <Select
            value={filters.maxPrice === null ? 'any' : String(filters.maxPrice)}
            onValueChange={(v) => set({ maxPrice: v === 'any' ? null : Number(v) })}
          >
            <SelectTrigger className={triggerCls}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">No max</SelectItem>
              {PRICE_STEPS.map((p) => (
                <SelectItem key={p} value={String(p)}>
                  {priceLabel(p)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <FieldLabel>Sort by</FieldLabel>
          <Select value={filters.sort} onValueChange={(v) => set({ sort: v as SortOption })}>
            <SelectTrigger className={triggerCls}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recommended">Recommended</SelectItem>
              <SelectItem value="price-asc">Price: low → high</SelectItem>
              <SelectItem value="price-desc">Price: high → low</SelectItem>
              <SelectItem value="beds">Most bedrooms</SelectItem>
              <SelectItem value="sqft">Largest area</SelectItem>
              <SelectItem value="newest">Newest built</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 2: beds/baths + actions */}
      <div className="mt-4 flex flex-wrap items-end gap-x-8 gap-y-4 border-t border-stone-100 pt-4">
        <div>
          <FieldLabel>Bedrooms</FieldLabel>
          <div className="flex overflow-hidden rounded-lg border border-stone-200">
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => set({ minBeds: n })}
                className={cn(
                  'h-10 min-w-11 px-3 text-sm font-medium transition-colors',
                  n > 0 && 'border-l border-stone-200',
                  filters.minBeds === n
                    ? 'bg-forest-800 text-cream'
                    : 'bg-white text-stone-600 hover:bg-stone-50',
                )}
              >
                {n === 0 ? 'Any' : `${n}+`}
              </button>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel>Bathrooms</FieldLabel>
          <div className="flex overflow-hidden rounded-lg border border-stone-200">
            {[0, 1, 2, 3, 4].map((n) => (
              <button
                key={n}
                onClick={() => set({ minBaths: n })}
                className={cn(
                  'h-10 min-w-11 px-3 text-sm font-medium transition-colors',
                  n > 0 && 'border-l border-stone-200',
                  filters.minBaths === n
                    ? 'bg-forest-800 text-cream'
                    : 'bg-white text-stone-600 hover:bg-stone-50',
                )}
              >
                {n === 0 ? 'Any' : `${n}+`}
              </button>
            ))}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3 pb-0.5">
          <span className="text-sm text-stone-500">
            <span className="font-display text-base font-bold text-stone-900">{resultCount}</span>{' '}
            {resultCount === 1 ? 'home' : 'homes'}
          </span>
          {!isDefault && (
            <Button
              variant="ghost"
              size="sm"
              className="h-10"
              onClick={() =>
                onChange({ ...filters, query: '', type: 'Any', minPrice: null, maxPrice: null, minBeds: 0, minBaths: 0 })
              }
            >
              <RotateCcw className="mr-1 h-3.5 w-3.5" /> Reset
            </Button>
          )}
          <Button
            onClick={() => setDialogOpen(true)}
            className={cn('h-10 rounded-lg bg-forest-800 px-4 hover:bg-forest-900', savedFlash && 'bg-forest-600')}
          >
            <Bookmark className="mr-1.5 h-4 w-4" />
            {savedFlash ? 'Saved!' : 'Save search'}
          </Button>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save this search</DialogTitle>
            <DialogDescription>
              Get back to these filters anytime from the Saved page. Matching homes right now:{' '}
              <span className="font-semibold text-stone-900">{resultCount}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700">Search name</label>
              <Input
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="e.g. Family homes in Portland under $700K"
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-stone-200 p-3">
              <div>
                <p className="text-sm font-medium text-stone-800">Email alerts</p>
                <p className="text-xs text-stone-500">Notify me when new homes match this search</p>
              </div>
              <Switch checked={alerts} onCheckedChange={setAlerts} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-forest-800 hover:bg-forest-900">
              Save search
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
