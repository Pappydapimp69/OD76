
// B147 Analytics send only when an arena run ends. Every event is still built and logged locally the same way, but
// it waits in a pending batch; the batch goes to GoatCounter when the run ends (Pip falls, or the player heads
// home and the run is banked). No page-load hit. Events from the ranch or menus ride along with the next run end;
// anything pending when the page closes is dropped. The 600-per-session cap still applies to what's sent.
const pendingB147=[];
trackB136=function(parts,title){
 const path='od76/'+parts.map(slugB136).join('/');
 analyticsLogB136.push(path);if(analyticsLogB136.length>800)analyticsLogB136.shift();
 if(!analyticsOnB136())return;
 pendingB147.push({path,title:title||path,event:true});if(pendingB147.length>B136_CAP)pendingB147.shift();
};
function flushAnalyticsB147(){
 if(!analyticsOnB136())return 0;let n=0;
 while(pendingB147.length&&sentB136<B136_CAP){const ev=pendingB147.shift();sentB136++;n++;if(window.goatcounter?.count)window.goatcounter.count(ev);else queueB136.push(ev)}
 return n;
}
const finishBeforeB147=finish;
finish=function(...a){const out=finishBeforeB147(...a);setTimeout(flushAnalyticsB147,0);return out};
const bankBeforeB147=bankRunB99;
bankRunB99=function(...a){const out=bankBeforeB147(...a);setTimeout(flushAnalyticsB147,0);return out};
