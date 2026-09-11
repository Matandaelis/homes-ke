import { useMemo, useState } from 'react'
import { Camera, Handshake, LineChart, Loader as Loader2, SearchCheck, Send } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { fmtUSD } from '@/lib/mortgage'
import { supabase } from '@/lib/supabaseClient'
import { PROPERTY_TYPES, type PropertyType } from '@/types'

const MARKETS: { name: string; ppsqft: number }[] = [
  { name: 'Bellevue, WA', ppsqft: 520 },
  { name: 'Portland, OR', ppsqft: 340 },
  { name: 'Scottsdale, AZ', ppsqft: 390 },
  { name: 'Greenwich, CT', ppsqft: 480 },
  { name: 'Santa Barbara, CA', ppsqft: 720 },
  { name: 'Chicago, IL', ppsqft: 330 },
  { name: 'Tucson, AZ', ppsqft: 235 },
  { name: 'Miami, FL', ppsqft: 610 },
  { name: 'Franklin, TN', ppsqft: 285 },
  { name: 'Bend, OR', ppsqft: 410 },
  { name: 'Palm Springs, CA', ppsqft: 565 },
]

const CONDITIONS = [
  { name: 'Needs work', mult: 0.88 },
  { name: 'Good', mult: 1.0 },
  { name: 'Updated', mult: 1.08 },
  { name: 'Recently renovated', mult: 1.16 },
]

const steps = [
  { icon: LineChart, title: 'Get your estimate', text: 'Start with an instant valuation based on your market, size, and condition.' },
  { icon: SearchCheck, title: 'Prep with a pro', text: 'A Nestora advisor walks your home and recommends high-ROI touch-ups.' },
  { icon: Camera, title: 'List beautifully', text: 'Pro photography, staging, and placement in front of qualified buyers.' },
  { icon: Handshake, title: 'Close with confidence', text: 'We negotiate offers and manage paperwork through closing day.' },
]

export default function SellPage() {
  const [market, setMarket] = useState(MARKETS[0].name)
  const [sqft, setSqft] = useState(2200)
  const [beds, setBeds] = useState(3)
  const [baths, setBaths] = useState(2)
  const [year, setYear] = useState(1998)
  const [condition, setCondition] = useState(CONDITIONS[1].name)
  const [showSubmit, setShowSubmit] = useState(false)
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [submitError, setSubmitError] = useState('')
  const [sellerForm, setSellerForm] = useState({
    title: '',
    address: '',
    seller_name: '',
    seller_email: '',
    seller_phone: '',
    property_type: 'House' as PropertyType,
    description: '',
  })

  const estimate = useMemo(() => {
    const m = MARKETS.find((x) => x.name === market)!
    const c = CONDITIONS.find((x) => x.name === condition)!
    const agePenalty = Math.min(Math.max((2026 - year - 10) * 0.003, 0), 0.12)
    const bedBathAdj = 1 + (beds - 3) * 0.02 + (baths - 2) * 0.015
    const mid = sqft * m.ppsqft * c.mult * (1 - agePenalty) * bedBathAdj
    return { low: mid * 0.94, mid, high: mid * 1.06 }
  }, [market, sqft, beds, baths, year, condition])

  return (
    <main>
      {/* Hero band */}
      <section className="relative overflow-hidden bg-forest-950">
        <img src="/images/h3.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-950 via-forest-950/80 to-forest-950/30" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-brass-300">Sell with Nestora</p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold leading-tight text-cream sm:text-5xl">
            What is your home really worth?
          </h1>
          <p className="mt-4 max-w-xl text-lg text-stone-300">
            Get an instant estimate, then list with photography and staging that makes buyers fall in love.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        {/* Valuation widget */}
        <section className="relative z-10 -mt-14 grid overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-xl lg:grid-cols-[1fr_360px]">
          <div className="p-7 sm:p-9">
            <h2 className="font-display text-2xl font-bold text-stone-900">Instant home valuation</h2>
            <p className="mt-1 text-sm text-stone-500">Adjust the details — the estimate updates live.</p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-stone-700">Market</label>
                <Select value={market} onValueChange={setMarket}>
                  <SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MARKETS.map((m) => (
                      <SelectItem key={m.name} value={m.name}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">Living area (sqft)</label>
                <Input className="h-10" type="number" min={300} max={20000} step={50} value={sqft} onChange={(e) => setSqft(Math.max(Number(e.target.value) || 0, 0))} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">Year built</label>
                <Input className="h-10" type="number" min={1850} max={2026} value={year} onChange={(e) => setYear(Math.min(Math.max(Number(e.target.value) || 1998, 1850), 2026))} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">Bedrooms</label>
                <Select value={String(beds)} onValueChange={(v) => setBeds(Number(v))}>
                  <SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{[1, 2, 3, 4, 5, 6].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">Bathrooms</label>
                <Select value={String(baths)} onValueChange={(v) => setBaths(Number(v))}>
                  <SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-stone-700">Condition</label>
                <Select value={condition} onValueChange={setCondition}>
                  <SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map((c) => (
                      <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center bg-forest-950 p-7 text-center sm:p-9">
            <p className="text-sm font-medium uppercase tracking-wider text-brass-300">Estimated value</p>
            <p className="mt-3 font-display text-4xl font-bold text-cream">{fmtUSD(Math.round(estimate.mid))}</p>
            <p className="mt-2 text-sm text-stone-400">
              Likely range {fmtUSD(Math.round(estimate.low))} – {fmtUSD(Math.round(estimate.high))}
            </p>
            <button
              onClick={() => setShowSubmit(true)}
              className="mt-6 rounded-xl bg-brass-500 px-4 py-3 text-sm font-bold text-forest-950 transition-colors hover:bg-brass-400"
            >
              List my home for sale
            </button>
            <p className="mt-3 text-xs text-stone-500">Free, no obligation · prepared by a local advisor</p>
          </div>
        </section>

        {/* Listing submission */}
        {showSubmit && submitState !== 'success' && (
          <section className="mt-8 overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm">
            <div className="border-b border-stone-200/80 bg-stone-50 px-7 py-5">
              <h2 className="font-display text-2xl font-bold text-stone-900">List your home for sale</h2>
              <p className="mt-1 text-sm text-stone-500">
                Your estimated value is {fmtUSD(Math.round(estimate.mid))}. Fill in the details below and a Nestora agent will review your listing within two business days.
              </p>
            </div>
            <form
              className="grid gap-4 p-7 sm:grid-cols-2"
              onSubmit={async (e) => {
                e.preventDefault()
                setSubmitState('submitting')
                setSubmitError('')
                const { error } = await supabase.from('listings').insert({
                  title: sellerForm.title,
                  address: sellerForm.address,
                  city: market.split(',')[0].trim(),
                  state: market.split(',')[1]?.trim() ?? '',
                  price: Math.round(estimate.mid),
                  beds,
                  baths,
                  sqft,
                  lot_sqft: null,
                  property_type: sellerForm.property_type,
                  year_built: year,
                  description: sellerForm.description,
                  image_url: null,
                  seller_name: sellerForm.seller_name,
                  seller_email: sellerForm.seller_email,
                  seller_phone: sellerForm.seller_phone || null,
                  status: 'pending',
                })
                if (error) {
                  setSubmitState('error')
                  setSubmitError(error.message)
                } else {
                  setSubmitState('success')
                }
              }}
            >
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-stone-700">Listing title</label>
                <Input
                  required
                  placeholder="e.g. Maple Grove Modern"
                  value={sellerForm.title}
                  onChange={(e) => setSellerForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-stone-700">Street address</label>
                <Input
                  required
                  placeholder="123 Main St"
                  value={sellerForm.address}
                  onChange={(e) => setSellerForm((f) => ({ ...f, address: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">Property type</label>
                <Select
                  value={sellerForm.property_type}
                  onValueChange={(v) => setSellerForm((f) => ({ ...f, property_type: v as PropertyType }))}
                >
                  <SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">Market</label>
                <p className="flex h-10 items-center rounded-md border border-stone-200 bg-stone-50 px-3 text-sm text-stone-600">{market}</p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">Your name</label>
                <Input
                  required
                  placeholder="Jane Doe"
                  value={sellerForm.seller_name}
                  onChange={(e) => setSellerForm((f) => ({ ...f, seller_name: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">Email</label>
                <Input
                  required
                  type="email"
                  placeholder="jane@example.com"
                  value={sellerForm.seller_email}
                  onChange={(e) => setSellerForm((f) => ({ ...f, seller_email: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">Phone (optional)</label>
                <Input
                  type="tel"
                  placeholder="(415) 555-0182"
                  value={sellerForm.seller_phone}
                  onChange={(e) => setSellerForm((f) => ({ ...f, seller_phone: e.target.value }))}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-stone-700">Description</label>
                <Textarea
                  required
                  rows={4}
                  placeholder="Tell buyers what makes your home special..."
                  value={sellerForm.description}
                  onChange={(e) => setSellerForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              {submitState === 'error' && (
                <p className="sm:col-span-2 text-sm font-medium text-rose-600">
                  {submitError || 'Something went wrong submitting your listing. Please try again.'}
                </p>
              )}
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={submitState === 'submitting'}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest-800 px-4 py-3 text-sm font-bold text-cream transition-colors hover:bg-forest-900 disabled:opacity-60"
                >
                  {submitState === 'submitting' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Submit listing for review
                </button>
              </div>
            </form>
          </section>
        )}

        {submitState === 'success' && (
          <section className="mt-8 rounded-2xl border border-forest-200 bg-forest-50 p-8 text-center shadow-sm">
            <h2 className="font-display text-2xl font-bold text-forest-900">Listing submitted!</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-forest-800">
              Your home at {fmtUSD(Math.round(estimate.mid))} has been sent to a Nestora agent for review.
              You'll hear back within two business days. Once approved, it will appear in the marketplace.
            </p>
            <button
              onClick={() => {
                setSubmitState('idle')
                setShowSubmit(false)
                setSellerForm({
                  title: '',
                  address: '',
                  seller_name: '',
                  seller_email: '',
                  seller_phone: '',
                  property_type: 'House',
                  description: '',
                })
              }}
              className="mt-5 rounded-xl border border-forest-300 bg-white px-5 py-2.5 text-sm font-semibold text-forest-800 transition-colors hover:bg-forest-100"
            >
              Submit another listing
            </button>
          </section>
        )}

        {/* Steps */}
        <section className="mt-20">
          <h2 className="text-center font-display text-3xl font-bold text-stone-900">How selling works</h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-stone-500">Four steps from curious to closed — most Nestora listings go live within two weeks.</p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <div key={title} className="relative rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm">
                <span className="absolute right-5 top-4 font-display text-4xl font-bold text-stone-100">{i + 1}</span>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-100 text-forest-700">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-bold text-stone-900">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-stone-500">{text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
