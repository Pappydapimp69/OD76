// B129 playtest trust pass: restore stage summary routing, make late ranch care less
// grabby, keep kitchen ranch-buff recipes visible once the orchard exists, make
// HEAT costs fixed-energy instead of fixed-percent, and let bosses softly answer
// the player's most-used skill.

function heatPctB129(energy){return energy/heatCapacityB38()*100}
const B129_BEAM_DRAIN_ENERGY=26,B129_STORM_SUMMON_ENERGY=25,B129_STORM_CLOUD_ENERGY=8;
Object.defineProperty(B38_DRAIN_ENERGY_PER_SEC,'beam',{get(){return B129_BEAM_DRAIN_ENERGY},configurable:true});
OVERDRIVE_INFO.beam.desc='Hold to fire rapid piercing starfire; it drains a fixed 26 HEAT per second. A larger reserve now means longer Beam time.';
OVERDRIVE_INFO.storm.desc='Press to form a storm cloud over you (fixed 25 HEAT, lasts 12s) that zaps enemies in range. While it is up: tap to fire a bolt, hold to charge seeking clouds (fixed 8 HEAT each). From Lv3 every strike arcs to a nearby enemy.';

gatherStormCloudB98=function(c){
 if(!c?.b116a||c.clouds>=stormCapB116a(c))return false;
 const cost=heatPctB129(B129_STORM_CLOUD_ENERGY);
 if(S.heat<cost-B116A_EPS){if(!c.paused){c.paused=true;announce('STORM · NEED HEAT',650)}return false}
 c.paused=false;S.heat=Math.max(0,S.heat-cost);c.spent+=cost;c.clouds++;stormCloudFxB98(c.clouds);
 if(!c.auto&&c.clouds>=c.max){c.full=true;stormFullFxB98()}
 return true;
};
tickStormB93=function(dt){
 tickStormBeforeB122(dt);
 if(!S||S.b39Paused)return;
 const c=S.b93StormCharge;
 if(c?.b122){
  if(!c.b116a&&!c.auto)c.held+=dt;
  if(c.mode==='summon'){
   const cost=heatPctB129(B129_STORM_SUMMON_ENERGY);
   c.prog+=dt;
   if(c.prog+B122_EPS>=B122_SUMMON_SECONDS){
    if(S.heat<cost-B122_EPS){if(!c.paused){c.paused=true;announce('STORM · NEED HEAT',650)}c.prog=B122_SUMMON_SECONDS}
    else{
     c.paused=false;S.heat=Math.max(0,S.heat-cost);summonCloudB122(c.level);
     if(c.auto){S.b93StormCharge=null;S.b38OverHeld=false;S.over=0}
     else Object.assign(c,{mode:'seek',b116a:true,prog:0,clouds:0,spent:0,startHeat:S.heat,paused:false,full:false});
     updateUI();
    }
   }
  }else if(c.mode==='pending'&&c.held>=B93_STORM_TAP_SECONDS){
   if(igniteOkB122()){Object.assign(c,{mode:'seek',b116a:true,prog:0,startHeat:S.heat});S.overdrives=(S.overdrives||0)+1;announce('THUNDERSTORM · CLOUDS GATHERING',650);tone(180,.12,.012,'sine')}
   else{c.mode='dud';announce('STORM · NEED HEAT',650)}
   updateUI();
  }
 }
 const f=S.b122Cloud;
 if(f){
  if(!S.run||S.end||S.waveState==='stage'){S.b122Cloud=null;updateUI();return}
  f.bolt=Math.max(0,f.bolt-dt);
  if(S.waveState==='active'||S.waveState==='boss'){
   f.time-=dt;f.zap-=dt;
   if(f.zap<=0){const t=nearestEnemyFrom(P.x,P.y,zapRangeB122(f.level));if(t){stormStrikeB116a(t,f.level,stormDamageB116a(f.level)*B122_ZAP_SHARE,cloudOriginB122());f.zap=zapPeriodB122(f.level)}else f.zap=0}
   if(f.time<=B122_EPS){S.b122Cloud=null;announce('STORM CLOUD FADED',600);updateUI()}
  }
 }
};

function careReliefB129(){
 const best=Math.max(1,Math.floor(ranchB99?.bestPipLevel||1)),stations=Object.values(ranchB99?.stations||{}).reduce((a,n)=>a+(Number(n)||0),0);
 return clamp((best-1)*.01+stations*.012,0,.30);
}
const stageAppetiteBeforeB129=stageAppetiteB116d;
stageAppetiteB116d=function(){
 const why=stageAppetiteBeforeB129(),relief=careReliefB129();
 why.food=Math.max(0,Math.ceil(why.food*(1-relief)));
 why.clean=Math.max(0,Math.ceil(why.clean*(1-relief)));
 why.relief=relief;
 return why;
};
stageTollB115=function(){
 if(!S)return null;if(S.b115TollStage===S.stage)return S.b115Toll;
 const r=ranchB99,was={fatigue:arenaFatigueB118(),hunger:r.hunger,hygiene:r.hygiene},away=S.b115Stage===S.stage?S.b115Away||0:0,why=stageAppetiteB116d(),relief=careReliefB129();
 const fatigue=setArenaFatigueB118(was.fatigue+Math.max(0,Math.ceil(tollFatigueB115(S.stage,away)*(1-relief*.5))));
 r.hunger=Math.max(0,r.hunger-why.food);r.hygiene=Math.max(0,r.hygiene-why.clean);saveRanchB99();
 S.b115TollStage=S.stage;S.b115Toll={away,fatigue:fatigue-was.fatigue,hunger:r.hunger-was.hunger,hygiene:r.hygiene-was.hygiene,why};
 applyPipPower();return S.b115Toll;
};

function syncRanchStatusB129(){
 if(!ranchB99)return;
 ranchB99.fatigue=clamp(Math.floor(Number(ranchB99.fatigue)||0),0,B118_BASE_FATIGUE);
 ranchB99.hunger=clamp(Math.floor(Number(ranchB99.hunger)||0),0,100);
 ranchB99.hygiene=clamp(Math.floor(Number(ranchB99.hygiene)||0),0,100);
 if(ranchWorldB100?.active)renderRanchHudB100();
 if(S?.stagePending)renderTollGateB115();
 return ranchB99;
}
const feedBeforeB129=feedB104;
feedB104=function(...a){const r=feedBeforeB129(...a);if(r)syncRanchStatusB129();return r};
const washBeforeB129=washB104;
washB104=function(...a){const r=washBeforeB129(...a);if(r)syncRanchStatusB129();return r};
const finishRestBeforeB129=typeof finishRestB128==='function'?finishRestB128:null;
if(finishRestBeforeB129)finishRestB128=function(...a){const r=finishRestBeforeB129(...a);if(r)syncRanchStatusB129();return r};

function kitchenRecipesB129(){
 const out=[...B128_KITCHEN_RECIPES];
 if(ranchB99?.areas?.orchard){out.push('tart','pie')}
 return out;
}
kitchenSheetB105=function(){
 if(!ranchB99.areas.kitchen)return unlockSheetB105('kitchen');
 const opts=[],lines=[];
 for(const id of kitchenRecipesB129()){const m=B105_MEALS[id],need=Object.entries(m.needs).map(([k,n])=>`${B104_ITEMS[k].icon}${n}`).join(' ');
  if(canCookB105(id))opts.push({label:`Cook ${m.icon} ${m.name} (${need}) · ${m.desc}`,run:()=>{cookB105(id);ranchToastB100(`Cooked ${m.name}! Feed it to Pip from his menu.`);kitchenSheetB105()}});
  else lines.push(`${m.icon} ${m.name}: ${need}`)
 }
 opts.push({label:'Close',quiet:true});openSheetB100('Kitchen',`Combine food into meals. Meals feed more and give bonuses.${lines.length?' Missing ingredients: '+lines.join(' · ')+'.':''}`,opts);
};

function stageSummaryMissingB129(){return !!(S&&S.stageEnding&&!S.stagePending&&!S.end&&S.waveState==='break'&&S.waveBreak<=0)}
const updateBeforeB129=update;
update=function(dt){const r=updateBeforeB129(dt);if(stageSummaryMissingB129())openStageUpgrade();return r};
const openRanchGateBeforeB129=openRanchGateB99;
openRanchGateB99=function(){if(S?.stageEnding&&!S.stagePending)openStageUpgrade();return openRanchGateBeforeB129()};

function topSkillIdB129(){return typeof topSkillB117==='function'?topSkillB117()?.id:null}
function bossAdaptB129(){const id=topSkillIdB129();return OVERDRIVE_INFO[id]?id:null}
const startBossBeforeB129=startBossBattle;
startBossBattle=function(...a){
 const r=startBossBeforeB129(...a),adapt=bossAdaptB129(),b=enemies.find(e=>e.type==='boss'&&!e.dead);
 if(b&&adapt&&S.stage>=7){b.b129Adapt=adapt;S.b129BossAdapt=adapt;showPipMessage(`${bossData(b.bossKey).name} is watching your ${OVERDRIVE_INFO[adapt].name}.`,true)}
 return r;
};
const fireBossVolleyBeforeB129=fireBossVolley;
fireBossVolley=function(e){
 const before=enemyShots.length,r=fireBossVolleyBeforeB129(e),adapt=e?.b129Adapt||S?.b129BossAdapt;if(!adapt)return r;
 const p=bossData(e.bossKey),base=Math.atan2(P.y-e.y,P.x-e.x);
 if(adapt==='gravity'){
  for(let i=0;i<4;i++){const a=base+Math.PI/2+i*Math.PI/2;enemyShots.push({x:e.x,y:e.y,vx:Math.cos(a)*118,vy:Math.sin(a)*118,r:6,life:4.8,c:p.color,b129:'orbit'})}
 }else if(adapt==='storm'){
  for(let i=before;i<enemyShots.length;i++)enemyShots[i].life+=.55;
 }else if(adapt==='nova'){
  e.attackClock=Math.min(e.attackClock,.34);
 }else if(adapt==='guardian'){
  const a=base;enemyShots.push({x:e.x,y:e.y,vx:Math.cos(a)*95,vy:Math.sin(a)*95,r:9,life:5.2,c:'#fff0a8',b129:'pressure'});
 }else if(adapt==='beam'){
  e.orbitAngle+=.38;
 }
 return r;
};
const updateEnemyBeforeB129=updateEnemy;
updateEnemy=function(e,dt){
 if(e?.type==='boss'&&(e.b129Adapt||S?.b129BossAdapt)==='beam')e.orbitAngle+=(Math.sin(e.age*3.1)>=0?1:-1)*dt*.55;
 return updateEnemyBeforeB129(e,dt);
};
