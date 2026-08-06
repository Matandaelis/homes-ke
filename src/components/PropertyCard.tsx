import { BedDouble, Bath, Ruler, Heart, MapPin, CalendarDays } from 'lucide-react'
import { Link } from 'react-router'
import type { Property } from '@/types'
import { calcMortgage, fmtUSD } from '@/lib/mortgage'
import { useMarketplace } from '@/context/MarketplaceContext'
import { cn } from '@/lib/utils'

export default function PropertyCard({ property }: { property: Property }) {
  const { isFavorite, toggleFavorite } = useMarketplace()
  const fav = isFavorite(property.id)
  const est = calcMortgage({
    homePrice: property.price,
    downPaymentPct: 20,
    rate: 6.5,
    termYears: 30,
    taxRatePct: 1.1,
    insuranceAnnual: 1800,
    hoaMonthly: 0,
    extraMonthly: 0,
  })

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_1px_3px_rgba(28,25,23,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-12px_rgba(15,53,41,0.25)]">
      {/* Image */}
      <div className="relative aspect-[3/2] overflow-hidden">
        <Link to={`/property/${property.id}`} className="block h-full">
          <img
            src={property.image}
            alt={property.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/55 via-transparent to-transparent" />
        </Link>

        {/* top-left: badges */}
        <div className="absolute left-3 top-3 flex gap-1.5">
          {property.isNew && (
            <span className="rounded-md bg-brass-500 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow">
              New
            </span>
          )}
          <span className="rounded-md bg-white/95 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-700 shadow">
            {property.type}
          </span>
        </div>

        {/* top-right: save */}
        <button
          onClick={() => toggleFavorite(property.id)}
          aria-label={fav ? 'Remove from saved homes' : 'Save this home'}
          className={cn(
            'absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-all duration-200 hover:scale-110',
            fav ? 'bg-rose-500 text-white' : 'bg-white/95 text-stone-500 hover:text-rose-500',
          )}
        >
          <Heart className={cn('h-4 w-4', fav && 'fill-current')} />
        </button>

        {/* bottom row: price left, open house right */}
        <div className="pointer-events-none absolute inset-x-4 bottom-3.5 flex items-end justify-between gap-3">
          <div>
            <p className="font-display text-[1.4rem] font-bold leading-none text-white drop-shadow-md">
              {fmtUSD(property.price)}
            </p>
            <p className="mt-1 text-xs font-medium text-white/85">{fmtUSD(property.pricePerSqft)}/sqft</p>
          </div>
          {property.openHouse && (
            <span className="mb-0.5 flex shrink-0 items-center gap-1.5 rounded-md bg-stone-950/60 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
              <CalendarDays className="h-3 w-3" /> Open {property.openHouse}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center text-sm text-stone-600">
          <span className="flex items-center gap-1.5">
            <BedDouble className="h-4 w-4 text-forest-600" />
            <span className="font-semibold text-stone-900">{property.beds}</span> bd
          </span>
          <span className="mx-3 h-4 w-px bg-stone-200" />
          <span className="flex items-center gap-1.5">
            <Bath className="h-4 w-4 text-forest-600" />
            <span className="font-semibold text-stone-900">{property.baths}</span> ba
          </span>
          <span className="mx-3 h-4 w-px bg-stone-200" />
          <span className="flex items-center gap-1.5">
            <Ruler className="h-4 w-4 text-forest-600" />
            <span className="font-semibold text-stone-900">{property.sqft.toLocaleString()}</span> sqft
          </span>
        </div>

        <Link to={`/property/${property.id}`} className="mt-3 block">
          <p className="font-display text-base font-bold text-stone-900 transition-colors hover:text-forest-700">
            {property.title}
          </p>
          <p className="mt-1 flex items-center gap-1 truncate text-sm text-stone-500">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-stone-400" />
            <span className="truncate">
              {property.address}, {property.city}, {property.state}
            </span>
          </p>
        </Link>

        <div className="mt-4 flex-1" />
        <Link
          to={`/mortgage?price=${property.price}`}
          className="block rounded-xl border border-forest-100 bg-forest-50 px-3 py-2.5 text-center text-sm font-semibold text-forest-800 transition-colors hover:border-forest-200 hover:bg-forest-100"
        >
          Est. {fmtUSD(Math.round(est.monthlyTotal))}/mo · calculate
        </Link>
      </div>
    </article>
  )
}
