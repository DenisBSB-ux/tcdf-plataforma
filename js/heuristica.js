/* ================= DICA DE CHUTE (sem IA, sem analisar o conteúdo) =================
   Resposta a um pedido específico do usuário: um jeito de, sem saber nada da
   matéria, escolher com um pouco mais de chance de acerto, só pelo JEITO que
   a questão foi escrita — não pelo que ela diz.

   NÃO é IA. Não lê, não entende e não analisa o direito da questão. É
   estatística pura, calculada em cima do banco de questões real desta
   plataforma.

   ATUALIZADO em 2026-10-07 com a rodada de validação mais rigorosa feita até
   aqui: 21 matérias, 3.754 questões Certo/Errado e 764 de múltipla escolha
   (764 com gabarito letra, 625 delas com exatamente 5 alternativas),
   validadas por LOGO-CV (treina em 20 matérias, testa SEMPRE numa matéria
   nunca vista no treino — é o único teste que garante que o padrão não é
   "memória" de uma matéria específica).

   Lista de verificação aplicada nesta ordem (a mesma usada manualmente ao
   responder questões reais nesta sessão):
   1) Já sabe a teoria do assunto? Se sim, a dica não serve pra nada — ignore.
   2) Tem termo ABSOLUTO no enunciado? → viés para ERRADO (+9,7pp, confirmado
      em 17 das 21 matérias testadas).
   3) Tem dupla negação (2+ não/nenhum/nem/sem na mesma frase)? → viés para
      CERTO (+11,5pp na direção de Certo, confirmado em 10 das 12 matérias
      testáveis).
   4) Tem condicional (se/caso/desde que)? → viés FRACO para CERTO (-4,4pp,
      confirmado em 14/19 — sinal moderado, só reforça, nunca decide solo).
   5) Pensar em inversão de conceito (a armadilha mais comum do CESPE nesta
      base: 695 ocorrências, a mais frequente em quase toda matéria) — isso
      exige ler o conteúdo, a dica não consegue checar isso automaticamente.
   6) Olhar o histórico do assunto específico, se disponível.

   Testado e DESCARTADO por não generalizar entre matérias (não entra na
   dica): frase longa, frase curta, oração concessiva ("embora"/"ainda que"),
   e "exceto"/"salvo" — todos confirmaram a direção esperada em menos da
   metade das matérias testadas, abaixo do que se espera só pelo acaso.

   Em resumo: ganho real medido do modelo combinado (ABSOLUTO + dupla
   negação + condicional), com baseline justo (a maioria aprendida só no
   TREINO, nunca olhando o gabarito da matéria testada): 52,3% de acerto vs.
   49,5% do baseline — ganho médio de +2,7 pontos percentuais, positivo em
   16 das 21 matérias. É uma dica fraca pra usar só quando não se sabe nada
   mesmo — nunca uma leitura do conteúdo jurídico. A UI deixa isso explícito
   sempre que a dica aparece. */

const HEUR_CE_BASE_TAXA_ERRADO = 0.496; // 3.754 questões C/E, 21 matérias, 2026-10
const HEUR_CE_AMOSTRA = 3754;
const HEUR_CE_MATERIAS = 21;

// Regras de desempate para múltipla escolha (rodada anterior, dataset
// separado, não contraditada por esta rodada — mantidas por completude):
const HEUR_MC_AMOSTRA = 200;
const HEUR_MC_TAXA_LONGA = 0.335; // alternativa mais longa foi a correta em 33,5% das 200 MC analisadas
const HEUR_MC_TAXA_ACASO = 0.21; // chance esperada só pelo acaso (nº médio de alternativas ~5)
// Viés de posição (rodada 2026-10, 625 questões com exatamente 5 alternativas):
const HEUR_MC_POSICAO_MEIO = 0.656; // B+C+D saíram gabarito em 65,6% das vezes
const HEUR_MC_POSICAO_MEIO_ESPERADO = 0.60; // esperado por acaso puro (3 de 5 letras)

// marcadores validados por LOGO-CV nas 21 matérias (item 1 da análise).
// `efeito`: para onde o marcador empurra o julgamento. `confirmaEm` é só
// informativo (mostrado no texto), não entra na conta.
const HEUR_CE_MARCADORES = [
  {
    id: 'absoluto',
    nome: 'Termo absoluto',
    re: /\b(sempre|nunca|apenas|exclusivamente|somente|qualquer|obrigatoriamente|todo[s]?|independentemente)\b/i,
    efeito: 'errado',
    desvioPp: 9.7,
    confirmaEm: '17 de 21 matérias',
  },
  {
    id: 'dupla_negativa',
    nome: 'Dupla negação',
    // 2 ou mais ocorrências de termo de negação na mesma frase
    re: null, // tratado por contagem, não por regex simples — ver detectarDuplaNegativa()
    efeito: 'certo',
    desvioPp: 11.5,
    confirmaEm: '10 de 12 matérias',
  },
  {
    id: 'condicional',
    nome: 'Condicional',
    // (?<!-) evita falso positivo em pronome reflexivo grudado por hífen
    // ("restringe-se", "aplica-se" etc.), que não é a conjunção condicional "se"
    re: /(?<!-)\b(se|caso|desde que)\b(?!-)/i,
    efeito: 'certo',
    desvioPp: 4.4,
    confirmaEm: '14 de 19 matérias — sinal moderado',
  },
];

const HEUR_NEGACAO_RE = /\b(não|nunca|nenhum[a]?|nem|sem)\b/gi;

function normalizarHeur(s){
  return (s||'').toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
}

function detectarDuplaNegativa(textoNormalizado){
  const m = textoNormalizado.match(HEUR_NEGACAO_RE);
  return (m ? m.length : 0) >= 2;
}

// Avalia os marcadores validados contra o enunciado e retorna a lista de
// passos da lista de verificação, já marcados achado/não achado, mais o
// score ponderado (positivo = pende Errado, negativo = pende Certo).
function avaliarChecklistCE(q){
  const texto = normalizarHeur(q.q);
  let score = 0;
  const passos = HEUR_CE_MARCADORES.map(m=>{
    const achou = m.id==='dupla_negativa' ? detectarDuplaNegativa(texto) : m.re.test(texto);
    if(achou) score += (m.efeito==='errado' ? 1 : -1) * m.desvioPp;
    return { ...m, achou };
  });
  return { passos, score };
}

// retorna { tipo:'mc'|'ce', sugestao, texto, checklistHtml } ou null se a
// questão não se encaixa em nenhum dos dois formatos analisados
function dicaChuteQuestao(q){
  if(!q) return null;
  if(q.t === 'MC' && Array.isArray(q.alt) && q.alt.length >= 3){
    let idxMax = 0, maxLen = -1;
    q.alt.forEach((a,idx)=>{ const len = (a.texto||'').trim().length; if(len>maxLen){ maxLen=len; idxMax=idx; } });
    const letra = (q.alt[idxMax].letra||'').toUpperCase();
    return {
      tipo: 'mc',
      sugestao: letra,
      texto: `Sem saber o conteúdo, a alternativa estatisticamente mais "segura" pra chutar aqui é a <b>${esc(letra)}</b> — é a mais longa. Em ${HEUR_MC_AMOSTRA} questões de múltipla escolha analisadas, a alternativa mais longa foi a correta em <b>${(HEUR_MC_TAXA_LONGA*100).toFixed(1)}%</b> das vezes (o esperado só pelo acaso, com ~5 alternativas, seria uns ${(HEUR_MC_TAXA_ACASO*100).toFixed(0)}%). Sinal fraco adicional: em 625 questões com 5 alternativas, o gabarito caiu em B/C/D (meio) ${(HEUR_MC_POSICAO_MEIO*100).toFixed(1)}% das vezes (esperado ${(HEUR_MC_POSICAO_MEIO_ESPERADO*100).toFixed(0)}%) — se estiver em dúvida entre duas alternativas, a do meio tem uma vantagem levíssima. Nenhum dos dois é garantia.`,
    };
  }
  if(q.t === 'CE'){
    const { passos, score } = avaliarChecklistCE(q);
    const sugestao = score > 0 ? 'Errado' : (score < 0 ? 'Certo' : null);
    const checklistHtml = passos.map(p=>{
      const classe = p.achou ? (p.efeito==='errado' ? 'checklist-achou-errado' : 'checklist-achou-certo') : 'checklist-nao-achou';
      const icone = p.achou ? '✅' : '⬜';
      const direcao = p.efeito==='errado' ? 'Errado' : 'Certo';
      return `<div class="checklist-item ${classe}">
        <span class="checklist-icone">${icone}</span>
        <span class="checklist-texto">
          <b>${esc(p.nome)}</b>${p.achou ? ` encontrado → tendência <b>${direcao}</b> (${p.desvioPp}pp, confirmado em ${esc(p.confirmaEm)})` : ' — não encontrado nesta questão'}
        </span>
      </div>`;
    }).join('');
    const baseTxt = `Base deste banco: ${(HEUR_CE_BASE_TAXA_ERRADO*100).toFixed(1)}% das ${HEUR_CE_AMOSTRA} questões Certo/Errado (${HEUR_CE_MATERIAS} matérias) saem "Errado" — perto de meio a meio, sinal fraco demais pra servir de chute sozinho.`;
    const resultadoHtml = sugestao
      ? `<div class="checklist-resultado checklist-resultado-${sugestao.toLowerCase()}">🎯 Sugestão desta lista: <b>${esc(sugestao)}</b> <span class="checklist-resultado-aviso">(sinal estatístico fraco — só use se não souber nada sobre o assunto)</span></div>`
      : `<div class="checklist-resultado checklist-resultado-neutro">Os sinais aqui se cancelam ou nenhum marcador apareceu — sem indicação clara, é cara ou coroa mesmo.</div>`;
    return {
      tipo: 'ce',
      sugestao,
      texto: baseTxt,
      checklistHtml: checklistHtml + resultadoHtml,
    };
  }
  return null;
}

// painel HTML mostrado quando o usuário abre a dica (antes de responder)
function dicaChutePanelHtml(q){
  const d = dicaChuteQuestao(q);
  if(!d) return '';
  const corpo = d.tipo === 'ce'
    ? `<div class="dica-chute-texto">${d.texto}</div><div class="checklist-lista">${d.checklistHtml}</div>`
    : `<div class="dica-chute-texto">${d.texto}</div>`;
  return `<div class="dica-chute-panel">
    <div class="dica-chute-titulo">🎯 Lista de verificação — dica de chute <span class="dica-chute-aviso">— busca mecânica de palavras-chave (regex), não é IA e não entende o conteúdo jurídico do enunciado</span></div>
    ${corpo}
    ${heurStatsResumoHtml(d.tipo)}
  </div>`;
}

/* ================= AUTOAVALIAÇÃO (a dica "se mede" com o seu uso real) =================
   Os pesos dos marcadores acima (ABSOLUTO, DUPLA_NEGATIVA, CONDICIONAL) são
   fixos — calculados uma vez, fora da plataforma, sobre as 3.754 questões já
   importadas. Isso NÃO muda sozinho. O que esta seção faz é diferente e mais
   modesto: toda vez que você responde uma questão que teve sugestão, grava
   se ela bateu ou não com o gabarito, e mostra essa taxa pra VOCÊ — uma
   autoavaliação com os seus próprios dados, não um recálculo dos pesos do
   modelo. Para os pesos mudarem de verdade seria preciso reprocessar o banco
   inteiro de novo (fora da plataforma), não só acumular alguns acertos/erros
   de uma sessão de estudo. */
const HEUR_STATS_KEY = 'tcdf-heuristica-stats-v1';
let HEUR_STATS = {
  ce: { sugestaoCerta: 0, sugestaoErrada: 0, semSugestao: 0, marcadores: {} }, // marcadores[id] = {certa,errada}
  mc: { sugestaoCerta: 0, sugestaoErrada: 0 },
};
let salvarHeurStatsTimer = null;
function salvarHeurStats(){
  clearTimeout(salvarHeurStatsTimer);
  salvarHeurStatsTimer = setTimeout(()=>{
    storageSet(HEUR_STATS_KEY, JSON.stringify(HEUR_STATS)).catch(e=>console.error('Falha ao salvar estatísticas da dica de chute', e));
  }, 300);
}
async function carregarHeurStats(){
  try{
    const res = await storageGet(HEUR_STATS_KEY);
    if(res && res.value){
      const parsed = JSON.parse(res.value);
      if(parsed && parsed.ce && parsed.mc) HEUR_STATS = parsed;
    }
  }catch(e){ /* nenhuma estatística salva ainda neste aparelho */ }
}

// Chamado em pickAnswer() (js/estudo.js), uma única vez por questão (a
// própria pickAnswer já impede responder 2x a mesma uid). Registra se a
// sugestão bateu com o gabarito EFETIVO (considera gabarito corrigido
// manualmente, se houver).
function registrarResultadoHeuristica(q){
  if(!q) return;
  const d = dicaChuteQuestao(q);
  if(!d) return;
  const gabarito = gabaritoEfetivo(q);
  if(d.tipo === 'ce'){
    if(!d.sugestao){ HEUR_STATS.ce.semSugestao++; salvarHeurStats(); return; }
    const bateu = d.sugestao === gabarito;
    if(bateu) HEUR_STATS.ce.sugestaoCerta++; else HEUR_STATS.ce.sugestaoErrada++;
    const { passos } = avaliarChecklistCE(q);
    passos.filter(p=>p.achou).forEach(p=>{
      if(!HEUR_STATS.ce.marcadores[p.id]) HEUR_STATS.ce.marcadores[p.id] = { certa:0, errada:0 };
      const direcao = p.efeito==='errado' ? 'Errado' : 'Certo';
      if(direcao===gabarito) HEUR_STATS.ce.marcadores[p.id].certa++; else HEUR_STATS.ce.marcadores[p.id].errada++;
    });
  } else if(d.tipo === 'mc'){
    const bateu = d.sugestao === gabarito;
    if(bateu) HEUR_STATS.mc.sugestaoCerta++; else HEUR_STATS.mc.sugestaoErrada++;
  }
  salvarHeurStats();
}

// resumo mostrado no rodapé do painel — só com volume mínimo de 5 respostas
// pra não mostrar um "100%" ou "0%" enganoso logo na primeira resposta
function heurStatsResumoHtml(tipo){
  if(tipo==='ce'){
    const s = HEUR_STATS.ce;
    const total = s.sugestaoCerta + s.sugestaoErrada;
    if(total < 5){
      return `<div class="heur-stats-resumo">📊 Ainda sem dados suficientes das SUAS respostas (${total} questão${total===1?'':'ões'} com sugestão até agora) — a taxa real medida com o seu uso aparece aqui a partir de 5 respostas.</div>`;
    }
    const pctNum = (s.sugestaoCerta/total)*100;
    return `<div class="heur-stats-resumo">📊 Nas SUAS respostas até agora: a sugestão bateu com o gabarito em <b>${s.sugestaoCerta} de ${total}</b> (${pctNum.toFixed(1)}%)${s.semSugestao?` · +${s.semSugestao} sem sugestão (sinais se cancelaram)`:''}.</div>`;
  }
  if(tipo==='mc'){
    const s = HEUR_STATS.mc;
    const total = s.sugestaoCerta + s.sugestaoErrada;
    if(total < 5){
      return `<div class="heur-stats-resumo">📊 Ainda sem dados suficientes das SUAS respostas (${total} até agora) — a taxa real aparece aqui a partir de 5 respostas.</div>`;
    }
    const pctNum = (s.sugestaoCerta/total)*100;
    return `<div class="heur-stats-resumo">📊 Nas SUAS respostas até agora: a alternativa sugerida bateu em <b>${s.sugestaoCerta} de ${total}</b> (${pctNum.toFixed(1)}%).</div>`;
  }
  return '';
}
