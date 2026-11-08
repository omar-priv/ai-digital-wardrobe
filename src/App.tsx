import { useEffect, useMemo, useState } from 'react'
import { Plus, Search, Shirt, Trash2, Pencil, X, Sparkles, Download, Upload, UserRound, Layers3 } from 'lucide-react'
import { deleteClothing, getAllClothes, getBodyProfile, saveBodyProfile, saveClothing } from './lib/db'
import { categoryLabels, makeId } from './lib/format'
import type { BodyProfile, ClothingCategory, ClothingItem, ClothingSeason } from './types'

const categories: ClothingCategory[] = ['tops','bottoms','shoes','outerwear','accessories','other']
const emptyForm = { name:'', category:'tops' as ClothingCategory, color:'', season:'all' as ClothingSeason, notes:'' }

function Photo({ blob, name }: { blob: Blob | null; name: string }) {
  const [url,setUrl] = useState('')
  useEffect(() => {
    if (!blob) { setUrl(''); return }
    const next = URL.createObjectURL(blob); setUrl(next)
    return () => URL.revokeObjectURL(next)
  },[blob])
  return url ? <img className="item-photo" src={url} alt={name}/> : <div className="photo-placeholder"><Shirt size={34}/></div>
}

export default function App() {
  const [items,setItems] = useState<ClothingItem[]>([])
  const [loading,setLoading] = useState(true)
  const [query,setQuery] = useState('')
  const [filter,setFilter] = useState('all')
  const [modal,setModal] = useState(false)
  const [editing,setEditing] = useState<ClothingItem|null>(null)
  const [form,setForm] = useState(emptyForm)
  const [photo,setPhoto] = useState<Blob|null>(null)
  const [preview,setPreview] = useState('')
  const [tab,setTab] = useState<'wardrobe'|'outfits'|'profile'>('wardrobe')
  const [profile,setProfile] = useState<BodyProfile>({styleNotes:'',updatedAt:Date.now()})
  const [notice,setNotice] = useState('')

  const refresh = async () => { setItems(await getAllClothes()); setLoading(false) }
  useEffect(() => { refresh().catch(()=>{setNotice('تعذّر الوصول للتخزين المحلي');setLoading(false)}); getBodyProfile().then(p=>p&&setProfile(p)).catch(()=>{}) },[])
  useEffect(() => { if (!notice) return; const id=window.setTimeout(()=>setNotice(''),3000); return ()=>window.clearTimeout(id) },[notice])

  const visible = useMemo(() => items.filter(i => (filter==='all'||i.category===filter) && (i.name+' '+i.color+' '+i.notes).toLowerCase().includes(query.toLowerCase())),[items,filter,query])
  const openNew = () => { setEditing(null);setForm(emptyForm);setPhoto(null);setPreview('');setModal(true) }
  const openEdit = (item:ClothingItem) => { setEditing(item);setForm({name:item.name,category:item.category,color:item.color,season:item.season,notes:item.notes});setPhoto(item.image);setPreview('');setModal(true) }
  const choosePhoto = (file?:File) => { if(!file)return; if(!file.type.startsWith('image/')){setNotice('اختار ملف صورة');return} if(file.size>8*1024*1024){setNotice('حجم الصورة لازم يكون أقل من 8MB');return} setPhoto(file);setPreview(URL.createObjectURL(file)) }
  const closeModal = () => { setModal(false);if(preview)URL.revokeObjectURL(preview);setPreview('') }
  const submit = async (e:React.FormEvent) => { e.preventDefault(); if(!form.name.trim()){setNotice('اكتب اسم القطعة');return}
    const now=Date.now();const item:ClothingItem={id:editing?.id??makeId(),...form,name:form.name.trim(),image:photo,createdAt:editing?.createdAt??now,updatedAt:now}
    await saveClothing(item);await refresh();closeModal();setNotice('انحفظت القطعة')
  }
  const remove = async (id:string) => { if(!window.confirm('متأكد بدك تحذف القطعة؟'))return;await deleteClothing(id);await refresh() }
  const exportData = async () => { const data=items.map(i=>i);const payload={version:1,exportedAt:new Date().toISOString(),items:await Promise.all(data.map(async i=>({...i,image:i.image?await blobToData(i.image):null}))),profile};const url=URL.createObjectURL(new Blob([JSON.stringify(payload)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='my-wardrobe-backup.json';a.click();URL.revokeObjectURL(url);setNotice('تم تصدير النسخة الاحتياطية') }
  const importData = async (file?:File) => { if(!file)return;try{const parsed=JSON.parse(await file.text());if(!Array.isArray(parsed.items))throw new Error();for(const raw of parsed.items){await saveClothing({...raw,image:raw.image?dataToBlob(raw.image):null})}if(parsed.profile){await saveBodyProfile(parsed.profile);setProfile(parsed.profile)}await refresh();setNotice('تم استيراد النسخة الاحتياطية')}catch{setNotice('ملف النسخة الاحتياطية غير صالح')} }
  const saveProfile = async () => {const next={...profile,updatedAt:Date.now()};await saveBodyProfile(next);setProfile(next);setNotice('انحفظ ملفك محلياً')}
  const suggestions = useMemo(()=>buildOutfits(items),[items])

  return <main className="app-shell">
    <aside className="sidebar"><div className="brand"><div className="brand-mark"><Layers3/></div><div><b>خزانتي</b><small>DIGITAL WARDROBE</small></div></div>
      <nav><button className={tab==='wardrobe'?'active':''} onClick={()=>setTab('wardrobe')}><Shirt/> خزانتي</button><button className={tab==='outfits'?'active':''} onClick={()=>setTab('outfits')}><Sparkles/> تنسيقات</button><button className={tab==='profile'?'active':''} onClick={()=>setTab('profile')}><UserRound/> ملفّي</button></nav>
      <div className="side-note"><span className="privacy-dot"/> بياناتك على جهازك<small>ما بنرفع صورك على أي سيرفر</small></div>
    </aside>
    <section className="main-area"><header className="topbar"><div><span className="eyebrow">مساحتك الشخصية</span><h1>{tab==='wardrobe'?'خزانة ملابسك':tab==='outfits'?'خلّينا ننسّق':'ملفك الشخصي'}</h1></div><div className="top-actions"><button className="icon-btn" title="تصدير نسخة احتياطية" onClick={exportData}><Download/></button><label className="icon-btn" title="استيراد نسخة احتياطية"><Upload/><input hidden type="file" accept="application/json" onChange={e=>importData(e.target.files?.[0])}/></label><button className="primary-btn" onClick={openNew}><Plus size={18}/> أضف قطعة</button></div></header>
    {notice&&<div className="notice">{notice}</div>}
    {tab==='wardrobe'&&<><div className="hero"><div><span className="eyebrow light">كل إشي بمكانه</span><h2>ستايلك، على<br/>طريقتك.</h2><p>رتّب قطعك، اكتشف شو عندك، وخلّي اختيار اللبس أسهل.</p><div className="hero-stats"><div><b>{items.length}</b><small>قطعة بالخزانة</small></div><div><b>{new Set(items.map(i=>i.category)).size}</b><small>تصنيفات</small></div></div></div><div className="hero-art"><div className="hanger">✳</div><span>YOUR STYLE<br/>YOUR RULES</span></div></div>
      <div className="section-heading"><div><h2>كل القطع</h2><p>إدارة خزانة ملابسك</p></div><div className="search-box"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="دوّر على قطعة..."/></div></div>
      <div className="filters"><button className={filter==='all'?'selected':''} onClick={()=>setFilter('all')}>الكل</button>{categories.map(c=><button key={c} className={filter===c?'selected':''} onClick={()=>setFilter(c)}>{categoryLabels[c]}</button>)}</div>
      {loading?<div className="empty">جاري تحميل خزانتك...</div>:visible.length===0?<div className="empty"><Shirt size={38}/><h3>{items.length?'ما لقينا قطع مطابقة':'خزانتك لسه فاضية'}</h3><p>{items.length?'جرّب تغيّر البحث أو التصنيف.':'ابدأ أضف أول قطعة ملابس عندك.'}</p><button className="primary-btn" onClick={openNew}><Plus size={17}/> أضف أول قطعة</button></div>:<div className="clothes-grid">{visible.map(item=><article className="clothing-card" key={item.id}><div className="card-image"><Photo blob={item.image} name={item.name}/><span className="category-chip">{categoryLabels[item.category]}</span><div className="card-actions"><button onClick={()=>openEdit(item)} aria-label="تعديل"><Pencil size={16}/></button><button onClick={()=>remove(item.id)} aria-label="حذف"><Trash2 size={16}/></button></div></div><div className="card-info"><h3>{item.name}</h3><div className="item-meta"><span><i style={{background:item.color||'#aaa'}}/>{item.color||'بدون لون'}</span><span>{item.season==='all'?'كل المواسم':item.season==='summer'?'صيفي':'شتوي'}</span></div></div></article>)}</div>}</>}
    {tab==='outfits'&&<><div className="intro-panel"><Sparkles/><div><h2>تنسيقات من ملابسك</h2><p>اقتراحات محلية بسيطة حسب القطع الموجودة عندك، بدون ذكاء اصطناعي خارجي.</p></div></div>{suggestions.length?<div className="outfit-list">{suggestions.map((s,i)=><div className="outfit-row" key={i}><b>تنسيق {i+1}</b><div>{s.map(item=><span key={item.id}>{item.name}</span>)}</div></div>)}</div>:<div className="empty">أضف قمصان وبناطيل وأحذية عشان نقدر نقترح تنسيقات.</div>}</>}
    {tab==='profile'&&<div className="profile-panel"><div className="intro-panel"><UserRound/><div><h2>تفاصيل تساعدك بالتنسيق</h2><p>اختياري بالكامل، والمعلومات بتضل محفوظة على جهازك.</p></div></div><label>الطول بالسنتيمتر<input type="number" min="80" max="250" value={profile.height??''} onChange={e=>setProfile({...profile,height:e.target.value?Number(e.target.value):undefined})} placeholder="مثلاً 175"/></label><label>ملاحظات عن ستايلك<textarea value={profile.styleNotes} onChange={e=>setProfile({...profile,styleNotes:e.target.value})} placeholder="الألوان أو القصّات اللي بتحبها..."/></label><button className="primary-btn" onClick={saveProfile}>احفظ المعلومات</button><p className="privacy-copy">ما في صورة جسم مطلوبة، وما بنرسل معلوماتك لأي جهة.</p></div>}
    </section>
    {modal&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)closeModal()}}><form className="modal" onSubmit={submit}><div className="modal-head"><div><span className="eyebrow">خزانة ملابسك</span><h2>{editing?'تعديل قطعة':'إضافة قطعة جديدة'}</h2></div><button type="button" className="icon-btn" onClick={closeModal}><X/></button></div><label className="photo-upload">{preview?<img src={preview} alt="معاينة"/>:photo?<Photo blob={photo} name="صورة القطعة"/>:<><Plus/><span>اضغط لإضافة صورة</span><small>JPG أو PNG — حتى 8MB</small></>}<input type="file" accept="image/*" onChange={e=>choosePhoto(e.target.files?.[0])}/></label><label>اسم القطعة<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="مثلاً: تيشيرت أبيض"/></label><div className="form-row"><label>التصنيف<select value={form.category} onChange={e=>setForm({...form,category:e.target.value as ClothingCategory})}>{categories.map(c=><option value={c} key={c}>{categoryLabels[c]}</option>)}</select></label><label>اللون<input value={form.color} onChange={e=>setForm({...form,color:e.target.value})} placeholder="أبيض"/></label></div><label>الموسم<select value={form.season} onChange={e=>setForm({...form,season:e.target.value as ClothingSeason})}><option value="all">كل المواسم</option><option value="summer">صيفي</option><option value="winter">شتوي</option></select></label><label>ملاحظات<textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="أي تفاصيل إضافية..."/></label><div className="modal-actions"><button type="button" className="secondary-btn" onClick={closeModal}>إلغاء</button><button className="primary-btn" type="submit">حفظ القطعة</button></div></form></div>}
  </main>
}

function buildOutfits(items:ClothingItem[]) {
  const tops=items.filter(i=>i.category==='tops'), bottoms=items.filter(i=>i.category==='bottoms'), shoes=items.filter(i=>i.category==='shoes')
  const result:ClothingItem[][]=[]
  for(const top of tops) for(const bottom of bottoms) { if(result.length>=6)break; const match=shoes.find(s=>s.season==='all'||top.season==='all'||s.season===top.season);result.push([top,bottom,...(match?[match]:[])]) }
  return result
}
function blobToData(blob:Blob):Promise<string>{return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob)})}
function dataToBlob(data:string){const [head,body]=data.split(',');const mime=head.match(/:(.*?);/)?.[1]??'image/png';const binary=atob(body);const bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);return new Blob([bytes],{type:mime})}
