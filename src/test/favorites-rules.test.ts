import { describe, expect, it } from 'vitest';
import { favoriteList, matchesFilter } from '@/lib/favorites-rules';
import type { Recipe } from '@/lib/recipe-rules';

const r=(id:number,n:string,m:number,t='salé',d:string[]=[],i:string[]=['zzzunobtainium|1|']):Recipe=>({id,n,t,m,c:30,p:2,e:'',s:'',i,d,diff:'Facile',st:[],cat:null});
const cat=[r(1,'Tarte',40),r(2,'Crêpes',20,'sucré',['végétarien']),r(3,'Bowl',10,'salé',[],['xyzrare|1|'])];
const opts={query:'',filter:'tous' as const,sort:'recents' as const};

describe('favoris', () => {
  it('Récents shows the last favorited first', () => {
    expect(favoriteList([1,2,3],cat,[],opts).map(x=>x.id)).toEqual([3,2,1]);
  });
  it('Rapide means strictly less than 30 min', () => {
    expect(matchesFilter(r(9,'a',30),'rapide')).toBe(false);
    expect(matchesFilter(r(9,'a',29),'rapide')).toBe(true);
  });
  it('searches by ingredient name', () => {
    expect(favoriteList([1,2,3],cat,[],{...opts,query:'xyzrare'}).map(x=>x.id)).toEqual([3]);
  });
  it('Ceux que je peux cuisiner puts complete recipes first', () => {
    expect(favoriteList([1,2,3],cat,['xyzrare'],{...opts,sort:'possibles'})[0]?.id).toBe(3);
  });
});
