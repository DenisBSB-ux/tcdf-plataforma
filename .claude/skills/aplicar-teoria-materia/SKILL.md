---
name: aplicar-teoria-materia
description: Aplica a uma matéria do TCDF Plataforma o "modelo de teoria": botão ⚖️ em cada questão (antes e depois de responder) que abre o pop-up com o texto oficial da lei, o dispositivo citado em destaque e, se houver, o trecho da apostila com a pegadinha. Use quando o usuário pedir teoria/pop-up de lei/apostila para uma matéria (ex.: "aplique na Lei 14.133", "agora o Previdenciário"). Uma matéria por vez, só quando ele pedir.
---

# Aplicar o modelo de teoria a uma matéria

**Este é o modelo fechado** (aplicado primeiro em Direito Tributário, v246–v255). Aplique igual a cada matéria **só quando o usuário solicitar**, uma por vez, sem perguntar de novo o que já está decidido aqui.

## O que o usuário vê (resultado esperado)
- Em cada questão, botões **"⚖️ CF art. 150"**, **"⚖️ CTN art. 3"**, **"⚖️ SV 19"**… no painel da resolução **e também antes de responder** (no painel "a resolução aparece aqui…").
- O botão abre o **pop-up de lei**: texto oficial do artigo, com o **§ / inciso / alínea citado na linha ⚖️ da questão em destaque amarelo** (o resto esmaecido, rola até o trecho); ‹ › e campo para navegar entre artigos; teclas ← → Esc; botão "Planalto ↗" quando há URL.
- Se a matéria tem apostila indexada, o **mesmo pop-up** traz no fim a seção **"📖 Na apostila"**: só o trecho que a questão cita (título, página, pegadinha) e o botão "Abrir o PDF nesta página". **Não existe mais** o selo "📖 Teoria · pág. N".
- Artigo sem texto na plataforma → link "⚖️ Lei · … ↗" para o Planalto (só matérias de Tributário, ver `teoriaLeiDaQuestao`). Artigo revogado/ausente do PDF → o pop-up avisa.
- A aba **Teoria (PDF)** foi removida (v262); o leitor PDF.js continua nos pop-ups. Sem Firebase Storage (plano pago, descartado).

## Arquitetura (onde mexer)
| Peça | Arquivo |
|---|---|
| Registro das normas (`LEI_FONTES`: arquivo, constante, título, `max`) e URLs do Planalto (`TEORIA_LEI_URL`) | `js/teoria.js` |
| Texto das leis, carregado sob demanda | `js/<norma>-texto.js` (`const X_TEXTO = {"art":["Art. 1º …","§ 1º …",…]}`) |
| Súmulas (enunciado + teses) | `js/sumulas-texto.js` (`"SV 19"`, `"S 323"`) |
| Trechos da apostila por artigo | `js/teoria-dt.js` (`TEORIA_TEXTO[chave]`) + índice de páginas em `js/teoria-indice.js` (`TEORIA_INDICE`, chave = início do slug da matéria; apelidos no fim do arquivo) |
| Botões antes de responder | `renderResolucaoPlaceholder(q)` em `js/estudo.js` |
| Estilo | final de `css/styles.css` (`.lei-*`) |

Como o app liga questão → norma: `refsArtigosDaQuestao(q)` (campo **Artigo**, ex.: `CF: 150`, `Lei Complementar 116: 3`) + a linha **⚖️** da resolução para ADCT, EC 132 e súmulas. As chaves de `LEI_FONTES` precisam ser **exatamente** o que `normalizarNorma` devolve: `CF`, `CTN`, `LODF`, `LC 1`, `LC 109`, `LC 116`, `LC 87`, `Lei 9.430`, `Decreto-lei 1.598` (**l minúsculo**), `ADCT`, `EC 132`, `SUM`. Para norma nova, teste com `teoriaBotaoHtml` antes de publicar.
Formato da linha ⚖️ que o destaque entende: `**Art. 150** ▸ **VI** ▸ **"a"** e **§ 2º** · CF` (artigo ▸ inciso ▸ alínea; `§ N`; `parágrafo único`). Súmulas: `**Súmula Vinculante 19** · STF` / `**Súmula 323** · STF`. ADCT/EC: `**Art. 125** · ADCT`, `**Art. 8º** · EC 132/2023`.

## Passo a passo (por matéria)
1. **Levantar o que a matéria cita**: rode `node .claude/skills/aplicar-teoria-materia/cobertura_teoria.js lista.md "<Matéria>"` na lista já formatada (skill `formatar-resolucoes`; reimportada). Ele lista as questões sem pop-up e a linha ⚖️ delas. Agrupe por norma (artigos citados × fontes disponíveis).
2. **Conseguir as fontes** (nesta ordem): (a) **pasta de teoria no Drive do usuário** (ver "Ordem de busca da teoria"); (b) PDFs anexados no chat; (c) fontes externas; (d) pedir os links oficiais (Planalto/STF). **Não há acesso à internet para páginas** (Planalto, STF, Câmara, Jusbrasil… bloqueados; só `WebSearch`, que traz resumos de sites didáticos — não use como texto de lei).
3. **Extrair o texto**:
   - PDF com texto: `download_file_content` (Drive) → o resultado é salvo em arquivo JSON; decodifique o base64 e rode `pdftotext -layout`. (`read_file_content` **trunca perto de 500 mil caracteres**; serve para leis curtas.)
   - PDF só imagem ("Microsoft Print to PDF"): `pdftoppm -r 70 -png` e leia a imagem. Dá para ler enunciado de súmula; **para lei longa peça o PDF de novo** (Ctrl+P → Salvar como PDF no Chrome) em vez de transcrever.
   - Arquivo de 0 KB no Drive = upload incompleto: peça para reenviar e confira o tamanho.
4. **Gerar o js da lei**: `python3 .claude/skills/aplicar-teoria-materia/gerar_texto_lei.py entrada.txt LC116_TEXTO lc116-texto.js "Texto da LC 116/2003" [--corte REGEX] [--depois REGEX] [--max N]`. O Planalto imprime o **texto antigo riscado antes do vigente**; o script mantém a **última** ocorrência de cada artigo e o último de cada §/inciso/alínea repetido. Confira sempre: artigos que faltam (`numeração sem texto`), um artigo longo (CF 150, LC 116 art. 3) e um com emenda. Cuidado com linhas "X – (VETADO)" (não são título).
5. **Súmulas**: enunciado e teses **só da fonte** (PDF do STF/imagem); nunca de memória. Chave `SV 19`, `S 323`.
6. **Apostila da matéria** (se o usuário tiver): extraia com `pdftotext -layout`, adapte `apostila_parse_exemplo.py` (layout da apostila de Tributário: cabeçalho `Norma — Art. N (tema)`, bloco 🎯 "Como já foi cobrado", ⚠️ "Pegadinha provável") para gerar `secoes.json`; depois `gerar_teoria_apostila.py secoes.json js/teoria-<x>.js <chave> [apelidos…]`, índice norma:artigo→página em `js/teoria-indice.js`, e inclua o `<script>` do arquivo só se for carregado fora do lazy (hoje é lazy via `apostilaCarregar`). Remova de `teoria-dt.js` o rodapé "Página N" (o gerador já faz).
7. **Registrar** em `LEI_FONTES` (e `TEORIA_LEI_URL` se houver URL oficial); se a matéria for nova no índice, apelide a chave (ex.: `D.Tributário` → `d-tributario`).
8. **Testar com Playwright** (servidor `python3 -m http.server`, abortar requisições externas): botões gerados para cada formato de linha ⚖️, pop-up abre, destaque correto (`.lei-alvo`), ‹ › Esc, console sem erro; rode `cobertura_teoria.js` de novo e informe o que ainda falta.
9. **Publicar**: subir a versão (`vNNN` e data em `index.html`, via `sed`), commit com os trailers, `git push -u origin HEAD:claude/epic-fermi-09davj --force-with-lease`, PR e squash-merge para `main`; se o PR acusar conflito após squash anterior, `git checkout -B claude/epic-fermi-09davj origin/main` e reaplique o commit. Reporte em português: quantas questões têm pop-up, quais faltam e **o que o usuário precisa enviar**.

## Ordem de busca da teoria (decidido em 19/10/2026): Drive primeiro, internet depois
Para **cada questão sem teoria**, siga sempre esta ordem e diga ao usuário de onde veio:
1. **Google Drive do usuário** (pasta de teoria do TCDF: apostilas, leis, decretos e afins). Use `search_files` do Drive **restrito à árvore dessa pasta** (`parentId = '<id>'`, descendo pelas subpastas); o link da pasta o usuário já informou no chat, e, se não estiver no contexto, peça. Subpastas conhecidas: `# Leis`, `# Decretos`, `# Instrução Normativa`, `# Regimento Interno`, `# Códigos`, `# Vade Mecum` (comercial: **não copiar para o repositório**), `07 # Leis TCDF`, `08 # Conhecimentos do DF`, e uma pasta por matéria (`010 # Direito Previdenciário`, `011 # Direito Civil`, `012 # Direito Tributário`, `015 # AFO`, `017 # Licitações`, `018 # Direito Constitucional` etc.). Procure também PDF avulso na raiz da pasta (ex.: `LC 116.pdf`, `SV 19.pdf`, `Constituição.pdf`).
   - **Cuidado:** o Drive do usuário também contém documentos de trabalho sem relação com o concurso (outras pastas da organização). Nunca use arquivo fora da árvore da pasta de teoria, e **não faça busca global** por título.
   - Arquivo de 0 KB = upload incompleto: peça reenvio. PDF só imagem: ver passo 3 abaixo. Docs com anotações do usuário não são texto oficial.
2. **Se o Drive não tiver**: fontes externas. Texto de **lei, decreto, súmula**: só de fonte oficial (peça o arquivo/link se o proxy bloquear o site). **Doutrina e conceitos**: `WebSearch` (revistas, órgãos públicos, obras de referência), síntese própria e fontes citadas.
3. Se nada confiável: liste a questão como faltante e peça o arquivo ao usuário (ele sobe na pasta do Drive e eu busco de novo).
Ao entregar, **informe apenas as fontes usadas**, em lista curta (ex.: Lei 9.430/1996, Decreto 9.203/2017, site X). Não separar por origem (Drive × externa) nem explicar o caminho percorrido; só acrescente o que faltou, se algo faltou.

## Padrão para toda lista nova (decidido pelo usuário em 19/10/2026)
**Toda questão deve ter teoria em pop-up.** Ordem de prioridade da fonte:
1. **Lei, decreto, resolução, súmula** (texto oficial): botão **⚖️** com o dispositivo destacado. Se o texto oficial ainda não está no app, peça o arquivo ao usuário (Drive/anexo) ou registre a norma em `LEI_FONTES`.
2. **Apostila do usuário** (se existir): trecho no mesmo pop-up ⚖️ ("📖 Na apostila").
3. **Sem norma aplicável (doutrina, conceito, teoria da administração etc.)**: **buscar em fontes externas** (`WebSearch`; artigos, revistas, órgãos públicos, obras de referência) e criar uma **ficha de doutrina** com **síntese própria** (nunca copiar o texto de terceiros), seções curtas, "Pegadinha provável" e **fontes citadas** no rodapé. Botão **📖 Doutrina** no mesmo pop-up.
   - Constitucional: fichas inline em `DOUTRINA` (`js/teoria.js`), ligadas pelo texto da questão (`doutrinaDaQuestao`).
   - Administração: `js/doutrina-adm.js` (`DOUTRINA_ADM`, carregado ao abrir), ligadas pelo assunto via `DOUTRINA_TEMAS`, **restritas à matéria** (`q.materia` começa com "Adm"), porque os códigos de assunto se repetem entre matérias.
   - Matéria nova: criar o arquivo `js/doutrina-<matéria>.js` no mesmo molde e uma entrada de `DOUTRINA_TEMAS` com o filtro da matéria. Conferir que **todos** os assuntos da lista abrem uma ficha (teste com Playwright) e informar o resultado.
4. Se nem norma nem fonte externa confiável existirem, **liste a questão como faltante** e diga o que o usuário precisa enviar. Nunca invente artigo, valor ou jurisprudência.
Ao entregar uma lista: arquivo `.md` + **lista das questões sem teoria** (sem relatório, a pedido do usuário). Texto de lei continua só de fonte oficial; `WebSearch` serve para doutrina, não para texto de lei.

## Decisões já tomadas (não perguntar de novo)
- Sem custo: **nada de Firebase Storage/Blaze**. PDFs: link do Drive (público) e/ou arquivo no aparelho; leitor PDF.js; link padrão da apostila vive em `TEORIA_INDICE[...].drive`.
- Um botão só por artigo (⚖️); a teoria da apostila vai **dentro** do pop-up; sem selo "Teoria".
- Mostrar só o trecho que a questão cita; o botão aparece **também antes de responder**.
- Texto de lei = **versão vigente**; revogados ficam fora.
- Uma matéria por vez, a pedido.

## Limites e cuidados
- **Direitos autorais**: não copie material comercial (ex.: *Gran Vade Mecum*, apostilas de curso, "esquematizadas") para o repositório, que é **público**; só texto oficial (Planalto/STF/Câmara/CLDF). Docs do Drive **com marcações do usuário** (negrito, comentários) não são texto oficial — não usar.
- Não escreva lei, súmula ou jurisprudência de memória; se faltar a fonte, deixe o link do Planalto e peça o arquivo.
- Cada lei extra vira um `js` baixado só ao abrir (o app não pesa); CF ≈ 500 KB, CTN ≈ 110 KB.
- A numeração das listas do usuário (#N) é a **1-based da lista**; o botão depende da lista **reimportada** (campo Artigo + linha ⚖️).

## Estado atual das fontes (no repositório)
Texto pronto: **CF (arts. 1º–250), ADCT, EC 132, CTN, LC 116, LC 87, Lei 9.430, DL 1.598, súmulas SV 19/31/52 e S 323 (Tributário)**; **LODF, LC 1/1994 (Lei Orgânica do TCDF), LC 109** (sem apostila), **RI TCDF (Res. 296/2016, só arts. 1º a 118; o PDF do Drive está incompleto: pedir o texto completo, arts. 119 em diante)**. Apostila indexada: **Direito Tributário** (`direito-tributario`, `d-tributario`).
Faltam (pedir ao usuário quando ele solicitar a matéria): **Lei 14.133 (texto oficial; a "esquematizada" não serve)**, **Lei 8.213 e 8.212**, **LC 769 e LC 932 (versões sem anotações)**, Lei 8.112, LC 840, LGPD (13.709), LAI (12.527), LRF (LC 101), Lei 4.320, Código Civil, regimento interno, decretos.
