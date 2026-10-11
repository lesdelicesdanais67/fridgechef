import { normalizeIngredient } from '@/lib/fridge-rules';
import { ingredientAvailable, type Recipe } from '@/lib/recipe-rules';
import { matchesSearch } from '@/lib/favorites-rules';

export type Taste = 'tout'|'salé'|'sucré';
export type Refine = 'rapide'|'facile'|'végétarien'|'sans porc'|'sans gluten'|'sans lactose';
export type RecipeSort = 'completes'|'rapides'|'alpha';
export type ScoredRecipe = {recipe:Recipe;have:number;total:number;missing:string[]};

export function scoreRecipe(recipe:Recipe, fridge:string[]):ScoredRecipe {
  const names=recipe.i.map(v=>v.split('|')[0]??'');
  const missing=names.filter(n=>!ingredientAvailable(n,fridge));
  return {recipe,have:names.length-missing.length,total:names.length,missing};
}
export function matchesRefine(recipe:Recipe, r:Refine) {
  if(r==='rapide')return recipe.m<30;
  if(r==='facile')return normalizeIngredient(recipe.diff)==='facile';
  return recipe.d.includes(r);
}
/** All active refine chips must match (AND). */
export function filterRecipes(list:ScoredRecipe[], opts:{query:string;taste:Taste;refines:Refine[]}) {
  return list.filter(({recipe})=>(opts.taste==='tout'||recipe.t===opts.taste)&&opts.refines.every(r=>matchesRefine(recipe,r))&&matchesSearch(recipe,opts.query));
}
export function sortRecipes(list:ScoredRecipe[], sort:RecipeSort) {
  const out=[...list];
  if(sort==='alpha')return out.sort((a,b)=>a.recipe.n.localeCompare(b.recipe.n,'fr'));
  if(sort==='rapides')return out.sort((a,b)=>a.recipe.m-b.recipe.m);
  return out.sort((a,b)=>b.have/b.total-a.have/a.total||a.missing.length-b.missing.length);
}
export const readyNow=(list:ScoredRecipe[])=>list.filter(s=>s.missing.length===0);
export const almostReady=(list:ScoredRecipe[])=>list.filter(s=>s.missing.length>=1&&s.missing.length<=2);
