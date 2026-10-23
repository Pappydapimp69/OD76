async function runFocusedChecksB175(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},tick=()=>new Promise(r=>setTimeout(r,0));
 const test=async(name,fn)=>{try{await fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}};
 const vis=()=>['emotionStep','abilityStep','pipSoundStep','overdriveStep','bossRewardStep','ranchGateStepB99'].filter(id=>!$(id).classList.contains('stagehidden'));
 const clear=async o=>{stageInputLockMsB117i=0;reset();startBattleTestB99();$('ranchGateStepB99').classList.add('stagehidden');Object.assign(S,{stage:3,prismSeeds:0,heartCurrency:0,musicNotes:0,starPoints:0,bossRewardPending:false},o);openStageUpgrade();await tick();decorateStageB136();decorateSkipsB175()};
 await test('B175 nothing to buy: straight to Head out, all three listed with Peek',async()=>{
  await clear();assert(vis().join()==='ranchGateStepB99','vis '+vis());
  const t=$('b175Saving').textContent;assert(/Traits◆ 1 · 1 more/.test(t)&&/Hearts♥ 5 · 5 more/.test(t)&&/Sound Lab♪ 0/.test(t)&&$('b175Saving').querySelectorAll('.b175Peek').length===3,t);
 });
 await test('B175 an affordable page shows, counts only shown pages and says what was skipped',async()=>{
  await clear({heartCurrency:10});assert(vis().join()==='abilityStep','vis '+vis());
  assert(/Step 1 of 3 · Hearts/.test($('stageUp').querySelector('.card > .kicker').textContent),$('stageUp').querySelector('.card > .kicker').textContent);
  assert(/Skipped Traits, nothing to buy yet/.test($('abilityStep').querySelector('.b175Note').textContent),'note');
 });
 await test('B175 Peek opens the page look-only; Back returns to Head out',async()=>{
  await clear();$('b175Saving').querySelector('[data-page="abilityStep"]').click();await tick();
  assert(vis().join()==='abilityStep'&&$('abilityStep').classList.contains('b175Peeking')&&$('b175Back'),'peek '+vis());
  $('b175Back').click();await tick();assert(vis().join()==='ranchGateStepB99'&&!$('b175Back'),'back '+vis());
 });
 await test('B175 boss clear with no stars skips Overdrive; Boss Bond still shows',async()=>{
  await clear({bossRewardPending:true});assert(vis().join()==='bossRewardStep','vis '+vis());
  assert(/Skipped Overdrive/.test($('bossRewardStep').querySelector('.b175Note')?.textContent||''),'note');
 });
 await test('B175 a merchant stage with too few hearts skips the shop',async()=>{
  await clear({stage:B118_MERCHANT_FIRST,heartCurrency:3});assert(vis().join()==='ranchGateStepB99','vis '+vis());
  assert(/Merchant♥ \d+ · \d+ more/.test($('b175Saving').textContent),$('b175Saving').textContent);
 });
 return out;
}
