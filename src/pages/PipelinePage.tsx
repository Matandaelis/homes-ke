import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Building2, Handshake, Loader as Loader2, Mail, Phone, RefreshCw, Trash2, Users } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { fmtUSD } from '@/lib/mortgage'
import { cn } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Lead {
  id: string
  property_id: string
  property_title: string
  name: string
  email: string
  phone: string | null
  message: string | null
  status: string
  created_at: string
}

interface Offer {
  id: string
  property_id: string
  property_title: string
  buyer_name: string
  buyer_email: string
  offer_amount: number
  financing_type: string
  contingencies: string | null
  message: string | null
  status: string
  created_at: string
}

const LEAD_STAGES = ['new', 'contacted', 'toured', 'closed'] as const
const OFFER_STAGES = ['submitted', 'reviewed', 'accepted', 'rejected'] as const

const LEAD_STAGE_LABELS: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  toured: 'Toured',
  closed: 'Closed',
}

const OFFER_STAGE_LABELS: Record<string, string> = {
  submitted: 'Submitted',
  reviewed: 'Reviewed',
  accepted: 'Accepted',
  rejected: 'Rejected',
}

const FINANCING_LABELS: Record<string, string> = {
  conventional: 'Conventional',
  cash: 'Cash',
  fha: 'FHA',
  va: 'VA',
}

const STAGE_COLORS: Record<string, string> = {
  new: 'bg-sky-100 text-sky-800',
  contacted: 'bg-amber-100 text-amber-800',
  toured: 'bg-violet-100 text-violet-800',
  closed: 'bg-forest-100 text-forest-800',
  submitted: 'bg-sky-100 text-sky-800',
  reviewed: 'bg-amber-100 text-amber-800',
  accepted: 'bg-forest-100 text-forest-800',
  rejected: 'bg-rose-100 text-rose-800',
}

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'leads' | 'offers'>('leads')

  const load = useCallback(async () => {
    setLoading(true)
    const [leadRes, offerRes] = await Promise.all([
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
      supabase.from('offers').select('*').order('created_at', { ascending: false }),
    ])
    setLeads((leadRes.data as Lead[] | null) ?? [])
    setOffers((offerRes.data as Offer[] | null) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const updateLeadStatus = async (id: string, status: string) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)))
    await supabase.from('leads').update({ status }).eq('id', id)
  }

  const updateOfferStatus = async (id: string, status: string) => {
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
    await supabase.from('offers').update({ status }).eq('id', id)
  }

  const deleteLead = async (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id))
    await supabase.from('leads').delete().eq('id', id)
  }

  const deleteOffer = async (id: string) => {
    setOffers((prev) => prev.filter((o) => o.id !== id))
    await supabase.from('offers').delete().eq('id', id)
  }

  const leadCounts = LEAD_STAGES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = leads.filter((l) => l.status === s).length
    return acc
  }, {})

  const offerCounts = OFFER_STAGES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = offers.filter((o) => o.status === s).length
    return acc
  }, {})

  const totalOfferValue = offers
    .filter((o) => o.status === 'accepted')
    .reduce((sum, o) => sum + o.offer_amount, 0)

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
      <section className="flex flex-wrap items-end justify-between gap-4 py-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-brass-600">Agent workspace</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            Pipeline dashboard
          </h1>
          <p className="mt-1 text-stone-500">
            Track tour requests and offers through every stage of the deal.
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
        <SummaryCard icon={Users} label="Total leads" value={String(leads.length)} tone="forest" />
        <SummaryCard icon={Handshake} label="Total offers" value={String(offers.length)} tone="brass" />
        <SummaryCard icon={Building2} label="Accepted value" value={fmtUSD(totalOfferValue)} tone="forest" />
        <SummaryCard
          icon={Mail}
          label="New leads"
          value={String(leadCounts.new ?? 0)}
          tone="sky"
        />
      </section>

      {/* Tabs */}
      <section className="mt-8">
        <div className="inline-flex rounded-lg border border-stone-200 bg-white p-1 shadow-sm">
          <button
            onClick={() => setTab('leads')}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-semibold transition-colors',
              tab === 'leads' ? 'bg-forest-800 text-cream' : 'text-stone-600 hover:bg-stone-100',
            )}
          >
            Leads ({leads.length})
          </button>
          <button
            onClick={() => setTab('offers')}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-semibold transition-colors',
              tab === 'offers' ? 'bg-forest-800 text-cream' : 'text-stone-600 hover:bg-stone-100',
            )}
          >
            Offers ({offers.length})
          </button>
        </div>
      </section>

      {loading ? (
        <div className="mt-12 flex items-center justify-center gap-3 text-stone-500">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading pipeline…
        </div>
      ) : tab === 'leads' ? (
        <LeadsView
          leads={leads}
          stageCounts={leadCounts}
          onUpdate={updateLeadStatus}
          onDelete={deleteLead}
        />
      ) : (
        <OffersView
          offers={offers}
          stageCounts={offerCounts}
          onUpdate={updateOfferStatus}
          onDelete={deleteOffer}
        />
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

function StagePills({ stages, counts, labels }: { stages: readonly string[]; counts: Record<string, number>; labels: Record<string, string> }) {
  return (
    <div className="flex flex-wrap gap-2">
      {stages.map((s) => (
        <span
          key={s}
          className={cn('rounded-full px-3 py-1 text-xs font-bold', STAGE_COLORS[s] ?? 'bg-stone-100 text-stone-700')}
        >
          {labels[s]}: {counts[s] ?? 0}
        </span>
      ))}
    </div>
  )
}

function LeadsView({
  leads,
  stageCounts,
  onUpdate,
  onDelete,
}: {
  leads: Lead[]
  stageCounts: Record<string, number>
  onUpdate: (id: string, status: string) => void
  onDelete: (id: string) => void
}) {
  if (leads.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
        <p className="font-medium text-stone-700">No leads yet</p>
        <p className="mt-1 text-sm text-stone-500">
          When buyers request a tour from a listing, their details will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-4">
      <StagePills stages={LEAD_STAGES} counts={stageCounts} labels={LEAD_STAGE_LABELS} />
      <div className="grid gap-4">
        {leads.map((lead) => (
          <div key={lead.id} className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-stone-900">{lead.name}</p>
                  <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-bold', STAGE_COLORS[lead.status] ?? 'bg-stone-100 text-stone-700')}>
                    {LEAD_STAGE_LABELS[lead.status] ?? lead.status}
                  </span>
                </div>
                <Link to={`/property/${lead.property_id}`} className="text-sm font-medium text-forest-700 hover:underline">
                  {lead.property_title}
                </Link>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-500">
                  <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {lead.email}</span>
                  {lead.phone && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {lead.phone}</span>}
                  <span className="text-xs text-stone-400">
                    {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                {lead.message && <p className="mt-2 text-sm text-stone-600">{lead.message}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Select value={lead.status} onValueChange={(v) => onUpdate(lead.id, v)}>
                  <SelectTrigger className="h-9 w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_STAGES.map((s) => (
                      <SelectItem key={s} value={s}>{LEAD_STAGE_LABELS[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  onClick={() => onDelete(lead.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 text-stone-400 transition-colors hover:border-rose-200 hover:text-rose-600"
                  aria-label="Delete lead"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function OffersView({
  offers,
  stageCounts,
  onUpdate,
  onDelete,
}: {
  offers: Offer[]
  stageCounts: Record<string, number>
  onUpdate: (id: string, status: string) => void
  onDelete: (id: string) => void
}) {
  if (offers.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
        <p className="font-medium text-stone-700">No offers yet</p>
        <p className="mt-1 text-sm text-stone-500">
          When buyers submit an offer from a listing, it will appear here for review.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-4">
      <StagePills stages={OFFER_STAGES} counts={stageCounts} labels={OFFER_STAGE_LABELS} />
      <div className="grid gap-4">
        {offers.map((offer) => (
          <div key={offer.id} className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-stone-900">{offer.buyer_name}</p>
                  <span className="font-display text-lg font-bold text-forest-800">{fmtUSD(offer.offer_amount)}</span>
                  <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-bold', STAGE_COLORS[offer.status] ?? 'bg-stone-100 text-stone-700')}>
                    {OFFER_STAGE_LABELS[offer.status] ?? offer.status}
                  </span>
                </div>
                <Link to={`/property/${offer.property_id}`} className="text-sm font-medium text-forest-700 hover:underline">
                  {offer.property_title}
                </Link>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-500">
                  <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {offer.buyer_email}</span>
                  <span className="rounded-md bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">
                    {FINANCING_LABELS[offer.financing_type] ?? offer.financing_type}
                  </span>
                  <span className="text-xs text-stone-400">
                    {new Date(offer.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                {offer.contingencies && (
                  <p className="mt-2 text-sm text-stone-600"><span className="font-medium text-stone-700">Contingencies:</span> {offer.contingencies}</p>
                )}
                {offer.message && <p className="mt-1 text-sm text-stone-600">{offer.message}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Select value={offer.status} onValueChange={(v) => onUpdate(offer.id, v)}>
                  <SelectTrigger className="h-9 w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OFFER_STAGES.map((s) => (
                      <SelectItem key={s} value={s}>{OFFER_STAGE_LABELS[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  onClick={() => onDelete(offer.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 text-stone-400 transition-colors hover:border-rose-200 hover:text-rose-600"
                  aria-label="Delete offer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
