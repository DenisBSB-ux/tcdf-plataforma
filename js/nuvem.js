/* ================= sincronização em nuvem (Firebase Firestore) ================= */
const SYNC_CODE_KEY = 'sim-sync-code';
const ZOOM_KEY = 'sim-zoom-level';
const THEME_KEY = 'sim-theme';
const LAST_SYNC_KEY = 'sim-ultimo-sync';

function quizStorageKey(materiaKey){
  return 'quiz-atual-' + slugify(materiaKey);
}
// Sessões de "refazer erros" usam uma chave própria ('materia::erros'),
// pra nunca sobrescrever o simulado geral em andamento da mesma matéria.
function chaveEmAndamento(quiz){
  return quiz.materia + (quiz.origemErros ? '::erros' : '');
}
let syncQuizEmAndamentoTimer = null;
let quizSyncPendente = null; // { materiaKey, quiz } — usado pra garantir envio mesmo se a aba fechar antes do debounce
// salva automaticamente o simulado em andamento a cada ação do usuário — tanto
// localmente (funciona mesmo offline) quanto na nuvem (pra "Continuar último
// salvo" aparecer em qualquer PC/celular depois de digitar o mesmo código de
// sincronização, não só no aparelho onde a resposta foi dada)
function salvarQuizEmAndamento(){
  const quiz = STATE.quiz;
  if(!quiz || quiz.finished) return;
  quiz.ultimoSalvamento = Date.now();
  const chave = chaveEmAndamento(quiz);
  storageSet(quizStorageKey(chave), JSON.stringify(quiz)).catch(()=>{});
  STATE.quizzesEmAndamento[chave] = quiz;
  quizSyncPendente = { materiaKey: chave, quiz };
  clearTimeout(syncQuizEmAndamentoTimer);
  // debounce curto (250ms): junta cliques em sequência rápida num só envio, mas
  // sem deixar passar tempo demais até chegar na nuvem — se a aba fechar antes
  // disso, o flush em visibilitychange/pagehide cobre o que ficou pendente
  syncQuizEmAndamentoTimer = setTimeout(()=>{ flushQuizSyncPendente(); }, 250);
}
function flushQuizSyncPendente(){
  clearTimeout(syncQuizEmAndamentoTimer);
  if(!quizSyncPendente) return;
  const { materiaKey, quiz } = quizSyncPendente;
  quizSyncPendente = null;
  return sincronizarQuizEmAndamentoNaNuvem(materiaKey, quiz);
}
// grava só o campo desta matéria dentro do quizzesEmAndamento: lê o estado
// atual, atualiza essa chave e regrava tudo como uma única string JSON (um
// campo aninhado nativo gastaria uma entrada de índice por chave).
async function sincronizarQuizEmAndamentoNaNuvem(materiaKey, quiz){
  if(!sincronizacaoAtiva()) return;
  try{
    const ref = fbDb.collection('progresso').doc(STATE.syncCode);
    const doc = await comLimiteDeTempo(ref.get(), 15000, 'tempo esgotado ao consultar simulado em andamento');
    const atual = (doc.exists && doc.data().quizzesEmAndamento) ? (typeof doc.data().quizzesEmAndamento==='string' ? JSON.parse(doc.data().quizzesEmAndamento) : doc.data().quizzesEmAndamento) : {};
    atual[materiaKey] = sanitizarParaFirestore(quiz);
    await comLimiteDeTempo(ref.set(comDono({ quizzesEmAndamento: JSON.stringify(atual) }), { merge: true }), 15000, 'tempo esgotado ao salvar simulado em andamento');
  }catch(e){ console.warn('Falha ao sincronizar simulado em andamento na nuvem', e); }
}
function limparQuizSalvo(materiaKey){
  storageSet(quizStorageKey(materiaKey), '').catch(()=>{});
  STATE.quizzesEmAndamento[materiaKey] = null;
  if(quizSyncPendente && quizSyncPendente.materiaKey===materiaKey){
    clearTimeout(syncQuizEmAndamentoTimer);
    quizSyncPendente = null;
  }
  if(sincronizacaoAtiva()){
    const ref = fbDb.collection('progresso').doc(STATE.syncCode);
    comLimiteDeTempo(ref.get(), 15000, 'tempo esgotado ao consultar simulado em andamento').then(doc=>{
      const atual = (doc.exists && doc.data().quizzesEmAndamento) ? (typeof doc.data().quizzesEmAndamento==='string' ? JSON.parse(doc.data().quizzesEmAndamento) : doc.data().quizzesEmAndamento) : {};
      atual[materiaKey] = null;
      return comLimiteDeTempo(ref.set(comDono({ quizzesEmAndamento: JSON.stringify(atual) }), { merge: true }), 15000, 'tempo esgotado ao limpar simulado em andamento');
    }).catch(e=>console.warn('Falha ao limpar simulado em andamento na nuvem', e));
  }
}
async function carregarQuizSalvo(materiaKey){
  try{
    const res = await storageGet(quizStorageKey(materiaKey));
    if(res && res.value){
      const q = JSON.parse(res.value);
      if(q && q.queue && q.queue.length && !q.finished) return q;
    }
  }catch(e){ /* nada salvo pra essa matéria ainda neste dispositivo */ }
  return null;
}
async function verificarQuizSalvo(materiaKey){
  const q = await carregarQuizSalvo(materiaKey);
  const atual = STATE.quizzesEmAndamento[materiaKey];
  // Só sobrescreve quando o armazenamento local tem um simulado E (não havia
  // nada em memória, ou o local é mais recente). A ausência de cópia local nunca
  // apaga o que já veio da nuvem por pullFromCloud.
  if(q && (!atual || (q.ultimoSalvamento||0) >= (atual.ultimoSalvamento||0))){
    STATE.quizzesEmAndamento[materiaKey] = q;
  }
  render();
}
// Confere o simulado em andamento de TODAS as matérias (pro botão "Continuar"
// aparecer em todas, não só na aberta). Roda uma vez no boot, sem esperar
// nenhuma leitura: cada matéria atualiza STATE.quizzesEmAndamento e re-renderiza
// quando a sua termina.
async function verificarTodosQuizzesSalvos(){
  const materias = materiasDisponiveis();
  await Promise.all(materias.map(m=>{
    STATE.quizzesVerificados.add(m);
    return verificarQuizSalvo(m);
  }));
}
function formatarDataHoraSalvamento(ts){
  const d = new Date(ts);
  return d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'}) + ' ' + d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
}

let FIREBASE_OK = false;
let fbDb = null;
let fbAuth = null;
let USUARIO_ATUAL = null; // { uid, email } quando logado com Google
let APP_INICIADO = false;
let AUTH_RESOLVIDO = false; // o Firebase já disse se há conta logada
try{
  if(typeof firebase !== 'undefined' && FIREBASE_CONFIG && FIREBASE_CONFIG.apiKey){
    firebase.initializeApp(FIREBASE_CONFIG);
    fbDb = firebase.firestore();
    FIREBASE_OK = true;
    if(firebase.auth){
      fbAuth = firebase.auth();
      fbAuth.onAuthStateChanged(usuario=>{
        AUTH_RESOLVIDO = true;
        const uidAntes = USUARIO_ATUAL && USUARIO_ATUAL.uid;
        USUARIO_ATUAL = usuario ? {
          uid: usuario.uid,
          email: usuario.email || '',
          nome: usuario.displayName || (usuario.email || '').split('@')[0] || 'conta Google',
        } : null;
        if(usuario && usuario.uid!==uidAntes) vincularContaGoogle();
        else if(!usuario && uidAntes && !SAINDO_DA_CONTA){
          // saiu por outro caminho (outra aba, sessão expirada): o aparelho
          // também não pode ficar com os dados dessa conta
          limparDadosDoUsuarioNoAparelho().then(()=>{ if(APP_INICIADO) render(); });
        }
        else if(APP_INICIADO) render();
      });
      fbAuth.getRedirectResult().catch(e=>console.warn('Falha no login por redirecionamento', e));
    }
  }
}catch(e){ console.warn('Firebase indisponível nesta sessão.', e); }

// Login (Google) — exigido pelas regras do Firestore (firestore.rules) pra
// publicar matérias e pra gravar progresso. Sem login o app continua
// funcionando localmente e lendo as matérias públicas.
// A sincronização é só pela conta Google: o código interno que nomeia os
// documentos de progresso fica guardado na nuvem em progresso/_conta_{uid}
// ({ dono, codigo }) e é escolhido automaticamente — o usuário nunca vê nem
// digita código. Na primeira vez, a conta adota o código que este aparelho já
// usava (mantém o progresso antigo); sem código anterior, cria um novo.
const CONTA_DO_APARELHO_KEY = 'tcdf-conta-do-aparelho-v1';
function sincronizacaoAtiva(){
  return FIREBASE_OK && !!STATE.syncCode && (!fbAuth || !!USUARIO_ATUAL);
}
async function vincularContaGoogle(){
  if(!APP_INICIADO){ setTimeout(vincularContaGoogle, 500); return; }
  if(!FIREBASE_OK || !USUARIO_ATUAL) return;
  const uid = USUARIO_ATUAL.uid;
  try{
    const ref = fbDb.collection('progresso').doc(`_conta_${uid}`);
    const doc = await comLimiteDeTempo(ref.get(), 15000, 'tempo esgotado ao consultar a conta na nuvem');
    let codigo = doc.exists ? doc.data().codigo : null;
    const primeiraVez = !codigo;
    if(primeiraVez){
      // só adota o código deste aparelho se ele ainda não pertence a OUTRA
      // conta (aparelho compartilhado: quem entra depois começa do zero)
      let contaDoAparelho = null;
      try{ const r = await storageGet(CONTA_DO_APARELHO_KEY); contaDoAparelho = r && r.value; }catch(e){ /* sem registro */ }
      const podeAdotar = STATE.syncCode && (!contaDoAparelho || contaDoAparelho===uid);
      codigo = podeAdotar ? STATE.syncCode : ('g-' + uid.toLowerCase());
      await comLimiteDeTempo(ref.set({ dono: uid, codigo, criadoEm: Date.now() }), 15000, 'tempo esgotado ao registrar a conta na nuvem');
    }
    if(!USUARIO_ATUAL || USUARIO_ATUAL.uid!==uid) return; // trocou de conta no meio
    try{ await storageSet(CONTA_DO_APARELHO_KEY, uid); }catch(e){ /* só evita adoção indevida */ }
    if(codigo!==STATE.syncCode){
      // conectarSincronizacao zera o progresso local se este aparelho estava
      // com OUTRA conta, puxa o da nuvem e envia tudo com o campo "dono"
      await conectarSincronizacao(codigo);
    }else{
      await pullFromCloud({ silent: true });
      // na primeira vez regrava tudo com o campo "dono" (assume os documentos
      // antigos); nas outras, só o que estiver pendente
      if(primeiraVez) Object.keys(PROGRESS).forEach(m => marcarProgressoSujo(m));
      await pushToCloud();
    }
  }catch(e){
    console.error('Falha ao vincular a conta Google à sincronização', e);
    setSyncStatusDOM('err', 'falha ao sincronizar (passe o mouse aqui)', motivoErroFirestore(e));
  }
  render();
}
function comDono(dados){
  return USUARIO_ATUAL ? { ...dados, dono: USUARIO_ATUAL.uid } : dados;
}
async function entrarComGoogle(){
  if(!fbAuth) return;
  const provedor = new firebase.auth.GoogleAuthProvider();
  try{
    await fbAuth.signInWithPopup(provedor);
  }catch(e){
    if(e && (e.code==='auth/popup-blocked' || e.code==='auth/operation-not-supported-in-this-environment')){
      await fbAuth.signInWithRedirect(provedor);
      return;
    }
    if(e && e.code==='auth/popup-closed-by-user') return;
    alert('Não foi possível entrar: ' + motivoErroAuth(e));
  }
}
// Sair: primeiro envia pra nuvem o que ainda estiver pendente (ainda logado,
// senão as regras recusam), depois apaga deste aparelho tudo o que é da
// conta (progresso, simulados em andamento, edições) e só então sai. O
// próximo usuário do aparelho começa do zero. Correções de gabarito não
// são apagadas: não vão pra nuvem e se perderiam de vez.
let SAINDO_DA_CONTA = false;
async function sairDaConta(){
  if(!fbAuth || SAINDO_DA_CONTA) return;
  SAINDO_DA_CONTA = true;
  try{
    let tudoEnviado = true;
    try{
      await comLimiteDeTempo(Promise.all([flushQuizSyncPendente(), pushToCloud()]), 20000, 'tempo esgotado ao enviar o progresso');
      if(MATERIAS_PROGRESSO_SUJAS.size>0) tudoEnviado = false;
    }catch(e){ tudoEnviado = false; }
    if(!tudoEnviado && !window.confirm('Parte do seu progresso ainda não chegou à nuvem (sem conexão?). Se sair agora, ela será apagada deste aparelho.\n\nSair mesmo assim?')) return;
    await limparDadosDoUsuarioNoAparelho();
    try{ await fbAuth.signOut(); }catch(e){ console.warn('Falha ao sair', e); }
  }finally{
    SAINDO_DA_CONTA = false;
  }
  render();
}
async function limparDadosDoUsuarioNoAparelho(){
  const chavesQuiz = new Set([
    ...Object.keys(STATE.quizzesEmAndamento || {}),
    ...materiasDisponiveis(),
    ...materiasDisponiveis().map(m => m + '::erros'),
  ]);
  clearTimeout(saveTimer);
  clearTimeout(syncQuizEmAndamentoTimer);
  quizSyncPendente = null;
  PROGRESS = {};
  MATERIAS_PROGRESSO_SUJAS.clear();
  EDICOES_USUARIO = {};
  edicaoAtual = null;
  STATE.quizzesEmAndamento = {};
  STATE.quizzesVerificados = new Set();
  STATE.quiz = null;
  STATE.flashDeck = null;
  STATE.syncCode = '';
  STATE.syncStatus = null;
  const escritas = [[STORAGE_KEY, '{}'], [EDICOES_KEY, '{}'], [SYNC_CODE_KEY, ''], [LAST_SYNC_KEY, ''], [CONTA_DO_APARELHO_KEY, '']];
  chavesQuiz.forEach(k => escritas.push([quizStorageKey(k), '']));
  for(const [chave, valor] of escritas){
    try{ await storageSet(chave, valor); }catch(e){ console.warn('Falha ao limpar '+chave, e); }
    // cópia antiga no localStorage (versões anteriores) também não pode sobrar
    try{ if(window.localStorage.getItem(chave)!==null) window.localStorage.setItem(chave, valor); }catch(e){ /* sem localStorage */ }
  }
}
function motivoErroAuth(e){
  const codigo = e && e.code ? e.code : '';
  if(codigo==='auth/unauthorized-domain') return `o domínio "${location.hostname}" não está autorizado no Firebase (Authentication → Settings → Authorized domains).`;
  if(codigo==='auth/configuration-not-found') return 'o Authentication ainda não foi ativado neste projeto do Firebase. No Firebase Console: Authentication → "Vamos começar" (Get started) → Sign-in method → Google → Ativar → Salvar. Veja SEGURANCA.md.';
  if(codigo==='auth/operation-not-allowed') return 'o login com Google não está ativado no Firebase (Authentication → Sign-in method → Google).';
  return (e && e.message) ? e.message : 'erro desconhecido';
}

// pdf.js precisa do worker configurado antes do primeiro uso — mesma versão do
// script carregado no <head>, servido pelo mesmo CDN
if(typeof pdfjsLib !== 'undefined'){
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/legacy/build/pdf.worker.min.js';
}

function mergeBucket(local, remote){
  local = local || { perguntas:{}, flash:{}, sessoes:[], simuladosSalvos:[] };
  remote = remote || { perguntas:{}, flash:{}, sessoes:[], simuladosSalvos:[] };
  const merged = { perguntas:{...local.perguntas}, flash:{...local.flash}, sessoes:[...(local.sessoes||[])], simuladosSalvos:[...(local.simuladosSalvos||[])] };

  Object.entries(remote.perguntas||{}).forEach(([uid, remoteP])=>{
    const localP = merged.perguntas[uid];
    const allHist = [...((localP&&localP.historico)||[]), ...(remoteP.historico||[])];
    if(allHist.length===0) return;
    const seen = new Set();
    const dedup = [];
    allHist.sort((a,b)=>a.ts-b.ts).forEach(h=>{
      const k = h.ts+'-'+h.c;
      if(!seen.has(k)){ seen.add(k); dedup.push(h); }
    });
    merged.perguntas[uid] = {
      tentativas: dedup.length,
      acertos: dedup.filter(h=>h.c).length,
      ultimoResultado: dedup[dedup.length-1].c,
      historico: dedup.slice(-20),
    };
  });

  Object.entries(remote.flash||{}).forEach(([uid, remoteF])=>{
    const localF = merged.flash[uid];
    if(!localF || (remoteF.ts||0) > (localF.ts||0)) merged.flash[uid] = remoteF;
  });

  const sessKeys = new Set(merged.sessoes.map(s=>s.ts));
  (remote.sessoes||[]).forEach(s=>{
    if(!sessKeys.has(s.ts)){ merged.sessoes.push(s); sessKeys.add(s.ts); }
  });
  merged.sessoes.sort((a,b)=>a.ts-b.ts);
  if(merged.sessoes.length>50) merged.sessoes = merged.sessoes.slice(-50);

  const salvosKeys = new Set(merged.simuladosSalvos.map(s=>s.ts));
  (remote.simuladosSalvos||[]).forEach(s=>{
    if(!salvosKeys.has(s.ts)){ merged.simuladosSalvos.push(s); salvosKeys.add(s.ts); }
  });
  merged.simuladosSalvos.sort((a,b)=>a.ts-b.ts);
  if(merged.simuladosSalvos.length>20) merged.simuladosSalvos = merged.simuladosSalvos.slice(-20);

  return merged;
}

function mergeRemoteProgressoNaMemoria(remoteProgress){
  Object.entries(remoteProgress||{}).forEach(([materiaKey, remoteBucket])=>{
    PROGRESS[materiaKey] = mergeBucket(PROGRESS[materiaKey], remoteBucket);
  });
}

// mescla edições manuais (enunciado/resolução/resumo flash) vindas da nuvem —
// só PREENCHE o que ainda não existe localmente pra este uid+campo; uma edição
// já feita neste dispositivo nunca é sobrescrita por uma versão remota, já que
// não guardamos timestamp por edição pra decidir qual é mais recente. Retorna
// true se alguma edição nova foi de fato incorporada (pra saber se precisa salvar).
function mergeRemoteEdicoesNaMemoria(remoteEdicoes){
  let mudou = false;
  Object.entries(remoteEdicoes||{}).forEach(([uid, campos])=>{
    Object.entries(campos||{}).forEach(([campo, html])=>{
      if(!EDICOES_USUARIO[uid]) EDICOES_USUARIO[uid] = {};
      if(EDICOES_USUARIO[uid][campo] === undefined){
        EDICOES_USUARIO[uid][campo] = limparHtmlEditado(html);
        mudou = true;
      }
    });
  });
  return mudou;
}

// mescla os simulados "em andamento" vindos da nuvem com os que já estão em
// memória neste dispositivo. Em caso de conflito (a mesma matéria com uma sessão
// ativa tanto aqui quanto em outro aparelho), vence o salvamento mais recente —
// e o vencedor também é gravado no armazenamento local, pra "Continuar" funcionar
// mesmo se o dispositivo ficar sem internet logo em seguida
function mergeRemoteQuizzesEmAndamentoNaMemoria(remoteQuizzes){
  Object.entries(remoteQuizzes||{}).forEach(([materiaKey, quizRemoto])=>{
    const valido = quizRemoto && quizRemoto.queue && quizRemoto.queue.length && !quizRemoto.finished;
    if(!valido) return;
    const quizLocal = STATE.quizzesEmAndamento[materiaKey];
    const remotoMaisNovo = !quizLocal || (quizRemoto.ultimoSalvamento||0) > (quizLocal.ultimoSalvamento||0);
    if(remotoMaisNovo){
      STATE.quizzesEmAndamento[materiaKey] = quizRemoto;
      storageSet(quizStorageKey(materiaKey), JSON.stringify(quizRemoto)).catch(()=>{});
      // se essa matéria é a que está aberta agora e não há nada mais novo em tela,
      // atualiza a sessão ativa também (evita ficar respondendo uma versão velha)
      if(STATE.quiz && STATE.quiz.materia===materiaKey && (STATE.quiz.ultimoSalvamento||0) < (quizRemoto.ultimoSalvamento||0)){
        STATE.quiz = quizRemoto;
      }
    }
  });
}

function mergeRemoteQuestoesNaMemoria(remoteQuestoes){
  if(!Array.isArray(remoteQuestoes)) return 0;
  const existingUids = new Set(ALL_QUESTIONS.map(q=>q.uid));
  let added = 0;
  remoteQuestoes.forEach(q=>{
    if(q && q.uid && !existingUids.has(q.uid)){
      ALL_QUESTIONS.push(q);
      existingUids.add(q.uid);
      added++;
    }
  });
  if(added>0) reindex();
  return added;
}

function setSyncStatusDOM(type, msg, detalhe){
  STATE.syncStatus = { type, msg, detalhe, ts: Date.now() };
  const el = document.getElementById('sync-status-el');
  if(el){
    el.textContent = msg;
    el.className = 'sync-status ' + type;
    if(detalhe) el.title = detalhe; else el.removeAttribute('title');
  }
}

function motivoErroFirestore(e){
  const codigo = e && e.code ? e.code : '';
  if(codigo === 'permission-denied') return USUARIO_ATUAL
    ? 'Acesso negado — esta conta não tem permissão para esta operação (publicar matérias é só para o administrador definido em firestore.rules).'
    : 'Acesso negado — entre com o Google (barra lateral, bloco Sincronização) para sincronizar e publicar.';
  if(codigo === 'unavailable') return 'Sem conexão com o Firestore no momento — verifique sua internet e tente novamente.';
  if(codigo === 'not-found') return 'Banco de dados Firestore não encontrado — confira se ele foi criado no projeto certo.';
  return (e && e.message) ? e.message : 'erro desconhecido';
}

function formatarUltimoSync(ts){
  const d = new Date(ts);
  return `nuvem ✓ ${d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})} ${d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`;
}
function marcarUltimoSyncOk(){
  const ts = Date.now();
  setSyncStatusDOM('ok', formatarUltimoSync(ts));
  storageSet(LAST_SYNC_KEY, String(ts)).catch(()=>{});
}

async function pullFromCloud({silent} = {}){
  if(!sincronizacaoAtiva()) return null;
  if(!silent) setSyncStatusDOM('pending', 'sincronizando…');
  try{
    const doc = await fbDb.collection('progresso').doc(STATE.syncCode).get();
    if(doc.exists){
      const data = doc.data();
      // retrocompatibilidade: documentos gravados antes da v42 podem ter
      // 'progress' direto no manifesto (objeto nativo ou string) — a partir da
      // v42, cada matéria tem seu próprio documento (ver pushToCloud)
      if(data.progress){
        const progressoAntigo = typeof data.progress === 'string' ? JSON.parse(data.progress) : data.progress;
        mergeRemoteProgressoNaMemoria(progressoAntigo);
      }
      const materiasComProgresso = Array.isArray(data.materiasComProgresso) ? data.materiasComProgresso : [];
      let algumaEdicaoNova = false;
      for(const materiaNome of materiasComProgresso){
        try{
          const docMateria = await fbDb.collection('progresso').doc(`${STATE.syncCode}__${slugify(materiaNome)}`).get();
          if(docMateria.exists && docMateria.data().progress){
            mergeRemoteProgressoNaMemoria({ [materiaNome]: JSON.parse(docMateria.data().progress) });
          }
          if(docMateria.exists && docMateria.data().edicoes){
            if(mergeRemoteEdicoesNaMemoria(JSON.parse(docMateria.data().edicoes))) algumaEdicaoNova = true;
          }
        }catch(e){ console.warn('Falha ao buscar o progresso da matéria "'+materiaNome+'" na nuvem', e); }
      }
      if(algumaEdicaoNova) salvarEdicoesUsuario();
      // matérias/questões em si não vêm mais daqui — elas já chegam via
      // carregarMateriasPublicas() (coleção publico/{materia}), evitando duplicar
      // o banco inteiro de questões dentro do documento pessoal de progresso
      if(data.quizzesEmAndamento){
        const quizzesRemotos = typeof data.quizzesEmAndamento === 'string' ? JSON.parse(data.quizzesEmAndamento) : data.quizzesEmAndamento;
        mergeRemoteQuizzesEmAndamentoNaMemoria(quizzesRemotos);
      }
      saveProgress();
      marcarUltimoSyncOk();
      return true;
    }else{
      // o código existe localmente, mas não tem NENHUM dado salvo na nuvem com esse
      // nome ainda — pode ser a primeira vez usando, ou pode ser um erro de digitação
      // (maiúscula/minúscula, espaço) fazendo cair num documento diferente do esperado
      setSyncStatusDOM('pending', 'primeira sincronização desta conta — ainda sem dados na nuvem');
      return false;
    }
  }catch(e){
    console.error('Falha ao puxar da nuvem', e);
    setSyncStatusDOM('err', 'falha ao sincronizar (passe o mouse aqui)', motivoErroFirestore(e));
    return null;
  }
}

function sanitizarParaFirestore(obj){
  // remove chaves com valor undefined recursivamente (Firestore não aceita undefined)
  return JSON.parse(JSON.stringify(obj));
}

/* ================= matérias públicas (visíveis para todos os usuários) ================= */
// retorna true se conseguiu de fato consultar a nuvem (mesmo que não tenha
// encontrado nada) — false só em caso de falha real de rede/permissão, pra
// nunca confundir "nuvem vazia" com "nuvem inacessível" na reconciliação
async function carregarMateriasPublicas(){
  if(!FIREBASE_OK) return false;
  try{
    // Cada matéria pública tem seu próprio documento. Matérias maiores que o limite
    // de 1MB do Firestore ficam divididas em pedaços "{slug}__p0", "{slug}__p1"…,
    // todos com o mesmo campo .materia. O documento "{slug}" é o manifesto
    // (metadados) e, em matérias antigas/pequenas, pode ainda trazer o array
    // "questoes" completo (formato legado, ainda lido).
    const snapshot = await fbDb.collection('publico').get();
    const docs = snapshot.docs || [];
    // recalculado a cada leitura: uma matéria reimportada depois de removida
    // deixa de ser "removida" assim que a nuvem mostrar o documento novo
    MATERIAS_REMOVIDAS_NUVEM = new Set();
    SLUGS_REMOVIDOS_NUVEM = new Set();

    // 1ª passada: descobre quais matérias (pelo slug BASE, sem sufixo de pedaço)
    // estão marcadas como removidas — precisa vir antes da 2ª passada porque a
    // ordem de leitura dos documentos do Firestore não é garantida, e um pedaço
    // não tem campo "removido" próprio (só o manifesto tem)
    docs.forEach(doc=>{
      const data = doc.data();
      if(!data || doc.id.startsWith('_')) return;
      if(data.removido){
        // registra tanto pelo campo do documento quanto pelo id do slug, já que
        // documentos antigos podem não ter o campo "materia" preenchido —
        // depender só dele já causou perda de dados por falso positivo (ver nota abaixo)
        if(data.materia) MATERIAS_REMOVIDAS_NUVEM.add(data.materia);
        SLUGS_REMOVIDOS_NUVEM.add(doc.id.replace(/__p\d+$/, ''));
      }
    });

    // 2ª passada: agrupa as questões de cada matéria (manifesto legado com array
    // embutido, e/ou pedaços) por nome, sem ainda tocar em ALL_QUESTIONS — só
    // troca o conteúdo local quando já tivermos o conjunto INTEIRO e válido
    // desta matéria em mãos, nunca aos poucos
    const questoesPorMateria = {};
    // pedaços além do numChunks do manifesto são sobras de uma versão maior
    // (ou de uma publicação interrompida) e não fazem parte da matéria
    const numChunksPorSlug = {};
    const docsPorId = {};
    docs.forEach(doc=>{
      const data = doc.data();
      docsPorId[doc.id] = data;
      if(data && !/__p\d+$/.test(doc.id) && typeof data.numChunks==='number') numChunksPorSlug[doc.id] = data.numChunks;
    });
    docs.forEach(doc=>{
      const data = doc.data();
      if(!data || doc.id.startsWith('_') || data.removido) return;
      const slugBase = doc.id.replace(/__p\d+$/, '');
      if(SLUGS_REMOVIDOS_NUVEM.has(slugBase)) return;
      const mPedaco = doc.id.match(/__p(\d+)$/);
      if(mPedaco && slugBase in numChunksPorSlug && Number(mPedaco[1]) >= numChunksPorSlug[slugBase]) return;
      // Só entram questões de um documento que É a matéria: um pedaço cujo
      // manifesto existe, ou um manifesto legado com o array embutido — e
      // sempre com o nome da matéria batendo com o do documento. Documentos
      // soltos (ex.: "publico/materias", de uma versão antiga, com cópias
      // antigas de várias matérias) eram somados às listas certas a cada
      // abertura e faziam as duplicatas voltarem.
      const manifesto = mPedaco ? docsPorId[slugBase] : data;
      const materiaDoDocumento = manifesto && manifesto.materia;
      if(!materiaDoDocumento || slugify(materiaDoDocumento)!==slugBase) return;
      if(Array.isArray(data.questoes) && data.questoes.length>0){
        data.questoes.forEach(q=>{
          if(!q || !q.uid || q.materia!==materiaDoDocumento) return;
          if(!questoesPorMateria[q.materia]) questoesPorMateria[q.materia] = [];
          questoesPorMateria[q.materia].push(q);
        });
      }
      // guarda o texto original e a versão do site que o processou pela última
      // vez (só referência).
      // Só existe na nuvem pra matérias pequenas o bastante pra caber (ver
      // publicarQuestoesNoFirestore); pra matérias grandes, o texto original
      // ainda fica disponível localmente neste aparelho (TEXTOS_ORIGINAIS_KEY).
      if(data.textoOriginal && data.materia){
        TEXTOS_ORIGINAIS[data.materia] = { texto: data.textoOriginal, versaoProcessada: data.versaoProcessada || null };
      }
      if(data.materia && typeof data.atualizadoEm === 'number'){
        MATERIA_ATUALIZADOEM_NUVEM_VISTO[data.materia] = data.atualizadoEm;
      }
    });

    // A nuvem é a fonte de verdade do CONTEÚDO das questões: pra cada matéria cujo
    // conteúdo completo veio da nuvem, o local é substituído por inteiro (senão
    // correções feitas em outro dispositivo nunca chegariam aqui).
    // origem:'importado' de propósito, pra ficar salvo localmente e continuar
    // disponível sem nuvem. Nunca apaga uma matéria só por ela não aparecer nesta
    // leitura.
    let mudou = false;
    Object.entries(questoesPorMateria).forEach(([materiaNome, questoesNuvem])=>{
      // mudança local ainda não publicada: só prevalece se for MAIS NOVA que a
      // versão da nuvem. Se a nuvem foi atualizada depois (outro aparelho,
      // reimportação), vale a nuvem e a pendência local é descartada.
      if(PUBLICACAO_PENDENTE.has(materiaNome) && ALL_QUESTIONS.some(q => q.materia===materiaNome)){
        const mudancaLocal = MATERIA_ULTIMA_ATUALIZACAO[materiaNome] || 0;
        const versaoNuvem = MATERIA_ATUALIZADOEM_NUVEM_VISTO[materiaNome] || 0;
        if(mudancaLocal > versaoNuvem) return;
        marcarPublicacaoPendente(materiaNome, false);
      }
      ALL_QUESTIONS = ALL_QUESTIONS.filter(q => q.materia !== materiaNome);
      questoesNuvem.forEach(q=>{ ALL_QUESTIONS.push({ ...q, origem: 'importado' }); });
      mudou = true;
    });
    if(mudou){ reindex(); await saveCustomQuestions(); }
    return true;
  }catch(e){ console.warn('Falha ao carregar matérias públicas', e); return false; }
}

// Grava uma matéria na coleção pública, dividida em pedaços por tamanho em
// bytes (ver LIMITE_BYTES_POR_CHUNK) mais um manifesto com os metadados.
// Não mexe em STATE.importLog nem chama render(): é usada tanto pelos botões
// quanto pela publicação automática.
// force=true só em ações explícitas do usuário sobre a matéria (importar,
// salvar, renomear, mesclar, deduplicar) — é o que pode passar por cima de uma
// marca de removida. Publicações em lote/automáticas usam force=false.
const LIMITE_BYTES_POR_CHUNK = 700000; // margem de segurança abaixo do limite de campo indexado do Firestore (~1.048.487 bytes)
function tamanhoUtf8(str){
  return new TextEncoder().encode(str).length;
}
async function publicarQuestoesNoFirestore(nomesMaterias, force){
  if(!FIREBASE_OK) return { ok:false, motivo:'Sincronização em nuvem indisponível nesta sessão.' };
  if(!nomesMaterias || nomesMaterias.length===0) return { ok:false, motivo:'Nenhuma matéria selecionada.' };
  // cada matéria é publicada de forma INDEPENDENTE — se uma falhar, as demais
  // continuam sendo processadas normalmente, e o retorno indica exatamente quais
  // falharam, em vez de abortar o lote inteiro silenciosamente na primeira
  // matéria problemática
  let totalNovas = 0;
  const falhas = [];
  for(const materiaNome of nomesMaterias){
    try{
      const slug = slugify(materiaNome);
      const manifestRef = fbDb.collection('publico').doc(slug);
      const manifestDoc = await comLimiteDeTempo(manifestRef.get(), 15000, 'tempo esgotado ao consultar manifesto de "'+materiaNome+'"');
      // TRAVA DE SEGURANÇA: uma matéria marcada como removida é um "túmulo" —
      // só uma reimportação EXPLÍCITA do usuário (force=true) pode trazê-la de
      // volta. Sem essa trava, qualquer chamada automática/em segundo plano
      // que ainda tivesse a matéria em ALL_QUESTIONS local (armazenamento
      // desatualizado, outra aba, reprocessamento) a ressuscitava sem querer.
      if(manifestDoc.exists && manifestDoc.data().removido===true && !force){
        console.warn(`Matéria "${materiaNome}" está marcada como removida — publicação ignorada (use reimportação explícita para trazê-la de volta)`);
        continue;
      }

      // recolhe as questões já publicadas — só usado pra saber quantos pedaços
      // existiam antes (pra limpar os que sobrarem, se a matéria encolheu)
      const manifestData = manifestDoc.exists ? manifestDoc.data() : null;
      const numChunksAntigo = (manifestData && manifestData.numChunks) || 0;

      // (item 5) se a nuvem tem um atualizadoEm mais novo do que o último que
      // ESTE dispositivo viu (registrado em carregarMateriasPublicas), outro
      // dispositivo/aba publicou algo aqui nesse meio tempo — sobrescrever
      // agora descartaria esse trabalho sem aviso nenhum. Não bloqueia (quem
      // chamou publicarQuestoesNoFirestore já tomou uma decisão deliberada),
      // mas fica registrado como um alerta visível, não só um log escondido.
      if(manifestData && typeof manifestData.atualizadoEm === 'number'){
        const ultimoVisto = MATERIA_ATUALIZADOEM_NUVEM_VISTO[materiaNome];
        if(ultimoVisto && manifestData.atualizadoEm > ultimoVisto){
          const detalhe = `"${materiaNome}" foi atualizada na nuvem (${formatarDataHoraSalvamento(manifestData.atualizadoEm)}) por outro dispositivo/aba depois da última vez que este aparelho sincronizou — publicar agora vai sobrescrever essa versão mais nova.`;
          console.warn(detalhe);
          ALERTAS_SOBRESCRITA_NUVEM.push({ materia: materiaNome, ts: Date.now(), detalhe });
        }
      }

      // O array local (ALL_QUESTIONS) é sempre a versão completa a publicar — nunca
      // mesclado com o que já estava na nuvem. Mesclar por uid trazia de volta
      // questões antigas/duplicadas de pedaços velhos (e desfazia "Substituir tudo").
      // O local já foi sincronizado com a nuvem por carregarMateriasPublicas().
      const questoesAtuais = ALL_QUESTIONS.filter(q=>q.materia===materiaNome).map(q=>({ ...q, origem:'publico' }));
      totalNovas += questoesAtuais.length;

      // divide em pedaços por tamanho em bytes (acumula questões até chegar perto
      // do limite, então começa um pedaço novo)
      const chunks = [];
      let chunkAtual = [];
      let tamanhoAtual = 0;
      questoesAtuais.forEach(q=>{
        const tamanhoQ = tamanhoUtf8(JSON.stringify(q));
        if(chunkAtual.length>0 && tamanhoAtual + tamanhoQ > LIMITE_BYTES_POR_CHUNK){
          chunks.push(chunkAtual);
          chunkAtual = [];
          tamanhoAtual = 0;
        }
        chunkAtual.push(q);
        tamanhoAtual += tamanhoQ;
      });
      if(chunkAtual.length>0 || chunks.length===0) chunks.push(chunkAtual); // matéria vazia ainda precisa de um manifesto válido

      // texto original: só vai pra nuvem se couber com folga (matérias pequenas).
      // Matérias grandes perdem o reprocessamento automático em OUTROS
      // dispositivos, mas o texto continua disponível neste aparelho (salvo
      // localmente à parte, sem limite de tamanho — ver TEXTOS_ORIGINAIS_KEY)
      const textoOriginalAtual = TEXTOS_ORIGINAIS[materiaNome] ? (TEXTOS_ORIGINAIS[materiaNome].texto || TEXTOS_ORIGINAIS[materiaNome]) : (manifestData ? manifestData.textoOriginal : undefined);
      const cabeTextoOriginal = textoOriginalAtual && tamanhoUtf8(textoOriginalAtual) < LIMITE_BYTES_POR_CHUNK;

      const manifestPayload = sanitizarParaFirestore({
        materia: materiaNome,
        atualizadoEm: Date.now(),
        numChunks: chunks.length,
        versaoProcessada: (window.__TCDF_BUILD__ && window.__TCDF_BUILD__.versao) || null,
        ...(cabeTextoOriginal ? { textoOriginal: textoOriginalAtual } : {}),
      });
      // sobrescreve o documento inteiro (.set sem merge) — isso também remove
      // de propósito qualquer "removido:true" ou array "questoes" legado de
      // versões anteriores, já que uma reimportação explícita (force=true) deve
      // mesmo substituir esse estado
      // pedaços primeiro, manifesto por último: se a publicação cair no meio,
      // o manifesto antigo continua apontando pro número antigo de pedaços
      for(let i=0;i<chunks.length;i++){
        await comLimiteDeTempo(fbDb.collection('publico').doc(`${slug}__p${i}`).set(sanitizarParaFirestore({
          materia: materiaNome,
          chunkIndex: i,
          questoes: chunks[i],
        })), 15000, 'tempo esgotado ao publicar pedaço '+i+' de "'+materiaNome+'"');
      }
      await comLimiteDeTempo(manifestRef.set(manifestPayload), 15000, 'tempo esgotado ao publicar manifesto de "'+materiaNome+'"');
      MATERIA_ATUALIZADOEM_NUVEM_VISTO[materiaNome] = manifestPayload.atualizadoEm;
      marcarPublicacaoPendente(materiaNome, false);
      // se a matéria encolheu (menos pedaços que antes), limpa os pedaços que
      // sobraram — best-effort: se falhar, o pior caso é um pedaço órfão com
      // questões que já existem em uid duplicado em outro pedaço (não causa
      // perda de dado, só desperdiça um pouco de espaço na nuvem)
      for(let i=chunks.length;i<numChunksAntigo;i++){
        try{ await comLimiteDeTempo(fbDb.collection('publico').doc(`${slug}__p${i}`).delete(), 15000, 'tempo esgotado ao limpar pedaço órfão'); }catch(e){ /* best-effort */ }
      }

      STATE.materiasPublicadasNestaSessao.add(materiaNome);
    }catch(e){
      console.error('Falha ao publicar a matéria "'+materiaNome+'"', e);
      // sem permissão (não é a conta administradora): este aparelho nunca vai
      // conseguir publicar, então a versão da nuvem é que vale
      if(e && e.code==='permission-denied') marcarPublicacaoPendente(materiaNome, false);
      falhas.push({ materia: materiaNome, motivo: e && e.message ? e.message : motivoErroFirestore(e) });
    }
  }
  if(falhas.length===0) return { ok:true, totalNovas };
  if(falhas.length===nomesMaterias.length) return { ok:false, motivo: falhas.map(f=>`${f.materia}: ${f.motivo}`).join(' · ') };
  // sucesso parcial: publicou algumas, outras falharam — reporta os dois lados
  return { ok:true, parcial:true, totalNovas, falhas };
}


async function pushToCloud(){
  if(!sincronizacaoAtiva()) return;
  // Nada mudou desde o último envio: nenhuma chamada à nuvem (economiza a cota
  // diária gratuita do Firestore).
  if(MATERIAS_PROGRESSO_SUJAS.size===0) return;
  try{
    // Cada matéria grava o próprio progresso num documento separado (string JSON,
    // uma entrada de índice só) — somadas, passariam de 1MB. O documento principal
    // guarda só a lista de matérias com progresso.
    // Só percorre as matérias marcadas como "sujas"; cada uma sai da lista só se a
    // escrita funcionar. Cada escrita tem limite de 15s e a falha de uma matéria
    // não impede as outras (com a cota excedida, o SDK pode travar em backoff).
    const materiasSujas = Array.from(MATERIAS_PROGRESSO_SUJAS);
    let algumaFalhou = false;
    for(const materiaNome of materiasSujas){
      const slugM = slugify(materiaNome);
      try{
        // edições manuais (enunciado/resolução/resumo flash) desta matéria —
        // vão junto no mesmo documento de progresso, pra sincronizar entre
        // dispositivos e sobreviver a uma limpeza de armazenamento local
        const edicoesDestaMateria = {};
        Object.keys(EDICOES_USUARIO).forEach(uid=>{
          const q = BY_UID[uid];
          if(q && q.materia===materiaNome) edicoesDestaMateria[uid] = EDICOES_USUARIO[uid];
        });
        await comLimiteDeTempo(fbDb.collection('progresso').doc(`${STATE.syncCode}__${slugM}`).set(sanitizarParaFirestore(comDono({
          materia: materiaNome,
          progress: JSON.stringify(PROGRESS[materiaNome]),
          edicoes: JSON.stringify(edicoesDestaMateria),
          updatedAt: Date.now(),
        }))), 15000, 'tempo esgotado ao salvar progresso da matéria "'+materiaNome+'"');
        MATERIAS_PROGRESSO_SUJAS.delete(materiaNome);
      }catch(e){
        algumaFalhou = true;
        console.warn('Falha ao salvar progresso de uma matéria na nuvem — as demais continuam sendo tentadas', e);
      }
    }
    // merge:true é essencial aqui: sem isso, cada vez que o progresso é salvo
    // (a cada resposta) o documento inteiro seria sobrescrito, apagando o campo
    // quizzesEmAndamento gravado separadamente por sincronizarQuizEmAndamentoNaNuvem
    await comLimiteDeTempo(fbDb.collection('progresso').doc(STATE.syncCode).set(sanitizarParaFirestore(comDono({
      materiasComProgresso: Object.keys(PROGRESS),
      updatedAt: Date.now(),
    })), { merge: true }), 15000, 'tempo esgotado ao salvar o manifesto de progresso');
    if(algumaFalhou) throw new Error('uma ou mais matérias não sincronizaram (ver avisos acima) — os dados já estão salvos neste dispositivo');
    marcarUltimoSyncOk();
  }catch(e){
    console.error('Falha ao enviar para a nuvem', e);
    setSyncStatusDOM('err', 'falha ao sincronizar (passe o mouse aqui)', motivoErroFirestore(e));
  }
}

async function conectarSincronizacao(codigo){
  codigo = (codigo||'').trim().toLowerCase();
  if(!codigo) return;
  const codigoAnterior = STATE.syncCode;
  const progressoAnterior = PROGRESS;
  const quizzesAnteriores = STATE.quizzesEmAndamento;
  STATE.syncCode = codigo;
  try{ await storageSet(SYNC_CODE_KEY, codigo); }catch(e){ /* ignora */ }
  // Cada código de sincronização tem histórico independente: ao TROCAR de código,
  // o progresso local é zerado antes de puxar da nuvem. Na primeira conexão (sem
  // código anterior), o progresso local passa a pertencer ao código conectado e
  // não é zerado.
  if(codigoAnterior && codigo !== codigoAnterior){
    PROGRESS = {};
    STATE.quizzesEmAndamento = {};
    try{ await storageSet(STORAGE_KEY, JSON.stringify(PROGRESS)); }catch(e){ /* ignora */ }
  }
  const encontrouDados = await pullFromCloud();
  if(encontrouDados === null){
    // falha real de rede/permissão (não "código novo sem dados") — desfaz a
    // troca por completo, pra não deixar o app zerado por causa de uma falha
    // temporária de conexão
    STATE.syncCode = codigoAnterior;
    PROGRESS = progressoAnterior;
    STATE.quizzesEmAndamento = quizzesAnteriores;
    try{ await storageSet(SYNC_CODE_KEY, codigoAnterior); }catch(e){ /* ignora */ }
    render();
    return;
  }
  // força um envio completo na conexão inicial — depois disso, só o que
  // realmente mudar é reenviado (ver marcarProgressoSujo)
  Object.keys(PROGRESS).forEach(m => marcarProgressoSujo(m));
  await pushToCloud();
  if(encontrouDados === false){
    // evita que a mensagem de sucesso do push (que roda logo em seguida, criando o
    // documento pela primeira vez) esconda o aviso importante de que não havia
    // NENHUM dado prévio salvo com esse código — sinal de possível erro de digitação
    setSyncStatusDOM('pending', 'conta conectada — primeira sincronização, sem dados anteriores na nuvem');
  }
  render();
}

async function loadProgress(){
  try{
    const res = await storageGet(STORAGE_KEY);
    if(res && res.value){
      const parsed = JSON.parse(res.value);
      if(parsed && parsed.perguntas && !Object.values(parsed).some(v=>v && v.perguntas)){
        PROGRESS = { [MATERIA_PADRAO]: parsed };
      } else {
        PROGRESS = parsed || {};
      }
    }
  }catch(e){ /* chave ainda não existe */ }

  try{
    const res2 = await storageGet(CUSTOM_KEY);
    if(res2 && res2.value){
      const custom = JSON.parse(res2.value);
      if(Array.isArray(custom) && custom.length){
        const uids = new Set(ALL_QUESTIONS.map(q=>q.uid));
        custom.forEach(q=>{
          if(!q || !q.uid || uids.has(q.uid)) return;
          const fixed = {
            ...q,
            es: (q.es==='literal'||q.es==='tematico'||q.es==='fora') ? q.es : 'literal',
            nv: (q.nv==='baixa'||q.nv==='media'||q.nv==='alta') ? q.nv : 'media',
            t: (q.t==='CE'||q.t==='MC') ? q.t : 'sem_gabarito',
            materia: q.materia || 'Importado',
            tema: q.tema || 'Geral',
          };
          ALL_QUESTIONS.push(fixed);
          uids.add(q.uid);
        });
        reindex();
      }
    }
  }catch(e){ /* sem questões importadas ainda */ }

  try{
    const res3 = await storageGet(SYNC_CODE_KEY);
    if(res3 && res3.value) STATE.syncCode = res3.value.trim().toLowerCase();
  }catch(e){ /* sem código de sincronização configurado ainda */ }

  try{
    const res4 = await storageGet(ZOOM_KEY);
    if(res4 && res4.value){
      const z = parseFloat(res4.value);
      if(!isNaN(z) && z>=0.8 && z<=1.6) STATE.zoomLevel = z;
    }
  }catch(e){ /* usa o padrão de 100% */ }

  try{
    const res5 = await storageGet(THEME_KEY);
    if(res5 && res5.value==='light') STATE.theme = 'light';
  }catch(e){ /* usa o padrão escuro */ }
  aplicarTema();

  try{
    const resCor = await storageGet(CORTEMA_KEY);
    if(resCor && resCor.value) STATE.corTema = resCor.value;
  }catch(e){ /* usa a paleta padrão */ }
  aplicarCorTema();

  try{
    const resEd = await storageGet(EDICOES_KEY);
    if(resEd && resEd.value) EDICOES_USUARIO = JSON.parse(resEd.value);
  }catch(e){ /* nenhuma edição manual salva ainda */ }

  try{
    const resGab = await storageGet(GABARITOS_ALTERADOS_KEY);
    if(resGab && resGab.value) GABARITOS_ALTERADOS = JSON.parse(resGab.value);
  }catch(e){ /* nenhum gabarito alterado salvo ainda */ }

  try{
    const resTx = await storageGet(TEXTOS_ORIGINAIS_KEY);
    if(resTx && resTx.value) TEXTOS_ORIGINAIS = JSON.parse(resTx.value) || {};
  }catch(e){ /* nenhum texto original salvo localmente ainda */ }

  try{
    try{
      const resPp = await storageGet(PUBLICACAO_PENDENTE_KEY);
      if(resPp && resPp.value) PUBLICACAO_PENDENTE = new Set(JSON.parse(resPp.value) || []);
    }catch(e){ console.warn('Falha ao ler publicações pendentes', e); }
    const resUa = await storageGet(MATERIA_ULTIMA_ATUALIZACAO_KEY);
    if(resUa && resUa.value) MATERIA_ULTIMA_ATUALIZACAO = JSON.parse(resUa.value) || {};
  }catch(e){ /* nenhuma data de atualização salva localmente ainda */ }

  try{
    const resOc = await storageGet(MATERIAS_OCULTAS_KEY);
    if(resOc && resOc.value) MATERIAS_OCULTAS = new Set(JSON.parse(resOc.value));
  }catch(e){ /* nenhuma matéria nativa removida ainda, neste aparelho */ }
  // também confere a lista compartilhada na nuvem, pra uma matéria removida
  // permanentemente num aparelho ficar removida em qualquer outro também
  if(FIREBASE_OK){
    try{
      const docOc = await fbDb.collection('publico').doc('_materias_ocultas').get();
      const nomesNaNuvem = (docOc.exists && Array.isArray(docOc.data().nomes)) ? docOc.data().nomes : [];
      nomesNaNuvem.forEach(n=>MATERIAS_OCULTAS.add(n));
      // AUTOCURA: se este aparelho tem na lista local algum nome que a nuvem
      // ainda não tem (ex.: uma tentativa de remoção anterior que salvou local
      // mas falhou ao gravar na nuvem por erro de permissão já corrigido),
      // empurra a lista completa pra nuvem agora, sem precisar de novo clique
      // em "Remover" — resolve o caso de "sumiu aqui, mas voltou no celular"
      const faltamNaNuvem = Array.from(MATERIAS_OCULTAS).some(n => !nomesNaNuvem.includes(n));
      if(faltamNaNuvem){
        try{ await fbDb.collection('publico').doc('_materias_ocultas').set({ nomes: Array.from(MATERIAS_OCULTAS) }); }
        catch(e){ console.error('Autocura da lista de matérias ocultas falhou', e); }
      }
    }catch(e){ /* segue só com a lista local, se a nuvem estiver indisponível */ }
  }
  if(MATERIAS_OCULTAS.size>0){
    ALL_QUESTIONS = ALL_QUESTIONS.filter(q => !(q.origem==='embutido' && MATERIAS_OCULTAS.has(q.materia)));
    reindex();
  }

  if(STATE.syncCode){
    try{
      const res6 = await storageGet(LAST_SYNC_KEY);
      if(res6 && res6.value){
        STATE.syncStatus = { type:'ok', msg: formatarUltimoSync(parseInt(res6.value,10)) };
      }
    }catch(e){ /* nunca sincronizou ainda neste dispositivo */ }
    // Limite de 8s: com a cota do Firestore excedida o SDK pode ficar em backoff
    // sem nunca resolver, e a página não pode ficar presa em "Carregando…" — ela
    // sempre abre com os dados locais; a nuvem só complementa.
    // com login Google, quem puxa é vincularContaGoogle (quando a conta é
    // reconhecida, logo depois da abertura)
    if(sincronizacaoAtiva()) try{ await comLimiteDeTempo(pullFromCloud({ silent: true }), 8000, 'tempo esgotado ao sincronizar progresso'); }
    catch(e){ console.warn('Sincronização de progresso não respondeu a tempo — seguindo com os dados locais.', e); }
    // MATERIAS_PROGRESSO_SUJAS só existe em memória: se um envio falhou e a página
    // foi recarregada, a matéria ficaria sem sincronizar. Marcar tudo como pendente
    // uma vez, na abertura, garante consistência eventual.
    Object.keys(PROGRESS).forEach(m => marcarProgressoSujo(m));
  }

  // matérias públicas (publicadas pelo administrador) aparecem para TODOS os usuários,
  // conectados ou não a um código de sincronização pessoal
  await sincronizarMateriasPublicas();
}

// Busca matérias publicadas por outros dispositivos. Roda na abertura e
// periodicamente (ver init). Seguro repetir: remoção local só acontece por sinal
// explícito na nuvem (removido:true), nunca por ausência.
async function sincronizarMateriasPublicas(){
  // Nunca lê/substitui o local enquanto alguma escrita local estiver em
  // andamento (ver TRAVAS_ESCRITA_ATIVAS).
  if(TRAVAS_ESCRITA_ATIVAS>0) return false;
  let nuvemDisponivel = false;
  try{
    nuvemDisponivel = await comLimiteDeTempo(carregarMateriasPublicas(), 8000, 'tempo esgotado ao carregar matérias públicas');
  }catch(e){
    console.warn('Carregamento de matérias públicas não respondeu a tempo — seguindo com os dados locais.', e);
  }
  // POLÍTICA DE SEGURANÇA (revista após perda real de dados causada pela
  // versão anterior desta função): NUNCA apagar uma matéria local só por
  // "não encontrei confirmação de que ela é válida na nuvem". Esse tipo de
  // checagem por ausência é frágil demais — qualquer inconsistência na leitura
  // (campo faltando num doc antigo, timing, paginação) vira perda de dado real,
  // como já aconteceu duas vezes. A partir de agora, uma matéria só é removida
  // por um sinal EXPLÍCITO e positivo de que o usuário pediu a remoção
  // (documento marcado removido:true, escrito pelo próprio botão "Remover").
  // Nunca por dedução de ausência.
  if(nuvemDisponivel){
    const antesDoFiltro = ALL_QUESTIONS.length;
    ALL_QUESTIONS = ALL_QUESTIONS.filter(q => {
      const slug = slugify(q.materia||'');
      if(MATERIAS_REMOVIDAS_NUVEM.has(q.materia) || SLUGS_REMOVIDOS_NUVEM.has(slug)) return false;
      return true;
    });
    if(ALL_QUESTIONS.length !== antesDoFiltro){
      reindex();
      await saveCustomQuestions();
    }
  }
  // Não há reprocessamento automático a partir do texto original importado:
  // ele substituía o conteúdo atual (já deduplicado/mesclado/editado) pelo
  // arquivo bruto a cada versão nova do site e trazia duplicatas de volta.
  try{ await comLimiteDeTempo(verificarTodosQuizzesSalvos(), 8000, 'tempo esgotado ao verificar simulados em andamento'); }
  catch(e){ console.warn('Verificação de simulados em andamento não respondeu a tempo — algumas matérias podem não mostrar "Continuar" até você entrar nelas.', e); }
}

let saveTimer = null;
function saveProgress(){
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async ()=>{
    try{
      await storageSet(STORAGE_KEY, JSON.stringify(PROGRESS));
    }
    catch(e){
      console.error('Falha ao salvar progresso', e);
      STATE.avisoStorage = 'Não foi possível salvar seu progresso neste dispositivo (' + (e && e.message ? e.message : 'erro desconhecido') + '). Se você atualizar a página agora, pode perder o que fez.';
      render();
    }
    pushToCloud();
  }, 300);
}

async function saveCustomQuestions(){
  const custom = ALL_QUESTIONS.filter(q => q.origem === 'importado');
  try{
    await storageSet(CUSTOM_KEY, JSON.stringify(custom));
    return true;
  }
  catch(e){
    console.error('Falha ao salvar questões importadas', e);
    STATE.avisoStorage = 'Não foi possível salvar as questões importadas neste dispositivo (' + (e && e.message ? e.message : 'erro desconhecido') + '). Se você atualizar a página agora, a lista importada pode sumir.';
    render();
    return false; // não relança: os demais pontos que chamam esta função não esperam exceção
  }
}

/* ================= exportar / importar progresso (backup manual entre computadores) ================= */
function exportarProgresso(){
  const payload = {
    formato: 'sim-progresso-backup-v1',
    exportadoEm: new Date().toISOString(),
    progress: PROGRESS,
    questoesImportadas: ALL_QUESTIONS.filter(q => q.origem === 'importado'),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dataStr = new Date().toISOString().slice(0,10);
  a.href = url;
  a.download = `progresso-simulado-${dataStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(()=>URL.revokeObjectURL(url), 1000);
}

async function importarProgresso(file){
  const reader = new FileReader();
  reader.onload = async (e) => {
    try{
      const payload = JSON.parse(e.target.result);
      if(!payload || typeof payload.progress !== 'object'){
        STATE.importProgressoLog = { error: 'Arquivo não reconhecido como backup de progresso válido.' };
        render();
        return;
      }
      // mescla progresso usando a mesma lógica robusta da sincronização em nuvem
      // (soma tentativas por questão sem perder nada do que já existe aqui)
      mergeRemoteProgressoNaMemoria(payload.progress);

      // reimporta também as questões customizadas do backup, se houver, evitando duplicar uid
      mergeRemoteQuestoesNaMemoria(payload.questoesImportadas);

      saveProgress();
      await saveCustomQuestions();
      STATE.importProgressoLog = { ok: true, ts: Date.now() };
      render();
    }catch(err){
      STATE.importProgressoLog = { error: 'Erro ao interpretar o arquivo: ' + err.message };
      render();
    }
  };
  reader.onerror = () => {
    STATE.importProgressoLog = { error: 'Não foi possível ler o arquivo selecionado.' };
    render();
  };
  reader.readAsText(file, 'utf-8');
}

function registrarResposta(materiaKey, uid, acertou){
  const bucket = getBucket(materiaKey);
  const p = bucket.perguntas[uid] || { tentativas:0, acertos:0, ultimoResultado:null, historico:[] };
  p.tentativas += 1;
  if(acertou) p.acertos += 1;
  p.ultimoResultado = acertou;
  p.historico.push({ ts: Date.now(), c: acertou });
  if(p.historico.length > 20) p.historico = p.historico.slice(-20);
  bucket.perguntas[uid] = p;
  marcarProgressoSujo(materiaKey);
  saveProgress();
}

function undoRegistro(materiaKey, uid){
  const bucket = getBucket(materiaKey);
  const p = bucket.perguntas[uid];
  if(!p || !p.tentativas) return;
  // O histórico é truncado em 20 entradas mas p.tentativas não: sem histórico
  // pra esta tentativa, usa o ultimoResultado atual como a tentativa desfeita.
  if(p.historico && p.historico.length){
    const last = p.historico.pop();
    p.tentativas = Math.max(0, p.tentativas-1);
    if(last.c) p.acertos = Math.max(0, p.acertos-1);
    p.ultimoResultado = p.historico.length ? p.historico[p.historico.length-1].c : null;
  } else {
    p.tentativas = Math.max(0, p.tentativas-1);
    if(p.ultimoResultado===true) p.acertos = Math.max(0, p.acertos-1);
    p.ultimoResultado = null;
  }
  if(p.tentativas===0){ delete bucket.perguntas[uid]; } else { bucket.perguntas[uid] = p; }
  marcarProgressoSujo(materiaKey);
  saveProgress();
}

function registrarFlash(materiaKey, uid, status){
  getBucket(materiaKey).flash[uid] = { status, ts: Date.now() };
  marcarProgressoSujo(materiaKey);
  saveProgress();
}

function registrarSessao(materiaKey, total, acertos, tema, queue, respostas){
  const bucket = getBucket(materiaKey);
  // guarda queue/respostas (além de total/acertos) pra dar pra reabrir o simulado
  // depois a partir do histórico "Últimos simulados", não só dos salvos manualmente
  bucket.sessoes.push({ ts: Date.now(), total, acertos, tema: tema || 'todos', queue: queue||null, respostas: respostas||null });
  if(bucket.sessoes.length > 50) bucket.sessoes = bucket.sessoes.slice(-50);
  marcarProgressoSujo(materiaKey);
  saveProgress();
}

function resetProgressoMateria(materiaKey){
  PROGRESS[materiaKey] = { perguntas:{}, flash:{}, sessoes:[] };
  marcarProgressoSujo(materiaKey);
  saveProgress();
}

