/* Cartão comparativo (v357): em item Errado cujo Trecho × Correção trocam um número, prazo, percentual ou quórum
   (ex.: 90 dias → 60 dias; maioria absoluta → 2/3), mostra "No item × Correto" junto da resolução. Quando o Trecho vem
   de norma alterada (armadilha NORMA), vira "Antes · revogado × Agora · vigente". Tudo é desenhado aqui (HTML/CSS),
   sem imagem e sem custo; usa os campos Trecho/Correção que já existem e sincronizam com a nuvem. */
const _CC_UNI = { um:1, uma:1, dois:2, duas:2, 'três':3, tres:3, quatro:4, cinco:5, seis:6, sete:7, oito:8, nove:9, dez:10, onze:11, doze:12, treze:13, quatorze:14, quinze:15, dezesseis:16, dezessete:17, dezoito:18, dezenove:19, vinte:20, trinta:30, quarenta:40, cinquenta:50, sessenta:60, setenta:70, oitenta:80, noventa:90, cem:100, cento:100 };
const _CC_PAL = Object.keys(_CC_UNI).sort((a,b)=>b.length-a.length).join('|');
const _CC_NUM = `(?:\\d{1,3}(?:\\.\\d{3})+|\\d+)(?:,\\d+)?|(?:cento e )?(?:${_CC_PAL})(?: e (?:${_CC_PAL}))?`;
const _CC_UN = 'dias úteis|dias corridos|dias|dia|meses|mês|anos|ano|horas|hora|minutos|semanas|vezes|por cento|%|salários mínimos|salário mínimo|membros|conselheiros|deputados|auditores|procuradores|vagas|parcelas|cargos|reais';
const _CC_RE_QTD = new RegExp(`(?<![\\wÀ-ÿ])(${_CC_NUM})\\s*(?:\\(\\d+\\)\\s*)?(${_CC_UN})(?![\\wÀ-ÿ])`, 'i');
const _CC_RE_QUO = /(dois terços|2\/3|três quintos|3\/5|um terço|1\/3|um quinto|quatro quintos|maioria absoluta|maioria simples|maioria qualificada|unanimidade|metade)/i;
const _CC_FRAC = { 'dois terços':'2/3', 'três quintos':'3/5', 'um terço':'1/3', 'um quinto':'1/5', 'quatro quintos':'4/5' };
function cartaoValor(txt){
  txt = String(txt||'');
  const mq = txt.match(_CC_RE_QUO);
  const m = txt.match(_CC_RE_QTD);
  // vale o que aparece primeiro no trecho
  if(mq && (!m || mq.index <= m.index)){ const k = mq[1].toLowerCase(); return { big: _CC_FRAC[k] || (k==='2/3'||k==='3/5'||k==='1/3'||k==='1/5'||k==='4/5' ? k : k.charAt(0).toUpperCase()+k.slice(1)), un:'', texto: !(_CC_FRAC[k]||/\//.test(k)) }; }
  if(m){
    let n = String(m[1]).toLowerCase(), v;
    if(/^\d/.test(n)) v = n.replace(/\.(?=\d{3})/g,'');
    else { const ps = n.replace(/^cento e /,'cento + ').split(/ e |\s\+\s/).map(p=>p.trim()); v = String(ps.reduce((a,p)=> a + (p==='cento' && ps.length>1 ? 100 : (_CC_UNI[p]||0)), 0)); }
    let un = m[2].toLowerCase(); if(un==='por cento') un = '%';
    return { big: v, un, texto:false };
  }
  return null;
}
function cartaoPares(q){
  if(!q || q.t!=='CE' || typeof armEfetiva!=='function') return [];
  const a = armEfetiva(q);
  if(!a || !a.errado || !a.trecho || !a.correcao) return [];
  const tr = String(a.trecho).split(' | '), co = String(a.correcao).split(' | ');
  const out = [];
  tr.forEach((t,i)=>{
    const c = co[i] || (tr.length===1 ? co[0] : ''); const vt = cartaoValor(t), vc = cartaoValor(c);
    if(vt && vc && (vt.big!==vc.big || vt.un!==vc.un) && !out.some(o=>o.erro.big===vt.big && o.erro.un===vt.un)) out.push({ erro: vt, certo: vc, trecho: t, correcao: c, norma: a.p==='NORMA' });
  });
  return out.slice(0,2);
}
function _ccLado(v, cls, rot, ref){
  const grande = v.texto || String(v.big).length > 5;
  return `<div class="cc-lado cc-${cls}"><span class="cc-selo" aria-hidden="true">${cls==='antes' ? '✕' : '✓'}</span><div class="cc-rot">${esc(rot)}</div><div class="cc-num${grande ? ' cc-num-txt' : ''}">${esc(v.big)}</div>${v.un ? `<div class="cc-un">${esc(v.un)}</div>` : '<div class="cc-un">&nbsp;</div>'}${ref ? `<div class="cc-ref">${esc(ref)}</div>` : ''}</div>`;
}
function cartaoComparativoHtml(q){
  let pares = []; try{ pares = cartaoPares(q); }catch(_){ return ''; }
  if(!pares.length) return '';
  let topo = ''; try{ const r = (refsArtigosDaQuestao(q)||[])[0]; if(r && r.n) topo = `⚖️ <b>Art. ${esc(String(r.n))}</b>${r.norma ? " · "+esc(String(r.norma)) : ""}`; }catch(_){}
  return pares.map(p=>`<div class="cartao-comp" role="group" aria-label="Comparativo: ${esc(p.erro.big+' '+p.erro.un)} e ${esc(p.certo.big+' '+p.certo.un)}">
    ${topo ? `<div class="cc-topo">${topo}</div>` : ''}
    <div class="cc-par">${_ccLado(p.erro,'antes', p.norma ? 'Antes · revogado' : 'No item · errado')}<div class="cc-seta" aria-hidden="true">➜</div>${_ccLado(p.certo,'agora', p.norma ? 'Agora · vigente' : 'Correto')}</div>
    <div class="cc-rod">Trecho do item: <mark>${esc(p.trecho)}</mark></div>
  </div>`).join('');
}
