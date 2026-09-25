/* ================= init ================= */
(async function init(){
  root.innerHTML = `<div style="padding:60px;text-align:center;color:#a9b6cc;font-family:var(--font-mono);font-size:13px;">Carregando processo…</div>`;
  await loadProgress();
  ensureMateriaSelecionada();
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
        ok: ok && okNuvem,
        qtdMaterias: materias.length,
        ts: Date.now(),
        motivo: !ok ? 'falha ao salvar localmente' : (!okNuvem ? ('falha ao publicar na nuvem: '+motivoNuvem) : null),
      };
      render();
    }).catch(()=>{});
  }, 5*60*1000);
  // busca periódica de matérias publicadas por outro dispositivo. Não roda
  // durante um simulado pra não re-renderizar no meio de uma resposta.
  setInterval(()=>{
    if(STATE.quiz) return;
    sincronizarMateriasPublicas().then(()=> render()).catch(()=>{});
  }, 5*60*1000);
  // garante que o simulado em andamento chegue na nuvem mesmo se a aba for
  // fechada/minimizada antes do debounce de 250ms disparar sozinho — essencial
  // pro "Continuar" aparecer certo em outro dispositivo depois
  document.addEventListener('visibilitychange', ()=>{
    if(document.visibilityState==='hidden') flushQuizSyncPendente();
  });
  window.addEventListener('pagehide', flushQuizSyncPendente);
})();

