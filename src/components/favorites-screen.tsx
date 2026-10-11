import { useEffect, useRef, useState } from 'react';
import { ArrowDownUp, Check, Clock3, Heart, Search, Sparkles, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RecipeArt } from '@/components/recipe-art';
import { readStoredIngredients } from '@/lib/fridge-rules';
import { readArray, recipeCatalogue, toggleFavorite } from '@/lib/recipe-rules';
import { favoriteList, ingredientScore, type FavoriteFilter, type FavoriteSort } from '@/lib/favorites-rules';
import heartBowl from '@/assets/heart-bowl-sticker.png';

const filters:{id:FavoriteFilter;label:string}[]=[{id:'tous',label:'Tous'},{id:'salé',label:'Salé'},{id:'sucré',label:'Sucré'},{id:'rapide',label:'Rapide'},{id:'végétarien',label:'Végétarien'},{id:'sans porc',label:'Sans porc'},{id:'sans gluten',label:'Sans gluten'},{id:'sans lactose',label:'Sans lactose'}];
const sorts:{id:FavoriteSort;label:string}[]=[{id:'recents',label:'Récents'},{id:'alpha',label:'Ordre alphabétique'},{id:'rapides',label:'Les plus rapides'},{id:'possibles',label:'Ceux que je peux cuisiner maintenant'}];
const tones=['mint','pink','apricot','yellow'];

export function FavoritesScreen({onOpen,onHome,navigation}:{onOpen:(id:number)=>void;onHome:()=>void;navigation:React.ReactNode}) {
  const [ids,setIds]=useState<number[]>([]);
  const [fridge,setFridge]=useState<string[]>([]);
  const [query,setQuery]=useState('');
  const [filter,setFilter]=useState<FavoriteFilter>('tous');
  const [sort,setSort]=useState<FavoriteSort>('recents');
  const [sortOpen,setSortOpen]=useState(false);
  const [leaving,setLeaving]=useState<number>();
  const [undo,setUndo]=useState<{ids:number[]}>();
  const undoTimer=useRef<number|undefined>(undefined);
  useEffect(()=>{setIds(readArray(localStorage,'fc_fav',(v):v is number=>typeof v==='number'));setFridge(readStoredIngredients(localStorage));return ()=>window.clearTimeout(undoTimer.current);},[]);
  function save(next:number[]){setIds(next);try{localStorage.setItem('fc_fav',JSON.stringify(next));}catch{/* stockage indisponible */}}
  function remove(id:number){
    setLeaving(id);
    window.setTimeout(()=>{const before=ids;save(toggleFavorite(before,id));setLeaving(undefined);setUndo({ids:before});window.clearTimeout(undoTimer.current);undoTimer.current=window.setTimeout(()=>setUndo(undefined),5000);},320);
  }
  function cancel(){if(undo)save(undo.ids);setUndo(undefined);}
  const known=ids.filter(id=>recipeCatalogue.some(r=>r.id===id)).length;
  const list=favoriteList(ids,recipeCatalogue,fridge,{query,filter,sort});
  return <div className="home-shell"><main className="home-page fav-page">
    <header className="fav-cover"><div><h1>Mes favoris</h1><p>{known} recette{known>1?'s':''} gardée{known>1?'s':''} au chaud</p></div><span className="fav-heart-sticker" aria-hidden="true"><Heart/></span></header>
    {known===0?<section className="fav-empty"><img src={heartBowl} alt="Un cœur qui serre un petit bol" width={816} height={816}/><h2>Pas encore de favoris !</h2><p>Appuie sur le cœur d’une recette pour la retrouver ici</p><Button className="fridge-validate" onClick={onHome}><Sparkles/>Découvrir des recettes</Button></section>:<div className="fav-content">
      <label className="fav-search"><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Chercher dans mes favoris" aria-label="Chercher dans mes favoris"/></label>
      <div className="fav-filters" role="group" aria-label="Filtres">{filters.map(f=><button key={f.id} type="button" aria-pressed={filter===f.id} onClick={()=>setFilter(f.id)}>{f.label}</button>)}</div>
      <div className="fav-list-head"><span>{list.length} résultat{list.length>1?'s':''}</span><div className="fav-sort"><Button variant="ghost" aria-expanded={sortOpen} onClick={()=>setSortOpen(o=>!o)}><ArrowDownUp/>{sorts.find(s=>s.id===sort)?.label}</Button>{sortOpen&&<ul role="menu">{sorts.map(s=><li key={s.id}><button role="menuitemradio" aria-checked={sort===s.id} onClick={()=>{setSort(s.id);setSortOpen(false);}}>{sort===s.id&&<Check/>}{s.label}</button></li>)}</ul>}</div></div>
      {list.length===0&&<p className="fav-none">Aucun favori ne correspond.</p>}
      <ul className="fav-list">{list.map((r,index)=>{const score=ingredientScore(r,fridge);return <li key={r.id} className={`fav-card ${tones[index%4]} ${leaving===r.id?'is-leaving':''}`} style={{animationDelay:`${Math.min(index,8)*70}ms`}}>
        <button type="button" className="fav-open" onClick={()=>onOpen(r.id)} aria-label={`Ouvrir ${r.n}`}><span className="fav-art"><RecipeArt recipe={r}/></span><span className="fav-text"><span className="fav-title">{r.n}</span><span className="fav-stickers"><span><Clock3/>{r.m} min</span><span>{r.diff}</span><span><Utensils/>{r.t==='sucré'?'Sucré':'Salé'}</span></span><span className={`fav-score ${score.complete?'ok':'missing'}`}>Tu as {score.have}/{score.total} ingrédients</span></span></button>
        <button type="button" className="fav-remove" aria-label={`Retirer ${r.n} des favoris`} onClick={()=>remove(r.id)}><Heart/></button>
      </li>;})}</ul>
    </div>}
  </main>
  {undo&&<div className="fav-toast" role="status"><span>Retiré des favoris</span><button type="button" onClick={cancel}>Annuler</button></div>}
  {navigation}</div>;
}
