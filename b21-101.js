
// B113 Uncapped ranch training: drills can raise every heart skill forever, like in-run upgrades.
// Station upgrades keep their +2 points per drill; they no longer have a cap to raise.
for(const k in B102_BASE_CAPS)B102_BASE_CAPS[k]=Infinity;
syncCapsB102();
ranchB99=loadRanchB99();syncCapsB102();
levelLineB100=function(kind){const d=B99_DRILLS[kind],p=ranchB99.points[kind];return`${d.stat} Lv ${ranchB99.stats[kind]} · ${p%B100_POINTS_PER_LEVEL}/${B100_POINTS_PER_LEVEL} to next`};
const drillSheetBeforeB113=drillSheetB102;
drillSheetB102=function(st){
 drillSheetBeforeB113(st);
 const kind=st.id,w=ranchWorldB100,g=B100_GAMES[kind];if(!w.sheet)return;
 for(const o of w.sheet.options){
   if(!o.label.startsWith("Upgrade station"))continue;
   o.label=o.label.replace(" (+2 points, cap +1)",` (+${B102_STATION_POINTS} points per drill)`);
   o.run=()=>{upgradeStationB102(kind);renderRanchHudB100();burstHeartsB100(st.x,st.y-30,5);ranchToastB100(`${g.title} station Lv ${ranchB99.stations[kind]}! Drills are now worth ${drillBaseB102(kind)} points.`)};
 }
 const btns=$("ranchSheetB100")?.querySelectorAll("button");
 w.sheet.options.forEach((o,i)=>{if(btns?.[i])btns[i].textContent=o.label});
};
