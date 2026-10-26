// B182 browser check: real touch taps (CDP Input.dispatchTouchEvent) on the ranch action button at the refinery.
// Needs playwright-core and Chromium (PLAYWRIGHT_BROWSERS_PATH) plus `npm run dev` serving 127.0.0.1:8176. Expect every
// run that opened the sheet to keep it open after the lift; without b21-194.js the lift's click closes it (detail 0).
// Note: every other run may not open (the A button needs a release frame after the previous sheet); that is the harness.
const {chromium}=require('playwright-core');
(async()=>{
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined});
 const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const p=await ctx.newPage();
 await p.goto('http://127.0.0.1:8176/');await p.waitForTimeout(800);
 const cdp=await ctx.newCDPSession(p);
 const touch=(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y}]});
 await p.evaluate(()=>{ranchB99.hearts=400;ranchB99.dust=20;saveRanchB99();openRanchB99();addEventListener('click',e=>{window.__d=e.detail},true)});
 await p.waitForTimeout(600);
 const st=()=>p.evaluate(()=>({open:!!ranchWorldB100.sheet,title:$('ranchSheetB100').querySelector('h3')?.textContent||'',d:window.__d}));
 const res=[];
 for(let run=0;run<5;run++){
  const a=await p.evaluate(()=>{closeSheetB100();const s=stationB100('refinery'),w=ranchWorldB100;w.px=s.x;w.py=s.y;w.prevAct=false;const r=$('ranchActB100').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}});
  await p.waitForTimeout(400);
  await touch('touchStart',a.x,a.y);let mid;for(let k=0;k<20;k++){await p.waitForTimeout(50);mid=await st();if(mid.open)break}
  const under=await p.evaluate(({x,y})=>document.elementFromPoint(x,y)?.closest('button')?.textContent?.slice(0,24)||'-',a);
  await touch('touchEnd');await p.waitForTimeout(300);const end=await st();
  res.push(`run ${run}: opened=${mid.open} under=${under} afterLift open=${end.open} title=${end.title} detail=${end.d}`);
 }
 // fresh tap on Slot 1 while open
 await p.evaluate(()=>{if(!ranchWorldB100.sheet)refinerySheetB102()});await p.waitForTimeout(200);
 const t=await p.evaluate(()=>{const r=document.querySelector('#ranchSheetB100 .b174slot').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}});
 await touch('touchStart',t.x,t.y);await p.waitForTimeout(80);await touch('touchEnd');await p.waitForTimeout(300);res.push('fresh tap on Slot 1 -> '+(await st()).title);
 // keyboard: focus Slot 1 button and press Enter
 await p.evaluate(()=>refinerySheetB102());await p.waitForTimeout(200);
 await p.evaluate(()=>{const b=document.querySelector('#ranchSheetB100 .b174slot');b.focus();window.__k=0;b.addEventListener('click',()=>window.__k++)});await p.keyboard.press('Enter');await p.waitForTimeout(300);
 res.push('keyboard Enter -> '+(await st()).title+' (button click events '+await p.evaluate(()=>window.__k)+')');
 console.log(res.join('\n'));await b.close();
})();
