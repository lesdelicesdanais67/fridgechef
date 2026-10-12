import { useEffect, useState } from 'react';
import { ArrowLeft, BellRing, Check, ChefHat, Clock3, Heart, House, Leaf, Minus, Plus, Refrigerator, ShoppingBasket, Sparkles, Users, Utensils, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { RecipeArt } from '@/components/recipe-art';
import { RecipeStep } from '@/components/recipe-step';
import { FridgeFoodIcon } from '@/components/fridge-food-icon';
import { categoryFor, readStoredIngredients } from '@/lib/fridge-rules';
import { addShoppingItem, ingredientAvailable, readArray, recipeBadges, scaledIngredient, toggleFavorite, validShoppingItem, type Recipe, type ShoppingItem } from '@/lib/recipe-rules';

const navItems=[{id:'accueil',name:'Accueil',icon:House},{id:'frigo',name:'Mon frigo',icon:Refrigerator},{id:'recettes',name:'Recettes',icon:ChefHat},{id:'favoris',name:'Favoris',icon:Heart},{id:'courses',name:'Courses',icon:ShoppingBasket}];
export function RecipeScreen({recipe,onBack,onNavigate}:{recipe:Recipe;onBack:()=>void;onNavigate:(screen:string)=>void}) {
  const [portions,setPortions]=useState(recipe.p);
  const [favorites,setFavorites]=useState<number[]>([]);
  const [ingredients,setIngredients]=useState<string[]>([]);
  const [shopping,setShopping]=useState<ShoppingItem[]>([]);
  const [coursesOpen,setCoursesOpen]=useState(false);
  const [celebrate,setCelebrate]=useState(false);
  const [timerAlert,setTimerAlert]=useState<number|null>(null);
  const [error,setError]=useState('');
  useEffect(()=>{
    const sync=()=>{setIngredients(readStoredIngredients(localStorage));setFavorites(readArray(localStorage,'fc_fav',(v):v is number=>typeof v==='number'));setShopping(readArray(localStorage,'fc_courses',validShoppingItem));};
    sync();window.addEventListener('storage',sync);return ()=>window.removeEventListener('storage',sync);
  },[]);
  function persist(key:string,value:unknown) {try{localStorage.setItem(key,JSON.stringify(value));setError('');return true;}catch{setError('La sauvegarde est indisponible sur cet appareil.');return false;}}
  function favorite(){const next=toggleFavorite(favorites,recipe.id);if(persist('fc_fav',next))setFavorites(next);}
  function addCourses(item:ShoppingItem){const next=addShoppingItem(shopping,item);if(persist('fc_courses',next))setShopping(next);}
  const isFavorite=favorites.includes(recipe.id);
  return <div className="home-shell recipe-shell"><main className="home-page recipe-page">
    <header className="recipe-cover"><RecipeArt recipe={recipe}/><Button variant="ghost" size="icon" className="recipe-back" aria-label="Retour" onClick={onBack}><ArrowLeft/></Button><Button variant="ghost" className={`recipe-favorite ${isFavorite?'is-favorite':''}`} aria-label={isFavorite?'Retirer des favoris':'Ajouter aux favoris'} aria-pressed={isFavorite} onClick={favorite}><Heart/><span>Favori</span></Button></header>
    <div className="recipe-content"><h1>{recipe.n}</h1><div className="recipe-meta-stickers"><span className="recipe-meta-sticker yellow"><Clock3/>{recipe.m} min de préparation</span><span className="recipe-meta-sticker pink"><span className="recipe-difficulty-dot"/>{recipe.diff}</span><span className="recipe-meta-sticker apricot"><Utensils/>{recipe.t==='sucré'?'Sucré':'Salé'}</span></div><div className="recipe-diet-badges">{recipeBadges(recipe).map(badge=><span key={badge}><Leaf/>{badge.charAt(0).toUpperCase()+badge.slice(1)}</span>)}</div>
    {error&&<p className="fridge-error" role="alert">{error}</p>}
    <div className="recipe-portions"><span><Users/>À table pour</span><div className="recipe-stepper"><Button variant="ghost" size="icon" aria-label="Moins de personnes" disabled={portions<=1} onClick={()=>setPortions(n=>n-1)}><Minus/></Button><output aria-label="Nombre de personnes" aria-live="polite">{portions}</output><Button variant="ghost" size="icon" aria-label="Plus de personnes" onClick={()=>setPortions(n=>n+1)}><Plus/></Button></div><span>personne{portions>1?'s':''}</span></div>
    <section className="recipe-ingredients" aria-labelledby={`recipe-ingredients-${recipe.id}`}><div className="recipe-section-heading"><h2 id={`recipe-ingredients-${recipe.id}`}>Ingrédients</h2><span aria-hidden="true">✳</span></div><ul>{recipe.i.map(value=>{const item=scaledIngredient(value,portions,recipe.p);const available=ingredientAvailable(item.name,ingredients);const added=shopping.some(n=>n.name===item.name);return <li key={item.name} className={available?'ingredient-available':'ingredient-missing'}><span className="recipe-ingredient-status" aria-label={available?'Disponible':'Manquant'}>{available?<Check/>:<FridgeFoodIcon category={categoryFor(item.name).id} name={item.name}/>}</span><div className="recipe-ingredient-label"><span>{item.name}</span><span className="recipe-quantity">{item.quantity} {item.unit}</span></div>{available?<span className="recipe-in-fridge">Dans ton frigo</span>:<Button variant="ghost" className="recipe-add-courses" aria-label={`Ajouter ${item.name} aux courses`} disabled={added} onClick={()=>addCourses({...item,recipe:recipe.n})}>{added?<Check/>:<Plus/>}{added?'Ajouté':'Courses'}</Button>}</li>;})}</ul></section>
    <section className="recipe-steps" aria-labelledby={`recipe-steps-${recipe.id}`}><div className="recipe-section-heading"><h2 id={`recipe-steps-${recipe.id}`}>Étapes</h2><span className="recipe-step-count">{recipe.st.length} petites étapes</span></div><div className="recipe-steps-list">{recipe.st.map((text,index)=><RecipeStep key={`${recipe.id}-${index}`} text={text} index={index} onAlert={setTimerAlert}/>)}</div></section><p className="recipe-signoff"><Sparkles/>Le meilleur ingrédient, c’est toi.</p>
    </div></main>
    <div className="fridge-validation"><Button className="fridge-validate recipe-cooked" onClick={()=>setCelebrate(true)}><ChefHat/><span>J’ai cuisiné !</span><Sparkles/></Button></div>
    <nav className="home-navbar" aria-label="Navigation principale">{navItems.map(({id,name,icon:Icon})=><Button variant="navigation" key={id} aria-current={id==='recettes'?'page':undefined} onClick={()=>onNavigate(id)}><span className="nav-icon"><Icon/></span><span>{name}</span>{id==='recettes'&&<span className="nav-active-dot"/>}</Button>)}</nav>
    <Dialog open={celebrate} onOpenChange={setCelebrate}><DialogContent className="fridge-dialog recipe-congratulations"><div className="recipe-confetti" aria-hidden="true">{Array.from({length:18},(_,i)=><i key={i} className={`confetti-${i%6}`}/>)}</div><ChefHat/><DialogTitle>Bravo, chef !</DialogTitle><DialogDescription>Un bon petit plat, et des ingrédients qui ne se perdent pas. Bon appétit !</DialogDescription><Button className="fridge-dialog-done" onClick={()=>setCelebrate(false)}><Check/>À table !</Button></DialogContent></Dialog>
    <Dialog open={timerAlert!==null} onOpenChange={open=>{if(!open)setTimerAlert(null);}}><DialogContent className="fridge-dialog recipe-timer-alert"><BellRing/><DialogTitle>Le minuteur est terminé !</DialogTitle><DialogDescription>Étape {(timerAlert??0)+1} · {recipe.n}</DialogDescription><Button className="fridge-dialog-done" onClick={()=>setTimerAlert(null)}>C’est noté !</Button></DialogContent></Dialog>
    <Dialog open={coursesOpen} onOpenChange={setCoursesOpen}><DialogContent className="fridge-dialog"><DialogTitle>Mes courses</DialogTitle><DialogDescription>{shopping.length} ingrédient{shopping.length>1?'s':''} à acheter</DialogDescription><ul className="recipe-shopping-list">{shopping.map(item=><li key={item.name}><div><span>{item.name}</span><small>{item.quantity} {item.unit}</small></div><Button variant="ghost" size="icon" aria-label={`Retirer ${item.name} des courses`} onClick={()=>{const next=shopping.filter(n=>n.name!==item.name);if(persist('fc_courses',next))setShopping(next);}}><X/></Button></li>)}</ul>{!shopping.length&&<p>Tout est prêt pour la prochaine recette.</p>}<Button className="fridge-dialog-done" onClick={()=>setCoursesOpen(false)}>Retour à la recette</Button></DialogContent></Dialog>
  </div>;
}