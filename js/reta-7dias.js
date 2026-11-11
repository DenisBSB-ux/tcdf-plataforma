/* ============ RETA FINAL · REVISÃO DE 7 DIAS (matéria por matéria) ============
   Tela padrão da aba Reta Final: um plano curto e direto. Cada dia tem uma lista de matérias; cada matéria é uma sessão de
   ~15 questões montada na hora com (1) seus erros ainda em aberto, (2) as questões que você marcou como Estudar/Revisar e
   (3) as de maior incidência que ainda não domina. O plano (quais matérias em que dia) fica fixo até você refazê-lo ou
   mudar o tempo por dia; só o conteúdo de cada sessão acompanha o seu progresso. Plano guardado neste aparelho.
   O modo completo antigo (Hoje, Caderno de erros, Cartões, Prontidão, Cola de véspera) continua em "Modo completo". */

/* R7-PURO-INI */
const R7_QTD = 15;            // questões por sessão
const R7_MIN_SESSAO = 15;     // minutos por sessão (1 min por questão)
const R7_TEMPOS = [30, 60, 90, 120];

// plano: distribui as matérias pelos dias. stats: [{ mat, score }] (score maior = precisa mais). Devolve { dias:[[mat]], fora:[mat], cap, segunda:[mat] }
//  - cada dia comporta floor(minDia / 15) sessões; as matérias mais fracas vêm nos primeiros dias
//  - a primeira passada é espalhada pelos dias (mais fracas primeiro); sobrando vaga, as mais fracas ganham uma segunda
//    passada, pelo menos 3 dias depois da primeira (2 se o plano for curto)
//  - faltando vaga, as mais fortes ficam de fora (avisa para aumentar o tempo por dia)
function reta7Plano(stats, nDias, minDia){
  nDias = Math.max(1, Math.min(7, Math.floor(nDias) || 1));
  const cap = Math.max(1, Math.floor((minDia || 60) / R7_MIN_SESSAO));
  const slots = nDias * cap;
  const ord = (stats || []).slice().sort((a, b) => (b.score - a.score) || String(a.mat).localeCompare(String(b.mat)));
  const dias = Array.from({ length: nDias }, () => []);
  const primeiroDia = {};
  const dentro = ord.slice(0, slots), fora = ord.slice(slots).map(s => s.mat);
  const base = Math.max(1, Math.ceil(dentro.length / nDias));               // espalha a primeira passada: nenhum dia fica vazio
  dentro.forEach((s, i) => { const d = Math.min(nDias - 1, Math.floor(i / base)); dias[d].push(s.mat); primeiroDia[s.mat] = d; });
  const segunda = [];
  const gap = nDias >= 6 ? 3 : 2;
  if(nDias >= 3){
    dentro.forEach(s => {                                                   // vaga sobrando: segunda passada das mais fracas
      const d0 = primeiroDia[s.mat]; let melhor = -1;
      for(let d = d0 + gap; d < nDias; d++){
        if(dias[d].length < Math.min(cap, base + 2) && !dias[d].includes(s.mat) && (melhor < 0 || dias[d].length < dias[melhor].length)) melhor = d;
      }
      if(melhor >= 0){ dias[melhor].push(s.mat); segunda.push(s.mat); }
    });
  }
  return { dias, fora, cap, segunda };
}
// 'YYYY-MM-DD' no fuso local e diferença em dias inteiros entre duas dessas datas
function reta7Data(ts){ const d = new Date(ts); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }
function reta7DiffDias(a, b){ const pa = a.split('-').map(Number), pb = b.split('-').map(Number); return Math.round((Date.UTC(pb[0], pb[1]-1, pb[2]) - Date.UTC(pa[0], pa[1]-1, pa[2])) / 86400000); }
function reta7SomaDias(a, n){ const p = a.split('-').map(Number); return reta7Data(new Date(p[0], p[1]-1, p[2] + n).getTime()); }
/* R7-PURO-FIM */

/* ---------- dados de cada matéria ---------- */
function reta7Stats(mat){
  const qs = retaQuestoes([mat]); if(qs.length < 5) return null;
  const b = getBucket(mat), perg = b.perguntas || {};
  let resp = 0, certas = 0, altaFraca = 0;
  qs.forEach(q => {
    const p = perg[q.uid]; const c = retaChance(p, false);
    if(c !== null){ resp++; certas += c; }
    if(retaPeso(q) === 3 && (c === null || c < 0.7)) altaFraca++;
  });
  const acerto = resp ? certas / resp : null, cob = resp / qs.length;
  const erros = retaErros([mat]).filter(e => e.nivel < 3).length;
  const marcadas = ['teoria', 'revisar'].reduce((s, n) => s + estudoMarcadas(mat, n).length, 0);
  // quanto mais fraco, mais cobertura faltando e mais erros em aberto, maior a nota
  const score = 0.55 * (1 - (acerto === null ? 0.4 : acerto)) + 0.25 * (1 - cob) + 0.20 * Math.min(1, erros / 20);
  return { mat, total:qs.length, resp, acerto, cob, erros, marcadas, altaFraca, score };
}
function reta7TodasStats(){
  return materiasDisponiveis().map(reta7Stats).filter(Boolean);
}

// conteúdo da sessão de uma matéria: erros em aberto + marcadas + incidência alta ainda fraca, até R7_QTD questões
function reta7Sessao(mat){
  const b = getBucket(mat), perg = b.perguntas || {}, usados = new Set(), uids = [];
  const add = (u, lim, cont) => { if(usados.has(u) || uids.length >= lim) return false; usados.add(u); uids.push(u); cont.n++; return true; };
  const cErros = { n:0 }, cMarc = { n:0 }, cNovas = { n:0 };
  retaErros([mat]).filter(e => e.nivel < 3).sort((a, b2) => (a.nivel - b2.nivel) || (a.ultimoTs - b2.ultimoTs)).slice(0, 8).forEach(e => add(e.uid, R7_QTD, cErros));
  const marc = [];
  ['teoria', 'revisar'].forEach(n => estudoMarcadas(mat, n).forEach(x => marc.push({ uid:x.uid, n })));
  marc.sort((a, b2) => (a.n === 'teoria' ? 0 : 1) - (b2.n === 'teoria' ? 0 : 1)).slice(0, 4).forEach(x => add(x.uid, R7_QTD, cMarc));
  const ordem = retaQuestoes([mat]).map(q => ({ q, c:retaChance(perg[q.uid], false) }))
    .filter(x => !usados.has(x.q.uid) && estudoMarca(mat, x.q.uid) !== 'avancar')
    .sort((a, b2) => (retaPeso(b2.q) - retaPeso(a.q)) || ((a.c === null ? -1 : a.c) - (b2.c === null ? -1 : b2.c)));
  ordem.forEach(x => add(x.q.uid, R7_QTD, cNovas));
  return { uids, nErros:cErros.n, nMarcadas:cMarc.n, nNovas:cNovas.n, min:Math.max(1, Math.round(uids.length * R7_MIN_SESSAO / R7_QTD)) };
}
// respostas dadas na matéria no dia (início do dia em ms) — define se a sessão está feita
function reta7RespondidasNoDia(mat, dia0){
  const perg = getBucket(mat).perguntas || {}, fim = dia0 + 86400000; let n = 0;
  Object.values(perg).forEach(p => (p && p.historico || []).forEach(h => { if(h && h.ts >= dia0 && h.ts < fim) n++; }));
  return n;
}
function reta7Dia0(dataStr){ const p = dataStr.split('-').map(Number); return new Date(p[0], p[1]-1, p[2]).getTime(); }

/* ---------- plano guardado ---------- */
const R7_KEY = 'tcdf_reta7_v1';
function reta7Ler(){ try{ const j = JSON.parse(localStorage.getItem(R7_KEY) || 'null'); return j && Array.isArray(j.dias) ? j : null; }catch(_){ return null; } }
function reta7Gravar(p){ try{ localStorage.setItem(R7_KEY, JSON.stringify(p)); }catch(_){} }
// plano vigente (cria ou renova quando falta, venceu ou a prova já passou)
function reta7PlanoVigente(forcar, minDia){
  const hoje = reta7Data(Date.now()), dias = retaDias();
  if(dias <= 0) return null;
  let p = reta7Ler();
  const vencido = p && (reta7DiffDias(p.inicio, hoje) >= p.dias.length || reta7DiffDias(p.inicio, hoje) < 0);
  if(!p || vencido || forcar || (minDia && minDia !== p.minDia)){
    const md = minDia || (p && p.minDia) || 60;
    const n = Math.min(7, dias);                 // até a véspera
    const pl = reta7Plano(reta7TodasStats(), n, md);
    p = { inicio:hoje, minDia:md, dias:pl.dias, fora:pl.fora, segunda:pl.segunda, cap:pl.cap, criado:Date.now() };
    reta7Gravar(p);
  }
  return p;
}

/* ---------- tela ---------- */
function reta7RotuloDia(p, i){
  const d = reta7SomaDias(p.inicio, i), hoje = reta7Data(Date.now()), df = reta7DiffDias(hoje, d);
  const dp = retaDias() - df;                                   // dias que faltam para a prova naquele dia
  const dd = d.split('-'); const curta = dd[2] + '/' + dd[1];
  return { data:d, curta, nome: df === 0 ? 'Hoje' : (df === 1 ? 'Amanhã' : curta), dprova: dp > 0 ? 'D-' + dp : 'prova', df };
}
function reta7Porque(s){
  const partes = [];
  if(s.acerto !== null) partes.push('acerto ' + Math.round(s.acerto * 100) + '%'); else partes.push('ainda não respondida');
  if(s.cob < 0.999 && s.resp) partes.push(Math.round(s.cob * 100) + '% já vistas');
  if(s.erros) partes.push(s.erros + (s.erros === 1 ? ' erro em aberto' : ' erros em aberto'));
  if(s.marcadas) partes.push(s.marcadas + ' marcadas');
  return partes.join(' · ');
}
function reta7Cartao(mat, dia0, segunda){
  const s = reta7Stats(mat), ses = reta7Sessao(mat);
  if(!s) return '';
  const feitas = reta7RespondidasNoDia(mat, dia0), meta = Math.min(R7_QTD, 10), pct = Math.min(100, Math.round(100 * feitas / R7_QTD));
  const ok = feitas >= meta;
  const comp = [ses.nErros ? ses.nErros + ' erros' : '', ses.nMarcadas ? ses.nMarcadas + ' marcadas' : '', ses.nNovas ? ses.nNovas + (ses.nNovas === 1 ? ' nova' : ' novas') : ''].filter(Boolean).join(' + ');
  const atual = STATE.materia === mat ? ' r7-atual' : '';
  return `<article class="r7-card${ok ? ' ok' : ''}${atual}">
    <div class="r7-top"><h3>${esc(mat)}</h3>${segunda ? '<span class="r7-tag">2ª passada</span>' : ''}${ok ? '<span class="r7-feito">✓ feita</span>' : ''}</div>
    <p class="r7-why">${esc(reta7Porque(s))}</p>
    <p class="r7-meta"><b>${ses.uids.length} questões · ~${ses.min} min</b>${comp ? ' <span>(' + esc(comp) + ')</span>' : ''}</p>
    <div class="r7-barra" title="${feitas} respostas hoje nesta matéria"><i style="width:${pct}%"></i></div>
    <button class="btn btn-gold r7-go" data-r7-iniciar="${esc(mat)}" ${ses.uids.length ? '' : 'disabled'}>${ok ? '↻ Refazer' : '▶ Começar'}</button>
  </article>`;
}
function renderReta7(){
  const dias = retaDias();
  if(dias < 0) return `<div class="reta r7"><div class="card-reta"><h3>Prova concluída</h3><p class="section-desc">A revisão de 7 dias termina na data da prova. Seus erros e cartões continuam no modo completo.</p><button class="btn" data-r7-completo="1">Abrir o modo completo</button></div></div>`;
  if(dias === 0) return `<div class="reta r7"><div class="card-reta"><h3>🍀 Dia da prova</h3><p class="section-desc">Hoje não se estuda matéria nova. Respire e confie no que você já fez.</p><button class="btn" data-r7-completo="1">Cola de véspera (modo completo)</button></div></div>`;
  const p = reta7PlanoVigente(false, 0);
  if(!p) return '';
  const hoje = reta7Data(Date.now());
  let sel = (typeof STATE.reta7Dia === 'number' && STATE.reta7Dia >= 0 && STATE.reta7Dia < p.dias.length) ? STATE.reta7Dia : Math.max(0, Math.min(p.dias.length - 1, reta7DiffDias(p.inicio, hoje)));
  const idxHoje = Math.max(0, Math.min(p.dias.length - 1, reta7DiffDias(p.inicio, hoje)));
  const tira = p.dias.map((ms, i) => {
    const r = reta7RotuloDia(p, i), d0 = reta7Dia0(r.data);
    const feitas = ms.filter(m => reta7RespondidasNoDia(m, d0) >= Math.min(R7_QTD, 10)).length;
    const passado = r.df < 0, completo = ms.length && feitas === ms.length;
    return `<button class="r7-dia${i === sel ? ' on' : ''}${completo ? ' ok' : ''}${passado && !completo ? ' perdido' : ''}" data-r7-dia="${i}" aria-pressed="${i === sel}">
      <b>${esc(r.nome)}</b><small>${esc(r.dprova)}</small><span>${completo ? '✓' : feitas + '/' + ms.length}</span></button>`;
  }).join('');
  const r = reta7RotuloDia(p, sel), d0 = reta7Dia0(r.data), lista = p.dias[sel] || [];
  const minTot = lista.reduce((s, m) => s + reta7Sessao(m).min, 0);
  const cards = lista.map(m => reta7Cartao(m, d0, (p.segunda || []).includes(m) && p.dias.findIndex(x => x.includes(m)) !== sel)).join('');
  const proxima = (() => { const ms = (p.dias[idxHoje] || []).filter(m => reta7RespondidasNoDia(m, reta7Dia0(hoje)) < Math.min(R7_QTD, 10)); return ms[0] || null; })();
  const fora = (p.fora && p.fora.length) ? `<p class="r7-aviso">⚠️ Ficaram de fora por falta de tempo (as mais fortes): ${p.fora.map(esc).join(', ')}. Aumente o tempo por dia para incluí-las.</p>` : '';
  const tempos = R7_TEMPOS.map(t => `<button class="${p.minDia === t ? 'on' : ''}" data-r7-min="${t}" aria-pressed="${p.minDia === t}">${t} min</button>`).join('');
  return `<div class="reta r7">
    <section class="r7-hero">
      <div><div class="reta-kick">Reta final · prova ${esc(PROVA_TCDF.rotulo)}</div>
        <h2>Revisão de ${p.dias.length} ${p.dias.length === 1 ? 'dia' : 'dias'}</h2>
        <p>Uma matéria por vez: cada sessão tem ${R7_QTD} questões, com os seus erros, as suas marcas e o que mais cai. Faltam <b>${dias} ${dias === 1 ? 'dia' : 'dias'}</b> para a prova.</p></div>
      <div class="r7-ctrl"><span>Tempo por dia</span><div class="r7-seg" role="group" aria-label="Tempo por dia">${tempos}</div>
        <div class="r7-links"><button data-r7-refazer="1" title="Monta o plano de novo com o seu progresso de hoje">↻ Refazer plano</button><button data-r7-completo="1">Modo completo</button></div></div>
    </section>
    <nav class="r7-tira" aria-label="Dias do plano">${tira}</nav>
    <div class="r7-resumo"><b>${esc(r.nome)}${r.nome === r.curta ? '' : ' · ' + esc(r.curta)}</b> <span>${lista.length} ${lista.length === 1 ? 'matéria' : 'matérias'} · ~${minTot} min</span>
      ${sel === idxHoje && proxima ? `<button class="btn btn-gold" data-r7-iniciar="${esc(proxima)}">▶ Próxima: ${esc(proxima)}</button>` : ''}</div>
    <div class="r7-grade">${cards || '<p class="section-desc">Nenhuma matéria neste dia.</p>'}</div>
    ${fora}
  </div>`;
}

/* ---------- eventos ---------- */
function reta7Anexar(raiz){
  const q = sel => raiz.querySelectorAll(sel);
  q('[data-r7-dia]').forEach(el => el.addEventListener('click', () => { STATE.reta7Dia = parseInt(el.dataset.r7Dia, 10); render(); }));
  q('[data-r7-min]').forEach(el => el.addEventListener('click', () => { reta7PlanoVigente(true, parseInt(el.dataset.r7Min, 10)); STATE.reta7Dia = null; render(); }));
  q('[data-r7-refazer]').forEach(el => el.addEventListener('click', () => { reta7PlanoVigente(true, 0); STATE.reta7Dia = null; render(); }));
  q('[data-r7-completo]').forEach(el => el.addEventListener('click', () => { STATE.retaModo = 'completo'; render(); }));
  q('[data-r7-voltar]').forEach(el => el.addEventListener('click', () => { STATE.retaModo = 'sete'; STATE.retaSessao = null; render(); }));
  q('[data-r7-iniciar]').forEach(el => el.addEventListener('click', () => {
    const mat = el.dataset.r7Iniciar, s = reta7Sessao(mat);
    if(s.uids.length) retaAbrirQuiz(mat, s.uids, 'Reta Final · 7 dias · ' + mat);
  }));
}
