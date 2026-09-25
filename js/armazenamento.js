/* ================= storage ================= */
const STORAGE_KEY = 'sim-progresso-v3';
const EDICOES_KEY = 'tcdf-edicoes-usuario-v1';
let EDICOES_USUARIO = {}; // { [uid]: { r: 'html editado', rf: 'html editado' } }
let TEXTOS_ORIGINAIS = {}; // { [materiaNome]: textoBrutoDoImport } — permite reprocessar com o parser atual sem precisar reimportar manualmente
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
function marcarMateriaAtualizada(materiaNome){
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
let edicaoAtual = null; // uid da questão em modo de edição agora (todos os campos — enunciado, resolução, resumo flash — ficam editáveis juntos)
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
function salvarGabaritosAlterados(){
  clearTimeout(salvarGabaritosAlteradosTimer);
  salvarGabaritosAlteradosTimer = setTimeout(async ()=>{
    try{ await storageSet(GABARITOS_ALTERADOS_KEY, JSON.stringify(GABARITOS_ALTERADOS)); }
    catch(e){ console.error('Falha ao salvar gabaritos alterados', e); }
  }, 300);
}
function gabaritoEfetivo(q){
  const alt = GABARITOS_ALTERADOS[q.uid];
  return alt ? alt.novo : q.g;
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
    delete GABARITOS_ALTERADOS[uid];
  } else {
    const motivo = window.prompt('Justificativa da mudança (ex.: "Gabarito definitivo da banca divergiu do preliminar", "Erro de extração do PDF"):', (GABARITOS_ALTERADOS[uid]&&GABARITOS_ALTERADOS[uid].motivo)||'');
    if(motivo===null) return;
    GABARITOS_ALTERADOS[uid] = { novo: novoLimpo, motivo: motivo.trim(), original: q.g, ts: Date.now() };
  }
  salvarGabaritosAlterados();
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

function getBucket(materiaKey){
  if(!PROGRESS[materiaKey]) PROGRESS[materiaKey] = { perguntas:{}, flash:{}, sessoes:[], simuladosSalvos:[] };
  if(!PROGRESS[materiaKey].simuladosSalvos) PROGRESS[materiaKey].simuladosSalvos = [];
  return PROGRESS[materiaKey];
}

