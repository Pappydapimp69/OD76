
// B129 patch: GoatCounter analytics (https://pappydapimp69.goatcounter.com). Cookieless: no personal data,
// no cookies, no localStorage from GoatCounter. Every gameplay moment worth knowing becomes an event path
// "od76/<area>/<what>/…". Volume is bounded (one event per moment, never per frame or per shot; per-run skill use
// is summarised at run end; 600 events per session cap). Only sends from the live site, never from file://,
// localhost or automated browsers, so tests and local play are never counted.
const B136_CODE='pappydapimp69',B136_CAP=600;
// The build stamp sits below the game script in index.html, so read it when it's needed, not at load.
function buildB136(){const t=(document.getElementById('od76BuildStamp')?.textContent||'').trim();return(t.match(/B\d+[A-Z0-9-]*/)||[t||'dev'])[0]}
const analyticsLogB136=[];let sentB136=0;
function analyticsOnB136(){
  const h=location.hostname;
  return location.protocol.startsWith('http')&&h!=='localhost'&&h!=='127.0.0.1'&&!navigator.webdriver;
}
(function loadGoatCounterB136(){
  if(!analyticsOnB136())return;
  window.goatcounter={no_onload:false,allow_local:false};
  const s=document.createElement('script');s.async=true;s.src='https://gc.zgo.at/count.js';
  s.dataset.goatcounter=`https://${B136_CODE}.goatcounter.com/count`;document.head.appendChild(s);
})();
const queueB136=[];
function slugB136(v){return String(v??'').toLowerCase().replace(/[^a-z0-9.+-]+/g,'-').replace(/^-|-$/g,'').slice(0,40)||'x'}
function trackB136(parts,title){
  const path='od76/'+parts.map(slugB136).join('/');
  analyticsLogB136.push(path);if(analyticsLogB136.length>800)analyticsLogB136.shift();
  if(!analyticsOnB136()||sentB136>=B136_CAP)return;sentB136++;
  const ev={path,title:title||path,event:true};
  if(window.goatcounter?.count)window.goatcounter.count(ev);else queueB136.push(ev);
}
setInterval(()=>{if(window.goatcounter?.count)while(queueB136.length)window.goatcounter.count(queueB136.shift())},2000);
const bucketB136=(n,steps)=>{n=Math.max(0,Number(n)||0);for(const s of steps)if(n<=s)return`le${s}`;return`gt${steps[steps.length-1]}`};
const rankB136=()=>runRankB108()?.id||'E',skillB136=()=>S?.overType||'none';

// ---- session ----
const sessionB136={start:Date.now(),play:statsB117?.play||0,arena:statsB117?.arena||0,ranch:statsB117?.ranch||0,input:{}};
(function sessionStartB136(){
  let seen=false;try{seen=!!localStorage.getItem('od76SeenB136');localStorage.setItem('od76SeenB136','1')}catch(_){}
  const mobile=/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent),w=Math.min(innerWidth,innerHeight);
  trackB136(['session','start',seen?'returning':'new',mobile?'mobile':'desktop',bucketB136(w,[400,700,1000,1400])],'Session start');
})();
setTimeout(()=>trackB136(['build',buildB136()]),0);
for(const [type,name] of [['touchstart','touch'],['keydown','keyboard'],['mousedown','mouse']])
  window.addEventListener(type,()=>{if(!sessionB136.input[name]){sessionB136.input[name]=1;trackB136(['input',name])}},{capture:true,passive:true});
window.addEventListener('gamepadconnected',e=>{if(!sessionB136.input.gamepad){sessionB136.input.gamepad=1;trackB136(['input','gamepad',(e.gamepad?.id||'').split('(')[0]])}});
window.addEventListener('pagehide',()=>{
  const m=(Date.now()-sessionB136.start)/60000;
  trackB136(['session','end',bucketB136(m,[1,3,5,10,20,40,60,120])]);
  trackB136(['session','arena-min',bucketB136(((statsB117?.arena||0)-sessionB136.arena)/60,[1,5,10,20,40,80])]);
  trackB136(['session','ranch-min',bucketB136(((statsB117?.ranch||0)-sessionB136.ranch)/60,[1,5,10,20,40,80])]);
});
let errorsB136=0;
window.addEventListener('error',e=>{if(errorsB136++<10)trackB136(['error',(e.message||'unknown').slice(0,40),String(e.lineno||0)])});

// ---- runs, stages, bosses ----
const runB136={skills:{},t:0,kills:0};
function snapSkillsB136(){const o={};for(const id in statsB117?.skills||{})o[id]=statsB117.skills[id].n||0;return o}
const startWaveBeforeB136=startWave;
startWave=function(n){
  if(n===1&&S&&(S.stage||1)===1&&!S.end){runB136.skills=snapSkillsB136();runB136.t=Date.now();trackB136(['run','start',`rank-${rankB136()}`,skillB136()],'Run start')}
  else if(S)trackB136(['wave','start',`stage-${S.stage}`,`wave-${(S.stageWaveCount||0)+1}`]);
  return startWaveBeforeB136(n);
};
const advanceBeforeB136=advanceToNextStage;
advanceToNextStage=function(...a){
  const q0=typeof lookQualityB125==='function'?Math.floor(lookQualityB125()):0,out=advanceBeforeB136(...a);
  if(S){trackB136(['stage','reach',`stage-${S.stage}`,`rank-${rankB136()}`],`Reached stage ${S.stage}`);
    const q1=typeof lookQualityB125==='function'?Math.floor(lookQualityB125()):0;if(q1>q0)trackB136(['look','reach',`q${q1}`,`rank-${rankB136()}`])}
  return out;
};
const startBossBeforeB136=startBossBattle;
startBossBattle=function(...a){const out=startBossBeforeB136(...a);if(S)trackB136(['boss','start',slugB136(bossData()?.name),`stage-${S.stage}`]);return out};
const killBossBeforeB136=killBoss;
killBoss=function(e,...a){const was=!!e?.dead,out=killBossBeforeB136(e,...a);if(e&&!was)trackB136(['boss','defeat',slugB136(bossData(e.bossKey)?.name),`stage-${S?.stage}`]);return out};
const finishBeforeB136=finish;
finish=function(dead,...a){
  const ended=S?.end,out=finishBeforeB136(dead,...a);
  if(!ended&&S?.end){
    const st=S.stage||1,mins=(Date.now()-(runB136.t||Date.now()))/60000;
    trackB136(['run','end',dead?'fell':'complete',`stage-${st}`,`rank-${rankB136()}`,skillB136()],'Run end');
    trackB136(['run','pip-level',`lv-${S.pipLevel||1}`]);trackB136(['run','minutes',bucketB136(mins,[2,5,10,15,20,30,45,60])]);
    trackB136(['run','score',bucketB136(S.score,[1e3,1e4,5e4,1e5,2e5,5e5])]);
    const now=snapSkillsB136();for(const id in now){const d=now[id]-(runB136.skills[id]||0);if(d>0)trackB136(['run','skill-uses',id,bucketB136(d,[1,5,10,20,40,80])])}
  }
  return out;
};
const bankBeforeB136=bankRunB99;
bankRunB99=function(dead,...a){const out=bankBeforeB136(dead,...a);trackB136(['run','bank',dead?'fell':'home',`stage-${S?.stage||0}`,`hearts-${bucketB136(out,[10,50,100,250,500,1000])}`]);return out};
const bumpBeforeB136=bumpB117;
bumpB117=function(k,by=1){const out=bumpBeforeB136(k,by);if(k==='blocks')trackB136(['fatigue','wall',`stage-${S?.stage||0}`,`rank-${rankB136()}`],'Fatigue wall');return out};

// ---- choices ----
const chooseOverdriveBeforeB136=chooseOverdrive;
chooseOverdrive=function(id,...a){const out=chooseOverdriveBeforeB136(id,...a);trackB136(['skill','equip',id,`lv-${overLevel(id)||0}`]);return out};
const chooseBossRewardBeforeB136=chooseBossReward;
chooseBossReward=function(i,...a){const opt=$('bossReward'+i)?.querySelector('b')?.textContent||i,out=chooseBossRewardBeforeB136(i,...a);trackB136(['upgrade','boss-reward',opt]);return out};
const choosePipUpgradeBeforeB136=choosePipUpgrade;
choosePipUpgrade=function(kind,...a){const out=choosePipUpgradeBeforeB136(kind,...a);trackB136(['upgrade','trait',kind,`stage-${S?.stage||0}`]);return out};
const buyPipAbilityBeforeB136=buyPipAbility;
buyPipAbility=function(kind,...a){const out=buyPipAbilityBeforeB136(kind,...a);trackB136(['upgrade','ability',kind]);return out};
const buySnackBeforeB136=buySnackB118;
buySnackB118=function(...a){const ok=buySnackBeforeB136(...a);if(ok)trackB136(['merchant','buy',`stage-${S?.stage||0}`]);return ok};
const eatSnackBeforeB136=eatSnackB118;
eatSnackB118=function(...a){const ok=eatSnackBeforeB136(...a);if(ok)trackB136(['snack','eat','arena',`stage-${S?.stage||0}`]);return ok};

// ---- ranch ----
const openRanchBeforeB136=openRanchB99;
openRanchB99=function(...a){const out=openRanchBeforeB136(...a);trackB136(['ranch','enter',`week-${bucketB136(ranchB99.week,[1,3,5,10,20,40])}`]);return out};
const soloDrillBeforeB136=soloDrillB100;
soloDrillB100=function(kind,...a){const r=soloDrillBeforeB136(kind,...a);trackB136(['drill','solo',kind,r?(r.ok?'win':'fail'):'refused']);return r};
const finishGameBeforeB136=finishGameB100;
finishGameB100=function(...a){const g=ranchWorldB100.game,live=g&&!g.done,ok=live&&g.hits>=g.need,out=finishGameBeforeB136(...a);if(live)trackB136(['drill','together',g.kind,ok?'win':'fail',`${g.hits}-of-${g.total}`]);return out};
const clearObstacleBeforeB136=clearObstacleB106;
clearObstacleB106=function(id){
  const o=obstacleB106(id),path=o?sitePathB134(o.site):true,full=o?siteFullB135(o.site):true,ok=clearObstacleBeforeB136(id);
  if(ok&&o){trackB136(['ranch','clear',o.site,o.tree?'tree':'shrub']);if(!path&&sitePathB134(o.site))trackB136(['ranch','site-path',o.site]);if(!full&&siteFullB135(o.site))trackB136(['ranch','site-full',o.site])}
  return ok;
};
const feedBeforeB136=feedB104;
feedB104=function(id,...a){const it=feedBeforeB136(id,...a);if(it)trackB136(['ranch','feed',id]);return it};
const washBeforeB136=washB104;
washB104=function(...a){const ok=washBeforeB136(...a);if(ok)trackB136(['ranch','wash']);return ok};
const restBeforeB136=restB99;
restB99=function(...a){const out=restBeforeB136(...a);trackB136(['ranch','rest']);return out};
const buyItemBeforeB136=buyItemB104;
buyItemB104=function(id,n=1){const ok=buyItemBeforeB136(id,n);if(ok)trackB136(['shop','item',id]);return ok};
const buyToolBeforeB136=buyToolB105;
buyToolB105=function(id){const ok=buyToolBeforeB136(id);if(ok)trackB136(['shop','tool',id]);return ok};
const loadHeartsBeforeB136=loadHeartsB102;
loadHeartsB102=function(b,...a){const n=loadHeartsBeforeB136(b,...a);if(n)trackB136(['refinery','load',bucketB136(n,[1,3,5,10,20])]);return n};
const collectTrayBeforeB136=collectTrayB102;
collectTrayB102=function(...a){const g=collectTrayBeforeB136(...a);if(g&&(g.stones||g.dust))trackB136(['refinery','collect',bucketB136(g.stones,[1,3,5,10,20])]);return g};
const upgradeRefineryBeforeB136=upgradeRefineryB102;
upgradeRefineryB102=function(...a){const ok=upgradeRefineryBeforeB136(...a);if(ok)trackB136(['refinery','upgrade',`lv-${ranchB99.refinery.level}`]);return ok};
const upgradeStationBeforeB136=upgradeStationB102;
upgradeStationB102=function(kind,...a){const ok=upgradeStationBeforeB136(kind,...a);if(ok)trackB136(['station','upgrade',kind,`lv-${ranchB99.stations?.[kind]||0}`]);return ok};

// ---- secret playtest menu ----
const unlockQaBeforeB136=unlockQaB118v;
unlockQaB118v=function(...a){const out=unlockQaBeforeB136(...a);trackB136(['qa','unlock'],'Secret playtest menu unlocked');return out};
document.addEventListener('click',e=>{const b=e.target?.closest?.('#qaMenuB118v button');if(b)trackB136(['qa','action',b.id||b.textContent])},true);
