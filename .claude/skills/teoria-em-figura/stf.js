// busca texto literal na API pública de jurisprudência do STF. Uso: node stf.js sumula 323 | sv 31 | tema 69 | busca "termo" [base]
const https=require('https');
function post(body){const {execFileSync}=require('child_process');const o=execFileSync('curl',['-s','-m','40','-A','Mozilla/5.0','-H','Content-Type: application/json','-X','POST','https://jurisprudencia.stf.jus.br/api/search/search','-d',JSON.stringify(body)],{maxBuffer:50e6}).toString();try{return Promise.resolve(JSON.parse(o))}catch(e){return Promise.reject(new Error(o.slice(0,200)))}}
const [,,tipo,arg,base]=process.argv;
(async()=>{
 let q;
 if(tipo==='sv')q={bool:{must:[{term:{base:'sumulas'}},{term:{sumula_numero:+arg}},{term:{is_vinculante:true}}]}};
 else if(tipo==='sumula')q={bool:{must:[{term:{base:'sumulas'}},{term:{sumula_numero:+arg}},{term:{is_vinculante:false}}]}};
 else if(tipo==='tema')q={bool:{must:[{term:{base:'acordaos'}},{query_string:{query:'documental_tese_tema_texto:'+arg+' AND documental_tese_tipo:"Repercussão Geral"'}}]}};
 else q={query_string:{query:arg}};
 const r=await post({query:q,size:tipo==='tema'?40:(tipo==='busca'?5:3),_source:['documental_tese_texto','documental_tese_tema_texto','processo_classe_processual_unificada_classe_sigla','base','titulo','sumula_numero','is_vinculante','sumula_texto','tema_numero','tese_texto','titulo','tema_titulo','tema_texto','tese','julgamento_data']});
 if(r.result===undefined){console.log(JSON.stringify(r).slice(0,400));return}
 const vistos=new Set();for(const h of r.result.hits.hits){const s=h._source;if(tipo==='tema'){const tt=String(s.documental_tese_tema_texto||'');if(!tt.startsWith(arg+' -'))continue;const k=tt+s.documental_tese_texto;if(vistos.has(k))continue;vistos.add(k);console.log('--- Tema',tt,'|',s.titulo);console.log('tese:',String(s.documental_tese_texto).replace(/\s+/g,' '));continue}console.log('---',s.base,s.titulo||'',s.tema_numero?'tema '+s.tema_numero:'',s.julgamento_data||'');for(const k of ['sumula_texto','tese_texto','tese','tema_titulo','tema_texto'])if(s[k])console.log(k+':',String(s[k]).replace(/\s+/g,' ').slice(0,700))}
})();
