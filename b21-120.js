// B117 Petting finds Star Stones (shipped inside B117). Each pet has a chance to give Pip's player a Star Stone:
// +1% per 15 arena minutes and +1% per 500 enemies defeated, counted since the last stone. A stone resets both.
const B117P_ARENA_SEC=900,B117P_KILLS=500,B117P_STEP=.01,B117P_SAVE_EVERY=5;
let petRollB117p=()=>Math.random(),petSaveClockB117p=0;
function petStateB117p(){const p=ranchB99.b117Pet;if(p&&Number.isFinite(p.arena)&&Number.isFinite(p.kills))return p;return ranchB99.b117Pet={arena:0,kills:0}}
function petChanceB117p(){const p=petStateB117p();return Math.min(1,B117P_STEP*(Math.floor(p.arena/B117P_ARENA_SEC)+Math.floor(p.kills/B117P_KILLS)))}
const loadRanchBeforeB117p=loadRanchB99;
loadRanchB99=function(){
  const r=loadRanchBeforeB117p();let raw=null;try{raw=JSON.parse(localStorage.getItem(B99_RANCH_KEY)||'null')}catch(_){}
  const n=x=>Number.isFinite(x)&&x>0?x:0;r.b117Pet={arena:n(raw?.b117Pet?.arena),kills:Math.floor(n(raw?.b117Pet?.kills))};return r;
};
ranchB99=loadRanchB99();syncCapsB102();
const updateBeforeB117p=update;
update=function(dt){
  const r=updateBeforeB117p(dt);
  if(arenaLiveB117()&&!document.hidden){const t=Math.min(1,Math.max(0,Number(dt)||0));petStateB117p().arena+=t;if((petSaveClockB117p+=t)>=B117P_SAVE_EVERY){petSaveClockB117p=0;saveRanchB99()}}
  return r;
};
const killBeforeB117p=kill;
kill=function(e,...a){const was=!!e?.dead,r=killBeforeB117p(e,...a);if(S?.run&&!ranchWorldB100.active&&e&&!was&&e.dead)petStateB117p().kills++;return r};
window.addEventListener('pagehide',()=>saveRanchB99());
function petStoneB117p(){
  const chance=petChanceB117p();if(chance<=0||petRollB117p()>=chance)return false;
  ranchB99.starStones=(ranchB99.starStones||0)+1;ranchB99.b117Pet={arena:0,kills:0};saveRanchB99();
  const p=ranchWorldB100.pip;burstHeartsB100(p.x,p.y,8);ranchToastB100('Pip found a Star Stone for you! ✦',3.2);renderRanchHudB100();return true;
}
const pipSheetBeforeB117p=pipSheetB104;
pipSheetB104=function(...a){
  const r=pipSheetBeforeB117p(...a),sheet=ranchWorldB100.sheet,pet=sheet?.options?.find(o=>o.label==='Pet Pip');
  if(pet&&!pet.b117p){const run=pet.run;pet.run=(...x)=>{const out=run?.(...x);petStoneB117p();return out};pet.b117p=true}
  const p=$('ranchSheetB100')?.querySelector('p'),pct=Math.round(petChanceB117p()*100);
  if(p&&pet)p.textContent+=` Star Stone chance when petted: ${pct}%.`;
  return r;
};
