/* ================= QUIZ ================= */
function renderQuiz(){
  const quiz = STATE.quiz;
  if(quiz.finished) return renderResults();

  // CORREÇÃO (v69): remove uid duplicado da fila (mesma questão aparecendo mais
  // de uma vez) — resíduo possível de sessões criadas antes de uma limpeza de
  // duplicatas na matéria. Cada repetição contava a mais na grade de questões
  // respondidas (uma questão respondida virava "2 verdes" em vez de 1). Mantém
  // a primeira ocorrência de cada uid, remove as repetições, e ajusta a posição
  // atual se ela tiver ficado fora dos limites depois da limpeza.
  const uidsVistos = new Set();
  const filaLimpa = quiz.queue.filter(u=>{
    if(uidsVistos.has(u)) return false;
    uidsVistos.add(u);
    return true;
  });
  if(filaLimpa.length !== quiz.queue.length){
    quiz.queue = filaLimpa;
    if(quiz.idx >= quiz.queue.length) quiz.idx = Math.max(0, quiz.queue.length-1);
    salvarQuizEmAndamento();
  }

  // CORREÇÃO (v70): reconcilia a fila com a base ATUAL de questões válidas da
  // matéria — uma fila criada antes de uma limpeza de duplicatas pode ainda
  // referenciar uids que não existem mais (órfãs) e, ao mesmo tempo, não
  // incluir uids válidos que já foram respondidos em algum momento (porque a
  // fila ficou "congelada" num estado anterior). Sem isso, o grid nunca
  // conseguia bater com o "37" do topo, porque a fila em si não representava
  // mais o conjunto completo e atual da matéria. Não mexe em filas de "refazer
  // erros" (origemErros), que são intencionalmente um subconjunto à parte.
  if(!quiz.origemErros && quiz.materia){
    const poolAtual = ALL_QUESTIONS.filter(q2=>q2.materia===quiz.materia && !q2.duplicataOculta && (q2.t==='CE'||q2.t==='MC'));
    const poolUids = new Set(poolAtual.map(q2=>q2.uid));
    const semOrfas = quiz.queue.filter(u=>poolUids.has(u));
    const queueUidsAtuais = new Set(semOrfas);
    const faltando = poolAtual.filter(q2=>!queueUidsAtuais.has(q2.uid)).map(q2=>q2.uid);
    // CORREÇÃO (v71): além de reconciliar, reordena por número sequencial da
    // questão (em vez de deixar na ordem antiga, por ano da prova) — assim as
    // já respondidas ficam agrupadas do início em diante, em vez de espalhadas
    // pela fila. Preserva a posição atual pelo UID da questão que estava sendo
    // vista, não pelo índice (que muda de lugar com a reordenação).
    const uidAtualAntes = quiz.queue[quiz.idx];
    const filaReconciliada = semOrfas.concat(faltando);
    const filaOrdenada = [...filaReconciliada].sort((ua,ub)=>((BY_UID[ua]&&BY_UID[ua].n)||0)-((BY_UID[ub]&&BY_UID[ub].n)||0));
    // reordena sempre que a sequência mudar — cobre tanto reconciliação
    // (órfãs/faltantes) quanto sessões antigas já completas, mas que ainda
    // estavam na ordem antiga (por ano da prova, não por número da questão)
    const mudouAlgo = filaOrdenada.length !== quiz.queue.length || filaOrdenada.some((u,i)=>u!==quiz.queue[i]);
    if(mudouAlgo){
      quiz.queue = filaOrdenada;
      const novoIdx = quiz.queue.indexOf(uidAtualAntes);
      quiz.idx = novoIdx>=0 ? novoIdx : Math.max(0, Math.min(quiz.idx, quiz.queue.length-1));
      salvarQuizEmAndamento();
    }
  }

  const uid = quiz.queue[quiz.idx];
  const q = BY_UID[uid];
  const resposta = quiz.respostas[uid];
  const revelado = !!resposta;

  const escLabel = ESCOPO_LABEL[q.es] || q.es;
  const escClass = ESCOPO_CLASS[q.es] || '';
  const nivLabel = NIVEL_STARS[q.nv] || '';
  const nivClass = 'tag-'+q.nv;

  let optionsHtml = '';
  const uidAtual = uid;
  const riscadas = (STATE.quiz.riscadas && STATE.quiz.riscadas[uidAtual]) || [];
  const gEfetivo = gabaritoEfetivo(q);
  if(q.t === 'CE'){
    optionsHtml = `<div class="ce-buttons-row">` + ['Certo','Errado'].map(opt=>{
      let cls='answer-opt ce-btn ' + (opt==='Certo' ? 'ce-certo' : 'ce-errado');
      if(revelado){
        const isPicked = opt===resposta.picked;
        const isCorrect = opt===gEfetivo;
        if(isPicked) cls+=' picked';
        if(isCorrect) cls+=' correct';
        else if(isPicked) cls+=' incorrect';
        else cls+=' nao-escolhida-errada';
      }
      if(riscadas.includes(opt)) cls+=' riscado';
      return `<button class="${cls}" data-opt="${opt}" ${revelado?'disabled':''} title="${opt} (2 cliques risca)">
        <span class="letter">${opt==='Certo'?'✓':'✗'}</span>
      </button>`;
    }).join('') + `</div>`;
  } else if(q.t==='MC' && q.alt){
    optionsHtml = q.alt.map(a=>{
      const letraUp = a.letra.toUpperCase();
      let cls='answer-opt';
      if(revelado){
        const isPicked = letraUp===resposta.picked;
        const isCorrect = letraUp===gEfetivo;
        if(isPicked) cls+=' picked';
        if(isCorrect) cls+=' correct';
        else if(isPicked) cls+=' incorrect';
        else cls+=' nao-escolhida-errada';
      }
      if(riscadas.includes(letraUp)) cls+=' riscado';
      return `<button class="${cls}" data-opt="${letraUp}" ${revelado?'disabled':''} title="2 cliques risca esta alternativa">
        <span class="letter">${letraUp}</span> ${esc(a.texto)}
      </button>`;
    }).join('');
  } else {
    optionsHtml = `<p style="font-size:13px;color:var(--ink-soft);padding:8px 0;">Questão sem gabarito identificado — não pontuável. Use as setas para navegar.</p>`;
  }

  if(STATE.focusMode){
    // modo foco: só o essencial pra responder sem distração — enunciado,
    // botões de resposta, a justificativa depois de responder, setas de
    // navegação e o botão de sair do foco. Nada de cabeçalho com banca/tags,
    // paginação, resetar ou finalizar aqui.
    return `
    <div class="case-file focus-simple" style="zoom:${STATE.zoomLevel};">
      <div class="case-body">
        <div class="enunciado">${blocoEnunciadoEditavel(q)}</div>
      </div>
      <div class="answers">${optionsHtml}</div>
      ${revelado ? `<div class="case-body focus-justificativa">${renderResolucao(q, resposta, quiz)}</div>` : ''}
      <div class="quiz-toolbar">
        <div class="toolbar-btn-row">
          <button class="icon-btn" id="btn-prev" title="Questão anterior (seta ← ou Shift)" ${quiz.idx===0?'disabled':''}>←</button>
          <span class="q-jump-label">${quiz.idx+1} / ${quiz.queue.length}</span>
          <button class="icon-btn" id="btn-next-arrow" title="Próxima questão (seta → ou espaço)" ${quiz.idx===quiz.queue.length-1?'disabled':''}>→</button>
          <span class="toolbar-divider"></span>
          <button class="icon-btn" id="btn-reset-questao" title="Limpar a resposta desta questão" ${revelado?'':'disabled'}>↺</button>
          <span class="toolbar-divider"></span>
          <button class="icon-btn" id="btn-focus-toggle" title="Sair do modo foco">✕</button>
          <button class="theme-toggle-btn" id="btn-theme-toggle" title="Alternar modo claro/escuro" style="width:36px;height:36px;">${STATE.theme==='light'?'🌙':'☀️'}</button>
          ${renderZoomControl()}
        </div>
      </div>
    </div>
    `;
  }

  const respondidas = Object.keys(quiz.respostas).length;
  const progressPct = pct(respondidas, quiz.queue.length);
  const temaLinha = q.tema && q.tema!=='Geral' ? `<div class="q-tema-line">${esc(q.tema)}</div>` : '';
  const historicoHtml = ''; // removido a pedido: poluía o cabeçalho sem agregar valor suficiente
  const idxUltimaRespondida = acharIdxUltimaRespondida(quiz);
  const idxProximoAssunto = acharIdxProximoAssunto(quiz);

  return `
  <div class="case-file">
    <div class="case-header">
      <div class="q-number-row">
        <span class="q-meta-inline">${bancaCargoAnoLine(q)}</span>
        ${historicoHtml}
      </div>
      ${temaLinha}
      <div class="tag-row">
        ${q.pp ? probabilidadeBadge(q.pp) : probabilidadeCalculadaBadge(q)}
        ${nivelBadge(q.nv)}
        ${trendBadge(q.td)}
        ${freqBadge(q.fr)}
        ${ineditaBadge(q)}
      </div>
      ${narrativaBancaBanner(q)}
    </div>
    <div class="case-columns ${revelado?'revelado':'nao-revelado'}" style="zoom:${STATE.zoomLevel};">
      <div class="case-col-left">
        <div class="case-body">
          <div class="enunciado ${isInedita(q)?'is-inedita':''}">${blocoEnunciadoEditavel(q)}</div>
        </div>
        <div class="answers">${optionsHtml}</div>
      </div>
      <div class="case-col-right">
        ${revelado ? renderResolucao(q, resposta, quiz) : renderResolucaoPlaceholder()}
      </div>
    </div>

    <div class="quiz-toolbar">
      <div class="toolbar-btn-row">
        <button class="icon-btn" id="btn-prev" title="Questão anterior (seta ← ou Shift)" ${quiz.idx===0?'disabled':''}>←</button>
        <span class="q-jump-label">${quiz.idx+1} / ${quiz.queue.length}</span>
        <button class="icon-btn" id="btn-next-arrow" title="Próxima questão (seta → ou espaço)" ${quiz.idx===quiz.queue.length-1?'disabled':''}>→</button>
        <button class="icon-btn" id="btn-jump-ultima-respondida" title="Avançar para a última questão respondida" ${idxUltimaRespondida<0 || idxUltimaRespondida===quiz.idx?'disabled':''}>⏩</button>
        <button class="icon-btn" id="btn-jump-proximo-assunto" title="Ir para o próximo assunto" ${idxProximoAssunto<0?'disabled':''}>⏭</button>
        <span class="toolbar-divider"></span>
        <button class="icon-btn" id="btn-reset-questao" title="Limpar a resposta desta questão" ${revelado?'':'disabled'}>↺</button>
        <button class="icon-btn" id="btn-focus-toggle" title="${STATE.focusMode?'Sair do modo foco':'Modo foco (esconde menus)'}">${STATE.focusMode?'✕':'◉'}</button>
        <button class="icon-btn" id="btn-abandonar" title="Voltar ao painel — o progresso já foi salvo automaticamente">↩</button>
        <span class="toolbar-divider"></span>
        ${renderZoomControl()}
        ${quiz.ultimoSalvamento ? `<span class="kbd-hint" title="Salvamento automático a cada ação">💾 ${formatarDataHoraSalvamento(quiz.ultimoSalvamento)}</span>` : ''}
      </div>
      <div class="toolbar-meta-row">
        <div class="progress-bar" style="max-width:220px;"><div class="fill" style="width:${progressPct}%"></div></div>
      </div>
    </div>
    ${quiz.queue.length>1 ? `
    <button type="button" class="paginacao-toggle" id="btn-toggle-paginacao">
      <span>${STATE.paginacaoAberta?'▴ Ocultar':'▾ Ver todas as questões'} (${quiz.queue.length})</span>
    </button>
    ${STATE.paginacaoAberta ? (() => {
        const bucketAtual = getBucket(quiz.materia);
        let nCorretas=0, nErradas=0, nSemTentativa=0;
        const celulas = quiz.queue.map((u,i)=>{
          const r = quiz.respostas[u];
          // mesma checagem usada em computeSnapshotMateria (o cálculo oficial do
          // "37" no topo da tela): ignora uid órfão, que não existe mais na base
          // atual de questões — sem essa checagem, o grid podia contar diferente
          // do número oficial
          const hist = (!r && BY_UID[u]) ? bucketAtual.perguntas[u] : null;
          let cls = 'page-num';
          if(r){ cls += r.correct ? ' page-correct' : ' page-incorrect'; r.correct ? nCorretas++ : nErradas++; }
          else if(hist && hist.tentativas>0){ cls += hist.ultimoResultado ? ' page-correct' : ' page-incorrect'; hist.ultimoResultado ? nCorretas++ : nErradas++; }
          else nSemTentativa++;
          if(i===quiz.idx) cls += ' page-current';
          return `<button class="${cls}" data-jump="${i}" title="Ir para a questão ${i+1}" aria-label="Questão ${i+1}"></button>`;
        }).join('');
        // contador de diagnóstico: calculado a partir dos MESMOS dados que colorem
        // as células — número mostrado aqui e o grid abaixo nunca podem divergir
        // entre si, já que vêm exatamente da mesma passada
        return `<div style="font-size:11px;color:var(--ink-soft);margin-bottom:4px;">🟢 ${nCorretas} corretas · 🔴 ${nErradas} erradas · ⬜ ${nSemTentativa} sem tentativa nesta fila (${quiz.queue.length} total)</div>
        <div class="pagination-strip">${celulas}</div>`;
      })() : ''}` : ''}
  </div>
  `;
}

function renderResolucaoPlaceholder(){
  return `<div class="resolucao-placeholder">
    <div class="glyph">📖</div>
    <p>A resolução e o resumo flash aparecem aqui assim que você responder a questão.</p>
  </div>`;
}

// campo editável: se o usuário já customizou esse campo, mostra o HTML salvo
// dele; senão, mostra a formatação automática de sempre (termos decisivos +
// palavras-chave do gabarito). O botão de lápis alterna pro modo de edição.
// CORREÇÃO (pedido do usuário): antes cada campo (Enunciado/Resolução/Resumo
// Flash) tinha seu próprio rótulo + botão "Editar" independente, e só um
// campo por vez entrava em modo de edição (edicaoAtual = {uid, campo}). Isso
// também só existia no modo Normal — o modo Foco renderizava o enunciado com
// HTML fixo, sem checar EDICOES_USUARIO nem oferecer edição, então uma edição
// feita no modo Normal não aparecia no modo Foco. Agora é um único botão
// "Editar questão" por questão (edicaoAtual = uid), que põe os três campos em
// modo de edição juntos, com uma barra de ferramentas e um "Salvar" únicos —
// e o mesmo bloco de enunciado é usado nos dois modos.
function editorToolbarHtml(uid){
  return `<div class="editor-toolbar">
    <button data-editar-acao="bold" title="Negrito"><b>B</b></button>
    <button data-editar-acao="italic" title="Itálico"><i>I</i></button>
    <button data-editar-acao="strike" title="Tachado"><s>S</s></button>
    <span class="editor-toolbar-sep"></span>
    <button data-editar-acao="highlight" data-cor="#fff3b0" class="swatch-amarelo" title="Grifar em amarelo"></button>
    <button data-editar-acao="highlight" data-cor="#c8e6c9" class="swatch-verde" title="Grifar em verde"></button>
    <button data-editar-acao="highlight" data-cor="#bbdefb" class="swatch-azul" title="Grifar em azul"></button>
    <button data-editar-acao="highlight" data-cor="#f8bbd0" class="swatch-rosa" title="Grifar em rosa"></button>
    <span class="editor-toolbar-sep"></span>
    <button data-editar-acao="limpar" title="Limpar formatação da seleção">🧹</button>
    <button data-editar-acao="salvar" data-uid="${esc(uid)}" class="btn-salvar-edicao">💾 Salvar</button>
    <button data-editar-acao="cancelar" class="btn-cancelar-edicao">✕ Cancelar</button>
  </div>`;
}
// bloco do enunciado: traz o único botão que ativa o modo de edição da
// questão inteira (usado igual no modo Normal e no modo Foco)
function blocoEnunciadoEditavel(q){
  const uid = q.uid;
  const custom = EDICOES_USUARIO[uid] && limparHtmlEditado(EDICOES_USUARIO[uid]['q']);
  const emEdicao = edicaoAtual === uid;
  const htmlAuto = destacarTermosDecisivos(esc(limparEnunciado(q.q, q.t)));
  const conteudo = custom || htmlAuto;
  return `
    <div class="campo-editavel-header" style="justify-content:flex-end;">
      <span class="campo-editavel-acoes">
        ${emEdicao ? '' : `<button class="btn-editar-campo" data-uid="${esc(uid)}" title="Editar enunciado, resolução e resumo flash desta questão">✏️ Editar questão</button>`}
        ${(!emEdicao && custom) ? `<button class="btn-restaurar-campo" data-uid="${esc(uid)}" data-campo="q" title="Descartar edição do enunciado e voltar ao texto automático">↺ Restaurar enunciado</button>` : ''}
      </span>
    </div>
    ${emEdicao ? editorToolbarHtml(uid) : ''}
    <div class="campo-editavel-conteudo" ${emEdicao ? 'contenteditable="true"' : ''} id="conteudo-q-${esc(uid)}">${conteudo}</div>
  `;
}
// bloco de resolução/resumo flash: sem rótulo nem botão próprios — só entra
// em edição junto quando a questão inteira está em edição (edicaoAtual===uid)
function campoEditavelSimples(q, campo, htmlAuto){
  const uid = q.uid;
  const custom = EDICOES_USUARIO[uid] && limparHtmlEditado(EDICOES_USUARIO[uid][campo]);
  const emEdicao = edicaoAtual === uid;
  const conteudo = custom || htmlAuto;
  return `
    ${(!emEdicao && custom) ? `<div class="campo-editavel-header" style="justify-content:flex-end;"><button class="btn-restaurar-campo" data-uid="${esc(uid)}" data-campo="${campo}" title="Descartar edição e voltar ao texto automático">↺ Restaurar</button></div>` : ''}
    <div class="campo-editavel-conteudo" ${emEdicao ? 'contenteditable="true"' : ''} id="conteudo-${campo}-${esc(uid)}">${conteudo}</div>
  `;
}
function renderResolucao(q, resposta, quiz){
  const correto = resposta.correct;
  const tintClass = correto ? 'tint-correct' : 'tint-incorrect';
  const feedbackClass = correto ? 'correct' : 'incorrect';
  const temProxima = quiz && quiz.idx < quiz.queue.length-1;
  // CORREÇÃO (v63): não há mais botão manual de finalizar — a finalização é
  // sempre automática (ver pickAnswer), assim que a última questão da fila é
  // respondida. Se o usuário respondeu fora de ordem (pulou questões) e chegou
  // na última posição da fila sem ainda ter respondido todas, mostra um botão
  // pra ir direto pra primeira ainda não respondida, em vez de finalizar.
  const proximaNaoRespondidaIdx = (!temProxima && Object.keys(quiz.respostas).length < quiz.queue.length)
    ? quiz.queue.findIndex(uid => !quiz.respostas[uid]) : -1;
  const palavrasChave = palavrasChaveDaRespostaCorreta(q);
  const gAlterado = GABARITOS_ALTERADOS[q.uid];
  return `
  <div class="answer-feedback ${feedbackClass}">
    ${correto ? 'Você acertou' : 'Você errou'} — gabarito: ${esc(gabaritoEfetivo(q))}
    <button class="btn-corrigir-gabarito" data-alterar-gabarito="${esc(q.uid)}" title="Corrigir o gabarito desta questão (com justificativa) — não muda tentativas já registradas" style="margin-left:8px;">✏️ Corrigir gabarito</button>
  </div>
  ${gAlterado ? `<div class="tendencia-alerta" style="margin-top:8px;font-size:12px;">⚠ Gabarito alterado manualmente: <b>${esc(gAlterado.original)} → ${esc(gAlterado.novo)}</b>. Motivo: ${esc(gAlterado.motivo||'—')} <span style="opacity:.7;">(${formatarDataHoraSalvamento(gAlterado.ts)})</span></div>` : ''}
  <div class="resolucao-box ${tintClass}">
    ${campoEditavelSimples(q, 'r', formatarTextoComDestaque(q.r, palavrasChave))}
  </div>
  <div class="resumo-flash-box">
    ${campoEditavelSimples(q, 'rf', formatarTextoComDestaque(q.rf, palavrasChave))}
  </div>
  ${temProxima ? `<button class="btn btn-gold btn-sm" id="btn-proxima-rapida" style="margin-top:16px;width:100%;justify-content:center;">Próxima questão ⏩</button>`
    : (proximaNaoRespondidaIdx>=0 ? `<button class="btn btn-gold btn-sm" data-jump="${proximaNaoRespondidaIdx}" style="margin-top:16px;width:100%;justify-content:center;">Ir para questão ${proximaNaoRespondidaIdx+1} (não respondida) ⏩</button>` : '')}
  `;
}

function pickAnswer(opt){
  const quiz = STATE.quiz;
  if(!quiz) return; // clique atrasado (temporizador de duplo clique) após sair da sessão
  const uid = quiz.queue[quiz.idx];
  if(quiz.respostas[uid]) return;
  const q = BY_UID[uid];
  const correct = opt === gabaritoEfetivo(q);
  quiz.respostas[uid] = { picked: opt, correct };
  registrarResposta(quiz.materia, uid, correct);
  // CORREÇÃO (v63): finalização agora é SEMPRE automática, nunca manual — assim
  // que a última questão da fila é respondida (em qualquer ordem, mesmo se o
  // usuário pulou questões e voltou depois), o simulado se finaliza sozinho.
  // O botão manual "Finalizar e ver resultado" foi removido de propósito.
  if(Object.keys(quiz.respostas).length >= quiz.queue.length){
    finalizarQuiz();
    return;
  }
  salvarQuizEmAndamento();
  render();
}

function goPrev(){
  const quiz = STATE.quiz;
  if(quiz.idx>0){ quiz.idx -= 1; salvarQuizEmAndamento(); render(); }
}
function goNext(){
  const quiz = STATE.quiz;
  if(quiz.idx < quiz.queue.length-1){ quiz.idx += 1; salvarQuizEmAndamento(); render(); }
}
function goToQuestion(i){
  const quiz = STATE.quiz;
  if(i>=0 && i<quiz.queue.length){ quiz.idx = i; salvarQuizEmAndamento(); render(); }
}

// acha o índice, na fila atual, da última questão já respondida (percorrendo do
// início ao fim da fila — não é necessariamente a posição atual do cursor)
function acharIdxUltimaRespondida(quiz){
  let last = -1;
  quiz.queue.forEach((uid,i)=>{ if(quiz.respostas[uid]) last = i; });
  return last;
}
function irParaUltimaRespondida(){
  const quiz = STATE.quiz;
  const last = acharIdxUltimaRespondida(quiz);
  if(last>=0 && last!==quiz.idx) goToQuestion(last);
}
// acha o índice da primeira questão, a partir da posição atual, cujo assunto
// é diferente do assunto da questão atual (i.e. o começo do próximo assunto)
function acharIdxProximoAssunto(quiz){
  const atual = BY_UID[quiz.queue[quiz.idx]];
  const temaAtual = atual ? atual.tema : null;
  for(let i=quiz.idx+1; i<quiz.queue.length; i++){
    const q = BY_UID[quiz.queue[i]];
    if(q && q.tema !== temaAtual) return i;
  }
  return -1;
}
function irParaProximoAssunto(){
  const quiz = STATE.quiz;
  const alvo = acharIdxProximoAssunto(quiz);
  if(alvo>=0) goToQuestion(alvo);
}

function toggleRiscarAlternativa(opt){
  const quiz = STATE.quiz;
  const uid = quiz.queue[quiz.idx];
  if(!quiz.riscadas) quiz.riscadas = {};
  if(!quiz.riscadas[uid]) quiz.riscadas[uid] = [];
  const idx = quiz.riscadas[uid].indexOf(opt);
  if(idx>=0) quiz.riscadas[uid].splice(idx,1);
  else quiz.riscadas[uid].push(opt);
  salvarQuizEmAndamento();
  render();
}

function resetQuestaoAtual(){
  const quiz = STATE.quiz;
  const uid = quiz.queue[quiz.idx];
  if(!quiz.respostas[uid]) return;
  undoRegistro(quiz.materia, uid);
  delete quiz.respostas[uid];
  salvarQuizEmAndamento();
  render();
}

function resetSimuladoAtual(){
  const quiz = STATE.quiz;
  if(!quiz) return;
  const ok = window.confirm('Isso vai reiniciar o simulado do zero — as respostas já dadas nele serão desfeitas (seu progresso geral da matéria é ajustado de volta, questão por questão). A fila e os filtros continuam os mesmos. Deseja continuar?');
  if(!ok) return;
  Object.keys(quiz.respostas).forEach(uid => undoRegistro(quiz.materia, uid));
  quiz.respostas = {};
  quiz.idx = 0;
  quiz.finished = false;
  salvarQuizEmAndamento();
  render();
}

// reinicia o simulado em andamento de uma matéria diretamente da tela
// principal (sem precisar abrir o simulado primeiro) — reaproveita
// resetSimuladoAtual, só garantindo que STATE.quiz aponte pro simulado certo
function reiniciarSimuladoDaMateria(materiaNome){
  const q = STATE.quizzesEmAndamento[materiaNome];
  if(!q || q.finished) return;
  STATE.materia = materiaNome;
  STATE.quiz = q;
  resetSimuladoAtual();
}

function abandonarQuiz(){
  STATE.quiz = null;
  STATE.focusMode = false;
  render();
}

function finalizarQuiz(){
  const quiz = STATE.quiz;
  quiz.finished = true;
  const total = quiz.queue.length;
  const acertos = Object.values(quiz.respostas).filter(r=>r.correct).length;
  registrarSessao(quiz.materia, total, acertos, quiz.tema, quiz.queue, quiz.respostas);
  limparQuizSalvo(chaveEmAndamento(quiz));
  STATE.simuladoSalvoMsg = false;
  render();
}

function salvarSimuladoParaComparacao(quizAlvo){
  const quiz = quizAlvo || STATE.quiz;
  if(!quiz) return;
  const bucket = getBucket(quiz.materia);
  if(!bucket.simuladosSalvos) bucket.simuladosSalvos = [];
  const acertos = Object.values(quiz.respostas).filter(r=>r.correct).length;
  bucket.simuladosSalvos.push({
    ts: Date.now(),
    queue: quiz.queue,
    respostas: quiz.respostas,
    tema: quiz.tema,
    total: quiz.queue.length,
    acertos,
  });
  if(bucket.simuladosSalvos.length>20) bucket.simuladosSalvos = bucket.simuladosSalvos.slice(-20);
  saveProgress();
  STATE.simuladoSalvoMsg = true;
  render();
}

/* ---- ações sobre o histórico "Últimos simulados nesta matéria" (bucket.sessoes) ---- */
function abrirSessaoHistorico(ts){
  const bucket = getBucket(STATE.materia);
  const se = (bucket.sessoes||[]).find(s=>s.ts===ts);
  if(!se || !se.queue || !se.queue.length) return;
  STATE.quiz = { queue: se.queue, idx:0, respostas: se.respostas||{}, finished:true, materia: STATE.materia, tema: se.tema, reaberto:true };
  render();
}
function salvarSessaoHistoricoParaComparacao(ts){
  const bucket = getBucket(STATE.materia);
  const se = (bucket.sessoes||[]).find(s=>s.ts===ts);
  if(!se || !se.queue || !se.queue.length) return;
  salvarSimuladoParaComparacao({ materia: STATE.materia, queue: se.queue, respostas: se.respostas||{}, tema: se.tema });
}
function excluirSessaoHistorico(ts){
  const bucket = getBucket(STATE.materia);
  bucket.sessoes = (bucket.sessoes||[]).filter(s=>s.ts!==ts);
  saveProgress();
  render();
}

function renderSimuladosSalvosBlock(){
  const bucket = STATE.materia ? getBucket(STATE.materia) : { simuladosSalvos: [] };
  const salvos = (bucket.simuladosSalvos || []).slice(-10).reverse();
  if(!salvos.length) return '';
  return `<div class="card-block" style="margin-top:16px;">
    <h3>Simulados salvos para comparação</h3>
    ${salvos.map(sv=>{
      const d = new Date(sv.ts);
      const dt = d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'}) + ' ' + d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
      const taxa = sv.total ? Math.round((sv.acertos/sv.total)*100) : 0;
      return `<div class="bar-row" style="flex-wrap:wrap;">
        <div class="name">${dt}${sv.tema && sv.tema!=='todos' ? ' · '+esc(sv.tema) : ''}</div>
        <div class="pct" style="margin-right:8px;">${sv.acertos}/${sv.total} (${taxa}%)</div>
        <button class="btn-outline" data-reabrir-salvo="${sv.ts}" style="padding:4px 10px;font-size:11px;">Reabrir</button>
        <button class="btn-outline" data-excluir-salvo="${sv.ts}" style="padding:4px 10px;font-size:11px;">Excluir</button>
      </div>`;
    }).join('')}
  </div>`;
}

function renderResults(){
  const quiz = STATE.quiz;
  const total = quiz.queue.length;
  const respondidas = Object.keys(quiz.respostas);
  const acertos = respondidas.filter(uid=>quiz.respostas[uid].correct).length;
  const erradas = respondidas.length - acertos;
  const naoRespondidas = total - respondidas.length;
  const p = pct(acertos, respondidas.length);

  const errList = quiz.queue.filter(uid => quiz.respostas[uid] && !quiz.respostas[uid].correct);

  return `
  <div class="results-hero">
    <div class="section-eyebrow" style="text-align:center;">Encerramento de processo</div>
    <div class="big">${p}<span>%</span></div>
    <div class="cap">${acertos} acertos · ${erradas} erros${naoRespondidas?` · ${naoRespondidas} não respondidas`:''} · ${total} questões</div>
  </div>
  <div class="stat-grid">
    <div class="stat-card"><div class="num">${acertos}</div><div class="lbl">Certas</div></div>
    <div class="stat-card"><div class="num">${erradas}</div><div class="lbl">Erradas</div></div>
    <div class="stat-card"><div class="num">${naoRespondidas}</div><div class="lbl">Não respondidas</div></div>
  </div>
  ${erradas>0 ? `<div class="card-block">
    <h3>Questões erradas nesta sessão</h3>
    ${errList.map(uid=>{
      const q=BY_UID[uid];
      return `<div class="error-row"><span class="num">${String(q.n).padStart(3,'0')}</span>
        <div class="summary">${esc(q.rf)}<div class="meta">${esc(q.bc)}</div></div></div>`;
    }).join('')}
    <p style="font-size:12.5px;color:var(--ink-soft);margin-top:10px;">Essas questões já estão salvas automaticamente no caderno de erros desta matéria.</p>
  </div>` : (respondidas.length>0 ? `<div class="card-block"><h3>Gabarito impecável — nenhum erro registrado nesta sessão.</h3></div>` : '')}
  <div style="display:flex; gap:10px; flex-wrap:wrap;">
    <button class="btn-outline" id="btn-voltar-resultado">← Voltar para "${esc(STATE.materia||'')}"</button>
    <button class="btn btn-primary" id="btn-novo-simulado">Novo simulado</button>
    ${!quiz.reaberto ? `<button class="btn-outline" id="btn-salvar-simulado">💾 Salvar para comparar depois</button>` : `<span class="side-status detail" style="align-self:center;">Visualizando um simulado salvo anteriormente</span>`}
  </div>
  ${STATE.simuladoSalvoMsg ? `<div class="side-status ok" style="margin-top:10px;">✓ Simulado salvo! Encontre-o no Painel do candidato, em "Simulados salvos".</div>` : ''}
  `;
}

/* ================= ESTATÍSTICAS ================= */
function renderStats(){
  const s = computeSnapshot();
  if(s.tent===0){
    return emptyState('📋','Nenhum dado ainda',`Responda seu primeiro simulado em "${esc(STATE.materia||'')}" para começar a acompanhar acertos, cobertura e evolução por nível de incidência.`) + renderDangerZone();
  }

  const bucket = getBucket(STATE.materia);
  const niveis = { alta:[0,0], media:[0,0], baixa:[0,0] };
  const byTema = {};
  // CORREÇÃO: aqui embaixo ainda somava p.acertos/p.tentativas (histórico
  // cumulativo de TODAS as tentativas já dadas), enquanto o "Acerto geral" no
  // topo desta mesma página já tinha sido corrigido pra usar o resultado
  // ATUAL de cada questão (ultimoResultado) — os dois nunca batiam entre si
  // (ex.: Direito Civil, Contratos). Agora os dois usam exatamente a mesma
  // definição: cada questão conta 1 vez, pelo seu resultado mais recente.
  Object.entries(bucket.perguntas).forEach(([uid,p])=>{
    const q = BY_UID[uid]; if(!q || q.materia!==STATE.materia) return;
    if(STATE.tema!=='todos' && q.tema!==STATE.tema) return;
    if(p.ultimoResultado!==true && p.ultimoResultado!==false) return;
    const acertou = p.ultimoResultado===true ? 1 : 0;
    if(niveis[q.nv]){ niveis[q.nv][0]+=acertou; niveis[q.nv][1]+=1; }
    if(!byTema[q.tema]) byTema[q.tema]=[0,0];
    byTema[q.tema][0]+=acertou; byTema[q.tema][1]+=1;
  });

  const ultimaSessoes = bucket.sessoes.slice(-8).reverse();
  const temas = temasDisponiveis(STATE.materia);

  return `
  <div class="section-eyebrow">${esc(STATE.materia)}</div>
  <h2 class="section-title">Estatísticas de desempenho</h2>
  <p class="section-desc">Acompanhamento consolidado desta matéria${STATE.tema!=='todos'?`, assunto <b>${esc(STATE.tema)}</b>`:''}.</p>

  <div class="stat-grid">
    <div class="stat-card"><div class="num">${s.taxa}%</div><div class="lbl">Acerto geral</div></div>
    <div class="stat-card"><div class="num"><span class="n-certa">${s.ac}</span><span style="opacity:.45;">/</span><span class="n-errada">${s.tent-s.ac}</span><span style="opacity:.45;">/</span><span class="n-total">${s.totalPontuavel}</span></div><div class="lbl">Certas / erradas / total</div></div>
    <div class="stat-card"><div class="num">${s.erros}</div><div class="lbl">No caderno de erros</div></div>
  </div>

  <div class="card-block">
    <h3>Desempenho por nível de incidência</h3>
    ${['alta','media','baixa'].map(k=>barRow(NIVEL_STARS[k]+' '+NIVEL_LABEL[k], niveis[k][0], niveis[k][1])).join('')}
  </div>

  ${temas.length>1 ? `<div class="card-block">
    <h3>Desempenho por assunto</h3>
    ${temas.map(t=>barRow(t, (byTema[t]||[0,0])[0], (byTema[t]||[0,0])[1])).join('')}
  </div>` : ''}

  ${ultimaSessoes.length ? `<div class="card-block">
    <h3>Últimos simulados</h3>
    ${ultimaSessoes.map(se=>{
      const d = new Date(se.ts);
      const dt = d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'}) + ' ' + d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
      return barRow(dt + (se.tema && se.tema!=='todos' ? ` · ${se.tema}` : ''), se.acertos, se.total);
    }).join('')}
  </div>` : ''}

  ${renderDangerZone()}
  `;
}

function renderDangerZone(){
  return `<div class="card-block" style="border-color:#eabdb6;">
    <h3 style="color:var(--stamp-red);">Zona de risco — ${esc(STATE.materia||'')}</h3>
    <p style="font-size:12.5px;color:var(--ink-soft);margin-bottom:14px;">Apaga o histórico de tentativas, o caderno de erros e as marcações de flashcards apenas desta matéria. As demais matérias não são afetadas.</p>
    <button class="btn-danger" id="btn-reset-materia">Resetar progresso desta matéria</button>
  </div>`;
}

function barRow(name, a, t){
  const p = pct(a,t);
  const color = p>=70 ? 'var(--stamp-green)' : p>=40 ? 'var(--gold)' : 'var(--stamp-red)';
  return `<div class="bar-row">
    <div class="name">${esc(name)}</div>
    <div class="bar-track"><div class="bar-fill" style="width:${t? p:0}%;background:${color};"></div></div>
    <div class="pct">${t? `${p}% (${a}/${t})` : '—'}</div>
  </div>`;
}

/* ================= CADERNO DE ERROS ================= */
function getCadernoErros(){
  if(!STATE.materia) return [];
  const bucket = getBucket(STATE.materia);
  const scopeUids = scopeUidsComHistorico();
  return Object.entries(bucket.perguntas)
    .filter(([uid,p]) => p.ultimoResultado === false && scopeUids.has(uid))
    .map(([uid,p]) => ({ uid, p }))
    .sort((a,b)=> (b.p.historico[b.p.historico.length-1] ? b.p.historico[b.p.historico.length-1].ts : 0) - (a.p.historico[a.p.historico.length-1] ? a.p.historico[a.p.historico.length-1].ts : 0));
}

function renderErros(){
  const lista = getCadernoErros();
  if(lista.length===0){
    return emptyState('🗂️','Caderno de erros vazio',`As questões que você errar em "${esc(STATE.materia||'')}" aparecem aqui automaticamente. Acerte-as novamente para removê-las da lista.`);
  }
  return `
  <div class="section-eyebrow">${esc(STATE.materia)}</div>
  <h2 class="section-title">Caderno de erros</h2>
  <p class="section-desc">${lista.length} questão(ões) com o último resultado registrado como erro${STATE.tema!=='todos'?` no assunto ${esc(STATE.tema)}`:''}. Refaça-as para atualizar o status.</p>

  ${lista.map(({uid,p})=>{
    const q = BY_UID[uid];
    return `<div class="error-row">
      <span class="num">${String(q.n).padStart(3,'0')}</span>
      <div class="summary">
        ${esc(q.rf)}
        <div class="meta">${NIVEL_STARS[q.nv]} · ${esc(q.td||'')} ${tendenciaQuente(q)?'⚠':''} · ${p.tentativas} tentativa(s), ${p.acertos} acerto(s) · ${esc(q.bc)}${q.tema && q.tema!=='Geral' ? ` · ${esc(q.tema)}`:''}</div>
      </div>
      <button class="btn btn-gold btn-sm" data-refazer="${uid}">Refazer</button>
    </div>`;
  }).join('')}

  <button class="btn btn-primary" id="btn-refazer-todas" style="margin-top:14px;">Refazer todas (${lista.length})</button>
  `;
}

/* ================= RESUMO PARA REVISÃO DE VÉSPERA ================= */
// pega o resumo flash de todas as questões atualmente erradas (mesma base do
// caderno de erros) e organiza por assunto — pensado pra revisar rapidinho no
// dia anterior à prova, sem precisar refazer questão por questão
// item 6: gera um .txt de texto plano com o resumo flash de tudo que está no
// caderno de erros, agrupado por assunto — pra levar consigo e revisar offline
// gera um Markdown com todas as questões de uma matéria, no mesmo formato que
// parseMarkdownQuestoes sabe ler de volta — permite baixar, editar num editor
// de texto/Markdown qualquer e reimportar depois (item 2 e 3)
// converte o HTML de um campo editado (rich text, com negrito/itálico/marca-texto
// do editor) de volta pra texto plano, preservando quebras de linha razoáveis —
// usado no download, que é sempre texto puro, nunca HTML
function htmlParaTextoPlano(html){
  if(!html) return '';
  const div = new DOMParser().parseFromString(String(html), 'text/html').body;
  div.querySelectorAll('br').forEach(br=>br.replaceWith('\n'));
  div.querySelectorAll('div,p').forEach(el=>{ el.insertAdjacentText('afterend','\n'); });
  return (div.textContent||'').replace(/\n{3,}/g,'\n\n').trim();
}
// texto EFETIVO de um campo — a edição manual do usuário, se existir, senão o
// original. Usada no download pra garantir que alterações feitas na tela sejam
// mantidas no arquivo exportado (pedido explícito: "se eu fizer o download,
// mantenha todas as alterações").
function textoEfetivoDoCampo(q, campo){
  const custom = EDICOES_USUARIO[q.uid] && EDICOES_USUARIO[q.uid][campo];
  if(custom) return htmlParaTextoPlano(custom);
  return q[campo] || '';
}
function gerarMarkdownDaMateria(materiaKey){
  const qs = ALL_QUESTIONS.filter(q => q.materia===materiaKey && !q.duplicataOculta).sort((a,b)=>a.n-b.n);
  let md = `# ${materiaKey}\n\n`;
  qs.forEach(q=>{
    md += `## QUESTÃO ${q.n}\n\n`;
    md += `**Banca/Cargo:** ${q.bc||'—'}\n`;
    md += `**Ano:** ${q.ar||'—'} | **Nível:** ${NIVEL_LABEL[q.nv]||'Média'} | **Tendência:** ${tendenciaCurta(q.td)}\n`;
    md += `**Assunto:** ${q.tema||'Geral'}\n\n`;
    md += `### Enunciado\n${textoEfetivoDoCampo(q,'q')}\n\n`;
    if(q.t==='MC' && q.alt){
      md += `### Alternativas\n`;
      q.alt.forEach(a=>{ md += `- **${a.letra.toUpperCase()})** ${a.texto}\n`; });
      md += `\n**Gabarito:** ${gabaritoEfetivo(q)}\n\n`;
    } else {
      md += `**Gabarito:** ${gabaritoEfetivo(q)}\n\n`;
    }
    md += `### Resolução\n${textoEfetivoDoCampo(q,'r')}\n\n`;
    md += `### Resumo Flash\n${textoEfetivoDoCampo(q,'rf')}\n\n`;
    md += `---\n\n`;
  });
  return md;
}
function downloadListaQuestoes(materiaKey){
  if(!materiaKey) return;
  const md = gerarMarkdownDaMateria(materiaKey);
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dataStr = new Date().toISOString().slice(0,10);
  const nomeArquivo = materiaKey.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-');
  a.href = url;
  a.download = `questoes-${nomeArquivo}-${dataStr}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadResumoRevisao(){
  const lista = getCadernoErros();
  if(lista.length===0) return;
  const porTema = {};
  lista.forEach(({uid})=>{
    const q = BY_UID[uid];
    if(!q) return;
    const tema = (q.tema && q.tema!=='Geral') ? q.tema : 'Geral';
    if(!porTema[tema]) porTema[tema] = [];
    porTema[tema].push(q);
  });
  const temasOrdenados = Object.keys(porTema).sort((a,b)=>a.localeCompare(b,'pt-BR'));
  let texto = `RESUMO PARA REVISÃO DE VÉSPERA — ${STATE.materia}\n`;
  texto += `Gerado em ${new Date().toLocaleDateString('pt-BR')} · ${lista.length} ponto(s) de atenção\n`;
  texto += '='.repeat(60) + '\n\n';
  temasOrdenados.forEach(tema=>{
    texto += `${tema.toUpperCase()} (${porTema[tema].length})\n`;
    texto += '-'.repeat(40) + '\n';
    porTema[tema].sort((a,b)=>a.n-b.n).forEach(q=>{
      texto += `${String(q.n).padStart(3,'0')}. ${(q.rf||'').replace(/\s+/g,' ').trim()}\n\n`;
    });
    texto += '\n';
  });
  const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dataStr = new Date().toISOString().slice(0,10);
  const nomeArquivo = (STATE.materia||'materia').toLowerCase().replace(/[^a-z0-9]+/g,'-');
  a.href = url;
  a.download = `resumo-revisao-${nomeArquivo}-${dataStr}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function renderResumoRevisao(){
  const lista = getCadernoErros();
  if(lista.length===0){
    return emptyState('🎯','Nada pra revisar por aqui',`Quando você errar questões em "${esc(STATE.materia||'')}", o resumo flash delas aparece aqui, agrupado por assunto, pronto pra uma revisão rápida de véspera.`);
  }
  const porTema = {};
  lista.forEach(({uid})=>{
    const q = BY_UID[uid];
    if(!q) return;
    const tema = (q.tema && q.tema!=='Geral') ? q.tema : 'Geral';
    if(!porTema[tema]) porTema[tema] = [];
    porTema[tema].push(q);
  });
  const temasOrdenados = Object.keys(porTema).sort((a,b)=>a.localeCompare(b,'pt-BR'));

  return `
  <div class="section-eyebrow">${esc(STATE.materia)}</div>
  <h2 class="section-title">Resumo para revisão de véspera</h2>
  <p class="section-desc">${lista.length} ponto(s) de atenção — resumo flash no método <b>ELI10</b> (<i>Explain Like I'm 10</i>: explicado de um jeito simples, como se você tivesse 10 anos) das questões que você errou${STATE.tema!=='todos'?` no assunto ${esc(STATE.tema)}`:''}, agrupados por assunto.</p>
  <button class="btn-outline" id="btn-download-resumo" style="margin-bottom:18px;">⬇ Baixar como arquivo de texto</button>

  ${temasOrdenados.map(tema=>`
    <div class="card-block">
      <h3>${esc(tema)} <span style="font-weight:400;color:var(--ink-soft);font-size:12px;">(${porTema[tema].length})</span></h3>
      ${porTema[tema].sort((a,b)=>a.n-b.n).map(q=>`
        <div class="resumo-revisao-item">
          <div class="num">${String(q.n).padStart(3,'0')}</div>
          <div class="txt"><span class="eli10-tag" title="Explain Like I'm 10 — explicação simplificada">⚡ ELI10</span> ${formatarTextoComDestaque(q.rf, palavrasChaveDaRespostaCorreta(q))}</div>
        </div>
      `).join('')}
    </div>
  `).join('')}
  `;
}

// true se existe um simulado salvo com progresso real nesta matéria que seria
// perdido ao iniciar uma nova sessão agora — usado pra confirmar com o usuário
// antes de qualquer fluxo que crie um STATE.quiz novo (iniciar, refazer erros etc.)
function avisarSeForPerderProgresso(){
  const salvo = STATE.quizzesEmAndamento[STATE.materia];
  const temProgresso = salvo && !salvo.finished && Object.keys(salvo.respostas||{}).length>0 && salvo!==STATE.quiz;
  if(!temProgresso) return true;
  const qtdRespondidas = Object.keys(salvo.respostas).length;
  return window.confirm(`Você tem um simulado salvo nesta matéria com ${qtdRespondidas} de ${salvo.queue.length} questões já respondidas nesta tentativa específica. Continuar agora vai substituir esse progresso salvo assim que você responder algo aqui — o histórico de acertos/erros já registrado continua contando normalmente nas suas estatísticas, só a opção de "continuar de onde parou" nessa fila específica é perdida. Deseja continuar mesmo assim?`);
}
function refazerQuestao(uid){
  setLocalTab(STATE.materia, 'simulado');
  STATE.quiz = { queue:[uid], idx:0, respostas:{}, finished:false, materia: STATE.materia, tema: STATE.tema, origemErros:true };
  salvarQuizEmAndamento();
  render();
}

function refazerTodasErros(){
  const uids = getCadernoErros().map(e=>e.uid);
  if(uids.length===0) return;
  setLocalTab(STATE.materia, 'simulado');
  STATE.quiz = { queue: shuffle(uids), idx:0, respostas:{}, finished:false, materia: STATE.materia, tema: STATE.tema, origemErros:true };
  salvarQuizEmAndamento();
  render();
}

/* ================= FLASHCARDS ================= */
function gabaritoDestacado(g){
  if(!g) return '—';
  if(g==='Certo') return `<span class="gab-destaque gab-certo">Certo</span>`;
  if(g==='Errado') return `<span class="gab-destaque gab-errado">Errado</span>`;
  return `<span class="gab-destaque gab-letra">${esc(g)}</span>`;
}

function renderFlashcards(){
  if(!STATE.flashDeck){
    const escopoQ = questoesFiltradas();
    const bucket = STATE.materia ? getBucket(STATE.materia) : { flash:{}, perguntas:{} };
    const revisar = escopoQ.filter(q=>bucket.flash[q.uid] && bucket.flash[q.uid].status==='revisar').length;
    const naoVistas = escopoQ.filter(q=>!bucket.flash[q.uid]).length;
    const erradasFlash = escopoQ.filter(q=>bucket.perguntas[q.uid] && bucket.perguntas[q.uid].ultimoResultado===false).length;
    // se o baralho selecionado anteriormente não existe mais nesta matéria/assunto
    // (ex.: era "erradas" mas agora não há nenhuma errada aqui), volta pra "todas" —
    // evita clicar em "Começar revisão" e cair num baralho diferente do que aparece
    // visualmente marcado na tela
    if(selectedDeck==='erradas' && erradasFlash===0) selectedDeck = 'todas';
    return `
    <div class="section-eyebrow">${esc(STATE.materia||'')}</div>
    <h2 class="section-title">Flashcards</h2>
    <p class="section-desc">Cada carta traz o enunciado na frente e o resumo flash com o gabarito no verso. Marque como "sei" ou "revisar" para focar seus estudos.</p>
    <div class="setup-grid">
      <div class="field">
        <label>Baralho${STATE.tema!=='todos'?` — ${esc(STATE.tema)}`:''}</label>
        <div class="chip-row">
          <span class="chip ${selectedDeck==='todas'?'selected':''}" data-deck="todas">Todas as questões (${escopoQ.length})</span>
          <span class="chip ${selectedDeck==='revisar'?'selected':''}" data-deck="revisar">Marcadas para revisar (${revisar})</span>
          <span class="chip ${selectedDeck==='novas'?'selected':''}" data-deck="novas">Ainda não vistas (${naoVistas})</span>
          ${erradasFlash>0 ? `<span class="chip ${selectedDeck==='erradas'?'selected':''}" data-deck="erradas">Erradas (${erradasFlash})</span>` : ''}
        </div>
      </div>
    </div>
    <button class="btn btn-primary" id="btn-iniciar-flash">Começar revisão →</button>
    `;
  }
  const deck = STATE.flashDeck;
  const uid = deck.uids[deck.idx];
  const q = BY_UID[uid];
  const bucket = getBucket(deck.materia);
  const status = bucket.flash[uid] && bucket.flash[uid].status;

  return `
  <div class="flash-stage">
    <div class="flash-counter">CARTA ${deck.idx+1} DE ${deck.uids.length} · QUESTÃO Nº ${q.n}${q.tema && q.tema!=='Geral'?` · ${esc(q.tema)}`:''} ${renderZoomControl()}</div>
    <div class="flashcard ${deck.flipped?'flipped':''}" id="flashcard">
      <div class="flashcard-inner">
        <div class="flashcard-face flashcard-front">
          ${status ? `<span class="review-chip ${status==='sei'?'review-know':'review-study'}">${status==='sei'?'Sei':'Revisar'}</span>` : ''}
          <div class="q-text" style="zoom:${STATE.zoomLevel};">${destacarTermosDecisivos(esc(limparEnunciado(q.q, q.t)))}</div>
        </div>
        <div class="flashcard-face flashcard-back">
          <span class="lbl">Resumo flash</span>
          <div class="rf-text" style="zoom:${STATE.zoomLevel};">${formatarTextoComDestaque(q.rf, palavrasChaveDaRespostaCorreta(q))}</div>
          <div class="gab-line">Gabarito: ${gabaritoDestacado(gabaritoEfetivo(q))} · ${esc(q.td||'')} ${tendenciaQuente(q)?'⚠ alta recente':''}</div>
        </div>
      </div>
    </div>
    <div class="flip-hint">clique na carta ou tecle espaço/enter para virar · ← → para navegar</div>
    <div class="flash-controls">
      <button class="icon-btn" id="btn-flash-prev" title="Carta anterior" ${deck.idx===0?'disabled':''}>←</button>
      <button class="btn btn-ghost btn-sm" id="btn-flash-revisar">Marcar: revisar</button>
      <button class="btn btn-gold btn-sm" id="btn-flash-sei">Marcar: sei</button>
      <button class="icon-btn" id="btn-flash-next-arrow" title="Próxima carta" ${deck.idx===deck.uids.length-1?'disabled':''}>→</button>
    </div>
    <button class="btn btn-primary btn-sm" id="btn-flash-finalizar" style="margin-top:14px;">Encerrar baralho</button>
    <button class="icon-btn" id="btn-focus-toggle" title="${STATE.focusMode?'Sair do modo foco':'Modo foco (esconde menus)'}" style="margin-top:10px;">${STATE.focusMode?'✕':'◉'}</button>
  </div>
  `;
}

let selectedDeck = 'todas';
function startFlashDeck(){
  const escopoQ = questoesFiltradas();
  const bucket = getBucket(STATE.materia);
  let uids;
  if(selectedDeck==='revisar'){
    uids = escopoQ.filter(q=>bucket.flash[q.uid] && bucket.flash[q.uid].status==='revisar').map(q=>q.uid);
  } else if(selectedDeck==='novas'){
    uids = escopoQ.filter(q=>!bucket.flash[q.uid]).map(q=>q.uid);
  } else if(selectedDeck==='erradas'){
    uids = escopoQ.filter(q=>bucket.perguntas[q.uid] && bucket.perguntas[q.uid].ultimoResultado===false).map(q=>q.uid);
  } else {
    uids = escopoQ.map(q=>q.uid);
  }
  if(uids.length===0) uids = escopoQ.map(q=>q.uid);
  STATE.flashDeck = { uids: shuffle(uids), idx:0, flipped:false, materia: STATE.materia };
  render();
}

function flashGoPrev(){
  const deck = STATE.flashDeck;
  if(deck.idx>0){ deck.idx-=1; deck.flipped=false; render(); }
}
function flashGoNext(){
  const deck = STATE.flashDeck;
  if(deck.idx < deck.uids.length-1){ deck.idx+=1; deck.flipped=false; render(); }
  else { STATE.flashDeck = null; render(); }
}

