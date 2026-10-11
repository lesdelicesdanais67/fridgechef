import { describe, expect, it } from 'vitest';
import { almostReady, filterRecipes, readyNow, scoreRecipe } from '@/lib/recipes-list-rules';
import type { Recipe } from '@/lib/recipe-rules';

const r=(id:number,i:string[],m=20,diff='Facile',d:string[]=[]):Recipe=>({id,n:`R${id}`,t:'salé',m,c:30,p:2,e:'',s:'',i,d,diff,st:[],cat:null});
const fridge=['qqa','qqb'];
const list=[r(1,['qqa|1|','qqb|1|']),r(2,['qqa|1|','qqx|1|']),r(3,['qqx|1|','qqy|1|','qqz|1|'])].map(x=>scoreRecipe(x,fridge));

describe('recettes', () => {
  it('Tu peux cuisiner maintenant = aucun ingrédient manquant', () => { expect(readyNow(list).map(s=>s.recipe.id)).toEqual([1]); });
  it('Presque prêtes = 1 ou 2 ingrédients manquants', () => {
    expect(almostReady(list).map(s=>s.recipe.id)).toEqual([2]);
    expect(list[1]?.missing).toEqual(['qqx']);
  });
  it('les pastilles se cumulent', () => {
    const l=[r(1,[],20,'Facile',['végétarien']),r(2,[],20,'Moyen',['végétarien']),r(3,[],40,'Facile',['végétarien'])].map(x=>scoreRecipe(x,[]));
    expect(filterRecipes(l,{query:'',taste:'tout',refines:['rapide','facile','végétarien']}).map(s=>s.recipe.id)).toEqual([1]);
  });
});
