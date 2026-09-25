/* ================= PÁGINA DE IMPORTAÇÃO (global, cria novas abas macro) ================= */
function renderImportarPage(){
  const materiasImportadas = materiasGerenciaveis();
  const vazio = ALL_QUESTIONS.length===0;
  return `
  <div class="app-shell">
    <div class="main-content" style="grid-column:1 / -1;">
      <div class="panel"><div class="pad">
        <div class="section-eyebrow">Anexação de novo processo</div>
        <h2 class="section-title">Importar questões (.txt)</h2>
        ${fbAuth ? `<div class="import-conta" style="margin:8px 0 14px;max-width:360px;">${renderContaBlock()}</div>` : ''}
        <div class="import-field">
          <label>Nome da matéria (vira o nome da aba)</label>
          <input type="text" id="input-assunto-nome" placeholder="Ex.: Regimento Interno do TCDF" value="${esc(STATE.importDeckName)}">
        </div>

        <div class="upload-zone" id="upload-zone">
          <div class="glyph">📄</div>
          <h3>Arraste o .txt, .pdf ou .md aqui</h3>
          <p>ou escolha o arquivo abaixo</p>
          <input type="file" id="file-input" accept=".txt,text/plain,.pdf,application/pdf,.md,text/markdown">
        </div>
        <div class="upload-source-row">
          <button type="button" class="side-action-btn" id="btn-buscar-computador">💻 Buscar no computador</button>
        </div>
        <p class="upload-source-note">Aceita arquivos .txt, .pdf ou .md. Em PDFs, o texto é extraído automaticamente — funciona bem com PDFs de texto selecionável; PDFs que são apenas imagens escaneadas (sem camada de texto) não são suportados. Arquivos .md devem seguir o formato gerado pelo botão "⬇ Baixar" de cada matéria (útil pra editar as questões num editor de texto e reimportar depois). Se o nome da matéria ficar em branco, ele será derivado do nome do arquivo.</p>

        ${STATE.importPendente ? renderImportPendente() : ''}
        ${STATE.importSemelhante ? renderImportSemelhante() : ''}
        ${STATE.importLog ? renderImportLog() : ''}

        ${renderAvisoMateriasDuplicadas()}
        ${materiasImportadas.length ? `<div class="card-block" style="margin-top:24px;">
          <h3>Matérias</h3>
          <p style="font-size:12px;color:var(--ink-soft);margin-bottom:14px;">Todas as matérias — inclusive as que já vêm com a plataforma — ficam disponíveis pra todo mundo automaticamente assim que importadas. Use "Inserir" pra adicionar questões novas a uma matéria já existente (sem apagar as antigas nem o histórico de progresso), ou "Remover" pra excluir a matéria por completo.</p>
          <input type="file" id="file-input-atualizar" accept=".txt,text/plain,.pdf,application/pdf,.md,text/markdown" style="display:none;">
          ${materiasImportadas.map(m=>{
            const n = ALL_QUESTIONS.filter(q=>q.materia===m).length;
            const ultimaAtualizacao = MATERIA_ULTIMA_ATUALIZACAO[m];
            const numDuplicatas = detectarDuplicatasDaMateria(m).reduce((soma,g)=>soma + (g.length-1), 0);
            const dedupInfo = STATE.dedupInfo && STATE.dedupInfo.materia===m ? STATE.dedupInfo : null;
            const ativa = m===STATE.materia;
            return `<div class="bar-row" style="flex-wrap:wrap;${ativa?'background:var(--gold-soft, #fdf1de);border:1px solid var(--gold-bright, #c9a227);':''}">
              <div class="name" style="${ativa?'font-weight:700;':''}">${ativa?'▸ ':''}${esc(m)}</div>
              <div class="pct" style="margin-right:8px;">${n} questão(ões)</div>
              ${ultimaAtualizacao ? `<div style="font-size:11px;color:var(--ink-soft);margin-right:8px;" title="Última atualização desta matéria">🕒 ${formatarDataHoraSalvamento(ultimaAtualizacao)}</div>` : ''}
              <button class="btn-outline" data-download-materia="${esc(m)}" style="padding:4px 10px;font-size:11px;" title="Baixa todas as questões dessa matéria em Markdown">⬇ Baixar</button>
              <button class="btn-outline" data-inserir-materia="${esc(m)}" style="padding:4px 10px;font-size:11px;" title="Adiciona questões novas a essa matéria, sem apagar as que já existem nem o histórico de progresso">➕ Inserir</button>
              ${numDuplicatas>0 ? `<button class="btn-outline" data-remover-duplicatas="${esc(m)}" style="padding:4px 10px;font-size:11px;border-color:var(--stamp-red);color:var(--stamp-red);" title="Detectadas questões repetidas (mesmo enunciado) dentro desta matéria — remove as cópias extras, mantendo o histórico de progresso">🧹 ${numDuplicatas} duplicata(s)</button>` : ''}
              <button class="btn-outline" data-renomear-materia="${esc(m)}" style="padding:4px 10px;font-size:11px;" title="Muda o nome de exibição desta matéria, mantendo as questões e o progresso">✏️ Renomear</button>
              <button class="btn-outline" data-buscar-substituir-materia="${esc(m)}" style="padding:4px 10px;font-size:11px;" title="Corrige um texto/artefato que se repete em várias questões desta matéria (ex.: uma palavra ou trecho colado por engano na geração)">🔍 Buscar e substituir</button>
              ${materiasImportadas.length>1 ? `<button class="btn-outline" data-mesclar-materia="${esc(m)}" style="padding:4px 10px;font-size:11px;" title="Use se esta matéria for a MESMA coisa que outra, só com nome diferente (ex.: &quot;LO TCDF&quot; e &quot;Lei Orgânica do TCDF&quot;) — junta tudo numa só, mantendo a versão mais atual de cada questão e somando o progresso">🔗 Mesclar</button>` : ''}
              <button class="btn-outline" data-remover-materia="${esc(m)}" style="padding:4px 10px;font-size:11px;">Remover</button>
              ${dedupInfo ? `<div style="flex-basis:100%;font-size:11px;margin-top:4px;color:var(--stamp-green, #3a9d5c);">✅ ${dedupInfo.removidas} questão(ões) duplicada(s) removida(s)${dedupInfo.publicadoOk===false?' (falha ao publicar na nuvem: '+esc(dedupInfo.motivoPublicacao||'')+' — já está salvo neste dispositivo)':''}.</div>` : ''}
            </div>`;
          }).join('')}
          <button class="btn-outline" id="btn-salvar-tudo" style="margin-top:10px;padding:6px 14px;font-size:12px;font-weight:600;" title="Força salvar TODAS as matérias agora (local + nuvem) numa vez só — use depois de importar, antes de atualizar a página" ${STATE.salvandoTudo?'disabled':''}>${STATE.salvandoTudo?'⏳ Salvando tudo…':'💾 Salvar tudo'}</button>
          ${STATE.ultimoSalvamentoGeral ? `<div style="font-size:11px;margin-top:4px;color:${STATE.ultimoSalvamentoGeral.ok?'var(--stamp-green, #3a9d5c)':'var(--stamp-red)'};">${STATE.ultimoSalvamentoGeral.ok?'✅ '+STATE.ultimoSalvamentoGeral.qtdMaterias+' matéria(s) salva(s) com sucesso ('+new Date(STATE.ultimoSalvamentoGeral.ts).toLocaleTimeString('pt-BR')+') — pode atualizar a página com segurança.':'❌ Falha ao salvar: '+esc(STATE.ultimoSalvamentoGeral.motivo||'motivo desconhecido')}</div>` : ''}
        </div>` : ''}

        ${false ? `<div class="card-block" style="margin-top:10px;">
          <p style="font-size:12.5px;color:var(--ink-soft);margin-bottom:14px;">O progresso é salvo automaticamente (a cada minuto e a cada resposta). Use os botões abaixo apenas se quiser um arquivo de backup extra, ou para levar o progresso manualmente para outro computador sem usar a sincronização em nuvem.</p>
          <button class="side-action-btn" id="btn-exportar-progresso" title="Baixa um arquivo .json com todo o seu progresso">⬇ Exportar backup</button>
          <button class="side-action-btn" id="btn-importar-progresso" title="Carrega um backup .json exportado anteriormente">⬆ Importar backup</button>
          <input type="file" id="file-input-progresso" accept=".json,application/json" style="display:none;">
          ${STATE.importProgressoLog ? (STATE.importProgressoLog.ok
            ? `<div class="side-status ok">✓ backup importado</div>`
            : `<div class="side-status err">${esc(STATE.importProgressoLog.error||'')}</div>`) : ''}
        </div>` : ''}

        ${!vazio ? `<button class="btn btn-ghost" id="btn-voltar-materia" style="margin-top:20px;">← Voltar para "${esc(STATE.materia||'')}"</button>` : ''}
      </div></div>
    </div>
  </div>
  `;
}

function renderImportLog(){
  const log = STATE.importLog;
  if(log.pending){
    return `<div class="import-log ok"><b>⏳ ${esc(log.msg||'Processando…')}</b></div>`;
  }
  if(log.error){
    return `<div class="import-log err"><b>Falha na importação.</b> ${esc(log.error)}</div>`;
  }
  if(log.modo==='mesclar'){
    return `<div class="import-log ok">
      <b>🔗 Mesclado em "${esc(log.materia)}"</b> — ${log.fundidas||0} questão(ões) reconhecidas como já existentes (mantida a versão mais atual + progresso somado) e ${log.movidas||0} questão(ões) novas adicionadas. Nenhuma matéria separada foi criada.
    </div>`;
  }
  return `<div class="import-log ok">
    <b>${log.importadas} questão(ões) importada(s)</b> para a matéria "${esc(log.materia)}"${log.modo==='substituir' ? ' (substituindo o conteúdo anterior)' : ''}.
    ${log.puladasPorJaExistir ? `<br>${log.puladasPorJaExistir} questão(ões) já existiam nesta matéria (mesmo enunciado) e foram puladas — não duplicadas.` : ''}
    ${log.progressosMantidos ? `<br>Progresso mantido em ${log.progressosMantidos} questão(ões) que já existiam.` : ''}
    ${log.semGabarito ? `<br>${log.semGabarito} questão(ões) foram importadas mas <b>sem gabarito identificado</b> (não entram no simulado) — confira o formato de "gabarito" nesse arquivo.` : ''}
    ${log.ignoradas ? `<br>${log.ignoradas} bloco(s) ignorado(s) (status diferente de "Válida" ou fora do padrão).` : ''}
    ${log.publicadoAutomaticamente===true ? `<br><b>🌐 Publicada automaticamente</b> — já está visível pra qualquer visitante do site.` : ''}
    ${log.publicadoAutomaticamente===false ? `<br><span style="color:var(--stamp-red);">⚠ Não foi possível publicar na nuvem agora (${esc(log.erroPublicacao||'')}). Está salvo neste dispositivo e será publicado automaticamente assim que a nuvem responder — não reimporte.</span>` : ''}
  </div>
  ${log.amostra && log.amostra.length ? `<div class="import-list">
    ${log.amostra.map(s=>`<div class="imp-row"><span>Questão original nº <b>${s.n}</b></span><span>${esc(s.tipo)}</span></div>`).join('')}
  </div>` : ''}`;
}

// painel de confirmação exibido quando a matéria sendo importada já existe —
// existe justamente pra nunca mais duplicar silenciosamente (ver processImportedText)
function renderImportPendente(){
  const p = STATE.importPendente;
  if(!p) return '';
  return `<div class="import-log" style="border-color:var(--stamp-red);">
    <b>⚠️ A matéria "${esc(p.materiaNome)}" já tem ${p.existentesCount} questão(ões).</b>
    <br>Este arquivo tem ${p.results.length} questão(ões) reconhecida(s). O que você quer fazer?
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;">
      <button id="btn-import-substituir" class="btn-primary" style="padding:6px 14px;font-size:12px;">🔁 Substituir tudo (remove as ${p.existentesCount} antigas, usa só as novas)</button>
      <button id="btn-import-somar" class="btn-outline" style="padding:6px 14px;font-size:12px;">➕ Somar só as novas (pula as que já existem, pelo número da questão)</button>
      <button id="btn-import-cancelar" class="btn-outline" style="padding:6px 14px;font-size:12px;">Cancelar</button>
    </div>
  </div>`;
}

function renderImportSemelhante(){
  const p = STATE.importSemelhante;
  if(!p) return '';
  return `<div class="import-log" style="border-color:var(--stamp-red);">
    <b>⚠️ Este conteúdo parece ser o mesmo de "${esc(p.materiaExistente)}"</b> (~${Math.round(p.pct*100)}% das questões batem com uma matéria já existente).
    <br>Importar com o nome "${esc(p.materiaNome)}" criaria uma matéria SEPARADA com o mesmo conteúdo (é assim que duplicatas de nome diferente aparecem). O que você quer fazer?
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;">
      <button id="btn-import-mesclar-existente" class="btn-primary" style="padding:6px 14px;font-size:12px;">🔗 Mesclar em "${esc(p.materiaExistente)}" (mantém a versão mais atual de cada questão + todo o progresso)</button>
      <button id="btn-import-criar-separada" class="btn-outline" style="padding:6px 14px;font-size:12px;">Criar como matéria separada mesmo assim</button>
      <button id="btn-import-semelhante-cancelar" class="btn-outline" style="padding:6px 14px;font-size:12px;">Cancelar</button>
    </div>
  </div>`;
}

/* --- parser de txt --- */
function lineField(re, text){
  const m = text.match(re);
  return m ? m[1].trim() : null;
}
function blockField(name, text){
  const re = new RegExp('\\['+name+'\\]:\\s*\\n?([\\s\\S]*?)(?=\\n\\[[A-ZÀÁÂÃÉÍÓÔÕÚa-zçã ]+\\]:|$)', 'i');
  const m = text.match(re);
  return m ? m[1].trim() : null;
}

// campo de bloco no formato Markdown (### Rótulo\nconteúdo), até o próximo ###,
// --- (separador de questão) ou um campo em negrito (**Rótulo:**)
function blockFieldMd(name, text){
  const re = new RegExp('###\\s*'+name+'\\s*\\n([\\s\\S]*?)(?=\\n###\\s|\\n---|\\n\\*\\*|$)', 'i');
  const m = text.match(re);
  return m ? m[1].trim() : null;
}

// parser do formato Markdown gerado pelo botão de download da própria
// plataforma ("⬇ Baixar lista de questões") — permite reimportar depois de
// editar manualmente num editor de texto/Markdown qualquer
function parseMarkdownQuestoes(content){
  const results = [];
  let ignoradas = 0;
  let semGabarito = 0;
  const blocos = content.split(/\n(?=##\s*QUEST[ÃA]O\s+\d+)/i).filter(b => /##\s*QUEST[ÃA]O\s+\d+/i.test(b));
  blocos.forEach(bloco=>{
    const numMatch = bloco.match(/##\s*QUEST[ÃA]O\s+(\d+)/i);
    if(!numMatch){ ignoradas++; return; }
    const n = parseInt(numMatch[1], 10);
    const bancaCargoMatch = bloco.match(/\*\*Banca\/Cargo:\*\*\s*(.+)/i);
    const bancaCargoTxt = bancaCargoMatch ? bancaCargoMatch[1].trim() : '';
    const anoMatch = bloco.match(/\*\*Ano:\*\*\s*(\d{4})/i);
    const ano = anoMatch ? parseInt(anoMatch[1], 10) : null;
    const nivelMatch = bloco.match(/\*\*N[ií]vel:\*\*\s*(\w+)/i);
    const nivelTxt = nivelMatch ? nivelMatch[1].trim().toLowerCase() : '';
    const nivel = nivelTxt.includes('alta') ? 'alta' : (nivelTxt.includes('baixa') ? 'baixa' : 'media');
    const tendMatch = bloco.match(/\*\*Tend[êe]ncia:\*\*\s*(\w+)/i);
    const tendTxt = tendMatch ? tendMatch[1].trim().toLowerCase() : '';
    const tendencia = tendTxt.includes('cresc') ? '↑ Crescente' : (tendTxt.includes('decresc') ? '↓ Decrescente' : '→ Estável');
    const assuntoMatch = bloco.match(/\*\*Assunto:\*\*\s*(.+)/i);
    const assunto = assuntoMatch ? assuntoMatch[1].trim() : null;

    const enunciado = blockFieldMd('Enunciado', bloco);
    const resolucao = blockFieldMd('Resolu[çc][ãa]o', bloco);
    const resumo = blockFieldMd('Resumo Flash', bloco);

    // cada alternativa termina na próxima alternativa, no campo Gabarito, numa
    // linha vazia ou no fim do bloco; cada letra só vale na primeira ocorrência
    // (evita texto repetido/colado depois da última alternativa entrar nela)
    const altMatches = [...bloco.matchAll(/-\s*\*\*([A-E])\)\*\*\s*([\s\S]+?)(?=\s*-\s*\*\*[A-E]\)\*\*|\s*###\s*Alternativas|\s*\*\*Gabarito:\*\*|\n\s*\n|$)/gi)];
    const letrasVistas = new Set();
    const altMatchesUnicas = altMatches.filter(m=>{
      const letra = m[1].toUpperCase();
      if(letrasVistas.has(letra)) return false;
      letrasVistas.add(letra);
      return true;
    });
    const alternativas = altMatchesUnicas.length ? altMatchesUnicas.map(m => ({ letra: m[1], texto: m[2].trim() })) : null;

    const gabaritoMatch = bloco.match(/\*\*Gabarito:\*\*\s*([^\n]+)/i);
    let gabarito = gabaritoMatch ? gabaritoMatch[1].trim() : null;

    if(!enunciado){ ignoradas++; return; }
    if(!gabarito) semGabarito++;

    const tipo = alternativas ? 'MC' : 'CE';
    if(gabarito){
      if(tipo==='CE'){
        gabarito = /certo/i.test(gabarito) ? 'Certo' : (/errado/i.test(gabarito) ? 'Errado' : gabarito);
      } else {
        const letraMatch = gabarito.match(/[A-E]/i);
        gabarito = letraMatch ? letraMatch[0].toUpperCase() : gabarito;
      }
    }

    results.push({
      n, bc: bancaCargoTxt || '—', es: 'literal', ft: '', nv: nivel, td: tendencia, fr: '',
      q: enunciado, t: tipo, alt: alternativas, g: gabarito, r: resolucao || '', rf: resumo || '',
      ar: ano, tema: assunto,
    });
  });
  return { results, ignoradas, semGabarito };
}

function extractGabarito(blockText, resolucaoText){
  const campoGabarito = blockField('Gabarito', blockText);
  const candidatos = [campoGabarito, resolucaoText, blockText].filter(Boolean);

  for(const hay of candidatos){
    let m = hay.match(/gabarito\s*(?:é|foi|:|-|–|—|=)?\s*(certo|errado)/i);
    if(m) return m[1].toLowerCase()==='certo' ? 'Certo' : 'Errado';
    m = hay.match(/resposta correta\s*(?:é|foi|:|-|–|—|=)?\s*(certo|errado)/i);
    if(m) return m[1].toLowerCase()==='certo' ? 'Certo' : 'Errado';
    m = hay.match(/(?:item|assertiva|afirmativa)\s+est[áa]\s+(certo|errado)/i);
    if(m) return m[1].toLowerCase()==='certo' ? 'Certo' : 'Errado';

    m = hay.match(/gabarito\s*(?:é|foi|:|-|–|—|=)?\s*(?:a\s+)?(?:letra\s*)?\(?([a-e])\)?\b/i);
    if(m) return m[1].toUpperCase();
    m = hay.match(/resposta correta\s*(?:é|foi|:|-|–|—|=)?\s*(?:a\s+)?(?:letra\s*)?\(?([a-e])\)?\b/i);
    if(m) return m[1].toUpperCase();
    m = hay.match(/alternativa correta\s*(?:é|foi|:|-|–|—|=)?\s*(?:a\s+)?(?:letra\s*)?\(?([a-e])\)?\b/i);
    if(m) return m[1].toUpperCase();
  }
  if(campoGabarito){
    const c = campoGabarito.trim();
    if(/^certo$/i.test(c)) return 'Certo';
    if(/^errado$/i.test(c)) return 'Errado';
    if(/^[a-e]$/i.test(c)) return c.toUpperCase();
  }
  return null;
}

function detectaFormatoGemini(content){
  return /QUEST[ÃA]O\s+\d+[^\n\[]{0,60}\[Tend[êe]ncia/i.test(content) || /Probabilidade Preditiva/i.test(content);
}
// formato Markdown gerado pelo próprio botão de download da plataforma — usa
// cabeçalho "# QUESTÃO N" (com #), diferente dos outros dois formatos que nunca
// usam # antes de "QUESTÃO"
function detectaFormatoMarkdown(content){
  return /^#{1,2}\s*QUEST[ÃA]O\s+\d+/im.test(content);
}

function valorAposLabelEmLinhas(linhas, labelRegex){
  for(let i=0;i<linhas.length;i++){
    if(labelRegex.test(linhas[i])){
      for(let j=i+1;j<linhas.length;j++){
        const v = linhas[j].trim();
        if(v) return v;
      }
    }
  }
  return null;
}

// Parser pro formato de saída gerado por assistentes de IA (Gemini/etc.) — usa uma
// "tabela de métricas" e rótulos [Enunciado]/[Resolução]/[Resumo Flash], mas sem os
// campos [Status]/[Escopo]/[Fonte] do formato original, e ignora todo o texto que não
// seja diretamente sobre as questões (cabeçalhos de prompt, blocos de auditoria etc.)
function parseTxtQuestoesFormatoGemini(content){
  const results = [];
  let ignoradas = 0;
  let semGabarito = 0;

  // detecta TODAS as trocas de "TEMA/ASSUNTO:" ao longo do texto colado, não só
  // a primeira — permite colar um arquivo inteiro com vários blocos de assuntos
  // diferentes em sequência, sem precisar recortar e colar um tema de cada vez.
  // Cada questão recebe o tema mais recente declarado antes dela no texto.
  const marcadoresTema = [...content.matchAll(/TEMA\/ASSUNTO:\s*([^\n]+)/gi)].map(m => ({
    pos: m.index,
    tema: m[1].trim().replace(/\s*\([^)]*\)\s*$/, '').trim(),
  }));
  function temaVigenteEm(pos){
    let atual = null;
    for(const marcador of marcadoresTema){
      if(marcador.pos <= pos) atual = marcador.tema;
      else break;
    }
    return atual;
  }

  // localiza a posição de início de cada bloco "QUESTÃO N [...]" no texto
  // ORIGINAL (não depois de já ter cortado em pedaços), pra poder casar cada
  // questão com o tema vigente naquele ponto específico do texto.
  // Tolerante a texto decorativo entre o número e o colchete (ex.: marcador
  // "🟥🟨 INÉDITA 🟨🟥") — sem isso, questões inéditas eram engolidas pela
  // questão anterior por não baterem com \s*\[ (só espaço em branco).
  const iniciosBloco = [...content.matchAll(/QUEST[ÃA]O\s+\d+[^\n\[]{0,60}\[/gi)].map(m => m.index);
  const blocos = iniciosBloco.map((pos, i) => ({
    pos,
    texto: content.slice(pos, iniciosBloco[i+1] ?? content.length),
  }));

  blocos.forEach(({ pos, texto: bloco })=>{
    const numMatch = bloco.match(/QUEST[ÃA]O\s+(\d+)/i);
    if(!numMatch){ ignoradas++; return; }
    const n = parseInt(numMatch[1], 10);
    const temaDaQuestao = temaVigenteEm(pos);

    const linhas = bloco.split('\n').map(l=>l.trim());
    const probPreditiva = valorAposLabelEmLinhas(linhas, /^Probabilidade Preditiva$/i);
    const tendenciaTxt = valorAposLabelEmLinhas(linhas, /^Tend[êe]ncia temporal$/i);
    const nivelTxt = valorAposLabelEmLinhas(linhas, /^N[íi]vel de incid[êe]ncia$/i);
    const freqTxt = valorAposLabelEmLinhas(linhas, /^Frequ[êe]ncia por banca e ano$/i);
    const bancaCargoTxt = lineField(/Banca,\s*cargo:\s*(.+)/i, bloco);

    let enunciado = blockField('Enunciado', bloco);
    const resolucao = blockField('Resolu[çc][ãa]o', bloco);
    const resumo = blockField('Resumo Flash', bloco);

    if(!enunciado || !resolucao){ ignoradas++; return; }

    const gabarito = extractGabarito(bloco, resolucao);
    let tipo = (gabarito==='Certo'||gabarito==='Errado') ? 'CE' : (gabarito ? 'MC' : 'sem_gabarito');
    if(tipo==='sem_gabarito') semGabarito++;

    enunciado = enunciado.replace(/\(\s*\)\s*Certo\s*\(\s*\)\s*Errado\s*$/i,'').trim();

    let alternativas = null;
    if(tipo==='MC'){
      // nesse formato as alternativas costumam vir coladas no mesmo parágrafo, sem
      // quebra de linha entre elas ("...desde a a) posse... b) expedição...")
      const partes = enunciado.split(/\s(?=[a-e]\)\s)/i);
      if(partes.length>1){
        const corpoCandidato = partes[0].trim();
        const altsCandidatas = partes.slice(1).map(p=>{
          const m = p.match(/^([a-e])\)\s*([\s\S]+)$/i);
          return m ? { letra:m[1].toLowerCase(), texto:m[2].trim() } : null;
        }).filter(Boolean);
        // só substitui o enunciado se ainda sobrar um corpo com conteúdo de verdade —
        // evita deixar a questão sem nenhum texto de contexto
        if(corpoCandidato.length >= 5){
          enunciado = corpoCandidato;
          alternativas = altsCandidatas;
        }
      }
    }

    // remove numeração inicial do enunciado (ex.: "18. " ou "18) ")
    enunciado = enunciado.replace(/^\d+[.)]\s*/, '');

    let nivel = 'media';
    if(nivelTxt){
      if(/baixa/i.test(nivelTxt)) nivel='baixa';
      else if(/alta/i.test(nivelTxt)) nivel='alta';
    }

    let tendenciaSeta = '→ Estável';
    if(tendenciaTxt){
      if(/crescente/i.test(tendenciaTxt)) tendenciaSeta = '↑ Crescente';
      else if(/decrescente|queda/i.test(tendenciaTxt)) tendenciaSeta = '↓ Decrescente';
    }

    let ar = null;
    const anoMatch = (bancaCargoTxt||'').match(/(\d{4})\s*$/);
    if(anoMatch) ar = parseInt(anoMatch[1],10);
    const anosFreq = (freqTxt||'').match(/20\d{2}/g);
    const anosNum = anosFreq ? Array.from(new Set(anosFreq.map(Number))) : (ar?[ar]:[]);

    results.push({
      n, bc: bancaCargoTxt||'—', es:'literal', ft:'', nv:nivel, td:tendenciaSeta, fr:freqTxt||'',
      an:anosNum, ar: ar || (anosNum.length?Math.max(...anosNum):null),
      q:enunciado, r:resolucao, rf:resumo||'', g:gabarito, t:tipo,
      alt: alternativas, pp: probPreditiva||null, tema: temaDaQuestao||null,
    });
  });

  return { results, ignoradas, semGabarito };
}

function parseTxtQuestions(content){
  if(detectaFormatoMarkdown(content)){
    return parseMarkdownQuestoes(content);
  }
  if(detectaFormatoGemini(content)){
    return parseTxtQuestoesFormatoGemini(content);
  }
  const blocks = content.split(/={10,}/).filter(b => /QUEST[ÃA]O\s+\d+/.test(b));
  const results = [];
  let ignoradas = 0;
  let semGabarito = 0;

  blocks.forEach(b=>{
    const numStr = lineField(/QUEST[ÃA]O\s+(\d+)/, b);
    if(!numStr) { ignoradas++; return; }
    const num = parseInt(numStr,10);
    const banca = lineField(/Banca,\s*cargo:\s*(.+)/, b);
    const status = lineField(/\[Status\]:\s*(.+)/, b);
    const escopoRaw = lineField(/\[Escopo\]:\s*(.+)/, b);
    const fonte = lineField(/\[Fonte\]:\s*(.+)/, b);
    const freqTabela = lineField(/Frequ[êe]ncia hist[óo]rica\s*\|\s*(.+?)\s*\|/, b);
    let nivelRaw = lineField(/N[íi]vel de incid[êe]ncia\s*\|\s*(.+?)\s*\|/, b);
    let tendencia = lineField(/Tend[êe]ncia\s*\|\s*(.+?)\s*\|/, b);
    // formato alternativo visto em listas mais recentes: linha solta "📊 Incidência
    // histórica: N concursos distintos (M nos últimos 5 anos) — período: AAAA-AAAA",
    // sem tabela de barras. Sem isso, nível/tendência/ano ficavam todos vazios/no
    // padrão, perdendo um dado real e valioso que já vinha pronto no material.
    const incidenciaLinha = lineField(/📊\s*Incid[êe]ncia hist[óo]rica:\s*(.+)/, b);
    let freq = freqTabela || incidenciaLinha || '';
    if(!freqTabela && incidenciaLinha){
      const mTotal = incidenciaLinha.match(/(\d+)\s*concursos?\s*distint/i);
      const mRecentes = incidenciaLinha.match(/\((\d+)\s*nos? [úu]ltimos\s*5\s*anos\)/i);
      const totalConcursos = mTotal ? parseInt(mTotal[1],10) : null;
      const recentes5anos = mRecentes ? parseInt(mRecentes[1],10) : null;
      if(!nivelRaw && totalConcursos!==null){
        nivelRaw = totalConcursos>=15 ? 'alta' : totalConcursos>=5 ? 'média' : 'baixa';
      }
      if(!tendencia && totalConcursos!==null && recentes5anos!==null){
        tendencia = recentes5anos===0 ? '↓ Em declínio' : (recentes5anos>=totalConcursos*0.6 ? '↑ Crescente' : '→ Estável');
      }
    }

    let enunciado = blockField('Enunciado', b);
    let resolucao = blockField('Resolu[çc][ãa]o', b) || blockField('Resolução', b);
    const resumo = blockField('Resumo Flash', b);
    // a linha "📊 Incidência histórica: ..." vem dentro do próprio texto da
    // Resolução no arquivo-fonte, mas já é extraída à parte (linhas acima) e
    // exibida como badge visual — removida daqui pra não aparecer duplicada
    if(resolucao) resolucao = resolucao.replace(/\n?\s*📊\s*Incid[êe]ncia hist[óo]rica:.*$/im, '').trim();

    if(status && status.trim() !== 'Válida'){ ignoradas++; return; }
    if(!enunciado){ ignoradas++; return; }

    const anos = (freq||'').match(/20\d{2}/g);
    const anosNum = anos ? anos.map(Number) : [];
    const anoIndividualMatch = (banca||'').match(/(\d{4})\s*$/);
    const arIndividual = anoIndividualMatch ? parseInt(anoIndividualMatch[1], 10) : (anosNum.length ? Math.max(...anosNum) : null);

    let nivel = 'media';
    if(nivelRaw){
      if(/baixa/i.test(nivelRaw)) nivel='baixa';
      else if(/alta/i.test(nivelRaw)) nivel='alta';
      else nivel='media';
    }
    let escopo = 'literal';
    if(escopoRaw){
      if(/fora do edital/i.test(escopoRaw)) escopo='fora';
      else if(/tem[áa]tico/i.test(escopoRaw)) escopo='tematico';
      else escopo='literal';
    }

    const gabarito = extractGabarito(b, resolucao);
    const tipo = (gabarito==='Certo'||gabarito==='Errado') ? 'CE' : (gabarito ? 'MC' : 'sem_gabarito');
    if(tipo==='sem_gabarito') semGabarito++;

    enunciado = enunciado.replace(/\n?\s*(Certo\s*Errado|Certo|Errado)\s*$/,'').trim();

    let alternativas = null;
    if(tipo==='MC'){
      const candidatas = [...enunciado.matchAll(/(?:^|\s)([a-e])\)\s/g)];
      const ordemLetras = ['a','b','c','d','e'];
      let esperado = 0;
      const validas = [];
      for(const m of candidatas){
        const letra = m[1];
        if(letra === ordemLetras[esperado]){
          validas.push({ letra, index: m.index + m[0].indexOf(letra) });
          esperado++;
          if(esperado >= ordemLetras.length) break;
        }
      }
      if(validas.length >= 2){
        alternativas = validas.map((v,i)=>{
          const inicio = v.index;
          const fim = (i+1 < validas.length) ? validas[i+1].index : enunciado.length;
          const texto = enunciado.slice(inicio, fim).replace(/^[a-e]\)\s*/, '').trim();
          return { letra: v.letra, texto };
        });
      }
    }

    results.push({
      n:num, bc:banca||'—', es:escopo, ft:fonte||'', nv:nivel, td:tendencia||'', fr:freq||'',
      an:anosNum, ar:arIndividual,
      q:enunciado, r:resolucao||'', rf:resumo||'', g:gabarito, t:tipo,
      alt: alternativas || null,
    });
  });

  return { results, ignoradas, semGabarito };
}

// núcleo de parsing+inserção, reaproveitado tanto pela importação manual quanto
// pelo reprocessamento automático. Remove as questões antigas dessa matéria
// antes de inserir as novas, com os MESMOS uids (materiaSlug-numero) — assim o
// histórico de progresso do usuário (guardado por uid) não se perde ao atualizar
// registra reprocessamentos automáticos que FORAM BLOQUEADOS por segurança (ver
// abaixo) — usado só pra avisar o usuário depois do boot, nunca apaga nada sozinho
let REPROCESSAMENTOS_BLOQUEADOS = [];
function reprocessarMateriaComTexto(materiaNome, content){
  const { results } = parseTxtQuestions(content);
  if(results.length===0) return 0;
  // Se o parser atual reconhece MENOS questões do que já existem, o
  // reprocessamento automático é bloqueado (nada muda) e o usuário é avisado —
  // só uma reimportação manual pode encolher uma matéria.
  const atuais = ALL_QUESTIONS.filter(q => q.materia===materiaNome && q.origem!=='embutido').length;
  if(atuais===0) return 0; // nunca cria uma matéria que não existe mais
  if(results.length < atuais){
    REPROCESSAMENTOS_BLOQUEADOS.push({ materia: materiaNome, antes: atuais, depois: results.length });
    return 0;
  }
  const slug = slugify(materiaNome);
  ALL_QUESTIONS = ALL_QUESTIONS.filter(q => !(q.materia===materiaNome && q.origem!=='embutido'));
  const existingUids = new Set(ALL_QUESTIONS.map(q=>q.uid));
  results.forEach(r=>{
    let uid = `${slug}-${r.n}`;
    let suffix = 1;
    while(existingUids.has(uid)){ uid = `${slug}-${r.n}-${suffix++}`; }
    existingUids.add(uid);
    const temaAuto = r.tema || classifyTemaPorFonte(r.ft) || classifyTema(r.q, r.es);
    ALL_QUESTIONS.push({ ...r, materia: materiaNome, tema: temaAuto || 'Geral', uid, origem:'importado' });
  });
  return results.length;
}

// roda uma vez a cada versão nova do site: para cada matéria cujo texto
// original foi salvo (na nuvem, junto da publicação), confere se ela já foi
// reprocessada com a versão atual do código — se não, reprocessa com o parser
// de agora e republica, corrigindo automaticamente bugs antigos sem precisar
// que ninguém remova e reimporte manualmente a matéria
async function reprocessarMateriasDesatualizadas(){
  const versaoAtual = window.__TCDF_BUILD__ && window.__TCDF_BUILD__.versao;
  if(!versaoAtual) return;
  // Reprocessar só atualiza matérias que EXISTEM agora: um texto original
  // guardado sob um nome antigo (matéria renomeada, mesclada ou removida em
  // outro dispositivo) não pode recriá-la como duplicata.
  const existentes = new Set(materiasDisponiveis());
  let textosOrfaos = false;
  Object.keys(TEXTOS_ORIGINAIS).forEach(m=>{
    if(!existentes.has(m) || materiaRemovidaNaNuvem(m)){ delete TEXTOS_ORIGINAIS[m]; textosOrfaos = true; }
  });
  if(textosOrfaos) salvarTextosOriginaisLocalmente();
  const materiasParaReprocessar = Object.keys(TEXTOS_ORIGINAIS).filter(m => TEXTOS_ORIGINAIS[m].versaoProcessada !== versaoAtual);
  if(materiasParaReprocessar.length===0) return;
  let alguma = false;
  materiasParaReprocessar.forEach(materiaNome=>{
    const texto = TEXTOS_ORIGINAIS[materiaNome].texto;
    if(!texto) return;
    const n = reprocessarMateriaComTexto(materiaNome, texto);
    if(n>0){ alguma = true; TEXTOS_ORIGINAIS[materiaNome].versaoProcessada = versaoAtual; }
  });
  if(alguma){
    reindex();
    salvarTextosOriginaisLocalmente();
    materiasParaReprocessar.forEach(m=>{ if(TEXTOS_ORIGINAIS[m] && TEXTOS_ORIGINAIS[m].versaoProcessada===versaoAtual) marcarMateriaAtualizada(m); });
    await saveCustomQuestions();
    await publicarQuestoesNoFirestore(materiasParaReprocessar);
    render();
  }
  if(REPROCESSAMENTOS_BLOQUEADOS.length>0){
    const lista = REPROCESSAMENTOS_BLOQUEADOS.map(r=>`• ${r.materia}: tinha ${r.antes}, o parser atual só reconheceu ${r.depois}`).join('\n');
    alert(`⚠️ Reprocessamento automático bloqueado por segurança em ${REPROCESSAMENTOS_BLOQUEADOS.length} matéria(s) — o parser atual reconheceria MENOS questões do que já existem, então nada foi apagado:\n\n${lista}\n\nSe isso for esperado (ex.: mudança legítima de formato), reimporte manualmente essa matéria pra atualizar de propósito.`);
    REPROCESSAMENTOS_BLOQUEADOS = [];
  }
}

async function processImportedText(content, sugestaoNome, modoForcado){
  let materiaNome = (STATE.importDeckName||'').trim();
  // Um "# Nome da Matéria" no início (formato do "⬇ Baixar", ver
  // gerarMarkdownDaMateria) tem prioridade sobre o nome do arquivo baixado, pra
  // reimportar na mesma matéria e manter o progresso.
  if(!materiaNome){
    const tituloDoArquivo = content.match(/^#\s+(.+?)\s*$/m);
    if(tituloDoArquivo) materiaNome = tituloDoArquivo[1].trim();
  }
  if(!materiaNome) materiaNome = (sugestaoNome||'').trim();
  if(!materiaNome) materiaNome = 'Módulo importado';
  // nomes que só diferem em maiúsculas, acentos, espaços ou pontuação
  // ("Lei Orgânica do TCDF" / "lei organica do tcdf") geram o mesmo slug — e
  // portanto o mesmo documento na nuvem e os mesmos uids. Tratá-los como
  // matérias diferentes criava duas abas com o mesmo conteúdo; aqui viram a
  // matéria que já existe.
  const mesmoSlug = materiaComMesmoSlug(materiaNome);
  if(mesmoSlug) materiaNome = mesmoSlug;

  try{
    const { results, ignoradas, semGabarito } = parseTxtQuestions(content);
    if(results.length===0){
      STATE.importLog = { error: 'Nenhuma questão com Status "Válida" foi encontrada nesse texto. Confira o formato.' };
      render();
      return;
    }

    // Matéria que já tem questões: pergunta se é pra substituir ou somar, em vez
    // de adicionar por cima (o que duplicaria tudo com uids com sufixo).
    const existentes = ALL_QUESTIONS.filter(q => q.materia===materiaNome && q.origem!=='embutido');
    if(existentes.length>0 && !modoForcado){
      STATE.importPendente = { content, materiaNome, results, ignoradas, semGabarito, existentesCount: existentes.length };
      render();
      return;
    }

    // Nome novo: compara o CONTEÚDO (enunciados) com as matérias existentes e, se
    // a sobreposição for forte, pergunta antes de criar uma matéria separada com o
    // mesmo conteúdo sob outro nome.
    if(existentes.length===0 && !modoForcado){
      const semelhante = encontrarMateriaSemelhante(materiaNome, results);
      if(semelhante){
        STATE.importSemelhante = { content, materiaNome, results, ignoradas, semGabarito, materiaExistente: semelhante.materia, pct: semelhante.pct };
        render();
        return;
      }
    }

    await aplicarImportacao(materiaNome, content, results, ignoradas, semGabarito, modoForcado || 'somar');
  }catch(err){
    STATE.importLog = { error: 'Erro ao interpretar o texto: ' + err.message };
    render();
  }
}

// Aplica a importação de fato — separado de processImportedText pra poder ser
// chamado tanto direto (matéria nova, sem conflito) quanto depois do usuário
// escolher "substituir" ou "somar" numa matéria que já existia (ver
// STATE.importPendente e confirmarImportPendente).
// modo 'substituir': remove TODAS as questões importadas atuais dessa matéria
//   antes de inserir as novas — usa quando o arquivo novo é a versão corrigida/
//   atualizada de tudo.
// modo 'somar': mantém as que já existem; questões cujo NÚMERO já existe nesta
//   matéria são tratadas como a mesma questão sendo reimportada e são puladas
//   (em vez de duplicadas com um uid renomeado, que era o bug).
async function aplicarImportacao(materiaNome, content, results, ignoradas, semGabarito, modo, opcoes){
  const publicar = !(opcoes && opcoes.publicar===false);
  return comTravaDeEscrita(async ()=>{
  const bucket = getBucket(materiaNome);
  // questões que já estavam na matéria, indexadas pra reconhecer a mesma
  // questão no arquivo novo (mesmaQuestao), mesmo com outro número/cabeçalho
  const anteriores = ALL_QUESTIONS.filter(q => q.materia===materiaNome && q.origem!=='embutido');
  const porFinal = {};
  anteriores.forEach(q=>{
    const c = chaveDeEnunciado(q.q);
    if(c) (porFinal[finalDaChave(c)] = porFinal[finalDaChave(c)] || []).push({ q, chave: c });
  });
  // todas as cópias anteriores equivalentes (a matéria pode ter duplicatas)
  const equivalentesAnteriores = r => {
    const c = chaveDeEnunciado(r.q);
    return c ? (porFinal[finalDaChave(c)] || []).filter(x => mesmaQuestao(c, x.chave)).map(x => x.q) : [];
  };
  // Substituir: a lista passa a ser exatamente a do arquivo, e o progresso vai
  // junto pra questão equivalente (não pelo número, que muda entre arquivos).
  // Progresso de questão que não existe mais no arquivo é descartado.
  let progressoAnterior = null;
  if(modo === 'substituir'){
    progressoAnterior = {};
    anteriores.forEach(q=>{
      if(bucket.perguntas[q.uid]) progressoAnterior[q.uid] = bucket.perguntas[q.uid];
      delete bucket.perguntas[q.uid];
      if(bucket.flash) delete bucket.flash[q.uid];
    });
    ALL_QUESTIONS = ALL_QUESTIONS.filter(q => !(q.materia===materiaNome && q.origem!=='embutido'));
  }
  const slug = slugify(materiaNome);
  const existingUids = new Set(ALL_QUESTIONS.map(q=>q.uid));
  let added = 0, puladasPorJaExistir = 0, progressosMantidos = 0;
  results.forEach(r=>{
    const equivalentes = equivalentesAnteriores(r);
    // Inserir/somar: só entra o que falta — a questão equivalente já existe
    if(modo==='somar' && equivalentes.length){
      puladasPorJaExistir++;
      return;
    }
    const uidBase = `${slug}-${r.n}`;
    let uid = uidBase;
    let suffix = 1;
    while(existingUids.has(uid)){ uid = `${uidBase}-${suffix++}`; }
    existingUids.add(uid);
    const temaAuto = r.tema || classifyTemaPorFonte(r.ft) || classifyTema(r.q, r.es);
    ALL_QUESTIONS.push({ ...r, materia: materiaNome, tema: temaAuto || 'Geral', uid, origem:'importado' });
    if(progressoAnterior){
      let manteve = false;
      equivalentes.forEach(eq=>{
        if(!progressoAnterior[eq.uid]) return;
        bucket.perguntas[uid] = somarProgressoDaQuestao(bucket.perguntas[uid], progressoAnterior[eq.uid]);
        delete progressoAnterior[eq.uid];
        manteve = true;
      });
      if(manteve) progressosMantidos++;
    }
    added++;
  });
  if(progressoAnterior){
    // o arquivo novo pode ter a mesma questão repetida: não deixa cópia
    deduplicarMateriaNaMemoria(materiaNome);
    added = ALL_QUESTIONS.filter(q => q.materia===materiaNome && q.origem!=='embutido').length;
    marcarProgressoSujo(materiaNome);
    saveProgress();
  }
  TEXTOS_ORIGINAIS[materiaNome] = { texto: content, versaoProcessada: (window.__TCDF_BUILD__ && window.__TCDF_BUILD__.versao) || null };
  salvarTextosOriginaisLocalmente();
  marcarMateriaAtualizada(materiaNome);
  reindex();
  await saveCustomQuestions();

  STATE.importLog = {
    // antes mostrava quantas o parser reconheceu no total (results.length),
    // não quantas de fato ENTRARAM — enganoso quando "somar" pula duplicatas
    importadas: added,
    puladasPorJaExistir,
    progressosMantidos,
    modo,
    semGabarito,
    ignoradas,
    materia: materiaNome,
    amostra: results.slice(0,8).map(r=>({ n:r.n, tipo: r.t==='CE'?'Certo/Errado':(r.t==='MC'?'Múltipla escolha':'Sem gabarito') })),
  };
  STATE.materia = materiaNome;
  STATE.tema = 'todos';
  STATE.importDeckName = '';
  STATE.pasteText = '';
  STATE.showPaste = false;
  STATE.importPendente = null;
  render();

  // publica automaticamente, sem precisar de clique manual, pra que qualquer
  // visitante do site já veja essa matéria assim que ela for importada
  // force=true: reimportação é uma ação explícita e deliberada do usuário,
  // então PODE sobrescrever uma marca de "removido" anterior — diferente do
  // reprocessamento automático em segundo plano, que nunca deve fazer isso
  if(!publicar) return;
  const pub = await publicarQuestoesNoFirestore([materiaNome], true);
  STATE.importLog.publicadoAutomaticamente = pub.ok;
  STATE.importLog.erroPublicacao = pub.ok ? null : pub.motivo;
  render();
  });
}

async function confirmarImportPendente(modo){
  const p = STATE.importPendente;
  if(!p) return;
  await aplicarImportacao(p.materiaNome, p.content, p.results, p.ignoradas, p.semGabarito, modo);
}
function cancelarImportPendente(){
  STATE.importPendente = null;
  render();
}

// resolve o aviso de "conteúdo parece ser o mesmo de uma matéria existente"
// (ver encontrarMateriaSemelhante): 'mesclar' importa o arquivo como matéria
// nova TEMPORÁRIA e imediatamente mescla ela na matéria existente (reusa
// mesclarMaterias, que já sabe reconciliar por enunciado e somar progresso);
// 'separar' segue a importação normalmente, criando a matéria com o nome novo
async function confirmarImportSemelhante(acao){
  const p = STATE.importSemelhante;
  if(!p) return;
  STATE.importSemelhante = null;
  if(acao==='separar'){
    await aplicarImportacao(p.materiaNome, p.content, p.results, p.ignoradas, p.semGabarito, 'somar');
    return;
  }
  // 'mesclar': nome temporário garantidamente livre, só existe durante a
  // fração de segundo entre importar e mesclar — nunca fica visível pro usuário
  const nomeTemp = `__mesclagem_temp__${Date.now()}`;
  // publicar:false — a matéria temporária nunca vai pra nuvem. Antes ela era
  // publicada e, se a marcação de removida falhasse depois da mescla, aparecia
  // como uma matéria "__mesclagem_temp__…" duplicada em outros dispositivos.
  await aplicarImportacao(nomeTemp, p.content, p.results, p.ignoradas, p.semGabarito, 'somar', { publicar:false });
  const resultado = await mesclarMaterias(nomeTemp, p.materiaExistente);
  STATE.materia = p.materiaExistente;
  STATE.importLog = resultado.ok
    ? { materia: p.materiaExistente, mescladoDe: p.materiaNome, importadas: (resultado.movidas||0)+(resultado.fundidas||0), fundidas: resultado.fundidas, movidas: resultado.movidas, modo: 'mesclar' }
    : { error: 'Falha ao mesclar: ' + (resultado.motivo||'motivo desconhecido') };
  render();
}
function cancelarImportSemelhante(){
  STATE.importSemelhante = null;
  render();
}

function handleImportFile(file, modoForcado){
  const sugestaoNome = (file.name||'').replace(/\.[^/.]+$/,'').replace(/[_\-]+/g,' ').trim();
  const ehPdf = /\.pdf$/i.test(file.name||'') || file.type === 'application/pdf';
  if(ehPdf){
    extrairTextoDePdf(file, sugestaoNome, modoForcado);
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target.result;
    processImportedText(content, sugestaoNome, modoForcado);
  };
  reader.onerror = () => {
    STATE.importLog = { error: 'Não foi possível ler o arquivo selecionado.' };
    render();
  };
  reader.readAsText(file, 'utf-8');
}

// extrai o texto de um PDF usando pdf.js (carregado via CDN) e alimenta o mesmo
// pipeline de importação usado pros arquivos .txt — funciona bem com PDFs que
// têm texto selecionável; PDFs só com imagem escaneada (sem camada de texto)
// não têm como ser lidos assim, já que não existe OCR embutido no navegador
async function extrairTextoDePdf(file, sugestaoNome, modoForcado){
  if(typeof pdfjsLib === 'undefined'){
    STATE.importLog = { error: 'A biblioteca de leitura de PDF não carregou nesta sessão (pode ser falta de conexão). Recarregue a página e tente de novo, ou converta o PDF pra .txt antes de importar.' };
    render();
    return;
  }
  STATE.importLog = { pending: true, msg: `Lendo "${file.name}"…` };
  render();
  try{
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    let textoCompleto = '';
    for(let i=1; i<=pdf.numPages; i++){
      STATE.importLog = { pending: true, msg: `Lendo "${file.name}"… página ${i} de ${pdf.numPages}` };
      if(i % 5 === 0) render(); // atualiza o progresso na tela de tempos em tempos, sem re-renderizar a cada página
      const page = await pdf.getPage(i);
      const conteudo = await page.getTextContent();
      // agrupa por linha aproximada (mesma coordenada Y) pra preservar quebras de
      // linha do PDF original, já que o pdf.js devolve os fragmentos soltos
      let linhaAtualY = null;
      let linha = '';
      conteudo.items.forEach(item=>{
        const y = item.transform[5];
        if(linhaAtualY!==null && Math.abs(y - linhaAtualY) > 2){
          textoCompleto += linha.trim() + '\n';
          linha = '';
        }
        linha += item.str + ' ';
        linhaAtualY = y;
      });
      textoCompleto += linha.trim() + '\n\n';
    }
    if(!textoCompleto.trim()){
      STATE.importLog = { error: `Não foi possível extrair texto de "${file.name}". Esse PDF provavelmente é uma imagem escaneada, sem camada de texto selecionável — nesse caso, não tem como ler automaticamente.` };
      render();
      return;
    }
    processImportedText(textoCompleto, sugestaoNome, modoForcado);
  }catch(e){
    console.error('Falha ao extrair texto do PDF', e);
    STATE.importLog = { error: `Não foi possível ler o PDF "${file.name}": ` + (e && e.message ? e.message : 'erro desconhecido') };
    render();
  }
}

// corre uma Promise contra um cronômetro: se não resolver a tempo, rejeita com
// uma mensagem clara em vez de deixar o botão preso em "Salvando…"
function comLimiteDeTempo(promise, ms, mensagemTimeout){
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(mensagemTimeout||'Tempo esgotado.')), ms)),
  ]);
}
function materiaComMesmoSlug(materiaNome){
  const slug = slugify(materiaNome);
  return materiasDisponiveis().find(m => m!==materiaNome && slugify(m)===slug) || null;
}
function normalizarEnunciado(texto){
  return String(texto||'').toLowerCase().replace(/\s+/g,' ').trim();
}

// Mesma questão escrita de formas diferentes. Arquivos diferentes trazem o
// mesmo item ora sozinho ("Diferentemente do que ocorre…"), ora com um
// cabeçalho na frente ("5) Em relação à … julgue o item. Diferentemente do
// que ocorre…"), ora com "Certo/Errado" no fim. Duas chaves (ver
// chaveDeEnunciado) são a mesma questão quando são iguais ou quando a menor,
// com pelo menos 50 caracteres, é o FINAL da maior — itens diferentes sob o
// mesmo cabeçalho não batem, porque o final é o próprio item.
const TAMANHO_MIN_SUFIXO = 50;
function mesmaQuestao(chaveA, chaveB){
  if(!chaveA || !chaveB) return false;
  if(chaveA===chaveB) return true;
  const [menor, maior] = chaveA.length<=chaveB.length ? [chaveA, chaveB] : [chaveB, chaveA];
  return menor.length>=TAMANHO_MIN_SUFIXO && maior.endsWith(' '+menor);
}
// chave curta usada pra indexar: o final da chave. Se uma chave é sufixo da
// outra, as duas têm o mesmo final — então basta comparar dentro do mesmo balde.
function finalDaChave(chave){
  return chave.length>=TAMANHO_MIN_SUFIXO ? chave.slice(-TAMANHO_MIN_SUFIXO) : chave;
}
// agrupa questões equivalentes (mesmaQuestao, de forma transitiva)
function agruparQuestoesEquivalentes(qs){
  const chaves = qs.map(q=>chaveDeEnunciado(q.q));
  const pai = qs.map((_,i)=>i);
  const raiz = i => { while(pai[i]!==i){ pai[i] = pai[pai[i]]; i = pai[i]; } return i; };
  const baldes = {};
  chaves.forEach((c,i)=>{
    if(!c) return;
    const k = finalDaChave(c);
    (baldes[k] = baldes[k] || []).forEach(j=>{ if(mesmaQuestao(c, chaves[j])) pai[raiz(i)] = raiz(j); });
    baldes[k].push(i);
  });
  const grupos = {};
  qs.forEach((q,i)=>{ if(chaves[i]) (grupos[raiz(i)] = grupos[raiz(i)] || []).push(q); });
  return Object.values(grupos);
}
// soma o progresso de "de" em "para" (tentativas, acertos, histórico) e
// recalcula o último resultado pela tentativa mais recente
function somarProgressoDaQuestao(pPara, pDe){
  const p = pPara || { tentativas:0, acertos:0, ultimoResultado:null, historico:[] };
  p.tentativas += pDe.tentativas||0;
  p.acertos += pDe.acertos||0;
  p.historico = (p.historico||[]).concat(pDe.historico||[]).sort((a,b)=>(a.ts||0)-(b.ts||0)).slice(-20);
  if(p.historico.length) p.ultimoResultado = p.historico[p.historico.length-1].c;
  else if(p.ultimoResultado==null) p.ultimoResultado = pDe.ultimoResultado;
  return p;
}
// versão a manter de duas cópias da mesma questão: maior ano; empate decide
// pelo enunciado mais completo (com o texto de contexto/caso, sem o qual o
// item pode ficar incompreensível) e depois pela resolução mais completa
function questaoMaisAtual(a, b){
  if((a.ar||0)!==(b.ar||0)) return (a.ar||0)>(b.ar||0) ? a : b;
  const ca = chaveDeEnunciado(a.q).length, cb = chaveDeEnunciado(b.q).length;
  if(ca!==cb) return ca>cb ? a : b;
  return ((a.r||'').length+(a.rf||'').length) >= ((b.r||'').length+(b.rf||'').length) ? a : b;
}

// questões duplicadas DENTRO de uma matéria (mesmaQuestao), independente do
// uid — não depende do arquivo original
function detectarDuplicatasDaMateria(materiaNome){
  const qs = ALL_QUESTIONS.filter(q => q.materia===materiaNome && q.origem!=='embutido');
  return agruparQuestoesEquivalentes(qs).filter(grupo => grupo.length>1);
}
// Deixa uma questão por grupo de duplicatas: fica o uid que já tem progresso
// (senão o primeiro), com o conteúdo da versão mais atual, e o progresso das
// cópias é somado nele. Só mexe na memória; quem chama salva e publica.
function deduplicarMateriaNaMemoria(materiaNome){
  const grupos = detectarDuplicatasDaMateria(materiaNome);
  if(grupos.length===0) return 0;
  const bucket = getBucket(materiaNome);
  const uidsRemover = new Set();
  grupos.forEach(grupo=>{
    grupo.sort((a,b)=>{
      const pa = bucket.perguntas[a.uid], pb = bucket.perguntas[b.uid];
      return (pb && pb.tentativas ? 1:0) - (pa && pa.tentativas ? 1:0);
    });
    const manter = grupo[0];
    const conteudo = grupo.reduce(questaoMaisAtual);
    grupo.slice(1).forEach(dup=>{
      const pDup = bucket.perguntas[dup.uid];
      if(pDup && (pDup.tentativas || pDup.historico && pDup.historico.length)){
        bucket.perguntas[manter.uid] = somarProgressoDaQuestao(bucket.perguntas[manter.uid], pDup);
      }
      delete bucket.perguntas[dup.uid];
      if(bucket.flash) delete bucket.flash[dup.uid];
      uidsRemover.add(dup.uid);
    });
    if(conteudo!==manter){
      const idx = ALL_QUESTIONS.findIndex(x=>x.uid===manter.uid);
      if(idx!==-1) ALL_QUESTIONS[idx] = { ...conteudo, uid: manter.uid, materia: manter.materia, origem: manter.origem };
    }
  });
  ALL_QUESTIONS = ALL_QUESTIONS.filter(q => !uidsRemover.has(q.uid));
  return uidsRemover.size;
}
async function removerDuplicatasDaMateria(materiaNome){
  if(detectarDuplicatasDaMateria(materiaNome).length===0) return { removidas: 0 };
  return comTravaDeEscrita(async ()=>{
    const removidas = deduplicarMateriaNaMemoria(materiaNome);
    reindex();
    marcarProgressoSujo(materiaNome);
    await saveCustomQuestions();
    saveProgress();
    marcarMateriaAtualizada(materiaNome);
    const pub = await publicarQuestoesNoFirestore([materiaNome], true);
    return { removidas, publicadoOk: pub.ok, motivoPublicacao: pub.ok?null:pub.motivo };
  });
}

// Move o conteúdo de nomeOrigem pra dentro de nomeDestino (mesma matéria sob
// nomes diferentes). Questão equivalente dos dois lados (mesmaQuestao) vira
// uma só: fica a versão mais atual e o progresso das duas é somado. Questões
// que só existem na origem entram como novas. No fim o destino é deduplicado
// e a origem é marcada como removida na nuvem (nunca .delete()).
async function mesclarMaterias(nomeOrigem, nomeDestino){
  if(!nomeOrigem || !nomeDestino || nomeOrigem===nomeDestino) return { ok:false, motivo:'Escolha duas matérias diferentes.' };
  const qsOrigem = ALL_QUESTIONS.filter(q=>q.materia===nomeOrigem);
  if(qsOrigem.length===0) return { ok:false, motivo:'A matéria de origem está vazia.' };

  return comTravaDeEscrita(async ()=>{
    const bucketOrigem = getBucket(nomeOrigem);
    const bucketDestino = getBucket(nomeDestino);
    const slugDestino = slugify(nomeDestino);
    const existingUids = new Set(ALL_QUESTIONS.filter(q=>q.materia!==nomeOrigem).map(q=>q.uid));

    // índice do destino pelo final da chave do enunciado, pra reconhecer a
    // MESMA questão do outro lado mesmo com uid/número/cabeçalho diferentes
    const porFinalDestino = {};
    ALL_QUESTIONS.forEach(q=>{
      if(q.materia!==nomeDestino) return;
      const chave = chaveDeEnunciado(q.q);
      if(chave) (porFinalDestino[finalDaChave(chave)] = porFinalDestino[finalDaChave(chave)]||[]).push({ q, chave });
    });

    let fundidas = 0, movidas = 0;

    qsOrigem.forEach(q=>{
      const chave = chaveDeEnunciado(q.q);
      const candidato = chave ? (porFinalDestino[finalDaChave(chave)]||[]).find(c => mesmaQuestao(chave, c.chave)) : null;
      const equivalente = candidato ? candidato.q : null;
      const pOrigem = bucketOrigem.perguntas[q.uid];

      if(equivalente){
        const origemMaisNova = (q.ar||0) > (equivalente.ar||0) ||
          ((q.ar||0)===(equivalente.ar||0) && ((q.r||'').length+(q.rf||'').length) > ((equivalente.r||'').length+(equivalente.rf||'').length));
        if(origemMaisNova){
          const idx = ALL_QUESTIONS.findIndex(x=>x.uid===equivalente.uid);
          if(idx!==-1) ALL_QUESTIONS[idx] = { ...q, materia: nomeDestino, uid: equivalente.uid, origem: equivalente.origem };
        }
        if(pOrigem && pOrigem.tentativas){
          bucketDestino.perguntas[equivalente.uid] = somarProgressoDaQuestao(bucketDestino.perguntas[equivalente.uid], pOrigem);
        }
        delete bucketOrigem.perguntas[q.uid];
        fundidas++;
        return;
      }

      // sem equivalente no destino: entra como questão nova, com uid livre
      // (mesmo padrão de colisão de aplicarImportacao)
      const uidBase = `${slugDestino}-${q.n}`;
      let uid = uidBase, suffix = 1;
      while(existingUids.has(uid)){ uid = `${uidBase}-${suffix++}`; }
      existingUids.add(uid);
      const idx = ALL_QUESTIONS.findIndex(x=>x.uid===q.uid);
      if(idx!==-1) ALL_QUESTIONS[idx] = { ...q, materia: nomeDestino, uid, origem: q.origem==='embutido' ? 'importado' : q.origem };
      if(pOrigem){ bucketDestino.perguntas[uid] = pOrigem; delete bucketOrigem.perguntas[q.uid]; }
      movidas++;
    });

    // rede de segurança final: quando a versão do DESTINO é a mais atual (não
    // a de origem), o ramo "equivalente" acima só atualiza/mantém a entrada do
    // destino — a entrada própria da origem em ALL_QUESTIONS nunca é tocada
    // nesse caso e ficaria pra sempre com materia===nomeOrigem se não fosse
    // removida aqui. Todo conteúdo de origem já foi consumido (fundido no
    // destino) ou realocado (com materia/uid do destino) pelos ramos acima, então
    // qualquer entrada que ainda reste com o nome antigo é sempre sobra a descartar.
    ALL_QUESTIONS = ALL_QUESTIONS.filter(q => q.materia !== nomeOrigem);
    // o destino pode já ter cópias da mesma questão entre si (de mesclas ou
    // importações anteriores) — a mescla sempre termina sem duplicatas
    const duplicatasRemovidas = deduplicarMateriaNaMemoria(nomeDestino);

    delete PROGRESS[nomeOrigem];
    delete TEXTOS_ORIGINAIS[nomeOrigem];
    salvarTextosOriginaisLocalmente();
    delete MATERIA_ULTIMA_ATUALIZACAO[nomeOrigem];
    if(STATE.quizzesEmAndamento[nomeOrigem]) delete STATE.quizzesEmAndamento[nomeOrigem];
    STATE.quizzesVerificados.delete(nomeOrigem);
    STATE.quizzesVerificados.delete(nomeDestino); // força reconferir o simulado salvo do destino, agora com conteúdo novo
    if(STATE.quiz && STATE.quiz.materia===nomeOrigem) STATE.quiz = null;
    if(STATE.flashDeck && STATE.flashDeck.materia===nomeOrigem) STATE.flashDeck = null;
    if(STATE.materia===nomeOrigem) STATE.materia = nomeDestino;

    reindex();
    marcarProgressoSujo(nomeDestino);
    marcarMateriaAtualizada(nomeDestino);
    await saveCustomQuestions();
    saveProgress();
    render();

    if(FIREBASE_OK){
      try{ await publicarQuestoesNoFirestore([nomeDestino], true); }
      catch(e){ console.error('Falha ao publicar matéria mesclada na nuvem', e); }
      const slugOrigem = slugify(nomeOrigem);
      // a origem temporária da importação nunca foi publicada; e se as duas
      // matérias têm o mesmo slug, o documento da origem é o do destino
      const origemTemNuvemPropria = !nomeOrigem.startsWith('__mesclagem_temp__') && slugOrigem!==slugify(nomeDestino);
      if(origemTemNuvemPropria) try{
        const manifestDoc = await comLimiteDeTempo(fbDb.collection('publico').doc(slugOrigem).get(), 15000, 'tempo esgotado ao consultar a matéria de origem na nuvem');
        const numChunks = (manifestDoc.exists && manifestDoc.data().numChunks) || 0;
        await comLimiteDeTempo(fbDb.collection('publico').doc(slugOrigem).set({ materia: nomeOrigem, questoes: [], removido: true, atualizadoEm: Date.now() }), 15000, 'tempo esgotado ao marcar a matéria de origem como removida na nuvem');
        for(let i=0;i<numChunks;i++){
          try{ await comLimiteDeTempo(fbDb.collection('publico').doc(`${slugOrigem}__p${i}`).set({ materia: nomeOrigem, chunkIndex: i, questoes: [] }), 15000, 'tempo esgotado ao limpar pedaço na nuvem'); }
          catch(e){ console.error(`Falha ao limpar o pedaço ${i} da matéria de origem na nuvem`, e); }
        }
      }catch(e){ console.error('Falha ao marcar matéria de origem como removida na nuvem — pode reaparecer em outro dispositivo', e); }
    }

    return { ok:true, movidas, fundidas, duplicatasRemovidas };
  });
}

// checagem PROATIVA no momento da importação: se o texto que está sendo
// importado sob um nome que ainda não existe tem forte sobreposição de
// enunciados com uma matéria JÁ existente sob outro nome, avisa em vez de
// criar silenciosamente uma matéria duplicada. Limiar de 40% de sobreposição
// (sobre o menor dos dois conjuntos) e mínimo de 3 questões dos dois lados —
// pensado pra pegar o caso real (mesma prova reimportada com um nome
// abreviado/reformatado) sem disparar em matérias que só compartilham um
// puxadinho de questões parecidas por coincidência.
function encontrarMateriaSemelhante(materiaNome, results){
  // as questões recém-lidas ainda não passaram pela limpeza que as já
  // existentes receberam em reindex() (marcadores [cite], fonte grudada no fim
  // do enunciado etc.) — sem limpar uma cópia antes, a mesma questão vinha com
  // texto diferente e a sobreposição ficava abaixo do limiar
  const chaves = new Set(results.map(r=>{
    const copia = { ...r, alt: Array.isArray(r.alt) ? r.alt.map(a=>({ ...a })) : r.alt };
    sanitizarFonteEmbutida(copia);
    const c = chaveDeEnunciado(copia.q);
    return c ? finalDaChave(c) : '';
  }).filter(Boolean));
  if(chaves.size<3) return null;
  let melhor = null;
  Object.entries(chavesPorMateria()).forEach(([m, chavesM])=>{
    if(m===materiaNome || chavesM.size<3) return;
    const r = sobreposicao(chaves, chavesM);
    if(r.pct>=LIMIAR_MATERIA_SEMELHANTE && (!melhor || r.pct>melhor.pct)) melhor = { materia:m, ...r };
  });
  return melhor;
}

// Chave de comparação entre matérias: mais tolerante que normalizarEnunciado
// (ignora acentos, pontuação, numeração inicial e marcadores [cite]), porque a
// mesma questão importada de formatos diferentes (.txt do Gemini, .md
// exportado, PDF) chega com pequenas diferenças de texto.
const LIMIAR_MATERIA_SEMELHANTE = 0.4;
function chaveDeEnunciado(texto){
  const chave = normalizarParaComparacao(limparMarcadoresCitacao(String(texto||'')))
    .replace(/^(questao\s*)?\d+\s*[).:\-–—]\s*/, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/( certo errado| errado certo)$/, '')
    .trim();
  return chave.length>=15 ? chave : '';
}
function chavesPorMateria(){
  const mapa = {};
  ALL_QUESTIONS.forEach(q=>{
    const c = chaveDeEnunciado(q.q);
    if(!c) return;
    (mapa[q.materia] = mapa[q.materia] || new Set()).add(finalDaChave(c));
  });
  return mapa;
}
function sobreposicao(a, b){
  let bateram = 0;
  const [menor, maior] = a.size<=b.size ? [a, b] : [b, a];
  menor.forEach(c=>{ if(maior.has(c)) bateram++; });
  return { bateram, pct: menor.size ? bateram/menor.size : 0 };
}

// Pares de matérias JÁ existentes com o mesmo conteúdo sob nomes diferentes —
// a checagem da importação só impede duplicatas novas; estas são as que já
// estão na base. A sugestão é sempre mesclar a menor na maior.
let CACHE_MATERIAS_DUPLICADAS = { assinatura: null, pares: [] };
function detectarMateriasDuplicadas(){
  const assinatura = ALL_QUESTIONS.length + '|' + materiasDisponiveis().join('|');
  if(CACHE_MATERIAS_DUPLICADAS.assinatura===assinatura) return CACHE_MATERIAS_DUPLICADAS.pares;
  const mapa = chavesPorMateria();
  const nomes = Object.keys(mapa).filter(m=>mapa[m].size>=3);
  const pares = [];
  for(let i=0;i<nomes.length;i++){
    for(let j=i+1;j<nomes.length;j++){
      const r = sobreposicao(mapa[nomes[i]], mapa[nomes[j]]);
      if(r.pct<LIMIAR_MATERIA_SEMELHANTE) continue;
      // empate de tamanho: fica o nome mais descritivo (mais longo)
      const a = nomes[i], b = nomes[j];
      const aVira = mapa[a].size!==mapa[b].size ? mapa[a].size<mapa[b].size : a.length<b.length;
      const [origem, destino] = aVira ? [a, b] : [b, a];
      pares.push({ origem, destino, ...r });
    }
  }
  pares.sort((a,b)=>b.pct-a.pct);
  CACHE_MATERIAS_DUPLICADAS = { assinatura, pares };
  return pares;
}
function renderAvisoMateriasDuplicadas(){
  const pares = detectarMateriasDuplicadas();
  if(pares.length===0) return '';
  return `<div class="card-block" style="margin-top:24px;border:1px solid var(--stamp-red);">
    <h3>⚠ Matérias com o mesmo conteúdo sob nomes diferentes</h3>
    <p style="font-size:12px;color:var(--ink-soft);margin-bottom:12px;">Estas matérias têm muitas questões com o mesmo enunciado. Mesclar junta tudo numa só, mantém a versão mais atual de cada questão repetida e soma o progresso.</p>
    ${pares.map(p=>`<div class="bar-row" style="flex-wrap:wrap;">
      <div class="name">"${esc(p.origem)}" ↔ "${esc(p.destino)}"</div>
      <div class="pct" style="margin-right:8px;width:auto;white-space:nowrap;">${p.bateram} em comum (${Math.round(p.pct*100)}%)</div>
      <button class="btn-outline" data-mesclar-par-origem="${esc(p.origem)}" data-mesclar-par-destino="${esc(p.destino)}" style="padding:4px 10px;font-size:11px;">🔗 Mesclar "${esc(p.origem)}" em "${esc(p.destino)}"</button>
    </div>`).join('')}
  </div>`;
}

async function buscarSubstituirMateria(materiaNome){
  const busca = window.prompt(`Texto a procurar em "${materiaNome}" (Enunciado, Resolução e Resumo Flash):`, '');
  if(busca===null || busca.trim()==='') return;

  const qs = ALL_QUESTIONS.filter(q=>q.materia===materiaNome);
  const CAMPOS = ['q','r','rf'];
  let ocorrencias = 0;
  let questoesAfetadas = 0;
  let exemplo = null;
  qs.forEach(q=>{
    let achouNesta = false;
    CAMPOS.forEach(campo=>{
      const valorOriginal = q[campo] || '';
      const valorEditado = (EDICOES_USUARIO[q.uid] && EDICOES_USUARIO[q.uid][campo]) || '';
      const c1 = valorOriginal.split(busca).length - 1;
      const c2 = valorEditado.split(busca).length - 1;
      if(c1>0 || c2>0){
        achouNesta = true;
        ocorrencias += c1 + c2;
        if(!exemplo) exemplo = `Q${q.n}: "…${(valorOriginal||valorEditado).slice(Math.max(0,(valorOriginal||valorEditado).indexOf(busca)-30), (valorOriginal||valorEditado).indexOf(busca)+busca.length+30)}…"`;
      }
    });
    if(achouNesta) questoesAfetadas++;
  });

  if(ocorrencias===0){
    window.alert(`Nenhuma ocorrência de "${busca}" encontrada em "${materiaNome}".`);
    return;
  }

  const confirmMsg = `Encontrei ${ocorrencias} ocorrência(s) em ${questoesAfetadas} questão(ões).\n\nExemplo:\n${exemplo}\n\nDigite o texto de substituição (deixe em branco pra apenas REMOVER o texto encontrado):`;
  const substituto = window.prompt(confirmMsg, '');
  if(substituto===null) return; // cancelou

  return comTravaDeEscrita(async ()=>{
  qs.forEach(q=>{
    CAMPOS.forEach(campo=>{
      if(q[campo] && q[campo].includes(busca)){
        q[campo] = q[campo].split(busca).join(substituto);
      }
      if(EDICOES_USUARIO[q.uid] && EDICOES_USUARIO[q.uid][campo] && EDICOES_USUARIO[q.uid][campo].includes(busca)){
        EDICOES_USUARIO[q.uid][campo] = EDICOES_USUARIO[q.uid][campo].split(busca).join(substituto);
      }
    });
  });

  marcarMateriaAtualizada(materiaNome);
  salvarEdicoesUsuario();
  const okLocal = await saveCustomQuestions();
  let okNuvem = true;
  if(okLocal && FIREBASE_OK){
    const pub = await publicarQuestoesNoFirestore([materiaNome], true);
    okNuvem = !!pub.ok;
  }
  render();
  window.alert(okLocal && okNuvem
    ? `Pronto — ${ocorrencias} ocorrência(s) substituída(s) em ${questoesAfetadas} questão(ões), salvo local e na nuvem.`
    : `Substituído localmente, mas houve falha ao salvar${!okLocal?' neste dispositivo':' na nuvem'}. Tente de novo em "Salvar tudo".`);
  });
}

// botão "💾 Salvar" de uma matéria: salva local + nuvem e sempre mostra o
// resultado (ou o motivo da falha)
async function salvarMateriaAgora(materiaNome){
  return comTravaDeEscrita(async ()=>{
  STATE.salvandoMateria = materiaNome;
  STATE.ultimoSalvamentoManual = null;
  render();
  let okLocal = false, okNuvem = true, motivoNuvem = null, motivoLocal = null;
  try{
    okLocal = await comLimiteDeTempo(saveCustomQuestions(), 25000, 'Tempo esgotado ao salvar localmente (25s). Confira sua conexão ou o espaço de armazenamento do navegador.');
  }catch(e){
    motivoLocal = e && e.message ? e.message : 'erro desconhecido';
  }
  if(okLocal && FIREBASE_OK){
    try{
      const pub = await comLimiteDeTempo(publicarQuestoesNoFirestore([materiaNome], true), 25000, 'Tempo esgotado ao publicar na nuvem (25s). Confira sua conexão — os dados já estão salvos neste dispositivo.');
      okNuvem = !!pub.ok;
      motivoNuvem = pub.ok ? null : pub.motivo;
    }catch(e){
      okNuvem = false;
      motivoNuvem = e && e.message ? e.message : 'erro desconhecido';
    }
  }
  STATE.salvandoMateria = null;
  if(okLocal && okNuvem) marcarMateriaAtualizada(materiaNome, { publicada:true });
  STATE.ultimoSalvamentoManual = {
    materia: materiaNome,
    ok: okLocal && okNuvem,
    ts: Date.now(),
    motivo: motivoLocal ? ('falha ao salvar localmente: ' + motivoLocal) : (!okNuvem ? ('falha ao publicar na nuvem: ' + motivoNuvem) : null),
  };
  render();
  });
}

// "Salvar tudo": salva todas as matérias localmente e publica em lote na nuvem.
async function salvarTudoAgora(){
  const materias = materiasGerenciaveis();
  if(materias.length===0) return;
  return comTravaDeEscrita(async ()=>{
  STATE.salvandoTudo = true;
  STATE.ultimoSalvamentoGeral = null;
  render();
  let okLocal = false, okNuvem = true, motivoNuvem = null, motivoLocal = null;
  try{
    okLocal = await comLimiteDeTempo(saveCustomQuestions(), 25000, 'Tempo esgotado ao salvar localmente (25s). Confira sua conexão ou o espaço de armazenamento do navegador.');
  }catch(e){
    motivoLocal = e && e.message ? e.message : 'erro desconhecido';
  }
  if(okLocal && FIREBASE_OK){
    try{
      // sem force: "Salvar tudo" publica em lote, e uma cópia local desatualizada
      // de uma matéria já removida/renomeada/mesclada em outro dispositivo não
      // pode passar por cima da marca de removida na nuvem
      const pub = await comLimiteDeTempo(publicarQuestoesNoFirestore(materias, false), 25000, 'Tempo esgotado ao publicar na nuvem (25s). Confira sua conexão — os dados já estão salvos neste dispositivo.');
      okNuvem = !!pub.ok;
      motivoNuvem = pub.ok ? null : pub.motivo;
    }catch(e){
      okNuvem = false;
      motivoNuvem = e && e.message ? e.message : 'erro desconhecido';
    }
  }
  STATE.salvandoTudo = false;
  if(okLocal && okNuvem) materias.forEach(m => marcarMateriaAtualizada(m, { publicada:true }));
  STATE.ultimoSalvamentoGeral = {
    ok: okLocal && okNuvem,
    qtdMaterias: materias.length,
    ts: Date.now(),
    motivo: motivoLocal ? ('falha ao salvar localmente: ' + motivoLocal) : (!okNuvem ? ('falha ao publicar na nuvem: ' + motivoNuvem) : null),
  };
  render();
  });
}

async function renomearMateria(nomeAtual, nomeNovo){
  nomeNovo = (nomeNovo||'').trim();
  if(!nomeNovo || nomeNovo===nomeAtual) return;
  if(ALL_QUESTIONS.some(q=>q.materia===nomeNovo)){
    alert(`Já existe uma matéria chamada "${nomeNovo}". Escolha outro nome.`);
    return;
  }
  const conflito = materiaComMesmoSlug(nomeNovo);
  if(conflito && conflito!==nomeAtual){
    alert(`"${nomeNovo}" é praticamente igual ao nome de "${conflito}" (só muda maiúscula, acento ou pontuação). Use "🔗 Mesclar" se for a mesma matéria, ou escolha outro nome.`);
    return;
  }
  const mesmoDocumentoNaNuvem = slugify(nomeNovo)===slugify(nomeAtual);
  return comTravaDeEscrita(async ()=>{
  // renomeia em tudo que referencia o nome antigo: questões, progresso, texto
  // original guardado pra reprocessamento, e o estado atual da tela
  ALL_QUESTIONS.forEach(q=>{ if(q.materia===nomeAtual) q.materia = nomeNovo; });
  if(PROGRESS[nomeAtual]){ PROGRESS[nomeNovo] = PROGRESS[nomeAtual]; delete PROGRESS[nomeAtual]; }
  if(TEXTOS_ORIGINAIS[nomeAtual]){ TEXTOS_ORIGINAIS[nomeNovo] = TEXTOS_ORIGINAIS[nomeAtual]; delete TEXTOS_ORIGINAIS[nomeAtual]; salvarTextosOriginaisLocalmente(); }
  if(MATERIA_ULTIMA_ATUALIZACAO[nomeAtual]){ marcarMateriaAtualizada(nomeNovo); delete MATERIA_ULTIMA_ATUALIZACAO[nomeAtual]; }
  // move também o simulado em andamento (memória, armazenamento local e nuvem)
  // pro novo nome, senão o "Continuar" some
  if(STATE.quizzesEmAndamento[nomeAtual]){
    STATE.quizzesEmAndamento[nomeNovo] = STATE.quizzesEmAndamento[nomeAtual];
    delete STATE.quizzesEmAndamento[nomeAtual];
  }
  STATE.quizzesVerificados.delete(nomeNovo); // força reconferir o storage local sob o novo nome
  try{
    const quizSalvoLocal = await carregarQuizSalvo(nomeAtual);
    if(quizSalvoLocal){
      await storageSet(quizStorageKey(nomeNovo), JSON.stringify(quizSalvoLocal));
      await storageSet(quizStorageKey(nomeAtual), '');
    }
  }catch(e){ console.error('Falha ao mover o simulado em andamento (armazenamento local) pro novo nome', e); }
  if(STATE.materia===nomeAtual) STATE.materia = nomeNovo;
  reindex();
  await saveCustomQuestions();
  saveProgress();
  if(FIREBASE_OK){
    // publica sob o novo nome/slug, e marca o documento antigo como removido
    // (mesma trava de segurança usada em removerMateria — nunca .delete())
    try{ await publicarQuestoesNoFirestore([nomeNovo], true); }
    catch(e){ console.error('Falha ao publicar matéria renomeada na nuvem', e); }
    // se o slug não mudou (ex.: só maiúsculas/acentos), o documento antigo É o
    // novo — marcá-lo como removido apagaria a matéria recém-renomeada
    if(!mesmoDocumentoNaNuvem){
      try{ await comLimiteDeTempo(fbDb.collection('publico').doc(slugify(nomeAtual)).set({ materia: nomeAtual, questoes: [], removido: true, atualizadoEm: Date.now() }), 15000, 'tempo esgotado ao marcar nome antigo como removido'); }
      catch(e){ console.error('Falha ao marcar nome antigo como removido na nuvem', e); }
    }
    // move o simulado em andamento também na nuvem (mesmo raciocínio do
    // armazenamento local acima) — lê o documento principal, move a chave do
    // nome antigo pro novo dentro do JSON de quizzesEmAndamento, e regrava
    if(STATE.syncCode){
      try{
        const ref = fbDb.collection('progresso').doc(STATE.syncCode);
        const doc = await comLimiteDeTempo(ref.get(), 15000, 'tempo esgotado ao consultar simulado em andamento na nuvem');
        const atual = (doc.exists && doc.data().quizzesEmAndamento) ? (typeof doc.data().quizzesEmAndamento==='string' ? JSON.parse(doc.data().quizzesEmAndamento) : doc.data().quizzesEmAndamento) : {};
        if(atual[nomeAtual]){
          atual[nomeNovo] = atual[nomeAtual];
          delete atual[nomeAtual];
          await comLimiteDeTempo(ref.set(comDono({ quizzesEmAndamento: JSON.stringify(atual) }), { merge: true }), 15000, 'tempo esgotado ao mover simulado em andamento na nuvem');
        }
      }catch(e){ console.error('Falha ao mover o simulado em andamento (nuvem) pro novo nome', e); }
    }
  }
  render();
  });
}
async function removerMateria(materiaNome){
  const questoesDaMateria = ALL_QUESTIONS.filter(q=>q.materia===materiaNome);
  const uidsRemover = new Set(questoesDaMateria.map(q=>q.uid));
  if(uidsRemover.size===0) return;
  return comTravaDeEscrita(async ()=>{
  const eraNativa = questoesDaMateria.some(q=>q.origem==='embutido');
  ALL_QUESTIONS = ALL_QUESTIONS.filter(q=>!uidsRemover.has(q.uid));
  delete TEXTOS_ORIGINAIS[materiaNome];
  salvarTextosOriginaisLocalmente();
  delete MATERIA_ULTIMA_ATUALIZACAO[materiaNome];
  reindex();
  // Remove localmente e marca como removida na nuvem (removido:true), pra não
  // voltar na próxima visita de nenhum dispositivo.
  await saveCustomQuestions();
  // atualiza a tela já; a marcação na nuvem continua depois, sem bloquear
  STATE.materiasPublicadasNestaSessao.delete(materiaNome);
  STATE.importLog = null;
  if(STATE.quiz && STATE.quiz.materia===materiaNome) STATE.quiz = null;
  if(STATE.flashDeck && STATE.flashDeck.materia===materiaNome) STATE.flashDeck = null;
  if(STATE.materia===materiaNome) STATE.materia = null;
  render();
  if(FIREBASE_OK){
    // usa .set() marcando como removido, em vez de .delete() — Firestore pode
    // ter regras de segurança diferentes pra delete vs. escrita, e write já foi
    // confirmado funcionando; delete pode estar bloqueado silenciosamente
    const slug = slugify(materiaNome);
    try{
      // Limite de 15s por chamada (com a cota excedida o SDK pode ficar em backoff).
      // A remoção local já aconteceu; se a nuvem falhar, fica pra próxima vez.
      const manifestDoc = await comLimiteDeTempo(fbDb.collection('publico').doc(slug).get(), 15000, 'tempo esgotado ao consultar a matéria na nuvem');
      const numChunks = (manifestDoc.exists && manifestDoc.data().numChunks) || 0;
      await comLimiteDeTempo(fbDb.collection('publico').doc(slug).set({ materia: materiaNome, questoes: [], removido: true, atualizadoEm: Date.now() }), 15000, 'tempo esgotado ao marcar a matéria como removida na nuvem');
      // limpa também os documentos-pedaço — mesmo padrão .set() com array vazio,
      // nunca .delete()
      for(let i=0;i<numChunks;i++){
        try{ await comLimiteDeTempo(fbDb.collection('publico').doc(`${slug}__p${i}`).set({ materia: materiaNome, chunkIndex: i, questoes: [] }), 15000, 'tempo esgotado ao limpar pedaço na nuvem'); }
        catch(e){ console.error(`Falha ao limpar o pedaço ${i} da matéria na nuvem`, e); }
      }
    }
    catch(e){ console.error('Falha ao marcar matéria como removida na nuvem — pode reaparecer em outro dispositivo', e); }
  }
  // matéria NATIVA (embutida no código, tipo "Lei Orgânica do TCDF"): apagar da
  // memória não basta, porque ela é recriada do zero a cada carregamento a
  // partir da constante QUESTIONS embutida no arquivo. Guardamos o nome dela
  // numa lista de "ocultas" (local + compartilhada na nuvem) e filtramos essa
  // lista sempre que a base nativa é recriada, em qualquer computador.
  if(eraNativa){
    MATERIAS_OCULTAS.add(materiaNome);
    try{ await storageSet(MATERIAS_OCULTAS_KEY, JSON.stringify(Array.from(MATERIAS_OCULTAS))); }
    catch(e){ console.error('Falha ao salvar lista de matérias ocultas localmente', e); }
    if(FIREBASE_OK){
      try{ await comLimiteDeTempo(fbDb.collection('publico').doc('_materias_ocultas').set({ nomes: Array.from(MATERIAS_OCULTAS) }), 15000, 'tempo esgotado ao salvar matérias ocultas na nuvem'); }
      catch(e){ console.error('Falha ao salvar lista de matérias ocultas na nuvem — pode reaparecer em outro dispositivo', e); }
    }
  }
  // limpa também o progresso de qualquer bucket que referencie essas questões
  uidsRemover.forEach(uid=>{
    Object.values(PROGRESS).forEach(bucket=>{
      if(bucket && bucket.perguntas) delete bucket.perguntas[uid];
      if(bucket && bucket.flash) delete bucket.flash[uid];
    });
  });
  delete PROGRESS[materiaNome];

  // salva e envia pra nuvem IMEDIATAMENTE (sem esperar o debounce), pra evitar que uma
  // sincronização automática logo em seguida "restaure" a matéria removida a partir
  // de uma cópia antiga que ainda estava no Firestore
  await saveCustomQuestions();
  try{ await storageSet(STORAGE_KEY, JSON.stringify(PROGRESS)); }catch(e){ console.error('Falha ao salvar progresso', e); }
  await pushToCloud();
  // Nunca .delete() aqui: o .set({removido:true}) acima é a marca explícita de
  // remoção, e apagá-lo faria a matéria voltar de cópias antigas.
  });
}

// substitui todo o conteúdo de uma matéria por um arquivo novo, mantendo o mesmo nome —
// remove as questões antigas (local, nuvem pessoal e pública) e importa o arquivo por cima
// "Inserir" apenas ADICIONA questões novas a uma matéria já existente — nunca
// remove as antigas nem mexe no histórico de progresso. Reaproveita o mesmo
// pipeline de importação (handleImportFile → processImportedText), que já é
// aditivo por natureza (só dá push nas questões novas). A deduplicação (ver
// marcarDuplicatas) cuida de esconder qualquer questão idêntica que já exista,
// sem duplicar visualmente o conteúdo pro usuário nem contar duas vezes.
async function inserirNaMateria(materiaNome, file){
  STATE.importDeckName = materiaNome;
  // "Inserir" promete ser só aditivo ("sem apagar as que já existem") — vai
  // direto pro modo 'somar', sem passar pelo diálogo de confirmação (que existe
  // pro fluxo principal de "Importar", onde reimportar sem querer por cima de
  // uma matéria existente foi o que causou a duplicação real do Direito
  // Previdenciário e da AFO)
  handleImportFile(file, 'somar');
}

