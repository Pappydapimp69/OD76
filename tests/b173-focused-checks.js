function runFocusedChecksB173(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{closeSheetB100()}};
 const fresh=o=>{ranchB99=Object.assign(ranchDefaultB99(),o);ensurePointsB100(ranchB99);syncCapsB102();ranchB99.fuse={startedAt:0,queue:0};saveRanchB99();openRanchB99()};
 const down=()=>window.dispatchEvent(new Event('pointerdown')),tap=b=>b.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,detail:1}));
 const btn=re=>[...$('ranchSheetB100').querySelectorAll('button')].find(b=>re.test(b.textContent));
 test('B173 the opening tap does not press Fuse all or Back',()=>{
  fresh({dust:20});down();interactStationB100(stationB100('refinery'));
  tap(btn(/Fuse all/));assert(!ranchB99.fuse.queue&&ranchB99.dust===20,'fuse all ran');
  tap(btn(/Back/));assert(ranchWorldB100.sheet,'sheet closed');
 });
 test('B173 a fresh tap after opening works',()=>{
  fresh({dust:20});down();interactStationB100(stationB100('refinery'));
  down();tap(btn(/Fuse all/));assert(ranchB99.fuse.queue===4,'fuse all blocked');
 });
 test('B173 keyboard/gamepad and code clicks pass',()=>{
  fresh({dust:20});down();interactStationB100(stationB100('refinery'));
  btn(/Fuse all/).click();assert(ranchB99.fuse.queue===4,'code click blocked');
 });
 test('B173 a refinery redraw keeps the sheet armed',()=>{
  fresh({dust:20});down();interactStationB100(stationB100('refinery'));
  down();refinerySheetB102();tap(btn(/Fuse all/));assert(ranchB99.fuse.queue===4,'redraw disarmed');
 });
 return out;
}
