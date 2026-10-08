import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowRight, Check, ChefHat, Clock3, CupSoda, Heart, House, Leaf, Refrigerator, ShoppingBasket, Shuffle, Sparkles, Utensils, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LegacyScreen } from '@/components/legacy-screen';
import { quickRecipes, seasonForMonth, type HomeRecipe } from '@/lib/home-rules';
import original from '@/lib/frigochef-original.html?raw';
import fridge from '@/assets/fridge-sticker.png';
import pumpkin from '@/assets/pumpkin.png';
import apple from '@/assets/apple.png';
import chestnut from '@/assets/chestnut.png';
import beetSalad from '@/assets/beet-salad.png';
import appleSalad from '@/assets/apple-salad.png';
import smoothie from '@/assets/smoothie.png';

export const Route = createFileRoute('/')({
  head: () => ({ meta: [
    {title: 'Accueil — FrigoChef'},
    {name:'description',content:'Qu’est-ce qu’on mange aujourd’hui ? Retrouvez les produits de saison et des idées de recettes avec FrigoChef.'},
    {property:'og:title',content:'Accueil — FrigoChef'},
    {property:'og:description',content:'Un frigo, des idées et de la gourmandise. Découvrez votre inspiration du jour.'},
    {property:'og:type',content:'website'},
    {name:'twitter:card',content:'summary_large_image'},
  ] }), component: Index,
});
const match = original.match(/const RECIPES = (.*);/);
const recipes: HomeRecipe[] = match ? JSON.parse(match[1]) : [];
const seasonalProducts = {
  automne: [{name:'Potiron',image:pumpkin,tone:'apricot'}, {name:'Pomme',image:apple,tone:'pink'}, {name:'Châtaigne',image:chestnut,tone:'mint'}, {name:'Poire',emoji:'🍐',tone:'yellow'}],
  hiver: [{name:'Clémentine',emoji:'🍊',tone:'apricot'},{name:'Poireau',emoji:'🥬',tone:'mint'},{name:'Pomme',image:apple,tone:'pink'},{name:'Carotte',emoji:'🥕',tone:'yellow'}],
  printemps: [{name:'Radis',emoji:'🌱',tone:'pink'},{name:'Asperge',emoji:'🌱',tone:'mint'},{name:'Fraise',emoji:'🍓',tone:'apricot'},{name:'Petit pois',emoji:'🫛',tone:'yellow'}],
  été: [{name:'Tomate',emoji:'🍅',tone:'pink'},{name:'Courgette',emoji:'🥒',tone:'mint'},{name:'Pêche',emoji:'🍑',tone:'apricot'},{name:'Pastèque',emoji:'🍉',tone:'yellow'}],
};
const navItems = [{id:'accueil',name:'Accueil',icon:House},{id:'frigo',name:'Mon frigo',icon:Refrigerator},{id:'recettes',name:'Recettes',icon:ChefHat},{id:'favoris',name:'Favoris',icon:Heart},{id:'courses',name:'Courses',icon:ShoppingBasket}];
function Index() {
  const [preference,setPreference] = useState('all');
  const [screen,setScreen] = useState('accueil');
  const [recipeId,setRecipeId] = useState<number>();
  const [coursesOpen,setCoursesOpen] = useState(false);
  const [season,setSeason] = useState<keyof typeof seasonalProducts>('automne');
  useEffect(() => {
    const update = () => setSeason(seasonForMonth(new Date().getMonth()+1));
    update(); const interval = window.setInterval(update,60_000);
    const saved = localStorage.getItem('fc_home_taste');
    if(saved && ['all','salé','sucré'].includes(saved)) setPreference(saved);
    return () => window.clearInterval(interval);
  },[]);
  function pickTaste(value:string) {setPreference(value);localStorage.setItem('fc_home_taste',value)}
  const list = quickRecipes(recipes,preference,season);
  if(screen !== 'accueil') return <LegacyScreen screen={screen} recipeId={recipeId} preference={preference} onHome={() => setScreen('accueil')} />;
  return <div className="home-shell">
    <main className="home-page">
      <header className="home-cover">
        <div className="cover-squiggle" aria-hidden="true" />
        <div className="brand-line"><span className="brand-flower" aria-hidden="true">✳</span><h1>Frigo<span>Chef</span><span className="brand-dot">.</span></h1></div>
        <div className="cover-message"><div><p className="hello">BONJOUR, LES GOURMANDS !</p><h2>Qu’est-ce qu’on<br/>mange aujourd’hui ?</h2><span className="cover-underline" aria-hidden="true" /></div><img className="fridge-sticker" src={fridge} alt="Un petit frigo souriant" width={512} height={512}/></div>
        <span className="tiny-spark spark-one" aria-hidden="true">✦</span><span className="tiny-spark spark-two" aria-hidden="true">✧</span>
      </header>
      <div className="home-content">
        <Button variant="cook" onClick={() => setScreen('frigo')}><span className="cook-symbol"><Utensils/></span><span>Qu’est-ce que<br/>je cuisine ?</span><span className="cook-arrow"><ArrowUpRight/></span></Button>
        <div className="taste-row" role="group" aria-label="Votre envie du jour">
          {[{value:'salé',name:'Salé',icon:Utensils,tone:'savory'},{value:'sucré',name:'Sucré',icon:CupSoda,tone:'sweet'},{value:'all',name:'Peu importe',icon:Shuffle,tone:'anything'}].map(({value,name,icon:Icon,tone})=><Button key={value} variant="sticker" className={tone} aria-pressed={preference===value} onClick={()=>pickTaste(value)}><Icon/><span>{name}</span>{preference===value && <span className="taste-check"><Check/></span>}</Button>)}
        </div>
        <section className="season-section" aria-labelledby="season-title">
          <div className="home-section-heading"><h2 id="season-title">De saison<span className="heading-spark" aria-hidden="true">✳</span></h2><span className="season-label"><Leaf/>{season.charAt(0).toUpperCase()+season.slice(1)}</span></div>
          <p className="section-caption">Les petites pépites du moment</p>
          <div className="season-scroll" tabIndex={0} aria-label="Produits de saison">
            {seasonalProducts[season].map(product=><article key={product.name} className={`season-card ${product.tone}`}><div className="produce-art">{'image' in product ? <img src={product.image} alt="" width={512} height={512} loading="lazy"/> : <span aria-hidden="true">{product.emoji}</span>}</div><h3>{product.name}</h3></article>)}
          </div>
        </section>
        <section className="quick-section" aria-labelledby="quick-title">
          <div className="home-section-heading"><h2 id="quick-title">Recettes rapides</h2><span className="quick-label"><Clock3/>− de 30 min</span></div>
          <p className="section-caption">Peu de préparation, beaucoup de bonheur</p>
          <div className="quick-list">{list.map((r,index)=><Button variant="recipe" key={r.id} onClick={()=>{setRecipeId(r.id);setScreen('recipeDetail')}}><span className={`recipe-art recipe-art-${index}`}><img src={r.t==='sucré'?smoothie:index===1?appleSalad:beetSalad} alt="" width={512} height={512} loading="lazy"/></span><span className="quick-recipe-text"><span className="recipe-title">{r.n}</span><span className="recipe-time"><Clock3/>{r.m} min <span className="prep-label">de préparation</span></span></span><span className="recipe-arrow"><ArrowRight/></span></Button>)}</div>
          <div className="home-signoff"><Sparkles/><span>Un peu d’imagination, zéro gaspillage.</span></div>
        </section>
      </div>
    </main>
    <nav className="home-navbar" aria-label="Navigation principale">{navItems.map(({id,name,icon:Icon})=><Button variant="navigation" key={id} aria-current={id==='accueil'?'page':undefined} onClick={()=>id==='courses'?setCoursesOpen(true):setScreen(id)}><span className="nav-icon"><Icon/></span><span>{name}</span>{id==='accueil'&&<span className="nav-active-dot"/>}</Button>)}</nav>
    {coursesOpen&&<div className="home-modal-backdrop" onClick={()=>setCoursesOpen(false)}><div className="home-modal" role="dialog" aria-modal="true" aria-labelledby="courses-title" onClick={e=>e.stopPropagation()}><Button variant="ghost" size="icon" className="modal-close" aria-label="Fermer" onClick={()=>setCoursesOpen(false)}><X/></Button><ShoppingBasket/><h2 id="courses-title">Courses</h2><p>Cet écran n’est pas présent dans la version fournie.</p><Button onClick={()=>setCoursesOpen(false)}>Retour à l’accueil</Button></div></div>}
  </div>;
}