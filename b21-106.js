// B115d Drill level gates: each station level unlocks ten skill levels.
// When the skill reaches that level cap, training stops until the station is upgraded.
const B115D_LEVELS_PER_STATION=10;
function drillLevelCapB115d(kind){return ((ranchB99.stations?.[kind]||0)+1)*B115D_LEVELS_PER_STATION}
function stationReadyB115d(kind){return (ranchB99.stats?.[kind]||0)>=drillLevelCapB115d(kind)}

// Saves: station levels reload uncapped. Obsolete drillCounts are deliberately discarded.
function drillLevelDefaultsB115d(r,raw){
 const n=x=>Number.isFinite(x)?clamp(Math.floor(x),0,1e6):0;
 r.stations=r.stations||{};delete r.drillCounts;
 for(const k in B99_DRILLS)if(raw?.stations)r.stations[k]=n(raw.stations[k]);
 return r;
}
const loadRanchBeforeB115d=loadRanchB99;
loadRanchB99=function(){let raw=null;try{raw=JSON.parse(localStorage.getItem(B99_RANCH_KEY)||"null")}catch(_){}return drillLevelDefaultsB115d(loadRanchBeforeB115d(),raw)};
const ranchDefaultBeforeB115d=ranchDefaultB99;
ranchDefaultB99=function(){return drillLevelDefaultsB115d(ranchDefaultBeforeB115d(),null)};
ranchB99=loadRanchB99();syncCapsB102();

const drillBlockBeforeB115d=drillBlockB99;
drillBlockB99=function(kind){const b=drillBlockBeforeB115d(kind);return b!=="unknown"&&stationReadyB115d(kind)?"level":b};
const awardDrillBeforeB115d=awardDrillB100;
awardDrillB100=function(kind,bonus){
 const before=ranchB99.points[kind],r=awardDrillBeforeB115d(kind,bonus),ceiling=drillLevelCapB115d(kind)*B100_POINTS_PER_LEVEL;
 if(ranchB99.points[kind]>ceiling){ranchB99.points[kind]=ceiling;ranchB99.stats[kind]=drillLevelCapB115d(kind);r.gain=ceiling-before;r.levelUp=ranchB99.stats[kind]>Math.floor(before/B100_POINTS_PER_LEVEL);saveRanchB99()}
 return r;
};
upgradeStationB102=function(kind){
 if(!B99_DRILLS[kind]||!stationReadyB115d(kind))return false;
 const lv=ranchB99.stations[kind]||0,cost=stationUpgradeCostB102(lv);
 if(ranchB99.starStones<cost)return false;
 ranchB99.starStones-=cost;ranchB99.stations[kind]=lv+1;syncCapsB102();saveRanchB99();return true;
};

drillSheetB102=function(st){
 const kind=st.id,d=B99_DRILLS[kind],g=B100_GAMES[kind],block=drillBlockB99(kind),slv=ranchB99.stations[kind]||0,cap=drillLevelCapB115d(kind),up=stationUpgradeCostB102(slv),cost=drillCostB99(kind),opts=[];
 const head=`${g.title} · ${d.stat} Lv ${ranchB99.stats[kind]}`;
 let text=`${ranchB99.points[kind]%B100_POINTS_PER_LEVEL}/${B100_POINTS_PER_LEVEL} points to the next level. `;
 if(block==="level")text+=`${d.stat} reached this station's Lv ${cap} limit. Upgrade the station to train again.`;
 else if(block)text+=block==="tired"?"Pip is too tired to train. Let him rest at his bed.":block==="capped"?`${d.stat} can't go any higher.`:`Needs ◆ ${cost} Heart Stone${cost===1?"":"s"}. You have ◆ ${ranchB99.stones}. Refine hearts at the Heart Refinery.`;
 else{
   text+=`Costs ◆ ${cost}, +${B99_DRILL_FATIGUE} fatigue and a week. Worth ${drillBaseB102(kind)} points; win together for +${B100_BONUS}, fail for −${B100_BONUS}. Solo, Pip succeeds about ${Math.round(soloChanceB100()*100)}% of the time.`;
   opts.push({label:`Let Pip train solo · ◆ ${cost}`,run:()=>{const r=soloDrillB100(kind);if(!r)return;pipDoB100("drill",st,2.4,kind);renderRanchHudB100();ranchToastB100(r.ok?`Pip nailed ${g.title}! +${r.gain} ${d.stat} points${r.levelUp?` · Lv ${ranchB99.stats[kind]}!`:""}`:`Pip stumbled in ${g.title}. Only +${r.gain} points${r.levelUp?` · Lv ${ranchB99.stats[kind]}`:""}.`,4)}});
   opts.push({label:`Train together · ◆ ${cost}`,run:()=>startGameB100(kind)});
 }
 if(block!=="level")text+=` Station Lv ${slv} trains through ${d.stat} Lv ${cap}; the next upgrade unlocks there.`;
 else if(ranchB99.starStones>=up){text+=` Station Lv ${slv}.`;opts.push({label:`Upgrade station → Lv ${slv+1} · ★ ${up} (+${B102_STATION_POINTS} points per drill)`,run:()=>{upgradeStationB102(kind);renderRanchHudB100();burstHeartsB100(st.x,st.y-30,5);ranchToastB100(`${g.title} station Lv ${ranchB99.stations[kind]}! Training is unlocked through Lv ${drillLevelCapB115d(kind)} and drills are worth ${drillBaseB102(kind)} points.`)}})}
 else text+=` Station Lv ${slv}. The upgrade to Lv ${slv+1} costs ★ ${up}; you have ★ ${ranchB99.starStones}. Fuse star dust at the Heart Refinery.`;
 opts.push({label:block?"OK":"Not now",quiet:true});
 openSheetB100(head,text,opts);
};
