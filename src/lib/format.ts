import type { ClothingCategory, ClothingStyle } from '../types'

export const clothingCategories: ClothingCategory[] = ['tops', 'bottoms', 'shoes', 'outerwear', 'accessories', 'other']

export const categoryLabels: Record<ClothingCategory, string> = {
  tops: 'قمصان وبلوزات',
  bottoms: 'بناطيل',
  shoes: 'أحذية',
  outerwear: 'جاكيتات',
  accessories: 'إكسسوارات',
  other: 'أخرى',
}

export const styleLabels: Record<ClothingStyle, string> = {
  any: 'متعدد الاستخدامات',
  casual: 'كاجوال',
  'smart-casual': 'سمارت كاجوال',
  formal: 'رسمي',
  sport: 'رياضي',
  streetwear: 'ستريت وير',
  classic: 'كلاسيك',
}

export const makeId = () =>
  globalThis.crypto?.randomUUID?.() ?? 'item-' + Date.now() + '-' + Math.random().toString(16).slice(2)
