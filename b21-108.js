// B116a Storm levels: Thunderstorm authority consolidated from B93, B98, B116a and the B117 travel fix.
// One owner now controls charging, HEAT cost, release, travel, chaining, presentation and cleanup.
const B93_STORM_TAP_SECONDS=.18;
const B93_STORM_FULL_HOLD_SECONDS=1;
const B93_STORM_MAX_SPEND=20;
const B93_STORM_MAX_CLOUDS=5;
const B93_STORM_COOLDOWN=1.25;
const B98_STORM_CLOUD_COST=8;
const B98_STORM_CLOUD_SECONDS=.2;
const B116A_STORM_CLOUDS=[1,2,2,3,4];
const B116A_FIRST_DELAY=2.2,B116A_NEXT_DELAY=1.8,B116A_LV5_SPEED=.75;
const B116A_CHAIN_LEVEL=3,B116A_CHAIN_RANGE=140,B116A_CHAIN_DAMAGE=.6;
const B116A_EPS=1e-9;
const B117S_CLOUD_SPEED_SHARE=.5;

function stormStateB93(){return S?{charge:S.b93StormCharge||null,clouds:S.b93StormClouds||[],cooldown:S.b93StormCooldown||0}:null}
function stormTargetsB93(){return visibleEnemies()}
function randomStormTargetB93(){const pool=stormTargetsB93();return pool.length?pool[Math.floor(rnd()*pool.length)]:null}
function stormLevelB116a(lv){return clamp(Math.floor(Number(lv)||1),1,5)}
function stormCloudsB116a(lv){return B116A_STORM_CLOUDS[stormLevelB116a(lv)-1]}
function stormDelayB116a(lv,formed){return(formed>0?B116A_NEXT_DELAY:B116A_FIRST_DELAY)*(stormLevelB116a(lv)>=5?B116A_LV5_SPEED:1)}
function stormCapB116a(c){return c.auto?1:c.max}
function stormFracB116a(c){if(!c)return 0;return c.clouds>=stormCapB116a(c)?1:clamp(c.prog/stormDelayB116a(c.level,c.clouds),0,1)}
function stormDamageB116a(lv){return 1.25+lv*.62}
function stormCloudSpeedB117s(){return Math.max(1,playerSpeedB61()*B117S_CLOUD_SPEED_SHARE)}

function addLightningB93(x1,y1,x2,y2,color='#dff9ff',life=.2){
 const steps=6,dx=x2-x1,dy=y2-y1,len=hyp(dx,dy)||1,nx=-dy/len,ny=dx/len;let ax=x1,ay=y1;
 for(let i=1;i<=steps;i++){const t=i/steps,j=i===steps?0:rr(-8,8),bx=x1+dx*t+nx*j,by=y1+dy*t+ny*j;addOverLine(ax,ay,bx,by,color,life);ax=bx;ay=by}
}
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
 if(level>=B116A_CHAIN_LEVEL){const next=stormChainTargetB116a(first,fx,fy);if(next){addLightningB93(fx,fy,next.x,next.y,'#fff0a8',.32);hitEnemy(next,damage*B116A_CHAIN_DAMAGE,'overdrive');particle(next.x,next.y,'#fff0a8',10,120);ring(next.x,next.y,'#fff0a8',34);hits++}}
 tone(1180-rr(0,260),.07,.018,'square');return hits;
}
function strikeStormTargetB93(first,_bounces,damage=1,origin=null){return stormStrikeB116a(first,Math.max(1,overLevel('storm')),damage,origin)}

function stormCloudFxB98(n){ring(P.x,P.y-42,'#9ee7ff',34+n*6);particle(P.x,P.y-42,'#dff9ff',8,110);tone(520+n*90,.07,.02,'triangle');flash=Math.max(flash,.12)}
function stormFullFxB98(){flash=Math.max(flash,.75);shake=Math.max(shake,10);ring(P.x,P.y,'#dff9ff',150);ring(P.x,P.y,'#9ee7ff',95);particle(P.x,P.y-42,'#dff9ff',26,220);burstTone(740,5);announce('STORM FULL ⚡',700)}
function gatherStormCloudB98(c){
 if(!c||c.clouds>=stormCapB116a(c))return false;
 if(S.heat<B98_STORM_CLOUD_COST-B116A_EPS){if(!c.paused){c.paused=true;announce('STORM · NEED HEAT',650)}return false}
 c.paused=false;S.heat=Math.max(0,S.heat-B98_STORM_CLOUD_COST);c.spent+=B98_STORM_CLOUD_COST;c.clouds++;stormCloudFxB98(c.clouds);
 if(!c.auto&&c.clouds>=c.max){c.full=true;stormFullFxB98()}
 return true;
}
function chargeStormB116a(c,dt){
 const cap=stormCapB116a(c);if(c.clouds>=cap){c.prog=0;return}c.prog+=dt;
 while(c.clouds<cap){const need=stormDelayB116a(c.level,c.clouds);if(c.prog+B116A_EPS<need)break;if(!gatherStormCloudB98(c)){c.prog=need;break}c.prog=Math.max(0,c.prog-need)}
 if(c.clouds>=cap)c.prog=0;
}
function cancelStormChargeB93(restore=true){
 const c=S?.b93StormCharge;if(!c)return false;if(restore)S.heat=c.startHeat;
 S.b93StormCharge=null;S.b38OverHeld=false;S.over=0;updateUI();return true;
}
function launchStormCloudsB93(count,level){
 const clouds=S.b93StormClouds||(S.b93StormClouds=[]);
 for(let i=0;i<count;i++){const a=-Math.PI/2+(i-(count-1)/2)*.24;clouds.push({x:P.x+Math.cos(a)*30,y:P.y-38+Math.sin(a)*10,delay:i*.11,target:null,age:0,level})}
}
function stormFireB116a(count,level){flash=Math.max(flash,.4);launchStormCloudsB93(count,level);announce(`THUNDERSTORM · ${count} CLOUD${count===1?'':'S'}`,650)}
function releaseStormB93(){
 const c=S?.b93StormCharge;if(!c)return false;if(c.auto)return true;
 if(c.cancel||!S.run||S.end||S.b39Paused||S.waveState==='stage')return cancelStormChargeB93(true);
 S.b38OverHeld=false;S.over=0;
 if(c.clouds<1){c.auto=true;c.paused=false;c.full=false;announce('THUNDERSTORM · CLOUD CHARGING',600);updateUI();return true}
 S.b93StormCharge=null;S.b93StormCooldown=B93_STORM_COOLDOWN;stormFireB116a(c.clouds,c.level);updateUI();return true;
}

function stormHoverB116a(cloud,i,dt){
 cloud.waiting=true;const a=S.t*1.4+i*2.1,tx=P.x+Math.cos(a)*34,ty=P.y-50+Math.sin(a)*6,dx=tx-cloud.x,dy=ty-cloud.y,d=hyp(dx,dy)||1,step=Math.min(d,420*dt);
 cloud.x+=dx/d*step;cloud.y+=dy/d*step;
}
function updateStormCloudsB93(dt){
 const clouds=S?.b93StormClouds||[],speed=stormCloudSpeedB117s();
 for(let i=clouds.length-1;i>=0;i--){const cloud=clouds[i];cloud.age+=dt;if((cloud.delay-=dt)>0)continue;if(!cloud.target||cloud.target.dead)cloud.target=randomStormTargetB93();if(!cloud.target){stormHoverB116a(cloud,i,dt);continue}cloud.waiting=false;
  const tx=cloud.target.x,ty=cloud.target.y-52,dx=tx-cloud.x,dy=ty-cloud.y,d=hyp(dx,dy)||1,step=Math.min(d,speed*dt);cloud.x+=dx/d*step;cloud.y+=dy/d*step;
  if(d-step<=18){stormStrikeB116a(cloud.target,cloud.level,stormDamageB116a(cloud.level),{x:cloud.x,y:cloud.y});flash=Math.max(flash,.1);shake=Math.max(shake,4);clouds.splice(i,1)}}
}
function tickStormB93(dt){
 if(!S||S.b39Paused)return;if(S.b93StormCooldown>0&&S.run)S.b93StormCooldown=Math.max(0,S.b93StormCooldown-dt);
 const c=S.b93StormCharge;
 if(c){if(!S.run||S.end||S.waveState==='stage'){cancelStormChargeB93(true);return}if(!c.auto)c.held+=dt;chargeStormB116a(c,dt);
  if(c.auto&&c.paused){cancelStormChargeB93(true);announce('STORM · NEED HEAT',650);return}
  if(c.auto&&c.clouds>=1){S.b93StormCharge=null;S.b93StormCooldown=B93_STORM_COOLDOWN;stormFireB116a(1,c.level);updateUI()}
  else{if(c.clouds<stormCapB116a(c)&&Math.random()<dt*3)c.flicker=.08;if(c.flicker>0)c.flicker-=dt}}
 if(S.run&&!S.end&&(S.waveState==='active'||S.waveState==='boss'||S.waveState==='break'))updateStormCloudsB93(dt);else if(S.b93StormClouds?.length)S.b93StormClouds=[];
}

const canIgniteBeforeStormAuthority=canIgniteOverdriveB38;
canIgniteOverdriveB38=function(id=S?.overType){if(id==='storm'&&((S?.b93StormCooldown||0)>0||S?.b93StormCharge||(S?.b93StormClouds?.length||0)>0))return false;return canIgniteBeforeStormAuthority(id)};
const triggerBeforeStormAuthority=triggerOverdrive;
triggerOverdrive=function(){
 if(S?.overType!=='storm')return triggerBeforeStormAuthority();
 if(S.b93StormCharge?.auto)return false;if(S.b93StormCharge)return true;if(!canIgniteOverdriveB38('storm'))return false;
 const level=stormLevelB116a(Math.max(1,overLevel('storm')));
 S.b93StormCharge={level,max:stormCloudsB116a(level),prog:0,clouds:0,spent:0,held:0,startHeat:S.heat,auto:false,paused:false,full:false,cancel:false,flicker:0};
 S.b38OverHeld=true;S.over=0;S.overdrives=(S.overdrives||0)+1;flash=Math.max(flash,.45);shake=Math.max(shake,5);ring(P.x,P.y,'#9ee7ff',120);announce('STORM GATHERING',600);tone(180,.12,.012,'sine');updateUI();return true;
};
const stopBeforeStormAuthority=stopOverdriveB38;
stopOverdriveB38=function(spent=false){if(S?.b93StormCharge)return releaseStormB93();return stopBeforeStormAuthority(spent)};
const updateBeforeStormAuthority=update;
update=function(dt){updateBeforeStormAuthority(dt);tickStormB93(dt);if(S?.b93StormCharge||(S?.b93StormCooldown||0)>0)updateUI()};

function drawCloudB93(x,y,alpha=1,scale=1){X.save();X.globalAlpha=alpha;X.fillStyle='#cdeeff';X.shadowColor='#7ed8ff';X.shadowBlur=10*scale;for(const q of [[-10,2,9],[0,-3,12],[11,2,8],[-1,5,14]]){X.beginPath();X.arc(x+q[0]*scale,y+q[1]*scale,q[2]*scale,0,Math.PI*2);X.fill()}X.restore()}
function drawStormB93(){
 if(!S?.run||S.end)return;const c=S.b93StormCharge;
 if(c){const n=c.clouds,cap=stormCapB116a(c),max=Math.max(cap,c.max),frac=stormFracB116a(c),sx=worldToScreenX(P.x),sy=worldToScreenY(P.y);
  X.save();X.globalAlpha=.10+n*.045+frac*.04;X.fillStyle='#061226';X.fillRect(0,0,X.canvas.width,X.canvas.height);X.restore();
  if(c.flicker>0){X.save();X.globalAlpha=.10;X.fillStyle='#dff9ff';X.fillRect(0,0,X.canvas.width,X.canvas.height);X.restore()}
  for(let i=0;i<max;i++){const a=S.t*1.6+i/max*Math.PI*2,cx=worldToScreenX(P.x+Math.cos(a)*52),cy=worldToScreenY(P.y-46+Math.sin(a)*14),charging=i===n&&i<cap;drawCloudB93(cx,cy,i<n?1:charging?.18+.62*frac:i<cap?.18:.08,i<n?1.05:.7+(charging?.3*frac:0));if(charging){X.save();X.strokeStyle='#9ee7ff';X.lineWidth=3;X.shadowColor='#9ee7ff';X.shadowBlur=8;X.beginPath();X.arc(cx,cy,17,-Math.PI/2,-Math.PI/2+Math.PI*2*frac);X.stroke();X.restore()}}
  X.save();X.textAlign='center';X.font='900 12px system-ui';X.fillStyle=c.full?'#fff0a8':c.paused?'#ff9fba':'#dff9ff';X.fillText(c.full?'FULLY CHARGED · RELEASE':c.paused?`${n}/${cap} · NEED MORE HEAT`:`CHARGING ${Math.min(n+1,cap)}/${cap} · ${Math.round(frac*100)}%${c.auto?' · AUTO':''}`,sx,sy-92);X.restore()}
 for(const cloud of S.b93StormClouds||[])drawCloudB93(worldToScreenX(cloud.x),worldToScreenY(cloud.y),clamp(1-cloud.delay,0.3,1),.85);
}
const drawBeforeStormAuthority=draw;
draw=function(){drawBeforeStormAuthority();drawStormB93()};
const updateUIBeforeStormAuthority=updateUI;
updateUI=function(){
 updateUIBeforeStormAuthority();if(!S||S.overType!=='storm')return;const button=$('overdrive');if(!button)return;
 const c=S.b93StormCharge,clouds=S.b93StormClouds?.length||0,cool=S.b93StormCooldown||0;
 if(c){const n=c.clouds,cap=stormCapB116a(c);button.disabled=!!c.auto;button.classList.add('active');button.innerHTML=`STORM<br><small>${c.full?'FULL · RELEASE':c.paused?`NEED HEAT · ${n}/${cap}`:`CHARGING ${Math.min(n+1,cap)}/${cap}${c.auto?' · AUTO':''}`}</small>`}
 else if(clouds){button.disabled=true;button.innerHTML=`THUNDERSTORM<br><small>${clouds} CLOUD${clouds===1?'':'S'} STRIKING</small>`}
 else if(cool>0){button.disabled=true;button.innerHTML=`STORM<br><small>COOLDOWN ${cool.toFixed(1)}s</small>`}
};

function clearStormB93(restore=false){if(S?.b93StormCharge)cancelStormChargeB93(restore);if(S){S.b93StormClouds=[];S.b93StormCooldown=0}}
const resetBeforeStormAuthority=reset;
reset=function(){resetBeforeStormAuthority();S.b93StormCharge=null;S.b93StormClouds=[];S.b93StormCooldown=0;updateUI()};
if(S){S.b93StormCharge=null;S.b93StormClouds=[];S.b93StormCooldown=0}
window.addEventListener('blur',()=>{if(S?.b93StormCharge)S.b93StormCharge.cancel=true},true);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&S?.b93StormCharge)S.b93StormCharge.cancel=true},true);
OVERDRIVE_INFO.storm.desc='Hold to charge clouds one by one (8% HEAT each; Lv1 1, Lv2-3 2, Lv4 3, Lv5 4 clouds), release to send them. Clouds drift to their targets at half your speed, then strike. A tap charges one cloud that goes on its own. From Lv3 each strike arcs to a nearby enemy.';
updateUI();
