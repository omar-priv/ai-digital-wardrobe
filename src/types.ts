export type ClothingCategory = 'tops' | 'bottoms' | 'shoes' | 'outerwear' | 'accessories' | 'other'
export type ClothingSeason = 'summer' | 'winter' | 'all'
export type ClothingStyle = 'any' | 'casual' | 'smart-casual' | 'formal' | 'sport' | 'streetwear' | 'classic'
export type ClothingItem = { id:string; name:string; category:ClothingCategory; color:string; season:ClothingSeason; style?:ClothingStyle; notes:string; image:Blob|null; createdAt:number; updatedAt:number }
export type BodyProfile = { height?:number; styleNotes:string; updatedAt:number }
export type OutfitQuality = 'strong' | 'good'
export type OutfitSuggestion = {
  id: string
  title: string
  top: ClothingItem
  bottom: ClothingItem
  extras: ClothingItem[]
  season: ClothingSeason
  style: ClothingStyle
  score: number
  quality: OutfitQuality
  reasons: string[]
}
