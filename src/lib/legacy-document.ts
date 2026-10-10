import original from '@/lib/frigochef-original.html?raw';

export function legacyDocumentFor({screen, recipeId, preference, fromFridge=false}: {screen:string; recipeId?:number | undefined; preference:string; fromFridge?:boolean}) {
  return original.replace('renderScreen();\nif("serviceWorker"', `
state.screen=${JSON.stringify(screen)};
state.recipesType=${JSON.stringify(preference === 'all' ? 'salé' : preference)};
state.detailId=${recipeId ?? 'null'};
state.cameFrom=${JSON.stringify(fromFridge?'frigo':'accueil')};
${fromFridge ? `state.onlyAvailable=true;
${preference==='all' ? `const originalBaseFilteredRecettes=baseFilteredRecettes;
baseFilteredRecettes=function(){if(state.recipesType!=='all')return originalBaseFilteredRecettes();return RECIPES.filter(r=>(state.recipesSub==='Toutes'||r.sub===state.recipesSub)&&(state.recipesCat==='Tous'||r.cat===CAT_KEY[state.recipesCat])&&(state.recipesSeason==='Toutes'||r.s===state.recipesSeason))};
const originalScreenRecettes=screenRecettes;
screenRecettes=function(){const html=originalScreenRecettes();return state.recipesType==='all'?html.replace('Recettes sucrées','Recettes possibles'):html};
state.recipesType='all';` : ''}` : ''}
const originalGoTab=goTab;
goTab=function(id){if(id==='accueil'||id==='frigo'){parent.postMessage('frigochef-'+id,'*');return;}originalGoTab(id)};
const originalGoBack=goBack;
goBack=function(){if(state.cameFrom==='accueil'||state.cameFrom==='frigo'){parent.postMessage('frigochef-'+state.cameFrom,'*');return;}originalGoBack()};
openDetail=function(id){parent.postMessage({type:'frigochef-recipe',id},'*')};
window.addEventListener('message',function(event){if(event.source!==parent)return;if(event.data==='frigochef-refresh-favorites'){state.favorites=JSON.parse(localStorage.getItem('fc_fav')||'[]');renderScreen()}});
renderScreen();
if("serviceWorker"`);
}