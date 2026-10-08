import { useEffect, useMemo } from 'react';
import original from '@/lib/frigochef-original.html?raw';

export function LegacyScreen({ screen, recipeId, preference, onHome }: { screen: string; recipeId?: number | undefined; preference: string; onHome: () => void }) {
  useEffect(() => {
    const listener = (event: MessageEvent) => {
      const frame = document.getElementById('original-frigochef') as HTMLIFrameElement | null;
      if (event.source === frame?.contentWindow && event.data === 'frigochef-home') onHome();
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, [onHome]);
  const legacyDocument = useMemo(() => original.replace('renderScreen();\nif("serviceWorker"', `
state.screen=${JSON.stringify(screen)};
state.recipesType=${JSON.stringify(preference === 'all' ? 'salé' : preference)};
state.detailId=${recipeId ?? 'null'};
state.cameFrom='accueil';
const originalGoTab=goTab;
goTab=function(id){if(id==='accueil'){parent.postMessage('frigochef-home','*');return;}originalGoTab(id)};
const originalGoBack=goBack;
goBack=function(){if(state.cameFrom==='accueil'){parent.postMessage('frigochef-home','*');return;}originalGoBack()};
renderScreen();
if("serviceWorker"`), [screen, recipeId, preference]);
  return <iframe id="original-frigochef" title="FrigoChef" className="legacy-screen" srcDoc={legacyDocument} />;
}