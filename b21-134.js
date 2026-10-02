
// B125 patch 3: every drill shows its result. Success sends a stream of 👍 rising from the bottom of the screen
// with a bright rising chime; failure drops 👎 from the top with a low falling tone. Solo drills and the
// train-together mini-games both trigger it. Pure overlay: no input is blocked.
const B128_COUNT=12,B128_SECONDS=1.7;
(function installDrillFxB128(){
  const layer=document.createElement('div');layer.id='drillFxB128';document.body.appendChild(layer);
  const style=document.createElement('style');style.textContent=`
#drillFxB128{position:fixed;inset:0;pointer-events:none;z-index:40;overflow:hidden}
#drillFxB128 span{position:absolute;font-size:clamp(28px,6vmin,48px);line-height:1;will-change:transform,opacity}
#drillFxB128 .up{bottom:-60px;animation:drillUpB128 ${B128_SECONDS}s cubic-bezier(.2,.7,.3,1) forwards}
#drillFxB128 .down{top:-60px;animation:drillDownB128 ${B128_SECONDS}s cubic-bezier(.5,0,.8,.6) forwards}
@keyframes drillUpB128{0%{transform:translateY(0) scale(.6);opacity:0}12%{opacity:1}100%{transform:translateY(calc(-100vh - 80px)) scale(1.15);opacity:0}}
@keyframes drillDownB128{0%{transform:translateY(0) scale(1);opacity:0}12%{opacity:1}100%{transform:translateY(calc(100vh + 80px)) scale(.8) rotate(12deg);opacity:0}}`;
  document.head.appendChild(style);
})();
function drillSoundB128(ok){
  const notes=ok?[[660,0],[880,90],[1320,180]]:[[330,0],[262,130],[196,260]];
  for(const [f,ms] of notes)setTimeout(()=>tone(f,ok?.12:.16,ok?.045:.04,ok?'triangle':'sine'),ms);
}
function drillResultFxB128(ok){
  const layer=$('drillFxB128');if(!layer)return;
  for(let i=0;i<B128_COUNT;i++){const s=document.createElement('span');s.textContent=ok?'👍':'👎';s.className=ok?'up':'down';
    s.style.left=`${4+Math.random()*88}%`;s.style.animationDelay=`${(i*.07+Math.random()*.08).toFixed(2)}s`;layer.appendChild(s);
    setTimeout(()=>s.remove(),(B128_SECONDS+1.2)*1000)}
  drillSoundB128(ok);
}
const finishGameBeforeB128=finishGameB100;
finishGameB100=function(...a){
  const g=ranchWorldB100.game,live=g&&!g.done,ok=live&&g.hits>=g.need,out=finishGameBeforeB128(...a);
  if(live)drillResultFxB128(ok);return out;
};
const soloDrillBeforeB128=soloDrillB100;
soloDrillB100=function(...a){const r=soloDrillBeforeB128(...a);if(r)drillResultFxB128(!!r.ok);return r};
