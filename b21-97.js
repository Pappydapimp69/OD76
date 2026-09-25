
// B109 Pip actions on X: A reads/opens info, X tells Pip to do the work. Tool jobs play out
// as a timed animation (chopping takes 3 seconds) with Pip and the target both moving.
const B109_ACTIONS={chop:{dur:3,icon:"🪓",verb:"Chop"},cut:{dur:2,icon:"🌾",verb:"Cut"},till:{dur:2,icon:"⛏",verb:"Till"},water:{dur:1.2,icon:"🚿",verb:"Water"},harvest:{dur:1,icon:"🧺",verb:"Harvest"}};
const B109_APPROACH_MAX=1.5;

// What Pip can do at the thing you're standing by, or null (then only A applies).
function pipActionForB109(near){
 if(!near?.st||!ranchWorldB100.active)return null;
 const st=near.st;
 if(st.obstacle){
   const o=obstacleB106(st.obstacle);if(!o||!obstacleStandingB106(o))return null;
   const tool=o.tree?"axe":"sickle";if(!ranchB99.tools[tool]||!toolReadyB106())return null;
   return{kind:o.tree?"chop":"cut",target:o,finish:()=>clearObstacleB106(o.id),done:o.tree?"Timber! The tree is down.":"Snip snip! The shrub is cleared."};
 }
 if(st.plot!=null&&ranchB99.areas.garden){
   const i=st.plot,p=plotB105(i),q=B105_PLOT_POS[i];
   if(plotRipeB105(p))return{kind:"harvest",target:q,finish:()=>harvestB105(i),done:`Harvested ${B104_ITEMS[p.crop].icon} ×${B105_CROPS[p.crop].yield}!`};
   if(!toolReadyB106())return null;
   if(!p.tilled&&ranchB99.tools.hoe)return{kind:"till",target:q,finish:()=>tillB105(i),done:"Pip tilled the soil."};
   if(p.crop&&!p.watered&&ranchB99.tools.can)return{kind:"water",target:q,finish:()=>waterB105(i),done:"Watered. It grows when the week passes."};
 }
 return null;
}
function startPipActionB109(a){
 const w=ranchWorldB100;if(!a||w.b109Action||w.game||w.sheet)return false;
 const side=w.px<a.target.x?-1:1;
 w.b109Action={...a,phase:"approach",t:0,wait:0,dur:B109_ACTIONS[a.kind].dur,px:a.target.x+side*34,py:a.target.y+6,side,leafClock:0};
 const p=w.pip;p.state="drill";p.t=99;p.tx=w.b109Action.px;p.ty=w.b109Action.py;p.kind=null;
 return true;
}
function finishPipActionB109(){
 const w=ranchWorldB100,a=w.b109Action;if(!a)return;w.b109Action=null;
 const ok=a.finish();w.pip.state="follow";w.pip.happy=1.2;w.prevAct=true;
 if(ok&&a.kind==="chop")w.b109Fx.push({kind:"fall",x:a.target.x,y:a.target.y,r:a.target.r,dir:-a.side,t:0});
 if(ok&&a.kind==="cut")for(let i=0;i<10;i++)w.b109Leaves.push(leafB109(a.target.x,a.target.y,1.2));
 renderRanchHudB100();ranchToastB100(ok?a.done:"Pip couldn't finish that.",2.6);
}
function leafB109(x,y,life=.9){return{x:x+rr(-14,14),y:y-10+rr(-14,8),vx:rr(-50,50),vy:rr(-60,-20),t:life,life,spin:rr(0,6)}}
function updatePipActionB109(dt){
 const w=ranchWorldB100,a=w.b109Action;
 for(const l of w.b109Leaves){l.t-=dt;l.x+=l.vx*dt;l.y+=l.vy*dt;l.vy+=90*dt;l.spin+=dt*6}w.b109Leaves=w.b109Leaves.filter(l=>l.t>0);
 for(const f of w.b109Fx)f.t+=dt;w.b109Fx=w.b109Fx.filter(f=>f.t<1);
 if(!a)return;
 if(a.phase==="approach"){a.wait+=dt;if(hyp(w.pip.x-a.px,w.pip.y-a.py)<10||a.wait>=B109_APPROACH_MAX){a.phase="work";w.pip.x=a.px;w.pip.y=a.py}return}
 a.t+=dt;a.leafClock-=dt;
 if(a.leafClock<=0&&(a.kind==="chop"||a.kind==="cut"||a.kind==="till")){a.leafClock=a.kind==="chop"?.4:.25;for(let i=0;i<(a.kind==="chop"?3:2);i++)w.b109Leaves.push(leafB109(a.target.x,a.target.y))}
 if(a.t>=a.dur)finishPipActionB109();
}

// ---- input: X from keyboard, gamepad button 2 or the touch button ----
window.addEventListener("keydown",e=>{if(ranchWorldB100.active&&!e.repeat&&(e.key==="x"||e.key==="X"))ranchWorldB100.b109XTap=true});
const inputBeforeB109=ranchInputB100;
ranchInputB100=function(){
 const w=ranchWorldB100,r=inputBeforeB109();
 let x=!!w.b109XTouch;const pads=navigator.getGamepads?navigator.getGamepads():[];
 for(const pad of pads){if(!pad||!pad.connected)continue;x=x||!!(pad.buttons?.[2]?.pressed||pad.buttons?.[2]?.value>.5);break}
 r.xPressed=(x&&!w.b109PrevX)||!!w.b109XTap;w.b109PrevX=x||!!w.b109XTap;w.b109XTap=false;
 w.b109XPressed=r.xPressed;return r;
};
(function installXButtonB109(){
 const b=document.createElement("button");b.id="ranchPipBtnB109";b.type="button";b.textContent="X";document.getElementById("app").appendChild(b);
 b.addEventListener("pointerdown",e=>{e.preventDefault();ranchWorldB100.b109XTouch=true;ranchWorldB100.b109XTap=true;try{b.setPointerCapture(e.pointerId)}catch(_){}});
 const up=()=>{ranchWorldB100.b109XTouch=false};b.addEventListener("pointerup",up);b.addEventListener("pointercancel",up);
 const s=document.createElement("style");s.textContent=`#ranchPipBtnB109{position:absolute;z-index:12;right:calc(max(18px,env(safe-area-inset-right)) + 96px);bottom:max(30px,env(safe-area-inset-bottom));width:72px;height:72px;border-radius:50%;border:3px solid #fff;background:#9fe3c1;color:#2f5a48;font:800 13px system-ui;box-shadow:0 8px 22px #3f8a6a40;display:none;touch-action:none}body.ranchB100 #ranchPipBtnB109.on{display:block}#ranchPipBtnB109:active{transform:scale(.95)}`;document.head.appendChild(s);
})();

// While Pip works, nothing else is interactable; near a job, A becomes Info.
const nearestBeforeB109=nearestInteractB100;
nearestInteractB100=function(){if(ranchWorldB100.b109Action)return null;const n=nearestBeforeB109();if(n&&pipActionForB109(n))n.label="Info";return n};
const updateRanchBeforeB109=updateRanchB100;
updateRanchB100=function(dt){
 const w=ranchWorldB100;w.b109Leaves??=[];w.b109Fx??=[];
 updateRanchBeforeB109(dt);
 if(!w.active)return;
 updatePipActionB109(dt);
 const btn=$("ranchPipBtnB109");
 const act=!w.sheet&&!w.game&&!w.b109Action?pipActionForB109(nearestBeforeB109()):null;
 btn.classList.toggle("on",!!act);if(act)btn.textContent=B109_ACTIONS[act.kind].verb;
 if(act&&w.b109XPressed)startPipActionB109(act);
 w.b109XPressed=false;
};
const enterBeforeB109=enterRanchB100;
enterRanchB100=function(){const w=ranchWorldB100;w.b109Action=null;w.b109Leaves=[];w.b109Fx=[];w.b109XTap=false;w.b109PrevX=true;enterBeforeB109()};
openRanchB99=enterRanchB100;
for(const id of ["openRanchB99","endRanchB99"]){const old=$(id);if(!old)continue;const b=old.cloneNode(true);old.replaceWith(b);b.addEventListener("click",enterRanchB100)}
const leaveBeforeB109=leaveRanchB100;
leaveRanchB100=function(){if(ranchWorldB100.b109Action)finishPipActionB109();leaveBeforeB109();$("ranchPipBtnB109")?.classList.remove("on")};

// Menu options for these jobs play the same animation instead of finishing instantly.
function routeSheetB109(prefixes,action){const w=ranchWorldB100;if(!w.sheet||!action)return;for(const o of w.sheet.options)if(prefixes.some(p=>o.label.startsWith(p)))o.run=()=>startPipActionB109(action)}
const obstacleSheetBeforeB109=obstacleSheetB106;
obstacleSheetB106=function(id){obstacleSheetBeforeB109(id);const o=obstacleB106(id);routeSheetB109(["Let Pip"],pipActionForB109({st:{obstacle:id}}))};
const plotSheetBeforeB109=plotSheetB105;
plotSheetB105=function(i){plotSheetBeforeB109(i);routeSheetB109(["Till","Water","Harvest"],pipActionForB109({st:{plot:i}}))};

// ---- drawing ----
const drawStationBeforeB109=drawStationB100;
drawStationB100=function(st,t){
 const a=ranchWorldB100.b109Action,hit=a&&a.phase==="work"&&st.obstacle&&a.target.id===st.obstacle;
 if(!hit)return drawStationBeforeB109(st,t);
 // Each swing lands on the downbeat: the target jolts and shivers.
 const swing=(a.t*2.5)%1,jolt=swing<.18?Math.sin(swing/.18*Math.PI)*6:Math.sin(t*40)*1.2;
 const lean=a.kind==="chop"?Math.min(.35,a.t/a.dur*.35)*-a.side:0;
 X.save();X.translate(st.x,st.y+20);X.rotate(lean);X.translate(-st.x+jolt*-a.side,-st.y-20);drawStationBeforeB109(st,t);X.restore();
};
const drawPipBeforeB109=drawPipB100;
drawPipB100=function(t){
 const w=ranchWorldB100,a=w.b109Action,p=w.pip;
 for(const f of w.b109Fx||[])if(f.kind==="fall"){const k=Math.min(1,f.t/.7);X.save();X.globalAlpha=1-Math.max(0,(f.t-.6)/.4);X.translate(f.x,f.y+20);X.rotate(f.dir*k*Math.PI/2);X.fillStyle="#d9bfa3";X.fillRect(-7,-20,14,28);X.fillStyle="#9fd8b4";X.beginPath();X.arc(0,-30,f.r,0,Math.PI*2);X.fill();X.restore()}
 for(const l of w.b109Leaves||[]){X.save();X.globalAlpha=Math.min(1,l.t/l.life*1.5);X.translate(l.x,l.y);X.rotate(l.spin);X.fillStyle=a?.kind==="till"?"#c9a27e":"#8fd19f";X.beginPath();X.ellipse(0,0,5,2.6,0,0,Math.PI*2);X.fill();X.restore()}
 if(!a||a.phase!=="work")return drawPipBeforeB109(t);
 // Pip winds up and swings with the tool; a little hop on each strike.
 const swing=(a.t*2.5)%1,arc=a.kind==="water"?.4:swing<.18?-1.1+swing/.18*2.2:1.1-(swing-.18)/.82*2.2;
 const hop=a.kind==="water"?Math.sin(a.t*6)*2:swing<.18?-6*Math.sin(swing/.18*Math.PI):0,dir=-a.side;
 X.save();X.translate(p.x,p.y+hop);X.rotate(dir*arc*.18);X.translate(-p.x,-p.y);drawPipBeforeB109(t);X.restore();
 const tx=p.x+dir*14+Math.cos(arc)*dir*10,ty=p.y-8+hop+Math.sin(arc)*12;
 X.save();X.translate(tx,ty);X.rotate(dir*arc);if(dir<0)X.scale(-1,1);X.font="20px system-ui";X.textAlign="center";X.fillText(B109_ACTIONS[a.kind].icon,0,7);X.restore();
 if(a.kind==="water"&&Math.floor(a.t*10)%2===0){X.fillStyle="#8fd3ff";for(let i=0;i<3;i++){X.beginPath();X.arc(a.target.x+rr(-14,14),a.target.y+rr(-10,10),2.4,0,Math.PI*2);X.fill()}}
 // progress ring
 X.strokeStyle="#9fe3c1";X.lineWidth=4;X.beginPath();X.arc(a.target.x,a.target.y-(a.target.r||30)-26,10,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.min(1,a.t/a.dur));X.stroke();
};
const drawRanchBeforeB109=drawRanchB100;
drawRanchB100=function(){
 drawRanchBeforeB109();
 const w=ranchWorldB100;if(w.sheet||w.game||w.b109Action)return;
 const near=nearestBeforeB109(),act=pipActionForB109(near);if(!act)return;
 const sx=Math.round(W/2-w.cam.x)+w.px,sy=Math.round(H/2-w.cam.y)+w.py-64;
 X.font="700 13px system-ui";const text=`X · ${B109_ACTIONS[act.kind].verb}`,tw=X.measureText(text).width+20;
 X.fillStyle="#e3f8ec";X.strokeStyle="#9fe3c1";X.lineWidth=2;roundRectB100(sx-tw/2,sy-26,tw,26,13);X.fill();X.stroke();X.fillStyle="#2f5a48";X.textAlign="center";X.fillText(text,sx,sy-8);X.textAlign="start";
};
