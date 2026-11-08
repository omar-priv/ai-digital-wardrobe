import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, ChangeEvent, ReactNode } from 'react'
import { Shirt, Plus, Search, Download, Upload, Sparkles, UserRound, Trash2, Pencil, X, ShieldCheck, PackageOpen, Ruler, Layers3 } from 'lucide-react'
import { deleteClothing, getAllClothes, getBodyProfile, importBackup, saveBodyProfile, saveClothing } from './lib/db'
import { blobToData, dataUrlToBlob, isBackup, MAX_BACKUP_BYTES, MAX_IMAGE_BYTES } from './lib/backup'
import { buildOutfits } from './lib/outfits'
import { categoryLabels, clothingCategories, makeId } from './lib/format'
import type { BodyProfile, ClothingCategory, ClothingItem, ClothingSeason } from './types'

const emptyForm = { name:'', category:'tops' as ClothingCategory, color:'', season:'all' as ClothingSeason, notes:'' }

function Photo({blob,name}:{blob:Blob|null;name:string}) {
  const [url,setUrl] = useState('')
  useEffect(()=>{ if(!blob){setUrl('');return} const next=URL.createObjectURL(blob);setUrl(next);return ()=>URL.revokeObjectURL(next) },[blob])
  return url ? <img className="item-photo" src={url} alt={name}/> : <div className="photo-placeholder"><Shirt size={34} strokeWidth={1.4}/></div>
}

export default function App() {
  const [items,setItems] = useState<ClothingItem[]>([])
  const [loading,setLoading] = useState(true)
  const [loadError,setLoadError] = useState(false)
  const [query,setQuery] = useState('')
  const [filter,setFilter] = useState<'all'|ClothingCategory>('all')
  const [modal,setModal] = useState(false)
  const [editing,setEditing] = useState<ClothingItem|null>(null)
  const [form,setForm] = useState(emptyForm)
  const [photo,setPhoto] = useState<Blob|null>(null)
  const [preview,setPreview] = useState('')
  const [tab,setTab] = useState<'wardrobe'|'outfits'|'profile'>('wardrobe')
  const [profile,setProfile] = useState<BodyProfile>({styleNotes:'',updatedAt:Date.now()})
  const [notice,setNotice] = useState('')
  const [busy,setBusy] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(()=>{if(!photo){setPreview('');return}const url=URL.createObjectURL(photo);setPreview(url);return ()=>URL.revokeObjectURL(url)},[photo])
  useEffect(()=>{
    let active=true
    Promise.all([getAllClothes(),getBodyProfile()]).then(([stored,saved])=>{if(!active)return;setItems(stored);if(saved)setProfile(saved)})
      .catch(()=>{if(active){setLoadError(true);setNotice('تعذّر فتح خزانتك المحلية. جرّب مرة ثانية.')}})
      .finally(()=>{if(active)setLoading(false)})
    return ()=>{active=false}
  },[])
  useEffect(()=>{if(!notice)return;const id=window.setTimeout(()=>setNotice(''),3600);return ()=>window.clearTimeout(id)},[notice])
  useEffect(()=>{if(!modal)return;const previous=document.activeElement as HTMLElement|null;nameInputRef.current?.focus();const handler=(e:KeyboardEvent)=>{if(e.key==='Escape'){closeModal();return}if(e.key==='Tab'){const nodes=Array.from(document.querySelectorAll<HTMLElement>('.modal button:not(:disabled),.modal input:not(:disabled),.modal select:not(:disabled),.modal textarea:not(:disabled)')).filter(node=>node.offsetParent!==null);const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}};window.addEventListener('keydown',handler);return ()=>{window.removeEventListener('keydown',handler);previous?.focus()}},[modal])

  const visible=useMemo(()=>items.filter(item=>(filter==='all'||item.category===filter)&&(item.name+' '+item.color+' '+item.notes).toLocaleLowerCase('ar').includes(query.toLocaleLowerCase('ar'))),[items,filter,query])
  const suggestions=useMemo(()=>buildOutfits(items),[items])
  const refresh=async()=>setItems(await getAllClothes())
  const openNew=()=>{setEditing(null);setForm(emptyForm);setPhoto(null);setModal(true)}
  const openEdit=(item:ClothingItem)=>{setEditing(item);setForm({name:item.name,category:item.category,color:item.color,season:item.season,notes:item.notes});setPhoto(item.image);setModal(true)}
  const closeModal=()=>{setModal(false);setEditing(null);setPhoto(null);setForm(emptyForm)}
  const choosePhoto=(event:ChangeEvent<HTMLInputElement>)=>{
    const file=event.target.files?.[0];event.target.value='';if(!file)return
    if(!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type)){setNotice('استخدم صورة JPG أو PNG أو WebP أو GIF.');return}
    if(file.size>MAX_IMAGE_BYTES){setNotice('حجم الصورة أكبر من 8 ميغابايت.');return}
    setPhoto(file)
  }
  const submit=async(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();if(!form.name.trim()){setNotice('اكتب اسم القطعة أولاً.');return}
    setBusy(true)
    try{
      const now=Date.now()
      const item:ClothingItem={id:editing?.id??makeId(),...form,name:form.name.trim(),color:form.color.trim(),image:photo,createdAt:editing?.createdAt??now,updatedAt:now}
      await saveClothing(item);await refresh();closeModal();setNotice(editing?'تم تحديث القطعة.':'انضافت القطعة لخزانتك.')
    }catch{setNotice('ما قدرنا نحفظ القطعة. تأكد من مساحة التخزين المتاحة.')}
    finally{setBusy(false)}
  }
  const remove=async(id:string)=>{
    if(!window.confirm('متأكد إنك بدك تحذف هاي القطعة؟'))return
    try{await deleteClothing(id);await refresh();setNotice('انحذفت القطعة.')}catch{setNotice('تعذّر حذف القطعة. جرّب مرة ثانية.')}
  }
  const exportData=async()=>{
    try{
      const payload={version:1,exportedAt:new Date().toISOString(),items:await Promise.all(items.map(async item=>({...item,image:item.image?await blobToData(item.image):null}))),profile}
      const url=URL.createObjectURL(new Blob([JSON.stringify(payload)],{type:'application/json'}))
      const a=document.createElement('a');a.href=url;a.download='my-wardrobe-backup.json';a.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000)
      setNotice('جهزنا النسخة الاحتياطية.')
    }catch{setNotice('تعذّر إنشاء النسخة الاحتياطية.')}
  }
  const importData=async(event:ChangeEvent<HTMLInputElement>)=>{
    const file=event.target.files?.[0];event.target.value='';if(!file)return
    if(file.size>MAX_BACKUP_BYTES){setNotice('ملف النسخة الاحتياطية أكبر من 50 ميغابايت.');return}
    setBusy(true)
    try{
      const parsed:unknown=JSON.parse(await file.text())
      if(!isBackup(parsed))throw new Error('invalid backup')
      const importedItems=parsed.items.map(raw=>({...raw,image:raw.image?dataUrlToBlob(raw.image):null}))
      await importBackup(importedItems,parsed.profile)
      if(parsed.profile)setProfile(parsed.profile)
      await refresh();setNotice('تم استيراد ودمج النسخة الاحتياطية مع القطع الموجودة.')
    }catch{setNotice('الملف مش نسخة احتياطية صالحة من خزانتي.')}
    finally{setBusy(false)}
  }
  const saveProfile=async()=>{
    if(profile.height!==undefined&&(!Number.isFinite(profile.height)||profile.height<80||profile.height>250)){setNotice('الطول لازم يكون بين 80 و250 سم.');return}
    const next={...profile,updatedAt:Date.now()}
    setBusy(true)
    try{await saveBodyProfile(next);setProfile(next);setNotice('انحفظت معلوماتك على جهازك.')}catch{setNotice('تعذّر حفظ المعلومات. جرّب مرة ثانية.')}
    finally{setBusy(false)}
  }

  return <div className="app-shell">
    <a className="skip-link" href="#main-content">تجاوز إلى المحتوى</a>
    <aside className="sidebar">
      <button className="brand" type="button" onClick={()=>setTab('wardrobe')} aria-label="خزانتي - الرئيسية"><span className="brand-mark"><Layers3 size={22}/></span><span className="brand-copy"><b>خزانتي</b><small>WARDROBE ARCHIVE</small></span></button>
      <span className="nav-caption">مساحتك</span>
      <nav className="main-nav" aria-label="القائمة الرئيسية">
        <NavButton active={tab==='wardrobe'} onClick={()=>setTab('wardrobe')} icon={<Shirt/>} label="الملابس"/>
        <NavButton active={tab==='outfits'} onClick={()=>setTab('outfits')} icon={<Sparkles/>} label="التنسيقات"/>
        <NavButton active={tab==='profile'} onClick={()=>setTab('profile')} icon={<UserRound/>} label="ملفي"/>
      </nav>
      <div className="sidebar-footer"><div className="privacy-mark"><ShieldCheck size={17}/><span>خصوصيتك أولاً</span></div><p>صورك وبياناتك بتضل على جهازك. ما في رفع تلقائي.</p><small>نسخة محلية · بدون اشتراك</small></div>
    </aside>

    <main id="main-content" className="main-area">
      <header className="topbar"><div className="page-heading"><span className="eyebrow">{tab==='wardrobe'?'مساحة ملابسك':tab==='outfits'?'أفكار من قطعك':'تفضيلاتك'}</span><h1>{tab==='wardrobe'?'خزانة ملابسك':tab==='outfits'?'نسّق إطلالتك':'ملفك الشخصي'}</h1></div>
        {tab==='wardrobe'&&<div className="top-actions"><button className="quiet-btn" onClick={exportData} disabled={busy} aria-label="تصدير نسخة احتياطية" title="تصدير نسخة احتياطية"><Download size={18}/></button><label className="quiet-btn file-action" title="استيراد نسخة احتياطية" aria-label="استيراد نسخة احتياطية"><Upload size={18}/><input type="file" accept="application/json,.json" disabled={busy} onChange={importData} aria-label="اختيار ملف النسخة الاحتياطية"/></label><button className="primary-btn" onClick={openNew} disabled={busy}><Plus size={18}/><span>أضف قطعة</span></button></div>}
      </header>
      {notice&&<div className="notice" role="status" aria-live="polite">{notice}</div>}

      {tab==='wardrobe'&&<>
        <section className="welcome-panel"><div className="welcome-copy"><span className="welcome-kicker">كل قطعة إلها مكان</span><h2>البس اللي بتحبه.<br/>واعرف شو عندك.</h2><p>اجمع ملابسك بمكان واحد، وخلّي تنسيق يومك أسهل.</p><div className="welcome-count"><strong>{items.length.toLocaleString('ar')}</strong><span>قطعة محفوظة بخزانتك</span></div></div>
          <div className="wardrobe-illustration" aria-hidden="true"><div className="hanger-line"/><div className="hanger-shape">⌁</div><div className="fabric fabric-one"/><div className="fabric fabric-two"/><div className="fabric fabric-three"/><span>YOUR DAILY EDIT</span></div>
        </section>
        <div className="section-toolbar"><div><h2>قطعك</h2><p>{visible.length===items.length?'كل القطع الموجودة بخزانتك':'عرض '+visible.length+' من '+items.length+' قطعة'}</p></div><label className="search-box"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="ابحث عن قطعة أو لون" aria-label="ابحث عن قطعة أو لون"/></label></div>
        <div className="filters" aria-label="تصفية حسب التصنيف"><button className={filter==='all'?'selected':''} aria-pressed={filter==='all'} onClick={()=>setFilter('all')}>الكل <span>{items.length}</span></button>{clothingCategories.map(c=><button key={c} className={filter===c?'selected':''} aria-pressed={filter===c} onClick={()=>setFilter(c)}>{categoryLabels[c]}</button>)}</div>
        {loading?<Empty icon={<PackageOpen/>} title="بنجهّز خزانتك" description="لحظات وبنظهرلك القطع المحفوظة."/>:loadError?<Empty icon={<PackageOpen/>} title="ما قدرنا نفتح خزانتك" description="ما بنقدر نأكد إذا عندك قطع محفوظة. افحص مساحة المتصفح وحاول مرة ثانية." action={<button className="primary-btn" onClick={()=>window.location.reload()}>حاول مرة ثانية</button>}/>:
          visible.length===0?<Empty icon={<Shirt/>} title={items.length?'ما لقينا قطع مطابقة':'خزانتك لسه فاضية'} description={items.length?'غيّر كلمة البحث أو اختار تصنيف ثاني.':'أضف أول قطعة وبلّش رتّب خزانتك.'} action={!items.length?<button className="primary-btn" onClick={openNew}><Plus size={18}/> أضف أول قطعة</button>:undefined}/>:
          <div className="clothes-grid">{visible.map(item=><article className="clothing-card" key={item.id}><div className="card-image"><Photo blob={item.image} name={item.name}/><span className="category-chip">{categoryLabels[item.category]}</span><div className="card-actions"><button onClick={()=>openEdit(item)} aria-label={'تعديل '+item.name} title="تعديل"><Pencil size={16}/></button><button onClick={()=>remove(item.id)} aria-label={'حذف '+item.name} title="حذف"><Trash2 size={16}/></button></div></div><div className="card-info"><h3>{item.name}</h3><div className="item-meta"><span className="color-meta"><i style={{background:item.color||'#a9a9a9'}}/>{item.color||'لون غير محدد'}</span><span>{seasonLabel(item.season)}</span></div>{item.notes&&<p className="item-notes">{item.notes}</p>}</div></article>)}<button className="add-card" onClick={openNew}><span><Plus size={22}/></span><b>أضف قطعة جديدة</b><small>صورة وتفاصيل بسيطة</small></button></div>}
      </>}

      {tab==='outfits'&&<section className="content-view"><div className="view-intro"><span className="intro-icon"><Sparkles/></span><div><h2>تنسيقات من خزانتك</h2><p>اقتراحات بسيطة مبنية على القطع اللي أضفتها، بدون API أو إرسال بياناتك.</p></div></div>
        {suggestions.length?<div className="outfit-grid">{suggestions.map((outfit,index)=><article className="outfit-card" key={outfit.map(i=>i.id).join('-')}><div className="outfit-card-head"><span>اختيار {String(index+1).padStart(2,'0')}</span><b>تنسيق يومي</b></div><div className="outfit-pieces">{outfit.map(item=><div className="outfit-piece" key={item.id}><Photo blob={item.image} name={item.name}/><span>{item.name}</span></div>)}</div></article>)}</div>:
        <Empty icon={<Sparkles/>} title="بدنا كم قطعة عشان ننسّق" description="أضف قميص وبنطلون، ومنبلّش نركّب إطلالات من الموجود عندك." action={<button className="primary-btn" onClick={()=>{setTab('wardrobe');openNew()}}><Plus size={18}/> أضف قطعة</button>}/>}
      </section>}

      {tab==='profile'&&<section className="content-view profile-view"><div className="view-intro"><span className="intro-icon"><UserRound/></span><div><h2>تفاصيل بتساعدك تختار</h2><p>اختياري بالكامل. ما بنطلب صورة جسمك ولا بنرفع معلوماتك على الإنترنت.</p></div></div>
        <div className="profile-form"><label><span><Ruler size={17}/> الطول بالسنتيمتر</span><input type="number" min="80" max="250" inputMode="numeric" value={profile.height??''} onChange={e=>setProfile({...profile,height:e.target.value?Number(e.target.value):undefined})} placeholder="مثلاً 175"/></label><label><span><Sparkles size={17}/> احكيلنا عن ستايلك</span><textarea maxLength={1000} value={profile.styleNotes} onChange={e=>setProfile({...profile,styleNotes:e.target.value})} placeholder="الألوان اللي بتحبها، القصّات المفضلة، أو أي ملاحظة..."/></label><button className="primary-btn" onClick={saveProfile} disabled={busy}>احفظ التغييرات</button><p className="privacy-footnote"><ShieldCheck size={15}/> المعلومات محفوظة محلياً على نفس الجهاز والمتصفح.</p></div>
      </section>}
    </main>

    {modal&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)closeModal()}}><form className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onSubmit={submit}>
      <div className="modal-head"><div><span className="eyebrow">تفاصيل القطعة</span><h2 id="modal-title">{editing?'عدّل القطعة':'قطعة جديدة للخزانة'}</h2></div><button type="button" className="quiet-btn close-btn" onClick={closeModal} aria-label="إغلاق"><X/></button></div>
      <label className="photo-upload">{preview?<img src={preview} alt="معاينة صورة القطعة"/>:<><Plus size={25}/><b>أضف صورة للقطعة</b><small>صورة من جهازك · حتى 8MB</small></>}<input type="file" accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif" onChange={choosePhoto} aria-label="اختيار صورة القطعة"/></label>
      <label className="field-label">اسم القطعة<input ref={nameInputRef} required maxLength={80} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="مثلاً: قميص أبيض"/></label>
      <div className="form-row"><label className="field-label">التصنيف<select value={form.category} onChange={e=>setForm({...form,category:e.target.value as ClothingCategory})}>{clothingCategories.map(c=><option value={c} key={c}>{categoryLabels[c]}</option>)}</select></label><label className="field-label">اللون<input maxLength={40} value={form.color} onChange={e=>setForm({...form,color:e.target.value})} placeholder="أبيض، أسود..."/></label></div>
      <label className="field-label">الموسم<select value={form.season} onChange={e=>setForm({...form,season:e.target.value as ClothingSeason})}><option value="all">كل المواسم</option><option value="summer">صيفي</option><option value="winter">شتوي</option></select></label>
      <label className="field-label">ملاحظات<textarea maxLength={500} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="تفاصيل إضافية (اختياري)"/></label>
      <div className="modal-actions"><button type="button" className="secondary-btn" onClick={closeModal}>إلغاء</button><button className="primary-btn" type="submit" disabled={busy}>{busy?'جاري الحفظ...':editing?'احفظ التعديل':'أضف للخزانة'}</button></div>
    </form></div>}
    <nav className="mobile-nav" aria-label="التنقل"><NavButton active={tab==='wardrobe'} onClick={()=>setTab('wardrobe')} icon={<Shirt/>} label="الملابس"/><NavButton active={tab==='outfits'} onClick={()=>setTab('outfits')} icon={<Sparkles/>} label="التنسيقات"/><NavButton active={tab==='profile'} onClick={()=>setTab('profile')} icon={<UserRound/>} label="ملفي"/></nav>
  </div>
}

function NavButton({active,onClick,icon,label}:{active:boolean;onClick:()=>void;icon:ReactNode;label:string}) {
  return <button className={'nav-button '+(active?'active':'')} onClick={onClick} aria-current={active?'page':undefined}>{icon}<span>{label}</span></button>
}
function Empty({icon,title,description,action}:{icon:ReactNode;title:string;description:string;action?:ReactNode}) {
  return <div className="empty-state"><span className="empty-icon">{icon}</span><h3>{title}</h3><p>{description}</p>{action}</div>
}
function seasonLabel(s:ClothingSeason){return s==='all'?'كل المواسم':s==='summer'?'صيفي':'شتوي'}
