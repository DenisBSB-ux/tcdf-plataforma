/* "Teoria em figura" (PILOTO): resumo visual da regra que fundamenta a resposta, mostrado ao abrir a justificativa.
   Cada cartão é montado a partir do TEXTO DA LEI CARREGADO na plataforma (nada de memória) e conferido antes de entrar aqui.
   Chave: matéria (regex) + número da questão no arquivo da lista. */
const TEORIA_CARTOES = [
  { m:/tribut/i, n:24, titulo:'Conceito de tributo', base:'CTN, art. 3º',
    regra:'Tributo é toda prestação pecuniária compulsória, em moeda ou cujo valor nela se possa exprimir, que não constitua sanção de ato ilícito, instituída em lei e cobrada mediante atividade administrativa plenamente vinculada.',
    pontos:[ { t:'Pecuniária', d:'em moeda, ou valor que nela se possa exprimir' }, { t:'Compulsória', d:'não depende da vontade de quem paga' }, { t:'Não é sanção', d:'multa por ato ilícito não é tributo' }, { t:'Instituída em lei', d:'sem lei, sem tributo' }, { t:'Atividade plenamente vinculada', d:'a cobrança não admite escolha do agente' } ],
    armadilha:'Chamar de tributo uma multa (sanção de ato ilícito) ou uma prestação "voluntária".' },
  { m:/tribut/i, n:68, titulo:'Competência tributária: o que se delega', base:'CTN, art. 7º',
    regra:'A competência tributária (instituir o tributo) é indelegável. Pode ser atribuída a outro ente público a função de arrecadar ou fiscalizar tributos, ou de executar leis, serviços, atos ou decisões administrativas em matéria tributária.',
    pontos:[ { t:'Não se delega', d:'a competência para instituir o tributo' }, { t:'Pode-se atribuir', d:'arrecadar, fiscalizar e executar leis, serviços, atos ou decisões em matéria tributária' }, { t:'Entre entes públicos', d:'de uma pessoa jurídica de direito público a outra' }, { t:'Revogável', d:'a qualquer tempo, por ato unilateral de quem conferiu (§ 2º)' }, { t:'Encargo a particular', d:'arrecadar por pessoa de direito privado não é delegação (§ 3º)' } ],
    armadilha:'Limitar a atribuição a "apenas arrecadar": a lei inclui fiscalizar e executar leis, serviços, atos ou decisões.' },
  { m:/tribut/i, n:241, titulo:'Anterioridade: exercício e noventa dias', base:'CF, art. 150, III, "b" e "c"',
    regra:'É vedado cobrar tributo no mesmo exercício financeiro em que a lei foi publicada (alínea b) e antes de decorridos noventa dias da publicação, observada a alínea b (alínea c).',
    numeros:[ { v:'90 dias', r:'contados da publicação da lei' }, { v:'Exercício', r:'seguinte ao da publicação' } ],
    pontos:[ { t:'Dois filtros, juntos', d:'não basta passar para o exercício seguinte: ainda é preciso esperar 90 dias' }, { t:'Publicada em 31/12', d:'o novo exercício começa em 1º/1, mas a cobrança só vale depois dos 90 dias' }, { t:'Exceções', d:'previstas no § 1º do art. 150 (ex.: algumas alíneas valem só para um dos filtros)' } ],
    armadilha:'Achar que a lei de 31/12 já vale em 1º/1: falta a noventena.' },
  { m:/tribut/i, n:175, titulo:'Imunidade de entidades: requisitos do CTN', base:'CTN, art. 14',
    regra:'O gozo da imunidade das entidades referidas na alínea c do inciso IV do art. 9º depende de três requisitos cumulativos.',
    pontos:[ { t:'I · Não distribuir', d:'nenhuma parcela do patrimônio ou das rendas, a qualquer título' }, { t:'II · Aplicar no País', d:'integralmente os recursos na manutenção dos objetivos institucionais' }, { t:'III · Escriturar', d:'receitas e despesas em livros com formalidades que assegurem a exatidão' }, { t:'Descumprimento', d:'a autoridade competente pode suspender o benefício (§ 1º)' } ],
    armadilha:'Confundir "ter resultado positivo" com "distribuir lucros": o requisito do CTN é não distribuir.' },
  { m:/tribut/i, n:297, titulo:'CNPJ: inapto e baixado', base:'Lei 9.430/1996, art. 81-A',
    regra:'As inscrições no CNPJ são declaradas baixadas após 180 dias contados da declaração de inaptidão. A baixa não impede que se lancem ou cobrem depois os débitos tributários da pessoa jurídica.',
    numeros:[ { v:'180 dias', r:'da declaração de inaptidão até a baixa' } ],
    pontos:[ { t:'Inapta → baixada', d:'após 180 dias da declaração de inaptidão (caput)' }, { t:'Dívida continua', d:'a baixa não impede lançamento nem cobrança posterior (§ 2º)' }, { t:'Restabelecimento', d:'pode ser pedido pela pessoa jurídica, nas condições da Receita Federal (§ 3º)' }, { t:'Também baixa', d:'quem estiver extinto, cancelado ou baixado nos órgãos de registro (§ 1º)' } ],
    armadilha:'Dizer que a baixa extingue os débitos tributários.' },
];

function teoriaCartaoDaQuestao(q){
  if(!q) return null;
  const n = Number(q.n);
  return TEORIA_CARTOES.find(c => c.n === n && c.m.test(String(q.materia||''))) || null;
}
function cartaoTeoriaHtml(q){
  const c = teoriaCartaoDaQuestao(q); if(!c) return '';
  const nums = (c.numeros||[]).map(x=>`<div class="ct-num"><b>${esc(x.v)}</b><span>${esc(x.r)}</span></div>`).join('');
  const pontos = c.pontos.map((p,i)=>`<li class="ct-ponto"><span class="ct-bola" aria-hidden="true">${i+1}</span><div><b>${esc(p.t)}</b><span>${esc(p.d)}</span></div></li>`).join('');
  return `<section class="cartao-teoria" aria-label="Teoria em figura: ${esc(c.titulo)}">
    <header><span class="ct-selo">🗂️ Teoria em figura</span><h4>${esc(c.titulo)}</h4></header>
    <p class="ct-regra">${esc(c.regra)}</p>
    ${nums ? `<div class="ct-nums">${nums}</div>` : ''}
    <ol class="ct-pontos">${pontos}</ol>
    <div class="ct-arm"><span aria-hidden="true">⚠️</span><div><b>Armadilha</b> ${esc(c.armadilha)}</div></div>
    <footer>Resumo do texto da lei carregado na plataforma (${esc(c.base)}) · gerado por IA, conferido; veja o dispositivo completo no pop-up ⚖️.</footer>
  </section>`;
}
