/* Cartão comparativo (v357): em item Errado cujo Trecho × Correção trocam um número, prazo, percentual ou quórum
   (ex.: 90 dias → 60 dias; maioria absoluta → 2/3), mostra "No item × Correto" junto da resolução. Quando o Trecho vem
   de norma alterada (armadilha NORMA), vira "Antes · revogado × Agora · vigente". Tudo é desenhado aqui (HTML/CSS),
   sem imagem e sem custo; usa os campos Trecho/Correção que já existem e sincronizam com a nuvem. */
const _CC_UNI = { um:1, uma:1, dois:2, duas:2, 'três':3, tres:3, quatro:4, cinco:5, seis:6, sete:7, oito:8, nove:9, dez:10, onze:11, doze:12, treze:13, quatorze:14, quinze:15, dezesseis:16, dezessete:17, dezoito:18, dezenove:19, vinte:20, trinta:30, quarenta:40, cinquenta:50, sessenta:60, setenta:70, oitenta:80, noventa:90, cem:100, cento:100 };
const _CC_PAL = Object.keys(_CC_UNI).sort((a,b)=>b.length-a.length).join('|');
const _CC_NUM = `(?:\\d{1,3}(?:\\.\\d{3})+|\\d+)(?:,\\d+)?|(?:cento e )?(?:${_CC_PAL})(?: e (?:${_CC_PAL}))?`;
const _CC_UN = 'dias úteis|dias corridos|dias|dia|meses|mês|anos|ano|horas|hora|minutos|semanas|vezes|por cento|%|salários mínimos|salário mínimo|membros|conselheiros|deputados|auditores|procuradores|vagas|parcelas|cargos|reais';
const _CC_RE_QTD = new RegExp(`(?<![\\wÀ-ÿ])(${_CC_NUM})(?:\\s+(?:a|até|e)\\s+(${_CC_NUM}))?\\s*(?:\\(\\d+\\)\\s*)?(${_CC_UN})(?![\\wÀ-ÿ])`, 'i');
const _CC_RE_QUO = /(dois terços|2\/3|três quintos|3\/5|um terço|1\/3|um quinto|quatro quintos|maioria absoluta|maioria simples|maioria qualificada|unanimidade|metade)/i;
const _CC_FRAC = { 'dois terços':'2/3', 'três quintos':'3/5', 'um terço':'1/3', 'um quinto':'1/5', 'quatro quintos':'4/5' };
function cartaoValor(txt){
  txt = String(txt||'');
  const mq = txt.match(_CC_RE_QUO);
  const m = txt.match(_CC_RE_QTD);
  // vale o que aparece primeiro no trecho
  if(mq && (!m || mq.index <= m.index)){ const k = mq[1].toLowerCase(); return { big: _CC_FRAC[k] || (k==='2/3'||k==='3/5'||k==='1/3'||k==='1/5'||k==='4/5' ? k : k.charAt(0).toUpperCase()+k.slice(1)), un:'', texto: !(_CC_FRAC[k]||/\//.test(k)) }; }
  if(m){
    const num = x=>{ x = String(x).toLowerCase(); if(/^\d/.test(x)) return x.replace(/\.(?=\d{3})/g,''); const ps = x.replace(/^cento e /,'cento + ').split(/ e |\s\+\s/).map(p=>p.trim()); return String(ps.reduce((a,p)=> a + (p==='cento' && ps.length>1 ? 100 : (_CC_UNI[p]||0)), 0)); };
    let un = m[3].toLowerCase(); if(un==='por cento') un = '%';
    return { big: m[2] ? num(m[1])+'–'+num(m[2]) : num(m[1]), un, texto:false };
  }
  return null;
}
/* troca de termos: diff por palavras entre o Trecho (errado) e a Correção; só quando a mudança é pontual */
function _ccNorm(w){ return w.toLowerCase().replace(/[^\wÀ-ÿ%\/]/g,''); }
function cartaoDiff(a, b, o){
  o = o || {};
  const A = String(a||'').trim().split(/\s+/).filter(Boolean), B = String(b||'').trim().split(/\s+/).filter(Boolean);
  const MAXT = o.maxTokens || 60; if(!A.length || !B.length || A.length>MAXT || B.length>MAXT) return null;
  const n = A.length, m = B.length, L = Array.from({length:n+1}, ()=>new Array(m+1).fill(0));
  for(let i=n-1;i>=0;i--) for(let j=m-1;j>=0;j--) L[i][j] = _ccNorm(A[i])===_ccNorm(B[j]) ? L[i+1][j+1]+1 : Math.max(L[i+1][j], L[i][j+1]);
  const ea = A.map(w=>({w, d:true})), eb = B.map(w=>({w, d:true}));
  let i=0, j=0;
  while(i<n && j<m){
    if(_ccNorm(A[i])===_ccNorm(B[j])){ ea[i].d = false; eb[j].d = false; i++; j++; }
    else if(L[i+1][j] >= L[i][j+1]) i++; else j++;
  }
  const da = ea.filter(x=>x.d).length, db = eb.filter(x=>x.d).length;
  const MAXC = o.max || 6, RAT = o.ratio || 0.4;
  if(!da || !db || da>MAXC || db>MAXC || (Math.max(n,m)>4 && L[0][0] < RAT*Math.max(n,m))) return null;
  return { a: ea, b: eb };
}
function _ccJanela(lista){
  // frase longa: mostra só o entorno da mudança
  const idx = lista.map((x,i)=>x.d?i:-1).filter(i=>i>=0);
  if(lista.length <= 24) return { itens: lista, ini:false, fim:false };
  const i0 = Math.max(0, idx[0]-6), i1 = Math.min(lista.length, idx[idx.length-1]+7);
  return { itens: lista.slice(i0, i1), ini: i0>0, fim: i1<lista.length };
}
function cartaoPares(q){
  if(!q || q.t!=='CE' || typeof armEfetiva!=='function') return [];
  const a = armEfetiva(q);
  if(!a || !a.errado || !a.trecho || !a.correcao) return [];
  const tr = String(a.trecho).split(' | '), co = String(a.correcao).split(' | ');
  const out = [];
  tr.forEach((t,i)=>{
    const c = co[i] || (tr.length===1 ? co[0] : ''); const vt = cartaoValor(t), vc = cartaoValor(c);
    if(vt && vc && (vt.big!==vc.big || vt.un!==vc.un) && !out.some(o=>o.erro && o.erro.big===vt.big && o.erro.un===vt.un)) out.push({ erro: vt, certo: vc, trecho: t, correcao: c, norma: a.p==='NORMA' });
    else if(!(vt && vc)){ const df = cartaoDiff(t, c); if(df) out.push({ diff: df, trecho: t, correcao: c, norma: a.p==='NORMA' }); }
  });
  return out.sort((x,y)=> (x.erro?0:1)-(y.erro?0:1)).slice(0,2);
}
function _ccLado(v, cls, rot, ref){
  const grande = v.texto || String(v.big).length > 5;
  return `<div class="cc-lado cc-${cls}"><span class="cc-selo" aria-hidden="true">${cls==='antes' ? '✕' : '✓'}</span><div class="cc-rot">${esc(rot)}</div><div class="cc-num${grande ? ' cc-num-txt' : ''}">${esc(v.big)}</div>${v.un ? `<div class="cc-un">${esc(v.un)}</div>` : '<div class="cc-un">&nbsp;</div>'}${ref ? `<div class="cc-ref">${esc(ref)}</div>` : ''}</div>`;
}
/* múltipla escolha: alternativa certa × a que o aluno marcou (ou a mais parecida) */
function _ccPalavras(t){ return new Set(String(t||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').match(/[a-z0-9]{4,}/g)||[]); }
function cartaoMc(q, picked){
  if(!q || q.t!=='MC' || !Array.isArray(q.alt) || typeof gabaritoEfetivo!=='function') return null;
  const g = String(gabaritoEfetivo(q)||'').toUpperCase();
  const certa = q.alt.find(a=>String(a.letra).toUpperCase()===g); if(!certa) return null;
  const pk = String(picked||'').toUpperCase();
  let errada = null, tipo = '';
  if(pk && pk!==g){ errada = q.alt.find(a=>String(a.letra).toUpperCase()===pk); tipo = 'Sua resposta'; }
  if(!errada){
    const wc = _ccPalavras(certa.texto); let best = 0;
    q.alt.forEach(a=>{ if(String(a.letra).toUpperCase()===g) return; const wa = _ccPalavras(a.texto); let c = 0; wa.forEach(w=>{ if(wc.has(w)) c++; }); const j = c / Math.max(1, wc.size + wa.size - c); if(j > best){ best = j; errada = a; } });
    if(best < 0.25) errada = null; tipo = 'Mais parecida';
  }
  if(!errada) return null;
  const df = cartaoDiff(errada.texto, certa.texto, { max:8, ratio:0.3, maxTokens:45 });
  if(!df) return null;
  return { diff: df, rotA: `${tipo} · ${String(errada.letra).toUpperCase()}`, rotB: `Certa · ${g}` };
}
function cartoesAtivos(){ return !(typeof STATE!=='undefined' && STATE.cartoes===false); }
function alternarCartoes(){
  STATE.cartoes = !cartoesAtivos();
  try{ storageSet(CARTOES_KEY, STATE.cartoes ? '1' : '0').catch(()=>{}); }catch(_){}
  if(typeof sincronizarPrefs==='function') sincronizarPrefs();
  render();
}
function cartoesBotaoHtml(){
  const on = cartoesAtivos();
  return `<button type="button" class="cartoes-switch${on ? ' on' : ''}" id="btn-cartoes" aria-pressed="${on}" title="Cartões comparativos: ${on ? 'ligados (clique para ocultar)' : 'desligados (clique para mostrar)'}">📊</button>`;
}
/* quadro de números do artigo (pop-up da lei): todo prazo, percentual e quórum do texto, com o dispositivo de origem */
const _CC_RE_QTD_G = new RegExp(_CC_RE_QTD.source, 'gi'), _CC_RE_QUO_G = new RegExp(_CC_RE_QUO.source, 'gi');
function _ccRotuloDisp(p, i){
  p = String(p).trim();
  if(i===0) return 'caput';
  let m; if((m = p.match(/^§\s*(\d+)/))) return '§ '+m[1]+'º';
  if(/^Parágrafo único/i.test(p)) return 'par. único';
  if((m = p.match(/^([IVXLC]+)\s*[–-]/))) return 'inc. '+m[1];
  if((m = p.match(/^([a-z])\)/))) return 'al. '+m[1];
  return '';
}
function quadroNumerosArtigo(ps){
  if(!Array.isArray(ps) || ps.length<1) return '';
  const itens = [], vistos = new Set();
  ps.forEach((p,i)=>{
    const txt = String(p).replace(/\((?:Reda[çc][ãa]o|Inclu[ií]d|Revogad|Alterad|Acrescid|Vide|Vig[êe]ncia|Produ[çc][ãa]o|Regulament|Promulga|Vetad|Execu[çc]|Parágrafo [A-Za-z]+|Inciso [A-Za-z]+|Artigo [A-Za-z]+)[^)]*\)/gi,'');
    const rot = _ccRotuloDisp(p, i);
    const achados = [];
    let m; _CC_RE_QTD_G.lastIndex = 0; while((m = _CC_RE_QTD_G.exec(txt))){ const v = cartaoValor(m[0]); if(v) achados.push({ idx:m.index, v }); }
    _CC_RE_QUO_G.lastIndex = 0; while((m = _CC_RE_QUO_G.exec(txt))){ const v = cartaoValor(m[0]); if(v) achados.push({ idx:m.index, v }); }
    achados.sort((a,b)=>a.idx-b.idx).forEach(a=>{ const k = rot+'|'+a.v.big+'|'+a.v.un; if(vistos.has(k)) return; vistos.add(k); itens.push({ rot, v:a.v }); });
  });
  if(itens.length < 2) return '';
  return `<details class="lei-quadro" open><summary>📊 Prazos e números deste artigo <span class="qn-qtd">${itens.length}</span></summary><div class="qn-grade">${itens.slice(0,16).map(x=>`<span class="qn-chip"><b>${esc(x.v.big)}${x.v.un ? ' '+esc(x.v.un) : ''}</b>${x.rot ? `<em>${esc(x.rot)}</em>` : ''}</span>`).join('')}</div></details>`;
}
function _ccFrase(lista, cls){
  const w = _ccJanela(lista);
  const tag = cls==='antes' ? 'del' : 'ins';
  return (w.ini ? '… ' : '') + w.itens.map(x=> x.d ? `<${tag} class="cc-${tag}">${esc(x.w)}</${tag}>` : esc(x.w)).join(' ') + (w.fim ? ' …' : '');
}
function _ccLadoTxt(lista, cls, rot){
  return `<div class="cc-lado cc-${cls}"><span class="cc-selo" aria-hidden="true">${cls==='antes' ? '✕' : '✓'}</span><div class="cc-rot">${esc(rot)}</div><div class="cc-frase">${_ccFrase(lista, cls)}</div></div>`;
}
function cartaoComparativoHtml(q, picked){
  if(!cartoesAtivos()) return '';
  let pares = []; try{ pares = q && q.t==='MC' ? [cartaoMc(q, picked)].filter(Boolean) : cartaoPares(q); }catch(_){ return ''; }
  if(!pares.length) return '';
  let topo = ''; try{ const r = (refsArtigosDaQuestao(q)||[])[0]; if(r && r.n) topo = `⚖️ <b>Art. ${esc(String(r.n))}</b>${r.norma ? " · "+esc(String(r.norma)) : ""}`; }catch(_){}
  return pares.map(p=>{
    const rotA = p.rotA || (p.norma ? 'Antes · revogado' : 'No item · errado'), rotB = p.rotB || (p.norma ? 'Agora · vigente' : 'Correto');
    if(p.diff) return `<div class="cartao-comp cc-troca" role="group" aria-label="Troca de termos">
    ${topo ? `<div class="cc-topo">${topo}</div>` : ''}
    <div class="cc-par">${_ccLadoTxt(p.diff.a,'antes',rotA)}<div class="cc-seta" aria-hidden="true">➜</div>${_ccLadoTxt(p.diff.b,'agora',rotB)}</div>
  </div>`;
    return `<div class="cartao-comp" role="group" aria-label="Comparativo: ${esc(p.erro.big+' '+p.erro.un)} e ${esc(p.certo.big+' '+p.certo.un)}">
    ${topo ? `<div class="cc-topo">${topo}</div>` : ''}
    <div class="cc-par">${_ccLado(p.erro,'antes', rotA)}<div class="cc-seta" aria-hidden="true">➜</div>${_ccLado(p.certo,'agora', rotB)}</div>
    <div class="cc-rod">Trecho do item: <mark>${esc(p.trecho)}</mark></div>
  </div>`; }).join('') + `<button type="button" class="cc-ocultar" data-cartoes-toggle title="Ocultar os cartões comparativos (religue no botão 📊 do topo)">ocultar cartões</button>`;
}
