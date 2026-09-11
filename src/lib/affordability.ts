export interface AffordabilityInput {
  annualIncome: number
  downPayment: number
  monthlyDebts: number
  rate: number
  termYears: number
  taxRatePct: number
  insuranceAnnual: number
  hoaMonthly: number
}

export interface AffordabilityResult {
  maxMonthlyPayment: number
  maxHomePrice: number
  loanAmount: number
  monthlyPI: number
  monthlyTax: number
  monthlyInsurance: number
  monthlyHOA: number
  monthlyTotal: number
  dtiRatio: number
}

const FRONT_END_RATIO = 0.28
const BACK_END_RATIO = 0.36

export function calcAffordability(input: AffordabilityInput): AffordabilityResult {
  const { annualIncome, downPayment, monthlyDebts, rate, termYears, taxRatePct, insuranceAnnual, hoaMonthly } = input
  const monthlyIncome = annualIncome / 12

  const maxFrontEnd = monthlyIncome * FRONT_END_RATIO
  const maxBackEnd = monthlyIncome * BACK_END_RATIO - monthlyDebts
  const maxMonthlyPayment = Math.max(Math.min(maxFrontEnd, maxBackEnd), 0)

  const monthlyTaxPerDollar = taxRatePct / 100 / 12
  const monthlyInsurancePerDollar = insuranceAnnual / 12
  const monthlyHOA = hoaMonthly

  const availableForPI = Math.max(maxMonthlyPayment - monthlyHOA, 0)

  const r = rate / 100 / 12
  const n = termYears * 12
  const piPerDollar = r === 0 ? 1 / n : (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)

  const maxLoan = availableForPI > 0 && piPerDollar > 0 ? availableForPI / piPerDollar : 0
  const maxHomePrice = maxLoan + downPayment

  const loanAmount = maxLoan
  const monthlyPI = loanAmount * piPerDollar
  const monthlyTax = maxHomePrice * monthlyTaxPerDollar
  const monthlyInsurance = monthlyInsurancePerDollar
  const monthlyTotal = monthlyPI + monthlyTax + monthlyInsurance + monthlyHOA
  const dtiRatio = monthlyIncome > 0 ? monthlyTotal / monthlyIncome : 0

  return {
    maxMonthlyPayment,
    maxHomePrice,
    loanAmount,
    monthlyPI,
    monthlyTax,
    monthlyInsurance,
    monthlyHOA,
    monthlyTotal,
    dtiRatio,
  }
}
