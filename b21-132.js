
// B125 patch: distinct maps and sprite upgrades on the same look ladder (q 0 = today, 5 = Starforge).
// Maps get identity from shape and hue, not brightness: dark full-strength silhouettes, a world-locked ground
// pattern that replaces the grid, and one big signature motion each. Large bright areas stay at or under
// B126_LARGE_ALPHA so the contrast rule holds. Sprites: an overlay drawn in the same world transform as the base
// sprites (shake included), same size and colour family per type; detail fades in with q. Hitboxes unchanged.
const B126_LARGE_ALPHA=.2;
Object.assign(B125_LOOKS[1],{top:[34,14,40],bot:[70,26,40],accent:[255,140,90]});
Object.assign(B125_LOOKS[2],{top:[4,30,40],bot:[6,52,58],accent:[127,227,255]});
Object.assign(B125_LOOKS[3],{top:[12,8,40],bot:[30,18,70],accent:[197,140,255]});
Object.assign(B125_LOOKS[4],{top:[4,24,30],bot:[6,40,40],accent:[94,255,200]});
Object.assign(B125_LOOKS[5],{top:[24,8,8],bot:[60,24,8],accent:[255,180,80]});
backdropPeakB125=function(q){const p=lookPaletteB125(q),a=clamp(q,0,1),base=[5,7,11];
  const sky=[p.top,p.bot].map(c=>mixB125(base,c,a)).sort((x,y)=>lumB125(y)-lumB125(x))[0];
  return mixB125(sky,p.accent,B126_LARGE_ALPHA)};

const wrapB126=(v,m)=>((v%m)+m)%m;
function silhouetteB126(k,a,t){
  if(a<=0)return;const px=-CAM.x*.15;X.save();X.globalAlpha=a;
  if(k===1){ // Dusk Hills: low sun, two hill ridges
    const sx=W*.74,sy=H*.8,g=X.createRadialGradient(sx,sy,10,sx,sy,H*.5);g.addColorStop(0,rgbB125([255,140,90],B126_LARGE_ALPHA));g.addColorStop(1,rgbB125([255,140,90],0));X.fillStyle=g;X.fillRect(0,0,W,H);
    for(const [layer,col,base,amp] of [[0,[46,20,48],.66,34],[1,[30,12,30],.78,26]]){X.fillStyle=rgbB125(col);X.beginPath();X.moveTo(0,H);
      for(let x=0;x<=W+40;x+=24){const u=(x-px*(1+layer*.8))/170;X.lineTo(x,H*base-Math.sin(u)*amp-Math.sin(u*.41+layer*2)*amp*.8)}X.lineTo(W,H);X.closePath();X.fill()}
  }else if(k===2){ // Crystal Shore: spires along the bottom, faint shoreline
    for(let i=0;i<16;i++){const x=wrapB126(seededB125(i)*W*1.4+px*1.3,W*1.4)-W*.2,h=H*(.16+seededB125(i+5)*.24),w=14+seededB125(i+9)*22,y=H+4;
      X.fillStyle=rgbB125([8,38,50]);X.beginPath();X.moveTo(x-w/2,y);X.lineTo(x,y-h);X.lineTo(x+w/2,y);X.closePath();X.fill();
      X.strokeStyle=rgbB125([127,227,255],.45);X.lineWidth=1.2;X.beginPath();X.moveTo(x,y-h);X.lineTo(x+w/2,y);X.stroke()}
    X.strokeStyle=rgbB125([127,227,255],.12);X.lineWidth=2;for(let b=0;b<3;b++){X.beginPath();for(let x=0;x<=W;x+=20)X.lineTo(x,H*(.2+b*.06)+Math.sin(x/90+t*.8+b)*5);X.stroke()}
  }else if(k===3){ // Night Garden: treeline + fireflies
    for(let i=0;i<14;i++){const x=wrapB126(seededB125(i+20)*W*1.4+px*1.2,W*1.4)-W*.2,y=H*(.82+seededB125(i+31)*.1),r=30+seededB125(i+40)*30;
      X.fillStyle=rgbB125([10,8,30]);X.fillRect(x-4,y,8,H-y);X.beginPath();X.arc(x,y,r,0,Math.PI*2);X.arc(x-r*.6,y+r*.3,r*.7,0,Math.PI*2);X.arc(x+r*.6,y+r*.25,r*.7,0,Math.PI*2);X.fill()}
    for(let i=0;i<22;i++){const f=.5+.5*Math.sin(t*2.4+i*1.7),x=wrapB126(seededB125(i+60)*W+Math.sin(t*.6+i)*30+px*.6,W),y=wrapB126(seededB125(i+80)*H*.8+Math.cos(t*.5+i)*20,H);
      const g=X.createRadialGradient(x,y,0,x,y,9);g.addColorStop(0,rgbB125([230,200,255],.75*f));g.addColorStop(1,rgbB125([197,140,255],0));X.fillStyle=g;X.beginPath();X.arc(x,y,9,0,Math.PI*2);X.fill()}
  }else if(k===4){ // Aurora Fields: sky-wide aurora + jagged ridge
    for(let b=0;b<4;b++){const g=X.createLinearGradient(0,0,0,H*.75);g.addColorStop(0,rgbB125([94,255,200],0));g.addColorStop(.45,rgbB125(b%2?[120,200,255]:[94,255,200],B126_LARGE_ALPHA));g.addColorStop(1,rgbB125([94,255,200],0));
      X.fillStyle=g;X.beginPath();X.moveTo(0,0);for(let x=0;x<=W+30;x+=30)X.lineTo(x,H*(.08+b*.1)+Math.sin(x/160+t*.45+b*1.3)*30);for(let x=W;x>=0;x-=30)X.lineTo(x,H*(.32+b*.1)+Math.sin(x/190+t*.35+b)*26);X.closePath();X.fill()}
    X.fillStyle=rgbB125([6,20,26]);X.beginPath();X.moveTo(0,H);for(let x=0;x<=W+30;x+=30){const u=(x-px)/60;X.lineTo(x,H*.8-Math.abs(Math.sin(u))*50-Math.abs(Math.sin(u*.37))*40)}X.lineTo(W,H);X.closePath();X.fill();
  }else if(k===5){ // Starforge: forge towers with lit windows, rising embers, constellation
    for(let i=0;i<9;i++){const x=wrapB126(seededB125(i+90)*W*1.4+px*1.2,W*1.4)-W*.2,w=30+seededB125(i+91)*40,h=H*(.18+seededB125(i+92)*.3);
      X.fillStyle=rgbB125([28,10,8]);X.fillRect(x,H-h,w,h);X.fillStyle=rgbB125([255,180,80],.45);for(let r=0;r<5;r++)for(let c=0;c<2;c++)if(seededB125(i*31+r*7+c)>.45)X.fillRect(x+6+c*(w-16),H-h+10+r*18,4,6)}
    for(let i=0;i<40;i++){const sp=.5+seededB125(i+2),x=wrapB126(seededB125(i)*W+Math.sin(t+i)*12,W),y=H-wrapB126(seededB125(i+8)*H+t*26*sp,H);X.fillStyle=rgbB125([255,190,90],.7);X.fillRect(x,y,2,2)}
    X.strokeStyle=rgbB125([255,207,106],.35);X.lineWidth=1;X.beginPath();for(let i=0;i<7;i++){const a=t*.04+i*.9,x=W*.5+Math.cos(a)*W*.3,y=H*.3+Math.sin(a*1.3)*H*.15;if(i)X.lineTo(x,y);else X.moveTo(x,y)}X.stroke();
  }
  X.restore();
}
function groundB126(k,a){
  if(a<=0)return;const tile=96,x0=Math.floor((CAM.x-W/2)/tile)-1,y0=Math.floor((CAM.y-H/2)/tile)-1,nx=Math.ceil(W/tile)+3,ny=Math.ceil(H/tile)+3;
  const col=[null,[110,50,80],[40,110,120],[60,60,140],[130,220,200],[220,90,40]][k];X.save();X.globalAlpha=a*.45;X.strokeStyle=rgbB125(col);X.lineWidth=1.3;
  for(let i=0;i<nx;i++)for(let j=0;j<ny;j++){const cx=x0+i,cy=y0+j,s=seededB125(cx*73.1+cy*19.7),wx=cx*tile+s*tile,wy=cy*tile+seededB125(cx*11.3+cy*91.1)*tile,x=worldToScreenX(wx),y=worldToScreenY(wy);
    X.beginPath();
    if(k===1){for(let g=-1;g<=1;g++){X.moveTo(x+g*4,y);X.lineTo(x+g*6,y-7-Math.abs(g)*-2)}}
    else if(k===2){X.arc(x,y,14,Math.PI*1.1,Math.PI*1.9);X.moveTo(x+18,y+6);X.arc(x+18,y+20,14,Math.PI*1.1,Math.PI*1.9)}
    else if(k===3){X.roundRect?X.roundRect(x-12,y-12,24,24,7):X.rect(x-12,y-12,24,24)}
    else if(k===4){X.moveTo(x-5,y);X.lineTo(x+5,y);X.moveTo(x,y-5);X.lineTo(x,y+5);X.moveTo(x-3,y-3);X.lineTo(x+3,y+3)}
    else if(k===5){X.moveTo(x-14,y);X.lineTo(x-6,y-5);X.lineTo(x,y+3);X.lineTo(x+8,y-4);X.lineTo(x+14,y+1)}
    X.stroke()}
  X.restore();
}
drawLookB125=function(q,t){
  if(q<=0)return;const p=lookPaletteB125(q),a=clamp(q,0,1);
  const g=X.createLinearGradient(0,0,0,H);g.addColorStop(0,rgbB125(p.top,a));g.addColorStop(1,rgbB125(p.bot,a));X.fillStyle=g;X.fillRect(-30,-30,W+60,H+60);
  const stars=Math.round(20+18*Math.min(q,5));X.save();X.fillStyle=rgbB125([220,230,255],.3);
  for(let i=0;i<stars;i++){const x=wrapB126(seededB125(i+200)*W*2-CAM.x*.06,W),y=wrapB126(seededB125(i+400)*H*2-CAM.y*.06,H);X.fillRect(x,y,1.3,1.3)}X.restore();
  const k=Math.floor(q),f=q-k,shown=[];
  if(k>=1)shown.push([Math.min(5,k),k>=5?1:1-f]);if(k<5&&f>0)shown.push([k+1,f]);
  for(const [m,w] of shown)silhouetteB126(m,w,t);
  for(const [m,w] of shown)groundB126(m,w);
  const glow=clamp((q-1.5)/1.5,0,1);if(glow>0){X.save();X.globalAlpha=.25*glow;X.fillStyle=rgbB125(p.accent);for(const s of shots){const sx=worldToScreenX(s.x),sy=worldToScreenY(s.y);if(sx<-20||sy<-20||sx>W+20||sy>H+20)continue;X.beginPath();X.arc(sx,sy,s.r+6,0,Math.PI*2);X.fill()}X.restore()}
};
// The old grid fades out as the first map comes in; the ground pattern takes its place.
drawGrid=function(t){
  if(ranchWorldB100?.active||!S)return drawGridBeforeB125(t);
  const q=lookQualityB125();drawLookB125(q,t);
  if(q>=1)return;X.save();X.globalAlpha=1-q;try{return drawGridBeforeB125(t)}finally{X.restore()}
};

// ---- sprites ----
function tierB126(q,start){return clamp(q-start,0,1)}
function outlineB126(fn,col='#0b0d18',w=2.4){X.save();X.strokeStyle=col;X.lineWidth=w;fn();X.stroke();X.restore()}
function eyesB126(x,y,dx,dy,spread=4,r=2.3,look=1.6){
  for(const s of [-1,1]){X.fillStyle='#fff';X.beginPath();X.arc(x+s*spread,y,r,0,Math.PI*2);X.fill();X.fillStyle='#1a1426';X.beginPath();X.arc(x+s*spread+dx*look,y+dy*look,r*.55,0,Math.PI*2);X.fill()}
}
function shadeB126(x,y,r,col){const g=X.createRadialGradient(x-r*.35,y-r*.4,r*.1,x,y,r);g.addColorStop(0,'#ffffffaa');g.addColorStop(.35,col);g.addColorStop(1,col);return g}
function enemySpriteB126(e,q){
  const d=tierB126(q,0),c=tierB126(q,1),b=tierB126(q,2),a=tierB126(q,3);if(d<=0)return;
  const hit=(e.flash||0)>0,col=hit?'#ffffff':COLORS[e.type],look=Math.atan2(P.y-e.y,P.x-e.x),lx=Math.cos(look),ly=Math.sin(look);
  const bob=c*Math.sin(S.t*6+e.x*.05),windup=e.type==='charger'&&e.state==='aim'?1+.12*c*Math.abs(Math.sin(S.t*14)):1;
  X.save();X.globalAlpha=d;
  if(b>0){X.save();X.globalAlpha=.35*b;X.fillStyle='#000';X.beginPath();X.ellipse(e.x,e.y+e.r+3,e.r*.9,e.r*.3,0,0,Math.PI*2);X.fill();X.restore()}
  X.translate(e.x,e.y);X.scale(windup*(1+.07*Math.max(0,bob)),windup*(1+.07*Math.max(0,-bob))); // only ever grows, so the base sprite never peeks out
  if(e.type==='chaser'){const r=e.r+1.5;X.fillStyle=shadeB126(0,0,r,col);const body=()=>{X.beginPath();X.moveTo(-r,2);X.quadraticCurveTo(-r,-r,0,-r);X.quadraticCurveTo(r,-r,r,2);X.quadraticCurveTo(r*.6,r,0,r*.9);X.quadraticCurveTo(-r*.6,r,-r,2);X.closePath()};
    body();X.fill();outlineB126(body);eyesB126(0,-2,lx,ly,4.2,2.6);X.strokeStyle='#241b2b';X.lineWidth=1.4;X.beginPath();X.arc(0,4,3,.2,Math.PI-.2);X.stroke()}
  else if(e.type==='charger'){const r=14.6;X.fillStyle=shadeB126(0,0,r,col);const body=()=>{X.beginPath();X.moveTo(0,-r);X.lineTo(r,0);X.lineTo(0,r);X.lineTo(-r,0);X.closePath()};
    body();X.fill();outlineB126(body);X.fillStyle=hit?'#fff':'#c99a2e';for(const s of [-1,1]){X.beginPath();X.moveTo(s*4,-r+3);X.lineTo(s*9,-r-6);X.lineTo(s*8,-r+5);X.closePath();X.fill()}
    X.fillStyle='#241b2b';for(const s of [-1,1]){X.save();X.translate(s*4,-1);X.rotate(s*.35);X.fillRect(-2.5,-1.2,5,2.4);X.restore()}}
  else if(e.type==='core'){const r=e.r;X.fillStyle=shadeB126(0,0,r,col);X.beginPath();X.arc(0,0,r,0,Math.PI*2);X.fill();outlineB126(()=>{X.beginPath();X.arc(0,0,r,0,Math.PI*2)});
    X.strokeStyle=hit?'#fff':'#e7d7ff';X.lineWidth=2;X.beginPath();X.ellipse(0,0,r+6,(r+6)*.35,S.t*1.5,0,Math.PI*2);X.stroke();
    X.fillStyle='#fff6';X.beginPath();X.arc(0,0,r*.38,0,Math.PI*2);X.fill();eyesB126(0,-2,lx,ly,4,2);}
  else if(e.type==='boss'){const r=e.r,p=bossData(e.bossKey);X.fillStyle='#ffffff22';X.fillStyle=p.color;for(let i=0;i<6;i++){const ang=-Math.PI/2+(i-2.5)*.32;X.beginPath();X.moveTo(Math.cos(ang)*(r-2),Math.sin(ang)*(r-2));X.lineTo(Math.cos(ang)*(r+12),Math.sin(ang)*(r+12));X.lineTo(Math.cos(ang+.12)*(r-2),Math.sin(ang+.12)*(r-2));X.fill()}
    eyesB126(0,-r*.2,lx,ly,r*.32,r*.18,r*.08)}
  if(a>0&&e.type!=='boss'){X.globalAlpha=d*.5*a;X.strokeStyle=rgbB125(lookPaletteB125(q).accent);X.lineWidth=1.6;X.beginPath();X.arc(0,0,e.r+1,Math.PI*1.1,Math.PI*1.7);X.stroke()}
  X.restore();
}
function playerSpriteB126(q){
  const d=tierB126(q,0),c=tierB126(q,1),b=tierB126(q,2),a=tierB126(q,3);if(d<=0)return;
  const col=S.over>0?COLORS.gold:COLORS.player,r=P.r+(S.dashTime>0?3:0),sp=hyp(P.vx||0,P.vy||0),st=c*Math.min(.18,sp/1800),ang=Math.atan2(P.vy||0,P.vx||0);
  X.save();X.globalAlpha=d*(S.invuln>0?(.45+.45*Math.sin(S.t*25)):1);
  if(b>0&&P.trail?.length>2){X.save();X.globalAlpha*=b;X.strokeStyle=S.over>0?'#ffb84d':'#ff8fcf';X.lineWidth=4;X.lineCap='round';X.beginPath();const tr=P.trail.slice(-8);tr.forEach((p,i)=>i?X.lineTo(p.x,p.y+3):X.moveTo(p.x,p.y+3));X.lineTo(P.x,P.y+3);X.stroke();X.restore()}
  X.translate(P.x,P.y);X.rotate(ang);X.scale(1+st,1);X.rotate(-ang);
  X.fillStyle=shadeB126(0,0,r+.5,col);X.beginPath();X.arc(0,0,r+.5,0,Math.PI*2);X.fill();outlineB126(()=>{X.beginPath();X.arc(0,0,r+.5,0,Math.PI*2)});
  eyesB126(P.faceX*2,-1+P.faceY*2,P.faceX||0,P.faceY||0,3.4,2.2,1.2);
  X.strokeStyle='#fff';X.lineWidth=2;X.beginPath();X.moveTo(P.faceX*(r-1),P.faceY*(r-1));X.lineTo(P.faceX*18,P.faceY*18);X.stroke();
  if(a>0){X.globalAlpha*=a*.7;X.strokeStyle=rgbB125(lookPaletteB125(q).accent);X.lineWidth=2;X.beginPath();X.arc(0,0,r+1,Math.PI*1.1,Math.PI*1.8);X.stroke()}
  X.restore();
}
function pipSpriteB126(q){
  const d=tierB126(q,0),b=tierB126(q,2);if(d<=0)return;
  const px=P.pipX,py=P.pipY,big=(S.over>0?9:7)+Math.min(3,(S.pipLevel-1)*.4),col=!pipWithPlayer()?'#ffb7c9':S.over>0?'#fff0a8':'#ffd36f';
  X.save();X.globalAlpha=d;X.translate(px,py);
  if(b>0){const flap=Math.sin(S.t*14)*.5;X.save();X.globalAlpha*=.75*b;X.fillStyle='#e8f6ff';for(const s of [-1,1]){X.save();X.scale(s,1);X.rotate(-.5+flap);X.beginPath();X.ellipse(big*.9,-2,big*.6,big*.32,0,0,Math.PI*2);X.fill();X.restore()}X.restore()}
  X.rotate(P.pipAngle*.35);
  const star=()=>{X.beginPath();for(let i=0;i<10;i++){const ang=-Math.PI/2+i*Math.PI/5,r=i%2===0?big:3.4;i?X.lineTo(Math.cos(ang)*r,Math.sin(ang)*r):X.moveTo(Math.cos(ang)*r,Math.sin(ang)*r)}X.closePath()};
  X.fillStyle=shadeB126(0,0,big,col);star();X.fill();outlineB126(star,'#5a4310',1.6);
  X.rotate(-P.pipAngle*.35);X.fillStyle='#5a4310';X.beginPath();X.arc(-1.8,-.5,1,0,Math.PI*2);X.arc(1.8,-.5,1,0,Math.PI*2);X.fill();
  X.restore();
}
function shotSpriteB126(s,q){
  const d=tierB126(q,0),c=tierB126(q,1);if(d<=0)return;const v=hyp(s.vx,s.vy)||1,ux=s.vx/v,uy=s.vy/v,col=S.over>0?'#ffd36f':'#d9c8ff';
  X.save();X.globalAlpha=d*.7;X.strokeStyle=col;X.lineWidth=s.r*1.3;X.lineCap='round';X.beginPath();X.moveTo(s.x,s.y);X.lineTo(s.x-ux*s.r*3.2,s.y-uy*s.r*3.2);X.stroke();
  if(c>0){X.globalAlpha=d*c;X.fillStyle='#fff';X.beginPath();X.arc(s.x,s.y,s.r*.5,0,Math.PI*2);X.fill()}X.restore();
}
function heartSpriteB126(h,q){
  const d=tierB126(q,0),c=tierB126(q,1);if(d<=0)return;const bob=Math.sin(S.t*6+h.bob)*2,x=h.x,y=h.y+bob-1,r=6.5;
  X.save();X.globalAlpha=d;const heart=()=>{X.beginPath();X.moveTo(x,y+r*.9);X.bezierCurveTo(x-r*1.4,y-r*.1,x-r*.7,y-r*1.2,x,y-r*.35);X.bezierCurveTo(x+r*.7,y-r*1.2,x+r*1.4,y-r*.1,x,y+r*.9);X.closePath()};
  X.fillStyle=shadeB126(x,y,r,'#ff9fba');heart();X.fill();outlineB126(heart,'#5b1d30',1.5);
  if(c>0){const f=.5+.5*Math.sin(S.t*5+h.bob);X.globalAlpha=d*c*f;X.fillStyle='#fff';X.fillRect(x+r*.6,y-r,2,2)}X.restore();
}
// Death pops into pieces from A; impact stars from B.
const killBeforeB126=kill;
kill=function(e,...a){const was=!!e?.dead,out=killBeforeB126(e,...a);
  if(S?.run&&!ranchWorldB100?.active&&e&&!was&&e.dead&&e.type!=='boss'){const q=lookQualityB125(),f=tierB126(q,3);if(f>0)for(let i=0;i<Math.round(5*f);i++){const ang=rr(0,Math.PI*2),sp=rr(80,180);particles.push({x:e.x,y:e.y,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp,life:.5,max:.5,c:COLORS[e.type]||'#fff',r:rr(3,5)})}}
  return out};
const hitEnemyBeforeB126=hitEnemy;
hitEnemy=function(e,power=1,source='player'){const out=hitEnemyBeforeB126(e,power,source);
  if(S?.run&&!ranchWorldB100?.active&&e&&!e.dead&&tierB126(lookQualityB125(),2)>.5&&Math.random()<.5)ring(e.x,e.y,'#fff0a8',18);return out};

// The overlay draws in the exact transform the base sprites used: same shake offset, same camera.
const drawBeforeB126=draw;
draw=function(...args){
  if(!S||ranchWorldB100?.active||!S.run)return drawBeforeB126(...args);
  const q=lookQualityB125();if(q<=0)return drawBeforeB126(...args);
  const realRr=rr,shake0=shake,rec=[];
  rr=function(a,b){const v=realRr(a,b);if(rec.length<2&&a===-shake0&&b===shake0)rec.push(v);return v};
  let out;try{out=drawBeforeB126(...args)}finally{rr=realRr}
  X.save();X.translate(rec[0]||0,rec[1]||0);X.translate(W/2-CAM.x,H/2-CAM.y);
  try{
    for(const s of shots)if(s.source==='player'&&worldVisible(s.x,s.y,40))shotSpriteB126(s,q);
    for(const h of heartBits)if(worldVisible(h.x,h.y,40))heartSpriteB126(h,q);
    for(const e of enemies)if(!e.dead&&worldVisible(e.x,e.y,60))enemySpriteB126(e,q);
    pipSpriteB126(q);playerSpriteB126(q);
  }finally{X.restore()}
  return out;
};
