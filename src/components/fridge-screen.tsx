import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, Check, Leaf, Plus, Search, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { addToFridge, categoryFor, expiryStatus, fridgeCategories, ingredientNames, normalizeIngredient, readStoredIngredients, saveFridge, searchIngredients, suggestedIngredients, type FridgeCategory } from '@/lib/fridge-rules';
import openFridge from '@/assets/open-fridge-sticker.png';

export function FridgeScreen({preference, onValidate, navigation}: {preference:string; onValidate:()=>void; navigation:ReactNode}) {
  const [ingredients,setIngredients] = useState<string[]>([]);
  const [dates,setDates] = useState<Record<string,string>>({});
  const [query,setQuery] = useState('');
  const [focused,setFocused] = useState(false);
  const [activeSuggestion,setActiveSuggestion] = useState(-1);
  const [categoryOpen,setCategoryOpen] = useState(false);
  const [category,setCategory] = useState<FridgeCategory>();
  const [dateIngredient,setDateIngredient] = useState<string>();
  const [dateDraft,setDateDraft] = useState('');
  const [today,setToday] = useState(new Date());
  const [storageError,setStorageError] = useState(false);
  useEffect(()=>{
    setIngredients(readStoredIngredients(localStorage));
    try {const saved:unknown=JSON.parse(localStorage.getItem('fc_ing_dates') ?? '{}'); if(saved && typeof saved==='object' && !Array.isArray(saved)) setDates(Object.fromEntries(Object.entries(saved).filter(([,v])=>typeof v==='string')));} catch { /* Keep existing ingredients even if date storage is invalid. */ }
    const timer=window.setInterval(()=>setToday(new Date()),60_000);
    return ()=>window.clearInterval(timer);
  },[]);
  function persist(next: string[], nextDates = dates) {
    setIngredients(next); setDates(nextDates);
    try {saveFridge(localStorage,next,nextDates);setStorageError(false);} catch {setStorageError(true);}
  }
  function add(name: string) {
    const next = addToFridge(ingredients,name);
    persist(next); setQuery('');setActiveSuggestion(-1);
    if(next.length>ingredients.length) {
      try {const recent=JSON.parse(localStorage.getItem('fc_recent') ?? '[]');localStorage.setItem('fc_recent',JSON.stringify([next[next.length-1],...(Array.isArray(recent)?recent:[]).filter((n:unknown)=>typeof n==='string' && normalizeIngredient(n)!==normalizeIngredient(name))].slice(0,8)));} catch { /* Ingredients have already been saved. */ }
    }
  }
  function remove(name: string) {const nextDates={...dates};delete nextDates[name];persist(ingredients.filter(n=>n!==name),nextDates);}
  function editDate(name: string) {setDateIngredient(name);setDateDraft(dates[name] ?? '');}
  function confirmDate(value: string) {if(!dateIngredient)return;const next={...dates};if(value)next[dateIngredient]=value;else delete next[dateIngredient];persist(ingredients,next);setDateIngredient(undefined);}
  const suggestions = searchIngredients(query,ingredients);
  const nearExpiry = ingredients.filter(n=>{const status=expiryStatus(dates[n],today);return status && status.days<=3;}).length;
  return <div className="home-shell fridge-shell">
    <main className="home-page fridge-page">
      <header className="fridge-cover">
        <div className="fridge-title"><span className="fridge-eyebrow">LE BONHEUR EST DANS LE FRIGO</span><h1>Mon frigo<span aria-hidden="true">.</span></h1><p>Des petits trésors à cuisiner.</p></div>
        <img src={openFridge} alt="Un petit frigo ouvert rempli d’ingrédients" width={512} height={512}/><span className="fridge-flower" aria-hidden="true">✳</span>
      </header>
      <div className="fridge-content">
        <form className="fridge-entry" onSubmit={e=>{e.preventDefault();add(activeSuggestion>=0 ? suggestions[activeSuggestion] ?? query : query);}}>
          <div className="fridge-search"><Search/><input aria-label="Tape un ingrédient…" role="combobox" aria-autocomplete="list" aria-expanded={focused&&suggestions.length>0} aria-controls="fridge-autocomplete" aria-activedescendant={activeSuggestion>=0?`ingredient-option-${activeSuggestion}`:undefined} placeholder="Tape un ingrédient…" value={query} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} onChange={e=>{setQuery(e.target.value);setActiveSuggestion(-1);}} onKeyDown={e=>{if(e.key==='ArrowDown'){e.preventDefault();setActiveSuggestion(i=>Math.min(i+1,suggestions.length-1));}if(e.key==='ArrowUp'){e.preventDefault();setActiveSuggestion(i=>Math.max(i-1,0));}if(e.key==='Escape'){setFocused(false);setActiveSuggestion(-1);}}}/></div>
          <Button type="submit" className="fridge-add" disabled={!query.trim()}><Plus/>Ajouter</Button>
          {focused&&suggestions.length>0&&<ul id="fridge-autocomplete" role="listbox" aria-label="Ingrédients proposés" className="fridge-autocomplete">{suggestions.map((name,i)=><li key={name} id={`ingredient-option-${i}`} role="option" aria-selected={i===activeSuggestion}><Button variant="ghost" onMouseDown={e=>e.preventDefault()} onClick={()=>add(name)}><span aria-hidden="true">{categoryFor(name).emoji}</span><span>{name}</span><Plus/></Button></li>)}</ul>}
        </form>
        {storageError&&<p role="alert" className="fridge-error">La sauvegarde est indisponible sur cet appareil. Gardez l’application ouverte.</p>}
        <section className="fridge-inventory" aria-labelledby="fridge-inventory-title">
          <div className="fridge-section-heading"><h2 id="fridge-inventory-title">Mes ingrédients</h2><span className="fridge-count" aria-live="polite">{ingredients.length}</span></div>
          {nearExpiry>0&&<div className="fridge-expiry-note"><Leaf/><span>{nearExpiry} ingrédient{nearExpiry>1?'s':''} à surveiller</span><span>Anti-gaspi</span></div>}
          {ingredients.length===0&&<div className="fridge-empty"><span aria-hidden="true">🥕 🍅 🧀</span><p>Ton frigo n’attend que tes ingrédients !</p></div>}
          {fridgeCategories.map(cat=>{
            const members=ingredients.filter(n=>categoryFor(n).id===cat.id);
            if(!members.length)return null;
            return <div key={cat.id} className="fridge-category-group"><h3><span aria-hidden="true">{cat.emoji}</span>{cat.name}</h3><div className="fridge-chips">{members.map(name=>{const status=expiryStatus(dates[name],today);return <div key={name} className={`ingredient-sticker ${cat.tone}`}><div className="ingredient-sticker-main"><span>{name}</span><Button variant="ghost" size="icon" aria-label={`Retirer ${name}`} onClick={()=>remove(name)}><X/></Button></div><Button variant="ghost" className={`ingredient-date ${status?.tone ?? ''}`} aria-label={`Date limite de ${name}`} onClick={()=>editDate(name)}><CalendarDays/>{status?status.label:'Date limite'}{status&&status.tone!=='normal'&&<span className="expiry-dot"/>}</Button></div>})}</div></div>;
          })}
          <Button variant="outline" className="fridge-category-add" onClick={()=>{setCategory(undefined);setCategoryOpen(true);}}><Plus/>Ajouter par catégorie<span aria-hidden="true">✳</span></Button>
        </section>
        <section className="fridge-suggestions" aria-labelledby="fridge-suggestions-title"><h2 id="fridge-suggestions-title"><Sparkles/>Tu pourrais aussi ajouter…</h2><div className="fridge-suggestion-row">{suggestedIngredients(ingredients,preference).map(name=><Button variant="outline" key={name} onClick={()=>add(name)}><span aria-hidden="true">{categoryFor(name).emoji}</span>{name}<Plus/></Button>)}</div></section>
        <p className="fridge-signoff"><Leaf/>Chaque ingrédient a une seconde chance.</p>
      </div>
    </main>
    <div className="fridge-validation"><Button className="fridge-validate" disabled={!ingredients.length} onClick={onValidate}><Check/><span>Valider</span><ArrowRight/></Button></div>
    {navigation}
    <Dialog open={categoryOpen} onOpenChange={setCategoryOpen}><DialogContent className="fridge-dialog" aria-describedby="fridge-category-description"><DialogTitle>{category?category.name:'Ajouter par catégorie'}</DialogTitle><DialogDescription id="fridge-category-description" className="sr-only">Choisir les ingrédients du frigo.</DialogDescription>{category?<><Button variant="ghost" className="fridge-category-back" onClick={()=>setCategory(undefined)}><ArrowLeft/>Catégories</Button><div className="fridge-category-list">{ingredientNames.filter(n=>categoryFor(n).id===category.id).map(name=><label key={name} className="fridge-checkbox-row"><span aria-hidden="true">{category.emoji}</span><span>{name}</span><Checkbox aria-label={name} checked={ingredients.includes(name)} onCheckedChange={checked=>checked?add(name):remove(name)}/></label>)}</div></>:<div className="fridge-category-grid">{fridgeCategories.map(cat=><Button key={cat.id} variant="ghost" className={`fridge-category-tile ${cat.tone}`} onClick={()=>setCategory(cat)}><span aria-hidden="true">{cat.emoji}</span><span>{cat.name}</span></Button>)}</div>}<Button className="fridge-dialog-done" onClick={()=>setCategoryOpen(false)}><Check/>Terminé</Button></DialogContent></Dialog>
    <Dialog open={Boolean(dateIngredient)} onOpenChange={open=>{if(!open)setDateIngredient(undefined);}}><DialogContent className="fridge-dialog fridge-date-dialog"><DialogTitle>Date limite</DialogTitle><DialogDescription>{dateIngredient}</DialogDescription><label className="fridge-date-field">À consommer jusqu’au<input type="date" aria-label="Date limite" value={dateDraft} onChange={e=>setDateDraft(e.target.value)}/></label><Button className="fridge-dialog-done" onClick={()=>confirmDate(dateDraft)}><Check/>Enregistrer</Button>{dateIngredient&&dates[dateIngredient]&&<Button variant="ghost" onClick={()=>confirmDate('')}>Retirer la date</Button>}</DialogContent></Dialog>
  </div>;
}