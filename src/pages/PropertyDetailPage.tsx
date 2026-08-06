import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, BedDouble, Bath, Ruler, Heart, MapPin, CalendarDays, Check, Hop as Home, Landmark, Phone, Mail, Send, Trees, Hammer, Signature as FileSignature, Loader as Loader2 } from 'lucide-react'
import { PROPERTIES } from '@/data/properties'
import { calcMortgage, fmtUSD } from '@/lib/mortgage'
import { useMarketplace } from '@/context/MarketplaceContext'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import PropertyCard from '@/components/PropertyCard'
import { supabase } from '@/lib/supabaseClient'
import { cn } from '@/lib/utils'

type TourState = 'idle' | 'submitting' | 'success' | 'error'
type OfferState = 'idle' | 'submitting' | 'success' | 'error'

export default function PropertyDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const property = PROPERTIES.find((p) => p.id === id)
  const { isFavorite, toggleFavorite } = useMarketplace()
  const [activeImg, setActiveImg] = useState(0)
  const [downPct, setDownPct] = useState(20)
  const [rate, setRate] = useState(6.5)
  const [tourState, setTourState] = useState<TourState>('idle')
  const [tourForm, setTourForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [offerState, setOfferState] = useState<OfferState>('idle')
  const [offerOpen, setOfferOpen] = useState(false)
  const [offerForm, setOfferForm] = useState({
    buyer_name: '',
    buyer_email: '',
    offer_amount: '',
    financing_type: 'conventional',
    contingencies: '',
    message: '',
  })

  useEffect(() => {
    window.scrollTo(0, 0)
    setActiveImg(0)
  }, [id])

  const est = useMemo(
    () =>
      calcMortgage({
        homePrice: property?.price ?? 0,
        downPaymentPct: downPct,
        rate,
        termYears: 30,
        taxRatePct: 1.1,
        insuranceAnnual: 1800,
        hoaMonthly: 0,
        extraMonthly: 0,
      }),
    [property, downPct, rate],
  )

  if (!property) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-3xl font-bold text-stone-900">Listing not found</h1>
        <p className="mt-2 text-stone-500">This home may have sold or the link is incorrect.</p>
        <Link to="/" className="mt-6 inline-block rounded-full bg-forest-800 px-6 py-2.5 text-sm font-semibold text-cream hover:bg-forest-900">
          Back to all homes
        </Link>
      </main>
    )
  }

  const fav = isFavorite(property.id)
  const similar = PROPERTIES.filter((p) => p.id !== property.id && (p.type === property.type || p.state === property.state)).slice(0, 3)

  const facts = [
    { icon: BedDouble, label: 'Bedrooms', value: String(property.beds) },
    { icon: Bath, label: 'Bathrooms', value: String(property.baths) },
    { icon: Ruler, label: 'Living area', value: `${property.sqft.toLocaleString()} sqft` },
    { icon: Trees, label: 'Lot size', value: property.lotSqft ? `${property.lotSqft.toLocaleString()} sqft` : '—' },
    { icon: Hammer, label: 'Year built', value: String(property.yearBuilt) },
    { icon: Home, label: 'Type', value: property.type },
    { icon: Landmark, label: 'Price / sqft', value: fmtUSD(property.pricePerSqft) },
    { icon: CalendarDays, label: 'Open house', value: property.openHouse ?? 'By appointment' },
  ]

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
      <button
        onClick={() => navigate(-1)}
        className="mt-6 flex items-center gap-2 text-sm font-medium text-stone-500 transition-colors hover:text-forest-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to results
      </button>

      {/* Gallery */}
      <section className="mt-4 grid gap-3 md:h-[480px] md:grid-cols-3 md:grid-rows-2">
        <div className="relative overflow-hidden rounded-2xl md:col-span-2 md:row-span-2">
          <img
            src={property.images[activeImg]}
            alt={property.title}
            className="aspect-[3/2] w-full object-cover md:absolute md:inset-0 md:h-full"
          />
          <div className="absolute left-4 top-4 flex gap-2">
            {property.isNew && (
              <span className="rounded-md bg-brass-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow">New</span>
            )}
            <span className="rounded-md bg-white/95 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-stone-700 shadow">
              {property.type}
            </span>
          </div>
        </div>
        {property.images.map((src, i) => i !== activeImg && (
          <button
            key={src}
            onClick={() => setActiveImg(i)}
            className="relative hidden overflow-hidden rounded-2xl opacity-90 transition-all hover:opacity-100 md:block"
          >
            <img src={src} alt={`${property.title} photo ${i + 1}`} className="absolute inset-0 h-full w-full object-cover" />
          </button>
        ))}
        {/* mobile thumbnails */}
        <div className="flex gap-3 md:hidden">
          {property.images.map((src, i) => (
            <button
              key={src}
              onClick={() => setActiveImg(i)}
              className={cn(
                'w-1/3 overflow-hidden rounded-xl',
                activeImg === i ? 'ring-2 ring-forest-700 ring-offset-2' : 'opacity-80',
              )}
            >
              <img src={src} alt="" className="aspect-[3/2] w-full object-cover" />
            </button>
          ))}
        </div>
      </section>

      {/* Header */}
      <section className="mt-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">{property.title}</h1>
          <p className="mt-1.5 flex items-center gap-1.5 text-stone-500">
            <MapPin className="h-4 w-4 text-forest-600" />
            {property.address}, {property.city}, {property.state}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-display text-3xl font-bold text-forest-900">{fmtUSD(property.price)}</p>
            <p className="text-sm text-stone-500">Est. {fmtUSD(Math.round(est.monthlyTotal))}/mo</p>
          </div>
          <button
            onClick={() => toggleFavorite(property.id)}
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full border shadow-sm transition-all hover:scale-105',
              fav ? 'border-rose-200 bg-rose-500 text-white' : 'border-stone-200 bg-white text-stone-500 hover:text-rose-500',
            )}
            aria-label="Save this home"
          >
            <Heart className={cn('h-5 w-5', fav && 'fill-current')} />
          </button>
        </div>
      </section>

      {/* Facts */}
      <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {facts.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm">
            <Icon className="h-5 w-5 text-forest-600" />
            <p className="mt-2.5 text-xs font-medium uppercase tracking-wide text-stone-400">{label}</p>
            <p className="mt-0.5 font-semibold text-stone-900">{value}</p>
          </div>
        ))}
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* About + features */}
        <div className="space-y-8">
          <section className="rounded-2xl border border-stone-200/80 bg-white p-7 shadow-sm">
            <h2 className="font-display text-2xl font-bold text-stone-900">About this home</h2>
            <p className="mt-3 leading-relaxed text-stone-600">{property.description}</p>
            <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-stone-400">Features & amenities</h3>
            <ul className="mt-3 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
              {property.features.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-stone-700">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-forest-100">
                    <Check className="h-3 w-3 text-forest-700" strokeWidth={3} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </section>

          {/* Payment estimator */}
          <section className="rounded-2xl border border-stone-200/80 bg-forest-950 p-7 text-stone-200 shadow-sm">
            <h2 className="font-display text-2xl font-bold text-cream">Monthly payment</h2>
            <p className="mt-1 text-sm text-stone-400">30-year fixed · taxes & insurance included</p>
            <p className="mt-5 font-display text-4xl font-bold text-brass-300">{fmtUSD(Math.round(est.monthlyTotal))}
              <span className="text-base font-normal text-stone-400">/mo</span>
            </p>
            <div className="mt-6 space-y-5">
              <div>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="text-stone-300">Down payment</span>
                  <span className="font-semibold text-cream">{downPct}% · {fmtUSD(est.downPayment)}</span>
                </div>
                <Slider value={[downPct]} min={0} max={60} step={1} onValueChange={([v]) => setDownPct(v)} />
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-stone-300">Interest rate</span>
                <div className="flex items-center gap-1.5">
                  <Input
                    type="number"
                    min={0}
                    max={15}
                    step={0.125}
                    value={rate}
                    onChange={(e) => setRate(Math.min(Math.max(Number(e.target.value) || 0, 0), 15))}
                    className="h-9 w-24 border-white/20 bg-white/10 text-right text-cream"
                  />
                  <span className="text-sm text-stone-400">%</span>
                </div>
              </div>
            </div>
            <Link
              to={`/mortgage?price=${property.price}`}
              className="mt-6 block rounded-xl bg-brass-500 px-4 py-3 text-center text-sm font-bold text-forest-950 transition-colors hover:bg-brass-400"
            >
              Open full mortgage calculator
            </Link>
          </section>
        </div>

        {/* Agent card */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-forest-100 font-display text-xl font-bold text-forest-800">
                AC
              </span>
              <div>
                <p className="font-semibold text-stone-900">Ava Castellano</p>
                <p className="text-sm text-stone-500">Listing agent · Nestora Realty</p>
              </div>
            </div>
            <div className="mt-4 space-y-1.5 text-sm text-stone-600">
              <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-forest-600" /> (415) 555-0182</p>
              <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-forest-600" /> ava@nestora.example</p>
            </div>
            {tourState === 'success' ? (
              <p className="mt-5 rounded-xl bg-forest-50 px-4 py-3 text-sm font-medium text-forest-800">
                Thanks — your tour request was received. Ava will reach out within one business day.
              </p>
            ) : (
              <form
                className="mt-5 space-y-3"
                onSubmit={async (e) => {
                  e.preventDefault()
                  setTourState('submitting')
                  const { error } = await supabase.from('leads').insert({
                    property_id: property.id,
                    property_title: property.title,
                    name: tourForm.name,
                    email: tourForm.email,
                    phone: tourForm.phone || null,
                    message: tourForm.message || null,
                    status: 'new',
                  })
                  if (error) {
                    setTourState('error')
                  } else {
                    setTourState('success')
                  }
                }}
              >
                <Input
                  required
                  placeholder="Your name"
                  value={tourForm.name}
                  onChange={(e) => setTourForm((f) => ({ ...f, name: e.target.value }))}
                />
                <Input
                  required
                  type="email"
                  placeholder="Email"
                  value={tourForm.email}
                  onChange={(e) => setTourForm((f) => ({ ...f, email: e.target.value }))}
                />
                <Input
                  type="tel"
                  placeholder="Phone (optional)"
                  value={tourForm.phone}
                  onChange={(e) => setTourForm((f) => ({ ...f, phone: e.target.value }))}
                />
                <Textarea
                  rows={3}
                  placeholder="Message (optional)"
                  value={tourForm.message}
                  onChange={(e) => setTourForm((f) => ({ ...f, message: e.target.value }))}
                />
                {tourState === 'error' && (
                  <p className="text-sm font-medium text-rose-600">
                    Something went wrong sending your request. Please try again.
                  </p>
                )}
                <button
                  type="submit"
                  disabled={tourState === 'submitting'}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest-800 px-4 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-forest-900 disabled:opacity-60"
                >
                  {tourState === 'submitting' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Request a tour
                </button>
              </form>
            )}
          </div>

          {/* Offer card */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brass-100 text-brass-700">
                <FileSignature className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-stone-900">Submit an offer</p>
                <p className="text-sm text-stone-500">Make a formal offer on this home</p>
              </div>
            </div>

            {offerState === 'success' ? (
              <p className="mt-5 rounded-xl bg-forest-50 px-4 py-3 text-sm font-medium text-forest-800">
                Your offer of {fmtUSD(Number(offerForm.offer_amount))} was submitted. The listing agent will review and respond.
              </p>
            ) : offerOpen ? (
              <form
                className="mt-5 space-y-3"
                onSubmit={async (e) => {
                  e.preventDefault()
                  setOfferState('submitting')
                  const { error } = await supabase.from('offers').insert({
                    property_id: property.id,
                    property_title: property.title,
                    buyer_name: offerForm.buyer_name,
                    buyer_email: offerForm.buyer_email,
                    offer_amount: Number(offerForm.offer_amount),
                    financing_type: offerForm.financing_type,
                    contingencies: offerForm.contingencies || null,
                    message: offerForm.message || null,
                    status: 'submitted',
                  })
                  if (error) {
                    setOfferState('error')
                  } else {
                    setOfferState('success')
                  }
                }}
              >
                <Input
                  required
                  placeholder="Buyer name"
                  value={offerForm.buyer_name}
                  onChange={(e) => setOfferForm((f) => ({ ...f, buyer_name: e.target.value }))}
                />
                <Input
                  required
                  type="email"
                  placeholder="Buyer email"
                  value={offerForm.buyer_email}
                  onChange={(e) => setOfferForm((f) => ({ ...f, buyer_email: e.target.value }))}
                />
                <Input
                  required
                  type="number"
                  min={0}
                  step={1000}
                  placeholder={`Offer amount (e.g. ${property.price.toLocaleString()})`}
                  value={offerForm.offer_amount}
                  onChange={(e) => setOfferForm((f) => ({ ...f, offer_amount: e.target.value }))}
                />
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">Financing</label>
                  <Select
                    value={offerForm.financing_type}
                    onValueChange={(v) => setOfferForm((f) => ({ ...f, financing_type: v }))}
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conventional">Conventional loan</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="fha">FHA loan</SelectItem>
                      <SelectItem value="va">VA loan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  placeholder="Contingencies (optional)"
                  value={offerForm.contingencies}
                  onChange={(e) => setOfferForm((f) => ({ ...f, contingencies: e.target.value }))}
                />
                <Textarea
                  rows={2}
                  placeholder="Message to listing agent (optional)"
                  value={offerForm.message}
                  onChange={(e) => setOfferForm((f) => ({ ...f, message: e.target.value }))}
                />
                {offerState === 'error' && (
                  <p className="text-sm font-medium text-rose-600">
                    Something went wrong submitting your offer. Please try again.
                  </p>
                )}
                <button
                  type="submit"
                  disabled={offerState === 'submitting'}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brass-500 px-4 py-2.5 text-sm font-semibold text-forest-950 transition-colors hover:bg-brass-400 disabled:opacity-60"
                >
                  {offerState === 'submitting' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileSignature className="h-4 w-4" />
                  )}
                  Submit offer
                </button>
              </form>
            ) : (
              <button
                onClick={() => setOfferOpen(true)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-brass-300 bg-brass-100 px-4 py-2.5 text-sm font-semibold text-brass-700 transition-colors hover:bg-brass-200"
              >
                <FileSignature className="h-4 w-4" /> Prepare an offer
              </button>
            )}
          </div>
        </aside>
      </div>

      {/* Similar homes */}
      {similar.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold text-stone-900">Similar homes</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
