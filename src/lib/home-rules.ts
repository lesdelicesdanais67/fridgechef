export const seasons = ['hiver', 'printemps', 'été', 'automne'] as const;
export function seasonForMonth(month: number) {
  if (month === 12 || month <= 2) return 'hiver';
  if (month <= 5) return 'printemps';
  if (month <= 8) return 'été';
  return 'automne';
}
export type HomeRecipe = { id: number; n: string; m: number; c: number; t: string; s: string };
export function quickRecipes(recipes: HomeRecipe[], preference: string, season: string) {
  return recipes.filter(r => r.m < 30 && (preference === 'all' || r.t === preference))
    .sort((a, b) => Number(b.s === season) - Number(a.s === season)).slice(0, 3);
}