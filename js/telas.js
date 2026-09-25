/* ---------------- app state ---------------- */
let STATE = {
  materia: null,
  viewImportar: false,
  tema: 'todos',
  tabByMateria: {},
  quiz: null,
  setupByMateria: {},
  flashDeck: null,
  importLog: null,
  importDeckName: '',
  showPaste: false,
  zoomLevel: 1,
  theme: 'dark',
  corTema: 'Dourado (padrão)',
  corPickerAberto: false,
  assuntoAberto: false,
  materiaMenuAberto: false,
  paginacaoAberta: false,
  showBackupManual: false,
  materiasPublicadasNestaSessao: new Set(),
  focusMode: false,
  quizzesEmAndamento: {},
  quizzesVerificados: new Set(),
  contadorSimuladosPorMateria: {},
  simuladoSalvoMsg: false,
  setupDrawerOpen: false,
  mostrarConfigSimulado: false,
  pasteText: '',
  importProgressoLog: null,
  syncCode: '',
  avisoSyncDispensado: false,
  syncStatus: null,
  salvandoMateria: null,
  ultimoSalvamentoManual: null,
  salvandoTudo: false,
  ultimoSalvamentoGeral: null,
  avisoStorage: null,
  importPendente: null,
  dedupInfo: null,
};

function getSetup(materiaKey){
  if(!STATE.setupByMateria[materiaKey]){
    STATE.setupByMateria[materiaKey] = {
      niveis: new Set(['baixa','media','alta']),
      qtd: 20,
      anosExcluidos: new Set(),
      bancasExcluidas: new Set(),
      cargosExcluidos: new Set(),
      tendenciasExcluidas: new Set(),
      cargoMenuAberto: false,
      incluirIneditas: true, // questões sintéticas (geradas por IA) entram por padrão
    };
  }
  return STATE.setupByMateria[materiaKey];
}
// extrai banca/cargo de q.bc, aceitando três formatos:
// 1) clássico "BANCA, cargo (órgão)" — usado no material embutido e no parser padrão
// 2) "BANCA - cargo_abrev (ÓRGÃO)/ÓRGÃO/formação/ano" — visto em matérias como a
//    AFO. PRECISA ser checado ANTES dos outros dois formatos, por dois motivos
//    encontrados na prática: (a) a lista de formação do cargo às vezes tem
//    vírgulas no meio (ex.: "Administração, Economia ou Direito"), o que fazia o
//    formato clássico (que corta na PRIMEIRA vírgula do texto inteiro) cortar no
//    lugar errado e virar uma "banca" gigante e sem sentido; (b) sem esse
//    formato dedicado, o formato alternativo abaixo pegava a SIGLA DO ÓRGÃO
//    (ex.: "ANM", "UDESC") como se fosse banca, descartando a banca real
//    (ex.: "CEBRASPE (CESPE)") — que nem aparecia como opção de filtro.
// 3) alternativo "cargo abrev (órgão)/ÓRGÃO/área/cargo completo/ano" — visto em
//    matérias importadas cujo texto de origem não usa vírgula nem " - "; nesse
//    caso o campo logo após a primeira barra costuma ser a sigla do órgão/concurso,
//    que é o que dá pra usar como "banca" pra fins de filtro
function extrairBancaECargo(bc){
  if(!bc) return { banca:'—', cargo:'' };
  const txt = String(bc).trim();

  const mHifen = txt.match(/^([^,\/]+?)\s+-\s+(.+\/.+)$/);
  if(mHifen){
    const banca = mHifen[1].trim() || '—';
    const partes = mHifen[2].trim().split('/').map(p=>p.trim()).filter(Boolean);
    const semAno = (partes.length>1 && /^\d{4}$/.test(partes[partes.length-1])) ? partes.slice(0,-1) : partes.slice();
    const cargo = semAno.join(' — ');
    return { banca, cargo };
  }
  if(txt.indexOf(',') !== -1){
    const idx = txt.indexOf(',');
    return { banca: txt.slice(0, idx).trim() || '—', cargo: txt.slice(idx+1).trim() };
  }
  if(txt.indexOf('/') !== -1){
    const partes = txt.split('/').map(p=>p.trim()).filter(Boolean);
    const semAno = (partes.length>1 && /^\d{4}$/.test(partes[partes.length-1])) ? partes.slice(0,-1) : partes.slice();
    if(semAno.length===0) return { banca:'—', cargo:'' };
    const banca = semAno[1] || semAno[0] || '—';
    const cargo = semAno.length>2 ? semAno.slice(2).join(' — ') : (semAno[0] || '');
    return { banca, cargo };
  }
  return { banca: txt, cargo: '' };
}
function bancaCurta(bc){
  return extrairBancaECargo(bc).banca;
}
function cargoCurto(bc){
  return extrairBancaECargo(bc).cargo;
}
function tendenciaCurta(td){
  if(!td) return 'estável';
  if(td.indexOf('↑')!==-1) return 'crescente';
  if(td.indexOf('↓')!==-1) return 'decrescente';
  return 'estável';
}
function anosDisponiveis(){
  const set = new Set();
  scoreableFiltradas().forEach(q=>{ if(q.ar) set.add(String(q.ar)); });
  return Array.from(set).sort();
}
function bancasDisponiveis(){
  const set = new Set();
  // inéditas nunca entram na lista de bancas — elas têm filtro próprio
  // ("Incluir questões inéditas"), pra não aparecerem disfarçadas de banca real
  scoreableFiltradas().forEach(q=>{ if(!isInedita(q)) set.add(bancaCurta(q.bc)); });
  return Array.from(set).sort();
}
function cargosDisponiveis(){
  const set = new Set();
  scoreableFiltradas().forEach(q=>{ const c = cargoCurto(q.bc); if(c) set.add(c); });
  return Array.from(set).sort();
}
function tendenciasDisponiveis(){
  const presentes = new Set();
  scoreableFiltradas().forEach(q=>presentes.add(tendenciaCurta(q.td)));
  return ['crescente','estável','decrescente'].filter(t=>presentes.has(t));
}
function getLocalTab(materiaKey){
  return STATE.tabByMateria[materiaKey] || 'simulado';
}
function setLocalTab(materiaKey, tab){
  STATE.tabByMateria[materiaKey] = tab;
}

function ensureMateriaSelecionada(){
  const materias = materiasDisponiveis();
  if(!STATE.materia || !materias.includes(STATE.materia)){
    STATE.materia = materias[0] || null;
    STATE.tema = 'todos';
  }
}

const root = document.getElementById('app');

// Login Google obrigatório: até a conta ser reconhecida, a página mostra só
// esta tela. Sem o Firebase (sem conexão), avisa e oferece tentar de novo.
function precisaLogin(){
  return !USUARIO_ATUAL;
}
function renderTelaLogin(){
  let conteudo;
  if(!fbAuth){
    conteudo = `<h2>Sem conexão com o login</h2>
      <p>Não foi possível carregar o login com Google. Confira a internet e tente de novo.</p>
      <button class="btn btn-primary" id="btn-login-recarregar">↻ Tentar novamente</button>`;
  }else if(!AUTH_RESOLVIDO){
    conteudo = `<p>Verificando sua conta…</p>`;
  }else{
    conteudo = `<h2>Entre para continuar</h2>
      <p>Use sua conta Google para acessar as questões e salvar seu progresso em qualquer aparelho.</p>
      <button class="btn btn-primary" id="btn-login-google" style="font-size:15px;padding:10px 22px;">🔐 Entrar com Google</button>`;
  }
  return `<div class="tela-login"><div class="tela-login-caixa">
    <div class="seal-mark" style="margin:0 auto 10px;">${esc(CONFIG.sealText||'')}</div>
    <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;opacity:.7;margin-bottom:14px;">${esc(CONFIG.title||'')}</div>
    ${conteudo}
  </div></div>`;
}
function render(){
  if(precisaLogin()){
    document.body.classList.remove('focus-mode');
    root.innerHTML = renderTelaLogin();
    const btn = document.getElementById('btn-login-google');
    if(btn) btn.addEventListener('click', entrarComGoogle);
    const btnRecarregar = document.getElementById('btn-login-recarregar');
    if(btnRecarregar) btnRecarregar.addEventListener('click', ()=> location.reload());
    return;
  }
  ensureMateriaSelecionada();
  document.body.classList.toggle('focus-mode', !!STATE.focusMode);
  root.innerHTML = `
    ${STATE.focusMode ? '' : renderLetterhead()}
    ${STATE.focusMode ? '' : renderAvisoSyncAusente()}
    ${STATE.avisoStorage ? renderAvisoStorage() : ''}
    ${STATE.viewImportar || ALL_QUESTIONS.length===0 ? renderImportarPage() : renderMateriaPage()}
    ${STATE.focusMode ? '' : `<div class="footer-note">${esc(CONFIG.footer)} · Versão ${esc(window.__TCDF_BUILD__.versao)} (${esc(window.__TCDF_BUILD__.build)}) · armazenamento: ${esc(STORAGE_MODE==='local' ? 'IndexedDB' : STORAGE_MODE)}</div>`}
  `;
  attachHandlers();
}

// Banner fixo quando storageSet/storageGet falham (armazenamento cheio,
// bloqueado etc.), com opção de tentar salvar tudo de novo.
function renderAvisoStorage(){
  return `<div style="position:sticky;top:0;z-index:500;background:var(--stamp-red);color:#fff;padding:10px 16px;font-size:13px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
    <span>⚠️ ${esc(STATE.avisoStorage)}</span>
    <button id="btn-tentar-salvar-de-novo" style="padding:4px 10px;border-radius:6px;border:1px solid #fff;background:transparent;color:#fff;cursor:pointer;font-size:12px;">Tentar salvar de novo</button>
    <button id="btn-dispensar-aviso-storage" style="padding:4px 10px;border-radius:6px;border:1px solid #fff;background:transparent;color:#fff;cursor:pointer;font-size:12px;">Dispensar</button>
  </div>`;
}

// Sem código de sincronização o progresso não vai pra nuvem — por isso este
// banner aparece no topo de toda página até um código ser conectado.
// sem aviso de "salvo só neste aparelho": o login Google é obrigatório
function renderAvisoSyncAusente(){ return ''; }

function questoesFiltradas(){
  if(!STATE.materia) return [];
  return ALL_QUESTIONS.filter(q => q.materia===STATE.materia && (STATE.tema==='todos' || q.tema===STATE.tema) && !q.duplicataOculta);
}
// mesmo escopo de questoesFiltradas(), mas incluindo de volta qualquer questão
// que o usuário já tenha respondido alguma vez — mesmo que ela tenha sido
// marcada como duplicata depois. Usado só pra estatísticas/caderno de erros,
// pra não sumir com histórico de quem respondeu antes dessa checagem existir
function scopeUidsComHistorico(){
  if(!STATE.materia) return new Set();
  const bucket = getBucket(STATE.materia);
  const base = new Set(questoesFiltradas().map(q=>q.uid));
  Object.keys(bucket.perguntas).forEach(uid=>{
    const q = BY_UID[uid];
    if(q && q.materia===STATE.materia && (STATE.tema==='todos' || q.tema===STATE.tema)) base.add(uid);
  });
  return base;
}
function scoreableFiltradas(){
  return questoesFiltradas().filter(q => q.t==='CE' || q.t==='MC');
}

// "Certas/erradas" usam o resultado ATUAL de cada questão (p.ultimoResultado),
// a mesma definição do Caderno de erros — então "Erradas" aqui é sempre igual
// a getCadernoErros().length.
function computeSnapshot(){
  if(!STATE.materia) return { respondidas:0, tent:0, ac:0, taxa:0, erros:0, totalPontuavel:0 };
  const bucket = getBucket(STATE.materia);
  const scopeUids = scopeUidsComHistorico();
  const nums = Object.keys(bucket.perguntas).filter(u=>scopeUids.has(u));
  let ac=0, erradas=0;
  nums.forEach(u=>{
    const r = bucket.perguntas[u].ultimoResultado;
    if(r===true) ac++;
    else if(r===false) erradas++;
  });
  const tent = ac + erradas;
  return { respondidas: nums.length, tent, ac, taxa: pct(ac,tent), erros: erradas, totalPontuavel: scoreableFiltradas().length };
}



function computeSnapshotMateria(materiaKey){
  const bucket = getBucket(materiaKey);
  let ac=0, erradas=0, ultimaRespostaTs=null;
  Object.entries(bucket.perguntas).forEach(([uid,p])=>{
    if(!BY_UID[uid]) return; // órfã: questão não existe mais na base atual
    if(p.ultimoResultado===true) ac++;
    else if(p.ultimoResultado===false) erradas++;
    // (item 3) última resposta dada nesta matéria — o último item do histórico
    // de cada questão tem o timestamp mais recente PRA AQUELA questão; pega o
    // maior entre todas as questões da matéria
    if(p.historico && p.historico.length>0){
      const tsDaQuestao = p.historico[p.historico.length-1].ts;
      if(tsDaQuestao && (!ultimaRespostaTs || tsDaQuestao>ultimaRespostaTs)) ultimaRespostaTs = tsDaQuestao;
    }
  });
  const totalPontuavel = ALL_QUESTIONS.filter(q=>q.materia===materiaKey && !q.duplicataOculta && (q.t==='CE'||q.t==='MC')).length;
  return { taxa: pct(ac, ac+erradas), ac, erradas, totalPontuavel, ultimaRespostaTs };
}

function trendTag(td){
  if(!td) return '';
  let cls = 'tag-estavel';
  if(td.indexOf('↑')!==-1) cls='tag-crescente';
  else if(td.indexOf('↓')!==-1) cls='tag-decrescente';
  return `<span class="tag ${cls}" title="Tendência histórica na banca">${esc(td)}</span>`;
}
function trendBadge(td){
  if(!td) return '';
  let cls = 'estavel';
  if(td.indexOf('↑')!==-1) cls='crescente';
  else if(td.indexOf('↓')!==-1) cls='decrescente';
  return `<span class="trend-badge ${cls}" title="Tendência histórica na banca">${esc(td)}</span>`;
}
const NIVEL_SETA = { baixa:'↓', media:'→', alta:'↑' };
function nivelBadge(nv){
  const seta = NIVEL_SETA[nv];
  if(!seta) return '';
  return `<span class="nivel-badge ${nv}" title="Nível de incidência: ${esc(NIVEL_LABEL[nv]||'')}">${seta} ${esc(NIVEL_LABEL[nv]||'')}</span>`;
}
function freqBadge(fr){
  if(!fr) return '';
  return `<span class="freq-badge" title="Frequência histórica por banca e ano">📊 ${esc(fr)}</span>`;
}
function probabilidadeBadge(pp){
  if(!pp) return '';
  return `<span class="prob-badge" title="Probabilidade preditiva de recorrência">🎯 ${esc(pp)}</span>`;
}
// combina nível de incidência + tendência num único veredito direto, pra quem
// não tem "Probabilidade Preditiva" explícita na fonte (caso das listas que só
// trazem incidência histórica em concursos, sem esse campo pronto)
const MATRIZ_PROBABILIDADE = {
  alta:  { crescente:'Alta', 'estável':'Alta',   decrescente:'Média' },
  media: { crescente:'Alta', 'estável':'Média',  decrescente:'Baixa' },
  baixa: { crescente:'Média','estável':'Baixa',  decrescente:'Baixa' },
};
function probabilidadeCalculada(q){
  if(q.pp) return null; // já existe um valor explícito da fonte, não sobrepor
  const narrativa = narrativaBanca(q);
  // Sem veredito de narrativaBanca (poucas provas reais na base), não afirma
  // nenhuma probabilidade — q.nv/q.td são palpites gerados por questão e não
  // servem pra isso.
  return (narrativa && narrativa.forcaProbabilidade) || null;
}
function probabilidadeCalculadaBadge(q){
  const p = probabilidadeCalculada(q);
  if(!p) return '';
  const cor = p==='Alta' ? 'prob-alta' : p==='Média' ? 'prob-media' : 'prob-baixa';
  return `<span class="prob-badge prob-calc ${cor}" title="Estimativa combinando nível de incidência histórica e tendência recente — não é um campo direto da fonte">🎯 ${p} probabilidade</span>`;
}

// "Como a banca pensa": usa analisarTemasDaMateria, que conta PROVAS REAIS
// DISTINTAS (valores únicos de q.bc) na matéria, e não q.fr ("Incidência
// histórica" que o gerador de questões inventa por questão). Com amostra
// pequena, avisa que há poucos dados em vez de inventar um veredito.
function narrativaBanca(q){
  if(isInedita(q)) return null;
  if(!q.tema || !q.materia) return null;
  const analise = analisarTemasDaMateriaCached(q.materia);
  const dados = analise.find(a => a.tema===q.tema);
  if(!dados) return null;

  const { faixa, confianca, tendenciaTxt, nProvasComTema, totalProvas, provasRecentesComTema, totalProvasRecentes, score } = dados;

  if(confianca==='baixa'){
    return { icone:'❔', cor:'narr-raro', titulo:'Poucos dados ainda',
      texto:`Só ${totalProvas} prova${totalProvas===1?'':'s'} ${totalProvas===1?'real':'reais'} dessa matéria na base até agora — ainda não dá pra estimar com confiança a probabilidade deste assunto. Isso não quer dizer que ele é raro na banca, só que a base ainda é pequena.`,
      forcaProbabilidade: null };
  }

  const detalheRecente = totalProvasRecentes>0 ? ` Nos últimos 5 anos: ${provasRecentesComTema} de ${totalProvasRecentes} provas.` : '';
  if(faixa==='alta'){
    return { icone:'🔥', cor:'narr-alta', titulo:'Alta probabilidade',
      texto:`Apareceu em ${nProvasComTema} das ${totalProvas} provas reais já vistas dessa matéria (${Math.round(score*100)}%). Tendência: ${tendenciaTxt}.${detalheRecente}`,
      forcaProbabilidade:'Alta' };
  }
  if(faixa==='media'){
    return { icone:'⚖️', cor:'narr-estavel', titulo:'Média probabilidade',
      texto:`Apareceu em ${nProvasComTema} das ${totalProvas} provas reais já vistas dessa matéria (${Math.round(score*100)}%). Tendência: ${tendenciaTxt}.${detalheRecente}`,
      forcaProbabilidade:'Média' };
  }
  return { icone:'🎲', cor:'narr-raro', titulo:'Baixa probabilidade',
    texto:`Apareceu em só ${nProvasComTema} das ${totalProvas} provas reais já vistas dessa matéria (${Math.round(score*100)}%). Tendência: ${tendenciaTxt}.${detalheRecente}`,
    forcaProbabilidade:'Baixa' };
}
function narrativaBancaBanner(q){
  const n = narrativaBanca(q);
  if(!n) return '';
  // a probabilidade calculada entra dentro da própria narrativa (em vez de um
  // badge separado logo acima) — evita repetir o mesmo veredito duas vezes
  // com cores parecidas, já que a narrativa por si só já entrega o "porquê"
  const prob = n.forcaProbabilidade || probabilidadeCalculada(q);
  const probTxt = (prob && !q.pp) ? ` <span class="narr-prob">(${esc(prob)} probabilidade)</span>` : '';
  return `<div class="narr-banner ${n.cor}">
    <span class="narr-icone">${n.icone}</span>
    <span class="narr-texto"><b>${esc(n.titulo)}</b>${probTxt} — ${esc(n.texto)}</span>
  </div>`;
}
function freqHistLine(fr){
  if(!fr) return '';
  return `<div class="freq-hist"><span class="lbl-inline">Frequência por ano:</span> ${esc(fr)}</div>`;
}
function bancaCargoAnoLine(q){
  const banca = bancaCurta(q.bc);
  const ano = q.ar || (q.an && q.an.length ? Math.max(...q.an) : null);
  // remove um ano já embutido no fim do texto do cargo (ex.: "Agente
  // Administrativo — 2025") pra não duplicar com o campo "Ano:" logo depois
  let cargo = cargoCurto(q.bc);
  if(cargo && ano) cargo = cargo.replace(new RegExp(`[\\s\\u2014-]*${ano}\\s*$`), '').trim();
  return `<span class="lbl-inline">Banca:</span> ${esc(banca)}`
    + (cargo ? ` &nbsp;·&nbsp; <span class="lbl-inline">Cargo:</span> ${esc(cargo)}` : '')
    + (ano ? ` &nbsp;·&nbsp; <span class="lbl-inline">Ano:</span> ${ano}` : '');
}
// padrão banca-cargo-ano-incidência: a incidência histórica entra aqui em forma
// compacta de símbolo (📊 total ×, 🕐 recentes nos últimos 5 anos), em vez do
// texto completo — que continua disponível por extenso no badge/tooltip
function incidenciaSimbolo(q){
  if(!q.fr || isInedita(q)) return '';
  const mTotal = q.fr.match(/(\d+)\s*concursos?\s*distint/i);
  if(!mTotal) return '';
  const mRecentes = q.fr.match(/\((\d+)\s*nos? [úu]ltimos\s*5\s*anos\)/i);
  const total = mTotal[1];
  const recentes = mRecentes ? mRecentes[1] : null;
  return ` &nbsp;·&nbsp; <span class="lbl-inline" title="${esc(q.fr)}">📊 ${total}×${recentes!==null ? `&nbsp;<span style="opacity:.7;">(🕐${recentes} recentes)</span>` : ''}</span>`;
}

// ano mais recente entre todas as questões da matéria atual, usado como referência
// para decidir o que conta como "últimos dois anos" nos dados daquela matéria
function anoMaisRecente(materiaKey){
  let max = 0;
  ALL_QUESTIONS.forEach(q=>{ if((!materiaKey || q.materia===materiaKey) && q.ar && q.ar>max) max=q.ar; });
  return max;
}
function tendenciaQuente(q){
  if(!q.td || q.td.indexOf('↑')===-1 || !q.ar) return false;
  const maxAno = anoMaisRecente(q.materia);
  return maxAno>0 && q.ar >= maxAno-1;
}
function alertaTendenciaTag(q){
  if(!tendenciaQuente(q)) return '';
  return `<span class="tag tag-alerta" title="Essa questão apareceu em prova nos últimos anos com tendência de alta — atenção redobrada">⚠ alta recente</span>`;
}

// detecta questão inédita (gerada por IA, não pertence a nenhuma banca real) pelo
// prefixo "INÉDITA" no campo de banca — robusto a variações de vírgula/espaço,
// já que o prompt de geração pode formatar o texto de formas ligeiramente diferentes
function isInedita(q){
  // duas convenções em uso nas listas geradas até aqui: "INÉDITA, ..." e
  // "Elaboração própria — ...". Ambas indicam questão sintética, não de banca real.
  return !!(q.bc && /^\s*(inédita\b|elabora[çc][ãa]o pr[óo]pria\b)/i.test(q.bc));
}
function ineditaBadge(q){
  if(!isInedita(q)) return '';
  return `<span class="tag tag-inedita" title="Questão gerada por IA para completar o simulado — não é de banca real">🟥🟨 INÉDITA 🟨🟥</span>`;
}

// extrai referências legais citadas num texto (artigos, súmulas, leis), pra
// identificar quais são os "temas centrais" mais recorrentes de cada assunto —
// item 2 do dashboard analítico. Normaliza pequenas variações de escrita
// ("art." / "artigo", "nº" / "n°") pra não contar a mesma referência 2x.
function extrairReferenciasLegais(texto){
  if(!texto) return [];
  const refs = [];
  let m;
  const reArt = /\bart(?:igo)?\.?\s*(\d+)[ºo°]?/gi;
  while((m = reArt.exec(texto))) refs.push('Art. ' + m[1]);
  const reSumula = /\bs[uú]mula\s*n?[ºo°]?\.?\s*(\d+)/gi;
  while((m = reSumula.exec(texto))) refs.push('Súmula ' + m[1]);
  const reLei = /\blei\s+(?:complementar\s+)?n[ºo°]?\.?\s*([\d./]+)/gi;
  while((m = reLei.exec(texto))) refs.push('Lei ' + m[1]);
  return refs;
}

// analisa todos os assuntos de uma matéria: pra cada um, levanta as referências
// legais mais citadas (item 2) e calcula um índice de "probabilidade de
// cobrança" combinando % de questões de alta incidência com % de questões em
// tendência de alta recente (item 3) — quanto maior, mais provável de cair de
// novo em provas futuras, segundo o histórico já registrado nessa matéria
// identifica se a questão veio de uma banca/prova real (tem q.bc com banca
// reconhecível) ou é uma questão inédita (sem banca real, "—" de fallback) —
// item 1: a análise por assunto do dashboard só deve considerar questões reais
function ehQuestaoDeBancaReal(q){
  if(isInedita(q)) return false;
  const b = bancaCurta(q.bc);
  return !!b && b !== '—';
}
// Incidência por assunto medida em PROVAS REAIS DISTINTAS (cada valor único de
// q.bc — banca+cargo+ano — é uma prova), não em quantidade de questões na base
// nem nos campos q.nv/q.td (palpites gerados por questão).
// Score = % das provas da base que cobraram o assunto, com peso maior nos
// últimos 5 anos. Amostra pequena reduz a confiança, nunca vira score alto.
function contarProvasDistintas(qs){
  const set = new Set();
  qs.forEach(q => { if(q.bc) set.add(q.bc); });
  return set;
}
// cache simples por matéria — narrativaBanca/probabilidadeCalculada chamam
// isso por QUESTÃO renderizada, e recalcular analisarTemasDaMateria (que
// percorre a base toda) a cada card seria caro. Invalidação: comparamos o
// tamanho atual de ALL_QUESTIONS com o tamanho no momento do cache; qualquer
// import/remoção/reprocessamento muda esse número quase sempre. Não é 100%
// à prova de um replace que mantenha exatamente a mesma contagem, mas esse
// caso é raro e o próximo import/edição já corrige.
let _analiseTemasCache = {};
function analisarTemasDaMateriaCached(materiaKey){
  const qtdAtual = ALL_QUESTIONS.length;
  const hit = _analiseTemasCache[materiaKey||''];
  if(hit && hit.qtdAtual===qtdAtual) return hit.dados;
  const dados = analisarTemasDaMateria(materiaKey);
  _analiseTemasCache[materiaKey||''] = { qtdAtual, dados };
  return dados;
}
function analisarTemasDaMateria(materiaKey){
  const todasQs = ALL_QUESTIONS.filter(q => q.materia===materiaKey && !q.duplicataOculta && (q.t==='CE'||q.t==='MC') && ehQuestaoDeBancaReal(q));
  const provasTotais = contarProvasDistintas(todasQs);
  const totalProvas = provasTotais.size;
  if(totalProvas===0) return [];

  const anoRef = anoMaisRecente(materiaKey);
  const JANELA_RECENTE_ANOS = 5;
  const provasRecentesSet = new Set(
    [...todasQs].filter(q => q.ar && anoRef && q.ar >= anoRef-(JANELA_RECENTE_ANOS-1)).map(q=>q.bc).filter(Boolean)
  );
  const totalProvasRecentes = provasRecentesSet.size;

  const temas = temasDisponiveis(materiaKey).filter(t => t && t!=='Fora do Edital');
  return temas.map(tema=>{
    const qs = todasQs.filter(q => q.tema===tema);
    if(qs.length===0) return null;

    const refsMap = {};
    qs.forEach(q=>{
      // dedup por questão: se o mesmo artigo aparece no enunciado E na resolução
      // da mesma questão, conta como 1 só — o que importa é quantas QUESTÕES
      // diferentes citam aquela referência, não quantas vezes ela é mencionada
      const refsUnicas = new Set(extrairReferenciasLegais((q.q||'') + ' ' + (q.r||'')));
      refsUnicas.forEach(ref=>{ refsMap[ref] = (refsMap[ref]||0) + 1; });
    });
    const refsOrdenadas = Object.entries(refsMap).sort((a,b)=>b[1]-a[1]).slice(0,3);

    const provasComTema = contarProvasDistintas(qs);
    const nProvasComTema = provasComTema.size;
    const provasRecentesComTema = [...provasComTema].filter(bc => provasRecentesSet.has(bc)).length;

    const incidenciaGeral = nProvasComTema/totalProvas;
    const incidenciaRecente = totalProvasRecentes>0 ? (provasRecentesComTema/totalProvasRecentes) : incidenciaGeral;
    const score = incidenciaGeral*0.4 + incidenciaRecente*0.6;

    // confiança da estimativa = quantas provas distintas embasam o cálculo
    // nessa matéria (não é por-tema — é a base toda). Poucas provas na base
    // = qualquer percentual aqui é pouco confiável, seja ele alto ou baixo.
    const confianca = totalProvas>=15 ? 'alta' : (totalProvas>=5 ? 'media' : 'baixa');

    let faixa;
    if(score>=0.66) faixa='alta';
    else if(score>=0.33) faixa='media';
    else faixa='baixa';

    const delta = incidenciaRecente - incidenciaGeral;
    const tendenciaTxt = delta>0.15 ? '↑ Crescente' : (delta<-0.15 ? '↓ Decrescente' : '→ Estável');

    return {
      tema, total: qs.length, refsOrdenadas,
      nProvasComTema, totalProvas, provasRecentesComTema, totalProvasRecentes,
      incidenciaGeral, incidenciaRecente, score, faixa, confianca, tendenciaTxt,
    };
  }).filter(Boolean).sort((a,b)=>b.score-a.score || b.total-a.total);
}

// faixa de cor pastel pro percentual: 90-100 verde claro, 70-89 amarelo claro,
// 0-69 vermelho claro; sem tentativas = neutro
function faixaCorPct(pct, respondidas){
  if(!respondidas) return { bg:'#f3f1ea', fg:'#7a7566', fgForte:'#7a7566' };
  // faixas pedidas: 100-90% azul, 89-80% verde, 79-70% amarelo, 69-0% vermelho
  // (cores claras, mesma família de tons já usada no resto da tela)
  if(pct>=90) return { bg:'#e3eefb', fg:'#1e5f9d', fgForte:'#134a80' };
  if(pct>=80) return { bg:'#e3f6e9', fg:'#1e7d43', fgForte:'#166534' };
  if(pct>=70) return { bg:'#fdf4d9', fg:'#8a6416', fgForte:'#7a5a10' };
  return { bg:'#fce6e4', fg:'#a3352c', fgForte:'#8f2a22' };
}
// anel compacto de acerto geral (certas x erradas), no canto superior direito
// do card
function renderAnelAcertoGeral(totalAcertos, totalErros){
  const total = totalAcertos + totalErros;
  const pctGeral = total>0 ? pct(totalAcertos, total) : 0;
  const r = 30, cx = 40, cy = 40, circ = 2*Math.PI*r;
  const fatiaCertas = total>0 ? (totalAcertos/total)*circ : 0;
  return `
    <div style="display:flex;align-items:center;gap:10px;">
      <svg viewBox="0 0 80 80" width="64" height="64">
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#fce6e4" stroke-width="10" />
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#a7d8b8" stroke-width="10"
          stroke-dasharray="${fatiaCertas.toFixed(1)} ${(circ-fatiaCertas).toFixed(1)}"
          stroke-dashoffset="${(circ*0.25).toFixed(1)}" stroke-linecap="butt" />
        <text x="${cx}" y="${cy-1}" text-anchor="middle" font-size="15" font-weight="800" fill="currentColor">${total?pctGeral+'%':'—'}</text>
        <text x="${cx}" y="${cy+11}" text-anchor="middle" font-size="7" fill="currentColor" opacity=".6">acerto</text>
      </svg>
      <div style="font-size:11px;line-height:1.5;">
        <div style="color:#166534;font-weight:700;">${totalAcertos} certas</div>
        <div style="color:#8f2a22;font-weight:700;">${totalErros} erradas</div>
      </div>
    </div>`;
}

function renderEstatisticasPorMateria(){
  const materias = materiasDisponiveis();
  if(materias.length<2) return ''; // com 1 matéria só, isso duplicaria o card grande de cima
  const linhas = materias.map(m=>{
    const s = computeSnapshotMateria(m);
    const respondidas = s.ac + s.erradas;
    const q = STATE.quizzesEmAndamento[m];
    const temSimuladoEmAndamento = q && !q.finished;
    return { nome: m, acertos: s.ac, erros: s.erradas, pct: s.taxa, respondidas, total: s.totalPontuavel, ativa: m===STATE.materia, temSimuladoEmAndamento, ultimaRespostaTs: s.ultimaRespostaTs };
  }).sort((a,b)=> a.nome.localeCompare(b.nome,'pt-BR') || b.respondidas - a.respondidas || b.pct - a.pct);
  const estiloCelula = 'font-size:13px;font-weight:400;font-family:inherit;line-height:1.4;';
  const atividade = computeAtividadeDiariaGeral();
  return `
  <div class="card-block" style="margin-top:22px;">
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
      <h3 style="margin:0;color:inherit;">📈 Estatísticas por matéria</h3>
    </div>
    <div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap;">
      <div class="stat-chip" style="flex:1;max-width:220px;background:var(--paper-soft,#f7f3e8);color:var(--ink);border-radius:8px;padding:8px 12px;" title="Baseado no histórico recente de cada questão (últimas 20 tentativas)">
        <div style="font-size:11px;color:var(--ink-soft);">Total hoje</div>
        <div style="font-size:15px;font-weight:700;">${atividade.totalHoje} questõe${atividade.totalHoje===1?'':'s'}</div>
      </div>
      <div class="stat-chip" style="flex:1;max-width:220px;background:var(--paper-soft,#f7f3e8);color:var(--ink);border-radius:8px;padding:8px 12px;" title="Baseado no histórico recente de cada questão (últimas 20 tentativas) · ${atividade.diasComAtividade} dia(s) com atividade">
        <div style="font-size:11px;color:var(--ink-soft);">Média diária</div>
        <div style="font-size:15px;font-weight:700;">${atividade.mediaDiaria.toFixed(1)} questões/dia</div>
      </div>
    </div>
    <div style="height:10px;"></div>
    ${renderTabelaEstatisticas(linhas, estiloCelula)}
  </div>
  `;
}

// agrega o histórico de respostas de TODAS as matérias por dia — totais e
// média diária da aba Tabela. Como cada questão guarda só as últimas 20
// tentativas, reflete a atividade recente, não o total absoluto.
function computeAtividadeDiariaGeral(){
  const porDia = {};
  Object.values(PROGRESS).forEach(bucket=>{
    if(!bucket || !bucket.perguntas) return;
    Object.entries(bucket.perguntas).forEach(([uid,p])=>{
      if(!BY_UID[uid]) return; // órfã: questão não existe mais na base atual
      (p.historico||[]).forEach(h=>{
        if(!h || !h.ts) return;
        const dia = new Date(h.ts).toLocaleDateString('pt-BR');
        porDia[dia] = (porDia[dia]||0) + 1;
      });
    });
  });
  const dias = Object.keys(porDia);
  const totalRespostas = dias.reduce((s,d)=> s+porDia[d], 0);
  const hojeChave = new Date().toLocaleDateString('pt-BR');
  return {
    totalHoje: porDia[hojeChave] || 0,
    mediaDiaria: dias.length>0 ? totalRespostas/dias.length : 0,
    diasComAtividade: dias.length,
  };
}

function renderTabelaEstatisticas(linhas, estiloCelula){
  const cabecalhoTabela = `
    <div style="display:flex;gap:10px;${estiloCelula}color:var(--ink-soft);padding:0 8px 6px;border-bottom:1px solid var(--line-soft, #e4dfd2);margin-bottom:2px;">
      <div style="width:26px;">#</div>
      <div style="flex:1;">Matéria</div>
      <div style="width:56px;text-align:right;">Total</div>
      <div style="width:76px;text-align:right;">Respondidas</div>
      <div style="width:60px;text-align:right;">Acerto</div>
      <div style="width:52px;text-align:right;">Erro</div>
      <div style="width:56px;text-align:right;">%</div>
      <div style="width:90px;text-align:right;">Última resposta</div>
    </div>
    ${linhas.map((l,i)=>{
      const cor = faixaCorPct(l.pct, l.respondidas);
      const destaque = l.ativa ? `border:2px solid ${cor.fgForte};` : 'border:2px solid transparent;';
      return `<div class="bar-row" style="flex-wrap:wrap;align-items:center;background:${cor.bg};border-radius:6px;padding:6px 8px;margin-bottom:4px;${destaque}">
        <div style="width:26px;${estiloCelula}color:${cor.fg};">${l.ativa?'▸':i+1}</div>
        <div class="name" style="cursor:pointer;flex:1;${estiloCelula}color:${cor.fgForte};font-weight:${l.ativa?800:600};display:flex;align-items:center;gap:6px;" data-macro-materia="${esc(l.nome)}">
          <span>${esc(l.nome)}${l.ativa?' <span style="font-size:10px;font-weight:600;opacity:.75;">(selecionada)</span>':''}</span>
          ${l.temSimuladoEmAndamento ? `<button data-continuar-materia="${esc(l.nome)}" style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;border:1px solid ${cor.fgForte};background:transparent;color:${cor.fgForte};cursor:pointer;white-space:nowrap;">▶ Continuar</button>` : ''}
        </div>
        <div style="width:56px;text-align:right;${estiloCelula}color:${cor.fg};">${l.total}</div>
        <div style="width:76px;text-align:right;${estiloCelula}color:${cor.fg};">${l.respondidas || '—'}</div>
        <div style="width:60px;text-align:right;${estiloCelula}color:${cor.fg};">${l.respondidas ? l.acertos : '—'}</div>
        <div style="width:52px;text-align:right;${estiloCelula}color:${cor.fg};">${l.respondidas ? l.erros : '—'}</div>
        <div style="width:56px;text-align:right;${estiloCelula}color:${cor.fgForte};font-weight:700;">${l.respondidas ? l.pct+'%' : '—'}</div>
        <div style="width:90px;text-align:right;${estiloCelula}color:${cor.fg};font-size:11px;" title="${l.ultimaRespostaTs ? new Date(l.ultimaRespostaTs).toLocaleString('pt-BR') : ''}">${l.ultimaRespostaTs ? formatarDataHoraSalvamento(l.ultimaRespostaTs) : '—'}</div>
        ${l.respondidas ? `<div class="linha-estatistica-trilho" title="${esc(l.nome)}: ${l.pct}% de acerto"><div class="linha-estatistica-barra" style="width:${Math.max(0, Math.min(100, l.pct))}%;background:${cor.fgForte};"></div></div>` : ''}
      </div>`;
    }).join('')}`;
  return cabecalhoTabela;
}

function renderDashboardAnalitico(){
  if(!STATE.materia) return '';
  const analise = analisarTemasDaMateria(STATE.materia);
  if(analise.length===0) return '';
  const destaques = analise.filter(a=>a.faixa==='alta' && a.confianca!=='baixa').slice(0,3);

  // desempenho (certas/erradas) por assunto, pra desenhar a barra verde/vermelha
  // na mesma linha do assunto — não filtra por banca real, reflete o desempenho
  // de fato nas tentativas do candidato, incluindo inéditas respondidas
  const bucket = getBucket(STATE.materia);
  const acertosPorTema = {};
  // mesma correção das outras estatísticas: conta pelo resultado ATUAL de
  // cada questão (1 vez cada), não pela soma histórica de tentativas — senão
  // essa barra verde/vermelha não bate com o resto da página.
  Object.entries(bucket.perguntas||{}).forEach(([uid,p])=>{
    const q = BY_UID[uid]; if(!q || q.materia!==STATE.materia) return;
    if(p.ultimoResultado!==true && p.ultimoResultado!==false) return;
    if(!acertosPorTema[q.tema]) acertosPorTema[q.tema]=[0,0];
    acertosPorTema[q.tema][0]+=(p.ultimoResultado===true?1:0); acertosPorTema[q.tema][1]+=1;
  });

  const confiancaGeral = analise.length ? analise[0].confianca : 'baixa';
  const avisoConfianca = confiancaGeral!=='alta' ? `<p style="font-size:12px;color:var(--stamp-red, #a3352c);margin:-6px 0 14px;">⚠ Base ainda pequena (${analise[0].totalProvas} prova${analise[0].totalProvas===1?'':'s'} distinta${analise[0].totalProvas===1?'':'s'} identificada${analise[0].totalProvas===1?'':'s'} nessa matéria) — os percentuais abaixo tendem a ficar mais precisos à medida que mais provas reais forem importadas. Poucas provas na base não significa que o assunto é raro na banca, só que ainda vimos pouco dele.</p>` : '';
  return `
  <div class="card-block dashboard-analitico" style="margin-top:24px;">
    <h3>📊 Análise por assunto</h3>
    <p style="font-size:12px;color:var(--ink-soft);margin-bottom:14px;">Levantamento automático a partir de questões reais de bancas (questões inéditas não entram nesta análise) — % de provas distintas, dentre as já importadas dessa matéria, que cobraram cada assunto (ponderando mais o comportamento dos últimos 5 anos que o histórico total). Quanto maior o percentual, maior a probabilidade estimada de cobrança em provas futuras.</p>
    ${avisoConfianca}
    ${destaques.length ? `<div class="tendencia-alerta">
      <b>⚠ Maior probabilidade de cobrança agora:</b> ${destaques.map(a=>esc(a.tema)).join(', ')} — assuntos presentes na maioria das provas reais já vistas, com base numa amostra razoável.
    </div>` : ''}
    ${analise.map(a=>{
      const [ac,tt] = acertosPorTema[a.tema] || [0,0];
      const pctAcerto = tt ? Math.round((ac/tt)*100) : 0;
      const pctErro = tt ? 100-pctAcerto : 0;
      const incClasse = a.faixa==='alta' ? 'inc-alta' : (a.faixa==='media' ? 'inc-media' : 'inc-baixa');
      const incLabel = a.faixa==='alta' ? 'Alta' : (a.faixa==='media' ? 'Média' : 'Baixa');
      const tituloIncidencia = `${a.nProvasComTema} de ${a.totalProvas} provas reais já vistas cobraram este assunto (${Math.round(a.incidenciaGeral*100)}% do histórico)`
        + (a.totalProvasRecentes>0 ? `; nos últimos 5 anos: ${a.provasRecentesComTema} de ${a.totalProvasRecentes} (${Math.round(a.incidenciaRecente*100)}%)` : '');
      return `
      <div class="assunto-analise-row">
        <div class="assunto-analise-nome">${esc(a.tema)} <span class="cnt">(${a.total})</span></div>
        <div class="assunto-analise-incidencia" title="${esc(tituloIncidencia)}">
          <span class="inc-badge ${incClasse}">${incLabel} · ${a.nProvasComTema}/${a.totalProvas} provas</span>
          <span class="inc-badge" style="background:transparent;color:var(--ink-soft);font-weight:400;">${a.tendenciaTxt}</span>
        </div>
        <div class="assunto-analise-bar" title="${tt? `${ac} certas / ${tt-ac} erradas de ${tt} tentativas` : 'ainda não respondida'}">
          <div class="stacked-bar">
            ${tt ? `<div class="stacked-seg stacked-green" style="width:${pctAcerto}%;"></div><div class="stacked-seg stacked-red" style="width:${pctErro}%;"></div>` : `<div class="stacked-seg stacked-empty" style="width:100%;"></div>`}
          </div>
          <span class="stacked-pct">${tt ? `${ac} acertos · ${tt-ac} erros · ${pctAcerto}%` : '—'}</span>
        </div>
        <div class="assunto-analise-score" title="Score = 40% incidência histórica geral + 60% incidência nos últimos 5 anos, medida em provas distintas">${Math.round(a.score*100)}%</div>
      </div>
    `;}).join('')}
  </div>
  `;
}

function orgaoCargoDaMateria(){
  if(!STATE.materia) return null;
  const contagem = {};
  ALL_QUESTIONS.filter(q=>q.materia===STATE.materia).forEach(q=>{
    const cargo = cargoCurto(q.bc);
    if(cargo){
      const orgaoMatch = cargo.match(/\(([^)]+)\)\s*$/);
      const orgao = orgaoMatch ? orgaoMatch[1] : null;
      const chave = orgao || cargo;
      contagem[chave] = (contagem[chave]||0) + 1;
    }
  });
  const entradas = Object.entries(contagem).sort((a,b)=>b[1]-a[1]);
  return entradas.length ? entradas[0][0] : null;
}

function renderLetterhead(){
  const s = computeSnapshot();
  const totalVisivel = ALL_QUESTIONS.filter(q=>!q.duplicataOculta).length;
  const countBadge = totalVisivel ? `<span class="title-count-badge">${totalVisivel} questões</span>` : '';
  const tituloExibido = 'TCDF Plataforma';
  const escopoTema = (STATE.materia && STATE.tema!=='todos') ? `<div class="escopo-aviso">📍 estatísticas filtradas por assunto: <b>${esc(STATE.tema)}</b> — <a href="#" id="link-limpar-assunto-header">ver a matéria inteira</a></div>` : '';
  return `
  <div class="letterhead">
    <div class="seal">
      <div class="seal-mark">${esc(CONFIG.sealText)}</div>
      <div>
        <div class="eyebrow">${esc(CONFIG.eyebrow)}</div>
        <h1 class="title">${esc(tituloExibido)} <span class="version-tag" title="Versão do código carregada agora — se tiver dúvida se está atualizado, confira aqui">${esc(window.__TCDF_BUILD__.versao)}</span> ${countBadge}</h1>
        <div class="subtitle">${totalVisivel ? `${ALL_QUESTIONS.filter(q=>!q.duplicataOculta && (q.t==='CE'||q.t==='MC')).length} pontuáveis em ${materiasDisponiveis().length} matéria(s).` : 'Nenhuma questão carregada ainda. Importe um arquivo .txt para começar.'}</div>
      </div>
    </div>
    <div class="snapshot">
      ${(()=>{
        // total geral (todas as matérias juntas) no mesmo formato de texto do resto
        // do cabeçalho
        if(materiasDisponiveis().length<2) return '';
        let totalAcertos=0, totalErros=0, totalGeral=0;
        materiasDisponiveis().forEach(m=>{
          const sm = computeSnapshotMateria(m);
          totalAcertos += sm.ac; totalErros += sm.erradas; totalGeral += sm.totalPontuavel;
        });
        const totalRespondidas = totalAcertos+totalErros;
        const pctGeralTodas = totalRespondidas>0 ? pct(totalAcertos,totalRespondidas) : 0;
        return `<div class="stat" title="Total geral — todas as matérias juntas">
            <div class="num">${totalRespondidas?pctGeralTodas+'%':'—'}</div><div class="lbl">Acerto geral (todas)</div>
          </div>
          <div class="stat" title="Total geral — todas as matérias juntas">
            <div class="num">${totalGeral}</div><div class="lbl">Total geral</div>
          </div>
          <div class="stat" title="Total geral — todas as matérias juntas">
            <div class="num"><span class="n-certa">${totalAcertos}</span></div><div class="lbl">Certas</div>
          </div>
          <div class="stat" title="Total geral — todas as matérias juntas">
            <div class="num"><span class="n-errada">${totalErros}</span></div><div class="lbl">Erradas</div>
          </div>`;
      })()}
      <button class="theme-toggle-btn" id="btn-theme-toggle" title="Alternar modo claro/escuro">${STATE.theme==='light'?'🌙':'☀️'}</button>
      <div class="color-picker-wrap">
        <button class="theme-toggle-btn" id="btn-color-picker" title="Mudar a cor do layout">🎨</button>
        ${STATE.corPickerAberto ? `<div class="color-picker-pop">
          ${Object.entries(PALETAS_CORES).map(([nome,cor])=>`<button class="color-swatch ${STATE.corTema===nome?'selected':''}" data-cor-tema="${nome}" style="background:${cor.gold};" title="${nome}"></button>`).join('')}
        </div>` : ''}
      </div>
    </div>
  </div>
  ${escopoTema}`;
}

/* ================= MATÉRIA, PROGRESSO E SINCRONIZAÇÃO (barra lateral) ================= */
function renderMateriaTopStrip(){
  const materias = materiasDisponiveis();
  const aberto = STATE.materiaMenuAberto;
  const labelAtual = STATE.viewImportar ? '+ Importar questões' : (STATE.materia || 'Selecione uma matéria');
  return `<div class="sidebar-block"><div class="sb-pad">
    <button type="button" class="assunto-toggle" id="btn-toggle-materia-menu">
      <span class="sidebar-label" style="margin-bottom:0;">Matéria</span>
      <span class="assunto-atual">${aberto?'▴':'▾'}</span>
    </button>
    <div class="assunto-atual-label">${esc(labelAtual)}</div>
    ${aberto ? `<div class="subject-tabs" style="margin-top:10px;">
      <button class="subject-tab ${STATE.viewImportar?'active':''}" data-macro-importar="1">+ Importar questões</button>
      ${materias.map(m=>{
        const n = ALL_QUESTIONS.filter(q=>q.materia===m && !q.duplicataOculta).length;
        const ativo = !STATE.viewImportar && STATE.materia===m;
        const s = computeSnapshotMateria(m);
        const statsTxt = (s.ac+s.erradas)>0 ? `${s.taxa}% · ${s.ac} certas · ${s.erradas} erradas · ${s.totalPontuavel} total` : `${s.totalPontuavel} pontuáveis · ainda sem tentativas`;
        return `<button class="subject-tab materia-tab-btn ${ativo?'active':''}" data-macro-materia="${esc(m)}">
          <span class="materia-tab-row1"><span>${esc(m)}</span><span class="cnt">${n}</span></span>
          <span class="materia-tab-stats">${statsTxt}</span>
        </button>`;
      }).join('')}
    </div>` : ''}
  </div></div>`;
}

function renderContaBlock(){
  if(!fbAuth) return '';
  if(!USUARIO_ATUAL){
    return `<button class="side-action-btn compact" id="btn-entrar-google" style="margin-top:6px;">🔐 Entrar com Google</button>
      <div class="side-status detail">para salvar o progresso na nuvem e usar em outros aparelhos</div>`;
  }
  // o UID fica só no title (passar o mouse) — é o valor usado em firestore.rules
  return `<div class="sync-user-display" title="${esc(USUARIO_ATUAL.email)} · UID ${esc(USUARIO_ATUAL.uid)}">👤 ${esc(USUARIO_ATUAL.nome)}</div>
    <button class="side-action-btn compact" id="btn-sair-google">Sair da conta</button>`;
}
function renderSyncSidebarBlock(){
  if(!FIREBASE_OK){
    return `<div class="sidebar-block"><div class="sb-pad">
      <div class="sidebar-label">Sincronização</div>
      <div class="side-status err">indisponível nesta sessão</div>
    </div></div>`;
  }
  if(!USUARIO_ATUAL){
    return `<div class="sidebar-block"><div class="sb-pad sync-block compact">
      <div class="sidebar-label">Sincronização</div>
      ${renderContaBlock()}
    </div></div>`;
  }
  const statusClass = STATE.syncStatus ? STATE.syncStatus.type : '';
  const statusMsg = statusClass==='ok' ? '🟢 Atualizado na nuvem' : (STATE.syncStatus ? STATE.syncStatus.msg : 'sincronizando…');
  const statusHorario = (statusClass==='ok' && STATE.syncStatus) ? STATE.syncStatus.msg.replace('nuvem ✓ ', '') : '';
  const statusDetalhe = STATE.syncStatus ? STATE.syncStatus.detalhe : '';
  return `<div class="sidebar-block"><div class="sb-pad sync-block compact">
    <div class="sidebar-label">Sincronização</div>
    <div class="sync-user-display" title="${esc(USUARIO_ATUAL.email)} · UID ${esc(USUARIO_ATUAL.uid)}">👤 ${esc(USUARIO_ATUAL.nome)}</div>
    <div class="side-status ${statusClass}" id="sync-status-el">${esc(statusMsg)}</div>
    ${statusHorario ? `<div class="side-status detail">última atualização: ${esc(statusHorario)}</div>` : ''}
    ${statusDetalhe ? `<div class="side-status detail">${esc(statusDetalhe)}</div>` : ''}
    ${ALERTAS_SOBRESCRITA_NUVEM.length>0 ? `<div class="side-status err" style="margin-top:6px;">
      ⚠ ${ALERTAS_SOBRESCRITA_NUVEM.length} possível sobrescrita detectada — outro dispositivo publicou depois da sua última sincronização.
      <button class="side-action-btn compact" id="btn-ver-alertas-sobrescrita" style="margin-top:4px;">Ver detalhes</button>
      <button class="side-action-btn compact" id="btn-dispensar-alertas-sobrescrita" style="margin-top:4px;">Dispensar</button>
    </div>` : ''}
    <button class="side-action-btn compact" id="btn-sair-google">Sair da conta</button>
  </div></div>`;
}

/* ================= PÁGINA DE UMA MATÉRIA (independente) ================= */
function renderMateriaPage(){
  const tabAtual = getLocalTab(STATE.materia);
  // esconde o Assunto só durante um simulado de verdade em andamento (evita trocar
  // o filtro no meio de uma tentativa contabilizada)
  const emSimuladoEmAndamento = tabAtual==='simulado' && !!STATE.quiz;
  // menu de Assunto (troca de tema) só aparece na aba Simulado — nas demais abas
  // (Caderno de erros, Resumo, Flashcards) o filtro de assunto não se aplica
  const mostrarTabsSecundarias = tabAtual==='simulado' && !emSimuladoEmAndamento;

  if(STATE.focusMode){
    return `<div class="main-content"><div class="panel"><div class="pad">${renderMainPanel(tabAtual)}</div></div></div>`;
  }

  return `
  <div class="app-shell">
    <aside class="sidebar compact-side">
      ${renderMateriaTopStrip()}
      ${mostrarTabsSecundarias ? renderTemaTabs() : ''}
      <div class="sidebar-block"><div class="sb-pad">
        <div class="sidebar-label">Navegação</div>
        ${renderLocalTabs()}
      </div></div>
      ${renderSyncSidebarBlock()}
    </aside>
    <div class="main-content">
      <div class="panel"><div class="pad">${renderMainPanel(tabAtual)}</div></div>
    </div>
  </div>`;
}

function renderLocalTabs(){
  const tabs = [
    {id:'simulado', n:'01', label:'Simulado'},
    {id:'erros', n:'02', label:'Caderno de erros'},
    {id:'revisao', n:'03', label:'Resumo p/ revisão'},
    {id:'flashcards', n:'04', label:'Flashcards'},
  ];
  const atual = getLocalTab(STATE.materia);
  return `<div class="tabs">${tabs.map(t=>`
    <button class="tab-btn ${atual===t.id?'active':''}" data-local-tab="${t.id}">
      <span class="n">${t.n}</span>${t.label}
    </button>`).join('')}</div>`;
}

function renderTemaTabs(){
  if(!STATE.materia) return '';
  const temas = temasDisponiveis(STATE.materia);
  const countFor = (t) => t ? ALL_QUESTIONS.filter(q=>q.materia===STATE.materia && q.tema===t).length : ALL_QUESTIONS.filter(q=>q.materia===STATE.materia).length;
  const aberto = STATE.assuntoAberto;
  const labelAtual = STATE.tema==='todos' ? 'Todos os assuntos' : STATE.tema;
  return `<div class="sidebar-block"><div class="sb-pad">
    <button class="assunto-toggle" id="btn-toggle-assunto">
      <span class="sidebar-label" style="margin-bottom:0;">Assunto</span>
      <span class="assunto-atual">${aberto?'▴':'▾'}</span>
    </button>
    <div class="assunto-atual-label">${esc(labelAtual)}</div>
    ${aberto ? `<div class="subject-tabs" style="margin-top:10px;">
      <button class="subject-tab ${STATE.tema==='todos'?'active':''}" data-tema="todos">Todos os assuntos <span class="cnt">${countFor(null)}</span></button>
      ${temas.map(t=>`<button class="subject-tab ${STATE.tema===t?'active':''}" data-tema="${esc(t)}">${esc(t)} <span class="cnt">${countFor(t)}</span></button>`).join('')}
    </div>` : ''}
  </div></div>`;
}

function renderMainPanel(tabAtual){
  if(tabAtual==='simulado'){
    if(STATE.quiz) return renderQuiz();
    if(STATE.mostrarConfigSimulado) return renderSetupInline();
    return renderLanding();
  }
  if(tabAtual==='erros') return renderErros();
  if(tabAtual==='revisao') return renderResumoRevisao();
  if(tabAtual==='flashcards') return renderFlashcards();
  return '';
}

/* ================= LANDING (simulado sem sessão ativa) ================= */
function renderLanding(){
  const s = computeSnapshot();
  const bucket = STATE.materia ? getBucket(STATE.materia) : { sessoes:[], perguntas:{} };
  const ultimaSessoes = bucket.sessoes.slice(-5).reverse();
  const qtdSimuladosGerados = bucket.sessoes.length;


  if(STATE.materia && !STATE.quizzesVerificados.has(STATE.materia)){
    STATE.quizzesVerificados.add(STATE.materia);
    verificarQuizSalvo(STATE.materia);
  }
  const quizSalvo = STATE.quizzesEmAndamento[STATE.materia] && !STATE.quizzesEmAndamento[STATE.materia].finished
    ? STATE.quizzesEmAndamento[STATE.materia] : null;
  // Progresso do simulado salvo = questões da fila que JÁ têm tentativa no
  // histórico da matéria (bucket), não só as respondidas nesta sessão — assim
  // bate com o total histórico da matéria.
  const bucketAtual = STATE.materia ? getBucket(STATE.materia) : null;
  const respondidasNaFila = (quizSalvo && bucketAtual)
    ? quizSalvo.queue.filter(uid => bucketAtual.perguntas[uid] && bucketAtual.perguntas[uid].tentativas>0).length
    : 0;
  const infoSalvo = quizSalvo ? `<div style="font-size:12px;color:var(--ink-soft);margin-bottom:8px;">
    <b>Simulado salvo:</b> ${respondidasNaFila}/${quizSalvo.queue.length} respondidas${quizSalvo.ultimoSalvamento ? ` · 💾 ${formatarDataHoraSalvamento(quizSalvo.ultimoSalvamento)}` : ''}
  </div>` : '';
  // Sem simulado em andamento: "Configurar novo simulado". Com simulado em
  // andamento: "Continuar" + "Reiniciar". Nunca os dois grupos juntos.
  const botoesAcao = `<div style="display:flex; gap:8px; flex-wrap:wrap;">
    ${quizSalvo ? `<button class="btn btn-gold btn-sm" id="btn-continuar-simulado" style="flex:1;justify-content:center;min-width:140px;">▶ Continuar da última questão</button>
    <button class="btn-outline btn-sm" id="btn-reiniciar-simulado" style="flex:1;justify-content:center;min-width:140px;">🔄 Reiniciar simulado</button>`
    : `<button class="btn btn-primary btn-sm" id="btn-abrir-config" style="flex:1;justify-content:center;min-width:140px;">⚙ Configurar novo simulado</button>`}
  </div>`;

  return `
  <div class="landing-hero">
    <h2 class="section-title">${esc(STATE.materia || 'Painel do candidato')}${STATE.tema!=='todos' ? ` <span class="materia-assunto-label" style="font-size:14px;">· ${esc(STATE.tema)}</span>` : ''} ${qtdSimuladosGerados>0 ? `<span class="sim-count-badge">${qtdSimuladosGerados}</span>` : ''}</h2>
    ${infoSalvo}
    ${STATE.simuladoSalvoMsg ? `<div class="side-status ok" style="margin-bottom:8px;">✓ Simulado salvo! Veja em "Simulados salvos" logo abaixo.</div>` : ''}
    ${botoesAcao}
  </div>
  ${renderEstatisticasPorMateria()}
  ${renderDashboardAnalitico()}
  ${renderSimuladosSalvosBlock()}
  ${ultimaSessoes.length ? `<div class="card-block" style="margin-top:22px;">
    <h3>Últimos simulados nesta matéria</h3>
    ${ultimaSessoes.map(se=>{
      const d = new Date(se.ts);
      const dt = d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'}) + ' ' + d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
      const nome = dt + (se.tema && se.tema!=='todos' ? ` · ${se.tema}` : '');
      const podeAbrir = !!(se.queue && se.queue.length && se.respostas);
      const p = pct(se.acertos, se.total);
      const cor = p>=70 ? 'var(--stamp-green)' : p>=40 ? 'var(--gold)' : 'var(--stamp-red)';
      return `<div class="bar-row" style="flex-wrap:wrap;">
        <div class="name">${esc(nome)}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${se.total? p:0}%;background:${cor};"></div></div>
        <div class="pct">${se.total? `${p}% (${se.acertos}/${se.total})` : '—'}</div>
        ${podeAbrir ? `<button class="btn-outline" data-abrir-sessao="${se.ts}" style="padding:4px 10px;font-size:11px;">Abrir</button>` : `<span class="side-status detail" style="font-size:11px;">sem detalhes salvos</span>`}
        ${podeAbrir ? `<button class="btn-outline" data-salvar-sessao="${se.ts}" style="padding:4px 10px;font-size:11px;" title="Salvar em Simulados salvos para comparação">💾 Salvar</button>` : ''}
        <button class="btn-outline" data-excluir-sessao="${se.ts}" style="padding:4px 10px;font-size:11px;">Excluir</button>
      </div>`;
    }).join('')}
  </div>` : ''}
  ${STATE.materia ? renderDangerZone() : ''}
  `;
}

/* ================= SETUP (barra lateral) ================= */
function renderCamposFiltro(idPrefix){
  const setup = getSetup(STATE.materia);
  const anos = anosDisponiveis();
  const bancas = bancasDisponiveis();
  const cargos = cargosDisponiveis();
  const tendencias = tendenciasDisponiveis();
  const qtdIneditas = scoreableFiltradas().filter(isInedita).length;
  return `
    <div class="setup-mini-field">
      <label>Nível de incidência</label>
      <div class="chip-row" id="chip-nivel">
        ${['alta','media','baixa'].map(k=>`<span class="chip ${setup.niveis.has(k)?'selected':''}" data-nivel="${k}">${NIVEL_STARS[k]} ${NIVEL_LABEL[k].split(' ')[0]}</span>`).join('')}
      </div>
    </div>
    ${tendencias.length>1 ? `<div class="setup-mini-field">
      <label>Tendência</label>
      <div class="chip-row" id="chip-tendencia">
        ${tendencias.map(t=>`<span class="chip ${!setup.tendenciasExcluidas.has(t)?'selected':''}" data-tendencia="${t}">${t}</span>`).join('')}
      </div>
    </div>` : ''}
    ${anos.length>1 ? `<div class="setup-mini-field">
      <label>Ano</label>
      <div class="chip-row" id="chip-ano">
        ${anos.map(a=>`<span class="chip ${!setup.anosExcluidos.has(a)?'selected':''}" data-ano="${a}">${a}</span>`).join('')}
      </div>
    </div>` : ''}
    ${bancas.length>1 ? `<div class="setup-mini-field">
      <label>Banca</label>
      <div class="chip-row" id="chip-banca">
        ${bancas.map(b=>`<span class="chip ${!setup.bancasExcluidas.has(b)?'selected':''}" data-banca="${esc(b)}">${esc(b)}</span>`).join('')}
      </div>
    </div>` : ''}
    ${qtdIneditas>0 ? `<div class="setup-mini-field">
      <label>Origem</label>
      <div class="chip-row" id="chip-ineditas">
        <span class="chip ${setup.incluirIneditas?'selected':''}" data-toggle-ineditas="1" title="Questões geradas por IA para completar o banco, não pertencem a nenhuma banca real">🟥🟨 Incluir inéditas (${qtdIneditas})</span>
      </div>
    </div>` : ''}
    ${cargos.length>1 ? `<div class="setup-mini-field">
      <button type="button" class="assunto-toggle" id="btn-toggle-cargo-menu" style="width:100%;">
        <label style="margin-bottom:0;cursor:pointer;">Cargo (${cargos.length})</label>
        <span class="assunto-atual">${setup.cargoMenuAberto?'▴':'▾'}</span>
      </button>
      ${setup.cargoMenuAberto ? `<div class="chip-row" id="chip-cargo" style="margin-top:8px;">
        ${cargos.map(c=>`<span class="chip ${!setup.cargosExcluidos.has(c)?'selected':''}" data-cargo="${esc(c)}">${esc(c)}</span>`).join('')}
      </div>` : ''}
    </div>` : ''}
  `;
}

function renderBotoesAcaoSetup(){
  const erroCount = getCadernoErros().length;
  const candidatos = pool();
  return `
    <div class="setup-mini-field">
      <div class="sidebar-avail">${candidatos.length} ${candidatos.length===1?'questão disponível':'questões disponíveis'} com este filtro — o simulado inclui todas elas</div>
    </div>

    <button class="btn btn-primary" id="btn-iniciar" ${candidatos.length===0?'disabled':''}>Iniciar simulado →</button>
    ${candidatos.length===0 ? `<div style="margin-top:10px;"><span id="setup-warn" style="font-size:12px;color:var(--stamp-red);display:block;margin-bottom:8px;">Nenhuma questão encontrada com esses filtros.</span><button class="btn-outline" id="btn-limpar-filtros" style="width:100%;justify-content:center;">Limpar filtros</button></div>` : `<span id="setup-warn"></span>`}
    ${erroCount>0 ? `<button class="btn-outline" id="btn-simulado-erros" style="width:100%;justify-content:center;margin-top:8px;">Simulado só com erros (${erroCount})</button>` : ''}
    <button class="btn-outline" id="btn-imprimir" ${candidatos.length===0?'disabled':''} style="width:100%;justify-content:center;margin-top:8px;" title="Gera uma versão para impressão com as questões do filtro atual">🖨️ Imprimir questões (${candidatos.length})</button>
  `;
}

function renderSetupInline(){
  return `
  <button class="btn btn-ghost btn-sm" id="btn-voltar-landing" style="margin-bottom:14px;">← Voltar</button>
  <div class="section-eyebrow">${esc(STATE.materia||'')}</div>
  <h2 class="section-title">Configurar simulado</h2>
  <div class="setup-inline-grid">
    ${renderCamposFiltro()}
  </div>
  <div class="setup-inline-actions">
    ${renderBotoesAcaoSetup()}
  </div>
  `;
}

function pool(){
  const setup = getSetup(STATE.materia);
  return scoreableFiltradas().filter(q =>
    setup.niveis.has(q.nv) &&
    !setup.anosExcluidos.has(String(q.ar||'')) &&
    !setup.bancasExcluidas.has(bancaCurta(q.bc)) &&
    !setup.cargosExcluidos.has(cargoCurto(q.bc)) &&
    !setup.tendenciasExcluidas.has(tendenciaCurta(q.td)) &&
    (setup.incluirIneditas || !isInedita(q))
  );
}

function gerarImpressao(){
  const questoes = pool();
  if(questoes.length===0) return;
  const printArea = document.getElementById('print-area');
  const dataHoje = new Date().toLocaleDateString('pt-BR');
  const setup = getSetup(STATE.materia);
  const niveisTxt = Array.from(setup.niveis).map(k=>NIVEL_LABEL[k]).join(', ');
  const html = `
    <div class="print-header">
      <h2>${esc(CONFIG.title)} — ${esc(STATE.materia)}${STATE.tema!=='todos'?` · ${esc(STATE.tema)}`:''}</h2>
      <p>${questoes.length} questões · Nível de incidência: ${esc(niveisTxt)} · Gerado em ${dataHoje}</p>
    </div>
    ${questoes.map((q,i)=>`
      <div class="print-q">
        <h4>Questão ${i+1} (nº original ${esc(String(q.n))})</h4>
        <div class="print-tags">${esc(q.bc)} · ${NIVEL_STARS[q.nv]} · ${esc(q.td||'')}</div>
        <div class="print-enun">${esc(limparEnunciado(q.q, q.t))}</div>
        <div class="print-gab">Gabarito: ${esc(gabaritoEfetivo(q)||'—')}</div>
        <div class="print-res"><b>Resolução:</b> ${esc(q.r)}</div>
        <div class="print-res" style="margin-top:4px;"><b>Resumo flash:</b> ${esc(q.rf)}</div>
      </div>
    `).join('')}
  `;
  printArea.innerHTML = html;
  setTimeout(()=>window.print(), 100);
}

// retoma o simulado em andamento de qualquer matéria diretamente — usado tanto
// pelo botão "Continuar" da matéria aberta quanto pelo atalho por linha na
// tabela de Estatísticas (pedido: manter "Continuar" disponível em todas as
// matérias, não só na que está aberta no momento)
function continuarSimuladoDaMateria(materiaNome){
  const q = STATE.quizzesEmAndamento[materiaNome];
  if(!q || q.finished) return;
  if(STATE.quiz) salvarQuizEmAndamento(); // flush do que estava em andamento antes de trocar
  STATE.materia = materiaNome;
  STATE.tema = 'todos';
  STATE.viewImportar = false;
  const last = acharIdxUltimaRespondida(q);
  if(last>=0) q.idx = last;
  STATE.quiz = q;
  render();
}
function startQuiz(nums){
  const candidatosTotais = nums ? nums.map(u=>BY_UID[u]).filter(Boolean) : pool();
  if(candidatosTotais.length===0){
    const w = document.getElementById('setup-warn');
    if(w) w.textContent = 'Nenhuma questão encontrada com esses filtros. Ajuste a seleção.';
    return;
  }
  // Iniciar um simulado novo por qualquer caminho pede confirmação se já há um
  // em andamento nesta matéria (senão a fila dele seria descartada sem aviso).
  const emAndamento = STATE.quizzesEmAndamento[STATE.materia];
  if(emAndamento && !emAndamento.finished && !nums){
    const ok = window.confirm('Você tem um simulado em andamento nesta matéria. Iniciar um novo vai descartar a fila dele (as respostas já dadas continuam valendo pro seu progresso geral). Deseja continuar?');
    if(!ok) return;
  }
  // Simulado novo prioriza questões AINDA NÃO respondidas dentro do filtro; só
  // volta a incluir as já respondidas quando não sobra nenhuma nova.
  const bucketAtual = (!nums && STATE.materia) ? getBucket(STATE.materia) : null;
  const naoRespondidas = bucketAtual
    ? candidatosTotais.filter(q => !(bucketAtual.perguntas[q.uid] && bucketAtual.perguntas[q.uid].tentativas>0))
    : candidatosTotais;
  const candidatos = naoRespondidas.length>0 ? naoRespondidas : candidatosTotais;
  // Usa todos os candidatos do filtro (nunca um lote limitado): o simulado fica
  // aberto até responder tudo.
  const qtd = candidatos.length;
  // ordena pelas questões mais recentes primeiro (ano de aplicação, decrescente),
  // exceto quando é um conjunto específico (refazer erros), que mantém a ordem dada
  const ordenados = nums ? candidatos : [...candidatos].sort((a,b)=>(a.n||0)-(b.n||0));
  const queue = ordenados.slice(0, qtd).map(q=>q.uid);
  STATE.quiz = { queue, idx:0, respostas:{}, finished:false, materia: STATE.materia, tema: STATE.tema };
  STATE.setupDrawerOpen = false;
  STATE.mostrarConfigSimulado = false;
  STATE.simuladoSalvoMsg = false;
  STATE.quizzesEmAndamento[STATE.materia] = STATE.quiz;
  salvarQuizEmAndamento();
  render();
}

