export type ClothingCategory = 'tops' | 'bottoms' | 'shoes' | 'outerwear' | 'accessories' | 'other'
export type ClothingSeason = 'summer' | 'winter' | 'all'
export type ClothingItem = { id:string; name:string; category:ClothingCategory; color:string; season:ClothingSeason; notes:string; image:Blob|null; createdAt:number; updatedAt:number }
export type BodyProfile = { height?:number; styleNotes:string; updatedAt:number }