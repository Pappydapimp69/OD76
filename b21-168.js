
// B151 Refinery upgrades take time. Paying starts the upgrade; it finishes after the owner's set time (Lv 2 15 min,
// Lv 3 20, Lv 4 30, Lv 5 40, Lv 6 60; the refinery tops out at Lv 6 since B151), on the real clock, so it also finishes while the player is away. The refinery keeps refining
// at the old speed meanwhile; batches already running when the level changes keep the speed they started at
// (B153); only batches started after use the new speed. One upgrade at a time; the timer is saved and capped on load.
const B151_UPGRADE_MINUTES={2:15,3:20,4:30,5:40,6:60};
function upgradeSecondsB151(to){return (B151_UPGRADE_MINUTES[Math.floor(to)]||60)*60}
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
  storeStartsB117f(f,refineStartsB117f(f,B).map(s=>s<B?s+told-tnew:s)); // running batches keep their old end time
  f.level=f.upgradeTo;f.upgradeTo=0;f.upgradeUntil=0;f.upgradeNotice=true;saveRanchB99();
  if(typeof trackB136==='function')trackB136(['refinery','upgrade-done',`lv-${f.level}`]);
 }
 if(f.upgradeNotice&&ranchWorldB100?.active){f.upgradeNotice=false;saveRanchB99();ranchToastB100?.(`Refinery Lv ${f.level} ready · now ${refineLabelB102(f.level)}/stone.`,2.4)}
 if(f.queue&&f.startedAt>now)return done; // a carried-over batch keeps its old end: B117f would snap a future start back to now
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
// B154 Each refinery upgrade costs twice the last: ★1 to Lv 2, then 2, 4, 8, 16 (31 to max).
refineryUpgradeCostB102=function(lv){return 2**(clamp(Math.floor(lv)||1,1,B102_REFINERY_MAX)-1)};
