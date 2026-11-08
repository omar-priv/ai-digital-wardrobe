import type { BodyProfile, ClothingCategory, ClothingItem, ClothingSeason, ClothingStyle } from '../types'
import { clothingCategories } from './format'

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024
export const MAX_BACKUP_BYTES = 50 * 1024 * 1024
export const MAX_EXPORT_IMAGE_BYTES = 24 * 1024 * 1024
export const MAX_BACKUP_ITEMS = 10_000
export const MAX_PROFILE_NOTES = 10_000

const allowedSeasons: ClothingSeason[] = ['all', 'summer', 'winter']
const allowedStyles: ClothingStyle[] = ['any', 'casual', 'smart-casual', 'formal', 'sport', 'streetwear', 'classic']
const imageDataPattern = /^data:(image\/(?:png|jpeg|jpg|webp|gif));base64,((?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?)$/i
const maxBase64Chars = Math.ceil(MAX_IMAGE_BYTES / 3) * 4

export type BackupItem = Omit<ClothingItem, 'image'> & { image: string | null }
export type BackupPayload = { version: 1; exportedAt?: string; items: BackupItem[]; profile?: BodyProfile }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isValidImageData(value: unknown): value is string {
  if (typeof value !== 'string') return false
  const match = imageDataPattern.exec(value)
  return !!match && match[2].length > 0 && match[2].length <= maxBase64Chars
}

function isValidProfile(value: unknown): value is BodyProfile {
  if (!isRecord(value)) return false
  if (typeof value.styleNotes !== 'string' || value.styleNotes.length > MAX_PROFILE_NOTES) return false
  if (typeof value.updatedAt !== 'number' || !Number.isFinite(value.updatedAt) || value.updatedAt <= 0) return false
  if (value.height !== undefined &&
      (typeof value.height !== 'number' || !Number.isFinite(value.height) || value.height < 80 || value.height > 250)) return false
  return true
}

function isValidItem(value: unknown): value is BackupItem {
  if (!isRecord(value)) return false
  return typeof value.id === 'string' && value.id.length > 0 && value.id.length <= 128 &&
    typeof value.name === 'string' && value.name.trim().length > 0 && value.name.length <= 80 &&
    typeof value.category === 'string' && clothingCategories.includes(value.category as ClothingCategory) &&
    typeof value.color === 'string' && value.color.length <= 40 &&
    typeof value.season === 'string' && allowedSeasons.includes(value.season as ClothingSeason) &&
    (value.style === undefined || (typeof value.style === 'string' && allowedStyles.includes(value.style as ClothingStyle))) &&
    typeof value.notes === 'string' && value.notes.length <= 500 &&
    typeof value.createdAt === 'number' && Number.isFinite(value.createdAt) && value.createdAt > 0 &&
    typeof value.updatedAt === 'number' && Number.isFinite(value.updatedAt) && value.updatedAt > 0 &&
    (value.image === null || isValidImageData(value.image))
}

export function isBackup(value: unknown): value is BackupPayload {
  if (!isRecord(value) || value.version !== 1 || !Array.isArray(value.items)) return false
  if (value.items.length > MAX_BACKUP_ITEMS) return false
  const ids = new Set<string>()
  for (const item of value.items) {
    if (!isValidItem(item) || ids.has(item.id)) return false
    ids.add(item.id)
  }
  if (value.profile !== undefined && !isValidProfile(value.profile)) return false
  return true
}

export function dataUrlToBlob(data: string): Blob {
  const match = imageDataPattern.exec(data)
  if (!match || match[2].length === 0 || match[2].length > maxBase64Chars) {
    throw new Error('Invalid or oversized image data')
  }
  const mime = match[1].toLowerCase() === 'image/jpg' ? 'image/jpeg' : match[1].toLowerCase()
  const binary = atob(match[2])
  if (binary.length > MAX_IMAGE_BYTES) throw new Error('Image too large')
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  return new Blob([bytes], { type: mime })
}

export function blobToData(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error ?? new Error('Could not read image'))
    reader.readAsDataURL(blob)
  })
}
