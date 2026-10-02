
// B122 Thunderstorm follow cloud. One press (tap or hold) with no cloud up charges 2.2s and forms a storm cloud
// that floats over the player for 12s, costing 25% HEAT; it zaps the nearest enemy in range on its level clock.
// With the cloud up: a quick tap fires a bolt from the cloud at the nearest visible enemy (1s of cloud time, no
// HEAT, 0.25s between bolts); a hold charges seeking clouds (8% HEAT each, 1.1s then 0.9s, max by level) that
// travel and strike as before. Letting a hold go before its first cloud forms costs nothing. Every storm hit
// scales with weapon power. Also: Beam power 1.5+0.20/Lv and a drain of 26% of the meter per second; Nova
// scales with weapon power; the ranch HUD shows Heart Stones again (B118 was writing "Arena max" over them).
const B122_SUMMON_SECONDS=2.2,B122_SUMMON_COST=25,B122_CLOUD_SECONDS=12,B122_BOLT_SECONDS=1,B122_BOLT_COOLDOWN=.25;
const B122_SEEK_FIRST=1.1,B122_SEEK_NEXT=.9;
const B122_SEEK_MAX=[1,2,2,3,4],B122_ZAP_PERIOD=[.8,.7,.7,.6,.5],B122_ZAP_RANGE=[110,110,110,140,140];
const B122_STORM_DAMAGE=[2.6,3.4,4.4,6.2,8.6],B122_BOLT_SHARE=.6,B122_ZAP_SHARE=.5;
const B122_BEAM_PER_LEVEL=.2,B122_BEAM_DRAIN_PERCENT=26,B122_EPS=1e-9;

function weaponPowerB122(){return Math.max(0,Number(S?.weaponPower)||1)}
stormDamageB116a=function(lv){return B122_STORM_DAMAGE[stormLevelB116a(lv)-1]*weaponPowerB122()};
stormDelayB116a=function(lv,formed){return (formed>0?B122_SEEK_NEXT:B122_SEEK_FIRST)*(stormLevelB116a(lv)>=5?B116A_LV5_SPEED:1)};
function zapPeriodB122(lv){return B122_ZAP_PERIOD[stormLevelB116a(lv)-1]}
function zapRangeB122(lv){return B122_ZAP_RANGE[stormLevelB116a(lv)-1]}
function cloudOriginB122(){return {x:P.x,y:P.y-70}}
function liveStormB122(){return !!(S&&S.run&&!S.end&&!S.b39Paused&&S.waveState!=='stage'&&!(S.over>0)&&!S.b94Charge&&!(typeof frozenB116c==='function'&&frozenB116c()))}
// The ignition line, read as if nothing of the storm were in progress (clouds in flight never block a press now).
function igniteOkB122(){const c=S.b93StormCharge,cl=S.b93StormClouds;S.b93StormCharge=null;S.b93StormClouds=[];try{return canIgniteOverdriveB38('storm')}finally{S.b93StormCharge=c;S.b93StormClouds=cl}}
const canIgniteBeforeB122=canIgniteOverdriveB38;
canIgniteOverdriveB38=function(id=S?.overType){
  if(id!=='storm'||!S)return canIgniteBeforeB122(id);
  const cl=S.b93StormClouds;S.b93StormClouds=[];try{return canIgniteBeforeB122(id)}finally{S.b93StormClouds=cl}
};
function chargeB122(mode,level){
  return {b122:true,mode,held:0,prog:0,clouds:0,spent:0,startHeat:S.heat,level,max:B122_SEEK_MAX[level-1],auto:false,paused:false,full:false,cancel:false,flicker:0,timer:0};
}
function summonCloudB122(level){
  S.b122Cloud={level,time:B122_CLOUD_SECONDS,zap:0,bolt:0};
  flash=Math.max(flash,.5);shake=Math.max(shake,7);ring(P.x,P.y-70,'#9ee7ff',90);particle(P.x,P.y-70,'#dff9ff',20,160);burstTone(600,4);announce('STORM CLOUD · TAP BOLT · HOLD CLOUDS',800);
}
function boltB122(){
  const f=S?.b122Cloud;if(!f||f.bolt>0||!liveStormB122())return false;
  let t=null,bd=Infinity;for(const e of visibleEnemies()){const d=hyp(e.x-P.x,e.y-P.y);if(d<bd){bd=d;t=e}}
  if(!t){tone(140,.08,.01,'sine');return false}
  f.bolt=B122_BOLT_COOLDOWN;f.time-=B122_BOLT_SECONDS;
  stormStrikeB116a(t,f.level,stormDamageB116a(f.level)*B122_BOLT_SHARE,cloudOriginB122());flash=Math.max(flash,.3);shake=Math.max(shake,5);
  if(f.time<=B122_EPS){S.b122Cloud=null;announce('STORM CLOUD SPENT',600)}
  return true;
}

const triggerOverdriveBeforeB122=triggerOverdrive;
triggerOverdrive=function(){
  if(S?.overType!=='storm')return triggerOverdriveBeforeB122();
  if(!S)return false;
  const c=S.b93StormCharge;if(c)return !c.auto;
  const level=stormLevelB116a(Math.max(1,overLevel('storm')));
  if(!S.b122Cloud){
    if(!canIgniteOverdriveB38('storm'))return false;
    S.b93StormCharge=chargeB122('summon',level);S.b38OverHeld=true;S.over=0;S.overdrives=(S.overdrives||0)+1;
    announce('THUNDERSTORM · CLOUD FORMING',650);tone(180,.12,.012,'sine');updateUI();return true;
  }
  if(!liveStormB122())return false;
  S.b93StormCharge=chargeB122('pending',level);S.b38OverHeld=true;S.over=0;updateUI();return true;
};

releaseStormB93=(function(releaseBeforeB122){return function(){
  const c=S?.b93StormCharge;if(!c?.b122)return releaseBeforeB122();
  if(c.cancel||!S.run||S.end||S.b39Paused||S.waveState==='stage')return cancelStormChargeB93(true);
  if(c.mode==='summon'){if(c.auto)return true;c.auto=true;S.b38OverHeld=false;S.over=0;announce('THUNDERSTORM · CLOUD FORMING',600);updateUI();return true}
  S.b93StormCharge=null;S.b38OverHeld=false;S.over=0;
  if(c.mode==='pending')boltB122();
  else if(c.mode==='seek'){
    if(c.clouds<1)S.heat=c.startHeat; // nothing formed: nothing spent
    else{S.b93StormCooldown=B93_STORM_COOLDOWN;stormFireB116a(c.clouds,c.level)}
  }
  updateUI();return true;
}})(releaseStormB93);

const tickStormBeforeB122=tickStormB93;
tickStormB93=function(dt){
  tickStormBeforeB122(dt);
  if(!S||S.b39Paused)return;
  const c=S.b93StormCharge;
  if(c?.b122){
    if(!c.b116a&&!c.auto)c.held+=dt;
    if(c.mode==='summon'){
      c.prog+=dt;
      if(c.prog+B122_EPS>=B122_SUMMON_SECONDS){
        if(S.heat<B122_SUMMON_COST-B122_EPS){if(!c.paused){c.paused=true;announce('STORM · NEED HEAT',650)}c.prog=B122_SUMMON_SECONDS}
        else{
          c.paused=false;S.heat=Math.max(0,S.heat-B122_SUMMON_COST);summonCloudB122(c.level);
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

const drawStormBeforeB122=drawStormB93;
drawStormB93=function(){
  drawStormBeforeB122();if(!S?.run||S.end)return;
  const c=S.b93StormCharge,sx=worldToScreenX(P.x),sy=worldToScreenY(P.y);
  if(c?.b122&&c.mode==='summon'){
    const frac=clamp(c.prog/B122_SUMMON_SECONDS,0,1);
    X.save();X.globalAlpha=.08+frac*.1;X.fillStyle='#061226';X.fillRect(0,0,X.canvas.width,X.canvas.height);X.restore();
    drawCloudB93(sx,sy-70,.25+.7*frac,.6+.7*frac);
    X.save();X.strokeStyle='#9ee7ff';X.lineWidth=3;X.shadowColor='#9ee7ff';X.shadowBlur=8;X.beginPath();X.arc(sx,sy-70,24,-Math.PI/2,-Math.PI/2+Math.PI*2*frac);X.stroke();
    X.textAlign='center';X.font='900 12px system-ui';X.fillStyle=c.paused?'#ff9fba':'#dff9ff';X.fillText(c.paused?'NEED MORE HEAT':`CLOUD FORMING ${Math.round(frac*100)}%${c.auto?' · AUTO':''}`,sx,sy-104);X.restore();
  }
  const f=S.b122Cloud;
  if(f){
    const left=clamp(f.time/B122_CLOUD_SECONDS,0,1),bob=Math.sin(S.t*2.4)*3;
    X.save();X.globalAlpha=.12;X.strokeStyle='#9ee7ff';X.setLineDash([6,8]);X.lineWidth=1.5;X.beginPath();X.arc(sx,sy,zapRangeB122(f.level),0,Math.PI*2);X.stroke();X.restore();
    drawCloudB93(sx,sy-70+bob,.95,1.3);
    X.save();X.strokeStyle='#fff0a8';X.lineWidth=3;X.shadowColor='#fff0a8';X.shadowBlur=8;X.beginPath();X.arc(sx,sy-70+bob,26,-Math.PI/2,-Math.PI/2+Math.PI*2*left);X.stroke();
    X.textAlign='center';X.font='900 11px system-ui';X.fillStyle='#fff0a8';X.fillText(`${Math.ceil(f.time)}s`,sx,sy-104+bob);X.restore();
  }
};

const updateUIBeforeB122=updateUI;
updateUI=function(){
  updateUIBeforeB122();const button=$('overdrive');if(!S||S.overType!=='storm'||!button)return;
  const c=S.b93StormCharge,f=S.b122Cloud;
  if(c?.b122&&c.mode==='summon'){button.disabled=!!c.auto;button.innerHTML=`STORM<br><small>${c.paused?'NEED HEAT':`CLOUD FORMING ${Math.round(clamp(c.prog/B122_SUMMON_SECONDS,0,1)*100)}%${c.auto?' · AUTO':''}`}</small>`;return}
  if(c?.b122&&(c.mode==='pending'||c.mode==='dud')){button.disabled=false;button.innerHTML=`STORM<br><small>${c.mode==='dud'?'NEED HEAT FOR CLOUDS':'HOLD FOR CLOUDS'}</small>`;return}
  if(c)return; // a seeking charge: B116a wrote the button
  if(f){button.disabled=!liveStormB122();button.innerHTML=`STORM<br><small>TAP BOLT · HOLD CLOUDS · ${Math.ceil(f.time)}s</small>`;return}
  if(canIgniteOverdriveB38('storm')){button.disabled=false;button.innerHTML='STORM<br><small>PRESS · FORM CLOUD</small>'}
};

const resetBeforeB122=reset;
reset=function(){resetBeforeB122();if(S)S.b122Cloud=null};
if(S)S.b122Cloud=null;

// ---- balance: Beam power and drain, Nova scales with weapon power ----
const attackBeforeB122=attack;
attack=function(){
  if(!(S?.over>0&&S.overType==='beam'))return attackBeforeB122();
  const start=shots.length,out=attackBeforeB122(),lv=overLevel('beam'),ratio=(1.5+lv*B122_BEAM_PER_LEVEL)/(1.5+lv*.33);
  for(let i=start;i<shots.length;i++)if(shots[i]?.source==='player')shots[i].power*=ratio;
  return out;
};
Object.defineProperty(B38_DRAIN_ENERGY_PER_SEC,'beam',{get(){return B122_BEAM_DRAIN_PERCENT/100*heatCapacityB38()},configurable:true});
const releaseNovaBeforeB122=releaseNovaB94;
releaseNovaB94=function(frac,lv){releaseNovaBeforeB122(frac,lv);const w=weaponPowerB122();for(const wave of S?.b94NovaWaves||[])wave.damage*=w};

// ---- ranch HUD: Heart Stones back (B118 wrote "Tired · Arena max" into their span) ----
const renderRanchHudBeforeB122=renderRanchHudB100;
// The fatigue bar is labelled Fatigue (B104 called it Tired); the 😴 stays.
function fatigueLabelB122(){const w=$('ranchHudB100')?.querySelector('.fat')?.previousElementSibling?.querySelector('.w');if(w)w.textContent='Fatigue'}
renderRanchHudB100=function(){renderRanchHudBeforeB122();const s=$('ranchStoneB102');if(s)s.textContent=`◆ ${ranchB99.stones}`;fatigueLabelB122()};
fatigueLabelB122();

// ---- refinery sheet: the "You have" line lists Heart Stones too (it showed hearts, dust and Star Stones only) ----
const refinerySheetBeforeB122=refinerySheetB102;
refinerySheetB102=function(...a){
  const r=refinerySheetBeforeB122(...a),p=$('ranchSheetB100')?.querySelector('p');
  if(p)p.textContent=p.textContent.replace(/You have ♥ /,`You have ◆ ${ranchB99.stones} · ♥ `);
  return r;
};

OVERDRIVE_INFO.storm.desc='Press to form a storm cloud over you (2.2s, 25% HEAT, lasts 12s) that zaps enemies in range. While it is up: tap to fire a bolt from it (1s of cloud time), hold to charge seeking clouds (8% HEAT each). From Lv3 every strike arcs to a nearby enemy.';
OVERDRIVE_INFO.beam.desc='Hold to fire rapid piercing starfire; it drains 26% of the meter per second while held. Levels add streams, damage and penetration.';
updateUI();
