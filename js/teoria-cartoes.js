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

function teoriaCartaoDaQuestao(q){
  if(!q) return null;
  const n = Number(q.n);
  return TEORIA_CARTOES.find(c => c.n === n && c.m.test(String(q.materia||''))) || null;
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
    <footer>Resumo do texto da lei carregado na plataforma (${esc(c.base)}) · gerado por IA, conferido; veja o dispositivo completo no pop-up ⚖️.</footer>
  </section>`;
}
