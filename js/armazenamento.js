/* ================= storage ================= */
const STORAGE_KEY = 'sim-progresso-v3';
const EDICOES_KEY = 'tcdf-edicoes-usuario-v1';
let EDICOES_USUARIO = {}; // { [uid]: { r: 'html editado', rf: 'html editado' } }
let TEXTOS_ORIGINAIS = {}; // { [materiaNome]: textoBrutoDoImport } — permite reprocessar com o parser atual sem precisar reimportar manualmente
// data/hora da última atualização de cada matéria (importação, reimportação, ou
// salvamento manual) — só informativo pro usuário, mostrado ao lado do nome da
// matéria na tela de gerenciamento (pedido explícito: "indique ao lado de cada
// matéria o dia e a hora da última atualização")
let MATERIA_ULTIMA_ATUALIZACAO = {}; // { [materiaNome]: timestamp }
// (item 5) registra o "atualizadoEm" mais recente que ESTE dispositivo já viu
// na nuvem pra cada matéria — permite detectar quando outro dispositivo
// publicou algo mais novo entre a última sincronização daqui e uma tentativa
// de publicar agora, o que indicaria uma sobrescrita indevida prestes a
// acontecer (ver aviso em publicarQuestoesNoFirestore)
let MATERIA_ATUALIZADOEM_NUVEM_VISTO = {};
// (item 5) alertas de sobrescrita detectada — ver publicarQuestoesNoFirestore
let ALERTAS_SOBRESCRITA_NUVEM = [];
// CORREÇÃO (v73): existiam dois setInterval de 5 minutos rodando sem nenhuma
// sincronia entre si — um publicando mudanças locais na nuvem, outro puxando
// da nuvem e SUBSTITUINDO o local por inteiro (ver carregarMateriasPublicas,
// v57). Se o segundo disparasse bem no meio do primeiro (ou de qualquer
// operação manual que mexe em dados locais e depois publica — deduplicar,
// importar, renomear, remover, salvar), ele lia uma versão da nuvem ainda não
// atualizada e revertia a limpeza local silenciosamente; a publicação que
// viesse em seguida então mandava essa versão revertida (suja) de volta pra
// nuvem, permanentemente. Relatado em produção: duplicatas removidas
// reaparecendo, matérias voltando mesmo depois de removidas — os horários
// batiam exatamente com o intervalo de 5 minutos. Esta trava (um contador, não
// um booleano, pra suportar chamadas aninhadas sem destravar cedo demais)
// impede a leitura da nuvem de rodar enquanto qualquer escrita estiver em
// andamento — ver comTravaDeEscrita() e sincronizarMateriasPublicas().
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
// CORREÇÃO (v37): antes, isso só existia em memória (se populado nesta sessão) ou
// vindo da nuvem (campo textoOriginal do documento publico/{slug}). Matérias
// grandes (ver publicarQuestoesNoFirestore) não cabem mais inteiras na nuvem, então
// agora também é salvo localmente — IndexedDB não tem o teto de tamanho que o
// Firestore tem, então isso continua funcionando mesmo pra matérias enormes,
// pelo menos neste aparelho (outros dispositivos ainda dependem da nuvem, que só
// tem o texto de matérias pequenas o suficiente pra caber).
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
// CORREÇÃO DEFINITIVA DE COTA (v49): pushToCloud() reescrevia TODAS as
// matérias no Firestore a cada chamada — mesmo que só UMA tivesse mudado — e
// era chamada a cada resposta E a cada 60s (setInterval), sempre, mesmo sem
// nada ter mudado. Com ~20 matérias, isso era ~20 escritas por resposta e ~20
// escritas por minuto ocioso, o que sozinho estourava a cota diária gratuita
// do Firestore repetidamente (erro real de produção, recorrente). Agora só a(s)
// matéria(s) que de fato mudaram desde a última sincronização bem-sucedida são
// reenviadas — as demais não são tocadas — e nada é enviado se nada mudou.
let MATERIAS_PROGRESSO_SUJAS = new Set();
function marcarProgressoSujo(materiaKey){ MATERIAS_PROGRESSO_SUJAS.add(materiaKey); }

// Camada de armazenamento: usa window.storage (Claude.ai artifact) quando disponível;
// se o arquivo for aberto fora do Claude.ai (ex.: baixado e aberto direto no navegador,
// ou publicado no GitHub Pages), cai automaticamente pra IndexedDB.
const CLAUDE_STORAGE_OK = (typeof window !== 'undefined') && window.storage && typeof window.storage.get === 'function' && typeof window.storage.set === 'function';
let STORAGE_MODE = CLAUDE_STORAGE_OK ? 'claude' : 'local';

// CORREÇÃO CRÍTICA (v37): o modo 'local' usava localStorage.setItem/getItem
// diretamente. localStorage tem uma cota rígida de ~5-10MB por origem,
// COMPARTILHADA entre todas as chaves do site inteiro. Com 19+ matérias
// importadas (cada uma com dezenas/centenas de questões, cada questão com
// enunciado+resolução+resumo em texto longo), essa cota estourava de verdade —
// confirmado em produção pelo erro "Failed to execute 'setItem' on 'Storage':
// Setting the value of 'sim-questoes-importadas-v3' exceeded the quota.". Quando
// isso acontece, o storageSet falha SILENCIOSAMENTE (sem o banner de aviso da
// v36, ninguém percebia) e a última lista importada nunca chega a ser salva —
// some ao atualizar a página. Como localStorage e o progresso (sim-progresso-v3)
// dividem a MESMA cota da mesma origem, uma vez perto do teto qualquer uma das
// duas chaves pode falhar ao salvar, o que também explica perda de estatísticas.
// IndexedDB não tem esse teto baixo (na prática, dezenas/centenas de MB — uma
// fração do espaço livre em disco), então agora é a camada usada por padrão no
// modo 'local'. A migração é automática e NUNCA destrutiva: dado já existente no
// localStorage (de uma versão anterior do site) é lido normalmente na primeira
// vez e copiado pro IndexedDB — o localStorage original não é apagado.
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

