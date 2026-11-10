---
name: teoria-em-figura
description: Gera e mantém as "figuras" das resoluções do TCDF Plataforma (cartões de teoria com fonte e resolução em figura). Use quando o usuário enviar uma lista .md e pedir figuras/teoria em figura de uma matéria, ou perguntar se uma mudança precisa de upload das listas.
---

# Teoria em figura / Resolução em figura

## O que existe (tudo no site, sem IA em tempo de execução)
1. **Teoria em figura** (`js/teoria-cartoes*.js`): cartão por questão, com regra (palavras-chave coloridas `{i|palavra}`), 3 a 5 pontos, faixa de armadilha e **rodapé com a fonte** (lei carregada ou `ext:{nome,url,trecho literal}`).
2. **Resolução em figura** (`cartaoResolucaoHtml` em `js/teoria-cartoes.js`): para TODA questão sem cartão que tenha a linha 📌 na resolução, o texto escrito vira figura (regra com 🔑 coloridas + Atenção/Macete/Armadilha). Não precisa de lista nova nem de fonte.
3. **Destaque automático** (`_ctDestacaTexto`): verbos (verde), adjetivos (rosa), negações/limites (vermelho sublinhado), por heurística em português.
4. `renderResolucao` (`js/estudo.js`) mostra só a figura (teoria > resolução > texto escrito). Em edição não há campo de justificativa nem botão "Restaurar"; só "Corrigir classificação" + a figura. O texto escrito antigo só volta se a questão tem aviso de alteração legal ou não tem 📌.

## Quando precisa de upload das listas (AVISAR O USUÁRIO AO FIM DE CADA MUDANÇA)
- **Não precisa** (basta atualizar o site): layout, cores, destaques, botões, correções de código, resolução em figura.
- **Precisa**: novos cartões de teoria (preciso do texto das questões), mudança de enunciado/gabarito/resolução/numeração, questões novas, padronização de lista (reimportar com 🔁 Substituir por matéria).
- **Caso intermediário**: cartões já publicados aparecem sozinhos se a lista do usuário tiver os mesmos enunciados e a mesma numeração. Se a lista for renumerada, os cartões só voltam depois da reimportação (o identificador interno é `matéria-número`; a importação migra progresso/edições pelo enunciado).
- A nuvem (Firestore) exige login: **não dá para buscar a lista de lá**. Pedir o `.md` atual da matéria, uma matéria por vez.

## Identificação do cartão
`{ m:/regex da matéria/i, n:<número do cabeçalho>, h:'<código do enunciado>', ... }`. O `h` (FNV-1a do enunciado sem acentos/pontuação) existe porque há listas com número de cabeçalho repetido. Cartão sem `h` casa só por `n` (Tributário). O teste exige unicidade de `n`+`h`.

## Passo a passo por matéria
1. Receber o `.md`; diagnosticar: nº de questões, números repetidos, quantas têm 📌, normas citadas (`node ../formatar-resolucoes/lei.js normas`). Comparar com cópias antigas pelo enunciado COMPLETO (não só o começo) e pela alternativa correta.
2. Se faltar o padrão (📌 🔑 ⚠️ 🪤 💡), padronizar seguindo `../formatar-resolucoes/PADRAO.md` (só a seção Resolução; ID/enunciado/gabarito intactos; verificar com `verificar_resolucoes.py` e `verificar_importador.js`). Gabarito: nunca alterar sem listar e ter confirmação.
3. Servir o site (`python3 -m http.server 8399` na raiz) e indexar: `node indexar_lista.js lista.md indice.json`.
4. Gerar em blocos de ~50 questões (subagentes), por **posição** (`pos:K`), seguindo `ROTEIRO.md`, `ROTEIRO_EXT.md` e, para matérias de conceito, `ROTEIRO_ANALISE.md`. Cada agente valida com `LISTA=lista.md [MATERIA=…] [MAXPOS=N] node validar.js arquivo.js`.
5. Filtrar a qualidade ANTES de integrar: descartar cartão cuja fonte só sustenta parte do ponto que decide a questão, está datada, é fraca demais ou contradiz a resolução da lista; listar essas divergências para o usuário (sem alterar gabarito).
6. Converter `pos` em `n`+`h`: `node converter_pos.js indice.json entrada.js saida.js`; gravar em `js/teoria-cartoes-<matéria>.js`; incluir o `<script>` em `index.html` (depois de `teoria-cartoes.js`) e subir `vNNN`.
7. `bash tests/run.sh` + `node testar_figuras.js lista.md "<Matéria>"` (cartões em questões distintas; as demais com resolução em figura; largura ok em 1280 e 380 px). PR, esperar o teste, squash-merge.
8. Entregar relatório curto: situação, o que falta (pos, nº, assunto, início do enunciado), conferências pedidas e o que depende do usuário.

## Regra permanente para questões sem cartão (decisão do usuário)
Questão sem fonte suficiente **não vira pendência para o usuário**: a base é a **resolução em figura** (já automática). Antes de desistir, **tentar fontes externas** (STF por API, Senado, STJ, sites jurídicos e de concursos, documentação oficial) e fazer o cartão se o trecho literal sustentar o ponto. No relatório, listar as que ficaram só com a resolução em figura como informação, sem pedir fonte ao usuário (só pedir decisão sobre gabaritos em dúvida, que continuam dependendo da confirmação dele).

## Fontes e limites (aprendidos)
- Texto de lei: só via `lei.js` (nunca de memória). Cartão de lei usa `fonte:[['CF',150]]`; as palavras marcadas e os números devem existir no texto lido (o `validar.js` avisa).
- Fonte externa: trecho **literal** (≤ 260 caracteres), nome e URL da página lida. Ordem: lei carregada > STF/Senado/órgãos oficiais > organismos e docs oficiais (NIST, OCDE, Microsoft Learn, Embrapa, IPEA, ENAP) > universidades > sites jurídicos/de concursos > Wikipédia (último recurso).
- STF: API pública `jurisprudencia.stf.jus.br` (POST) via `curl` — ver `stf.js` e `stfq.py`; dá súmulas e ementas literais (tese de repercussão geral em `documental_tese_*`). IN RFB: texto multivigente em repositórios (ex.: CGU).
- O **Node não usa o proxy da sessão; `curl` usa**. WebFetch dos agentes pode falhar: ler páginas com Bash+curl. Planalto, gov.br genérico, df.gov.br, IBGE, UNESCO e IPHAN bloqueiam acesso automatizado: **não contornar**.
- Cartões neutros quando a resolução manda "Conferir o gabarito"; nunca afirmar o que a fonte não diz.
- Listas de conceito (Análise de Dados, Conhecimentos do DF) rendem ~55–85% de cartões; o resto fica com a resolução em figura.

## Histórico (nov/2026)
- v393–v394: figura piloto (Q24) e Tributário 1–150; v395: 151–301; v396–v401: fonte externa (STF, Senado, sites) e Q196 com a IN RFB 1.234/2012. Tributário: 289/300 cartões.
- v402–v404: Análise de Dados e IA (200 questões, 2 novas da LGPD); cartão por n+h; 173/200 cartões.
- v405–v408: resolução em figura para todas as questões sem cartão.
- v409–v410: Conhecimentos do DF (203, lista padronizada e renumerada), 114 cartões.
- v411–v412: edição sem campo de justificativa/Restaurar, sem "Base legal", destaque de verbos/adjetivos/negações.
- Relatórios de pendências ficam com o usuário (por matéria): o que falta, conferências de gabarito e fontes.
- v417: **Reta Final** (`js/reta-final.js`): aba única que substitui "Caderno de erros" e "Flashcards" no menu (as telas clássicas continuam por links dentro dela). Hoje (plano do dia por fase até a prova), Caderno de erros (por causa e nível), Cartões de lacuna (gerados das marcas das figuras; agenda em `bucket.srs`, sincronizada no merge), Prontidão e Cola de véspera (imprimir). Só precisa das figuras já publicadas; não exige upload de listas.
- v421–v422: Direito Civil (233, lista padronizada e renumerada): 224 cartões de lei + 6 com fonte externa (STJ Súmulas 195 e 385, STF Tema 786 e ADI 4815, Decreto 9.830 e LC 95 via Senado). O PDF oficial das súmulas do STJ (stj.jus.br/docs_internet/SumulasSTJ.pdf) é acessível por curl; o Senado (legis.senado.leg.br/norma/...) traz o texto de leis e decretos.

- **RJU/LC 840 (06/11/2026, v423):** lista de 241 padronizada e renumerada; 240 cartões (`teoria-cartoes-rju.js`); pos 237 (art. 211, sem fonte na lei carregada) fica com resolução em figura. Cartões seguem o texto da lei quando a resolução antiga divergia.
- **Primeiros Socorros (09/11/2026, v427):** lista de 100 padronizada; 90 cartões (`teoria-cartoes-ps.js`, fontes externas SAMU/MS, bombeiros, UFMG, SBP, MSD; CP art. 135). Ficam com resolução em figura: 2, 7, 9, 15, 27, 29, 37, 40, 69, 86 (sem fonte literal ou divergência com a lista).
- **PDPM Mulheres (09/11/2026, v429):** lista de 200 padronizada (resoluções 21/25/29 refeitas, ERROS por letra); 186 cartões (`teoria-cartoes-pdpm.js`, Lei 11.340 + Decreto 42.590 carregados; ADI 4424 e súmulas STJ via ext). Ficam com resolução em figura: 2, 16, 22, 79, 82, 83, 87, 98, 101, 106, 110, 121, 125, 129, 133, 141, 144, 163, 164, 167, 176, 177.
  - 2ª rodada PDPM: +8 cartões ext (16, 110, 121, 125, 133, 167, 176, 177); pos 129 (Decreto 9.586, revogado pelo 12.443/2025) fica com resolução em figura.
- **Constitucional (09/11/2026, v430):** lista de 250 padronizada e renumerada (47 números repetidos); 230 cartões (`teoria-cartoes-cf.js`, CF/ADCT carregados + STF via ext). Resolução em figura: 6, 8, 10, 18, 29, 31, 33, 37, 39, 45, 47, 49, 64, 80, 93, 111, 172, 175, 185, 190. CF carregada traz EC 141/2026 (40 h semanais): resoluções com 44 h estão desatualizadas.
  - 2ª rodada Constitucional (v431): +16 cartões ext (6, 8, 10, 18, 29, 31, 33, 37, 39, 45, 47, 64, 93, 172, 175, 190); 246/250. Sem cartão: 49, 80, 111, 185. Cartões 6/8/10/33/37 usam artigo da Revista da ESMAL (fonte doutrinária fraca).
- **Adm Geral & Pub (09/11/2026, v432):** lista de 300 padronizada (Q8 reescrita; ERROS por letra); 220 cartões (`teoria-cartoes-adm.js`; CF/Lei 9.784/CTN/Lei 14.133 carregados + DL 200, Lei 8.987/13.303/9.790/9.637/13.848, STF e STJ via ext).
  - 2ª rodada Adm Geral & Pub (v434): +46 cartões ext; 266/300. Sem cartão: 8, 12, 16, 43, 44, 49, 50, 65, 69, 74, 78, 80, 82, 95, 97, 105-108, 110, 112, 114, 116, 118-120, 123, 129, 179, 186, 214, 227, 238, 288. Parte das fontes doutrinárias são artigos de revistas (PGE-SP, TRF3, RIL/Senado), mais fracas que lei.
- **Previdenciário (09/11/2026, v435):** lista de 233 padronizada e renumerada (34 repetidos; Q51 reescrita); 224 cartões (`teoria-cartoes-prev.js`, só normas carregadas + Tema 445 STF e Súmula 507 STJ). Resolução em figura: 36, 37, 42, 58, 105, 171, 174, 175, 187.
  - 2ª rodada Previdenciário (v436): +6 cartões (36, 37, 58, 171, 174, 175); 230/233. Sem cartão: 42, 105, 187.
- **Importar várias matérias (09/11/2026, v437):** botão "📚 Importar várias matérias" na aba Importar (`js/importacao-lote.js`): escolhe vários .md/.txt, identifica o destino de cada um (conteúdo ≥50%, ID das questões, título "# Nome", nome do arquivo; senão matéria nova), mostra tela de conferência (destino editável) e importa tudo com "Substituir" (existente) ou criação (nova), publicando na nuvem uma vez no fim. PDF continua por "Escolher arquivo".
- **Backup diário (09/11/2026, v438):** cópia automática no aparelho passa a ser por dia do calendário (14 dias) e o arquivo de backup .json é baixado sozinho 1x/dia na primeira abertura (opção no cartão de backup, ligada por padrão).
- **IN nº 5 (10/11/2026, v440):** lista de 100 padronizada e renumerada (15 repetidos); 99 cartões (`teoria-cartoes-in5.js`, IN 5/2017 e Lei 14.133 carregadas). Sem cartão: 33.
  - 2ª rodada IN nº 5 (v441): +1 cartão (33, ext gov.br/compras, Anexo VII-A 7.6); 100/100.
- **Decreto 44.330 (10/11/2026, v442):** lista de 53 padronizada e renumerada (3 repetidos); 52 cartões (`teoria-cartoes-d44.js`, Decreto 44.330, IN 5 e Lei 14.133 carregados). Sem cartão: 23 (IMR, Anexo VIII-A da IN 5).
  - 2ª rodada Decreto 44.330 (v443): +1 cartão (23, ext gov.br/compras, Anexo VIII-A item 1); 53/53.
- **Contratos (10/11/2026, v444):** lista de 200 padronizada e renumerada (68 repetidos; Q133 com ERROS por letra); 200 cartões (`teoria-cartoes-ctr.js`, Lei 14.133, IN 5, Decreto 44.330 e Súmulas TCU carregados; Q99 com Anexo VIII-A via ext). Sem puladas, então sem segunda busca.
