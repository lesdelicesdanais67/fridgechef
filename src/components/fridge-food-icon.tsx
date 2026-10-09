import { Apple, Carrot, CookingPot, Egg, Fish, Milk, Package, Wheat } from 'lucide-react';

const icons = {vegetables:Carrot,fruit:Apple,protein:Fish,starch:Wheat,dairy:Milk,pantry:Package,leftovers:CookingPot};
export function FridgeFoodIcon({category, name}: {category:string; name?:string}) {
  const Icon = name==='oeuf' ? Egg : icons[category as keyof typeof icons] ?? Package;
  return <span className={`fridge-food-icon food-${category}`} aria-hidden="true"><Icon/></span>;
}