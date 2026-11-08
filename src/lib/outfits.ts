import type { ClothingItem, ClothingSeason, ClothingStyle, OutfitSuggestion } from '../types'

export type OutfitFilters = {
  style?: ClothingStyle | 'any'
  season?: ClothingSeason | 'any'
}

type ColorInfo = { family: string; hue: number; neutral: boolean; label: string }
type ColorHarmony = { score: number; reason: string; known: boolean }

const COLOR_TERMS: Array<{ terms: string[]; info: ColorInfo }> = [
  { terms: ['اسود', 'black', 'charcoal', 'فحمي'], info: { family: 'black', hue: 0, neutral: true, label: 'أسود' } },
  { terms: ['ابيض', 'white', 'عاجي', 'ivory'], info: { family: 'white', hue: 0, neutral: true, label: 'أبيض' } },
  { terms: ['رمادي', 'gray', 'grey', 'رصاصي', 'فضي', 'silver'], info: { family: 'gray', hue: 0, neutral: true, label: 'رمادي' } },
  { terms: ['بيج', 'beige', 'كريمي', 'cream', 'سكري', 'عظمي', 'offwhite'], info: { family: 'beige', hue: 35, neutral: true, label: 'بيج' } },
  { terms: ['بني', 'brown', 'جملي', 'camel', 'تان', 'tan', 'كاكاو'], info: { family: 'brown', hue: 28, neutral: true, label: 'بني' } },
  { terms: ['كحلي', 'navy', 'نيلي'], info: { family: 'navy', hue: 225, neutral: true, label: 'كحلي' } },
  { terms: ['ازرق', 'blue', 'جينز', 'denim', 'سماوي', 'skyblue', 'تركواز', 'turquoise'], info: { family: 'blue', hue: 215, neutral: false, label: 'أزرق' } },
  { terms: ['اخضر', 'green', 'زيتي', 'olive', 'نعناعي', 'mint'], info: { family: 'green', hue: 125, neutral: false, label: 'أخضر' } },
  { terms: ['احمر', 'red', 'عنابي', 'burgundy', 'خمري', 'wine'], info: { family: 'red', hue: 0, neutral: false, label: 'أحمر' } },
  { terms: ['وردي', 'زهري', 'pink', 'فوشي', 'fuchsia'], info: { family: 'pink', hue: 335, neutral: false, label: 'وردي' } },
  { terms: ['برتقالي', 'orange', 'مشمشي', 'coral'], info: { family: 'orange', hue: 28, neutral: false, label: 'برتقالي' } },
  { terms: ['اصفر', 'yellow', 'ذهبي', 'gold', 'خردلي', 'mustard'], info: { family: 'yellow', hue: 52, neutral: false, label: 'أصفر' } },
  { terms: ['بنفسجي', 'purple', 'موف', 'mauve', 'ليلكي', 'lavender'], info: { family: 'purple', hue: 275, neutral: false, label: 'بنفسجي' } },
]

const STYLE_SCORE: Record<Exclude<ClothingStyle, 'any'>, Record<Exclude<ClothingStyle, 'any'>, number>> = {
  casual: { casual: 20, 'smart-casual': 17, formal: 6, sport: 15, streetwear: 18, classic: 16 },
  'smart-casual': { casual: 17, 'smart-casual': 20, formal: 14, sport: 7, streetwear: 12, classic: 19 },
  formal: { casual: 6, 'smart-casual': 14, formal: 20, sport: 0, streetwear: 3, classic: 18 },
  sport: { casual: 15, 'smart-casual': 7, formal: 0, sport: 20, streetwear: 15, classic: 5 },
  streetwear: { casual: 18, 'smart-casual': 12, formal: 3, sport: 15, streetwear: 20, classic: 8 },
  classic: { casual: 16, 'smart-casual': 19, formal: 18, sport: 5, streetwear: 8, classic: 20 },
}

function normalizeText(value: string): string {
  return value.toLocaleLowerCase('ar')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/[\s_-]/g, '')
}

function hexColorInfo(value: string): ColorInfo | undefined {
  const match = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(value.trim())
  if (!match) return undefined
  const hex = match[1].length === 3 ? match[1].split('').map(char => char + char).join('') : match[1]
  const red = parseInt(hex.slice(0, 2), 16) / 255
  const green = parseInt(hex.slice(2, 4), 16) / 255
  const blue = parseInt(hex.slice(4, 6), 16) / 255
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const delta = max - min
  let hue = 0
  if (delta) {
    if (max === red) hue = 60 * (((green - blue) / delta) % 6)
    else if (max === green) hue = 60 * ((blue - red) / delta + 2)
    else hue = 60 * ((red - green) / delta + 4)
  }
  if (hue < 0) hue += 360
  const neutral = delta < 0.13
  const family = neutral ? 'neutral' : hue < 25 || hue >= 345 ? 'red' : hue < 50 ? 'orange' : hue < 70 ? 'yellow' : hue < 165 ? 'green' : hue < 255 ? 'blue' : 'purple'
  return { family, hue, neutral, label: neutral ? 'محايد' : family }
}

function getColorInfo(value: string): ColorInfo | undefined {
  const normalized = normalizeText(value)
  const hex = hexColorInfo(value)
  if (hex) return hex
  return COLOR_TERMS.find(entry => entry.terms.some(term => normalized.includes(normalizeText(term))))?.info
}

function hueDistance(first: number, second: number): number {
  const delta = Math.abs(first - second) % 360
  return Math.min(delta, 360 - delta)
}

/** Score color relationships rather than treating every text color as interchangeable. */
function colorHarmony(first: string, second: string): ColorHarmony {
  const a = getColorInfo(first)
  const b = getColorInfo(second)
  if (!a || !b) return { score: 0, reason: '', known: false }
  if (a.neutral && b.neutral) return { score: 20, reason: 'ألوان محايدة وسهلة التنسيق', known: true }
  if (a.neutral || b.neutral) return { score: 19, reason: 'لون أساسي مع لون بارز', known: true }
  if (a.family === b.family) return { score: 17, reason: 'تدرّج لوني قريب', known: true }
  const distance = hueDistance(a.hue, b.hue)
  if (distance <= 60) return { score: 17, reason: 'ألوان متجاورة ومتقاربة', known: true }
  if (distance >= 150 && distance <= 210) return { score: 16, reason: 'تباين لوني متوازن', known: true }
  if (distance >= 110 && distance <= 140) return { score: 14, reason: 'تباين واضح بين الألوان', known: true }
  return { score: 5, reason: 'تباين قوي بين اللونين', known: true }
}

function styleCompatibility(first: ClothingStyle = 'any', second: ClothingStyle = 'any'): number {
  if (first === 'any' || second === 'any') return 8
  return STYLE_SCORE[first][second]
}

function compatibleSeason(first: ClothingSeason, second: ClothingSeason): boolean {
  return first === 'all' || second === 'all' || first === second
}

function matchesSeason(item: ClothingItem, season: ClothingSeason): boolean {
  return item.season === 'all' || season === 'all' || item.season === season
}

function resolveSeason(top: ClothingItem, bottom: ClothingItem, selected: ClothingSeason | 'any'): ClothingSeason {
  if (selected !== 'any') return selected
  return top.season === 'all' ? bottom.season : top.season
}

function extraFit(item: ClothingItem, top: ClothingItem, bottom: ClothingItem): number {
  const topColor = colorHarmony(item.color, top.color).score
  const bottomColor = colorHarmony(item.color, bottom.color).score
  const topStyle = styleCompatibility(item.style ?? 'any', top.style ?? 'any')
  const bottomStyle = styleCompatibility(item.style ?? 'any', bottom.style ?? 'any')
  return (topColor + bottomColor) / 2 * 0.55 + (topStyle + bottomStyle) / 2 * 0.45
}

function chooseExtras(
  items: ClothingItem[],
  category: 'shoes' | 'outerwear' | 'accessories',
  top: ClothingItem,
  bottom: ClothingItem,
  season: ClothingSeason,
  excluded: Set<string>,
  minimumFit = 11,
): ClothingItem[] {
  return items
    .filter(item => item.category === category && !excluded.has(item.id) && matchesSeason(item, season))
    .map(item => ({ item, fit: extraFit(item, top, bottom) }))
    .filter(candidate => candidate.fit >= minimumFit)
    .sort((a, b) => b.fit - a.fit || a.item.name.localeCompare(b.item.name, 'ar'))
    .map(candidate => candidate.item)
}

function describeStyle(top: ClothingItem, bottom: ClothingItem): ClothingStyle {
  const topStyle = top.style ?? 'any'
  const bottomStyle = bottom.style ?? 'any'
  if (topStyle !== 'any') return topStyle
  return bottomStyle
}

/**
 * Creates ranked, explainable outfit suggestions from local wardrobe data.
 * It rejects season/style conflicts, scores colour harmony, then adds only compatible extras.
 */
export function buildOutfits(items: ClothingItem[], limit = 6, filters: OutfitFilters = {}): OutfitSuggestion[] {
  if (!Number.isInteger(limit) || limit <= 0) return []
  const styleFilter = filters.style ?? 'any'
  const seasonFilter = filters.season ?? 'any'
  const tops = items.filter(item => item.category === 'tops')
  const bottoms = items.filter(item => item.category === 'bottoms')
  const candidates: OutfitSuggestion[] = []

  for (const top of tops) {
    for (const bottom of bottoms) {
      if (!compatibleSeason(top.season, bottom.season)) continue
      if (styleCompatibility(top.style ?? 'any', bottom.style ?? 'any') < 8) continue
      if (styleFilter !== 'any' && top.style !== styleFilter && bottom.style !== styleFilter) continue
      if (seasonFilter !== 'any' && !matchesSeason(top, seasonFilter)) continue
      if (seasonFilter !== 'any' && !matchesSeason(bottom, seasonFilter)) continue

      const season = resolveSeason(top, bottom, seasonFilter)
      const color = colorHarmony(top.color, bottom.color)
      const styleScore = styleCompatibility(top.style ?? 'any', bottom.style ?? 'any')
      const seasonScore = top.season === bottom.season ? 18 : 16
      const baseScore = 16 + seasonScore + color.score + styleScore
      const excluded = new Set([top.id, bottom.id])
      const extras: ClothingItem[] = []
      let bonus = 0

      const shoe = chooseExtras(items, 'shoes', top, bottom, season, excluded)[0]
      if (shoe) {
        extras.push(shoe)
        excluded.add(shoe.id)
        bonus += Math.round(extraFit(shoe, top, bottom) / 20 * 8)
      }
      if (season === 'winter') {
        const jacket = chooseExtras(items, 'outerwear', top, bottom, season, excluded, 12)[0]
        if (jacket) {
          extras.push(jacket)
          excluded.add(jacket.id)
          bonus += 4
        }
      }
      const accessories = chooseExtras(items, 'accessories', top, bottom, season, excluded, 13).slice(0, 2)
      for (const accessory of accessories) {
        extras.push(accessory)
        excluded.add(accessory.id)
        bonus += 2
      }

      const score = Math.min(100, baseScore + bonus)
      if (score < 56) continue

      const style = describeStyle(top, bottom)
      const reasons: string[] = []
      if (color.known && color.reason) reasons.push(color.reason)
      if (styleScore >= 16 && style !== 'any') reasons.push('الستايل متقارب')
      if (seasonScore >= 16) reasons.push('الموسم متوافق')
      if (shoe) reasons.push('الحذاء مكمّل الإطلالة')
      if (season === 'winter' && extras.some(item => item.category === 'outerwear')) reasons.push('طبقة خارجية مناسبة للشتاء')

      candidates.push({
        id: [top.id, bottom.id, ...extras.map(item => item.id)].join('-'),
        title: style === 'any' ? 'تنسيق متوازن' : 'إطلالة ' + style,
        top,
        bottom,
        extras,
        season,
        style,
        score,
        quality: score >= 75 ? 'strong' : 'good',
        reasons: reasons.slice(0, 4),
      })
    }
  }

  // Greedy diversity: avoid filling the whole page with nearly identical outfits.
  const remaining = [...candidates]
  const selected: OutfitSuggestion[] = []
  const usage = new Map<string, number>()
  while (remaining.length && selected.length < limit) {
    let bestIndex = 0
    let bestAdjusted = Number.NEGATIVE_INFINITY
    for (let index = 0; index < remaining.length; index += 1) {
      const candidate = remaining[index]
      const ids = [candidate.top.id, candidate.bottom.id, ...candidate.extras.map(item => item.id)]
      const usedTogether = selected.reduce((count, previous) => count + ids.filter(id =>
        id === previous.top.id || id === previous.bottom.id || previous.extras.some(extra => extra.id === id),
      ).length, 0)
      const usagePenalty = ids.reduce((total, id) => total + (usage.get(id) ?? 0) * 2, 0)
      const adjusted = candidate.score - usedTogether * 5 - usagePenalty
      if (adjusted > bestAdjusted) {
        bestAdjusted = adjusted
        bestIndex = index
      }
    }
    const [chosen] = remaining.splice(bestIndex, 1)
    selected.push(chosen)
    for (const item of [chosen.top, chosen.bottom, ...chosen.extras]) usage.set(item.id, (usage.get(item.id) ?? 0) + 1)
  }
  return selected
}
