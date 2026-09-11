import { useMemo } from 'react'
import { Link } from 'react-router'
import { GitCompare, X } from 'lucide-react'
import { useMarketplace } from '@/context/MarketplaceContext'
import { PROPERTIES } from '@/data/properties'
import { fmtUSD } from '@/lib/mortgage'
import { calcMortgage } from '@/lib/mortgage'
import { computeHotScore } from '@/lib/hotScore'
import { cn } from '@/lib/utils'

const ROWS: { label: string; get: (p: typeof PROPERTIES[0]) => string | number }[] = [
  { label: 'Price', get: (p) => fmtUSD(p.price) },
  { label: 'Price / sqft', get: (p) => fmtUSD(p.pricePerSqft) },
  { label: 'Type', get: (p) => p.type },
  { label: 'Bedrooms', get: (p) => p.beds },
  { label: 'Bathrooms', get: (p) => p.baths },
  { label: 'Living area', get: (p) => `${p.sqft.toLocaleString()} sqft` },
  { label: 'Lot size', get: (p) => p.lotSqft ? `${p.lotSqft.toLocaleString()} sqft` : '—' },
  { label: 'Year built', get: (p) => p.yearBuilt },
  { label: 'City', get: (p) => p.city },
  { label: 'State', get: (p) => p.state },
  { label: 'Open house', get: (p) => p.openHouse ?? 'By appointment' },
]

export default function ComparePage() {
  const { compareList, toggleCompare, clearCompare } = useMarketplace()
  const homes = useMemo(
    () => compareList.map((id) => PROPERTIES.find((p) => p.id === id)).filter(Boolean) as typeof PROPERTIES,
    [compareList],
  )

  const bestPrice = homes.length > 0 ? Math.min(...homes.map((h) => h.price)) : 0
  const bestPpsf = homes.length > 0 ? Math.min(...homes.map((h) => h.pricePerSqft)) : 0
  const mostBeds = homes.length > 0 ? Math.max(...homes.map((h) => h.beds)) : 0
  const mostSqft = homes.length > 0 ? Math.max(...homes.map((h) => h.sqft)) : 0

  const isBest = (value: number, best: number, isMin: boolean) =>
    homes.length > 1 && value === best && (isMin ? true : true)

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
      <section className="flex flex-wrap items-end justify-between gap-4 py-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-brass-600">Compare</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            Side-by-side comparison
          </h1>
          <p className="mt-1 text-stone-500">Stack up to three homes to see how they measure up.</p>
        </div>
        {homes.length > 0 && (
          <button
            onClick={clearCompare}
            className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-600 shadow-sm transition-colors hover:bg-stone-50"
          >
            <X className="h-4 w-4" /> Clear all
          </button>
        )}
      </section>

      {homes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-16 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
            <GitCompare className="h-8 w-8 text-stone-400" />
          </span>
          <h2 className="mt-4 font-display text-xl font-bold text-stone-800">No homes selected yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-stone-500">
            Browse listings and tap the compare icon on any home to add it here. You can compare up to three at once.
          </p>
          <Link
            to="/"
            className="mt-5 inline-block rounded-full bg-forest-800 px-6 py-2.5 text-sm font-bold text-cream transition-colors hover:bg-forest-900"
          >
            Browse homes
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr>
                <th className="w-40 p-4 text-left align-bottom">
                  <p className="text-xs font-medium uppercase tracking-wide text-stone-400">Feature</p>
                </th>
                {homes.map((home) => {
                  const hot = computeHotScore(home)
                  return (
                    <th key={home.id} className="p-4 text-left align-bottom">
                      <div className="relative">
                        <button
                          onClick={() => toggleCompare(home.id)}
                          className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-stone-200 text-stone-500 transition-colors hover:bg-rose-100 hover:text-rose-600"
                          aria-label="Remove from comparison"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                        <Link to={`/property/${home.id}`}>
                          <img
                            src={home.image}
                            alt={home.title}
                            className="aspect-[3/2] w-full rounded-xl object-cover shadow-sm transition-transform hover:scale-[1.02]"
                          />
                        </Link>
                        <div className="mt-3 flex items-center gap-2">
                          <span className={cn('rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider', hot.badgeColor)}>
                            {hot.label}
                          </span>
                        </div>
                        <Link to={`/property/${home.id}`}>
                          <p className="mt-2 font-display text-base font-bold text-stone-900 hover:text-forest-700">
                            {home.title}
                          </p>
                        </Link>
                        <p className="mt-0.5 text-xs text-stone-500">{home.address}, {home.city}, {home.state}</p>
                      </div>
                    </th>
                  )
                })}
                {homes.length < 3 && (
                  <th className="w-48 p-4 text-left align-bottom">
                    <Link
                      to="/"
                      className="flex aspect-[3/2] items-center justify-center rounded-xl border-2 border-dashed border-stone-300 text-stone-400 transition-colors hover:border-forest-400 hover:text-forest-600"
                    >
                      <div className="text-center">
                        <GitCompare className="mx-auto h-7 w-7" />
                        <p className="mt-2 text-xs font-semibold">Add another home</p>
                      </div>
                    </Link>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, ri) => (
                <tr key={row.label} className={ri % 2 === 0 ? 'bg-stone-50/60' : ''}>
                  <td className="p-4 text-sm font-semibold text-stone-700">{row.label}</td>
                  {homes.map((home) => {
                    const value = row.get(home)
                    let isHighlight = false
                    if (row.label === 'Price') isHighlight = isBest(home.price, bestPrice, true)
                    else if (row.label === 'Price / sqft') isHighlight = isBest(home.pricePerSqft, bestPpsf, true)
                    else if (row.label === 'Bedrooms') isHighlight = isBest(home.beds, mostBeds, false)
                    else if (row.label === 'Living area') isHighlight = isBest(home.sqft, mostSqft, false)
                    return (
                      <td
                        key={home.id}
                        className={cn(
                          'p-4 text-sm font-medium text-stone-900',
                          isHighlight && 'rounded-lg bg-forest-100 font-bold text-forest-800',
                        )}
                      >
                        {value}
                        {isHighlight && <span className="ml-1.5 text-[10px] uppercase tracking-wider text-forest-600">Best</span>}
                      </td>
                    )
                  })}
                  {homes.length < 3 && <td />}
                </tr>
              ))}

              <tr className="bg-stone-50/60">
                <td className="p-4 text-sm font-semibold text-stone-700">Est. monthly payment</td>
                {homes.map((home) => {
                  const est = calcMortgage({
                    homePrice: home.price,
                    downPaymentPct: 20,
                    rate: 6.5,
                    termYears: 30,
                    taxRatePct: 1.1,
                    insuranceAnnual: 1800,
                    hoaMonthly: 0,
                    extraMonthly: 0,
                  })
                  const lowest = Math.min(...homes.map((h) =>
                    calcMortgage({ homePrice: h.price, downPaymentPct: 20, rate: 6.5, termYears: 30, taxRatePct: 1.1, insuranceAnnual: 1800, hoaMonthly: 0, extraMonthly: 0 }).monthlyTotal,
                  ))
                  return (
                    <td
                      key={home.id}
                      className={cn(
                        'p-4 text-sm font-bold text-stone-900',
                        homes.length > 1 && Math.round(est.monthlyTotal) === Math.round(lowest) && 'rounded-lg bg-forest-100 text-forest-800',
                      )}
                    >
                      {fmtUSD(Math.round(est.monthlyTotal))}/mo
                    </td>
                  )
                })}
                {homes.length < 3 && <td />}
              </tr>

              <tr>
                <td className="p-4" />
                {homes.map((home) => (
                  <td key={home.id} className="p-4">
                    <Link
                      to={`/property/${home.id}`}
                      className="block rounded-lg bg-forest-800 px-4 py-2 text-center text-sm font-bold text-cream transition-colors hover:bg-forest-900"
                    >
                      View details
                    </Link>
                  </td>
                ))}
                {homes.length < 3 && <td />}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
