import { describe, expect, it } from 'vitest';
import { addShoppingItem, dishIcons, dishMapping, ingredientAvailable, recipeBadges, recipeCatalogue, scaledIngredient, stepDuration, timerRemaining, toggleFavorite } from '@/lib/recipe-rules';
describe('Fiche recette',()=>{
  it('recalculates ingredient quantities from the original base servings',()=>{
    expect(scaledIngredient('poireau|200|g',4,2)).toEqual({name:'poireau',quantity:'400',unit:'g'});
    expect(scaledIngredient('oeuf|2|',1,2)).toEqual({name:'oeuf',quantity:'1',unit:''});
    expect(scaledIngredient('pâte brisée|1|',1,2).quantity).toBe('0,5');
  });
  it('marks fridge ingredients and original pantry ingredients available',()=>{
    expect(ingredientAvailable('poireau',['poireau'])).toBe(true);
    expect(ingredientAvailable('huile',[])).toBe(true);
    expect(ingredientAvailable('pomme de terre',['pomme'])).toBe(false);
  });
  it('keeps only dietary badges actually declared by the original recipe',()=>{
    const recipe=recipeCatalogue.find(r=>r.id===13);if(!recipe)throw new Error('Recipe missing');
    expect(recipeBadges(recipe)).toEqual(['végétarien','sans porc','sans gluten']);
    expect(recipeBadges(recipe)).not.toContain('sans lactose');
  });
  it('preserves favorites using the existing recipe IDs',()=>{
    expect(toggleFavorite([2],13)).toEqual([2,13]);expect(toggleFavorite([2,13],13)).toEqual([2]);
  });
  it('adds missing ingredients to courses once with the selected quantities',()=>{
    const item={name:'poireau',quantity:'400',unit:'g'};
    expect(addShoppingItem([],item)).toEqual([item]);expect(addShoppingItem([item],item)).toHaveLength(1);
  });
  it('starts countdowns only for durations explicitly written in a step',()=>{
    expect(stepDuration('Laissez cuire 20 min.')?.seconds).toBe(1200);
    expect(stepDuration('Enfournez 25 à 30 min.')?.seconds).toBe(1800);
    expect(stepDuration('Reposez 2 heures.')?.seconds).toBe(7200);
    expect(stepDuration('Mixez 30 secondes.')?.seconds).toBe(30);
    expect(stepDuration('Préchauffez à 180°C.')).toBeNull();
    expect(stepDuration('Lavez les légumes.')).toBeNull();
  });
  it('counts down to zero accurately even after an inactive interval',()=>{
    expect(timerRemaining(10000,5000)).toBe(5);expect(timerRemaining(10000,11000)).toBe(0);
  });
  it('provides an original dish illustration for every recipe type',()=>{
    expect(recipeCatalogue.every(r=>Boolean(dishIcons[dishMapping[r.e]??'plate']))).toBe(true);
  });
});