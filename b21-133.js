
// B125 patch 2: each boss gets its own drawn look from the A→S stretch of the ladder (fades in from q 4).
// Drawn over the base boss in the same transform as the other upgraded sprites; body size stays within r+14.
function bossLookB127(e,q){
  const f=tierB126(q,4);if(f<=0||e.type!=='boss'||e.dead)return;
  const r=e.r,p=bossData(e.bossKey),col=(e.flash||0)>0?'#ffffff':p.color,t=S.t,lx=Math.cos(Math.atan2(P.y-e.y,P.x-e.x)),ly=Math.sin(Math.atan2(P.y-e.y,P.x-e.x));
  X.save();X.globalAlpha=f;X.translate(e.x,e.y);
  const fillBody=path=>{X.fillStyle=shadeB126(0,0,r+6,col);path();X.fill();outlineB126(path,'#120914',3)};
  switch(e.bossKey){
    case 1:{ // Grump Star: a five-point star with heavy brows
      fillBody(()=>{X.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5+Math.sin(t*2)*.05,rr2=i%2?r*.62:r+10;i?X.lineTo(Math.cos(a)*rr2,Math.sin(a)*rr2):X.moveTo(Math.cos(a)*rr2,Math.sin(a)*rr2)}X.closePath()});
      eyesB126(0,-r*.05,lx,ly,r*.3,r*.16,r*.07);X.strokeStyle='#120914';X.lineWidth=3.5;X.beginPath();X.moveTo(-r*.5,-r*.38);X.lineTo(-r*.12,-r*.22);X.moveTo(r*.5,-r*.38);X.lineTo(r*.12,-r*.22);X.stroke();
      X.lineWidth=2.5;X.beginPath();X.arc(0,r*.42,r*.22,Math.PI+.4,-.4);X.stroke();break}
    case 5:{ // Velvet Fang: ears, fangs and a swishing tail
      X.save();X.strokeStyle=col;X.lineWidth=7;X.lineCap='round';X.beginPath();X.moveTo(-r*.6,r*.6);X.quadraticCurveTo(-r*1.4,r*.9+Math.sin(t*4)*8,-r*1.2,r*.1+Math.sin(t*4)*10);X.stroke();X.restore();
      fillBody(()=>{X.beginPath();X.arc(0,0,r+2,0,Math.PI*2)});
      X.fillStyle=col;for(const s of [-1,1]){X.beginPath();X.moveTo(s*r*.35,-r*.85);X.lineTo(s*r*.9,-r*1.4);X.lineTo(s*r*.95,-r*.45);X.closePath();X.fill();outlineB126(()=>{X.beginPath();X.moveTo(s*r*.35,-r*.85);X.lineTo(s*r*.9,-r*1.4);X.lineTo(s*r*.95,-r*.45)},'#120914',2.5)}
      eyesB126(0,-r*.15,lx,ly,r*.32,r*.16,r*.07);X.fillStyle='#fff';for(const s of [-1,1]){X.beginPath();X.moveTo(s*r*.22,r*.28);X.lineTo(s*r*.12,r*.6);X.lineTo(s*r*.02,r*.28);X.fill()}break}
    case 7:{ // Static Bloom: turning petals around a flower heart
      for(let i=0;i<8;i++){X.save();X.rotate(t*.6+i*Math.PI/4);X.fillStyle=i%2?col:'#e7d7ff';X.beginPath();X.ellipse(r*.75,0,r*.55,r*.26,0,0,Math.PI*2);X.fill();outlineB126(()=>{X.beginPath();X.ellipse(r*.75,0,r*.55,r*.26,0,0,Math.PI*2)},'#120914',2);X.restore()}
      fillBody(()=>{X.beginPath();X.arc(0,0,r*.62,0,Math.PI*2)});eyesB126(0,-r*.05,lx,ly,r*.22,r*.13,r*.05);break}
    case 11:{ // Hollow Bell: a bell with a swinging clapper
      const sw=Math.sin(t*3)*.25;X.rotate(sw*.4);
      fillBody(()=>{X.beginPath();X.moveTo(-r*.55,-r*.9);X.quadraticCurveTo(0,-r*1.35,r*.55,-r*.9);X.quadraticCurveTo(r*.8,r*.2,r*1.1,r*.75);X.lineTo(-r*1.1,r*.75);X.quadraticCurveTo(-r*.8,r*.2,-r*.55,-r*.9);X.closePath()});
      X.fillStyle='#120914';X.beginPath();X.arc(Math.sin(sw*3)*r*.3,r*.95,r*.22,0,Math.PI*2);X.fill();eyesB126(0,-r*.25,lx,ly,r*.28,r*.15,r*.06);break}
    case 13:{ // Lucky Thirteen: a four-leaf clover with a 13
      for(let i=0;i<4;i++){X.save();X.rotate(i*Math.PI/2+t*.3);X.fillStyle=col;X.beginPath();X.arc(r*.55,0,r*.55,0,Math.PI*2);X.fill();outlineB126(()=>{X.beginPath();X.arc(r*.55,0,r*.55,0,Math.PI*2)},'#120914',2.5);X.restore()}
      X.fillStyle='#120914';X.font=`900 ${Math.round(r*.7)}px system-ui`;X.textAlign='center';X.fillText('13',0,r*.62);eyesB126(0,-r*.32,lx,ly,r*.25,r*.12,r*.05);break}
    case 17:{ // Night Kite: a kite with ribbon tail
      X.strokeStyle=col;X.lineWidth=3;X.beginPath();X.moveTo(0,r*1.1);for(let i=1;i<=5;i++)X.lineTo(Math.sin(t*5+i)*8,r*1.1+i*9);X.stroke();
      fillBody(()=>{X.beginPath();X.moveTo(0,-r*1.2);X.lineTo(r*.95,-r*.1);X.lineTo(0,r*1.1);X.lineTo(-r*.95,-r*.1);X.closePath()});
      X.strokeStyle='#12091466';X.lineWidth=2;X.beginPath();X.moveTo(0,-r*1.2);X.lineTo(0,r*1.1);X.moveTo(-r*.95,-r*.1);X.lineTo(r*.95,-r*.1);X.stroke();eyesB126(0,-r*.3,lx,ly,r*.26,r*.14,r*.06);break}
    case 22:{ // The Last Glare: one great eye ringed with rays
      X.strokeStyle=col;X.lineWidth=3;for(let i=0;i<12;i++){const a=i*Math.PI/6+t*.4;X.beginPath();X.moveTo(Math.cos(a)*(r+2),Math.sin(a)*(r+2));X.lineTo(Math.cos(a)*(r+12),Math.sin(a)*(r+12));X.stroke()}
      fillBody(()=>{X.beginPath();X.arc(0,0,r+2,0,Math.PI*2)});
      X.fillStyle='#fff';X.beginPath();X.ellipse(0,0,r*.75,r*.45,0,0,Math.PI*2);X.fill();X.fillStyle='#120914';X.beginPath();X.arc(lx*r*.25,ly*r*.15,r*.28,0,Math.PI*2);X.fill();X.fillStyle='#fff';X.beginPath();X.arc(lx*r*.25-r*.08,ly*r*.15-r*.08,r*.07,0,Math.PI*2);X.fill();break}
  }
  X.restore();
}
const drawBeforeB127=draw;
draw=function(...args){
  if(!S||ranchWorldB100?.active||!S.run)return drawBeforeB127(...args);
  const q=lookQualityB125();if(tierB126(q,4)<=0)return drawBeforeB127(...args);
  const realRr=rr,shake0=shake,rec=[];
  rr=function(a,b){const v=realRr(a,b);if(rec.length<2&&a===-shake0&&b===shake0)rec.push(v);return v};
  let out;try{out=drawBeforeB127(...args)}finally{rr=realRr}
  X.save();X.translate(rec[0]||0,rec[1]||0);X.translate(W/2-CAM.x,H/2-CAM.y);
  try{for(const e of enemies)if(e.type==='boss'&&!e.dead&&worldVisible(e.x,e.y,120))bossLookB127(e,q)}finally{X.restore()}
  return out;
};
