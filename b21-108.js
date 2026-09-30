
// B116a Storm levels: clouds by level, per-cloud charge delay, Lv 3 chain.
// Thunderstorm's level sets how many clouds it can hold (Lv1 1, Lv2 2, Lv3 2, Lv4 3, Lv5 4). Each cloud charges
// in turn: the first takes 2.2s, every further one 1.8s (25% faster at Lv5), and costs 8% HEAT when it forms;
// forming pauses below 8%. Release strikes with the clouds formed. Releasing before the first cloud forms still
// counts: that cloud finishes charging by itself and strikes on its own (S.b93StormCharge stays set until then).
// From Lv3 every strike arcs to one other enemy within 140px of the struck one for 60% damage. Constellation no
// longer ricochets the storm.
const B116A_STORM_CLOUDS=[1,2,2,3,4];
const B116A_FIRST_DELAY=2.2,B116A_NEXT_DELAY=1.8,B116A_LV5_SPEED=.75;
const B116A_CHAIN_LEVEL=3,B116A_CHAIN_RANGE=140,B116A_CHAIN_DAMAGE=.6;
const B116A_EPS=1e-9;

function stormLevelB116a(lv){return clamp(Math.floor(Number(lv)||1),1,5)}
function stormCloudsB116a(lv){return B116A_STORM_CLOUDS[stormLevelB116a(lv)-1]}
function stormDelayB116a(lv,formed){return (formed>0?B116A_NEXT_DELAY:B116A_FIRST_DELAY)*(stormLevelB116a(lv)>=5?B116A_LV5_SPEED:1)}
function stormCapB116a(c){return c.auto?1:c.max}
function stormFracB116a(c){if(!c?.b116a)return 0;return c.clouds>=stormCapB116a(c)?1:clamp(c.prog/stormDelayB116a(c.level,c.clouds),0,1)}
function stormDamageB116a(lv){return 1.25+lv*.62}

// One strike; from Lv3 it arcs to the nearest other live enemy within range of the struck enemy.
function stormChainTargetB116a(from,x,y){
  let best=null,bd=B116A_CHAIN_RANGE+B116A_EPS;
  for(const e of enemies){if(!e||e.dead||e===from)continue;const d=hyp(e.x-x,e.y-y);if(d<=bd){best=e;bd=d}}
  return best;
}
function stormStrikeB116a(first,level,damage,origin=null){
  if(!first||first.dead)return 0;
  const fx=first.x,fy=first.y,ox=origin?.x??fx,oy=origin?.y??fy-Math.max(H*.55,260);
  addLightningB93(ox,oy,fx,fy,'#9ee7ff',.24);hitEnemy(first,damage,'overdrive');particle(fx,fy,'#9ee7ff',12,130);ring(fx,fy,'#9ee7ff',52);
  let hits=1;
  if(level>=B116A_CHAIN_LEVEL){const next=stormChainTargetB116a(first,fx,fy);
    if(next){addLightningB93(fx,fy,next.x,next.y,'#fff0a8',.32);hitEnemy(next,damage*B116A_CHAIN_DAMAGE,'overdrive');particle(next.x,next.y,'#fff0a8',10,120);ring(next.x,next.y,'#fff0a8',34);hits++}}
  tone(1180-rr(0,260),.07,.018,'square');return hits;
}
strikeStormTargetB93=function(first,_bounces,damage=1,origin=null){return stormStrikeB116a(first,Math.max(1,overLevel('storm')),damage,origin)};

function stormFireB116a(count,level){
  const target=count===1?randomStormTargetB93():null;
  if(target){flash=Math.max(flash,.55);shake=Math.max(shake,8);stormStrikeB116a(target,level,stormDamageB116a(level))}
  else{flash=Math.max(flash,.4);launchStormCloudsB93(count,level);announce(`THUNDERSTORM · ${count} CLOUD${count===1?'':'S'}`,650)}
}

// Clouds form only through the B116a charge clock, never on press.
gatherStormCloudB98=function(c){
  if(!c?.b116a||c.clouds>=stormCapB116a(c))return false;
  if(S.heat<B98_STORM_CLOUD_COST-B116A_EPS){if(!c.paused){c.paused=true;announce('STORM · NEED HEAT',650)}return false}
  c.paused=false;S.heat=Math.max(0,S.heat-B98_STORM_CLOUD_COST);c.spent+=B98_STORM_CLOUD_COST;c.clouds++;stormCloudFxB98(c.clouds);
  if(!c.auto&&c.clouds>=c.max){c.full=true;stormFullFxB98()}
  return true;
};
// Accumulate dt; each completed cloud subtracts its own delay so frame rate never changes timing.
function chargeStormB116a(c,dt){
  const cap=stormCapB116a(c);if(c.clouds>=cap){c.prog=0;return}
  c.prog+=dt;
  while(c.clouds<cap){const need=stormDelayB116a(c.level,c.clouds);if(c.prog+B116A_EPS<need)break;
    if(!gatherStormCloudB98(c)){c.prog=need;break}c.prog=Math.max(0,c.prog-need)}
  if(c.clouds>=cap)c.prog=0;
}

const triggerOverdriveBeforeB116a=triggerOverdrive;
triggerOverdrive=function(){
  if(S?.overType!=='storm')return triggerOverdriveBeforeB116a();
  if(S.b93StormCharge?.auto)return false; // the tapped cloud is already on its way
  const fresh=!S.b93StormCharge,ok=triggerOverdriveBeforeB116a(),c=S.b93StormCharge;
  if(ok&&fresh&&c){const level=stormLevelB116a(c.level);
    Object.assign(c,{b116a:true,level,max:stormCloudsB116a(level),prog:0,clouds:0,spent:0,held:0,timer:0,auto:false,paused:false,full:false,cancel:false,flicker:0});updateUI()}
  return ok;
};

releaseStormB93=function(){
  const c=S?.b93StormCharge;if(!c)return false;
  if(c.auto)return true; // repeat pointerup/lostpointercapture: the tap already counted
  if(c.cancel||!S.run||S.end||S.b39Paused||S.waveState==='stage')return cancelStormChargeB93(true);
  S.b38OverHeld=false;S.over=0;
  if(c.clouds<1){c.auto=true;c.paused=false;c.full=false;announce('THUNDERSTORM · CLOUD CHARGING',600);updateUI();return true}
  S.b93StormCharge=null;S.b93StormCooldown=B93_STORM_COOLDOWN;stormFireB116a(c.clouds,c.level);updateUI();return true;
};

// A charged cloud with no target yet waits with the player (it never expires) and strikes once one appears.
function stormHoverB116a(cloud,i,dt){
  cloud.waiting=true;const a=S.t*1.4+i*2.1,tx=P.x+Math.cos(a)*34,ty=P.y-50+Math.sin(a)*6,dx=tx-cloud.x,dy=ty-cloud.y,d=hyp(dx,dy)||1,step=Math.min(d,420*dt);
  cloud.x+=dx/d*step;cloud.y+=dy/d*step;
}
updateStormCloudsB93=function(dt){
  const clouds=S?.b93StormClouds||[];
  for(let i=clouds.length-1;i>=0;i--){const cloud=clouds[i];cloud.age+=dt;if((cloud.delay-=dt)>0)continue;if(!cloud.target||cloud.target.dead)cloud.target=randomStormTargetB93();if(!cloud.target){stormHoverB116a(cloud,i,dt);continue}cloud.waiting=false;
    const tx=cloud.target.x,ty=cloud.target.y-52,dx=tx-cloud.x,dy=ty-cloud.y,d=hyp(dx,dy)||1,step=Math.min(d,520*dt);cloud.x+=dx/d*step;cloud.y+=dy/d*step;
    if(d<=18){stormStrikeB116a(cloud.target,cloud.level,stormDamageB116a(cloud.level),{x:cloud.x,y:cloud.y});flash=Math.max(flash,.1);shake=Math.max(shake,4);clouds.splice(i,1)}
  }
};

tickStormB93=function(dt){
  if(!S||S.b39Paused)return;
  if(S.b93StormCooldown>0&&S.run)S.b93StormCooldown=Math.max(0,S.b93StormCooldown-dt);
  const c=S.b93StormCharge;
  if(c){
    if(!S.run||S.end||S.waveState==='stage'){cancelStormChargeB93(true);return}
    if(c.b116a){
      if(!c.auto)c.held+=dt;chargeStormB116a(c,dt);
      if(c.auto&&c.paused){cancelStormChargeB93(true);announce('STORM · NEED HEAT',650);return}
      if(c.auto&&c.clouds>=1){S.b93StormCharge=null;S.b93StormCooldown=B93_STORM_COOLDOWN;stormFireB116a(1,c.level);updateUI()}
      else{if(c.clouds<stormCapB116a(c)&&Math.random()<dt*3)c.flicker=.08;if(c.flicker>0)c.flicker-=dt}
    }
  }
  if(S.run&&!S.end&&(S.waveState==='active'||S.waveState==='boss'||S.waveState==='break'))updateStormCloudsB93(dt);else if(S.b93StormClouds?.length)S.b93StormClouds=[];
};

drawStormB93=function(){
  if(!S?.run||S.end)return;const c=S.b93StormCharge;
  if(c?.b116a){
    const n=c.clouds,cap=stormCapB116a(c),max=Math.max(cap,c.max),frac=stormFracB116a(c),sx=worldToScreenX(P.x),sy=worldToScreenY(P.y);
    X.save();X.globalAlpha=.10+n*.045+frac*.04;X.fillStyle='#061226';X.fillRect(0,0,X.canvas.width,X.canvas.height);X.restore();
    if(c.flicker>0){X.save();X.globalAlpha=.10;X.fillStyle='#dff9ff';X.fillRect(0,0,X.canvas.width,X.canvas.height);X.restore()}
    for(let i=0;i<max;i++){const a=S.t*1.6+i/max*Math.PI*2,cx=worldToScreenX(P.x+Math.cos(a)*52),cy=worldToScreenY(P.y-46+Math.sin(a)*14),charging=i===n&&i<cap;
      drawCloudB93(cx,cy,i<n?1:charging?.18+.62*frac:i<cap?.18:.08,i<n?1.05:.7+(charging?.3*frac:0));
      if(charging){X.save();X.strokeStyle='#9ee7ff';X.lineWidth=3;X.shadowColor='#9ee7ff';X.shadowBlur=8;X.beginPath();X.arc(cx,cy,17,-Math.PI/2,-Math.PI/2+Math.PI*2*frac);X.stroke();X.restore()}}
    X.save();X.textAlign='center';X.font='900 12px system-ui';X.fillStyle=c.full?'#fff0a8':c.paused?'#ff9fba':'#dff9ff';
    X.fillText(c.full?'FULLY CHARGED · RELEASE':c.paused?`${n}/${cap} · NEED MORE HEAT`:`CHARGING ${Math.min(n+1,cap)}/${cap} · ${Math.round(frac*100)}%${c.auto?' · AUTO':''}`,sx,sy-92);X.restore();
  }
  for(const cloud of S.b93StormClouds||[])drawCloudB93(worldToScreenX(cloud.x),worldToScreenY(cloud.y),clamp(1-cloud.delay,0.3,1),.85);
};

const updateUIBeforeB116a=updateUI;
updateUI=function(){
  updateUIBeforeB116a();const c=S?.b93StormCharge,button=$('overdrive');if(!c?.b116a||!button)return;
  const n=c.clouds,cap=stormCapB116a(c);button.disabled=!!c.auto;
  button.innerHTML=`STORM<br><small>${c.full?'FULL · RELEASE':c.paused?`NEED HEAT · ${n}/${cap}`:`CHARGING ${Math.min(n+1,cap)}/${cap}${c.auto?' · AUTO':''}`}</small>`;
};
OVERDRIVE_INFO.storm.desc='Hold to charge clouds one by one (8% HEAT each; Lv1 1, Lv2-3 2, Lv4 3, Lv5 4 clouds), release to strike. A tap charges one cloud that strikes on its own. From Lv3 each strike arcs to a nearby enemy.';
updateUI();
