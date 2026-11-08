import { describe, expect, it } from 'vitest'
import { buildOutfits } from './outfits'
import type { ClothingItem, ClothingSeason, ClothingStyle } from '../types'

function item(
  id: string,
  category: ClothingItem['category'],
  season: ClothingSeason = 'all',
  color = 'أبيض',
  style: ClothingStyle = 'casual',
): ClothingItem {
  return { id, name: id, category, season, color, style, notes: '', image: null, createdAt: 1, updatedAt: 1 }
}

describe('buildOutfits', () => {
  it('rejects incompatible summer and winter garments', () => {
    expect(buildOutfits([
      item('summer-top', 'tops', 'summer'),
      item('winter-bottom', 'bottoms', 'winter'),
    ])).toEqual([])
  })

  it('chooses a season-compatible shoe instead of the first shoe in storage', () => {
    const result = buildOutfits([
      item('top', 'tops', 'all', 'أبيض'),
      item('bottom', 'bottoms', 'all', 'أسود'),
      item('winter-shoes', 'shoes', 'winter', 'أحمر'),
      item('all-shoes', 'shoes', 'all', 'أسود'),
    ])
    expect(result).toHaveLength(1)
    expect(result[0].extras.map(piece => piece.id)).toContain('all-shoes')
    expect(result[0].extras.map(piece => piece.id)).not.toContain('winter-shoes')
  })

  it('does not pair formal clothing with sportswear', () => {
    expect(buildOutfits([
      item('shirt', 'tops', 'all', 'أبيض', 'formal'),
      item('joggers', 'bottoms', 'all', 'أسود', 'sport'),
    ])).toEqual([])
  })

  it('ranks neutral colour combinations and explains why they work', () => {
    const result = buildOutfits([
      item('white-shirt', 'tops', 'all', 'أبيض'),
      item('black-trousers', 'bottoms', 'all', 'أسود'),
    ])
    expect(result).toHaveLength(1)
    expect(result[0].score).toBeGreaterThanOrEqual(56)
    expect(result[0].reasons).toContain('ألوان محايدة وسهلة التنسيق')
  })

  it('adds only season-compatible outerwear for winter outfits', () => {
    const result = buildOutfits([
      item('top', 'tops', 'winter', 'أسود'),
      item('bottom', 'bottoms', 'winter', 'رمادي'),
      item('summer-jacket', 'outerwear', 'summer', 'أسود'),
      item('winter-jacket', 'outerwear', 'winter', 'أسود'),
    ])
    expect(result[0].extras.map(piece => piece.id)).toContain('winter-jacket')
    expect(result[0].extras.map(piece => piece.id)).not.toContain('summer-jacket')
  })

  it('filters results by selected style and season', () => {
    const clothes = [
      item('formal-top', 'tops', 'winter', 'أسود', 'formal'),
      item('formal-bottom', 'bottoms', 'winter', 'رمادي', 'formal'),
      item('casual-top', 'tops', 'summer', 'أبيض', 'casual'),
      item('casual-bottom', 'bottoms', 'summer', 'أسود', 'casual'),
    ]
    expect(buildOutfits(clothes, 6, { style: 'formal', season: 'winter' })).toHaveLength(1)
    expect(buildOutfits(clothes, 6, { style: 'sport' })).toEqual([])
  })

  it('caps results, ranks them, and rejects invalid limits', () => {
    const clothes = [
      ...Array.from({ length: 4 }, (_, index) => item('top-' + index, 'tops', 'all', index % 2 ? 'أسود' : 'أبيض')),
      ...Array.from({ length: 4 }, (_, index) => item('bottom-' + index, 'bottoms', 'all', index % 2 ? 'رمادي' : 'كحلي')),
    ]
    const result = buildOutfits(clothes)
    expect(result.length).toBeLessThanOrEqual(6)
    expect(result.every((entry, index) => index === 0 || result[index - 1].score >= entry.score - 10)).toBe(true)
    expect(buildOutfits(clothes, 0)).toEqual([])
  })
})
