// valida arquivos de cartões: estrutura + termos marcados/números presentes no texto da lei lida
const fs=require('fs'),vm=require('vm');const {carrega}=require(require('path').resolve(__dirname,'../formatar-resolucoes/lei.js'));
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const stems=s=>norm(s).split(/[^a-z0-9]+/).filter(w=>w.length>=4).map(w=>w.slice(0,5));
let err=0,warn=0;const E=m=>{console.log('ERRO',m);err++},W=m=>{console.log('AVISO',m);warn++};
const lista=fs.readFileSync(process.env.LISTA||(console.error('defina LISTA=<lista.md>'),process.exit(2)),'utf8');
const nums=new Set([...lista.matchAll(/^## QUESTÃO (\d+)/gm)].map(m=>+m[1]));
const cache={};
for(const f of process.argv.slice(2)){
  const C=[];vm.runInNewContext(fs.readFileSync(f,'utf8'),{TEORIA_CARTOES:{push:(...a)=>C.push(...a)}});
  const vistos=new Set();
  for(const c of C){const id=f.split('/').pop()+' n='+(c.pos?('pos '+c.pos):c.n);
    const key=c.pos?('pos'+c.pos):(c.h?c.n+':'+c.h:c.n);if(c.pos){if(!(c.pos>=1&&c.pos<=(+process.env.MAXPOS||198)))E(id+' pos fora do intervalo')}else if(!nums.has(c.n))E(id+' número inexistente');if(vistos.has(key))E(id+' duplicado');vistos.add(key);
    for(const k of['titulo','base','regra','armadilha'])if(!c[k]||typeof c[k]!=='string')E(id+' falta '+k);
    if(!c.m||!c.m.test(process.env.MATERIA||'Direito Tributário'))E(id+' m inválido');
    if(c.ext){if(!c.ext.nome||!/^https:\/\//.test(c.ext.url||'')||!c.ext.trecho||c.ext.trecho.length>260)E(id+' ext inválido')}else if(!Array.isArray(c.fonte)||!c.fonte.length)E(id+' falta fonte');
    const P=c.pontos||[];if(P.length<3||P.length>5)E(id+' pontos 3..5');
    const mk=[...(c.regra||'').matchAll(/\{(\d)\|([^}]+)\}/g)];
    if(mk.length!==P.length||mk.some((m,i)=>+m[1]!==i))E(id+' marcadores ('+mk.length+') != pontos ('+P.length+') ou fora de ordem');
    if((c.regra||'').replace(/\{\d\|/g,'').replace(/\}/g,'').length>320)W(id+' regra longa');
    if((c.regra||'').replace(/[{}|\d]/g,'').match(/[{}]/))E(id+' chaves soltas');
    P.forEach((p,i)=>{if(!p.ico||!p.t||!p.d)E(id+' ponto '+i+' incompleto');if(p.t&&p.t.length>30)W(id+' t longo');if(p.d&&p.d.length>80)W(id+' d longo')});
    if((c.armadilha||'').length>150)W(id+' armadilha longa');
    let txt='';
    for(const [s,a] of (c.fonte||[])){try{const o=cache[s]||(cache[s]=carrega(s));const t=o[String(a)];if(!t)E(id+' fonte não carregada '+s+' '+a);else txt+=' '+t.join(' ')}catch(e){E(id+' fonte '+s)}}
    if(c.ext)txt=c.ext.trecho;
    const base=new Set(stems(txt)),tn=norm(txt);
    mk.forEach(m=>{const bad=stems(m[2]).filter(w=>!base.has(w));if(bad.length)W(id+' marcador "'+m[2]+'" fora da lei: '+bad.join(','))});
    const dig=(c.regra.replace(/\{\d\|/g,'{')+' '+P.map(p=>p.t+' '+p.d).join(' ')+' '+c.armadilha).match(/\d+([.,]\d+)?/g)||[];
    dig.forEach(d=>{if(!tn.includes(d.replace(/\.0+$/,'')))W(id+' número "'+d+'" não está no texto da lei')});
  }
  console.log(f.split('/').pop(),C.length,'cartões');
}
console.log('erros',err,'avisos',warn);process.exit(err?1:0);
