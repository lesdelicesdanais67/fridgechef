import { describe, expect, it } from 'vitest';
import { addToFridge, categoryFor, expiryStatus, fridgeCategories, readStoredIngredients, saveFridge, searchIngredients, suggestedIngredients } from '@/lib/fridge-rules';
import { legacyDocumentFor } from '@/lib/legacy-document';

describe('Mon frigo',()=>{
  it('autocompletes during typing without proposing ingredients already added',()=>{
    expect(searchIngredients('car',[])).toContain('carotte');
    expect(searchIngredients('car',['carotte'])).not.toContain('carotte');
  });
  it('adds ingredients once regardless of accents and preserves custom ingredients',()=>{
    expect(addToFridge(['pâtes'],' PATES ')).toEqual(['pâtes']);
    expect(addToFridge([],' Mon reste ')).toEqual(['Mon reste']);
  });
  it('organizes ingredients in the seven requested categories',()=>{
    expect(fridgeCategories).toHaveLength(7);
    expect(['carotte','pomme','saumon','pâtes','lait','huile','pain rassis','jambon'].map(n=>categoryFor(n).id)).toEqual(['vegetables','fruit','protein','starch','dairy','pantry','leftovers','leftovers']);
    expect(categoryFor('riz').id).toBe('starch');
  });
  it('keeps ingredients in the original storage contract after closing',()=>{
    const values=new Map<string,string>();
    const storage={getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>{values.set(key,value);}};
    saveFridge(storage,['carotte','pâtes'],{carotte:'2026-10-10'});
    expect(readStoredIngredients(storage)).toEqual(['carotte','pâtes']);
    expect(JSON.parse(values.get('fc_ing_dates')??'{}')).toEqual({carotte:'2026-10-10'});
    saveFridge(storage,['pâtes'],{});
    expect(readStoredIngredients(storage)).toEqual(['pâtes']);
  });
  it('marks approaching dates orange then red and leaves distant dates neutral',()=>{
    const today=new Date(2026,9,8,13,30);
    expect(expiryStatus('2026-10-11',today)?.tone).toBe('soon');
    expect(expiryStatus('2026-10-09',today)?.tone).toBe('urgent');
    expect(expiryStatus('2026-10-08',today)?.label).toBe('Aujourd’hui');
    expect(expiryStatus('2026-10-07',today)?.label).toBe('Date dépassée');
    expect(expiryStatus('2026-10-15',today)?.tone).toBe('normal');
    expect(expiryStatus(undefined,today)).toBeNull();
  });
  it('does not suggest ingredients already in the fridge',()=>{
    expect(suggestedIngredients(['pomme','banane'],'sucré')).toEqual(['lait','chocolat','oeuf']);
  });
});

describe('Legacy recipe validation',()=>{
  function run(preference:string){
    const doc=legacyDocumentFor({screen:'recettes',preference,fromFridge:true});
    const script=doc.split('<script>').at(-1)?.split('</script>')[0];
    if(!script)throw new Error('Missing legacy script');
    const localStorage={getItem:(key:string)=>key==='fc_ing'?JSON.stringify(['pomme','oeuf','lait','farine','pâtes','tomate']):null};
    const evaluate=new Function('localStorage','document','navigator','window','parent',script+';return {state,list:filteredRecettes(),score:matchCountFor};');
    return evaluate(localStorage,{getElementById:()=>({innerHTML:''})},{},{addEventListener:()=>{}},{postMessage:()=>{}}) as {state:{onlyAvailable:boolean;recipesType:string};list:{t:string}[];score:(r:unknown)=>number};
  }
  it.each(['salé','sucré'])('validation respects %s selected on home',(taste)=>{
    const result=run(taste);
    expect(result.state.onlyAvailable).toBe(true);
    expect(result.list.length).toBeGreaterThan(0);
    expect(result.list.every(r=>r.t===taste)).toBe(true);
    expect(result.list.every(r=>result.score(r)>0)).toBe(true);
  });
  it('Peu importe includes both savory and sweet original recipe matches',()=>{
    const result=run('all');
    expect(new Set(result.list.map(r=>r.t))).toEqual(new Set(['salé','sucré']));
    expect(result.list.every(r=>result.score(r)>0)).toBe(true);
  });
});