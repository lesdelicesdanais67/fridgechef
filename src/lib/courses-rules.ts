import { addToFridge, categoryFor, normalizeIngredient } from '@/lib/fridge-rules';
import type { ShoppingItem } from '@/lib/recipe-rules';

export type CourseItem = ShoppingItem & {recipe?:string;checked?:boolean;count?:number};
export const aisles = [
  {id:'produce',name:'Fruits et légumes',tone:'mint'},
  {id:'protein',name:'Viandes et poissons',tone:'apricot'},
  {id:'dairy',name:'Produits laitiers',tone:'pink'},
  {id:'grocery',name:'Féculents et épicerie',tone:'yellow'},
  {id:'other',name:'Autres',tone:'mint'},
] as const;
export function aisleFor(name:string) {
  const c=categoryFor(name).id;
  if(c==='vegetables'||c==='fruit')return 'produce';
  if(c==='protein'||c==='dairy')return c;
  if(c==='starch'||c==='pantry')return 'grocery';
  return 'other';
}
export function addCourse(list:CourseItem[], item:CourseItem) {
  const existing=list.find(n=>normalizeIngredient(n.name)===normalizeIngredient(item.name));
  if(existing)return list.map(n=>n===existing?{...n,checked:false,count:(n.count??1)+1}:n);
  return [...list,{...item,count:item.count??1,checked:false}];
}
export const setCount=(list:CourseItem[],name:string,count:number)=>list.map(n=>n.name===name?{...n,count:Math.max(1,count)}:n);
export const toggleChecked=(list:CourseItem[],name:string)=>list.map(n=>n.name===name?{...n,checked:!n.checked}:n);
export const removeCourse=(list:CourseItem[],name:string)=>list.filter(n=>n.name!==name);
/** Moves checked items into the fridge list and removes them from the shopping list. */
export function transferChecked(list:CourseItem[], fridge:string[]) {
  const checked=list.filter(n=>n.checked);
  return {fridge:checked.reduce((f,n)=>addToFridge(f,n.name),fridge),list:list.filter(n=>!n.checked),moved:checked.length};
}
