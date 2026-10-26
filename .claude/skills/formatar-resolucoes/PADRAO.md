# PADRÃO ÚNICO das listas de questões (TCDF Plataforma)

Todas as matérias saem **iguais**. Este arquivo reúne tudo o que o usuário decidiu (out/2026). Antes de mexer em qualquer lista, leia-o inteiro; para executar, siga `ATUALIZAR_LISTA.md` (um comando fecha a lista: `finalizar_lista.sh`).

## 1. Cabeçalho de cada questão
Campos e ordem: `Banca/Cargo` · `Nível | Tendência` · `Assunto` · `Cobrança` · `Artigo` · `Sinal` (item Certo) **ou** `Armadilha` (item Errado) · `Trecho` · `Correção` (só Errado) · `Origem da classificação: ia|manual`.
- **Sem** `ID`, **sem** `Explicação`, **sem** `Ano` quando o Banca/Cargo já traz o ano, **sem** `⚠️ Fonte:`, **sem** `Atualização verificada…`, **sem** "texto não carregado", **sem** `### Resumo Flash`.
- `Artigo` é derivado da linha ⚖️ (`Lei 14.133: 75`, `LC 94: 5`…). Nunca altere `Gabarito`, `Banca/Cargo`, `Nível`, `Tendência`, `Assunto`, `Cobrança` e **nunca o texto do enunciado** (a plataforma reconhece a questão pelo enunciado; mudar uma vírgula perde progresso/edições/flashcards).
- **Trecho/Correção (Errado):** `Trecho` = trecho **literal e único** do enunciado que torna o item errado; `Correção` = a palavra/expressão que o torna certo. Mais de uma parte: separar por ` | ` (mesmo número de partes nos dois). Na tela: o trecho errado fica riscado (vermelho) e a correção ao lado (verde).
- **Trecho (Certo):** só as palavras-chave que levam à resposta certa (amarelo).
- **Sinal/Armadilha:** itens sem classificação são classificados direto, sem pedir "sim" (autorizado 21/10/2026), com `Origem da classificação: ia` (`classificar_auto.py`); relate quantos.

## 2. Resolução (`### Resolução`)
Cada bloco é uma linha que **começa pelo símbolo**; ordem fixa; omita o que não se aplica:
`⚖️` base legal · `📌` essência · `🔑` palavras-chave (separadas por ` · `) · `⚠️` atenção · `🪤` armadilha possível (só item Certo e múltipla escolha; **uma** única) · `💡` macete curto · bloco `⚠️ ERROS` (só múltipla escolha).
- **Sem** linha de perfil (🏷️); **não repetir o gabarito** ("o item está certo/errado") nem o enunciado.
- **⚖️:** só com dispositivo conferido no texto de lei carregado (`js/*-texto.js`); formato `**Art. N** ▸ **inciso** ▸ **"alínea"** · Norma/ano`. Matéria sem base legal (dados, IA, geografia, história…): omitir ⚖️. Nunca citar artigo de memória; se não conferir, omita.
- **MODELO das justificativas (usuário, 26/10/2026):** `📌 Esgotado o prazo sem deliberação, o veto vai à ordem do dia e ==tranca a pauta==; não há ~~caducidade~~ nem ~~preclusão~~.` → (1) **sem citação de artigo** em 📌, ⚠️, 💡, 🪤 e ERROS (nada de "art. 37, XI", "§ 2º", "inciso", "alínea"; o dispositivo fica só na linha ⚖️ e no pop-up; súmula/tema/ADI podem ficar); (2) **destaque das palavras corretas** (`==` o decisivo, até 1 `**`); (3) **riscado `~~x~~` nas palavras erradas/contrárias** (em item Errado, as do Trecho; em múltipla escolha, o conceito errado: "e não ~~X~~"), 1 a 3 por linha, só quando o 📌 contrapõe o certo ao errado. `verificar_modelo.py` confere; `aplicar_modelo.py` aplica uma revisão `rev_K.py` pronta.
- **Destaques:** pouco negrito. 📌 até 2 termos em **negrito** e o mais importante em `==fundo amarelo==`; ⚠️/🪤 até 1; 🔑 sem negrito. As palavras-chave devem ser as que **definem o gabarito** (a plataforma as destaca no enunciado e na alternativa correta a partir de 📌 + 🔑 — escolha-as com isso em mente; evite termo solto fora de contexto, ex.: "Três Poderes" quando só aparece na assertiva errada).
- **🔑 só com termos reais da questão:** cada termo deve aparecer no enunciado, nas alternativas ou no 📌 — nada de rótulos abstratos ("generalização", "inversão", "negação absoluta"); `limpar_chaves.py` remove os que não aparecem.
- **Sem redundância:** 💡, 🪤, ⚠️ e linhas de ERROS que só repetem o 📌 são removidos (`reduzir_redundancia.py`, limiar 0,7; linhas com termo ~~riscado~~ ficam).
- Não invente número, data, nome, valor, decreto, jurisprudência. Matéria com número que muda por decreto: cite o que a lei diz e avise para conferir o vigente.

## 3. ERROS (múltipla escolha) — UMA letra por linha, SEM reescrever a alternativa
- **Uma linha por alternativa errada, nunca agrupar letras.** Formato do usuário (21/10/2026): `- Letra B: Errada; a CF (art. 32) veda a divisão do DF em municípios; Brasília é a capital, não um município.`
- **Não reescrever/citar o texto da alternativa errada** (nada de ~~riscado~~ da alternativa nem repetir o que ela diz): vai direto ao **motivo** — o fato correto, com o dispositivo quando conferido. O motivo deve se entender sozinho (sem "é o oposto", "isso", "ela").
- **Cada letra tem o seu próprio motivo** (não repetir a mesma frase em todas). Letras verdadeiras de uma questão "assinale a incorreta": `- Letra A: Certa; <por quê>.`
- Assertivas I–IV ("Apenas I e II"): `- Letra C: Errada; a assertiva III é falsa (não houve incêndio total no STF) e a I, verdadeira, ficou de fora.`
- **NÃO REPETIR A MESMA INFORMAÇÃO (reclamação repetida do usuário):** o fato correto já está no 📌 — não o repita nas letras; cada linha traz só o que é específico da alternativa (o elemento errado, em poucas palavras, e por que está errado). Nenhuma cláusula (texto entre `;`) pode aparecer em duas letras do bloco nem copiar o 📌. `verificar_erros.py` confere isso (≥80% das palavras de conteúdo) e `finalizar_lista.sh` o roda.
- **Sem citação de artigo nas linhas de ERROS** (modelo acima): diga o fato, não o número do dispositivo. Não escrever `)` logo após uma letra (o leitor trata `A)` como lista alfabética).
- Fluxo: `aplicar_padrao.py` cria um ERROS inicial (via `M[n]`); entregue `erros.py` (`E = {idx: {'A': 'Errada; motivo.', ...}}`) para `aplicar_erros.py` trocar o bloco; `motivar_erros.py` separa letras agrupadas e converte formatos antigos ("~~x~~ está errado: M", "<certo>, ~~errado~~") para `Errada; M`.

## 4. Gabarito
- **A lei prevalece sobre o gabarito** quando o texto oficial **carregado** contradiz o arquivo (regra do usuário, 19/10/2026): corrija conforme o dispositivo, registre no ⚠️ "Gabarito ajustado ao texto de <dispositivo>. Constava X." e liste na entrega só: nº, de → para, dispositivo (`verificar_resolucoes.py --gabaritos-alterados i,j`).
- Questão **sem** lei (fato, doutrina, dado): **não mude** o gabarito; se duvidoso, `Conferir o gabarito…` no ⚠️ e relate. Nunca afirme erro que o texto de lei/apostila não confirma (escreva "conferir o fundamento").

## 5. Pop-up de teoria (toda questão deve ter)
- Botão ⚖️ com o texto oficial (`js/*-texto.js`, registrado em `LEI_FONTES` de `js/teoria.js`) **ou** 📖 ficha de doutrina (`js/doutrina-*.js`; Admin Geral, PDPM, Primeiros Socorros, Conhecimentos do DF) feita da **apostila** do Drive. Auditar com `auditar_lista.js` (`semPopup`, `popupSemTexto` devem ser 0).
- Texto de lei novo: copiar **literal** de fonte confiável (Drive do usuário: Planalto/PDF); sem acesso à internet, pedir ao usuário. Citação aproximada é pior que pop-up ausente.
- **Edital** oficial (PDF no Drive, 22/11/2026) manda no que está "dentro do edital" (ex.: Conhecimentos do DF = realidade étnica, social, histórica, geográfica, cultural, política e econômica do DF + RIDE); `js/edital.js` reflete isso.

## 6. Tamanho da lista (quando o usuário pede "reduza para NQ")
- Manter as mais recentes e a proporção por assunto; tirar primeiro as repetidas. **Conferir com `contar_distintas.js`**: a plataforma une questões com mesmo início+fim de enunciado (`mesmaQuestao`); a lista deve ter exatamente N **distintas** (senão a importação "perde" questões).
- Verifique contra um original também reduzido (`montar_resolucoes.py reduzir`).

## 7. Tela (plataforma) — já implementado, não desfazer
Painel "Armadilha da banca" **sem** "classificação: …"; resolução exibida **sem** as linhas ⚖️ e ⚠️ (mantém o bloco ERROS e o botão de teoria); destaque das palavras-chave 📌+🔑 no enunciado e na alternativa correta (a 1ª ocorrência de cada termo **por campo**; pode repetir entre enunciado, alternativas e justificativa); atalhos Shift e S removidos; `~~x~~` vira riscado.

## 8. Entrega e publicação
- Relatórios **curtos, em português**; arquivo `.md` **completo** + 1 linha por: gabaritos alterados, itens sem pop-up, dúvidas de conteúdo a conferir. Orientar **🔁 Substituir por matéria** e **Ctrl+F5**.
- Mudou JS/CSS: subir `vNNN` em **todas** as ocorrências do `index.html`, commit com os trailers pedidos, cherry-pick sobre `origin/main` novo, `push --force-with-lease`, PR e **squash-merge** (fluxo já autorizado). Nunca colocar identificador de modelo em arquivo do repositório.
- Uma lista **por vez**. Subagentes só redigem `respostas.py`/`erros.py`/lotes de resolução; verificadores e publicação são do coordenador.

## 9. Checklist de saída (tudo verde antes de entregar)
`verificar_modelo.py` OK (sem artigo nas justificativas) · `verificar_resolucoes.py` OK · `verificar_importador.js` (enunciadosIguais true, gabaritosDivergentes [], resolucoesMalFormatadas []) · `contar_distintas.js` (distintas = total) · `auditar_lista.js` (semPopup 0, popupSemTexto 0) · 0 itens sem classificação · 0 resíduos proibidos. `finalizar_lista.sh` roda tudo e imprime esse resumo.

## Diretriz de interface (26/10/2026)
- **Item Errado (classificação):** Principal = `JUS - Justificativa falsa` quando o erro é conceitual/fundamento inválido; **Trecho** = fragmento original exato (letra por letra) que torna o item errado; **Explicação da armadilha** = justificativa técnica curta, direta e objetiva (campo `**Explicação:**`).
- **Na tela:** enunciado intacto; só o trecho errado vem `~~riscado~~` seguido da correção em `**negrito**`; abaixo, apenas a Explicação sob a etiqueta `Justificativa:` (sem saudação/prefácio/fecho).
- **Janela da lei:** sem botões Anterior/Próximo artigo e sem bloco "Na apostila"; cabeçalho = nome da lei + campo do artigo + ✕; texto oficial; card final "⚠️ Pegadinha provável" ligado ao artigo.
- **Virada automática de gabarito (autorizada 26/10/2026):** alteração legal `confirmada` com `trecho` + `gabaritoNovo` vira o gabarito (item Certo/Errado cujo enunciado traz a redação antiga) e recebe a etiqueta 🔄. Só vale com texto de lei carregado/fonte oficial; doutrina e jurisprudência seguem "a conferir".
- **Homologação:** questão com gabarito virado por norma alterada mostra o botão **✔ Revisado**; ao confirmar, o gabarito vira definitivo (homologado). Classificação automática: Principal `NORMA - Norma alterada`. A badge **Norma alterada** fica sempre na questão; o filtro "Só questões atualizadas" lista as ainda não confirmadas e a questão sai dele quando o moderador confirma em ✔ Revisado.
