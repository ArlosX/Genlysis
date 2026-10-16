import {useEffect} from 'react'

let cancelCurrent:()=>void=()=>{}
export function stopScroll(){cancelCurrent()}
export function scrollToPosition(top:number){
 stopScroll()
 const target=Math.max(0,Math.min(top,document.documentElement.scrollHeight-innerHeight))
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){window.scrollTo({top:target,behavior:'instant'});return}
 const from=scrollY,distance=target-from,duration=Math.min(1050,480+Math.abs(distance)*.23),start=performance.now();let frame=0
 const cancel=()=>cancelAnimationFrame(frame);cancelCurrent=cancel
 function step(now:number){const p=Math.min(1,(now-start)/duration),ease=p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;window.scrollTo({top:from+distance*ease,behavior:'instant'});if(p<1)frame=requestAnimationFrame(step);else cancelCurrent=()=>{}}
 frame=requestAnimationFrame(step)
}
export function scrollToElement(el:HTMLElement|null){if(el)scrollToPosition(el.getBoundingClientRect().top+scrollY-24)}

export function useSmoothWheel(enabled:boolean){useEffect(()=>{
 const media=matchMedia('(prefers-reduced-motion: reduce)');let frame=0,target=scrollY,previous=0
 function cancel(){cancelAnimationFrame(frame);frame=0;target=scrollY;previous=0}
 cancelCurrent=cancel
 function nestedCanScroll(event:WheelEvent){for(const entry of event.composedPath()){if(!(entry instanceof HTMLElement)||entry===document.body||entry===document.documentElement)continue;const style=getComputedStyle(entry);if(/auto|scroll/.test(style.overflowY)&&entry.scrollHeight>entry.clientHeight+2){if(event.deltaY>0&&entry.scrollTop+entry.clientHeight<entry.scrollHeight-1)return true;if(event.deltaY<0&&entry.scrollTop>0)return true}}return false}
 function tick(now:number){const dt=previous?Math.min(40,now-previous):16;previous=now;const next=scrollY+(target-scrollY)*(1-Math.exp(-dt/92));window.scrollTo({top:next,behavior:'instant'});if(Math.abs(target-scrollY)>.7)frame=requestAnimationFrame(tick);else{window.scrollTo({top:target,behavior:'instant'});frame=0;previous=0}}
 function wheel(e:WheelEvent){if(!enabled||media.matches||e.ctrlKey||e.metaKey||e.shiftKey||Math.abs(e.deltaX)>Math.abs(e.deltaY)||nestedCanScroll(e)||e.defaultPrevented)return;const max=document.documentElement.scrollHeight-innerHeight;if(max<=0)return;const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1);if(!delta)return;if(!frame){cancelCurrent();target=scrollY;cancelCurrent=cancel}const next=Math.max(0,Math.min(max,target+delta));if(next===target&&((next===0&&delta<0)||(next===max&&delta>0)))return;e.preventDefault();target=next;if(!frame)frame=requestAnimationFrame(tick)}
 function key(e:KeyboardEvent){if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(e.key))cancelCurrent()}
 function sync(){if(!frame)target=scrollY}
 window.addEventListener('wheel',wheel,{passive:false});window.addEventListener('keydown',key);window.addEventListener('touchstart',cancel,{passive:true});window.addEventListener('pointerdown',cancel,{passive:true});window.addEventListener('scroll',sync,{passive:true});media.addEventListener('change',cancel)
 return()=>{cancel();cancelCurrent=()=>{};window.removeEventListener('wheel',wheel);window.removeEventListener('keydown',key);window.removeEventListener('touchstart',cancel);window.removeEventListener('pointerdown',cancel);window.removeEventListener('scroll',sync);media.removeEventListener('change',cancel)}
 },[enabled])}
