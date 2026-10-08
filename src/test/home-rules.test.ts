import { describe, expect, it } from 'vitest';
import { quickRecipes, seasonForMonth } from '@/lib/home-rules';
describe('Accueil FrigoChef', () => {
  it('detects the four seasons automatically', () => {
    expect(Array.from({length:12},(_,i)=>seasonForMonth(i+1))).toEqual(['hiver','hiver','printemps','printemps','printemps','été','été','été','automne','automne','automne','hiver']);
  });
  it('shows exactly three recipes with preparation strictly under 30 minutes', () => {
    const recipes = [30,29,10,5,15].map((m,id)=>({id,m,c:30,n:'recipe',t:'salé',s:'automne'}));
    expect(quickRecipes(recipes,'all','automne').map(r=>r.m)).toEqual([29,10,5]);
  });
  it('keeps sweet and savory selections distinct', () => {
    const recipes = ['salé','sucré'].map((t,id)=>({id,t,m:10,c:30,n:'recipe',s:'automne'}));
    expect(quickRecipes(recipes,'sucré','automne').map(r=>r.id)).toEqual([1]);
    expect(quickRecipes(recipes,'salé','automne').map(r=>r.id)).toEqual([0]);
    expect(quickRecipes(recipes,'all','automne')).toHaveLength(2);
  });
});