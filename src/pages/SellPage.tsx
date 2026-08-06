import { useMemo, useState } from 'react'
import { Camera, Handshake, LineChart, SearchCheck } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { fmtUSD } from '@/lib/mortgage'

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
            <button className="mt-6 rounded-xl bg-brass-500 px-4 py-3 text-sm font-bold text-forest-950 transition-colors hover:bg-brass-400">
              Get a full market report
            </button>
            <p className="mt-3 text-xs text-stone-500">Free, no obligation · prepared by a local advisor</p>
          </div>
        </section>

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
