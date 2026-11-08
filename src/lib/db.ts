import type { BodyProfile, ClothingItem } from '../types'

const DB_NAME = 'digital-wardrobe'
const DB_VERSION = 1
const CLOTHES = 'clothes'
const SETTINGS = 'settings'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(CLOTHES)) db.createObjectStore(CLOTHES, { keyPath: 'id' })
      if (!db.objectStoreNames.contains(SETTINGS)) db.createObjectStore(SETTINGS)
    }
    request.onsuccess = () => {
      const db = request.result
      db.onversionchange = () => db.close()
      resolve(db)
    }
    request.onerror = () => reject(request.error ?? new Error('تعذّر فتح قاعدة البيانات'))
  })
}

/** Resolve only after the transaction commits, not merely after its first request succeeds. */
function run<T>(
  store: string,
  mode: IDBTransactionMode,
  action: (objectStore: IDBObjectStore) => IDBRequest,
): Promise<T> {
  return openDB().then(db => new Promise<T>((resolve, reject) => {
    let transaction: IDBTransaction | undefined
    try {
      const currentTransaction = db.transaction(store, mode)
      transaction = currentTransaction
      let result: T
      const request = action(currentTransaction.objectStore(store))
      request.onsuccess = () => { result = request.result as T }
      request.onerror = () => reject(request.error ?? new Error('فشلت عملية التخزين'))
      currentTransaction.oncomplete = () => {
        db.close()
        resolve(result)
      }
      currentTransaction.onerror = () => {
        db.close()
        reject(currentTransaction.error ?? new Error('فشلت معاملة التخزين'))
      }
      currentTransaction.onabort = () => {
        db.close()
        reject(currentTransaction.error ?? new Error('تم إلغاء معاملة التخزين'))
      }
    } catch (error) {
      if (transaction) {
        transaction.onabort = () => { db.close(); reject(error) }
        try { transaction.abort() } catch { db.close(); reject(error) }
      } else {
        db.close()
        reject(error)
      }
    }
  }))
}

/**
 * Import all validated backup records in one IndexedDB transaction.
 * If any write fails, the whole import rolls back instead of leaving a partial restore.
 */
export function importBackup(items: ClothingItem[], profile?: BodyProfile): Promise<void> {
  return openDB().then(db => new Promise<void>((resolve, reject) => {
    let transaction: IDBTransaction | undefined
    try {
      const stores = profile ? [CLOTHES, SETTINGS] : [CLOTHES]
      transaction = db.transaction(stores, 'readwrite')
      transaction.oncomplete = () => {
        db.close()
        resolve()
      }
      transaction.onerror = () => {
        db.close()
        reject(transaction?.error ?? new Error('فشلت عملية استيراد النسخة الاحتياطية'))
      }
      transaction.onabort = () => {
        db.close()
        reject(transaction?.error ?? new Error('تم إلغاء استيراد النسخة الاحتياطية'))
      }

      const clothesStore = transaction.objectStore(CLOTHES)
      for (const item of items) clothesStore.put(item)
      if (profile) transaction.objectStore(SETTINGS).put(profile, 'bodyProfile')
    } catch (error) {
      if (transaction) {
        transaction.onabort = () => { db.close(); reject(error) }
        try { transaction.abort() } catch { db.close(); reject(error) }
      } else {
        db.close()
        reject(error)
      }
    }
  }))
}

export const getAllClothes = () => run<ClothingItem[]>(CLOTHES, 'readonly', store => store.getAll())
export const saveClothing = (item: ClothingItem) => run<IDBValidKey>(CLOTHES, 'readwrite', store => store.put(item))
export const deleteClothing = (id: string) => run<undefined>(CLOTHES, 'readwrite', store => store.delete(id))
export const getBodyProfile = () => run<BodyProfile | undefined>(SETTINGS, 'readonly', store => store.get('bodyProfile'))
export const saveBodyProfile = (profile: BodyProfile) => run<IDBValidKey>(SETTINGS, 'readwrite', store => store.put(profile, 'bodyProfile'))
