/* ================= storage ================= */
const STORAGE_KEY = 'sim-progresso-v3';
const EDICOES_KEY = 'tcdf-edicoes-usuario-v1';
let EDICOES_USUARIO = {}; // { [uid]: { r: 'html editado', rf: 'html editado' } }
let TEXTOS_ORIGINAIS = {}; // { [materiaNome]: textoBrutoDoImport } — texto do último arquivo importado (só referência; não é reprocessado automaticamente)
// data/hora da última atualização de cada matéria (importação, reimportação,
// salvamento manual) — mostrada ao lado do nome na tela de gerenciamento
let MATERIA_ULTIMA_ATUALIZACAO = {}; // { [materiaNome]: timestamp }
// (item 5) registra o "atualizadoEm" mais recente que ESTE dispositivo já viu
// na nuvem pra cada matéria — permite detectar quando outro dispositivo
// publicou algo mais novo entre a última sincronização daqui e uma tentativa
// de publicar agora, o que indicaria uma sobrescrita indevida prestes a
// acontecer (ver aviso em publicarQuestoesNoFirestore)
let MATERIA_ATUALIZADOEM_NUVEM_VISTO = {};
// (item 5) alertas de sobrescrita detectada — ver publicarQuestoesNoFirestore
let ALERTAS_SOBRESCRITA_NUVEM = [];
// Trava de escrita: enquanto houver alguma escrita local em andamento
// (importar, deduplicar, renomear, remover, salvar), a leitura periódica da
// nuvem não roda — senão ela substituiria o local por uma versão ainda não
// atualizada, e a publicação seguinte mandaria essa versão velha de volta.
// Contador (não booleano) pra suportar chamadas aninhadas. Ver
// comTravaDeEscrita() e sincronizarMateriasPublicas().
let TRAVAS_ESCRITA_ATIVAS = 0;
async function comTravaDeEscrita(fn){
  TRAVAS_ESCRITA_ATIVAS++;
  try{ return await fn(); }
  finally{ TRAVAS_ESCRITA_ATIVAS--; }
}
const MATERIA_ULTIMA_ATUALIZACAO_KEY = 'tcdf-materia-ultima-atualizacao-v1';
let salvarUltimaAtualizacaoTimer = null;
// Matérias com mudança local ainda não publicada na nuvem. Enquanto estiverem
// aqui, a leitura da nuvem não substitui o conteúdo local delas (senão uma
// publicação que falhou — cota, rede — seria desfeita na próxima abertura), e
// o salvamento automático tenta publicar de novo. Sai daqui só quando a
// publicação dá certo (ver publicarQuestoesNoFirestore).
const PUBLICACAO_PENDENTE_KEY = 'tcdf-publicacao-pendente-v1';
let PUBLICACAO_PENDENTE = new Set();
function salvarPublicacaoPendente(){
  storageSet(PUBLICACAO_PENDENTE_KEY, JSON.stringify(Array.from(PUBLICACAO_PENDENTE))).catch(e=>console.error('Falha ao salvar publicações pendentes', e));
}
function marcarPublicacaoPendente(materiaNome, pendente){
  const tinha = PUBLICACAO_PENDENTE.has(materiaNome);
  if(pendente) PUBLICACAO_PENDENTE.add(materiaNome); else PUBLICACAO_PENDENTE.delete(materiaNome);
  if(tinha!==!!pendente) salvarPublicacaoPendente();
}
// opcoes.publicada: a chamada vem logo depois de uma publicação que deu
// certo — só atualiza a data, sem marcar como pendente
function marcarMateriaAtualizada(materiaNome, opcoes){
  if(!(opcoes && opcoes.publicada)) marcarPublicacaoPendente(materiaNome, true);
  MATERIA_ULTIMA_ATUALIZACAO[materiaNome] = Date.now();
  clearTimeout(salvarUltimaAtualizacaoTimer);
  salvarUltimaAtualizacaoTimer = setTimeout(()=>{
    storageSet(MATERIA_ULTIMA_ATUALIZACAO_KEY, JSON.stringify(MATERIA_ULTIMA_ATUALIZACAO)).catch(e=>console.error('Falha ao salvar data de atualização das matérias', e));
  }, 300);
}
// Texto original de cada importação, também salvo localmente (IndexedDB): na
// nuvem ele só cabe em matérias pequenas (ver publicarQuestoesNoFirestore).
const TEXTOS_ORIGINAIS_KEY = 'tcdf-textos-originais-v1';
let salvarTextosOriginaisTimer = null;
function salvarTextosOriginaisLocalmente(){
  clearTimeout(salvarTextosOriginaisTimer);
  salvarTextosOriginaisTimer = setTimeout(()=>{
    storageSet(TEXTOS_ORIGINAIS_KEY, JSON.stringify(TEXTOS_ORIGINAIS)).catch(e=>console.error('Falha ao salvar textos originais localmente', e));
  }, 300);
}
const MATERIAS_OCULTAS_KEY = 'tcdf-materias-ocultas-v1';
let MATERIAS_REMOVIDAS_NUVEM = new Set(); // nomes de matéria marcados como removido:true em publico/{slug} — usado pra filtrar QUALQUER cópia local desatualizada (armazenamento local, outra sessão) que ainda tenha essa matéria salva
let MATERIAS_VALIDAS_NUVEM = new Set(); // nomes de matéria que TÊM doc válido e não-removido em publico/{slug} — a nuvem é a fonte da verdade pra saber quais matérias importadas devem existir
let SLUGS_VALIDOS_NUVEM = new Set(); // ids de documento (slugs) com conteúdo válido — segunda camada de checagem, independente do campo "materia" de cada questão
let SLUGS_REMOVIDOS_NUVEM = new Set();
function materiaRemovidaNaNuvem(materiaNome){
  return MATERIAS_REMOVIDAS_NUVEM.has(materiaNome) || SLUGS_REMOVIDOS_NUVEM.has(slugify(materiaNome));
}
let MATERIAS_OCULTAS = new Set(); // matérias NATIVAS (embutidas no código) que o usuário removeu — como elas
  // não vivem no Firestore nem no localStorage de questões, o único jeito de "remover de vez" uma matéria
  // embutida é guardar o nome dela aqui e filtrar toda vez que a base nativa for recriada no carregamento
let TEMPO_QUESTAO = { uid:null, ts:0 }; // início da questão exibida (para o tempo por armadilha)
let edicaoAtual = null; // uid da questão em modo de edição agora (todos os campos — enunciado, resolução, resumo flash — ficam editáveis juntos)
let chuteArmado = null; // uid da questão com o botão "Chute" armado, aguardando o clique na resposta de verdade
let dicaChuteAberta = null; // uid da questão com o painel "Dica de chute" (js/heuristica.js) aberto agora
let saveEdicoesTimer = null;
function salvarEdicoesUsuario(){
  clearTimeout(saveEdicoesTimer);
  saveEdicoesTimer = setTimeout(async ()=>{
    try{ await storageSet(EDICOES_KEY, JSON.stringify(EDICOES_USUARIO)); }
    catch(e){ console.error('Falha ao salvar edições do usuário', e); }
  }, 300);
}
// Gabaritos corrigidos manualmente pelo usuário, com justificativa — pra
// casos em que a banca publica gabarito definitivo diferente do preliminar,
// ou quando o gabarito extraído do PDF/import está simplesmente errado.
// { [uid]: { novo:'Certo'|'A'..., motivo:'texto', original:'Errado', ts } }
// Não corrige retroativamente tentativas já registradas (não guardamos qual
// alternativa foi escolhida em tentativas antigas, só se foi certo/errado
// contra o gabarito da época) — vale a partir de agora, pra próximas respostas.
const GABARITOS_ALTERADOS_KEY = 'tcdf-gabaritos-alterados-v1';
let GABARITOS_ALTERADOS = {};
let salvarGabaritosAlteradosTimer = null;
// entrada removida vira "lápide" ({removido:true, ts}) para a remoção também sincronizar com a nuvem
function gabAtivo(uid){ const g = GABARITOS_ALTERADOS[uid]; return g && !g.removido ? g : null; }
function salvarGabaritosAlterados(uid){
  // sincroniza com o Firebase (a cópia do navegador é só cache): marca a matéria da questão e envia
  try{ const q = uid && BY_UID[uid]; if(q && typeof marcarProgressoSujo==='function'){ marcarProgressoSujo(q.materia); if(typeof pushToCloud==='function') pushToCloud(); } }catch(_){}
  clearTimeout(salvarGabaritosAlteradosTimer);
  salvarGabaritosAlteradosTimer = setTimeout(async ()=>{
    try{ await storageSet(GABARITOS_ALTERADOS_KEY, JSON.stringify(GABARITOS_ALTERADOS)); }
    catch(e){ console.error('Falha ao salvar gabaritos alterados', e); }
  }, 300);
}
function gabaritoEfetivo(q){
  const alt = gabAtivo(q.uid);
  if(alt) return alt.novo;
  const al = q.t==='CE' ? gabaritoPorNormaAlterada(q) : null;   // norma alterada confirmada: o item com a redação antiga vira Errado
  return al ? al.gabaritoNovo : q.g;
}
const _GAB_NORMA_CACHE = {};
function gabaritoPorNormaAlterada(q){
  if(typeof alteracaoComTrecho!=='function') return null;
  const k = q.uid+'|'+q.g; if(k in _GAB_NORMA_CACHE) return _GAB_NORMA_CACHE[k];
  let r = null; try{ const a = alteracaoComTrecho(q); if(a && a.gabaritoNovo && a.gabaritoNovo!==q.g) r = a; }catch(_){}
  return (_GAB_NORMA_CACHE[k] = r);
}
/* botão "Revisado": o moderador confirma a virada automática; vira gabarito definitivo (homologado) */
function homologarGabarito(uid){
  const q = BY_UID[uid]; const al = q && gabaritoAguardaConfirmacao(q); if(!al) return;
  if(!window.confirm(`Confirmar o gabarito definitivo desta questão como ${al.gabaritoNovo.toUpperCase()}?\n\n${al.titulo}`)) return;
  GABARITOS_ALTERADOS[uid] = { novo: al.gabaritoNovo, motivo: 'Norma alterada: '+al.titulo, original: q.g, ts: Date.now(), homologado:true };
  salvarGabaritosAlterados(uid); render();
}
function alterarGabarito(uid){
  const q = BY_UID[uid];
  if(!q) return;
  const atual = gabaritoEfetivo(q);
  const opcoesValidas = q.t==='CE' ? ['Certo','Errado'] : (q.alt||[]).map(a=>a.letra.toUpperCase());
  const novo = window.prompt(`Novo gabarito para esta questão (atual: ${atual}).\nOpções válidas: ${opcoesValidas.join(', ')}`, atual);
  if(novo===null) return;
  const novoLimpo = q.t==='CE' ? (novo.trim().toLowerCase().startsWith('c') ? 'Certo' : 'Errado') : novo.trim().toUpperCase();
  if(!opcoesValidas.includes(novoLimpo)){
    window.alert('Gabarito inválido. Use uma destas opções: ' + opcoesValidas.join(', '));
    return;
  }
  if(novoLimpo===q.g){
    GABARITOS_ALTERADOS[uid] = { removido:true, ts: Date.now() };
  } else {
    const motivo = window.prompt('Justificativa da mudança (ex.: "Gabarito definitivo da banca divergiu do preliminar", "Erro de extração do PDF"):', (gabAtivo(uid)&&GABARITOS_ALTERADOS[uid].motivo)||'');
    if(motivo===null) return;
    GABARITOS_ALTERADOS[uid] = { novo: novoLimpo, motivo: motivo.trim(), original: q.g, ts: Date.now() };
  }
  salvarGabaritosAlterados(uid);
  render();
}
const CUSTOM_KEY = 'sim-questoes-importadas-v3';
let PROGRESS = {}; // { [materia]: { perguntas:{}, flash:{}, sessoes:[] } }
// Matérias com progresso alterado desde o último envio bem-sucedido —
// pushToCloud() só reenvia essas (a cota diária do Firestore é limitada).
let MATERIAS_PROGRESSO_SUJAS = new Set();
function marcarProgressoSujo(materiaKey){ MATERIAS_PROGRESSO_SUJAS.add(materiaKey); }

// Camada de armazenamento: usa window.storage (Claude.ai artifact) quando disponível;
// se o arquivo for aberto fora do Claude.ai (ex.: baixado e aberto direto no navegador,
// ou publicado no GitHub Pages), cai automaticamente pra IndexedDB.
const CLAUDE_STORAGE_OK = (typeof window !== 'undefined') && window.storage && typeof window.storage.get === 'function' && typeof window.storage.set === 'function';
let STORAGE_MODE = CLAUDE_STORAGE_OK ? 'claude' : 'local';

// Modo 'local' usa IndexedDB: o localStorage tem cota de ~5-10MB por origem,
// compartilhada entre todas as chaves, e estourava com muitas matérias.
// A migração é automática e não destrutiva: um valor que só exista no
// localStorage (versões antigas) é lido e copiado pro IndexedDB, sem apagar o
// original.
const IDB_NAME = 'tcdf-plataforma-db';
const IDB_STORE = 'kv';
let idbPromise = null;
function idbOpen(){
  if(idbPromise) return idbPromise;
  idbPromise = new Promise((resolve, reject)=>{
    if(typeof indexedDB === 'undefined'){ reject(new Error('IndexedDB indisponível neste navegador')); return; }
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = ()=>{ req.result.createObjectStore(IDB_STORE); };
    req.onsuccess = ()=> resolve(req.result);
    req.onerror = ()=> reject(req.error);
  });
  return idbPromise;
}
function idbGet(key){
  return idbOpen().then(db => new Promise((resolve, reject)=>{
    const tx = db.transaction(IDB_STORE, 'readonly');
    const req = tx.objectStore(IDB_STORE).get(key);
    req.onsuccess = ()=> resolve(req.result); // undefined se a chave não existir
    req.onerror = ()=> reject(req.error);
  }));
}
function idbSet(key, value){
  return idbOpen().then(db => new Promise((resolve, reject)=>{
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(value, key);
    tx.oncomplete = ()=> resolve();
    tx.onerror = ()=> reject(tx.error);
  }));
}

async function storageGet(key){
  if(STORAGE_MODE === 'claude'){
    // erros aqui são esperados (ex.: chave ainda não existe) e não indicam indisponibilidade da API;
    // portanto não alternamos de modo por causa de um storageGet — só storageSet decide isso.
    return await window.storage.get(key, false);
  }
  try{
    const v = await idbGet(key);
    if(v !== undefined) return { key, value: v };
  }catch(e){ /* IndexedDB indisponível nesta sessão — segue pro fallback de localStorage abaixo */ }
  // ainda não migrado pro IndexedDB (ou IndexedDB indisponível): tenta localStorage;
  // se achar, migra silenciosamente pro IndexedDB pra não estourar cota de novo depois
  const vLocal = window.localStorage.getItem(key);
  if(vLocal === null){ const err = new Error('not found'); throw err; }
  idbSet(key, vLocal).catch(()=>{});
  return { key, value: vLocal };
}
async function storageSet(key, value){
  if(STORAGE_MODE === 'claude'){
    try{
      return await window.storage.set(key, value, false);
    }catch(e){
      console.warn('window.storage indisponível, alternando para IndexedDB/localStorage neste navegador.', e);
      STORAGE_MODE = 'local';
    }
  }
  try{
    await idbSet(key, value);
    return { key, value };
  }catch(e){
    // último recurso, só se o próprio IndexedDB estiver indisponível/bloqueado
    // (ex.: alguns modos de navegação privada mais antigos) — nesse caso volta
    // a valer a cota pequena de localStorage, mas pelo menos não quebra tudo
    window.localStorage.setItem(key, value);
    return { key, value };
  }
}

// resultado de uma tentativa: aceita true/false e também 1/0 ou "true"/"false" (progresso importado
// ou sincronizado de versões antigas); qualquer outro valor = sem resultado
function resultadoNormalizado(v){
  if(v===true || v===1 || v==='1' || v==='true') return true;
  if(v===false || v===0 || v==='0' || v==='false') return false;
  return null;
}
// garante que ultimoResultado e historico[].c sejam booleanos: as contagens (cabeçalho, tabela de
// estatísticas, grade, caderno de erros) comparam com === e ignoravam as questões gravadas como 1/0
function normalizarBucketProgresso(b){
  if(!b || b.__norm) return b;
  Object.values(b.perguntas||{}).forEach(p=>{
    if(!p) return;
    (p.historico||[]).forEach(h=>{ if(h){ const n = resultadoNormalizado(h.c); if(n!==null) h.c = n; } });
    let r = resultadoNormalizado(p.ultimoResultado);
    if(r===null && p.historico && p.historico.length) r = resultadoNormalizado(p.historico[p.historico.length-1].c);
    p.ultimoResultado = r;
  });
  Object.defineProperty(b,'__norm',{ value:true, enumerable:false, configurable:true });
  return b;
}
function getBucket(materiaKey){
  if(!PROGRESS[materiaKey]) PROGRESS[materiaKey] = { perguntas:{}, flash:{}, sessoes:[], simuladosSalvos:[], chutes:{} };
  normalizarBucketProgresso(PROGRESS[materiaKey]);
  if(!PROGRESS[materiaKey].simuladosSalvos) PROGRESS[materiaKey].simuladosSalvos = [];
  // "chutes": histórico independente de questões marcadas como "eu chutei essa"
  // — não mexe em tentativas/acertos, só registra a marcação (item novo; bucket
  // de matéria antiga carregado do storage não tem esse campo ainda)
  if(!PROGRESS[materiaKey].chutes) PROGRESS[materiaKey].chutes = {};
  return PROGRESS[materiaKey];
}

// AUTOCURA de quiz.respostas a partir do histórico persistido (bucket.perguntas).
// quiz.respostas só guarda as respostas dadas NESTA sessão/objeto de simulado;
// bucket.perguntas é o histórico oficial e duradouro (usado em
// computeSnapshotMateria, que gera os números "Total Respondidas" no topo).
// Sem isso, uma questão já respondida (contando no total oficial) pode voltar
// a aparecer "em branco" — botões de novo, célula branca no grid — sempre que
// o objeto de quiz não carregou aquela resposta específica: ao reordenar a
// fila ("Configurar simulado"), ao retomar um simulado antigo, ou depois de um
// merge de outro aparelho. Chamar isto antes de usar quiz.respostas garante
// que a marcação nunca se perde, qualquer que seja a ordem da fila.
// Retorna true se recuperou alguma resposta (quem chama decide se salva).
// AUDITORIA DE INTEGRIDADE de todas as matérias: normaliza o progresso, concilia o simulado em andamento com o
// progresso oficial e devolve um relatório por matéria. Roda no boot (depois de carregar os simulados salvos) e no diagnóstico.
function auditarIntegridadeProgresso(corrigir){
  const nomes = new Set(Object.keys(PROGRESS||{}));
  (typeof ALL_QUESTIONS!=='undefined' ? ALL_QUESTIONS : []).forEach(q=>nomes.add(q.materia));
  Object.values(STATE.quizzesEmAndamento||{}).forEach(q=>{ if(q && q.materia) nomes.add(q.materia); });
  const linhas = []; let restauradas = 0;
  nomes.forEach(m=>{
    if(!m || m==='undefined') return;
    const temBase = ALL_QUESTIONS.some(q=>q.materia===m);
    const quiz = (STATE.quizzesEmAndamento||{})[m] || null;
    const b = PROGRESS[m] ? getBucket(m) : null;
    const perg = b ? Object.entries(b.perguntas||{}) : [];
    const resp = quiz && quiz.respostas ? Object.entries(quiz.respostas) : [];
    const semProgresso = resp.filter(([u,r])=>{ if(!r || !BY_UID[u]) return false; const p = b && b.perguntas[u]; return !(p && p.tentativas>0 && (p.ultimoResultado===true||p.ultimoResultado===false)); }).length;
    let rest = 0;
    if(corrigir && quiz && temBase){ try{ rest = reconciliarProgressoComQuiz(quiz, m); }catch(_){} restauradas += rest; }
    const b2 = PROGRESS[m] ? getBucket(m) : null;
    const perg2 = b2 ? Object.entries(b2.perguntas||{}) : [];
    linhas.push({ materia:m, naBase:temBase, questoes:ALL_QUESTIONS.filter(q=>q.materia===m).length,
      progresso:perg2.length, orfas:perg2.filter(([u])=>!BY_UID[u]).length,
      certas:perg2.filter(([u,p])=>BY_UID[u]&&p.ultimoResultado===true).length, erradas:perg2.filter(([u,p])=>BY_UID[u]&&p.ultimoResultado===false).length,
      simulado: quiz ? { fila:(quiz.queue||[]).length, filaForaDaBase:(quiz.queue||[]).filter(u=>!BY_UID[u]).length, respostas:resp.length, respostasSemProgresso:semProgresso, restauradas:rest } : null });
  });
  return { quando: Date.now(), restauradas, materias: linhas };
}

// CURA INVERSA: respostas que existem no simulado em andamento (quiz.respostas, as que colorem a grade)
// mas não estão no progresso oficial (bucket.perguntas, que alimenta a tabela de estatísticas, o caderno
// de erros e o "Total respondidas"). Acontece quando o progresso é substituído/importado/sincronizado
// por uma cópia sem essas questões. Registra a tentativa que falta; nunca sobrescreve progresso existente.
// (Confirmado em diagnóstico real: respostas marcadas recuperadaDoHistorico no simulado salvo, mas sem entrada no progresso.)
const _quizReconciliados = new WeakSet();
function reconciliarProgressoComQuiz(quiz, materiaKey){
  if(!quiz || !quiz.respostas) return 0;
  const materia = materiaKey || quiz.materia; if(!materia) return 0;
  if(_quizReconciliados.has(quiz) && !quiz.__resp_mudou) return 0;
  const bucket = getBucket(materia); let n = 0;
  const base = quiz.ultimoSalvamento || quiz.startedAt || Date.now();
  Object.entries(quiz.respostas).forEach(([uid, r])=>{
    if(!r || !BY_UID[uid]) return;   // inclui as 'recuperadaDoHistorico': elas vieram de um progresso que depois foi perdido/substituído
    const c = resultadoNormalizado(r.correct); if(c===null) return;
    const p = bucket.perguntas[uid];
    if(p && p.tentativas>0 && resultadoNormalizado(p.ultimoResultado)!==null) return;   // já está no progresso
    const novo = p || { tentativas:0, acertos:0, ultimoResultado:null, historico:[] };
    novo.tentativas = (novo.tentativas||0) + 1; if(c) novo.acertos = (novo.acertos||0) + 1;
    novo.ultimoResultado = c; novo.historico = (novo.historico||[]).concat([{ ts: r.ts || base, c }]).slice(-20);
    bucket.perguntas[uid] = novo; n++;
  });
  _quizReconciliados.add(quiz);
  if(n){ try{ if(typeof marcarProgressoSujo==='function') marcarProgressoSujo(materia); if(typeof saveProgress==='function') saveProgress(); }catch(_){} }
  return n;
}

function curarRespostasDoHistorico(quiz){
  if(!quiz || !quiz.materia) return false;
  const bucket = getBucket(quiz.materia);
  let curouAlgo = false;
  (quiz.queue||[]).forEach(u => {
    if(quiz.respostas[u]) return;
    const hist = bucket.perguntas[u];
    if(!hist || !hist.tentativas || hist.ultimoResultado==null) return;
    const q = typeof BY_UID !== 'undefined' ? BY_UID[u] : null;
    if(!q) return;
    const gEf = gabaritoEfetivo(q);
    let picked = null;
    if(hist.ultimoResultado){
      picked = gEf; // acertou: só pode ter marcado o próprio gabarito
    } else if(q.t==='CE'){
      picked = gEf==='Certo' ? 'Errado' : 'Certo'; // C/E é binário: errou = marcou o outro
    }
    // em MC errada não dá pra saber COM CERTEZA qual alternativa foi marcada
    // (só que não foi a correta) — picked fica null; a questão ainda é
    // mostrada revelada e contada corretamente, só sem destacar qual
    // alternativa específica foi a escolhida
    quiz.respostas[u] = { picked, correct: hist.ultimoResultado, recuperadaDoHistorico: true };
    curouAlgo = true;
  });
  return curouAlgo;
}

