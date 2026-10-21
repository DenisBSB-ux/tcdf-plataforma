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
- **Destaques:** pouco negrito. 📌 até 2 termos em **negrito** e o mais importante em `==fundo amarelo==`; ⚠️/🪤 até 1; 🔑 sem negrito. As palavras-chave devem ser as que **definem o gabarito** (a plataforma as destaca no enunciado e na alternativa correta a partir de 📌 + 🔑 — escolha-as com isso em mente; evite termo solto fora de contexto, ex.: "Três Poderes" quando só aparece na assertiva errada).
- **Sem redundância:** 💡, 🪤, ⚠️ e linhas de ERROS que só repetem o 📌 são removidos (`reduzir_redundancia.py`, limiar 0,7; linhas com termo ~~riscado~~ ficam).
- Não invente número, data, nome, valor, decreto, jurisprudência. Matéria com número que muda por decreto: cite o que a lei diz e avise para conferir o vigente.

## 3. ERROS (múltipla escolha) — por alternativa
- **Uma linha por alternativa errada**: o que ela deveria dizer + o termo errado **da própria alternativa riscado**: `- Letra B: a Casa do Cantador é obra de Niemeyer, ~~projeto de Lúcio Costa~~.` Nunca repetir só a resposta certa sem mostrar o erro.
- Assertivas I–IV ("Apenas I e II"): aponte a assertiva falsa e o termo errado dela.
- Letras que só mudam o riscado viram **uma** linha: `- Letras A, B e C: <frase certa>. Erros — letra A: ~~x~~; letra B: ~~y~~; letra C: ~~z~~.` (`compactar_erros.py`; **nunca** escrever `)` logo após a letra — o leitor trata `A)` como lista alfabética e quebra a linha).
- Questão "assinale a incorreta": as letras verdadeiras levam uma frase curta dizendo por que são verdadeiras (sem riscado).
- Dispositivo entre parênteses só quando conferido (`(art. 5º, II)`); em alínea use aspas (`I, "a"`).
- Fluxo: `aplicar_padrao.py` cria um ERROS inicial (via `M[n]` do `respostas.py`); o ideal é entregar `erros.py` (`E = {idx: {'A': '...'}}`) para `aplicar_erros.py` trocar o bloco por linhas por alternativa.

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
`verificar_resolucoes.py` OK · `verificar_importador.js` (enunciadosIguais true, gabaritosDivergentes [], resolucoesMalFormatadas []) · `contar_distintas.js` (distintas = total) · `auditar_lista.js` (semPopup 0, popupSemTexto 0) · 0 itens sem classificação · 0 resíduos proibidos. `finalizar_lista.sh` roda tudo e imprime esse resumo.
