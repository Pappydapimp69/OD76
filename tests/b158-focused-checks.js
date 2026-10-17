function runFocusedChecksB158(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{closeSheetB100()}};
 const fresh=o=>{ranchB99=Object.assign(ranchDefaultB99(),o);ensurePointsB100(ranchB99);syncCapsB102();ranchB99.fuse={startedAt:0,queue:0};saveRanchB99();openRanchB99()};
 const el=()=>$('ranchSheetB100'),card=k=>el().querySelector(`.b158card.${k}`),shown=n=>!!n&&n.style.display!=='none';
 test('B158 the refinery sheet is cards, with each button in its job card and Back last',()=>{
  fresh({hearts:230,dust:12,starStones:9});const f=ranchB99.refinery;f.trayStones=3;f.trayDust=1;refinerySheetB102();
  assert(el().classList.contains('b158')&&el().querySelector('h3').textContent==='Heart Refinery','not decorated');
  assert(card('tray').querySelector('button').textContent==='Collect','collect');
  assert([...card('refine').querySelectorAll('button')].map(b=>b.textContent).join('|')==='Refine ♥ 50 → ◆ 1|Refine all · ♥ 200 → ◆ 4','refine: '+card('refine').textContent);
  assert([...card('fuse').querySelectorAll('button')].length===2&&/^Upgrade → Lv 2 · ★ 1$/.test(card('upgrade').querySelector('button').textContent),'fuse/upgrade');
  const btns=[...el().querySelectorAll('button')],labels=ranchWorldB100.sheet.options.map(o=>o.label);
  assert(btns.length===labels.length&&/Back/.test(btns.at(-1).textContent)&&/Back/.test(labels.at(-1)),'order');
  assert(/♥ 230/.test(el().querySelector('.b158wallet').textContent)&&/Lv 1\/6/.test(el().querySelector('.b158badge').textContent),'header');
 });
 test('B158 clicks still run the matching option after the move',()=>{
  fresh({hearts:100});refinerySheetB102();card('refine').querySelector('button').click();assert(ranchB99.refinery.queue===1&&ranchB99.hearts===50,'refine click');
 });
 test('B158 short of hearts, dust or stars the card says why',()=>{
  fresh({hearts:30,dust:2,starStones:0});refinerySheetB102();
  assert(shown(card('refine').querySelector('.b158need'))&&/Needs ♥ 50 · you have ♥ 30/.test(card('refine').textContent),'hearts');
  assert(/Needs ✧ 5 · you have ✧ 2/.test(card('fuse').textContent)&&/Needs ★ 1 · you have ★ 0/.test(card('upgrade').textContent),'dust/stars');
  assert(!shown(card('tray')),'empty tray shown');
 });
 test('B158 running jobs show live bars and the next other sheet is plain again',()=>{
  fresh({hearts:200,dust:5,starStones:5});loadHeartsB102(2);startFuseB156(1);upgradeRefineryB102();refinerySheetB102();
  assert(/Next ◆ in/.test(card('refine').textContent)&&/Next ★ in/.test(card('fuse').textContent)&&/Ready in/.test(card('upgrade').textContent),'timers: '+el().textContent);
  assert(shown(card('upgrade').querySelector('.b158bar'))&&!card('upgrade').querySelector('button'),'upgrade bar');
  closeSheetB100();interactStationB100(stationB100('home'));assert(!el().classList.contains('b158')&&el().querySelector('p').offsetParent!==undefined,'class leaked');
 });
 test('B158 the open sheet redraws when a stone lands, keeping focus',()=>{
  fresh({hearts:100});loadHeartsB102(1);refinerySheetB102();focusSheetB100(1);
  const f=ranchB99.refinery;f.startedAt-=refineSecondsB102(1)*1000+1;f.lag=[0];updateRanchB100(.3);
  assert(card('tray')&&shown(card('tray'))&&/◆ 1/.test(card('tray').textContent),'no redraw: '+el().textContent);assert(ranchWorldB100.sheet.focus===1,'focus');
 });
 return out;
}
