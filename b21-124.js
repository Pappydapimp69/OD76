// B118 Arena Endurance: new personal-best Pip levels permanently raise the next run's fatigue
// ceiling. A deterministic between-stage merchant sells three arena-only snacks per run.
const B118_BASE_FATIGUE=100,B118_LEVEL_ENDURANCE=4,B118_SNACK_HEAL=15;
const B118_SNACK_PRICES=[20,30,45],B118_MERCHANT_FIRST=7,B118_MERCHANT_GAP=5;

function enduranceFieldsB118(r,raw=null){
 const n=(v,lo,hi,fallback)=>Number.isFinite(v)?clamp(Math.floor(v),lo,hi):fallback;
 const best=n(raw?.bestPipLevel??r.bestPipLevel,1,1e5,1);
 r.bestPipLevel=best;r.fatigueMax=B118_BASE_FATIGUE+B118_LEVEL_ENDURANCE*(best-1);
 if(raw&&Number.isFinite(raw.fatigue))r.fatigue=n(raw.fatigue,0,B118_BASE_FATIGUE,r.fatigue||0);
 else r.fatigue=n(r.fatigue,0,B118_BASE_FATIGUE,0);
 return r;
}
function rawRanchB118(){try{const v=JSON.parse(localStorage.getItem(B99_RANCH_KEY)||'null');return v&&typeof v==='object'?v:null}catch(_){return null}}
const ranchDefaultBeforeB118=ranchDefaultB99;
ranchDefaultB99=function(){return enduranceFieldsB118(ranchDefaultBeforeB118())};
const loadRanchBeforeB118=loadRanchB99;
loadRanchB99=function(){return enduranceFieldsB118(loadRanchBeforeB118(),rawRanchB118())};
ranchB99=enduranceFieldsB118(ranchB99,rawRanchB118());saveRanchB99();

function fatigueMaxB118(){return Math.max(B118_BASE_FATIGUE,Math.floor(ranchB99?.fatigueMax||B118_BASE_FATIGUE))}
function arenaFatigueB118(){return fatigueMaxB118()>B118_BASE_FATIGUE&&Number.isFinite(S?.b118ArenaFatigue)?S.b118ArenaFatigue:Math.max(0,+ranchB99.fatigue||0)}
function setArenaFatigueB118(v){
 const value=clamp(Math.floor(v),0,fatigueMaxB118());
 if(S)S.b118ArenaFatigue=value;
 ranchB99.fatigue=Math.min(B118_BASE_FATIGUE,value);saveRanchB99();return value;
}
function freeFatigueB118(){return Math.max(0,fatigueMaxB118()-arenaFatigueB118())}

const resetBeforeB118=reset;
reset=function(){
 const out=resetBeforeB118();
 S.b118ArenaFatigue=Math.min(fatigueMaxB118(),ranchB99.fatigue);
 S.b118Snacks=0;S.b118SnackBought=0;
 return out;
};
reset();

const bankBeforeB118=bankRunB99;
bankRunB99=function(dead){
 const first=!!(S&&!S.b99Banked),level=Math.max(1,Math.floor(S?.pipLevel||1));
 if(first)ranchB99.fatigue=Math.min(B118_BASE_FATIGUE,arenaFatigueB118());
 const earned=bankBeforeB118(dead);
 if(!first)return earned;
 const old=Math.max(1,Math.floor(ranchB99.bestPipLevel||1));
 if(level>old){
   const gain=(level-old)*B118_LEVEL_ENDURANCE;
   ranchB99.bestPipLevel=level;ranchB99.fatigueMax=B118_BASE_FATIGUE+B118_LEVEL_ENDURANCE*(level-1);
   ranchB99.report+=` Pip reached a new best level ${level}; future tests gain +${gain} maximum fatigue.`;
 }
 saveRanchB99();return earned;
};

// The original toll remains exact; only its ceiling moves from 100 to Pip's banked maximum.
stageTollB115=function(){
 if(!S)return null;if(S.b115TollStage===S.stage)return S.b115Toll;
 const r=ranchB99,was={fatigue:arenaFatigueB118(),hunger:r.hunger,hygiene:r.hygiene},away=S.b115Stage===S.stage?S.b115Away||0:0,why=stageAppetiteB116d();
 const fatigue=setArenaFatigueB118(was.fatigue+tollFatigueB115(S.stage,away));
 r.hunger=Math.max(0,r.hunger-why.food);r.hygiene=Math.max(0,r.hygiene-why.clean);saveRanchB99();
 S.b115TollStage=S.stage;S.b115Toll={away,fatigue:fatigue-was.fatigue,hunger:r.hunger-was.hunger,hygiene:r.hygiene-was.hygiene,why};
 applyPipPower();return S.b115Toll;
};
exhaustedB115=function(){return arenaFatigueB118()>=fatigueMaxB118()};
tiredMultB115=function(){return tierB115(100*arenaFatigueB118()/fatigueMaxB118(),B115_TIRED).mult};
needNotesB115=function(){
 const pct=m=>Math.round(m*100)+'%',h=tierB115(ranchB99.hunger,B115_HUNGER),f=tierB115(100*arenaFatigueB118()/fatigueMaxB118(),B115_TIRED),g=tierB115(ranchB99.hygiene,B115_GRIME),out=[];
 if(h.word)out.push(`Pip is ${h.word}: HEAT refills at ${pct(h.mult)} speed`);
 if(f.word)out.push(`Pip is ${f.word}: you attack and move at ${pct(f.mult)} speed`);
 if(g.word)out.push(`Pip is ${g.word}: Guardian Glow at ${pct(g.mult)} strength`);
 return out;
};

function merchantStageB118(stage=S?.stage||0){return stage>=B118_MERCHANT_FIRST&&(stage-B118_MERCHANT_FIRST)%B118_MERCHANT_GAP===0}
function snackPriceB118(){return B118_SNACK_PRICES[Math.min(B118_SNACK_PRICES.length-1,S?.b118SnackBought||0)]}
function buySnackB118(){
 if(!S?.stagePending||!merchantStageB118()||S.b118SnackBought>=B118_SNACK_PRICES.length)return false;
 const price=snackPriceB118();if(S.heartCurrency<price)return false;
 S.heartCurrency-=price;S.b118SnackBought++;S.b118Snacks++;updateUI();return true;
}
function eatSnackB118(){
 if(!S?.stagePending||!exhaustedB115()||!(S.b118Snacks>0))return false;
 S.b118Snacks--;setArenaFatigueB118(arenaFatigueB118()-B118_SNACK_HEAL);renderTollGateB115();return true;
}

(function installArenaEnduranceB118(){
 const gate=$('ranchGateStepB99'),meters=$('ranchGateMetersB115'),actions=gate?.querySelector('.b99Actions');if(!gate||!meters||!actions)return;
 const merchant=document.createElement('div');merchant.id='arenaMerchantB118';merchant.className='stagehidden';
 merchant.innerHTML='<h2>✦ Arena Merchant</h2><p id="merchantTextB118"></p><button id="buySnackB118" class="primary" type="button"></button><button id="leaveMerchantB118" type="button">Continue without buying</button>';
 $('stageUp').querySelector('.card').appendChild(merchant);
 const eat=document.createElement('button');eat.id='eatSnackB118';eat.className='primary stagehidden';eat.type='button';actions.insertAdjacentElement('beforebegin',eat);
 $('buySnackB118').addEventListener('click',()=>resolveMerchantB118(true));$('leaveMerchantB118').addEventListener('click',()=>resolveMerchantB118(false));eat.addEventListener('click',eatSnackB118);
 const style=document.createElement('style');style.id='arenaEnduranceStyleB118';
 style.textContent='#arenaMerchantB118 button{width:100%;margin-top:9px}#eatSnackB118{margin:9px 0;border-color:#ffd36f;background:#503915}';
 document.head.appendChild(style);
})();

function renderMerchantB118(){
 const bought=S?.b118SnackBought||0,left=Math.max(0,3-bought),price=snackPriceB118();
 $('merchantTextB118').textContent=left?`Arena snacks restore ${B118_SNACK_HEAL} fatigue between stages. ${left} remain this run.`:'The merchant is sold out for this run.';
 const buy=$('buySnackB118');buy.textContent=left?`Buy snack · ♥ ${price}`:'SOLD OUT';buy.disabled=!left||S.heartCurrency<price;
}
function openMerchantB118(){
 for(const el of stageStepsB99())el.classList.add('stagehidden');$('ranchGateStepB99').classList.add('stagehidden');
 $('arenaMerchantB118').classList.remove('stagehidden');renderMerchantB118();
}
function resolveMerchantB118(buy){
 if(!S?.stagePending)return;if(buy&&!buySnackB118())return;
 $('arenaMerchantB118').classList.add('stagehidden');
 if(buy)openRanchGateB99();else openStageUpgradeBeforeB118();
}
const openStageUpgradeBeforeB118=openStageUpgrade;
openStageUpgrade=function(){openStageUpgradeBeforeB118();if(merchantStageB118())openMerchantB118()};

renderTollGateB115=function(){
 const bars=$('ranchGateBarsB115');if(!bars)return;
 const r=ranchB99,t=S?.b115Toll||{},fatigue=arenaFatigueB118(),max=fatigueMaxB118(),sign=d=>d>0?`+${d}`:d<0?`−${-d}`:'±0';
 const row=(label,v,d,cls,pct=v)=>`<span>${label} ${v} (${sign(d||0)})</span><div class="b115Bar ${cls}"><i style="width:${clamp(pct,0,100)}%;background-size:${10000/Math.max(pct,1)}% 100%"></i></div>`;
 bars.innerHTML=row('Tired',fatigue,t.fatigue,'fat',100*fatigue/max)+row('Food',r.hunger,t.hunger,'food')+row('Clean',r.hygiene,t.hygiene,'clean');
 $('ranchGateDebuffsB115').textContent='';
 const done=exhaustedB115(),snacks=S?.b118Snacks||0;
 $('ranchGateExhaustB115').textContent=done?(snacks?'Pip has no free fatigue. Feed him an arena snack or return to the ranch.':'Pip is exhausted — return to the ranch.') :'';
 $('nextStageB99').disabled=done;
 const eat=$('eatSnackB118');if(eat){eat.textContent=`Feed Pip an arena snack · ${snacks} left · −${B118_SNACK_HEAL} fatigue`;eat.classList.toggle('stagehidden',!(done&&snacks>0))}
 const why=$('ranchGateWhyB116d');if(why)why.textContent=appetiteTextB116d(t.why);
};

const renderRanchBeforeB118=renderRanchB99;
renderRanchB99=function(){renderRanchBeforeB118();const p=$('ranchReportB99');if(p)p.textContent+=` Arena fatigue max ${fatigueMaxB118()} · best Pip Lv ${ranchB99.bestPipLevel}.`};
const renderRanchHudBeforeB118=renderRanchHudB100;
renderRanchHudB100=function(){renderRanchHudBeforeB118();const spans=$('ranchHudB100')?.querySelectorAll('span');if(spans?.[2])spans[2].textContent=`Tired · Arena max ${fatigueMaxB118()}`};

// B119 quick fixes: drills no longer pass time, and the playtest panel is available only through Pip's hidden ranch sequence.
const payDrillBeforeB118v=payDrillB100;
payDrillB100=function(kind){
 if(drillBlockB99(kind))return false;
 const hungry=ranchB99.hunger<B104_LOW;
 ranchB99.stones-=drillCostB99(kind);ranchB99.fatigue=Math.min(100,ranchB99.fatigue+B99_DRILL_FATIGUE+(hungry?10:0));
 const c=ranchB99.drillCounts||(ranchB99.drillCounts={});c[kind]=(c[kind]||0)+1;saveRanchB99();return true;
};
const trainBeforeB118v=trainB99;
trainB99=function(kind){const week=ranchB99.week,out=trainBeforeB118v(kind);if(out){ranchB99.week=week;saveRanchB99();renderRanchB99()}return out};
const drillSheetBeforeB118v=drillSheetB102;
drillSheetB102=function(st){const out=drillSheetBeforeB118v(st),p=$('ranchSheetB100')?.querySelector('p');if(p)p.textContent=p.textContent.replace(' and a week','');return out};

const B118V_QA_KEY='overdrive76_secret_qa_v1';
let qaUnlockedB118v=false;try{qaUnlockedB118v=localStorage.getItem(B118V_QA_KEY)==='1'}catch(_){}
const qaSecretB118v={phase:'rest',rest:0,bags:0};
function resetQaSecretB118v(){qaSecretB118v.phase='rest';qaSecretB118v.rest=0;qaSecretB118v.bags=0}
function unlockQaB118v(){
 qaUnlockedB118v=true;try{localStorage.setItem(B118V_QA_KEY,'1')}catch(_){}
 ranchWorldB100.b118vCheatBubble=7;resetQaSecretB118v();
}
function secretOptionB118v(label,onRight){
 const options=ranchWorldB100.sheet?.options||[];
 for(const o of options){const run=o.run;o.run=()=>{if(o.label===label)onRight();else resetQaSecretB118v();return run?.()}}
}
const interactBeforeB118v=interactStationB100;
interactStationB100=function(st){
 if(!qaUnlockedB118v&&((qaSecretB118v.phase==='rest'&&st.id!=='home')||(qaSecretB118v.phase==='tub'&&st.id!=='tub')||qaSecretB118v.phase==='bag'))resetQaSecretB118v();
 const out=interactBeforeB118v(st);if(qaUnlockedB118v)return out;
 if(st.id==='home'&&qaSecretB118v.phase==='rest')secretOptionB118v('Not now',()=>{if(++qaSecretB118v.rest===3)qaSecretB118v.phase='tub'});
 else if(st.id==='tub'&&qaSecretB118v.phase==='tub')secretOptionB118v('Not now',()=>{qaSecretB118v.phase='bag';qaSecretB118v.bags=0});
 return out;
};
const bagSheetBeforeB118v=bagSheetB104;
bagSheetB104=function(){if(!qaUnlockedB118v&&qaSecretB118v.phase!=='bag')resetQaSecretB118v();const out=bagSheetBeforeB118v();if(ranchWorldB100.sheet)ranchWorldB100.sheet.b118vBag=true;return out};
const closeSheetBeforeB118v=closeSheetB100;
closeSheetB100=function(){const bag=!!ranchWorldB100.sheet?.b118vBag,out=closeSheetBeforeB118v();if(!qaUnlockedB118v&&bag&&qaSecretB118v.phase==='bag'&&++qaSecretB118v.bags===5)unlockQaB118v();return out};
$('ranchBagB104')?.addEventListener('click',e=>{if(ranchWorldB100.sheet?.b118vBag){e.stopImmediatePropagation();closeSheetB100()}},true);

const QA_FIELDS_B118V=[
 ['week','Week',1,999],['hearts','Ranch hearts',0,999999],['stones','Heart Stones',0,9999],['starStones','Star Stones',0,9999],
 ['fatigue','Tired',0,100],['hunger','Food',0,100],['hygiene','Clean',0,100],['range','Heart Sense',0,999],['speed','Swift Pip',0,999],['power','Star Power',0,999],['guard','Guardian Glow',0,999],['bestPipLevel','Best Pip level',1,999]
];
(function installQaMenuB118v(){
 const modal=document.createElement('div');modal.id='qaMenuB118v';modal.className='hidden';modal.innerHTML=`<div class="card"><h2>Secret Playtest Menu</h2><p class="small">Tune the ranch save, then apply it immediately.</p><div id="qaFieldsB118v"></div><div class="b118vQaActions"><button id="qaApplyB118v" class="primary">Apply values</button><button id="qaRecoverB118v">Full recovery</button><button id="qaMoneyB118v">Add resources</button><button id="qaUnlockB118v">Unlock ranch gear</button><button id="qaCloseB118v">Close</button></div></div>`;document.getElementById('app').appendChild(modal);
 const fields=$('qaFieldsB118v');for(const [key,label,min,max] of QA_FIELDS_B118V){const l=document.createElement('label');l.textContent=label;const input=document.createElement('input');input.id='qa-'+key+'B118v';input.type='number';input.min=min;input.max=max;l.appendChild(input);fields.appendChild(l)}
 const style=document.createElement('style');style.textContent=`#qaMenuB118v{position:fixed;z-index:95;inset:0;display:grid;place-items:center;background:#05070bd9}#qaMenuB118v.hidden{display:none}#qaMenuB118v .card{width:min(620px,94vw);max-height:88vh;overflow:auto}#qaFieldsB118v{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 12px}#qaFieldsB118v label{display:grid;gap:3px;font:700 11px system-ui;color:var(--muted)}#qaFieldsB118v input{width:100%;box-sizing:border-box;padding:8px;border-radius:8px;border:1px solid #ffffff33;background:#080b12;color:white}.b118vQaActions{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:12px}.b118vQaActions button{width:100%}@media(max-width:520px){#qaFieldsB118v,.b118vQaActions{grid-template-columns:1fr}}`;document.head.appendChild(style);
 $('qaCloseB118v').addEventListener('click',closeQaB118v);$('qaApplyB118v').addEventListener('click',applyQaB118v);
 $('qaRecoverB118v').addEventListener('click',()=>{ranchB99.fatigue=0;ranchB99.hunger=100;ranchB99.hygiene=100;saveRanchB99();openQaB118v()});
 $('qaMoneyB118v').addEventListener('click',()=>{ranchB99.hearts+=500;ranchB99.stones+=50;ranchB99.starStones+=20;saveRanchB99();openQaB118v()});
 $('qaUnlockB118v').addEventListener('click',()=>{for(const k in ranchB99.areas)ranchB99.areas[k]=true;for(const k in ranchB99.tools)ranchB99.tools[k]=true;for(const id of ['pellets','bun','soap','carrotSeed','berrySeed','appleSeed'])addItemB104(id,20);saveRanchB99();openQaB118v()});
})();
function qaValueB118v(key){return ['range','speed','power','guard'].includes(key)?ranchB99.stats[key]:ranchB99[key]}
function openQaB118v(){
 if(!qaUnlockedB118v)return;for(const [key] of QA_FIELDS_B118V)$('qa-'+key+'B118v').value=qaValueB118v(key)??0;
 $('qaMenuB118v').classList.remove('hidden');ranchWorldB100.b118vQaOpen=true;
}
function closeQaB118v(){$('qaMenuB118v').classList.add('hidden');ranchWorldB100.b118vQaOpen=false;renderRanchHudB100()}
function applyQaB118v(){
 for(const [key,,min,max] of QA_FIELDS_B118V){const value=clamp(Math.floor(Number($('qa-'+key+'B118v').value)||0),min,max);if(['range','speed','power','guard'].includes(key))ranchB99.stats[key]=value;else ranchB99[key]=value}
 ensurePointsB100(ranchB99);for(const k of ['range','speed','power','guard'])ranchB99.points[k]=Math.max(ranchB99.points[k]||0,ranchB99.stats[k]*B100_POINTS_PER_LEVEL);
 enduranceFieldsB118(ranchB99);syncCapsB102();saveRanchB99();closeQaB118v();ranchToastB100('Playtest values applied.',2.5);
}
function addQaOptionB118v(){
 const w=ranchWorldB100,options=w.sheet?.options;if(!qaUnlockedB118v||!options||options.some(o=>o.b118vQa))return;
 const option={label:'Open QA menu',run:openQaB118v,b118vQa:true};options.push(option);const i=options.length-1,b=document.createElement('button');b.type='button';b.textContent=option.label;b.addEventListener('click',()=>chooseSheetB100(i));$('ranchSheetB100').appendChild(b);
}
const pipSheetBeforeB118v=pipSheetB104;
pipSheetB104=function(){const out=pipSheetBeforeB118v();addQaOptionB118v();return out};
const ranchInputBeforeB118v=ranchInputB100;
ranchInputB100=function(){const r=ranchInputBeforeB118v();ranchWorldB100.b118vXPressed=!!r.xPressed;if(ranchWorldB100.b118vQaOpen)return{act:false,actPressed:false,backPressed:false,navPressed:0,xPressed:false};return r};
const updateRanchBeforeB118v=updateRanchB100;
updateRanchB100=function(dt){
 updateRanchBeforeB118v(dt);const w=ranchWorldB100;if(w.b118vCheatBubble>0)w.b118vCheatBubble=Math.max(0,w.b118vCheatBubble-dt);
 if(!qaUnlockedB118v||!w.active||w.sheet||w.game||w.b109Action||w.b118vQaOpen)return;
 const near=nearestBeforeB109(),atPip=near?.kind==='pip',btn=$('ranchPipBtnB109');if(atPip){btn.classList.add('on');btn.textContent='Pet';if(w.b118vXPressed)pipSheetB104()}
 w.b118vXPressed=false;
};
const drawRanchBeforeB118v=drawRanchB100;
drawRanchB100=function(){drawRanchBeforeB118v();const w=ranchWorldB100;if(!(w.b118vCheatBubble>0))return;X.save();X.translate(Math.round(W/2-w.cam.x),Math.round(H/2-w.cam.y));bubbleB100(w.pip.x,w.pip.y-36,'You can cheat too?');X.restore()};
