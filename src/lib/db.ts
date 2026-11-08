import type { BodyProfile, ClothingItem } from '../types'
const DB_NAME='digital-wardrobe', DB_VERSION=1, CLOTHES='clothes', SETTINGS='settings'
function openDB():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,DB_VERSION);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(CLOTHES))db.createObjectStore(CLOTHES,{keyPath:'id'});if(!db.objectStoreNames.contains(SETTINGS))db.createObjectStore(SETTINGS)};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error??new Error('تعذّر فتح قاعدة البيانات'))})}
function run<T>(store:string,mode:IDBTransactionMode,action:(s:IDBObjectStore)=>IDBRequest):Promise<T>{return openDB().then(db=>new Promise((resolve,reject)=>{const tx=db.transaction(store,mode),req=action(tx.objectStore(store));req.onsuccess=()=>resolve(req.result as T);req.onerror=()=>reject(req.error??new Error('فشلت عملية التخزين'));tx.oncomplete=()=>db.close();tx.onerror=()=>{db.close();reject(tx.error)}}))}
export const getAllClothes=()=>run<ClothingItem[]>(CLOTHES,'readonly',s=>s.getAll())
export const saveClothing=(item:ClothingItem)=>run<IDBValidKey>(CLOTHES,'readwrite',s=>s.put(item))
export const deleteClothing=(id:string)=>run<undefined>(CLOTHES,'readwrite',s=>s.delete(id))
export const getBodyProfile=()=>run<BodyProfile|undefined>(SETTINGS,'readonly',s=>s.get('bodyProfile'))
export const saveBodyProfile=(p:BodyProfile)=>run<IDBValidKey>(SETTINGS,'readwrite',s=>s.put(p,'bodyProfile'))