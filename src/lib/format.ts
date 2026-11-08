import type { ClothingCategory } from '../types'

export const clothingCategories: ClothingCategory[] = ['tops', 'bottoms', 'shoes', 'outerwear', 'accessories', 'other']

export const categoryLabels: Record<ClothingCategory, string> = {
  tops: 'قمصان وبلوزات',
  bottoms: 'بناطيل',
  shoes: 'أحذية',
  outerwear: 'جاكيتات',
  accessories: 'إكسسوارات',
  other: 'أخرى',
}

export const makeId = () =>
  globalThis.crypto?.randomUUID?.() ?? 'item-' + Date.now() + '-' + Math.random().toString(16).slice(2)
