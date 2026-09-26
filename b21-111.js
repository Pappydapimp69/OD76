
// B116d Stage appetite: food follows HEAT spent, cleanliness follows kills, hits and bosses.
// Replaces B115e's equal 3+ceil(stage/2) drop. Per stage (fresh record whenever S.stage changes), live play only:
// food  = 2 + max(1, floor(stage/2)) + floor(HEAT% spent / 25)
// clean = 2 + floor(kills / 15) + hits taken (absorbed ones too) + 3 if a boss fight happened.
// HEAT spent is the net fall of S.heat, settled at every frame edge (so skills fired from input handlers count),
// with regen and chain-combo HEAT added back as gains, a hit's HEAT loss left out, and charge refunds subtracted.
const B116D_FOOD_HEAT_STEP=25,B116D_CLEAN_KILL_STEP=15,B116D_BOSS_GRIME=3;
function foodTollB116d(stage,heat){return 2+Math.max(1,Math.floor(.5*stage))+Math.floor((+heat||0)/B116D_FOOD_HEAT_STEP+1e-9)}
function cleanTollB116d(kills,hits,boss){return 2+Math.floor((+kills||0)/B116D_CLEAN_KILL_STEP)+(+hits||0)+(boss?B116D_BOSS_GRIME:0)}
function liveB116d(){return heatLiveB115b()}
function appetiteB116d(){
 if(!S)return null;
 if(!S.b116App||S.b116App.stage!==S.stage)S.b116App={stage:S.stage,heat:0,kills:0,hits:0,boss:false,last:S.heat,gain:0,hurt:0,refund:0};
 return S.b116App;
}
// Settle HEAT since the last edge: falls count while live; refunds always give HEAT back to the stage.
function settleHeatB116d(){
 const a=appetiteB116d();if(!a)return null;
 const h=+S.heat||0;
 if(liveB116d()&&Number.isFinite(a.last))a.heat+=Math.max(0,a.last+a.gain+a.refund-a.hurt-h);
 a.heat=Math.max(0,a.heat-a.refund);a.gain=a.hurt=a.refund=0;a.last=h;return a;
}
// Wrap a HEAT-moving function; `key` collects the rise (gain/refund) or the fall (hurt). Only the outermost call records.
let heatDepthB116d=0;
function watchHeatB116d(fn,key,rise){
 return function(...args){
  const a=S?appetiteB116d():null;if(!a||heatDepthB116d)return fn.apply(this,args);
  const h=+S.heat||0;heatDepthB116d++;
  try{return fn.apply(this,args)}finally{heatDepthB116d--;const d=rise?(+S.heat||0)-h:h-(+S.heat||0);if(d>0&&S.b116App===a)a[key]+=d}
 };
}
regenB115b=watchHeatB116d(regenB115b,"gain",true);
addComboHeatB115b=watchHeatB116d(addComboHeatB115b,"gain",true);
cancelStormChargeB93=watchHeatB116d(cancelStormChargeB93,"refund",true);
releaseStormB93=watchHeatB116d(releaseStormB93,"refund",true);
cancelChargeB94=watchHeatB116d(cancelChargeB94,"refund",true);
releaseChargeB94=watchHeatB116d(releaseChargeB94,"refund",true);
// A landed hit: the player was open (no invuln, run not over) and some branch took it (every one sets invuln).
const hurtBeforeB116d=hurt;
hurt=function(){
 const a=S?appetiteB116d():null,open=!!(a&&liveB116d()&&!(S.invuln>0)&&!S.end),h=S?+S.heat||0:0;
 try{return hurtBeforeB116d()}finally{if(a&&S.b116App===a){a.hurt+=Math.max(0,h-(+S.heat||0));if(open&&S.invuln>0)a.hits++}}
};
const killBeforeB116d=kill;
kill=function(e,chain=false){
 const was=!!e?.dead,out=killBeforeB116d(e,chain);
 if(S&&e&&!was&&e.dead&&liveB116d())appetiteB116d().kills++;
 return out;
};
const bossBeforeB116d=startBossBattle;
startBossBattle=function(){const out=bossBeforeB116d();if(S?.run&&!S.end)appetiteB116d().boss=true;return out};
const updateBeforeB116d=update;
update=function(dt){
 if(!S)return updateBeforeB116d(dt);
 settleHeatB116d();
 const out=updateBeforeB116d(dt);
 if(S){const a=settleHeatB116d();if(liveB116d()&&(S.waveState==="boss"||S.bossActive))a.boss=true}
 return out;
};

// ---- the toll: B115e's fatigue, split food and cleanliness ----
function stageAppetiteB116d(){
 const a=settleHeatB116d()||{};
 // A charge still gathering at the gate is refunded by its cancel, so it is not eaten yet.
 const pend=[S.b93StormCharge,S.b94Charge].reduce((n,c)=>n+(c&&Number.isFinite(c.startHeat)?Math.max(0,c.startHeat-S.heat):0),0);
 const heat=Math.max(0,(a.heat||0)-pend),kills=a.kills||0,hits=a.hits||0,boss=!!a.boss;
 return {heat,kills,hits,boss,food:foodTollB116d(S.stage,heat),clean:cleanTollB116d(kills,hits,boss)};
}
stageTollB115=function(){
 if(!S)return null;if(S.b115TollStage===S.stage)return S.b115Toll;
 const r=ranchB99,was={fatigue:r.fatigue,hunger:r.hunger,hygiene:r.hygiene},away=S.b115Stage===S.stage?S.b115Away||0:0,why=stageAppetiteB116d();
 r.fatigue=Math.min(100,r.fatigue+tollFatigueB115(S.stage,away));r.hunger=Math.max(0,r.hunger-why.food);r.hygiene=Math.max(0,r.hygiene-why.clean);saveRanchB99();
 S.b115TollStage=S.stage;S.b115Toll={away,fatigue:r.fatigue-was.fatigue,hunger:r.hunger-was.hunger,hygiene:r.hygiene-was.hygiene,why};
 applyPipPower();return S.b115Toll;
};
function appetiteTextB116d(w){
 if(!w)return "";
 const n=(v,one)=>`${v} ${one}${v===1?"":"s"}`;
 return `Food −${w.food}: ${Math.round(w.heat)}% HEAT used · Clean −${w.clean}: ${n(w.kills,"kill")}, ${n(w.hits,"hit")}${w.boss?", boss":""}`;
}
(function installAppetiteB116d(){
 const bars=$("ranchGateBarsB115");if(!bars)return;
 const p=document.createElement("p");p.id="ranchGateWhyB116d";p.className="small";bars.insertAdjacentElement("afterend",p);
})();
const renderTollBeforeB116d=renderTollGateB115;
renderTollGateB115=function(){const out=renderTollBeforeB116d(),p=$("ranchGateWhyB116d");if(p)p.textContent=appetiteTextB116d(S?.b115Toll?.why);return out};
