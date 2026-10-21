function runFocusedChecksB168(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}};
 const ev=lab=>({name:'p',stats:{range:10,speed:10,power:10,guard:10},asc:2,ai:'patient',labour:lab});
 const coach=f=>aiCmdB163(f.a,f.b,f.t);
 const wr=(lab,n=80)=>{let w=0;for(let s=1;s<=n;s++)if(runFightB163(ev(lab),ev(null),s,coach).winner===0)w++;return w/n};
 const saved={...ranchB99.cleared};
 const clearAll=kind=>{for(const o of B106_OBSTACLES)if(kind==='all'||(kind==='trees')===!!o.tree)ranchB99.cleared[o.id]=true};
 test('B168 clears count, including ones made before this build',()=>{
  ranchB99.cleared={};let l=labourB168();assert(l.trees===0&&l.shrubs===0&&l.tTot>0&&l.sTot>0,'counts');
  clearAll('trees');l=labourB168();assert(l.tf===1&&l.sf===0,'trees');
  const p=pipEntrantB163();assert(p.labour.tf===1&&p.labour.sf===0,'Pip does not carry it');for(let i=0;i<7;i++)assert(!rivalB163(1,i).labour,'rival has it');
 });
 test('B168 shrubs strengthen Guard, trees strengthen Ascension',()=>{
  const h=fightB163(ev({sf:1}),ev(null),1),k=fightB163(ev({}),ev(null),1);for(let i=0;i<60;i++){stepFightB163(h,{guard:true},{});stepFightB163(k,{guard:true},{})}assert(h.a.glow>k.a.glow,'guard drain');
  const a=fightB163(ev({tf:1}),ev(null),1),b=fightB163(ev({}),ev(null),1);a.a.heat=b.a.heat=80;stepFightB163(a,{ascend:true},{});stepFightB163(b,{ascend:true},{});
  assert(a.a.ascT>b.a.ascT+1&&shotDamageB163(a.a,false)>shotDamageB163(b.a,false),'ascension');
  let hurtA=0,hurtB=0;for(const [m,lab] of [[0,{sf:1}],[1,{}]]){const f=fightB163(ev(lab),ev(null),2);f.a.guarding=true;const hp=f.a.hp;landShotB163(f,{from:1,hit:true,dmg:20,asc:false,homing:false});if(m===0)hurtA=hp-f.a.hp;else hurtB=hp-f.a.hp}assert(hurtA<hurtB,'blocked hits '+hurtA+' vs '+hurtB);
 });
 test('B168 with no clears a fight is exactly as before',()=>{
  for(let s=1;s<=8;s++){const a=runFightB163(ev({tf:0,sf:0}),ev(null),s,coach),b=runFightB163(ev(undefined),ev(null),s,coach);assert(a.winner===b.winner&&a.t===b.t&&a.a.hp===b.a.hp,'seed '+s)}
 });
 test('B168 ranch work helps but does not decide fights alone',()=>{
  const base=wr({}),s=wr({sf:1}),t=wr({tf:1}),both=wr({sf:1,tf:1});
  assert(s>base&&s<=.7&&t>base&&t<=.7,`shrubs ${s} trees ${t} base ${base}`);assert(both>=.65&&both<=.88,'both '+both);
 });
 test('B168 shown on the Colosseum sheet, each tree/shrub sheet, and the tutorial',()=>{
  ranchB99.cleared={};clearAll('trees');ranchB99.fatigue=0;ranchB99.rankUnlocked=1;colSaveB163.tutorial=true;colosseumSheetB164();
  const t=$('ranchSheetB100').textContent;assert(/Guard\s*0\/60\s*shrubs cut/.test(t)&&/Ascension\s*28\/28\s*trees felled/.test(t),t);closeSheetB100();
  ranchB99.cleared={};const tree=B106_OBSTACLES.find(o=>o.tree),shrub=B106_OBSTACLES.find(o=>!o.tree);
  obstacleSheetB106(tree.id);assert(/Ascension stronger in the Colosseum/.test($('ranchSheetB100').textContent),'tree sheet');closeSheetB100();
  obstacleSheetB106(shrub.id);assert(/Guard sturdier in the Colosseum/.test($('ranchSheetB100').textContent),'shrub sheet');closeSheetB100();
  assert(/shrubs you cut make Guard sturdier/.test(B164_STEPS.find(l=>l.title==='Training matters').say),'tutorial');
 });
 test('B168 the intro card draws without errors',()=>{ranchB99.cleared={};clearAll('all');startColosseumB163(0);draw();for(let i=0;i<30;i++){update(1/60);draw()}colB163={active:false};document.body.classList.remove('colB163');closeSheetB100()});
 ranchB99.cleared=saved;
 return out;
}
