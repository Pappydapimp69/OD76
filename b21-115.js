// B117 Storm clouds travel (shipped inside B117). No instant strike: every charged cloud, a single one too,
// launches from the player and drifts to its target at half the player's top speed, then strikes. New clouds
// join clouds still in flight instead of replacing them.
const B117S_CLOUD_SPEED_SHARE=.5;
function stormCloudSpeedB117s(){return Math.max(1,playerSpeedB61()*B117S_CLOUD_SPEED_SHARE)}
launchStormCloudsB93=function(count,level){
  const clouds=S.b93StormClouds||(S.b93StormClouds=[]);
  for(let i=0;i<count;i++){const a=-Math.PI/2+(i-(count-1)/2)*.24;clouds.push({x:P.x+Math.cos(a)*30,y:P.y-38+Math.sin(a)*10,delay:i*.11,target:null,age:0,level})}
};
stormFireB116a=function(count,level){
  flash=Math.max(flash,.4);launchStormCloudsB93(count,level);announce(`THUNDERSTORM · ${count} CLOUD${count===1?'':'S'}`,650);
};
updateStormCloudsB93=function(dt){
  const clouds=S?.b93StormClouds||[],speed=stormCloudSpeedB117s();
  for(let i=clouds.length-1;i>=0;i--){const cloud=clouds[i];cloud.age+=dt;if((cloud.delay-=dt)>0)continue;if(!cloud.target||cloud.target.dead)cloud.target=randomStormTargetB93();if(!cloud.target){stormHoverB116a(cloud,i,dt);continue}cloud.waiting=false;
    const tx=cloud.target.x,ty=cloud.target.y-52,dx=tx-cloud.x,dy=ty-cloud.y,d=hyp(dx,dy)||1,step=Math.min(d,speed*dt);cloud.x+=dx/d*step;cloud.y+=dy/d*step;
    if(d-step<=18){stormStrikeB116a(cloud.target,cloud.level,stormDamageB116a(cloud.level),{x:cloud.x,y:cloud.y});flash=Math.max(flash,.1);shake=Math.max(shake,4);clouds.splice(i,1)}
  }
};
OVERDRIVE_INFO.storm.desc='Hold to charge clouds one by one (8% HEAT each; Lv1 1, Lv2-3 2, Lv4 3, Lv5 4 clouds), release to send them. Clouds drift to their targets at half your speed, then strike. A tap charges one cloud that goes on its own. From Lv3 each strike arcs to a nearby enemy.';
