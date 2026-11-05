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
