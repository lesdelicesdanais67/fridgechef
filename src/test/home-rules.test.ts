import { describe, expect, it } from 'vitest';
import { seasonalRecipes, seasonForMonth } from '@/lib/home-rules';
describe('Accueil FrigoChef', () => {
  it('detects the four seasons automatically', () => {
    expect(Array.from({length:12},(_,i)=>seasonForMonth(i+1))).toEqual(['hiver','hiver','printemps','printemps','printemps','été','été','été','automne','automne','automne','hiver']);
  });
  it('shows three recipes strictly from the current season without a duration limit', () => {
    const recipes = [
      {id:0,m:10,c:30,n:'recipe',t:'salé',s:'été'},
      ...[45,30,10,5].map((m,id)=>({id:id+1,m,c:30,n:'recipe',t:'salé',s:'automne'})),
    ];
    expect(seasonalRecipes(recipes,'all','automne').map(r=>r.id)).toEqual([1,2,3]);
    expect(seasonalRecipes(recipes,'all','hiver')).toEqual([]);
  });
  it('keeps sweet and savory selections distinct', () => {
    const recipes = ['salé','sucré'].map((t,id)=>({id,t,m:10,c:30,n:'recipe',s:'automne'}));
    expect(seasonalRecipes(recipes,'sucré','automne').map(r=>r.id)).toEqual([1]);
    expect(seasonalRecipes(recipes,'salé','automne').map(r=>r.id)).toEqual([0]);
    expect(seasonalRecipes(recipes,'all','automne')).toHaveLength(2);
  });
});