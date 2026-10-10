import { useEffect, useMemo } from 'react';
import { legacyDocumentFor } from '@/lib/legacy-document';

export function LegacyScreen({ screen, recipeId, preference, onHome, onFridge, onRecipe, fromFridge=false }: { screen: string; recipeId?: number | undefined; preference: string; onHome: () => void; onFridge?:()=>void; onRecipe?:(id:number)=>void; fromFridge?:boolean }) {
  useEffect(() => {
    const listener = (event: MessageEvent) => {
      const frame = document.getElementById('original-frigochef') as HTMLIFrameElement | null;
      if (event.source !== frame?.contentWindow) return;
      if (event.data === 'frigochef-home' || event.data === 'frigochef-accueil') onHome();
      if (event.data === 'frigochef-frigo') onFridge?.();
      if (event.data?.type === 'frigochef-recipe' && typeof event.data.id === 'number') onRecipe?.(event.data.id);
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, [onHome,onFridge,onRecipe]);
  const legacyDocument = useMemo(() => legacyDocumentFor({screen,recipeId,preference,fromFridge}), [screen, recipeId, preference,fromFridge]);
  return <iframe id="original-frigochef" title="FrigoChef" className="legacy-screen" srcDoc={legacyDocument} />;
}