// v8: index.html is the Practice Studio app itself (no redirect to script.google.com). Full browser tests live in studio-app/tests/v80_pages_test.js.
const h=require('fs').readFileSync(__dirname+'/index.html','utf8'); let ok=true; const t=(c,m)=>{ok&=!!c;console.log(c?'PASS':'FAIL',m);};
t(/credentials:'omit'/.test(h),'fetch uses credentials omit'); t(/'Content-Type':'text\/plain/.test(h),'text/plain POST (no preflight)');
t(/practiceQ/.test(h),'home-screen practiceQ fallback'); t(!/location\.(replace|href\s*=)[^;]*EXEC/.test(h),'never navigates to the exec page');
t(/rel="manifest"/.test(h)&&/apple-touch-icon/.test(h),'icon + manifest'); t(/id="a2hs"|a2hs/.test(h),'dismissible add-to-home tip');
process.exit(ok?0:1);
