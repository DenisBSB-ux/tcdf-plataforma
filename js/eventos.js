/* ================= empty state helper ================= */
function emptyState(glyph,title,desc){
  return `<div class="empty-state"><div class="glyph">${glyph}</div><h3>${title}</h3><p>${desc}</p></div>`;
}

/* ================= event delegation ================= */
function attachHandlers(){
  const btnImportSubstituir = document.getElementById('btn-import-substituir');
  if(btnImportSubstituir) btnImportSubstituir.addEventListener('click', ()=> confirmarImportPendente('substituir'));
  const btnImportSomar = document.getElementById('btn-import-somar');
  if(btnImportSomar) btnImportSomar.addEventListener('click', ()=> confirmarImportPendente('somar'));
  const btnImportCancelar = document.getElementById('btn-import-cancelar');
  if(btnImportCancelar) btnImportCancelar.addEventListener('click', cancelarImportPendente);
  const btnImportMesclarExistente = document.getElementById('btn-import-mesclar-existente');
  if(btnImportMesclarExistente) btnImportMesclarExistente.addEventListener('click', ()=> confirmarImportSemelhante('mesclar'));
  const btnImportCriarSeparada = document.getElementById('btn-import-criar-separada');
  if(btnImportCriarSeparada) btnImportCriarSeparada.addEventListener('click', ()=> confirmarImportSemelhante('separar'));
  const btnImportSemelhanteCancelar = document.getElementById('btn-import-semelhante-cancelar');
  if(btnImportSemelhanteCancelar) btnImportSemelhanteCancelar.addEventListener('click', cancelarImportSemelhante);
  const btnTentarSalvar = document.getElementById('btn-tentar-salvar-de-novo');
  if(btnTentarSalvar) btnTentarSalvar.addEventListener('click', async ()=>{
    STATE.avisoStorage = null;
    const okCustom = await saveCustomQuestions();
    let okProgress = true;
    try{ await storageSet(STORAGE_KEY, JSON.stringify(PROGRESS)); }
    catch(e){ okProgress = false; STATE.avisoStorage = 'Ainda não foi possível salvar (' + (e && e.message ? e.message : 'erro desconhecido') + '). Pode ser espaço de armazenamento do navegador cheio, ou modo de navegação privada.'; }
    if(okCustom && okProgress) pushToCloud();
    render();
  });
  const btnDispensarAviso = document.getElementById('btn-dispensar-aviso-storage');
  if(btnDispensarAviso) btnDispensarAviso.addEventListener('click', ()=>{ STATE.avisoStorage = null; render(); });
  const btnToggleMateriaMenu = document.getElementById('btn-toggle-materia-menu');
  if(btnToggleMateriaMenu) btnToggleMateriaMenu.addEventListener('click', ()=>{ STATE.materiaMenuAberto = !STATE.materiaMenuAberto; render(); });
  root.querySelectorAll('[data-macro-materia]').forEach(el=>{
    el.addEventListener('click', ()=>{
      // salva o simulado ativo antes de trocar de matéria
      if(STATE.quiz) salvarQuizEmAndamento();
      const novaMateria = el.dataset.macroMateria;
      // reconfere o armazenamento local desta matéria a cada entrada, pra corrigir
      // qualquer diferença entre memória e o que está salvo (botão "Continuar")
      STATE.quizzesVerificados.delete(novaMateria);
      STATE.materia = novaMateria;
      STATE.tema = 'todos';
      STATE.viewImportar = false;
      STATE.flashDeck = null;
      STATE.setupDrawerOpen = false;
      STATE.mostrarConfigSimulado = false;
      STATE.assuntoAberto = false;
      STATE.materiaMenuAberto = false;
      setLocalTab(STATE.materia, 'simulado');
      STATE.quiz = null;
      render();
    });
  });
  const btnMacroImportar = document.querySelector('[data-macro-importar]');
  if(btnMacroImportar) btnMacroImportar.addEventListener('click', ()=>{ STATE.viewImportar = true; STATE.importLog = null; STATE.materiaMenuAberto = false; render(); });

  const btnExportarProgresso = document.getElementById('btn-exportar-progresso');
  if(btnExportarProgresso) btnExportarProgresso.addEventListener('click', exportarProgresso);
  const btnDownloadResumo = document.getElementById('btn-download-resumo');
  if(btnDownloadResumo) btnDownloadResumo.addEventListener('click', downloadResumoRevisao);
  const btnImportarProgresso = document.getElementById('btn-importar-progresso');
  const fileInputProgresso = document.getElementById('file-input-progresso');
  if(btnImportarProgresso && fileInputProgresso){
    btnImportarProgresso.addEventListener('click', ()=> fileInputProgresso.click());
    fileInputProgresso.addEventListener('change', (e)=>{
      if(e.target.files && e.target.files[0]) importarProgresso(e.target.files[0]);
    });
  }

  const btnEntrarGoogle = document.getElementById('btn-entrar-google');
  if(btnEntrarGoogle) btnEntrarGoogle.addEventListener('click', entrarComGoogle);
  const btnEntrarGoogleBanner = document.getElementById('btn-entrar-google-banner');
  if(btnEntrarGoogleBanner) btnEntrarGoogleBanner.addEventListener('click', entrarComGoogle);
  const btnSairGoogle = document.getElementById('btn-sair-google');
  if(btnSairGoogle) btnSairGoogle.addEventListener('click', sairDaConta);

  const btnVerAlertasSobrescrita = document.getElementById('btn-ver-alertas-sobrescrita');
  if(btnVerAlertasSobrescrita) btnVerAlertasSobrescrita.addEventListener('click', ()=>{
    window.alert(ALERTAS_SOBRESCRITA_NUVEM.map(a=>a.detalhe).join('\n\n'));
  });
  const btnDispensarAlertasSobrescrita = document.getElementById('btn-dispensar-alertas-sobrescrita');
  if(btnDispensarAlertasSobrescrita) btnDispensarAlertasSobrescrita.addEventListener('click', ()=>{
    ALERTAS_SOBRESCRITA_NUVEM = [];
    render();
  });

  const btnDispensarAvisoSync = document.getElementById('btn-dispensar-aviso-sync');
  if(btnDispensarAvisoSync) btnDispensarAvisoSync.addEventListener('click', ()=>{ STATE.avisoSyncDispensado = true; render(); });

  const btnVoltarMateria = document.getElementById('btn-voltar-materia');
  if(btnVoltarMateria) btnVoltarMateria.addEventListener('click', ()=>{ STATE.viewImportar = false; render(); });

  root.querySelectorAll('[data-local-tab]').forEach(el=>{
    el.addEventListener('click', ()=>{
      const tab = el.dataset.localTab;
      setLocalTab(STATE.materia, tab);
      render();
    });
  });

  root.querySelectorAll('[data-tema]').forEach(el=>{
    el.addEventListener('click', ()=>{
      STATE.tema = el.dataset.tema;
      render();
    });
  });

  root.querySelectorAll('[data-nivel]').forEach(el=>{
    el.addEventListener('click', ()=>{
      const setup = getSetup(STATE.materia);
      const k = el.dataset.nivel;
      setup.niveis.has(k) ? setup.niveis.delete(k) : setup.niveis.add(k);
      render();
    });
  });
  root.querySelectorAll('[data-tendencia]').forEach(el=>{
    el.addEventListener('click', ()=>{
      const setup = getSetup(STATE.materia);
      const t = el.dataset.tendencia;
      setup.tendenciasExcluidas.has(t) ? setup.tendenciasExcluidas.delete(t) : setup.tendenciasExcluidas.add(t);
      render();
    });
  });
  root.querySelectorAll('[data-ano]').forEach(el=>{
    el.addEventListener('click', ()=>{
      const setup = getSetup(STATE.materia);
      const a = el.dataset.ano;
      setup.anosExcluidos.has(a) ? setup.anosExcluidos.delete(a) : setup.anosExcluidos.add(a);
      render();
    });
  });
  root.querySelectorAll('[data-banca]').forEach(el=>{
    el.addEventListener('click', ()=>{
      const setup = getSetup(STATE.materia);
      const b = el.dataset.banca;
      setup.bancasExcluidas.has(b) ? setup.bancasExcluidas.delete(b) : setup.bancasExcluidas.add(b);
      render();
    });
  });
  root.querySelectorAll('[data-cargo]').forEach(el=>{
    el.addEventListener('click', ()=>{
      const setup = getSetup(STATE.materia);
      const c = el.dataset.cargo;
      setup.cargosExcluidos.has(c) ? setup.cargosExcluidos.delete(c) : setup.cargosExcluidos.add(c);
      render();
    });
  });
  root.querySelectorAll('[data-toggle-ineditas]').forEach(el=>{
    el.addEventListener('click', ()=>{
      const setup = getSetup(STATE.materia);
      setup.incluirIneditas = !setup.incluirIneditas;
      render();
    });
  });

  const btnIniciar = document.getElementById('btn-iniciar');
  if(btnIniciar) btnIniciar.addEventListener('click', ()=>{
    // se já existe um simulado salvo com progresso real nesta matéria, e não é o
    // mesmo que já está aberto, iniciar um novo aqui direto (sem passar pelo
    // "Iniciar um novo" que já confirma) sobrescreveria esse progresso salvo em
    // silêncio — essa checagem fecha essa lacuna, seja qual for o caminho que
    // levou até este botão
    if(!avisarSeForPerderProgresso()) return;
    startQuiz();
  });
  const btnLimparFiltros = document.getElementById('btn-limpar-filtros');
  if(btnLimparFiltros) btnLimparFiltros.addEventListener('click', ()=>{
    const setup = getSetup(STATE.materia);
    setup.niveis = new Set(['baixa','media','alta']);
    setup.anosExcluidos = new Set();
    setup.bancasExcluidas = new Set();
    setup.cargosExcluidos = new Set();
    setup.tendenciasExcluidas = new Set();
    setup.incluirIneditas = true;
    setup.qtd = 20;
    render();
  });
  const btnSimuladoErros = document.getElementById('btn-simulado-erros');
  if(btnSimuladoErros) btnSimuladoErros.addEventListener('click', refazerTodasErros);
  const btnImprimir = document.getElementById('btn-imprimir');
  if(btnImprimir) btnImprimir.addEventListener('click', gerarImpressao);

  root.querySelectorAll('[data-opt]').forEach(el=>{
    let clickTimer = null;
    el.addEventListener('click', ()=>{
      if(el.disabled) return;
      if(clickTimer){ clearTimeout(clickTimer); clickTimer = null; return; } // 2º clique: o dblclick cuida
      clickTimer = setTimeout(()=>{ clickTimer = null; pickAnswer(el.dataset.opt); }, 260);
    });
    el.addEventListener('dblclick', (e)=>{
      e.preventDefault();
      if(el.disabled) return;
      toggleRiscarAlternativa(el.dataset.opt);
    });
  });
  const btnPrev = document.getElementById('btn-prev');
  if(btnPrev) btnPrev.addEventListener('click', goPrev);
  const btnNextArrow = document.getElementById('btn-next-arrow');
  if(btnNextArrow) btnNextArrow.addEventListener('click', goNext);
  const btnProximaRapida = document.getElementById('btn-proxima-rapida');
  if(btnProximaRapida) btnProximaRapida.addEventListener('click', goNext);
  root.querySelectorAll('.btn-editar-campo').forEach(el=>{
    el.addEventListener('click', ()=>{
      edicaoAtual = el.dataset.uid;
      render();
    });
  });
  root.querySelectorAll('[data-alterar-gabarito]').forEach(el=>{
    el.addEventListener('click', ()=> alterarGabarito(el.dataset.alterarGabarito));
  });
  root.querySelectorAll('.btn-restaurar-campo').forEach(el=>{
    el.addEventListener('click', ()=>{
      const uid = el.dataset.uid, campo = el.dataset.campo;
      if(EDICOES_USUARIO[uid]){
        delete EDICOES_USUARIO[uid][campo];
        if(Object.keys(EDICOES_USUARIO[uid]).length===0) delete EDICOES_USUARIO[uid];
        salvarEdicoesUsuario();
        const qRestaurada = BY_UID[uid];
        if(qRestaurada){ marcarProgressoSujo(qRestaurada.materia); pushToCloud(); }
      }
      render();
    });
  });
  root.querySelectorAll('[data-editar-acao]').forEach(el=>{
    el.addEventListener('click', ()=>{
      const acao = el.dataset.editarAcao;
      if(acao==='bold'){ document.execCommand('bold'); return; }
      if(acao==='italic'){ document.execCommand('italic'); return; }
      if(acao==='strike'){ document.execCommand('strikeThrough'); return; }
      if(acao==='highlight'){
        const cor = el.dataset.cor || '#fff3b0';
        try{ document.execCommand('hiliteColor', false, cor); }
        catch(e){ document.execCommand('backColor', false, cor); }
        return;
      }
      if(acao==='limpar'){ document.execCommand('removeFormat'); return; }
      if(acao==='cancelar'){ edicaoAtual = null; render(); return; }
      if(acao==='salvar'){
        const uid = el.dataset.uid;
        ['q','r','rf'].forEach(campo=>{
          const div = document.getElementById(`conteudo-${campo}-${uid}`);
          if(div){
            if(!EDICOES_USUARIO[uid]) EDICOES_USUARIO[uid] = {};
            EDICOES_USUARIO[uid][campo] = limparHtmlEditado(div.innerHTML);
          }
        });
        salvarEdicoesUsuario();
        // salvar a edição marca a matéria como pendente e envia pra nuvem na hora
        const qEditada = BY_UID[uid];
        if(qEditada){ marcarProgressoSujo(qEditada.materia); pushToCloud(); }
        edicaoAtual = null;
        render();
      }
    });
  });
  const btnJumpUltimaRespondida = document.getElementById('btn-jump-ultima-respondida');
  if(btnJumpUltimaRespondida) btnJumpUltimaRespondida.addEventListener('click', irParaUltimaRespondida);
  const btnJumpProximoAssunto = document.getElementById('btn-jump-proximo-assunto');
  if(btnJumpProximoAssunto) btnJumpProximoAssunto.addEventListener('click', irParaProximoAssunto);
  root.querySelectorAll('[data-jump]').forEach(el=>{
    el.addEventListener('click', ()=> goToQuestion(parseInt(el.dataset.jump,10)));
  });
  const btnResetQuestao = document.getElementById('btn-reset-questao');
  if(btnResetQuestao) btnResetQuestao.addEventListener('click', resetQuestaoAtual);
  const btnResetSimulado = document.getElementById('btn-reset-simulado');
  if(btnResetSimulado) btnResetSimulado.addEventListener('click', resetSimuladoAtual);
  const btnAbandonar = document.getElementById('btn-abandonar');
  if(btnAbandonar) btnAbandonar.addEventListener('click', abandonarQuiz);
  const btnVoltarResultado = document.getElementById('btn-voltar-resultado');
  if(btnVoltarResultado) btnVoltarResultado.addEventListener('click', ()=>{ STATE.quiz=null; STATE.focusMode=false; render(); });
  const btnNovoSimulado = document.getElementById('btn-novo-simulado');
  if(btnNovoSimulado) btnNovoSimulado.addEventListener('click', ()=>{ STATE.quiz=null; STATE.focusMode=false; render(); });

  root.querySelectorAll('[data-refazer]').forEach(el=>{
    el.addEventListener('click', ()=> refazerQuestao(el.dataset.refazer));
  });
  const btnRefazerTodas = document.getElementById('btn-refazer-todas');
  if(btnRefazerTodas) btnRefazerTodas.addEventListener('click', refazerTodasErros);

  const btnResetMateria = document.getElementById('btn-reset-materia');
  if(btnResetMateria) btnResetMateria.addEventListener('click', ()=>{
    const ok = window.confirm(`Isso vai apagar o histórico de tentativas, o caderno de erros e as marcações de flashcards de "${STATE.materia}". Deseja continuar?`);
    if(ok){ resetProgressoMateria(STATE.materia); STATE.quiz=null; STATE.flashDeck=null; render(); }
  });

  root.querySelectorAll('[data-deck]').forEach(el=>{
    el.addEventListener('click', ()=>{
      selectedDeck = el.dataset.deck;
      render();
    });
  });
  const btnIniciarFlash = document.getElementById('btn-iniciar-flash');
  if(btnIniciarFlash) btnIniciarFlash.addEventListener('click', startFlashDeck);

  const flashcardEl = document.getElementById('flashcard');
  if(flashcardEl) flashcardEl.addEventListener('click', ()=>{ STATE.flashDeck.flipped = !STATE.flashDeck.flipped; render(); });

  const btnFlashSei = document.getElementById('btn-flash-sei');
  if(btnFlashSei) btnFlashSei.addEventListener('click', (e)=>{ e.stopPropagation(); const d=STATE.flashDeck; registrarFlash(d.materia, d.uids[d.idx],'sei'); flashGoNext(); });
  const btnFlashRevisar = document.getElementById('btn-flash-revisar');
  if(btnFlashRevisar) btnFlashRevisar.addEventListener('click', (e)=>{ e.stopPropagation(); const d=STATE.flashDeck; registrarFlash(d.materia, d.uids[d.idx],'revisar'); flashGoNext(); });
  const btnFlashPrev = document.getElementById('btn-flash-prev');
  if(btnFlashPrev) btnFlashPrev.addEventListener('click', (e)=>{ e.stopPropagation(); flashGoPrev(); });
  const btnFlashNextArrow = document.getElementById('btn-flash-next-arrow');
  if(btnFlashNextArrow) btnFlashNextArrow.addEventListener('click', (e)=>{ e.stopPropagation(); flashGoNext(); });
  const btnFlashFinalizar = document.getElementById('btn-flash-finalizar');
  if(btnFlashFinalizar) btnFlashFinalizar.addEventListener('click', (e)=>{ e.stopPropagation(); STATE.flashDeck=null; STATE.focusMode=false; render(); });

  root.querySelectorAll('[data-zoom]').forEach(el=>{
    el.addEventListener('click', (e)=>{ e.stopPropagation(); ajustarZoom(el.dataset.zoom); });
  });

  const btnThemeToggle = document.getElementById('btn-theme-toggle');
  if(btnThemeToggle) btnThemeToggle.addEventListener('click', alternarTema);
  const btnColorPicker = document.getElementById('btn-color-picker');
  if(btnColorPicker) btnColorPicker.addEventListener('click', alternarCorPicker);
  root.querySelectorAll('[data-cor-tema]').forEach(el=>{
    el.addEventListener('click', ()=> escolherCorTema(el.dataset.corTema));
  });
  const btnFocusToggle = document.getElementById('btn-focus-toggle');
  if(btnFocusToggle) btnFocusToggle.addEventListener('click', ()=>{ STATE.focusMode = !STATE.focusMode; render(); });

  const btnContinuarSimulado = document.getElementById('btn-continuar-simulado');
  if(btnContinuarSimulado) btnContinuarSimulado.addEventListener('click', ()=> continuarSimuladoDaMateria(STATE.materia));
  const btnReiniciarSimulado = document.getElementById('btn-reiniciar-simulado');
  if(btnReiniciarSimulado) btnReiniciarSimulado.addEventListener('click', ()=> reiniciarSimuladoDaMateria(STATE.materia));
  root.querySelectorAll('[data-continuar-materia]').forEach(el=>{
    el.addEventListener('click', (ev)=>{
      ev.stopPropagation(); // não deixa o clique também disparar o data-macro-materia da linha por baixo
      continuarSimuladoDaMateria(el.dataset.continuarMateria);
    });
  });
  const btnSalvarSimulado = document.getElementById('btn-salvar-simulado');
  if(btnSalvarSimulado) btnSalvarSimulado.addEventListener('click', salvarSimuladoParaComparacao);
  root.querySelectorAll('[data-reabrir-salvo]').forEach(el=>{
    el.addEventListener('click', ()=>{
      const ts = parseInt(el.dataset.reabrirSalvo,10);
      const bucket = getBucket(STATE.materia);
      const sv = (bucket.simuladosSalvos||[]).find(s=>s.ts===ts);
      if(sv){
        STATE.quiz = { queue: sv.queue, idx:0, respostas: sv.respostas, finished:true, materia: STATE.materia, tema: sv.tema, reaberto:true };
        render();
      }
    });
  });
  root.querySelectorAll('[data-excluir-salvo]').forEach(el=>{
    el.addEventListener('click', ()=>{
      const ts = parseInt(el.dataset.excluirSalvo,10);
      const bucket = getBucket(STATE.materia);
      bucket.simuladosSalvos = (bucket.simuladosSalvos||[]).filter(s=>s.ts!==ts);
      saveProgress();
      render();
    });
  });

  root.querySelectorAll('[data-abrir-sessao]').forEach(el=>{
    el.addEventListener('click', ()=> abrirSessaoHistorico(parseInt(el.dataset.abrirSessao,10)));
  });
  root.querySelectorAll('[data-salvar-sessao]').forEach(el=>{
    el.addEventListener('click', ()=> salvarSessaoHistoricoParaComparacao(parseInt(el.dataset.salvarSessao,10)));
  });
  root.querySelectorAll('[data-excluir-sessao]').forEach(el=>{
    el.addEventListener('click', ()=>{
      const ok = window.confirm('Excluir este simulado do histórico "Últimos simulados"? Essa ação não pode ser desfeita.');
      if(ok) excluirSessaoHistorico(parseInt(el.dataset.excluirSessao,10));
    });
  });

  const btnToggleAssunto = document.getElementById('btn-toggle-assunto');
  if(btnToggleAssunto) btnToggleAssunto.addEventListener('click', ()=>{ STATE.assuntoAberto = !STATE.assuntoAberto; render(); });

  const btnToggleCargoMenu = document.getElementById('btn-toggle-cargo-menu');
  if(btnToggleCargoMenu) btnToggleCargoMenu.addEventListener('click', ()=>{
    const setup = getSetup(STATE.materia);
    setup.cargoMenuAberto = !setup.cargoMenuAberto;
    render();
  });
  const btnTogglePaginacao = document.getElementById('btn-toggle-paginacao');
  if(btnTogglePaginacao) btnTogglePaginacao.addEventListener('click', ()=>{
    STATE.paginacaoAberta = !STATE.paginacaoAberta;
    render();
  });

  const btnAbrirConfig = document.getElementById('btn-abrir-config');
  if(btnAbrirConfig) btnAbrirConfig.addEventListener('click', ()=>{ STATE.mostrarConfigSimulado = true; render(); });
  const btnVoltarLanding = document.getElementById('btn-voltar-landing');
  if(btnVoltarLanding) btnVoltarLanding.addEventListener('click', ()=>{ STATE.mostrarConfigSimulado = false; render(); });

  const uploadZone = document.getElementById('upload-zone');
  const fileInput = document.getElementById('file-input');
  const assuntoInput = document.getElementById('input-assunto-nome');
  if(assuntoInput) assuntoInput.addEventListener('input', (e)=>{ STATE.importDeckName = e.target.value; });
  if(uploadZone && fileInput){
    uploadZone.addEventListener('click', ()=> fileInput.click());
    uploadZone.addEventListener('dragover', (e)=>{ e.preventDefault(); uploadZone.classList.add('dragover'); });
    uploadZone.addEventListener('dragleave', ()=> uploadZone.classList.remove('dragover'));
    uploadZone.addEventListener('drop', (e)=>{
      e.preventDefault(); uploadZone.classList.remove('dragover');
      if(e.dataTransfer.files && e.dataTransfer.files[0]) handleImportFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e)=>{
      if(e.target.files && e.target.files[0]) handleImportFile(e.target.files[0]);
    });
  }
  const btnBuscarComputador = document.getElementById('btn-buscar-computador');
  if(btnBuscarComputador && fileInput) btnBuscarComputador.addEventListener('click', ()=> fileInput.click());

  const btnTogglePaste = document.getElementById('btn-toggle-paste');
  if(btnTogglePaste) btnTogglePaste.addEventListener('click', ()=>{ STATE.showPaste = !STATE.showPaste; render(); });
  const btnToggleBackupManual = document.getElementById('btn-toggle-backup-manual');
  if(btnToggleBackupManual) btnToggleBackupManual.addEventListener('click', ()=>{ STATE.showBackupManual = !STATE.showBackupManual; render(); });
  const pasteTextarea = document.getElementById('paste-textarea');
  if(pasteTextarea) pasteTextarea.addEventListener('input', (e)=>{ STATE.pasteText = e.target.value; });
  const btnProcessarColado = document.getElementById('btn-processar-colado');
  if(btnProcessarColado) btnProcessarColado.addEventListener('click', ()=>{
    const texto = (STATE.pasteText||'').trim();
    if(!texto){
      STATE.importLog = { error: 'Cole o conteúdo do arquivo .txt na caixa de texto antes de processar.' };
      render();
      return;
    }
    processImportedText(texto, STATE.importDeckName || 'Colado manualmente');
  });

  root.querySelectorAll('[data-remover-materia]').forEach(el=>{
    el.addEventListener('click', async ()=>{
      const nome = el.dataset.removerMateria;
      const ok = window.confirm(`Remover todas as questões e o progresso da matéria "${nome}"? Isso também remove ela da versão pública, se estiver publicada. Essa ação não afeta as demais matérias.`);
      if(ok) await removerMateria(nome);
    });
  });
  root.querySelectorAll('[data-remover-duplicatas]').forEach(el=>{
    el.addEventListener('click', async ()=>{
      const materiaNome = el.dataset.removerDuplicatas;
      el.disabled = true;
      el.textContent = '⏳ Removendo…';
      const resultado = await removerDuplicatasDaMateria(materiaNome);
      STATE.dedupInfo = { materia: materiaNome, ...resultado };
      render();
    });
  });
  root.querySelectorAll('[data-salvar-materia]').forEach(el=>{
    el.addEventListener('click', ()=> salvarMateriaAgora(el.dataset.salvarMateria));
  });
  root.querySelectorAll('[data-buscar-substituir-materia]').forEach(el=>{
    el.addEventListener('click', ()=> buscarSubstituirMateria(el.dataset.buscarSubstituirMateria));
  });
  root.querySelectorAll('[data-mesclar-materia]').forEach(el=>{
    el.addEventListener('click', async ()=>{
      const nomeOrigem = el.dataset.mesclarMateria;
      const outras = materiasGerenciaveis().filter(m=>m!==nomeOrigem);
      if(outras.length===0) return;
      const lista = outras.map((m,i)=>`${i+1}) ${m}`).join('\n');
      const escolha = window.prompt(`Mesclar "${nomeOrigem}" em qual matéria? Digite o número:\n\n${lista}\n\nA matéria "${nomeOrigem}" deixará de existir; suas questões e progresso passam pra matéria escolhida (mantendo a versão mais atual de cada questão repetida).`);
      if(escolha===null) return;
      const idx = parseInt(escolha.trim(), 10) - 1;
      if(isNaN(idx) || idx<0 || idx>=outras.length){ alert('Número inválido.'); return; }
      const nomeDestino = outras[idx];
      const ok = window.confirm(`Confirma mesclar "${nomeOrigem}" em "${nomeDestino}"? Essa ação não pode ser desfeita automaticamente.`);
      if(!ok) return;
      el.disabled = true;
      el.textContent = '⏳ Mesclando…';
      const resultado = await mesclarMaterias(nomeOrigem, nomeDestino);
      if(!resultado.ok){ alert('Não foi possível mesclar: ' + (resultado.motivo||'motivo desconhecido')); render(); return; }
      STATE.dedupInfo = null;
      render();
    });
  });
  root.querySelectorAll('[data-mesclar-par-origem]').forEach(el=>{
    el.addEventListener('click', async ()=>{
      const nomeOrigem = el.dataset.mesclarParOrigem;
      const nomeDestino = el.dataset.mesclarParDestino;
      if(!window.confirm(`Confirma mesclar "${nomeOrigem}" em "${nomeDestino}"? "${nomeOrigem}" deixará de existir. Essa ação não pode ser desfeita automaticamente.`)) return;
      el.disabled = true;
      el.textContent = '⏳ Mesclando…';
      const resultado = await mesclarMaterias(nomeOrigem, nomeDestino);
      if(!resultado.ok) alert('Não foi possível mesclar: ' + (resultado.motivo||'motivo desconhecido'));
      render();
    });
  });
  const btnSalvarTudo = root.querySelector('#btn-salvar-tudo');
  if(btnSalvarTudo) btnSalvarTudo.addEventListener('click', ()=> salvarTudoAgora());
  root.querySelectorAll('[data-renomear-materia]').forEach(el=>{
    el.addEventListener('click', async ()=>{
      const nomeAtual = el.dataset.renomearMateria;
      const nomeNovo = window.prompt(`Novo nome para "${nomeAtual}":`, nomeAtual);
      if(nomeNovo!==null) await renomearMateria(nomeAtual, nomeNovo);
    });
  });
  const fileInputAtualizar = document.getElementById('file-input-atualizar');
  root.querySelectorAll('[data-download-materia]').forEach(el=>{
    el.addEventListener('click', ()=> downloadListaQuestoes(el.dataset.downloadMateria));
  });
  root.querySelectorAll('[data-inserir-materia]').forEach(el=>{
    el.addEventListener('click', ()=>{
      const nome = el.dataset.inserirMateria;
      if(!fileInputAtualizar) return;
      fileInputAtualizar.onchange = (e)=>{
        if(e.target.files && e.target.files[0]) inserirNaMateria(nome, e.target.files[0]);
        fileInputAtualizar.value = '';
      };
      fileInputAtualizar.click();
    });
  });
}

/* ================= atalhos de teclado ================= */
function isDigitandoEmCampo(e){
  const tag = (e.target && e.target.tagName || '').toLowerCase();
  return tag==='input' || tag==='textarea';
}
document.addEventListener('keydown', (e)=>{
  if(isDigitandoEmCampo(e)) return;

  if(STATE.flashDeck){
    if(e.key==='ArrowLeft'){ e.preventDefault(); flashGoPrev(); return; }
    if(e.key==='ArrowRight'){ e.preventDefault(); flashGoNext(); return; }
    if(e.key===' ' || e.key==='Enter'){ e.preventDefault(); STATE.flashDeck.flipped = !STATE.flashDeck.flipped; render(); return; }
    return;
  }

  if(!STATE.quiz || STATE.quiz.finished) return;
  const quiz = STATE.quiz;
  if(e.key==='ArrowLeft' || e.key==='Shift'){ e.preventDefault(); goPrev(); return; }
  if(e.key==='ArrowRight' || e.key===' '){ e.preventDefault(); goNext(); return; }
  const uid = quiz.queue[quiz.idx];
  const q = BY_UID[uid];
  if(q && q.t==='CE' && !quiz.respostas[uid]){
    if(e.key==='c' || e.key==='C'){ e.preventDefault(); pickAnswer('Certo'); return; }
    if(e.key==='e' || e.key==='E'){ e.preventDefault(); pickAnswer('Errado'); return; }
  }
});

