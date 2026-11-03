const h=require('fs').readFileSync('index.html','utf8');
const [s1,s2]=[...h.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
function run(q,sa,mm){let r=null;const el={msg:{textContent:(h.match(/id="msg">([^<]*)/)[1]).replace(/&gt;/g,'>')},open:{href:'',hidden:true}};
 const location={search:q,replace:u=>r=u},navigator={standalone:sa},window={matchMedia:()=>({matches:mm})},document={getElementById:i=>el[i]};
 eval(s1+';'+s2);return {redirect:r,msg:el.msg.textContent,btn:el.open.hidden?null:el.open.href};}
const E='https://script.google.com/macros/s/AKfycbyMPRITU61iRr4agd74rxP9xZCZcVi4_6SSvgzfFxV35x9jOU803sXkD6xmv19_zXeO/exec',Q='?s=TESTTOKEN0000000';
const c=[['safari tab',run(Q,false,false),o=>!o.redirect&&o.btn===E+Q&&/tap Share/.test(o.msg)],
['standalone iOS',run(Q,true,false),o=>o.redirect===E+Q],
['standalone display-mode',run(Q,undefined,true),o=>o.redirect===E+Q],
['no query safari',run('',false,false),o=>!o.redirect&&!o.btn&&/Open your Practice Studio link/.test(o.msg)],
['no query standalone',run('',true,false),o=>!o.redirect&&!o.btn]];
let ok=true;for(const [n,o,f] of c){const p=f(o);ok&=p;console.log(p?'PASS':'FAIL',n,JSON.stringify(o));}process.exit(ok?0:1);
