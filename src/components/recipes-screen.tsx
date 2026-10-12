import { useEffect, useMemo, useState } from 'react';
import { ArrowDownUp, Check, ChefHat, Clock3, Heart, Leaf, Plus, Search, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RecipeArt } from '@/components/recipe-art';
import { readStoredIngredients } from '@/lib/fridge-rules';
import { addShoppingItem, readArray, recipeBadges, recipeCatalogue, toggleFavorite, validShoppingItem, type ShoppingItem } from '@/lib/recipe-rules';
import { almostReady, filterRecipes, readyNow, scoreRecipe, sortRecipes, type Refine, type RecipeSort, type ScoredRecipe, type Taste } from '@/lib/recipes-list-rules';
import emptyPot from '@/assets/empty-pot-sticker.png';

const refines:{id:Refine;label:string}[]=[{id:'rapide',label:'Rapide'},{id:'facile',label:'Facile'},{id:'végétarien',label:'Végétarien'},{id:'sans porc',label:'Sans porc'},{id:'sans gluten',label:'Sans gluten'},{id:'sans lactose',label:'Sans lactose'}];
const sorts:{id:RecipeSort;label:string}[]=[{id:'completes',label:'Les plus complètes d’abord'},{id:'rapides',label:'Les plus rapides'},{id:'alpha',label:'Ordre alphabétique'}];
const tones=['mint','pink','apricot','yellow'];
const PAGE=20;

export function RecipesScreen({preference,onOpen,navigation}:{preference:string;onOpen:(id:number)=>void;navigation:React.ReactNode}) {
  const [fridge,setFridge]=useState<string[]>([]);
  const [favorites,setFavorites]=useState<number[]>([]);
  const [shopping,setShopping]=useState<ShoppingItem[]>([]);
  const [query,setQuery]=useState('');
  const [taste,setTaste]=useState<Taste>(preference==='salé'||preference==='sucré'?preference:'tout');
  const [active,setActive]=useState<Refine[]>([]);
  const [sort,setSort]=useState<RecipeSort>('completes');
  const [sortOpen,setSortOpen]=useState(false);
  const [visible,setVisible]=useState(PAGE);
  const [bounce,setBounce]=useState<number>();
  useEffect(()=>{setFridge(readStoredIngredients(localStorage));setFavorites(readArray(localStorage,'fc_fav',(v):v is number=>typeof v==='number'));setShopping(readArray(localStorage,'fc_courses',validShoppingItem));},[]);
  const scored=useMemo(()=>recipeCatalogue.map(r=>scoreRecipe(r,fridge)),[fridge]);
  const filtered=useMemo(()=>sortRecipes(filterRecipes(scored,{query,taste,refines:active}),sort),[scored,query,taste,active,sort]);
  const ready=readyNow(filtered).slice(0,12);
  const almost=almostReady(filtered).slice(0,12);
  function save(key:string,value:unknown){try{localStorage.setItem(key,JSON.stringify(value));}catch{/* stockage indisponible */}}
  function fav(id:number){const next=toggleFavorite(favorites,id);setFavorites(next);save('fc_fav',next);if(next.includes(id)){setBounce(id);window.setTimeout(()=>setBounce(undefined),400);}}
  function addCourses(name:string,recipe:string){const next=addShoppingItem(shopping,{name,quantity:'',unit:'',recipe});setShopping(next);save('fc_courses',next);}
  function toggle(id:Refine){setActive(a=>a.includes(id)?a.filter(x=>x!==id):[...a,id]);setVisible(PAGE);}
  function clear(){setQuery('');setActive([]);setTaste('tout');setVisible(PAGE);}
  const heart=(id:number,name:string)=>{const on=favorites.includes(id);return <button type="button" className={`fav-remove recipes-heart ${on?'is-on':''} ${bounce===id?'is-bouncing':''}`} aria-pressed={on} aria-label={on?`Retirer ${name} des favoris`:`Ajouter ${name} aux favoris`} onClick={()=>fav(id)}><Heart/></button>;};
  const stickers=({recipe}:ScoredRecipe)=><span className="fav-stickers"><span><Clock3/>{recipe.m} min</span><span>{recipe.diff}</span><span><Utensils/>{recipe.t==='sucré'?'Sucré':'Salé'}</span>{recipeBadges(recipe).map(b=><span key={b}><Leaf/>{b}</span>)}</span>;
  return <div className="home-shell"><main className="home-page fav-page">
    <header className="fav-cover recipes-cover"><div><h1>Recettes</h1><p>Idées selon ton frigo</p></div><span className="fav-heart-sticker recipes-sticker" aria-hidden="true"><ChefHat/></span></header>
    <div className="fav-content">
      <label className="fav-search"><Search/><input value={query} onChange={e=>{setQuery(e.target.value);setVisible(PAGE);}} placeholder="Chercher une recette ou un ingrédient" aria-label="Chercher une recette ou un ingrédient"/></label>
      <div className="recipes-switch" role="group" aria-label="Salé ou sucré" data-active={taste}><span className="recipes-switch-thumb" aria-hidden="true"/>{(['salé','sucré','tout'] as Taste[]).map(t=><button key={t} type="button" aria-pressed={taste===t} onClick={()=>{setTaste(t);setVisible(PAGE);}}>{t==='salé'?'Salé':t==='sucré'?'Sucré':'Tout'}</button>)}</div>
      <div className="fav-filters" role="group" aria-label="Affiner">{refines.map(f=><button key={f.id} type="button" aria-pressed={active.includes(f.id)} onClick={()=>toggle(f.id)}>{f.label}</button>)}</div>
      <div key={taste} className="recipes-fade">
      {filtered.length===0?<section className="fav-empty"><img src={emptyPot} alt="Une casserole vide" width={816} height={816} loading="lazy"/><h2>Aucune recette trouvée</h2><p>Essaie d’enlever un filtre</p><Button className="fridge-validate" onClick={clear}>Effacer les filtres</Button></section>:<>
      {ready.length>0&&<section className="recipes-section"><h2>Tu peux cuisiner maintenant</h2><div className="recipes-carousel">{ready.map((s,i)=><article key={s.recipe.id} className={`recipes-mini ${tones[i%4]}`} style={{animationDelay:`${i*60}ms`}}><button type="button" className="recipes-mini-open" onClick={()=>onOpen(s.recipe.id)}><span className="fav-art"><RecipeArt recipe={s.recipe}/></span><span className="fav-title">{s.recipe.n}</span><span className="recipes-mini-time"><Clock3/>{s.recipe.m} min</span></button><span className="recipes-ready-check" aria-label="Tous les ingrédients sont là"><Check/></span></article>)}</div></section>}
      {almost.length>0&&<section className="recipes-section"><h2>Presque prêtes</h2><div className="recipes-carousel">{almost.map((s,i)=><article key={s.recipe.id} className={`recipes-mini ${tones[(i+1)%4]}`} style={{animationDelay:`${i*60}ms`}}><button type="button" className="recipes-mini-open" onClick={()=>onOpen(s.recipe.id)}><span className="fav-art"><RecipeArt recipe={s.recipe}/></span><span className="fav-title">{s.recipe.n}</span></button><ul className="recipes-missing">{s.missing.map(m=>{const added=shopping.some(x=>x.name===m);return <li key={m}><span>{m}</span><button type="button" disabled={added} aria-label={`Ajouter ${m} aux courses`} onClick={()=>addCourses(m,s.recipe.n)}>{added?<Check/>:<Plus/>}{added?'Ajouté':'Courses'}</button></li>;})}</ul></article>)}</div></section>}
      <section className="recipes-section"><div className="fav-list-head"><h2>Toutes les recettes <small>({filtered.length})</small></h2><div className="fav-sort"><Button variant="ghost" aria-expanded={sortOpen} onClick={()=>setSortOpen(o=>!o)}><ArrowDownUp/>Trier</Button>{sortOpen&&<ul role="menu">{sorts.map(s=><li key={s.id}><button role="menuitemradio" aria-checked={sort===s.id} onClick={()=>{setSort(s.id);setSortOpen(false);}}>{sort===s.id&&<Check/>}{s.label}</button></li>)}</ul>}</div></div>
      <ul className="fav-list">{filtered.slice(0,visible).map((s,index)=><li key={s.recipe.id} className={`fav-card ${tones[index%4]}`} style={{animationDelay:`${Math.min(index%PAGE,8)*60}ms`}}>
        <button type="button" className="fav-open" onClick={()=>onOpen(s.recipe.id)} aria-label={`Ouvrir ${s.recipe.n}`}><span className="fav-art"><RecipeArt recipe={s.recipe}/></span><span className="fav-text"><span className="fav-title">{s.recipe.n}</span>{stickers(s)}<span className={`fav-score ${s.missing.length===0?'ok':'missing'}`}>{s.have}/{s.total} ingrédients</span></span></button>
        {heart(s.recipe.id,s.recipe.n)}
      </li>)}</ul>
      {visible<filtered.length&&<Button variant="ghost" className="recipes-more" onClick={()=>setVisible(v=>v+PAGE)}>Voir plus de recettes</Button>}
      </section></>}
      </div>
    </div>
  </main>{navigation}</div>;
}
