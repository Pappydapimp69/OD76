
// B125 patch 10: a drill can't be used through its overgrowth. Its "Train" reach (110–120px) poked past the
// inner obstacle ring (100px), so drills worked without clearing anything. A drill site now opens only once a
// path is cut: at least one inner-ring and one outer-ring obstacle cleared. Until then the station says so,
// and solo drills / train-together games refuse to start there.
const B134_DRILL_SITES=['range','speed','power','guard'];
function sitePathB134(site){
  const obs=B106_OBSTACLES.filter(o=>o.site===site),inner=obs.filter(o=>+o.id.slice(site.length)<8),outer=obs.filter(o=>+o.id.slice(site.length)>=8);
  return inner.some(o=>!obstacleStandingB106(o))&&outer.some(o=>!obstacleStandingB106(o));
}
let drillGateB134=true; // the test harness switches it off for suites written before the gate
function siteLockedB134(site){return drillGateB134&&B134_DRILL_SITES.includes(site)&&!sitePathB134(site)}
const interactStationBeforeB134=interactStationB100;
interactStationB100=function(st){
  if(st&&!st.obstacle&&siteLockedB134(st.id)){
    openSheetB100(B100_GAMES[st.id]?.title||st.name,'Overgrown. Clear a path first: chop or cut at least one bush or tree in the inner ring and one in the outer ring around this station.',[{label:'OK',quiet:true}]);
    return;
  }
  return interactStationBeforeB134(st);
};
const soloDrillBeforeB134=soloDrillB100;
soloDrillB100=function(kind,...a){if(siteLockedB134(kind))return null;return soloDrillBeforeB134(kind,...a)};
const startGameBeforeB134=startGameB100;
startGameB100=function(kind,...a){if(siteLockedB134(kind))return false;return startGameBeforeB134(kind,...a)};
