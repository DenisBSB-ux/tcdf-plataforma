/* Importar várias matérias de uma vez.
   O usuário escolhe vários .md/.txt; para cada arquivo a plataforma identifica a matéria de destino (conteúdo, ID das questões,
   título "# Nome" ou nome do arquivo), mostra uma tela de conferência (dá para trocar o destino) e importa tudo com
   "Substituir por matéria" (matéria que já existe) ou como matéria nova. Reaproveita aplicarImportacao (mesmo caminho do botão
   "Substituir"), publica na nuvem uma única vez no fim. */

const LOTE_LIMIAR_CONTEUDO = 0.3;
const LOTE_TOKENS_IGNORADOS = new Set(['questoes', 'questao', 'lista', 'atualizado', 'atualizada', 'padrao', 'justificadas', 'pdf', 'md', 'txt', 'copia']);

function _loteTokens(s){
  return new Set(slugify(s || '').split('-').filter(t => t.length > 2 && !/^\d+$/.test(t) && !LOTE_TOKENS_IGNORADOS.has(t)));
}
function _loteTituloDoArquivo(nome){
  const t = (nome || '').replace(/\.[^/.]+$/, '').replace(/[_\-]+/g, ' ').replace(/\b(questoes|questões|atualizado|atualizada|padrao|padrão|justificadas?)\b/gi, ' ').replace(/\b\d{4}\s\d{2}\s\d{2}\b/g, ' ').replace(/\s+\d+\s*$/g, ' ').replace(/\s+/g, ' ').trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : 'Módulo importado';
}

// Decide a matéria de destino de um arquivo. Devolve { alvo, novo, via, pct }.
function loteDetectar(content, nomeArquivo, results){
  const mats = materiasDisponiveis();
  // 1) conteúdo: enunciados em comum com cada matéria existente
  let melhorConteudo = null;
  try{
    const chaves = new Set(results.map(r => {
      const copia = { ...r, alt: Array.isArray(r.alt) ? r.alt.map(a => ({ ...a })) : r.alt };
      try{ sanitizarFonteEmbutida(copia); }catch(_){}
      const c = chaveDeEnunciado(textoDeChave(copia));
      return c ? finalDaChave(c) : '';
    }).filter(Boolean));
    if(chaves.size >= 3){
      Object.entries(chavesPorMateria()).forEach(([m, chavesM]) => {
        if(chavesM.size < 3) return;
        const r = sobreposicao(chaves, chavesM);
        if(r.pct >= LOTE_LIMIAR_CONTEUDO && (!melhorConteudo || r.pct > melhorConteudo.pct)) melhorConteudo = { alvo: m, pct: r.pct };
      });
    }
  }catch(_){}
  if(melhorConteudo && melhorConteudo.pct >= 0.5) return { alvo: melhorConteudo.alvo, novo: false, via: 'conteúdo', pct: melhorConteudo.pct };

  // 2) ID das questões (**ID:** slug-N): o prefixo costuma ser o slug da matéria
  const prefixos = {};
  [...String(content).matchAll(/^\*\*ID:\*\*\s*([a-z0-9-]+?)-\d+(?:-\d+)?\s*$/gim)].forEach(m => { prefixos[m[1]] = (prefixos[m[1]] || 0) + 1; });
  const pref = Object.entries(prefixos).sort((a, b) => b[1] - a[1])[0];
  if(pref){
    const m = mats.find(x => slugify(x) === pref[0]);
    if(m) return { alvo: m, novo: false, via: 'ID das questões', pct: 1 };
  }
  // 3) título "# Nome" no início
  const titulo = String(content).match(/^#\s+(.+?)\s*$/m);
  if(titulo){
    const m = mats.find(x => slugify(x) === slugify(titulo[1]));
    if(m) return { alvo: m, novo: false, via: 'título do arquivo', pct: 1 };
  }
  // 4) nome do arquivo parecido com o nome da matéria
  const tf = _loteTokens(nomeArquivo);
  let melhorNome = null;
  mats.forEach(m => {
    const tm = _loteTokens(m);
    if(!tm.size) return;
    let comuns = 0; tm.forEach(t => { if(tf.has(t)) comuns++; });
    const pct = comuns / tm.size;
    if(pct >= 0.6 && (!melhorNome || pct > melhorNome.pct)) melhorNome = { alvo: m, pct };
  });
  if(melhorNome) return { alvo: melhorNome.alvo, novo: false, via: 'nome do arquivo', pct: melhorNome.pct };
  if(melhorConteudo) return { alvo: melhorConteudo.alvo, novo: false, via: 'conteúdo', pct: melhorConteudo.pct };
  // 5) matéria nova
  return { alvo: titulo ? titulo[1].trim() : _loteTituloDoArquivo(nomeArquivo), novo: true, via: 'matéria nova', pct: 0 };
}

function _loteLerArquivo(file){
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = e => resolve(String(e.target.result || ''));
    r.onerror = () => reject(new Error('não foi possível ler o arquivo'));
    r.readAsText(file, 'utf-8');
  });
}

async function loteAbrir(files){
  const itens = [];
  for(const file of Array.from(files || [])){
    const it = { arquivo: file.name, erro: '', content: '', results: [], ignoradas: 0, semGabarito: 0, alvo: '', novo: false, via: '', pct: 0 };
    try{
      if(/\.pdf$/i.test(file.name) || file.type === 'application/pdf') throw new Error('PDF não entra no lote: use "Escolher arquivo" para importar PDF um por vez');
      it.content = await _loteLerArquivo(file);
      const p = parseTxtQuestions(it.content);
      it.results = p.results; it.ignoradas = p.ignoradas; it.semGabarito = p.semGabarito;
      if(!it.results.length) throw new Error('nenhuma questão válida encontrada (confira o formato)');
      Object.assign(it, loteDetectar(it.content, file.name, it.results));
    }catch(err){ it.erro = err.message || String(err); }
    itens.push(it);
  }
  STATE.importLote = { itens, fase: 'revisao', resumo: [] };
  render();
}

function _loteAlvoFinal(it){
  const nome = String(it.alvo || '').trim();
  if(!nome) return '';
  return materiaComMesmoSlug(nome) || nome;
}
function loteConflitos(){
  const L = STATE.importLote; if(!L) return [];
  const cont = {};
  L.itens.filter(i => !i.erro).forEach(i => { const a = _loteAlvoFinal(i); if(a) cont[a] = (cont[a] || 0) + 1; });
  return Object.keys(cont).filter(a => cont[a] > 1);
}

function renderImportLote(){
  const L = STATE.importLote; if(!L) return '';
  const mats = materiasDisponiveis();
  if(L.fase === 'fim'){
    return `<div class="lote-box"><h3 class="mat-titulo">📚 Importação em lote concluída</h3>
      <div class="lote-resumo">${L.resumo.map(r => `<div class="lote-res ${r.ok ? 'ok' : 'err'}"><b>${esc(r.materia || r.arquivo)}</b> — ${r.ok ? `${r.importadas} questão(ões)${r.modo === 'substituir' ? ' (substituiu a lista anterior)' : ' (matéria nova)'}${r.progressos ? `, progresso mantido em ${r.progressos}` : ''}${r.semGabarito ? `, ${r.semGabarito} sem gabarito` : ''}` : `falhou: ${esc(r.erro || '')}`}</div>`).join('')}</div>
      ${L.publicacao ? `<div class="lote-pub ${L.publicacao.ok ? 'ok' : 'err'}">${L.publicacao.ok ? '🌐 Publicadas na nuvem.' : '⚠ Não foi possível publicar na nuvem agora (' + esc(L.publicacao.motivo || '') + '). Está salvo neste dispositivo; use "Salvar tudo agora".'}</div>` : ''}
      <button type="button" class="btn btn-primary btn-sm" id="btn-lote-fechar">Fechar</button></div>`;
  }
  const conflitos = loteConflitos();
  const validos = L.itens.filter(i => !i.erro && _loteAlvoFinal(i));
  const rodando = L.fase === 'rodando';
  const linhas = L.itens.map((it, idx) => {
    if(it.erro) return `<div class="lote-linha erro"><div class="lote-arq">${esc(it.arquivo)}</div><div class="lote-aviso">⚠ ${esc(it.erro)} — este arquivo será ignorado.</div></div>`;
    const existe = mats.includes(_loteAlvoFinal(it)) || mats.includes(it.alvo);
    const opcoes = mats.map(m => `<option value="${esc(m)}"${!it.novo && m === it.alvo ? ' selected' : ''}>${esc(m)}</option>`).join('');
    const conf = it.novo ? 'matéria nova' : `${esc(it.via)}${it.via === 'conteúdo' ? ' ' + Math.round(it.pct * 100) + '%' : ''}`;
    const fraco = !it.novo && ((it.via === 'conteúdo' && it.pct < 0.5) || it.via === 'nome do arquivo');
    return `<div class="lote-linha${conflitos.includes(_loteAlvoFinal(it)) ? ' conflito' : ''}">
      <div class="lote-arq">${esc(it.arquivo)}<span class="lote-meta">${it.results.length} questões${it.semGabarito ? ' · ' + it.semGabarito + ' sem gabarito' : ''}</span></div>
      <div class="lote-destino">
        <label>Destino <select data-lote-i="${idx}" ${rodando ? 'disabled' : ''}>${opcoes}<option value="__novo__"${it.novo ? ' selected' : ''}>➕ Nova matéria…</option></select></label>
        ${it.novo ? `<input type="text" data-lote-nome="${idx}" value="${esc(it.alvo)}" placeholder="Nome da nova matéria" ${rodando ? 'disabled' : ''}>` : ''}
        <span class="lote-acao">${existe && !it.novo ? '🔁 Substituir' : '🆕 Criar'}</span>
        <span class="lote-via${fraco ? ' fraco' : ''}" title="Como a plataforma identificou o destino">${fraco ? '⚠ ' : '✔ '}${conf}</span>
      </div>
    </div>`;
  }).join('');
  return `<div class="lote-box">
    <h3 class="mat-titulo">📚 Importar várias matérias <span class="mat-total">${L.itens.length} arquivo(s)</span></h3>
    <p class="lote-ajuda">A plataforma identificou o destino de cada arquivo. Confira (dá para trocar) e confirme. Matérias que já existem são <b>substituídas</b> (progresso, edições e flashcards acompanham as questões que continuam); as novas são criadas.</p>
    ${linhas}
    ${conflitos.length ? `<div class="lote-aviso">⚠ Dois arquivos apontam para a mesma matéria (${conflitos.map(esc).join(', ')}). Troque o destino de um deles.</div>` : ''}
    <div class="lote-botoes">
      <button type="button" class="btn btn-primary btn-sm" id="btn-lote-importar" ${(!validos.length || conflitos.length || rodando) ? 'disabled' : ''}>${rodando ? '⏳ Importando…' : `Importar ${validos.length} matéria(s)`}</button>
      <button type="button" class="btn-outline btn-mat" id="btn-lote-cancelar" ${rodando ? 'disabled' : ''}>Cancelar</button>
    </div>
  </div>`;
}

async function loteExecutar(){
  const L = STATE.importLote; if(!L || L.fase === 'rodando') return;
  const itens = L.itens.filter(i => !i.erro && _loteAlvoFinal(i));
  if(!itens.length || loteConflitos().length) return;
  const mats = materiasDisponiveis();
  const subst = itens.filter(i => mats.includes(_loteAlvoFinal(i))).length;
  if(!window.confirm(`Importar ${itens.length} matéria(s)?\n\n${subst} serão substituídas (progresso, edições e flashcards acompanham as questões que continuam) e ${itens.length - subst} serão criadas.`)) return;
  L.fase = 'rodando'; render();
  const resumo = [], alvos = [];
  for(const it of itens){
    const alvo = _loteAlvoFinal(it);
    const existe = materiasDisponiveis().includes(alvo);
    try{
      STATE.importDeckName = '';
      if(existe) STATE.substituirOpcoes = { descartarRes: true, descartarGab: true };
      await aplicarImportacao(alvo, it.content, it.results, it.ignoradas, it.semGabarito, existe ? 'substituir' : 'somar', { publicar: false });
      const lg = STATE.importLog || {};
      resumo.push({ ok: true, materia: alvo, arquivo: it.arquivo, importadas: lg.importadas || 0, progressos: lg.progressosMantidos || 0, semGabarito: lg.semGabarito || 0, modo: existe ? 'substituir' : 'nova' });
      alvos.push(alvo);
    }catch(err){
      resumo.push({ ok: false, materia: alvo, arquivo: it.arquivo, erro: err && err.message || String(err) });
    }
  }
  let pub = null;
  if(alvos.length){
    try{ pub = await publicarQuestoesNoFirestore(alvos, true); }catch(e){ pub = { ok: false, motivo: e && e.message || String(e) }; }
  }
  STATE.importLog = null;
  STATE.importLote = { itens: [], fase: 'fim', resumo, publicacao: pub };
  STATE.viewImportar = true;
  render();
}

function bindImportLote(){
  const btn = document.getElementById('btn-importar-lote'), inp = document.getElementById('file-input-lote');
  if(btn && inp){
    btn.addEventListener('click', () => inp.click());
    inp.addEventListener('change', e => { const fs = e.target.files; if(fs && fs.length) loteAbrir(fs); inp.value = ''; });
  }
  document.querySelectorAll('[data-lote-i]').forEach(sel => sel.addEventListener('change', () => {
    const it = STATE.importLote && STATE.importLote.itens[+sel.dataset.loteI]; if(!it) return;
    if(sel.value === '__novo__'){ it.novo = true; it.alvo = _loteTituloDoArquivo(it.arquivo); it.via = 'matéria nova'; it.pct = 0; }
    else { it.novo = false; it.alvo = sel.value; it.via = 'escolhida por você'; it.pct = 1; }
    render();
  }));
  document.querySelectorAll('[data-lote-nome]').forEach(inp2 => inp2.addEventListener('input', () => {
    const it = STATE.importLote && STATE.importLote.itens[+inp2.dataset.loteNome]; if(it) it.alvo = inp2.value;
  }));
  const bi = document.getElementById('btn-lote-importar'); if(bi) bi.addEventListener('click', loteExecutar);
  const bc = document.getElementById('btn-lote-cancelar'); if(bc) bc.addEventListener('click', () => { STATE.importLote = null; render(); });
  const bf = document.getElementById('btn-lote-fechar'); if(bf) bf.addEventListener('click', () => { STATE.importLote = null; render(); });
}
