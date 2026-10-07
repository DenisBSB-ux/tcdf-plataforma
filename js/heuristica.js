/* ================= DICA DE CHUTE (sem IA, sem analisar o conteúdo) =================
   Resposta a um pedido específico do usuário: um jeito de, sem saber nada da
   matéria, escolher com um pouco mais de chance de acerto, só pelo JEITO que
   a questão foi escrita — não pelo que ela diz.

   NÃO é IA. Não lê, não entende e não analisa o direito da questão. É
   estatística pura, calculada em cima do banco de questões real desta
   plataforma (arquivos importados até 2026-10-07): 1.619 pares Certo/Errado
   + 200 questões de múltipla escolha.

   Como foi calculado (documentado aqui pra nunca virar "número mágico"):
   1) Testamos ~34 palavras/expressões clássicas de "pegadinha de prova"
      (sempre, nunca, apenas, exclusivamente, independentemente, salvo,
      poderá, em regra, desde que...) contra o gabarito real de cada questão
      Certo/Errado em que apareciam.
   2) Rodamos uma regressão logística com validação cruzada (5 folds) usando
      só essas palavras como variáveis. Resultado: 53,5% de acerto — a taxa-
      base do banco (sempre chutar "Errado", que é levemente maioria) já dá
      53,1%. Ou seja: o "truque das palavras absolutas" quase não funciona
      nos dados reais — é bem mais fraco do que a lenda de concurseiro conta.
   3) Por honestidade, só os 4 marcadores com desvio real (>= 8 pontos
      percentuais da taxa-base) e amostra mínima de 12 ocorrências entraram
      na dica abaixo — o resto foi descartado por ser ruído.
   4) Pra múltipla escolha, o teste foi outro: a alternativa mais LONGA era a
      correta em 33,5% das 200 questões (vs. ~21% esperado só pelo acaso,
      com ~5 alternativas) — esse efeito é real e vale mais a pena citar.

   Em resumo: é uma dica fraca pra usar só quando não se sabe nada mesmo —
   nunca uma leitura do conteúdo jurídico. A UI deixa isso explícito sempre
   que a dica aparece. */

const HEUR_CE_BASE_TAXA_ERRADO = 0.531; // 860 de 1619 questões Certo/Errado do banco analisado em 2026-10
const HEUR_CE_AMOSTRA = 1619;
const HEUR_MC_AMOSTRA = 200;
const HEUR_MC_TAXA_LONGA = 0.335; // alternativa mais longa foi a correta em 33,5% das 200 MC analisadas
const HEUR_MC_TAXA_ACASO = 0.21; // chance esperada só pelo acaso (nº médio de alternativas ~5)

const HEUR_CE_MARCADORES = [
  { termo:'independentemente', re:/independentemente/i, efeito:'errado', taxa:0.725, n:40 },
  { termo:'não poderá',        re:/n[ãa]o poder[áa]/i,   efeito:'certo',  taxa:0.231, n:13 },
  { termo:'poderão',           re:/poder[ãa]o\b/i,       efeito:'certo',  taxa:0.368, n:19 },
  { termo:'em regra',          re:/em regra/i,           efeito:'certo',  taxa:0.400, n:15 },
];

function normalizarHeur(s){
  return (s||'').toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
}

// retorna { tipo:'mc'|'ce', sugestao, texto } ou null se a questão não se
// encaixa em nenhum dos dois formatos analisados (ex.: sem gabarito)
function dicaChuteQuestao(q){
  if(!q) return null;
  if(q.t === 'MC' && Array.isArray(q.alt) && q.alt.length >= 3){
    let idxMax = 0, maxLen = -1;
    q.alt.forEach((a,idx)=>{ const len = (a.texto||'').trim().length; if(len>maxLen){ maxLen=len; idxMax=idx; } });
    const letra = (q.alt[idxMax].letra||'').toUpperCase();
    return {
      tipo: 'mc',
      sugestao: letra,
      texto: `Sem saber o conteúdo, a alternativa estatisticamente mais "segura" pra chutar aqui é a <b>${esc(letra)}</b> — é a mais longa. Em ${HEUR_MC_AMOSTRA} questões de múltipla escolha deste banco, a alternativa mais longa foi a correta em <b>${(HEUR_MC_TAXA_LONGA*100).toFixed(1)}%</b> das vezes (o esperado só pelo acaso, com ~5 alternativas, seria uns ${(HEUR_MC_TAXA_ACASO*100).toFixed(0)}%). É uma tendência real de quem escreve a prova, não uma garantia.`,
    };
  }
  if(q.t === 'CE'){
    const texto = normalizarHeur(q.q);
    const achados = HEUR_CE_MARCADORES.filter(m => m.re.test(texto));
    const baseTxt = `Neste banco, ${(HEUR_CE_BASE_TAXA_ERRADO*100).toFixed(1)}% das ${HEUR_CE_AMOSTRA} questões Certo/Errado analisadas saem "Errado" — levemente mais que metade, sinal fraco demais pra servir de chute sozinho.`;
    if(achados.length===0){
      return { tipo:'ce', sugestao:null, texto: baseTxt + ' Esta questão não tem nenhuma das 4 expressões com desvio relevante que identificamos — sem pista daqui, é cara ou coroa mesmo.' };
    }
    let pesoErrado=0, pesoCerto=0;
    const detalhes = achados.map(m=>{
      const desvio = m.taxa - HEUR_CE_BASE_TAXA_ERRADO;
      if(m.efeito==='errado') pesoErrado += Math.abs(desvio); else pesoCerto += Math.abs(desvio);
      return `“${esc(m.termo)}” (apareceu em ${m.n} questões do banco: ${(m.taxa*100).toFixed(1)}% saiu ${m.efeito==='errado'?'Errado':'Certo'})`;
    });
    const sugestao = pesoErrado>pesoCerto ? 'Errado' : (pesoCerto>pesoErrado ? 'Certo' : null);
    return {
      tipo:'ce',
      sugestao,
      texto: baseTxt + ` Esta questão contém: ${detalhes.join('; ')}. ${sugestao ? `Se for chutar mesmo sem saber nada, o leve favorito aqui é <b>${esc(sugestao)}</b> — mas é um sinal fraco, não uma análise do conteúdo.` : 'Os sinais aqui se cancelam — sem indicação clara.'}`,
    };
  }
  return null;
}

// painel HTML mostrado quando o usuário abre a dica (antes de responder)
function dicaChutePanelHtml(q){
  const d = dicaChuteQuestao(q);
  if(!d) return '';
  return `<div class="dica-chute-panel">
    <div class="dica-chute-titulo">🎯 Dica de chute <span class="dica-chute-aviso">— estatística de como a questão foi escrita, não é IA e não leu o enunciado</span></div>
    <div class="dica-chute-texto">${d.texto}</div>
  </div>`;
}
