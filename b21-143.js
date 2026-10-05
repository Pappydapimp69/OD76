// B127 approved patch: Gravity Well Event Horizon, Pip Ascendant Symphony,
// compact stage-gate effect chips, ranch food tiers and repaired 15-kill rare-drop cadence.

// ---- Gravity Well: Event Horizon ----
const releaseGravityBeforeB127=releaseGravityB94;
releaseGravityB94=function(frac,lv){
 releaseGravityBeforeB127(frac,lv);
 if(S.b94Well)Object.assign(S.b94Well,{frac,mass:0,collapsed:false});
};

function collapseGravityB127(manual=true){
 const w=S?.b94Well;if(!w||w.collapsed)return false;w.collapsed=true;
 const lv=Math.max(1,w.level||1),mass=lv>=3?(w.mass||0):0,full=lv>=5&&w.frac>=.999;
 const radius=full?Infinity:w.radius*(manual?1.08:.9),power=(.75+lv*.48)*(1+mass*.08)*(manual?1:.55);
 ring(w.x,w.y,'#d7b2ff',full?Math.max(W,H):Math.min(420,w.radius*1.25));particle(w.x,w.y,'#b388ff',24+mass,170);shake=Math.max(shake,manual?10:6);
 for(const e of [...enemies])if(!e.dead&&(full||hyp(e.x-w.x,e.y-w.y)<=radius))hitEnemy(e,power*(e.type==='boss'&&lv>=4?1.25:1),'overdrive');
 for(const h of heartBits){if(h.dead||h.b74NodeId)continue;const d=hyp(h.x-w.x,h.y-w.y);if(!full&&d>w.radius*1.15)continue;const dx=P.pipX-h.x,dy=P.pipY-h.y,n=hyp(dx,dy)||1;h.vx=dx/n*520;h.vy=dy/n*520;h.b127Well=false}
 S.b94Well=null;burstTone(150+lv*24,manual?6:3);return true;
}

updateWellB94=function(dt){
 const w=S.b94Well;if(!w)return;w.time-=dt;w.pulse-=dt;const lv=Math.max(1,w.level||1),mass=lv>=3?(w.mass||0):0,orbit=Math.max(34,68-lv*4);
 for(const e of enemies){
  if(e.dead)continue;const dx=w.x-e.x,dy=w.y-e.y,d=hyp(dx,dy)||1;if(d>=w.radius)continue;
  const boss=e.type==='boss'&&lv>=4?1.35:1,pull=(115+lv*28)*(1+mass*.045)*boss*(1-d/w.radius+.18),radial=d>orbit?1:d<orbit*.62?-.35:0,tangent=Math.min(110,35+pull*.22);
  e.x+=(dx/d*pull*radial-dy/d*tangent)*dt;e.y+=(dy/d*pull*radial+dx/d*tangent)*dt;
 }
 if(lv>=2)for(const h of heartBits){
  if(h.dead||h.b74NodeId||h.b60Carried)continue;const dx=w.x-h.x,dy=w.y-h.y,d=hyp(dx,dy)||1;if(d>=w.radius*1.2)continue;
  const step=Math.min(d,(180+lv*35)*(1-d/(w.radius*1.2)+.25)*dt);h.x+=dx/d*step-dy/d*step*.12;h.y+=dy/d*step+dx/d*step*.12;h.vx*=.7;h.vy*=.7;h.b127Well=true;
 }
 if(w.pulse<=0){
  ring(w.x,w.y,'#b388ff',w.radius);particle(w.x,w.y,'#b388ff',14,90);
  for(const e of [...enemies])if(!e.dead&&hyp(e.x-w.x,e.y-w.y)<w.radius){const alive=!e.dead;hitEnemy(e,(.38+lv*.30)*(1+mass*.06)*(e.type==='boss'&&lv>=4?1.2:1),'overdrive');if(alive&&e.dead&&lv>=3)w.mass=Math.min(20,(w.mass||0)+1)}
  w.pulse=Math.max(.24,.52-lv*.045);
 }
 if(w.time<=0)collapseGravityB127(false);
};

// ---- Pip Ascendant: Ascendant Symphony ----
const B127_ECHO_ORDER=['beam','storm','guardian','nova','gravity'];
function ascendantCrownB127(){
 if(S?.b59?.ascTrait)return S.b59.ascTrait;
 return [['love',S.pipLove||0],['compassion',S.pipCompassion||0],['support',S.pipSupport||0]].sort((a,b)=>b[1]-a[1])[0][0];
}
function startAscendantB127(){
 const lv=Math.max(1,overLevel('pip')),echoes=B127_ECHO_ORDER.filter(id=>S.overUnlocked?.has(id));
 S.b127Asc={level:lv,echoes,index:0,harmony:0,seen:new Set(),crown:lv>=3?ascendantCrownB127():null,lastEcho:null,finale:false};
}
function guardianEchoB127(lv){S.invuln=Math.max(S.invuln,.12+lv*.02);ring(P.pipX,P.pipY,'#7ed8ff',52+lv*5);return true}
function fireAscendantEchoB127(id,a,finale=false){
 const base=Math.max(1,overLevel(id)),lv=base+(a.level>=2?1:0)+(a.level>=4?Math.floor(a.harmony/2):0),hasEnemy=enemies.some(e=>!e.dead);
 if(id==='beam')ascendantEchoBeamB38(lv);else if(id==='storm')ascendantEchoStormB38(lv);else if(id==='guardian')guardianEchoB127(lv);else if(id==='nova'){ascendantEchoNovaB38(lv+(a.crown==='love'?1:0));if(a.crown==='love')ascendantEchoNovaB38(lv)}else if(id==='gravity')ascendantEchoGravityB38(lv);
 a.lastEcho=id;if(hasEnemy&&a.level>=4&&!a.seen.has(id)){a.seen.add(id);a.harmony=Math.min(5,a.harmony+1);popup(P.pipX,P.pipY-28,`HARMONY ${a.harmony}`,'#fff0a8',false,.55)}
 if(finale)particle(P.pipX,P.pipY,'#fff0a8',10,130);return hasEnemy;
}
function ascendantCoreB127(a,pulse){
 const lv=a.level,love=S.pipLove||0,comp=S.pipCompassion||0,support=S.pipSupport||0,radius=80+lv*10+love*7,damage=(.55+lv*.34+love*.13)*(1+(a.level>=4?a.harmony*.06:0));
 if(love>0){ring(P.pipX,P.pipY,'#ff9fba',radius);for(const e of [...enemies])if(!e.dead&&hyp(e.x-P.pipX,e.y-P.pipY)<radius)hitEnemy(e,damage,'pip')}
 if(comp>0&&S.shields<S.maxShields&&(a.crown==='compassion'?pulse%3===0:rnd()<Math.min(.55,.16+comp*.08))){S.shields++;S.shieldRegenClock=0;sfxShield()}
 if(support>0){const t=nearestEnemyFrom(P.pipX,P.pipY,650);if(t){const volleys=1+Math.floor((support+lv)/3);for(let i=0;i<volleys;i++)pushPipShot(P.pipX,P.pipY,t,.9+lv*.2+support*.12,rr(-.12,.12))}}
 if(love>=2&&!S.ascendantWishMade&&pulse>=12){S.ascendantWishMade=true;spawnWish(P.pipX,P.pipY)}
 ascendantSoundResonanceB38(pulse);
}
ascendantPulse=function(){
 const a=S.b127Asc;if(!a)return;const pulse=(S.b38AscPulse=(S.b38AscPulse||0)+1);ascendantCoreB127(a,pulse);
 if(a.echoes.length)fireAscendantEchoB127(a.echoes[a.index++%a.echoes.length],a);
};
function ascendantFinaleB127(a){
 if(!a||a.finale||a.level<5||!S.run||S.end)return false;a.finale=true;
 for(const id of a.echoes)fireAscendantEchoB127(id,a,true);
 const power=1.2+a.echoes.length*.35+a.harmony*.2;ring(P.x,P.y,'#fff0a8',Math.max(W,H));for(const e of [...enemies])if(!e.dead)hitEnemy(e,power,'pip');flash=Math.max(flash,.8);shake=Math.max(shake,16);announce('ASCENDANT FINALE ✦',900);return true;
}

const triggerOverdriveBeforeB127=triggerOverdrive;
triggerOverdrive=function(...args){
 if(S?.overType==='gravity'&&S.b94Well&&!S.b94Charge)return collapseGravityB127(true);
 const fresh=S?.overType==='pip'&&!(S.over>0),ok=triggerOverdriveBeforeB127(...args);
 if(ok&&fresh&&S.over>0&&S.overType==='pip')startAscendantB127();return ok;
};
const attackBeforeB127=attack;
attack=function(...args){
 const a=S?.over>0&&S.overType==='pip'?S.b127Asc:null,boost=a&&a.level>=4?1+a.harmony*.06:1,support=a?.crown==='support';
 const power=S?.weaponPower;if(a)S.weaponPower*=boost;try{const r=attackBeforeB127(...args);if(support&&S.attackCd>0)S.attackCd*=.8;return r}finally{if(a)S.weaponPower=power}
};
const updateBeforeB127=update;
update=function(dt){
 const a=S?.over>0&&S.overType==='pip'?S.b127Asc:null,boostSupport=a?.crown==='support',support=S?.pipSupport;
 if(boostSupport)S.pipSupport=support+2;try{updateBeforeB127(dt)}finally{if(boostSupport)S.pipSupport=support}
 if(a&&!(S.over>0&&S.overType==='pip')){ascendantFinaleB127(a);S.b127Asc=null}
};
const updateUIBeforeB127=updateUI;
updateUI=function(){updateUIBeforeB127();if(S?.b94Well&&S.overType==='gravity'){const b=$('overdrive');if(b){b.disabled=false;b.classList.add('ready');b.innerHTML='GRAVITY WELL<br><small>TAP TO COLLAPSE</small>'}}};
const drawBeforeB127r=draw;
draw=function(){
 drawBeforeB127r();const a=S?.over>0&&S.overType==='pip'?S.b127Asc:null;if(!a)return;
 X.save();X.textAlign='center';X.font='800 11px system-ui';X.fillStyle='#fff0a8';X.fillText(`HARMONY ${a.harmony}/5${a.crown?' · '+a.crown.toUpperCase():''}`,worldToScreenX(P.pipX),worldToScreenY(P.pipY)-42);X.restore();
};
const resetBeforeB127=reset;
reset=function(){resetBeforeB127();if(S)S.b127Asc=null};
if(S)S.b127Asc=null;

OVERDRIVE_INFO.gravity.desc='Hold to charge and release an orbiting singularity. Kills add Mass, hearts gather inside it, and a second tap collapses it.';
OVERDRIVE_INFO.pip.desc='At 70% HEAT, Pip transforms and cycles unlocked skill Echoes. Harmony and Pip’s strongest bond empower an Ascendant Finale.';

// ---- Compact stage-gate effects ----
(function styleGateEffectsB127(){const s=document.createElement('style');s.textContent='#ranchGateMetersB115 .b115Meters{grid-template-columns:auto 1fr auto}.b127Effect{font-size:11px;color:#ffffff78;white-space:nowrap}.b127Effect.warn{color:#ffd36f;font-weight:800}@media(max-width:560px){.b127Effect{font-size:10px}}';document.head.appendChild(s)})();
const renderTollGateBeforeB127=renderTollGateB115;
renderTollGateB115=function(){
 renderTollGateBeforeB127();const bars=$('ranchGateBarsB115');if(!bars)return;
 const r=ranchB99,t=S?.b115Toll||{},fatigue=arenaFatigueB118(),max=fatigueMaxB118(),f=tierB115(100*fatigue/max,B115_TIRED),h=tierB115(r.hunger,B115_HUNGER),g=tierB115(r.hygiene,B115_GRIME),sign=d=>d>0?`+${d}`:d<0?`−${-d}`:'±0',pct=m=>Math.round(m*100)+'%';
 const row=(label,v,d,cls,e,p=v)=>`<span>${label} ${v} (${sign(d||0)})</span><div class="b115Bar ${cls}"><i style="width:${clamp(p,0,100)}%;background-size:${10000/Math.max(p,1)}% 100%"></i></div><span class="b127Effect${e.mult<1?' warn':''}">${e.mult<1?e.text:'Normal'}</span>`;
 bars.innerHTML=row('Tired',fatigue,t.fatigue,'fat',{mult:f.mult,text:`Move + attack ${pct(f.mult)}`},100*fatigue/max)+row('Food',r.hunger,t.hunger,'food',{mult:h.mult,text:`HEAT refill ${pct(h.mult)}`})+row('Clean',r.hygiene,t.hygiene,'clean',{mult:g.mult,text:`Guardian Glow ${pct(g.mult)}`});
};
