import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import {
  Building2,
  Check,
  Clock,
  DollarSign,
  Eye,
  EyeOff,
  Home,
  Loader as Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  TrendingUp,
  X,
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import type { Listing, ListingStatus } from '@/types'
import { fmtUSD, fmtCompact } from '@/lib/mortgage'
import { cn } from '@/lib/utils'

const STATUS_FLOW: ListingStatus[] = ['pending', 'active', 'sold', 'withdrawn', 'rejected']

const STATUS_META: Record<ListingStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Pending review', color: 'bg-amber-100 text-amber-800', icon: Clock },
  active: { label: 'Active', color: 'bg-forest-100 text-forest-800', icon: Eye },
  sold: { label: 'Sold', color: 'bg-sky-100 text-sky-800', icon: Check },
  withdrawn: { label: 'Withdrawn', color: 'bg-stone-200 text-stone-700', icon: EyeOff },
  rejected: { label: 'Rejected', color: 'bg-rose-100 text-rose-800', icon: X },
}

export default function ManagePage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<ListingStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [rejecting, setRejecting] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      setListings([])
    } else {
      setListings((data as Listing[] | null) ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const updateStatus = async (id: string, status: ListingStatus, reason?: string) => {
    const patch: Record<string, unknown> = { status, updated_at: new Date().toISOString() }
    if (status === 'rejected' && reason) patch.rejection_reason = reason
    if (status === 'active') patch.rejection_reason = null
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } as Listing : l)))
    await supabase.from('listings').update(patch).eq('id', id)
  }

  const deleteListing = async (id: string) => {
    setListings((prev) => prev.filter((l) => l.id !== id))
    await supabase.from('listings').delete().eq('id', id)
  }

  const filtered = listings.filter((l) => {
    if (filter !== 'all' && l.status !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        l.title.toLowerCase().includes(q) ||
        l.address.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q) ||
        l.seller_name.toLowerCase().includes(q) ||
        l.seller_email.toLowerCase().includes(q)
      )
    }
    return true
  })

  const counts = STATUS_FLOW.reduce<Record<string, number>>((acc, s) => {
    acc[s] = listings.filter((l) => l.status === s).length
    return acc
  }, {})

  const totalValue = listings.filter((l) => l.status === 'active').reduce((sum, l) => sum + Number(l.price), 0)
  const avgPrice = listings.length > 0 ? listings.reduce((sum, l) => sum + Number(l.price), 0) / listings.length : 0

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
      <section className="flex flex-wrap items-end justify-between gap-4 py-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-brass-600">Agent workspace</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            Listing management
          </h1>
          <p className="mt-1 text-stone-500">
            Review seller submissions, approve listings, and track inventory status.
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 shadow-sm transition-colors hover:bg-stone-50"
        >
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
        </button>
      </section>

      {/* Summary cards */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard icon={Building2} label="Total listings" value={String(listings.length)} tone="forest" />
        <SummaryCard icon={Eye} label="Active" value={String(counts.active ?? 0)} tone="sky" />
        <SummaryCard icon={Clock} label="Pending review" value={String(counts.pending ?? 0)} tone="brass" />
        <SummaryCard icon={DollarSign} label="Active inventory value" value={fmtCompact(totalValue)} tone="forest" />
      </section>

      {/* Filter bar */}
      <section className="mt-8 flex flex-wrap items-center gap-3">
        <div className="inline-flex flex-wrap gap-1.5 rounded-lg border border-stone-200 bg-white p-1.5 shadow-sm">
          <FilterChip label="All" count={listings.length} active={filter === 'all'} onClick={() => setFilter('all')} />
          {STATUS_FLOW.map((s) => (
            <FilterChip
              key={s}
              label={STATUS_META[s].label}
              count={counts[s] ?? 0}
              active={filter === s}
              onClick={() => setFilter(s)}
            />
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by title, address, or seller..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-stone-200 bg-white pl-4 pr-4 text-sm text-stone-800 shadow-sm outline-none transition-colors placeholder:text-stone-400 focus:border-forest-400"
          />
        </div>
      </section>

      {/* Listings */}
      {loading ? (
        <div className="mt-12 flex items-center justify-center gap-3 text-stone-500">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading listings…
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
          <p className="font-medium text-stone-700">
            {search || filter !== 'all' ? 'No listings match your filters' : 'No listings yet'}
          </p>
          <p className="mt-1 text-sm text-stone-500">
            {search || filter !== 'all'
              ? 'Try clearing the search or selecting a different status.'
              : 'When sellers submit listings from the Sell page, they will appear here for review.'}
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {filtered.map((listing) => {
            const meta = STATUS_META[listing.status] ?? STATUS_META.pending
            const Icon = meta.icon
            return (
              <div
                key={listing.id}
                className={cn(
                  'rounded-2xl border bg-white p-5 shadow-sm transition-all hover:shadow-md',
                  listing.status === 'pending' ? 'border-amber-200 ring-1 ring-amber-100' : 'border-stone-200/80',
                )}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                  {/* Image / thumbnail */}
                  <div className="flex shrink-0 gap-4">
                    {listing.image_url ? (
                      <img
                        src={listing.image_url}
                        alt={listing.title}
                        className="h-24 w-36 rounded-xl object-cover shadow-sm"
                      />
                    ) : (
                      <div className="flex h-24 w-36 items-center justify-center rounded-xl bg-stone-100">
                        <Home className="h-8 w-8 text-stone-400" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2.5">
                          <h3 className="font-display text-lg font-bold text-stone-900">{listing.title}</h3>
                          <span className={cn('flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold', meta.color)}>
                            <Icon className="h-3 w-3" /> {meta.label}
                          </span>
                        </div>
                        <p className="mt-0.5 flex items-center gap-1 text-sm text-stone-500">
                          <MapPin className="h-3.5 w-3.5" /> {listing.address}, {listing.city}, {listing.state}
                        </p>
                        <p className="mt-1 text-xs text-stone-400">
                          Submitted {new Date(listing.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <p className="font-display text-2xl font-bold text-forest-900">{fmtUSD(Number(listing.price))}</p>
                    </div>

                    {/* Stats */}
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-stone-600">
                      <span>{listing.beds} bd</span>
                      <span>{listing.baths} ba</span>
                      <span>{Number(listing.sqft).toLocaleString()} sqft</span>
                      <span>{listing.property_type}</span>
                      <span>Built {listing.year_built}</span>
                      <span className="font-semibold text-stone-700">
                        {Number(listing.sqft) > 0 ? fmtUSD(Math.round(Number(listing.price) / Number(listing.sqft))) : '—'}/sqft
                      </span>
                    </div>

                    {/* Seller contact */}
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-stone-500">
                      <span className="flex items-center gap-1.5"><span className="font-medium text-stone-700">{listing.seller_name}</span></span>
                      <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {listing.seller_email}</span>
                      {listing.seller_phone && (
                        <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {listing.seller_phone}</span>
                      )}
                    </div>

                    {/* Rejection reason */}
                    {listing.status === 'rejected' && listing.rejection_reason && (
                      <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                        <span className="font-semibold">Rejection reason:</span> {listing.rejection_reason}
                      </p>
                    )}

                    {/* Description */}
                    {listing.description && (
                      <p className="mt-3 text-sm leading-relaxed text-stone-600 line-clamp-2">{listing.description}</p>
                    )}

                    {/* Actions */}
                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-4">
                      {listing.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateStatus(listing.id, 'active')}
                            className="flex items-center gap-1.5 rounded-lg bg-forest-800 px-4 py-2 text-sm font-bold text-cream transition-colors hover:bg-forest-900"
                          >
                            <Check className="h-4 w-4" /> Approve & publish
                          </button>
                          <button
                            onClick={() => setRejecting(listing.id)}
                            className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50"
                          >
                            <X className="h-4 w-4" /> Reject
                          </button>
                        </>
                      )}
                      {listing.status === 'active' && (
                        <>
                          <button
                            onClick={() => updateStatus(listing.id, 'sold')}
                            className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-sky-700"
                          >
                            <TrendingUp className="h-4 w-4" /> Mark as sold
                          </button>
                          <button
                            onClick={() => updateStatus(listing.id, 'withdrawn')}
                            className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-600 transition-colors hover:bg-stone-50"
                          >
                            <EyeOff className="h-4 w-4" /> Withdraw
                          </button>
                        </>
                      )}
                      {(listing.status === 'withdrawn' || listing.status === 'rejected') && (
                        <button
                          onClick={() => updateStatus(listing.id, 'active')}
                          className="flex items-center gap-1.5 rounded-lg bg-forest-800 px-4 py-2 text-sm font-bold text-cream transition-colors hover:bg-forest-900"
                        >
                          <Eye className="h-4 w-4" /> Re-activate
                        </button>
                      )}
                      {(listing.status === 'sold' || listing.status === 'withdrawn') && (
                        <button
                          onClick={() => deleteListing(listing.id)}
                          className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-500 transition-colors hover:border-rose-200 hover:text-rose-600"
                        >
                          <X className="h-4 w-4" /> Delete
                        </button>
                      )}
                      <Link
                        to={`/property/${listing.id}`}
                        className="ml-auto flex items-center gap-1.5 text-sm font-semibold text-forest-700 hover:underline"
                      >
                        View listing →
                      </Link>
                    </div>

                    {/* Reject form */}
                    {rejecting === listing.id && (
                      <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50/50 p-4">
                        <label className="mb-1.5 block text-sm font-medium text-stone-700">Rejection reason</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            autoFocus
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="e.g. Photos needed, price too high for market..."
                            className="h-9 flex-1 rounded-lg border border-stone-200 bg-white px-3 text-sm outline-none focus:border-rose-400"
                          />
                          <button
                            onClick={() => {
                              updateStatus(listing.id, 'rejected', rejectReason || 'Does not meet listing criteria')
                              setRejecting(null)
                              setRejectReason('')
                            }}
                            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-rose-700"
                          >
                            Confirm rejection
                          </button>
                          <button
                            onClick={() => {
                              setRejecting(null)
                              setRejectReason('')
                            }}
                            className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-600 transition-colors hover:bg-stone-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Average price footer stat */}
      {!loading && listings.length > 0 && (
        <p className="mt-6 text-center text-sm text-stone-400">
          Average list price across all {listings.length} listings: {fmtUSD(Math.round(avgPrice))}
        </p>
      )}
    </main>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  tone: 'forest' | 'brass' | 'sky'
}) {
  const tones = {
    forest: 'bg-forest-100 text-forest-700',
    brass: 'bg-brass-100 text-brass-700',
    sky: 'bg-sky-100 text-sky-700',
  }
  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
      <span className={cn('flex h-11 w-11 items-center justify-center rounded-xl', tones[tone])}>
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-3 text-xs font-medium uppercase tracking-wide text-stone-400">{label}</p>
      <p className="mt-0.5 font-display text-2xl font-bold text-stone-900">{value}</p>
    </div>
  )
}

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-md px-3 py-1.5 text-sm font-semibold transition-colors',
        active ? 'bg-forest-800 text-cream' : 'text-stone-600 hover:bg-stone-100',
      )}
    >
      {label} <span className={cn('tabular-nums', active ? 'text-cream/70' : 'text-stone-400')}>({count})</span>
    </button>
  )
}
