import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Wallet, TrendingDown, TrendingUp, Calculator } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { calcAffordability } from '@/lib/affordability'
import { fmtCompact, fmtUSD } from '@/lib/mortgage'
import { cn } from '@/lib/utils'

export default function AffordabilityPage() {
  const [income, setIncome] = useState(120000)
  const [downPayment, setDownPayment] = useState(80000)
  const [debts, setDebts] = useState(500)
  const [rate, setRate] = useState(6.5)
  const [term, setTerm] = useState(30)
  const [taxRate, setTaxRate] = useState(1.1)
  const [insurance, setInsurance] = useState(1800)
  const [hoa, setHoa] = useState(0)

  const result = useMemo(
    () => calcAffordability({
      annualIncome: income,
      downPayment,
      monthlyDebts: debts,
      rate,
      termYears: term,
      taxRatePct: taxRate,
      insuranceAnnual: insurance,
      hoaMonthly: hoa,
    }),
    [income, downPayment, debts, rate, term, taxRate, insurance, hoa],
  )

  const monthlyIncome = income / 12
  const slices = [
    { label: 'Principal & interest', value: result.monthlyPI, color: '#1a523e' },
    { label: 'Property tax', value: result.monthlyTax, color: '#f59e0b' },
    { label: 'Insurance', value: result.monthlyInsurance, color: '#0ea5e9' },
    { label: 'HOA dues', value: result.monthlyHOA, color: '#a78bfa' },
  ].filter((s) => s.value > 0.5)

  const R = 70
  const C = 2 * Math.PI * R
  let acc = 0
  const arcs = slices.map((s) => {
    const frac = result.monthlyTotal > 0 ? s.value / result.monthlyTotal : 0
    const arc = { ...s, offset: acc, frac }
    acc += frac
    return arc
  })

  const dtiPct = Math.round(result.dtiRatio * 100)
  const dtiColor = dtiPct <= 28 ? 'text-forest-700' : dtiPct <= 36 ? 'text-amber-600' : 'text-rose-600'

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
      <section className="py-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-brass-600">Budgeting</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
          How much house can I afford?
        </h1>
        <p className="mt-1 text-stone-500">
          Based on the 28/36 rule: no more than 28% of income goes to housing, and total debts stay under 36%.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        {/* Inputs */}
        <div className="space-y-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700">Annual income (before tax)</label>
            <Input
              type="number"
              min={0}
              step={5000}
              value={income}
              onChange={(e) => setIncome(Math.max(Number(e.target.value) || 0, 0))}
            />
            <p className="mt-1.5 text-xs tabular-nums text-stone-400">{fmtUSD(monthlyIncome)}/mo gross</p>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <label className="text-sm font-medium text-stone-700">Down payment savings</label>
              <span className="text-sm font-semibold tabular-nums text-stone-900">{fmtUSD(downPayment)}</span>
            </div>
            <Slider value={[downPayment]} min={0} max={500000} step={5000} onValueChange={([v]) => setDownPayment(v)} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700">Monthly debt payments</label>
            <Input
              type="number"
              min={0}
              step={50}
              value={debts}
              onChange={(e) => setDebts(Math.max(Number(e.target.value) || 0, 0))}
            />
            <p className="mt-1.5 text-xs text-stone-400">Car, student loans, credit card minimums, etc.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700">Interest rate (%)</label>
              <Input
                type="number"
                min={0}
                max={15}
                step={0.125}
                value={rate}
                onChange={(e) => setRate(Math.min(Math.max(Number(e.target.value) || 0, 0), 15))}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700">Loan term</label>
              <Select value={String(term)} onValueChange={(v) => setTerm(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[15, 20, 25, 30].map((t) => (
                    <SelectItem key={t} value={String(t)}>{t} years</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700">Property tax (%/yr)</label>
              <Input
                type="number"
                min={0}
                max={4}
                step={0.05}
                value={taxRate}
                onChange={(e) => setTaxRate(Math.min(Math.max(Number(e.target.value) || 0, 0), 4))}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700">Insurance ($/yr)</label>
              <Input
                type="number"
                min={0}
                step={100}
                value={insurance}
                onChange={(e) => setInsurance(Math.max(Number(e.target.value) || 0, 0))}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700">HOA dues ($/mo)</label>
            <Input
              type="number"
              min={0}
              step={25}
              value={hoa}
              onChange={(e) => setHoa(Math.max(Number(e.target.value) || 0, 0))}
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Hero number */}
          <div className="rounded-2xl border border-stone-200 bg-white p-7 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest-100 text-forest-700">
                <Wallet className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-stone-400">Maximum affordable price</p>
                <p className="font-display text-4xl font-bold text-forest-900">{fmtUSD(Math.round(result.maxHomePrice))}</p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4 border-t border-stone-100 pt-6 text-center">
              <div>
                <p className="text-xs text-stone-400">Loan amount</p>
                <p className="mt-1 text-sm font-bold text-stone-900">{fmtCompact(result.loanAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-stone-400">Down payment</p>
                <p className="mt-1 text-sm font-bold text-stone-900">{fmtCompact(downPayment)}</p>
              </div>
              <div>
                <p className="text-xs text-stone-400">Monthly payment</p>
                <p className="mt-1 text-sm font-bold text-stone-900">{fmtUSD(Math.round(result.monthlyTotal))}/mo</p>
              </div>
            </div>
            <Link
              to={`/?&maxPrice=${Math.round(result.maxHomePrice)}`}
              className="mt-5 block rounded-xl bg-forest-800 px-4 py-3 text-center text-sm font-bold text-cream transition-colors hover:bg-forest-900"
            >
              Find homes in my budget
            </Link>
          </div>

          {/* DTI gauge */}
          <div className="grid gap-6 sm:grid-cols-[200px_1fr]">
            <div className="relative mx-auto h-44 w-44">
              <svg viewBox="0 0 180 180" className="h-full w-full -rotate-90">
                <circle cx="90" cy="90" r={R} fill="none" stroke="#f5f5f4" strokeWidth="20" />
                {arcs.map((a) => (
                  <circle
                    key={a.label}
                    cx="90"
                    cy="90"
                    r={R}
                    fill="none"
                    stroke={a.color}
                    strokeWidth="20"
                    strokeDasharray={`${Math.max(a.frac * C - 1.5, 0)} ${C}`}
                    strokeDashoffset={-a.offset * C}
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs font-medium uppercase tracking-wide text-stone-400">Monthly</span>
                <span className="text-xl font-bold text-stone-900">{fmtUSD(Math.round(result.monthlyTotal))}</span>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <h2 className="font-display text-lg font-bold text-stone-900">Debt-to-income ratio</h2>
              <p className="mt-1 text-sm text-stone-500">Lenders look at how much of your income goes to debt.</p>
              <div className="mt-4">
                <div className="flex items-baseline gap-2">
                  <span className={cn('font-display text-3xl font-bold', dtiColor)}>{dtiPct}%</span>
                  <span className="text-sm text-stone-400">of gross monthly income</span>
                </div>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-stone-100">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      dtiPct <= 28 ? 'bg-forest-500' : dtiPct <= 36 ? 'bg-amber-500' : 'bg-rose-500',
                    )}
                    style={{ width: `${Math.min(dtiPct, 100)}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-stone-400">
                  {dtiPct <= 28 ? (
                    <><TrendingUp className="h-3.5 w-3.5 text-forest-600" /> Healthy — well within the 28% front-end limit.</>
                  ) : dtiPct <= 36 ? (
                    <><TrendingUp className="h-3.5 w-3.5 text-amber-600" /> Tight — at the 36% back-end limit.</>
                  ) : (
                    <><TrendingDown className="h-3.5 w-3.5 text-rose-600" /> Over budget — reduce debts or increase income.</>
                  )}
                </div>
              </div>
              <ul className="mt-5 space-y-2">
                {slices.map((s) => (
                  <li key={s.label} className="flex items-center gap-3 text-sm">
                    <span className="h-3 w-3 rounded-sm" style={{ background: s.color }} />
                    <span className="flex-1 text-stone-600">{s.label}</span>
                    <span className="font-bold text-stone-900">{fmtUSD(Math.round(s.value))}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Quick link */}
          <div className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-stone-50 p-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-forest-700 shadow-sm">
              <Calculator className="h-6 w-6" />
            </span>
            <div>
              <p className="font-semibold text-stone-900">Want the full breakdown?</p>
              <p className="text-sm text-stone-500">See amortization, payoff date, and total interest on the mortgage calculator.</p>
            </div>
            <Link
              to={`/mortgage?price=${Math.round(result.maxHomePrice)}`}
              className="ml-auto shrink-0 rounded-lg border border-forest-200 bg-white px-4 py-2 text-sm font-bold text-forest-800 transition-colors hover:bg-forest-100"
            >
              Open calculator
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
