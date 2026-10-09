import original from '@/lib/frigochef-original.html?raw';

function readSource<T>(name: string, fallback: T): T {
  const match = original.match(new RegExp(`const ${name} = (.*);`));
  return match?.[1] ? JSON.parse(match[1]) as T : fallback;
}
const originalCategories = readSource<Record<string, string>>('ING_CATEGORIES', {});
export const ingredientNames = [...readSource<string[]>('INGREDIENT_NAMES', []), 'pain rassis', 'riz cuit', 'pâtes cuites'];
export const fridgeCategories = [
  {id:'vegetables', name:'Légumes', emoji:'🥕', tone:'mint'},
  {id:'fruit', name:'Fruits', emoji:'🍎', tone:'pink'},
  {id:'protein', name:'Viandes et poissons', emoji:'🐟', tone:'apricot'},
  {id:'starch', name:'Féculents', emoji:'🍝', tone:'yellow'},
  {id:'dairy', name:'Produits laitiers', emoji:'🧀', tone:'mint'},
  {id:'pantry', name:'Épicerie et placard de base', emoji:'🫙', tone:'yellow'},
  {id:'leftovers', name:'Restes', emoji:'🍞', tone:'pink'},
] as const;
export type FridgeCategory = typeof fridgeCategories[number];
export function normalizeIngredient(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/œ/g,'oe');
}
export function categoryFor(name: string): FridgeCategory {
  const normalized = normalizeIngredient(name);
  let id = 'pantry';
  if (['pain rassis','riz cuit','pates cuites','jambon'].includes(normalized)) id = 'leftovers';
  else if (['pates','riz','pomme de terre','patate douce','tortilla','pain','flocons d\'avoine'].includes(normalized)) id = 'starch';
  else {
    const sourceName = Object.keys(originalCategories).find(n=>normalizeIngredient(n)===normalized);
    const category = sourceName ? originalCategories[sourceName] : undefined;
    id = ({'Légumes':'vegetables','Fruits':'fruit','Viandes & poissons':'protein','Produits laitiers':'dairy'} as Record<string,string>)[category ?? ''] ?? 'pantry';
  }
  return fridgeCategories.find(c=>c.id===id) ?? fridgeCategories[5];
}
export function searchIngredients(query: string, selected: string[]) {
  const q = normalizeIngredient(query);
  if (!q) return [];
  return ingredientNames.filter(n=>normalizeIngredient(n).includes(q) && !selected.some(s=>normalizeIngredient(s)===normalizeIngredient(n))).slice(0,6);
}
export function addToFridge(selected: string[], value: string) {
  const trimmed = value.trim();
  if (!trimmed || selected.some(n=>normalizeIngredient(n)===normalizeIngredient(trimmed))) return selected;
  const canonical = ingredientNames.find(n=>normalizeIngredient(n)===normalizeIngredient(trimmed));
  return [...selected, canonical ?? trimmed];
}
export function readStoredIngredients(storage: Pick<Storage,'getItem'>): string[] {
  try { const value: unknown = JSON.parse(storage.getItem('fc_ing') ?? '[]'); return Array.isArray(value) ? value.filter((v):v is string=>typeof v==='string') : []; } catch { return []; }
}
export function saveFridge(storage: Pick<Storage,'setItem'>, ingredients: string[], dates: Record<string,string>) {
  storage.setItem('fc_ing', JSON.stringify(ingredients));
  storage.setItem('fc_ing_dates', JSON.stringify(dates));
}
export function expiryStatus(date: string | undefined, today = new Date()) {
  if (!date) return null;
  const end = new Date(`${date}T00:00:00`);
  if (Number.isNaN(end.getTime())) return null;
  const start = new Date(today.getFullYear(),today.getMonth(),today.getDate());
  const days = Math.round((end.getTime()-start.getTime())/86_400_000);
  return {days, tone:days<=1?'urgent':days<=3?'soon':'normal', label:days<0?'Date dépassée':days===0?'Aujourd’hui':days===1?'Demain':`Dans ${days} jours`};
}
export function suggestedIngredients(selected: string[], taste: string) {
  const pool = taste==='sucré' ? ['pomme','banane','lait','chocolat','oeuf','farine'] : taste==='salé' ? ['tomate','oeuf','pâtes','fromage','carotte','oignon'] : ['tomate','oeuf','pomme','lait','pâtes','carotte'];
  return pool.filter(n=>!selected.some(s=>normalizeIngredient(s)===normalizeIngredient(n))).slice(0,3);
}