// B168 Ranch work feeds the Colosseum. Fatigue already grows with arena play; clearing the ranch now builds Pip for the
// ring. Shrubs cut (steady, repetitive work) strengthen Guard; trees felled (heavy axe work) strengthen Ascension.
// Both scale with the share of the ranch's trees/shrubs cleared (B106 clears are permanent, so this is a finite
// progression; clears made before B168 count). Strengths in B168_K at a full clear, tuned by seeded sweeps against an
// equal rival: all 60 shrubs ~58%, all 28 trees ~60%, both ~78% (Brain tier-ceiling tension: help, don't decide).
const B168_K={guardDrain:.6,guardBlock:.6,ascTime:1.2,ascDmg:.06};
function labourB168(){
 let trees=0,shrubs=0,tTot=0,sTot=0;
 for(const o of B106_OBSTACLES){if(o.tree){tTot++;if(ranchB99.cleared?.[o.id])trees++}else{sTot++;if(ranchB99.cleared?.[o.id])shrubs++}}
 return{trees,shrubs,tTot,sTot,tf:tTot?trees/tTot:0,sf:sTot?shrubs/sTot:0};
}
function labourLinesB168(l=labourB168()){
 return[`${l.shrubs}/${l.sTot} shrubs cut: Guard drains ${Math.round(B168_K.guardDrain*l.sf*100)}% slower, blocked hits hurt ${Math.round(B168_K.guardBlock*l.sf*100)}% less`,
  `${l.trees}/${l.tTot} trees felled: Ascension lasts ${(B168_K.ascTime*l.tf).toFixed(1)} s longer and hits ${Math.round(B168_K.ascDmg*l.tf*100)}% harder`];
}
const pipEntrantBeforeB168=pipEntrantB163;
pipEntrantB163=function(...a){const e=pipEntrantBeforeB168(...a),l=labourB168();e.labour={tf:l.tf,sf:l.sf};return e};
function labB168(f,k){return f?.src?.labour?.[k]||0}
const shotDamageBeforeB168=shotDamageB163;
shotDamageB163=function(f,homing){return shotDamageBeforeB168(f,homing)*(f.ascT>0?1+B168_K.ascDmg*labB168(f,'tf'):1)};
const landShotBeforeB168=landShotB163;
landShotB163=function(f,s){
 const def=s.from?f.a:f.b,before=def.hp,guarded=def.guarding,r=landShotBeforeB168(f,s),sf=labB168(def,'sf');
 if(s.hit&&guarded&&sf>0&&def.hp<before)def.hp+=(before-def.hp)*B168_K.guardBlock*sf;
 return r;
};
const stepFightBeforeB168=stepFightB163;
stepFightB163=function(f,cmdA,cmdB){
 const pre=[f.a,f.b].map(m=>({asc:m.cmdUse.ascend,guarding:m.guarding}));
 const r=stepFightBeforeB168(f,cmdA,cmdB);
 [f.a,f.b].forEach((m,i)=>{
  const tf=labB168(m,'tf');if(tf>0&&m.cmdUse.ascend>pre[i].asc&&m.ascT>0){const heat=m.ascDrain*m.ascT;m.ascT+=B168_K.ascTime*tf;m.ascDrain=heat/m.ascT}
  const sf=labB168(m,'sf');if(sf>0&&m.guarding&&pre[i].guarding)m.glow=Math.min(1,m.glow+B163_DT/4*B168_K.guardDrain*sf);
 });
 return r;
};
// Shown where it matters: the Colosseum sheet, the intro card, each tree/shrub's sheet, and the tutorial.
const openSheetBeforeB168=openSheetB100;
openSheetB100=function(title,text,options,...rest){
 if(typeof text==='string'){
  if(title==='Colosseum ⚔'&&/single elimination/.test(text))text+=` Ranch work: ${labourLinesB168().join('; ')}.`;
  else if(/^A (tree|shrub) blocks the way/.test(text))text+=/^A tree/.test(text)?' Every tree felled makes Pip\'s Ascension stronger in the Colosseum.':' Every shrub cut makes Pip\'s Guard sturdier in the Colosseum.';
 }
 return openSheetBeforeB168(title,text,options,...rest);
};
const drawColBeforeB168=drawColB163;
drawColB163=function(){
 drawColBeforeB168();
 const c=colB163,f=c.fight;if(!f||c.phase!=='intro')return;
 const l=f.a.src.labour;if(!l||(!l.tf&&!l.sf))return;
 const narrow=W<560,y=ringB165().cy+(f.a.src.perks&&Object.values(f.a.src.perks).some(v=>v>0)?100:80),n=labourB168();
 X.fillStyle='#000000b0';X.fillRect(0,y-15,W,22);X.textAlign='center';X.fillStyle='#cdbf9f';X.font=`italic ${narrow?11:13}px ${B165_SERIF}`;
 X.fillText(`Ranch work: ${n.shrubs}/${n.sTot} shrubs cut (Guard) · ${n.trees}/${n.tTot} trees felled (Ascension)`,W/2,y,W-24);
};
{const l=B164_STEPS.find(s=>s.title==='Training matters');if(l){const base=Object.getOwnPropertyDescriptor(l,'say').get;Object.defineProperty(l,'say',{configurable:true,get(){return`${base.call(l)} Ranch work counts too: shrubs you cut make Guard sturdier, trees you fell make Ascension stronger.`}})}}
