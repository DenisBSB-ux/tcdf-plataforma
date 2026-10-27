/* Doutrina de Conhecimentos sobre o Distrito Federal e RIDE: fichas elaboradas a partir da apostila do usuário e, onde a linha traz "(Fonte: …)" e a URL consta em `fontes`, de fontes externas confiáveis (out/2026)
   (Apostila Teórica e Prática de Alto Rendimento, Unidades 1 a 8). Nomes e números como a apostila traz.
   Cada ficha tem `chaves` (regex, flags i,u) que identificam os enunciados cujo foco é a ficha; a seção com mais chaves
   casando (enunciado + alternativas) vence; sem casamento vale a seção 0 do tema.
   Carregado só ao abrir o pop-up (ver doutrinaAbrir em js/teoria.js). */
const DOUTRINA_DF = {
 "ride": {
  "titulo": "RIDE-DF: natureza, composição e fatos da região",
  "fontes": [
   [
    "Apostila Conhecimentos do DF e RIDE (Drive do usuário)",
    ""
   ],
   [
    "IBGE SIDRA tab. 4709 (Censo 2022)",
    "https://apisidra.ibge.gov.br/values/t/4709/n6/all/v/93,5936,10605/p/2022"
   ],
   [
    "IBGE SIDRA tab. 4709, DF",
    "https://apisidra.ibge.gov.br/values/t/4709/n3/53/v/all/p/2010,2022"
   ],
   [
    "IPEA BRUA 31: Periferia Metropolitana (IPEDF Codeplan)",
    "https://repositorio.ipea.gov.br/bitstream/11058/13915/1/BRUA_31_Artigo_4_Um_Olhar_para_a_periferia.pdf"
   ],
   [
    "MPDFT, nota sobre remoções de edificações clandestinas",
    "https://www.mpdft.mp.br/portal/index.php/comunicacao-menu/98-notas-a-imprensa/8169-esclarecimento-a-populacao-sobre-as-remocoes-de-edificacoes-clandestinas"
   ],
   [
    "MPDFT, ação integrada em Brazlândia (2023)",
    "https://www.mpdft.mp.br/portal/index.php/comunicacao-menu/sala-de-imprensa/noticias/noticias-2023/14597-mpdft-propoe-acao-integrada-contra-o-parcelamento-irregular-em-brazlandia"
   ],
   [
    "Jornal de Brasília, grilagem na APA do Planalto Central (2026)",
    "https://jornaldebrasilia.com.br/brasilia/grilagem-ameaca-area-da-apa-do-planalto-central-proxima-ao-parque-nacional-de-brasilia/"
   ],
   [
    "IBGE, Atlas do Espaço Rural, estrutura fundiária",
    "https://www.ibge.gov.br/apps/atlasrural/pdfs/02_00_Texto.pdf"
   ],
   [
    "Arrais (2008), O Entorno do DF: ideia de dependência",
    "https://www.periodicos.rc.biblioteca.unesp.br/index.php/ageteo/article/download/3140/3917"
   ],
   [
    "IBGE SIDRA tab. 6579 (estimativa 2025)",
    "https://apisidra.ibge.gov.br/values/t/6579/n6/all/v/9324/p/2025"
   ],
   [
    "IBGE SIDRA tab. 6579, DF",
    "https://apisidra.ibge.gov.br/values/t/6579/n3/53/v/9324/p/2018,2019,2020,2021,2024,2025"
   ],
   [
    "ObservaDF/UnB (2025)",
    "https://observadf.unb.br/wp-content/uploads/2025/07/ObservaDF-PESQ-julho-2025-.pdf"
   ],
   [
    "IPEA BRUA 22: AMB e fluxos (Codeplan)",
    "https://repositorio.ipea.gov.br/server/api/core/bitstreams/36fee0f0-4b2a-4332-95cf-8cd7236d245f/content"
   ]
  ],
  "secs": [
   {
    "titulo": "RIDE: natureza jurídica e base legal",
    "lei": [
     "Definição · A Região Integrada de Desenvolvimento do Distrito Federal e Entorno (RIDE-DF) é uma região administrativa da União, criada para articular a ação administrativa da União, dos Estados de Goiás e Minas Gerais e do Distrito Federal.",
     "Natureza jurídica · Não possui personalidade jurídica própria, não tem orçamento próprio e não se confunde com Região Metropolitana (que é criada por LC estadual para municípios do mesmo Estado).",
     "Ente criador · Criada por Lei Complementar Federal (LC 94/1998), por envolver mais de uma Unidade Federativa. O Poder Executivo é autorizado a criá-la (art. 1º).",
     "Base normativa · Constituição Federal (arts. 21, IX, 43 e 48, IV); Lei Complementar Federal nº 94/1998 (com alterações da LC 163/2018); Decreto Federal nº 7.469/2011 (com alterações dos Decretos 9.913/2019 e 11.911/2024).",
     "Gestão · Vinculada à União (COARIDE / MIDR), segundo a tabela comparativa da apostila."
    ],
    "peg": "Dizer que foi criada por lei distrital, estadual ou decreto, ou confundir RIDE com Região Metropolitana ou estado autônomo. A RIDE é criada por Lei Complementar Federal (União) por envolver mais de uma Unidade Federativa.",
    "chaves": [
     "Lei Complementar n\\.? ?º? ?94",
     "Decreto n\\.? ?º? ?7\\.469",
     "Lei Complementar n\\.? ?º? ?163",
     "Decreto n\\.? ?º? ?9\\.913",
     "regi(ã|a)o metropolitana",
     "autorizada por lei complementar",
     "autorizou o Poder Executivo",
     "Poder Legislativo",
     "entes federados",
     "or(ç|c)amento pr(ó|o)prio",
     "estrutura de governo",
     "legisla(ç|c)(ã|a)o que criou",
     "foi instituída pela Lei Complementar"
    ]
   },
   {
    "titulo": "RIDE: composição (33 municípios + DF)",
    "lei": [
     "Composição · A RIDE é constituída pelo Distrito Federal, por 29 municípios do Estado de Goiás e por 4 municípios do Estado de Minas Gerais (Arinos, Buritis, Cabeceira Grande e Unaí): 33 municípios + DF.",
     "Municípios de Goiás (29) · Abadiânia, Água Fria de Goiás, Águas Lindas de Goiás, Alexânia, Alto Paraíso de Goiás, Alvorada do Norte, Barro Alto, Cabeceiras, Cavalcante, Cidade Ocidental, Cocalzinho de Goiás, Corumbá de Goiás, Cristalina, Flores de Goiás, Formosa, Goianésia, Luziânia, Mimoso de Goiás, Niquelândia, Novo Gama, Padre Bernardo, Pirenópolis, Planaltina de Goiás, Santo Antônio do Descoberto, São João d’Aliança, Simolândia, Valparaíso de Goiás, Vila Boa e Vila Propício.",
     "Municípios de Minas Gerais (4) · Arinos, Buritis, Cabeceira Grande e Unaí.",
     "Alterações · LC 94/1998 com alterações da LC 163/2018; Decreto 7.469/2011 com alterações dos Decretos 9.913/2019 e 11.911/2024."
    ],
    "peg": "Omissão de Minas Gerais: dizer que a RIDE abrange apenas o DF e Goiás é ERRADO. Inclui obrigatoriamente 4 municípios mineiros (Arinos, Buritis, Cabeceira Grande e Unaí). Também é erro dizer que inclui municípios de Tocantins ou de São Paulo, ou que é formada apenas por municípios goianos conurbados.",
    "chaves": [
     "Cabeceiras",
     "Cabeceira Grande",
     "Buritis",
     "Arinos",
     "Una(í|i)",
     "Minas Gerais \\/",
     "33 munic(í|i)pios",
     "compõem a RIDE todos",
     "polarizados",
     "situado no estado de",
     "Barro Alto",
     "Abadi(â|a)nia",
     "Lu(i|z)ziânia|Luzi(â|a)nia, ?Formosa",
     "COLUNA I",
     "Munic(í|i)pios de Minas Gerais",
     "apenas por munic(í|i)pios goianos"
    ]
   },
   {
    "titulo": "Desmembramento de município: inclusão automática",
    "lei": [
     "Regra · Os municípios que vierem a ser constituídos por desmembramento de território de município integrante passarão a compor, AUTOMATICAMENTE, a RIDE (art. 1º, § 2º).",
     "CEBRASPE 2025 · Municípios criados por desmembramento de municípios da RIDE serão desligados automaticamente dessa região: ERRADO. Passam a compor automaticamente, e não a ser desligados.",
     "IDECAN 2025 · Novo município criado a partir de desmembramento de município já pertencente à RIDE: gabarito, o novo município passará a compor, automaticamente, a RIDE."
    ],
    "peg": "Exigência de autorização para desmembramento: afirmar que novos municípios desmembrados dependem de autorização do Poder Executivo, de aprovação do COARIDE ou de dois terços dos municípios para entrar na RIDE é ERRADO. A integração é AUTOMÁTICA.",
    "chaves": [
     "desmembramento",
     "desmembrad",
     "novo munic(í|i)pio",
     "n(ã|a)o necessariamente ser(á|a) inclu(í|i)do",
     "de forma autom(á|a)tica",
     "automaticamente"
    ]
   },
   {
    "titulo": "RIDE: áreas prioritárias e serviços de interesse comum (art. 3º)",
    "lei": [
     "Art. 3º · Consideram-se de interesse da RIDE os serviços públicos comuns ao Distrito Federal e aos municípios que a integram, ESPECIALMENTE aqueles relacionados às áreas de INFRAESTRUTURA e de GERAÇÃO DE EMPREGOS.",
     "Áreas prioritárias · Infraestrutura e geração de empregos (o texto legal destaca com especial ênfase essas áreas).",
     "IDECAN 2025 · Gabarito d): os serviços públicos comuns ao Distrito Federal e aos Municípios que a integram, especialmente aqueles relacionados às áreas de infraestrutura e de geração de empregos (as alternativas com \"União\", \"exclusivos\" ou \"saneamento básico\" estão erradas).",
     "Delimitação · A apostila registra que as áreas de infraestrutura e geração de empregos são as de interesse da RIDE."
    ],
    "peg": "Trocar infraestrutura e geração de empregos por educação, saúde, segurança, saneamento ou meio ambiente como únicas prioridades da LC 94. Também é erro dizer que os serviços de interesse são \"específicos\" ou \"exclusivos\" do DF ou dos municípios: são serviços COMUNS.",
    "chaves": [
     "art\\. ?3º",
     "Art\\. 3º",
     "servi(ç|c)os p(ú|u)blicos comuns",
     "servi(ç|c)os p(ú|u)blicos espec(í|i)ficos",
     "interesse da (RIDE|Regi(ã|a)o Integrada)",
     "gera(ç|c)(ã|a)o de empregos",
     "infraestrutura",
     "Sa(ú|u)de e assist(ê|e)ncia social",
     "dois servi(ç|c)os em especial"
    ]
   },
   {
    "titulo": "RIDE: financiamento dos programas e projetos (art. 5º)",
    "lei": [
     "Art. 5º · Os programas e projetos prioritários serão financiados com recursos: I, de natureza orçamentária destinados pela União; II, de natureza orçamentária destinados pelo Distrito Federal, pelos Estados de Goiás e de Minas Gerais e pelos Municípios abrangidos; III, de operações de crédito EXTERNAS e INTERNAS.",
     "Resumo · Recursos orçamentários da União, do DF, dos Estados de Goiás e Minas Gerais e dos municípios integrantes, além de operações de crédito internas e externas.",
     "IADES 2023 · Gabarito d): recursos oriundos da União, do Distrito Federal, dos estados de Goiás e de Minas Gerais e dos municípios integrantes da RIDE-DF."
    ],
    "peg": "Fontes de financiamento: afirmar que os recursos são exclusivos da União (ou de fundos de pensão, FGTS, poupança, concessões à iniciativa privada) é ERRADO. O financiamento é conjunto (União, DF, GO, MG e Municípios), além de operações de crédito internas e EXTERNAS.",
    "chaves": [
     "financiad",
     "financiamento",
     "recursos",
     "fonte(s)? de",
     "fundo perdido",
     "FGTS",
     "opera(ç|c)(õ|o)es de cr(é|e)dito",
     "Fundo Constitucional"
    ]
   },
   {
    "titulo": "COARIDE: Conselho Administrativo da RIDE (art. 2º)",
    "lei": [
     "Art. 2º · É o Poder Executivo autorizado a criar o Conselho Administrativo (COARIDE), vinculado ao Ministério da Integração e do Desenvolvimento Regional, com a finalidade de coordenar as atividades a serem desenvolvidas na RIDE.",
     "Vinculação · O COARIDE é vinculado ao Ministério da Integração e do Desenvolvimento Regional (presidido por seu Secretário-Executivo).",
     "Finalidade · Coordenar as atividades na RIDE. É a única competência que a apostila registra para o órgão.",
     "Limite da apostila · Não traz as competências detalhadas do COARIDE (compatibilização de programas, gestão financeira, comitês temáticos, observatório e conferência anual)."
    ],
    "peg": "Órgão coordenador: afirmar que a RIDE é gerida por conselho municipal ou pelo governo do DF isolado é ERRADO. O órgão é o COARIDE, vinculado ao Ministério da Integração e do Desenvolvimento Regional. A RIDE não tem orçamento próprio.",
    "chaves": [
     "COARIDE",
     "Conselho Administrativo",
     "Coordena(ç|c)(ã|a)o",
     "Comit(ê|e)s? Tem(á|a)ticos?",
     "Observat(ó|o)rio",
     "Confer(ê|e)ncia Anual",
     "compatibiliza(ç|c)(ã|a)o",
     "executar diretamente|assumir diretamente"
    ]
   },
   {
    "titulo": "Art. 4º da LC 94/1998 e o Programa Especial do Entorno",
    "lei": [
     "Artigos reproduzidos na apostila · Arts. 1º (criação e composição), 2º (COARIDE), 3º (interesse da RIDE) e 5º (financiamento).",
     "Art. 4º · Não é reproduzido na apostila (o texto passa do art. 3º para o art. 5º). A lei de que trata é a LC 94/1998, que autorizou o Poder Executivo a criar a RIDE.",
     "Poder autorizado · Nos arts. 1º e 2º, a apostila registra: \"É o Poder Executivo autorizado a criar\"."
    ],
    "peg": "O art. 4º não consta da apostila; a questão sobre o Programa Especial de Desenvolvimento do Entorno do DF exige o texto da lei.",
    "chaves": [
     "Art\\. 4º",
     "Programa Especial de Desenvolvimento",
     "Programa Especial"
    ]
   },
   {
    "titulo": "RIDE × Área Metropolitana de Brasília (AMB)",
    "lei": [
     "AMB · Conceito formulado em 2014 pela Codeplan (atual IPEDF), na Nota Técnica nº 01/2014. Compreende exclusivamente o DF + 12 municípios goianos circunvizinhos.",
     "Municípios da AMB · Águas Lindas de Goiás, Alexânia, Cidade Ocidental, Cocalzinho de Goiás, Cristalina, Formosa, Luziânia, Novo Gama, Padre Bernardo, Planaltina de Goiás, Santo Antônio do Descoberto e Valparaíso de Goiás. Formam a Periferia Metropolitana de Brasília (PMB).",
     "Diferença · A AMB não possui a mesma área nem se confunde com a RIDE-DF: a RIDE engloba 33 municípios + DF; a AMB engloba 12 municípios + DF (exclui MG e municípios distantes).",
     "Natureza · RIDE criada por LC Federal nº 94/1998, com gestão vinculada à União (COARIDE / MIDR); AMB é conceito técnico-planejador distrital/regional, voltado a mapear fluxos metropolitanos e deslocamento pendular.",
     "Definição · A Nota Técnica nº 01/2014 da Codeplan consolidou a Área Metropolitana de Brasília como a união do DF com a Periferia Metropolitana de Brasília, os 12 municípios goianos (Fonte: IPEDF Codeplan/IPEA, BRUA nº 31, 2024).",
     "Eixos · A PMB liga-se ao DF por eixos viários: Oeste (Águas Lindas, Padre Bernardo, Cocalzinho) com cerca de 1,7 milhão de pessoas no eixo; Sul (Valparaíso, Cidade Ocidental, Novo Gama, Luziânia, Cristalina) com cerca de 1,0 milhão; Norte (Planaltina, Formosa) com cerca de 650 mil; Sudoeste (Santo Antônio do Descoberto, Alexânia) com cerca de 370 mil (Fonte: ObservaDF/UnB, 2025).",
     "Estrutura · O desenvolvimento ao longo das rodovias de ligação ao DF deu lugar, na última década, ao parcelamento de glebas rurais periféricas (Fonte: IPEA BRUA nº 31, 2024).",
     "Percentual que trabalha no DF · Na PMAD 2017/2018, entre os ocupados residentes, trabalham no DF 59,0% em Águas Lindas, 57,4% em Novo Gama, 55,2% em Valparaíso, 52,8% em Cidade Ocidental e 51,3% em Santo Antônio do Descoberto (Fonte: Codeplan, PMAD 2017/2018, apud IPEA BRUA nº 22, 2020).",
     "Menores índices · Cristalina (2,2%), Alexânia (6,6%) e Formosa (9,9%) têm menos de 10% dos ocupados trabalhando no DF (Fonte: Codeplan, PMAD 2017/2018, apud IPEA BRUA nº 22, 2020).",
     "Números absolutos · Os maiores contingentes que trabalham no DF vêm de Águas Lindas (43.821), Valparaíso (37.220), Novo Gama (22.816) e Luziânia (20.348); na PMB, 41,4% dos ocupados (173.313) trabalham no DF (Fonte: Codeplan, PMAD 2017/2018, apud IPEA BRUA nº 22, 2020)."
    ],
    "peg": "Composição da AMB × RIDE: afirmar que a AMB inclui municípios mineiros (como Unaí ou Buritis) é ERRADO. A AMB engloba apenas o DF e 12 municípios de GO. Também é erro tratar AMB e RIDE como idênticas, ou a AMB como criadora de uma Região Metropolitana oficial.",
    "chaves": [
     "\\bAMB\\b|Área Metropolitana de Bras(í|i)lia",
     "Codeplan|Companhia de Planejamento",
     "Periferia Metropolitana",
     "\\bPMB\\b",
     "mesmo n(ú|u)mero de munic(í|i)pios",
     "conceitos territoriais id(ê|e)nticos",
     "Regi(ã|a)o Metropolitana de Bras(í|i)lia",
     "Água Fria",
     "AMB",
     "Codeplan",
     "eixos rodovi(á|a)rios",
     "densidade demogr(á|a)fica",
     "adjac(ê|e)ncias",
     "Cristalina",
     "Alexânia",
     "Formosa",
     "Periferia Metropolitana de Bras(í|i)lia",
     "saem mais pessoas",
     "trabalhar no DF"
    ]
   },
   {
    "titulo": "RIDE: população e crescimento",
    "lei": [
     "População da RIDE-DF · Totaliza cerca de 4,5 milhões de habitantes (aproximadamente 2/3 residem no DF e 1/3 nos 33 municípios do entorno goiano e mineiro).",
     "Crescimento 2010-2022 · QUADRIX 2025 (Certo): entre 2010 e 2022, a maioria dos municípios do entorno do DF (RIDE-DF) cresceu demograficamente em ritmo superior ao do próprio Distrito Federal.",
     "DF · O crescimento anual do DF caiu de 2,28% ao ano (2000-2010) para 0,76% ao ano (2010-2022).",
     "Fecundidade · A queda da taxa de fecundidade decorre principalmente da maior inserção da mulher no mercado de trabalho e da priorização da carreira profissional.",
     "Participação do DF · Pelo Censo 2022, o DF tinha 2.817.381 habitantes, cerca de 62,8% dos 4,48 milhões da RIDE; em 2010 eram cerca de 65,8% (soma da tabela de população por município, com 2010 compatibilizado). A fatia do DF caiu (Fonte: IBGE, Censo 2022, SIDRA tab. 4709).",
     "Periferia Metropolitana · Os 12 municípios goianos da PMB somavam 978.278 hab. em 2010 e 1.271.641 em 2022 (+30,0%), contra +9,6% do DF; a fatia da PMB na RIDE subiu de cerca de 25% para 28% (Fonte: IPEDF Codeplan/IPEA, BRUA nº 31, 2024; cálculo da fatia sobre IBGE 2022).",
     "Ritmo por município · Taxa de crescimento anual 2010-2022 do DF: 0,76%. Dos 12 municípios da PMB, 11 cresceram mais (de 1,05% em Alexânia a 4,21% em Cidade Ocidental); Novo Gama teve 0,74% ao ano, isto é, +9,2% no período contra +9,6% do DF (Fonte: IBGE, Censo 2022, SIDRA tab. 4709; IPEA, BRUA nº 31, 2024).",
     "Ranking 2022 · Os cinco maiores municípios da RIDE (sem o DF) no Censo 2022 são goianos: Águas Lindas de Goiás (225.693), Luziânia (209.129), Valparaíso de Goiás (198.861), Formosa (115.901) e Planaltina (105.031) (Fonte: IBGE, Censo 2022, SIDRA tab. 4709).",
     "Seguintes · O 6º é Novo Gama (103.804), o 7º Cidade Ocidental (91.767) e o 8º é Unaí (86.619), o maior município mineiro da RIDE; os outros mineiros são Buritis (24.030), Arinos (17.272) e Cabeceira Grande (6.627) (Fonte: IBGE, Censo 2022).",
     "Estimativa 2025 · A ordem dos cinco primeiros se mantém na estimativa do IBGE para 2025; Unaí aparece com 91.320 (Fonte: IBGE, Estimativas da População 2025, SIDRA tab. 6579).",
     "Censo 2022 · A RIDE-DF somava cerca de 4,48 milhões de habitantes: DF 2.817.381 (62,8%) e 33 municípios com 1.666.735; em 2010 o DF tinha cerca de 65,8% (Fonte: IBGE, Censo 2022, SIDRA tab. 4709; soma própria).",
     "Estimativa 2025 · O IBGE estima 2.996.899 para o DF e cerca de 4,77 milhões para a RIDE, mantendo o DF em cerca de 62,8% do total (Fonte: IBGE, Estimativas da População 2025, SIDRA tab. 6579; soma própria).",
     "Resto da RIDE · Dos municípios fora do DF, os goianos concentram cerca de 92% da população (1.532.187 contra 134.548 dos 4 mineiros no Censo 2022) (Fonte: IBGE, Censo 2022).",
     "Ranking 2022 · Águas Lindas de Goiás (225.693), Luziânia (209.129), Valparaíso de Goiás (198.861), Formosa (115.901) e Planaltina (105.031) são os cinco maiores municípios da RIDE (sem o DF), todos goianos (Fonte: IBGE, Censo 2022, SIDRA tab. 4709).",
     "Minas Gerais · O maior município mineiro da RIDE é Unaí, com 86.619 hab. (8º lugar), seguido de Buritis (24.030), Arinos (17.272) e Cabeceira Grande (6.627) (Fonte: IBGE, Censo 2022)."
    ],
    "peg": "Não confundir a população do DF (cerca de 2,9 a 3 milhões) com a da RIDE (cerca de 4,5 milhões, dos quais cerca de 2/3 no DF).",
    "chaves": [
     "2\\/3",
     "Censo (2022|Demogr(á|a)fico)",
     "censo demogr(á|a)fico",
     "taxa de fecundidade",
     "crescimento populacional",
     "popula(ç|c)(ã|a)o do Distrito Federal \\(DF\\) corresponde",
     "mais populosos",
     "participa(ç|c)(ã|a)o relativa",
     "Cidade Ocidental",
     "fluxos migrat(ó|o)rios",
     "Valpara(í|i)so de Goi(á|a)s",
     "Periferia Metropolitana",
     "12 munic(í|i)pios goianos",
     "n(ã|a)o foi uniforme",
     "taxas de crescimento",
     "principal concentra(ç|c)(ã|a)o populacional",
     "Goi(á|a)s e Minas Gerais",
     "cinco mais populosos",
     "todos, goianos",
     "proje(ç|c)(õ|o)es do Instituto",
     "esmagadora maioria",
     "Goi(á|a)s.{0,20}ter(ç|c)o restante",
     "Periferia\\s+Metropolitana",
     "12\\s+munic(í|i)pios\\s+goianos",
     "Área\\s+Metropolitana\\s+de\\s+Bras(í|i)lia",
     "mais\\s+populosos",
     "Goi(á|a)s",
     "Minas\\s+Gerais",
     "Distrito\\s+Federal",
     "goianos"
    ]
   },
   {
    "titulo": "RIDE: peso econômico do DF",
    "lei": [
     "PIB da RIDE · O DF detém mais de 80% do PIB total da RIDE.",
     "Entorno · Os municípios do Entorno têm economia fortemente baseada em serviços privados e agropecuária, não recebendo repasses do Fundo Constitucional do DF e não possuindo regime jurídico diferenciado.",
     "Centralidade · Grande massa de trabalhadores desloca-se diariamente das RAs periféricas e do Entorno para trabalhar no Plano Piloto (movimento pendular)."
    ],
    "peg": "Não atribuir aos municípios do Entorno o Fundo Constitucional do DF nem regime jurídico diferenciado.",
    "chaves": [
     "80%",
     "produto interno bruto \\(PIB\\) da RIDE",
     "centralidade da RIDE",
     "Brasília, além de ser"
    ]
   },
   {
    "titulo": "RIDE: objetivo, desigualdades e planejamento integrado",
    "lei": [
     "Objetivo principal · Articulação administrativa e redução de desigualdades (RIDE-DF, segundo a tabela comparativa da apostila).",
     "Gestão · Vinculada à União (COARIDE / MIDR).",
     "Limite da apostila · Não traz fatos sobre planos diretores, legislações urbanísticas integradas ou causas históricas da desigualdade na RIDE.",
     "Terra · O sistema de sesmarias do período colonial e a Lei de Terras (1850), somados à forma como a abolição ocorreu, dificultaram o acesso à terra de indígenas, africanos e descendentes e geraram desigualdades que persistem até hoje (Fonte: IBGE, Atlas do Espaço Rural Brasileiro, cap. Estrutura fundiária, 2020).",
     "Entorno · Pirenópolis, Corumbá de Goiás, Luziânia, Planaltina, Formosa e Cristalina eram, até a década de 1950, municípios cujo sítio urbano denunciava origem colonial; a explosão populacional veio com Brasília (Fonte: Arrais, Geografia/UNESP, v. 33 n. 3, 2008).",
     "Desigualdade atual · Em 2021 o DF respondia por 91,8% do PIB da Área Metropolitana de Brasília, o que mostra a disparidade entre o núcleo e a periferia goiana (Fonte: IPEDF Codeplan, apud IPEA BRUA nº 31, 2024)."
    ],
    "peg": "Cuidado com afirmações absolutas: a apostila registra objetivo de articulação e redução de desigualdades, não a comprovação de que a RIDE as eliminou.",
    "chaves": [
     "desigualdades",
     "planos diretores",
     "per(í|i)odo colonial",
     "objetivo prim(o|ó)rdial",
     "integra(ç|c)(ã|a)o do Distrito Federal com as (á|a)reas",
     "bens materiais",
     "distribui(ç|c)(ã|a)o de bens",
     "falta de acesso",
     "munic(í|i)pios da RIDE",
     "per(í|i)odo\\s+colonial",
     "bens\\s+materiais",
     "munic(í|i)pios\\s+da\\s+RIDE"
    ]
   },
   {
    "titulo": "RIDE: impacto ambiental e pressão antrópica nas bacias",
    "lei": [
     "Descoberto e São Bartolomeu · As bacias do Rio Descoberto e do São Bartolomeu sofrem maior pressão decorrente da expansão urbana e do adensamento populacional.",
     "Rio Preto e Maranhão · A bacia do Rio Preto sofre forte pressão da agricultura irrigada intensiva de grãos; a do Rio Maranhão apresenta a menor pressão antrópica entre as bacias do DF.",
     "Uso do solo rural · Cerca de 70% do território do DF é constituído por áreas rurais, que atuam na contenção da expansão urbana desordenada, na proteção de nascentes e na produção agropecuária.",
     "Grilagem · O MPDFT afirma que, ao longo das últimas décadas, o DF teve a paisagem desfigurada pelo crescimento urbano desordenado e pela grilagem de terras públicas, com nascentes aterradas e áreas de proteção ambiental ocupadas (Fonte: MPDFT, nota à imprensa sobre remoção de edificações clandestinas).",
     "Descoberto · Em Brazlândia, a Prourb/MPDFT apresentou dados sobre parcelamento irregular e seus efeitos no reservatório do Descoberto e na recarga de aquíferos; a bacia fornece água a mais de 60% da população do DF (Fonte: MPDFT, 20/03/2023).",
     "Cerrado · Ocupações irregulares na borda do Parque Nacional de Brasília causam supressão de vegetação nativa, erosão e assoreamento de córregos (Fonte: Jornal de Brasília, 15/07/2026, com professora de Engenharia Ambiental da UCB)."
    ],
    "peg": "Afirmar que as bacias do Descoberto e do São Bartolomeu estão bem preservadas é ERRADO: são as que mais sofrem pressão urbana.",
    "chaves": [
     "prote(ç|c)(ã|a)o ambiental das bacias",
     "zoneamento ambiental",
     "bem preservadas",
     "apropria(ç|c)(ã|a)o ilegal",
     "terras p(ú|u)blicas",
     "impacto ambiental",
     "grilagem",
     "apropria(ç|c)(ã|a)o\\s+ilegal",
     "terras\\s+p(ú|u)blicas",
     "impacto\\s+ambiental"
    ]
   },
   {
    "titulo": "Brasília, interiorização e Plano de Metas",
    "lei": [
     "Plano de Metas · A construção de Brasília foi adicionada ao Plano de Metas de JK como a 31ª meta (\"Meta-Síntese\").",
     "QUADRIX 2023 (Certo) · Incluída no Plano de Metas de JK, a construção de Brasília, realizada em tempo recorde e inaugurada em 1960, foi justificada, entre outras razões, como estímulo à interiorização do desenvolvimento nacional.",
     "Inauguração · Brasília foi inaugurada em 21 de abril de 1960."
    ],
    "peg": "A Meta-Síntese não estava nas 30 metas originais de JK: foi incluída como a 31ª meta.",
    "chaves": [
     "Capital da Esperan(ç|c)a",
     "interioriza(ç|c)(ã|a)o do desenvolvimento",
     "decis(ã|a)o pol(í|i)tica"
    ]
   }
  ]
 },
 "geografia-fisica": {
  "titulo": "Geografia física, clima e hidrografia do DF",
  "fontes": [
   [
    "Apostila Conhecimentos do DF e RIDE (Drive do usuário)",
    ""
   ],
   [
    "Adasa, PGIRH/DF Subproduto 1.B Tomo I (2024)",
    "https://www.adasa.df.gov.br/images/storage/consultas_publicas/CP-001-2024/ADASA_DF_PGIRH_Subproduto_1B_R01_TomoI.pdf"
   ],
   [
    "SBRH 2025 (cita Codeplan 2020)",
    "https://files.abrhidro.org.br/Eventos/Trabalhos/248/XXVI-SBRH0874-2-0-20251105-131812.pdf"
   ],
   [
    "Wikipedia EN, Pico do Roncador (apoio)",
    "https://en.wikipedia.org/wiki/Pico_do_Roncador"
   ],
   [
    "Jornal de Brasília, O mar do Cerrado",
    "https://jornaldebrasilia.com.br/60anos/o-mar-do-cerrado/"
   ],
   [
    "Senado Federal, publicação sobre Brasília",
    "https://www2.senado.leg.br/jspui/bitstream/id/715165/1/DF_Brasilia_P053_R0127.pdf"
   ],
   [
    "TCC Lago Paranoá (Even3)",
    "https://static.even3.com/anais/1446646.pdf"
   ],
   [
    "Correio Braziliense, Usina do Paranoá (2024)",
    "https://www.correiobraziliense.com.br/cidades-df/2024/05/amp/6850486-hidreletrica-atrai-curiosos-e-estudiosos-no-meio-do-cerrado-brasiliense.html"
   ],
   [
    "ABAS, Recarga artificial de aquíferos, Lago Oeste",
    "https://aguassubterraneas.abas.org/asubterraneas/article/download/27800/18029/102260"
   ],
   [
    "SBRH 2025, Poços de infiltração (Adasa)",
    "https://files.abrhidro.org.br/Eventos/Trabalhos/248/XXVI-SBRH0286-2-0-20250731-141435.pdf"
   ],
   [
    "IPEDF, Atlas do DF, 1.1 Localização",
    "https://atlas.ipe.df.gov.br/?p=1697"
   ],
   [
    "IBGE Cidades e Estados, DF",
    "https://www.ibge.gov.br/cidades-e-estados/df.html"
   ],
   [
    "Wikipedia EN, Federal District (apoio)",
    "https://en.wikipedia.org/wiki/Federal_District_(Brazil)"
   ]
  ],
  "secs": [
   {
    "titulo": "Divisor de águas: três bacias nacionais e sete bacias locais",
    "lei": [
     "Três bacias nacionais · O DF localiza-se sobre o ponto de encontro e dispersão de 3 grandes bacias hidrográficas sul-americanas: Paraná (Platina ou do Prata), Tocantins-Araguaia e São Francisco.",
     "Bacia do Paraná · Drena a maior parte do território do DF. Compreende 5 das 7 bacias locais: Descoberto, Corumbá, São Bartolomeu, São Marcos e Lago Paranoá.",
     "Tocantins-Araguaia e São Francisco · A primeira é representada pela bacia local do Rio Maranhão (norte); a segunda, pela bacia local do Rio Preto (leste).",
     "Mapa de 1994 (FCC) · A Secretaria de Meio Ambiente e Recursos Hídricos do DF definiu três grandes bacias de referência, subdivididas em outras sete; pertencem à do Paraná as bacias dos rios São Bartolomeu, Descoberto e Corumbá.",
     "Berço das águas · O DF abriga as cabeceiras (nascentes) de afluentes que alimentam as três bacias e é reconhecido como berço das águas.",
     "PGIRH/DF · A área de estudo do plano de recursos hídricos é definida pela hidrografia e não pelos limites políticos: inclui trechos contíguos ao DF, de municípios goianos como Cristalina, Formosa e Luziânia. (Fonte: Adasa, 2024)",
     "Unidades hidrográficas · O quadro de bacias do PGIRH/DF numera 41 unidades hidrográficas, distribuídas nas regiões hidrográficas Paraná, São Francisco e Tocantins-Araguaia; a nº 41 (Córrego Bandeirinha) só conta dentro do polígono do DF. (Fonte: Adasa, 2024)",
     "Bacias no quadro · Paranoá, Corumbá, Descoberto, São Bartolomeu e São Marcos (Paraná), Preto (São Francisco) e Maranhão (Tocantins-Araguaia); o Rio Paranã aparece só com uma fatia de 4,7 km² no DF. (Fonte: Adasa, 2024)"
    ],
    "peg": "Afirmar que o DF está inteiro na bacia do São Francisco (ou de qualquer bacia única) é ERRADO: são três bacias nacionais. A do Paraná tem a maior área (5 das 7 bacias locais).",
    "chaves": [
     "tr(ê|e)s (grandes )?bacias",
     "tr(ê|e)s regi(õ|o)es hidrogr(á|a)ficas",
     "sete bacias",
     "Rio Doce",
     "banha o Distrito Federal",
     "divisor de (á|a)guas",
     "São Francisco",
     "Tocantins",
     "Araguaia",
     "Paran(á|a)\\b",
     "bacias hidrogr(á|a)ficas que comp",
     "unidades hidrogr(á|a)ficas de planejamento",
     "PGIRH",
     "41 unidades",
     "ultrapassar os limites pol(í|i)ticos",
     "Tocantins-Araguaia",
     "S(ã|a)o\\s+Francisco",
     "Paran(á|a)",
     "sete\\s+bacias"
    ]
   },
   {
    "titulo": "Bacia do Lago Paranoá: única totalmente interna ao DF",
    "lei": [
     "Bacia 100% interna · A Bacia do Lago Paranoá é a ÚNICA das 7 bacias locais totalmente contida nos limites territoriais do DF.",
     "Tabela das bacias · Lago Paranoá: Rio Paranoá / Lago Paranoá / Santa Maria; única bacia 100% interna do DF (Santa Maria fica no Parque Nacional).",
     "São Bartolomeu · Rio que recebe águas do Paranoá e percorre grande parte do seu leito em Planaltina (e não em Santa Maria, que é drenada pela bacia do Corumbá)."
    ],
    "peg": "Afirmar que o Rio Descoberto ou o São Bartolomeu são bacias totalmente internas do DF é ERRADO. A única bacia 100% inserida no DF é a do Lago Paranoá.",
    "chaves": [
     "totalmente inserida",
     "totalmente inserid",
     "Alto S(ã|a)o Louren(ç|c)o",
     "Rio das Mortes",
     "Jequitinhonha",
     "Paragua(ç|c)u"
    ]
   },
   {
    "titulo": "Águas Emendadas: fenômeno e Estação Ecológica",
    "lei": [
     "Fenômeno · Na Estação Ecológica de Águas Emendadas (Planaltina), duas nascentes na mesma vereda correm em sentidos opostos, alimentando a bacia do Tocantins-Araguaia (Rio Maranhão) e a do Paraná (Rio São Bartolomeu).",
     "Estação Ecológica · Unidade de Conservação de Proteção Integral, em Planaltina; protege o fenômeno hidrográfico e a Lagoa Bonita.",
     "Visitação · É VEDADA a visitação pública turística (permitida apenas para estudantes e pesquisadores científicos).",
     "Conexão · O fenômeno conecta diretamente as nascentes da bacia do Rio Maranhão e do Rio São Bartolomeu."
    ],
    "peg": "Afirmar que a Estação Ecológica de Águas Emendadas é polo aberto de turismo ecológico (ou que a visitação segue apenas o plano de manejo) é ERRADO: por ser Proteção Integral, a visitação pública turística é PROIBIDA. Fica em Planaltina, não em Sobradinho nem no Gama.",
    "chaves": [
     "Águas Emendadas",
     "Esta(ç|c)(ã|a)o Ecol(ó|o)gica",
     "Plano de Manejo",
     "refúgio biogeogr",
     "uni(ã|a)o de duas importantes bacias",
     "reserva ecol(ó|o)gica"
    ]
   },
   {
    "titulo": "Bacia e Barragem do Descoberto",
    "lei": [
     "Descoberto · Barragem em Brazlândia (limite com Águas Lindas/GO). Principal reservatório de água do DF, responsável pelo abastecimento de mais de 60% da população (Taguatinga, Ceilândia, Samambaia etc.).",
     "Bacia · Bacia do Paraná: Rio Descoberto / Barragem do Descoberto; abastece mais de 60% do DF.",
     "CEBRASPE 2025 · A região fortemente povoada por núcleos urbanos como Taguatinga e Samambaia, responsável pelo abastecimento de água para mais da metade da população, encontra-se na bacia do Descoberto.",
     "Santa Maria / Torto · No Parque Nacional de Brasília (Água Mineral); segundo maior reservatório do DF."
    ],
    "peg": "Afirmar que o Descoberto abastece 100% do DF é ERRADO: abastece cerca de 60% (o restante vem de Santa Maria, Corumbá IV e captações diretas de córregos).",
    "chaves": [
     "Taguatinga e Samambaia",
     "mais da metade da popula",
     "do Descoberto\\b",
     "Rio Descoberto"
    ]
   },
   {
    "titulo": "Relevo do Planalto Central e processo erosivo",
    "lei": [
     "Relevo · Planalto Central, predominantemente plano a suavemente ondulado (750 m a 1.341 m).",
     "CEBRASPE 2025 · O DF situa-se no Planalto Central, e o processo predominante nesse tipo de relevo é a erosão (gabarito d); laterização é alternativa apresentada como incorreta na questão.",
     "Processo dominante · A apostila registra como processo geológico/erosivo dominante a erosão e a laterização.",
     "Altimetria (IADES 2024) · As cotas mais elevadas, acima de 1.200 metros, estão localizadas a oeste, ocupando um pequeno trecho contínuo no interior do DF.",
     "Processo dominante · A apostila registra erosão e laterização como processos dominantes no relevo de Planalto Central (750 a 1.341 m); a banca CEBRASPE 2025 fixou a erosão, com laterização, sedimentação, orogênese e deposição como erradas. (Fonte: Apostila Conhecimentos do DF, Parte 1)",
     "Erosão no DF · O diagnóstico do PGIRH/DF aponta a erosão do solo como preocupação crítica no Cerrado, também evidente no DF, associada à expansão urbana e agrícola. (Fonte: Adasa, 2024)"
    ],
    "peg": "Cuidado com as alternativas do processo predominante: a questão da CEBRASPE 2025 tem como gabarito a erosão (e não sedimentação, orogênese ou deposição).",
    "chaves": [
     "relevo predominantemente plano",
     "processo predominante",
     "Planalto (Central|Atl(â|a)ntico|Meridional|das Guianas)",
     "1\\.000 metros do n(í|i)vel do mar",
     "Centro-Oeste",
     "mer(i|í)dianos",
     "longitude oeste",
     "limitando-se",
     "Planalto",
     "Planalto Central do Brasil",
     "relevo.*laterização",
     "Planalto\\s+Central",
     "processo\\s+predominante",
     "eros(ã|a)o"
    ]
   },
   {
    "titulo": "Pico do Roncador e pontos mais altos do DF",
    "lei": [
     "Ponto mais alto do DF · Pico do Roncador (ou Rodeador), em Brazlândia, com 1.341 metros de altitude.",
     "Plano Piloto · O ponto mais alto do Plano Piloto é a Praça do Cruzeiro (1.200 m). O Maciço da Contagem fica em Sobradinho.",
     "QUADRIX 2025 · Situar o Pico do Roncador na RA de São Sebastião: ERRADO. Situa-se na Região Administrativa de Brazlândia.",
     "Brazlândia · Região Administrativa onde se situa o Pico do Roncador, ponto de maior altitude do DF (1.341 m).",
     "Norte do DF · O diagnóstico do PGIRH/DF descreve na região norte o Pediplano Contagem-Rodeador, com altitudes de 1.200 a 1.400 m, enquanto a cabeceira do Rio Maranhão fica em 950 a 1.200 m. (Fonte: Adasa, 2024, citando Codeplan 1984)",
     "Roncador · O ponto mais alto do DF, o Pico do Roncador (1.341 m), fica em Brazlândia, a noroeste de Brasília. (Fonte: Apostila Conhecimentos do DF; Wikipedia EN como apoio)"
    ],
    "peg": "Afirmar que o ponto mais alto do DF é a Praça do Cruzeiro ou o Maciço da Contagem é ERRADO. O ponto mais alto é o Pico do Roncador (1.341 m) em Brazlândia; a Praça do Cruzeiro (1.200 m) é o ponto mais alto apenas do Plano Piloto.",
    "chaves": [
     "Roncador",
     "Rodeador",
     "Pra(ç|c)a do Cruzeiro",
     "ponto mais (alto|elevado)",
     "maiores cotas",
     "mais elevado em sua parte norte",
     "Maci(ç|c)o da Contagem",
     "maiores cotas altim(é|e)tricas",
     "Sobradinho, Planaltina e Brazl(â|a)ndia",
     "Brazl(â|a)ndia",
     "Pico\\s+do\\s+Roncador",
     "ponto\\s+mais\\s+alto"
    ]
   },
   {
    "titulo": "Latossolos e calagem",
    "lei": [
     "Solos · Mais de 60% do solo do DF é constituído por Latossolos (profundos, porosos, bem drenados, avermelhados/amarelados).",
     "Características · Naturalmente ácidos, ricos em Ferro (Fe) e Alumínio (Al) e de baixa fertilidade.",
     "Correção · Feita obrigatoriamente via calagem (aplicação de calcário/cal), que neutraliza o Fe e o Al."
    ],
    "peg": "Dizer que o latossolo do DF é rico em matéria orgânica e naturalmente fértil, ou de baixa permeabilidade, é ERRADO. É um solo poroso, bem drenado, ácido, rico em ferro/alumínio e de baixa fertilidade, exigindo calagem.",
    "chaves": [
     "latossolo",
     "calagem",
     "acidez",
     "ferro e alum(í|i)nio",
     "solos profundos",
     "intemperizados",
     "mat(é|e)ria org(â|a)nica"
    ]
   },
   {
    "titulo": "Aquífero fraturado e águas subterrâneas",
    "lei": [
     "Aquífero predominante · Aquífero Fraturado: a água subterrânea fica armazenada e circula nas fissuras/fraturas interconectadas das rochas.",
     "CEBRASPE 2022 · O tipo de aquífero predominante na região do DF é o fraturado, em que a água é armazenada nas fissuras interconectadas das rochas (Certo).",
     "Uso · Poços artesianos são amplamente utilizados durante todas as estações do ano para abastecer condomínios, áreas rurais e indústrias.",
     "Cabeceiras e base · Por ser região de cabeceiras, os rios do DF têm baixa vazão e dependem da descarga de base fornecida pelos aquíferos. (Fonte: ABAS, Congresso Brasileiro de Águas Subterrâneas)",
     "Impermeabilização · Estudo sobre o Lago Oeste afirma que a impermeabilização do solo por ocupação irregular ameaça a recarga natural dos aquíferos; trabalho de 2025 liga a impermeabilização ao maior escoamento superficial e alagamentos. (Fonte: ABAS; SBRH 2025)"
    ],
    "peg": "Afirmar que o aquífero do DF é o Poroso ou Poroso-Granular é ERRADO. O aquífero predominante no DF é o FRATURADO.",
    "chaves": [
     "aqu(í|i)fero",
     "dom(í|i)nio poroso",
     "(á|a)gua subterr(â|a)nea",
     "rede de drenagem superficial",
     "impermeabiliza",
     "fun(ç|c)(ã|a)o reguladora",
     "impermeabiliza(ç|c)(ã|a)o",
     "drenagem"
    ]
   },
   {
    "titulo": "Clima do DF: tropical semiúmido",
    "lei": [
     "Clima · Tropical Semiúmido (ou Tropical Típico de Altitude), com duas estações bem definidas.",
     "Verão (outubro a abril) · Quente e chuvoso, impulsionado pela Massa Equatorial Continental (mEc) da Amazônia.",
     "Inverno (maio a setembro) · Frio e seco (estiagem severa, com umidade abaixo de 10-15%), sob atuação da Massa Polar Atlântica (mPa).",
     "Chuvas · São convectivas/térmicas, e NÃO orográficas.",
     "CEBRASPE 2025 · O clima tropical típico do DF caracteriza-se por duas estações bem definidas: verão chuvoso e inverno seco."
    ],
    "peg": "Afirmar que o DF tem quatro estações bem definidas, clima semiárido ou chuvas orográficas é ERRADO. Verão chuvoso = mEc (Amazônia); inverno seco/frio = mPa.",
    "chaves": [
     "clima",
     "quatro esta(ç|c)(õ|o)es",
     "esta(ç|c)(õ|o)es",
     "semi(á|a)rido",
     "per(í|i)odo seco",
     "massa(s)? de ar",
     "massa (equatorial|polar|tropical)"
    ]
   },
   {
    "titulo": "Lago Paranoá: origem, enchimento e funções",
    "lei": [
     "Origem · Idealizado e proposto pelo engenheiro, botânico e paisagista francês Auguste François Marie Glaziou na 2ª Missão Cruls (1896). O lago NÃO foi idealizado por Lúcio Costa, Oscar Niemeyer ou Juscelino Kubitschek.",
     "Enchimento · Obras da barragem iniciadas em 1957; em setembro de 1959 as comportas foram fechadas e o represamento foi concluído em 1960, atingindo a cota de 1.000 metros acima do nível do mar.",
     "Córregos alimentadores · Gama, Torto, Bananal e Riacho Fundo.",
     "Funções · Lazer e turismo (esportes náuticos); paisagística; geração de energia (Usina Hidrelétrica do Paranoá); diluição de efluentes tratados da CAESB; abastecimento suplementar após a crise hídrica (Sistema Bananal/Paranoá).",
     "Função climática · Tinha o objetivo original de umedecer o ar e amenizar a seca, porém NÃO consegue cumprir essa função em escala regional.",
     "Autoria da ideia · O botânico e paisagista Auguste Glaziou, da 2ª Missão Cruls, relatou ao astrônomo Luís Cruls que o vale central do Quadrilátero poderia formar um lago navegável; nas fontes consultadas, Varnhagen não aparece ligado ao lago. (Fonte: Jornal de Brasília; Senado Federal)",
     "Finalidades originais · Trabalho acadêmico indica que o lago (1959) foi criado para melhorar o clima e fornecer energia elétrica; a Usina do Paranoá foi inaugurada em setembro de 1962 para abastecer só os ministérios. (Fonte: TCC Even3; Correio Braziliense, 2024)",
     "Finalidades · Segundo autores citados em trabalho acadêmico, o lago (1959) é reservatório de múltiplos usos, criado para compor a paisagem urbana, promover recreação e amenizar o clima de savana da região, e abriga a usina hidrelétrica. (Fonte: TCC Even3, citando Pereira e Koide, 2024)",
     "Clima · A apostila afirma que a função de umedecer o ar não se cumpre em escala regional; isso não impede efeito local, que o item cita. (Fonte: Apostila Conhecimentos do DF, Parte 2)"
    ],
    "peg": "Atribuir a ideia do lago a Lúcio Costa, Niemeyer, JK ou a Varnhagen é ERRADO (o idealizador foi Auguste Glaziou, 1896). Afirmar que o lago umedece o ar de todo o DF ou que é a única fonte de água potável também é erro.",
    "chaves": [
     "Lago Parano(á|a)",
     "reservat(ó|o)rio artificial",
     "lago artificial",
     "Glaziou",
     "regula(ç|c)(ã|a)o clim(á|a)tica",
     "Varnhagen.*lago|lago.*Varnhagen",
     "Lago Parano(á|a).*abastecer",
     "objetivo primordial",
     "canteiro de obras",
     "paisag(í|i)sticas, de lazer",
     "Lago\\s+Parano(á|a)",
     "Varnhagen",
     "energia",
     "reservat(ó|o)rio\\s+artificial",
     "regula(ç|c)(ã|a)o\\s+clim(á|a)tica"
    ]
   },
   {
    "titulo": "Missão Cruls e o Quadrilátero Cruls",
    "lei": [
     "Missão Cruls (1892) · Determinada por Floriano Peixoto e chefiada pelo astrônomo belga Luís Cruls (Comissão Exploradora do Planalto Central, composta por 21 técnicos). Foi a PRIMEIRA missão financiada com dinheiro público.",
     "Quadrilátero Cruls · Área de 14.400 km² demarcada pela missão; incluía as lagoas Formosa, Feia e Mestre d’Armas (Bonita).",
     "2ª Missão Cruls (1896) · O botânico e paisagista francês Auguste François Marie Glaziou idealizou o Lago Paranoá artificial.",
     "Constituição de 1891 · Art. 3º: reserva de uma zona de 14.400 km² no Planalto Central para a futura Capital Federal."
    ],
    "peg": "Trocar os tamanhos das áreas: Cruls = 14.400 km²; Belcher = 52.000 km²; Polli Coelho = 77.254 km² (a maior de todas).",
    "chaves": [
     "Cruls",
     "Quadril(á|a)tero",
     "14\\.400",
     "Comiss(ã|a)o Exploradora"
    ]
   },
   {
    "titulo": "Massacre da Vila Pacheco Fernandes (1959)",
    "lei": [
     "Conflito · Violento confronto no Carnaval de 1959, em que a Guarda Especial de Brasília (GEB) reprimiu brutalmente operários em greve por comida estragada e salários atrasados.",
     "Nome · Massacre da Vila Pacheco Fernandes (1959).",
     "Mito desmentido · O conflito desmente o mito da \"convivência pacífica\" e da \"construção 100% pacífica\"."
    ],
    "peg": "Afirmar que a construção ocorreu em clima de paz absoluta entre operários e a GEB é ERRADO: ocorreu a greve do Carnaval de 1959 e o Massacre da Vila Pacheco Fernandes.",
    "chaves": [
     "Pacheco Fernandes",
     "carnaval de 1959",
     "conflito oper(á|a)rio"
    ]
   },
   {
    "titulo": "Disponibilidade hídrica per capita: DF só tem cabeceiras",
    "lei": [
     "Cabeceiras · O DF está na região de cabeceira de três grandes bacias, por isso a disponibilidade hídrica é limitada diante de uma população urbana que cresce desde a fundação. (Fonte: Adasa, PGIRH/DF, 2024)",
     "Per capita · Estudo da Codeplan (2020), citado em artigo de 2025, aponta disponibilidade hídrica per capita do DF em queda e uma das mais baixas do país. (Fonte: SBRH 2025, citando Codeplan 2020)"
    ],
    "peg": "Divisor de águas não significa abundância: quem só abriga nascentes tem rios de baixa vazão e disponibilidade per capita baixa.",
    "chaves": [
     "divisor de (á|a)guas",
     "disponibilidade h(í|i)drica",
     "per capita",
     "maior disponibilidade",
     "divisor\\s+de\\s+(á|a)guas",
     "disponibilidade\\s+h(í|i)drica",
     "nascentes"
    ]
   },
   {
    "titulo": "Localização, área e limites do DF",
    "lei": [
     "Coordenadas e área · O DF fica entre os paralelos 15°30' e 16°03' S e os meridianos 47°18' e 48°17' O, com extensão de 5.779 km² (valor do Atlas do IPEDF); o IBGE (2022) publica cerca de 5.760,8 km². (Fonte: IPEDF, Atlas do DF; IBGE 2022)",
     "Limites naturais · Rio Preto a leste e Rio Descoberto a oeste; ao norte e ao sul, linhas retas. (Fonte: IPEDF, Atlas do DF)",
     "Vizinhos · Divide limites com nove municípios goianos (Planaltina, Formosa, Cristalina, Cidade Ocidental, Valparaíso, Novo Gama, Santo Antônio do Descoberto, Águas Lindas e Padre Bernardo) e com Cabeceira Grande (MG). (Fonte: IPEDF, Atlas do DF)"
    ],
    "peg": "Dizer que o DF faz divisa só com Goiás é errado: há um pequeno trecho com Minas Gerais.",
    "chaves": [
     "(á|a)rea inferior a 6\\.000",
     "limitando-se ao sul",
     "Minas Gerais",
     "paralelos 15",
     "6\\.000\\s+km²",
     "Goi(á|a)s",
     "Minas\\s+Gerais"
    ]
   }
  ]
 },
 "historia-brasilia": {
  "titulo": "História de Brasília: da ideia à inauguração",
  "fontes": [
   [
    "Apostila Conhecimentos do DF e RIDE (Drive do usuário)",
    ""
   ],
   [
    "Wikipédia (Cine Brasília)",
    "https://pt.wikipedia.org/wiki/Cine_Bras%C3%ADlia"
   ],
   [
    "Jornal de Brasília (Cine Brasília, 65 anos)",
    "https://jornaldebrasilia.com.br/brasilia-65-anos/cinema-da-capital-luzes-camera-brasilia/"
   ],
   [
    "Jornal de Brasília (coluna Cinema com Ela)",
    "https://jornaldebrasilia.com.br/blogs-e-colunas/cinema-com-ela/cine-brasilia-a-alma-em-pelicula-da-capital-que-sonha/"
   ],
   [
    "Correio Braziliense, 2011 (Como nasce uma cidade)",
    "https://www.correiobraziliense.com.br/app/noticia/cidades/2011/08/13/interna_cidadesdf,265358/como-nasce-uma-cidade-engenheiros-e-operarios-unidos-na-construcao.shtml"
   ],
   [
    "FGV CPDOC (verbete Novacap)",
    "https://www18.fgv.br/cpdoc/acervo/dicionarios/verbete-tematico/companhia-urbanizadora-da-nova-capital-novacap"
   ],
   [
    "Rádio Senado (8 de janeiro: Democracia Restaurada)",
    "https://www12.senado.leg.br/radio/1/reportagem-especial/2024/01/04/8-de-janeiro-democracia-restaurada"
   ],
   [
    "STF (esforço para reconstruir o STF)",
    "https://portal.stf.jus.br/noticias/verNoticiaDetalhe.asp?idConteudo=523944&tip=UN"
   ],
   [
    "Poder360 (relatório do IPHAN)",
    "https://www.poder360.com.br/governo/iphan-entrega-relatorio-sobre-danos-nos-atos-em-brasilia/"
   ],
   [
    "Agência Brasil (cronologia)",
    "https://agenciabrasil.ebc.com.br/politica/noticia/2026-01/cronologia-da-tentativa-de-golpe-atentados-bloqueios-e-acampamentos"
   ],
   [
    "Planalto (Lei 13.260/2016)",
    "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2016/lei/l13260.htm"
   ],
   [
    "Wikipédia (Cidade Livre)",
    "https://pt.wikipedia.org/wiki/Cidade_Livre"
   ],
   [
    "Jornal de Brasília (Livre, a terra sem amarras)",
    "https://jornaldebrasilia.com.br/60anos/livre-a-terra-sem-amarras/"
   ],
   [
    "SHCU 2016 (Além do Plano)",
    "https://www.iau.usp.br/shcu2016/anais/wp-content/uploads/pdfs/37.pdf"
   ]
  ],
  "secs": [
   {
    "titulo": "Precursores da mudança da capital (séculos XVIII e XIX)",
    "lei": [
     "Marquês de Pombal (1755) · Primeira autoridade da monarquia portuguesa a sugerir a mudança da capital do litoral (Salvador) para o interior.",
     "Inconfidência Mineira (1789) · Tiradentes e os inconfidentes defendiam o deslocamento da capital do Rio de Janeiro para São João del-Rei (MG).",
     "Hipólito José da Costa (1808) · Correio Braziliense, editado clandestinamente em Londres; defendia a interiorização, apontando a província de Goiás como local ideal.",
     "José Bonifácio (1823) · Patriarca da Independência; propôs à Assembleia Constituinte a mudança para Paracatu (MG) e sugeriu pela primeira vez o nome Brasília (ou Petrópole).",
     "Ocupação pré-histórica · 51 sítios arqueológicos no DF com mais de 11.000 anos."
    ],
    "peg": "Inversão de nomes e cidades: Paracatu foi proposta por José Bonifácio; São João del-Rei, pelos Inconfidentes. O nome Brasília foi proposto por José Bonifácio em 1823 (e não por JK ou Lúcio Costa). A ideia não surgiu na Era Vargas: é secular.",
    "chaves": [
     "Pombal",
     "Inconfid(ê|e)ncia",
     "Tiradentes",
     "Jos(é|e) Bonif(á|a)cio",
     "Hip(ó|o)lito",
     "Correio Braziliense",
     "Era Vargas",
     "Paracatu",
     "Jo(ã|a)o del-Rei",
     "relativamente recente",
     "muito antiga|bastante antiga",
     "a ideia de transfer(ê|e)ncia"
    ]
   },
   {
    "titulo": "Varnhagen (1877) e o sonho de Dom Bosco (1883)",
    "lei": [
     "Varnhagen (1877) · Francisco Adolfo de Varnhagen, Visconde de Porto Seguro, custeou do próprio bolso a expedição ao Planalto Central e apontou a região das lagoas Feia, Formosa e Bonita (também chamada de Mestre d’Armas).",
     "Três razões · Integração do território (das províncias do interior), segurança estratégica (distância de investidas de esquadras navais inimigas) e salubridade do clima (para atrair colonos europeus).",
     "Dom Bosco (1883) · Profecia do padre italiano João Bosco sobre uma grande civilização entre os paralelos 15º e 20º de latitude sul, em um lago onde jorraria leite e mel. Dom Bosco é padroeiro de Brasília."
    ],
    "peg": "Afirmar que Varnhagen foi bancado pelo governo imperial de Dom Pedro II é ERRADO: financiou a expedição com recursos próprios. A proteção contra invasão externa é apenas uma de suas três razões.",
    "chaves": [
     "Varnhagen",
     "Dom Bosco",
     "salubridade",
     "invas(ã|a)o externa",
     "prote(ç|c)(ã|a)o à sede",
     "paralelos 15"
    ]
   },
   {
    "titulo": "Constituições e a previsão da mudança da capital",
    "lei": [
     "CF de 1891 · Registrou em lei pela PRIMEIRA vez, no art. 3º, a reserva de uma área de 14.400 km² no Planalto Central para a futura capital.",
     "Art. 3º (1891) · \"Fica pertencente à União, no Planalto Central da República, uma zona de 14.400 km² que será oportunamente demarcada, para nela estabelecer-se a futura Capital Federal.\"",
     "CF de 1934 · Manteve a previsão de transferência. CF de 1937 (Estado Novo): foi a ÚNICA constituição brasileira a omitir a mudança da capital.",
     "CF de 1946 · Retomou a determinação de mudança nas disposições transitórias."
    ],
    "peg": "Afirmar que a Constituição de 1891 omitiu a mudança da capital é ERRADO: a única que omitiu foi a de 1937.",
    "chaves": [
     "Constitui(ç|c)(ã|a)o de (1891|1937|1946)",
     "CF de 1891",
     "disposi(ç|c)(õ|o)es transit(ó|o)rias",
     "grafou como lei"
    ]
   },
   {
    "titulo": "Missão Cruls e Quadrilátero Cruls (1892 e 1896)",
    "lei": [
     "Missão Cruls (1892) · Determinada por Floriano Peixoto e chefiada pelo astrônomo belga Luís Cruls; composta por 21 técnicos. PRIMEIRA missão financiada com dinheiro público.",
     "Quadrilátero Cruls · Demarcou 14.400 km² (incluía as lagoas Formosa, Feia e Mestre d’Armas).",
     "2ª Missão Cruls (1896) · Auguste François Marie Glaziou idealizou e desenhou o Lago Paranoá artificial."
    ],
    "peg": "Trocar os tamanhos das áreas: Cruls = 14.400 km²; Belcher = 52.000 km²; Polli Coelho = 77.254 km² (a maior de todas).",
    "chaves": [
     "Cruls",
     "Quadril(á|a)tero",
     "14\\.400",
     "Comiss(ã|a)o Exploradora",
     "primeira Miss(ã|a)o"
    ]
   },
   {
    "titulo": "Relatório Belcher (1953-1954) e Sítio Castanho",
    "lei": [
     "Relatório Belcher · No governo Getúlio Vargas/Café Filho, a empresa americana Donald J. Belcher Associates fez fotoanálise e delimitou o Retângulo Belcher (52.000 km²).",
     "Sítios · Indicou 5 sítios (Amarelo, Azul, Vermelho, Verde e Castanho); o governo escolheu o Sítio Castanho como o local exato da nova capital.",
     "Vazio urbano · O Relatório comprovou que a região não era despovoada: já possuía fazendas com produção expressiva (arroz) e a cidade de Planaltina (fundada em 1859)."
    ],
    "peg": "Sustentar que o Retângulo Belcher encontrou um \"vazio absoluto\" é ERRADO: já existiam produção de arroz e a cidade de Planaltina.",
    "chaves": [
     "Belcher",
     "Ret(â|a)ngulo",
     "S(í|i)tio Castanho",
     "fazendas sem produ"
    ]
   },
   {
    "titulo": "Pedra Fundamental (1922) e Missão Polli Coelho (1946)",
    "lei": [
     "Pedra Fundamental · Lançada em 7 de setembro de 1922 (Centenário da Independência), às 12h, pelo presidente Epitácio Pessoa, no Morro do Centenário, a 10 km de Planaltina.",
     "Missão Polli Coelho (1946) · Nomeada por Eurico Gaspar Dutra e chefiada por Djalma Polli Coelho; delimitou a MAIOR área da história (77.254 km²).",
     "Contexto · Em 1946 a mudança da capital foi incluída nas disposições transitórias da Constituição."
    ],
    "peg": "O Relatório Belcher não determinou a construção em Planaltina; a pedra fundamental de 1922 foi fincada a 10 km de Planaltina, fundamentada no sonho de Dom Bosco.",
    "chaves": [
     "Pedra Fundamental",
     "Polli Coelho",
     "Epit(á|a)cio",
     "Eurico Gaspar Dutra",
     "Planaltina"
    ]
   },
   {
    "titulo": "JK: Jataí, Plano de Metas, Meta-Síntese e inauguração",
    "lei": [
     "Jataí (1955) · Em comício em Jataí (GO), em 4 de abril de 1955, ao responder a um eleitor (Toniquinho), JK prometeu cumprir a Constituição e transferir a capital.",
     "Meta-Síntese · A construção de Brasília foi adicionada ao Plano de Metas (1955-1960) como a 31ª meta; não estava nas 30 metas originais.",
     "Inauguração · Brasília foi inaugurada em 21 de abril de 1960.",
     "Justificativa · Estímulo à interiorização do desenvolvimento nacional (QUADRIX 2023, Certo)."
    ],
    "peg": "Afirmar que o nome Brasília foi criado por JK é ERRADO (foi proposto por José Bonifácio em 1823). A Lei nº 2.874, de setembro de 1956, criou a Novacap e oficializou o nome.",
    "chaves": [
     "Plano de Metas",
     "Meta[ -]S(í|i)ntese",
     "Juscelino",
     "JK",
     "21 de abril de 1960",
     "inaugura(ç|c)(ã|a)o",
     "Jata(í|i)"
    ]
   },
   {
    "titulo": "Novacap e Israel Pinheiro",
    "lei": [
     "Novacap · Criada em setembro de 1956 pela Lei nº 2.874 (Companhia Urbanizadora da Nova Capital); a lei oficializou o nome Brasília.",
     "Israel Pinheiro · Engenheiro-chefe, 1º presidente da Novacap e 1º Prefeito do DF (1960 a 1969).",
     "Bernardo Sayão · Engenheiro das rodovias radiais (morreu na construção da BR-010); não foi urbanista nem prefeito.",
     "Limite da apostila · Não traz fatos sobre a venda de terras públicas do DF para financiar a construção nem sobre a distribuição de moradias pela Novacap.",
     "Financiamento da obra · Em junho de 1957 a Novacap estimava o custo de Brasília em até 12 bilhões de cruzeiros e pretendia cobri-lo com a venda dos lotes da nova capital, sem pesar no Orçamento da União (Fonte: Correio Braziliense, 2011).",
     "Obrigações Brasília · Como o mercado hesitou em comprar terrenos numa cidade ainda improvável, o governo criou títulos públicos (Obrigações Brasília) para estimular a venda dos lotes (Fonte: Correio Braziliense, 2011).",
     "Base legal · A lei de criação da Novacap (Lei 2.874/1956) lhe deu a atribuição de adquirir, permutar, alienar, alugar e arrendar imóveis na área do novo DF (Fonte: FGV CPDOC, verbete Novacap)."
    ],
    "peg": "Confundir o 1º Prefeito com Bernardo Sayão ou JK é ERRADO: o 1º Prefeito foi Israel Pinheiro (1960-1969).",
    "chaves": [
     "Novacap|NOVACAP",
     "Companhia Urbanizadora",
     "Israel Pinheiro",
     "terras (que eram )?de dom(í|i)nio p(ú|u)blico",
     "financiar a constru",
     "venda de terras",
     "financiar a constru(ç|c)(ã|a)o",
     "colocadas? (à|a) venda",
     "venda\\s+de\\s+terras",
     "financiar\\s+a\\s+constru(ç|c)(ã|a)o",
     "venda",
     "terras",
     "Novacap"
    ]
   },
   {
    "titulo": "Oposição à construção: UDN e Carlos Lacerda",
    "lei": [
     "Oposição · Liderada pela UDN nacional e por Carlos Lacerda (no Rio de Janeiro).",
     "UDN goiana · A seção goiana da UDN, ao contrário do resto do partido, apoiava a mudança da capital para Goiás.",
     "Gustavo Corção · O jornalista dizia que o Lago Paranoá não encheria."
    ],
    "peg": "Afirmar que a UDN (ou Carlos Lacerda) apoiou a construção, ou que os políticos goianos da UDN eram contra, é ERRADO. A oposição foi liderada pela UDN nacional e por Lacerda; a seção goiana apoiava a mudança.",
    "chaves": [
     "UDN",
     "Uni(ã|a)o Democr(á|a)tica Nacional",
     "Lacerda",
     "opositor",
     "unanimidade",
     "entusiasmo"
    ]
   },
   {
    "titulo": "Candangos: origem e papel na construção",
    "lei": [
     "Termo · \"Candango\" era originalmente pejorativo/xingamento, mas foi ressignificado como símbolo de força e heroísmo.",
     "Origem por Estado · O estado que MAIS enviou operários foi Minas Gerais, seguido por Goiás e Bahia.",
     "Origem por Região · A região que MAIS enviou operários foi o Nordeste.",
     "CEBRASPE 2021 (Certo) · A presença de operários de diversos pontos do país, a exemplo de mineiros e nordestinos, foi vital para a construção de Brasília e contribuiu para a diversificada composição da população do novo DF."
    ],
    "peg": "Confundir a hegemonia estadual (Minas Gerais) com a hegemonia regional (Nordeste). Afirmar que Goiás ou a Bahia enviaram mais trabalhadores individualmente é ERRADO.",
    "chaves": [
     "candangos?",
     "migrantes",
     "oper(á|a)rios",
     "nasceram em outras",
     "mineir",
     "nordestin"
    ]
   },
   {
    "titulo": "Acampamentos pioneiros e primeira RA planejada",
    "lei": [
     "Núcleos pioneiros (não planejados) · Cidade Livre (atual Núcleo Bandeirante), Sacolândia/Lonalândia (atual Candangolândia), Vila Planalto, Vila Telebrasília e Metropolitana surgiram espontaneamente; não foram desenhados por Lúcio Costa.",
     "QUADRIX 2022 (Certo) · A urbanização do DF iniciou-se com os canteiros de obras da época da construção, que produziram aglomerações como Cidade Livre, Vila Planalto e Metropolitana.",
     "Taguatinga · 1ª RA planejada fora do Plano Piloto (5 de junho de 1958), criada pela Novacap para abrigar os operários que se recusaram a ir embora.",
     "Ceilândia · Surgiu apenas em 1971.",
     "Cidade Livre · Núcleo criado em 1956, durante a construção, para abrigar o comércio e os serviços dos operários; era de caráter provisório, com lotes em comodato da Novacap e construções de madeira, com permanência prevista de até quatro anos (Fonte: Wikipédia, Cidade Livre).",
     "Previsão de fim · As casas de madeira seriam demolidas quando da inauguração de Brasília (Fonte: Jornal de Brasília, 60 anos).",
     "Nome atual · A Cidade Livre foi oficializada como cidade-satélite (hoje Núcleo Bandeirante) em 1961, depois de confrontos com moradores que se recusaram a sair (Fonte: SHCU 2016, Além do Plano)."
    ],
    "peg": "Afirmar que Ceilândia (ou o Núcleo Bandeirante) foi a primeira cidade criada para candangos é ERRADO: foi Taguatinga (05/06/1958).",
    "chaves": [
     "Cidade Livre",
     "Lonal(â|a)ndia",
     "Sacol(â|a)ndia",
     "Vila Planalto",
     "Metropolitana",
     "Candangol(â|a)ndia",
     "N(ú|u)cleo Bandeirante",
     "acampamentos?",
     "reproduzidos integralmente",
     "n(ú|u)cleos habitacionais provis",
     "plano original da Novacap",
     "setor residencial definitivo",
     "Cidade\\s+Livre",
     "Novacap",
     "residencial"
    ]
   },
   {
    "titulo": "Plano Piloto: Lúcio Costa × Oscar Niemeyer",
    "lei": [
     "Concurso do Plano Piloto (1956/1957) · Vencido por Lúcio Costa (projeto urbanístico).",
     "Niemeyer · Oscar Niemeyer projetou os monumentos arquitetônicos; não venceu o concurso urbanístico.",
     "Traçado · Nascido de um gesto primário de tomada de posse (cruz em ângulo reto, dois eixos cruzando-se), curvado para se adaptar ao relevo e à bacia hídrica (arco e flecha / borboleta)."
    ],
    "peg": "Inversão das atribuições: afirmar que Niemeyer venceu o concurso urbanístico e Lúcio Costa projetou os prédios é ERRADO. Lúcio Costa = urbanista; Oscar Niemeyer = arquiteto dos monumentos.",
    "chaves": [
     "venceu o concurso",
     "concurso do projeto",
     "Plano Piloto",
     "Oscar Niemeyer",
     "L(ú|u)cio Costa"
    ]
   },
   {
    "titulo": "As quatro escalas urbanísticas de Lúcio Costa",
    "lei": [
     "Monumental · Eixo Monumental e sedes dos poderes; dedicada aos poderes e grandes monumentos.",
     "Residencial · Asas Sul e Norte, superquadras e edifícios sobre pilotis para integração social.",
     "Gregária · Próxima à Rodoviária: setores comercial, bancário, hoteleiro e de diversões.",
     "Bucólica · Áreas verdes, orla do Lago Paranoá e Parque da Cidade (áreas de vegetação e lazer)."
    ],
    "peg": "O tombamento da UNESCO protege o plano urbanístico de Lúcio Costa (as 4 escalas), e não isoladamente os prédios de Niemeyer.",
    "chaves": [
     "escala (bucólica|gregária|monumental|residencial)",
     "escalas",
     "buc(ó|o)lica",
     "Gregária",
     "superquadras"
    ]
   },
   {
    "titulo": "Burle Marx: paisagismo com vegetação nativa",
    "lei": [
     "Burle Marx · Roberto Burle Marx foi o paisagista mestre no uso de vegetação nativa em formas orgânicas.",
     "Obras · Jardins do Teatro Nacional, da 308 Sul e do Palácio do Jaburu.",
     "AOCP 2023 · Gabarito d): o emprego da diversidade da vegetação nativa na composição de formas orgânicas."
    ],
    "peg": "Atribuir a Burle Marx jardins medievais, espécies europeias renascentistas, topiaria ou jardins verticais é ERRADO.",
    "chaves": [
     "Burle Marx",
     "paisagista"
    ]
   },
   {
    "titulo": "Obras de Niemeyer, Cine Brasília e outros projetistas",
    "lei": [
     "Não projetados por Niemeyer · Palácio do Buriti (Nauro Jorge Esteves); Ponte JK (Alexandre Chan); Hospital da Rede Sarah (João Filgueiras Lima, o Lelé).",
     "Outras de Niemeyer · Palácio do Jaburu, Teatro Nacional Cláudio Santoro, Museu do Catetinho, Museu Vivo da Memória Candanga, Casa do Cantador (Ceilândia) e Torre Digital (\"Flor do Cerrado\").",
     "Festival de Brasília · O Festival de Brasília do Cinema Brasileiro consta entre os bens culturais imateriais registrados no DF.",
     "Limite da apostila · Não traz o Cine Brasília.",
     "Cine Brasília · Projetado por Oscar Niemeyer (cálculo estrutural de Joaquim Cardozo) e construído pela Novacap; foi inaugurado em abril de 1960, nos festejos da inauguração da capital (22 de abril segundo a Wikipédia e a coluna do Jornal de Brasília; 23 de abril segundo outra matéria do mesmo jornal).",
     "Festival de Brasília · O Cine Brasília recebe o Festival de Brasília do Cinema Brasileiro desde a primeira edição, em 1965, e é a sede do evento (Fonte: Jornal de Brasília, 2025; Wikipédia).",
     "Tombamento · O cinema é protegido por tombamento distrital (Decreto 10.829/1987) e federal (IPHAN, Portaria 314/1992), segundo a Wikipédia."
    ],
    "peg": "Atribuir a Niemeyer o Palácio do Buriti, a Ponte JK ou o Hospital da Rede Sarah é ERRADO.",
    "chaves": [
     "Cine Bras(í|i)lia",
     "Festival de Bras(í|i)lia",
     "Joaquim Cardozo",
     "Lel(é|e)",
     "Festival de Bras(í|i)lia do Cinema",
     "inaugurado.{0,40}abril de 1960",
     "Cine\\s+Bras(í|i)lia",
     "Festival\\s+de\\s+Bras(í|i)lia",
     "Niemeyer"
    ]
   },
   {
    "titulo": "Praça dos Três Poderes: Congresso, Planalto e STF",
    "lei": [
     "Congresso Nacional · Sede do Poder Legislativo federal, bicameral: Senado Federal (81 senadores, 3 do DF) e Câmara dos Deputados (513 deputados, 8 do DF).",
     "Palácio do Planalto · Sede do Poder Executivo Federal (gabinete do Presidente no 3º andar); NÃO é residência oficial.",
     "Supremo Tribunal Federal · Sede do Poder Judiciário da União; em frente fica a escultura \"A Justiça\", de Alfredo Ceschiatti, de olhos vendados (imparcialidade).",
     "Limite da apostila · Não traz fatos sobre a invasão e a depredação das sedes dos Poderes em janeiro de 2023."
    ],
    "peg": "Palácio do Planalto × Palácio da Alvorada: o Planalto é local de trabalho/despacho; a residência oficial é o Alvorada.",
    "chaves": [
     "invas(ã|a)o",
     "depreda(ç|c)(ã|a)o",
     "Congresso Nacional",
     "Tr(ê|e)s Poderes",
     "Palácio do Planalto",
     "Supremo Tribunal",
     "Lei Antiterrorismo",
     "posse do presidente"
    ]
   },
   {
    "titulo": "Atos de 8 de janeiro de 2023 em Brasília",
    "lei": [
     "Danos gerais · Os invasores quebraram vidraças e móveis, vandalizaram obras de arte e objetos históricos, invadiram gabinetes e rasgaram documentos; houve também focos de incêndio (Fonte: Rádio Senado, 2024).",
     "Patrimônio · O relatório preliminar do IPHAN avaliou Planalto, Congresso, STF, Museu da Cidade e Espaço Lúcio Costa e concluiu que a maioria dos danos aos edifícios era reparável; obras de arte exigiriam avaliação à parte (Fonte: Poder360, sobre relatório do IPHAN, 2023).",
     "STF · No Supremo, a depredação do sistema de incêndio encharcou ambientes e danificou obras; o prejuízo foi de cerca de R$ 12 milhões, com 951 itens furtados, quebrados ou destruídos e reconstrução do Plenário (Fonte: STF, 2024).",
     "Explosivo · A tentativa de bomba de 24/12/2022 envolveu um caminhão-tanque de combustível perto do aeroporto, e não um ônibus na Praça dos Três Poderes (Fonte: Agência Brasil, 2026).",
     "Cronologia · A posse do presidente Lula foi em 1º de janeiro de 2023; o ataque aos Três Poderes ocorreu uma semana depois, em 8 de janeiro, por manifestantes insatisfeitos com a posse (Fonte: Rádio Senado, 2024).",
     "Natureza · Os atos foram violentos (invasão, depredação, golpismo) e levaram a denúncias por abolição violenta do Estado Democrático de Direito, golpe de Estado e dano a patrimônio tombado (Fonte: Rádio Senado, 2024).",
     "Lei Antiterrorismo · A Lei 13.260 é de 16 de março de 2016, muito anterior ao episódio (Fonte: Planalto)."
    ],
    "peg": "Assertivas com exagero (incêndio total da fachada do STF; ônibus com dinamite na Praça) são falsas: houve depredação, danos a móveis e documentos e focos de incêndio, mas as fontes não registram essas duas ocorrências.",
    "chaves": [
     "atos antidemocr(á|a)ticos",
     "08 de janeiro",
     "8 de janeiro",
     "depreda(ç|c)(ã|a)o de obras de arte",
     "inc(ê|e)ndio total",
     "invas(ã|a)o ao Congresso",
     "janeiro de 2023",
     "posse do presidente Lula",
     "Lei Antiterrorismo",
     "depreda(ç|c)(ã|a)o",
     "invas(ã|a)o",
     "obras\\s+de\\s+arte",
     "janeiro\\s+de\\s+2023",
     "posse"
    ]
   }
  ]
 },
 "patrimonio": {
  "titulo": "Patrimônio cultural e urbanístico de Brasília",
  "fontes": [
   [
    "Apostila Conhecimentos do DF e RIDE (Drive do usuário)",
    ""
   ],
   [
    "Feira do Livro de Brasília (site oficial, história)",
    "https://feiradolivrobsb.com.br/"
   ],
   [
    "Correio Braziliense (35ª Feira do Livro, 2019)",
    "https://www.correiobraziliense.com.br/app/noticia/diversao-e-arte/2019/06/06/interna_diversao_arte,760511/35-feira-do-livro-tem-inicio-em-espaco-reformulado.shtml"
   ],
   [
    "Jornal de Brasília (Brasília migrante)",
    "https://jornaldebrasilia.com.br/brasilia-65-anos/brasilia-migrante-o-mosaico-de-quem-moldou-a-cultura-da-capital/"
   ],
   [
    "Correio Braziliense (nordestinos e a cultura do DF)",
    "https://www.correiobraziliense.com.br/cidades-df/2021/02/4907423-conheca-as-historias-de-nordestinos-que-enriquecem-a-cultura-do-df.html"
   ],
   [
    "Jornal de Brasília (TBT Casa do Cantador, 2023)",
    "https://jornaldebrasilia.com.br/brasilia/tbt-casa-do-cantador-a-cultura-nordestina-no-planalto-central/"
   ],
   [
    "Wikipédia (Casa do Cantador)",
    "https://pt.wikipedia.org/wiki/Casa_do_Cantador"
   ],
   [
    "Wikipédia (Catetinho)",
    "https://pt.wikipedia.org/wiki/Catetinho"
   ],
   [
    "IPHAN, parecer sobre o PPCUB (Documento_Iphan.pdf)",
    "https://www.gov.br/iphan/pt-br/assuntos/noticias/analise-final-do-plano-de-preservacao-do-conjunto-urbanistico-de-brasilia-ppcub-e-entregue-a-seduh/Documento_Iphan.pdf/@@display-file/file"
   ],
   [
    "Wikipédia (Conjunto Urbanístico de Brasília)",
    "https://pt.wikipedia.org/wiki/Conjunto_Urban%C3%ADstico_de_Bras%C3%ADlia"
   ],
   [
    "Correio Braziliense (Burle Marx, o inventor dos jardins modernos, 2009)",
    "https://www.correiobraziliense.com.br/app/noticia/cidades/2009/08/04/interna_cidadesdf,131883/burle-marx-o-inventor-dos-jardins-modernos.shtml"
   ]
  ],
  "secs": [
   {
    "titulo": "Tombamento de Brasília: UNESCO (1987) e IPHAN (1990)",
    "lei": [
     "UNESCO · Em 7 de dezembro de 1987, Brasília foi declarada Patrimônio Cultural da Humanidade: o PRIMEIRO bem contemporâneo (sítio do século XX) a receber a distinção.",
     "Área · Possui a MAIOR área urbana tombada do mundo (112,25 km²).",
     "Objeto · O tombamento protege o projeto urbanístico de Lúcio Costa (as 4 escalas), e não isoladamente os prédios de Niemeyer.",
     "IPHAN · Em 14 de março de 1990, inscrição formal no Livro de Tombo Histórico nacional.",
     "O que é protegido · O tombamento federal (IPHAN, Portaria 314/1992) protege a concepção urbana, expressa nas quatro escalas (monumental, residencial, gregária e bucólica) e na articulação entre elas (Fonte: IPHAN).",
     "Obras novas · Há regras de ocupação por área: por exemplo, nas superquadras 100, 200 e 300 mantêm-se seis pavimentos sobre pilotis e a taxa de ocupação; a Portaria 166/2016 detalha usos, ocupação e gabaritos por setor (Fonte: IPHAN, Portaria 166/2016 e parecer sobre o PPCUB).",
     "Limite do tombamento · Brasília não é tombada como cidade histórica: pode-se construir ou substituir edifícios não tombados, desde que respeitadas escalas, vazios, volumetrias e taxas de ocupação (Fonte: Wikipédia, Conjunto Urbanístico de Brasília, como apoio)."
    ],
    "peg": "Sustentar que a UNESCO tombou os prédios de Niemeyer é ERRADO: tombou o conjunto urbanístico de Lúcio Costa (as 4 escalas).",
    "chaves": [
     "Unesco|UNESCO",
     "Patrim(ô|o)nio (Cultural )?da Humanidade",
     "tombamento",
     "tombad",
     "IPHAN",
     "1987",
     "tombamento de Bras(í|i)lia impede",
     "sem qualquer exce(ç|c)(ã|a)o",
     "constru(ç|c)(ã|a)o nova",
     "(á|a)rea tombada",
     "sem\\s+qualquer\\s+exce(ç|c)(ã|a)o",
     "constru(ç|c)(ã|a)o\\s+nova"
    ]
   },
   {
    "titulo": "Lúcio Costa e o Plano Piloto: concurso, gesto primário e escala residencial",
    "lei": [
     "Autoria · O Plano Piloto é projeto urbanístico de Lúcio Costa, vencedor do concurso (1956/1957).",
     "Gesto primário · A solução \"nasceu do gesto primário de quem assinala um lugar ou dele toma posse\": dois eixos cruzando-se em ângulo reto.",
     "Residencial · Asas Sul e Norte, superquadras, edifícios sobre pilotis para integração social.",
     "Paisagismo · Jardins de Burle Marx (vegetação nativa em formas orgânicas), como no Teatro Nacional e na 308 Sul."
    ],
    "peg": "Dizer que o Plano Piloto foi desenhado por Oscar Niemeyer ou JK é ERRADO: Lúcio Costa = urbanista; Niemeyer = arquiteto dos monumentos.",
    "chaves": [
     "concep(ç|c)(ã|a)o urban(í|i)stica",
     "vencedor do concurso",
     "Plano Piloto",
     "superquadras",
     "preconceitos sociais",
     "Esplanada dos Minist(é|e)rios",
     "Burle Marx",
     "paisagismo"
    ]
   },
   {
    "titulo": "\"Os Candangos\" (\"Os Guerreiros\"), de Bruno Giorgi",
    "lei": [
     "Obra · Escultura em bronze de Bruno Giorgi, na Praça dos Três Poderes, em homenagem aos operários que construíram a capital.",
     "Nomes · \"Os Candangos\" ou \"Os Guerreiros\".",
     "Autor · Bruno Giorgi (e não Portinari, Cícero Dias ou Pancetti)."
    ],
    "peg": "Não confundir Bruno Giorgi (Candangos e Meteoro) com Alfredo Ceschiatti (A Justiça, As Banhistas, Anjos e Evangelistas da Catedral).",
    "chaves": [
     "guerreiros",
     "Candangos",
     "Bruno Giorgi",
     "Portinari"
    ]
   },
   {
    "titulo": "\"Meteoro\", de Bruno Giorgi (Palácio do Itamaraty)",
    "lei": [
     "Obra · \"Meteoro\", no espelho d’água externo do Palácio do Itamaraty (Ministério das Relações Exteriores).",
     "Material · Esculpida em mármore branco de Carrara por Bruno Giorgi.",
     "Significado · Representa os 5 continentes."
    ],
    "peg": "Meteoro é de Bruno Giorgi (Itamaraty); \"A Justiça\" (STF) e \"As Banhistas\" (Alvorada) são de Alfredo Ceschiatti.",
    "chaves": [
     "Meteoro",
     "Carrara",
     "Itamaraty",
     "Itamarati",
     "Monumento (à|a) Juventude"
    ]
   },
   {
    "titulo": "Taguatinga: primeira RA planejada fora do Plano Piloto",
    "lei": [
     "Taguatinga · 1ª RA planejada fora do Plano Piloto (5 de junho de 1958), criada pela Novacap para abrigar os operários que se recusaram a ir embora após os acampamentos provisórios.",
     "Ceilândia · Surgiu apenas em 1971.",
     "Núcleos pioneiros · Cidade Livre (Núcleo Bandeirante), Sacolândia/Lonalândia (Candangolândia), Vila Planalto, Vila Telebrasília e Metropolitana surgiram espontaneamente."
    ],
    "peg": "Afirmar que Ceilândia foi a primeira cidade criada para os candangos é ERRADO. A primeira RA planejada pela Novacap foi Taguatinga (1958).",
    "chaves": [
     "Taguatinga",
     "cidades-sat(é|e)lites",
     "primeira regi(ã|a)o administrativa planejada",
     "n(ú|u)cleos rurais"
    ]
   },
   {
    "titulo": "Núcleos urbanos preexistentes: Planaltina e Brazlândia",
    "lei": [
     "Preexistentes · Antes da construção de Brasília (1956), já existiam os núcleos urbanos goianos de Planaltina (1859) e Brazlândia (1933).",
     "Tabela · Planaltina e Brazlândia: cidades goianas preexistentes a Brasília (1859 e 1933).",
     "Pegadinha da tabela · Afirmar que foram desenhadas por Lúcio Costa ou criadas pela Novacap é erro."
    ],
    "peg": "Afirmar que Planaltina e Brazlândia surgiram como cidades-satélites criadas pela Novacap é ERRADO: são preexistentes (1859 e 1933).",
    "chaves": [
     "preexist",
     "antecederam",
     "Planaltina e Brazlândia",
     "vernacular"
    ]
   },
   {
    "titulo": "Burle Marx: paisagismo em Brasília",
    "lei": [
     "Paisagista · Roberto Burle Marx, mestre no uso de vegetação nativa em formas orgânicas.",
     "Jardins · Teatro Nacional, 308 Sul e Palácio do Jaburu.",
     "Característica · O emprego da diversidade da vegetação nativa na composição de formas orgânicas.",
     "Obras em Brasília · Burle Marx projetou a Praça dos Cristais, os jardins externos e internos do Itamaraty, o jardim externo do Palácio da Justiça (Esplanada dos Ministérios), o do Palácio do Jaburu, o paisagismo da 308 Sul, os jardins do Teatro Nacional e os do TCU (Fonte: Correio Braziliense, 2009).",
     "Canteiro da Esplanada · No governo José Aparecido (1985-1988) ele fez um anteprojeto de paisagismo para o canteiro central da Esplanada, que Lúcio Costa rejeitou (Fonte: Correio Braziliense, 2009).",
     "Proteção · O Decreto distrital 33.040/2011 protege nove jardins seus, incluindo o do Ministério da Justiça (Fonte: Correio Braziliense, citando o decreto)."
    ],
    "peg": "Atribuir a Burle Marx jardim medieval, espécies europeias ou jardins verticais é ERRADO.",
    "chaves": [
     "Burle Marx",
     "paisagista",
     "paisagismo de diversas",
     "trechos da Esplanada",
     "paisagis",
     "Esplanada dos Minist(é|e)rios",
     "Burle\\s+Marx",
     "paisagismo",
     "Esplanada\\s+dos\\s+Minist(é|e)rios"
    ]
   },
   {
    "titulo": "Bens culturais imateriais: Bumba Meu Boi do Seu Teodoro",
    "lei": [
     "Bumba Meu Boi do Seu Teodoro · Registrado por decreto como bem estritamente IMATERIAL; sede em SOBRADINHO (e NÃO em Planaltina).",
     "Outros bens imateriais registrados no DF · ARUC, Clube do Choro, Via Sacra ao Vivo de Planaltina, Festa do Divino de Planaltina, Festival de Brasília do Cinema Brasileiro, Praça dos Orixás, Hip-Hop e Fuá de Seu Estrelo.",
     "Classificação · Festas, ritos e danças são patrimônio IMATERIAL.",
     "Origem migratória · O estado que MAIS enviou operários para a construção foi Minas Gerais, seguido por Goiás e Bahia; a região que MAIS enviou foi o Nordeste.",
     "Limite da apostila · Não traz a Feira do Livro de Brasília (FeliB) nem a relação direta entre as expressões culturais e as migrações."
    ],
    "peg": "Afirmar que a sede do Bumba Meu Boi é Planaltina, ou que festas tradicionais são patrimônio material, é ERRADO. Sede em Sobradinho; bem IMATERIAL.",
    "chaves": [
     "Bumba",
     "Seu Teodoro",
     "material e imaterial",
     "Feira do Livro",
     "FeliB",
     "express(õ|o)es culturais",
     "identidade pr(ó|o)pria",
     "influ(ê|e)ncia das migra(ç|c)(õ|o)es",
     "caldeir(ã|a)o cultural",
     "calend(á|a)rio cultural"
    ]
   },
   {
    "titulo": "Casa do Cantador (Ceilândia)",
    "lei": [
     "Localização · Casa do Cantador, em Ceilândia (próxima à Feira de Ceilândia).",
     "Autoria · A apostila a lista entre as edificações notáveis de Niemeyer.",
     "Limite da apostila · Não traz as funções do espaço (festivais de repentistas, preservação da cultura nordestina).",
     "Função · A Casa do Cantador é palco de repentistas de viola, declamadores, emboladores de coco e literatura de cordel, com os festivais Nacional e Regional de Cantadores Repentistas; atua na preservação da cultura nordestina (Fonte: Jornal de Brasília, 2023).",
     "Origem · Foi inaugurada em 9 de novembro de 1986, por reivindicação de representantes da cultura nordestina de Ceilândia, no governo de José Aparecido de Oliveira, com projeto de Oscar Niemeyer (Fonte: Jornal de Brasília, 2023; Wikipédia).",
     "Gestão · É espaço cultural da Secretaria de Cultura e Economia Criativa do DF, conhecido como Palácio da Poesia (Fonte: Jornal de Brasília, 2023)."
    ],
    "peg": "Atribuir a Casa do Cantador a Lúcio Costa é ERRADO; a apostila a lista entre as obras de Niemeyer, em Ceilândia.",
    "chaves": [
     "Casa do Cantador",
     "cantoria",
     "repentes",
     "Feira de Ceilândia",
     "Casa\\s+do\\s+Cantador",
     "Niemeyer",
     "cultura\\s+nordestina"
    ]
   },
   {
    "titulo": "Feira do Livro de Brasília (FeliB)",
    "lei": [
     "Criação · A Feira do Livro de Brasília foi criada em 1982, segundo o histórico no site oficial do evento (Fonte: Feira do Livro de Brasília, histórico, 2025).",
     "Calendário oficial · Foi incluída no Calendário oficial de eventos do Poder Executivo do DF pela Lei distrital 2.906/2002 (Fonte: site oficial da Feira do Livro de Brasília, 2025).",
     "Realização · A feira é promovida pela Câmara do Livro do Distrito Federal, com fomento da Secretaria de Cultura (Fonte: Correio Braziliense, 2019 e 2020)."
    ],
    "peg": "A banca pode inverter as épocas: criação no século XXI ou inclusão no calendário ainda no século XX. Corretos: criação em 1982 (século XX) e inclusão em 2002 (século XXI).",
    "chaves": [
     "Feira do Livro",
     "FeliB|FeLiB",
     "C(â|a)mara do Livro",
     "Feira\\s+do\\s+Livro",
     "FeliB"
    ]
   },
   {
    "titulo": "Diversidade cultural e migrações",
    "lei": [
     "Origem da cultura local · Brasília nasceu do esforço de migrantes de diversas regiões que construíram a capital, e muitos ficaram trazendo costumes e saberes da terra natal, o que formou um encontro de culturas, sotaques e tradições (Fonte: Jornal de Brasília, 2025).",
     "Presença nordestina · Segundo a Codeplan (2018), mais de 640 mil nordestinos viviam no DF; a cultura deles (cordel, música, culinária) integra a vida local, e uma lei distrital incluiu o Encontro Nordestino no calendário oficial (Fonte: Correio Braziliense, 2021)."
    ],
    "peg": "Item que afirme cultura homogênea ou sem influência das migrações é ERRADO; a identidade candanga vem da mistura de migrantes.",
    "chaves": [
     "express(õ|o)es culturais",
     "influ(ê|e)ncia das migra(ç|c)(õ|o)es",
     "migra(ç|c)(õ|o)es que formaram",
     "caldeir(ã|a)o cultural",
     "express(õ|o)es\\s+culturais",
     "migra(ç|c)(õ|o)es",
     "Nordeste"
    ]
   }
  ]
 },
 "regioes-administrativas": {
  "titulo": "Natureza do DF, regiões administrativas e política",
  "fontes": [
   [
    "Apostila Conhecimentos do DF e RIDE (Drive do usuário)",
    ""
   ],
   [
    "STF (notícia de 09/01/2023)",
    "https://portal.stf.jus.br/noticias/verNoticiaDetalhe.asp?idConteudo=500254&ori=1"
   ],
   [
    "STF (referendo do plenário)",
    "https://portal.stf.jus.br/noticias/verNoticiaDetalhe.asp?idConteudo=500413&ori=1"
   ],
   [
    "Arquitextos/Vitruvius (Derntl, 2018)",
    "https://vitruvius.com.br/revistas/read/arquitextos/19.221/7150"
   ],
   [
    "SHCU 2016 (Além do Plano)",
    "https://www.iau.usp.br/shcu2016/anais/wp-content/uploads/pdfs/37.pdf"
   ]
  ],
  "secs": [
   {
    "titulo": "DF: unidade federativa sui generis, sem municípios (art. 32 da CF)",
    "lei": [
     "Art. 32 · O Distrito Federal, VEDADA SUA DIVISÃO EM MUNICÍPIOS, reger-se-á por lei orgânica, votada em dois turnos com interstício mínimo de dez dias e aprovada por dois terços da Câmara Legislativa.",
     "Natureza · Unidade federativa autônoma, de natureza híbrida (sui generis): acumula as competências legislativas e tributárias reservadas aos Estados e aos Municípios (§ 1º).",
     "Governo · Regido por Lei Orgânica (como município), mas chefiado por Governador (como estado). Não possui vereadores nem prefeitos.",
     "Judiciário · Não possui Poder Judiciário próprio: TJDFT, MPDFT e as forças de segurança (PCDF, PMDF e CBMDF) são organizados e mantidos pela União (art. 21, XIII e XIV).",
     "Divisão · Divide-se em 35 RAs (a divisão em municípios é vedada)."
    ],
    "peg": "Afirmar que o DF pode ser dividido em municípios mediante lei complementar, que as RAs têm status de município ou que o TJDFT é mantido pelo GDF é ERRADO.",
    "chaves": [
     "munic(í|i)pio(s)? e (n(ã|a)o|possui)",
     "n(ã|a)o possui munic(í|i)pio",
     "n(ã|a)o se subdivide",
     "n(ã|a)o é dividido em munic(í|i)pios",
     "status de munic(í|i)pio",
     "Unidade Federativa e",
     "lei org(â|a)nica",
     "sui generis",
     "ente federativo",
     "capital oficial",
     "mancha urbana"
    ]
   },
   {
    "titulo": "Regiões Administrativas: número e criação",
    "lei": [
     "Número · O DF divide-se atualmente em 35 RAs.",
     "Criação · A criação ou extinção de Regiões Administrativas ocorre mediante lei aprovada pela Câmara Legislativa (e NÃO por mero decreto do Governador).",
     "Estrutura · As Administrações Regionais integram a estrutura administrativa do Distrito Federal (e NÃO de Brasília).",
     "Conselho Tutelar · A criação de cada nova RA vincula obrigatoriamente a abertura de um respectivo Conselho Tutelar.",
     "Recentes · RAs criadas em 2019: Sol Nascente/Pôr do Sol (RA 32) e Arniqueira (RA 33); em dezembro de 2022: Arapoanga (RA 34) e Água Quente (RA 35)."
    ],
    "peg": "Afirmar que o número de RAs é fixado em 31 na Lei Orgânica, que depende de emenda constitucional federal ou que o Governador cria RA por decreto é ERRADO. A criação ou extinção depende de LEI aprovada pela CLDF.",
    "chaves": [
     "n(ú|u)mero de Regi(õ|o)es Administrativas",
     "criadas?",
     "cria(ç|c)(ã|a)o de novas",
     "aumentado ao longo do tempo",
     "Conselho Tutelar",
     "estrutura administrativa"
    ]
   },
   {
    "titulo": "Arapoanga (RA 34) e Água Quente (RA 35)",
    "lei": [
     "Arapoanga (RA 34) · Desmembrada de Planaltina (RA onde fica a Pedra Fundamental); a mais populosa das duas.",
     "Água Quente (RA 35) · Desmembrada do Recanto das Emas; localizada na APA do Descoberto.",
     "Data · As duas RAs mais recentes foram criadas em dezembro de 2022 (CLDF, sessão de 07 de dezembro de 2022).",
     "RAs de 2019 · Sol Nascente/Pôr do Sol (RA 32) e Arniqueira (RA 33)."
    ],
    "peg": "Dizer que Água Quente foi desmembrada de Planaltina é ERRADO: Arapoanga veio de Planaltina; Água Quente veio do Recanto das Emas.",
    "chaves": [
     "Arapoanga",
     "Água Quente",
     "mais recentes regi(õ|o)es",
     "Arniqueira",
     "Sol Nascente"
    ]
   },
   {
    "titulo": "Administrador Regional: nomeação, teto e participação popular",
    "lei": [
     "Nomeação · Os Administradores Regionais são nomeados pelo Governador; não há prefeitos nas RAs.",
     "Teto · A remuneração do Administrador Regional não poderá ser superior à fixada para os Secretários de Estado do DF.",
     "Participação popular · A Lei Orgânica do DF prevê a possibilidade de participação popular na escolha do Administrador Regional, mas a regra depende de regulamentação por lei.",
     "Organização · O DF organiza-se em regiões administrativas, com vistas à descentralização administrativa, à utilização racional de recursos para o desenvolvimento socioeconômico e à melhoria da qualidade de vida."
    ],
    "peg": "Dizer que a RA tem status de prefeitura, que o administrador é eleito, que o salário pode superar o de Secretário de Estado ou que a lei veda a participação popular é ERRADO.",
    "chaves": [
     "Administrador(es)? Regio",
     "prefeito(s)? eleito",
     "autonomia pol(í|i)tica e legislativa",
     "autarquias locais",
     "Secretário(s)? de Estado",
     "participa(ç|c)(ã|a)o popular",
     "Regi(õ|o)es Administrativas \\(RAs\\), que s(ã|a)o administradas"
    ]
   },
   {
    "titulo": "Representação política do DF: CLDF, deputados e senadores",
    "lei": [
     "CLDF · Câmara Legislativa do Distrito Federal: 24 deputados distritais, eleitos a cada 4 anos por voto direto.",
     "Câmara dos Deputados · 8 deputados federais (e não 11 ou 12). Senado Federal: 3 senadores, eleitos para mandato de 8 anos.",
     "Art. 32, § 2º · A eleição do Governador, do Vice-Governador e dos Deputados Distritais coincide com a dos Governadores e Deputados Estaduais, para mandato de quatro anos.",
     "Aplicação do art. 27 · Aos Deputados Distritais e à Câmara Legislativa aplica-se o disposto no art. 27."
    ],
    "peg": "Afirmar que a CLDF tem 30 deputados, que é formada por vereadores ou que o DF elege 11 deputados federais é ERRADO: 24 distritais, 8 federais e 3 senadores.",
    "chaves": [
     "deputados federais",
     "onze deputados",
     "513",
     "senador",
     "Deputados Distritais",
     "CLDF|Câmara Legislativa"
    ]
   },
   {
    "titulo": "Governadores e eleições no DF (1986, 1990 e governadoras)",
    "lei": [
     "1986 · Primeira eleição no DF para deputados federais (8) e senadores (3). Em 1984 não houve eleição e Brasília NUNCA esteve sob estado de sítio durante as Diretas Já.",
     "1990 · Primeira eleição direta para Governador do DF e para Deputados Distritais da recém-criada CLDF; o primeiro governador eleito pelo voto direto foi Joaquim Roriz.",
     "Antes · De 1960 a 1969, Prefeito de Brasília nomeado pelo Presidente (1º Prefeito: Israel Pinheiro); de 1969 a 1990, governador nomeado (\"biônico\").",
     "Governadoras · O DF teve 4 governadoras (efetivas ou interinas): Márcia Kubitschek, Arlete Avelar Sampaio, Maria de Lourdes Abadia e Celina Leão.",
     "Limite da apostila · Não traz o afastamento do governador em janeiro de 2023.",
     "Afastamento de 2023 · Na noite de 8 de janeiro de 2023, o ministro Alexandre de Moraes (STF) afastou Ibaneis Rocha do cargo de governador do DF pelo prazo inicial de 90 dias, após a invasão das sedes dos Três Poderes (Fonte: STF, 09/01/2023).",
     "Substituição e retorno · A vice-governadora Celina Leão assumiu o governo; Moraes revogou o afastamento em 15 de março de 2023, após cerca de 64 dias (Fonte: Agência Brasil e STF, 2023)."
    ],
    "peg": "Afirmar que a eleição direta para governador começou em 1986 (foi em 1990) ou que Brasília esteve sob estado de sítio em 1984 é ERRADO.",
    "chaves": [
     "governador",
     "Ibaneis",
     "1986",
     "1990",
     "Diretas",
     "governadoras",
     "Alexandre de Moraes",
     "afastar o governador",
     "governador do Distrito Federal afastado",
     "90 dias",
     "Ibaneis\\s+Rocha",
     "afastamento",
     "janeiro\\s+de\\s+2023"
    ]
   },
   {
    "titulo": "Ideia original de Lúcio Costa para as cidades-satélites",
    "lei": [
     "Taguatinga · 1ª RA planejada fora do Plano Piloto (5 de junho de 1958), criada pela Novacap para abrigar operários.",
     "Ceilândia · Criada posteriormente, em 1971.",
     "Limite da apostila · Não traz a ideia original de Lúcio Costa de criar cidades-satélites só após a saturação do núcleo central.",
     "Intenção de Lúcio Costa · Mais tarde, ele declarou ter concebido o Plano Piloto de modo que, ao se aproximar do limite de 500 a 700 mil habitantes, seriam criadas na periferia cidades-satélites pequenas e complementares (Fonte: Derntl, Arquitextos/Vitruvius, 2018).",
     "Modelo metropolitano · O DF se tornou um sistema urbano esparso e polinucleado, dominado pelo centro (Plano Piloto) e com assentamentos periféricos, as cidades-satélites (Fonte: Derntl, Arquitextos 2018; SHCU 2016).",
     "Na prática · As satélites acabaram surgindo antes do previsto, a partir de acampamentos e remoções (Fonte: Derntl, 2018; Wikipédia, Plano Piloto)."
    ],
    "peg": "A apostila registra que Taguatinga e Ceilândia foram criadas pela Novacap/ posteriormente, e que os acampamentos pioneiros não foram desenhados por Lúcio Costa.",
    "chaves": [
     "Segundo as ideias originais",
     "cidades-sat(é|e)lites deveriam",
     "polinucleado",
     "ocupa(ç|c)(ã|a)o do n(ú|u)cleo central",
     "cidades-sat(é|e)lites",
     "L(ú|u)cio\\s+Costa",
     "n(ú|u)cleo\\s+central"
    ]
   }
  ]
 },
 "saneamento": {
  "titulo": "Saneamento e abastecimento de água no DF",
  "fontes": [
   [
    "Apostila Conhecimentos do DF e RIDE (Drive do usuário)",
    ""
   ],
   [
    "Governo de Goiás, inauguração do Sistema Produtor Corumbá (2022)",
    "https://goias.gov.br/inaugurado-sistema-produtor-corumba/"
   ],
   [
    "Caesb, Relatório de Gestão 2024",
    "https://s3.caesb.df.gov.br/www/prod/site1/Relatorio-Gestao-2024.pdf"
   ],
   [
    "Jornal de Brasília sobre PDAD/IPEDF (10/03/2025)",
    "https://jornaldebrasilia.com.br/brasilia/distrito-federal-ja-tem-servicos-de-saneamento-universalizados/"
   ],
   [
    "Jornal de Brasília sobre Ranking Trata Brasil 2023 (31/08/2023)",
    "https://jornaldebrasilia.com.br/brasilia/df-tem-maior-taxa-de-esgoto-tratado-do-brasil-diz-pesquisa/"
   ],
   [
    "ICMBio, minuta do Plano de Manejo do Parque Nacional de Brasília",
    "https://www.gov.br/icmbio/pt-br/assuntos/biodiversidade/unidade-de-conservacao/unidades-de-biomas/cerrado/lista-de-ucs/parna-de-brasilia/arquivos/minuta_plano_manejo_pnb_v8_final.pdf"
   ],
   [
    "Caesb, Relatório 1º tri 2026",
    "https://s3.caesb.df.gov.br/www/prod/site1/DF-1trimestre-2026.pdf"
   ],
   [
    "Jornal de Brasília, ETA Rio Descoberto (08/02/2023)",
    "https://jornaldebrasilia.com.br/brasilia/eta-rio-descoberto-que-abastece-60-da-populacao-do-df-completa-37-anos/"
   ],
   [
    "Correio Braziliense, plano de racionamento da Caesb (jan/2017)",
    "https://blogs.correiobraziliense.com.br/consumidor/caesb-anuncia-plano-de-racionamento/"
   ]
  ],
  "secs": [
   {
    "titulo": "Sistema Corumbá IV: barramento, usos e início do abastecimento",
    "lei": [
     "Barramento · Formado pelo barramento do Rio Corumbá no município de Luziânia (GO); reservatório de 173 km² que abrange municípios de Goiás (Luziânia, Alexânia, Abadiânia, Corumbá de Goiás, Silvânia, Santo Antônio do Descoberto e Novo Gama).",
     "Início · A adutora foi inaugurada em 2022 para reforçar o abastecimento do DF (iniciando por Santa Maria) e do Entorno (atende Santa Maria, Gama e Entorno).",
     "Usos múltiplos · Geração de energia hidrelétrica, fornecimento de água potável, turismo, esportes náuticos e preservação ambiental.",
     "O que NÃO é · Não foi criado para irrigação agrícola nem para combater a seca.",
     "Limite da apostila · Não traz a gestão consorciada CAESB/Saneago nem quem desenvolveu o projeto.",
     "Questão IADES 2023 · A apostila reproduz este item com resposta d): o lago de Corumbá IV tem usos múltiplos (energia hidrelétrica, água potável, turismo, esportes náuticos e preservação ambiental). (Fonte: apostila, tópico de saneamento)",
     "Início do abastecimento · O Sistema Produtor Corumbá, que leva água ao DF e a Goiás, foi inaugurado em 6/4/2022; a data de 2006 não marca o início do abastecimento por esse sistema. (Fonte: Governo de Goiás, 2022)",
     "Irrigação e seca · A apostila afirma que Corumbá IV não foi criado para irrigação agrícola nem para combater a seca; por isso as letras C (ameniza a secura) e E (irrigação de lavouras) são erradas. (Fonte: apostila)",
     "Gestão consorciada · O Sistema Produtor Corumbá resulta de um consórcio entre a Saneago (Goiás) e a Caesb (DF). (Fonte: Governo de Goiás, 6/4/2022)",
     "Custo · Foram investidos cerca de R$ 440 milhões; Goiás destinou R$ 220 milhões e o DF repassou a outra metade. (Fonte: Governo de Goiás, 2022)",
     "Entrega · Inaugurado em 6/4/2022, com capacidade de 2,8 mil L/s, para cerca de 1,3 milhão de pessoas em Luziânia, Valparaíso, Cidade Ocidental, Novo Gama e Região Sul do DF. (Fonte: Governo de Goiás, 2022)",
     "Gestão consorciada · O Sistema Produtor Corumbá é fruto de consórcio entre a Saneago (Goiás) e a Caesb (DF), e não de iniciativa unilateral da Caesb. (Fonte: Governo de Goiás, 6/4/2022)",
     "Divisão de recursos · O custo de cerca de R$ 440 milhões foi dividido meio a meio: R$ 220 milhões de Goiás e a outra metade do DF. (Fonte: Governo de Goiás, 2022)"
    ],
    "peg": "Afirmar que Corumbá IV abastece o DF desde 2006, que foi projetado para irrigação de lavouras ou que ameniza a secura do Entorno é ERRADO: o abastecimento começou em 2022; destina-se a energia, água potável, turismo e preservação.",
    "chaves": [
     "Corumb(á|a) IV",
     "Corumb(á|a)",
     "Saneago",
     "2006",
     "irriga(ç|c)(ã|a)o de (grandes )?lavouras",
     "esportes n(á|a)uticos",
     "lago de Corumb(á|a)",
     "ameniza os efeitos da secura",
     "irriga(ç|c)(ã|a)o de grandes lavouras",
     "desde 2006",
     "Sistema Produtor Corumb(á|a)",
     "cons(ó|o)rcio",
     "cooperação t(é|e)cnica e financeira",
     "unilateral",
     "limita(ç|c)(õ|o)es or(ç|c)ament(á|a)rias",
     "impedimentos jur(í|i)dicos",
     "CAESB|Caesb",
     "Corumb(á|a)\\s+IV",
     "esportes\\s+n(á|a)uticos",
     "(á|a)gua\\s+pot(á|a)vel",
     "CAESB"
    ]
   },
   {
    "titulo": "Sistema Descoberto: principal reservatório do DF",
    "lei": [
     "Descoberto · Barragem em Brazlândia (limite com Águas Lindas/GO); principal reservatório de água do DF, gerenciado pela Caesb.",
     "Abastecimento · Mais de 60% da população do DF (Brazlândia, Ceilândia, Taguatinga, Samambaia, Recanto das Emas, Riacho Fundo etc.).",
     "Pressão antrópica · A bacia do Rio Descoberto sofre maior pressão decorrente da expansão urbana e do adensamento populacional.",
     "ETA Rio Descoberto · Responde por 50% da água produzida e atende quase 60% da população, em 15 RAs: Ceilândia, Taguatinga, Vicente Pires, Águas Claras, Samambaia, Riacho Fundo I e II, Recanto das Emas, Gama, Santa Maria, Núcleo Bandeirante, Park Way, Candangolândia, Sol Nascente/Pôr do Sol e Arniqueira. (Fonte: Caesb, via Jornal de Brasília, 2023)",
     "Fora do Descoberto · Plano Piloto e Lagos Sul e Norte não são abastecidos pelo Descoberto; as RAs do sistema Santa Maria/Torto têm outra origem. (Fonte: Caesb, via Correio Braziliense, jan/2017)"
    ],
    "peg": "Afirmar que o Descoberto abastece 100% do DF é ERRADO: abastece cerca de 60%; o restante vem de Santa Maria, Corumbá IV e captações diretas de córregos.",
    "chaves": [
     "Descoberto",
     "Lago Descoberto",
     "principais reservat(ó|o)rios",
     "regi(ã|a)o central",
     "Sistema Descoberto",
     "principais mananciais",
     "principais\\s+mananciais",
     "abastecimento"
    ]
   },
   {
    "titulo": "Santa Maria / Torto e o Parque Nacional de Brasília",
    "lei": [
     "Santa Maria / Torto · Reservatório no Parque Nacional de Brasília (Água Mineral); 2º maior reservatório do DF, localizado em Unidade de Proteção Integral.",
     "Áreas atendidas · Plano Piloto, Cruzeiro, Lago Norte e Lago Sul.",
     "Parque Nacional · Proteção integral gerida pelo ICMBio; abriga o reservatório de Santa Maria.",
     "CEBRASPE 2021 (Certo) · O lago artificial de Santa Maria abastece parte do DF, juntamente com outros sistemas, como o reservatório do Descoberto.",
     "Nascentes protegidas · As nascentes do reservatório Santa Maria e Torto estão protegidas no interior do parque, de importância estratégica para a captação e o abastecimento público. (Fonte: ICMBio, Plano de Manejo do Parna de Brasília)",
     "Ameaças · O plano de manejo aponta a ocupação desordenada do ENTORNO (poços, impermeabilização, urbanização), além de fogo, espécies exóticas, pastoreio e invasões na área ampliada. (Fonte: ICMBio, Plano de Manejo)",
     "Categoria · O Parque Nacional é unidade federal de proteção integral, gerida pelo ICMBio; não comporta moradia em seu interior. (Fonte: apostila e ICMBio)"
    ],
    "peg": "Afirmar que Santa Maria abastece Planaltina e Sobradinho, ou que é abastecido pelo Descoberto, é ERRADO.",
    "chaves": [
     "Santa Maria",
     "Parque Nacional de Bras(í|i)lia",
     "Torto",
     "unidade de conserva(ç|c)(ã|a)o de prote(ç|c)(ã|a)o integral",
     "ocupa(ç|c)(ã|a)o urbana desordenada",
     "de seu interior",
     "prote(ç|c)(ã|a)o integral",
     "Parque\\s+Nacional\\s+de\\s+Bras(í|i)lia",
     "prote(ç|c)(ã|a)o\\s+integral",
     "Santa\\s+Maria"
    ]
   },
   {
    "titulo": "Lagoa Bonita × principal reservatório de água do DF",
    "lei": [
     "Lagoa Bonita · Protegida pela Estação Ecológica de Águas Emendadas (Planaltina), Unidade de Proteção Integral.",
     "Principal reservatório · O principal reservatório de água do DF é o Descoberto (mais de 60% da população); Santa Maria/Torto é o 2º maior.",
     "Visitação · É vedada a visitação pública turística à Estação Ecológica."
    ],
    "peg": "Afirmar que a Lagoa Bonita é o principal reservatório de água doce do DF é ERRADO.",
    "chaves": [
     "Lagoa Bonita",
     "principal reservat(ó|o)rio de (á|a)gua doce",
     "Águas Emendadas"
    ]
   },
   {
    "titulo": "Planaltina e Sobradinho: sem reservatórios e crise hídrica",
    "lei": [
     "Planaltina e Sobradinho · NÃO possuem grandes reservatórios/barragens; dependem da captação direta e do tratamento da água de córregos e rios locais (como o Rio Pipiripau e o Córrego Quinze).",
     "Outras RAs · O mesmo ocorre em São Sebastião e Jardim Botânico.",
     "Crise hídrica de 2017 (FCC) · Planaltina e Sobradinho sofreram interrupção por não disporem de reservatórios, dependendo exclusivamente dos córregos.",
     "Após a crise · O Lago Paranoá passou a atender o abastecimento suplementar (Sistema Bananal/Paranoá)."
    ],
    "peg": "Sustentar que Planaltina e Sobradinho são abastecidas pelo Descoberto ou por Santa Maria é ERRADO. Dizer que o DF nunca enfrentou crise hídrica contraria a crise de 2017.",
    "chaves": [
     "crise h(í|i)drica",
     "Planaltina e Sobradinho",
     "nunca enfrentou",
     "abund(â|a)ncia de recursos h(í|i)dricos"
    ]
   },
   {
    "titulo": "CAESB, esgotamento sanitário e efluentes",
    "lei": [
     "CAESB · O Lago Paranoá recebe efluentes tratados da CAESB (diluição de efluentes); o reservatório do Descoberto é gerenciado pela Caesb.",
     "Funções do lago · Lazer e turismo, paisagística, geração de energia, diluição de efluentes e abastecimento suplementar.",
     "Limite da apostila · Não traz índices de atendimento de água e esgoto, a atribuição legal da CAESB nem a cobertura da rede de esgotamento.",
     "Atendimento 2024 (Caesb) · 99% da população com água e 94,07% com coleta de esgoto, sendo que 100% do esgoto coletado é tratado. (Fonte: Caesb, Relatório de Gestão 2024)",
     "PDAD 2023-24 (IPEDF) · atendimento por rede de 99% em água e 95% em esgoto nos domicílios; pesquisa com 24.845 domicílios, coleta de 1/11/2023 a 4/10/2024. (Fonte: IPEDF/PDAD, divulgada em 2025)",
     "Ranking Trata Brasil 2023 · o DF tem a maior taxa de esgoto tratado entre as UFs (único acima de 80%): atendimento de esgoto de 91,77% e tratamento de 86,65%; água para 99%. (Fonte: Instituto Trata Brasil, 2023)",
     "Natureza · A Caesb é sociedade de economia mista controlada pelo GDF, constituída em 8/4/1969, com objeto social que inclui abastecimento de água e esgotamento sanitário. (Fonte: Caesb, Relatório do 1º tri de 2026)",
     "Prestação direta · A Lei distrital 7.629, de 20/12/2024, estabeleceu a prestação direta do saneamento básico, de titularidade do DF, pela Caesb, em substituição à concessão de 2006 (Adasa regula). (Fonte: Caesb, 2026)",
     "Resultado 2024 · Manteve 99% da população atendida com água e 94,07% com coleta de esgoto, com 100% do coletado tratado. (Fonte: Caesb, Relatório de Gestão 2024)"
    ],
    "peg": "A apostila não traz percentuais de cobertura de água e esgoto; a questão exige conhecimento complementar.",
    "chaves": [
     "CAESB|Caesb|Companhia de Saneamento",
     "esgot",
     "efluentes",
     "tratada",
     "coleta",
     "sanit(á|a)rio",
     "esgotamento sanit(á|a)rio",
     "rede de esgoto",
     "(á|a)gua (tratada|pot(á|a)vel|encanada)",
     "CAESB|Caesb",
     "acima dos? 90%",
     "entre os melhores",
     "respons(á|a)vel pelo abastecimento",
     "companhia respons(á|a)vel",
     "esgotamento\\s+sanit(á|a)rio",
     "rede\\s+de\\s+esgotamento",
     "CAESB",
     "(á|a)gua\\s+pot(á|a)vel",
     "abastecimento"
    ]
   }
  ]
 },
 "meio-ambiente": {
  "titulo": "Meio ambiente, Cerrado e unidades de conservação",
  "fontes": [
   [
    "Apostila Conhecimentos do DF e RIDE (Drive do usuário)",
    ""
   ],
   [
    "Embrapa Cerrados, Boletim P&D 224 (2008)",
    "https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/572010/1/bolpd224.pdf"
   ],
   [
    "((o))eco, Cerrado na berlinda",
    "https://www.oeco.org.br/wp-content/uploads/wp-post-to-pdf-enhanced-cache/1/1874-oeco_20969.pdf"
   ],
   [
    "Adasa, PGIRH/DF Subproduto 1.B Tomo I (2024)",
    "https://www.adasa.df.gov.br/images/storage/consultas_publicas/CP-001-2024/ADASA_DF_PGIRH_Subproduto_1B_R01_TomoI.pdf"
   ],
   [
    "Decreto do Conselho de Ministros nº 241/1961 (Câmara)",
    "https://www2.camara.leg.br/legin/fed/decmin/1960-1969/decretodoconselhodeministros-241-29-novembro-1961-356061-publicacaooriginal-1-pe.html"
   ],
   [
    "Lei 9.985/2000 (Câmara)",
    "https://www2.camara.leg.br/legin/fed/lei/2000/lei-9985-18-julho-2000-359708-normaatualizada-pl.html"
   ],
   [
    "MMA/Comitê RBC, Relatório de revisão da Reserva da Biosfera do Cerrado",
    "https://reservasdabiosfera.org.br/wp-content/uploads/2021/11/Relatorio-RBC_completo_12.07.pdf"
   ]
  ],
  "secs": [
   {
    "titulo": "Bioma Cerrado: 100% do território do DF",
    "lei": [
     "Abrangência · O bioma Cerrado recobre a TOTALIDADE (100%) do Distrito Federal; não há fragmentos de outros biomas (como Mata Atlântica ou Caatinga) nos limites do DF.",
     "Importância · É o segundo maior bioma brasileiro, reconhecido como a \"caixa d’água do Brasil\" ou \"berço das águas\".",
     "Formações · Árvores tortuosas, casca espessa e raízes profundas (Cerrado stricto sensu)."
    ],
    "peg": "Afirmar que o DF possui trechos de Mata Atlântica ou fragmentos de outros biomas é ERRADO: o bioma do DF é 100% Cerrado.",
    "chaves": [
     "bioma",
     "segundo maior",
     "Mata Atl(â|a)ntica",
     "ra(í|i)zes adaptadas"
    ]
   },
   {
    "titulo": "Fitofisionomias do Cerrado",
    "lei": [
     "Campo Limpo · Apenas gramíneas, sem árvores e arbustos (menos de 5% do bioma).",
     "Campo Sujo · Gramíneas e arbustos esparsos.",
     "Cerrado stricto sensu · Savana típica, árvores tortuosas, casca espessa e raízes profundas. Cerrado Rupestre: afloramentos rochosos; Cerradão: florestal.",
     "Mata Ciliar/Galeria · Acompanha os rios. Veredas: presença marcante do Buriti.",
     "Limite da apostila · Não traz as subdivisões Cerrado Denso, Típico e Ralo nem dados de desmatamento.",
     "Classificação · Segundo Ribeiro e Walter (1998), as formações savânicas do Cerrado incluem Cerrado Denso, Típico, Ralo, Rupestre, Parque de Cerrado, Palmeiral e Vereda. (Fonte: Embrapa Cerrados, 2008)",
     "Bioma · O Cerrado ocupa cerca de 2 milhões de km² (23% do território) e é o segundo maior bioma brasileiro em área. (Fonte: Embrapa Cerrados, 2008)"
    ],
    "peg": "Veredas têm presença obrigatória e marcante do Buriti; Campo Limpo não tem árvores nem arbustos.",
    "chaves": [
     "fitofision",
     "Cerrado (Denso|T(í|i)pico|Ralo|Rupestre)",
     "Cerrado Denso",
     "Cerrado Ralo",
     "campo (sujo|limpo|rupestre)",
     "Cerrad(ã|a)o",
     "Buriti",
     "Veredas",
     "forma(ç|c)(õ|o)es sav(â|a)nicas",
     "dossel",
     "desmatada|cobertura vegetal",
     "segundo maior bioma",
     "Cerrado",
     "segundo\\s+maior\\s+bioma",
     "Cerrado\\s+Rupestre"
    ]
   },
   {
    "titulo": "APA do Planalto Central e categorias de unidades de conservação",
    "lei": [
     "APA do Planalto Central · O território do DF, exceto suas áreas urbanas, está inserido na grande Área de Proteção Ambiental (APA) do Planalto Central (criada em janeiro de 2002).",
     "Proteção Integral · Estação Ecológica de Águas Emendadas (vedada a visitação turística) e Parque Nacional de Brasília (gerido pelo ICMBio).",
     "APA do Descoberto · A RA Água Quente está localizada na APA do Descoberto.",
     "Limite da apostila · Não detalha o regime de uso sustentável das APAs nem as atividades admitidas.",
     "Regime da APA · A APA é área em geral extensa, com certo grau de ocupação humana, de terras públicas ou privadas, e visa disciplinar a ocupação e garantir a sustentabilidade do uso dos recursos naturais. (Fonte: Lei 9.985/2000, art. 15)",
     "Dois grupos · Proteção Integral admite só uso indireto dos recursos naturais; Uso Sustentável compatibiliza conservação com uso de parcela dos recursos. (Fonte: Lei 9.985/2000, art. 7)"
    ],
    "peg": "Afirmar que todas as unidades de conservação do DF são de proteção integral e vedam qualquer atividade humana é ERRADO: há a APA do Planalto Central, que abrange o DF exceto as áreas urbanas.",
    "chaves": [
     "APA",
     "(Á|A)rea(s)? de Prote(ç|c)(ã|a)o Ambiental",
     "prote(ç|c)(ã|a)o integral",
     "Todas as unidades de conserva",
     "uso sustent",
     "atividades econ(ô|o)micas compat",
     "APAs?\\b",
     "(Á|A)reas? de Prote(ç|c)(ã|a)o Ambiental",
     "atividades\\s+econ(ô|o)micas",
     "prote(ç|c)(ã|a)o\\s+integral"
    ]
   },
   {
    "titulo": "Parque Nacional de Brasília (Água Mineral)",
    "lei": [
     "Parque Nacional de Brasília · Proteção integral gerida pelo ICMBio; conhecido como \"Água Mineral\".",
     "Uso · Permite uso recreativo em áreas específicas (aberto ao público).",
     "Reservatório · Abriga a Barragem de Santa Maria (2º maior reservatório do DF).",
     "CEBRASPE 2021 (Certo) · É unidade de conservação que abriga o lago artificial de Santa Maria, o qual abastece parte do DF.",
     "Criação · O Decreto 241, de 29/11/1961, criou o Parque Nacional de Brasília (cerca de 30.000 ha), considerando as florestas protetoras de mananciais e dos rios que abastecem a capital. (Fonte: Câmara dos Deputados, Legislação Informatizada, 1961)",
     "Categoria · A Lei 9.985/2000 lista o Parque Nacional entre as unidades de proteção integral, voltadas a ecossistemas de grande relevância ecológica, com visitação sujeita ao plano de manejo. (Fonte: Lei 9.985/2000, art. 8 e 11)",
     "Vegetação · O Boletim da Embrapa mapeou no parque onze fitofisionomias do Cerrado. (Fonte: Embrapa Cerrados, 2008)"
    ],
    "peg": "O Parque Nacional de Brasília é aberto ao público; a Estação Ecológica de Águas Emendadas é que tem a visitação turística proibida.",
    "chaves": [
     "Parque Nacional",
     "Água Mineral",
     "nascentes e a vegeta",
     "Parque Nacional de Bras(í|i)lia",
     "proteger nascentes",
     "Parque\\s+Nacional",
     "conserva(ç|c)(ã|a)o",
     "Cerrado"
    ]
   },
   {
    "titulo": "Ameaças às unidades de conservação e pressão sobre o Cerrado",
    "lei": [
     "Fogo e expansão urbana · IADES 2024: o fogo em período de seca e a expansão urbana são as principais ameaças às UC no DF, importantes para a preservação do bioma Cerrado (gabarito a).",
     "Estiagem · No inverno (maio a setembro) há estiagem severa, com umidade abaixo de 10-15%.",
     "Zona rural · Cerca de 70% do território do DF é constituído por áreas rurais, que atuam na contenção da expansão urbana desordenada e na proteção de nascentes.",
     "Limite da apostila · Não traz a Reserva da Biosfera do Cerrado reconhecida pela UNESCO nem dados de cobertura vegetal remanescente.",
     "Classificação · Na tipologia de Ribeiro e Walter (1998), as formações campestres são Campo Rupestre, Campo Sujo e Campo Limpo; as florestais são Mata de Galeria, Mata Ciliar, Mata Seca e Cerradão. (Fonte: Embrapa Cerrados, 2008)",
     "Remanescente no DF · Mapeamento da Embrapa (imagens Landsat de 2002) apontou o DF como a unidade da federação com maior proporção de vegetação nativa, 51%. (Fonte: ((o))eco, reportagem sobre o mapeamento)",
     "Código Florestal · O PGIRH/DF aponta que o Código Florestal protege só 20% do Cerrado em áreas particulares, o que favorece a troca da vegetação nativa por lavouras e pastagens. (Fonte: Adasa, 2024)"
    ],
    "peg": "Em Águas Emendadas não há uso turístico; a APA do Planalto Central não equivale a proteção integral.",
    "chaves": [
     "amea(ç|c)as",
     "fogo",
     "expans(ã|a)o urbana",
     "zonas? de amortecimento",
     "Reserva da Biosfera",
     "sustentabilidade",
     "impulsionadores",
     "sustentabilidade do bioma",
     "vegeta(ç|c)(ã|a)o nativa",
     "campo (sujo|limpo|rupestre)",
     "mata(s)? ciliar",
     "mais\\s+da\\s+metade",
     "cobertura\\s+vegetal",
     "agropecu(á|a)ria"
    ]
   },
   {
    "titulo": "Reserva da Biosfera do Cerrado no DF",
    "lei": [
     "RBC-DF · As zonas-núcleo da Reserva da Biosfera do Cerrado no DF foram definidas em 1994 e submetidas ao Programa MAB/UNESCO; a RBC-DF ocupa 49.882,38 ha. (Fonte: MMA/Comitê RBC, relatório de revisão)",
     "Parque Nacional · O Parque Nacional de Brasília foi originalmente uma das zonas-núcleo da RBC. (Fonte: MMA/Comitê RBC, relatório de revisão)"
    ],
    "peg": "",
    "chaves": [
     "Reserva da Biosfera",
     "UNESCO",
     "reconhecida internacionalmente",
     "Reserva\\s+da\\s+Biosfera",
     "Cerrado"
    ]
   }
  ]
 },
 "demografia": {
  "titulo": "Demografia do DF: população, densidade e indicadores sociais",
  "fontes": [
   [
    "Apostila Conhecimentos do DF e RIDE (Drive do usuário)",
    ""
   ],
   [
    "CNN Brasil, Anuário 2026",
    "https://www.cnnbrasil.com.br/nacional/brasil/mortes-violentas-caem-82-no-brasil-em-2025-sete-estados-registram-alta/"
   ],
   [
    "Jornal de Brasília, Anuário 2026 no DF",
    "https://jornaldebrasilia.com.br/brasilia/df-e-a-terceira-unidade-da-federacao-menos-violenta-mas-feminicidios-ainda-preocupam/"
   ],
   [
    "ObservaDF/UnB, Cenários Populacionais para o DF (2025)",
    "https://observadf.unb.br/wp-content/uploads/2025/07/ObservaDF-PESQ-julho-2025-.pdf"
   ],
   [
    "IPEA BRUA 31 (IPEDF Codeplan)",
    "https://repositorio.ipea.gov.br/bitstream/11058/13915/1/BRUA_31_Artigo_4_Um_Olhar_para_a_periferia.pdf"
   ],
   [
    "IBGE SIDRA tab. 6579 (estimativas)",
    "https://apisidra.ibge.gov.br/values/t/6579/n3/53/v/9324/p/2018,2019,2020,2021,2024,2025"
   ],
   [
    "IBGE SIDRA tab. 4709, DF",
    "https://apisidra.ibge.gov.br/values/t/4709/n3/53/v/all/p/2010,2022"
   ],
   [
    "Correio Braziliense, Censo 2022 (2.817.068)",
    "https://www.correiobraziliense.com.br/webstories/flipar/2023/10/5137445-censo-2022-veja-dados-sobre-a-populacao-do-brasil.html"
   ],
   [
    "IBGE SIDRA tab. 9605 (cor ou raça, 2022)",
    "https://apisidra.ibge.gov.br/values/t/9605/n3/53/v/93/p/2022/c86/all"
   ],
   [
    "IBGE SIDRA tab. 3175 (cor ou raça, 2010)",
    "https://apisidra.ibge.gov.br/values/t/3175/n3/53/v/93/p/2010/c86/all"
   ],
   [
    "IBGE SIDRA tab. 9578 (quilombolas, 2022)",
    "https://apisidra.ibge.gov.br/values/t/9578/n3/53/v/all/p/2022"
   ],
   [
    "CNN Brasil, Censo 2022: Fecundidade e Migração",
    "https://www.cnnbrasil.com.br/saude/brasileiras-estao-adiando-cada-vez-mais-a-maternidade-revela-censo-do-ibge/"
   ],
   [
    "IPEDF PDAD-A 2024, Ceilândia",
    "https://pdad.ipe.df.gov.br/files/reports/9_-_CEIL%C3%82NDIA.pdf"
   ],
   [
    "IPEDF PDAD-A 2024, Samambaia",
    "https://pdad.ipe.df.gov.br/files/reports/12_-_SAMAMBAIA.pdf"
   ],
   [
    "IPEDF PDAD-A 2024, Plano Piloto",
    "https://pdad.ipe.df.gov.br/files/reports/1_-_PLANO_PILOTO.pdf"
   ],
   [
    "IPEDF PDAD-A 2024, Taguatinga",
    "https://pdad.ipe.df.gov.br/files/reports/3_-_TAGUATINGA.pdf"
   ],
   [
    "IBGE SIDRA tab. 7435 (Gini)",
    "https://apisidra.ibge.gov.br/values/t/7435/n3/all/v/10681/p/2023,2024"
   ],
   [
    "IBGE SIDRA tab. 202 (urbana/rural 2010)",
    "https://apisidra.ibge.gov.br/values/t/202/n3/53/v/93/p/2010/c1/all"
   ],
   [
    "IPEDF, PDAD-A 2024 (relatório DF)",
    "https://pdad.ipe.df.gov.br/files/reports/Relatorio_DF090725.pdf"
   ],
   [
    "Correio Braziliense (PDAD 2024)",
    "https://www.correiobraziliense.com.br/cidades-df/2025/02/7066990-pesquisa-mostra-que-maioria-da-populacao-do-df-nasceu-na-capital.html"
   ]
  ],
  "secs": [
   {
    "titulo": "População do DF: tamanho, ranking e crescimento",
    "lei": [
     "População · Estimada em aproximadamente 2,9 milhões a 3 milhões de habitantes (a apostila não traz o número exato do Censo 2022).",
     "Ranking · O DF é a 3ª cidade/município mais populoso do Brasil (atrás de São Paulo e Rio de Janeiro); como UF ocupa a 20ª posição entre as 27.",
     "Crescimento · O crescimento anual caiu de 2,28% ao ano (2000-2010) para 0,76% ao ano (2010-2022).",
     "Sexo · 52% de mulheres e 48% de homens; a maioria na faixa adulta (concentrando-se na faixa dos 40 anos).",
     "Censo 2022 · O DF teve 2.817.381 habitantes pela tabela atual do IBGE; a divulgação inicial e a imprensa trouxeram 2.817.068 para Brasília, a 3ª cidade mais populosa do país (Fonte: IBGE, SIDRA tab. 4709; Correio Braziliense, 2023).",
     "Projeções anteriores · A estimativa do IBGE para o DF era de 3.055.149 em 2020 e 3.094.325 em 2021; o Censo 2022 ficou cerca de 9% abaixo da estimativa de 2021 (Fonte: IBGE, Estimativas da População, SIDRA tab. 6579).",
     "Leitura demográfica · A taxa de crescimento caiu para 0,76% ao ano em 2010-2022; a queda da fecundidade e um saldo migratório negativo de 2017-2022 explicam a desaceleração (Fonte: IBGE, Censo 2022; ObservaDF/UnB, 2025)."
    ],
    "peg": "Afirmar que o DF é a 3ª maior UF em população é ERRADO: é o 3º município mais populoso, mas a 20ª UF.",
    "chaves": [
     "2\\.817\\.068",
     "Censo Demogr(á|a)fico de 2022",
     "Censo 2022",
     "tr(ê|e)s munic(í|i)pios mais populosos",
     "crescimento negativo",
     "proje(ç|c)(õ|o)es anteriores",
     "transi(ç|c)(ã|a)o demogr(á|a)fica",
     "abaixo das proje(ç|c)(õ|o)es",
     "n(ú|u)mero de habitantes de Bras(í|i)lia",
     "proje(ç|c)(õ|o)es\\s+anteriores",
     "transi(ç|c)(ã|a)o\\s+demogr(á|a)fica",
     "Censo\\s+Demogr(á|a)fico\\s+de\\s+2022"
    ]
   },
   {
    "titulo": "Densidade demográfica: maior entre as UFs",
    "lei": [
     "Densidade · Superior a 500 a 600 hab./km², a maior densidade populacional entre todas as UFs brasileiras.",
     "Posição · O DF não tem a segunda nem a terceira maior densidade: tem a MAIOR.",
     "Contexto · O DF tem aproximadamente 2,9 a 3 milhões de habitantes e ocupa a 20ª posição populacional entre as 27 UFs."
    ],
    "peg": "Não trocar a posição: o DF tem a maior densidade demográfica entre as UFs.",
    "chaves": [
     "densidade"
    ]
   },
   {
    "titulo": "Envelhecimento e fecundidade",
    "lei": [
     "Índice de envelhecimento · Subiu de 21 idosos (65+) para cada 100 jovens (menores de 15) em 2010 para 46,5 idosos em 2022.",
     "Fecundidade · A queda da taxa de fecundidade decorre principalmente da maior inserção da mulher no mercado de trabalho e da priorização da carreira profissional.",
     "Crescimento · Desaceleração de 2,28% a.a. (2000-2010) para 0,76% a.a. (2010-2022).",
     "Perfil · A população mais idosa (50+ e 60+) tem proporção ainda maior de mulheres.",
     "Brasil · A taxa de fecundidade total caiu de 1,90 filho por mulher em 2010 para 1,55 em 2022, tendência ligada a mais escolaridade e a maior participação das mulheres no mercado de trabalho (Fonte: IBGE, Censo 2022: Fecundidade e Migração, 2025, via CNN Brasil).",
     "DF · O DF tem a maior idade média de fecundidade do país (29,3 anos) e fecundidade estimada em cerca de 1,5 filho por mulher, entre as menores das UFs, com queda forte em todo o DF desde os anos 2000 (Fonte: IBGE, 2025; ObservaDF/UnB, 2025).",
     "Dentro do DF · As maiores taxas de fecundidade estão nas RAs de menor renda, mas mesmo nelas a tendência é decrescente (Fonte: ObservaDF/UnB, 2025)."
    ],
    "peg": "Afirmar redução do ritmo de envelhecimento ou aumento da presença de crianças pela queda da fecundidade é ERRADO: o envelhecimento avança.",
    "chaves": [
     "envelhecimento",
     "fecundidade",
     "crian(ç|c)as e adolescentes",
     "idosa",
     "taxa de fecundidade",
     "tend(ê|e)ncia contr(á|a)ria",
     "baixas taxas de escolaridade",
     "elevado contingente",
     "taxa\\s+de\\s+fecundidade",
     "mercado\\s+de\\s+trabalho",
     "RIDE-DF"
    ]
   },
   {
    "titulo": "Composição étnico-racial e indígenas",
    "lei": [
     "População negra · A população autodeclarada negra (preta ou parda) é demograficamente majoritária: entre 57,3% e 57,9% do total (46,2% pardos e 11,1% pretos).",
     "Mulheres negras · Constituem o maior grupo individual (28,7%).",
     "Lago Sul · Apresenta o menor percentual de moradores negros.",
     "Limite da apostila · Não traz dados sobre população indígena ou quilombola no DF.",
     "Indígenas · O Censo 2022 contou 5.536 pessoas de cor ou raça indígena no DF (cerca de 0,2% dos 2.817.381 habitantes); em 2010 eram 6.128 (Fonte: IBGE, Censo 2022 e Censo 2010, SIDRA tabs. 9605 e 3175).",
     "Quilombolas · O Censo 2022 registrou 305 pessoas quilombolas no DF (Fonte: IBGE, Censo 2022, SIDRA tab. 9578).",
     "Critério · O Censo capta a pessoa que se declara indígena onde quer que more; não depende de haver terra indígena demarcada no território (Fonte: IBGE, metodologia do Censo, cor ou raça por autodeclaração).",
     "Censo 2022 · Foram contadas 5.536 pessoas de cor ou raça indígena no DF (Fonte: IBGE, Censo 2022, SIDRA tab. 9605).",
     "Censo 2010 · Eram 6.128 indígenas no DF (Fonte: IBGE, Censo 2010, SIDRA tab. 3175).",
     "Quilombolas · O Censo 2022 registrou 305 quilombolas no DF (Fonte: IBGE, Censo 2022, SIDRA tab. 9578)."
    ],
    "peg": "Afirmar que a população branca é majoritária no DF é ERRADO: pretos + pardos somam mais de 57%.",
    "chaves": [
     "ind(í|i)gena",
     "quilombola",
     "pardos? e pretos?|pretos? e pardos?",
     "ra(ç|c)a/cor",
     "terra ind(í|i)gena",
     "n(ã|a)o registrou",
     "autodeclarada ind(í|i)gena",
     "censos oficiais do IBGE",
     "etnias ind(í|i)genas",
     "Censo",
     "autodeclarada"
    ]
   },
   {
    "titulo": "Ceilândia e as RAs mais e menos populosas",
    "lei": [
     "Mais populosas · Ceilândia (mais de 380 mil habitantes), Samambaia, Plano Piloto, Taguatinga e Planaltina.",
     "Menos populosas · SIA, Varjão, Fercal, Candangolândia e Lago Sul.",
     "Ceilândia · RA mais populosa; economia própria vigorosa (comércio e informalidade), não é mera \"cidade-dormitório\". Criada em 1971.",
     "Limite da apostila · Não traz taxa de urbanização do DF.",
     "RAs mais populosas · Na PDAD-A 2024 do IPEDF a população urbana é de 287.113 em Ceilândia, 227.118 em Samambaia, 207.996 no Plano Piloto e 201.332 em Taguatinga; Ceilândia segue a maior (Fonte: IPEDF Codeplan, PDAD-A 2024, relatórios por RA).",
     "Gini · O índice de Gini do rendimento domiciliar per capita do DF foi 0,547 em 2024, o mais alto entre as UFs, e 0,542 em 2023, o 3º mais alto (Fonte: IBGE, PNAD Contínua, SIDRA tab. 7435).",
     "Urbanização · O Censo 2010 contou 2.482.210 pessoas em área urbana e 87.950 na rural (cerca de 96,6% urbana) (Fonte: IBGE, Censo 2010, SIDRA tab. 202).",
     "Pirâmide · A base da pirâmide etária do DF encolheu muito, por queda da fecundidade (cerca de 1,5 filho por mulher em 2022) (Fonte: ObservaDF/UnB, 2025)."
    ],
    "peg": "Afirmar que o Plano Piloto é a RA mais populosa, ou que concentra a maior parte da população, é ERRADO: a mais populosa é Ceilândia.",
    "chaves": [
     "Ceil(â|a)ndia",
     "Plano Piloto",
     "mais populosa",
     "taxa de urbaniza(ç|c)(ã|a)o",
     "Coeficiente de Gini",
     "pir(â|a)mide",
     "Ceilândia",
     "Região Administrativa",
     "pir(â|a)mide demogr(á|a)fica",
     "Entorno da RIDE",
     "Regi(ã|a)o\\s+Administrativa",
     "popula(ç|c)(ã|a)o"
    ]
   },
   {
    "titulo": "IDH, expectativa de vida e desigualdade",
    "lei": [
     "Indicadores · O DF detém a maior expectativa de vida do país e o melhor Índice de Desenvolvimento Humano (IDH) entre as 27 UFs.",
     "Gini · Maior PIB per capita do país (mais do que o dobro da média nacional), mas um dos maiores Índices de Gini, o que revela altíssima concentração de renda e desigualdade socioespacial.",
     "Contraste interno · Lago Sul tem a maior renda per capita (superior a R$ 23 mil mensais) e SCIA/Estrutural, a menor."
    ],
    "peg": "Afirmar que o DF tem o menor Índice de Gini por ter alta renda é ERRADO.",
    "chaves": [
     "desenvolvimento humano",
     "IDH",
     "expectativa de vida"
    ]
   },
   {
    "titulo": "Migração, candangos e origem da população",
    "lei": [
     "Origem dos operários · O estado que MAIS enviou operários foi Minas Gerais, seguido por Goiás e Bahia; a região que MAIS enviou foi o Nordeste.",
     "CEBRASPE 2021 (Certo) · A presença de operários de diversos pontos do país, a exemplo de mineiros e nordestinos, contribuiu para a diversificada composição da população.",
     "Entorno · Entre 2010 e 2022, a maioria dos municípios do entorno do DF cresceu em ritmo superior ao do DF (QUADRIX 2025, Certo).",
     "Limite da apostila · Não traz o saldo migratório entre o DF e os municípios goianos nem o percentual de nascidos em outras UFs.",
     "Saldo migratório · Entre 2017 e 2022 o DF teve saldo migratório negativo de cerca de 91 mil pessoas (mais saíram do que chegaram), pela primeira vez na série, segundo os dados de migração do Censo 2022 (Fonte: ObservaDF/UnB, relatório de julho de 2025).",
     "Destino principal · O maior fluxo de saída do DF vai para os municípios da Periferia Metropolitana de Brasília, explicado por diferenças de custo de vida e por políticas como o Minha Casa Minha Vida (Fonte: ObservaDF/UnB, 2025).",
     "Custo da moradia · Diante do alto valor do solo urbano e do alto custo de vida no DF, parte da população migrou para o Entorno, onde havia imóveis mais acessíveis, mantendo o vínculo de trabalho com Brasília (Fonte: IPEDF Codeplan/IPEA, BRUA nº 31, 2024).",
     "Naturalidade · Na PDAD-A 2024 (IPEDF), 57,4% dos moradores do DF declararam ter nascido no próprio DF; a maioria, portanto, é natural do DF (Fonte: IPEDF, PDAD-A 2024, relatório do DF).",
     "Origem dos migrantes · Entre os que vieram de outras UFs, o Nordeste responde por 54,9% e o Sudeste por 21,7% (Fonte: Correio Braziliense sobre a PDAD 2024)."
    ],
    "peg": "Confundir a hegemonia estadual (Minas Gerais) com a regional (Nordeste). Afirmar que a influência mineira e nordestina é pouco significativa é ERRADO.",
    "chaves": [
     "migra(ç|c)(ã|a)o",
     "migrat(ó|o)rio",
     "migrantes",
     "mineira e nordestina",
     "Sul e do Norte",
     "popula(ç|c)(ã|a)o heterog(ê|e)nea",
     "nordestinos",
     "saldo migrat(ó|o)rio",
     "custo-benef(í|i)cio",
     "munic(í|i)pios goianos vizinhos",
     "qualidade de vida",
     "Entorno como alternativa",
     "IPEDF",
     "nasceram em outras unidades da Federa(ç|c)(ã|a)o",
     "maioria da popula(ç|c)(ã|a)o do DF",
     "saldo\\s+migrat(ó|o)rio",
     "munic(í|i)pios\\s+goianos",
     "Entorno",
     "popula(ç|c)(ã|a)o\\s+do\\s+DF",
     "nasceram"
    ]
   },
   {
    "titulo": "Imigração japonesa e cinturão verde",
    "lei": [
     "Convite · As comunidades nipônicas foram convidadas por JK em 1957 para abastecer a capital em construção.",
     "Brazlândia · Maior comunidade nipônica do DF; maior produtora de morango, além de maracujá e hortifrutigranjeiros.",
     "Vargem Bonita (Park Way) · Segunda maior comunidade nipônica (60% das propriedades rurais); especializada em olericultura (alface, agrião e couve)."
    ],
    "peg": "Inversão clássica: Brazlândia = morango; Vargem Bonita = olericultura (hortaliças).",
    "chaves": [
     "japoneses",
     "imigrantes japoneses",
     "Vargem Bonita",
     "cintur(ã|a)o verde",
     "hortifrutigranjeiros"
    ]
   },
   {
    "titulo": "Segurança pública e violência letal",
    "lei": [
     "Forças de segurança · A PCDF, a PMDF e o CBMDF são organizados e mantidos pela União (art. 21, XIII e XIV da CF/88); lei federal disporá sobre a utilização pelo GDF (art. 32, § 4º).",
     "Judiciário e MP · O TJDFT e o MPDFT também são organizados e mantidos pela União.",
     "Limite da apostila · Não traz estatísticas de mortes violentas intencionais (MVIs) nem taxas de violência letal.",
     "Brasil · O 20º Anuário Brasileiro de Segurança Pública (dados de 2025, divulgado em 23/07/2026) registra 40.775 mortes violentas intencionais, queda de 8,2% sobre 2024, taxa de 19,1 por 100 mil e a menor desde 2012, início da série (Fonte: FBSP, Anuário 2026, via CNN Brasil, 2026).",
     "Distrito Federal · Em 2025 o DF teve 287 MVIs contra 270 em 2024 (+5,8%) e taxa de 9,6 por 100 mil, a terceira menor do país, atrás de Santa Catarina (7,6) e São Paulo (7,8); o DF está entre as sete UFs com alta (Fonte: FBSP, Anuário 2026, via Jornal de Brasília, 23/07/2026)."
    ],
    "peg": "A apostila não traz estatísticas de criminalidade.",
    "chaves": [
     "mortes violentas",
     "MVIs",
     "viol(ê|e)ncia letal",
     "seguran(ç|c)a p(ú|u)blica",
     "MVI",
     "menores taxas",
     "mortes\\s+violentas\\s+intencionais",
     "viol(ê|e)ncia\\s+letal"
    ]
   }
  ]
 },
 "socioeconomia": {
  "titulo": "Socioeconomia: renda, desigualdade e formação urbana",
  "fontes": [
   [
    "Apostila Conhecimentos do DF e RIDE (Drive do usuário)",
    ""
   ],
   [
    "Revista Antíteses (UEL), Brasília: empreendimento imobiliário de fins dos anos 1950 (2022)",
    "https://ojs.uel.br/revistas/uel/index.php/antiteses/article/view/44080"
   ],
   [
    "IPEDF, PDAD Candangolândia (2024)",
    "https://pdad.ipe.df.gov.br/files/reports/candangol%C3%A2ndia.pdf"
   ],
   [
    "Agência Brasil, Lago Paranoá (11/02/2020)",
    "https://agenciabrasil.ebc.com.br/radioagencia-nacional/cultura/audio/2020-02/brasilia-60-anos-lago-paranoa-hoje-do-surfe-pesca-tem"
   ],
   [
    "Codeplan, Estudo Urbano Ambiental do Paranoá",
    "https://www.codeplan.df.gov.br/wp-content/uploads/2018/02/Estudo-Urbano-Ambiental-Parano%C3%A1.pdf"
   ],
   [
    "Correio Braziliense, DF Legal (2025)",
    "https://www.correiobraziliense.com.br/cidades-df/2025/05/7130179-distrito-federal-registra-aumento-no-numero-de-derrubada-de-invasoes.html"
   ]
  ],
  "secs": [
   {
    "titulo": "PIB per capita elevado × desigualdade socioespacial",
    "lei": [
     "Paradoxo · O DF apresenta o maior PIB per capita do Brasil (mais do que o dobro da média nacional), porém convive com um dos maiores Índices de Gini do país: altíssima concentração de renda e desigualdade socioespacial.",
     "Lago Sul · Maior renda per capita (superior a R$ 23 mil mensais), maior escolaridade e menor percentual de moradores negros.",
     "SCIA / Estrutural · Menor renda per capita, seguida por Varjão, Sol Nascente, Itapoã e Fercal.",
     "Plano Piloto · A concentração de investimentos no Plano Piloto reforçou as desigualdades entre a RA I e as demais RAs."
    ],
    "peg": "Afirmar que o DF possui o menor Gini por ter alta renda é ERRADO. Dizer que as RAs centrais não têm renda superior às mais distantes também.",
    "chaves": [
     "desigualdades? socioecon(ô|o)micas",
     "RAs? centrais",
     "indicadores de renda",
     "mais distantes",
     "renda per capita"
    ]
   },
   {
    "titulo": "Jardins Mangueiral (PPP): Jardim Botânico, não São Sebastião",
    "lei": [
     "Empreendimento · Jardins Mangueiral: Parceria Público-Privada (PPP) de habitação popular.",
     "Localização · Situado na RA do Jardim Botânico (e NÃO em São Sebastião).",
     "CEBRASPE 2021 · Também é erro dizer que atende famílias de menor rendimento: a justificativa registra que atende famílias de renda média.",
     "Localização · Jardins Mangueiral é PPP de habitação situada na RA do Jardim Botânico, e não em São Sebastião. (Fonte: apostila)",
     "Justificativa Cebraspe 2021 · O empreendimento atende famílias de renda média, e não as de menor rendimento. (Fonte: apostila)"
    ],
    "peg": "Afirmar que Jardins Mangueiral fica em São Sebastião é ERRADO. Fica no Jardim Botânico.",
    "chaves": [
     "Mangueiral",
     "Jardins Mangueiral",
     "d(é|e)ficit habitacional",
     "\\bUPT\\b",
     "S(ã|a)o Sebasti(ã|a)o",
     "UPT Leste",
     "menor rendimento",
     "Jardins\\s+Mangueiral",
     "S(ã|a)o\\s+Sebasti(ã|a)o",
     "menor\\s+rendimento"
    ]
   },
   {
    "titulo": "Núcleos habitacionais pioneiros e Vila Planalto",
    "lei": [
     "Pioneiros · Cidade Livre (Núcleo Bandeirante), Sacolândia/Lonalândia (Candangolândia), Vila Planalto, Vila Telebrasília e Metropolitana surgiram espontaneamente (acampamentos não planejados).",
     "Taguatinga · 1ª RA planejada fora do Plano Piloto (5 de junho de 1958), criada pela Novacap.",
     "Ceilândia · Criada em 1971.",
     "Limite da apostila · Não traz a origem da Vila Paranoá, o destino da Vila Planalto após 1960 nem o papel do Núcleo Bandeirante como RA para embaixadas.",
     "Vila Paranoá · Em 1957 já existia a Vila Paranoá, acampamento dos trabalhadores da barragem do Lago Paranoá; os operários permaneceram após as obras e a vila virou a RA VII (1964). (Fonte: Agência Brasil, 2020; Codeplan)",
     "Crescimento · Por volta de 1960 o acampamento tinha cerca de 3 mil moradores em cerca de 800 barracos; a Lei 4.545/1964 criou a RA e o Decreto 11.921/1989 definiu o parcelamento atual. (Fonte: Codeplan, Estudo Urbano Ambiental do Paranoá)",
     "Não confundir · A Vila Amaury, outro acampamento, foi submersa pelo lago em 1959 e não é a Vila Paranoá. (Fonte: resumo de busca)"
    ],
    "peg": "Não atribuir a Lúcio Costa a concepção dos acampamentos pioneiros; Taguatinga (1958) foi a primeira RA planejada, e não uma área de preservação ecológica.",
    "chaves": [
     "n(ú|u)cleos habitacionais pioneiros",
     "Vila Paranoá",
     "Vila Planalto",
     "Lonal(â|a)ndia",
     "Núcleo Bandeirante",
     "Vila Paran(o|ó)(á|a)",
     "barragem do Lago Paran(o|ó)(á|a)",
     "acampamento tempor(á|a)rio",
     "1957",
     "Vila\\s+Parano(á|a)",
     "acampamento",
     "barragem"
    ]
   },
   {
    "titulo": "NOVACAP, moradia e planejamento urbano",
    "lei": [
     "Novacap · Criada em setembro de 1956 pela Lei nº 2.874 (Companhia Urbanizadora da Nova Capital).",
     "Taguatinga · A Novacap criou Taguatinga (1958) para abrigar os operários que se recusaram a ir embora.",
     "Planejamento · O traçado de Lúcio Costa foi planejado; os acampamentos pioneiros surgiram espontaneamente e a RA do Estrutural foi marcada por antigo lixão, desativado em 2018.",
     "Limite da apostila · Não traz os critérios de distribuição de moradia pela Novacap nem ocupações irregulares recentes.",
     "Novacap como incorporadora · Estudo da revista Antíteses (UEL, 2022) trata a atuação da Novacap (1956-1960) como incorporação imobiliária que vinculava o uso e a ocupação do espaço a grupos sociais específicos. (Fonte: Antíteses, v.14 n.28)",
     "Acampamentos dos operários · O primeiro acampamento oficial da Novacap (1956), origem da Candangolândia, era a 'Vila Operária' e tinha caráter temporário: os operários deveriam voltar aos locais de origem após a inauguração. (Fonte: IPEDF/PDAD Candangolândia, 2024)",
     "Plano Piloto · Segundo a análise de Holston (em resumo de busca), o direito de morar no Plano Piloto dependia de status e vínculo com a burocracia, e os trabalhadores recrutados pela Novacap foram privados desse direito. (Fonte: Antíteses/Holston)",
     "Estratificação · Segundo análise de Holston, a Novacap impôs uma distribuição estratificada de direitos residenciais, ligada ao status dos candidatos e ao vínculo com a burocracia. (Fonte: Antíteses/Holston, resumo de busca)",
     "Operários · Os acampamentos da Novacap, como a Vila Operária (atual Candangolândia), eram temporários e destinados aos operários contratados. (Fonte: IPEDF/PDAD Candangolândia, 2024)",
     "Novacap · O estudo da Antíteses (2022) analisa a Novacap como incorporadora que associava espaços da capital a grupos sociais específicos. (Fonte: Antíteses, v.14 n.28)",
     "Ocupações recentes · A DF Legal fez 873 operações em 2024 para recuperar áreas ocupadas irregularmente (825 em 2023, alta de 5,81%); Plano Piloto e Vicente Pires lideraram as ações. (Fonte: Correio Braziliense, 2025, com dados da DF Legal)",
     "Continuidade · Em 2025, até 9 de abril, já eram 208 operações, cerca de duas por dia. (Fonte: Correio Braziliense, 2025)"
    ],
    "peg": "A apostila não traz regras de distribuição de moradia pela Novacap.",
    "chaves": [
     "NOVACAP|Novacap",
     "Companhia Urbanizadora",
     "ocupa(ç|c)(ã|a)o irregular",
     "planejamento urbano controlado",
     "cidade planejada",
     "moradia planejada",
     "independentemente do n(í|i)vel de renda",
     "todas as fam(í|i)lias",
     "migraram para a capital",
     "posi(ç|c)(ã|a)o de cada uma",
     "burocracia civil e militar",
     "n(í|i)vel de renda",
     "restrito",
     "regi(õ|o)es administrativas mais antigas",
     "ocupa(ç|c)(õ|o)es mais recentes",
     "NOVACAP",
     "moradia",
     "fam(í|i)lias",
     "renda",
     "ocupa(ç|c)(ã|a)o\\s+irregular",
     "regi(õ|o)es\\s+administrativas"
    ]
   },
   {
    "titulo": "RIDE × AMB: instituição e composição",
    "lei": [
     "RIDE-DF · Criada por Lei Complementar Federal nº 94/1998; 33 municípios + DF (29 de GO e 4 de MG).",
     "AMB · Formulada pela Codeplan (IPEDF) na Nota Técnica nº 01/2014; DF + 12 municípios de GO.",
     "Pegadinha · A AMB não possui a mesma área nem se confunde com a RIDE-DF."
    ],
    "peg": "Afirmar que RIDE e AMB compreendem o mesmo espaço geográfico é ERRADO.",
    "chaves": [
     "\\bAMB\\b",
     "Área Metropolitana",
     "mesmo espa(ç|c)o geogr(á|a)fico",
     "instituída oficialmente em 2012"
    ]
   },
   {
    "titulo": "Fluxo pendular entre o Entorno e Brasília",
    "lei": [
     "Movimento pendular · Grande massa de trabalhadores desloca-se diariamente das RAs periféricas e do Entorno para trabalhar no Plano Piloto.",
     "Concentração de empregos · O Plano Piloto concentra cerca de 40% a 42% de todos os postos de trabalho do DF.",
     "Ceilândia · Economia própria vigorosa; não é mera \"cidade-dormitório\"."
    ],
    "peg": "Não tratar Ceilândia como mera cidade-dormitório sem vida própria.",
    "chaves": [
     "fluxo pendular",
     "pendular",
     "trabalhadores residentes em munic(í|i)pios goianos"
    ]
   }
  ]
 },
 "geografia-sociedade": {
  "titulo": "Geografia e sociedade: clima, relevo e expansão urbana",
  "fontes": [
   [
    "Apostila Conhecimentos do DF e RIDE (Drive do usuário)",
    ""
   ],
   [
    "Embrapa Cerrados, O clima da região dos Cerrados (1982)",
    "https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/548605/1/cirtec09.pdf"
   ],
   [
    "Revista Geonorte: massa Tropical Atlântica no Centro-Sul (2012)",
    "https://periodicos.ufam.edu.br/index.php/revista-geonorte/article/download/2358/2202/0"
   ],
   [
    "Gonçalves (2024), Deslocamento ao trabalho no DF, PDAD 2021",
    "https://ojs.uel.br/revistas/uel/index.php/ecoreg/article/download/48469/49957"
   ]
  ],
  "secs": [
   {
    "titulo": "Clima do DF: tropical semiúmido e massas de ar",
    "lei": [
     "Clima · Tropical Semiúmido (ou Tropical Típico de Altitude), com duas estações bem definidas.",
     "Verão (outubro a abril) · Quente e chuvoso, impulsionado pela Massa Equatorial Continental (mEc) da Amazônia.",
     "Inverno (maio a setembro) · Frio e seco, com estiagem severa (umidade abaixo de 10-15%), sob atuação da Massa Polar Atlântica (mPa).",
     "Chuvas · São convectivas/térmicas, e NÃO orográficas.",
     "CEBRASPE 2025 · Duas estações bem definidas: verão chuvoso e inverno seco.",
     "Dois períodos · O clima do Cerrado tem dois períodos definidos: chuvoso de outubro a abril (mais de 90% das chuvas) e seco de maio a setembro, resultado da ação da Frente Polar Antártica, da alta pressão do Atlântico e da Frente Equatorial (Fonte: Embrapa Cerrados, Circular Técnica nº 9, 1982).",
     "Massas de ar · A circulação na área core do Cerrado, que inclui o DF, é condicionada pela massa Equatorial Continental (Amazônia), pela Tropical Atlântica (alta do Atlântico Sul) e pela massa polar (Fonte: Embrapa Cerrados, 1982).",
     "Tropical Atlântica em Brasília · Entre 2002 e 2010 a massa Tropical Atlântica atuou em cerca de 25% do tempo em Brasília e em cerca de 47% no inverno, quando domina a alta pressão e há baixa umidade (Fonte: Borsato e Mendonça, Revista Geonorte, 2012)."
    ],
    "peg": "Inverter as massas de ar é erro: verão chuvoso = mEc (Amazônia); inverno seco/frio = mPa. O DF não tem quatro estações nem clima semiárido.",
    "chaves": [
     "clima",
     "esta(ç|c)(õ|o)es",
     "massas? (de ar|equatorial|polar|tropical)",
     "equatorial",
     "chuvos",
     "seco",
     "per(í|i)odos? distintos",
     "chuvoso",
     "tropical atl(â|a)ntica",
     "polar atl(â|a)ntica",
     "massas? de ar",
     "polar\\s+atl(â|a)ntica"
    ]
   },
   {
    "titulo": "Movimento pendular e centralidade do Plano Piloto",
    "lei": [
     "Pendularidade · Fluxo diário de pessoas que se deslocam das RAs mais periféricas e de municípios do Entorno para trabalhar ou estudar no Plano Piloto, retornando ao fim do dia.",
     "Empregos · O Plano Piloto concentra cerca de 40% a 42% de todos os postos de trabalho do DF (serviços públicos e privados).",
     "Ceilândia · Economia própria vigorosa; não é mera cidade-dormitório.",
     "Escala · Em 2021, mais de 1,2 milhão de ocupados do DF se deslocaram para o trabalho, 36,8% deles dentro da própria RA; o Plano Piloto recebeu cerca de 514 mil (41,6%) (Fonte: Gonçalves, Revista Ecoregiões, 2024, com dados da PDAD 2021 do IPEDF).",
     "Escolaridade · Quem se desloca ao Plano Piloto vindo de outras RAs tem ensino superior completo em 46,4%; entre os que moram e trabalham no Plano Piloto o índice é 80,7%, e na média de todos os deslocados é 38,9% (Fonte: Gonçalves, 2024, PDAD 2021).",
     "Atração · O Plano Piloto atrai trabalhadores com maior renda e escolaridade e menor proporção de negros (Fonte: Gonçalves, 2024)."
    ],
    "peg": "A concentração de investimentos no Plano Piloto reforçou as desigualdades entre a RA I e as demais RAs.",
    "chaves": [
     "mobilidade espacial",
     "fluxo di(á|a)rio",
     "movimento pendular",
     "retornando",
     "Plano Piloto",
     "baixa escolaridade",
     "regi(ã|a)o administrativa de sua moradia",
     "movimento\\s+pendular",
     "Plano\\s+Piloto",
     "escolaridade"
    ]
   },
   {
    "titulo": "Núcleos pioneiros e expansão urbana do DF",
    "lei": [
     "Urbanização · Iniciou-se com os canteiros de obras da época da construção (QUADRIX 2022, Certo): Cidade Livre, Vila Planalto e Metropolitana.",
     "Acampamentos espontâneos · Cidade Livre (Núcleo Bandeirante), Sacolândia/Lonalândia (Candangolândia), Vila Planalto, Vila Telebrasília e Metropolitana não foram desenhadas por Lúcio Costa.",
     "Taguatinga · 1ª RA planejada fora do Plano Piloto (1958); Ceilândia em 1971.",
     "Limite da apostila · Não traz a conurbação dos municípios goianos nem o planejamento concêntrico da expansão."
    ],
    "peg": "Afirmar que o crescimento foi sempre planejado e concêntrico a partir do Plano Piloto ignora os acampamentos espontâneos.",
    "chaves": [
     "adensamento populacional",
     "expans(ã|a)o urbana",
     "conurbad",
     "planejada e conc(ê|e)ntrica",
     "n(ú|u)cleos habitacionais desprovidos"
    ]
   },
   {
    "titulo": "Relevo e pontos mais altos do DF",
    "lei": [
     "Relevo · Planalto Central, predominantemente plano a suavemente ondulado (750 m a 1.341 m).",
     "Ponto mais alto do DF · Pico do Roncador (ou Rodeador), em Brazlândia, com 1.341 m.",
     "Plano Piloto · Ponto mais alto é a Praça do Cruzeiro (1.200 m).",
     "Águas Emendadas · Na Estação Ecológica, em Planaltina, nascentes de bacias do Tocantins-Araguaia, Paraná e São Francisco (IADES 2022)."
    ],
    "peg": "A Praça do Cruzeiro (1.200 m) é o ponto mais alto apenas do Plano Piloto; o do DF é o Pico do Roncador (1.341 m).",
    "chaves": [
     "relevo",
     "Pra(ç|c)a do Cruzeiro",
     "ponto mais elevado",
     "menor unidade da Federa(ç|c)(ã|a)o",
     "Planalto"
    ]
   }
  ]
 },
 "economia": {
  "titulo": "Economia do DF: setores, agropecuária e comunidades nipônicas",
  "fontes": [
   [
    "Apostila Conhecimentos do DF e RIDE (Drive do usuário)",
    ""
   ],
   [
    "Agência FAPESP, Embrapa Cerrados: irrigação no DF",
    "https://agencia.fapesp.br/agricultura-no-df-consome-mais-agua/1088"
   ],
   [
    "Correio Braziliense, agricultura familiar (06/2024)",
    "https://www.correiobraziliense.com.br/cidades-df/2024/06/6880231-agricultura-familiar-ganha-forca-no-distrito-federal.html"
   ],
   [
    "Jornal de Brasília, agricultura urbana (17/07/2023)",
    "https://jornaldebrasilia.com.br/brasilia/agricultura-urbana-ganha-forca-no-df/"
   ],
   [
    "IPEDF, Caracterização da Agricultura Urbana e Periurbana do DF",
    "https://www.ipe.df.gov.br/documents/9915964/10232299/Relatorio-Caracterizacao-da-Agricultura-Urbana-e-Periurbana-do-Distrito-Federal.pdf"
   ]
  ],
  "secs": [
   {
    "titulo": "Produção de grãos: milho, soja, feijão e sorgo",
    "lei": [
     "Commodities líderes · Milho e soja são as duas maiores commodities produzidas na região geoeconômica do DF e Entorno.",
     "Ranking de grãos no DF (toneladas) · As duas maiores produções são de milho e soja, seguidas diretamente pelo feijão (3º lugar, à frente de trigo e café).",
     "Alternativa de banca · Quando o par de maior produção de grãos/cereais por volume aparece nas opções, destacam-se sorgo e feijão (IADES 2024) ou milho e soja.",
     "Tecnologia · A agropecuária corresponde a menos de 1% do PIB do DF, mas tem altíssima tecnologia (Embrapa); em 2024 ultrapassou 1 milhão de toneladas de grãos e cereais.",
     "Irrigação por pivô · Estudo da Embrapa Cerrados mostrou que os pivôs centrais no DF passaram de 55 (1992) para 104 (2002), e a área irrigada de 3.894 para 6.823 ha, com milho, feijão, trigo e cevada entre as culturas mais presentes. (Fonte: Agência FAPESP/Embrapa Cerrados, 2003)",
     "Tecnologia · Segundo a apostila, a agropecuária pesa menos de 1% do PIB do DF, mas tem altíssima tecnologia (Embrapa) e ultrapassou 1 milhão de toneladas de grãos em 2024. (Fonte: apostila)",
     "Irrigação e tecnologia · Pivôs centrais no DF subiram de 55 (1992) para 104 (2002), com milho entre as culturas mais irrigadas. (Fonte: Agência FAPESP/Embrapa Cerrados, 2003)",
     "Líderes · A apostila registra milho e soja como as duas maiores commodities da região do DF e Entorno, em setor de altíssima tecnologia. (Fonte: apostila)"
    ],
    "peg": "Afirmar que o feijão é a maior cultura agrícola do DF em toneladas é ERRADO: fica atrás de milho e soja (3º lugar).",
    "chaves": [
     "feij(ã|a)o",
     "milho",
     "soja",
     "sorgo",
     "maiores produ(ç|c)(õ|o)es em toneladas",
     "commodities",
     "alta tecnologia de irriga",
     "alta tecnologia de irriga(ç|c)(ã|a)o",
     "irriga(ç|c)(ã|a)o",
     "elevadas taxas de produtividade",
     "milho e soja",
     "(á|a)rea territorial pequena",
     "soja e milho",
     "n(ú|u)cleos rurais",
     "produtividade agr(í|i)cola elevada",
     "uso intensivo de tecnologia",
     "tecnologia",
     "gr(ã|a)os"
    ]
   },
   {
    "titulo": "Vargem Bonita: olericultura e comunidade nipônica",
    "lei": [
     "Vargem Bonita (Park Way) · Segunda maior comunidade nipônica do DF (60% das propriedades rurais).",
     "Especialização · Olericultura: produção de hortaliças como alface, agrião e couve.",
     "Origem · Comunidades nipônicas convidadas por JK em 1957 para abastecer a capital em construção."
    ],
    "peg": "Inversão clássica: Brazlândia = morango; Vargem Bonita = olericultura (hortaliças).",
    "chaves": [
     "Vargem Bonita",
     "olericultura",
     "alface",
     "Núcleo Rural"
    ]
   },
   {
    "titulo": "Brazlândia, cinturão verde e fruticultura",
    "lei": [
     "Brazlândia · Maior comunidade nipônica do DF e maior produtora de morango, além de maracujá e hortifrutigranjeiros.",
     "Abastecimento · As comunidades nipônicas foram convidadas por JK em 1957 para abastecer a capital em construção.",
     "Clima · O clima é tropical semiúmido (duas estações bem definidas), e não semiárido.",
     "Limite da apostila · Não traz a expressão \"cinturão verde\" nem a Ceasa; registra os polos hortifrutigranjeiros de Brazlândia e Vargem Bonita.",
     "Pontos de cultivo · Brazlândia, Vicente Pires e Vargem Bonita (Park Way) são os principais pontos de cultivo das hortaliças e frutas que chegam às mesas do DF. (Fonte: Jornal de Brasília, 17/07/2023)",
     "Brazlândia e Vargem Bonita · Brazlândia lidera em morango, maracujá e hortifrutigranjeiros; Vargem Bonita é polo de olericultura (alface, agrião, couve). (Fonte: apostila)",
     "Agricultura urbana e periurbana · Estudo do IPEDF aponta predomínio de hortaliças e de frutíferas nas áreas de cultivo do DF. (Fonte: IPEDF, Caracterização da Agricultura Urbana e Periurbana, 2023)"
    ],
    "peg": "Afirmar que o clima semiárido do DF inviabiliza a fruticultura é ERRADO: o clima é tropical semiúmido e Brazlândia é a maior produtora de morango do DF.",
    "chaves": [
     "cintur(ã|a)o verde",
     "fruticultura",
     "hortali(ç|c)as e fruticultura",
     "semi(á|a)rido",
     "morango",
     "Brazl(â|a)ndia",
     "hortali(ç|c)as",
     "abastecimento local",
     "cintur(ã|a)o\\s+verde"
    ]
   },
   {
    "titulo": "Pecuária e PAD-DF",
    "lei": [
     "Carne · A maior produção pecuária de carne ocorre no PAD-DF (São Sebastião).",
     "Leite · A maior produção de leite ocorre na RA de Planaltina (maior área rural do DF).",
     "PAD-DF · Programa de Assentamento Dirigido do DF, criado pelo Governo do DF em 1977, na BR-251 (acesso a Unaí), nas proximidades de São Sebastião; marco da agricultura irrigada e pecuária moderna."
    ],
    "peg": "Afirmar que o PAD-DF lidera o leite e Planaltina a carne é ERRADO: PAD-DF = carne; Planaltina = leite. Também não foi criado por JK em 1957, mas em 1977.",
    "chaves": [
     "PAD-DF",
     "pecu(á|a)ria",
     "\\bgado\\b",
     "\\bleite\\b",
     "\\bcarne\\b"
    ]
   },
   {
    "titulo": "Estrutura setorial do PIB e agricultura familiar",
    "lei": [
     "Terciário · Mais de 90% do PIB do DF; emprega a maior parte da PEA (administração pública, serviços e comércio).",
     "Secundário · Cerca de 8% a 9% do PIB; o segmento mais expressivo da indústria é a Construção Civil.",
     "Primário · Menos de 1% do PIB do DF, com altíssima tecnologia.",
     "Limite da apostila · Não traz fatos sobre agricultura familiar nem exportação.",
     "Produtores familiares · A Emater-DF atende quase 10 mil produtores familiares, 41% do total, com diversidade produtiva e comercialização direta aos consumidores. (Fonte: Correio Braziliense, jun/2024)",
     "Setor primário · A apostila registra agropecuária com menos de 1% do PIB, mas com altíssima tecnologia; há grandes grãos e polos hortifrutigranjeiros convivendo. (Fonte: apostila)"
    ],
    "peg": "Afirmar que a agricultura familiar é inexpressiva ou que toda a produção é de grandes propriedades de exportação não tem respaldo na apostila.",
    "chaves": [
     "agricultura familiar",
     "exporta(ç|c)(ã|a)o",
     "pequenas propriedades",
     "inexpressiva",
     "exclusivamente",
     "agricultura\\s+familiar"
    ]
   }
  ]
 },
 "area-metropolitana": {
  "titulo": "Área Metropolitana de Brasília e Entorno",
  "fontes": [
   [
    "Apostila Conhecimentos do DF e RIDE (Drive do usuário)",
    ""
   ],
   [
    "Wikipédia: Cidade Ocidental",
    "https://pt.wikipedia.org/wiki/Cidade_Ocidental"
   ],
   [
    "Wikipédia: Mesorregião do Leste Goiano",
    "https://pt.wikipedia.org/wiki/Mesorregi%C3%A3o_do_Leste_Goiano"
   ],
   [
    "IMB-GO: microrregiões de Goiás (IBGE)",
    "https://goias.gov.br/wp-content/uploads/sites/29/files/docs/mapas/base-fisica-e-politica/microrregioes_do_estado_de_goias_ibge.pdf"
   ],
   [
    "IMB-GO: meso e microrregiões 2013",
    "https://goias.gov.br/imb/wp-content/uploads/sites/29/2024/01/repositorio_2013_012_meso_e_microregioes_2013.pdf"
   ],
   [
    "IPEA BRUA 31 (Censo 2010-2022)",
    "https://repositorio.ipea.gov.br/bitstream/11058/13915/1/BRUA_31_Artigo_4_Um_Olhar_para_a_periferia.pdf"
   ],
   [
    "Jornal de Brasília sobre a PMAD 2019/2020",
    "https://jornaldebrasilia.com.br/brasilia/codeplan-traca-o-perfil-dos-moradores-da-area-metropolitana-do-df/"
   ],
   [
    "ObservaDF/UnB (2025)",
    "https://observadf.unb.br/wp-content/uploads/2025/07/ObservaDF-PESQ-julho-2025-.pdf"
   ],
   [
    "IPEA BRUA 22: AMB e fluxos (Codeplan)",
    "https://repositorio.ipea.gov.br/server/api/core/bitstreams/36fee0f0-4b2a-4332-95cf-8cd7236d245f/content"
   ],
   [
    "Arrais (2008), O Entorno do DF: ideia de dependência",
    "https://www.periodicos.rc.biblioteca.unesp.br/index.php/ageteo/article/download/3140/3917"
   ],
   [
    "IBGE SIDRA tab. 4709 (Censo 2022)",
    "https://apisidra.ibge.gov.br/values/t/4709/n6/all/v/93,5936,10605/p/2022"
   ],
   [
    "IBGE SIDRA tab. 6579 (2025)",
    "https://apisidra.ibge.gov.br/values/t/6579/n6/all/v/9324/p/2025"
   ]
  ],
  "secs": [
   {
    "titulo": "AMB: Codeplan (2014) e os 12 municípios goianos",
    "lei": [
     "Conceito · Formulado em 2014 pela Codeplan (atual IPEDF), Nota Técnica nº 01/2014. Compreende exclusivamente o DF + 12 municípios goianos circunvizinhos.",
     "Municípios · Águas Lindas de Goiás, Alexânia, Cidade Ocidental, Cocalzinho de Goiás, Cristalina, Formosa, Luziânia, Novo Gama, Padre Bernardo, Planaltina de Goiás, Santo Antônio do Descoberto e Valparaíso de Goiás.",
     "PMB · Os 12 municípios goianos formam a Periferia Metropolitana de Brasília.",
     "Diferença da RIDE · A RIDE engloba 33 municípios + DF; a AMB engloba 12 municípios + DF.",
     "Definição · A Nota Técnica nº 01/2014 da Codeplan consolidou a Área Metropolitana de Brasília como a união do DF com a Periferia Metropolitana de Brasília, os 12 municípios goianos (Fonte: IPEDF Codeplan/IPEA, BRUA nº 31, 2024).",
     "Eixos · A PMB liga-se ao DF por eixos viários: Oeste (Águas Lindas, Padre Bernardo, Cocalzinho) com cerca de 1,7 milhão de pessoas no eixo; Sul (Valparaíso, Cidade Ocidental, Novo Gama, Luziânia, Cristalina) com cerca de 1,0 milhão; Norte (Planaltina, Formosa) com cerca de 650 mil; Sudoeste (Santo Antônio do Descoberto, Alexânia) com cerca de 370 mil (Fonte: ObservaDF/UnB, 2025).",
     "Estrutura · O desenvolvimento ao longo das rodovias de ligação ao DF deu lugar, na última década, ao parcelamento de glebas rurais periféricas (Fonte: IPEA BRUA nº 31, 2024)."
    ],
    "peg": "Afirmar que a AMB inclui municípios mineiros (como Unaí ou Buritis) é ERRADO.",
    "chaves": [
     "Área Metropolitana de Bras(í|i)lia",
     "Periferia Metropolitana",
     "Águas Lindas",
     "Valpara(í|i)so",
     "munic(í|i)pios que comp(õ|o)em a (Área|AMB)",
     "forte depend(ê|e)ncia",
     "AMB",
     "Codeplan",
     "eixos rodovi(á|a)rios",
     "densidade demogr(á|a)fica",
     "adjac(ê|e)ncias",
     "munic(í|i)pios\\s+goianos"
    ]
   },
   {
    "titulo": "Crescimento populacional do Entorno × DF",
    "lei": [
     "Crescimento · QUADRIX 2025 (Certo): entre 2010 e 2022, a maioria dos municípios do entorno do DF (RIDE-DF) cresceu demograficamente em ritmo superior ao do próprio DF.",
     "DF · O crescimento anual do DF caiu de 2,28% ao ano (2000-2010) para 0,76% ao ano (2010-2022).",
     "População · A RIDE totaliza cerca de 4,5 milhões de habitantes (aproximadamente 2/3 no DF e 1/3 nos 33 municípios do entorno).",
     "Localização · Cidade Ocidental (GO) pertence à mesorregião do Leste Goiano e à microrregião do Entorno do Distrito Federal, na divisão IBGE de 2008 (Fonte: Wikipédia, verbete Cidade Ocidental, citando IBGE/DTB 2008; IMB-GO, mesorregião 004 Leste Goiano e microrregião 12 Entorno de Brasília).",
     "Crescimento · Cidade Ocidental passou de 55.915 hab. em 2010 para 91.767 em 2022 (+64,1%), o maior ganho relativo da PMB (Fonte: IBGE, Censo 2022, via IPEA BRUA nº 31, 2024).",
     "Observação · Desde 2017 o IBGE usa regiões geográficas intermediárias e imediatas (Cidade Ocidental na região Luziânia-Águas Lindas); mesorregião é a divisão anterior, ainda usada em provas (Fonte: IBGE, Divisão Regional do Brasil, 2017).",
     "Causa · Diante do alto valor do solo urbano e do alto custo de vida no DF, parte da população migrou para os municípios do Entorno, onde se ofertavam imóveis mais acessíveis em loteamentos (Fonte: IPEDF Codeplan/IPEA, BRUA nº 31, 2024).",
     "Habitação · Entre 2010 e 2022 foram entregues 154.814 unidades de programas federais de habitação na PMB, cerca de 53% dos 266 mil novos domicílios do Censo (Fonte: IPEDF Codeplan/IPEA, BRUA nº 31, 2024).",
     "Serviços · Na PMB, só 46,8% dos domicílios têm esgoto pela rede geral e 68,41% não são atendidos por redes de águas pluviais (Fonte: Codeplan, PMAD 2019/2020, via Jornal de Brasília, 29/07/2021).",
     "Ranking 2022 · Águas Lindas de Goiás (225.693) é o município mais populoso do Entorno, e Valparaíso de Goiás (198.861) o 3º, atrás de Luziânia (209.129) (Fonte: IBGE, Censo 2022, SIDRA tab. 4709).",
     "Trabalho no DF · Na PMAD 2017/2018 trabalhavam no DF 59,0% dos ocupados de Águas Lindas e 55,2% dos de Valparaíso (Fonte: Codeplan, PMAD 2017/2018, apud IPEA BRUA nº 22, 2020).",
     "Estimativa 2025 · O IBGE estima 245.352 em Águas Lindas e 218.416 em Valparaíso (Fonte: IBGE, Estimativas da População 2025, SIDRA tab. 6579)."
    ],
    "peg": "Afirmar que o Entorno cresceu mais lentamente que o DF contraria a apostila.",
    "chaves": [
     "crescimento populacional do entorno",
     "mais lenta",
     "ritmo superior",
     "Cidade Ocidental",
     "mesorregi(ã|a)o",
     "Leste Goiano",
     "custo de vida",
     "fluxos migrat(ó|o)rios",
     "Entorno de Bras(í|i)lia",
     "sobrecarga",
     "im(ó|o)veis mais baratos",
     "Valpara(í|i)so de Goi(á|a)s",
     "(Á|A)guas Lindas de Goi(á|a)s",
     "maior popula(ç|c)(ã|a)o",
     "mercado de trabalho",
     "Cidade\\s+Ocidental",
     "Entorno\\s+de\\s+Bras(í|i)lia",
     "Entorno",
     "custo\\s+de\\s+vida",
     "crescimento",
     "Valpara(í|i)so\\s+de\\s+Goi(á|a)s",
     "Águas\\s+Lindas\\s+de\\s+Goi(á|a)s",
     "pendular"
    ]
   },
   {
    "titulo": "Desigualdade de renda entre RAs (Lago Sul × SCIA/Estrutural)",
    "lei": [
     "Paradoxo · Maior PIB per capita do Brasil, mas um dos maiores Índices de Gini do país.",
     "Maior renda · Lago Sul (renda per capita média superior a R$ 23 mil mensais); menor renda: SCIA/Estrutural.",
     "Estrutural · Antigo lixão desativado em 2018 (Lei nº 12.305/2010, PNRS).",
     "Limite da apostila · Não traz a renda domiciliar média do DF nem os valores das RAs extremas."
    ],
    "peg": "O DF se destaca pelo PIB elevado, mas apresenta grande desigualdade entre as RAs; não depende do setor industrial nem do agropecuário.",
    "chaves": [
     "SCIA|Estrutural",
     "renda mensal domiciliar",
     "Lago Sul",
     "PIB per capita"
    ]
   },
   {
    "titulo": "Movimento pendular e emprego no Plano Piloto",
    "lei": [
     "Concentração de empregos · O Plano Piloto concentra cerca de 40% a 42% dos postos de trabalho do DF.",
     "Movimento pendular · Grande massa de trabalhadores desloca-se diariamente das RAs periféricas e do Entorno para o Plano Piloto.",
     "Ceilândia · Economia própria vigorosa, com forte presença de comércio e informalidade.",
     "Limite da apostila · Não traz a relação entre escolaridade e permanência na RA de moradia.",
     "Percentual que trabalha no DF · Na PMAD 2017/2018, entre os ocupados residentes, trabalham no DF 59,0% em Águas Lindas, 57,4% em Novo Gama, 55,2% em Valparaíso, 52,8% em Cidade Ocidental e 51,3% em Santo Antônio do Descoberto (Fonte: Codeplan, PMAD 2017/2018, apud IPEA BRUA nº 22, 2020).",
     "Menores índices · Cristalina (2,2%), Alexânia (6,6%) e Formosa (9,9%) têm menos de 10% dos ocupados trabalhando no DF (Fonte: Codeplan, PMAD 2017/2018, apud IPEA BRUA nº 22, 2020).",
     "Números absolutos · Os maiores contingentes que trabalham no DF vêm de Águas Lindas (43.821), Valparaíso (37.220), Novo Gama (22.816) e Luziânia (20.348); na PMB, 41,4% dos ocupados (173.313) trabalham no DF (Fonte: Codeplan, PMAD 2017/2018, apud IPEA BRUA nº 22, 2020).",
     "Trabalho · Na PMAD 2017/2018, 41,4% dos ocupados da PMB (173.313 pessoas) trabalhavam no DF, e cerca de 26% dos moradores usavam hospital ou posto de saúde no DF (Fonte: Codeplan, PMAD 2017/2018, apud IPEA BRUA nº 22, 2020).",
     "Tendência · A dependência vem caindo: 45,03% dos ocupados trabalhavam no DF em 2013 e 36,14% em 2019/2020, e 79,92% usavam saúde no próprio município (Fonte: Codeplan, PMAD, apud IPEA BRUA nº 31, 2024).",
     "Economia · Em 2021 o DF era responsável por 91,8% do PIB da Área Metropolitana de Brasília (Fonte: IPEDF Codeplan, apud IPEA BRUA nº 31, 2024)."
    ],
    "peg": "A apostila registra a pendularidade como característica estrutural do DF.",
    "chaves": [
     "pendular",
     "baixa escolaridade",
     "regi(ã|a)o administrativa de sua moradia",
     "Cristalina",
     "Alexânia",
     "Formosa",
     "Periferia Metropolitana de Bras(í|i)lia",
     "saem mais pessoas",
     "trabalhar no DF",
     "depend(ê|e)ncia",
     "Área Metropolitana de Bras(í|i)lia",
     "servi(ç|c)os",
     "forte depend(ê|e)ncia econ(ô|o)mica",
     "Periferia\\s+Metropolitana\\s+de\\s+Bras(í|i)lia",
     "Área\\s+Metropolitana\\s+de\\s+Bras(í|i)lia",
     "empregos"
    ]
   }
  ]
 }
};
