/* ============ RETA FINAL · REVISÃO MATÉRIA POR MATÉRIA (plano até a véspera) ============
   Tela padrão da aba Reta Final. Você define quantas horas tem por dia e em que dias está disponível; o plano distribui as
   matérias nesses dias: cada matéria recebe um tempo proporcional ao tamanho da base e ao quanto você ainda erra, em uma
   1ª passada (ler o resumo + questões) e uma 2ª passada (só erros em aberto e marcadas). O conteúdo de cada sessão (quais
   questões) é montado na hora com o seu progresso. Configuração e plano ficam neste aparelho (localStorage).
   O modo completo antigo (Hoje, Caderno de erros, Cartões, Prontidão, Cola de véspera) continua em "Modo completo". */

/* R7-PURO-INI */
const R7_BASE_MIN = 45;          // tempo mínimo por matéria (menos se o total não comportar)
const R7_HORAS = [2, 3, 4, 5, 6];
const R7_LEITURA = 15;           // minutos de leitura do resumo, dentro da 1ª passada

// distribui as matérias pelos dias. stats: [{ mat, score, w }] (score maior = mais fraca; w = peso do tempo).
// dias: [{ d:'YYYY-MM-DD', min }]. Devolve { agenda:[[{ mat, min, t }]], porMateria:{ mat:min }, fora:[mat] }; t = '1', '2' ou '12'
function reta7Distribuir(stats, dias){
  dias = (dias || []).map(x => ({ d:x.d, min:Math.max(0, Math.floor((x.min || 0) / 15) * 15) }));
  const agenda = dias.map(() => []);
  const total = dias.reduce((s, x) => s + x.min, 0);
  const ord = (stats || []).slice().sort((a, b) => (b.score - a.score) || String(a.mat).localeCompare(String(b.mat)));
  if(!dias.length || total < 15 || !ord.length) return { agenda, porMateria:{}, fora:ord.map(s => s.mat) };
  const cabem = Math.min(ord.length, Math.floor(total / 15));
  const dentro = ord.slice(0, cabem), fora = ord.slice(cabem).map(s => s.mat);
  const base = Math.max(15, Math.min(R7_BASE_MIN, Math.floor(total / dentro.length / 15) * 15));
  const soma = dentro.reduce((s, x) => s + Math.max(0.01, x.w || 1), 0);
  let rest = total - base * dentro.length;
  const mins = {}; dentro.forEach(s => { mins[s.mat] = base; });
  const quota = dentro.map(s => ({ mat:s.mat, v: rest * Math.max(0.01, s.w || 1) / soma }));
  quota.forEach(q => { const k = Math.floor(q.v / 15) * 15; mins[q.mat] += k; rest -= k; q.r = q.v - k; });
  quota.sort((a, b) => b.r - a.r);
  for(let i = 0; rest >= 15 && quota.length; i++){ mins[quota[i % quota.length].mat] += 15; rest -= 15; }
  const livre = dias.map(x => x.min);
  const encher = (mat, m, t, ini) => {
    for(let pass = 0; pass < 2 && m > 0; pass++){
      for(let i = pass === 0 ? ini : 0; i < dias.length && m > 0; i++){
        const x = Math.min(m, livre[i]); if(x <= 0) continue;
        const ult = agenda[i].find(b => b.mat === mat);
        if(ult){ ult.min += x; if(!ult.t.includes(t)) ult.t = '12'; } else agenda[i].push({ mat, min:x, t });
        livre[i] -= x; m -= x;
      }
    }
  };
  const nd = dias.length, segIni = nd >= 3 ? Math.floor(nd * 0.4) : 0;
  const sessoes = dentro.map(s => { const m = mins[s.mat]; let p1 = m >= 30 ? Math.max(15, Math.round(m * 0.6 / 15) * 15) : m; if(p1 > m - 15 && m >= 30) p1 = m - 15; return { mat:s.mat, p1, p2:m - p1 }; });
  sessoes.forEach(s => encher(s.mat, s.p1, '1', 0));                 // 1ª passada: das mais fracas para as mais fortes
  sessoes.forEach(s => { if(s.p2 > 0) encher(s.mat, s.p2, '2', segIni); });   // 2ª passada: começa na mesma ordem, mais adiante
  return { agenda, porMateria:mins, fora };
}
// 'YYYY-MM-DD' no fuso local e diferença em dias inteiros entre duas dessas datas
function reta7Data(ts){ const d = new Date(ts); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }
function reta7DiffDias(a, b){ const pa = a.split('-').map(Number), pb = b.split('-').map(Number); return Math.round((Date.UTC(pb[0], pb[1]-1, pb[2]) - Date.UTC(pa[0], pa[1]-1, pa[2])) / 86400000); }
function reta7SomaDias(a, n){ const p = a.split('-').map(Number); return reta7Data(new Date(p[0], p[1]-1, p[2] + n).getTime()); }
function reta7DiaSemana(a){ const p = a.split('-').map(Number); return new Date(p[0], p[1]-1, p[2]).getDay(); }
// calendário de hoje até a véspera: [{ d, dw, on, min }]. cfg = { horas, dias:{ 'YYYY-MM-DD':{ on, min } } }; padrão: segunda a sexta ligados
function reta7Calendario(hoje, diasParaProva, cfg){
  const n = Math.max(0, Math.min(21, diasParaProva)), horas = (cfg && cfg.horas) || 4, out = [];
  for(let i = 0; i < n; i++){
    const d = reta7SomaDias(hoje, i), dw = reta7DiaSemana(d), c = cfg && cfg.dias && cfg.dias[d];
    out.push({ d, dw, on: c && typeof c.on === 'boolean' ? c.on : (dw >= 1 && dw <= 5), min: c && c.min ? c.min : horas * 60 });
  }
  return out;
}
/* R7-PURO-FIM */

/* ---------- dados de cada matéria ---------- */
function reta7Stats(mat){
  const qs = retaQuestoes([mat]); if(qs.length < 5) return null;
  const b = getBucket(mat), perg = b.perguntas || {};
  let resp = 0, certas = 0;
  qs.forEach(q => { const c = retaChance(perg[q.uid], false); if(c !== null){ resp++; certas += c; } });
  const acerto = resp ? certas / resp : null, cob = resp / qs.length;
  const erros = retaErros([mat]).filter(e => e.nivel < 3).length;
  const marcadas = ['teoria', 'revisar'].reduce((s, n) => s + estudoMarcadas(mat, n).length, 0);
  const fraco = 0.6 * (1 - (acerto === null ? 0.4 : acerto)) + 0.4 * (1 - cob);
  const score = 0.55 * (1 - (acerto === null ? 0.4 : acerto)) + 0.25 * (1 - cob) + 0.20 * Math.min(1, erros / 20);
  return { mat, total:qs.length, resp, acerto, cob, erros, marcadas, score, w: Math.sqrt(qs.length) * (0.4 + 2 * fraco) };
}
function reta7TodasStats(){ return materiasDisponiveis().map(reta7Stats).filter(Boolean); }

// conteúdo da sessão: erros em aberto + marcadas + incidência alta ainda fraca, até 'qtd' questões
function reta7Sessao(mat, qtd){
  qtd = Math.max(5, Math.min(120, qtd || 15));
  const b = getBucket(mat), perg = b.perguntas || {}, usados = new Set(), uids = [];
  const add = (u, cont) => { if(usados.has(u) || uids.length >= qtd) return; usados.add(u); uids.push(u); cont.n++; };
  const cErros = { n:0 }, cMarc = { n:0 }, cNovas = { n:0 };
  retaErros([mat]).filter(e => e.nivel < 3).sort((a, b2) => (a.nivel - b2.nivel) || (a.ultimoTs - b2.ultimoTs)).slice(0, Math.ceil(qtd * 0.55)).forEach(e => add(e.uid, cErros));
  const marc = [];
  ['teoria', 'revisar'].forEach(n => estudoMarcadas(mat, n).forEach(x => marc.push({ uid:x.uid, n })));
  marc.sort((a, b2) => (a.n === 'teoria' ? 0 : 1) - (b2.n === 'teoria' ? 0 : 1)).slice(0, Math.ceil(qtd * 0.25)).forEach(x => add(x.uid, cMarc));
  retaQuestoes([mat]).map(q => ({ q, c:retaChance(perg[q.uid], false) }))
    .filter(x => !usados.has(x.q.uid) && estudoMarca(mat, x.q.uid) !== 'avancar')
    .sort((a, b2) => (retaPeso(b2.q) - retaPeso(a.q)) || ((a.c === null ? -1 : a.c) - (b2.c === null ? -1 : b2.c)))
    .forEach(x => add(x.q.uid, cNovas));
  return { uids, nErros:cErros.n, nMarcadas:cMarc.n, nNovas:cNovas.n };
}
function reta7RespondidasNoDia(mat, dia0){
  const perg = getBucket(mat).perguntas || {}, fim = dia0 + 86400000; let n = 0;
  Object.values(perg).forEach(p => (p && p.historico || []).forEach(h => { if(h && h.ts >= dia0 && h.ts < fim) n++; }));
  return n;
}
function reta7Dia0(dataStr){ const p = dataStr.split('-').map(Number); return new Date(p[0], p[1]-1, p[2]).getTime(); }

/* ---------- resumos por matéria (js/resumos-dados.js, carregado sob demanda) ---------- */
const R7_RESUMO_MAPA = [
  [/adm geral|administrativo \(geral\)/i, 'administrativo-geral'], [/afo/i, 'afo'], [/tribut/i, 'd-tributario'], [/constitucional/i, 'constitucional'],
  [/rju|lc ?840/i, 'rju-lc840'], [/civil/i, 'direito-civil'], [/previd/i, 'previdenciario'], [/14\.?133/i, 'lei-14133'],
  [/org[aâ]nica do tcdf/i, 'lei-organica-tcdf'], [/lodf/i, 'lodf'], [/reg(imento)?\.? ?interno/i, 'reg-interno'], [/lgpd/i, 'adm-lgpd-lai'],
  [/8\.429/i, 'adm-8429'], [/an[aá]lise( de)? dados/i, 'analise-dados-ia'], [/conhec/i, 'conhec-df'], [/contratos/i, 'contratos'],
  [/pdpm|mulher/i, 'pdpm'], [/in n[ºo°] ?5/i, 'in5'], [/primeiros socorros/i, 'primeiros-socorros'], [/44\.?330/i, 'decreto-44330'],
];
function reta7SlugResumo(mat){ const m = R7_RESUMO_MAPA.find(x => x[0].test(String(mat))); return m ? m[1] : null; }
let _r7ResumosEstado = 0;
function reta7CarregarResumos(cb){
  if(typeof RESUMOS_TCDF !== 'undefined'){ cb(true); return; }
  if(_r7ResumosEstado === 1) return;
  _r7ResumosEstado = 1;
  const v = ((window.__TCDF_BUILD__ || {}).versao || '');
  const sc = document.createElement('script');
  sc.src = 'js/resumos-dados.js' + (v ? '?v=' + v : '');
  sc.onload = () => { _r7ResumosEstado = 2; cb(true); };
  sc.onerror = () => { _r7ResumosEstado = 0; try{ sc.remove(); }catch(_){} cb(false); };
  document.head.appendChild(sc);
}
// markdown mínimo e seguro (tudo escapado antes): títulos, citação, tabela, listas, negrito
function reta7Md(md){
  const inl = t => esc(t).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  const linhas = String(md || '').split('\n'); let out = '', lista = false, tab = [];
  const fechaLista = () => { if(lista){ out += '</ul>'; lista = false; } };
  const fechaTab = () => {
    if(!tab.length) return;
    const lin = tab.filter(l => !/^\|\s*:?-{2,}/.test(l)).map(l => l.replace(/^\||\|$/g, '').split('|').map(c => c.trim()));
    out += '<table>' + lin.map((c, i) => '<tr>' + c.map(x => (i === 0 ? '<th>' : '<td>') + inl(x) + (i === 0 ? '</th>' : '</td>')).join('') + '</tr>').join('') + '</table>'; tab = [];
  };
  linhas.forEach(l => {
    if(/^\|/.test(l)){ fechaLista(); tab.push(l); return; } fechaTab();
    let m;
    if((m = l.match(/^(#{1,3})\s+(.*)/))){ fechaLista(); const n = m[1].length + 1; out += '<h' + n + '>' + inl(m[2]) + '</h' + n + '>'; }
    else if((m = l.match(/^>\s?(.*)/))){ fechaLista(); out += '<blockquote>' + inl(m[1]) + '</blockquote>'; }
    else if((m = l.match(/^\s*[-*]\s+(.*)/))){ if(!lista){ out += '<ul>'; lista = true; } out += '<li>' + inl(m[1]) + '</li>'; }
    else if(l.trim()){ fechaLista(); out += '<p>' + inl(l) + '</p>'; }
  });
  fechaLista(); fechaTab(); return out;
}
// resumo separado por assunto: aba "Visão geral" (tabela do que mais cai) + uma aba por assunto
function reta7MdVisao(r){ return r.geral || reta7MdGeral(r.md); }
function reta7MdGeral(md){ const i = String(md || '').indexOf('## 2.'); return i > 0 ? md.slice(0, i).trim() : String(md || ''); }
function reta7AbasAssunto(r, sel){
  const abas = [{ nome:'Visão geral', n:0 }].concat(r.assuntos || []);
  return abas.map((a, i) => '<button type="button" data-r7-ass="' + i + '" class="' + (i === sel ? 'on' : '') + '" aria-pressed="' + (i === sel) + '">' + esc(a.nome) + (a.pct !== undefined ? '<small>' + a.pct + '%</small>' : (a.n ? '<small>' + a.n + '</small>' : '')) + '</button>').join('');
}
function reta7AbrirResumo(mat){
  const slug = reta7SlugResumo(mat); if(!slug) return;
  const id = 'r7-res-' + slug, ja = document.getElementById(id);
  if(ja){ ja.style.zIndex = ++_janZ; return; }
  const mostrar = ok => {
    const r = ok && typeof RESUMOS_TCDF !== 'undefined' && RESUMOS_TCDF[slug];
    if(document.getElementById(id)) return;
    const box = document.createElement('div'); box.id = id; box.className = 'r7-modal'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Resumo de ' + mat);
    box.innerHTML = '<div class="r7-modal-caixa"><button class="r7-modal-x" aria-label="Fechar">✕</button><button class="tr-tema" aria-label="Alternar tema claro e escuro" title="Tema claro/escuro">' + (document.body.classList.contains('theme-light') ? '🌙' : '☀️') + '</button>' + (r && r.assuntos ? '<div class="r7-ass" role="group" aria-label="Assuntos">' + reta7AbasAssunto(r, 0) + '</div>' : '') + '<div class="r7-md">' + (r ? reta7Md(r.assuntos ? reta7MdVisao(r) : r.md) : '<p>Não foi possível carregar o resumo agora. Tente de novo com internet.</p>') + '</div></div>';
    const fechar = () => box.remove();
    box.addEventListener('click', e => {
      if(e.target.closest('.r7-modal-x')){ fechar(); return; }
      const ab = e.target.closest('[data-r7-ass]');
      if(ab && r && r.assuntos){
        const i = Number(ab.dataset.r7Ass), md = box.querySelector('.r7-md');
        md.innerHTML = reta7Md(i === 0 ? reta7MdVisao(r) : r.assuntos[i-1].md); box.querySelector('.r7-ass').innerHTML = reta7AbasAssunto(r, i); box.querySelector('.r7-modal-caixa').scrollTop = 0; return;
      }
      const tm = e.target.closest('.tr-tema'); if(tm){ if(typeof alternarTema === 'function') alternarTema(); tm.textContent = document.body.classList.contains('theme-light') ? '🌙' : '☀️'; }
    });
    document.body.appendChild(box);
    if(typeof janelaFlutuante === 'function') janelaFlutuante(box, '📄 Resumo · ' + mat, fechar, 'resumo');
  };
  reta7CarregarResumos(mostrar);
}

/* ---------- configuração e plano guardados ---------- */
const R7_CFG_KEY = 'tcdf_reta7_cfg_v2', R7_PLANO_KEY = 'tcdf_reta7_plano_v2';
function reta7LerJ(k){ try{ return JSON.parse(localStorage.getItem(k) || 'null'); }catch(_){ return null; } }
function reta7GravarJ(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(_){} }
function reta7Cfg(){ const c = reta7LerJ(R7_CFG_KEY); return c && typeof c === 'object' ? c : { horas:4, dias:{} }; }
const R7_HIST_KEY = 'tcdf_reta7_hist_v2';
// dias que já passaram ficam guardados (terminados ou não) mesmo quando o plano é refeito
function reta7Arquivar(p){
  if(!p || !p.dias) return;
  const hoje = reta7Data(Date.now()), h = reta7LerJ(R7_HIST_KEY), lista = Array.isArray(h) ? h : [];
  let mudou = false;
  p.dias.forEach(x => { if(reta7DiffDias(hoje, x.d) < 0 && !lista.some(y => y.d === x.d)){ lista.push({ d:x.d, min:x.min, blocos:x.blocos }); mudou = true; } });
  if(mudou) reta7GravarJ(R7_HIST_KEY, lista.sort((a, b) => a.d < b.d ? -1 : 1));
}
function reta7Historico(){ const h = reta7LerJ(R7_HIST_KEY); return Array.isArray(h) ? h : []; }
// respostas por dia, de todo o histórico: { 'YYYY-MM-DD': { matéria: { n, ok } } } (n = respostas, ok = acertos)
function reta7Historia(){
  const out = {};
  materiasDisponiveis().forEach(mat => {
    Object.values(getBucket(mat).perguntas || {}).forEach(p => (p && p.historico || []).forEach(h => {
      if(!h || !h.ts) return;
      const d = reta7Data(h.ts), m = ((out[d] = out[d] || {})[mat] = out[d][mat] || { n:0, ok:0 });
      m.n++; if(h.c === true) m.ok++;
    }));
  });
  return out;
}
function reta7TotDia(mats){ let n = 0, ok = 0; Object.values(mats || {}).forEach(m => { n += m.n; ok += m.ok; }); return { n, ok, pct: n ? Math.round(100 * ok / n) : null }; }
function reta7SalvarCfg(c){ reta7Arquivar(reta7LerJ(R7_PLANO_KEY)); reta7GravarJ(R7_CFG_KEY, c); reta7GravarJ(R7_PLANO_KEY, null); }   // mudou a disponibilidade: o plano é refeito
// plano vigente: refeito quando falta, quando a configuração muda ou quando o último dia já passou
function reta7PlanoVigente(forcar){
  const hoje = reta7Data(Date.now()), dias = retaDias();
  if(dias <= 0) return null;
  let p = reta7LerJ(R7_PLANO_KEY);
  reta7Arquivar(p);
  const vencido = p && (!p.dias || !p.dias.length || reta7DiffDias(hoje, p.dias[p.dias.length - 1].d) < 0 || reta7DiffDias(p.inicio, hoje) < 0);
  if(!p || vencido || forcar){
    reta7Arquivar(p);
    const cfg = reta7Cfg(), cal = reta7Calendario(hoje, dias, cfg).filter(x => x.on);
    const r = reta7Distribuir(reta7TodasStats(), cal.map(x => ({ d:x.d, min:x.min })));
    p = { inicio:hoje, dias:cal.map((x, i) => ({ d:x.d, min:x.min, blocos:r.agenda[i] })), fora:r.fora, porMateria:r.porMateria, criado:Date.now() };
    reta7GravarJ(R7_PLANO_KEY, p);
  }
  return p;
}

/* ---------- tela ---------- */
const R7_DIAS_SEM = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
function reta7Fmt(m){ return m >= 60 ? Math.floor(m / 60) + 'h' + (m % 60 ? String(m % 60).padStart(2, '0') : '') : m + ' min'; }
function reta7RotuloDia(d){
  const hoje = reta7Data(Date.now()), df = reta7DiffDias(hoje, d), dp = retaDias() - df, dd = d.split('-');
  return { curta:dd[2] + '/' + dd[1], nome: df === 0 ? 'Hoje' : (df === 1 ? 'Amanhã' : (df < 0 ? R7_DIAS_SEM[reta7DiaSemana(d)] + ' ' + dd[2] + '/' + dd[1] : R7_DIAS_SEM[reta7DiaSemana(d)] + ' ' + dd[2])), dprova: dp > 0 ? 'D-' + dp : 'prova', df };
}
function reta7Porque(s){
  const p = [];
  p.push(s.acerto !== null ? 'acerto ' + Math.round(s.acerto * 100) + '%' : 'ainda não respondida');
  if(s.resp) p.push(Math.round(s.cob * 100) + '% já vistas');
  if(s.erros) p.push(s.erros + (s.erros === 1 ? ' erro em aberto' : ' erros em aberto'));
  if(s.marcadas) p.push(s.marcadas + ' marcadas');
  return p.join(' · ');
}
function reta7Leitura(b){ return (b.t.includes('1') && reta7SlugResumo(b.mat)) ? Math.min(R7_LEITURA, Math.max(0, b.min - 15)) : 0; }
function reta7Cartao(b, dia0){
  const mat = b.mat, s = reta7Stats(mat); if(!s) return '';
  const resumo = !!reta7SlugResumo(mat), leitura = reta7Leitura(b);
  const qtd = Math.max(5, b.min - leitura), ses = reta7Sessao(mat, qtd);
  const feitas = reta7RespondidasNoDia(mat, dia0), meta = Math.max(5, Math.round(ses.uids.length * 0.7)), ok = feitas >= meta;
  const pct = Math.min(100, Math.round(100 * feitas / Math.max(1, ses.uids.length)));
  const comp = [ses.nErros ? ses.nErros + ' erros' : '', ses.nMarcadas ? ses.nMarcadas + ' marcadas' : '', ses.nNovas ? ses.nNovas + (ses.nNovas === 1 ? ' nova' : ' novas') : ''].filter(Boolean).join(' + ');
  const tag = b.t === '12' ? '1ª + 2ª passada' : (b.t === '2' ? '2ª passada: erros e marcadas' : '1ª passada');
  return `<article class="r7-card${ok ? ' ok' : ''}${STATE.materia === mat ? ' r7-atual' : ''}">
    <div class="r7-top"><h3>${esc(mat)}</h3><span class="r7-tag">${esc(tag)}</span>${ok ? '<span class="r7-feito">✓ feita</span>' : ''}</div>
    <p class="r7-why">${esc(reta7Porque(s))}</p>
    <p class="r7-meta"><b>${reta7Fmt(b.min)}</b> · ${leitura ? 'leitura do resumo ' + leitura + ' min + ' : ''}${ses.uids.length} questões${comp ? ' <span>(' + esc(comp) + ')</span>' : ''}</p>
    <div class="r7-barra" title="${feitas} respostas hoje nesta matéria"><i style="width:${pct}%"></i></div>
    <div class="r7-acoes"><button class="btn btn-gold r7-go" data-r7-iniciar="${esc(mat)}" data-r7-qtd="${qtd}" ${ses.uids.length ? '' : 'disabled'}>${ok ? '↻ Refazer' : '▶ Começar'}</button>
      ${resumo ? `<button class="btn r7-res" data-r7-resumo="${esc(mat)}">📄 Resumo</button>` : ''}
      ${(typeof treinoDisponivel === 'function' && treinoDisponivel(mat)) ? `<button class="btn r7-res" data-tr-abrir="${esc(mat)}" data-tr-modo="flash">🃏 Flashcards</button><button class="btn r7-res" data-tr-abrir="${esc(mat)}" data-tr-modo="lacunas">🧩 Lacunas</button>` : ''}</div>
  </article>`;
}
/* ---------- dia anterior: só estatísticas (não dá para responder de novo) ---------- */
function reta7PainelPassado(dia, mats, d0){
  const tot = reta7TotDia(mats), erros = tot.n - tot.ok;
  const plan = {}; (dia.blocos || []).forEach(b => { plan[b.mat] = b; });
  const nomes = Object.keys(Object.assign({}, mats, plan)).sort((a, b) => ((mats[b] || {}).n || 0) - ((mats[a] || {}).n || 0) || a.localeCompare(b));
  const linhas = nomes.map(mat => {
    const m = mats[mat] || { n:0, ok:0 }, pl = plan[mat], pct = m.n ? Math.round(100 * m.ok / m.n) : null;
    const feita = pl ? (m.n >= Math.max(5, Math.round((pl.min - reta7Leitura(pl)) * 0.7)) ? '<span class="r7-st ok">✓ feita</span>' : '<span class="r7-st no">não feita</span>') : '<span class="r7-st">fora do plano</span>';
    return `<tr><td>${esc(mat)}</td><td>${pl ? reta7Fmt(pl.min) : '–'}</td><td>${m.n}</td><td>${m.ok}</td><td><div class="r7-mini" title="${pct === null ? 'sem respostas' : pct + '% de acerto'}"><i style="width:${pct || 0}%"></i></div> ${pct === null ? '–' : pct + '%'}</td><td>${feita}</td></tr>`;
  }).join('');
  if(!nomes.length) return '<p class="section-desc">Nada foi respondido neste dia e não havia plano.</p>';
  return `<div class="r7-pass" style="grid-column:1/-1">
    <div class="r7-kpis"><div><b>${tot.n}</b><span>respostas</span></div><div><b>${tot.ok}</b><span>acertos</span></div><div><b>${erros}</b><span>erros</span></div><div><b>${tot.pct === null ? '–' : tot.pct + '%'}</b><span>acerto do dia</span></div></div>
    <div class="r7-tab-wrap"><table class="r7-tab"><thead><tr><th>Matéria</th><th>Planejado</th><th>Respostas</th><th>Acertos</th><th>% acerto</th><th>Situação</th></tr></thead><tbody>${linhas}</tbody></table></div></div>`;
}

/* ---------- gráfico geral da revisão ---------- */
function reta7Grafico(hist, hoje){
  const ds = Object.keys(hist).sort(); if(!ds.length) return '<div class="card-reta"><h3>Gráfico geral</h3><p class="section-desc">Ainda não há respostas registradas. Responda questões e o gráfico aparece aqui.</p></div>';
  const ini = reta7DiffDias(ds[0], hoje) > 29 ? reta7SomaDias(hoje, -29) : ds[0];
  const dias = []; for(let d = ini; reta7DiffDias(d, hoje) >= 0; d = reta7SomaDias(d, 1)) dias.push(d);
  const por = dias.map(d => ({ d, ...reta7TotDia(hist[d]) }));
  const tudo = reta7TotDia(Object.values(hist).reduce((a, mats) => { Object.entries(mats).forEach(([k, v]) => { const x = (a[k] = a[k] || { n:0, ok:0 }); x.n += v.n; x.ok += v.ok; }); return a; }, {}));
  const estudados = por.filter(x => x.n > 0).length, maxN = Math.max(10, ...por.map(x => x.n)), W = 760, H = 250, L = 38, R = 38, T = 14, B = 34, iw = W - L - R, ih = H - T - B, bw = iw / por.length;
  const nice = Math.ceil(maxN / 50) * 50 || 50, y = v => T + ih - (v / nice) * ih, yp = v => T + ih - (v / 100) * ih;
  let barras = '', pts = [], rot = '', grade = '';
  [0, 0.5, 1].forEach(f => { const yy = T + ih - f * ih; grade += `<line x1="${L}" x2="${W - R}" y1="${yy}" y2="${yy}" class="g-grade"/><text x="${L - 6}" y="${yy + 4}" class="g-eixo" text-anchor="end">${Math.round(nice * f)}</text><text x="${W - R + 6}" y="${yy + 4}" class="g-eixo">${Math.round(100 * f)}%</text>`; });
  por.forEach((x, i) => {
    const cx = L + bw * i + bw / 2, w = Math.max(3, bw * 0.62), hoje_ = x.d === hoje;
    if(x.n) barras += `<rect x="${cx - w / 2}" y="${y(x.n)}" width="${w}" height="${T + ih - y(x.n)}" rx="2" class="g-bar${hoje_ ? ' hoje' : ''}"><title>${esc(x.d.split('-').reverse().slice(0, 2).join('/'))}: ${x.n} respostas, ${x.ok} acertos (${x.pct}%)</title></rect>`;
    if(x.pct !== null) pts.push([cx, yp(x.pct)]);
    if(i % Math.ceil(por.length / 10) === 0 || hoje_) rot += `<text x="${cx}" y="${H - 12}" class="g-eixo" text-anchor="middle">${x.d.slice(8)}/${x.d.slice(5, 7)}</text>`;
  });
  const linha = pts.length ? `<polyline points="${pts.map(p => p.join(',')).join(' ')}" class="g-linha"/>` + pts.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="3" class="g-pt"/>`).join('') : '';
  const mats = reta7TodasStats().sort((a, b) => (a.acerto === null ? -1 : a.acerto) - (b.acerto === null ? -1 : b.acerto));
  const barrasMat = mats.map(m => `<div class="r7-lm"><span>${esc(m.mat)}</span><div class="r7-dupla"><div title="Acerto ${m.acerto === null ? '–' : Math.round(m.acerto * 100) + '%'}"><i class="a" style="width:${m.acerto === null ? 0 : Math.round(m.acerto * 100)}%"></i></div><div title="Questões já vistas ${Math.round(m.cob * 100)}%"><i class="c" style="width:${Math.round(m.cob * 100)}%"></i></div></div><b>${m.acerto === null ? '–' : Math.round(m.acerto * 100) + '%'}</b><small>${Math.round(m.cob * 100)}% vistas${m.erros ? ' · ' + m.erros + ' erros' : ''}</small></div>`).join('');
  return `<div class="r7-graf">
    <div class="r7-kpis"><div><b>${tudo.n}</b><span>respostas no período</span></div><div><b>${tudo.pct === null ? '–' : tudo.pct + '%'}</b><span>acerto geral</span></div><div><b>${estudados}</b><span>dias com estudo</span></div><div><b>${estudados ? Math.round(tudo.n / estudados) : 0}</b><span>respostas por dia estudado</span></div></div>
    <section class="card-reta"><h3>Respostas e acerto por dia</h3><p class="section-desc">Barras: respostas do dia (eixo esquerdo). Linha: % de acerto do dia (eixo direito).</p>
      <svg class="r7-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfico de respostas e acerto por dia">${grade}${barras}${linha}${rot}</svg>
      <div class="r7-leg"><span><i class="lb"></i> respostas</span><span><i class="ll"></i> % de acerto</span></div></section>
    <section class="card-reta"><h3>Situação por matéria</h3><p class="section-desc">Barra de cima: % de acerto. Barra de baixo: % das questões da matéria que você já viu. Da mais fraca para a mais forte.</p><div class="r7-lms">${barrasMat}</div></section>
  </div>`;
}

function renderReta7(){
  const dias = retaDias();
  if(dias < 0) return `<div class="reta r7"><div class="card-reta"><h3>Prova concluída</h3><p class="section-desc">O plano termina na data da prova. Seus erros e cartões continuam no modo completo.</p><button class="btn" data-r7-completo="1">Abrir o modo completo</button></div></div>`;
  if(dias === 0) return `<div class="reta r7"><div class="card-reta"><h3>🍀 Dia da prova</h3><p class="section-desc">Hoje não se estuda matéria nova. Respire e confie no que você já fez.</p><button class="btn" data-r7-completo="1">Cola de véspera (modo completo)</button></div></div>`;
  const hoje = reta7Data(Date.now()), cfg = reta7Cfg(), cal = reta7Calendario(hoje, dias, cfg), p = reta7PlanoVigente(false);
  if(!p) return '';
  const aba = STATE.reta7Aba === 'grafico' ? 'grafico' : 'plano';
  const abas = `<div class="r7-abas" role="tablist"><button role="tab" class="${aba === 'plano' ? 'on' : ''}" aria-selected="${aba === 'plano'}" data-r7-aba="plano">📅 Plano</button><button role="tab" class="${aba === 'grafico' ? 'on' : ''}" aria-selected="${aba === 'grafico'}" data-r7-aba="grafico">📊 Gráfico geral</button></div>`;
  if(aba === 'grafico') return `<div class="reta r7">${abas}${reta7Grafico(reta7Historia(), hoje)}</div>`;
  const horasBtn = R7_HORAS.map(h => `<button class="${(cfg.horas || 4) === h ? 'on' : ''}" data-r7-horas="${h}" aria-pressed="${(cfg.horas || 4) === h}">${h}h</button>`).join('');
  const chips = cal.map(x => { const r = reta7RotuloDia(x.d); return `<button class="r7-chip${x.on ? ' on' : ''}" data-r7-disp="${x.d}" aria-pressed="${x.on}" title="${x.on ? 'Disponível: ' + reta7Fmt(x.min) : 'Indisponível'}"><b>${esc(R7_DIAS_SEM[x.dw])} ${esc(r.curta)}</b><small>${x.on ? reta7Fmt(x.min) : 'folga'}</small></button>`; }).join('');
  const controles = `<div class="r7-disp"><span>Dias disponíveis</span><div class="r7-chips">${chips}</div>
      <div class="r7-links"><button data-r7-preset="util">Seg a sex</button><button data-r7-preset="todos">Todos os dias</button></div></div>`;
  if(!p.dias.length) return `<div class="reta r7"><section class="r7-hero"><div><h2>Revisão matéria por matéria</h2><p>Nenhum dia disponível até a prova. Marque abaixo os dias em que você pode estudar.</p></div></section>${controles}</div>`;
  const totalMin = p.dias.reduce((s, x) => s + x.min, 0);
  // dias anteriores (do plano ou guardados) + dias sem plano em que você respondeu questões; depois os dias do plano
  const hist = reta7Historia(), plano = p.dias.slice(), temD = new Set(plano.map(x => x.d));
  const ant = [];
  reta7Historico().forEach(x => { if(!temD.has(x.d)){ ant.push(x); temD.add(x.d); } });
  Object.keys(hist).forEach(d => { if(!temD.has(d) && reta7DiffDias(hoje, d) < 0 && reta7DiffDias(hoje, d) >= -21){ ant.push({ d, min:0, blocos:[] }); temD.add(d); } });
  const todos = ant.concat(plano).sort((a, b2) => a.d < b2.d ? -1 : (a.d > b2.d ? 1 : 0));
  const idxHoje = Math.max(0, todos.findIndex(x => reta7DiffDias(hoje, x.d) >= 0));
  const sel = (typeof STATE.reta7Dia === 'number' && STATE.reta7Dia >= 0 && STATE.reta7Dia < todos.length) ? STATE.reta7Dia : idxHoje;
  const botaoDia = (dia, i) => {
    const r = reta7RotuloDia(dia.d), d0 = reta7Dia0(dia.d), semPlano = !dia.blocos.length, passado = r.df < 0, tot = reta7TotDia(hist[dia.d]);
    const feitos = dia.blocos.filter(b => reta7RespondidasNoDia(b.mat, d0) >= Math.max(5, Math.round((b.min - reta7Leitura(b)) * 0.7))).length;
    const completo = dia.blocos.length && feitos === dia.blocos.length;
    const rodape = passado ? (completo ? '✓ ' : '') + tot.n + ' resp.' + (tot.pct !== null ? ' · ' + tot.pct + '%' : '') : (completo ? '✓' : feitos + '/' + dia.blocos.length);
    return `<button class="r7-dia${i === sel ? ' on' : ''}${completo ? ' ok' : ''}${passado && !completo && !semPlano ? ' perdido' : ''}${passado ? ' passado' : ''}" data-r7-dia="${i}" aria-pressed="${i === sel}">
      <b>${esc(r.nome)}</b><small>${esc(r.dprova)} · ${semPlano ? 'sem plano' : reta7Fmt(dia.min)}</small><span>${rodape}</span></button>`;
  };
  const tiraAnt = todos.map((dia, i) => ({ dia, i })).filter(x => reta7DiffDias(hoje, x.dia.d) < 0).map(x => botaoDia(x.dia, x.i)).join('');
  const tira = todos.map((dia, i) => ({ dia, i })).filter(x => reta7DiffDias(hoje, x.dia.d) >= 0).map(x => botaoDia(x.dia, x.i)).join('');
  const dia = todos[sel], r = reta7RotuloDia(dia.d), d0 = reta7Dia0(dia.d);
  const passadoSel = r.df < 0;
  const cards = passadoSel ? reta7PainelPassado(dia, hist[dia.d] || {}, d0) : dia.blocos.map(b => reta7Cartao(b, d0)).join('');
  const semPlanoMsg = '';
  const usado = dia.blocos.reduce((s, b) => s + b.min, 0);
  const proxB = (() => { const di = todos[idxHoje]; if(!di || !di.blocos.length) return null; const d00 = reta7Dia0(di.d); return di.blocos.find(b => reta7RespondidasNoDia(b.mat, d00) < 5) || null; })();
  const fora = (p.fora && p.fora.length) ? `<p class="r7-aviso">⚠️ Sem tempo para: ${p.fora.map(esc).join(', ')}. Aumente as horas ou libere mais dias.</p>` : '';
  return `<div class="reta r7">
    ${abas}
    <section class="r7-hero">
      <div><div class="reta-kick">Reta final · prova ${esc(PROVA_TCDF.rotulo)}</div>
        <h2>Revisão matéria por matéria</h2>
        <p>Faltam <b>${dias} ${dias === 1 ? 'dia' : 'dias'}</b>. Com ${p.dias.length} ${p.dias.length === 1 ? 'dia disponível' : 'dias disponíveis'} e <b>${reta7Fmt(totalMin)}</b> no total, cada matéria ganha tempo conforme o tamanho da base e o quanto você ainda erra: 1ª passada (resumo + questões) e 2ª passada (só erros e marcadas).</p></div>
      <div class="r7-ctrl"><span>Horas por dia</span><div class="r7-seg" role="group" aria-label="Horas por dia">${horasBtn}</div>
        <div class="r7-links"><button data-r7-refazer="1" title="Monta o plano de novo com o seu progresso de hoje">↻ Refazer plano</button><button data-r7-completo="1">Modo completo</button></div></div>
    </section>
    ${controles}
    ${tiraAnt ? `<div class="r7-ant"><span>Dias anteriores</span><nav class="r7-tira r7-tira-ant" aria-label="Dias anteriores">${tiraAnt}</nav></div>` : ''}
    <nav class="r7-tira" aria-label="Dias do plano">${tira}</nav>
    <div class="r7-resumo"><b>${esc(r.nome)}${r.df < 0 ? '' : ' · ' + esc(r.curta)}</b> <span>${dia.blocos.length} ${dia.blocos.length === 1 ? 'matéria' : 'matérias'} · ${reta7Fmt(usado)} de ${reta7Fmt(dia.min)}</span>
      ${passadoSel ? '<span class="r7-trava">🔒 Dia encerrado: só consulta, não dá para responder de novo</span>' : ''}${passadoSel ? '' : `<span class="r7-passo" title="Ajusta o tempo só deste dia"><button data-r7-passo="-30" data-r7-d="${dia.d}" aria-label="Menos 30 minutos neste dia">−</button> <b>${reta7Fmt(dia.min)}</b> <button data-r7-passo="30" data-r7-d="${dia.d}" aria-label="Mais 30 minutos neste dia">+</button></span>`}
      ${!passadoSel && sel === idxHoje && proxB ? `<button class="btn btn-gold" data-r7-iniciar="${esc(proxB.mat)}" data-r7-qtd="${Math.max(5, proxB.min - reta7Leitura(proxB))}">▶ Próxima: ${esc(proxB.mat)}</button>` : ''}</div>
    <div class="r7-grade">${cards || semPlanoMsg || '<p class="section-desc">Nenhuma matéria neste dia.</p>'}</div>
    ${fora}
  </div>`;
}

/* ---------- eventos ---------- */
function reta7Anexar(raiz){
  const q = sel => raiz.querySelectorAll(sel);
  const mudar = fn => { const c = reta7Cfg(); c.dias = c.dias || {}; fn(c); reta7SalvarCfg(c); STATE.reta7Dia = null; render(); };
  const calDe = c => reta7Calendario(reta7Data(Date.now()), retaDias(), c);
  q('[data-r7-dia]').forEach(el => el.addEventListener('click', () => { STATE.reta7Dia = parseInt(el.dataset.r7Dia, 10); render(); }));
  q('[data-r7-horas]').forEach(el => el.addEventListener('click', () => mudar(c => { c.horas = parseInt(el.dataset.r7Horas, 10); Object.keys(c.dias).forEach(d => { c.dias[d] = { on:c.dias[d].on }; }); })));
  q('[data-r7-disp]').forEach(el => el.addEventListener('click', () => mudar(c => { const d = el.dataset.r7Disp, x = calDe(c).find(y => y.d === d); c.dias[d] = { ...(c.dias[d] || {}), on: !(x && x.on) }; })));
  q('[data-r7-preset]').forEach(el => el.addEventListener('click', () => mudar(c => { c.dias = {}; calDe({ horas:c.horas, dias:{} }).forEach(x => { c.dias[x.d] = { on: el.dataset.r7Preset === 'todos' ? true : (x.dw >= 1 && x.dw <= 5) }; }); })));
  q('[data-r7-passo]').forEach(el => el.addEventListener('click', () => mudar(c => { const d = el.dataset.r7D, x = calDe(c).find(y => y.d === d); const atual = x ? x.min : (c.horas || 4) * 60; c.dias[d] = { on:true, min:Math.max(30, Math.min(720, atual + parseInt(el.dataset.r7Passo, 10))) }; })));
  q('[data-r7-refazer]').forEach(el => el.addEventListener('click', () => { reta7PlanoVigente(true); STATE.reta7Dia = null; render(); }));
  q('[data-r7-aba]').forEach(el => el.addEventListener('click', () => { STATE.reta7Aba = el.dataset.r7Aba; render(); }));
  q('[data-r7-completo]').forEach(el => el.addEventListener('click', () => { STATE.retaModo = 'completo'; render(); }));
  q('[data-r7-voltar]').forEach(el => el.addEventListener('click', () => { STATE.retaModo = 'sete'; STATE.retaSessao = null; render(); }));
  q('[data-r7-resumo]').forEach(el => el.addEventListener('click', () => reta7AbrirResumo(el.dataset.r7Resumo)));
  q('[data-tr-abrir]').forEach(el => el.addEventListener('click', () => { if(typeof treinoAbrir === 'function') treinoAbrir(el.dataset.trAbrir, el.dataset.trModo); }));
  q('[data-r7-iniciar]').forEach(el => el.addEventListener('click', () => {
    const mat = el.dataset.r7Iniciar, s = reta7Sessao(mat, parseInt(el.dataset.r7Qtd, 10) || 15);
    if(s.uids.length) retaAbrirQuiz(mat, s.uids, 'Reta Final · ' + mat);
  }));
}
