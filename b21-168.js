
// B151 Refinery upgrades take time. Paying starts the upgrade; it finishes after (target level − 1) × 2 min (2 min to
// Lv 2 … 18 min to Lv 10), on the real clock, so it also finishes while the player is away. The refinery keeps refining
// at the old speed meanwhile; at the moment the level changes, batches already running keep the share of work they've
// done and finish the rest at the new speed. One upgrade at a time; the timer is saved and capped on load.
const B151_STEP_SECONDS=120;
function upgradeSecondsB151(to){return Math.max(1,(Math.floor(to)-1))*B151_STEP_SECONDS}
function upgradeLabelB151(to){return refineLabelB102({sec:upgradeSecondsB151(to)})}
function refineryUpgradingB151(f=ranchB99.refinery){return !!(f?.upgradeUntil>0&&f.upgradeTo>f.level)}
const refineLabelBeforeB151=refineLabelB102;
refineLabelB102=function(lv){if(lv&&typeof lv==='object'){const s=lv.sec;return s>=60?`${Math.round(s/60)} min`:`${s} sec`}return refineLabelBeforeB151(lv)};

const sanitizeEconomyBeforeB151=sanitizeEconomyB102;
sanitizeEconomyB102=function(r,raw){
 const out=sanitizeEconomyBeforeB151(r,raw),f=raw?.refinery||{},o=out.refinery,to=Math.floor(Number(f.upgradeTo));
 o.upgradeTo=Number.isFinite(to)&&to>o.level&&to<=B102_REFINERY_MAX?to:0;
 o.upgradeUntil=o.upgradeTo&&Number.isFinite(f.upgradeUntil)&&f.upgradeUntil>0?Math.min(f.upgradeUntil,Date.now()+upgradeSecondsB151(o.upgradeTo)*1000):0;
 if(!o.upgradeUntil)o.upgradeTo=0;
 o.upgradeNotice=f.upgradeNotice===true;
 return out;
};
ranchB99=loadRanchB99();syncCapsB102();

const tickRefineryBeforeB151=tickRefineryB102;
tickRefineryB102=function(now=Date.now(),roll=Math.random){
 const f=ranchB99.refinery;let done=0;
 if(refineryUpgradingB151(f)&&now>=f.upgradeUntil){
  const B=f.upgradeUntil;done+=tickRefineryBeforeB151(B,roll);
  const told=refineSecondsB102(f.level)*1000,tnew=refineSecondsB102(f.upgradeTo)*1000;
  storeStartsB117f(f,refineStartsB117f(f,B).map(s=>B-(B-s)*tnew/told)); // keep each batch's done share
  f.level=f.upgradeTo;f.upgradeTo=0;f.upgradeUntil=0;f.upgradeNotice=true;saveRanchB99();
  if(typeof trackB136==='function')trackB136(['refinery','upgrade-done',`lv-${f.level}`]);
 }
 if(f.upgradeNotice&&ranchWorldB100?.active){f.upgradeNotice=false;saveRanchB99();ranchToastB100?.(`Refinery Lv ${f.level} ready · now ${refineLabelB102(f.level)}/stone.`,2.4)}
 return done+tickRefineryBeforeB151(now,roll);
};
upgradeRefineryB102=function(now=Date.now()){
 tickRefineryB102(now);
 const f=ranchB99.refinery,cost=refineryUpgradeCostB102(f.level);
 if(refineryUpgradingB151(f)||f.level>=B102_REFINERY_MAX||ranchB99.starStones<cost)return false;
 ranchB99.starStones-=cost;f.upgradeTo=f.level+1;f.upgradeUntil=now+upgradeSecondsB151(f.upgradeTo)*1000;saveRanchB99();
 if(typeof trackB136==='function')trackB136(['refinery','upgrade',`lv-${f.upgradeTo}`]);
 return true;
};
const refinerySheetBeforeB151=refinerySheetB102;
refinerySheetB102=function(...a){
 const open=openSheetB100;
 openSheetB100=function(title,text,options,...rest){
  if(title==='Heart Refinery'){
   const f=ranchB99.refinery,i=options.findIndex(o=>/^Upgrade refinery/.test(o.label));
   text=text.replace(/ Next upgrade: ★ \d+ for [^.]+ per stone\./,'');
   if(refineryUpgradingB151(f)){if(i>=0)options.splice(i,1);text+=` Upgrading → Lv ${f.upgradeTo} · ${clockB102(Math.max(0,f.upgradeUntil-Date.now()))} left · still refining at ${refineLabelB102(f.level)}/stone.`}
   else if(f.level<B102_REFINERY_MAX){const to=f.level+1,up=refineryUpgradeCostB102(f.level);
    if(i>=0)options[i]={label:`Upgrade refinery → Lv ${to} · ★ ${up} · takes ${upgradeLabelB151(to)} (then ${refineLabelB102(to)}/stone)`,run:()=>{if(upgradeRefineryB102()){renderRanchHudB100();ranchToastB100(`Upgrading → Lv ${to} · ready in ${upgradeLabelB151(to)}. It keeps refining meanwhile.`,2.4)}}};
    else text+=` Next upgrade: ★ ${up} · takes ${upgradeLabelB151(to)} (then ${refineLabelB102(to)}/stone).`}
  }
  return open(title,text,options,...rest);
 };
 try{return refinerySheetBeforeB151(...a)}finally{openSheetB100=open}
};
