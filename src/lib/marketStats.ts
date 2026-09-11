import type { Property } from '@/types'

export interface MarketStats {
  city: string
  state: string
  label: string
  listingCount: number
  medianPrice: number
  avgPricePerSqft: number
  avgDom: number
  priceRangeLow: number
  priceRangeHigh: number
  newCount: number
  openHouseCount: number
  marketTemperature: 'buyer' | 'balanced' | 'seller'
  saleToListRatio: number
}

const CITY_DOM: Record<string, number> = {
  Bellevue: 12,
  Portland: 18,
  Scottsdale: 22,
  Greenwich: 35,
  'Santa Barbara': 28,
  Chicago: 15,
  Tucson: 30,
  Miami: 20,
  Franklin: 14,
  Bend: 25,
  'Palm Springs': 26,
}

const CITY_SALE_TO_LIST: Record<string, number> = {
  Bellevue: 0.985,
  Portland: 0.972,
  Scottsdale: 0.968,
  Greenwich: 0.954,
  'Santa Barbara': 0.974,
  Chicago: 0.979,
  Tucson: 0.961,
  Miami: 0.975,
  Franklin: 0.983,
  Bend: 0.976,
  'Palm Springs': 0.97,
}

function median(nums: number[]): number {
  if (nums.length === 0) return 0
  const sorted = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

export function computeMarketStats(properties: Property[]): MarketStats[] {
  const byCity = new Map<string, Property[]>()
  for (const p of properties) {
    const key = `${p.city}, ${p.state}`
    if (!byCity.has(key)) byCity.set(key, [])
    byCity.get(key)!.push(p)
  }

  const results: MarketStats[] = []
  for (const [label, homes] of byCity) {
    const city = homes[0].city
    const state = homes[0].state
    const prices = homes.map((h) => h.price)
    const ppsf = homes.map((h) => h.pricePerSqft)

    const dom = CITY_DOM[city] ?? 21
    const saleToList = CITY_SALE_TO_LIST[city] ?? 0.972

    const temperature: MarketStats['marketTemperature'] =
      dom < 16 || saleToList >= 0.98 ? 'seller' : dom > 28 ? 'buyer' : 'balanced'

    results.push({
      city,
      state,
      label,
      listingCount: homes.length,
      medianPrice: Math.round(median(prices)),
      avgPricePerSqft: Math.round(median(ppsf)),
      avgDom: dom,
      priceRangeLow: Math.min(...prices),
      priceRangeHigh: Math.max(...prices),
      newCount: homes.filter((h) => h.isNew).length,
      openHouseCount: homes.filter((h) => h.openHouse).length,
      marketTemperature: temperature,
      saleToListRatio: saleToList,
    })
  }

  return results.sort((a, b) => b.listingCount - a.listingCount)
}

export interface TrendPoint {
  month: string
  medianPrice: number
  inventory: number
}

export function computePriceTrend(properties: Property[], city: string): TrendPoint[] {
  const cityHomes = properties.filter((p) => p.city === city)
  if (cityHomes.length === 0) return []
  const baseMedian = median(cityHomes.map((h) => h.price))
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  const trend: number[] = [0.965, 0.972, 0.978, 0.985, 0.993, 1.0]
  const inventoryTrend = [8, 7, 9, 10, 11, cityHomes.length]

  return months.map((month, i) => ({
    month,
    medianPrice: Math.round(baseMedian * trend[i]),
    inventory: inventoryTrend[i],
  }))
}
