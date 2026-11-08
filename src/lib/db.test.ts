import 'fake-indexeddb/auto'
import { IDBFactory } from 'fake-indexeddb'
import { beforeEach, describe, expect, it } from 'vitest'
import { getAllClothes, getBodyProfile, importBackup } from './db'
import type { BodyProfile, ClothingItem } from '../types'

const timestamp = 1_700_000_000_000

function makeItem(id: string, name = id): ClothingItem {
  return {
    id, name, category: 'tops', color: 'أبيض', season: 'all',
    notes: '', image: null, createdAt: timestamp, updatedAt: timestamp,
  }
}

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory()
})

describe('IndexedDB backup import', () => {
  it('commits clothing and profile together and merges by item id', async () => {
    const profile: BodyProfile = { styleNotes: 'ستايل بسيط', updatedAt: timestamp }
    await importBackup([makeItem('one'), makeItem('two')], profile)
    await importBackup([makeItem('one', 'اسم محدث')])

    const [items, savedProfile] = await Promise.all([getAllClothes(), getBodyProfile()])
    expect(items).toHaveLength(2)
    expect(items.find(item => item.id === 'one')?.name).toBe('اسم محدث')
    expect(savedProfile).toEqual(profile)
  })

  it('rolls back the whole import when a record cannot be stored', async () => {
    const invalid = { ...makeItem('missing-key'), id: undefined } as unknown as ClothingItem
    const profile: BodyProfile = { styleNotes: 'لازم ما تنحفظ', updatedAt: timestamp }

    await expect(importBackup([makeItem('valid-first'), invalid], profile)).rejects.toBeDefined()

    const [items, savedProfile] = await Promise.all([getAllClothes(), getBodyProfile()])
    expect(items).toEqual([])
    expect(savedProfile).toBeUndefined()
  })
})
