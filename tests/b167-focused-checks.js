function runFocusedChecksB167(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}};
 const ev=perks=>({name:'p',stats:{range:10,speed:10,power:10,guard:10},asc:2,ai:'patient',perks});
 const coach=f=>aiCmdB163(f.a,f.b,f.t);
 const wr=(perks,n=80)=>{let w=0;for(let s=1;s<=n;s++)if(runFightB163(ev(perks),ev(null),s,coach).winner===0)w++;return w/n};
 const saved={...ascB133};
 test('B167 Pip carries his arena Ascensions into the ring (clamped 0-5)',()=>{
  Object.assign(ascB133,{beam:3,storm:0,guardian:9,nova:-2,gravity:1});const p=pipEntrantB163().perks;
  assert(p.beam===3&&p.guardian===5&&p.nova===0&&p.gravity===1,JSON.stringify(p));
  for(let i=0;i<7;i++)assert(!rivalB163(2,i).perks,'rival has perks');
 });
 test('B167 with no Ascensions a fight is exactly as before',()=>{
  for(let s=1;s<=10;s++){const a=runFightB163(ev({beam:0,storm:0,guardian:0,nova:0,gravity:0}),ev(null),s,coach),b=runFightB163(ev(undefined),ev(null),s,coach);assert(a.winner===b.winner&&a.t===b.t&&a.a.hp===b.a.hp&&a.b.hp===b.b.hp,'seed '+s+' differs')}
 });
 test('B167 each perk changes its own move',()=>{
  const f=fightB163(ev({beam:5,nova:5,gravity:5}),ev(null),1),g=fightB163(ev({}),ev(null),1);
  assert(shotDamageB163(f.a,true)>shotDamageB163(g.a,true)&&shotDamageB163(f.a,false)===shotDamageB163(g.a,false),'beam');
  f.a.ascT=g.a.ascT=2;assert(shotDamageB163(f.a,false)>shotDamageB163(g.a,false),'nova');
  assert(senseB163(f.a)>senseB163(g.a),'gravity');
  stepFightB163(f,{focus:true},{});stepFightB163(g,{focus:true},{});assert(f.a.focusCd<g.a.focusCd,'beam recharge');
  const h=fightB163(ev({guardian:5}),ev(null),1),k=fightB163(ev({}),ev(null),1);for(let i=0;i<60;i++){stepFightB163(h,{guard:true},{});stepFightB163(k,{guard:true},{})}assert(h.a.glow>k.a.glow,'guardian drain');
  let arcs=0;for(let s=1;s<=20;s++)arcs+=runFightB163(ev({storm:5}),ev(null),s,coach).events.filter(e=>e.kind==='arc').length;assert(arcs>0,'storm never arced');
 });
 test('B167 perks help but do not decide fights alone',()=>{
  const base=wr({});
  for(const id of Object.keys(B167_PERKS)){const r=wr({[id]:5});assert(r>base&&r<=.72,`${id} at 5 wins ${r} (base ${base})`)}
  const all=wr({beam:5,storm:5,guardian:5,nova:5,gravity:5});assert(all>=.8&&all<=.97,'all 25 wins '+all);
 });
 test('B167 the Colosseum sheet lists the perks, or says how to get them',()=>{
  ranchB99.fatigue=0;ranchB99.rankUnlocked=1;colSaveB163.tutorial=true;for(const id in ascB133)ascB133[id]=0;colosseumSheetB164();
  assert(/Ascend skills in the arena/.test($('ranchSheetB100').textContent),'no hint');closeSheetB100();
  ascB133.beam=2;ascB133.storm=1;colosseumSheetB164();const t=$('ranchSheetB100').textContent;assert(/Beam ✦2: Focus \+1\.6% damage/.test(t)&&/Thunderstorm ✦1/.test(t),t);closeSheetB100();
 });
 test('B167 the tutorial mentions the perks, and arcs draw without errors',()=>{
  assert(/Ascend in the arena give Pip perks/.test(B164_STEPS.find(l=>l.title==='Training matters').say),'tutorial');
  ascB133.storm=5;startColosseumB163(0);for(let i=0;i<900&&colB163.active&&colB163.phase!=='after';i++){update(1/60);draw()}colB163={active:false};document.body.classList.remove('colB163');closeSheetB100();
 });
 Object.assign(ascB133,saved);
 return out;
}
