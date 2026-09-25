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
  // "Salvar tudo" automático a cada 5 minutos (pedido explícito): cobre o
  // banco de questões (local + nuvem), não só o progresso de respostas —
  // reduz a chance de perder um lote de importação por esquecer de clicar
  // no botão manual.
  // REVISADO: a primeira versão publicava TODAS as matérias na nuvem a cada
  // ciclo, mesmo sem nenhuma mudança — isso gasta cota diária de escrita do
  // Firestore (que é limitada, ver notas do projeto) só repetindo o mesmo
  // conteúdo. Agora só publica na nuvem as matérias cujo MATERIA_ULTIMA_
  // ATUALIZACAO avançou desde o ciclo anterior (import, renomear, dedup,
  // salvar manual). O salvamento LOCAL continua incondicional a cada ciclo
  // (IndexedDB não tem cota diária, é só disco do próprio navegador).
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
        const alteradas = materias.filter(m => (MATERIA_ULTIMA_ATUALIZACAO[m]||0) > desdeUltimoCiclo);
        if(alteradas.length>0){
          try{
            // sem force, pelo mesmo motivo de salvarTudoAgora
            const pub = await publicarQuestoesNoFirestore(alteradas, false);
            okNuvem = !!pub.ok;
            motivoNuvem = pub.ok ? null : pub.motivo;
            if(pub.ok) alteradas.forEach(marcarMateriaAtualizada);
          }catch(e){ okNuvem=false; motivoNuvem = e && e.message ? e.message : 'erro desconhecido'; }
        }
      }
      return { ok, okNuvem, motivoNuvem };
    }).then(({ok, okNuvem, motivoNuvem})=>{
      ultimoAutoSaveGeralTs = Date.now();
      // CORREÇÃO: essa rotina rodava 100% silenciosa — nunca chamava render()
      // nem atualizava nenhum indicador. Funcionando ou não, nada aparecia na
      // tela, então parecia simplesmente não estar acontecendo. Agora usa o
      // mesmo indicador do botão manual "Salvar tudo", pra sempre haver uma
      // prova visível (hora do último salvamento automático bem-sucedido).
      STATE.ultimoSalvamentoGeral = {
        ok: ok && okNuvem,
        qtdMaterias: materias.length,
        ts: Date.now(),
        motivo: !ok ? 'falha ao salvar localmente' : (!okNuvem ? ('falha ao publicar na nuvem: '+motivoNuvem) : null),
      };
      render();
    }).catch(()=>{});
  }, 5*60*1000);
  // busca periódica de matérias/questões publicadas por OUTRO dispositivo
  // (pedido explícito): antes só rodava uma vez, na abertura da página — uma
  // aba já aberta nunca via um import feito em outro aparelho sem reload
  // manual. Não roda com um simulado em andamento pra não arriscar re-renderizar
  // no meio de uma resposta; a próxima troca de tela já pega o resultado.
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

