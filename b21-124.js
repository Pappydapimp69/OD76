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
