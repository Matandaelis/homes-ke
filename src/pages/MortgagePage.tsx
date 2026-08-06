import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { calcMortgage, fmtCompact, fmtUSD } from '@/lib/mortgage'
import { cn } from '@/lib/utils'

const SLICE_COLORS = ['#1a523e', '#f59e0b', '#0ea5e9', '#a78bfa']

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="mb-1.5 block whitespace-nowrap text-sm font-medium text-stone-700">{label}</label>
      {children}
      <p className="mt-1.5 h-4 text-xs tabular-nums text-stone-400">{hint}</p>
    </div>
  )
}

function SliderField({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label className="whitespace-nowrap text-sm font-medium text-stone-700">{label}</label>
        <span className="text-sm font-semibold tabular-nums text-stone-900">{hint}</span>
      </div>
      {children}
    </div>
  )
}

export default function MortgagePage() {
  const [params] = useSearchParams()
  const initialPrice = Math.min(Math.max(Number(params.get('price')) || 850_000, 50_000), 5_000_000)

  const [homePrice, setHomePrice] = useState(initialPrice)
  const [downPct, setDownPct] = useState(20)
  const [rate, setRate] = useState(6.5)
  const [term, setTerm] = useState(30)
  const [taxRate, setTaxRate] = useState(1.1)
  const [insurance, setInsurance] = useState(1800)
  const [hoa, setHoa] = useState(0)
  const [extra, setExtra] = useState(0)

  const result = useMemo(
    () =>
      calcMortgage({
        homePrice,
        downPaymentPct: downPct,
        rate,
        termYears: term,
        taxRatePct: taxRate,
        insuranceAnnual: insurance,
        hoaMonthly: hoa,
        extraMonthly: extra,
      }),
    [homePrice, downPct, rate, term, taxRate, insurance, hoa, extra],
  )

  const slices = [
    { label: 'Principal & interest', value: result.monthlyPI },
    { label: 'Property tax', value: result.monthlyTax },
    { label: 'Home insurance', value: result.monthlyInsurance },
    { label: 'HOA dues', value: result.monthlyHOA },
  ].filter((s) => s.value > 0.5)

  // Donut geometry
  const R = 70
  const C = 2 * Math.PI * R
  let acc = 0
  const arcs = slices.map((s, i) => {
    const frac = s.value / result.monthlyTotal
    const arc = { ...s, color: SLICE_COLORS[i % SLICE_COLORS.length], offset: acc, frac }
    acc += frac
    return arc
  })

  // Amortization chart geometry
  const sched = result.schedule
  const maxBar = Math.max(...sched.map((y) => y.principalPaid + y.interestPaid), 1)
  const W = 720
  const H = 260
  const padL = 8
  const padB = 28
  const padT = 16
  const chartH = H - padB - padT
  const barSlot = (W - padL * 2) / Math.max(sched.length, 1)
  const barW = Math.min(barSlot * 0.62, 34)
  const maxBalance = Math.max(result.loanAmount, 1)
  const balancePoints = sched
    .map((y, i) => {
      const x = padL + barSlot * i + barSlot / 2
      const yy = padT + chartH * (1 - y.balance / maxBalance)
      return `${x},${yy}`
    })
    .join(' ')

  const payoffDate = new Date()
  payoffDate.setMonth(payoffDate.getMonth() + result.payoffMonths)

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
      <section className="py-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">Mortgage calculator</h1>
        <p className="mt-1 text-stone-500">
          Estimate your monthly payment with taxes, insurance, and HOA — then see how the loan pays down over time.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        {/* Inputs */}
        <div className="space-y-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <SliderField label="Home price" hint={fmtUSD(homePrice)}>
            <Slider value={[homePrice]} min={50_000} max={5_000_000} step={5_000} onValueChange={([v]) => setHomePrice(v)} />
          </SliderField>

          <SliderField label="Down payment" hint={`${downPct}% · ${fmtUSD(result.downPayment)}`}>
            <Slider value={[downPct]} min={0} max={60} step={1} onValueChange={([v]) => setDownPct(v)} />
          </SliderField>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Interest rate (%)" hint="Annual percentage rate">
              <Input
                type="number"
                min={0}
                max={15}
                step={0.125}
                value={rate}
                onChange={(e) => setRate(Math.min(Math.max(Number(e.target.value) || 0, 0), 15))}
              />
            </Field>
            <Field label="Loan term">
              <Select value={String(term)} onValueChange={(v) => setTerm(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 15, 20, 25, 30].map((t) => (
                    <SelectItem key={t} value={String(t)}>
                      {t} years
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Property tax (%/yr)" hint={fmtUSD(result.monthlyTax) + '/mo'}>
              <Input
                type="number"
                min={0}
                max={4}
                step={0.05}
                value={taxRate}
                onChange={(e) => setTaxRate(Math.min(Math.max(Number(e.target.value) || 0, 0), 4))}
              />
            </Field>
            <Field label="Insurance ($/yr)" hint={fmtUSD(result.monthlyInsurance) + '/mo'}>
              <Input
                type="number"
                min={0}
                step={100}
                value={insurance}
                onChange={(e) => setInsurance(Math.max(Number(e.target.value) || 0, 0))}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="HOA dues ($/mo)">
              <Input type="number" min={0} step={25} value={hoa} onChange={(e) => setHoa(Math.max(Number(e.target.value) || 0, 0))} />
            </Field>
            <Field label="Extra principal ($/mo)" hint="Pays loan off faster">
              <Input type="number" min={0} step={50} value={extra} onChange={(e) => setExtra(Math.max(Number(e.target.value) || 0, 0))} />
            </Field>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <div className="grid gap-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:grid-cols-[220px_1fr]">
            {/* Donut */}
            <div className="relative mx-auto h-52 w-52">
              <svg viewBox="0 0 180 180" className="h-full w-full -rotate-90">
                <circle cx="90" cy="90" r={R} fill="none" stroke="#f5f5f4" strokeWidth="24" />
                {arcs.map((a) => (
                  <circle
                    key={a.label}
                    cx="90"
                    cy="90"
                    r={R}
                    fill="none"
                    stroke={a.color}
                    strokeWidth="24"
                    strokeDasharray={`${Math.max(a.frac * C - 1.5, 0)} ${C}`}
                    strokeDashoffset={-a.offset * C}
                    strokeLinecap="butt"
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs font-medium uppercase tracking-wide text-stone-400">Monthly</span>
                <span className="text-2xl font-bold text-stone-900">{fmtUSD(Math.round(result.monthlyTotal))}</span>
              </div>
            </div>

            {/* Breakdown */}
            <div className="flex flex-col justify-center">
              <ul className="space-y-2.5">
                {arcs.map((a) => (
                  <li key={a.label} className="flex items-center gap-3 text-sm">
                    <span className="h-3 w-3 rounded-sm" style={{ background: a.color }} />
                    <span className="flex-1 text-stone-600">{a.label}</span>
                    <span className="font-bold text-stone-900">{fmtUSD(Math.round(a.value))}</span>
                    <span className="w-12 text-right text-xs text-stone-400">{Math.round(a.frac * 100)}%</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-stone-100 pt-4 text-center">
                <div>
                  <p className="text-xs text-stone-400">Loan amount</p>
                  <p className="text-sm font-bold text-stone-900">{fmtCompact(result.loanAmount)}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-400">Total interest</p>
                  <p className="text-sm font-bold text-stone-900">{fmtCompact(result.totalInterest)}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-400">Payoff date</p>
                  <p className="text-sm font-bold text-stone-900">
                    {payoffDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
              {extra > 0 && result.payoffMonths < term * 12 && (
                <p className="mt-3 rounded-lg bg-forest-50 px-3 py-2 text-xs font-medium text-forest-800">
                  Extra payments shave {Math.round((term * 12 - result.payoffMonths) / 12)} years off the loan.
                </p>
              )}
            </div>
          </div>

          {/* Amortization */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2">
              <h2 className="font-display text-xl font-bold text-stone-900">Amortization schedule</h2>
              <span className="ml-auto flex items-center gap-4 text-xs text-stone-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-forest-700" /> Principal
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-amber-500" /> Interest
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-0.5 w-4 bg-stone-800" /> Balance
                </span>
              </span>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
              {[0.25, 0.5, 0.75, 1].map((f) => (
                <line
                  key={f}
                  x1={padL}
                  x2={W - padL}
                  y1={padT + chartH * (1 - f)}
                  y2={padT + chartH * (1 - f)}
                  stroke="#f0efed"
                  strokeDasharray="3 4"
                />
              ))}
              {sched.map((y, i) => {
                const x = padL + barSlot * i + (barSlot - barW) / 2
                const pH = (y.principalPaid / maxBar) * chartH
                const iH = (y.interestPaid / maxBar) * chartH
                return (
                  <g key={y.year}>
                    <rect x={x} y={padT + chartH - pH} width={barW} height={pH} rx={2} className="fill-forest-700" />
                    <rect x={x} y={padT + chartH - pH - iH} width={barW} height={iH} rx={2} className="fill-amber-500" />
                    {(sched.length <= 20 || y.year % 5 === 0 || y.year === 1) && (
                      <text x={padL + barSlot * i + barSlot / 2} y={H - 8} textAnchor="middle" className="fill-stone-400 text-[11px]">
                        {y.year}
                      </text>
                    )}
                  </g>
                )
              })}
              <polyline points={balancePoints} fill="none" stroke="#292524" strokeWidth="2.5" strokeLinejoin="round" />
            </svg>
            <p className={cn('mt-3 text-xs text-stone-400')}>
              Yearly principal vs. interest with remaining loan balance. Total cost of the loan:{' '}
              <span className="font-bold text-stone-600">{fmtUSD(Math.round(result.totalCost))}</span>.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
