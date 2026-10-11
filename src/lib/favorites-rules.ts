import { normalizeIngredient } from '@/lib/fridge-rules';
import { ingredientAvailable, type Recipe } from '@/lib/recipe-rules';

export type FavoriteFilter = 'tous'|'salé'|'sucré'|'rapide'|'végétarien'|'sans porc'|'sans gluten'|'sans lactose';
export type FavoriteSort = 'recents'|'alpha'|'rapides'|'possibles';

export function ingredientScore(recipe:Recipe, fridge:string[]) {
  const total=recipe.i.length;
  const have=recipe.i.filter(v=>ingredientAvailable(v.split('|')[0]??'',fridge)).length;
  return {have,total,complete:have===total};
}
export function matchesFilter(recipe:Recipe, filter:FavoriteFilter) {
  if(filter==='tous')return true;
  if(filter==='salé'||filter==='sucré')return recipe.t===filter;
  if(filter==='rapide')return recipe.m<30;
  return recipe.d.includes(filter);
}
export function matchesSearch(recipe:Recipe, query:string) {
  const q=normalizeIngredient(query);
  if(!q)return true;
  return normalizeIngredient(recipe.n).includes(q)||recipe.i.some(v=>normalizeIngredient(v.split('|')[0]??'').includes(q));
}
/** favoriteIds is in insertion order (oldest first), as stored in fc_fav. */
export function favoriteList(favoriteIds:number[], catalogue:Recipe[], fridge:string[], opts:{query:string;filter:FavoriteFilter;sort:FavoriteSort}) {
  const byId=new Map(catalogue.map(r=>[r.id,r]));
  const list=[...favoriteIds].reverse().map(id=>byId.get(id)).filter((r):r is Recipe=>Boolean(r))
    .filter(r=>matchesFilter(r,opts.filter)&&matchesSearch(r,opts.query));
  if(opts.sort==='alpha')return list.sort((a,b)=>a.n.localeCompare(b.n,'fr'));
  if(opts.sort==='rapides')return list.sort((a,b)=>a.m-b.m);
  if(opts.sort==='possibles')return list.sort((a,b)=>{const x=ingredientScore(a,fridge),y=ingredientScore(b,fridge);return Number(y.complete)-Number(x.complete)||(y.have/y.total)-(x.have/x.total);});
  return list;
}
