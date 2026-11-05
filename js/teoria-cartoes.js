/* "Teoria em figura" (PILOTO): figura-resumo da regra que fundamenta a resposta; substitui a justificativa escrita nas questões que a têm.
   Montada a partir do TEXTO DA LEI CARREGADO na plataforma e conferida antes de entrar aqui.
   Chave: matéria (regex) + número da questão no arquivo da lista.
   regra: {i|palavra} marca a palavra-chave com a cor do ponto i; pontos[i] = { ico, t, d }. */
const TEORIA_CARTOES = [
  { m:/tribut/i, n:24, titulo:'Conceito de tributo', base:'CTN, art. 3º',
    regra:'Tributo é toda {0|prestação pecuniária} {1|compulsória}, em moeda ou cujo valor nela se possa exprimir, que {2|não constitua sanção de ato ilícito}, {3|instituída em lei} e cobrada mediante {4|atividade administrativa plenamente vinculada}.',
    pontos:[ { ico:'💰', t:'Pecuniária', d:'em moeda, ou valor que nela se possa exprimir' }, { ico:'🔒', t:'Compulsória', d:'não depende da vontade de quem paga' }, { ico:'🚫', t:'Não é sanção', d:'multa por ato ilícito não é tributo' }, { ico:'📜', t:'Instituída em lei', d:'sem lei, sem tributo' }, { ico:'⛓️', t:'Atividade plenamente vinculada', d:'a cobrança não admite escolha do agente' } ],
    armadilha:'Chamar de tributo uma multa (sanção de ato ilícito) ou uma prestação "voluntária".' },
];

// código do enunciado (FNV-1a do texto sem acentos/pontuação): distingue questões que repetem o mesmo número na lista
function _ctHash(txt){
  const s = String(txt||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'');
  let h = 0x811c9dc5;
  for(let i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(36);
}
function teoriaCartaoDaQuestao(q){
  if(!q) return null;
  const n = Number(q.n), mat = String(q.materia||'');
  let hq = null;
  return TEORIA_CARTOES.find(c => {
    if(c.n !== n || !c.m.test(mat)) return false;
    if(!c.h) return true;
    if(hq === null) hq = _ctHash(q.q);
    return c.h === hq;
  }) || null;
}
function _ctRegraHtml(txt){
  let out = '', i = 0; const re = /\{(\d)\|([^}]+)\}/g; let m;
  while((m = re.exec(txt))){ out += esc(txt.slice(i, m.index)) + `<mark class="ct-k ct-c${Number(m[1])%5}">${esc(m[2])}</mark>`; i = m.index + m[0].length; }
  return out + esc(txt.slice(i));
}
function cartaoTeoriaHtml(q){
  const c = teoriaCartaoDaQuestao(q); if(!c) return '';
  const nums = (c.numeros||[]).map(x=>`<div class="ct-num"><b>${esc(x.v)}</b><span>${esc(x.r)}</span></div>`).join('');
  const pontos = c.pontos.map((p,i)=>`<li class="ct-ponto ct-c${i%5}"><span class="ct-ico" aria-hidden="true">${esc(p.ico||String(i+1))}</span><div><b>${esc(p.t)}</b><span>${esc(p.d)}</span></div></li>`).join('');
  return `<section class="cartao-teoria" aria-label="Teoria em figura: ${esc(c.titulo)}">
    <header><span class="ct-selo">🗂️ Teoria em figura</span><h4>${esc(c.titulo)}</h4></header>
    <p class="ct-regra">${_ctRegraHtml(c.regra)}</p>
    ${nums ? `<div class="ct-nums">${nums}</div>` : ''}
    <ol class="ct-pontos ct-n${Math.min(c.pontos.length,5)}">${pontos}</ol>
    <div class="ct-arm"><span aria-hidden="true">⚠️</span><div><b>Armadilha</b> ${esc(c.armadilha)}</div></div>
    <footer>${c.ext ? `Fonte externa: ${esc(c.ext.nome)}${/^https:\/\//.test(c.ext.url||'') ? ` · <a href="${esc(c.ext.url)}" target="_blank" rel="noopener noreferrer">abrir</a>` : ''} · trecho: “${esc(c.ext.trecho)}” · resumo gerado por IA; confira na fonte.` : `Resumo do texto da lei carregado na plataforma (${esc(c.base)}) · gerado por IA, conferido; veja o dispositivo completo no pop-up ⚖️.`}</footer>
  </section>`;
}

// "Resolução em figura": nas questões SEM cartão de teoria, a justificativa escrita (📌 🔑 ⚖️ ⚠️ 🪤 💡) vira a mesma figura:
// regra com as palavras-chave (🔑) em cores, pontos de atenção e faixa de armadilha. Usa só o texto que já está na lista.
function _crLimpa(t){ return String(t||'').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uE000-\uF8FF\u200B-\u200F\u2060\uFE0E\uFE0F\uFEFF]/g,'').replace(/==/g,'').replace(/\*\*/g,'').replace(/~~/g,'').replace(/\s+/g,' ').trim(); }
function _crRegraHtml(txt, chaves){
  const marcas = [];
  chaves.slice(0,5).forEach((k, i) => {
    if(!k || k.length < 3) return;
    const pos = txt.toLowerCase().indexOf(k.toLowerCase());
    if(pos < 0) return;
    if(marcas.some(m => pos < m.fim && pos + k.length > m.ini)) return;
    marcas.push({ ini:pos, fim:pos + k.length, i });
  });
  marcas.sort((a,b) => a.ini - b.ini);
  let out = '', cur = 0;
  marcas.forEach(m => { out += esc(txt.slice(cur, m.ini)) + `<mark class="ct-k ct-c${m.i%5}">${esc(txt.slice(m.ini, m.fim))}</mark>`; cur = m.fim; });
  return out + esc(txt.slice(cur));
}
function cartaoResolucaoHtml(q){
  if(!q || typeof textoResolucaoAtualizado !== 'function') return '';
  if(typeof EDICOES_USUARIO !== 'undefined' && EDICOES_USUARIO[q.uid] && EDICOES_USUARIO[q.uid].r) return '';   // edição do usuário: mostra o texto dele
  if(typeof alteracaoComTrecho === 'function' && alteracaoComTrecho(q)) return '';                                // aviso de alteração legal: mantém o texto
  const linhas = String(textoResolucaoAtualizado(q) || '').split(/\n/).map(l => l.trim()).filter(Boolean);
  const pega = (re) => { const l = linhas.find(x => re.test(x)); return l ? _crLimpa(l.replace(re, '')) : ''; };
  const regra = pega(/^📌\s*/u);
  if(!regra) return '';
  const chaves = pega(/^🔑\s*/u).split(/\s*[·|]\s*/).map(_crLimpa).filter(Boolean);
  const base = pega(/^⚖\uFE0F?\s*/u), atencao = pega(/^⚠\uFE0F?(?!\s*ERROS)\s*/u), arm = pega(/^🪤\s*/u), macete = pega(/^💡\s*/u);
  const pontos = [];
  if(base) pontos.push({ ico:'⚖️', t:'Base legal', d:base });
  if(atencao && !/^ERROS\b/.test(atencao)) pontos.push({ ico:'⚠️', t:'Atenção', d:atencao });
  if(macete) pontos.push({ ico:'💡', t:'Macete', d:macete });
  const lis = pontos.map((p, i) => `<li class="ct-ponto ct-c${i%5}"><span class="ct-ico" aria-hidden="true">${esc(p.ico)}</span><div><b>${esc(p.t)}</b><span>${esc(p.d)}</span></div></li>`).join('');
  return `<section class="cartao-teoria ct-resumo" aria-label="Resolução em figura">
    <header><span class="ct-selo">🗂️ Resolução em figura</span></header>
    <p class="ct-regra">${_crRegraHtml(regra, chaves)}</p>
    ${lis ? `<ol class="ct-pontos ct-n${Math.min(pontos.length,5)}">${lis}</ol>` : ''}
    ${arm ? `<div class="ct-arm"><span aria-hidden="true">⚠️</span><div><b>Armadilha</b> ${esc(arm)}</div></div>` : ''}
  </section>`;
}
