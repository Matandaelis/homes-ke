import type { Property } from '@/types'

export interface HotScore {
  score: number
  label: 'Hot Home' | 'Fast' | 'Steady' | 'New'
  badgeColor: string
}

export function computeHotScore(property: Property): HotScore {
  let score = 30

  if (property.isNew) score += 20
  if (property.openHouse) score += 12

  const pricePerSqft = property.pricePerSqft
  const avgPpsf = 440
  if (pricePerSqft < avgPpsf * 0.85) score += 22
  else if (pricePerSqft < avgPpsf * 0.95) score += 12

  if (property.beds >= 3 && property.beds <= 4) score += 10
  if (property.yearBuilt >= 2015) score += 10
  if (property.type === 'Townhouse' || property.type === 'Condo') score += 6

  if (property.features.length >= 6) score += 8

  score = Math.min(score, 100)

  if (score >= 70) return { score, label: 'Hot Home', badgeColor: 'bg-rose-500 text-white' }
  if (score >= 55) return { score, label: 'Fast', badgeColor: 'bg-amber-500 text-white' }
  if (property.isNew) return { score, label: 'New', badgeColor: 'bg-brass-500 text-white' }
  return { score, label: 'Steady', badgeColor: 'bg-stone-400 text-white' }
}
