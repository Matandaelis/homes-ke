import { Link } from 'react-router'
import { Mail, Phone, MapPin } from 'lucide-react'
import Logo from '@/components/Logo'

export default function Footer() {
  return (
    <footer className="mt-auto bg-forest-950 text-stone-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <Logo size={36} />
            <div className="flex flex-col leading-none">
              <span className="font-display text-xl font-bold text-cream">Nestora</span>
              <span className="mt-1 text-[8px] font-bold uppercase tracking-[0.28em] text-brass-400">
                Fine homes
              </span>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-stone-400">
            A curated marketplace for distinctive homes — from desert mid-centuries to ivy-covered cottages.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-brass-300">Explore</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link to="/" className="hover:text-cream">Buy a home</Link></li>
            <li><Link to="/sell" className="hover:text-cream">Sell your home</Link></li>
            <li><Link to="/mortgage" className="hover:text-cream">Mortgage calculator</Link></li>
            <li><Link to="/pipeline" className="hover:text-cream">Agent pipeline</Link></li>
            <li><Link to="/saved" className="hover:text-cream">Saved searches</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-brass-300">Popular cities</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link to="/?q=Portland" className="hover:text-cream">Portland, OR</Link></li>
            <li><Link to="/?q=Scottsdale" className="hover:text-cream">Scottsdale, AZ</Link></li>
            <li><Link to="/?q=Miami" className="hover:text-cream">Miami, FL</Link></li>
            <li><Link to="/?q=Palm Springs" className="hover:text-cream">Palm Springs, CA</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-brass-300">Talk to us</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-brass-400" /> (800) 555-0134</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-brass-400" /> hello@nestora.example</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brass-400" /> 1212 Market St, Suite 900</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-stone-500">
        © 2026 Nestora Demo Marketplace · Listing photos are AI-generated · *Payment estimates assume 20% down, 6.5% APR, 30-yr fixed
      </div>
    </footer>
  )
}
