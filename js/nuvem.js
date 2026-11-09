/* ================= sincronização em nuvem (Firebase Firestore) ================= */
const SYNC_CODE_KEY = 'sim-sync-code';
const ZOOM_KEY = 'sim-zoom-level';
const CARTOES_KEY = 'tcdf-cartoes';
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
async function verificarQuizSalvo(materiaKey, opcoes){
  const q = await carregarQuizSalvo(materiaKey);
  const atual = STATE.quizzesEmAndamento[materiaKey];
  // Só sobrescreve quando o armazenamento local tem um simulado E (não havia
  // nada em memória, ou o local é mais recente). A ausência de cópia local nunca
  // apaga o que já veio da nuvem por pullFromCloud.
  if(q && (!atual || (q.ultimoSalvamento||0) >= (atual.ultimoSalvamento||0))){
    STATE.quizzesEmAndamento[materiaKey] = q;
  }
  try{ if(STATE.quizzesEmAndamento[materiaKey]) reconciliarProgressoComQuiz(STATE.quizzesEmAndamento[materiaKey], materiaKey); }catch(_){}
  if(!(opcoes && opcoes.semRender)) render();
}
// Confere o simulado em andamento de TODAS as matérias (pro botão "Continuar"
// aparecer em todas, não só na aberta). Roda uma vez no boot, sem esperar
// nenhuma leitura: cada matéria atualiza STATE.quizzesEmAndamento e re-renderiza
// quando a sua termina.
async function verificarTodosQuizzesSalvos(){
  const materias = materiasDisponiveis();
  await Promise.all(materias.map(m=>{
    STATE.quizzesVerificados.add(m);
    return verificarQuizSalvo(m, { semRender:true });
  }));
  // um único redesenho no fim (e só se não atrapalhar edição/digitação), em vez de um por matéria
  if(typeof podeRenderizarAgora!=='function' || podeRenderizarAgora()) render();
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
          // cópia de segurança do que estava no aparelho (pode haver coisa ainda não enviada)
          const copia = (()=>{ try{ return JSON.stringify({ ts: Date.now(), progress: PROGRESS, edicoes: EDICOES_USUARIO, pendentes: Array.from(MATERIAS_PROGRESSO_SUJAS) }); }catch(_){ return ''; } })();
          (copia ? storageSet('tcdf-backup-pre-logout', copia).catch(()=>{}) : Promise.resolve())
            .then(()=>limparDadosDoUsuarioNoAparelho()).then(()=>{ if(APP_INICIADO) render(); });
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
      const puxou = await pullFromCloud({ silent: true });
      // pull falhou/incompleto (null): não envia nada por cima da nuvem sem ter lido tudo
      if(puxou !== null){
        // na primeira vez regrava tudo com o campo "dono" (assume os documentos
        // antigos); nas outras, só o que estiver pendente
        if(primeiraVez) Object.keys(PROGRESS).forEach(m => marcarProgressoSujo(m));
        await pushToCloud();
      }
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
      await comLimiteDeTempo(Promise.all([flushQuizSyncPendente(), pushToCloud(), enviarImagensPendentes()]), 25000, 'tempo esgotado ao enviar o progresso');
      if(MATERIAS_PROGRESSO_SUJAS.size>0) tudoEnviado = false;
      // figura colada que ainda não subiu seria perdida (a edição que a referencia continua sincronizando)
      if(Object.keys(IMAGENS_USUARIO).some(id=>!IMAGENS_ENVIADAS.has(id))) tudoEnviado = false;
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
  // dados por conta que ficavam na memória e iam para a nuvem da conta seguinte
  GABARITOS_ALTERADOS = {};
  IMAGENS_USUARIO = {};
  IMAGENS_ENVIADAS = new Set();
  edicaoAtual = null;
  STATE.quizzesEmAndamento = {};
  STATE.quizzesVerificados = new Set();
  STATE.quiz = null;
  STATE.flashDeck = null;
  STATE.syncCode = '';
  STATE.syncStatus = null;
  const escritas = [[STORAGE_KEY, '{}'], [EDICOES_KEY, '{}'], [GABARITOS_ALTERADOS_KEY, '{}'], ['tcdf-edicoes-orfas', '{}'], [IMAGENS_KEY, '{}'], [IMAGENS_ENVIADAS_KEY, '[]'], [SYNC_CODE_KEY, ''], [LAST_SYNC_KEY, ''], [CONTA_DO_APARELHO_KEY, '']];
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

// Troca de numeração (Substituir por matéria): o lado mais antigo tem uids que, na lista nova, apontam para OUTRAS questões.
// Se o lado novo traz o mapa antigo->novo e ele parte exatamente da geração do lado antigo, migra; senão descarta os dados por uid.
function _migrarBucketPorMapa(velho, novo){
  const mig = novo && novo.migracao;
  const ok = mig && mig.mapa && (mig.de||0) === (velho.geracao||0);
  const out = { ...velho, perguntas:{}, flash:{}, chutes:{}, sessoes:(velho.sessoes||[]).map(x=>({ ...x, queue:null, respostas:null })), simuladosSalvos:[] };
  if(!ok) return out;
  const mapa = mig.mapa;
  Object.entries(velho.perguntas||{}).forEach(([u,p])=>{
    const n = mapa[u]; if(!n || !p) return;
    out.perguntas[n] = out.perguntas[n] && typeof somarProgressoDaQuestao==='function' ? somarProgressoDaQuestao(out.perguntas[n], p) : p;
  });
  Object.entries(velho.flash||{}).forEach(([u,f])=>{ const n = mapa[u]; if(n && !out.flash[n]) out.flash[n] = f; });
  Object.entries(velho.chutes||{}).forEach(([u,c])=>{ const n = mapa[u]; if(n && !out.chutes[n]) out.chutes[n] = c; });
  out.srs = {};   // agenda dos cartões (Reta Final) acompanha a questão renumerada
  Object.entries(velho.srs||{}).forEach(([u,x])=>{ const n = mapa[u]; if(n && !out.srs[n]) out.srs[n] = x; });
  return out;
}
// ---- remoções que sincronizam ("lápides") ----
// O merge só soma; sem registro da remoção, o que foi apagado voltava no envio seguinte. Campos do bucket:
//   resetEm: ts do "apagar histórico da matéria"; lapides: { 'c:<uid>': ts (chute desmarcado), 's:<ts>': ts (simulado salvo excluído) };
//   desfeitos: { <uid>: { ts, keys:[ 'ts-c', ... ] } } (tentativas desfeitas).
const _LAPIDE_VALIDADE_MS = 120*24*3600*1000;
function _aposReset(side, R){
  const o = { ...side, perguntas:{}, flash:{}, chutes:{}, sessoes:[], simuladosSalvos:[], desfeitos:{} };
  Object.entries(side.perguntas||{}).forEach(([uid,p])=>{
    const h = ((p&&p.historico)||[]).filter(x=>(x.ts||0)>R);
    if(!h.length) return;   // sem data, ou toda anterior ao reset: descartada
    o.perguntas[uid] = { ...p, historico:h, tentativas:h.length, acertos:h.filter(x=>x.c).length, ultimoResultado:h[h.length-1].c };
  });
  Object.entries(side.flash||{}).forEach(([uid,f])=>{ if(((f&&f.ts)||0)>R) o.flash[uid] = f; });
  Object.entries(side.chutes||{}).forEach(([uid,c])=>{ if(((c&&c.ts)||0)>R) o.chutes[uid] = c; });
  o.srs = {}; Object.entries(side.srs||{}).forEach(([uid,x])=>{ if(((x&&x.t)||0)>R) o.srs[uid] = x; });
  o.sessoes = (side.sessoes||[]).filter(x=>(x.ts||0)>R);
  o.simuladosSalvos = (side.simuladosSalvos||[]).filter(x=>(x.ts||0)>R);
  return o;
}
function _unirLapides(a, b){
  const out = {}, agora = Date.now();
  [a||{}, b||{}].forEach(m=>Object.entries(m).forEach(([k,ts])=>{ if(typeof ts==='number' && agora-ts < _LAPIDE_VALIDADE_MS) out[k] = Math.max(out[k]||0, ts); }));
  return out;
}
function _unirDesfeitos(a, b){
  const out = {}, agora = Date.now();
  [a||{}, b||{}].forEach(m=>Object.entries(m).forEach(([uid,d])=>{
    if(!d || typeof d.ts!=='number' || agora-d.ts >= _LAPIDE_VALIDADE_MS) return;
    const o = out[uid] || (out[uid] = { ts:0, keys:[] });
    o.ts = Math.max(o.ts, d.ts);
    (d.keys||[]).forEach(k=>{ if(!o.keys.includes(k)) o.keys.push(k); });
    o.keys = o.keys.slice(-20);
  }));
  return out;
}
function mergeBucket(local, remote){
  const gl = (local && local.geracao) || 0, gr = (remote && remote.geracao) || 0;
  if(gl !== gr){
    // o lado de geração menor é migrado para a numeração do maior antes de mesclar
    if(gr > gl){ local = _migrarBucketPorMapa(local || {}, remote); local.geracao = gr; local.migracao = remote.migracao; }
    else { remote = _migrarBucketPorMapa(remote || {}, local); remote.geracao = gl; }
  }
  local = local || { perguntas:{}, flash:{}, sessoes:[], simuladosSalvos:[], chutes:{}, srs:{} };
  remote = remote || { perguntas:{}, flash:{}, sessoes:[], simuladosSalvos:[], chutes:{}, srs:{} };
  // "apagar histórico": o lado que não conhece o reset perde o que é anterior a ele
  const R = Math.max(local.resetEm||0, remote.resetEm||0);
  if(R){
    if((local.resetEm||0) < R) local = _aposReset(local, R);
    if((remote.resetEm||0) < R) remote = _aposReset(remote, R);
  }
  const lapides = _unirLapides(local.lapides, remote.lapides);
  const desfeitos = _unirDesfeitos(local.desfeitos, remote.desfeitos);
  // parte do bucket local inteiro ({...local}) para não perder campos que o merge não conhece
  const merged = { ...local, perguntas:{...local.perguntas}, flash:{...local.flash}, sessoes:[...(local.sessoes||[])], simuladosSalvos:[...(local.simuladosSalvos||[])], chutes:{...(local.chutes||{})} };
  if(R) merged.resetEm = R;
  if(Object.keys(lapides).length) merged.lapides = lapides; else delete merged.lapides;
  if(Object.keys(desfeitos).length) merged.desfeitos = desfeitos; else delete merged.desfeitos;

  // chutes: união por uid; em conflito vale a marcação mais recente; lápide apaga marcação igual ou mais antiga
  Object.entries(remote.chutes||{}).forEach(([uid, rc])=>{
    const lc = merged.chutes[uid];
    if(!lc || ((rc&&rc.ts)||0) > ((lc&&lc.ts)||0)) merged.chutes[uid] = rc;
  });
  Object.keys(merged.chutes).forEach(uid=>{ const L = lapides['c:'+uid]; if(L && ((merged.chutes[uid]&&merged.chutes[uid].ts)||0) <= L) delete merged.chutes[uid]; });

  const uids = new Set([...Object.keys(merged.perguntas), ...Object.keys(remote.perguntas||{})]);
  uids.forEach(uid=>{
    const localP = (local.perguntas||{})[uid], remoteP = (remote.perguntas||{})[uid];
    if(!remoteP && !desfeitos[uid]) return;               // só no lado local, sem desfeito: fica como está
    const desf = desfeitos[uid], ocultas = new Set((desf&&desf.keys)||[]);
    const allHist = [...((localP&&localP.historico)||[]), ...((remoteP&&remoteP.historico)||[])];
    const seen = new Set(), dedup = [];
    allHist.sort((a,b)=>a.ts-b.ts).forEach(h=>{
      const k = h.ts+'-'+h.c;
      if(!seen.has(k) && !ocultas.has(k)){ seen.add(k); dedup.push(h); }
    });
    // contadores: o histórico guarda só 20 itens, então nunca encolhem abaixo do que cada lado já tinha — exceto quando
    // houve "desfazer": vale então o lado que desfez por último (ele reflete a tentativa removida)
    let tentativas, acertos;
    const dl = (local.desfeitos||{})[uid], dr = (remote.desfeitos||{})[uid];
    if(desf && (dl||dr)){
      const ladoP = ((dl&&dl.ts)||0) >= ((dr&&dr.ts)||0) ? localP : remoteP;
      tentativas = ladoP ? (ladoP.tentativas||0) : dedup.length;
      acertos = ladoP ? (ladoP.acertos||0) : dedup.filter(h=>h.c).length;
    } else {
      tentativas = Math.max(dedup.length, (localP&&localP.tentativas)||0, (remoteP&&remoteP.tentativas)||0);
      acertos = Math.max(dedup.filter(h=>h.c).length, (localP&&localP.acertos)||0, (remoteP&&remoteP.acertos)||0);
    }
    acertos = Math.min(acertos, tentativas);
    if(tentativas<=0 && !dedup.length){ delete merged.perguntas[uid]; return; }
    const ultimo = dedup.length ? dedup[dedup.length-1].c : (localP&&localP.ultimoResultado!==undefined ? localP.ultimoResultado : (remoteP&&remoteP.ultimoResultado));
    merged.perguntas[uid] = { ...(remoteP||{}), ...(localP||{}), tentativas, acertos, ultimoResultado: ultimo===undefined ? null : ultimo, historico: dedup.slice(-20) };
  });

  // agenda de revisão dos cartões (Reta Final): por questão, vale a revisão mais recente
  merged.srs = { ...(local.srs||{}) };
  Object.entries(remote.srs||{}).forEach(([uid, rs])=>{
    const ls = merged.srs[uid];
    if(!ls || ((rs&&rs.t)||0) > ((ls&&ls.t)||0)) merged.srs[uid] = rs;
  });
  if(!Object.keys(merged.srs).length) delete merged.srs;

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
  merged.simuladosSalvos = merged.simuladosSalvos.filter(s=>!lapides['s:'+s.ts]);
  merged.simuladosSalvos.sort((a,b)=>a.ts-b.ts);
  if(merged.simuladosSalvos.length>20) merged.simuladosSalvos = merged.simuladosSalvos.slice(-20);

  return merged;
}

// "Substituir por matéria" em outro aparelho renumerou os uids: edições e gabaritos corrigidos deste aparelho, indexados pelo
// uid antigo, passariam a valer em OUTRA questão. Move-os pelo mapa; o que o mapa não cobre (e cai em uid desta matéria) sai.
function _migrarEdicoesEGabaritos(materiaKey, localBucket, remoteBucket){
  const gl = (localBucket && localBucket.geracao) || 0, gr = (remoteBucket && remoteBucket.geracao) || 0;
  const mig = remoteBucket && remoteBucket.migracao;
  if(!(gr > gl) || !mig || !mig.mapa) return;
  const slug = slugify(materiaKey);
  const daMateria = u => u.startsWith(slug+'-') && /^\d+(-\d+)?$/.test(u.slice(slug.length+1));
  const encadeia = (mig.de||0) === gl;
  [EDICOES_USUARIO, GABARITOS_ALTERADOS].forEach(mapaDados=>{
    const movidos = {};
    Object.keys(mapaDados).filter(daMateria).forEach(u=>{
      if(encadeia && mig.mapa[u]) movidos[mig.mapa[u]] = mapaDados[u];
      delete mapaDados[u];
    });
    Object.assign(mapaDados, movidos);
  });
  salvarEdicoesUsuario(); salvarGabaritosAlterados();
}
function mergeRemoteProgressoNaMemoria(remoteProgress){
  Object.entries(remoteProgress||{}).forEach(([materiaKey, remoteBucket])=>{
    try{ _migrarEdicoesEGabaritos(materiaKey, PROGRESS[materiaKey], remoteBucket); }catch(e){ console.warn('Falha ao migrar edições/gabaritos', e); }
    PROGRESS[materiaKey] = mergeBucket(PROGRESS[materiaKey], remoteBucket);
  });
}

// mescla edições manuais (enunciado/resolução/resumo flash) vindas da nuvem —
// só PREENCHE o que ainda não existe localmente pra este uid+campo; uma edição
// já feita neste dispositivo nunca é sobrescrita por uma versão remota, já que
// não guardamos timestamp por edição pra decidir qual é mais recente. Retorna
// true se alguma edição nova foi de fato incorporada (pra saber se precisa salvar).
// gabaritos alterados/homologados vindos da nuvem: vence a entrada mais recente (ts) de cada questão, inclusive remoções (lápides)
function mergeRemoteGabaritosNaMemoria(remoto){
  let mudou = false;
  Object.entries(remoto||{}).forEach(([uid, g])=>{
    const loc = GABARITOS_ALTERADOS[uid];
    if(g && (!loc || (g.ts||0) > (loc.ts||0))){ GABARITOS_ALTERADOS[uid] = g; mudou = true; }
  });
  return mudou;
}
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
  try{ if(mudou && descartarEdicoesOrfas()) mudou = true; }catch(_){}
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
    if(q && typeof q==='object' && typeof q.uid==='string' && q.uid && !existingUids.has(q.uid)){
      // mesma normalização do loadProgress: campos controlados e origem 'importado' (backup/nuvem não decide o que é "embutido")
      const fixed = {
        ...q,
        es: (q.es==='literal'||q.es==='tematico'||q.es==='fora') ? q.es : 'literal',
        nv: (q.nv==='baixa'||q.nv==='media'||q.nv==='alta') ? q.nv : 'media',
        t: (q.t==='CE'||q.t==='MC') ? q.t : 'sem_gabarito',
        materia: typeof q.materia==='string' && q.materia ? q.materia : 'Importado',
        tema: typeof q.tema==='string' && q.tema ? q.tema : 'Geral',
        origem: 'importado',
      };
      ALL_QUESTIONS.push(fixed);
      existingUids.add(q.uid);
      added++;
    }
  });
  if(added>0) reindex();
  return added;
}

// texto da linha de sincronização (barra lateral): estado real — offline, pendências, erro ou "há N min"
function textoLinhaSync(){
  const n = MATERIAS_PROGRESSO_SUJAS.size, st = STATE.syncStatus;
  if(typeof navigator!=='undefined' && navigator.onLine===false) return { classe:'err', html:'📴 Sem conexão' + (n ? ' — ' + n + ' matéria' + (n>1?'s':'') + ' aguardando envio' : '') };
  if(st && st.type==='err') return { classe:'err', html: esc(st.msg) };
  if(n>0 || quizSyncPendente) return { classe:'pending', html:'⏳ Enviando ' + (n>0 ? n + ' matéria' + (n>1?'s':'') : 'simulado') + '…' };
  const ts = window.__ULTIMO_SYNC_TS || (st && st.type==='ok' ? st.ts : 0);
  if(!ts) return { classe:(st&&st.type)||'', html: esc(st ? st.msg : 'sincronizando…') };
  const min = Math.floor((Date.now()-ts)/60000), hh = new Date(ts).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
  const rel = min<1 ? 'agora' : (min<60 ? 'há '+min+' min' : (min<1440 ? 'há '+Math.floor(min/60)+' h' : 'há '+Math.floor(min/1440)+' d'));
  return { classe:'ok', html:'🟢 Sincronizado ' + rel + ' <small>(' + hh + ')</small>' };
}
function atualizarLinhaSync(){
  const el = document.getElementById('sync-status-el'); if(!el) return;
  const t = textoLinhaSync();
  el.className = 'sync-linha ' + t.classe;
  el.setAttribute('role','status'); el.setAttribute('aria-live','polite');
  el.innerHTML = '<span class="sync-dot"></span>' + t.html;
}
function setSyncStatusDOM(type, msg, detalhe){
  STATE.syncStatus = { type, msg, detalhe, ts: Date.now() };
  const el = document.getElementById('sync-status-el');
  if(el){
    atualizarLinhaSync();
    if(detalhe) el.title = detalhe; else el.removeAttribute('title');
  }
  atualizarIndicadorNuvem();
}
// Sincronização automática (chamada a cada 1 min): 1 leitura barata do manifesto; só puxa tudo se OUTRO aparelho gravou depois;
// reenvia o que ficou pendente; e renova o "Sincronizado há N min" a cada verificação bem-sucedida.
let _syncAutoEmAndamento = false;
async function sincronizacaoAutomatica(){
  if(_syncAutoEmAndamento || !sincronizacaoAtiva()) return;
  if(typeof navigator!=='undefined' && navigator.onLine===false){ try{ atualizarLinhaSync(); atualizarIndicadorNuvem(); }catch(_){} return; }
  if(document.visibilityState==='hidden') return;                         // aba em segundo plano: não gasta cota
  _syncAutoEmAndamento = true;
  try{
    let puxou = false;
    // 1) mudanças de outros aparelhos (não puxa no meio de um simulado aberto: o simulado em andamento não pode ser trocado por baixo)
    const doc = await comLimiteDeTempo(fbDb.collection('progresso').doc(STATE.syncCode).get(), 15000, 'tempo esgotado ao verificar a nuvem');
    const remotoTs = doc.exists ? (Number(doc.data().updatedAt) || 0) : 0;
    if(remotoTs > (window.__MANIFESTO_TS||0) && !STATE.quiz){
      const r = await pullFromCloud({ silent:true });
      puxou = r === true;
      if(puxou && typeof podeRenderizarAgora==='function' && podeRenderizarAgora()) try{ render(); }catch(_){}
    }
    // 2) o que ficou pendente de envio
    if(MATERIAS_PROGRESSO_SUJAS.size>0 || quizSyncPendente) await pushToCloud();
    // 3) verificação ok: renova o horário (sem erro pendente)
    if(!STATE.syncStatus || STATE.syncStatus.type!=='err' || puxou || MATERIAS_PROGRESSO_SUJAS.size===0) marcarUltimoSyncOk();
  }catch(e){
    console.warn('Sincronização automática falhou', e);
    setSyncStatusDOM('err', 'falha ao sincronizar', motivoErroFirestore(e));
  }finally{ _syncAutoEmAndamento = false; }
}
// "Sincronizar agora": envia o que está pendente e puxa o que mudou em outros aparelhos
async function sincronizarAgora(){
  if(!sincronizacaoAtiva()){ alert('Entre com o Google para sincronizar.'); return; }
  setSyncStatusDOM('pending','sincronizando…');
  try{
    const puxou = await pullFromCloud({ silent:true });
    if(puxou !== null) await pushToCloud();
  }catch(e){ console.warn('Sincronizar agora falhou', e); }
  try{ render(); }catch(_){}
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
  window.__ULTIMO_SYNC_TS = ts;
  setSyncStatusDOM('ok', formatarUltimoSync(ts));
  atualizarIndicadorNuvem();
  storageSet(LAST_SYNC_KEY, String(ts)).catch(()=>{});
}

/* PREFERÊNCIAS (tema, cor, zoom, ordens, critérios de armadilha, estatísticas da dica de chute): um documento por código de sincronização;
   o navegador guarda só uma cópia, a nuvem é a fonte. Vence o mais recente (updatedAt). */
const PREFS_TS_KEY = 'tcdf-prefs-ts';
function _lsGet(k){ try{ return window.localStorage.getItem(k); }catch(_){ return null; } }
function _lsSet(k, v){ try{ if(v===null||v===undefined) window.localStorage.removeItem(k); else window.localStorage.setItem(k, v); }catch(_){} }
function coletarPrefs(ts){
  return { theme: STATE.theme, cor: STATE.corTema, zoom: STATE.zoomLevel, cartoes: STATE.cartoes!==false,
    ordemMaterias: _lsGet(ORDEM_MATERIAS_KEY), ordemSimulado: _lsGet(ORDEM_SIMULADO_KEY), armCrit: _lsGet(ARM_CRIT_KEY),
    heur: (typeof HEUR_STATS!=='undefined') ? HEUR_STATS : null, ts };
}
let sincPrefsTimer = null;
function sincronizarPrefs(){
  if(typeof sincronizacaoAtiva!=='function' || !sincronizacaoAtiva()) return;
  clearTimeout(sincPrefsTimer);
  sincPrefsTimer = setTimeout(async ()=>{
    try{
      const ts = Date.now();
      await comLimiteDeTempo(fbDb.collection('progresso').doc(`${STATE.syncCode}__prefs`).set(sanitizarParaFirestore(comDono({ prefs: JSON.stringify(coletarPrefs(ts)), updatedAt: ts }))), 15000, 'tempo esgotado ao salvar preferências');
      _lsSet(PREFS_TS_KEY, String(ts));
    }catch(e){ console.warn('Falha ao salvar preferências na nuvem', e); }
  }, 1500);
}
// estatísticas mudam a cada resposta: só sobem a cada 10 min (poupa a cota diária de escrita do Firestore)
let _prefsUltimoEnvio = 0;
function sincronizarPrefsLento(){ if(Date.now()-_prefsUltimoEnvio < 600000) return; _prefsUltimoEnvio = Date.now(); sincronizarPrefs(); }
async function puxarPrefs(){
  try{
    const doc = await comLimiteDeTempo(fbDb.collection('progresso').doc(`${STATE.syncCode}__prefs`).get(), 15000, 'tempo esgotado ao ler as preferências');
    const local = parseInt(_lsGet(PREFS_TS_KEY)||'0', 10) || 0;
    if(!doc.exists){ sincronizarPrefs(); return; }          // primeira vez: sobe as preferências deste aparelho
    const d = doc.data(); if(!(d.updatedAt > local)) return;
    const p = JSON.parse(d.prefs);
    if(p.theme==='light'||p.theme==='dark'){ STATE.theme = p.theme; storageSet(THEME_KEY, p.theme).catch(()=>{}); aplicarTema(); }
    if(p.cor && PALETAS_CORES[p.cor]){ STATE.corTema = p.cor; storageSet(CORTEMA_KEY, p.cor).catch(()=>{}); aplicarCorTema(); }
    if(typeof p.cartoes==='boolean'){ STATE.cartoes = p.cartoes; storageSet(CARTOES_KEY, p.cartoes ? '1' : '0').catch(()=>{}); }
    if(typeof p.zoom==='number' && p.zoom>=0.8 && p.zoom<=1.6){ STATE.zoomLevel = p.zoom; storageSet(ZOOM_KEY, String(p.zoom)).catch(()=>{}); }
    _lsSet(ORDEM_MATERIAS_KEY, p.ordemMaterias); _lsSet(ORDEM_SIMULADO_KEY, p.ordemSimulado); _lsSet(ARM_CRIT_KEY, p.armCrit);
    try{ if(p.armCrit) armCritAplicar(JSON.parse(p.armCrit)); else armCritAplicar(null); }catch(_){}
    const heurOk = (p.heur && typeof heurStatsSanear==='function') ? heurStatsSanear(p.heur) : null;
    if(heurOk && typeof HEUR_STATS!=='undefined'){ HEUR_STATS = heurOk; storageSet(HEUR_STATS_KEY, JSON.stringify(HEUR_STATS)).catch(()=>{}); }
    _lsSet(PREFS_TS_KEY, String(d.updatedAt));
    try{ render(); }catch(_){}
  }catch(e){ console.warn('Falha ao buscar preferências na nuvem', e); }
}

async function pullFromCloud({silent} = {}){
  if(!sincronizacaoAtiva()) return null;
  if(!silent) setSyncStatusDOM('pending', 'sincronizando…');
  try{
    const doc = await comLimiteDeTempo(fbDb.collection('progresso').doc(STATE.syncCode).get(), 15000, 'tempo esgotado ao ler o progresso na nuvem');
    if(doc.exists){
      const data = doc.data();
      const tsManifestoLido = Number(data.updatedAt) || 0;
      // retrocompatibilidade: documentos gravados antes da v42 podem ter
      // 'progress' direto no manifesto (objeto nativo ou string) — a partir da
      // v42, cada matéria tem seu próprio documento (ver pushToCloud)
      if(data.progress){
        const progressoAntigo = typeof data.progress === 'string' ? JSON.parse(data.progress) : data.progress;
        mergeRemoteProgressoNaMemoria(progressoAntigo);
      }
      const materiasComProgresso = Array.isArray(data.materiasComProgresso) ? data.materiasComProgresso : [];
      let algumaEdicaoNova = false, algumGabaritoNovo = false, falhouMateria = false;
      for(const materiaNome of materiasComProgresso){
        try{
          const docMateria = await comLimiteDeTempo(fbDb.collection('progresso').doc(`${STATE.syncCode}__${slugify(materiaNome)}`).get(), 15000, 'tempo esgotado ao ler a matéria "'+materiaNome+'" na nuvem');
          if(docMateria.exists && docMateria.data().progress){
            mergeRemoteProgressoNaMemoria({ [materiaNome]: JSON.parse(docMateria.data().progress) });
          }
          if(docMateria.exists && docMateria.data().gabaritos){
            try{ if(mergeRemoteGabaritosNaMemoria(JSON.parse(docMateria.data().gabaritos))) algumGabaritoNovo = true; }catch(_){}
          }
          if(docMateria.exists && docMateria.data().edicoes){
            if(mergeRemoteEdicoesNaMemoria(JSON.parse(docMateria.data().edicoes))) algumaEdicaoNova = true;
          }
        }catch(e){ falhouMateria = true; console.warn('Falha ao buscar o progresso da matéria "'+materiaNome+'" na nuvem', e); }
      }
      if(algumaEdicaoNova) salvarEdicoesUsuario();
      if(algumGabaritoNovo) salvarGabaritosAlterados();
      await puxarPrefs();
      // matérias/questões em si não vêm mais daqui — elas já chegam via
      // carregarMateriasPublicas() (coleção publico/{materia}), evitando duplicar
      // o banco inteiro de questões dentro do documento pessoal de progresso
      if(data.quizzesEmAndamento){
        const quizzesRemotos = typeof data.quizzesEmAndamento === 'string' ? JSON.parse(data.quizzesEmAndamento) : data.quizzesEmAndamento;
        mergeRemoteQuizzesEmAndamentoNaMemoria(quizzesRemotos);
      }
      saveProgress();
      if(!falhouMateria) window.__MANIFESTO_TS = Math.max(window.__MANIFESTO_TS||0, tsManifestoLido);
      if(falhouMateria){
        // pull incompleto: não conta como sincronizado (evita sobrescrever a nuvem sem ter lido tudo)
        setSyncStatusDOM('err', 'sincronização incompleta — tentando de novo depois', 'Alguma matéria não pôde ser lida da nuvem.');
        return null;
      }
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


// Limite do Firestore: ~1 MiB por documento. O progresso local nunca é podado; só a CÓPIA enviada à nuvem,
// em etapas, da menos para a mais valiosa, até caber (margem de segurança para os outros campos do documento).
const LIMITE_DOC_NUVEM = 900000;
function _bytesUtf8(str){ try{ return new TextEncoder().encode(str).length; }catch(_){ return str.length*2; } }
function progressoParaNuvem(bucket, outrosBytes){
  const cabe = txt => _bytesUtf8(txt) + outrosBytes <= LIMITE_DOC_NUVEM;
  let txt = JSON.stringify(bucket);
  if(cabe(txt)) return { json: txt, podado: 0 };
  const c = JSON.parse(txt);
  const etapas = [
    // 1) fila/respostas das sessões antigas (mantém só totais); as 10 mais recentes ficam completas
    () => (c.sessoes||[]).slice(0, -10).forEach(x=>{ x.queue = null; x.respostas = null; }),
    // 2) histórico por questão limitado às 5 últimas tentativas (tentativas/acertos continuam inteiros)
    () => Object.values(c.perguntas||{}).forEach(p=>{ if(p && Array.isArray(p.historico) && p.historico.length>5) p.historico = p.historico.slice(-5); }),
    // 3) fila/respostas de todas as sessões
    () => (c.sessoes||[]).forEach(x=>{ x.queue = null; x.respostas = null; }),
    // 3b) só as 2 últimas tentativas por questão
    () => Object.values(c.perguntas||{}).forEach(p=>{ if(p && Array.isArray(p.historico) && p.historico.length>2) p.historico = p.historico.slice(-2); }),
    // 4) simulados salvos mais antigos, um a um, mantendo ao menos o mais recente
    () => { while((c.simuladosSalvos||[]).length>1){ c.simuladosSalvos.shift(); if(cabe(JSON.stringify(c))) break; } },
    // 5) sessões mais antigas, mantendo as 10 mais recentes
    () => { if((c.sessoes||[]).length>10) c.sessoes = c.sessoes.slice(-10); },
  ];
  let n = 0;
  for(const etapa of etapas){
    etapa(); n++; txt = JSON.stringify(c);
    if(cabe(txt)) return { json: txt, podado: n };
  }
  return null;   // não cabe nem podado: quem chama avisa em vez de tentar gravar (a gravação falharia)
}
// uma única execução por vez; chamadas durante o envio pedem uma nova rodada e esperam por ela
let _pushEmAndamento = null, _pushPendente = false;
async function pushToCloud(){
  if(_pushEmAndamento){ _pushPendente = true; return _pushEmAndamento; }
  _pushEmAndamento = (async()=>{
    try{ do{ _pushPendente = false; await _pushToCloudInterno(); }while(_pushPendente); }
    finally{ _pushEmAndamento = null; }
  })();
  return _pushEmAndamento;
}
async function _pushToCloudInterno(){
  if(!sincronizacaoAtiva()) return;
  enviarImagensPendentes(); // figuras novas das edições (coleção progresso, 1 doc por figura)
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
        const refM = fbDb.collection('progresso').doc(`${STATE.syncCode}__${slugM}`);
        // lê o que outro aparelho possa ter gravado e mescla ANTES de sobrescrever
        // (se a leitura falhar, não grava: melhor tentar de novo do que apagar o outro aparelho)
        try{
          const docRemoto = await comLimiteDeTempo(refM.get(), 15000, 'tempo esgotado ao ler o progresso da matéria "'+materiaNome+'"');
          if(docRemoto.exists){
            const d = docRemoto.data();
            if(d.progress) PROGRESS[materiaNome] = mergeBucket(PROGRESS[materiaNome], JSON.parse(d.progress));
            if(d.gabaritos){ try{ if(mergeRemoteGabaritosNaMemoria(JSON.parse(d.gabaritos))) salvarGabaritosAlterados(); }catch(_){} }
            // edições NÃO são mescladas aqui: o merge só preenche campos ausentes e traria de volta o que o usuário restaurou/apagou
          }
        }catch(eLeitura){ throw eLeitura; }
        // desmarca ANTES de enviar: respostas dadas durante o envio marcam de novo e vão no próximo ciclo
        MATERIAS_PROGRESSO_SUJAS.delete(materiaNome);
        const edicoesDestaMateria2 = {};
        Object.keys(EDICOES_USUARIO).forEach(uid=>{ const q = BY_UID[uid]; if(q && q.materia===materiaNome) edicoesDestaMateria2[uid] = EDICOES_USUARIO[uid]; });
        const edicoesJson = JSON.stringify(edicoesDestaMateria2);
        const gabaritosJson = JSON.stringify(Object.fromEntries(Object.entries(GABARITOS_ALTERADOS).filter(([uid]) => BY_UID[uid] && BY_UID[uid].materia===materiaNome)));
        const prog = progressoParaNuvem(PROGRESS[materiaNome], _bytesUtf8(edicoesJson) + _bytesUtf8(gabaritosJson) + 2000);
        if(!prog){ MATERIAS_PROGRESSO_SUJAS.add(materiaNome); throw new Error('o progresso da matéria "'+materiaNome+'" é grande demais para a nuvem (limite de 1 MB por documento) — continua salvo neste dispositivo'); }
        if(prog.podado) console.warn('Progresso da matéria "'+materiaNome+'" reduzido para caber na nuvem (etapa '+prog.podado+'); o completo permanece neste aparelho.');
        try{
        await comLimiteDeTempo(refM.set(sanitizarParaFirestore(comDono({
          materia: materiaNome,
          progress: prog.json,
          edicoes: edicoesJson,
          gabaritos: gabaritosJson,
          updatedAt: Date.now(),
        }))), 15000, 'tempo esgotado ao salvar progresso da matéria "'+materiaNome+'"');
        }catch(eEnvio){ MATERIAS_PROGRESSO_SUJAS.add(materiaNome); throw eEnvio; }
      }catch(e){
        algumaFalhou = true;
        console.warn('Falha ao salvar progresso de uma matéria na nuvem — as demais continuam sendo tentadas', e);
      }
    }
    // merge:true é essencial aqui: sem isso, cada vez que o progresso é salvo
    // (a cada resposta) o documento inteiro seria sobrescrito, apagando o campo
    // quizzesEmAndamento gravado separadamente por sincronizarQuizEmAndamentoNaNuvem
    // arrayUnion: o manifesto nunca perde matéria (outro aparelho pode ter criado uma que este ainda não puxou)
    const tsManifesto = Date.now();
    const manifesto = sanitizarParaFirestore(comDono({ updatedAt: tsManifesto }));
    const chavesPROGRESS = Object.keys(PROGRESS);
    if(chavesPROGRESS.length) manifesto.materiasComProgresso = firebase.firestore.FieldValue.arrayUnion(...chavesPROGRESS);
    await comLimiteDeTempo(fbDb.collection('progresso').doc(STATE.syncCode).set(manifesto, { merge: true }), 15000, 'tempo esgotado ao salvar o manifesto de progresso');
    window.__MANIFESTO_TS = tsManifesto;
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
  }catch(e){
    // chave inexistente é normal; falha REAL de leitura liga a proteção: nada será gravado por cima do que está no aparelho
    if(e && e.falhaReal){ window.__LOAD_PROGRESS_FALHOU = true; console.error('Falha ao ler o progresso deste aparelho — gravações locais suspensas até recarregar', e); }
  }

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
    const resC = await storageGet(CARTOES_KEY);
    if(resC && resC.value) STATE.cartoes = resC.value !== '0';
  }catch(e){ /* cartões ligados por padrão */ }

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
    try{ descartarEdicoesOrfas(); }catch(_){}
  }catch(e){ /* nenhuma edição manual salva ainda */ }

  await carregarImagensLocais();

  try{
    const resGab = await storageGet(GABARITOS_ALTERADOS_KEY);
    if(resGab && resGab.value) GABARITOS_ALTERADOS = JSON.parse(resGab.value);
  }catch(e){ /* nenhum gabarito alterado salvo ainda */ }

  try{
    const resTx = await storageGet(TEXTOS_ORIGINAIS_KEY);
    if(resTx && resTx.value) TEXTOS_ORIGINAIS = JSON.parse(resTx.value) || {};
  }catch(e){ /* nenhum texto original salvo localmente ainda */ }

  await carregarHeurStats(); // js/heuristica.js — estatísticas da "dica de chute" (própria função já trata ausência)

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
      const docOc = await comLimiteDeTempo(fbDb.collection('publico').doc('_materias_ocultas').get(), 10000, 'tempo esgotado ao ler as matérias ocultas');
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
        window.__ULTIMO_SYNC_TS = parseInt(res6.value,10);
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

  // CORREÇÃO DE DADOS (não só de exibição): grava no próprio campo "ar" o ano
  // real da questão (o ano embutido no texto de Banca/Cargo — anoRealDaQuestao,
  // ver nucleo.js). Até aqui, só a EXIBIÇÃO usava anoRealDaQuestao(); o campo
  // salvo (q.ar) continuava com o valor antigo (às vezes o ano em que a
  // questão foi importada/gerada, não o ano da prova). Autoexecuta uma vez por
  // abertura: se não houver nada desatualizado (já corrigido antes, ou matéria
  // recém-importada já usa o ano certo desde o parser — ver importacao.js),
  // não faz nada e nenhum aviso aparece.
  await corrigirCamposAnoDesatualizados();
}

async function corrigirCamposAnoDesatualizados(){
  const materiasAfetadas = new Set();
  let corrigidas = 0;
  ALL_QUESTIONS.forEach(q=>{
    if(q.origem !== 'importado') return; // matérias nativas (embutidas) não têm esse campo solto
    const anoReal = anoRealDaQuestao(q);
    if(anoReal && q.ar !== anoReal){
      q.ar = anoReal;
      corrigidas++;
      materiasAfetadas.add(q.materia);
    }
  });
  if(corrigidas===0) return;
  reindex();
  await saveCustomQuestions();
  // marca as matérias afetadas como atualizadas: o ciclo de autosave de 5min
  // (ver init.js) publica a correção na nuvem respeitando a cota do Firestore,
  // do mesmo jeito que qualquer outra edição local
  materiasAfetadas.forEach(m => marcarMateriaAtualizada(m));
  const nomes = Array.from(materiasAfetadas).join(', ');
  STATE.avisoCorrecaoAno = `Campo "Ano" corrigido em ${corrigidas} questão${corrigidas===1?'':'es'} (${nomes}) — o valor salvo estava desatualizado; agora reflete o ano real da prova, já presente na própria lista (ano embutido em Banca/Cargo). A correção foi salva neste aparelho e será publicada na nuvem no próximo ciclo automático.`;
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
  // auditoria de todas as matérias: normaliza, concilia simulado × progresso e guarda o relatório
  try{ STATE.auditoria = auditarIntegridadeProgresso(true); if(STATE.auditoria.restauradas) render(); }catch(e){ console.warn('Auditoria de integridade falhou', e); }
}

let saveTimer = null;
// Salvamento do progresso: grava NESTE aparelho na hora (a cada resposta, sem
// espera) e envia pra nuvem logo em seguida — com uma espera curta só pra
// juntar respostas dadas em sequência num único envio. Ao fechar/minimizar a
// aba, salvarTudoAgoraAoSair() força o envio do que estiver pendente.
function saveProgress(){
  salvarProgressoLocal();
  clearTimeout(saveTimer);
  saveTimer = setTimeout(()=>{ pushToCloud(); }, 800);
}
async function salvarProgressoLocal(){
  // se a leitura inicial falhou e nada foi respondido ainda, não grava um estado vazio por cima do que está no aparelho
  if(window.__LOAD_PROGRESS_FALHOU){
    STATE.avisoStorage = 'Não foi possível ler o progresso deste aparelho, então não vou gravar por cima dele. Recarregue a página (Ctrl+Shift+R).';
    return;
  }
  try{
    await storageSet(STORAGE_KEY, JSON.stringify(PROGRESS));
  }catch(e){
    console.error('Falha ao salvar progresso', e);
    STATE.avisoStorage = 'Não foi possível salvar seu progresso neste dispositivo (' + (e && e.message ? e.message : 'erro desconhecido') + '). Se você atualizar a página agora, pode perder o que fez.';
    render();
  }
}
function salvarTudoAgoraAoSair(){
  clearTimeout(saveTimer);
  salvarQuizEmAndamento();
  salvarProgressoLocal();
  flushQuizSyncPendente();
  pushToCloud();
}
// situação do envio do progresso pra nuvem, mostrada ao lado do 💾 nas questões
function estadoSincronizacaoProgresso(){
  if(!sincronizacaoAtiva()) return { icone:'⚠', texto:'só neste aparelho (sem login)', classe:'err' };
  if(typeof navigator!=='undefined' && navigator.onLine===false) return { icone:'📴', texto:'sem conexão — suas respostas ficam salvas neste aparelho e sobem quando a internet voltar', classe:'err' };
  if(STATE.syncStatus && STATE.syncStatus.type==='err') return { icone:'⚠', texto:'falha ao enviar pra nuvem — tenta de novo a cada resposta', classe:'err' };
  if(MATERIAS_PROGRESSO_SUJAS.size>0 || quizSyncPendente) return { icone:'⏳', texto:'enviando pra nuvem…', classe:'pending' };
  return { icone:'☁✓', texto:'salvo na nuvem', classe:'ok' };
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
const ULTIMO_BACKUP_ARQUIVO_KEY = 'tcdf-ultimo-backup-arquivo';
function _payloadBackup(){
  return {
    formato: 'sim-progresso-backup-v1',
    exportadoEm: new Date().toISOString(),
    progress: PROGRESS,
    edicoes: EDICOES_USUARIO,
    gabaritos: GABARITOS_ALTERADOS,
    questoesImportadas: ALL_QUESTIONS.filter(q => q.origem === 'importado'),
  };
}
function _baixarJson(obj, nome){
  const blob = new Blob([JSON.stringify(obj)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = nome;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(()=>URL.revokeObjectURL(url), 1000);
}
function exportarProgresso(){
  _baixarJson(_payloadBackup(), `progresso-simulado-${new Date().toISOString().slice(0,10)}.json`);
  try{ localStorage.setItem(ULTIMO_BACKUP_ARQUIVO_KEY, String(Date.now())); }catch(_){}
  if(typeof render==='function') try{ render(); }catch(_){}
}
function diasDesdeUltimoBackupArquivo(){
  try{ const t = parseInt(localStorage.getItem(ULTIMO_BACKUP_ARQUIVO_KEY)||'0',10); return t ? Math.floor((Date.now()-t)/86400000) : null; }catch(_){ return null; }
}

/* ---- cópias automáticas no aparelho (últimos 7 dias) ----
   Uma por dia (últimos 14 dias), guardadas no próprio armazenamento do navegador. "Recuperar" MESCLA a cópia no progresso atual (nunca apaga nada). */
const SNAPSHOTS_KEY = 'tcdf-snapshots';
const SNAPSHOTS_MAX = 14;
let SNAPSHOTS = [];   // [{ ts, progress: string(JSON), edicoes, gabaritos }]
async function carregarSnapshots(){
  try{ const r = await storageGet(SNAPSHOTS_KEY); SNAPSHOTS = (r && r.value) ? JSON.parse(r.value) : []; if(!Array.isArray(SNAPSHOTS)) SNAPSHOTS = []; }
  catch(_){ SNAPSHOTS = []; }
  return SNAPSHOTS;
}

/* ---- arquivo de backup automático, uma vez por dia ----
   Na primeira abertura do dia (e a cada 6 h com o app aberto) baixa o arquivo .json do progresso, se a opção estiver ligada (padrão: ligada). */
const BACKUP_ARQ_AUTO_KEY = 'tcdf-backup-arquivo-auto';
function backupArquivoAutoLigado(){ try{ return localStorage.getItem(BACKUP_ARQ_AUTO_KEY) !== '0'; }catch(_){ return true; } }
function definirBackupArquivoAuto(ligado){ try{ localStorage.setItem(BACKUP_ARQ_AUTO_KEY, ligado ? '1' : '0'); }catch(_){} }
function backupArquivoAutomatico(){
  try{
    if(!backupArquivoAutoLigado()) return;
    if(window.__LOAD_PROGRESS_FALHOU) return;
    if(!Object.keys(PROGRESS||{}).length) return;
    const t = parseInt(localStorage.getItem(ULTIMO_BACKUP_ARQUIVO_KEY)||'0',10);
    if(t && new Date(t).toDateString() === new Date().toDateString()) return;
    exportarProgresso();
  }catch(e){ console.warn('Não foi possível gerar o backup automático em arquivo', e); }
}
async function snapshotDiario(forcar){
  try{
    if(window.__LOAD_PROGRESS_FALHOU) return;                                     // estado local não confiável: não gravar cópia por cima
    if(!Object.keys(PROGRESS||{}).length) return;                                  // nada para guardar
    if(!SNAPSHOTS.length) await carregarSnapshots();
    const ultimo = SNAPSHOTS.length ? SNAPSHOTS[SNAPSHOTS.length-1].ts : 0;
    if(!forcar && ultimo && new Date(ultimo).toDateString() === new Date().toDateString()) return;   // uma cópia por dia (dia do calendário)
    SNAPSHOTS.push({ ts: Date.now(), progress: JSON.stringify(PROGRESS), edicoes: JSON.stringify(EDICOES_USUARIO), gabaritos: JSON.stringify(GABARITOS_ALTERADOS) });
    SNAPSHOTS = SNAPSHOTS.slice(-SNAPSHOTS_MAX);
    await storageSet(SNAPSHOTS_KEY, JSON.stringify(SNAPSHOTS));
  }catch(e){ console.warn('Não foi possível guardar a cópia automática', e); }
}
async function recuperarSnapshot(ts){
  const sn = SNAPSHOTS.find(x=>x.ts===ts); if(!sn) return;
  if(!window.confirm('Recuperar a cópia de '+new Date(ts).toLocaleString('pt-BR')+'?\n\nO conteúdo dela será MESCLADO com o seu progresso atual: nada do que existe hoje é apagado.')) return;
  await snapshotDiario(true);                                                      // guarda o estado atual antes
  try{
    const prog = JSON.parse(sn.progress);
    mergeRemoteProgressoNaMemoria(prog);
    try{ if(sn.edicoes && mergeRemoteEdicoesNaMemoria(JSON.parse(sn.edicoes))) salvarEdicoesUsuario(); }catch(_){}
    try{ if(sn.gabaritos && mergeRemoteGabaritosNaMemoria(JSON.parse(sn.gabaritos))) salvarGabaritosAlterados(); }catch(_){}
    Object.keys(prog).forEach(m=>marcarProgressoSujo(m));
    saveProgress();
    STATE.importProgressoLog = { ok:true, ts:Date.now(), msg:'Cópia recuperada e mesclada.' };
  }catch(e){ STATE.importProgressoLog = { error:'Não foi possível recuperar a cópia: '+(e && e.message || e) }; }
  render();
}
function baixarSnapshot(ts){
  const sn = SNAPSHOTS.find(x=>x.ts===ts); if(!sn) return;
  _baixarJson({ formato:'sim-progresso-backup-v1', exportadoEm:new Date(ts).toISOString(), progress:JSON.parse(sn.progress), edicoes:JSON.parse(sn.edicoes||'{}'), gabaritos:JSON.parse(sn.gabaritos||'{}'), questoesImportadas:[] }, `copia-automatica-${new Date(ts).toISOString().slice(0,10)}.json`);
}

// Relatório de diagnóstico da matéria selecionada (sem enunciados): conta o que existe no progresso oficial,
// no simulado em andamento e na base de questões, para achar divergências entre grade e tabela de estatísticas.
function exportarDiagnosticoMateria(){
  const m = STATE.materia; if(!m){ alert('Selecione uma matéria na barra lateral.'); return; }
  const b = getBucket(m); const perg = b.perguntas || {};
  const conta = (arr)=> arr.reduce((o,k)=>{ o[k] = (o[k]||0)+1; return o; }, {});
  const entradas = Object.entries(perg);
  const quizzes = {}; Object.entries(STATE.quizzesEmAndamento||{}).forEach(([k,q])=>{ if(q) quizzes[k] = q; });
  if(STATE.quiz && STATE.quiz.materia) quizzes['__em_memoria__'+STATE.quiz.materia] = STATE.quiz;
  const resumoQuiz = Object.entries(quizzes).map(([k,q])=>{
    const resp = Object.entries(q.respostas||{}); const perg2 = (PROGRESS[q.materia] ? PROGRESS[q.materia].perguntas : {}) || {};
    return { chave:k, materia:q.materia, fila:(q.queue||[]).length, filaNaBase:(q.queue||[]).filter(u=>BY_UID[u]).length, respostas:resp.length,
      respostasNaBase: resp.filter(([u])=>BY_UID[u]).length,
      respostasComProgresso: resp.filter(([u])=>{ const p=perg2[u]; return p && p.tentativas>0 && (p.ultimoResultado===true||p.ultimoResultado===false); }).length,
      recuperadasDoHistorico: resp.filter(([,r])=>r&&r.recuperadaDoHistorico).length,
      tiposCorrect: conta(resp.map(([,r])=>typeof (r&&r.correct)+':'+(r&&r.correct))), ultimoSalvamento:q.ultimoSalvamento||null };
  });
  const rel = {
    versao: (window.__TCDF_BUILD__||{}).versao, geradoEm: new Date().toISOString(), materia: m,
    chavesDeProgresso: Object.keys(PROGRESS),
    questoesNaBase: ALL_QUESTIONS.filter(q=>q.materia===m).length,
    progresso: {
      entradas: entradas.length,
      naBase: entradas.filter(([u])=>BY_UID[u]).length,
      orfas: entradas.filter(([u])=>!BY_UID[u]).length,
      comTentativas: entradas.filter(([,p])=>p.tentativas>0).length,
      ultimoResultado: conta(entradas.map(([,p])=>typeof p.ultimoResultado+':'+p.ultimoResultado)),
      semHistorico: entradas.filter(([,p])=>!p.historico||!p.historico.length).length,
      exemplosOrfas: entradas.filter(([u])=>!BY_UID[u]).slice(0,5).map(([u])=>u),
    },
    snapshot: computeSnapshotMateria(m),
    quizzes: resumoQuiz,
    exemploUidsDaBase: ALL_QUESTIONS.filter(q=>q.materia===m).slice(0,5).map(q=>q.uid),
    sessoes: (b.sessoes||[]).length,
    auditoriaTodasAsMaterias: auditarIntegridadeProgresso(false),
  };
  const blob = new Blob([JSON.stringify(rel, null, 2)], { type:'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = `diagnostico-${slugify(m)}-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(()=>URL.revokeObjectURL(a.href), 1000);
}

async function importarProgresso(file){
  const reader = new FileReader();
  reader.onload = async (e) => {
    try{
      const payload = JSON.parse(e.target.result);
      if(!payload || typeof payload.progress !== 'object' || payload.progress===null || Array.isArray(payload.progress)){
        STATE.importProgressoLog = { error: 'Arquivo não reconhecido como backup de progresso válido.' };
        render();
        return;
      }
      // valida o formato ANTES de mexer em qualquer coisa (um item inválido não pode deixar o progresso pela metade)
      const perigosas = new Set(['__proto__','constructor','prototype']);
      const limpo = {};
      for(const [materia, bucket] of Object.entries(payload.progress)){
        if(perigosas.has(materia) || !bucket || typeof bucket!=='object' || Array.isArray(bucket)) continue;
        const b = { ...bucket, perguntas:{} };
        for(const [uid, p] of Object.entries(bucket.perguntas||{})){
          if(perigosas.has(uid) || !p || typeof p!=='object' || !Number.isFinite(p.tentativas)) continue;
          b.perguntas[uid] = { ...p, historico: Array.isArray(p.historico) ? p.historico.filter(h=>h && Number.isFinite(h.ts)) : [] };
        }
        limpo[materia] = b;
      }
      if(!Object.keys(limpo).length){
        STATE.importProgressoLog = { error: 'O arquivo não contém progresso de nenhuma matéria.' };
        render();
        return;
      }
      // mescla progresso usando a mesma lógica robusta da sincronização em nuvem
      // (soma tentativas por questão sem perder nada do que já existe aqui)
      mergeRemoteProgressoNaMemoria(limpo);
      Object.keys(limpo).forEach(m => marcarProgressoSujo(m));   // sem isto o importado só ia para a nuvem depois de recarregar

      // reimporta também as questões customizadas do backup, se houver, evitando duplicar uid
      mergeRemoteQuestoesNaMemoria(payload.questoesImportadas);
      // edições e gabaritos corrigidos do backup (preenchem só o que falta; nada do que existe é sobrescrito)
      try{ if(payload.edicoes && typeof payload.edicoes==='object' && mergeRemoteEdicoesNaMemoria(payload.edicoes)) salvarEdicoesUsuario(); }catch(_){}
      try{ if(payload.gabaritos && typeof payload.gabaritos==='object' && mergeRemoteGabaritosNaMemoria(payload.gabaritos)) salvarGabaritosAlterados(); }catch(_){}

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

function registrarResposta(materiaKey, uid, acertou, segundos){
  const bucket = getBucket(materiaKey);
  const p = bucket.perguntas[uid] || { tentativas:0, acertos:0, ultimoResultado:null, historico:[] };
  if(!Array.isArray(p.historico)) p.historico = [];            // entradas antigas/importadas podem vir sem histórico
  p.tentativas = (p.tentativas||0) + 1;
  p.acertos = p.acertos||0;
  if(acertou) p.acertos += 1;
  p.ultimoResultado = acertou;
  p.historico.push(typeof segundos==='number' ? { ts: Date.now(), c: acertou, t: segundos } : { ts: Date.now(), c: acertou });
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
  const _d = (bucket.desfeitos = bucket.desfeitos || {});
  const _reg = _d[uid] || (_d[uid] = { ts:0, keys:[] });
  _reg.ts = Date.now();
  if(p.historico && p.historico.length){
    const last = p.historico.pop();
    _reg.keys = _reg.keys.concat([last.ts+'-'+last.c]).slice(-20);
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

// "Chute!": marcação independente de tentativas/acertos — só registra que o
// usuário não tinha certeza da resposta (ainda que tenha acertado por sorte).
// Vive na própria aba Caderno de Erros, numa lista separada da de erros reais.
function chuteMarcado(materiaKey, uid){
  const bucket = getBucket(materiaKey);
  return !!(bucket.chutes && bucket.chutes[uid]);
}
function toggleChute(materiaKey, uid, correct){
  const bucket = getBucket(materiaKey);
  if(bucket.chutes[uid]){
    delete bucket.chutes[uid];
    (bucket.lapides = bucket.lapides || {})['c:'+uid] = Date.now();
  } else {
    bucket.chutes[uid] = { ts: Date.now(), correct: (correct===true || correct===false) ? correct : null };
  }
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
  limparQuizSalvo(materiaKey);   // sem isso o simulado em andamento ressuscitaria o progresso (reconciliarProgressoComQuiz)
  PROGRESS[materiaKey] = { perguntas:{}, flash:{}, sessoes:[], resetEm: Date.now() };   // resetEm: o merge não traz de volta o que é anterior
  marcarProgressoSujo(materiaKey);
  saveProgress();
}


// atualiza só o indicador ☁ das questões (sem re-renderizar a página)
function atualizarIndicadorNuvem(){
  const el = document.getElementById('indicador-nuvem');
  if(!el) return;
  const e = estadoSincronizacaoProgresso();
  el.textContent = e.icone;
  el.title = e.texto;
  el.className = 'indicador-nuvem ' + e.classe;
}
