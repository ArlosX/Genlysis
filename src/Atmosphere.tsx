import {useEffect,useRef} from 'react'

export default function Atmosphere({paused}:{paused:boolean}){
 const ref=useRef<HTMLCanvasElement>(null),phase=useRef(0),pointerPosition=useRef({x:.65,y:.35})
 useEffect(()=>{const canvas=ref.current;if(!canvas)return;const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return;const media=matchMedia('(prefers-reduced-motion: reduce)');let frame=0,w=0,h=0,dpr=1,last=0,time=phase.current,mx=pointerPosition.current.x,my=pointerPosition.current.y;const compact=matchMedia('(max-width:600px)').matches
  function size(){dpr=Math.min(devicePixelRatio||1,1.5);w=innerWidth;h=innerHeight;canvas!.width=w*dpr;canvas!.height=h*dpr;canvas!.style.width=w+'px';canvas!.style.height=h+'px';ctx!.setTransform(dpr,0,0,dpr,0,0)}
  function draw(){ctx!.clearRect(0,0,w,h);const x=w*(.68+.09*Math.sin(time*.13))+(mx-.5)*28,y=h*(.38+.12*Math.sin(time*.17))+(my-.5)*20;const light=ctx!.createRadialGradient(x,y,0,x,y,w*.58);light.addColorStop(0,'rgba(163,174,192,.075)');light.addColorStop(.4,'rgba(110,123,143,.027)');light.addColorStop(1,'rgba(0,0,0,0)');ctx!.fillStyle=light;ctx!.fillRect(0,0,w,h)
   ctx!.save();ctx!.globalCompositeOperation='screen';const count=compact?5:9;for(let j=0;j<count;j++){ctx!.beginPath();for(let i=0;i<=64;i++){const p=i/64,X=w*(p*1.3-.15),Y=h*(.48+j*.014)+Math.sin(p*4.1+time*.19+j*.075)*h*.15+Math.sin(p*9-time*.12)*h*.025;i?ctx!.lineTo(X,Y):ctx!.moveTo(X,Y)}ctx!.strokeStyle=`rgba(187,199,218,${j===4?.11:.025})`;ctx!.lineWidth=j===4?.9:.6;ctx!.stroke()}ctx!.restore();
   for(let i=0;i<(compact?9:18);i++){const X=((i*.173+time*.003)%1)*w,Y=((i*.273+Math.sin(time*.11+i)*.022)%1)*h;ctx!.fillStyle=`rgba(211,219,232,${.07+.05*Math.sin(time*.6+i)})`;ctx!.fillRect(X,Y,1,1)}
  }
  function loop(now:number){if(document.hidden||paused||media.matches){frame=0;return}if(now-last>32){time+=(Math.min(60,now-last)||32)/1000;phase.current=time;last=now;draw()}frame=requestAnimationFrame(loop)}
  function resume(){cancelAnimationFrame(frame);frame=0;draw();last=performance.now();if(!paused&&!media.matches&&!document.hidden)frame=requestAnimationFrame(loop)}
  function pointer(e:PointerEvent){mx=e.clientX/w;my=e.clientY/h;pointerPosition.current={x:mx,y:my}}
  function resize(){size();draw()}
  size();resume();window.addEventListener('resize',resize);window.addEventListener('pointermove',pointer,{passive:true});document.addEventListener('visibilitychange',resume);media.addEventListener('change',resume)
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('resize',resize);window.removeEventListener('pointermove',pointer);document.removeEventListener('visibilitychange',resume);media.removeEventListener('change',resume)}
 },[paused])
 return <canvas ref={ref} className="ambient-field" aria-hidden="true"/>
}
