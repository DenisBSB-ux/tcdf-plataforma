---
name: formatar-resolucoes
description: Reescreve as resoluções (### Resolução) de uma matéria do TCDF Plataforma no formato padrão com símbolos (⚖️ 📌 🔑 ⚠️ 🪤 💡), para reimportar com o botão "🔁 Substituir por matéria". Use quando o usuário pedir para atualizar/padronizar as resoluções de uma matéria (ex.: Lei 14.133, Contratos, IN 5, Decreto 44.330, Análise de Dados e IA). O modelo é o da Lei 14.133, já aplicado também em Análise de Dados e IA.
---

# Formatar resoluções de uma matéria

**Este é o modelo fechado** (Lei 14.133 e Análise de Dados e IA já seguem). Aplique-o igual a toda matéria nova, sem perguntar de novo o que já está decidido aqui. Exemplos reais aprovados: `exemplos.md` (nesta pasta).

## Decisões já tomadas pelo usuário (não perguntar de novo)
- Resolução **sem** linha de perfil (🏷️): a plataforma já mostra o sinal/a armadilha no painel "Armadilha da banca".
- **Sem** `### Resumo Flash`: o script remove (padrão da Lei 14.133). Só mantenha com `--manter-resumo-flash` se o usuário pedir.
- "🔁 Substituir por matéria" usa sempre resolução, resumo flash e gabarito do arquivo, sem perguntas extras.
- **A lei prevalece sobre o gabarito (regra do usuário, 19/10/2026).** Quando o texto oficial (lei, decreto, IN, súmula) contradiz o gabarito do arquivo, **corrija o gabarito conforme a lei**, reescreva a classificação e registre no ⚠️ "Gabarito ajustado ao texto de <dispositivo>. Constava X."; na entrega liste apenas: número, de → para e dispositivo. Rode `verificar_resolucoes.py ... --gabaritos-alterados i,j` e confira que a auditoria só aponta esses. Em múltipla escolha em que nenhuma alternativa reproduz a lei, mantenha a mais próxima e avise na entrega. Resolução antiga que cita prazo/valor ausente do texto oficial: não use o dado e diga isso no ⚠️.
- Matéria **sem base legal** (estatística, gráficos, Excel, IA etc.): **omita a linha ⚖️**; cite norma só onde ela existir (ex.: LGPD; projeto de lei, com aviso de tramitação).

## Entrada
- O arquivo `.md` da matéria enviado pelo usuário (as questões não ficam no repositório).
- Sem o arquivo, não há o que fazer: peça-o.

## Regras de ouro
1. **Não altere o enunciado** (texto de `### Enunciado`). O "Substituir por matéria" reconhece a mesma questão pelo enunciado; mudar uma vírgula faz a questão perder progresso, edições e flashcards.
2. **Não altere** `ID`, `Gabarito`, `Banca/Cargo`, `Ano`, `Nível`, `Tendência`, `Assunto`, `Artigo`, `Cobrança`. Só a seção `### Resolução` é reescrita.
3. **Não repita o gabarito** dentro da resolução (ele já aparece na questão): nada de "Gabarito: CERTO" nem "O item está errado".
4. **Não invente** valores, números de artigo, decretos ou jurisprudência. Se não souber o valor atualizado (ex.: limites da Lei 14.133 atualizados por decreto), cite só o que a lei diz e avise que o valor vigente deve ser conferido no decreto do ano.
5. **Não afirme** o que a banca "já considerou" em provas sem fonte confirmada.
6. Entrega **completa**: devolva o arquivo inteiro da matéria, não só trechos.
7. Aplicar a todas as matérias do mesmo jeito (a lógica é geral); o `### Resumo Flash` é removido em todas (ver decisões acima).

## Formato da resolução
**Destaques (v212):** pouco negrito. Só os termos mais relevantes ficam em **negrito** (📌 até 2; ⚠️/🪤 até 1; ⚖️ só o dispositivo; 🔑 sem negrito) e o termo **mais importante** do 📌 vai em `==fundo amarelo==`. O `montar_resolucoes.py` aplica isso sozinho a partir da ordem das palavras-chave: coloque a mais importante primeiro na lista 🔑. Os exemplos de `exemplos.md` são anteriores a esta regra.

O perfil (sinal do item certo ou armadilha do item errado) **não entra** na resolução: a plataforma já o exibe no painel "Armadilha da banca", e repeti-lo duplica a informação. Cada bloco é uma linha que **começa pelo símbolo**, sem escrever o nome do rótulo, com **palavras-chave em negrito**. Ordem fixa; omita o bloco que não se aplica.

```
⚖️ **Art. 75** ▸ **IV** ▸ **"c"** · Lei 14.133/2021
📌 A lei **dispensa a licitação** para **produtos de pesquisa e desenvolvimento**, e, se forem **obras e serviços de engenharia**, o **teto é R$ 300.000,00**.
🔑 **dispensa** · **pesquisa e desenvolvimento** · **engenharia** · **R$ 300 mil**
⚠️ O **art. 182** manda **atualizar os valores** da lei por **decreto**, anualmente (índice IPCA-E). Se o item pedir o valor **vigente**, o número muda.
🪤 Trocar o valor (ex.: R$ 50 mil, R$ 100 mil) ou trocar **dispensa** por **inexigibilidade**.
💡 *P&D = dispensa; engenharia só até 300 mil.*
```

| Símbolo | Conteúdo |
|---|---|
| ⚖️ | Base legal: **Art. N** ▸ **inciso** ▸ **alínea** · Norma/ano. Parágrafo: `§ 6º`. |
| 📌 | Essência da regra em uma linha. |
| 🔑 | Palavras-chave separadas por ` · `. |
| ⚠️ | Atenção: exceção, atualização, detalhe que muda a resposta. |
| 🪤 | Armadilha possível da banca (como o item poderia ser alterado para ficar errado). Só em **item certo** e **múltipla escolha**; em item errado a linha 🏷️ já traz a armadilha, então omita. |
| 💡 | Macete curto, em itálico. |

Na tela, a linha 🪤 aparece com o símbolo ⚠️ (pedido do usuário, v210); no arquivo continue usando 🪤 para distinguir da linha de atenção.

A plataforma mostra um pop-up explicativo ao passar o mouse em cada símbolo (`SIMBOLOS_RESOLUCAO` em `js/util.js`); ele só atua no símbolo que **abre o parágrafo**, então mantenha cada bloco em uma linha própria começando pelo símbolo.

## Gabarito do arquivo × texto da lei
- **Nunca mude o gabarito sem avisar antes e receber confirmação.** Se a resolução que você escreveria contradiz o gabarito do arquivo, escreva a resolução **neutra** (a regra, sem afirmar o que contradiz a lei) e acrescente no ⚠️: "**Conferir o gabarito.** ..." com o motivo e o dispositivo. Foram marcadas assim, na Lei 14.133, as questões sobre **adesão à ata (carona)** (limite global: o arquivo marca o quíntuplo do Decreto 7.892/2013; a Lei 14.133 fixa o dobro) e **audiência pública** (a lei diz "poderá convocar"), entre outras.
- **Dispositivo incerto:** se não tiver certeza do parágrafo ou inciso, cite só o artigo; se não tiver certeza nem do artigo, omita a linha ⚖️.
- Critérios de armadilha criados pelo usuário (ex.: **PRAZ**) podem não constar do Guia: use o nome mais fiel ao uso e avise o usuário.
- Se a resolução antiga já trouxer o aviso "gabarito resolvido por IA, sem gabarito oficial", mantenha-o no ⚠️ (o script faz isso sozinho).

## Script
`montar_resolucoes.py` (nesta pasta) lê as questões em lotes (`dump`), recebe as resoluções que você escreve em `bNN.py` e monta o arquivo final (`build`), preservando tudo fora da seção Resolução. Trabalhe em lotes de ~18 questões. Comandos:
- `build`: reescreve as resoluções, remove o Resumo Flash, **preenche `**Artigo:**`** a partir da linha ⚖️ (ex.: `Lei 14.133: 75`; `--sem-artigo` desliga) e gera `<saida>.relatorio.md` (gabaritos a conferir, gabaritos resolvidos por IA, valores atualizáveis pelo art. 182, questões sem ⚖️).
- `faltantes`: itens certo/errado sem Sinal/Armadilha. **Proponha** a classificação ao usuário (tabela: número, enunciado, sinal/armadilha, trecho) e só aplique com `classificar <arquivo> <proposta.py> <saida>` **depois da aprovação**; o campo `Origem da classificação` fica `ia`.
- `repetidas <arquivo> [limiar]`: pares de questões quase iguais (enunciado). Só relate; não apague nada.
- `verificar_resolucoes.py <original> <final> [--gabaritos-alterados i,j]`: confere contagem, IDs, enunciados, gabaritos, máscara do arquivo, formato das linhas, negrito e ausência de Resumo Flash.
- `verificar_importador.js <original> <final>`: confere no navegador que `parseMarkdownQuestoes` lê tudo, sem mudar enunciado/gabarito, e que cada linha vira um parágrafo com pop-up.
- `valores-atualizaveis.md`: tabela dos valores do art. 182 (o usuário preenche o vigente).

## Na plataforma (v207)
- Cada símbolo mostra um pop-up explicativo ao passar o mouse (a legenda recolhível foi removida da tela a pedido do usuário).
- Sem `### Resumo Flash`, o verso do flashcard é montado com as linhas 📌, 🔑 e 💡 da resolução.

## Passo a passo
1. Ler o arquivo e contar as questões (`## QUESTÃO n`).
2. Para cada questão, reescrever só `### Resolução` no formato acima, a partir do enunciado, do gabarito e da resolução antiga (`dump` + `build`).
3. Rodar `faltantes` e `repetidas`; preparar a proposta de classificação.
4. **Conferir** com `verificar_resolucoes.py` e `verificar_importador.js`; além disso:
   - nenhum valor/artigo novo que não estava no material original ou na lei;
   - em itens numéricos, **refazer a conta** e confirmar que bate com o gabarito (se não bater, sinalizar).
5. Entregar o arquivo completo da matéria **junto com** o relatório (gabaritos a conferir primeiro), a proposta de classificação e as questões repetidas. Gabarito e classificação só mudam com a confirmação do usuário.
6. Orientar o usuário a reimportar com **🔁 Substituir por matéria** (progresso, edições e flashcards acompanham as questões que continuam).
7. Se a mudança envolver código da plataforma: subir a versão (`vNNN`) em todas as ocorrências do `index.html`, commit com os trailers pedidos e merge do PR na `main`.

## Histórico
- Modelo definido em conversa de 16/10/2026, com a questão da dispensa para pesquisa e desenvolvimento (art. 75, IV, "c", Lei 14.133/2021) como exemplo.
- A Lei 14.133 (232 questões do arquivo `questoes-lei-14-133-220-2026-10-16.md`) foi a primeira matéria a receber o formato (16/10/2026); as demais seguem o mesmo padrão.

## Padrão fixo das próximas listas (19/10/2026)
- **Entrega sem relatório**: só o arquivo `.md` completo + a **lista das questões que ficaram sem teoria (pop-up)**, mais os gabaritos duvidosos em poucas linhas.
- **Toda questão com teoria em pop-up**: **1º procurar no Drive do usuário** (pasta de teoria: apostilas, leis, decretos), **2º fontes externas**. Lei/decreto/súmula primeiro (⚖️); sem norma, ficha de **doutrina** (📖). Ver a skill `aplicar-teoria-materia`, seção "Padrão para toda lista nova".
- Lista grande: reduzir só quando o usuário pedir (ex.: "as 200 mais recentes"), **mantendo a proporção por assunto** e priorizando Ano mais recente e nível "Alta incidência".
- Classificação (Sinal/Armadilha) dos itens sem classificação: **propor e aplicar só após aprovação**.

## Depois da formatação
Para ligar cada questão ao texto oficial da lei (pop-up ⚖️ com o dispositivo destacado e a teoria da apostila), use a skill **`aplicar-teoria-materia`**, só quando o usuário pedir. Para isso a linha ⚖️ da resolução deve seguir o formato `**Art. N** ▸ **inciso** ▸ **"alínea"** e **§ N** · NORMA` (ADCT, EC 132 e súmulas: `**Art. 125** · ADCT`, `**Súmula Vinculante 19** · STF`) e o campo **Artigo** deve ficar preenchido.

## Dúvida sobre gabarito, dispositivo ou dado (regra do usuário)
Na dúvida, **siga sempre a lei, o decreto e as normas oficiais** (texto do Drive primeiro). Se a norma não resolver, **busque fontes externas** (WebSearch/WebFetch; cite a fonte na entrega). Só se ainda não achar, **o usuário decide**: liste a dúvida em uma linha (questão, o que falta) e mantenha o gabarito do arquivo até a resposta.

## Fluxo de entrega e auditoria (decidido pelo usuário — seguir em toda lista, sem perguntar)
1. **Antes de gerar a lista final e de atualizar a plataforma, rodar a auditoria**: `node .claude/skills/formatar-resolucoes/auditar_lista.js <original.md> <final.md>` (da raiz do repo). Ela confere nº de questões, ids únicos, gabarito presente e igual ao original, resolução presente e, em CADA questão, que o botão de teoria (pop-up) abre e que o dispositivo citado existe no texto carregado. Rodar também `verificar_resolucoes.py` e `verificar_importador.js`.
2. **Relatório da auditoria: simples e objetivo** (uma tabela: questões, gabaritos, resolução, pop-up, importador; depois só os pontos em aberto: gabaritos a conferir e itens sem Sinal/Armadilha; e as fontes usadas). Nada além disso.
3. **Todas as questões devem ter pop-up de teoria.** Conferir cada dispositivo citado na linha ⚖️ contra o texto oficial (artigo, §, inciso existem e dizem o que a resolução afirma); corrigir a resolução quando não bater. Se o texto oficial contradiz a resolução original ou o enunciado, não alterar o gabarito: sinalizar com "Conferir o gabarito" (ou aviso no ⚠️ quando o gabarito se mantém).
4. **Faltantes**: listar em tópicos simples (questões sem teoria + teoria necessária, com link). Procurar **primeiro no Drive** (o usuário costuma subir os arquivos depois: pesquisar de novo por título — Lei, Decreto, IN, súmula) e só então pedir upload. O texto que o usuário colar na conversa (ex.: enunciado de súmula) vale como fonte.
5. Classificação (Sinal/Armadilha) dos itens sem classificação: **propor em arquivo `.md` (tabela) e só aplicar com `classificar` após o "sim"**. Item cujo gabarito está em conferência fica fora da proposta.
6. Citação de **anexo** da IN 5: `**Anexo V** ▸ **item 2.6** ▸ **"d.1.3"** · IN 5/2017`; **súmula do TCU**: `**Súmula 251** · TCU`. Ambos abrem pop-up.
7. Publicação: se o PR der "merge conflicts" depois de um squash anterior, `git fetch origin main`, `git checkout -B <branch> origin/main`, `git cherry-pick <commit>` e `git push --force-with-lease`; esperar alguns segundos e repetir o merge.
8. Entrega do arquivo: SendUserFile do `.md` completo (cópia em `scratchpad/entrega/`), sem relatório extenso.

## Verificação obrigatória: arquivo E plataforma (regra do usuário)
Em TODA lista, antes de entregar e depois do merge, confirmar nos dois lugares que cada questão tem o pop-up de teoria:
1. **Arquivo:** `auditar_lista.js` (campos `semPopup` e `popupSemTexto` vazios).
2. **Plataforma:** o mesmo script confere `teoriaBotaoHtml` (campo `semBotaoNaPlataforma` vazio; use `MATERIA="..."` quando a lista depende de ficha de doutrina) e o código publicado: `git fetch origin main` e confirmar que o `index.html` da `main` traz a versão nova e que os arquivos `js/*-texto.js` citados em `LEI_FONTES` existem na `main`.
3. Na entrega, dizer em uma linha que os dois foram verificados e listar as exceções. Orientar sempre: Ctrl+F5 no navegador e reimportar com "🔁 Substituir por matéria".

## Mudança recente de norma ou jurisprudência (aviso do usuário)
Quando o texto compilado traz "Vide ADI ..." ou o usuário avisa que um item "sofreu alteração recente", **buscar o resultado em fonte externa** (WebSearch, mais de uma fonte; o acórdão costuma não estar acessível) antes de fechar o gabarito: o entendimento atual do STF/STJ prevalece sobre o texto compilado e sobre o gabarito antigo. Registrar no ⚠️ a decisão, a data e que o acórdão não foi conferido, e acrescentar nota (Vide ADI ...) no texto do pop-up. Exemplo (19–20/10/2026): ADI 7236/7156, concluída em 1º/7/2026, tornou a extensão da perda da função a regra (art. 12, § 1º, Lei 8.429).

## Regra de atualização de norma e jurisprudência (item obrigatório da auditoria final)
Gabarito pode mudar por **reforma da lei, ADI/ADC/ADPF, tese de repercussão geral, súmula nova ou cancelada, decisão do STJ/TCU**. Exemplo: ADI 7236 (1º/7/2026) inverteu a regra do art. 12, § 1º, da Lei 8.429. A auditoria final deve, portanto:
1. Rodar `auditar_lista.js`. Os campos `atualizacaoAConferir` (questão cita STF/STJ/TST/TSE/TCU, Tema, Súmula, "entendimento consolidado", "recentemente", Lei 14.xxx ou EC) e `dispositivoComVideADI` (o dispositivo citado tem "Vide ADI/ADC/ADPF/MP", "(Vigência)") listam os itens de risco.
2. Para **cada item de risco** sem selo: pesquisar o estado atual em fonte externa (WebSearch, ao menos duas fontes; o acórdão costuma não estar acessível), na ordem: norma oficial do Drive → fonte externa → o usuário decide.
3. Registrar no ⚠️ o selo **"Atualização verificada em DD/MM/AAAA: <resultado, órgão e data da decisão; acórdão não conferido>"**. O selo tira o item da lista de pendências do script. Se o entendimento atual contraria o gabarito, ajustar o gabarito (regra "a lei prevalece" estendida à jurisprudência atual) e avisar na entrega; se a fonte não for conclusiva, manter o gabarito e deixar "Conferir o gabarito".
4. Quando uma decisão afeta um dispositivo, procurar **todas as questões da lista que o citam** (busca pelo artigo/§ e pelo tema) e conferir se alguma outra muda de gabarito (ex.: a decisão que mudou a questão A também muda a questão B, espelhada).
5. Acrescentar nota "(Vide ADI ...: ...)" ao texto do pop-up do dispositivo atingido.
6. Na entrega: uma linha "Atualização de norma/jurisprudência: N itens conferidos (fontes); X gabaritos ajustados; Y pendentes", com os pendentes listados.

## Checklist único de análise de toda lista (consolida os critérios de 19–20/10/2026; seguir sem perguntar)
Aplicar na ordem a **qualquer lista** enviada (atualizar, completar com inéditas ou só "revisar"), mesmo que o usuário mande só o arquivo.
1. **Contar e comparar** com o enunciado do pedido (completar até N com inéditas; remover as mais antigas se pedir redução). IDs únicos; headings repetidos ou fora de ordem não importam, mas não reutilizar ID.
2. **Conferir cada questão contra o texto ATUAL da norma na plataforma** (`js/*-texto.js`; as notas "(Redação dada…)/(Alterado pelo Decreto…)" mostram o consolidado). Em decretos e leis alterados, olhar sobretudo os dispositivos com nota de alteração: foi assim que a questão do art. 12 § 3º do Decreto 44.330 (Decreto 45.422/2024) virou Errado.
3. **A lei prevalece sobre o gabarito**: corrigir o gabarito, escrever no ⚠️ o selo (item 5) dizendo de→para e o dispositivo, e avisar na entrega (nº, de→para, dispositivo). Dúvida: Drive primeiro → fonte externa (≥2) → usuário decide.
4. **Risco de atualização**: rodar `auditar_lista.js`. `atualizacaoAConferir` e `dispositivoComVideADI` são pendências até haver selo. O regex dispara também em citações de "Lei 14.133" (falso positivo em listas de decreto/contratos): conferir mesmo assim e registrar o selo "gabarito mantido".
5. **Selo no ⚠️** (padrão fixo): `Atualização verificada em DD/MM/AAAA: <o que foi conferido>`.
   - **Mudou de verdade** (norma/jurisprudência/gabarito alterado, ou questão inédita sobre dispositivo novo): descrever a mudança SEM as expressões "gabarito mantido", "sem alteração", "sem mudança", "não localizei", "mantido". É isso que faz a plataforma mostrar a badge **"⚠️ Atenção: Questão atualizada em DD/MM"** (`questaoAtualizadaAviso` em `js/atualizacoes-legais.js`) ao lado da badge de cobrança, e o chip de filtro "⚠️ Só questões atualizadas".
   - **Conferido, sem mudança**: incluir "gabarito mantido" (ou "sem alteração localizada") e, se for o caso, "acórdão/texto oficial não conferido". Isso quita a pendência do script e NÃO gera badge.
   - `comBadgeAtualizada` (auditar_lista.js) lista quem terá badge: conferir se são exatamente as questões que mudaram.
6. **Campo `**Artigo:**` obrigatório** (preenchido a partir da linha ⚖️ por `artigo_do_base`/`insere_campo`). Sem ele o botão de teoria não abre (31 questões do Tributário ficaram sem pop-up por isso). Se a lista veio sem o campo, preencher em todas. ⚖️ citando só "Reforma tributária · EC 132" não abre pop-up: citar o artigo da CF/ADCT.
7. **Pop-up em toda questão** (`semBotaoNaPlataforma`, `semPopup`, `popupSemTexto` vazios), conferindo arquivo E plataforma. Se a norma não está nos `js/*-texto.js`, incluir a fonte (skill `aplicar-teoria-materia`).
8. **Inéditas** (completar até N): escrever só com base no texto da plataforma (nunca de memória); misturar Certo (~60%) e Errado (~40%, com Armadilha, Trecho e Explicação); banca "Elaboração própria — Analista de Controle Externo (TCDF 2026)"; ano 2026; cobrir assuntos ainda pouco cobertos; sem repetir enunciado (`repetidas` ≥ 80%); 🪤 só em item Certo. Dispositivo novo (ex.: LC 225/227 na Lei 9.430) → selo de mudança (badge).
9. **Resolução**: só `### Resolução`, símbolos ⚖️ 📌 🔑 ⚠️ 🪤 💡 na ordem; 📌 com no máximo 1 `==…==` e 1 `**…**`; sem Resumo Flash (remover os vazios); ⚖️ com negrito (`**Art. 150** ▸ **VI** · CF`). Cuidado com quebras de linha e espaços não separáveis (NBSP) copiados de PDF no meio de uma linha.
10. **Classificação** (Sinal/Armadilha) faltante: propor em `.md` e aplicar só após "sim"; nas inéditas já entra classificada (origem `ia`).
11. **Conferir** com `verificar_resolucoes.py` (use `--gabaritos-alterados` para o que mudou de propósito), `verificar_importador.js` e `auditar_lista.js`; dizer na entrega que arquivo E plataforma foram verificados.
12. **Painel de matéria**: atualizar a entrada da matéria em `js/atualizacoes-legais.js` (data + resumo do que foi conferido/mudou; a regex `re` casa pelo nome da matéria) e, se tocar em JS/CSS, subir a versão (`vNNN` + data/hora), commit com trailers, PR e squash-merge. Se o `rebase` reaplicar commits já mergeados, refazer a branch: `git fetch origin main && git checkout -B <branch> origin/main && git cherry-pick <commit>`.
13. **Entrega** (curta, em português): arquivo `.md` completo; 1 linha por: gabaritos alterados (nº, de→para, dispositivo), selos/badges aplicados, fontes usadas, o que NÃO foi conferido (textos oficiais inacessíveis) e pendências que dependem do usuário (listas, PDFs no Drive). Orientar "🔁 Substituir por matéria" e Ctrl+F5.
Limites conhecidos do ambiente: Planalto, STF, SINJ, DOU e sites oficiais não abrem (só WebSearch e o Drive); portanto sempre declarar "acórdão/texto oficial não conferido" e preferir o texto já presente na plataforma (que costuma estar consolidado).

## Padrões de redação acrescentados em 20/10/2026 (valem para toda lista)
- **Múltipla escolha: bloco `⚠️ ERROS`.** Toda questão com alternativas leva, depois da 🪤 e antes da 💡, o bloco `⚠️ ERROS` seguido de uma linha `- Letra X: por que está errada (art. N)` para **cada alternativa errada**, com o dispositivo. Em `res/bNN.py` a tupla ganha um 7º elemento (lista de strings): `(ess, kws, base, atencao, armadilha, macete, [erros])`. A plataforma mostra o bloco como lista em itálico e ele é editável junto com a resolução (clicar para editar a resolução). Item "todos certos/errados" (I, II, III): justificar cada alternativa dizendo qual item a torna errada. `auditar_lista.js` lista em `mcSemBlocoErros` as questões de múltipla escolha sem o bloco; deve vir vazio.
- **Frase da 🪤 (armadilha possível): concreta e completa.** Escrever como a banca alteraria o item, em frase compreensível sem ver o enunciado: "O item ficaria errado se dissesse que …" ou "A banca pode oferecer …". Evitar comandos soltos como "Trocar o prazo" ou "Corrigir dado já anonimizado".

## Lições da lista de AFO (20/10/2026) — passos 14 a 22 do checklist único (seguir sem perguntar)
14. **Numeração**: `faltantes`, `dq2.py` e as chaves de `R`/`P` são **índices a partir de 0**; "QUESTÃO n" e as tabelas ao usuário são a partir de 1 (n = índice + 1). Ao montar `res/bNN.py` e a proposta de classificação, usar o índice e conferir pelo enunciado, nunca pelo número da tabela (a primeira proposta de AFO saiu deslocada por isso).
15. **Armadilha única**: cada questão errada fica com **uma só** armadilha (a primeira). Pares como `TRO + JUS` repetem a explicação no painel e foram removidos a pedido do usuário. Ao importar ou classificar, nunca gravar duas.
16. **⚖️ sem artigo de lei** (manual, MCASP, MTO, SIAFI, LDO do ano): omitir a linha ⚖️ e dizer no ⚠️ a fonte e que o texto não está carregado; listar a questão como "sem pop-up" na entrega. Pop-up só existe onde há dispositivo em `js/*-texto.js`.
17. **Fontes do Drive**: `download_file_content` devolve base64 (PDF > ~5 MB fecha a conexão do conector; ~5,6 MB passou, 9,3 MB não). `read_file_content` devolve texto, mas pode truncar PDFs grandes (o MTO 2026 veio só até o capítulo 2). Procurar com `list_recent_files` (o upload novo aparece ali) e salvar o JSON em arquivo antes de decodificar. Ao pedir upload, pedir capítulos separados para manuais grandes.
18. **Texto atualizado vence a resolução antiga**: ler o decreto/lei carregado inteiro, não só o artigo da resolução anterior (o Decreto 10.426 atualizado até 2026 permite taxa de administração como custo indireto até 20%; a resolução antiga dizia que era vedada).
19. **Gabarito divergente da lei com autorização do usuário** ("pesquise e corrija"): corrigir o gabarito no arquivo (alterar `**Gabarito:**` no original de trabalho, guardar cópia do original para `--gabaritos-alterados`), escrever no ⚠️ `Gabarito corrigido em DD/MM/AAAA (era X): <dispositivo>`, trocar a classificação (Sinal ↔ Armadilha) e listar na entrega (nº, de→para, base). Fonte só secundária: dizer, e se a fonte for fraca oferecer voltar. Sem autorização, só "Conferir o gabarito".
20. **Selo**: "Atualização verificada…" com mudança real **sem** as palavras "mantido", "sem alteração", "não localizei" gera o badge "Questão atualizada"; só conferido leva "gabarito mantido". Entradas novas de matéria entram em `js/atualizacoes-legais.js` (AFO já tem).
21. **Normas já carregadas para AFO** (`LEI_FONTES`): Lei 4.320, LC 101 (LRF), Lei 10.180, Decreto 32.598 (DF), Decreto 10.426, Decreto 93.872, Portaria 42. Texto de terceiros (LawCodex/br, compilado do Planalto; arquivo `js/<norma>-texto.js` com cabeçalho dizendo a fonte). Conferir se o gerador não cortou artigos com tabelas ou caixa alta (o art. 12 da Lei 4.320 perdeu os parágrafos). Portaria sem "Art. N" reconhecível pelo `artigo_do_base`: preencher `**Artigo:** Portaria 42: 2` à mão.
22. **Importador** (`verificar_importador.js`): o bloco `⚠️ ERROS` vira lista (`<ul>`), não parágrafo; o verificador já conta os itens `- ` à parte. Resolução com ERROS nas múltiplas escolha: uma linha `- Letra X: motivo (art. N)` por alternativa errada, sem inventar jurisprudência (dizer "acórdão não conferido").
23. **Sem `**Explicação:**`**: o painel "Armadilha da banca" já mostra o nome e a definição do código; a Explicação só repete a informação e o usuário mandou removê-la (20/10/2026). Em `classificar`, a proposta traz só `Armadilha` + `Trecho` (e `Sinal` nos certos); ao receber lista com o campo, apagá-lo.
