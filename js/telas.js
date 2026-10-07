/* ---------------- app state ---------------- */
// ordem da tabela de matérias ('nome' | 'ultima'), lembrada neste aparelho
const ORDEM_MATERIAS_KEY = 'tcdf-ordem-materias';
function ordemMateriasSalva(){
  try{ return window.localStorage.getItem(ORDEM_MATERIAS_KEY)==='ultima' ? 'ultima' : 'nome'; }catch(e){ return 'nome'; }
}
// ordem das questões no simulado novo, lembrada neste aparelho
const ORDEM_SIMULADO_KEY = 'tcdf-ordem-simulado';
const ORDENS_SIMULADO = [
  ['prioridade', '⭐ Prioridade', 'Primeiro os assuntos com estimativa alta de cair e seu acerto baixo; assuntos da mesma faixa se alternam'],
  ['assunto', '📚 Assunto do edital', 'Em blocos, na ordem dos itens do edital'],
  ['recentes', '🆕 Provas recentes', 'Ano da prova, do mais novo ao mais antigo; inéditas e de elaboração própria no fim'],
  ['prova', '📄 Por prova', 'Agrupa as questões da mesma prova (mais recentes primeiro)'],
  ['intercalado', '🔀 Intercalado', 'Aleatório, alternando os assuntos a cada questão'],
  ['espacada', '🔁 Revisão espaçada', 'Primeiro as que você errou (mais vezes e há mais tempo); as ainda não respondidas vão pro fim'],
];
function ordemSimuladoSalva(){
  try{ const v = window.localStorage.getItem(ORDEM_SIMULADO_KEY); if(ORDENS_SIMULADO.some(o=>o[0]===v)) return v; }catch(e){ /* só preferência */ }
  return 'prioridade';
}
let STATE = {
  materia: null,
  ordemMaterias: ordemMateriasSalva(),
  ordemSimulado: ordemSimuladoSalva(),
  viewImportar: false,
  viewAuditoria: false,
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
  avisoCorrecaoAno: null,
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
      cobrancaExcluida: new Set(), // grupos de "Tipo de cobrança" desmarcados ('lei','I',…,'sem')
    };
  }
  return STATE.setupByMateria[materiaKey];
}
// extrai banca/cargo de q.bc. Reescrita (v137) depois de auditar os arquivos
// de origem REALMENTE usados nas importações (não só a amostra que motivou a
// versão anterior) — achou-se formatos adicionais em que o cargo saía vazio
// ou a banca vinha poluída com cargo/órgão/ano junto. Cobre:
// 1) clássico "BANCA, cargo (órgão)" — sem hífen algum, usado no material
//    embutido e em listas antigas.
// 2) "BANCA - cargo_abrev (ÓRGÃO)/ÓRGÃO/formação/ano" — barras depois do
//    hífen (matérias como AFO/Tributário).
// 3) "BANCA - ÓRGÃO - cargo - ano" — só hífens, sem barra nem vírgula (ex.:
//    Lei 14.133): o código antigo não reconhecia esse formato e devolvia a
//    LINHA INTEIRA como banca, com cargo vazio.
// 4) "BANCA — cargo (área), ÓRGÃO, ano" — hífen seguido de vírgulas (ex.:
//    Direito Civil): o código antigo cortava na primeira vírgula do texto
//    INTEIRO (sem considerar o hífen antes), poluindo a banca com o cargo e
//    perdendo pedaços do cargo real.
// 5) "Elaboração própria — ÓRGÃO - cargo" (questões inéditas) — mesma lógica
//    de separação, banca vira o rótulo "Elaboração própria" (ver isInedita).
// Em qualquer formato, um sufixo fixo acrescentado pelo gerador de questões
// (", Auditor de Controle Externo, TCDF") é descartado antes de parsear —
// não é parte da classificação original, e identificarProva() (previsao.js)
// já fazia o mesmo descarte só pra fins de estatística.
function extrairBancaECargo(bc){
  if(!bc) return { banca:'—', cargo:'' };
  let txt = String(bc).trim();
  txt = txt.replace(/,\s*Auditor de Controle Externo,\s*TCDF\s*$/i, '').trim();
  if(!txt) return { banca:'—', cargo:'' };

  // separador banca|resto: hífen comum "-", en dash "–" ou em dash "—" tem
  // prioridade sobre vírgula — é o separador mais específico (a banca nunca
  // tem hífen no nome); sem ele, cai pro formato clássico só com vírgula
  const mDash = txt.match(/^([^,\/]+?)\s+[-–—]\s+(.+)$/);
  let banca, resto;
  if(mDash){
    banca = mDash[1].trim() || '—';
    resto = mDash[2].trim();
  } else if(txt.indexOf(',') !== -1){
    const idx = txt.indexOf(',');
    banca = txt.slice(0, idx).trim() || '—';
    resto = txt.slice(idx+1).trim();
  } else {
    return { banca: txt, cargo: '' };
  }
  if(!resto) return { banca, cargo: '' };

  // dentro do "resto", o separador usado varia por lote de importação —
  // barra, hífen de novo, ou vírgula; tenta nessa ordem e usa o primeiro que
  // aparecer (um texto não mistura dois desses três no mesmo campo)
  let partes;
  if(resto.indexOf('/') !== -1){
    partes = resto.split('/');
  } else if(/\s[-–—]\s/.test(resto)){
    partes = resto.split(/\s[-–—]\s/);
  } else if(resto.indexOf(',') !== -1){
    partes = resto.split(',');
  } else {
    partes = [resto];
  }
  partes = partes.map(p=>p.trim()).filter(Boolean);
  // último pedaço só-ano (ex.: "2026") é o ano da prova — já extraído à parte
  // (ver anoRealDaQuestao()/identificarProva()), não faz parte do cargo
  if(partes.length>1 && /^\d{4}$/.test(partes[partes.length-1])) partes = partes.slice(0,-1);
  // sobrou só um pedaço e ele termina com um ano solto, sem separador próprio
  // (ex.: "TCDF 2026"): remove o ano do final mesmo assim
  if(partes.length===1) partes[0] = partes[0].replace(/\s+(19|20)\d{2}\s*$/, '').trim();
  const cargo = partes.filter(Boolean).join(' — ');
  return { banca, cargo };
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
  scoreableFiltradas().forEach(q=>{ const a = anoRealDaQuestao(q); if(a) set.add(String(a)); });
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
  const tab = STATE.tabByMateria[materiaKey];
  // abas que ainda existem ("Resumo p/ revisão" foi removida)
  return ['simulado','erros','flashcards'].includes(tab) ? tab : 'simulado';
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
    ${STATE.avisoCorrecaoAno ? renderAvisoCorrecaoAno() : ''}
    ${STATE.viewAuditoria ? renderAuditoriaPage() : (STATE.viewImportar || ALL_QUESTIONS.length===0 ? renderImportarPage() : renderMateriaPage())}
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

// Banner informativo (não é erro): aparece uma única vez, na abertura em que
// corrigirCamposAnoDesatualizados() (nuvem.js) de fato corrige algum campo
// "Ano" desatualizado. Dispensável; não volta a aparecer depois de corrigido.
function renderAvisoCorrecaoAno(){
  return `<div style="position:sticky;top:0;z-index:500;background:#1f6f43;color:#fff;padding:10px 16px;font-size:13px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
    <span>✅ ${esc(STATE.avisoCorrecaoAno)}</span>
    <button id="btn-dispensar-aviso-correcao-ano" style="padding:4px 10px;border-radius:6px;border:1px solid #fff;background:transparent;color:#fff;cursor:pointer;font-size:12px;">Dispensar</button>
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

function freqHistLine(fr){
  if(!fr) return '';
  return `<div class="freq-hist"><span class="lbl-inline">Frequência por ano:</span> ${esc(fr)}</div>`;
}
// cada parte (Banca / Cargo / Ano) agora vira sua própria linha — layout
// pedido: uma linha por metadado, em vez do antigo "Banca: X · Cargo: Y · Ano: Z"
function bancaCargoAnoLine(q){
  let banca, cargo, ano;
  const prova = identificarProva(q);
  if(prova){
    // descrição completa do cargo (não a versão truncada de identificarProva,
    // que corta no primeiro "/" só pra fins de agrupar provas)
    banca = prova.banca;
    cargo = cargoCurto(q.bc) || prova.cargo;
    ano = prova.ano;
  } else {
    banca = bancaCurta(q.bc);
    ano = anoRealDaQuestao(q) || (q.an && q.an.length ? Math.max(...q.an) : null);
    cargo = cargoCurto(q.bc);
    // remove um ano já embutido no fim do texto do cargo (ex.: "Agente
    // Administrativo — 2025") pra não duplicar com a linha "Ano:" seguinte
    if(cargo && ano) cargo = cargo.replace(new RegExp(`[\\s\\u2014-]*${ano}\\s*$`), '').trim();
  }
  // a ÚNICA fonte literal de ano, no formato de dado original (item 7 do
  // prompt de classificação: "Banca, cargo: {banca}, {cargo e órgão}"), é o
  // ano escrito dentro da PRÓPRIA linha Banca/Cargo — não existe um campo
  // "Ano" separado nesse formato canônico. O campo solto "ar"/"**Ano:**" que
  // aparece em alguns materiais é derivado (ex.: eco do que já estava salvo,
  // ou ano de geração), não um dado independente — por isso NUNCA sobrepõe o
  // ano literal da lista de questões, sempre priorizado aqui via
  // anoRealDaQuestao()/identificarProva().
  const linhas = [];
  if(banca) linhas.push(`<div class="q-meta-line"><span class="lbl-inline">Banca:</span> ${esc(banca)}</div>`);
  if(cargo) linhas.push(`<div class="q-meta-line"><span class="lbl-inline">Cargo:</span> ${esc(cargo)}</div>`);
  if(ano) linhas.push(`<div class="q-meta-line"><span class="lbl-inline">Ano:</span> ${ano}</div>`);
  return linhas.join('');
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
  ALL_QUESTIONS.forEach(q=>{
    if(materiaKey && q.materia!==materiaKey) return;
    const a = anoRealDaQuestao(q);
    if(a && a>max) max=a;
  });
  return max;
}
function tendenciaQuente(q){
  const anoQ = anoRealDaQuestao(q);
  if(!q.td || q.td.indexOf('↑')===-1 || !anoQ) return false;
  const maxAno = anoMaisRecente(q.materia);
  return maxAno>0 && anoQ >= maxAno-1;
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

/* ================= AUDITORIA DE DADOS (todas as matérias) =================
   Varre TODAS as questões reais (não-inéditas) de TODAS as matérias já
   importadas neste aparelho/conta, procurando os mesmos tipos de problema
   encontrados manualmente na v131/v132: ano divergente, cargo que parece ser
   só a área/matéria (sem cargo/órgão de verdade) e banca não identificada.
   Não corrige nada sozinha — só aponta, pra decisão humana sobre cada caso. */
// áreas/disciplinas genéricas comuns em concursos — se o "cargo" extraído for
// EXATAMENTE uma destas (sem nenhum pedaço de órgão/sigla junto), é sinal de
// que a área vazou pro campo de cargo em vez do cargo de verdade
const AREAS_GENERICAS_SUSPEITAS = [
  'direito','contabilidade','administração','administracao','economia',
  'engenharia','tecnologia da informação','ti','gestão','gestao','finanças',
  'financas','previdência','previdencia','auditoria','contábeis','contabeis',
];
function auditarDados(){
  const porMateria = {};
  const divergenciasAno = [];
  const cargosSuspeitos = [];
  const bancasAusentes = [];
  const semGabarito = [];

  ALL_QUESTIONS.forEach(q=>{
    if(isInedita(q)) return; // inéditas não têm banca/cargo real — fora do escopo
    if(!porMateria[q.materia]) porMateria[q.materia] = { total:0, divergenciaAno:0, cargoSuspeito:0, bancaAusente:0, semGabarito:0 };
    const stat = porMateria[q.materia];
    stat.total++;

    const anoEmbutido = anoRealDaQuestao(q);
    if(q.ar && anoEmbutido && q.ar !== anoEmbutido){
      stat.divergenciaAno++;
      divergenciasAno.push({ uid:q.uid, materia:q.materia, n:q.n, bc:q.bc, arSalvo:q.ar, anoEmbutido });
    }

    const { banca, cargo } = extrairBancaECargo(q.bc);
    if(!banca || banca==='—'){
      stat.bancaAusente++;
      bancasAusentes.push({ uid:q.uid, materia:q.materia, n:q.n, bc:q.bc });
    }
    const cargoNorm = (cargo||'').trim().toLowerCase();
    const pareceArea = !!cargoNorm && AREAS_GENERICAS_SUSPEITAS.includes(cargoNorm);
    if(!cargo || pareceArea){
      stat.cargoSuspeito++;
      cargosSuspeitos.push({ uid:q.uid, materia:q.materia, n:q.n, bc:q.bc, cargoExtraido: cargo||'(vazio)' });
    }

    if(!q.g){
      stat.semGabarito++;
      semGabarito.push({ uid:q.uid, materia:q.materia, n:q.n, bc:q.bc });
    }
  });

  return { porMateria, divergenciasAno, cargosSuspeitos, bancasAusentes, semGabarito };
}
function gerarMarkdownAuditoria(rel){
  const materias = Object.keys(rel.porMateria).sort((a,b)=>a.localeCompare(b,'pt-BR'));
  let md = `# Auditoria de dados — TCDF Plataforma\n\nGerado em ${new Date().toLocaleString('pt-BR')}\n\n`;
  md += `## Resumo por matéria\n\n| Matéria | Total | Ano divergente | Cargo suspeito | Banca ausente | Sem gabarito |\n|---|---|---|---|---|---|\n`;
  materias.forEach(m=>{
    const s = rel.porMateria[m];
    md += `| ${m} | ${s.total} | ${s.divergenciaAno} | ${s.cargoSuspeito} | ${s.bancaAusente} | ${s.semGabarito} |\n`;
  });
  function secao(titulo, itens){
    md += `\n## ${titulo} (${itens.length})\n\n`;
    if(itens.length===0){ md += `Nenhuma ocorrência.\n`; return; }
    itens.forEach(it=>{
      md += `- **${it.materia}** · Q${it.n} · \`${it.bc||''}\``;
      if(it.arSalvo!==undefined) md += ` — ano da lista (Banca/Cargo, prevalece): ${it.anoEmbutido} · campo salvo desatualizado: ${it.arSalvo}`;
      if(it.cargoExtraido!==undefined) md += ` — cargo extraído: "${it.cargoExtraido}"`;
      md += `\n`;
    });
  }
  secao('Ano salvo ≠ ano escrito na linha Banca/Cargo', rel.divergenciasAno);
  secao('Cargo extraído parece ser só a área/matéria (sem cargo/órgão reais)', rel.cargosSuspeitos);
  secao('Banca não identificada', rel.bancasAusentes);
  secao('Sem gabarito identificado', rel.semGabarito);
  return md;
}
function downloadRelatorioAuditoria(){
  const rel = auditarDados();
  const md = gerarMarkdownAuditoria(rel);
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `auditoria-dados-${new Date().toISOString().slice(0,10)}.md`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function renderAuditoriaPage(){
  const rel = auditarDados();
  const materias = Object.keys(rel.porMateria).sort((a,b)=>a.localeCompare(b,'pt-BR'));
  const totalQ = materias.reduce((s,m)=>s+rel.porMateria[m].total,0);
  const totalProblemas = rel.divergenciasAno.length + rel.cargosSuspeitos.length + rel.bancasAusentes.length + rel.semGabarito.length;

  const linhasTabela = materias.map(m=>{
    const s = rel.porMateria[m];
    const temProblema = (s.divergenciaAno+s.cargoSuspeito+s.bancaAusente+s.semGabarito) > 0;
    return `<div class="bar-row" style="flex-wrap:wrap;align-items:center;background:${temProblema?'#fbeeec':'#eef6f0'};border-left:4px solid ${temProblema?'var(--stamp-red)':'var(--stamp-green)'};border-radius:4px;padding:8px 10px 8px 12px;margin-bottom:6px;">
      <div style="flex:1;min-width:120px;font-weight:600;font-size:13px;">${esc(m)}</div>
      <div style="width:76px;text-align:right;font-size:11.5px;" title="Questões reais auditadas">${s.total} quest.</div>
      <div style="width:70px;text-align:right;font-size:11.5px;" title="Ano salvo divergente do ano escrito na linha Banca/Cargo">📅 ${s.divergenciaAno}</div>
      <div style="width:70px;text-align:right;font-size:11.5px;" title="Cargo extraído parece ser só a área/matéria, sem cargo/órgão">🧑‍💼 ${s.cargoSuspeito}</div>
      <div style="width:60px;text-align:right;font-size:11.5px;" title="Banca não identificada">🏢 ${s.bancaAusente}</div>
      <div style="width:60px;text-align:right;font-size:11.5px;" title="Sem gabarito identificado">❓ ${s.semGabarito}</div>
    </div>`;
  }).join('');

  function listaDetalhe(titulo, itens, icone){
    if(itens.length===0) return '';
    return `<details style="margin-top:14px;">
      <summary style="cursor:pointer;font-weight:600;font-size:13px;">${icone} ${esc(titulo)} (${itens.length})</summary>
      <div style="margin-top:8px;max-height:320px;overflow:auto;font-family:var(--font-mono);font-size:11.5px;border:1px solid var(--paper-line);border-radius:6px;">
        ${itens.slice(0,300).map(it=>`<div style="padding:5px 8px;border-bottom:1px solid var(--paper-line);">
          <b>${esc(it.materia)}</b> · Q${it.n} · <span style="opacity:.75;">${esc(it.bc||'')}</span>
          ${it.arSalvo!==undefined ? ` — ano da lista (prevalece): <b>${it.anoEmbutido}</b> · campo salvo desatualizado: <b>${it.arSalvo}</b>` : ''}
          ${it.cargoExtraido!==undefined ? ` — cargo extraído: <b>${esc(it.cargoExtraido)}</b>` : ''}
        </div>`).join('')}
        ${itens.length>300 ? `<div style="padding:6px 8px;opacity:.7;">… e mais ${itens.length-300} (baixe o relatório completo).</div>` : ''}
      </div>
    </details>`;
  }

  return `
  <div class="section-eyebrow">Diagnóstico</div>
  <h2 class="section-title">🔍 Auditoria de dados</h2>
  <p class="section-desc">Verifica, em TODAS as matérias já importadas neste aparelho/conta, o mesmo tipo de inconsistência de banca/cargo/ano já visto antes (v131/v132). Não resolve nada sozinha — ano divergente em especial não tem como ser decidido sem o edital/fonte oficial em mãos. Só aponta, pra você decidir caso a caso.</p>
  <div class="card-block" style="margin-top:16px;">
    <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:14px;">
      <div class="stat-chip" style="background:var(--paper-soft,#f7f3e8);border-radius:8px;padding:8px 12px;">
        <div style="font-size:11px;color:var(--ink-soft);">Questões reais auditadas</div>
        <div style="font-size:16px;font-weight:700;">${totalQ}</div>
      </div>
      <div class="stat-chip" style="background:${totalProblemas>0?'#fbeeec':'#eef6f0'};border-radius:8px;padding:8px 12px;">
        <div style="font-size:11px;color:var(--ink-soft);">Ocorrências encontradas</div>
        <div style="font-size:16px;font-weight:700;color:${totalProblemas>0?'var(--stamp-red)':'var(--stamp-green)'};">${totalProblemas}</div>
      </div>
    </div>
    ${linhasTabela || '<p style="font-size:12.5px;color:var(--ink-soft);">Nenhuma questão real encontrada ainda — importe alguma matéria primeiro.</p>'}
    ${listaDetalhe('Ano salvo ≠ ano escrito na linha Banca/Cargo', rel.divergenciasAno, '📅')}
    ${listaDetalhe('Cargo extraído parece ser só a área/matéria (sem cargo/órgão reais)', rel.cargosSuspeitos, '🧑‍💼')}
    ${listaDetalhe('Banca não identificada', rel.bancasAusentes, '🏢')}
    ${listaDetalhe('Sem gabarito identificado', rel.semGabarito, '❓')}
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px;">
      <button class="btn btn-ghost btn-sm" id="btn-baixar-auditoria">⬇ Baixar relatório completo (.md)</button>
      <button class="btn btn-ghost btn-sm" id="btn-voltar-materia">← Voltar</button>
    </div>
  </div>
  `;
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

// cache simples por matéria — o quadro de frequência (previsao.js) chama
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

// faixa de cor (clara) pelo % de acerto: 95-100 azul, 90-94 verde, 80-89
// amarelo, 1-79 vermelho; 0% (ou nada respondido) preto
function faixaCorPct(pct, respondidas){
  if(!respondidas || pct<=0) return { bg:'#1f1f1f', fg:'#d4d4d4', fgForte:'#f5f5f5' }; // preto: 0
  if(pct>=100) return { bg:'#dbeafe', fg:'#1e4f8f', fgForte:'#173e72' }; // azul: 100%
  if(pct>=90) return { bg:'#dcfce7', fg:'#1e7d43', fgForte:'#166534' }; // verde: 90-99
  if(pct>=80) return { bg:'#fef3c7', fg:'#855b0e', fgForte:'#6f4b0a' }; // amarelo: 80-89
  return { bg:'#fee2e2', fg:'#a3352c', fgForte:'#8f2a22' }; // vermelho: 1-79
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
  }).sort((a,b)=>{
    // matéria 100% respondida (Respondidas === Total) fica sempre no topo,
    // independentemente da ordenação ativa (A–Z ou Última resposta)
    const aCompleta = a.total>0 && a.respondidas>=a.total;
    const bCompleta = b.total>0 && b.respondidas>=b.total;
    if(aCompleta !== bCompleta) return aCompleta ? -1 : 1;
    // "ultima": última resposta mais recente primeiro; nunca respondidas no fim
    if(STATE.ordemMaterias==='ultima' && (a.ultimaRespostaTs||0)!==(b.ultimaRespostaTs||0)) return (b.ultimaRespostaTs||0) - (a.ultimaRespostaTs||0);
    return a.nome.localeCompare(b.nome,'pt-BR') || b.respondidas - a.respondidas || b.pct - a.pct;
  });
  const estiloCelula = 'font-size:13px;font-weight:400;font-family:inherit;line-height:1.4;';
  const atividade = computeAtividadeDiariaGeral();
  return `
  <div class="card-block" style="margin-top:22px;">
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
      <h3 style="margin:0;color:inherit;">📈 Estatísticas por matéria</h3>
      <div class="tabs" style="margin:0;align-items:center;gap:6px;">
        <span style="font-size:12px;opacity:.75;">Ordenar:</span>
        <button class="tab-btn ${STATE.ordemMaterias!=='ultima'?'active':''}" data-ordem-materias="nome" style="padding:4px 10px;font-size:12px;">A–Z</button>
        <button class="tab-btn ${STATE.ordemMaterias==='ultima'?'active':''}" data-ordem-materias="ultima" style="padding:4px 10px;font-size:12px;">🕒 Última resposta</button>
      </div>
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
    <div class="tabela-scroll">${renderTabelaEstatisticas(linhas, estiloCelula)}</div>
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
      // marcador lateral (faixa de acerto) em vez do preenchimento em
      // gradiente na linha inteira — mais legível, o texto nunca fica em
      // cima de um fundo colorido variável
      const destaque = l.ativa ? `box-shadow:inset 0 0 0 1.5px ${cor.fgForte};` : '';
      return `<div class="bar-row" style="flex-wrap:wrap;align-items:center;background:${cor.bg};border-left:4px solid ${cor.fgForte};border-radius:4px;padding:8px 10px 8px 12px;margin-bottom:6px;${destaque}" title="${esc(l.nome)}: ${l.respondidas ? l.pct+'% de acerto' : 'nada respondido'}">
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
      </div>`;
    }).join('')}`;
  return cabecalhoTabela;
}

function renderDashboardAnalitico(){
  if(!STATE.materia) return '';
  const analise = analisarTemasDaMateriaCached(STATE.materia);
  if(analise.length===0) return '';
  // desempenho (resultado atual de cada questão) por assunto
  const bucket = getBucket(STATE.materia);
  const acertosPorTema = {};
  Object.entries(bucket.perguntas||{}).forEach(([uid,p])=>{
    const q = BY_UID[uid]; if(!q || q.materia!==STATE.materia) return;
    if(p.ultimoResultado!==true && p.ultimoResultado!==false) return;
    if(!acertosPorTema[q.tema]) acertosPorTema[q.tema]=[0,0];
    acertosPorTema[q.tema][0]+=(p.ultimoResultado===true?1:0); acertosPorTema[q.tema][1]+=1;
  });
  const g = analise[0];
  const pct = x => Math.round(x*100)+'%';
  // só a frequência nas provas da base (a estimativa segue calculada, usada
  // na ordem "Prioridade" do simulado, mas não é exibida)
  const porFrequencia = [...analise].sort((x,y)=> y.frequencia-x.frequencia || y.total-x.total);
  return `
  <div class="card-block dashboard-analitico" style="margin-top:24px;">
    <h3 style="color:inherit;" title="${esc(`Frequência nesta base: em quantas das ${g.totalProvas} provas desta base de questões o assunto aparece (a base é uma amostra — um assunto ausente numa prova da base pode ter caído nela).`)}">📊 Frequência por assunto <span style="font-size:12px;font-weight:400;opacity:.75;">ⓘ</span></h3>
    ${porFrequencia.map(a=>{
      const [ac,tt] = acertosPorTema[a.tema] || [0,0];
      const pctAcerto = tt ? Math.round((ac/tt)*100) : 0;
      const pctErro = tt ? 100-pctAcerto : 0;
      return `
      <div class="assunto-analise-row">
        <div class="assunto-analise-nome">${esc(a.tema)} <span class="cnt">(${a.total})</span></div>
        <div class="assunto-analise-incidencia" title="Frequência nesta base: ${a.nProvasComTema} de ${a.totalProvas} provas (${pct(a.frequencia)}); últimos 5 anos: ${a.provasRecentesComTema} de ${a.totalProvasRecentes}">
          <span class="inc-badge" style="background:transparent;color:inherit;font-weight:600;">Base: ${a.nProvasComTema}/${a.totalProvas} provas · ${pct(a.frequencia)}</span>
        </div>
        <div class="assunto-analise-bar" title="${tt? `${tt} questões respondidas deste assunto: ${ac} certas e ${tt-ac} erradas na última resposta de cada uma` : 'ainda não respondida'}">
          <div class="stacked-bar">
            ${tt ? `<div class="stacked-seg stacked-green" style="width:${pctAcerto}%;"></div><div class="stacked-seg stacked-red" style="width:${pctErro}%;"></div>` : `<div class="stacked-seg stacked-empty" style="width:100%;"></div>`}
          </div>
          <span class="stacked-pct">${tt ? `${ac} acertos · ${tt-ac} erros · ${pctAcerto}%` : '—'}</span>
        </div>
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
  const labelAtual = STATE.viewAuditoria ? '🔍 Auditoria de dados' : (STATE.viewImportar ? '+ Importar questões' : (STATE.materia || 'Selecione uma matéria'));
  return `<div class="sidebar-block"><div class="sb-pad">
    <button type="button" class="assunto-toggle" id="btn-toggle-materia-menu">
      <span class="sidebar-label" style="margin-bottom:0;">Matéria</span>
      <span class="assunto-atual">${aberto?'▴':'▾'}</span>
    </button>
    <div class="assunto-atual-label">${esc(labelAtual)}</div>
    ${aberto ? `<div class="subject-tabs" style="margin-top:10px;">
      <button class="subject-tab ${STATE.viewImportar?'active':''}" data-macro-importar="1">+ Importar questões</button>
      <button class="subject-tab ${STATE.viewAuditoria?'active':''}" data-macro-auditoria="1" title="Verifica banca/cargo/ano inconsistentes em TODAS as matérias importadas">🔍 Auditoria de dados</button>
      ${materias.map(m=>{
        const n = ALL_QUESTIONS.filter(q=>q.materia===m && !q.duplicataOculta).length;
        const ativo = !STATE.viewImportar && !STATE.viewAuditoria && STATE.materia===m;
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
    {id:'flashcards', n:'03', label:'Flashcards'},
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
  // "Continuar" fica sempre ao lado de "Configurar novo simulado": com um
  // simulado salvo, volta nele; sem, abre a matéria começando pelas questões
  // ainda não respondidas. "Reiniciar" só aparece com simulado salvo.
  const botoesAcao = `<div style="display:flex; gap:8px; flex-wrap:wrap;">
    <button class="btn btn-gold btn-sm" id="btn-continuar-simulado" style="flex:1;justify-content:center;min-width:140px;">▶ Continuar simulado</button>
    <button class="btn btn-primary btn-sm" id="btn-abrir-config" style="flex:1;justify-content:center;min-width:140px;">⚙ Configurar novo simulado</button>
    ${quizSalvo ? `<button class="btn-outline btn-sm" id="btn-reiniciar-simulado" style="justify-content:center;min-width:140px;">🔄 Reiniciar simulado</button>` : ''}
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
  const ordemAtual = ORDENS_SIMULADO.find(o=>o[0]===STATE.ordemSimulado) || ORDENS_SIMULADO[0];
  return `
    <div class="setup-mini-field">
      <label>Ordem das questões</label>
      <div class="chip-row" id="chip-ordem">
        ${ORDENS_SIMULADO.map(([k,rot,dica])=>`<span class="chip ${STATE.ordemSimulado===k?'selected':''}" data-ordem-simulado="${k}" title="${esc(dica)}">${rot}</span>`).join('')}
      </div>
      <div style="font-size:11px;color:var(--ink-soft);margin-top:4px;">${esc(ordemAtual[2])}.${(()=>{ const qa = STATE.quizzesEmAndamento[STATE.materia]; return qa && !qa.finished ? ' Vale também para o simulado em andamento (as já respondidas ficam onde estão).' : ''; })()}</div>
      ${STATE.avisoOrdem && Date.now()-STATE.avisoOrdem.ts < 8000 ? `<div style="font-size:11px;color:var(--stamp-green, #3a9d5c);margin-top:4px;">✓ Simulado em andamento reordenado.</div>` : ''}
    </div>
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
    ${materiaTemCobranca(STATE.materia) ? (()=>{
      const base = scoreableFiltradas();
      const cont = {}; base.forEach(q => { const g = grupoCobranca(q) || 'sem'; cont[g] = (cont[g]||0)+1; });
      const exc = setup.cobrancaExcluida || new Set();
      const chips = COBRANCA_GRUPOS.filter(([k]) => cont[k]).map(([k,rot]) => [k, rot, cont[k]]);
      if(cont.sem) chips.push(['sem', 'Sem classificação', cont.sem]);
      return `<div class="setup-mini-field">
      <label title="Como a questão foi redigida. Literal e literal com troca ficam juntas em 'Lei seca' para não denunciar o gabarito">Tipo de cobrança</label>
      <div class="chip-row" id="chip-cobranca">
        ${chips.map(([k,rot,n])=>`<span class="chip ${!exc.has(k)?'selected':''}" data-cobranca="${k}">${rot} (${n})</span>`).join('')}
      </div>
    </div>`; })() : ''}
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
    !setup.anosExcluidos.has(String(anoRealDaQuestao(q)||'')) &&
    !setup.bancasExcluidas.has(bancaCurta(q.bc)) &&
    !setup.cargosExcluidos.has(cargoCurto(q.bc)) &&
    !setup.tendenciasExcluidas.has(tendenciaCurta(q.td)) &&
    (setup.incluirIneditas || !isInedita(q)) &&
    (!setup.cobrancaExcluida || !setup.cobrancaExcluida.size || !setup.cobrancaExcluida.has(grupoCobranca(q) || 'sem'))
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
  if(STATE.quiz) salvarQuizEmAndamento(); // flush do que estava em andamento antes de trocar
  STATE.materia = materiaNome;
  STATE.tema = 'todos';
  STATE.viewImportar = false;
  if(!q || q.finished){
    // sem simulado salvo: começa pelas questões ainda não respondidas
    startQuiz();
    return;
  }
  const last = acharIdxUltimaRespondida(q);
  if(last>=0) q.idx = last;
  STATE.quiz = q;
  render();
}
/* ---- ordem das questões no simulado ---- */
function _embaralhar(lista){
  const a = [...lista];
  for(let i=a.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]] = [a[j],a[i]]; }
  return a;
}
// alterna os grupos (assuntos): uma questão de cada por rodada, em ordem sorteada
function _intercalar(grupos){
  const filas = grupos.map(g => [...g]).filter(g => g.length);
  const out = [];
  while(filas.length){
    _embaralhar(filas.map((_,i)=>i)).forEach(i => { if(filas[i].length) out.push(filas[i].shift()); });
    for(let i=filas.length-1;i>=0;i--) if(!filas[i].length) filas.splice(i,1);
  }
  return out;
}
function _agrupar(lista, chave){
  const m = new Map();
  lista.forEach(q => { const k = chave(q); if(!m.has(k)) m.set(k, []); m.get(k).push(q); });
  return m;
}
function ordenarFilaSimulado(candidatos, materia, modo){
  const porNumero = (a,b) => (a.n||0)-(b.n||0);
  const temas = temasDisponiveis(materia);
  const idxTema = t => { const i = temas.indexOf(t); return i===-1 ? 1e6 : i; };
  const bucket = getBucket(materia);
  if(modo==='assunto'){
    return [...candidatos].sort((a,b)=> idxTema(a.tema)-idxTema(b.tema) || porNumero(a,b));
  }
  if(modo==='recentes'){
    const ano = q => { const p = identificarProva(q); return (p && p.ano) || 0; };
    return [...candidatos].sort((a,b)=> ano(b)-ano(a) || porNumero(a,b));
  }
  if(modo==='prova'){
    const grupos = _agrupar(candidatos, q => { const p = identificarProva(q); return p && p.ano ? p.id : '~'; });
    const anoDe = id => id==='~' ? -1 : Number(id.split('|').pop()) || 0;
    return [...grupos.keys()].sort((a,b)=> anoDe(b)-anoDe(a) || a.localeCompare(b))
      .flatMap(k => grupos.get(k).sort(porNumero));
  }
  if(modo==='intercalado'){
    const grupos = _agrupar(candidatos, q => q.tema);
    return _intercalar([...grupos.values()].map(_embaralhar));
  }
  if(modo==='espacada'){
    // último resultado errado primeiro; depois mais erros no histórico; depois a
    // resposta mais antiga; não respondidas no fim
    const info = q => {
      const p = bucket.perguntas[q.uid];
      if(!p || !p.tentativas) return { resp:0, errou:0, erros:0, ts:0 };
      const hist = p.historico || [];
      const erros = hist.filter(h => h.c===false).length || (p.tentativas - (p.acertos||0));
      const ts = hist.length ? hist[hist.length-1].ts || 0 : 0;
      return { resp:1, errou: p.ultimoResultado===false ? 1 : 0, erros, ts };
    };
    const cache = new Map(candidatos.map(q => [q.uid, info(q)]));
    return [...candidatos].sort((a,b)=>{
      const x = cache.get(a.uid), y = cache.get(b.uid);
      return (y.resp-x.resp) || (y.errou-x.errou) || (y.erros-x.erros) || (x.ts-y.ts) || porNumero(a,b);
    });
  }
  // prioridade: nota do assunto = estimativa de cair × chance de errar (acerto
  // suavizado: (acertos+1)/(respondidas+2)). Sem estimativa (matéria sem
  // provas), usa a fatia de questões do assunto. Assuntos fora do edital no
  // fim. Faixas de 0,1 na nota; dentro da faixa os assuntos se alternam.
  const analise = analisarTemasDaMateriaCached(materia);
  const estimativa = Object.fromEntries(analise.map(a => [a.tema, a.estimativa]));
  const desempenho = {};
  Object.entries(bucket.perguntas||{}).forEach(([uid,p]) => {
    const q = BY_UID[uid]; if(!q || q.materia!==materia) return;
    if(p.ultimoResultado!==true && p.ultimoResultado!==false) return;
    const d = desempenho[q.tema] = desempenho[q.tema] || [0,0];
    d[0] += p.ultimoResultado===true ? 1 : 0; d[1]++;
  });
  const qtdPorTema = {};
  ALL_QUESTIONS.forEach(q => { if(q.materia===materia && !q.duplicataOculta) qtdPorTema[q.tema] = (qtdPorTema[q.tema]||0)+1; });
  const maxQtd = Math.max(1, ...Object.values(qtdPorTema));
  const nota = t => {
    if(typeof ehForaDoEdital==='function' && ehForaDoEdital(t)) return -1;
    const est = estimativa[t]!=null ? estimativa[t] : (qtdPorTema[t]||0)/maxQtd;
    const [ac,tt] = desempenho[t] || [0,0];
    return est * (1 - (ac+1)/(tt+2));
  };
  const faixas = _agrupar(candidatos, q => Math.floor(nota(q.tema)*10));
  return [...faixas.keys()].sort((a,b)=>b-a).flatMap(f => {
    const grupos = _agrupar(faixas.get(f), q => q.tema);
    return _intercalar([...grupos.values()].map(g => g.sort(porNumero)));
  });
}
// reordena o simulado em andamento: as questões já respondidas NESTE simulado
// ficam onde estão (no começo, na ordem em que foram feitas); o resto segue a
// nova ordem — as nunca respondidas antes primeiro, como num simulado novo
// (na revisão espaçada, todas juntas). Continua da 1ª ainda não respondida.
function reordenarQuizEmAndamento(quiz, modo){
  if(!quiz || quiz.finished || quiz.origemErros || quiz.reaberto) return false;
  const bucket = getBucket(quiz.materia);
  // repõe respostas do histórico ANTES de decidir quais questões são "feitas"
  // -- senão uma questão respondida em outro ponto (fora deste quiz.respostas)
  // seria tratada como "ainda não feita" e embaralhada junto com as novas,
  // perdendo a marcação visual ao reordenar
  curarRespostasDoHistorico(quiz);
  const feitas = quiz.queue.filter(u => quiz.respostas[u]);
  const resto = quiz.queue.filter(u => !quiz.respostas[u]).map(u => BY_UID[u]).filter(Boolean);
  let restoOrdenado;
  if(modo==='espacada'){
    restoOrdenado = ordenarFilaSimulado(resto, quiz.materia, modo);
  } else {
    const jaFeita = q => bucket.perguntas[q.uid] && bucket.perguntas[q.uid].tentativas>0;
    restoOrdenado = ordenarFilaSimulado(resto.filter(q=>!jaFeita(q)), quiz.materia, modo)
      .concat(ordenarFilaSimulado(resto.filter(jaFeita), quiz.materia, modo));
  }
  quiz.queue = feitas.concat(restoOrdenado.map(q => q.uid));
  quiz.idx = Math.min(feitas.length, Math.max(0, quiz.queue.length-1));
  quiz.ordem = modo;
  // salvarQuizEmAndamento grava o STATE.quiz; o simulado pode não estar aberto
  const aberto = STATE.quiz; STATE.quiz = quiz; salvarQuizEmAndamento(); STATE.quiz = aberto;
  return true;
}
// muda a ordem escolhida (lembrada no aparelho) e aplica no simulado em
// andamento da matéria, se houver
function mudarOrdemSimulado(modo){
  STATE.ordemSimulado = modo;
  try{ window.localStorage.setItem(ORDEM_SIMULADO_KEY, modo); }catch(e){ /* só preferência */ }
  const quiz = STATE.quiz || STATE.quizzesEmAndamento[STATE.materia];
  const aplicou = reordenarQuizEmAndamento(quiz, modo);
  STATE.avisoOrdem = aplicou ? { ts: Date.now(), modo } : null;
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
  // volta a incluir as já respondidas quando não sobra nenhuma nova. Na revisão
  // espaçada é o contrário: entram todas, com as respondidas (erros) na frente.
  const bucketAtual = (!nums && STATE.materia) ? getBucket(STATE.materia) : null;
  const espacada = STATE.ordemSimulado==='espacada';
  const naoRespondidas = (bucketAtual && !espacada)
    ? candidatosTotais.filter(q => !(bucketAtual.perguntas[q.uid] && bucketAtual.perguntas[q.uid].tentativas>0))
    : candidatosTotais;
  const candidatos = naoRespondidas.length>0 ? naoRespondidas : candidatosTotais;
  // Usa todos os candidatos do filtro (nunca um lote limitado): o simulado fica
  // aberto até responder tudo. Conjunto específico (refazer erros) mantém a
  // ordem dada; o resto segue a ordem escolhida em "Ordem das questões".
  const ordenados = nums ? candidatos : ordenarFilaSimulado(candidatos, STATE.materia, STATE.ordemSimulado);
  const queue = ordenados.map(q=>q.uid);
  STATE.quiz = { queue, idx:0, respostas:{}, finished:false, materia: STATE.materia, tema: STATE.tema, ordem: nums ? null : STATE.ordemSimulado };
  STATE.setupDrawerOpen = false;
  STATE.mostrarConfigSimulado = false;
  STATE.simuladoSalvoMsg = false;
  STATE.quizzesEmAndamento[STATE.materia] = STATE.quiz;
  salvarQuizEmAndamento();
  render();
}

