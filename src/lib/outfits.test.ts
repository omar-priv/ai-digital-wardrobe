import { describe, expect, it } from 'vitest'
import { buildOutfits } from './outfits'
import type { ClothingItem, ClothingSeason } from '../types'

function item(id: string, category: ClothingItem['category'], season: ClothingSeason): ClothingItem {
  return { id, name: id, category, season, color: '', notes: '', image: null, createdAt: 1, updatedAt: 1 }
}

describe('buildOutfits', () => {
  it('does not combine incompatible summer and winter garments', () => {
    expect(buildOutfits([item('summer-top', 'tops', 'summer'), item('winter-bottom', 'bottoms', 'winter')])).toEqual([])
  })
  it('uses all-season shoes when the outfit season is unspecified', () => {
    const result = buildOutfits([
      item('top', 'tops', 'all'), item('bottom', 'bottoms', 'all'),
      item('winter-shoes', 'shoes', 'winter'), item('all-shoes', 'shoes', 'all'),
    ])
    expect(result).toHaveLength(1)
    expect(result[0].map(piece => piece.id)).toEqual(['top', 'bottom', 'all-shoes'])
  })
  it('adds a winter jacket only to winter combinations', () => {
    const result = buildOutfits([
      item('top', 'tops', 'winter'), item('bottom', 'bottoms', 'winter'), item('jacket', 'outerwear', 'winter'),
    ])
    expect(result[0].map(piece => piece.id)).toEqual(['top', 'bottom', 'jacket'])
  })
  it('caps suggestions and rejects invalid limits', () => {
    const clothes = [
      ...Array.from({ length: 4 }, (_, i) => item('top-' + i, 'tops', 'all')),
      ...Array.from({ length: 4 }, (_, i) => item('bottom-' + i, 'bottoms', 'all')),
    ]
    expect(buildOutfits(clothes)).toHaveLength(6)
    expect(buildOutfits(clothes, 0)).toEqual([])
  })
})
