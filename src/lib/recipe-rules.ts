import original from '@/lib/frigochef-original.html?raw';
import { normalizeIngredient } from '@/lib/fridge-rules';

export type Recipe = {id:number;n:string;t:string;m:number;c:number;p:number;e:string;s:string;i:string[];d:string[];diff:string;st:string[];cat:string|null};
const match=original.match(/const RECIPES = (.*);/);
export const recipeCatalogue: Recipe[] = match?.[1] ? JSON.parse(match[1]) : [];
const pantryMatch=original.match(/const PANTRY = (.*);/);
const pantry:string[]=pantryMatch?.[1]?JSON.parse(pantryMatch[1]):[];
export function ingredientAvailable(name:string, ingredients:string[]) {
  return [...pantry,...ingredients].some(n=>normalizeIngredient(n)===normalizeIngredient(name));
}
export function scaledIngredient(value:string, portions:number, base:number) {
  const [name='',quantity='',unit='']=value.split('|');
  const numeric=Number(quantity.replace(',','.'));
  const amount=quantity && Number.isFinite(numeric) ? new Intl.NumberFormat('fr-FR',{maximumFractionDigits:2}).format(numeric*portions/base) : quantity;
  return {name,quantity:amount,unit};
}
export function recipeBadges(recipe:Recipe) {
  return ['végétarien','sans porc','sans gluten','sans lactose'].filter(b=>recipe.d.includes(b));
}
export function stepDuration(text:string) {
  const match=text.match(/(\d+(?:[.,]\d+)?)\s*(?:(?:à|a|–|-)\s*(\d+(?:[.,]\d+)?)\s*)?(secondes?|sec|minutes?|min|heures?|h)\b/i);
  if(!match)return null;
  const value=Number((match[2]??match[1]??'0').replace(',','.'));
  const unit=match[3]?.toLowerCase()??'';
  return {seconds:Math.round(value*(unit.startsWith('h')?3600:unit.startsWith('s')?1:60)),label:match[0]};
}
export function timerRemaining(deadline:number,now:number) {return Math.max(0,Math.ceil((deadline-now)/1000));}
export function formatTimer(seconds:number) {return `${Math.floor(seconds/60).toString().padStart(2,'0')}:${(seconds%60).toString().padStart(2,'0')}`;}
export type ShoppingItem={name:string;quantity:string;unit:string};
export function addShoppingItem(list:ShoppingItem[],item:ShoppingItem) {
  return list.some(n=>normalizeIngredient(n.name)===normalizeIngredient(item.name))?list:[...list,item];
}
export function toggleFavorite(ids:number[],id:number) {return ids.includes(id)?ids.filter(n=>n!==id):[...ids,id];}
export function readArray<T>(storage:Pick<Storage,'getItem'>,key:string,valid:(v:unknown)=>v is T):T[] {
  try {const data:unknown=JSON.parse(storage.getItem(key)??'[]');return Array.isArray(data)?data.filter(valid):[];}catch{return [];}
}
export const validShoppingItem=(v:unknown):v is ShoppingItem=>Boolean(v&&typeof v==='object'&&'name' in v&&typeof v.name==='string'&&'quantity' in v&&typeof v.quantity==='string'&&'unit' in v&&typeof v.unit==='string');
const iconBlock=original.slice(original.indexOf('const SVGICONS ='),original.indexOf('const ICON_FALLBACK'));
export const dishIcons=Object.fromEntries([...iconBlock.matchAll(/\s(\w+):svg\(`([^`]+)`(?:,\s*(\d+))?\)/g)].map(m=>[m[1],`<svg viewBox="0 0 ${m[3]??48} ${m[3]??48}" xmlns="http://www.w3.org/2000/svg">${m[2]}</svg>`]));
const emojiMatch=original.match(/const EMOJI_TO_ICON = (\{[\s\S]*?\});/);
export const dishMapping:Record<string,string>=emojiMatch?.[1]?JSON.parse(emojiMatch[1]):{};