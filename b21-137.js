
// B125 patch 7: Supportive lengthens the dash. +10% distance at Supportive Lv 1, 3 and 5 (30% total), then +2%
// at every other level after (Lv 7, 9, 11 …). Dash time is unchanged, so the dash is faster and goes further.
function dashBonusB131(lv=S?.pipSupport||0){lv=Math.max(0,Math.floor(lv));let b=0;for(const at of [1,3,5])if(lv>=at)b+=.1;if(lv>=7)b+=.02*(Math.floor((lv-7)/2)+1);return b}
const dashVectorBeforeB131=dashVector;
dashVector=function(dx,dy){
  const ok=dashVectorBeforeB131(dx,dy);
  if(ok&&S){const m=1+dashBonusB131();P.vx*=m;P.vy*=m}
  return ok;
};
const emotionalNextBeforeB131=emotionalNextText;
emotionalNextText=function(kind){
  const t=emotionalNextBeforeB131(kind);if(kind!=='support')return t;
  const now=dashBonusB131(),next=dashBonusB131((S?.pipSupport||0)+1);
  return next>now?`${t} Dash +${Math.round(now*100)}% → +${Math.round(next*100)}% distance.`:`${t} Dash distance +${Math.round(now*100)}%.`;
};
