import { useEffect, useRef, useState } from 'react';
import { BellRing, Pause, Play, RotateCcw, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatTimer, stepDuration, timerRemaining } from '@/lib/recipe-rules';

export function RecipeStep({text,index,onAlert}:{text:string;index:number;onAlert:(index:number)=>void}) {
  const duration=stepDuration(text);
  const [remaining,setRemaining]=useState(duration?.seconds??0);
  const [deadline,setDeadline]=useState<number|null>(null);
  const [finished,setFinished]=useState(false);
  const alerted=useRef(false);
  const audio=useRef<AudioContext|null>(null);
  const alertCallback=useRef(onAlert);alertCallback.current=onAlert;
  useEffect(()=>()=>{void audio.current?.close();},[]);
  useEffect(()=>{
    if(deadline===null)return;
    const tick=()=>{
      const left=timerRemaining(deadline,Date.now());setRemaining(left);
      if(left===0&&!alerted.current){
        alerted.current=true;setDeadline(null);setFinished(true);alertCallback.current(index);
        if('vibrate' in navigator)navigator.vibrate([200,100,200]);
        const ctx=audio.current;
        if(ctx){void ctx.resume().then(()=>{for(let i=0;i<3;i++){const oscillator=ctx.createOscillator();const gain=ctx.createGain();oscillator.connect(gain);gain.connect(ctx.destination);oscillator.frequency.value=880;gain.gain.value=.15;const start=ctx.currentTime+i*.35;oscillator.start(start);oscillator.stop(start+.2);}}).catch(()=>{});}
      }
    };
    tick();const interval=window.setInterval(tick,250);return ()=>window.clearInterval(interval);
  },[deadline,index]);
  function start(){
    try {if(!audio.current)audio.current=new AudioContext();void audio.current.resume().catch(()=>{});}catch{/* Visible alert remains available when sound is unsupported. */}
    alerted.current=false;setFinished(false);const seconds=remaining||duration?.seconds||0;setRemaining(seconds);setDeadline(Date.now()+seconds*1000);
  }
  return <article className={`recipe-step step-tone-${index%3}`} aria-label={`Étape ${index+1}`}><span className="recipe-step-number">{index+1}</span><div className="recipe-step-body"><p>{text}</p>{duration&&<div className="recipe-timer-controls"><Button variant="outline" className="recipe-timer" aria-label={`${deadline?'Mettre en pause':'Minuteur'} étape ${index+1}`} onClick={()=>{if(deadline!==null){setRemaining(timerRemaining(deadline,Date.now()));setDeadline(null);}else start();}}>{deadline?<Pause/>:remaining===duration.seconds?<Timer/>:<Play/>}<span>{deadline||remaining!==duration.seconds?formatTimer(remaining):`Minuteur · ${duration.label}`}</span></Button>{(remaining!==duration.seconds||deadline!==null||finished)&&<Button variant="ghost" size="icon" aria-label={`Réinitialiser le minuteur étape ${index+1}`} title="Réinitialiser" onClick={()=>{setDeadline(null);setRemaining(duration.seconds);setFinished(false);alerted.current=false;}}><RotateCcw/></Button>}{finished&&<span className="recipe-timer-finished" role="status"><BellRing/>Terminé !</span>}</div>}</div></article>;
}