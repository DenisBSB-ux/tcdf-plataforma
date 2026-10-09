/* ================= QUIZ ================= */
// progresso da matéria inteira (resultado atual de cada questão), mostrado ao
// lado do horário de salvamento: Total / Certas / Erradas / %
// botão "Chute!": só aparece depois de responder, marca/desmarca a questão
// atual no histórico independente de chutes (não mexe em tentativas/acertos)
function btnChuteHtml(materiaKey, uid, revelado){
  if(!revelado) return '';
  const marcado = chuteMarcado(materiaKey, uid);
  return `<button class="icon-btn ${marcado?'btn-chute-ativo':''}" id="btn-chute" data-uid="${esc(uid)}" title="${marcado?'Desmarcar &quot;chutei essa&quot;':'Marcar que você chutou esta resposta (não afeta estatísticas de acerto)'}">🎲${marcado?' ✓':''}</button>`;
}
function renderProgressoMateriaToolbar(materiaKey){
  if(!materiaKey) return '';
  const s = computeSnapshotMateria(materiaKey);
  return `<span class="progresso-materia-toolbar" title="Progresso em ${esc(materiaKey)} (${s.totalPontuavel} questões): resultado atual de cada questão respondida">
    Total Respondidas: ${s.ac + s.erradas} · <span class="pm-certas">✓ ${s.ac}</span> · <span class="pm-erradas">✗ ${s.erradas}</span> · ${s.taxa}%
  </span>`;
}
function renderQuiz(){
  const quiz = STATE.quiz;
  if(quiz.finished) return renderResults();

  // remove uids repetidos da fila (mantém a primeira ocorrência) e ajusta a
  // posição atual se ela ficou fora dos limites
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

  // reconcilia a fila com as questões válidas ATUAIS da matéria: tira uids que
  // não existem mais e inclui os que faltam. Filas de "refazer erros"
  // (origemErros) são um subconjunto de propósito e não são tocadas.
  if(!quiz.origemErros && quiz.materia){
    const poolAtual = ALL_QUESTIONS.filter(q2=>q2.materia===quiz.materia && !q2.duplicataOculta && (q2.t==='CE'||q2.t==='MC'));
    const poolUids = new Set(poolAtual.map(q2=>q2.uid));
    const semOrfas = quiz.queue.filter(u=>poolUids.has(u));
    const queueUidsAtuais = new Set(semOrfas);
    const faltando = poolAtual.filter(q2=>!queueUidsAtuais.has(q2.uid)).map(q2=>q2.uid);
    // mantém a ordem escolhida ao criar o simulado ("Ordem das questões"): só
    // tira as órfãs e põe as que faltam no fim, na mesma ordem. Simulados
    // antigos (sem quiz.ordem) seguem pelo número da questão, como antes.
    const uidAtualAntes = quiz.queue[quiz.idx];
    let novaFila;
    if(quiz.ordem){
      const faltandoOrd = faltando.length ? ordenarFilaSimulado(faltando.map(u=>BY_UID[u]), quiz.materia, quiz.ordem).map(q2=>q2.uid) : [];
      novaFila = semOrfas.concat(faltandoOrd);
    } else {
      novaFila = [...semOrfas.concat(faltando)].sort((ua,ub)=>((BY_UID[ua]&&BY_UID[ua].n)||0)-((BY_UID[ub]&&BY_UID[ub].n)||0));
    }
    const mudouAlgo = novaFila.length !== quiz.queue.length || novaFila.some((u,i)=>u!==quiz.queue[i]);
    if(mudouAlgo){
      quiz.queue = novaFila;
      const novoIdx = quiz.queue.indexOf(uidAtualAntes);
      quiz.idx = novoIdx>=0 ? novoIdx : Math.max(0, Math.min(quiz.idx, quiz.queue.length-1));
      salvarQuizEmAndamento();
    }
  }

  // repõe respostas que já constam no histórico oficial da matéria mas não
  // neste objeto de quiz específico (ver armazenamento.js) -- sem isso, uma
  // questão já respondida podia voltar a aparecer "em branco" depois de
  // reordenar a fila ou retomar um simulado antigo
  if(curarRespostasDoHistorico(quiz)) salvarQuizEmAndamento();

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
  const emEdicaoAlt = edicaoAtual === uidAtual && q.t==='MC' && q.alt;
  // chip "🎲 chute" mostrado no lugar do botão depois que a questão já foi
  // respondida como chute (reaproveita o mesmo histórico independente)
  const chuteChip = chuteMarcado(quiz.materia, uidAtual)
    ? `<span class="review-chip review-study chute-chip-inline">🎲 chute</span>` : '';
  // botão "Chute": agora é um TOGGLE — clica em "Chute" primeiro (fica
  // destacado/armado), depois escolhe a resposta normalmente (Certo/Errado ou
  // uma letra); a resposta escolhida é que entra no histórico de chutes,
  // não uma resposta sorteada
  const chuteArmadoAqui = chuteArmado === uidAtual;
  // sem texto no botão — só o dado 🎲 (destacado em dourado quando armado);
  // mesmo tamanho dos demais botões de resposta (herda .ce-btn/.answer-opt)
  const btnChutarHtml = `<button class="answer-opt ce-btn ce-chute ${chuteArmadoAqui?'armado':''}" id="btn-chute-armar" title="${chuteArmadoAqui?'Cancelar o chute':'Marcar que a próxima resposta é um chute — escolha Certo/Errado ou a alternativa normalmente em seguida'}">
    <span class="letter">🎲</span>
  </button>`;
  const chuteHint = chuteArmadoAqui ? `<div class="chute-hint">🎲 Chute armado — agora escolha sua resposta</div>` : '';
  // "Dica de chute" (js/heuristica.js): só faz sentido ANTES de responder —
  // depois de revelado o gabarito já está ali, a dica perderia o sentido
  const dicaChuteBtnHtml = !revelado ? `<button class="icon-btn" id="btn-dica-chute" title="Dica de chute — estatística de como a questão foi escrita (não é IA, não analisa o conteúdo)">🎯</button>` : '';
  const dicaChutePainelHtmlAtual = (!revelado && dicaChuteAberta === uidAtual) ? dicaChutePanelHtml(q) : '';
  if(q.t === 'CE'){
    // modelo de layout: as duas opções ficam em linhas largas (letra C/E + texto);
    // depois de responder, a correta fica verde e a escolhida errada, vermelha
    const gCE = gEfetivo;
    optionsHtml = chuteHint + `<div class="ce-buttons-row">` + ['Certo','Errado'].map(opt=>{
      let cls='answer-opt ce-btn ' + (opt==='Certo' ? 'ce-certo' : 'ce-errado');
      if(revelado){
        const escolhida = opt===resposta.picked;
        if(escolhida) cls += ' picked';
        if(opt===gCE) cls += ' correct';
        else if(escolhida) cls += ' incorrect';
      }
      if(riscadas.includes(opt)) cls+=' riscado';
      return `<button class="${cls}" data-opt="${opt}" ${revelado?'disabled':''} title="${opt} (2 cliques risca)">
        <span class="letter">${opt==='Certo'?'C':'E'}</span><span class="opt-text">${opt}</span>
      </button>`;
    }).join('') + (revelado ? chuteChip : btnChutarHtml) + `</div>`;
  } else if(q.t==='MC' && q.alt){
    optionsHtml = chuteHint + q.alt.map((a,idx)=>{
      const letraUp = a.letra.toUpperCase();
      const customAlt = EDICOES_USUARIO[uidAtual] && EDICOES_USUARIO[uidAtual]['alt'+idx] && limparHtmlEditado(EDICOES_USUARIO[uidAtual]['alt'+idx]);
      const textoHtml = customAlt || esc(a.texto);
      if(emEdicaoAlt){
        return `<div class="answer-opt-edit">
          <span class="letter">${letraUp}</span>
          <div class="campo-editavel-conteudo" contenteditable="true" id="conteudo-alt${idx}-${esc(uidAtual)}" style="flex:1;">${textoHtml}</div>
        </div>`;
      }
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
        <span class="letter">${letraUp}</span> ${textoHtml}
      </button>`;
    }).join('') + (emEdicaoAlt ? '' : (revelado ? `<div class="chute-chip-row">${chuteChip}</div>` : btnChutarHtml));
  } else {
    optionsHtml = `<p style="font-size:13px;color:var(--ink-soft);padding:8px 0;">Questão sem gabarito identificado — não pontuável. Use as setas para navegar.</p>`;
  }
  optionsHtml += dicaChutePainelHtmlAtual;

  if(STATE.focusMode){
    // modo foco: sem menus nem paginação, mas com as informações da questão
    // (banca/cargo/ano, assunto, frequência/estimativa) e o progresso da
    // matéria na barra de baixo
    return `
    <div class="case-file focus-simple" style="zoom:${STATE.zoomLevel};">
      <div class="case-header">
        <div class="q-number-row">${bancaCargoAnoLine(q)}</div>
        ${q.tema && q.tema!=='Geral' ? `<div class="q-tema-line">${esc(q.tema)}</div>` : ''}
        <div class="q-estatistica-line">${narrativaBancaBanner(q)}</div>
      </div>
      <div class="case-body">
        <div class="enunciado ${revelado?'com-selo':''}">
          ${revelado ? `<div class="tag-cobranca-corner">${cobrancaTag(q)}</div>` : ''}
          ${blocoEnunciadoEditavel(q)}
        </div>
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
          ${btnChuteHtml(quiz.materia, uidAtual, revelado)}
          ${dicaChuteBtnHtml}
          <span class="toolbar-divider"></span>
          <button class="icon-btn" id="btn-focus-toggle" title="Sair do modo foco">✕</button>
          <button class="theme-toggle-btn" id="btn-theme-toggle" title="Alternar modo claro/escuro" style="width:36px;height:36px;">${STATE.theme==='light'?'🌙':'☀️'}</button>
          ${renderZoomControl()}
        </div>
        <div class="toolbar-meta-row">
          <span class="toolbar-meta-info">${renderProgressoMateriaToolbar(quiz.materia)}</span>
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

  const snapM = computeSnapshotMateria(quiz.materia);
  const resolvidasM = snapM.ac + snapM.erradas;
  return `
  <div class="qm-breadcrumb">Estudo <span>›</span> ${esc(quiz.materia||'')} <span>›</span> Questões</div>
  <div class="case-file">
    <div class="case-header qm-header">
      <div class="qm-title">
        <div class="qm-numero">Questão ${quiz.idx+1} de ${quiz.queue.length}
          <small>(${resolvidasM} Resolvidas, <b class="qm-ac">${snapM.ac}</b> Acertos e <b class="qm-er">${snapM.erradas}</b> Erros)</small></div>
        ${q.tema && q.tema!=='Geral' ? `<div class="qm-linha"><span class="qm-rot">Assunto:</span> ${esc(q.tema)}</div>` : ''}
      </div>
      <div class="qm-tags">
        ${freqBadge(q.fr)}
        ${ineditaBadge(q)}
        <div class="q-estatistica-line">${narrativaBancaBanner(q)}</div>
      </div>
    </div>
    <div class="qm-provabar">
      <div class="qm-prova">${bancaCargoAnoLine(q)}</div>
    </div>
    <div class="case-columns ${revelado?'revelado':'nao-revelado'}" style="zoom:${STATE.zoomLevel};">
      <div class="case-col-left">
        <div class="case-body">
          <div class="enunciado ${isInedita(q)?'is-inedita':''} ${revelado?'com-selo':''}">
            ${revelado ? `<div class="tag-cobranca-corner">${cobrancaTag(q)}</div>` : ''}
            ${blocoEnunciadoEditavel(q)}
          </div>
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
        ${btnChuteHtml(quiz.materia, uidAtual, revelado)}
        ${dicaChuteBtnHtml}
        <button class="icon-btn" id="btn-focus-toggle" title="${STATE.focusMode?'Sair do modo foco':'Modo foco (esconde menus)'}">${STATE.focusMode?'✕':'◉'}</button>
        <button class="icon-btn" id="btn-abandonar" title="Voltar ao painel — o progresso já foi salvo automaticamente">↩</button>
        <span class="toolbar-divider"></span>
        ${renderZoomControl()}
      </div>
      <div class="toolbar-meta-row">
        <div class="progress-bar" style="max-width:220px;"><div class="fill" style="width:${progressPct}%"></div></div>
        <span class="toolbar-meta-info">
          ${quiz.ultimoSalvamento ? `<span class="kbd-hint" title="Salvo automaticamente neste aparelho a cada resposta">💾 ${formatarDataHoraSalvamento(quiz.ultimoSalvamento)}</span>` : ''}
          ${(()=>{ const e = estadoSincronizacaoProgresso(); return `<span id="indicador-nuvem" class="indicador-nuvem ${e.classe}" title="${esc(e.texto)}">${e.icone}</span>`; })()}
        </span>
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

// campo editável: mostra o HTML salvo pelo usuário (sanitizado), senão a
// formatação automática (termos decisivos + palavras-chave do gabarito).
// Um único "Editar questão" (edicaoAtual = uid) põe enunciado, resolução e
// resumo flash em edição juntos; o mesmo bloco serve aos modos Normal e Foco.
function editorToolbarHtml(uid){
  return `<div class="editor-toolbar">
    <button data-editar-acao="bold" title="Negrito"><b>B</b></button>
    <button data-editar-acao="italic" title="Itálico"><i>I</i></button>
    <button data-editar-acao="underline" title="Sublinhado"><u>U</u></button>
    <button data-editar-acao="strike" title="Tachado"><s>S</s></button>
    <span class="editor-toolbar-sep"></span>
    <select data-editar-acao="fontsize" class="editor-font-size" title="Tamanho da fonte (em pixels) do trecho selecionado">
      <option value="">Aa ▾</option>
      <option value="12">12</option>
      <option value="14">14</option>
      <option value="16">16</option>
      <option value="18">18</option>
      <option value="20">20</option>
      <option value="24">24</option>
      <option value="28">28</option>
      <option value="32">32</option>
    </select>
    <span class="editor-toolbar-sep"></span>
    <button data-editar-acao="highlight" data-cor="#fff3b0" class="swatch-amarelo" title="Grifar em amarelo"></button>
    <button data-editar-acao="highlight" data-cor="#c8e6c9" class="swatch-verde" title="Grifar em verde"></button>
    <button data-editar-acao="highlight" data-cor="#bbdefb" class="swatch-azul" title="Grifar em azul"></button>
    <button data-editar-acao="highlight" data-cor="#f8bbd0" class="swatch-rosa" title="Grifar em rosa"></button>
    <span class="editor-toolbar-sep"></span>
    <button data-editar-acao="ul" title="Lista com marcadores">• Lista</button>
    <button data-editar-acao="ol" title="Lista numerada">1. Lista</button>
    <button data-editar-acao="citacao" title="Citação em bloco">❝</button>
    <span class="editor-toolbar-sep"></span>
    <button data-editar-acao="desfazer" title="Desfazer (Ctrl+Z)">↶</button>
    <button data-editar-acao="refazer" title="Refazer (Ctrl+Y)">↷</button>
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
  // A finalização é automática (ver pickAnswer). Se a última posição da fila
  // foi respondida mas ainda há questões puladas, mostra um botão pra ir à
  // primeira não respondida.
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
  registrarResultadoHeuristica(q); // js/heuristica.js — autoavaliação da "dica de chute" com o uso real
  if(dicaChuteAberta === uid) dicaChuteAberta = null;
  // se o "Chute" estava armado pra esta questão, a resposta que acabou de ser
  // escolhida é que entra no histórico de chutes — e desarma pra próxima
  if(chuteArmado === uid){ toggleChute(quiz.materia, uid, correct); chuteArmado = null; }
  // finaliza sozinho assim que todas as questões da fila foram respondidas, em
  // qualquer ordem
  if(Object.keys(quiz.respostas).length >= quiz.queue.length){
    finalizarQuiz();
    return;
  }
  salvarQuizEmAndamento();
  render();
}

// botão "Chute": armar/desarmar — não responde sozinho, só marca que a
// PRÓXIMA escolha (Certo/Errado ou uma letra) deve contar como chute
function toggleChuteArmado(){
  const quiz = STATE.quiz;
  if(!quiz) return;
  const uid = quiz.queue[quiz.idx];
  if(quiz.respostas[uid]) return;
  chuteArmado = (chuteArmado===uid) ? null : uid;
  render();
}

// botão "Dica de chute" (🎯, js/heuristica.js): abre/fecha o painel com a
// estatística — não responde nada, só mostra texto. Só faz sentido antes de
// a questão estar revelada (senão o gabarito real já está ali do lado)
function toggleDicaChute(){
  const quiz = STATE.quiz;
  if(!quiz) return;
  const uid = quiz.queue[quiz.idx];
  if(quiz.respostas[uid]) return;
  dicaChuteAberta = (dicaChuteAberta===uid) ? null : uid;
  render();
}

function goPrev(){
  const quiz = STATE.quiz;
  if(quiz.idx>0){ chuteArmado=null; dicaChuteAberta=null; quiz.idx -= 1; salvarQuizEmAndamento(); render(); }
}
function goNext(){
  const quiz = STATE.quiz;
  if(quiz.idx < quiz.queue.length-1){ chuteArmado=null; dicaChuteAberta=null; quiz.idx += 1; salvarQuizEmAndamento(); render(); }
}
function goToQuestion(i){
  const quiz = STATE.quiz;
  if(i>=0 && i<quiz.queue.length){ chuteArmado=null; dicaChuteAberta=null; quiz.idx = i; salvarQuizEmAndamento(); render(); }
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
  // cada questão conta uma vez, pelo resultado mais recente — mesma definição
  // do "Acerto geral" do topo
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

// histórico independente de marcações "Chute!" — não entra nas estatísticas
// de tentativas/acertos, só mostra onde o usuário sinalizou que respondeu
// sem segurança no conteúdo (mesmo que tenha acertado)
function getCadernoChutes(){
  if(!STATE.materia) return [];
  const bucket = getBucket(STATE.materia);
  const scopeUids = scopeUidsComHistorico();
  return Object.entries(bucket.chutes || {})
    .filter(([uid]) => scopeUids.has(uid) && BY_UID[uid])
    .map(([uid,c]) => ({ uid, c }))
    .sort((a,b)=> (b.c.ts||0) - (a.c.ts||0));
}

function refazerTodasChutes(){
  const uids = getCadernoChutes().map(e=>e.uid);
  if(uids.length===0) return;
  setLocalTab(STATE.materia, 'simulado');
  STATE.quiz = { queue: shuffle(uids), idx:0, respostas:{}, finished:false, materia: STATE.materia, tema: STATE.tema, origemErros:true };
  salvarQuizEmAndamento();
  render();
}

function renderErros(){
  const lista = getCadernoErros();
  const chutes = getCadernoChutes();
  if(lista.length===0 && chutes.length===0){
    return emptyState('🗂️','Caderno de erros vazio',`As questões que você errar em "${esc(STATE.materia||'')}" aparecem aqui automaticamente. Acerte-as novamente para removê-las da lista.`);
  }
  let html = `<div class="section-eyebrow">${esc(STATE.materia)}</div>
  <h2 class="section-title">Caderno de erros</h2>`;

  if(lista.length){
    html += `<p class="section-desc">${lista.length} questão(ões) com o último resultado registrado como erro${STATE.tema!=='todos'?` no assunto ${esc(STATE.tema)}`:''}. Refaça-as para atualizar o status.</p>

    ${lista.map(({uid,p})=>{
      const q = BY_UID[uid];
      // só o texto da questão (sem estrelas, tendência, tentativas, banca, assunto)
      return `<div class="error-row">
        <span class="num">${esc(String(q.n).padStart(3,'0'))}</span>
        ${cobrancaTag(q) || `<span class="tag tag-cobranca-ausente" title="Esta questão ainda não tem o rótulo de tipo de cobrança (Literal, Interpretativa etc.) classificado">❔ Sem rótulo</span>`}
        <div class="summary">${esc(limparEnunciado(q.q, q.t) || q.rf || '')}</div>
        <button class="btn btn-gold btn-sm" data-refazer="${uid}">Refazer</button>
      </div>`;
    }).join('')}

    <button class="btn btn-primary" id="btn-refazer-todas" style="margin-top:14px;">Refazer todas (${lista.length})</button>`;
  }

  if(chutes.length){
    html += `<h3 class="section-title" style="margin-top:${lista.length?'32px':'0'};font-size:16px;">🎲 Chutes (${chutes.length})</h3>
    <p class="section-desc">Questões marcadas como "chutei essa" — histórico independente dos erros, útil pra ver onde a resposta certa não veio de domínio real do conteúdo.</p>

    ${chutes.map(({uid,c})=>{
      const q = BY_UID[uid];
      const statusChip = c.correct===true ? `<span class="review-chip review-know" style="margin-right:8px;">acertou</span>`
        : c.correct===false ? `<span class="review-chip review-study" style="margin-right:8px;">errou</span>` : '';
      return `<div class="error-row">
        <span class="num">${esc(String(q.n).padStart(3,'0'))}</span>
        ${statusChip}
        ${cobrancaTag(q) || `<span class="tag tag-cobranca-ausente" title="Esta questão ainda não tem o rótulo de tipo de cobrança (Literal, Interpretativa etc.) classificado">❔ Sem rótulo</span>`}
        <div class="summary">${esc(limparEnunciado(q.q, q.t) || q.rf || '')}</div>
        <button class="btn btn-ghost btn-sm" data-desmarcar-chute="${uid}" title="Remover da lista de chutes">✕ Desmarcar</button>
        <button class="btn btn-gold btn-sm" data-refazer="${uid}">Refazer</button>
      </div>`;
    }).join('')}

    <button class="btn btn-primary" id="btn-refazer-chutes" style="margin-top:14px;">Refazer todos os chutes (${chutes.length})</button>`;
  }

  return html;
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
// texto efetivo de um campo: a edição manual do usuário, se existir, senão o
// original — o download mantém as alterações feitas na tela
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
    md += `**ID:** ${q.uid}\n`;
    md += `**Banca/Cargo:** ${q.bc||'—'}\n`;
    md += `**Ano:** ${anoRealDaQuestao(q)||'—'} | **Nível:** ${NIVEL_LABEL[q.nv]||'Média'} | **Tendência:** ${tendenciaCurta(q.td)}\n`;
    md += `**Assunto:** ${q.tema||'Geral'}\n`;
    { const cobv = (typeof COBRANCA!=='undefined' && COBRANCA[q.uid]) || q.cob; if(cobv) md += `**Cobrança:** ${cobv}\n`; }
    md += `\n`;
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

// tela única: baralho (filtro) + card ficam na MESMA tela — sem etapa
// separada de "Começar revisão". A faixa de filtro fica sempre visível acima
// do card e trocar de chip já reconstrói o baralho e mostra a 1ª carta.
function renderFlashcards(){
  const escopoQ = questoesFiltradas();
  const bucket = STATE.materia ? getBucket(STATE.materia) : { flash:{}, perguntas:{} };
  const revisar = escopoQ.filter(q=>bucket.flash[q.uid] && bucket.flash[q.uid].status==='revisar').length;
  const naoVistas = escopoQ.filter(q=>!bucket.flash[q.uid]).length;
  const erradasFlash = escopoQ.filter(q=>bucket.perguntas[q.uid] && bucket.perguntas[q.uid].ultimoResultado===false).length;
  // se o baralho selecionado anteriormente não existe mais nesta matéria/assunto
  // (ex.: era "erradas" mas agora não há nenhuma errada aqui), volta pra "todas"
  if(selectedDeck==='erradas' && erradasFlash===0) selectedDeck = 'todas';

  // garante que sempre exista um baralho pronto pra matéria/assunto atuais —
  // monta sozinho na primeira vez (ou quando a matéria mudou), sem precisar
  // de clique prévio
  if(!STATE.flashDeck || STATE.flashDeck.materia !== STATE.materia || STATE.flashDeck.escopoAssunto !== STATE.tema){
    buildFlashDeck();
  }

  const filtroHtml = `
    <div class="flash-filtros">
      <span class="chip ${selectedDeck==='todas'?'selected':''}" data-deck="todas">Todas (${escopoQ.length})</span>
      <span class="chip ${selectedDeck==='revisar'?'selected':''}" data-deck="revisar">Revisar (${revisar})</span>
      <span class="chip ${selectedDeck==='novas'?'selected':''}" data-deck="novas">Não vistas (${naoVistas})</span>
      ${erradasFlash>0 ? `<span class="chip ${selectedDeck==='erradas'?'selected':''}" data-deck="erradas">Erradas (${erradasFlash})</span>` : ''}
    </div>`;

  if(escopoQ.length===0){
    return `
    <div class="section-eyebrow">${esc(STATE.materia||'')}</div>
    <h2 class="section-title">Flashcards</h2>
    <p class="section-desc">Nenhuma questão disponível neste escopo para gerar flashcards.</p>
    `;
  }

  const deck = STATE.flashDeck;
  const uid = deck.uids[deck.idx];
  const q = BY_UID[uid];
  const bucketD = getBucket(deck.materia);
  const status = bucketD.flash[uid] && bucketD.flash[uid].status;
  const progressPct = pct(deck.idx+1, deck.uids.length);

  // edição do flashcard: reaproveita a mesma infraestrutura de edição das
  // questões (EDICOES_USUARIO, editorToolbarHtml, limparHtmlEditado) — o
  // botão "Salvar" da barra já grava qualquer campo "conteudo-{campo}-{uid}"
  // presente na página, então um único toolbar no verso cobre os dois lados
  const emEdicao = edicaoAtual === uid;
  const customQ = EDICOES_USUARIO[uid] && limparHtmlEditado(EDICOES_USUARIO[uid]['q']);
  const customRf = EDICOES_USUARIO[uid] && limparHtmlEditado(EDICOES_USUARIO[uid]['rf']);
  const qHtml = customQ || destacarTermosDecisivos(esc(limparEnunciado(q.q, q.t)));
  const rfHtml = customRf || formatarTextoComDestaque(q.rf, palavrasChaveDaRespostaCorreta(q));

  return `
  <div class="flash-stage">
    <div class="section-eyebrow">${esc(STATE.materia||'')}</div>
    <h2 class="section-title">Flashcards</h2>
    ${filtroHtml}
    <div class="flash-header">
      <div class="flash-counter">CARTA ${deck.idx+1} DE ${deck.uids.length} · QUESTÃO Nº ${q.n}${q.tema && q.tema!=='Geral'?` · ${esc(q.tema)}`:''}</div>
      ${renderZoomControl()}
    </div>
    <div class="progress-bar flash-progress"><div class="fill" style="width:${progressPct}%"></div></div>
    <div class="flashcard ${deck.flipped?'flipped':''} ${emEdicao?'editando':''}" id="flashcard">
      <div class="flashcard-inner">
        <div class="flashcard-face flashcard-front">
          ${status ? `<span class="review-chip ${status==='sei'?'review-know':'review-study'}">${status==='sei'?'Sei':'Revisar'}</span>` : ''}
          ${emEdicao
            ? `<div class="flashcard-edit-area">${editorToolbarHtml(uid)}<div class="campo-editavel-conteudo" contenteditable="true" id="conteudo-q-${esc(uid)}">${qHtml}</div></div>`
            : `<div class="q-text" style="zoom:${STATE.zoomLevel};">${qHtml}</div>`}
          ${emEdicao ? '' : `<div class="flip-badge" title="Clique na carta ou tecle espaço/enter para virar">🔄 virar</div>`}
        </div>
        <div class="flashcard-face flashcard-back">
          <span class="lbl">Resumo flash</span>
          ${emEdicao
            ? `<div class="campo-editavel-conteudo" contenteditable="true" id="conteudo-rf-${esc(uid)}" style="flex:1;">${rfHtml}</div>`
            : `<div class="rf-text" style="zoom:${STATE.zoomLevel};">${rfHtml}</div>`}
          <div class="gab-line">Gabarito: ${gabaritoDestacado(gabaritoEfetivo(q))} · ${esc(q.td||'')} ${tendenciaQuente(q)?'⚠ alta recente':''}</div>
        </div>
      </div>
    </div>
    <div class="flip-hint">${emEdicao ? 'clique na carta (fora do texto) pra ver o outro lado enquanto edita' : '← → para navegar · espaço/enter para virar'}</div>
    <div class="flash-controls">
      <div class="flash-controls-nav">
        <button class="icon-btn" id="btn-flash-prev" title="Carta anterior" ${deck.idx===0 || emEdicao?'disabled':''}>←</button>
        ${emEdicao ? '' : `<button class="icon-btn" id="btn-editar-flash" data-uid="${esc(uid)}" title="Editar o enunciado e o resumo flash deste flashcard">✏️</button>`}
      </div>
      <div class="flash-controls-marcar">
        <button class="btn btn-ghost btn-sm" id="btn-flash-revisar" ${emEdicao?'disabled':''}>Marcar: revisar</button>
        <button class="btn btn-gold btn-sm" id="btn-flash-sei" ${emEdicao?'disabled':''}>Marcar: sei</button>
      </div>
      <div class="flash-controls-nav">
        <button class="icon-btn" id="btn-focus-toggle" title="${STATE.focusMode?'Sair do modo foco':'Modo foco (esconde menus)'}">${STATE.focusMode?'✕':'◉'}</button>
        <button class="icon-btn" id="btn-flash-next-arrow" title="Próxima carta" ${deck.idx===deck.uids.length-1 || emEdicao?'disabled':''}>→</button>
      </div>
    </div>
    <button class="btn btn-ghost btn-sm" id="btn-flash-finalizar" style="margin-top:12px;" ${emEdicao?'disabled':''}>Encerrar baralho</button>
  </div>
  `;
}

let selectedDeck = 'todas';
// monta STATE.flashDeck a partir do filtro atual (selectedDeck) — sem
// disparar render() sozinho, pra poder ser chamada tanto no meio de uma
// renderização (renderFlashcards, quando falta baralho) quanto a partir de
// um clique (que aí chama render() por conta própria)
function buildFlashDeck(){
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
  STATE.flashDeck = { uids: shuffle(uids), idx:0, flipped:false, materia: STATE.materia, escopoAssunto: STATE.tema };
}
// clique num chip de filtro: troca o baralho na hora, sem etapa intermediária
function trocarBaralhoFlash(deckKey){
  selectedDeck = deckKey;
  buildFlashDeck();
  render();
}
function startFlashDeck(){
  buildFlashDeck();
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

