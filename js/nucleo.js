/* ============================================================
   Sala de Estudos — motor genérico de simulados
   Abas macro por matéria (cada uma com página independente)
   Simulado + Estatísticas + Caderno de erros + Flashcards por matéria
   ============================================================ */

const NIVEL_LABEL = { baixa:'Baixa incidência', media:'Média incidência', alta:'Alta incidência' };
const NIVEL_STARS = { baixa:'★☆☆☆☆', media:'★★★☆☆', alta:'★★★★★' };
const ESCOPO_LABEL = { literal:'Edital · literal', tematico:'Edital · temático', fora:'Fora do edital' };
const ESCOPO_CLASS = { literal:'tag-literal', tematico:'tag-tematico', fora:'tag-fora' };

const TEMA_ORDER = [
  'Natureza, Competência e Jurisdição',
  'Composição, Conselheiros e Auditores',
  'Ministério Público de Contas (MP/TCDF)',
  'Controle Externo e Legislação Institucional',
  'Processo, Fiscalização e Sanções',
  'Serviços Auxiliares e Servidores',
  'Fora do Edital',
  'Geral',
];

const TEMA_RULES = [
  ['Ministério Público de Contas (MP/TCDF)', /Minist[ée]rio P[úu]blico|MP\/TCDF|MPTC|[Pp]rocurador/],
  ['Composição, Conselheiros e Auditores', /composi[çc][ãa]o|estrutura.{0,20}(TCDF|membros)|[Cc]onselheiro|\bauditor(es)?\b|[Pp]len[áa]rio|c[âa]maras? do (tribunal|TCDF)|dividir.{0,15}c[âa]maras|[Pp]residente|[Vv]ice-presidente/],
  ['Serviços Auxiliares e Servidores', /servi[çc]os auxiliares|\bservidor(es)?\b/],
  ['Processo, Fiscalização e Sanções', /processual de contas|medidas cautelares|sanç|instrumentos de fiscaliza|auditoria governamental|inspeç|levantamento/],
  ['Controle Externo e Legislação Institucional', /controle externo|legisla[çc][ãa]o institucional|C[âa]mara Legislativa|controle da administra[çc][ãa]o|controle legislativo|poderes,? organiza[çc][ãa]o administrativa/],
];

// Mapeamento tópico-do-Fonte → tema canônico, usado pelo parser legado (formato
// com [Fonte]: "Tópico — Teoria (...)") quando não há TEMA/ASSUNTO explícito.
// Construído a partir da lista real de Direito Tributário — evita que dezenas
// de rótulos granulares (ex.: "ITR", "IPTU", "ICMS e DIFAL") virem "Geral".
const FONTE_TOPICO_PARA_TEMA = {
  'princípios tributários':'Sistema Tributário Nacional — Princípios Gerais',
  'sistemas tributários':'Sistema Tributário Nacional — Princípios Gerais',
  'sistema tributário nacional':'Sistema Tributário Nacional — Princípios Gerais',
  'princípios do stn':'Sistema Tributário Nacional — Princípios Gerais',
  'normas gerais':'Sistema Tributário Nacional — Princípios Gerais',
  'legislação tributária':'Sistema Tributário Nacional — Princípios Gerais',
  'fontes do direito tributário':'Sistema Tributário Nacional — Princípios Gerais',
  'vigência e aplicação':'Sistema Tributário Nacional — Princípios Gerais',
  'interpretação da lei':'Sistema Tributário Nacional — Princípios Gerais',
  'integração da legislação':'Sistema Tributário Nacional — Princípios Gerais',
  'leis interpretativas':'Sistema Tributário Nacional — Princípios Gerais',
  'retroatividade benigna':'Sistema Tributário Nacional — Princípios Gerais',
  'processo legislativo tributário':'Sistema Tributário Nacional — Princípios Gerais',
  'competência tributária':'Competência Tributária',
  'competência extraordinária':'Competência Tributária',
  'competência cumulativa':'Competência Tributária',
  'capacidade tributária ativa':'Competência Tributária',
  'parafiscalidade':'Competência Tributária',
  'limitações ao poder de tributar':'Limitações Constitucionais ao Poder de Tributar',
  'princípio da anterioridade':'Limitações Constitucionais ao Poder de Tributar',
  'princípio da anterioridade/noventena':'Limitações Constitucionais ao Poder de Tributar',
  'princípio da legalidade':'Limitações Constitucionais ao Poder de Tributar',
  'princípio do não confisco':'Limitações Constitucionais ao Poder de Tributar',
  'princípio da irretroatividade':'Limitações Constitucionais ao Poder de Tributar',
  'princípio da capacidade contributiva':'Limitações Constitucionais ao Poder de Tributar',
  'imunidades tributárias':'Limitações Constitucionais ao Poder de Tributar',
  'imunidade recíproca':'Limitações Constitucionais ao Poder de Tributar',
  'imunidade religiosa':'Limitações Constitucionais ao Poder de Tributar',
  'imunidade de imprensa':'Limitações Constitucionais ao Poder de Tributar',
  'imunidade assistencial':'Limitações Constitucionais ao Poder de Tributar',
  'isenção e imunidade':'Limitações Constitucionais ao Poder de Tributar',
  'isenção heterônoma':'Limitações Constitucionais ao Poder de Tributar',
  'extrafiscalidade':'Limitações Constitucionais ao Poder de Tributar',
  'garantias tributárias':'Limitações Constitucionais ao Poder de Tributar',
  'conceito de tributo':'Conceito e Espécies Tributárias',
  'espécies tributárias':'Conceito e Espécies Tributárias',
  'classificação dos tributos':'Conceito e Espécies Tributárias',
  'conceito de imposto':'Conceito e Espécies Tributárias',
  'natureza jurídica':'Conceito e Espécies Tributárias',
  'impostos em espécie':'Conceito e Espécies Tributárias',
  'impostos federais':'Impostos em Espécie',
  'impostos da união':'Impostos em Espécie',
  'impostos estaduais':'Impostos em Espécie',
  'impostos municipais':'Impostos em Espécie',
  'imposto de renda':'Impostos em Espécie',
  'imposto sobre a renda':'Impostos em Espécie',
  'imposto sobre produtos industrializados':'Impostos em Espécie',
  'imposto sobre produtos industrializados - ipi':'Impostos em Espécie',
  'itr':'Impostos em Espécie',
  'imposto territorial rural - itr':'Impostos em Espécie',
  'iptu':'Impostos em Espécie',
  'imposto predial e territorial urbano':'Impostos em Espécie',
  'imposto predial e territorial urbano - iptu':'Impostos em Espécie',
  'ipva':'Impostos em Espécie',
  'itcmd':'Impostos em Espécie',
  'imposto sobre transmissão':'Impostos em Espécie',
  'icms e iss':'Impostos em Espécie',
  'icms e combustíveis':'Impostos em Espécie',
  'icms e difal':'Impostos em Espécie',
  'icms de importação':'Impostos em Espécie',
  'fato gerador do icms':'Impostos em Espécie',
  'imposto sobre circulação de mercadorias e serviços - icms':'Impostos em Espécie',
  'imposto sobre serviços':'Impostos em Espécie',
  'imposto seletivo':'Impostos em Espécie',
  'imposto extraordinário de guerra':'Impostos em Espécie',
  'taxas':'Taxas e Contribuição de Melhoria',
  'taxas e certidões':'Taxas e Contribuição de Melhoria',
  'contribuição de melhoria':'Taxas e Contribuição de Melhoria',
  'contribuições especiais':'Contribuições Especiais',
  'contribuições sociais':'Contribuições Especiais',
  'contribuições previdenciárias':'Contribuições Especiais',
  'cide':'Contribuições Especiais',
  'cide-combustíveis':'Contribuições Especiais',
  'pis e cofins':'Contribuições Especiais',
  'cosip':'Contribuições Especiais',
  'contribuição de iluminação pública':'Contribuições Especiais',
  'empréstimo compulsório':'Contribuições Especiais',
  'empréstimos compulsórios':'Contribuições Especiais',
  'simples nacional':'Contribuições Especiais',
  'repartição de receitas':'Repartição de Receitas Tributárias',
  'vinculação de receitas':'Repartição de Receitas Tributárias',
  'sujeição passiva':'Obrigação Tributária',
  'sujeitos da obrigação':'Obrigação Tributária',
  'não cumulatividade':'Impostos em Espécie',
  'reforma tributária':'Reforma Tributária (IBS/CBS)',
  'ibs e cbs na administração':'Reforma Tributária (IBS/CBS)',
  'cgibs':'Reforma Tributária (IBS/CBS)',
};
function classifyTemaPorFonte(fonteTexto){
  if(!fonteTexto) return null;
  const topico = fonteTexto.split('—')[0].trim();
  if(!topico) return null;
  const mapeado = FONTE_TOPICO_PARA_TEMA[topico.toLowerCase()];
  if(mapeado) return mapeado;
  return topico.charAt(0).toUpperCase() + topico.slice(1);
}
function classifyTema(enunciado, escopoKey){
  if(escopoKey === 'fora') return 'Fora do Edital';
  const firstLine = (enunciado||'').split('\n')[0];
  for(const [tema, re] of TEMA_RULES){ if(re.test(firstLine)) return tema; }
  const head = (enunciado||'').slice(0,500);
  for(const [tema, re] of TEMA_RULES){ if(re.test(head)) return tema; }
  return null;
}

// Temas com curadoria em TEMA_ORDER vêm primeiro, nessa ordem; os demais
// mantêm a ordem de primeira aparição no texto importado (que segue a
// sequência do edital), em vez de ordem alfabética.
function ordenarTemas(lista){
  return lista
    .map((tema, idx) => ({ tema, idx }))
    .sort((a,b)=>{
      const ia = TEMA_ORDER.indexOf(a.tema), ib = TEMA_ORDER.indexOf(b.tema);
      if(ia!==-1 && ib!==-1) return ia-ib;
      if(ia!==-1) return -1;
      if(ib!==-1) return 1;
      return a.idx - b.idx; // sem curadoria manual: mantém ordem de 1ª aparição (= sequência do Edital)
    })
    .map(x => x.tema);
}

function slugify(str){
  return (str||'materia')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g,'-')
    .replace(/(^-|-$)/g,'') || 'materia';
}

/* ------------- base dataset (embutido) ------------- */
const MATERIA_PADRAO = CONFIG.materiaPadrao || 'Questões';

// matérias que o usuário pode gerenciar (remover/publicar/atualizar) — inclui
// literalmente todas, até a matéria embutida diretamente no arquivo original,
// já que nenhuma matéria deve ficar "travada" sem opção de remover/atualizar
function materiasGerenciaveis(){
  return Array.from(new Set(ALL_QUESTIONS.map(q => q.materia)));
}
let ALL_QUESTIONS = QUESTIONS.map(q => ({
  ...q,
  materia: MATERIA_PADRAO,
  tema: q.tm || 'Geral',
  uid: slugify(MATERIA_PADRAO) + '-' + q.n,
  origem: 'embutido',
}));

let BY_UID = {};
// Alguns documentos de origem citam a fonte (ex.: "Apostila X — Y.pdf") sem usar o
// marcador [Fonte]: esperado — nesses casos ela acaba grudada no fim do enunciado
// ou da última alternativa durante o parse. Essa limpeza detecta esse padrão e
// separa a fonte pro campo próprio (q.ft), tirando ela de onde não devia estar.
// Roda em toda questão carregada (embutida, importada ou pública), então corrige
// retroativamente até questões já importadas antes dessa correção existir.
// Aceita vários formatos de separador antes da fonte (travessão —, hífen -,
// dois-pontos, quebra de linha), já que documentos de origem diferentes citam a
// fonte de jeitos diferentes — o sinal confiável é sempre terminar num arquivo
// (.pdf/.doc/.ppt/.xls/.txt).
function extrairFonteEmbutida(texto){
  if(!texto) return null;
  if(!/\.(pdf|docx?|pptx?|xlsx?|txt)\s*$/i.test(texto)) return null;
  const m = texto.match(/^([\s\S]*?)([.!?:]|\n|\s[-–—])\s*([A-Za-zÀ-ÿ0-9][\s\S]{0,120}\.(?:pdf|docx?|pptx?|xlsx?|txt))\s*$/i);
  if(!m) return null;
  const pontuacao = /[.!?:]/.test(m[2]) ? m[2] : '';
  const limpo = (m[1] + pontuacao).trim();
  if(!limpo) return null; // evita esvaziar o texto inteiro se o "match" cobrir tudo
  return { limpo, fonte: m[3].trim() };
}
// alguns documentos de origem marcam o resumo flash com "⚡ Resumo Flash:" (sem
// colchetes) em vez do formato [Resumo Flash]: esperado pelo parser — nesses
// casos ele fica grudado dentro da Resolução, e o campo de resumo fica vazio.
// Essa função detecta esse padrão e separa o resumo pro campo próprio.
function extrairResumoFlashEmbutido(texto){
  if(!texto) return null;
  const m = texto.match(/[⚡💡]?\s*Resumo\s+Flash\s*:\s*([\s\S]+)$/i);
  if(!m) return null;
  const limpo = texto.slice(0, m.index).trim();
  if(!limpo) return null; // evita esvaziar o texto inteiro se o "match" cobrir tudo
  return { limpo, resumo: m[1].trim() };
}
// remove marcadores de citação do tipo "[cite: 1]", "[cite: 2, 3]" que sobraram
// no texto — resíduo de ferramentas de IA usadas pra gerar o conteúdo original,
// que referenciam trechos-fonte internos e nunca deveriam aparecer pro usuário.
// Preserva colchetes legítimos (ex.: "[Art. 5º]"), já que exige especificamente
// a palavra "cite" seguida de dois-pontos e números.
function limparMarcadoresCitacao(texto){
  if(!texto) return texto;
  return texto
    .replace(/\s*\[\s*cite\s*:\s*[\d,\s]+\]/gi, '')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}
// "[Fonte: Teoria — Apostila X, Bloco N / Art. Y]" às vezes aparece solto no meio
// do texto (mesmo problema do [cite: N], só que com informação útil dentro) —
// em vez de só apagar, aproveita o conteúdo pro campo q.ft antes de limpar
function extrairFonteColchete(texto){
  if(!texto) return null;
  const m = texto.match(/\[\s*fonte\s*:\s*([^\]]*)\]\.?/i);
  if(!m) return null;
  const limpo = (texto.slice(0, m.index) + texto.slice(m.index + m[0].length)).replace(/[ \t]{2,}/g, ' ').trim();
  return { limpo, fonte: m[1].trim() };
}
function sanitizarFonteEmbutida(q){
  ['q','r','rf'].forEach(campo=>{
    if(q[campo]) q[campo] = limparMarcadoresCitacao(q[campo]);
  });
  if(Array.isArray(q.alt)){
    q.alt.forEach(a=>{ if(a && a.texto) a.texto = limparMarcadoresCitacao(a.texto); });
  }
  // "[Fonte: ...]" colchete embutido em qualquer campo de texto — extrai pro
  // campo q.ft (se ainda vazio) antes de limpar o texto exibido
  ['q','r','rf'].forEach(campo=>{
    if(!q[campo]) return;
    const r = extrairFonteColchete(q[campo]);
    if(r){ q[campo] = r.limpo; if(!q.ft) q.ft = r.fonte; }
  });
  if(Array.isArray(q.alt)){
    q.alt.forEach(a=>{
      if(!a || !a.texto) return;
      const r = extrairFonteColchete(a.texto);
      if(r){ a.texto = r.limpo; if(!q.ft) q.ft = r.fonte; }
    });
  }
  if(q.q){
    const r = extrairFonteEmbutida(q.q);
    if(r){ q.q = r.limpo; if(!q.ft) q.ft = r.fonte; }
  }
  if(Array.isArray(q.alt)){
    q.alt.forEach(a=>{
      if(!a || !a.texto) return;
      const r = extrairFonteEmbutida(a.texto);
      if(r){ a.texto = r.limpo; if(!q.ft) q.ft = r.fonte; }
    });
  }
  if(q.r && !q.rf){
    const r = extrairResumoFlashEmbutido(q.r);
    if(r){ q.r = r.limpo; q.rf = r.resumo; }
  }
  // item 2: classificação retroativa de assunto — se a questão ainda não tem um
  // tema específico (fica em "Geral"/vazio), tenta extrair um nome de assunto
  // razoável a partir do campo Fonte (ex.: "Apostila LINDB — Direito Civil.pdf"
  // → assunto "LINDB"), já que esse campo costuma nomear o módulo/tópico exato
  if((!q.tema || q.tema==='Geral') && q.ft){
    const assuntoDaFonte = extrairAssuntoDaFonte(q.ft);
    if(assuntoDaFonte) q.tema = assuntoDaFonte;
  }
}
// tenta extrair um nome de assunto específico a partir do texto da fonte —
// heurística conservadora: só usa se o resultado for curto e plausível como
// nome de tópico, senão prefere deixar sem classificação a arriscar um rótulo
// errado
function extrairAssuntoDaFonte(fonte){
  if(!fonte) return null;
  // procura "Apostila <algo>" em qualquer posição do texto, já que às vezes vem
  // precedido de outro rótulo (ex.: "Teoria — Apostila LINDB, Bloco 5")
  const mApostila = fonte.match(/apostila\s+([^,—\-/]+)/i);
  if(mApostila){
    const candidato = mApostila[1].trim().replace(/\.(pdf|docx?|pptx?|xlsx?|txt)$/i, '').trim();
    if(candidato.length>=3 && candidato.length<=40 && !/^\d+$/.test(candidato)) return candidato;
  }
  const m = fonte.match(/^([^—\-/]+)/);
  if(!m) return null;
  const candidato = m[1].trim().replace(/\.(pdf|docx?|pptx?|xlsx?|txt)$/i, '').trim();
  if(candidato.length<3 || candidato.length>40) return null;
  if(/^\d+$/.test(candidato)) return null; // evita rótulos que são só números
  if(/^(teoria|pr[aá]tica|quest[aã]o|exerc[ií]cio)$/i.test(candidato)) return null; // rótulo genérico, não é assunto real
  return candidato;
}
// normaliza o enunciado pra comparação (ignora maiúscula/minúscula e espaços
// extras), usado só pra DETECTAR duplicatas — nunca altera o texto exibido
function normalizarParaComparacao(texto){
  return (texto||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();
}
// questões com o MESMO enunciado (exatamente a mesma pergunta), dentro da MESMA
// matéria, cobradas em provas/anos diferentes — mantém só a mais recente
// (maior ano) selecionável, marcando as demais como duplicataOculta. Nada é
// apagado: quem já tiver respondido uma versão mais antiga mantém seu
// histórico intacto, ela só para de aparecer como opção pra NOVAS tentativas
function marcarDuplicatas(){
  const porMateria = {};
  ALL_QUESTIONS.forEach(q=>{
    q.duplicataOculta = false;
    const chave = normalizarParaComparacao(q.q);
    if(!chave || chave.length<15) return; // enunciados muito curtos não entram na checagem (risco de falso positivo)
    if(!porMateria[q.materia]) porMateria[q.materia] = {};
    if(!porMateria[q.materia][chave]) porMateria[q.materia][chave] = [];
    porMateria[q.materia][chave].push(q);
  });
  Object.values(porMateria).forEach(grupos=>{
    Object.values(grupos).forEach(lista=>{
      if(lista.length<=1) return;
      // mais recente primeiro (ano ausente conta como o mais antigo do grupo);
      // em caso de empate no ano, mantém a que tem gabarito/resolução mais completos
      lista.sort((a,b)=>{
        if((b.ar||0)!==(a.ar||0)) return (b.ar||0)-(a.ar||0);
        return ((b.r||'').length+(b.rf||'').length) - ((a.r||'').length+(a.rf||'').length);
      });
      lista.forEach((q,i)=>{ if(i>0) q.duplicataOculta = true; });
    });
  });
}
function reindex(){
  ALL_QUESTIONS.forEach(sanitizarFonteEmbutida);
  marcarDuplicatas();
  BY_UID = Object.fromEntries(ALL_QUESTIONS.map(q => [q.uid, q]));
}
reindex();

function materiasDisponiveis(){
  const seen = [];
  ALL_QUESTIONS.forEach(q=>{ if(!seen.includes(q.materia)) seen.push(q.materia); });
  return seen;
}
function temasDisponiveis(materia){
  const set = new Set(ALL_QUESTIONS.filter(q=>q.materia===materia).map(q=>q.tema));
  return ordenarTemas(Array.from(set));
}

