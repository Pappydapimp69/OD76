function runFocusedChecksB131(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},near=(a,b,m,eps=1e-6)=>assert(Math.abs(a-b)<=eps,`${m}: ${a} != ${b}`),test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}};
 const fresh=()=>{ranchB99=Object.assign(ranchDefaultB99(),{fatigue:0});ensurePointsB100(ranchB99);syncCapsB102();saveRanchB99();reset();S.run=true;S.end=false;S.waveState='active'};
 const unlock=id=>{S.overUnlocked.add(id);S.overLevels[id]=1;masteryB131(id);applyMasteryB131()};
 const reward=()=>{S.stagePending=true;S.bossRewardPending=true};
 const ignite=id=>{S.overType=id;S.overdrives=(S.overdrives||0)+1;creditUsesB131()};
 test('B131 a fresh run starts Beam at level 1, tier 0, old Lv1 kit at 60% power and 85% reach',()=>{
  fresh();const m=masteryB131('beam');assert(m&&m.lv===1&&m.t===0&&m.u===0,'beam mastery');
  assert(overLevel('beam')===1,'feature level');near(powerMultB131('beam'),.6,'power');near(reachMultB131('beam'),.85,'reach');
  assert(igniteThresholdB131('beam')===25,'ignite 25%');
 });
 test('B131 uses count only for the equipped basic skill',()=>{
  fresh();unlock('nova');ignite('beam');ignite('beam');ignite('nova');S.overType='pip';S.overdrives++;creditUsesB131();
  assert(masteryB131('beam').u===2&&masteryB131('nova').u===1,'uses: '+masteryB131('beam').u+'/'+masteryB131('nova').u);
 });
 test('B131 a real Guardian ignition counts one use',()=>{
  fresh();unlock('guardian');S.overType='guardian';S.heat=80;const before=masteryB131('guardian').u;triggerOverdrive();update(.016);
  assert(masteryB131('guardian').u===before+1,'guardian ignition not counted');
 });
 test('B131 a tier needs both uses and stars, then unlocks the next old level',()=>{
  fresh();reward();S.starPoints=20;
  assert(!completeOverdriveHoldAction('beam')&&masteryB131('beam').t===0&&S.starPoints===20,'tier bought without a use');
  ignite('beam');assert(completeOverdriveHoldAction('beam')&&masteryB131('beam').t===1&&S.starPoints===18,'tier 1');
  S.starPoints=1;ignite('beam');assert(!completeOverdriveHoldAction('beam')&&masteryB131('beam').t===1,'tier bought without stars');
  S.starPoints=20;assert(completeOverdriveHoldAction('beam')&&masteryB131('beam').t===2&&overLevel('beam')===2,'tier 2 feature level');
 });
 test('B131 level-up needs all five tiers and ★10, restarts uses, keeps the full kit and lowers ignition 1%',()=>{
  fresh();reward();S.starPoints=100;const m=masteryB131('beam');m.u=10;
  for(let i=0;i<5;i++)assert(completeOverdriveHoldAction('beam'),'tier '+(i+1));
  assert(m.t===5&&overLevel('beam')===5,'L1 full mastery = old Lv5 kit');const stars=S.starPoints;
  assert(completeOverdriveHoldAction('beam')&&m.lv===2&&m.t===0&&m.u===0&&S.starPoints===stars-10,'level up');
  assert(overLevel('beam')===5&&igniteThresholdB131('beam')===24,'level 2 kit/ignite');
  m.lv=5;m.t=5;assert(igniteThresholdB131('beam')===21&&!completeOverdriveHoldAction('beam'),'L5 mastered');
  near(powerMultB131('beam'),1.4,'L5 power');near(reachMultB131('beam'),1.15,'L5 reach');assert(bonusB131('beam').sig===4,'L5 signature');
 });
 test('B131 every tier 3 speeds HEAT regen by 0.1s per point',()=>{
  fresh();const base=heatRegenRateB115();masteryB131('beam').t=3;const cap=heatCapacityB38();
  near(heatRegenRateB115(),100/cap/2.9,'one tier 3');masteryB131('beam').lv=3;near(heatRegenRateB115(),100/cap/2.7,'two levels + tier 3');
  assert(base<heatRegenRateB115(),'regen did not speed up');
 });
 test('B131 skill hits scale with mastery power, other hits do not',()=>{
  fresh();S.overType='nova';unlock('nova');const mk=()=>({type:'chaser',dead:false,x:P.x+400,y:P.y,r:12,hp:100,maxHp:100});
  const a=mk();enemies.push(a);hitEnemy(a,10,'overdrive');const lossSkill=100-a.hp;
  const b=mk();enemies.push(b);hitEnemy(b,10,'sound');const lossOther=100-b.hp;
  assert(lossSkill>0&&lossOther>0,'no damage dealt');near(lossSkill/lossOther,.6,'skill hit not at 60%',.02);
 });
 test('B131 Nova: one wave and no screen hit until level 1 tiers 3 and 5',()=>{
  fresh();unlock('nova');S.overType='nova';releaseNovaB94(1,overLevel('nova'));
  assert(S.b94NovaWaves.length===1&&!S.b94NovaWaves[0].screen,'L1T0 nova too strong');
  const m=masteryB131('nova');m.t=5;applyMasteryB131();releaseNovaB94(1,overLevel('nova'));
  assert(S.b94NovaWaves.length===3&&S.b94NovaWaves.every(w=>w.screen),'L1T5 nova missing waves/screen');
  m.lv=3;m.t=5;applyMasteryB131();releaseNovaB94(1,overLevel('nova'));assert(S.b94NovaWaves.length===5,'signature waves: '+S.b94NovaWaves.length);
 });
 test('B131 Gravity mass cap and Guardian reflect grow with the signature bump',()=>{
  fresh();unlock('gravity');unlock('guardian');assert(gravityMassCapB131()===20,'base mass cap');
  masteryB131('gravity').lv=3;masteryB131('gravity').t=5;assert(gravityMassCapB131()===30,'mass cap +5 per signature');
  const m=masteryB131('guardian');m.lv=2;m.t=5;applyMasteryB131();near(B117G_REFLECT[2],1.25,'reflect +25%');near(B117G_PULSE[0].r,90*.925,'pulse reach');
  fresh();near(B117G_REFLECT[2],1,'reflect table not restored on reset');
 });
 test('B131 Pip Ascendant keeps its old upgrade path and still ignites',()=>{
  fresh();reward();S.starPoints=30;assert(completeOverdriveHoldAction('pip')&&S.overUnlocked.has('pip')&&!masteryB131('pip'),'pip unlock');
  const lv=overLevel('pip');assert(completeOverdriveHoldAction('pip')&&overLevel('pip')===lv+1,'pip upgrade');
  S.stagePending=false;S.bossRewardPending=false;S.overType='pip';S.heat=100;triggerOverdrive();
  assert((S.b58AscTime||0)>0||S.over>0,'pip did not ignite');
 });
 test('B131 the interim Overdrive cards show level, tier and the next step',()=>{
  fresh();reward();S.starPoints=5;openOverdriveStep();renderOverdriveStep();
  const t=$('overChoice0').textContent;assert(t.includes('Lv 1 · Tier 0/5')&&t.includes('USE IT 1 MORE'),'card: '+t.slice(0,160));
 });
 test('B131 a real Thunderstorm summon counts a use and the B117 stat',()=>{
  fresh();unlock('storm');S.overType='storm';S.heat=80;const n0=skillB117('storm').n;triggerOverdrive();update(.016);
  for(let i=0;i<200&&!(S.b93StormClouds?.length);i++)update(.02);
  assert(masteryB131('storm').u>=1&&skillB117('storm').n>n0,'storm use not counted: '+masteryB131('storm').u);
 });
 test('B131 ignition uses the per-skill threshold',()=>{
  fresh();unlock('guardian');S.overType='guardian';masteryB131('guardian').lv=4;applyMasteryB131();S.heat=22.5;
  assert(canIgniteOverdriveB38('guardian'),'level 4 guardian should ignite at 22%');masteryB131('guardian').lv=1;assert(!canIgniteOverdriveB38('guardian'),'level 1 guardian ignited under 25%');
 });
 return out;
}
