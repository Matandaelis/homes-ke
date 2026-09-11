import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Building2, CalendarClock, Flame, MapPin, TrendingUp } from 'lucide-react'
import { PROPERTIES } from '@/data/properties'
import { computeMarketStats, computePriceTrend } from '@/lib/marketStats'
import { fmtCompact, fmtUSD } from '@/lib/mortgage'
import { cn } from '@/lib/utils'

const TEMPERATURE_META = {
  seller: { label: "Seller's market", color: 'bg-rose-100 text-rose-700', desc: 'Homes sell fast, often near or above asking.' },
  balanced: { label: 'Balanced', color: 'bg-amber-100 text-amber-700', desc: 'Neither side has a strong advantage.' },
  buyer: { label: "Buyer's market", color: 'bg-forest-100 text-forest-700', desc: 'More inventory, room to negotiate below asking.' },
}

export default function MarketInsightsPage() {
  const stats = useMemo(() => computeMarketStats(PROPERTIES), [])
  const [selectedCity, setSelectedCity] = useState(stats[0]?.city ?? '')
  const trend = useMemo(() => computePriceTrend(PROPERTIES, selectedCity), [selectedCity])
  const selected = stats.find((s) => s.city === selectedCity)
  const cityHomes = PROPERTIES.filter((p) => p.city === selectedCity)

  const W = 700
  const H = 200
  const padL = 50
  const padR = 20
  const padT = 20
  const padB = 30
  const chartW = W - padL - padR
  const chartH = H - padT - padB
  const maxPrice = Math.max(...trend.map((t) => t.medianPrice), 1)
  const minPrice = Math.min(...trend.map((t) => t.medianPrice), 1)
  const priceRange = Math.max(maxPrice - minPrice, 1)
  const barSlot = chartW / Math.max(trend.length, 1)

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
      <section className="py-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-brass-600">Market data</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
          Market insights
        </h1>
        <p className="mt-1 text-stone-500">
          Median prices, inventory, and days on market across every city Nestora serves.
        </p>
      </section>

      {/* City cards */}
      <section>
        <h2 className="font-display text-xl font-bold text-stone-900">Cities at a glance</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((s) => {
            const temp = TEMPERATURE_META[s.marketTemperature]
            return (
              <button
                key={s.label}
                onClick={() => setSelectedCity(s.city)}
                className={cn(
                  'rounded-2xl border bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md',
                  selectedCity === s.city ? 'border-forest-400 ring-2 ring-forest-200' : 'border-stone-200/80',
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-display text-lg font-bold text-stone-900">{s.city}</p>
                    <p className="flex items-center gap-1 text-sm text-stone-500">
                      <MapPin className="h-3.5 w-3.5" /> {s.state}
                    </p>
                  </div>
                  <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-bold', temp.color)}>
                    {temp.label}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-stone-400">Median price</p>
                    <p className="font-bold text-stone-900">{fmtUSD(s.medianPrice)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-400">Inventory</p>
                    <p className="font-bold text-stone-900">{s.listingCount} homes</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-400">Avg $/sqft</p>
                    <p className="font-bold text-stone-900">{fmtUSD(s.avgPricePerSqft)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-400">Avg days on market</p>
                    <p className="font-bold text-stone-900">{s.avgDom}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {selected && (
        <section className="mt-10 space-y-6">
          {/* Detail header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-stone-900">{selected.city}, {selected.state}</h2>
              <p className="mt-1 text-sm text-stone-500">{TEMPERATURE_META[selected.marketTemperature].desc}</p>
            </div>
            <span className={cn('rounded-full px-3 py-1.5 text-sm font-bold', TEMPERATURE_META[selected.marketTemperature].color)}>
              {TEMPERATURE_META[selected.marketTemperature].label}
            </span>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MetricCard icon={TrendingUp} label="Median price" value={fmtUSD(selected.medianPrice)} sub={`${fmtCompact(selected.priceRangeLow)} – ${fmtCompact(selected.priceRangeHigh)}`} />
            <MetricCard icon={Building2} label="Active listings" value={String(selected.listingCount)} sub={`${selected.newCount} new`} />
            <MetricCard icon={CalendarClock} label="Days on market" value={String(selected.avgDom)} sub={`Sale-to-list: ${Math.round(selected.saleToListRatio * 100)}%`} />
            <MetricCard icon={Flame} label="Open houses" value={String(selected.openHouseCount)} sub={`${selected.listingCount - selected.openHouseCount} by appointment`} />
          </div>

          {/* Price trend chart */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h3 className="font-display text-lg font-bold text-stone-900">Median price trend (6-month)</h3>
            <p className="mt-1 text-sm text-stone-500">Estimated trajectory based on local sales velocity.</p>
            <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 w-full">
              {[0, 0.5, 1].map((f) => (
                <line
                  key={f}
                  x1={padL}
                  x2={W - padR}
                  y1={padT + chartH * (1 - f)}
                  y2={padT + chartH * (1 - f)}
                  stroke="#f0efed"
                  strokeDasharray="3 4"
                />
              ))}
              {trend.map((t, i) => {
                const x = padL + barSlot * i + barSlot / 2
                const y = padT + chartH * (1 - (t.medianPrice - minPrice) / priceRange)
                return (
                  <g key={t.month}>
                    {i > 0 && (
                      <line
                        x1={padL + barSlot * (i - 1) + barSlot / 2}
                        y1={padT + chartH * (1 - (trend[i - 1].medianPrice - minPrice) / priceRange)}
                        x2={x}
                        y2={y}
                        stroke="#1a523e"
                        strokeWidth="2.5"
                      />
                    )}
                    <circle cx={x} cy={y} r="5" fill="#1a523e" />
                    <text x={x} y={H - 10} textAnchor="middle" className="fill-stone-400 text-[11px]">{t.month}</text>
                    <text x={x} y={y - 12} textAnchor="middle" className="fill-stone-700 text-[11px] font-bold">
                      {fmtCompact(t.medianPrice)}
                    </text>
                  </g>
                )
              })}
              {/* Y-axis labels */}
              <text x={padL - 8} y={padT + 4} textAnchor="end" className="fill-stone-400 text-[10px]">{fmtCompact(maxPrice)}</text>
              <text x={padL - 8} y={padT + chartH + 4} textAnchor="end" className="fill-stone-400 text-[10px]">{fmtCompact(minPrice)}</text>
            </svg>
          </div>

          {/* Homes in this market */}
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-stone-900">Homes in {selected.city}</h3>
              <Link to="/" className="text-sm font-semibold text-forest-700 hover:underline">See all listings →</Link>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cityHomes.slice(0, 3).map((h) => (
                <Link
                  key={h.id}
                  to={`/property/${h.id}`}
                  className="group flex gap-4 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <img src={h.image} alt={h.title} className="h-20 w-28 shrink-0 rounded-xl object-cover" />
                  <div className="min-w-0">
                    <p className="truncate font-display text-sm font-bold text-stone-900 group-hover:text-forest-700">{h.title}</p>
                    <p className="truncate text-xs text-stone-500">{h.address}</p>
                    <p className="mt-1.5 font-display text-lg font-bold text-forest-900">{fmtCompact(h.price)}</p>
                    <p className="text-xs text-stone-400">{h.beds} bd · {h.baths} ba · {h.sqft.toLocaleString()} sqft</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  sub: string
}) {
  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-100 text-forest-700">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-3 text-xs font-medium uppercase tracking-wide text-stone-400">{label}</p>
      <p className="mt-0.5 font-display text-xl font-bold text-stone-900">{value}</p>
      <p className="mt-0.5 text-xs text-stone-400">{sub}</p>
    </div>
  )
}
