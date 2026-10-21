function runFocusedChecksB164(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}};
 const st=()=>B100_STATIONS.find(s=>s.id==='colosseum'),buttons=()=>[...document.querySelectorAll('#ranchSheetB100 button')].map(b=>b.textContent);
 const frames=(n,fn)=>{for(let i=0;i<n;i++){fn&&fn(i);update(1/60)}};

 // Plays the B166 lesson list with one device's inputs; returns the lesson titles in the order they were completed.
 const driveB166=(press,hold,frames)=>{
  const done=[];let guard=0;
  while(colB163.active&&colB163.tutorial&&guard++<400){
   const tu=colB163.tutorial,s=tu.step,l=B164_STEPS[s];
   if(colB163.phase!=='fight'){frames(10);continue}
   frames(25);
   if(l.kind==='info'||l.title==='Focus')press('focus');
   else if(l.title==='Ascend')press('ascend');
   else if(l.title==='Guard'||l.title==='Guard breaks'){hold(true);let k=0;while(colB163.tutorial?.step===s&&k++<1500)frames(1);hold(false)}
   else if(l.title==='Strike the broken guard'){let k=0;while(!(colB163.fight.b.broken>0)&&k++<1500)frames(1);press('focus')}
   else {let k=0;while(colB163.tutorial?.step===s&&k++<3600)frames(1)}
   if(!colB163.tutorial||colB163.tutorial.step!==s)done.push(l.title);else throw Error('stuck on lesson '+(s+1)+': '+l.title);
  }
  return done;
 };
 const fresh=()=>{colB163={active:false};closeSheetB100();ranchB99.fatigue=0;ranchB99.rankUnlocked=1;colSaveB163.tutorial=false;colSaveB163.revealed=true;keys.clear();enterRanchB100()};
 test('B164 the Colosseum is its own building, clear of other stations and trees',()=>{
  const c=st();assert(c,'no station');
  for(const s of B100_STATIONS)if(s!==c&&!s.noPath&&s.plot==null&&!s.obstacle)assert(Math.hypot(s.x-c.x,s.y-c.y)>c.r+s.r,'overlaps '+s.id);
  for(const [x,y] of B100_TREES)assert(Math.hypot(x-c.x,y-c.y)>c.r+30,'tree at '+x+','+y);
  assert(c.x>40&&c.x<B100_WORLD.w-40&&c.y>40&&c.y<B100_WORLD.h-40,'outside the fence');
 });
 test('B164 the Arena gate no longer lists the Colosseum',()=>{
  fresh();interactStationB100(B100_STATIONS.find(s=>s.id==='gate'));assert(buttons().length&&!buttons().some(t=>/Colosseum/.test(t)),buttons().join('|'));closeSheetB100();
 });
 test('B164 locked until rank D, and the sheet says how to open it',()=>{
  fresh();ranchB99.rankUnlocked=0;interactStationB100(st());
  const p=$('ranchSheetB100').textContent;assert(/🔒/.test(p)&&/rank D/.test(p)&&/stage 5/.test(p),p);assert(!buttons().some(t=>/tutorial|bracket/i.test(t)),'locked sheet offers play');closeSheetB100();
 });
 test('B164 opening reveals once',()=>{
  fresh();colSaveB163.revealed=false;ranchB99.rankUnlocked=0;updateRanchB100(1/60);assert(!colSaveB163.revealed,'revealed while locked');
  ranchB99.rankUnlocked=1;updateRanchB100(1/60);assert(colSaveB163.revealed&&/Colosseum is open/.test($('ranchToastB100').textContent),'no reveal');
  ranchToastB100('x');updateRanchB100(1/60);assert($('ranchToastB100').textContent==='x','revealed twice');
 });
 test('B164 first visit offers the tutorial; skipping opens the brackets with a practice option',()=>{
  fresh();interactStationB100(st());assert(buttons().some(t=>/Start the tutorial/.test(t))&&buttons().some(t=>/Skip/.test(t)),buttons().join('|'));
  [...document.querySelectorAll('#ranchSheetB100 button')].find(b=>/Skip/.test(b.textContent)).click();
  assert(colSaveB163.tutorial,'skip not saved');assert(buttons().some(t=>/Rank E bracket/.test(t))&&buttons().some(t=>/Practise with Sprout/.test(t)),buttons().join('|'));closeSheetB100();
 });
 test('B166 tutorial: every lesson completes through real keyboard input, and drills wait for Pip',()=>{
  fresh();const fat=ranchB99.fatigue,stones=ranchB99.stones;startTutorialB164();frames(160);
  assert(colB163.phase==='fight'&&B164_STEPS[colB163.tutorial.step].kind==='info','not on the welcome card');
  const t=colB163.fight.t;frames(120);assert(colB163.fight.t===t&&colB163.tutorial.step===0,'info card did not freeze the fight');
  // a drill doesn't finish by waiting
  const kb={focus:()=>{keys.add(' ');frames(2);keys.delete(' ');frames(2)},ascend:()=>{window.dispatchEvent(new window.KeyboardEvent('keydown',{key:'x'}));frames(2)}};
  kb.focus();frames(25);kb.focus();frames(5);assert(B164_STEPS[colB163.tutorial.step].title==='Focus','not at the Focus drill');frames(400);assert(B164_STEPS[colB163.tutorial.step].title==='Focus','Focus drill finished with no input');
  const order=driveB166(k=>kb[k](),on=>on?keys.add('b'):keys.delete('b'),frames);
  assert(!colB163.active&&colSaveB163.tutorial,'tutorial did not finish');
  assert(order.length===B164_STEPS.length-2&&order[0]==='Focus'&&order.includes('Strike the broken guard')&&order.includes('Finish it'),order.join(' > '));
  assert(ranchB99.fatigue===fat&&ranchB99.stones===stones,'tutorial cost fatigue or paid stones');
  assert(buttons().some(t=>/bracket/.test(t)),'brackets not offered after the tutorial');closeSheetB100();
 });
 test('B166 tutorial completes through the touch buttons too',()=>{
  fresh();startTutorialB164();const w=ranchWorldB100;frames(160);
  const order=driveB166(k=>{if(k==='focus')w.touchTap=true;else w.b109XTap=true;frames(2)},on=>{w.colGuardTouch=on},frames);
  assert(!colB163.active&&order.length===B164_STEPS.length,'did not finish: '+order.join(' > '));closeSheetB100();
 });
 test('B166 lessons cover the rules, not just the buttons',()=>{
  const all=B164_STEPS.map(l=>l.title+' '+l.say).join(' ');
  for(const w of ['HP','HEAT','70%','Guard stamina','clock','quarter','breaks','knockout','Star Power','Guardian Glow','Swift Pip','Heart Sense','fatigue','Heart Stones','pauses'])assert(all.includes(w),'missing: '+w);
 });
 test('B164 a press on a frame that runs no sim step is not lost',()=>{
  fresh();startTutorialB164();frames(160);
  while(B164_STEPS[colB163.tutorial.step].kind==='info'){frames(25);keys.add(' ');frames(2);keys.delete(' ');frames(2)}
  const s0=colB163.tutorial.step;assert(B164_STEPS[s0].title==='Focus','not at Focus');colB163.acc=0;
  keys.add(' ');update(.001);keys.delete(' ');update(.001);assert(colB163.tutorial.step===s0,'consumed without a step');frames(2);assert(colB163.tutorial.step===s0+1,'press lost');
  colB163={active:false};document.body.classList.remove('colB163');
 });
 test('B164 tutorial flags save with the Colosseum save',()=>{
  colSaveB163.tutorial=true;colSaveB163.revealed=true;saveColB163();const raw=JSON.parse(localStorage.getItem(B163_KEY));assert(raw.tutorial===true&&raw.revealed===true,JSON.stringify(raw));
 });
 return out;
}
