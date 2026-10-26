/* Doutrina e jurisprudência de Direito Constitucional (questões sem artigo de lei carregado). Fichas elaboradas de resoluções do banco e de conferências em fontes públicas;
   teses/súmulas confirmadas só por resumos de sites secundários: conferir a redação no site do STF. Cada seção tem `chaves` (regex, flag i): vence a seção com mais chaves casando; sem casamento vale a seção 0.
   Carregado só ao abrir o pop-up (ver doutrinaAbrir em js/teoria.js). */
const DOUTRINA_CST = {
 "geral": {
  "titulo": "Constitucional: jurisprudência e doutrina",
  "fontes": [
   [
    "jus.com.br: controle difuso da SV 4",
    "https://jus.com.br/artigos/14389/o-controle-difuso-da-sumula-vinculante-n-4-um-exemplo-da-sua-necessidade"
   ],
   [
    "TRF5/TRF3 e Estratégia: Tema 6 e 1234 do STF",
    "https://cj.estrategia.com/portal/tema-6-stf-fornecimento-medicamentos/"
   ],
   [
    "Damásio: Súmula 266 do STF",
    "https://juris.damasio.com.br/sumulas/stf/266"
   ],
   [
    "Dizer o Direito: OAB não se sujeita à prestação de contas",
    "https://www.dizerodireito.com.br/2023/06/a-oab-nao-se-sujeita-prestacao-de.html"
   ],
   [
    "Trilhante / jus.com.br / TCE-PR: Tema 642 e ADPF 1011",
    "https://jus.com.br/artigos/105210/competencia-execucao-de-multas-impostas-a-agentes-municipais"
   ],
   [
    "Resolução das próprias questões (CF arts. 5º, 129, 134)"
   ]
  ],
  "secs": [
   {
    "titulo": "Salário mínimo como indexador (SV 4)",
    "lei": [
     "Regra · Salvo nos casos previstos na Constituição, o salário mínimo não pode ser usado como indexador de base de cálculo de vantagem de servidor público ou de empregado, nem ser substituído por decisão judicial.",
     "STF · Súmula Vinculante 4, nascida do adicional de insalubridade de policiais paulistas calculado sobre salários mínimos (RE 565.714/SP).",
     "Limite · O Judiciário não pode fixar nova base de cálculo no lugar do salário mínimo declarado inválido.",
     "Pegadinha · Trocar a regra (veda) pela exceção ('autoriza, em regra') torna o item errado."
    ],
    "peg": "Item que diz que a CF autoriza, em regra, o salário mínimo como indexador inverte regra e exceção.",
    "chaves": [
     "sal[aá]rio m[ií]nimo",
     "indexador",
     "base de c[aá]lculo",
     "vantagem"
    ]
   },
   {
    "titulo": "Medicamentos fora da lista do SUS (Tema 6)",
    "lei": [
     "Regra · Em regra, o Judiciário não pode determinar o fornecimento de medicamento não incorporado às listas oficiais do SUS, seja qual for o preço.",
     "STF · Tema 6 (RE 566.471): parâmetros para medicamentos registrados na Anvisa e não incorporados ao SUS; julgado com o Tema 1234 (competência e custeio).",
     "Exceção · Excepcionalmente, preenchidos requisitos cumulativos (ônus do autor), como negativa administrativa prévia e ilegalidade da não incorporação ou mora da Conitec.",
     "SV 61 · Concessão judicial de medicamento registrado e não incorporado deve seguir as teses do Tema 6.",
     "Pegadinha · O item acerta ao afirmar só a regra; as exceções existem, mas são restritas."
    ],
    "peg": "Banca pode afirmar que o Judiciário 'nunca' ou 'sempre' pode determinar o medicamento.",
    "chaves": [
     "medicamentos?",
     "lista oficial",
     "Sistema [UÚ]nico de Sa[uú]de",
     "\\bSUS\\b",
     "defeso"
    ]
   },
   {
    "titulo": "Mandado de segurança contra lei em tese",
    "lei": [
     "Súmula 266 STF · Não cabe mandado de segurança contra lei em tese.",
     "Conceito · Lei em tese é ato normativo geral e abstrato, sem efeitos concretos sobre o impetrante.",
     "Via correta · O controle abstrato se faz por ação direta (ADI); o MS exige ato concreto que lese direito líquido e certo.",
     "Pegadinha · Lei de efeitos concretos pode ser impugnada por MS; a vedação vale para norma geral e abstrata."
    ],
    "peg": "Item pode trocar para 'cabe MS contra qualquer lei' ou confundir MS com ADI.",
    "chaves": [
     "Mandado de Seguran[cç]a",
     "ato normativo geral e abstrato",
     "lei em tese",
     "impugnar ato normativo"
    ]
   },
   {
    "titulo": "OAB e prestação de contas ao TCU",
    "lei": [
     "STF · A OAB (Conselho Federal e seccionais) não precisa prestar contas ao TCU nem a outro órgão externo (RE 1.182.189, Tema 1.054, 2023).",
     "Fundamento · A OAB não é entidade estatal nem integra a administração indireta; as anuidades não têm natureza tributária; não administra recursos públicos.",
     "Natureza · Entidade sui generis, que exerce serviço público sem ser estatal.",
     "Contexto · Em 2018 o TCU decidira fiscalizar as contas da OAB; o STF afastou isso em 2023.",
     "Pegadinha · Não confundir com autarquias e conselhos de fiscalização profissional, sujeitos ao TCU."
    ],
    "peg": "Item pode afirmar que a OAB é autarquia ou está sujeita ao controle do TCU.",
    "chaves": [
     "OAB",
     "Conselho Federal da OAB",
     "prestar contas",
     "Tribunal de Contas da Uni[aã]o"
    ]
   },
   {
    "titulo": "Multa de TC estadual a agente municipal (Tema 642)",
    "lei": [
     "STF · Tema 642 (RE 1.003.433, j. 15/09/2021): o Município prejudicado é o legitimado para executar multa de Tribunal de Contas estadual aplicada a agente municipal por dano ao erário municipal.",
     "Exceção · Compete ao Estado executar multas simples aplicadas por TCE a agentes municipais (inobservância de normas de direito financeiro, dever de colaboração com a fiscalização).",
     "Revisão · A ADPF 1011 ampliou a tese: Estado pode executar multas simples que não causam dano direto ao erário municipal.",
     "Prática · Multa ressarcitória (dano ao erário municipal): Município. Sancionatória ou coercitiva: Estado (TCE-PR, Prejulgado 36).",
     "Pegadinha · Item que atribui ao Estado a execução da multa por dano ao erário municipal troca o legitimado."
    ],
    "peg": "Trocar o Município pelo Estado como executor da multa por dano ao erário municipal.",
    "chaves": [
     "execu[cç][aã]o de multa",
     "agente p[uú]blico municipal",
     "erário municipal",
     "vinculado o tribunal de contas",
     "Compete ao estado"
    ]
   },
   {
    "titulo": "Defensor Público-Geral da União",
    "lei": [
     "Regra · O Defensor Público-Geral representa a Defensoria Pública, judicial e extrajudicialmente, em defesa de sua autonomia, prerrogativas e funções institucionais.",
     "Autonomia · A Defensoria tem autonomia funcional, administrativa e de iniciativa orçamentária (CF, art. 134), sem intermediação da AGU na sua representação.",
     "Pegadinha · Não atribuir a representação da DPU à AGU nem ao Ministro da Justiça."
    ],
    "peg": "Banca pode trocar o Defensor Público-Geral pela AGU como representante da DPU.",
    "chaves": [
     "defensor p[uú]blico-geral",
     "Defensoria P[uú]blica da Uni[aã]o",
     "autonomia",
     "prerrogativas",
     "representar judicial"
    ]
   },
   {
    "titulo": "MP e Defensoria: atribuições e limites",
    "lei": [
     "Defensoria · Pode requisitar documentos, informações e providências necessárias às suas funções, mas não instaura inquérito policial, atribuição da polícia judiciária.",
     "MP · Mesmo com poder investigatório, interceptação telefônica, busca domiciliar e prisão preventiva dependem de ordem judicial (CF, art. 5º, XI, XII e LXI).",
     "MP · O art. 129, IX veda a representação judicial e a consultoria jurídica de entidades públicas, sem exceção.",
     "Defensoria · Tem legitimidade para ação civil pública; sua atuação (art. 134) não se limita à assistência individual.",
     "Pegadinha · Trocar 'não autoriza' por 'autoriza' a instauração direta de inquérito."
    ],
    "peg": "Inverter 'não autoriza' para 'autoriza' inquérito pela Defensoria.",
    "chaves": [
     "interceptação",
     "inquérito policial",
     "busca domiciliar",
     "ação civil pública",
     "poder investigatório",
     "representação judicial dos entes"
    ]
   }
  ]
 }
};
