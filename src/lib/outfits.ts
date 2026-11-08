import type { ClothingItem } from '../types'

/** Build transparent, deterministic outfit suggestions from the user's own items. */
export function buildOutfits(items: ClothingItem[], limit = 6): ClothingItem[][] {
  if (!Number.isInteger(limit) || limit <= 0) return []
  const tops = items.filter(item => item.category === 'tops')
  const bottoms = items.filter(item => item.category === 'bottoms')
  const shoes = items.filter(item => item.category === 'shoes')
  const outerwear = items.filter(item => item.category === 'outerwear')
  const result: ClothingItem[][] = []

  for (const top of tops) {
    for (const bottom of bottoms) {
      if (result.length >= limit) return result
      if (top.season !== 'all' && bottom.season !== 'all' && top.season !== bottom.season) continue
      const season = top.season === 'all' ? bottom.season : top.season
      const shoe = shoes.find(item => item.season === 'all' || (season !== 'all' && item.season === season))
      const jacket = season === 'winter'
        ? outerwear.find(item => item.season === 'all' || item.season === 'winter')
        : undefined
      result.push([top, bottom, ...(shoe ? [shoe] : []), ...(jacket ? [jacket] : [])])
    }
  }
  return result
}
