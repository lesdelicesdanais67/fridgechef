import original from '@/lib/frigochef-original.html?raw';

export function legacyDocumentFor({screen, recipeId, preference, fromFridge=false}: {screen:string; recipeId?:number; preference:string; fromFridge?:boolean}) {
  return original.replace('renderScreen();\nif("serviceWorker"', `
state.screen=${JSON.stringify(screen)};
state.recipesType=${JSON.stringify(preference === 'all' ? 'salé' : preference)};
state.detailId=${recipeId ?? 'null'};
state.cameFrom=${JSON.stringify(fromFridge?'frigo':'accueil')};
${fromFridge ? `state.onlyAvailable=true;
${preference==='all' ? `const originalBaseFilteredRecettes=baseFilteredRecettes;
baseFilteredRecettes=function(){if(state.recipesType!=='all')return originalBaseFilteredRecettes();return RECIPES.filter(r=>(state.recipesSub==='Toutes'||r.sub===state.recipesSub)&&(state.recipesCat==='Tous'||r.cat===CAT_KEY[state.recipesCat])&&(state.recipesSeason==='Toutes'||r.s===state.recipesSeason))};
state.recipesType='all';` : ''}` : ''}
const originalGoTab=goTab;
goTab=function(id){if(id==='accueil'||id==='frigo'){parent.postMessage('frigochef-'+id,'*');return;}originalGoTab(id)};
const originalGoBack=goBack;
goBack=function(){if(state.cameFrom==='accueil'||state.cameFrom==='frigo'){parent.postMessage('frigochef-'+state.cameFrom,'*');return;}originalGoBack()};
renderScreen();
if("serviceWorker"`);
}