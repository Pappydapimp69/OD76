// B120 Nova constellations: every enemy struck by a Nova wave becomes a temporary star. Up to seven
// struck enemies are matched to a small line-art pattern, then linked in sequence while extra hits remain
// as loose stars. Living nodes move with their enemies; defeated nodes hold their final position.
const B120_NOVA_CONSTELLATION_SECONDS=2.6,B120_NOVA_MAX_LINKED=7;
const B120_NOVA_PATTERNS={
 1:{name:'STAR',points:[[0,0]],edges:[]},
 2:{name:'PAIR',points:[[-1,0],[1,0]],edges:[[0,1]]},
 3:{name:'TRIAD',points:[[0,-1],[-.9,.75],[.9,.75]],edges:[[0,1],[1,2],[2,0]]},
 4:{name:'KITE',points:[[0,-1],[-.75,-.05],[0,.35],[.55,1]],edges:[[0,1],[0,2],[1,2],[2,3]]},
 5:{name:'CROWN',points:[[-1,.45],[-.55,-.7],[0,.2],[.55,-.7],[1,.45]],edges:[[0,1],[1,2],[2,3],[3,4],[4,0]]},
 6:{name:'DIPPER',points:[[-1,-.35],[-.45,-.65],[.05,-.25],[-.05,.45],[.55,.55],[1.1,.2]],edges:[[0,1],[1,2],[2,3],[3,0],[3,4],[4,5]]},
 7:{name:'HUNTER',points:[[-.75,-1],[.75,-1],[-.38,-.05],[0,0],[.38,.05],[-.65,1],[.65,1]],edges:[[0,1],[0,2],[1,4],[2,3],[3,4],[2,5],[4,6]]}
};
let novaConstellationB120=null;

function novaNodePointB120(n){
 if(n.enemy&&!n.enemy.dead){n.x=n.enemy.x;n.y=n.enemy.y}
 return{x:n.x,y:n.y};
}
function selectNovaNodesB120(nodes){
 if(nodes.length<=B120_NOVA_MAX_LINKED)return nodes.slice();
 const cx=nodes.reduce((v,n)=>v+novaNodePointB120(n).x,0)/nodes.length,cy=nodes.reduce((v,n)=>v+novaNodePointB120(n).y,0)/nodes.length;
 const ring=nodes.slice().sort((a,b)=>Math.atan2(novaNodePointB120(a).y-cy,novaNodePointB120(a).x-cx)-Math.atan2(novaNodePointB120(b).y-cy,novaNodePointB120(b).x-cx));
 return Array.from({length:B120_NOVA_MAX_LINKED},(_,i)=>ring[Math.floor(i*ring.length/B120_NOVA_MAX_LINKED)]);
}
function fitNovaPatternB120(nodes,pattern){
 const raw=nodes.map(n=>novaNodePointB120(n)),cx=raw.reduce((v,p)=>v+p.x,0)/raw.length,cy=raw.reduce((v,p)=>v+p.y,0)/raw.length;
 const scale=Math.sqrt(raw.reduce((v,p)=>v+(p.x-cx)**2+(p.y-cy)**2,0)/raw.length)||1;
 const actual=raw.map(p=>({x:(p.x-cx)/scale,y:(p.y-cy)/scale}));
 const baseScale=Math.sqrt(pattern.points.reduce((v,p)=>v+p[0]*p[0]+p[1]*p[1],0)/pattern.points.length)||1;
 let best=null,bestCost=Infinity;
 for(const flip of [1,-1])for(let turn=0;turn<16;turn++){
   const a=turn*Math.PI/8,c=Math.cos(a),s=Math.sin(a),want=pattern.points.map(([px,py])=>{const x=px*flip/baseScale,y=py/baseScale;return{x:x*c-y*s,y:x*s+y*c}});
   const used=Array(nodes.length).fill(false),map=Array(nodes.length);
   const walk=(i,cost)=>{
     if(cost>=bestCost)return;
     if(i===nodes.length){bestCost=cost;best=map.slice();return}
     for(let j=0;j<nodes.length;j++)if(!used[j]){const dx=actual[j].x-want[i].x,dy=actual[j].y-want[i].y;used[j]=true;map[i]=j;walk(i+1,cost+dx*dx+dy*dy);used[j]=false}
   };
   walk(0,0);
 }
 return best?best.map(i=>nodes[i]):nodes;
}
function rebuildNovaConstellationB120(){
 const f=novaConstellationB120;if(!f||!f.nodes.length)return;
 const selected=selectNovaNodesB120(f.nodes),pattern=B120_NOVA_PATTERNS[selected.length],placed=fitNovaPatternB120(selected,pattern);
 f.name=pattern.name;f.linked=new Set(placed);f.edges=pattern.edges.map(([a,b])=>[placed[a],placed[b]]);f.age=0;f.life=B120_NOVA_CONSTELLATION_SECONDS;
}
function addNovaStarsB120(hit){
 const f=novaConstellationB120;if(!f)return;
 let added=false;for(const e of hit)if(!f.nodes.some(n=>n.enemy===e)){f.nodes.push({enemy:e,x:e.x,y:e.y,phase:rnd()*Math.PI*2});added=true}
 if(added)rebuildNovaConstellationB120();
}

const releaseNovaBeforeB120=releaseNovaB94;
releaseNovaB94=function(frac,lv){
 novaConstellationB120={nodes:[],edges:[],linked:new Set(),name:'STAR',age:0,life:B120_NOVA_CONSTELLATION_SECONDS};
 return releaseNovaBeforeB120(frac,lv);
};
const fireNovaWaveBeforeB120=fireNovaWaveB94;
fireNovaWaveB94=function(wave){
 const hit=enemies.filter(e=>!e.dead&&hyp(e.x-P.x,e.y-P.y)<=wave.radius);
 const out=fireNovaWaveBeforeB120(wave);addNovaStarsB120(hit);return out;
};

function drawNovaStarB120(x,y,r,phase,alpha){
 X.save();X.translate(x,y);X.rotate(Math.sin((S?.t||0)*2+phase)*.16);X.globalAlpha=alpha;X.fillStyle='#fff7d1';X.shadowColor='#ffd36f';X.shadowBlur=10;
 X.beginPath();for(let i=0;i<8;i++){const a=-Math.PI/2+i*Math.PI/4,q=i%2?r*.22:r*(1+.12*Math.sin((S?.t||0)*7+phase));i?X.lineTo(Math.cos(a)*q,Math.sin(a)*q):X.moveTo(Math.cos(a)*q,Math.sin(a)*q)}X.closePath();X.fill();X.restore();
}
function drawNovaConstellationB120(){
 const f=novaConstellationB120;if(!f||!f.nodes.length||!S?.run||S.end)return;
 const fade=clamp(f.life/.65,0,1)*clamp(f.age/.16,0,1),points=new Map();
 for(const n of f.nodes){const p=novaNodePointB120(n);points.set(n,{x:worldToScreenX(p.x),y:worldToScreenY(p.y)})}
 X.save();X.lineCap='round';X.lineJoin='round';X.shadowColor='#ff9fba';X.shadowBlur=8;
 f.edges.forEach((edge,i)=>{
   const a=points.get(edge[0]),b=points.get(edge[1]),start=.12+i*.075,trace=clamp((f.age-start)/.24,0,1);if(!trace)return;
   const bx=a.x+(b.x-a.x)*trace,by=a.y+(b.y-a.y)*trace,g=X.createLinearGradient(a.x,a.y,bx,by);g.addColorStop(0,'#fff0a8');g.addColorStop(1,'#ff9fba');
   X.globalAlpha=.58*fade;X.strokeStyle=g;X.lineWidth=1.6;X.beginPath();X.moveTo(a.x,a.y);X.lineTo(bx,by);X.stroke();
 });
 X.shadowBlur=0;
 for(const n of f.nodes){const p=points.get(n),linked=f.linked.has(n);drawNovaStarB120(p.x,p.y,linked?7:5,n.phase,(linked ? .95 : .62)*fade)}
 if(f.edges.length&&f.age>.5){const linked=[...f.linked],cx=linked.reduce((v,n)=>v+points.get(n).x,0)/linked.length,cy=Math.min(...linked.map(n=>points.get(n).y))-18;X.globalAlpha=.3*fade;X.fillStyle='#fff0a8';X.font='800 9px system-ui';X.textAlign='center';X.fillText(f.name,cx,cy)}
 X.restore();
}

const updateBeforeB120=update;
update=function(dt){const out=updateBeforeB120(dt);if(novaConstellationB120){novaConstellationB120.age+=Math.max(0,dt||0);novaConstellationB120.life-=Math.max(0,dt||0);if(novaConstellationB120.life<=0)novaConstellationB120=null}return out};
const drawBeforeB120=draw;
draw=function(){drawBeforeB120();drawNovaConstellationB120()};
const resetBeforeB120=reset;
reset=function(){novaConstellationB120=null;return resetBeforeB120()};

OVERDRIVE_INFO.nova.desc='Hold to charge, then release a shockwave that turns struck enemies into linked stars. Dense hits briefly draw a constellation across the arena.';
