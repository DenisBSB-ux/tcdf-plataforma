/* ================= init ================= */
// redesenho automático (timers) só quando não atrapalha: nada em edição e nenhum campo com o foco
function podeRenderizarAgora(){
  try{
    if(typeof edicaoAtual!=='undefined' && edicaoAtual) return false;
    const a = document.activeElement;
    if(a && (a.isContentEditable || /^(input|textarea|select)$/i.test(a.tagName)) && a !== document.body) return false;
  }catch(_){}
  return true;
}
// acessibilidade: chips e linhas clicáveis (span/div) viram botões alcançáveis pelo teclado (Tab, Enter, Espaço)
(function tornarClicaveisAcessiveis(){
  const SEL = 'span.chip, [data-macro-materia]';
  function marcar(){
    try{ document.querySelectorAll(SEL).forEach(el=>{
      if(el.tagName==='BUTTON' || el.tagName==='A' || el.hasAttribute('tabindex')) return;
      el.setAttribute('tabindex','0'); if(!el.getAttribute('role')) el.setAttribute('role','button');
    }); }catch(_){}
  }
  const orig = render;
  render = function(){ const r = orig.apply(this, arguments); marcar(); return r; };
  document.addEventListener('keydown', e=>{
    if(e.key!=='Enter' && e.key!==' ') return;
    const el = e.target && e.target.closest && e.target.closest(SEL);
    if(!el || el!==e.target || el.tagName==='BUTTON') return;
    e.preventDefault(); el.click();
  });
})();
// modo offline: service worker (rede primeiro, cache como reserva). Só em https/localhost.
try{
  if('serviceWorker' in navigator && (location.protocol==='https:' || location.hostname==='localhost' || location.hostname==='127.0.0.1')){
    window.addEventListener('load', ()=>{
      navigator.serviceWorker.register('sw.js').then(()=>navigator.serviceWorker.ready).then(reg=>{
        // depois de a tela abrir, pede ao service worker para guardar o que a página usa e os arquivos de carga sob demanda
        setTimeout(()=>{
          try{
            const v = ((window.__TCDF_BUILD__||{}).versao||'');
            const q = v ? '?v='+v : '';
            const usados = performance.getEntriesByType('resource').map(r=>r.name);
            const lazy = [];
            try{ Object.values(LEI_FONTES).forEach(f=>{ if(f.arquivo) lazy.push(f.arquivo+q); }); }catch(_){}
            lazy.push('manifest.webmanifest','img/icon-192.png','img/icon-512.png');
            ['doutrina-ps','doutrina-pdpm','doutrina-df','doutrina-dadm','doutrina-cst','doutrina-adm','teoria-dt','armadilhas-dados'].forEach(n=>lazy.push('js/'+n+'.js'+q));
            const alvo = reg.active || navigator.serviceWorker.controller;
            if(alvo) alvo.postMessage({ tipo:'precache', urls: [location.href].concat(usados, lazy) });
          }catch(_){}
        }, 8000);
      }).catch(e=>console.warn('Modo offline indisponível', e));
    });
  }
}catch(_){}
/* ---- app instalável (PWA) e atualização ---- */
window.addEventListener('beforeinstallprompt', e=>{ e.preventDefault(); window.__PROMPT_INSTALAR = e; try{ if(APP_INICIADO) render(); }catch(_){} });
window.addEventListener('appinstalled', ()=>{ window.__PROMPT_INSTALAR = null; try{ render(); }catch(_){} });
function appInstalado(){ return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true; }
function ehIOS(){ return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream; }
async function instalarApp(){
  const ev = window.__PROMPT_INSTALAR; if(!ev) return;
  ev.prompt(); try{ await ev.userChoice; }catch(_){} window.__PROMPT_INSTALAR = null; try{ render(); }catch(_){}
}
// aviso "Nova versão disponível": compara a versão do index.html no servidor com a que está em uso (a cada 5 min e ao voltar para o app)
let _avisoVersaoMostrado = false;
async function verificarNovaVersao(){
  if(_avisoVersaoMostrado || (typeof navigator!=='undefined' && navigator.onLine===false)) return;
  try{
    const r = await fetch('index.html?_=' + Date.now(), { cache:'no-store' }); if(!r.ok) return;
    const m = (await r.text()).match(/versao:\s*'(v\d+)'/); if(!m) return;
    const atual = (window.__TCDF_BUILD__||{}).versao;
    if(m[1] && atual && m[1] !== atual){
      _avisoVersaoMostrado = true;
      const d = document.createElement('div'); d.id = 'aviso-nova-versao'; d.setAttribute('role','status');
      d.innerHTML = '🆕 Nova versão disponível (' + m[1] + '). <button type="button" id="btn-atualizar-app">Atualizar agora</button> <button type="button" id="btn-adiar-app" aria-label="Fechar aviso">✕</button>';
      document.body.appendChild(d);
      d.querySelector('#btn-atualizar-app').addEventListener('click', ()=>{
        try{ salvarTudoAgoraAoSair(); }catch(_){}
        setTimeout(()=>{ location.reload(); }, 300);
      });
      d.querySelector('#btn-adiar-app').addEventListener('click', ()=>{ d.remove(); setTimeout(()=>{ _avisoVersaoMostrado = false; }, 30*60000); });
    }
  }catch(_){}
}
setInterval(verificarNovaVersao, 5*60000);
document.addEventListener('visibilitychange', ()=>{ if(document.visibilityState==='visible') verificarNovaVersao(); });
setTimeout(verificarNovaVersao, 20000);
(async function init(){
  root.innerHTML = `<div style="padding:60px;text-align:center;color:#a9b6cc;font-family:var(--font-mono);font-size:13px;">Carregando processo…</div>`;
  try{ await loadProgress(); }catch(e){
    console.error('Falha ao carregar o progresso — iniciando com estado vazio (nada foi apagado do armazenamento)', e);
    try{ if(typeof PROGRESS==='undefined' || !PROGRESS) PROGRESS = {}; }catch(_){}
    window.__LOAD_PROGRESS_FALHOU = true;
  }
  ensureMateriaSelecionada();
  // linha de sincronização: atualiza o "há N min" sozinha e reage a perder/voltar a conexão (ao voltar, envia o pendente)
  setInterval(()=>{ try{ atualizarLinhaSync(); atualizarIndicadorNuvem(); }catch(_){} }, 30000);
  // sincronização automática a cada 1 min (e ao voltar para a aba)
  setInterval(()=>{ try{ sincronizacaoAutomatica(); }catch(_){} }, 60000);
  window.addEventListener('offline', ()=>{ try{ atualizarLinhaSync(); atualizarIndicadorNuvem(); }catch(_){} });
  window.addEventListener('online', ()=>{ try{ atualizarLinhaSync(); atualizarIndicadorNuvem(); if(typeof sincronizacaoAtiva==='function' && sincronizacaoAtiva()) pushToCloud(); }catch(_){} });
  // cópia automática diária do progresso (últimos 14 dias), logo depois de abrir, sem atrasar a primeira tela
  setTimeout(()=>{ try{ carregarSnapshots().then(()=>snapshotDiario()); }catch(_){} }, 4000);
  setTimeout(()=>{ try{ backupArquivoAutomatico(); }catch(_){} }, 15000);   // arquivo de backup do dia (ver nuvem.js)
  setInterval(()=>{ try{ snapshotDiario(); backupArquivoAutomatico(); }catch(_){} }, 6*3600*1000);
  APP_INICIADO = true;
  render();
  // salvamento automático silencioso a cada minuto, além do salvamento
  // já disparado a cada resposta/ação
  setInterval(()=>{ saveProgress(); }, 60000);
  // "Salvar tudo" automático a cada 5 minutos: salva o banco de questões
  // localmente sempre, e publica na nuvem só as matérias cujo
  // MATERIA_ULTIMA_ATUALIZACAO avançou desde o ciclo anterior (cota do Firestore).
  let ultimoAutoSaveGeralTs = Date.now();
  setInterval(()=>{
    if(STATE.salvandoTudo) return;
    const materias = materiasGerenciaveis();
    if(materias.length===0) return;
    const desdeUltimoCiclo = ultimoAutoSaveGeralTs;
    comTravaDeEscrita(async ()=>{
      const ok = await saveCustomQuestions();
      let okNuvem = true, motivoNuvem = null;
      if(ok && FIREBASE_OK){
        // inclui as que ficaram pendentes de uma publicação que falhou antes
        const alteradas = materias.filter(m => (MATERIA_ULTIMA_ATUALIZACAO[m]||0) > desdeUltimoCiclo || PUBLICACAO_PENDENTE.has(m));
        if(alteradas.length>0){
          try{
            // sem force, pelo mesmo motivo de salvarTudoAgora
            const pub = await publicarQuestoesNoFirestore(alteradas, false);
            okNuvem = !!pub.ok;
            motivoNuvem = pub.ok ? null : pub.motivo;
            if(pub.ok) alteradas.forEach(m => marcarMateriaAtualizada(m, { publicada:true }));
          }catch(e){ okNuvem=false; motivoNuvem = e && e.message ? e.message : 'erro desconhecido'; }
        }
      }
      return { ok, okNuvem, motivoNuvem };
    }).then(({ok, okNuvem, motivoNuvem})=>{
      ultimoAutoSaveGeralTs = Date.now();
      // usa o mesmo indicador do botão "Salvar tudo" (hora do último salvamento
      // automático bem-sucedido)
      STATE.ultimoSalvamentoGeral = {
        automatico: true,
        ok: ok && okNuvem,
        qtdMaterias: materias.length,
        ts: Date.now(),
        motivo: !ok ? 'falha ao salvar localmente' : (!okNuvem ? ('falha ao publicar na nuvem: '+motivoNuvem) : null),
      };
      if(podeRenderizarAgora()) render();
    }).catch(()=>{});
  }, 5*60*1000);
  // busca periódica de matérias publicadas por outro dispositivo. Não roda
  // durante um simulado pra não re-renderizar no meio de uma resposta.
  setInterval(()=>{
    if(STATE.quiz || document.visibilityState==='hidden') return;
    sincronizarMateriasPublicas().then(()=>{ if(podeRenderizarAgora()) render(); }).catch(()=>{});
  }, 5*60*1000);
  // garante que o simulado em andamento chegue na nuvem mesmo se a aba for
  // fechada/minimizada antes do debounce de 250ms disparar sozinho — essencial
  // pro "Continuar" aparecer certo em outro dispositivo depois
  // ao minimizar/fechar a aba, grava e envia na hora tudo o que estiver
  // pendente (progresso e simulado em andamento)
  document.addEventListener('visibilitychange', ()=>{
    if(document.visibilityState==='hidden') salvarTudoAgoraAoSair();
    else { try{ sincronizacaoAutomatica(); }catch(_){} }
  });
  window.addEventListener('pagehide', salvarTudoAgoraAoSair);
})();

