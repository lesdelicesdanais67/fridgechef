import { dishIcons, dishMapping, type Recipe } from '@/lib/recipe-rules';
import { FridgeFoodIcon } from '@/components/fridge-food-icon';
import { categoryFor } from '@/lib/fridge-rules';
import beetSalad from '@/assets/beet-salad.png';
import appleSalad from '@/assets/apple-salad.png';
import smoothie from '@/assets/smoothie.png';
import leekSoup from '@/assets/leek-soup-sticker.png';

export function RecipeArt({recipe}:{recipe:Recipe}) {
  const image=recipe.id===13?beetSalad:recipe.id===15?appleSalad:recipe.id===49?smoothie:recipe.n==='Soupe de poireaux'?leekSoup:undefined;
  return <div className={`recipe-cover-art ${recipe.t==='sucré'?'recipe-sweet-art':''}`}>
    <span className="recipe-art-flower" aria-hidden="true">✳</span><span className="recipe-art-spark" aria-hidden="true">✦</span>
    {image?<img src={image} alt={`Illustration de ${recipe.n}`} width={768} height={768}/>:<><div className="recipe-original-dish" role="img" aria-label={`Illustration de ${recipe.n}`} dangerouslySetInnerHTML={{__html:dishIcons[dishMapping[recipe.e]??'plate']??dishIcons.plate??''}}/><div className="recipe-art-ingredients">{recipe.i.slice(0,3).map(value=>{const name=value.split('|')[0]??'';return <span key={name}><FridgeFoodIcon category={categoryFor(name).id} name={name}/><span>{name}</span></span>;})}</div></>}
  </div>;
}