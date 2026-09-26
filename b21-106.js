
// B115d Drill sets: 10 trainings per station level; upgrade unlocks at 10 and resets the count.
// Stations lose their Lv 3 cap, so a finished set can always be upgraded (★ lv+1, +2 points per drill per level).
const B115D_SET=10;
function drillCountB115d(kind){return ranchB99.drillCounts?.[kind]||0}
function setDoneB115d(kind){return drillCountB115d(kind)>=B115D_SET}
function setNoteB115d(kind){return setDoneB115d(kind)?` Set done (${B115D_SET}/${B115D_SET}): upgrade the station to train again.`:""}
// Saves: drillCounts default to 0; station levels reload uncapped (B102 clamped them to 3).
function drillSetDefaultsB115d(r,raw){
 const n=(x,hi)=>Number.isFinite(x)?clamp(Math.floor(x),0,hi):0;
 r.stations=r.stations||{};r.drillCounts={};
 for(const k in B99_DRILLS){if(raw?.stations)r.stations[k]=n(raw.stations[k],1e6);r.drillCounts[k]=n(raw?.drillCounts?.[k],B115D_SET)}
 return r;
}
const loadRanchBeforeB115d=loadRanchB99;
loadRanchB99=function(){let raw=null;try{raw=JSON.parse(localStorage.getItem(B99_RANCH_KEY)||"null")}catch(_){}return drillSetDefaultsB115d(loadRanchBeforeB115d(),raw)};
const ranchDefaultBeforeB115d=ranchDefaultB99;
ranchDefaultB99=function(){return drillSetDefaultsB115d(ranchDefaultBeforeB115d(),null)};
ranchB99=loadRanchB99();syncCapsB102();

// ---- a finished set blocks the station; every paid drill (solo or together, win or lose) counts ----
const drillBlockBeforeB115d=drillBlockB99;
drillBlockB99=function(kind){const b=drillBlockBeforeB115d(kind);return b!=="unknown"&&setDoneB115d(kind)?"set":b};
const payDrillBeforeB115d=payDrillB100;
payDrillB100=function(kind){if(!payDrillBeforeB115d(kind))return false;const c=ranchB99.drillCounts||(ranchB99.drillCounts={});c[kind]=(c[kind]||0)+1;saveRanchB99();return true};
upgradeStationB102=function(kind){
 if(!B99_DRILLS[kind]||!setDoneB115d(kind))return false;
 const lv=ranchB99.stations[kind]||0,cost=stationUpgradeCostB102(lv);
 if(ranchB99.starStones<cost)return false;
 ranchB99.starStones-=cost;ranchB99.stations[kind]=lv+1;ranchB99.drillCounts[kind]=0;syncCapsB102();saveRanchB99();return true;
};
const finishGameBeforeB115d=finishGameB100;
finishGameB100=function(){const g=ranchWorldB100.game;if(!g||g.done)return finishGameBeforeB115d();finishGameBeforeB115d();const note=setNoteB115d(g.kind);if(note)ranchToastB100(ranchWorldB100.toast+note,4.5)};

// ---- drill sheet: level and set in the header, set progress and the upgrade lock in the text ----
drillSheetB102=function(st){
 const kind=st.id,d=B99_DRILLS[kind],g=B100_GAMES[kind],block=drillBlockB99(kind),slv=ranchB99.stations[kind]||0,up=stationUpgradeCostB102(slv),cost=drillCostB99(kind),n=drillCountB115d(kind),opts=[];
 const head=`${g.title} · ${d.stat} Lv ${ranchB99.stats[kind]} · Set\u00a0${n}/${B115D_SET}`;
 let text=`${ranchB99.points[kind]%B100_POINTS_PER_LEVEL}/${B100_POINTS_PER_LEVEL} points to the next level. `;
 if(block==="set")text+=`Pip finished this set (${n}/${B115D_SET}). Upgrade the station to train again.`;
 else if(block)text+=block==="tired"?"Pip is too tired to train. Let him rest at his bed.":block==="capped"?`${d.stat} can't go any higher.`:`Needs ◆ ${cost} Heart Stone${cost===1?"":"s"}. You have ◆ ${ranchB99.stones}. Refine hearts at the Heart Refinery.`;
 else{
   text+=`Costs ◆ ${cost}, +${B99_DRILL_FATIGUE} fatigue and a week. Worth ${drillBaseB102(kind)} points; win together for +${B100_BONUS}, fail for −${B100_BONUS}. Solo, Pip succeeds about ${Math.round(soloChanceB100()*100)}% of the time.`;
   opts.push({label:`Let Pip train solo · ◆ ${cost}`,run:()=>{const r=soloDrillB100(kind);if(!r)return;pipDoB100("drill",st,2.4,kind);renderRanchHudB100();ranchToastB100((r.ok?`Pip nailed ${g.title}! +${r.gain} ${d.stat} points${r.levelUp?` · Lv ${ranchB99.stats[kind]}!`:""}`:`Pip stumbled in ${g.title}. Only +${r.gain} points${r.levelUp?` · Lv ${ranchB99.stats[kind]}`:""}.`)+setNoteB115d(kind),4)}});
   opts.push({label:`Train together · ◆ ${cost}`,run:()=>startGameB100(kind)});
 }
 if(block!=="set")text+=` Station Lv ${slv} · Set ${n}/${B115D_SET} · upgrade unlocks at ${B115D_SET}.`;
 else if(ranchB99.starStones>=up){text+=` Station Lv ${slv}.`;opts.push({label:`Upgrade station → Lv ${slv+1} · ★ ${up} (+${B102_STATION_POINTS} points per drill)`,run:()=>{upgradeStationB102(kind);renderRanchHudB100();burstHeartsB100(st.x,st.y-30,5);ranchToastB100(`${g.title} station Lv ${ranchB99.stations[kind]}! Drills are now worth ${drillBaseB102(kind)} points. A new set of ${B115D_SET} begins.`)}})}
 else text+=` Station Lv ${slv}. The upgrade to Lv ${slv+1} costs ★ ${up}; you have ★ ${ranchB99.starStones}. Fuse star dust at the Heart Refinery.`;
 opts.push({label:block?"OK":"Not now",quiet:true});
 openSheetB100(head,text,opts);
};
