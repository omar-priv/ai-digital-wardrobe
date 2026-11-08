import { describe, expect, it } from 'vitest'
import { dataUrlToBlob, isBackup, MAX_IMAGE_BYTES } from './backup'

const validItem = {
  id: 'item-1', name: 'قميص أبيض', category: 'tops', color: 'أبيض',
  season: 'all', notes: '', image: null, createdAt: 1_700_000_000_000, updatedAt: 1_700_000_000_000,
}
const validBackup = {
  version: 1, exportedAt: '2026-11-08T00:00:00.000Z', items: [validItem],
  profile: { styleNotes: 'ستايل بسيط', updatedAt: 1_700_000_000_000 },
}

describe('backup validation', () => {
  it('accepts a valid backup', () => expect(isBackup(validBackup)).toBe(true))
  it('rejects malformed and oversized profile values', () => {
    expect(isBackup({ ...validBackup, profile: 'not-an-object' })).toBe(false)
    expect(isBackup({ ...validBackup, profile: { styleNotes: 'x'.repeat(10_001), updatedAt: 1 } })).toBe(false)
  })
  it('rejects invalid item fields and unsupported image data', () => {
    expect(isBackup({ ...validBackup, items: [{ ...validItem, category: 'unknown' }] })).toBe(false)
    expect(isBackup({ ...validBackup, items: [{ ...validItem, name: '   ' }] })).toBe(false)
    expect(isBackup({ ...validBackup, items: [{ ...validItem, image: 'data:image/svg+xml;base64,PHN2Zz4=' }] })).toBe(false)
  })
  it('accepts legacy backups without a style and validates the optional style field', () => {
    expect(isBackup(validBackup)).toBe(true)
    expect(isBackup({ ...validBackup, items: [{ ...validItem, style: 'formal' }] })).toBe(true)
    expect(isBackup({ ...validBackup, items: [{ ...validItem, style: 'unknown-style' }] })).toBe(false)
  })
  it('rejects duplicate item IDs rather than silently overwriting one record', () => {
    expect(isBackup({ ...validBackup, items: [validItem, { ...validItem, name: 'نسخة ثانية' }] })).toBe(false)
  })
  it('rejects non-finite timestamps and oversized collections', () => {
    expect(isBackup({ ...validBackup, items: [{ ...validItem, createdAt: Number.NaN }] })).toBe(false)
    expect(isBackup({ ...validBackup, items: Array(10_001).fill(validItem) })).toBe(false)
  })
})

describe('image data conversion', () => {
  it('decodes supported base64 image data to a Blob', () => {
    const blob = dataUrlToBlob('data:image/png;base64,aGVsbG8=')
    expect(blob.type).toBe('image/png')
    expect(blob.size).toBe(5)
  })
  it('rejects unsupported or oversized image data before decoding', () => {
    expect(() => dataUrlToBlob('data:image/svg+xml;base64,PHN2Zz4=')).toThrow()
    const tooLarge = 'data:image/png;base64,' + 'A'.repeat(Math.ceil(MAX_IMAGE_BYTES / 3) * 4 + 4)
    expect(() => dataUrlToBlob(tooLarge)).toThrow()
  })
})
