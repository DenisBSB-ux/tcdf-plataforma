/* Doutrina de Direito Administrativo (geral): fichas feitas a partir dos textos de lei carregados (CF/88 etc.), das resoluções
   do banco de questões e de conferências em fontes públicas. Itens sem texto de lei carregado estão marcados nas fichas.
   Cada seção tem `chaves` (regex, flag i): vence a seção com mais chaves casando (enunciado + alternativas); sem casamento vale a seção 0.
   Carregado só ao abrir o pop-up (ver doutrinaAbrir em js/teoria.js). */
const DOUTRINA_DADM = {
 "ato-administrativo": {
  "titulo": "Ato administrativo",
  "fontes": [
   [
    "Lei 9.784/1999, arts. 2º, 50, 53, 54 e 55",
    ""
   ],
   [
    "CF/1988, art. 37, caput; art. 5º, XXXV; art. 206, VIII",
    ""
   ],
   [
    "Súmula 473 do STF (STF)",
    "https://www.stf.jus.br/portal/jurisprudencia/menuSumarioSumulas.asp?sumula=1576"
   ],
   [
    "Súmula 346 do STF (resumo de busca, conjur.com.br)",
    "https://www.conjur.com.br/2020-ago-24/publico-privado-revisao-atos-administracao-instabilidade-jurisprudencia/"
   ],
   [
    "Resoluções antigas das questões (banco de questões), conforme Celso Antônio Bandeira de Mello, Di Pietro e Matheus Carvalho citados nelas",
    ""
   ]
  ],
  "secs": [
   {
    "titulo": "Atributos do ato administrativo: presunção de legitimidade, imperatividade, autoexecutoriedade e tipicidade",
    "lei": [
     "Regra · Só a presunção de legitimidade e veracidade está presente em todos os atos administrativos.",
     "Presunção · Relativa (juris tantum): admite prova em contrário e inverte o ônus da prova, que cabe a quem impugna o ato (o administrado). Legitimidade recai sobre a conformidade com a lei; veracidade, sobre os fatos declarados.",
     "Imperatividade · Impõe obrigações a terceiros independentemente de sua concordância (poder extroverso). Não existe nos atos negociais (licença, autorização) nem nos enunciativos (certidão, parecer).",
     "Autoexecutoriedade · A Administração executa diretamente o ato, sem recorrer antes ao Judiciário; depende de previsão legal ou de urgência, não existe em todos os atos. Ex.: requisição administrativa é autoexecutória, sem aprovação judicial prévia.",
     "Tipicidade · O ato deve corresponder a figuras definidas previamente em lei como aptas a produzir certos resultados (atributo apontado por Di Pietro).",
     "Regime · Os atributos são prerrogativas decorrentes do regime jurídico-administrativo."
    ],
    "chaves": [
     "imperatividade",
     "autoexecut",
     "presunção de (legitimidade|veracidade)",
     "tipicidade",
     "ônus da prova",
     "requisição administrativa"
    ],
    "peg": "Generalizar: dizer que imperatividade e autoexecutoriedade existem em todos os atos, 'independentemente de natureza e de previsão legal'. Outra: trocar imperatividade por tipicidade, ou tratar a presunção como absoluta."
   },
   {
    "titulo": "Elementos do ato: motivo × motivação, objeto, finalidade e forma",
    "lei": [
     "Elementos · Competência, finalidade, forma, motivo e objeto.",
     "Objeto · Efeito jurídico imediato do ato, seu resultado prático (conteúdo). Ex.: na exoneração, o rompimento do vínculo.",
     "Finalidade · Resultado mediato: o interesse público buscado.",
     "Motivo · Situação de fato e de direito que autoriza o ato; requisito indispensável. Motivação é a exposição escrita desse motivo (a lei exige em vários casos, art. 50 da Lei 9.784).",
     "Forma · Modo de exteriorização do ato e formalidades que o revestem."
    ],
    "chaves": [
     "resultado prático",
     "efeito jurídico imediato",
     "requisito indispensável",
     "situação de fato ou de direito",
     "expõe a situação",
     "elemento que representa"
    ],
    "peg": "Trocar objeto (efeito imediato) por finalidade (resultado mediato) ou por motivo; confundir motivo com motivação."
   },
   {
    "titulo": "Vícios e convalidação do ato; desvio de finalidade",
    "lei": [
     "Lei 9.784, art. 55 · Em decisão na qual se evidencie não acarretarem lesão ao interesse público nem prejuízo a terceiros, os atos que apresentarem defeitos sanáveis poderão ser convalidados pela própria Administração.",
     "Doutrina · Só são sanáveis o vício de competência (não exclusiva) e o de forma (não essencial).",
     "Desvio de finalidade · Usar o ato (ex.: remoção) para punir o servidor é desvio de poder; o vício é insanável e o ato deve ser anulado.",
     "Motivos determinantes · O motivo invocado (ex.: necessidade do serviço) que se mostra falso vicia o ato; nova motivação posterior não o corrige."
    ],
    "chaves": [
     "convalida",
     "sanável",
     "desvio de (finalidade|poder)",
     "nova motivação",
     "punir o removido"
    ],
    "peg": "Dizer que vício de finalidade ou de motivo se corrige com 'nova motivação idônea'."
   },
   {
    "titulo": "Classificação por conteúdo: atos enunciativos, ordinatórios, normativos, negociais e sancionadores",
    "lei": [
     "Enunciativos · Apenas atestam fato ou emitem opinião, sem criar direitos: certidão, atestado, parecer, declaração de tempo de serviço.",
     "Ordinatórios · Manifestações internas que disciplinam o funcionamento dos órgãos e a conduta dos agentes (poder hierárquico): portaria, circular, ordem de serviço, instrução. Não existe 'ato ordinário' na classificação.",
     "Normativos · Comando geral e abstrato com efeito externo: decreto, regulamento.",
     "Negociais · Concedem ao particular direito ou faculdade que ele requereu: licença, autorização, permissão.",
     "Sancionadores · Aplicam penalidade por infração."
    ],
    "chaves": [
     "enunciativ",
     "ordinatóri",
     "sancionador",
     "normativo",
     "parecer",
     "declaração de tempo"
    ],
    "peg": "Trocar ordinatório por normativo (que tem efeito externo) ou enunciativo por negocial."
   },
   {
    "titulo": "Ato simples, composto e complexo",
    "lei": [
     "Composto · Um ato principal que depende de manifestação instrumental de outro órgão (parecer, visto, aprovação prévia) para se tornar exequível; são dois atos, um principal e um acessório.",
     "Complexo · Um único ato que nasce da fusão de vontades de órgãos autônomos.",
     "Aplicação · Manifestação prévia de um órgão (ex.: conselho fiscal) para a decisão final de outro é ato composto."
    ],
    "chaves": [
     "ato complexo",
     "ato composto",
     "Conselho Fiscal",
     "antes de sua aprovação"
    ],
    "peg": "Chamar de complexo o ato em que um órgão apenas opina antes da decisão do outro."
   },
   {
    "titulo": "Decreto × resolução",
    "lei": [
     "Decreto · Ato de competência privativa do chefe do Executivo (Presidente, governador, prefeito).",
     "Resolução · Expedida por autoridades de escalão inferior (ministros, secretários) ou por órgãos colegiados (conselhos, tribunais, casas legislativas) para disciplinar matéria de sua competência.",
     "Distinção · O critério principal é quem edita (competência), não apenas a finalidade normativa."
    ],
    "chaves": [
     "decreto",
     "resolução",
     "distinção entre decreto"
    ],
    "peg": "Tornar exclusivo um critério ('decorre exclusivamente da finalidade')."
   },
   {
    "titulo": "Conceito de ato administrativo × atos da Administração (regime de direito público)",
    "lei": [
     "Conceito · Manifestação unilateral de vontade da Administração sob regime de direito público, com prerrogativas, produzindo efeitos jurídicos.",
     "Atos da administração · Atos regidos pelo direito privado (ex.: Estado locando imóvel) não são atos administrativos típicos.",
     "Eficácia · Não existe regra geral de eficácia só 30 dias após a publicação; vale o previsto no próprio ato ou em lei, com frequência de vigência imediata."
    ],
    "chaves": [
     "atos gerenciais",
     "direito privado",
     "trinta dias"
    ],
    "peg": "Atribuir ao ato administrativo regime de direito privado ou inventar prazo de eficácia."
   },
   {
    "titulo": "Silêncio administrativo",
    "lei": [
     "Natureza · Em regra é fato jurídico administrativo (omissão), e não ato; não equivale a consentimento nem a negativa, salvo previsão legal expressa.",
     "Efeitos · Diferem para a Administração (omissão no dever de decidir pode gerar responsabilização) e para o administrado (pode buscar o Judiciário para compelir a decisão).",
     "Prazo · A Lei 9.784 fixa até 30 dias para decidir após a instrução, prorrogáveis por igual período motivado (art. 49)."
    ],
    "chaves": [
     "silêncio administrativo",
     "efeitos do silêncio"
    ],
    "peg": "Dizer que os efeitos do silêncio são idênticos para os dois lados ou que 'quem cala consente'."
   },
   {
    "titulo": "Atos negociais: licença, autorização, permissão, admissão, aprovação e homologação",
    "lei": [
     "Licença · Ato unilateral, vinculado e definitivo: reconhece o direito do particular que preencheu os requisitos legais a exercer atividade (CNH, licença para construir).",
     "Autorização · Ato unilateral, discricionário e precário: faculta uso privativo de bem público, atividade ou ato antes proibido, no interesse do particular; revogável sem indenização, em regra.",
     "Permissão · Discricionária e precária, em regra de interesse coletivo.",
     "Admissão · Ato vinculado que reconhece o direito de ingresso em estabelecimento ou serviço público (matrícula em escola pública).",
     "Aprovação · Controle prévio do mérito de outro ato. Homologação · controle posterior da legalidade de ato já praticado."
    ],
    "chaves": [
     "licença",
     "autorização",
     "permissão",
     "admissão",
     "homologação",
     "precári",
     "ato negocial|classificado como ato negocial"
    ],
    "peg": "Trocar licença (vinculada) por autorização (discricionária) e vice-versa; chamar a licença de discricionária."
   },
   {
    "titulo": "Extinção por cassação e caducidade",
    "lei": [
     "Cassação · Extinção do ato porque o beneficiário deixou de cumprir os requisitos exigidos para mantê-lo (ato nasceu válido). Ex.: licença de funcionamento cassada por descumprir normas sanitárias.",
     "Caducidade · Extinção porque norma superveniente tornou inadmissível a situação antes permitida.",
     "Distinção · Anulação decorre de ilegalidade originária; revogação, de conveniência e oportunidade da Administração, sem culpa do beneficiário."
    ],
    "chaves": [
     "cassação",
     "caducidade",
     "deix(ou|a) de cumprir",
     "descumprimento posterior",
     "descumpre"
    ],
    "peg": "Confundir cassação (conduta do beneficiário) com caducidade (lei nova) ou revogação (mérito)."
   },
   {
    "titulo": "Anulação × revogação: Súmulas 346 e 473 do STF e arts. 53 e 54 da Lei 9.784",
    "lei": [
     "Súmula 473 STF · A administração pode anular seus próprios atos, quando eivados de vícios que os tornam ilegais, porque deles não se originam direitos; ou revogá-los, por motivo de conveniência ou oportunidade, respeitados os direitos adquiridos, e ressalvada, em todos os casos, a apreciação judicial.",
     "Súmula 346 STF · A Administração pode declarar a nulidade dos seus próprios atos (autotutela).",
     "Lei 9.784, art. 53 · A Administração deve anular seus próprios atos, quando eivados de vício de legalidade, e pode revogá-los por motivo de conveniência ou oportunidade, respeitados os direitos adquiridos.",
     "Efeitos · Anulação: ilegalidade, efeitos ex tunc (retroage), com possível modulação por segurança jurídica e boa-fé. Revogação: ato válido, conveniência e oportunidade, efeitos ex nunc, respeita direitos adquiridos.",
     "Lei 9.784, art. 54 · O direito de anular atos de que decorram efeitos favoráveis aos destinatários decai em cinco anos, contados da data em que foram praticados, salvo comprovada má-fé."
    ],
    "chaves": [
     "anul",
     "revog",
     "conveniência (e|ou) oportunidade",
     "direitos adquiridos",
     "ex (nunc|tunc)|retroativ",
     "ilegal"
    ],
    "peg": "Anular por conveniência e oportunidade, ou revogar por ilegalidade (troca clássica); dar efeito ex nunc à anulação ou retroativo à revogação."
   },
   {
    "titulo": "Mérito administrativo, controle de legalidade e Poder Judiciário",
    "lei": [
     "Distinção · Ato vinculado e discricionário diferem pela margem de liberdade (mérito: conveniência e oportunidade, em geral no motivo e no objeto).",
     "Controle judicial · Ambos se submetem ao controle de legalidade/juridicidade pelo Judiciário (CF, art. 5º, XXXV).",
     "Revogação · O controle de mérito e a revogação por conveniência são privativos da própria Administração; o Judiciário anula, não revoga.",
     "Razoabilidade e proporcionalidade · Sua violação é ilegalidade (não mérito), logo o Judiciário pode anular o ato."
    ],
    "chaves": [
     "Poder Judiciário",
     "controle de mérito",
     "controle de legalidade",
     "margem de liberdade",
     "razoabilidade e (da )?proporcionalidade",
     "função jurisdicional",
     "controle de mérito, fundamentado"
    ],
    "peg": "Dizer que o ato discricionário escapa do controle judicial, ou que o Judiciário pode revogar ato discricionário."
   }
  ]
 },
 "regime-juridico": {
  "titulo": "Regime jurídico-administrativo",
  "fontes": [
   [
    "CF/1988, art. 37, caput",
    ""
   ],
   [
    "Lei 9.784/1999, art. 2º",
    ""
   ],
   [
    "Resoluções antigas das questões (banco de questões), incluindo o texto do Tema 1086 do STF ali transcrito",
    ""
   ]
  ],
  "secs": [
   {
    "titulo": "Regime jurídico-administrativo: prerrogativas e restrições, supremacia e indisponibilidade do interesse público",
    "lei": [
     "Conceito · Conjunto de prerrogativas e restrições a que se sujeita a Administração e que não se encontram nas relações entre particulares.",
     "Pedras de toque · Supremacia do interesse público sobre o particular (autoridade) e indisponibilidade do interesse público; a bipolaridade é liberdade do indivíduo (legalidade) × autoridade da Administração.",
     "Indisponibilidade · A Administração não tem livre disposição dos bens e interesses públicos que guarda; o administrador é gestor, não dono.",
     "Derivados · Moralidade, publicidade, eficiência e impessoalidade decorrem desses pilares."
    ],
    "chaves": [
     "bipolaridade",
     "prerrogativas e restrições",
     "indisponibilidade do interesse público",
     "livre disposição",
     "regime jurídico.administrativo"
    ],
    "peg": "Trocar um dos pares por moralidade, publicidade ou eficiência; dar só prerrogativas, sem restrições."
   },
   {
    "titulo": "Princípios expressos e implícitos da Administração",
    "lei": [
     "CF, art. 37 · A administração pública obedecerá aos princípios de legalidade, impessoalidade, moralidade, publicidade e eficiência.",
     "Lei 9.784, art. 2º · Além deles, a Administração obedece a finalidade, motivação, razoabilidade, proporcionalidade, ampla defesa, contraditório, segurança jurídica e interesse público.",
     "Regra · Há princípios explícitos e implícitos; não é vedado aplicar os implícitos."
    ],
    "chaves": [
     "princípios explícitos",
     "princípios expressos",
     "implícitos",
     "dever de transparência"
    ],
    "peg": "'Somente' e 'vedada': restringir indevidamente a Administração aos princípios explícitos."
   },
   {
    "titulo": "Proporcionalidade, legalidade administrativa e eficácia da moralidade",
    "lei": [
     "Proporcionalidade · Parâmetro de controle da atividade administrativa, com três subprincípios: adequação, necessidade e proporcionalidade em sentido estrito; aplica-se também aos atos vinculados.",
     "Legalidade · A Administração só age quando a lei autoriza (legalidade estrita); a ideia de 'pode tudo que a lei não proíbe' é a legalidade privada.",
     "Moralidade · Tem eficácia também positiva, como vetor que conforma a atuação (ex.: vedação ao nepotismo, Súmula Vinculante 13).",
     "Impessoalidade · Veda diferenciações arbitrárias, mas admite tratamento distinto por critérios legais e razoáveis (ex.: cotas).",
     "Supremacia do interesse público · Pilar do regime jurídico-administrativo, segundo a doutrina clássica."
    ],
    "chaves": [
     "proporcionalidade",
     "adequação",
     "necessidade",
     "sentido estrito",
     "legalidade administrativa",
     "parâmetro de controle"
    ],
    "peg": "Dizer que a proporcionalidade só vale para atos discricionários, ou trocar legalidade pública pela privada."
   },
   {
    "titulo": "Moralidade administrativa: elemento ético e quarentena",
    "lei": [
     "Moralidade · Exige distinguir não só o legal do ilegal, mas o honesto do desonesto; o elemento ético subsiste independentemente de prejuízo financeiro.",
     "Aplicação · Contratar a empresa de ex-sócio sem licitação e exibir nome e foto do gestor em software ferem moralidade e impessoalidade (promoção pessoal).",
     "Quarentena · Regra legal que exige 24 meses antes de recontratar professor temporário concretiza a moralidade (evita renovações sucessivas).",
     "Lei 9.784, art. 2º, parágrafo único · Vedada a promoção pessoal de agentes ou autoridades; atuação segundo padrões éticos de probidade, decoro e boa-fé."
    ],
    "chaves": [
     "honesto do desonesto",
     "elemento ético",
     "prejuízo financeiro",
     "24 meses",
     "professor temporário",
     "ex-sócio"
    ],
    "peg": "Condicionar a moralidade à existência de dano ao erário."
   },
   {
    "titulo": "Símbolos religiosos em prédios públicos (Tema 1086 do STF): laicidade e impessoalidade",
    "lei": [
     "Tema 1086 STF · A presença de símbolos religiosos em prédios públicos, pertencentes a qualquer dos Poderes da União, dos Estados, do Distrito Federal e dos Municípios, desde que tenha o objetivo de manifestar a tradição cultural da sociedade brasileira, não viola os princípios da não discriminação, da laicidade estatal e da impessoalidade."
    ],
    "chaves": [
     "símbolo religioso",
     "Tema 1086",
     "laicidade",
     "tradição cultural"
    ],
    "peg": "Dizer que o símbolo viola a impessoalidade mesmo com finalidade cultural."
   }
  ]
 },
 "estado-governo": {
  "titulo": "Estado, governo e administração",
  "fontes": [
   [
    "CF/1988, art. 206, VIII",
    ""
   ],
   [
    "ADI 4167 e ADI 4848 (resumos de busca em stf.jus.br e conjur.com.br)",
    "https://portal.stf.jus.br/jurisprudenciaRepercussao/verPronunciamento.asp?pronunciamento=7028768"
   ],
   [
    "Resolução antiga da questão (banco de questões)",
    ""
   ]
  ],
  "secs": [
   {
    "titulo": "Piso nacional do magistério: constitucionalidade e reajuste não é indexador automático da carreira",
    "lei": [
     "CF, art. 206, VIII · Piso salarial profissional nacional para os profissionais da educação escolar pública, nos termos de lei federal.",
     "STF · O piso nacional do magistério (Lei 11.738/2008) é constitucional (ADI 4167); incide sobre o vencimento, e não sobre a remuneração global.",
     "STF · É constitucional a atualização do piso por ato do MEC (ADI 4848).",
     "Reajuste · Seu reajuste não gera repercussão automática e imediata para toda a carreira (sem efeito cascata/indexação) na carreira municipal.",
     "Atenção · O alcance do reflexo do piso sobre os níveis da carreira é discutido em repercussão geral (Tema 1.218); a questão segue a resolução do banco."
    ],
    "chaves": [
     "piso nacional",
     "magistério",
     "indexador",
     "reajuste automático"
    ],
    "peg": "Dizer que o piso é inconstitucional, ou que o reajuste do piso eleva automaticamente toda a carreira municipal."
   }
  ]
 },
 "agentes-publicos": {
  "titulo": "Agentes públicos",
  "fontes": [
   [
    "CF/1988 (js/cf-texto.js)",
    ""
   ],
   [
    "Resolução original da questão (banco de questões)",
    ""
   ],
   [
    "Súmula 21 do STF (STF)",
    "https://www.legjur.com/sumula/stf/21"
   ],
   [
    "Súmula 611 do STJ (STJ)",
    "https://arquivocidadao.stj.jus.br/index.php/sumula-611"
   ],
   [
    "Lei 9.784/1999, art. 54",
    ""
   ],
   [
    "ADCT, art. 19",
    ""
   ]
  ],
  "secs": [
   {
    "titulo": "Controle judicial do PAD: Súmula 665 do STJ",
    "lei": [
     "STJ · Súmula 665: “O controle jurisdicional do processo administrativo disciplinar restringe-se ao exame da regularidade do procedimento e da legalidade do ato, à luz dos princípios do contraditório, da ampla defesa e do devido processo legal, não sendo possível incursão no mérito administrativo, ressalvadas as hipóteses de flagrante ilegalidade, teratologia ou manifesta desproporcionalidade da sanção aplicada.”",
     "Regra · o Judiciário confere legalidade e regularidade (contraditório, ampla defesa, devido processo legal); não reavalia provas nem a conveniência da sanção.",
     "Exceções · só três: flagrante ilegalidade, teratologia e manifesta desproporcionalidade da sanção; permitem invalidar a punição sem abrir o mérito em geral."
    ],
    "peg": "Item que diz que o juiz pode trocar a pena por outra que 'atenderia melhor ao interesse público' (errado: não substitui a Administração) ou que ignora as três ressalvas.",
    "chaves": [
     "controle (jurisdicional|judicial)",
     "m[ée]rito administrativo",
     "teratolog",
     "desproporcionalidade",
     "substituir a Administra",
     "conveni[êe]ncia da san"
    ]
   },
   {
    "titulo": "PAD: denúncia anônima, prazo, defesa técnica, portaria e demissão por improbidade",
    "lei": [
     "STJ · Súmula 611: “Desde que devidamente motivada e com amparo em investigação ou sindicância, é permitida a instauração de processo administrativo disciplinar com base em denúncia anônima, em face do poder-dever de autotutela imposto à Administração.”",
     "Denúncia · a apócrifa, por si só, não autoriza punição; serve de gatilho para averiguação preliminar e, confirmados os indícios, para o PAD.",
     "STJ · Súmula 592: o excesso de prazo para concluir o PAD não gera nulidade, salvo efetivo prejuízo à defesa (sem prejuízo, sem nulidade).",
     "STF · Súmula Vinculante 5: a falta de defesa técnica por advogado no PAD não ofende a Constituição.",
     "STJ · Súmula 641: a portaria de instauração não exige exposição detalhada dos fatos; o detalhamento é exigido na indiciação.",
     "Improbidade · a autoridade administrativa aplica a demissão por improbidade (Lei 8.112/90, art. 132, IV) no próprio PAD, sem esperar condenação judicial prévia."
    ],
    "peg": "Inverter as súmulas: excesso de prazo 'sempre nulo', ausência de advogado 'sempre nula', portaria 'com exposição detalhada' ou denúncia anônima 'vedada'.",
    "chaves": [
     "den[úu]ncia an[ôo]nima",
     "portaria de instaura",
     "excesso de prazo",
     "defesa t[ée]cnica|advogado constitu",
     "improbidade",
     "sindic[âa]ncia"
    ]
   },
   {
    "titulo": "Ingresso no cargo: psicotécnico, diploma na posse e doença grave",
    "lei": [
     "STF · Súmula Vinculante 44: “Só por lei se pode sujeitar a exame psicotécnico a habilitação de candidato a cargo público.” O edital, sozinho, não basta.",
     "STJ · Súmula 266: “O diploma ou habilitação legal para o exercício do cargo deve ser exigido na posse e não na inscrição para o concurso público.”",
     "STF · Tema 1.015 (repercussão geral): é inconstitucional a vedação à posse de candidato aprovado que, embora tenha sido acometido por doença grave, não apresenta sintoma incapacitante nem restrição relevante que impeça o exercício da função pretendida.",
     "CF · art. 37, II: a investidura em cargo ou emprego depende de concurso público de provas ou de provas e títulos, na forma da lei, ressalvadas as nomeações para cargo em comissão de livre nomeação e exoneração."
    ],
    "peg": "Exigir psicotécnico 'se previsto no edital' (errado: só por lei) ou exigir o diploma já na inscrição (errado: é na posse).",
    "chaves": [
     "psicot[ée]cnic",
     "diploma",
     "doen[çc]a grave",
     "habilita[çc][ãa]o legal",
     "ingresso em cargo",
     "requisitos (exigidos|necess[áa]rios)"
    ]
   },
   {
    "titulo": "Teto remuneratório e acumulação de cargos: Tema 377 do STF",
    "lei": [
     "CF · art. 37, XI: remuneração, subsídio, proventos e pensões, percebidos cumulativamente ou não, incluídas as vantagens pessoais, não podem exceder o subsídio mensal dos Ministros do STF.",
     "CF · art. 37, XVI: veda-se a acumulação remunerada de cargos públicos, salvo, com compatibilidade de horários e observado o inciso XI: dois cargos de professor; professor com outro de qualquer natureza; dois cargos ou empregos privativos de profissionais de saúde, com profissões regulamentadas.",
     "CF · art. 37, XVII: a proibição de acumular alcança autarquias, fundações, empresas públicas, sociedades de economia mista, suas subsidiárias e sociedades controladas pelo poder público.",
     "STF · Tema 377: nos casos de acumulação constitucionalmente autorizada, a incidência do art. 37, XI pressupõe a consideração de cada um dos vínculos formalizados, afastada a observância do teto quanto ao somatório dos ganhos."
    ],
    "peg": "Somar as remunerações da acumulação lícita para aplicar o teto (errado: o teto incide em cada vínculo).",
    "chaves": [
     "Tema 377",
     "somat[óo]rio",
     "cada v[íi]nculo",
     "acumula[çc][ãa]o de cargo",
     "teto remunerat[óo]rio",
     "profissionais de sa[úu]de"
    ]
   },
   {
    "titulo": "Remuneração: pagamento indevido, efeito cascata, penhora e prazo para revisão",
    "lei": [
     "STJ · pagamento indevido por erro da Administração (erro operacional ou de interpretação de lei), recebido de boa-fé, dispensa a devolução: proteção da confiança e caráter alimentar da verba.",
     "CF · art. 37, XIV: os acréscimos pecuniários percebidos por servidor não são computados nem acumulados para concessão de acréscimos ulteriores (veda o efeito cascata).",
     "Lei 9.784/1999 · art. 54: o direito da Administração de anular atos de que decorram efeitos favoráveis decai em cinco anos, salvo comprovada má-fé (não são dez anos).",
     "Penhora · a regra é a impenhorabilidade de vencimentos, com exceção para pensão alimentícia (segundo a resolução do banco).",
     "Teto · não há direito adquirido a remuneração acima do teto; o corte é imediato (segundo a resolução do banco)."
    ],
    "peg": "Prazo decadencial de dez anos; penhora de vencimentos como regra; vantagens acumuladas para novos acréscimos; direito adquirido contra o abate-teto.",
    "chaves": [
     "pagamento indevido",
     "devol",
     "penhora",
     "acr[ée]scimos pecuni[áa]rios",
     "vantagens indevidas",
     "erro administrativo"
    ]
   },
   {
    "titulo": "Estabilidade, estágio probatório, efetividade e vitaliciedade",
    "lei": [
     "CF · art. 41: são estáveis após três anos de efetivo exercício os servidores nomeados para cargo de provimento efetivo em virtude de concurso público.",
     "CF · art. 41, § 1º: o estável só perde o cargo por sentença judicial transitada em julgado, processo administrativo com ampla defesa ou procedimento de avaliação periódica de desempenho (lei complementar, com ampla defesa).",
     "STF · Súmula 21: “Funcionário em estágio probatório não pode ser exonerado nem demitido sem inquérito ou sem as formalidades legais de apuração de sua capacidade.”",
     "Conceitos · efetividade é atributo do cargo (provido por concurso); estabilidade é garantia do servidor; vitaliciedade é garantia de certas carreiras (a resolução cita ministros e conselheiros de tribunais de contas, arts. 73, § 3º e 75 da CF).",
     "ADCT · art. 19: estabilidade excepcional dos servidores da administração direta, autárquica e fundacional com cinco anos continuados em 1988; a resolução do banco a limita a regime estatutário, sem alcançar empregados de entes de direito privado."
    ],
    "peg": "Estagiário probatório demitível 'sem formalidades' por não ser estável (errado); confundir efetividade (cargo) com estabilidade (servidor).",
    "chaves": [
     "est[áa]gio probat",
     "efetividade",
     "vitaliciedade",
     "estabilidade",
     "ADCT",
     "exonerad"
    ]
   },
   {
    "titulo": "Classificação dos agentes públicos: agentes políticos e honoríficos",
    "lei": [
     "Agentes políticos (Hely Lopes Meirelles) · primeiro escalão: chefes do Executivo, parlamentares e seus auxiliares imediatos, ministros e secretários de Estado/Município; exercem atribuições constitucionais.",
     "Livre nomeação · não retira dos ministros e secretários a condição de agentes políticos.",
     "CF · art. 39, § 4º: membro de Poder, detentor de mandato eletivo, Ministros de Estado e Secretários estaduais e municipais são remunerados exclusivamente por subsídio em parcela única.",
     "Agentes honoríficos · particulares em colaboração com o poder público, convocados ou designados para serviço relevante, transitório e sem remuneração: mesários, jurados do tribunal do júri, comissários de menores."
    ],
    "peg": "Tratar ministros/secretários como servidores comuns por serem de livre nomeação; classificar jurados como servidores ou agentes delegados.",
    "chaves": [
     "agentes pol[íi]ticos",
     "honor[íi]fic",
     "jurados",
     "particulares em colabora",
     "minist(ros|ro) (e secret[áa]rios )?de Estado"
    ]
   }
  ]
 },
 "poderes": {
  "titulo": "Poderes da administração",
  "fontes": [
   [
    "CTN, arts. 78 (js/ctn-texto.js)",
    ""
   ],
   [
    "Resolução original da questão (banco de questões)",
    ""
   ],
   [
    "Tema 532 do STF (RE 633.782), conforme resolução do banco",
    ""
   ]
  ],
  "secs": [
   {
    "titulo": "Poder de polícia: conceito, atributos e autoexecutoriedade",
    "lei": [
     "CTN · art. 78: poder de polícia é a atividade da administração pública que, limitando ou disciplinando direito, interesse ou liberdade, regula a prática de ato ou abstenção de fato, em razão de interesse público concernente à segurança, higiene, ordem, costumes, disciplina da produção e do mercado, exercício de atividades econômicas dependentes de autorização, tranquilidade pública e respeito à propriedade e aos direitos individuais ou coletivos.",
     "CTN · art. 78, parágrafo único: é regular quando exercido pelo órgão competente, nos limites da lei, com processo legal e, sendo discricionária a atividade, sem abuso ou desvio de poder.",
     "Atributos · discricionariedade, autoexecutoriedade e coercibilidade (DAC); há atos de polícia vinculados (ex.: licença).",
     "Autoexecutoriedade · a Administração age diretamente, sem autorização judicial prévia, mas não em toda medida: exige previsão legal ou urgência, com controle judicial posterior e respeito a lei e direitos fundamentais.",
     "Extroversão · o poder de polícia atinge particulares (efeitos externos); hierárquico e disciplinar são introversos."
    ],
    "peg": "Dizer que toda medida de polícia é autoexecutória, ou que polícia é introversa; trocar com hierárquico/disciplinar.",
    "chaves": [
     "autoexecutoriedade",
     "coercibilidade",
     "extrover",
     "de pol[íi]cia",
     "discricionariedade",
     "autoriza[çc][ãa]o judicial"
    ]
   },
   {
    "titulo": "Delegação do poder de polícia: Tema 532 do STF",
    "lei": [
     "STF · Tema 532 (RE 633.782): “É constitucional a delegação do poder de polícia, por meio de lei, a pessoas jurídicas de direito privado integrantes da Administração Pública indireta de capital social majoritariamente público que prestem exclusivamente serviço público de atuação própria do Estado e em regime não concorrencial.”",
     "Requisitos · lei (não basta contrato administrativo); entidade da administração indireta; capital majoritariamente público; serviço público próprio do Estado, exclusivo e sem concorrência.",
     "Ciclo de polícia · consentimento, fiscalização e sanção podem ser delegados; indelegável é só a ordem de polícia (fase normativa)."
    ],
    "peg": "Dizer que só a fiscalização é indelegável (errado: é a ordem) ou que o contrato administrativo basta sem lei.",
    "chaves": [
     "delega[çc][ãa]o",
     "Tema 532",
     "capital social",
     "n[ãa]o concorrencial",
     "contrato administrativo",
     "pessoa jur[íi]dica de direito privado"
    ]
   },
   {
    "titulo": "Poder disciplinar: conceito, vínculo específico e demissão",
    "lei": [
     "Di Pietro · poder disciplinar é o que cabe à administração para apurar infrações e aplicar penalidades aos servidores e a outras pessoas sujeitas à disciplina administrativa, como os que com ela contratam.",
     "Vínculo específico · é o critério: sanção a particular sem vínculo (multa de trânsito, interdição de estabelecimento) decorre do poder de polícia.",
     "Origem · correlato e em regra derivado do poder hierárquico (relação interna) ou da sujeição especial (contratos).",
     "Demissão · penalidade por ilícito administrativo (Lei 8.112/90, art. 132) que desliga o servidor dos quadros e rompe o vínculo; é sanção máxima, não se confunde com exoneração."
    ],
    "peg": "Tomar toda sanção a particular como poder disciplinar; confundir demissão (punição) com exoneração.",
    "chaves": [
     "poder disciplinar",
     "apurar infra",
     "penalidade",
     "demiss[ãa]o",
     "v[íi]nculo espec[íi]fico",
     "il[íi]cito administrativo"
    ]
   },
   {
    "titulo": "Poder hierárquico: ordens, revisão e recurso hierárquico",
    "lei": [
     "Conteúdo · estruturar e organizar a Administração, dar ordens, delegar e avocar competências e rever atos dos subordinados.",
     "Recurso hierárquico · o recurso do particular ao chefe de quem decidiu decorre do poder hierárquico (relação revisional).",
     "Introversão · o hierárquico atua dentro da Administração, ao contrário do poder de polícia."
    ],
    "peg": "Atribuir o recurso ao chefe ao poder disciplinar ou ao de polícia.",
    "chaves": [
     "hier[áa]rquic",
     "revision",
     "recurso (ao|para o) chefe",
     "avoca"
    ]
   },
   {
    "titulo": "Abuso de poder: excesso de poder e desvio de finalidade",
    "lei": [
     "Gênero · abuso de poder, com duas espécies: excesso de poder (vício de competência: o agente age além do que podia) e desvio de poder ou de finalidade (vício de finalidade).",
     "Desvio · o agente é competente, mas pratica o ato com finalidade diversa da prevista, explícita ou implicitamente, na norma (ex.: suspender servidor para afastá-lo de investigação).",
     "Efeito · o desvio de finalidade é vício insanável no elemento finalidade e leva à invalidação do ato.",
     "Controle · atos vinculados, discricionários e disciplinares são controláveis judicialmente quanto à legalidade e moralidade.",
     "Competência · vício de competência nem sempre gera nulidade absoluta; é sanável, salvo competência exclusiva (segundo a resolução do banco).",
     "CTN · art. 78, parágrafo único: poder de polícia regular é o exercido sem abuso ou desvio de poder."
    ],
    "peg": "Trocar os conceitos (excesso × desvio); dizer que ato disciplinar ou vinculado é imune a controle judicial.",
    "chaves": [
     "desvio de (poder|finalidade)",
     "excesso de poder",
     "abuso d[eo] poder",
     "finalidade diversa",
     "v[íi]cio no elemento"
    ]
   },
   {
    "titulo": "Requisição de servidor: necessidade relevante e desvio de finalidade",
    "lei": [
     "Regra · a requisição de servidor pressupõe necessidade administrativa relevante e destina-se a demandas temporárias ou de especialização excepcional em outro órgão.",
     "Vedação · usá-la como meio ordinário e permanente de suprir deficiência estrutural de pessoal, burlando o concurso, é uso indevido, desvio de finalidade.",
     "Base · a resolução do banco invoca jurisprudência do TCU e do STF sem indicar número; não conferido."
    ],
    "peg": "Admitir a requisição como solução permanente para falta de pessoal.",
    "chaves": [
     "requisi[çc][ãa]o",
     "requisit",
     "defici[êe]ncia estrutural",
     "suprir"
    ]
   }
  ]
 },
 "servicos-publicos": {
  "titulo": "Serviços públicos",
  "fontes": [
   [
    "CF/1988, art. 175 (js/cf-texto.js)",
    ""
   ],
   [
    "Resolução original da questão (banco de questões)",
    ""
   ],
   [
    "Lei 8.987/1995, conforme transcrições da resolução do banco",
    ""
   ]
  ],
  "secs": [
   {
    "titulo": "Classificação dos serviços: uti universi × uti singuli; próprios × impróprios",
    "lei": [
     "Uti universi (gerais) · prestados à coletividade, sem usuários determinados; indivisíveis; custeados pela receita geral de impostos (segurança pública, defesa nacional).",
     "Uti singuli (individuais) · usuários determinados ou determináveis, satisfação individual e direta, uso mensurável; remunerados por taxa ou tarifa (água, energia, telefonia).",
     "Impróprios · atendem necessidades coletivas, mas o Estado não os titulariza nem executa: apenas regulamenta, autoriza e fiscaliza (ex.: táxi, despachantes, atividade bancária).",
     "CF · art. 175: incumbe ao Poder Público, na forma da lei, diretamente ou sob regime de concessão ou permissão, sempre através de licitação, a prestação de serviços públicos."
    ],
    "peg": "Trocar os rótulos (uti universi com usuário determinado e taxa; uti singuli indivisível e pago por impostos).",
    "chaves": [
     "uti universi",
     "uti singuli",
     "impr[óo]prio",
     "Hely Lopes",
     "indivis[íi]vel",
     "usu[áa]rios determinados"
    ]
   },
   {
    "titulo": "Serviço adequado e princípios: continuidade, modicidade, generalidade, atualidade, mutabilidade",
    "lei": [
     "CF · art. 175, parágrafo único: a lei disporá sobre o regime das concessionárias, direitos dos usuários, política tarifária e obrigação de manter serviço adequado.",
     "Continuidade · o serviço não pode sofrer interrupção injustificada; admite interrupção em emergência ou, com prévio aviso, por razões técnicas ou inadimplemento.",
     "Modicidade · tarifas acessíveis (Lei 8.987, art. 6º, § 1º); não significa gratuidade.",
     "Generalidade/universalidade · atender a todos sem discriminação; vedado selecionar usuários por renda ou afinidade política.",
     "Atualidade · Lei 8.987, art. 6º, § 2º: “A atualidade compreende a modernidade das técnicas, do equipamento e das instalações e a sua conservação, bem como a melhoria e expansão do serviço.”",
     "Mutabilidade · o regime pode mudar para atender o interesse público, mas o aumento de custos do prestador exige reequilíbrio econômico-financeiro.",
     "Cortesia · dever de atender com urbanidade, não faculdade."
    ],
    "peg": "Modicidade como gratuidade obrigatória; mutabilidade 'sem compensação'; cortesia como faculdade do servidor.",
    "chaves": [
     "continuidade",
     "modicidade",
     "generalidade|universalidade",
     "mutabilidade",
     "cortesia",
     "atualidade",
     "servi[çc]o adequado",
     "modernidade das t[ée]cnicas",
     "pleno atendimento"
    ]
   },
   {
    "titulo": "Interrupção do serviço: art. 6º, §§ 3º e 4º da Lei 8.987/1995",
    "lei": [
     "Lei 8.987/1995 · art. 6º, § 3º: não se caracteriza descontinuidade a interrupção em situação de emergência ou após prévio aviso, quando: I – motivada por razões de ordem técnica ou de segurança das instalações; II – por inadimplemento do usuário, considerado o interesse da coletividade.",
     "Lei 8.987/1995 · art. 6º, § 4º: a interrupção por inadimplemento não poderá iniciar-se na sexta-feira, no sábado ou no domingo, nem em feriado ou no dia anterior a feriado.",
     "Aviso · emergência dispensa aviso prévio; razões técnicas e inadimplemento exigem prévio aviso.",
     "Origem · a vedação de corte em fins de semana e feriados protege a continuidade (§§ 3º e 4º, com a redação da Lei 14.015/2020, segundo a resolução do banco)."
    ],
    "peg": "Prévio aviso 'basta' para iniciar o corte na sexta-feira ou no dia seguinte à constatação (errado).",
    "chaves": [
     "inadimpl",
     "sexta-feira",
     "pr[ée]vio aviso",
     "interrup[çc][ãa]o",
     "feriado",
     "corte"
    ]
   },
   {
    "titulo": "Concessão × permissão e concessão a consórcio",
    "lei": [
     "Concessão · delegação mediante licitação (concorrência ou diálogo competitivo), a pessoa jurídica ou consórcio de empresas (não pessoa física), por conta e risco, com prazo determinado; não é precária.",
     "Permissão · delegação a título precário, mediante licitação, a pessoa física ou jurídica.",
     "Consórcio · na concessão a consórcio, a empresa líder responde perante o poder concedente pelo cumprimento do contrato, sem prejuízo da responsabilidade solidária das demais consorciadas (art. 19, § 2º da Lei 8.987/1995, segundo a resolução do banco).",
     "Tarifa · fixada pelo preço da proposta vencedora e preservada pelas regras de revisão do contrato (art. 9º, segundo a resolução do banco)."
    ],
    "peg": "Atribuir precariedade à concessão ou admitir concessão a pessoa física.",
    "chaves": [
     "prec[áa]rio",
     "cons[óo]rcio",
     "permiss[ãa]o",
     "capacidade para seu desempenho",
     "conta e risco",
     "l[íi]der"
    ]
   },
   {
    "titulo": "Extinção da concessão: encampação × caducidade",
    "lei": [
     "Lei 8.987/1995 · art. 37: encampação é a retomada do serviço pelo poder concedente durante o prazo da concessão, por motivo de interesse público, mediante lei autorizativa específica e após prévio pagamento da indenização.",
     "Lei 8.987/1995 · art. 38: a inexecução total ou parcial do contrato acarreta, a critério do poder concedente, a caducidade ou sanções contratuais.",
     "Lei 8.987/1995 · art. 38, § 2º: a caducidade é precedida de verificação da inadimplência em processo administrativo, com ampla defesa.",
     "Lei 8.987/1995 · art. 38, § 3º: antes do processo, comunicam-se detalhadamente os descumprimentos e dá-se prazo para correção.",
     "Lei 8.987/1995 · art. 38, § 4º: comprovada a inadimplência, a caducidade é declarada por decreto do poder concedente, independentemente de indenização prévia, calculada no curso do processo."
    ],
    "peg": "Inverter: encampação por inadimplemento e caducidade por interesse público com lei autorizativa.",
    "chaves": [
     "encampa",
     "caducidade",
     "retomada",
     "lei autorizativa",
     "indeniza[çc][ãa]o",
     "por decreto"
    ]
   }
  ]
 },
 "controle": {
  "titulo": "Controle da administração pública",
  "fontes": [
   [
    "CF/1988, arts. 5º (XXXV, LXIX, LXXIII), 70, 71 e 74",
    ""
   ],
   [
    "Resoluções do banco de questões (original300) das questões do tema",
    ""
   ],
   [
    "Tema 445 da repercussão geral do STF (prazo do TC em aposentadorias), conforme resolução do banco",
    ""
   ],
   [
    "Tema 899 da repercussão geral do STF (prescrição do ressarcimento), conforme resolução do banco",
    ""
   ]
  ],
  "secs": [
   {
    "titulo": "Classificações do controle: origem (interno × externo), momento e iniciativa",
    "lei": [
     "Origem · interno é o exercido dentro da mesma estrutura (órgão superior sobre inferior, mesmo Poder, pelo sistema de controle interno de cada Poder, CF art. 74); externo é o de um Poder sobre os atos de outro (ex.: Legislativo com auxílio do TC sobre o Executivo, CF art. 70)",
     "Momento · quanto ao tempo o controle é prévio (antes do ato), concomitante (durante a execução) ou posterior/subsequente (depois de produzidos os efeitos)",
     "Iniciativa · de ofício (o controlador age por conta própria) ou provocado (por recurso, representação, ação); é critério diferente do momento",
     "Natureza · administrativo (da própria Administração), legislativo (Congresso/TC) e judicial ou jurisdicional (Judiciário)"
    ],
    "chaves": [
     "controle (interno|externo)",
     "quanto (à|a) origem",
     "quanto ao (momento|tempo)",
     "de of[ií]cio",
     "pr[ée]vio, concomitante",
     "mesma estrutura"
    ],
    "peg": "Misturar critérios: 'de ofício' diz respeito à iniciativa, não ao tempo; e controle de órgão superior sobre inferior na mesma estrutura é interno, não externo."
   },
   {
    "titulo": "Controle administrativo: autotutela, controle hierárquico e recursos (próprio × impróprio)",
    "lei": [
     "Conceito · controle administrativo é o exercido pela própria Administração sobre seus atos, de ofício ou mediante provocação (recursos), com base na autotutela",
     "Hierárquico · o chefe pode rever, modificar, avocar e anular atos do subordinado; recurso ao chefe, na mesma estrutura, é controle administrativo interno",
     "Recurso hierárquico próprio · dirigido à autoridade superior na mesma cadeia hierárquica; decorre do poder hierárquico e dispensa previsão legal expressa",
     "Recurso hierárquico impróprio · dirigido a autoridade sem relação hierárquica com quem praticou o ato (ex.: ministério em recurso contra ato de entidade vinculada); só cabe com previsão legal expressa",
     "Autotutela · anulação (ato ilegal, efeitos ex tunc) e revogação (ato legal, mas inconveniente ou inoportuno, efeitos ex nunc)"
    ],
    "chaves": [
     "hier[áa]rquico impr[óo]prio",
     "recurso (hier[áa]rquico|administrativo|para o chefe)",
     "autotutela",
     "revoga[çc][ãa]o",
     "controle hier[áa]rquico",
     "recurso para o chefe de"
    ],
    "peg": "Confundir recurso impróprio com recurso ao Judiciário ou ao próprio autor do ato (pedido de reconsideração); e achar que a revogação tem efeito retroativo."
   },
   {
    "titulo": "Controle jurisdicional: alcance, limites e momento",
    "lei": [
     "Regra · o Judiciário controla a legalidade e a legitimidade (juridicidade) do ato, inclusive princípios como razoabilidade e proporcionalidade, mas não reexamina o mérito (conveniência e oportunidade) nem substitui a escolha lícita do gestor",
     "CF art. 5º, XXXV · a lei não excluirá da apreciação do Poder Judiciário lesão ou ameaça a direito; por isso, em regra, não se exige esgotar a via administrativa",
     "Momento · em regra posterior e corretivo, mas pode ser preventivo diante de ameaça a direito (ex.: mandado de segurança preventivo)",
     "Provocação · o Judiciário é inerte e atua mediante ação; anula atos ilegais, mas não os revoga (revogação é da própria Administração)",
     "Natureza · a decisão judicial que julga procedente a ação contra a Administração é controle jurisdicional; controle administrativo é o da própria Administração"
    ],
    "chaves": [
     "controle (jurisdicional|judicial)",
     "m[ée]rito administrativo",
     "conveni[êe]ncia e oportunidade",
     "a[çc][ãa]o judicial",
     "obriga[çc][ãa]o de fazer",
     "Poder Judici[áa]rio pode"
    ],
    "peg": "Dizer que o juiz pode substituir a decisão do administrador por outra 'mais adequada': o mérito é insindicável; o juiz só afasta o ato ilegal."
   },
   {
    "titulo": "Sistemas de controle jurisdicional: jurisdição una × contencioso administrativo",
    "lei": [
     "Jurisdição una (sistema inglês) · o Judiciário detém o monopólio da função jurisdicional, com coisa julgada; é o sistema adotado no Brasil (CF art. 5º, XXXV)",
     "Contencioso administrativo (sistema francês) · dualidade de jurisdição: coexistem a jurisdição comum e a administrativa, independentes entre si",
     "Consequência · no Brasil não há contencioso administrativo com função jurisdicional; as decisões administrativas não fazem coisa julgada material"
    ],
    "chaves": [
     "jurisdi[çc][ãa]o una",
     "contencioso administrativo",
     "dualidade de jurisdi[çc][ãa]o",
     "modelo franc[êe]s",
     "monop[óo]lio da fun[çc][ãa]o jurisdicional"
    ],
    "peg": "Atribuir ao Brasil o modelo francês de dualidade de jurisdição."
   },
   {
    "titulo": "Remédios constitucionais: mandado de segurança e ação popular",
    "lei": [
     "Mandado de segurança · CF art. 5º, LXIX: protege direito líquido e certo não amparado por habeas corpus ou habeas data, contra ilegalidade ou abuso de poder de autoridade",
     "Ação popular · CF art. 5º, LXXIII: qualquer cidadão pode propô-la para anular ato lesivo ao patrimônio público ou de entidade de que o Estado participe, à moralidade administrativa, ao meio ambiente e ao patrimônio histórico e cultural",
     "Patrimônio público · a proteção do erário não é exclusiva da ação popular: a ação civil pública e, havendo direito líquido e certo, o mandado de segurança também podem tutelá-lo"
    ],
    "chaves": [
     "mandado de seguran[çc]a",
     "a[çc][ãa]o popular",
     "rem[ée]dios? constitucion",
     "patrim[ôo]nio p[úu]blico"
    ],
    "peg": "Afirmar que a defesa do patrimônio público é monopólio da ação popular."
   },
   {
    "titulo": "Tribunais de Contas: natureza, competências (CF art. 71) e poder geral de cautela",
    "lei": [
     "Natureza · o controle externo é do Legislativo com auxílio do TC (CF art. 71); o TC exerce função administrativa, não jurisdicional, e suas decisões não fazem coisa julgada material, sendo sujeitas a controle de legalidade pelo Judiciário (sem rever o mérito técnico)",
     "Competências · apreciar contas do Presidente por parecer prévio (art. 71, I); julgar contas dos administradores (II); apreciar, para registro, a legalidade de aposentadorias, reformas e pensões (III); aplicar sanções (VIII); assinar prazo e sustar ato impugnado (IX e X)",
     "Contratos · a sustação de contrato é adotada diretamente pelo Congresso, que solicita as medidas ao Executivo; se não agirem em 90 dias, o Tribunal decide (art. 71, §§ 1º e 2º); o TC não susta contrato diretamente de início",
     "Título executivo · as decisões de que resulte imputação de débito ou multa têm eficácia de título executivo (art. 71, § 3º); a cobrança exige ação de execução no Judiciário",
     "Cautela · o TC pode, cautelarmente, sustar licitação com indício de grave irregularidade antes da decisão de mérito (poder geral de cautela, reconhecido pelo STF), o que é atuação preventiva",
     "Concessões · no TCU, a desestatização é acompanhada na outorga (controle prévio) e na execução do contrato (concomitante e posterior)",
     "Controle interno · ao saber de irregularidade, os responsáveis dão ciência ao TC, sob pena de responsabilidade solidária (art. 74, § 1º)"
    ],
    "chaves": [
     "tribunais? de contas|\\bTCU\\b",
     "fun[çc][õo]es? (judicial|administrativa)|coisa julgada",
     "poder geral de cautela",
     "sustação cautelar|sustar",
     "concess(ões|ão), permiss(ões|ão)",
     "t[íi]tulo executivo"
    ],
    "peg": "Tratar o TC como órgão jurisdicional (suas decisões não fazem coisa julgada) ou achar que ele susta diretamente contratos."
   },
   {
    "titulo": "Prazo do Tribunal de Contas para apreciar aposentadoria, reforma e pensão (Tema 445 do STF)",
    "lei": [
     "Tese · os Tribunais de Contas estão sujeitos ao prazo de 5 anos para julgar a legalidade do ato de concessão inicial de aposentadoria, reforma ou pensão, a contar da chegada do processo à respectiva Corte de Contas (Tema 445 da repercussão geral)",
     "Termo inicial · a chegada do processo ao Tribunal de Contas, e não a publicação do ato pela Administração de origem",
     "Natureza do prazo · decadencial; o registro continua exigido pela CF art. 71, III, mas o Tribunal não tem prazo ilimitado"
    ],
    "chaves": [
     "cinco anos|5 anos",
     "concess[ãa]o inicial de aposentadoria",
     "aposentadoria, reforma ou pens[ãa]o",
     "ato complexo",
     "registro pela corte"
    ],
    "peg": "Dizer que não há prazo por se tratar de ato complexo, ou contá-lo da publicação do ato."
   },
   {
    "titulo": "Decisões de Tribunal de Contas: prescrição do ressarcimento e tomada de contas especial de chefes do Executivo",
    "lei": [
     "Prescrição · é prescritível a pretensão de ressarcimento ao erário fundada em decisão de Tribunal de Contas (Tema 899 da repercussão geral): o débito fixado pelo TC não a torna imprescritível",
     "Tomada de contas especial · identificada responsabilidade pessoal em irregularidades em convênios interfederativos de repasse de verbas, o TC pode condenar administrativamente o chefe do Executivo, sem necessidade de posterior julgamento pelo Legislativo, conforme a resolução do banco",
     "Distinção · o julgamento político das contas de governo (parecer prévio) não se confunde com a responsabilização pessoal do ordenador de despesas na tomada de contas especial"
    ],
    "chaves": [
     "ressarcimento ao er[áa]rio",
     "prescri[çc][ãa]o",
     "tomada de contas especial",
     "conv[êe]nio interfederativo",
     "d[ée]bito"
    ],
    "peg": "Confundir parecer prévio sobre contas de governo com julgamento de contas de gestão, ou tornar o ressarcimento imprescritível só por decorrer de decisão do TC."
   }
  ]
 },
 "responsabilidade-civil": {
  "titulo": "Responsabilidade civil do Estado",
  "fontes": [
   [
    "CF/1988, art. 37, § 6º",
    ""
   ],
   [
    "Resoluções do banco de questões (original300) das questões do tema",
    ""
   ]
  ],
  "secs": [
   {
    "titulo": "Evolução das teorias e regra constitucional (CF art. 37, § 6º)",
    "lei": [
     "Irresponsabilidade · teoria típica do absolutismo ('o rei não erra'): o Estado não respondia por danos; está superada no Brasil",
     "Regra atual · CF art. 37, § 6º: pessoas jurídicas de direito público e as de direito privado prestadoras de serviços públicos respondem pelos danos que seus agentes, nessa qualidade, causarem a terceiros, assegurado o direito de regresso contra o responsável nos casos de dolo ou culpa",
     "Teoria adotada · risco administrativo (responsabilidade objetiva, que admite excludentes e atenuantes); o risco integral, que não admite excludentes, é exceção",
     "Elementos · conduta, dano e nexo causal; dispensa-se a prova de culpa da vítima ou do agente para a responsabilidade do Estado"
    ],
    "chaves": [
     "irresponsabilidade",
     "absolutis",
     "teoria da culpa integral",
     "risco integral",
     "teorias? da responsabilidade",
     "era absolutista"
    ],
    "peg": "Confundir risco administrativo (admite excludentes) com risco integral (não admite) e dizer que a regra é a responsabilidade subjetiva."
   },
   {
    "titulo": "Excludentes e atenuantes: culpa da vítima, caso fortuito e força maior",
    "lei": [
     "Culpa exclusiva da vítima · rompe o nexo de causalidade e exclui a responsabilidade do Estado",
     "Culpa concorrente · não exclui: atenua o dever de indenizar, repartindo-se a indenização conforme a participação de cada um (compensação de culpas)",
     "Força maior e caso fortuito · em regra excluem o nexo; se o dano só ocorreu ou se agravou por omissão específica do Estado (falta do serviço), há responsabilidade",
     "Terceiros · ato exclusivo de terceiro, sem nexo com o Estado, também exclui a responsabilidade",
     "Prova · para se eximir, o Estado prova a excludente, não 'dolo ou culpa do agente'"
    ],
    "chaves": [
     "culpa (exclusiva|concorrente) da v[íi]tima",
     "compensa[çc][ãa]o de culpas",
     "excludente",
     "atenuante|atenuar",
     "for[çc]a maior"
    ],
    "peg": "Tratar a culpa concorrente da vítima como excludente total; ela apenas reduz a indenização."
   },
   {
    "titulo": "Nexo de causalidade: teoria do dano direto e imediato",
    "lei": [
     "Teoria adotada · para o nexo causal da responsabilidade do Estado aplica-se a teoria do dano direto e imediato (interrupção do nexo causal): o Estado responde pelos efeitos diretos e imediatos da conduta",
     "Rejeitadas · a equivalência dos antecedentes (própria do direito penal) e a causalidade adequada",
     "Efeito · fato superveniente que interrompe a cadeia causal afasta a responsabilidade pelos danos remotos"
    ],
    "chaves": [
     "dano (direto e )?imediato",
     "teoria do dano",
     "equival[êe]ncia dos antecedentes|causalidade adequada",
     "nexo (de causalidade|causal)",
     "efeitos diretos",
     "direto e imediato|imediatos"
    ],
    "peg": "Atribuir ao Estado a equivalência dos antecedentes, que levaria a responsabilizações infinitas."
   },
   {
    "titulo": "Responsabilidade por omissão: genérica (subjetiva) × específica (objetiva)",
    "lei": [
     "Omissão genérica · responsabilidade subjetiva, na modalidade culpa anônima (falta do serviço): o serviço não funcionou, funcionou mal ou funcionou tardiamente, sem se identificar o agente",
     "Omissão específica · quando o Estado tem dever especial de agir (garantidor, como custódia de detento), a responsabilidade é objetiva, segundo o STF (Tema 592 da repercussão geral, conforme a resolução do banco)",
     "Existência · o Estado responde também por omissão, não só por ação",
     "Regra de prova · na omissão genérica prova-se a falta do serviço (culpa anônima), sem exigir identificar o servidor"
    ],
    "chaves": [
     "omiss(ão|ões|iv)",
     "omiss[ãa]o espec[íi]fica",
     "culpa an[ôo]nima|falta do servi[çc]o",
     "cust[óo]dia|detento",
     "funcionou (mal|tardiamente)",
     "subjetiva"
    ],
    "peg": "Dizer que o Estado não responde por omissão, ou que toda omissão é subjetiva (a específica, como custódia de detento, é objetiva)."
   },
   {
    "titulo": "Encargos trabalhistas de empresa terceirizada: responsabilidade subsidiária",
    "lei": [
     "Regra · a inadimplência da contratada não transfere automaticamente os encargos trabalhistas à Administração",
     "Responsabilização · subsidiária, e só se comprovada a falha na fiscalização do contrato (culpa in vigilando), não objetiva",
     "Fundamento · não decorre do risco administrativo do art. 37, § 6º, da CF"
    ],
    "chaves": [
     "encargos trabalhistas",
     "empresa prestadora de servi[çc]os contratada",
     "inadimplemento de empresa"
    ],
    "peg": "Aplicar o risco administrativo à terceirizada inadimplente: a responsabilidade é subsidiária e depende de prova da falha de fiscalização."
   },
   {
    "titulo": "Operação policial e disparo de arma de fogo: responsabilidade objetiva",
    "lei": [
     "Entendimento · o Estado responde objetivamente por vítima de disparo em operação policial, ainda que a perícia sobre a origem do projétil seja inconclusiva, conforme a resolução do banco (STF)",
     "Fundamento · a incursão ostensiva do aparato de segurança cria o risco e fecha o nexo de causalidade, segundo a resolução",
     "Distinção · não se trata de omissão: a conduta é comissiva (ação policial), por isso aplica-se o risco administrativo do art. 37, § 6º, da CF"
    ],
    "chaves": [
     "arma de fogo",
     "opera[çc][ãa]o policial",
     "proj[ée]til",
     "per[íi]cia"
    ],
    "peg": "Exigir identificar de qual arma saiu o tiro para responsabilizar o Estado."
   }
  ]
 },
 "organizacao-administrativa": {
  "titulo": "Organização administrativa",
  "fontes": [
   [
    "CF/1988, art. 37, XIX e XX",
    ""
   ],
   [
    "Súmula 525 do STJ (personalidade judiciária da Câmara de Vereadores), conforme resolução do banco",
    ""
   ],
   [
    "Resoluções do banco de questões (original300) das questões do tema",
    ""
   ]
  ],
  "secs": [
   {
    "titulo": "Administração direta e órgãos públicos: despersonalização e personalidade judiciária",
    "lei": [
     "Órgão · centro de competências despersonalizado, sem personalidade jurídica própria, resultante da desconcentração; imputam-se à pessoa jurídica os atos praticados (teoria do órgão)",
     "Administração direta · composta pelos órgãos dos entes federativos (ministérios, secretarias, tribunais, polícia), sem personalidade própria",
     "Classificação (Hely Lopes) · órgãos autônomos ficam logo abaixo dos independentes (chefia dos Poderes) e têm competência de planejamento, supervisão e controle (ex.: ministérios)",
     "Personalidade judiciária · a Câmara de Vereadores não tem personalidade jurídica, mas tem personalidade judiciária e pode demandar para defender direitos institucionais (Súmula 525 do STJ)",
     "Criação · criar ou extinguir órgãos depende de lei"
    ],
    "chaves": [
     "minist[ée]rio",
     "[óo]rg[ãa]os? (p[úu]blicos?|administrativos?|aut[ôo]nomos?)",
     "administra[çc][ãa]o direta",
     "c[âa]maras? de vereadores|personalidade judici[áa]ria",
     "despersonalizad",
     "planejamento, supervis[ãa]o e controle"
    ],
    "peg": "Dizer que órgão tem personalidade jurídica ou que ministério é entidade da administração indireta."
   },
   {
    "titulo": "Administração pública em sentido objetivo × subjetivo",
    "lei": [
     "Sentido subjetivo (orgânico) · conjunto de entes, órgãos e agentes que exercem a função administrativa (quem faz)",
     "Sentido objetivo (material) · a própria atividade, a função administrativa (o que se faz)",
     "Atipicidade · a função administrativa também é exercida, de forma atípica, pelo Legislativo e pelo Judiciário, não só pelo Executivo"
    ],
    "chaves": [
     "sentido objetivo",
     "sentido subjetivo",
     "circunscreve-se [àa] fun[çc][ãa]o administrativa"
    ],
    "peg": "Restringir a administração pública, em sentido objetivo, ao Poder Executivo."
   },
   {
    "titulo": "Desconcentração × descentralização",
    "lei": [
     "Desconcentração · distribuição interna de competências dentro da mesma pessoa jurídica, criando órgãos despersonalizados e hierarquizados (ex.: criar ministério ou secretaria)",
     "Descentralização · transferência de atividade ou serviço a outra pessoa jurídica (criação de entidade da administração indireta ou delegação a particular); não há hierarquia, só controle",
     "Atividade-meio · transferir a mera execução material de atividade de apoio interno, sem transferir titularidade nem execução de serviço público, não configura descentralização em sentido estrito, conforme a resolução do banco",
     "Distinção prática · mesma pessoa e hierarquia é desconcentração; nova pessoa jurídica é descentralização"
    ],
    "chaves": [
     "desconcentra[çc][ãa]o",
     "descentraliza[çc][ãa]o",
     "distribui[çc][ãa]o (interna )?de compet[êe]ncias",
     "cria[çc][ãa]o de (secretaria|minist[ée]rio)"
    ],
    "peg": "Trocar os conceitos: criar ministério ou secretaria é desconcentração; criar autarquia é descentralização."
   },
   {
    "titulo": "Administração indireta: composição, autonomia e controle finalístico",
    "lei": [
     "Composição · autarquias, fundações públicas, empresas públicas e sociedades de economia mista (Decreto-Lei 200/1967); criação por lei específica ou autorização legal (CF art. 37, XIX)",
     "Características · personalidade jurídica própria, descentralização, autonomia administrativa e financeira; sem autonomia política (esta é dos entes federativos)",
     "Relação com a direta · vinculação, não hierarquia: supervisão ministerial e controle finalístico (tutela), para verificar se cumprem suas finalidades",
     "Exemplos de entidades · o IBGE é fundação pública federal; ministérios, secretarias, tribunais e Polícia Federal são órgãos da direta"
    ],
    "chaves": [
     "administra[çc][ãa]o (p[úu]blica )?indireta",
     "autarquias, funda[çc][õo]es p[úu]blicas, empresas p[úu]blicas",
     "controle finalístico|tutela|hier[áa]rquic|hierarquia",
     "vincula[çc][ãa]o|supervis[ãa]o|\\bIBGE\\b",
     "autonomia (pol[íi]tica|plena|administrativa)",
     "entidades administrativas"
    ],
    "peg": "Falar em hierarquia ou subordinação entre direta e indireta, ou em autonomia plena sem qualquer controle."
   },
   {
    "titulo": "Autarquias e agências (reguladoras e executivas)",
    "lei": [
     "Autarquia · pessoa jurídica de direito público, criada diretamente por lei específica (CF art. 37, XIX), integrante da administração indireta, com autonomia administrativa",
     "Agência reguladora · autarquia em regime especial, com mais autonomia e dirigentes com mandato fixo, nomeados pelo Presidente após aprovação do Senado; perdem o mandato só nas hipóteses legais (renúncia, condenação judicial transitada em julgado, condenação em processo administrativo disciplinar, infringência de vedações), não pela perda de confiança",
     "Agência executiva · qualificação dada a autarquia ou fundação já existente, após plano estratégico e contrato de gestão; não altera a personalidade jurídica nem a tira da indireta"
    ],
    "chaves": [
     "autarquia",
     "ag[êe]ncias? (reguladora|executiva)",
     "autarquia ou funda[çc][ãa]o p[úu]blica",
     "criadas? por lei espec[íi]fica|direito p[úu]blico",
     "autarquias? .{0,160}direito (p[úu]blico|privado)",
     "regime especial|mandato"
    ],
    "peg": "Dizer que autarquia é de direito privado, ou que dirigente de agência perde o cargo pela perda de confiança de quem o nomeou."
   },
   {
    "titulo": "Empresas públicas e sociedades de economia mista",
    "lei": [
     "Natureza · ambas são pessoas jurídicas de direito privado, integrantes da administração indireta; a criação é autorizada por lei (CF art. 37, XIX)",
     "Empresa pública · capital exclusivamente público e qualquer forma societária admitida em direito",
     "Sociedade de economia mista · sempre sociedade anônima, com capital público e privado, com controle do poder público",
     "Regime · mesmo prestando serviço público, continuam de direito privado; licitam pela Lei 13.303/2016, conforme a resolução do banco"
    ],
    "chaves": [
     "empresas? p[úu]blicas?",
     "sociedades? de economia mista|sociedade an[ôo]nima|forma societ[áa]ria",
     "capital (p[úu]blico|exclusiv)",
     "pessoas? jur[íi]dicas? de direito privado",
     "direito privado",
     "(integrantes?|pertenc\\w+) (d[ae]|[àa]) administra[çc][ãa]o (p[úu]blica )?indireta"
    ],
    "peg": "Dizer que indireta é sempre de direito público, ou que empresa pública só pode ser S.A."
   },
   {
    "titulo": "Fundações públicas: direito público × direito privado",
    "lei": [
     "Natureza · integram a administração indireta e podem ter personalidade de direito público (fundação autárquica) ou de direito privado, conforme a lei",
     "Fundação de direito privado · personalidade nasce do registro dos atos constitutivos, mas segue o regime privado derrogado pelo direito público, sem se eximir das normas gerais",
     "Exemplo · o IBGE é fundação pública federal"
    ],
    "chaves": [
     "funda[çc][ãa]o p[úu]blica",
     "funda[çc][õo]es p[úu]blicas",
     "fundac",
     "registro civil de pessoas jur[íi]dicas",
     "autarquia fundacional"
    ],
    "peg": "Dizer que fundação pública só pode ser de direito privado (ou só de direito público)."
   },
   {
    "titulo": "Terceiro setor: organizações sociais, OSCIP e fundações de apoio",
    "lei": [
     "Natureza · OS e OSCIP são entidades privadas sem fins lucrativos, do terceiro setor, que recebem atividades de interesse coletivo mediante fomento, por qualificação concedida pelo poder público",
     "Instrumentos · organização social celebra contrato de gestão (Lei 9.637/1998); OSCIP celebra termo de parceria (Lei 9.790/1999)",
     "Vedação · entidades estatais (fundações públicas, empresas públicas, sociedades de economia mista) não podem ser qualificadas como OSCIP, conforme a resolução do banco (Lei 9.790/1999, art. 2º)",
     "Hospital público · a gestão por entidade privada sem fins lucrativos qualificada como OS se faz por contrato de gestão; agência executiva é qualificação de autarquia ou fundação, não de entidade privada",
     "Fundação de apoio · as parcerias com a universidade pública envolvem recursos públicos e se regem pelo direito administrativo (Lei 8.958/1994, conforme a resolução)"
    ],
    "chaves": [
     "organiza[çc][õo]es? (sociais|da sociedade civil)",
     "\\bOSCIPs?\\b",
     "\\bOSs?\\b",
     "termo de parceria",
     "funda[çc][ãa]o de apoio",
     "terceiro setor"
    ],
    "peg": "Trocar os instrumentos (OS usa contrato de gestão; OSCIP usa termo de parceria) e achar que entidade estatal pode virar OSCIP."
   }
  ]
 }
};
