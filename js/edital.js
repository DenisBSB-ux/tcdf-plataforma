/* ================= ASSUNTOS PELO EDITAL (TCDF 2026) =================
   Reorganiza o "assunto" (tema) de cada questão pelos itens do edital, sem
   mexer no conteúdo nem no progresso — o progresso é guardado pelo uid da
   questão, não pelo assunto. O assunto original fica em q.temaOriginal, e
   a troca é refeita a cada carga (reindex), então vale também pra questões
   inseridas depois com os nomes antigos.

   Para cada matéria (pelo nome exibido):
     itens   — assuntos do edital, na ordem do edital (ordena as abas);
     mapa    — assunto antigo → item do edital;
     dividir — assunto antigo → [regex, item] testados no enunciado (e, se
               nada casar, na explicação); regex null = item padrão;
     artigos — [de, até, item] pelo 1º "art. N" da explicação/enunciado,
               usado antes do mapa (só em matérias de uma lei só).
   Assunto sem regra fica como está. "Fora do edital — …" marca o que o
   edital não cobra (fica fora da previsão, mas continua estudável). */

const FORA_DO_EDITAL = 'Fora do edital';

const _LC840 = {
  prelim:  'Disposições preliminares (arts. 1º a 3º)',
  cargos:  'Cargos públicos e funções de confiança (arts. 4º a 54)',
  carreira:'Carreiras, regime e jornada de trabalho (arts. 55 a 65)',
  direitos:'Direitos (arts. 66 a 179)',
  deveres: 'Deveres (art. 180)',
  disc:    'Regime disciplinar (arts. 181 a 210)',
  proc:    'Processos de apuração de infração disciplinar (arts. 211 a 267)',
  segur:   'Seguridade social (arts. 268 a 277)',
  finais:  'Disposições finais e transitórias (arts. 278 a 295)',
  cf:      'CF/88 arts. 37 a 41 (servidores públicos)',
};
const _L14133 = {
  prelim: '1.1.1 Disposições preliminares (arts. 1º a 10)',
  proc:   '1.1.2 Processo licitatório e fase preparatória (arts. 11 a 27)',
  modal:  '1.1.2 Modalidades e critérios de julgamento (arts. 28 a 39)',
  setor:  '1.1.2 Disposições setoriais (arts. 40 a 52)',
  julg:   '1.1.2 Edital, propostas, julgamento, habilitação e encerramento (arts. 53 a 71)',
  direta: '1.1.2 Contratação direta (arts. 72 a 75)',
  alien:  '1.1.2 Alienações (arts. 76 e 77)',
  aux:    '1.1.2 Procedimentos auxiliares (arts. 78 a 88)',
  fora:   FORA_DO_EDITAL + ' — contratos e demais dispositivos (art. 89 em diante)',
};
const _GESTAO = {
  clausulas: '2.1 Cláusulas e indicadores de nível de serviço',
  fiscal:    '2.2 Papel do fiscalizador do contrato',
  preposto:  '2.3 Papel do preposto da contratada',
  execucao:  '2.4 Acompanhamento da execução contratual',
  irregular: '2.5 Registro e notificação de irregularidades',
  sancoes:   '2.6 Penalidades e sanções administrativas',
  equacao:   '2.7 Equação econômico-financeira',
  reajuste:  '2.7.1 Reajuste',
  repact:    '2.7.2 Repactuação',
};

const EDITAL = {
  'Primeiros Socorros': {
    itens: ['Cuidados iniciais, urgência e emergência e acionamento do socorro', 'Engasgo', 'Sangramento', 'Fratura', 'Queimadura', 'Desmaio', 'Convulsão', 'Intoxicação'],
    mapa: {
      'Condutas Iniciais e Exame Primário':'Cuidados iniciais, urgência e emergência e acionamento do socorro',
      'Exame Primário':'Cuidados iniciais, urgência e emergência e acionamento do socorro',
      'Condutas Iniciais e Aspectos Jurídicos':'Cuidados iniciais, urgência e emergência e acionamento do socorro',
      'Segurança da Cena':'Cuidados iniciais, urgência e emergência e acionamento do socorro',
      'Terminologia Respiratória':'Cuidados iniciais, urgência e emergência e acionamento do socorro',
      'Obstrução de Via Aérea':'Engasgo',
      'Controle de Sangramentos e Hemostasia':'Sangramento', 'Controle de Sangramentos':'Sangramento',
      'Fraturas, Luxações e Entorses':'Fratura',
      'Queimaduras e Choque Elétrico':'Queimadura', 'Queimaduras':'Queimadura',
      'Intoxicações Exógenas':'Intoxicação',
    },
    dividir: { 'Desmaios e Crises Convulsivas': [[/convuls|epil/i,'Convulsão'], [null,'Desmaio']] },
  },

  'PDPM Mulheres': {
    itens: ['2 PDP Mulheres (2020–2023)', '3 Maria da Penha — disposições preliminares (arts. 1º a 4º)', '3 Maria da Penha — violência doméstica e familiar (arts. 5º a 7º)', '3 Maria da Penha — assistência à mulher (arts. 8º a 12-C)', '3 Maria da Penha — procedimentos: disposições gerais (arts. 13 a 17)', '3 Maria da Penha — medidas protetivas de urgência (arts. 18 a 24-A)', '3 Maria da Penha — Ministério Público e assistência jurídica (arts. 25 a 28)', '3 Maria da Penha — equipe multidisciplinar (arts. 29 a 32)', '3 Maria da Penha — disposições transitórias e finais (arts. 33 a 46)'],
    mapa: {
      'Plano Distrital de Políticas Públicas para as Mulheres - PDPM (DF)':'2 PDP Mulheres (2020–2023)',
      'Disposições Preliminares (arts. 1º a 4º da Lei nº 11.340/2006)':'3 Maria da Penha — disposições preliminares (arts. 1º a 4º)',
      'Da Violência Doméstica e Familiar Contra a Mulher (arts. 5º a 7º da Lei nº 11.340/2006)':'3 Maria da Penha — violência doméstica e familiar (arts. 5º a 7º)',
      'Da Assistência à Mulher em Situação de Violência Doméstica e Familiar (arts. 8º a 12-C da Lei nº 11.340/2006)':'3 Maria da Penha — assistência à mulher (arts. 8º a 12-C)',
      'Disposições Gerais (arts. 13 a 17 da Lei nº 11.340/2006)':'3 Maria da Penha — procedimentos: disposições gerais (arts. 13 a 17)',
      'Das Medidas Protetivas de Urgência (arts. 18 a 24-A da Lei nº 11.340/2006)':'3 Maria da Penha — medidas protetivas de urgência (arts. 18 a 24-A)',
      'Da Atuação do Ministério Público e da Assistência Jurídica (arts. 25 a 28 da Lei nº 11.340/2006)':'3 Maria da Penha — Ministério Público e assistência jurídica (arts. 25 a 28)',
      'Da Equipe de Atendimento Multidisciplinar (arts. 29 a 32 da Lei nº 11.340/2006)':'3 Maria da Penha — equipe multidisciplinar (arts. 29 a 32)',
      'Disposições Transitórias e Finais (arts. 33 a 46 da Lei nº 11.340/2006)':'3 Maria da Penha — disposições transitórias e finais (arts. 33 a 46)',
      'Legislação Penal e Processual Penal Especial':'3 Maria da Penha — disposições transitórias e finais (arts. 33 a 46)',
    },
  },

  'Analise Dados IA': {
    itens: ['1.1 Tipos de dados', '1.2 Produtos da análise de dados', '3.1 Tipos de gráficos', '3.2 Boas práticas para construção de gráficos', '3.3 Princípios de narrativa com dados', '4.1 Engenharia de prompt', '4.2 Vieses cognitivos', '4.3 Ética no uso de dados e IA'],
    mapa: {
      'Tipos de Dados':'1.1 Tipos de dados', 'Produtos da Análise de Dados':'1.2 Produtos da análise de dados',
      'Tipos de Gráficos':'3.1 Tipos de gráficos', 'Boas Práticas de Construção de Gráficos':'3.2 Boas práticas para construção de gráficos',
      'Princípios de Narrativa com Dados':'3.3 Princípios de narrativa com dados', 'Engenharia de Prompt':'4.1 Engenharia de prompt',
      'Vieses Cognitivos':'4.2 Vieses cognitivos', 'Ética no Uso de Dados e IA':'4.3 Ética no uso de dados e IA',
    },
  },

  'Conhec. DF': {
    itens: ['RIDE (LC nº 94/1998 e Decreto nº 7.469/2011)'],
    mapa: {
      'RIDE':'RIDE (LC nº 94/1998 e Decreto nº 7.469/2011)',
      'Geografia Física, Clima e Hidrografia do DF':FORA_DO_EDITAL+' — geografia física, clima e hidrografia',
      'História e Construção de Brasília':FORA_DO_EDITAL+' — história de Brasília',
      'Patrimônio Cultural e Urbanístico':FORA_DO_EDITAL+' — patrimônio cultural e urbanístico',
      'Organização Administrativa e Regiões Administrativas':FORA_DO_EDITAL+' — regiões administrativas',
      'Saneamento e Abastecimento de Água':FORA_DO_EDITAL+' — saneamento',
      'Meio Ambiente e Unidades de Conservação':FORA_DO_EDITAL+' — meio ambiente',
      'Demografia, Migração e População':FORA_DO_EDITAL+' — demografia',
      'Socioeconomia e Desigualdades Urbanas':FORA_DO_EDITAL+' — socioeconomia',
      'Geografia e Sociedade do DF (Geral)':FORA_DO_EDITAL+' — geografia e sociedade',
      'Economia e Produção Agropecuária':FORA_DO_EDITAL+' — economia',
    },
    dividir: { 'Área Metropolitana e Entorno': [[/\bRIDE\b|Regi[ãa]o Integrada|94\/1998|7\.469/i,'RIDE (LC nº 94/1998 e Decreto nº 7.469/2011)'], [null,FORA_DO_EDITAL+' — área metropolitana e entorno']] },
  },

  'Constitucional': {
    itens: ['1.1 Princípios fundamentais', '2.1 Eficácia das normas constitucionais', '2.2 Emenda, reforma e revisão constitucional', '3.1 Direitos e deveres individuais e coletivos', '3.1 Direitos sociais', '3.1 Direitos de nacionalidade e políticos', '4.1 Estado federal: União, estados, DF e municípios', '5.1 Administração pública: disposições gerais', '5.2 Servidores públicos', '6.1 Presidente da República: atribuições e responsabilidades', '7.1–7.2 Poder Legislativo: estrutura, funcionamento e atribuições', '7.3 Processo legislativo', '7.4 Fiscalização contábil, financeira e orçamentária', '7.5 Comissões parlamentares de inquérito', '8 Poder Judiciário', '9.1 Ministério Público', '9.2 Advocacia pública', '9.3 Defensoria Pública'],
    mapa: {
      'Princípios Fundamentais':'1.1 Princípios fundamentais', 'Direitos e Deveres Individuais':'3.1 Direitos e deveres individuais e coletivos',
      'Direitos Sociais':'3.1 Direitos sociais', 'Direitos de Nacionalidade e Políticos':'3.1 Direitos de nacionalidade e políticos',
      'Estado Federal Brasileiro':'4.1 Estado federal: União, estados, DF e municípios', 'Poder Executivo':'6.1 Presidente da República: atribuições e responsabilidades',
      'Processo Legislativo':'7.3 Processo legislativo', 'Fiscalização Contábil':'7.4 Fiscalização contábil, financeira e orçamentária',
      'Poder Judiciário':'8 Poder Judiciário',
    },
    dividir: {
      'Aplicabilidade das Normas': [[/emenda|reforma|revis[ãa]o constitucional/i,'2.2 Emenda, reforma e revisão constitucional'], [null,'2.1 Eficácia das normas constitucionais']],
      'Administração Pública': [[[37,38],'5.1 Administração pública: disposições gerais'], [[39,41],'5.2 Servidores públicos'], [/servidor|estabil|aposenta/i,'5.2 Servidores públicos'], [null,'5.1 Administração pública: disposições gerais']],
      'Poder Legislativo': [[/inqu[ée]rito|\bCPIs?\b/i,'7.5 Comissões parlamentares de inquérito'], [null,'7.1–7.2 Poder Legislativo: estrutura, funcionamento e atribuições']],
      'Funções Essenciais à Justiça': [[[127,130],'9.1 Ministério Público'], [[131,133],'9.2 Advocacia pública'], [[134,135],'9.3 Defensoria Pública'], [/Advogado-Geral|\bAGU\b/i,'9.2 Advocacia pública'], [null,'9.1 Ministério Público']],
    },
  },

  'Previdenciário': {
    itens: ['1.1–1.2 Seguridade social: origem, conceito e princípios', '1.3–1.4 RGPS (CF art. 201; Leis 8.212 e 8.213)', '1.5 RPPS (CF art. 40; Lei 9.717/1998)', '2.1 RPPS/DF (LCDF nº 769/2008)', '3.1–3.2 Previdência complementar (LC 108 e LC 109/2001)', '3.3 Previdência complementar do DF (LCDF nº 932/2017)'],
    mapa: {
      'Seguridade Social':'1.1–1.2 Seguridade social: origem, conceito e princípios', 'RGPS':'1.3–1.4 RGPS (CF art. 201; Leis 8.212 e 8.213)',
      'RPPS':'1.5 RPPS (CF art. 40; Lei 9.717/1998)', 'RPPS/DF':'2.1 RPPS/DF (LCDF nº 769/2008)',
      'Controle do TCDF sobre Aposentadorias RPPS/DF':'2.1 RPPS/DF (LCDF nº 769/2008)',
      'Previdência Complementar':'3.1–3.2 Previdência complementar (LC 108 e LC 109/2001)',
      'Previdência Complementar DF':'3.3 Previdência complementar do DF (LCDF nº 932/2017)',
    },
  },

  'Direito Civil': {
    itens: ['1 LINDB', '2.1 Pessoas naturais', '2.2 Pessoas jurídicas', '2.3 Domicílio', '3 Bens', '4.1 Negócio jurídico', '5 Atos jurídicos lícitos e ilícitos', '6 Prescrição e decadência'],
    mapa: {
      'LINDB — Vigência, Interpretação e Aplicação da Lei':'1 LINDB', 'Pessoas Naturais (Personalidade e Capacidade)':'2.1 Pessoas naturais',
      'Direitos da Personalidade, Morte e Ausência':'2.1 Pessoas naturais', 'Pessoas Jurídicas':'2.2 Pessoas jurídicas', 'Domicílio':'2.3 Domicílio',
      'Bens':'3 Bens', 'Defeitos do Negócio Jurídico':'4.1 Negócio jurídico', 'Ato Ilícito e Responsabilidade Civil':'5 Atos jurídicos lícitos e ilícitos',
      'Prescrição e Decadência':'6 Prescrição e decadência',
    },
  },

  'D.Tributário': {
    itens: ['1 Direito tributário: conceito e fontes', '2 Sistema Tributário Nacional: competência tributária', '2.1 Princípios do direito tributário', '2.2 Limitações constitucionais do poder de tributar', '2.3 Repartição das receitas tributárias', '3.1–3.3 Tributo: conceito, natureza jurídica e espécies', '3.4 Imposto', '3.5 Taxa', '3.6 Contribuição de melhoria', '3.7 Empréstimo compulsório', '3.8 Contribuições'],
    mapa: {
      'Limitações Constitucionais ao Poder de T':'2.2 Limitações constitucionais do poder de tributar',
      'Sistema Tributário Nacional — Princípios Gerais':'2.1 Princípios do direito tributário',
      'Contribuições Especiais':'3.8 Contribuições', 'Competência Tributária':'2 Sistema Tributário Nacional: competência tributária',
      'Repartição de Receitas Tributárias':'2.3 Repartição das receitas tributárias',
      'Reforma Tributária (IBS/CBS)':FORA_DO_EDITAL+' — reforma tributária (IBS/CBS)',
      'Obrigação Tributária':FORA_DO_EDITAL+' — obrigação tributária',
    },
    dividir: {
      'Taxas e Contribuição de Melhoria': [[/melhoria/i,'3.6 Contribuição de melhoria'], [null,'3.5 Taxa']],
      // só vai pra espécie específica quando o enunciado fala de uma espécie só
      'Conceito e Espécies Tributárias': [[/^(?!.*(taxa|melhoria|compuls|contribui)).*\bimpostos?\b/is,'3.4 Imposto'], [/^(?!.*(imposto|melhoria|compuls|contribui)).*\btaxas?\b/is,'3.5 Taxa'], [/^(?!.*(imposto|taxa|compuls|contribuições? (sociais|especiais|de interven))).*contribuiç(ão|ões) de melhoria/is,'3.6 Contribuição de melhoria'], [/^(?!.*(imposto|taxa|melhoria|contribui)).*empr[ée]stimos? compuls/is,'3.7 Empréstimo compulsório'], [null,'3.1–3.3 Tributo: conceito, natureza jurídica e espécies']],
    },
  },

  'Adm (Lei nº 8.429; nº 9.784; nº 2.834)': {
    itens: ['11 Lei nº 8.429/1992 (improbidade administrativa)', '12 Lei nº 9.784/1999 + Lei distrital nº 2.834/2001'],
    mapa: {
      '1. Lei nº 8.429/1992':'11 Lei nº 8.429/1992 (improbidade administrativa)',
      '2. Lei nº 9.784/1999':'12 Lei nº 9.784/1999 + Lei distrital nº 2.834/2001',
      '3. Lei Distrital nº 2.834/2001':'12 Lei nº 9.784/1999 + Lei distrital nº 2.834/2001',
    },
  },

  'Adm (LGPD + LAI)': {
    itens: ['13 LAI — disposições gerais', '13 LAI — acesso e divulgação', '13 LAI — procedimento de acesso', '13 LAI — restrições de acesso', '13 LAI — responsabilidades', '14 LGPD — disposições preliminares', '14 LGPD — requisitos para o tratamento', '14 LGPD — dados sensíveis e de crianças', '14 LGPD — término do tratamento', '14 LGPD — direitos do titular', '14 LGPD — tratamento pelo poder público', '14 LGPD — transferência internacional', '14 LGPD — agentes de tratamento (controlador, operador e encarregado)', '14 LGPD — segurança e boas práticas', '14 LGPD — fiscalização, sanções e ANPD'],
    mapa: {
      'Do Acesso e Divulgação':'13 LAI — acesso e divulgação', 'Do Procedimento de Acesso':'13 LAI — procedimento de acesso',
      'Das Restrições de Acesso':'13 LAI — restrições de acesso', 'Das Responsabilidades':'13 LAI — responsabilidades',
      'Requisitos para Tratamento':'14 LGPD — requisitos para o tratamento', 'Tratamento de Dados Sensíveis':'14 LGPD — dados sensíveis e de crianças',
      'Dados de Crianças e Adolescentes':'14 LGPD — dados sensíveis e de crianças', 'Do Término do Tratamento de Dados':'14 LGPD — término do tratamento',
      'Dos Direitos do Titular':'14 LGPD — direitos do titular', 'Regras para Poder Público':'14 LGPD — tratamento pelo poder público',
      'Transferência Internacional':'14 LGPD — transferência internacional', 'Controlador e Operador':'14 LGPD — agentes de tratamento (controlador, operador e encarregado)',
      'Do Encarregado pelo Tratamento':'14 LGPD — agentes de tratamento (controlador, operador e encarregado)',
      'Responsabilidade e Danos':'14 LGPD — agentes de tratamento (controlador, operador e encarregado)',
      'Responsabilidade no Tratamento':'14 LGPD — agentes de tratamento (controlador, operador e encarregado)',
      'Segurança e Sigilo de Dados':'14 LGPD — segurança e boas práticas', 'Boas Práticas e Governança':'14 LGPD — segurança e boas práticas',
      'Sanções Administrativas':'14 LGPD — fiscalização, sanções e ANPD', 'Da ANPD':'14 LGPD — fiscalização, sanções e ANPD',
    },
    dividir: Object.fromEntries(['Disposições Preliminares','Disposições Gerais','Tópicos Mesclados','Disposições Finais'].map(t => [t, [
      [/dados pessoais|titular|LGPD|13\.709|tratamento de dados|\bANPD\b|controlador|anonimiza/i,'14 LGPD — disposições preliminares'],
      [null,'13 LAI — disposições gerais'],
    ]])),
  },

  'Adm Geral & Pub': {
    itens: ['1.1.1 Administração científica', '1.2.1 Movimento das relações humanas', '1.2.3 Abordagem das ciências comportamentais', '1.3.1 Pensamento sistêmico', '1.3.2 Teoria da contingência', '2 Evolução da administração do setor público', '3 Administração pública patrimonialista', '3.1 Administração pública burocrática', '3.2 Administração pública gerencial', '4 Governança', '4.1 Princípios da governança pública', '4.1.2 Integridade', '4.1.5 Transparência', '4.1.6 Prestação de contas e responsabilidades', '4.2 Práticas e mecanismos de governança', '4.2.1 Liderança (governança)', '4.2.3 Controle (governança)', '5 Funções administrativas: planejamento, organização, direção e controle', '6.1 Análise SWOT', '6.2 Matriz GUT', '6.5 Mapas estratégicos', '7 Modelagem de processos', '7.2 Notações', '7.2.4 Cadeia de valor', '8.4 Liderança', '8.5 Motivação', '9 Gestão de projetos e portfólios'],
    mapa: {
      'Funções administrativas':'5 Funções administrativas: planejamento, organização, direção e controle',
      'Planejamento e Estratégia':'5 Funções administrativas: planejamento, organização, direção e controle',
      'Análise SWOT':'6.1 Análise SWOT', 'Governança':'4 Governança', 'Modelagem de processos':'7 Modelagem de processos',
      'Administração pública burocrática':'3.1 Administração pública burocrática', 'Administração pública gerencial':'3.2 Administração pública gerencial',
      'Prestação de contas e responsabilidades':'4.1.6 Prestação de contas e responsabilidades', 'Mecanismos de governança pública':'4.2 Práticas e mecanismos de governança',
      'Transparência':'4.1.5 Transparência', 'Mapas estratégicos':'6.5 Mapas estratégicos', 'Teoria da contingência':'1.3.2 Teoria da contingência',
      'Motivação':'8.5 Motivação', 'Princípios da governança pública':'4.1 Princípios da governança pública',
      'Administração pública patrimonialista':'3 Administração pública patrimonialista', 'Cadeia de valor':'7.2.4 Cadeia de valor',
      'Pensamento sistêmico':'1.3.1 Pensamento sistêmico', 'Matriz GUT':'6.2 Matriz GUT', 'Administração científica':'1.1.1 Administração científica',
      'Abordagem das ciências comportamentais':'1.2.3 Abordagem das ciências comportamentais', 'Gestão de projetos e portfólios':'9 Gestão de projetos e portfólios',
      'Integridade':'4.1.2 Integridade', 'Evolução da Administração Pública':'2 Evolução da administração do setor público',
      'Movimento das relações humanas':'1.2.1 Movimento das relações humanas', 'Notações':'7.2 Notações',
    },
    dividir: {
      'Liderança': [[/governan/i,'4.2.1 Liderança (governança)'], [null,'8.4 Liderança']],
      'Controle': [[/governan/i,'4.2.3 Controle (governança)'], [null,'5 Funções administrativas: planejamento, organização, direção e controle']],
    },
  },

  'Lei Orgânica do TCDF': {
    itens: ['1.1 Natureza, competência e jurisdição', '1.2 Composição', '1.3 Plenário e câmaras', '1.4 Presidente, vice-presidente, conselheiros, auditores e MP', '1.5 Serviços auxiliares do TCDF'],
    mapa: {
      'Natureza, Competência e Jurisdição':'1.1 Natureza, competência e jurisdição',
      'Processo, Fiscalização e Sanções':'1.1 Natureza, competência e jurisdição',
      'Controle Externo e Legislação Institucional':'1.1 Natureza, competência e jurisdição',
      'Ministério Público de Contas (MP/TCDF)':'1.4 Presidente, vice-presidente, conselheiros, auditores e MP',
      'Serviços Auxiliares e Servidores':'1.5 Serviços auxiliares do TCDF',
    },
    // pelo artigo da LC distrital nº 1/1994 citado na explicação: 62–64
    // composição; 65–66 plenário e câmaras; 67–77 presidente, conselheiros e
    // auditores; 78 em diante serviços auxiliares
    dividir: { 'Composição, Conselheiros e Auditores': [
      [[62,64],'1.2 Composição'], [[65,66],'1.3 Plenário e câmaras'],
      [[67,77],'1.4 Presidente, vice-presidente, conselheiros, auditores e MP'], [[78,90],'1.5 Serviços auxiliares do TCDF'],
      [/c[âa]maras?\b/i,'1.3 Plenário e câmaras'],
      [/presidente|corregedor/i,'1.4 Presidente, vice-presidente, conselheiros, auditores e MP'],
      [null,'1.2 Composição'],
    ] },
  },

  'RJU LC840': {
    itens: [_LC840.prelim, _LC840.cargos, _LC840.carreira, _LC840.direitos, _LC840.deveres, _LC840.disc, _LC840.proc, _LC840.segur, _LC840.finais, _LC840.cf],
    // 1º pelo artigo da LC 840 citado na explicação; sem ele, pelo assunto
    artigosDaLei: { re: /\bart(?:igo)?s?\.?\s*(\d+)[^.;]{0,40}?840/i,
      faixas: [[1,3,_LC840.prelim],[4,54,_LC840.cargos],[55,65,_LC840.carreira],[66,179,_LC840.direitos],[180,180,_LC840.deveres],[181,210,_LC840.disc],[211,267,_LC840.proc],[268,277,_LC840.segur],[278,295,_LC840.finais]] },
    mapa: Object.assign(
      { 'Administração Pública':_LC840.cf, 'Disposições Preliminares':_LC840.prelim, 'Disposições Finais':_LC840.finais, 'Deveres do Servidor':_LC840.deveres },
      ...[
        [_LC840.cargos, ['Provimento de Cargos','Regime de Substituição','Acumulação de Cargos','Estágio Probatório','Posse e Exercício','Movimentação de Pessoal','Exercício do Cargo','Cargos em Comissão','Estabilidade Provisória','Cargos Públicos','Disponibilidade e Aproveitamento','Recondução','Reversão de Aposentadoria','Estabilidade e Perda do Cargo','Vacância de Cargos','Reintegração','Estabilidade e Avaliação','Cessão de Servidores']],
        [_LC840.carreira, ['Horário Especial de Trabalho','Regimes de Jornada de Trabalho','Organização de Carreiras','Jornada de Trabalho','Plano de Carreira e Promoção']],
        [_LC840.direitos, ['Adicionais Ocupacionais','Gratificações Especiais','Sistema Remuneratório e Vantagens','Tratamento de Saúde','Licença para Atividade Política','Tempo de Efetivo Exercício','Auxílio-Natalidade','Diárias e Despesas de Viagem','Indenizações','Férias','Gratificação Natalina','Licença-Maternidade','Licença Doença em Família','Licença-Prêmio por Assiduidade','Licença para Interesses Particulares','Licença para o Serviço Militar','Afastamento Mandato Eletivo','Estudo ou Missão no Exterior','Concessões e Ausências','Direito de Petição','Licenças de Pessoal','Sistema Remuneratório e Veto','Inspeção Médica','Gratificação por Curso']],
        [_LC840.disc, ['Responsabilidade Disciplinar','Sanções Disciplinares','Gradação de Sanções','Prescrição Disciplinar','Infrações Disciplinares','Abandono e Inassiduidade','Caracterização de Reincidência','Aplicação das Sanções','Isenção de Sanção','Responsabilidade Civil','Proibições Disciplinares','Penalidade de Suspensão','Extensão de Responsabilidades','Classificação de Infrações','Cancelamento de Registro','Infrações e Sanções','Cancelamento de Sanções','Circunstâncias Atenuantes','Responsabilidade Penal e Civil','Infrações Disciplinares Graves','Responsabilidade Civil do Servidor','Responsabilidades e Infrações','Dosimetria e Perda do Cargo','Independência de Instâncias']],
        [_LC840.proc, ['Sindicância Patrimonial','Cautelares de PAD','Rito de Sindicância','Afastamento Preventivo','Prazos de Sindicância','Sindicância e Punição','Comissão de Inquérito','Julgamento de Processo','Impedimentos de Comissão','Fases de Processo','Prazos de Processo','Revisão do Processo','Medidas Cautelares']],
        [_LC840.segur, ['Seguridade Social','Assistência à Saúde']],
      ].map(([item, temas]) => Object.fromEntries(temas.map(t => [t, item])))
    ),
  },

  'LODF': {
    itens: ['Título I — Fundamentos da organização dos Poderes e do DF (arts. 1º a 5º)', 'Título II — Organização do DF (arts. 6º a 52)', 'Título III — Organização dos Poderes (arts. 53 a 124)', 'Título IV — Tributação e orçamento do DF (arts. 125 a 157)', 'Título V — Ordem econômica do DF (arts. 158 a 183)'],
    mapa: Object.assign({},
      ...[
        ['Título I — Fundamentos da organização dos Poderes e do DF (arts. 1º a 5º)', ['Fundamentos da Organização do DF']],
        ['Título II — Organização do DF (arts. 6º a 52)', ['Organização Administrativa do DF','Servidores Públicos','Bens do Distrito Federal','Disposições Gerais da Organização','Competência Privativa do DF','Competência Concorrente do DF','Vedações ao Distrito Federal','Vedações ao Nepotismo no DF','Competência do Distrito Federal','Competência Comum do DF','Princípios da Administração Pública','Ficha Limpa Distrital','Responsabilidade Civil do Estado','Direitos de Certidões e Informações','Representação de Servidores nas Estatais']],
        ['Título III — Organização dos Poderes (arts. 53 a 124)', ['Segurança Pública do DF','Fiscalização Contábil e TCDF','Poder Executivo: Governador e Vice','Processo Legislativo','Atribuições e Responsabilidade do Gov','Estatuto dos Deputados','Funcionamento da Câmara Legislativa','Atribuições Privativas da CLDF','Procuradoria-Geral do DF','Defensoria Pública do DF','Disposições Gerais dos Poderes','Atribuições com Sanção da CLDF','Comissões e CPIs']],
        ['Título IV — Tributação e orçamento do DF (arts. 125 a 157)', ['Tributação e Orçamento','Competência da Administração Tributária']],
        ['Título V — Ordem econômica do DF (arts. 158 a 183)', ['Ordem Econômica do DF']],
      ].map(([item, temas]) => Object.fromEntries(temas.map(t => [t, item])))
    ),
  },

  'Lei 14.133 220': {
    itens: Object.values(_L14133),
    semArtigo: { 'Princípios':_L14133.prelim, 'Modalidades de Licitação':_L14133.modal },
    artigos: [[1,10,_L14133.prelim],[11,27,_L14133.proc],[28,39,_L14133.modal],[40,52,_L14133.setor],[53,71,_L14133.julg],[72,75,_L14133.direta],[76,77,_L14133.alien],[78,88,_L14133.aux],[89,999,_L14133.fora]],
  },

  'Contratos': {
    itens: ['1 Legislação aplicável à contratação de bens e serviços', ...Object.values(_GESTAO), FORA_DO_EDITAL+' — garantias, duração e extinção dos contratos'],
    mapa: {
      'Papel do Fiscal':_GESTAO.fiscal, 'Sanções Administrativas':_GESTAO.sancoes, 'Penalidades':_GESTAO.sancoes,
      'Acompanhamento da Execução':_GESTAO.execucao, 'Execução Contratual':_GESTAO.execucao, 'Repactuação':_GESTAO.repact,
      'Registro de Irregularidades':_GESTAO.irregular, 'Registro e Notificação':_GESTAO.irregular, 'Equação Econômico-Financeira':_GESTAO.equacao,
      'Alteração dos Contratos':_GESTAO.equacao, 'Reajuste':_GESTAO.reajuste, 'Cláusulas e Indicadores':_GESTAO.clausulas, 'Papel do Preposto':_GESTAO.preposto,
      'Planejamento da Contratação':'1 Legislação aplicável à contratação de bens e serviços',
      'Legislação aplicável':'1 Legislação aplicável à contratação de bens e serviços', 'Legislação Aplicável':'1 Legislação aplicável à contratação de bens e serviços',
      'Garantias Contratuais':FORA_DO_EDITAL+' — garantias, duração e extinção dos contratos',
      'Duração dos Contratos':FORA_DO_EDITAL+' — garantias, duração e extinção dos contratos',
      'Extinção do Contrato':FORA_DO_EDITAL+' — garantias, duração e extinção dos contratos',
    },
  },

  'Decreto 44.330': {
    itens: ['1.3 Decreto distrital nº 44.330/2023 (demais dispositivos)', ...Object.values(_GESTAO)],
    padrao: '1.3 Decreto distrital nº 44.330/2023 (demais dispositivos)',
    // por assunto: os artigos citados nas questões não seguem a numeração
    // que o edital dá para o decreto
    mapa: Object.assign({ 'IMR':_GESTAO.clausulas, 'Preposto no Credenciamento':_GESTAO.preposto, 'Repactuação':_GESTAO.repact, 'Alterações Contratuais':_GESTAO.reajuste },
      ...[
        [_GESTAO.fiscal, ['Papéis dos Fiscais','Requisitos dos Fiscais','Fiscalização Administrativa','Designação de Agentes','Não-Recusabilidade do Encargo','Fiscalização Setorial','Omissão de Designação','Auxílio de Terceiros','Gestão Setorial','Requisitos dos Agentes','Fiscalizações vs Gestão','Atribuições do Gestor','Alçada de Competências','Prorrogativas do Fiscal','Atribuições do Setorial','Estudo de Capacidades']],
        [_GESTAO.execucao, ['Recebimento do Objeto','Recebimento Técnico','Recebimento Administrativo','Histórico de Gerenciamento','Gestão de Contratos','Relatório Final','Condições de Habilitação','Decisão de Pedidos','Notas Fiscais Eletrônicas','Gestão de Riscos']],
        [_GESTAO.sancoes, ['Punições a Fornecedores','Processo de Penalidades']],
      ].map(([item, temas]) => Object.fromEntries(temas.map(t => [t, item])))
    ),
  },

  'IN nº 5': {
    itens: ['1.2 Instrução Normativa nº 5/2017 (demais dispositivos)', ...Object.values(_GESTAO)],
    padrao: '1.2 Instrução Normativa nº 5/2017 (demais dispositivos)',
    mapa: { 'Fiscalização':_GESTAO.fiscal, 'Fiscalização Setorial':_GESTAO.fiscal, 'Fiscalização Administrativa':_GESTAO.fiscal, 'Reunião Inicial':_GESTAO.fiscal, 'Segregação de Funções':_GESTAO.fiscal, 'Único Servidor':_GESTAO.fiscal, 'IMR':_GESTAO.clausulas, 'IMR e Glosas':_GESTAO.irregular, 'Diário de Ocorrências':_GESTAO.irregular, 'Repactuação':_GESTAO.repact, 'Preclusão de Repactuação':_GESTAO.repact, 'Preposto':_GESTAO.preposto, 'Preposto da Empresa':_GESTAO.preposto, 'Sanções Contratuais':_GESTAO.sancoes },
    artigos: [[11,11,_GESTAO.clausulas],[17,17,_GESTAO.clausulas],[44,44,_GESTAO.preposto],[46,46,_GESTAO.irregular],[49,49,_GESTAO.irregular],[51,51,_GESTAO.irregular],[39,50,_GESTAO.fiscal],[52,53,_GESTAO.execucao],[54,60,_GESTAO.repact],[61,61,_GESTAO.reajuste],[72,73,_GESTAO.sancoes]],
  },
};

function _artigoCitado(q){
  const m = String((q.r||'') + ' ' + (q.q||'')).match(/\bart(?:igo)?s?\.?\s*(\d+)/i);
  return m ? Number(m[1]) : null;
}
function temaDoEdital(q){
  const cfg = EDITAL[q.materia];
  const orig = q.temaOriginal || q.tema;
  if(!cfg) return orig;
  if(cfg.itens && cfg.itens.includes(orig)) return orig; // já é item do edital (ex.: trocado à mão)
  const div = cfg.dividir && cfg.dividir[orig];
  if(div){
    // 1º pelo artigo citado ([de, até]); depois regex no enunciado e na explicação
    const a = _artigoCitado(q);
    for(const [m, item] of div){ if(Array.isArray(m) && a!=null && a>=m[0] && a<=m[1]) return item; }
    for(const campo of [q.q||'', q.r||'']){
      for(const [m, item] of div){ if(m instanceof RegExp && m.test(campo)) return item; }
    }
    const padrao = div.find(([m]) => !m);
    return padrao ? padrao[1] : orig;
  }
  if(cfg.artigosDaLei){
    // artigo citado junto com o número da lei (ex.: "art. 273 da LC nº 840/2011")
    const m = String(q.r||'').match(cfg.artigosDaLei.re);
    const a = m ? Number(m[1]) : null;
    const faixa = a!=null && cfg.artigosDaLei.faixas.find(([de,ate]) => a>=de && a<=ate);
    if(faixa) return faixa[2];
  }
  if(cfg.mapa && cfg.mapa[orig]) return cfg.mapa[orig];
  if(cfg.artigos){
    const a = _artigoCitado(q);
    const faixa = a!=null && cfg.artigos.find(([de,ate]) => a>=de && a<=ate);
    if(faixa) return faixa[2];
    if(cfg.semArtigo && cfg.semArtigo[orig]) return cfg.semArtigo[orig];
    if(cfg.padrao) return cfg.padrao;
  }
  if(cfg.padrao) return cfg.padrao;
  return orig;
}
// Aplica na questão. Guarda o assunto de origem uma vez só; se o assunto foi
// trocado à mão depois (difere do que o edital deu da última vez), o novo
// assunto passa a ser a origem.
function aplicarTemaDoEdital(q){
  if(!q || !q.materia) return;
  if(q.temaEdital===undefined || q.tema!==q.temaEdital) q.temaOriginal = q.tema;
  q.tema = temaDoEdital(q);
  q.temaEdital = q.tema;
}
function ehForaDoEdital(tema){ return !tema || tema==='Fora do Edital' || tema.startsWith(FORA_DO_EDITAL); }
function ordemNoEdital(materia, tema){
  const cfg = EDITAL[materia];
  const i = cfg && cfg.itens ? cfg.itens.indexOf(tema) : -1;
  return i===-1 ? (ehForaDoEdital(tema) ? 1e6 : 1e5) : i;
}
