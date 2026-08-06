export interface MortgageInput {
  homePrice: number
  downPaymentPct: number // 0-100
  rate: number // annual %
  termYears: number
  taxRatePct: number // annual % of home price
  insuranceAnnual: number // $ / year
  hoaMonthly: number // $ / month
  extraMonthly: number // extra principal $ / month
}

export interface YearPoint {
  year: number
  balance: number
  principalPaid: number
  interestPaid: number
}

export interface MortgageResult {
  loanAmount: number
  downPayment: number
  monthlyPI: number
  monthlyTax: number
  monthlyInsurance: number
  monthlyHOA: number
  monthlyTotal: number
  totalInterest: number
  totalCost: number
  payoffMonths: number
  schedule: YearPoint[]
}

export function calcMortgage(input: MortgageInput): MortgageResult {
  const { homePrice, downPaymentPct, rate, termYears, taxRatePct, insuranceAnnual, hoaMonthly, extraMonthly } = input
  const downPayment = (homePrice * downPaymentPct) / 100
  const loanAmount = Math.max(homePrice - downPayment, 0)
  const r = rate / 100 / 12
  const n = termYears * 12

  const monthlyPI =
    loanAmount === 0 ? 0 : r === 0 ? loanAmount / n : (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)

  const monthlyTax = (homePrice * taxRatePct) / 100 / 12
  const monthlyInsurance = insuranceAnnual / 12
  const monthlyHOA = hoaMonthly
  const monthlyTotal = monthlyPI + monthlyTax + monthlyInsurance + monthlyHOA

  // Amortization (with extra principal), yearly aggregation
  const schedule: YearPoint[] = []
  let balance = loanAmount
  let totalInterest = 0
  let months = 0
  let yearPrincipal = 0
  let yearInterest = 0

  while (balance > 0.005 && months < n) {
    const interest = balance * r
    let principal = monthlyPI - interest + extraMonthly
    if (principal > balance) principal = balance
    balance -= principal
    totalInterest += interest
    yearPrincipal += principal
    yearInterest += interest
    months++
    if (months % 12 === 0 || balance <= 0.005) {
      schedule.push({
        year: Math.ceil(months / 12),
        balance: Math.max(balance, 0),
        principalPaid: yearPrincipal,
        interestPaid: yearInterest,
      })
      yearPrincipal = 0
      yearInterest = 0
    }
  }

  return {
    loanAmount,
    downPayment,
    monthlyPI,
    monthlyTax,
    monthlyInsurance,
    monthlyHOA,
    monthlyTotal,
    totalInterest,
    totalCost: loanAmount + totalInterest,
    payoffMonths: months,
    schedule,
  }
}

export const fmtUSD = (v: number, decimals = 0) =>
  v.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: decimals, maximumFractionDigits: decimals })

export const fmtCompact = (v: number) =>
  v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(2)}M` : v >= 1_000 ? `$${Math.round(v / 1_000)}K` : fmtUSD(v)
