function runFocusedChecksB165(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}};
 // A standard-mapping pad: 0 A, 1 B, 2 X, 3 Y, 8 Select, 9 Start, 12/13 d-pad up/down.
 const pad={connected:true,index:0,id:'Test pad (STANDARD GAMEPAD)',mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};
 const getPadsBefore=navigator.getGamepads;navigator.getGamepads=()=>[pad];
 const hold=(i,on)=>{pad.buttons[i]={pressed:on,value:on?1:0}};
 const frame=()=>{updateGamepadInput();update(1/60);draw()},frames=n=>{for(let i=0;i<n;i++)frame()};
 const tap=i=>{hold(i,true);frames(2);hold(i,false);frames(2)};
 const buttons=()=>[...document.querySelectorAll('#ranchSheetB100 button')].map(b=>b.textContent);
 const end=()=>{closeSheetB100();if(colB163.active){colB163={active:false};document.body.classList.remove('colB163')}};
 const fresh=()=>{end();ranchB99.fatigue=0;ranchB99.rankUnlocked=1;colSaveB163.tutorial=true;colSaveB163.revealed=true;keys.clear();for(let i=0;i<17;i++)hold(i,false);pad.axes=[0,0,0,0];enterRanchB100();frames(3)};
 const toFight=()=>{startColosseumB163(0);frames(170);assert(colB163.phase==='fight','not fighting: '+colB163.phase)};
 test('B165 pad A Focus, X Ascend, hold B Guard all reach Pip in a bracket fight',()=>{
  fresh();toFight();const f=colB163.fight;
  tap(0);assert(f.a.cmdUse.focus===1,'A did not Focus');
  f.a.heat=80;f.a.ascT=0;tap(2);assert(f.a.cmdUse.ascend===1&&f.a.ascT>0,'X did not Ascend');
  frames(Math.ceil(f.a.ascT*60)+5);f.a.glow=1;f.a.broken=0;hold(1,true);frames(3);assert(f.a.guarding,'B did not Guard');hold(1,false);frames(2);assert(!f.a.guarding,'Guard stuck after release');
  end();
 });
 test('B165 Select does not open the Bag mid-fight; Start pauses and resumes',()=>{
  fresh();toFight();tap(8);assert(!ranchWorldB100.sheet&&colB163.phase==='fight','Select opened a sheet');
  tap(9);assert(colB163.phase==='paused'&&/Paused/.test($('ranchSheetB100').textContent),'Start did not pause');
  const t=colB163.fight.t;frames(60);assert(colB163.fight.t===t,'fight ran while paused');
  tap(9);assert(colB163.phase==='fight'&&!ranchWorldB100.sheet,'Start did not resume');
  tap(9);tap(0);assert(colB163.phase==='fight','A on Resume did not resume');assert(colB163.fight.a.cmdUse.focus===0,'the Resume press also fired Focus');
  tap(9);tap(1);assert(colB163.phase==='fight','B did not close the pause');
  end();
 });
 test('B165 pause menu works with the d-pad: Leave the bracket counts as a loss',()=>{
  fresh();toFight();const stones=ranchB99.stones;tap(9);tap(13);tap(0);
  assert(!colB163.active&&ranchB99.stones===stones,'did not leave cleanly');assert(colSaveB163.best.E>=0,'save');
  end();
 });
 test('B165 between rounds: d-pad and A pick Catch his breath',()=>{
  fresh();toFight();colB163.fight.b.hp=-1e6;frames(200);assert(colB163.phase==='between'&&/next$/.test($('ranchSheetB100').querySelector('h3').textContent),'no between sheet');
  const fat=ranchB99.fatigue;tap(13);tap(0);assert(colB163.active&&colB163.phase==='intro','did not start the next fight');
  assert(ranchB99.fatigue===Math.max(0,fat-Math.ceil(fatigueMaxB118()*B163_CATCH_BREATH))+fightFatigueB163(),'breath not taken');
  end();
 });
 test('B165 the tutorial completes on a gamepad, and its prompts name pad buttons',()=>{
  fresh();colSaveB163.tutorial=false;startTutorialB164();frames(170);
  assert(/Press A/.test(B164_STEPS[0].say),'prompt: '+B164_STEPS[0].say);tap(0);assert(colB163.tutorial.step===1,'A');
  assert(/Press X/.test(B164_STEPS[1].say),'prompt 2');tap(2);assert(colB163.tutorial.step===2,'X');
  hold(1,true);let n=0;while(colB163.tutorial?.step===2&&n++<900)frame();hold(1,false);assert(colB163.tutorial?.step===3,'B');
  frames(240);assert(!colB163.active&&colSaveB163.tutorial,'not finished');
  end();
 });
 test('B165 the Colosseum station opens and starts a bracket with the pad',()=>{
  fresh();inputDevB165='keys';const st=B100_STATIONS.find(s=>s.id==='colosseum'),w=ranchWorldB100;w.px=st.x;w.py=st.y+40;frames(2);
  tap(0);assert(/Colosseum/.test($('ranchSheetB100').querySelector('h3')?.textContent||''),'A at the building did not open it');
  assert($('ranchSheetB100').classList.contains('b165'),'sheet not in the Colosseum style');
  assert(/A Focus, X Ascend/.test($('ranchSheetB100').textContent),'sheet does not name pad buttons');
  tap(0);assert(colB163.active,'A on the first bracket did not start');end();
 });
 test('B165 prompts follow the last device: keyboard and touch',()=>{
  window.dispatchEvent(new window.KeyboardEvent('keydown',{key:'Shift'}));assert(/Press Space/.test(B164_STEPS[0].say),B164_STEPS[0].say);
  const e=new window.Event('pointerdown');e.pointerType='touch';window.dispatchEvent(e);assert(/Tap FOCUS/.test(B164_STEPS[0].say)&&/Hold GUARD/.test(B164_STEPS[2].say),B164_STEPS[0].say);
 });
 test('B165 every phase draws in the new style without errors',()=>{
  fresh();startColosseumB163(0);draw();frames(170);colB163.fight.a.heat=80;tap(2);frames(30);tap(9);draw();tap(9);colB163.fight.b.hp=-1e6;frames(3);draw();assert(colB163.phase==='after','not after: '+colB163.phase+' '+colB163.fight.done+' '+colB163.fight.b.hp);end();
  startTutorialB164();frames(170);draw();end();
 });
 test('B165 war drums replace the ranch tune during a Colosseum fight',()=>{
  fresh();let voices=0;const engine={ctx:{currentTime:10},music:{},voice(){voices++}},audio=S.audioEnabled;S.audioEnabled=true;
  startColosseumB163(0);PipAudioEngine.prototype.scheduleStep.call(engine,10.5);assert(engine.b165Step>0&&voices>0,'no Colosseum music');assert(!Number.isFinite(engine.b103Next),'ranch tune scheduled too');
  end();S.audioEnabled=audio;
 });
 navigator.getGamepads=getPadsBefore;
 return out;
}
