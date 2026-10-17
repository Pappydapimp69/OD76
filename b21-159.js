
// B142 Scent Hunt sparkles stand out. The catchable sparkles were small pale-yellow dots drawn under the trees, easy to
// lose against the pink-dotted bushes. They now draw on top of the field: bigger, dark-gold outlined, with a pulsing
// glow and a bold pink flower. Grey decoys stay plain, so real and fake read apart at a glance.
function drawScentSparksB142(t){
 const g=ranchWorldB100.game;if(!g||g.type!=='collect'||!g.sparks)return;
 for(const s of g.sparks){if(s.got)continue;
  const pulse=.5+.5*Math.sin(t*6+s.x*.05),bob=Math.sin(t*5+s.x)*3,y=s.y+bob;
  X.globalAlpha=.35+.25*pulse;X.fillStyle='#ffd36f';X.beginPath();X.arc(s.x,y,22+pulse*6,0,Math.PI*2);X.fill();X.globalAlpha=1;
  X.fillStyle='#ffe58f';X.beginPath();X.arc(s.x,y,15,0,Math.PI*2);X.fill();
  X.strokeStyle='#c98a1c';X.lineWidth=3;X.stroke();
  X.fillStyle='#ff4f93';X.font='900 17px system-ui';X.textAlign='center';X.textBaseline='middle';X.fillText('✿',s.x,y+1);X.textBaseline='alphabetic';
 }
}
const drawRanchBeforeB142=drawRanchB100;
drawRanchB100=function(...a){
 const out=drawRanchBeforeB142(...a),w=ranchWorldB100;if(!w.active||w.game?.type!=='collect')return out;
 X.save();X.translate(Math.round(W/2-w.cam.x),Math.round(H/2-w.cam.y));drawScentSparksB142(performance.now()/1000);X.restore();
 return out;
};
