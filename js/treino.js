/* ============ TREINO POR MATÉRIA: flashcards + lacunas de arrastar ============
   Itens gerados só das questões e resoluções da lista de cada matéria (js/treino-<matéria>.js, carregado sob demanda) e
   conferidos um a um antes de liberar. Cada matéria só aparece em TREINO_LIBERADAS depois dessa conferência.
   Flashcards: frente/verso (virar, "já sei" / "revisar"). Lacunas: a frase vem com espaços em branco e um banco de palavras
   que você arrasta para os espaços (ou toca na palavra e depois no espaço, no celular). O que você marca fica neste aparelho. */

const TREINO_TCDF = {};
const TREINO_LIBERADAS = ['direito-civil', 'lei-14133', 'previdenciario', 'rju-lc840', 'constitucional', 'lei-organica-tcdf', 'lodf', 'reg-interno', 'adm-lgpd-lai', 'adm-8429', 'analise-dados-ia', 'conhec-df', 'contratos', 'pdpm'];
const TREINO_KEY = 'tcdf_treino_v1';

function treinoSlug(mat){ return typeof reta7SlugResumo === 'function' ? reta7SlugResumo(mat) : null; }
function treinoDisponivel(mat){ const s = treinoSlug(mat); return !!s && TREINO_LIBERADAS.includes(s); }
function treinoLer(){ try{ return JSON.parse(localStorage.getItem(TREINO_KEY) || '{}') || {}; }catch(_){ return {}; } }
function treinoGravar(m){ try{ localStorage.setItem(TREINO_KEY, JSON.stringify(m)); }catch(_){} }
function treinoMarca(slug, k){ return (treinoLer()[slug] || {})[k] || ''; }
function treinoMarcar(slug, k, v){ const m = treinoLer(); (m[slug] = m[slug] || {})[k] = v; treinoGravar(m); }
function treinoEmbaralha(a){ const x = a.slice(); for(let i = x.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; }
function treinoCarregar(slug, cb){
  if(TREINO_TCDF[slug]){ cb(true); return; }
  const v = ((window.__TCDF_BUILD__ || {}).versao || '');
  const sc = document.createElement('script');
  sc.src = 'js/treino-' + slug + '.js' + (v ? '?v=' + v : '');
  sc.onload = () => cb(!!TREINO_TCDF[slug]);
  sc.onerror = () => { try{ sc.remove(); }catch(_){} cb(false); };
  document.head.appendChild(sc);
}
function treinoUidDe(mat, n, h){ return (ALL_QUESTIONS.find(q => q.materia === mat && Number(q.n) === Number(n) && _ctHash(q.q) === h) || {}).uid || null; }

let TR = null;     // estado da janela em uso (cada janela aberta tem o seu; TRS guarda todas)
const TRS = [];

/* ---- janelas flutuantes independentes (resumo, flashcards e lacunas): abrem lado a lado, cada uma com o seu estado,
   podem ser arrastadas pela barra do topo e fechadas separadamente; clicar numa traz para a frente ---- */
let _janZ = 1200;
const JAN_TAM_KEY = 'tcdf_jan_tam_v1';
function janTamLer(){ try{ return JSON.parse(localStorage.getItem(JAN_TAM_KEY) || '{}') || {}; }catch(_){ return {}; } }
function janTamGravar(chave, w, h){ if(!chave) return; try{ const m = janTamLer(); m[chave] = { w:Math.round(w), h:Math.round(h) }; localStorage.setItem(JAN_TAM_KEY, JSON.stringify(m)); }catch(_){} }
function janelaFlutuante(box, titulo, fechar, chave){
  const n = document.querySelectorAll('.jan').length, VW = window.innerWidth, VH = window.innerHeight;
  const salvo = (chave && janTamLer()[chave]) || null;
  const larg = Math.min(salvo ? salvo.w : 560, VW - 16);
  box.classList.add('jan'); box._fechar = fechar;
  box.style.width = larg + 'px';
  if(salvo && salvo.h) box.style.height = Math.min(salvo.h, VH - 16) + 'px';
  box.style.left = Math.max(8, Math.round((VW - larg) / 2 + ((n % 5) - 2) * 36)) + 'px';
  box.style.top = (16 + (n % 5) * 30) + 'px';
  box.style.zIndex = ++_janZ;
  const barra = document.createElement('div'); barra.className = 'jan-barra';
  barra.innerHTML = '<span class="jan-tit"><span aria-hidden="true">⠿</span> ' + esc(titulo) + '</span><span class="jan-bt"><button type="button" data-jan-menos title="Diminuir a janela" aria-label="Diminuir a janela">−</button><button type="button" data-jan-mais title="Aumentar a janela" aria-label="Aumentar a janela">+</button><button type="button" data-jan-max title="Tela cheia / restaurar" aria-label="Tela cheia ou restaurar">⤢</button></span>';
  box.insertBefore(barra, box.firstChild);
  const grip = document.createElement('div'); grip.className = 'jan-grip'; grip.title = 'Arraste para redimensionar'; grip.setAttribute('aria-hidden', 'true'); box.appendChild(grip);
  const limita = () => {
    const w = Math.max(280, Math.min(box.offsetWidth, window.innerWidth - 8)), h = Math.max(180, Math.min(box.offsetHeight, window.innerHeight - 8));
    box.style.width = w + 'px'; box.style.height = h + 'px';
    box.style.left = Math.max(0, Math.min(window.innerWidth - Math.min(w, 120), box.offsetLeft)) + 'px';
    box.style.top = Math.max(0, Math.min(window.innerHeight - 40, box.offsetTop)) + 'px';
    janTamGravar(chave, w, h);
  };
  box.addEventListener('pointerdown', () => { box.style.zIndex = ++_janZ; }, true);
  // arrastar pela barra
  let arr = null;
  barra.addEventListener('pointerdown', e => {
    if(e.target.closest('button')) return;
    arr = { x:e.clientX - box.offsetLeft, y:e.clientY - box.offsetTop }; try{ barra.setPointerCapture(e.pointerId); }catch(_){}
    e.preventDefault();
  });
  barra.addEventListener('pointermove', e => {
    if(!arr) return;
    box.style.left = Math.max(0, Math.min(window.innerWidth - 80, e.clientX - arr.x)) + 'px';
    box.style.top = Math.max(0, Math.min(window.innerHeight - 40, e.clientY - arr.y)) + 'px';
  });
  const solta = () => { arr = null; };
  barra.addEventListener('pointerup', solta); barra.addEventListener('pointercancel', solta);
  // redimensionar pelo canto (mouse ou toque)
  let red = null;
  grip.addEventListener('pointerdown', e => { red = { x:e.clientX, y:e.clientY, w:box.offsetWidth, h:box.offsetHeight }; try{ grip.setPointerCapture(e.pointerId); }catch(_){} e.preventDefault(); e.stopPropagation(); });
  grip.addEventListener('pointermove', e => {
    if(!red) return;
    box.style.width = Math.max(280, Math.min(window.innerWidth - box.offsetLeft, red.w + e.clientX - red.x)) + 'px';
    box.style.height = Math.max(180, Math.min(window.innerHeight - box.offsetTop, red.h + e.clientY - red.y)) + 'px';
  });
  const fimRed = () => { if(red){ red = null; limita(); } };
  grip.addEventListener('pointerup', fimRed); grip.addEventListener('pointercancel', fimRed);
  // botões − / + / tela cheia
  let antes = null;
  barra.addEventListener('click', e => {
    const bt = e.target.closest('button'); if(!bt) return;
    const w = box.offsetWidth, h = box.offsetHeight;
    if(bt.hasAttribute('data-jan-max')){
      if(antes){ box.style.left = antes.l + 'px'; box.style.top = antes.t + 'px'; box.style.width = antes.w + 'px'; box.style.height = antes.h + 'px'; antes = null; }
      else { antes = { l:box.offsetLeft, t:box.offsetTop, w, h }; box.style.left = '4px'; box.style.top = '4px'; box.style.width = (window.innerWidth - 8) + 'px'; box.style.height = (window.innerHeight - 8) + 'px'; }
    } else {
      const f = bt.hasAttribute('data-jan-mais') ? 1.15 : 1 / 1.15;
      box.style.width = Math.max(280, Math.min(window.innerWidth - box.offsetLeft, Math.round(w * f))) + 'px';
      box.style.height = Math.max(180, Math.min(window.innerHeight - box.offsetTop, Math.round(h * f))) + 'px'; antes = null;
    }
    limita();
  });
}
document.addEventListener('keydown', e => {      // Esc fecha a janela que está na frente
  if(e.key !== 'Escape') return;
  const js = [...document.querySelectorAll('.jan')]; if(!js.length) return;
  const topo = js.reduce((a, b) => (Number(b.style.zIndex) > Number(a.style.zIndex) ? b : a));
  if(topo._fechar){ e.stopPropagation(); topo._fechar(); }
}, true);

function treinoAbrir(mat, modo){
  const slug = treinoSlug(mat); if(!slug || !treinoDisponivel(mat)) return;
  modo = modo === 'lacunas' ? 'lacunas' : 'flash';
  const ja = TRS.find(x => x.slug === slug && x.modo === modo);
  if(ja && ja.box && ja.box.isConnected){ ja.box.style.zIndex = ++_janZ; TR = ja; return; }
  treinoCarregar(slug, ok => {
    if(!ok){ alert('Não foi possível carregar o treino agora. Tente de novo com internet.'); return; }
    const st = { mat, slug, dados:TREINO_TCDF[slug], modo, filtro:'todos', fila:[], i:0, virado:false, slots:[], sel:null, checado:false, sessao:{ ok:0, tot:0 }, mem:{}, box:null };
    TR = st; TRS.push(st);
    treinoMontarFila();
    const box = document.createElement('div'); box.className = 'r7-modal tr-modal'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', (modo === 'lacunas' ? 'Lacunas de ' : 'Flashcards de ') + mat);
    st.box = box; document.body.appendChild(box);
    box.addEventListener('click', e => { TR = st; treinoClique(e); });
    box.addEventListener('pointerdown', () => { TR = st; });
    box.addEventListener('dragstart', e => { TR = st; treinoDragStart(e); }); box.addEventListener('dragover', e => { if(e.target.closest('.tr-blank, .tr-banco')) e.preventDefault(); }); box.addEventListener('drop', e => { TR = st; treinoDrop(e); });
    treinoDesenhar();
    janelaFlutuante(box, (modo === 'lacunas' ? '🧩 Lacunas' : '🃏 Flashcards') + ' · ' + mat + ((typeof R7_ATUALIZADAS !== 'undefined' && R7_ATUALIZADAS.includes(slug)) ? ' · ✨ atualizada' : ''), () => { TR = st; treinoFechar(); }, modo);
  });
}
function treinoFechar(){
  const st = TR; if(!st) return;
  if(st.box) st.box.remove();
  const i = TRS.indexOf(st); if(i >= 0) TRS.splice(i, 1);
  TR = TRS.length ? TRS[TRS.length - 1] : null;
}

function treinoChaveItem(it, tipo){ return tipo + ':' + it.n + ':' + it.h + (it.k ? ':' + it.k : ''); }
function treinoMontarFila(){
  const d = TR.dados, slug = TR.slug;
  if(TR.modo === 'flash'){
    let l = d.flash.slice();
    if(TR.filtro === 'revisar') l = l.filter(x => treinoMarca(slug, treinoChaveItem(x, 'f')) === 'rev');
    else if(TR.filtro === 'novos') l = l.filter(x => !treinoMarca(slug, treinoChaveItem(x, 'f')));
    TR.fila = treinoEmbaralha(l);
  } else {
    let l = d.lacunas.slice();
    if(TR.filtro === 'erradas') l = l.filter(x => treinoMarca(slug, treinoChaveItem(x, 'l')) === 'err');
    else if(TR.filtro === 'novos') l = l.filter(x => !treinoMarca(slug, treinoChaveItem(x, 'l')));
    TR.fila = treinoEmbaralha(l);
  }
  TR.i = 0; TR.virado = false; TR.checado = false; treinoPrepararLacuna();
}
// cada lacuna guarda a última resposta da sessão: ao avançar ou voltar, ela reaparece como foi deixada
function treinoNovaLacuna(it){
  const resp = it.p.filter(p => p.l !== undefined).map(p => p.l);
  return { slots: resp.map(() => null), banco: treinoEmbaralha(resp.concat(it.d || []).map((w, id) => ({ w, id }))), checado:false };
}
function treinoPrepararLacuna(){
  TR.sel = null;
  if(TR.modo !== 'lacunas'){ TR.slots = []; TR.banco = []; TR.checado = false; return; }
  const it = TR.fila[TR.i]; if(!it){ TR.slots = []; TR.banco = []; TR.checado = false; return; }
  const k = treinoChaveItem(it, 'l');
  if(!TR.mem[k]) TR.mem[k] = treinoNovaLacuna(it);
  const m = TR.mem[k]; TR.slots = m.slots; TR.banco = m.banco; TR.checado = m.checado;
}
function treinoGuardarLacuna(){
  if(!TR || TR.modo !== 'lacunas') return; const it = TR.fila[TR.i]; if(!it) return;
  TR.mem[treinoChaveItem(it, 'l')] = { slots:TR.slots, banco:TR.banco, checado:TR.checado };
}
function treinoDesenhar(){
  const box = TR && TR.box; if(!box || !TR) return;
  const d = TR.dados, slug = TR.slug, m = treinoLer()[slug] || {};
  const nOk = d.flash.filter(x => m[treinoChaveItem(x, 'f')] === 'ok').length, nRev = d.flash.filter(x => m[treinoChaveItem(x, 'f')] === 'rev').length;
  const lOk = d.lacunas.filter(x => m[treinoChaveItem(x, 'l')] === 'ok').length, lErr = d.lacunas.filter(x => m[treinoChaveItem(x, 'l')] === 'err').length;
  treinoGuardarLacuna();
  const abas = '';
  const filtros = TR.modo === 'flash'
    ? [['todos', 'Todos'], ['revisar', 'Revisar (' + nRev + ')'], ['novos', 'Novos (' + (d.flash.length - nOk - nRev) + ')']]
    : [['todos', 'Todas'], ['erradas', 'Que errei (' + lErr + ')'], ['novos', 'Novas (' + (d.lacunas.length - lOk - lErr) + ')']];
  const chips = `<div class="tr-filtros">${filtros.map(f => `<button class="${TR.filtro === f[0] ? 'on' : ''}" data-tr-filtro="${f[0]}">${esc(f[1])}</button>`).join('')}<button data-tr-embaralhar="1" title="Embaralha de novo">🔀</button></div>`;
  const it = TR.fila[TR.i];
  let corpo;
  if(!it) corpo = `<p class="tr-vazio">${TR.filtro === 'todos' ? 'Nenhum item.' : 'Nada neste filtro. Escolha outro.'}</p>`;
  else if(TR.modo === 'flash') corpo = treinoHtmlFlash(it);
  else corpo = treinoHtmlLacuna(it);
  const fim = TR.fila.length ? `${TR.i + 1} / ${TR.fila.length}` : '0';
  const stat = TR.modo === 'flash' ? `✓ ${nOk} sei · 🔁 ${nRev} revisar` : `✓ ${lOk} certas · ✗ ${lErr} erradas · sessão ${TR.sessao.ok}/${TR.sessao.tot}`;
  const fixos = [...box.querySelectorAll('.jan-barra, .jan-grip')]; box.innerHTML = `<div class="r7-modal-caixa tr-caixa"><button class="r7-modal-x" aria-label="Fechar" data-tr-fechar="1">✕</button><button class="tr-tema" data-tr-tema="1" aria-label="Alternar tema claro e escuro" title="Tema claro/escuro">${document.body.classList.contains('theme-light') ? '🌙' : '☀️'}</button>
    <div class="tr-topo"><h2>${TR.modo === 'lacunas' ? '🧩 Lacunas' : '🃏 Flashcards'} · ${esc(d.nome)}</h2><p class="tr-sub">Gerado só das questões da lista · ${esc(stat)}</p>${abas}${chips}</div>
    <div class="tr-corpo">${corpo}</div>
    <div class="tr-nav"><button class="btn" data-tr-nav="-1" ${TR.i === 0 ? 'disabled' : ''}>← Anterior</button><span>${fim}</span><button class="btn" data-tr-nav="1" ${TR.i >= TR.fila.length - 1 ? 'disabled' : ''}>Próxima →</button></div></div>`;
  fixos.forEach(f => { if(f.classList.contains('jan-barra')) box.insertBefore(f, box.firstChild); else box.appendChild(f); });
}
function treinoHtmlFlash(it){
  const ref = it.ref ? `<span class="tr-ref">${esc(it.ref)}</span>` : '';
  const m = treinoMarca(TR.slug, treinoChaveItem(it, 'f'));
  const lado = TR.virado
    ? `<div class="tr-card tr-verso" data-tr-virar="1"><span class="tr-tag">Resposta${it.k === 'troca' ? ' · troca típica' : ''}</span>${it.g ? `<p class="tr-gab ${/^ERRADO/.test(it.g) ? 'no' : 'ok'}">${esc(it.g)}</p>` : ''}<p class="tr-texto">${esc(it.v)}</p>${it.k === 'troca' && it.x ? `<p class="tr-extra">${esc(it.x)}</p>` : (it.x ? `<p class="tr-extra">${esc(it.x)}</p>` : '')}${ref}</div>`
    : `<div class="tr-card tr-frente" data-tr-virar="1" tabindex="0"><span class="tr-tag">${it.k === 'troca' ? 'Corrija' : (it.k === 'questao' ? 'Questão' : 'Pergunta')}</span><p class="tr-texto${it.k === 'questao' ? ' tr-quest' : ''}">${esc(it.f)}</p><span class="tr-dica">toque ou Espaço para virar</span></div>`;
  const acoes = TR.virado
    ? `<div class="tr-acoes"><button class="btn tr-sei${m === 'ok' ? ' on' : ''}" data-tr-marca="ok">✓ Já sei <small>(1)</small></button><button class="btn tr-rev${m === 'rev' ? ' on' : ''}" data-tr-marca="rev">🔁 Revisar <small>(2)</small></button><button class="btn" data-tr-questao="${it.n}:${esc(it.h)}">Ver a questão</button></div>`
    : `<div class="tr-acoes"><button class="btn btn-gold" data-tr-virar="1">Virar</button><button class="btn" data-tr-questao="${it.n}:${esc(it.h)}">Ver a questão</button></div>`;
  return lado + acoes;
}
function treinoHtmlLacuna(it){
  let k = 0;
  const frase = it.p.map(p => {
    if(p.l === undefined) return esc(p.t);
    const i = k++, w = TR.slots[i], cert = TR.checado ? (w && w.w === p.l ? ' ok' : ' no') : '';
    return `<span class="tr-blank${w ? ' cheio' : ''}${cert}" data-tr-blank="${i}" tabindex="0" role="button" aria-label="Espaço ${i + 1}${w ? ': ' + esc(w.w) : ' vazio'}">${w ? esc(w.w) : '＿＿＿＿'}</span>`;
  }).join('');
  const usados = new Set(TR.slots.filter(Boolean).map(x => x.id));
  const banco = TR.banco.filter(x => !usados.has(x.id)).map(x => `<button class="tr-chip${TR.sel === x.id ? ' sel' : ''}" draggable="true" data-tr-chip="${x.id}">${esc(x.w)}</button>`).join('');
  const completo = TR.slots.every(Boolean);
  let fb = '';
  if(TR.checado){
    const todos = it.p.filter(p => p.l !== undefined).every((p, i) => TR.slots[i] && TR.slots[i].w === p.l);
    const resp = it.p.filter(p => p.l !== undefined).map(p => p.l);
    fb = `<div class="tr-fb ${todos ? 'ok' : 'no'}"><b>${todos ? '✓ Correto!' : '✗ Não foi dessa vez.'}</b>${todos ? '' : ' Resposta: <i>' + esc(resp.join(' · ')) + '</i>.'}${it.ref ? ' <span class="tr-ref">' + esc(it.ref) + '</span>' : ''}${it.exp ? '<p class="tr-extra">' + esc(it.exp) + '</p>' : ''}</div>`;
  }
  const acao = `<button class="btn btn-gold" data-tr-verificar="1" ${completo && !TR.checado ? '' : 'disabled'}>Verificar</button>
      <button class="btn" data-tr-limpar="1" title="Limpa só as palavras desta questão">Limpar</button>
      <button class="btn" data-tr-resetar="1" title="Volta esta questão ao início (palavras e resultado)">Resetar</button>
      ${TR.checado ? `<button class="btn" data-tr-questao="${it.n}:${esc(it.h)}">Ver a questão</button>` : ''}`;
  return `<div class="tr-card tr-lacuna"><span class="tr-tag">Complete arrastando as palavras</span><p class="tr-frase">${frase}</p>
    <div class="tr-banco" aria-label="Banco de palavras">${banco || '<span class="tr-dica">Todas as palavras foram usadas.</span>'}</div></div>${fb}<div class="tr-acoes">${acao}</div>`;
}

/* ---------- eventos ---------- */
let _trArrastando = null;
function treinoDragStart(e){ const c = e.target.closest('[data-tr-chip]'); if(!c || !TR){ return; } _trArrastando = parseInt(c.dataset.trChip, 10); try{ e.dataTransfer.setData('text/plain', String(_trArrastando)); e.dataTransfer.effectAllowed = 'move'; }catch(_){} }
function treinoColocar(idChip, bi){
  const it = TR.fila[TR.i]; if(!it || TR.checado) return;
  const chip = TR.banco.find(x => x.id === idChip); if(!chip) return;
  const antes = TR.slots.findIndex(s => s && s.id === idChip); if(antes >= 0) TR.slots[antes] = null;
  TR.slots[bi] = chip; TR.sel = null; treinoDesenhar();
}
function treinoDrop(e){
  if(!TR || TR.modo !== 'lacunas') return;
  const id = _trArrastando !== null ? _trArrastando : parseInt((e.dataTransfer && e.dataTransfer.getData('text/plain')) || '', 10); _trArrastando = null;
  if(isNaN(id)) return; e.preventDefault();
  const bl = e.target.closest('[data-tr-blank]');
  if(bl){ treinoColocar(id, parseInt(bl.dataset.trBlank, 10)); return; }
  if(e.target.closest('.tr-banco')){ const a = TR.slots.findIndex(s => s && s.id === id); if(a >= 0 && !TR.checado){ TR.slots[a] = null; treinoDesenhar(); } }
}
function treinoVerificar(){
  const it = TR.fila[TR.i]; if(!it || TR.checado || !TR.slots.every(Boolean)) return;
  const resp = it.p.filter(p => p.l !== undefined).map(p => p.l), ok = resp.every((w, i) => TR.slots[i].w === w);
  TR.checado = true; TR.sessao.tot++; if(ok) TR.sessao.ok++;
  treinoMarcar(TR.slug, treinoChaveItem(it, 'l'), ok ? 'ok' : 'err'); treinoDesenhar();
}
function treinoIr(delta){
  if(!TR) return; const n = TR.i + delta; if(n < 0 || n >= TR.fila.length) return;
  TR.i = n; TR.virado = false; treinoPrepararLacuna(); treinoDesenhar();
}
function treinoClique(e){
  if(!TR) return; const t = e.target;
  if(t.closest('[data-tr-fechar]')){ treinoFechar(); return; }
  let el;
  if((el = t.closest('[data-tr-filtro]'))){ TR.filtro = el.dataset.trFiltro; treinoMontarFila(); treinoDesenhar(); return; }
  if(t.closest('[data-tr-embaralhar]')){ treinoMontarFila(); treinoDesenhar(); return; }
  if((el = t.closest('[data-tr-nav]'))){ treinoIr(parseInt(el.dataset.trNav, 10)); return; }
  if(t.closest('[data-tr-virar]')){ TR.virado = !TR.virado; treinoDesenhar(); return; }
  if((el = t.closest('[data-tr-marca]'))){ const it = TR.fila[TR.i]; if(it){ treinoMarcar(TR.slug, treinoChaveItem(it, 'f'), el.dataset.trMarca); if(TR.i < TR.fila.length - 1 && TR.filtro !== 'todos') { treinoMontarFilaMantendo(); } else if(TR.i < TR.fila.length - 1){ treinoIr(1); return; } treinoDesenhar(); } return; }
  if((el = t.closest('[data-tr-questao]'))){
    const [n, h] = el.dataset.trQuestao.split(':'), uid = treinoUidDe(TR.mat, n, h), mat = TR.mat;
    if(uid){ treinoFechar(); retaAbrirQuiz(mat, [uid], 'Treino · ' + mat); } return;
  }
  if(t.closest('[data-tr-verificar]')){ treinoVerificar(); return; }
  if(t.closest('[data-tr-tema]')){ if(typeof alternarTema === 'function') alternarTema(); const atual = TR; TRS.slice().forEach(x => { TR = x; treinoDesenhar(); }); TR = atual; return; }
  if(t.closest('[data-tr-limpar]')){ TR.slots.fill(null); TR.checado = false; TR.sel = null; treinoDesenhar(); return; }      // só a questão atual
  if(t.closest('[data-tr-resetar]')){ const it = TR.fila[TR.i]; if(it){ treinoMarcar(TR.slug, treinoChaveItem(it, 'l'), ''); const n = treinoNovaLacuna(it); TR.mem[treinoChaveItem(it, 'l')] = n; TR.slots = n.slots; TR.banco = n.banco; TR.checado = false; TR.sel = null; treinoDesenhar(); } return; }
  if((el = t.closest('[data-tr-chip]'))){ if(TR.checado) return; const id = parseInt(el.dataset.trChip, 10); TR.sel = TR.sel === id ? null : id; treinoDesenhar(); return; }
  if((el = t.closest('[data-tr-blank]'))){
    if(TR.checado) return; const bi = parseInt(el.dataset.trBlank, 10);
    if(TR.sel !== null){ treinoColocar(TR.sel, bi); return; }
    if(TR.slots[bi]){ TR.slots[bi] = null; treinoDesenhar(); } return;
  }
}
function treinoMontarFilaMantendo(){ const it = TR.fila[TR.i]; TR.fila.splice(TR.i, 1); if(TR.i >= TR.fila.length) TR.i = Math.max(0, TR.fila.length - 1); TR.virado = false; }
function treinoTecla(e){
  if(!TR || !TR.box || !TR.box.isConnected) return;
  const foco = document.activeElement; if(foco && foco !== document.body && !TR.box.contains(foco)) return;   // só quando o foco está nesta janela (ou em lugar nenhum)
  if(e.key === 'Escape') return;
  const el = document.activeElement; if(el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
  if(TR.modo === 'flash'){
    if(e.key === ' ' || e.key === 'Enter'){ if(el && el.tagName === 'BUTTON' && e.key === 'Enter') return; e.preventDefault(); TR.virado = !TR.virado; treinoDesenhar(); }
    else if(e.key === 'ArrowRight'){ treinoIr(1); } else if(e.key === 'ArrowLeft'){ treinoIr(-1); }
    else if(TR.virado && (e.key === '1' || e.key === '2')){ const it = TR.fila[TR.i]; if(it){ treinoMarcar(TR.slug, treinoChaveItem(it, 'f'), e.key === '1' ? 'ok' : 'rev'); if(TR.i < TR.fila.length - 1) treinoIr(1); else treinoDesenhar(); } }
  } else if(e.key === 'ArrowRight'){ treinoIr(1); } else if(e.key === 'ArrowLeft'){ treinoIr(-1); }
}
document.addEventListener('keydown', treinoTecla, true);
