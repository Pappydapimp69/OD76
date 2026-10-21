// B167 Arena Ascensions strengthen Pip in the Colosseum. Each basic Overdrive skill Ascended in the arena (B133, 0-5 per
// skill) gives Pip a small perk on the matching move in the ring, so arena play feeds the Colosseum without a flat power
// bump (rivals have no Ascensions; Brain tier-ceiling tension). Beam -> Focus, Thunderstorm -> Chain arcs, Guardian -> Guard,
// Nova -> Ascension, Gravity Well -> HEAT; strengths per level in B167_K, tuned by seeded sweeps against an equal rival:
// one skill at 5 wins ~56-62%, every skill at 2 ~68%, all 25 Ascensions ~90%.
// With no Ascensions a fight is identical to before (the Chain roll only uses the fight's random stream when Storm > 0).
const B167_K={beam:.008,beamCd:.06,storm:.006,stormDmg:.35,guardDrain:.1,guardBlock:.12,nova:.004,gravity:.007}; // per Ascension level; tuned by seeded sweeps
const pctB167=v=>`${+(v*100).toFixed(1)}%`;
const B167_PERKS={
 beam:{skill:'Beam',name:'Focus',line:l=>`Focus +${pctB167(B167_K.beam*l)} damage, recharges ${(B167_K.beamCd*l).toFixed(2)} s sooner`},
 storm:{skill:'Thunderstorm',name:'Chain',line:l=>`${pctB167(B167_K.storm*l)} of hits arc for +${pctB167(B167_K.stormDmg)}`},
 guardian:{skill:'Guardian',name:'Guard',line:l=>`Guard drains ${pctB167(B167_K.guardDrain*l)} slower, blocked hits hurt ${pctB167(B167_K.guardBlock*l)} less`},
 nova:{skill:'Nova',name:'Ascension',line:l=>`Ascended damage +${pctB167(B167_K.nova*l)}`},
 gravity:{skill:'Gravity Well',name:'HEAT',line:l=>`HEAT gain +${pctB167(B167_K.gravity*l)}`}
};
function arenaAscB167(){const p={};for(const id in B167_PERKS){const n=Math.floor(Number(typeof ascB133==='object'?ascB133[id]:0));p[id]=Number.isFinite(n)?clamp(n,0,5):0}return p}
function perkB167(f,id){return f?.src?.perks?.[id]||0}
function perkLinesB167(perks=arenaAscB167()){return Object.keys(B167_PERKS).filter(id=>perks[id]>0).map(id=>`${B167_PERKS[id].skill} ✦${perks[id]}: ${B167_PERKS[id].line(perks[id])}`)}

const pipEntrantBeforeB167=pipEntrantB163;
pipEntrantB163=function(...a){const e=pipEntrantBeforeB167(...a);e.perks=arenaAscB167();return e};
const shotDamageBeforeB167=shotDamageB163;
shotDamageB163=function(f,homing){return shotDamageBeforeB167(f,homing)*(homing?1+B167_K.beam*perkB167(f,'beam'):1)*(f.ascT>0?1+B167_K.nova*perkB167(f,'nova'):1)};
const senseBeforeB167=senseB163;
senseB163=function(f){return senseBeforeB167(f)*(1+B167_K.gravity*perkB167(f,'gravity'))};
const landShotBeforeB167=landShotB163;
landShotB163=function(f,s){
 const att=s.from?f.b:f.a,def=s.from?f.a:f.b,before=def.hp,guarded=def.guarding;
 const r=landShotBeforeB167(f,s);
 if(!s.hit)return r;
 const g=perkB167(def,'guardian');if(guarded&&g>0&&def.hp<before)def.hp+=(before-def.hp)*B167_K.guardBlock*g;
 const st=perkB167(att,'storm');if(st>0&&f.rng()<B167_K.storm*st){def.hp-=s.dmg*B167_K.stormDmg;f.events.push({t:f.t,kind:'arc',side:att.side})}
 return r;
};
const stepFightBeforeB167=stepFightB163;
stepFightB163=function(f,cmdA,cmdB){
 const pre=[f.a,f.b].map(m=>({focus:m.cmdUse.focus,guarding:m.guarding}));
 const r=stepFightBeforeB167(f,cmdA,cmdB);
 [f.a,f.b].forEach((m,i)=>{
  const b=perkB167(m,'beam');if(b>0&&m.cmdUse.focus>pre[i].focus)m.focusCd=Math.max(0,m.focusCd-B167_K.beamCd*b);
  const g=perkB167(m,'guardian');if(g>0&&m.guarding&&pre[i].guarding)m.glow=Math.min(1,m.glow+B163_DT/4*B167_K.guardDrain*g);
 });
 return r;
};

// ---- show it: the Colosseum sheet lists Pip's perks; the intro card names them; a Chain arc draws as lightning ----
const openSheetBeforeB167=openSheetB100;
openSheetB100=function(title,text,options,...rest){
 if(title==='Colosseum ⚔'&&typeof text==='string'&&/single elimination/.test(text)){
  const lines=perkLinesB167();text+=lines.length?` Arena Ascensions: ${lines.join('; ')}.`:' Ascend skills in the arena to give Pip perks here.';
 }
 return openSheetBeforeB167(title,text,options,...rest);
};
const drawColBeforeB167=drawColB163;
drawColB163=function(){
 drawColBeforeB167();
 const c=colB163,f=c.fight;if(!f)return;
 c.b167Seen=c.b167Seen||0;c.b167Arcs=c.b167Arcs||[];if(c.b167Fight!==f){c.b167Fight=f;c.b167Seen=0;c.b167Arcs=[]}
 for(;c.b167Seen<f.events.length;c.b167Seen++)if(f.events[c.b167Seen].kind==='arc')c.b167Arcs.push({side:f.events[c.b167Seen].side,t:.22});
 const g=ringB165(),pa=fighterPosB165(f.a,g),pb=fighterPosB165(f.b,g);
 X.save();X.globalCompositeOperation='lighter';X.strokeStyle='rgba(170,210,255,.95)';X.lineWidth=3;
 for(const a of c.b167Arcs){a.t-=1/60;const from=a.side?pb:pa,to=a.side?pa:pb;X.beginPath();X.moveTo(from.x,from.y);for(let k=1;k<6;k++){const q=k/6;X.lineTo(from.x+(to.x-from.x)*q+(Math.random()-.5)*18,from.y+(to.y-from.y)*q+(Math.random()-.5)*18)}X.lineTo(to.x,to.y);X.stroke()}
 X.restore();c.b167Arcs=c.b167Arcs.filter(a=>a.t>0);
 if(c.phase==='intro'){const lines=perkLinesB167(f.a.src.perks||{});if(lines.length){const narrow=W<560;X.textAlign='center';X.fillStyle='#e2b866';X.font=`italic ${narrow?11:13}px ${B165_SERIF}`;X.fillText(`Pip's arena Ascensions: ${Object.keys(B167_PERKS).filter(id=>f.a.src.perks[id]>0).map(id=>`${B167_PERKS[id].name} ✦${f.a.src.perks[id]}`).join(' · ')}`,W/2,ringB165().cy+80,W-24)}}
};
// The tutorial's "Training matters" card mentions the perks.
{const l=B164_STEPS.find(s=>s.title==='Training matters');if(l){const base=Object.getOwnPropertyDescriptor(l,'say').get;Object.defineProperty(l,'say',{configurable:true,get(){return`${base.call(l)} Skills you Ascend in the arena give Pip perks here too.`}})}}
