import { Link, NavLink } from 'react-router'
import { Heart, Hop as Home, Calculator, Tag, LayoutDashboard } from 'lucide-react'
import Logo from '@/components/Logo'
import { useMarketplace } from '@/context/MarketplaceContext'
import { cn } from '@/lib/utils'

const links = [
  { to: '/', label: 'Buy', icon: Home },
  { to: '/sell', label: 'Sell', icon: Tag },
  { to: '/mortgage', label: 'Mortgage', icon: Calculator },
  { to: '/pipeline', label: 'Pipeline', icon: LayoutDashboard },
  { to: '/saved', label: 'Saved', icon: Heart },
]

export default function Navbar() {
  const { favorites, savedSearches } = useMarketplace()
  const savedCount = favorites.length + savedSearches.length

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-2.5">
          <Logo size={38} />
          <div className="flex flex-col leading-none">
            <span className="font-display text-[1.35rem] font-bold tracking-tight text-stone-900 transition-colors group-hover:text-forest-800">
              Nestora
            </span>
            <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.28em] text-brass-600">
              Fine homes
            </span>
          </div>
        </Link>

        <nav className="ml-auto flex items-center gap-1.5">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-forest-900 text-cream shadow-sm'
                    : 'text-stone-600 hover:bg-stone-900/5 hover:text-stone-900',
                )
              }
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
              {to === '/saved' && savedCount > 0 && (
                <span className="ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brass-500 px-1.5 text-[11px] font-bold text-white">
                  {savedCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
