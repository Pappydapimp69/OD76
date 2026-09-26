// B117 Setup paused (shipped inside B117). "More Supportive" no longer makes Pip prepare openings (the gold
// diamond joint strike and the flank lure) at any level; Emergency Return stays. The Setup code is kept and
// comes back by setting pipSetupOnB117u=true.
let pipSetupOnB117u=false;
const planSetupBeforeB117u=planSetupB59;
planSetupB59=function(...a){if(pipSetupOnB117u)return planSetupBeforeB117u(...a)};
const markSetupBeforeB117u=markSetupB59;
markSetupB59=function(...a){return pipSetupOnB117u?markSetupBeforeB117u(...a):false};
const emotionalNextBeforeB117u=emotionalNextText;
emotionalNextText=function(kind){
  const t=emotionalNextBeforeB117u(kind);if(kind!=='support'||pipSetupOnB117u)return t;
  const s=B59_TRAITS.support;return t.replace(`${s.name.toUpperCase()} · ${s.copy} `,'').replace('Next level improves its timing. ','');
};
const renderPauseBeforeB117u=renderAscendedPauseB39;
renderAscendedPauseB39=function(...a){
  const r=renderPauseBeforeB117u(...a),core=$('b39CoreList');
  if(core&&!pipSetupOnB117u)for(const el of [...core.querySelectorAll('.b39-row')])if(/^Setup\b/.test(el.querySelector('b')?.textContent||''))el.remove();
  return r;
};
