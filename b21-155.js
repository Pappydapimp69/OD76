
// B137 Drill-site labels stop swinging with Pip. B106 drew every site's name inside drawPipB100, so B109's chop/cut
// swing transform rotated and jolted all of them at once. The names now draw in world space after the ranch; only
// the label of the site whose overgrowth is being cleared jolts with each strike.
function siteLabelsInWorldB137(){return true}
function drawSiteLabelsB137(t){
 const w=ranchWorldB100,a=w.b109Action,hitSite=a&&a.phase==='work'&&a.target?.site,swing=a?(a.t*2.5)%1:0;
 for(const id in B106_LABEL_Y){
  if(siteOpenB106(id)&&!B106_OBSTACLES.some(o=>o.site===id&&obstacleStandingB106(o)))continue;
  const st=stationB100(id),jolt=id===hitSite&&swing<.18?Math.sin(swing/.18*Math.PI)*4*-a.side:0;
  labelB100(st.x+jolt,st.y-B106_LABEL_Y[id],B100_GAMES[id].title,`${B99_DRILLS[id].stat} Lv ${ranchB99.stats[id]}`);
 }
}
const drawRanchBeforeB137=drawRanchB100;
drawRanchB100=function(...a){
 const out=drawRanchBeforeB137(...a),w=ranchWorldB100;if(!w.active)return out;
 X.save();X.translate(Math.round(W/2-w.cam.x),Math.round(H/2-w.cam.y));drawSiteLabelsB137(performance.now()/1000);X.restore();
 return out;
};
