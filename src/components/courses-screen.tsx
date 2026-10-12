import { useEffect, useRef, useState } from 'react';
import { Check, Minus, Plus, Refrigerator, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { FridgeFoodIcon } from '@/components/fridge-food-icon';
import { categoryFor, readStoredIngredients, searchIngredients } from '@/lib/fridge-rules';
import { readArray, validShoppingItem } from '@/lib/recipe-rules';
import { addCourse, aisleFor, aisles, removeCourse, setCount, toggleChecked, transferChecked, type CourseItem } from '@/lib/courses-rules';
import basket from '@/assets/basket-sticker.png';

function CourseRow({item,onToggle,onCount,onRemove}:{item:CourseItem;onToggle:()=>void;onCount:(n:number)=>void;onRemove:()=>void}) {
  const [dx,setDx]=useState(0);const start=useRef<number|null>(null);const [gone,setGone]=useState(false);
  function end(){if(Math.abs(dx)>110){setGone(true);window.setTimeout(onRemove,250);}else setDx(0);start.current=null;}
  return <li className={`course-row ${item.checked?'is-checked':''} ${gone?'is-gone':''}`}>
    <span className="course-row-bg" aria-hidden="true"><Trash2/></span>
    <div className="course-row-inner" style={{transform:gone?`translateX(${dx<0?-120:120}%)`:`translateX(${dx}px)`}}
      onPointerDown={e=>{if((e.target as HTMLElement).closest('button'))return;start.current=e.clientX;}}
      onPointerMove={e=>{if(start.current!==null)setDx(e.clientX-start.current);}} onPointerUp={end} onPointerCancel={end} onPointerLeave={()=>start.current!==null&&end()}>
      <button type="button" className="course-check" role="checkbox" aria-checked={Boolean(item.checked)} aria-label={`${item.checked?'Décocher':'Cocher'} ${item.name}`} onClick={onToggle}>{item.checked&&<Check/>}</button>
      <span className="course-icon"><FridgeFoodIcon category={categoryFor(item.name).id} name={item.name}/></span>
      <span className="course-text"><span className="course-name">{item.name}{item.quantity&&<small> · {item.quantity} {item.unit}</small>}</span>{item.recipe&&<span className="course-recipe">Pour : {item.recipe}</span>}</span>
      <span className="course-stepper"><button type="button" aria-label={`Moins de ${item.name}`} disabled={(item.count??1)<=1} onClick={()=>onCount((item.count??1)-1)}><Minus/></button><output aria-label="Quantité">{item.count??1}</output><button type="button" aria-label={`Plus de ${item.name}`} onClick={()=>onCount((item.count??1)+1)}><Plus/></button></span>
      <button type="button" className="course-delete" aria-label={`Supprimer ${item.name}`} onClick={onRemove}><Trash2/></button>
    </div>
  </li>;
}

export function CoursesScreen({onFridge,navigation}:{onFridge:()=>void;navigation:React.ReactNode}) {
  const [list,setList]=useState<CourseItem[]>([]);
  const [text,setText]=useState('');
  const [confirm,setConfirm]=useState(false);
  const [notice,setNotice]=useState('');
  useEffect(()=>{setList(readArray(localStorage,'fc_courses',validShoppingItem));},[]);
  function save(next:CourseItem[]){setList(next);try{localStorage.setItem('fc_courses',JSON.stringify(next));}catch{setNotice('La sauvegarde est indisponible sur cet appareil.');}}
  function add(value:string){const v=value.trim();if(!v)return;save(addCourse(list,{name:v.charAt(0).toUpperCase()+v.slice(1),quantity:'',unit:''}));setText('');}
  function toFridge(){const r=transferChecked(list,readStoredIngredients(localStorage));if(!r.moved)return;try{localStorage.setItem('fc_ing',JSON.stringify(r.fridge));}catch{setNotice('La sauvegarde est indisponible sur cet appareil.');return;}save(r.list);setNotice(`${r.moved} article${r.moved>1?'s':''} rangé${r.moved>1?'s':''} dans ton frigo !`);}
  const suggestions=searchIngredients(text,list.map(n=>n.name));
  const todo=list.filter(n=>!n.checked);const done=list.filter(n=>n.checked);
  const row=(item:CourseItem)=><CourseRow key={item.name} item={item} onToggle={()=>save(toggleChecked(list,item.name))} onCount={n=>save(setCount(list,item.name,n))} onRemove={()=>setList(l=>{const next=removeCourse(l,item.name);try{localStorage.setItem('fc_courses',JSON.stringify(next));}catch{/* ignore */}return next;})}/>;
  return <div className="home-shell"><main className="home-page fav-page courses-page">
    <header className="fav-cover courses-cover"><div><h1>Ma liste de courses</h1><p>{todo.length} article{todo.length>1?'s':''} à trouver</p></div><img className="courses-basket" src={basket} alt="" width={816} height={816}/></header>
    <div className="fav-content">
      <form className="fridge-entry" onSubmit={e=>{e.preventDefault();add(text);}}><label className="fridge-search"><Search/><input value={text} onChange={e=>setText(e.target.value)} placeholder="Ajouter un article…" aria-label="Ajouter un article" autoComplete="off"/></label><Button type="submit" className="fridge-add"><Plus/>Ajouter</Button>
        {suggestions.length>0&&<ul className="courses-suggest" role="listbox">{suggestions.map(s=><li key={s}><button type="button" onClick={()=>add(s)}><FridgeFoodIcon category={categoryFor(s).id} name={s}/>{s}</button></li>)}</ul>}</form>
      {notice&&<p className="courses-notice" role="status">{notice}</p>}
      {list.length===0?<section className="fav-empty"><img src={basket} alt="Un panier souriant" width={816} height={816} loading="lazy"/><h2>Ta liste est vide</h2><p>Ajoute des ingrédients depuis une recette !</p></section>:<>
        {aisles.map(a=>{const items=todo.filter(n=>aisleFor(n.name)===a.id);return items.length>0&&<section key={a.id} className={`courses-aisle ${a.tone}`}><h2>{a.name}</h2><ul>{items.map(row)}</ul></section>;})}
        {todo.length===0&&<p className="fav-none">Tout est dans le panier, bravo !</p>}
        {done.length>0&&<section className="courses-aisle courses-done"><h2><Check/>Déjà dans le panier</h2><ul>{done.map(row)}</ul></section>}
        <p className="courses-hint">Astuce : glisse un article sur le côté pour le supprimer.</p>
        <div className="courses-actions"><Button className="fridge-validate" disabled={done.length===0} onClick={toFridge}><Refrigerator/>Ajouter tout au frigo</Button>{notice.includes('frigo')&&<Button variant="ghost" className="recipes-more" onClick={onFridge}>Voir Mon frigo</Button>}<Button variant="ghost" className="courses-clear" onClick={()=>setConfirm(true)}><Trash2/>Tout vider</Button></div>
      </>}
    </div>
  </main>
  <Dialog open={confirm} onOpenChange={setConfirm}><DialogContent className="fridge-dialog"><DialogTitle>Tout vider ?</DialogTitle><DialogDescription>Tous les articles de ta liste seront supprimés.</DialogDescription><div className="courses-confirm"><Button variant="ghost" onClick={()=>setConfirm(false)}>Annuler</Button><Button className="courses-confirm-yes" onClick={()=>{save([]);setConfirm(false);setNotice('');}}>Oui, tout vider</Button></div></DialogContent></Dialog>
  {navigation}</div>;
}
