# Roteiro de atualização de uma lista (padrão único — ver PADRAO.md)

Uma lista por vez. Ferramentas desta pasta; arquivos de trabalho numa pasta de rascunho (scratchpad). **Leia `PADRAO.md` antes.**

## 0. ROTEIRO RÁPIDO (padrão de 27/10/2026 — usado em Constitucional, Dir. Adm., Regimento Interno, Contratos, IN 5, Adm 8.429/9.784/2.834 e Adm Geral)
1. Pasta de rascunho `<P>` com `original.md` (arquivo do usuário) e `lotes/`, `resp/`. Copie `PROMPT_LOTE.md` para `<P>/PROMPT.md` (troque `<PASTA>` e `<MATÉRIA E NORMAS>`).
2. 1 subagente por lote de 50 questões (`INI..FIM`, 0-based): cada um escreve `lotes/bNN.py` (R: 📌/🔑/⚖️/⚠️/🪤/💡) e `resp/rNN.py` (E trecho→correção, X explicação, GAB propostas) e, se houver múltipla escolha, `resp/eNN.py` (EE: uma linha por letra). Texto de lei só pelo `lei.js`.
3. `bash fechar_lista_completa.sh <P> "<Matéria>"` → `<P>/entrega.md`: build → preparar → `montar_respostas.py` → `finalizar_lista.sh` → `inserir_explicacao.py` (Explicação nos Errados) → verificadores → **PORTÃO DO POP-UP**.
4. **Portão do pop-up (obrigatório):** `semPopup` e `popupSemTexto` têm de ser vazios. Se falhar: `python3 sugerir_popup.py <P>/entrega.md n,n,... "Sigla1,Sigla2"` (candidatos por sobreposição de palavras), confira o artigo com `lei.js` e aplique com `python3 definir_base.py entrega.md entrega2.md "n=**Art. 59** ▸ **IV** · Lei 14.133/2021" ...`; rode o portão de novo (`MATERIA="<Matéria>" node auditar_lista.js original.md entrega2.md`). Matéria doutrinária usa ficha 📖 (MATERIA correto no auditor).
4b. **Gabarito (GAB):** se o TEXTO DE LEI carregado contradiz inequivocamente o gabarito do arquivo, o subagente registra `GAB = {idx: ('de','para','dispositivo')}`; `aplicar_gab.py` (chamado pelo `fechar_lista_completa.sh`) altera o gabarito no `built.md`, o ⚠️ "Gabarito ajustado ao texto do dispositivo carregado. Constava X." fica na resolução e o relatório lista nº, de → para e dispositivo. Fato/doutrina/jurisprudência nunca usam GAB (só "Conferir o gabarito"). Cada subagente usa NN próprio (b00, b01…): nunca reaproveite o mesmo NN em dois lotes.
5. **Portão do destaque:** o relatório mostra quantos pop-ups abrem no dispositivo exato × sugerido pelo assunto × sem destaque (`auditar_destaque.js`). `semAlvo` ≠ 0 bloqueia. Em `sugerido`, refine a ⚖️ (`definir_base.py`) para §/inciso/alínea exato quando o ponto da questão estiver num parágrafo específico. Fichas de doutrina abrem na seção mais próxima da questão (🔑 + enunciado + assunto).
6. Duplicata para a plataforma (`distintas` < total em `contar_distintas.js`): se já existe no ORIGINAL, não mexa no enunciado; avise o usuário (a plataforma mantém uma das duas).
7. Entrega (SendUserFile) + relatório curto: gabaritos propostos (a lei carregada prevalece, PADRAO §4; doutrina nunca muda), "Conferir o gabarito", sem ⚖️, divergências.

## 1. Preparar
`python3 preparar_lista.py lista.md pasta/` → `pasta/base.md` (limpa: sem ID, Explicação, Ano redundante, Fonte, selo, "texto não carregado"), `pasta/tarefas.md` (itens E, C, M), `pasta/modelo_respostas.py`.
- Lista **crua** (resolução em texto livre, com Resumo Flash — ex.: lista nova do usuário): antes, escrever as resoluções no formato (⚖️ 📌 🔑 ⚠️ 🪤 💡) em lotes `bNN.py` (`R = {idx: (ess, [chaves], base, atencao, armadilha, macete)}`, lendo `montar_resolucoes.py dump`), `montar_resolucoes.py build lista.md lotes/ saida.md`, e só então `preparar_lista.py saida.md pasta/`.
- Reduzir a N questões, se pedido: `montar_resolucoes.py repetidas`, depois `reduzir` (mais recentes, proporção por assunto) e confira com `contar_distintas.js` que sobram N **distintas** para a plataforma.
- Se a norma/apostila precisa de texto novo (pop-up), crie-o antes (PADRAO.md §5).

## 2. Redigir (subagente ou direto)
- `pasta/respostas.py`: `E[nº] = ('trecho literal e único', 'palavra que torna o item certo')` em **todo** item Errado (` | ` para várias partes); `C[nº] = [palavras-chave]` onde a sugestão automática não serve; `M[nº] = {'B': 'Errada; <motivo> (dispositivo).'}` uma linha por letra errada das múltipla escolha.
- `pasta/erros.py` (ideal para múltipla escolha): `E = {idx: {'A': 'Errada; <motivo específico, sem reescrever a alternativa>.', ...}}` — UMA linha por alternativa errada, cada uma com o seu motivo (idx = posição 0-based da questão no arquivo).
- Pesquisar a norma vigente; corrigir gabarito só conforme PADRAO.md §4.

## 3. Fechar tudo com um comando
`bash finalizar_lista.sh pasta/ original_ou_ultima_entrega.md "Matéria"` → `pasta/final.md`
(aplicar_padrao → reduzir_redundancia → classificar_auto → aplicar_erros → motivar_erros → limpar_chaves → preencher_artigo → verificar_resolucoes → verificar_importador → contar_distintas → auditar_lista). Corrija o que o resumo apontar e rode de novo. Gabarito ajustado à lei (PADRAO §4): rode com `GAB_ALT=i,j bash finalizar_lista.sh …` (índices 0-based do arquivo final). Os números `#n` do relatório e da auditoria seguem o cabeçalho `## QUESTÃO n` (pode repetir em listas importadas) ou a posição 1-based — confirme pelo conteúdo antes de editar.

## 3b. Modelo das justificativas (PADRAO §2)
Depois do `finalizar_lista.sh`: gerar a revisão `rev_K.py` (subagentes, 3 lotes: `REV = {pos: {'📌':…, '⚠️':…, '💡':…, 'ERROS': {...}}}`, sem artigo, palavras certas em `==`, erradas em `~~`), aplicar com `aplicar_modelo.py final.md saida.md rev_*.py`, rodar `limpar_chaves.py` e `verificar_modelo.py` (0 problemas) e repetir os verificadores. Em lista nova, já redija 📌/⚠️/💡/ERROS neste modelo.

## 4. Entrega
Arquivo `.md` completo (SendUserFile) + 1 linha por: gabaritos alterados, itens sem pop-up, dúvidas a conferir. Orientar **🔁 Substituir por matéria** e **Ctrl+F5**. Mexeu em JS/CSS: subir `vNNN`, commit com trailers, cherry-pick em `origin/main`, PR e squash-merge.

## Scripts (resumo)
`preparar_lista.py` · `montar_resolucoes.py` (dump/build/faltantes/reduzir/repetidas/limpar) · `aplicar_padrao.py` (Trecho/Correção/ERROS inicial) · `preencher_artigo.py` (⚖️ em negrito + campo Artigo) · `reduzir_redundancia.py` · `classificar_auto.py` · `aplicar_erros.py` · `motivar_erros.py` · `dedup_erros.py` · `verificar_resolucoes.py` · `verificar_importador.js` · `contar_distintas.js` · `auditar_lista.js` · `finalizar_lista.sh`.

## 8. Ficha de doutrina incompleta (ex.: Conhecimentos do DF) — ampliar com pesquisa
Quando muitas questões trazem ⚠️ "a ficha/apostila não traz o fato": (1) `faltas.json` = questões com esse aviso (n, assunto, aviso, enunciado); (2) agentes de pesquisa seguem `PROMPT_PESQUISA_FICHA.md` (apostila no Drive primeiro, depois fontes externas com URL e passagem) e gravam `pesq_out_K.json`; (3) `node integrar_pesquisa.js <pasta> --aplicar` acrescenta linhas, seções, chaves e fontes em `js/doutrina-df.js` (subir `vNNN`); (4) na lista, o ⚠️ "Conferir o gabarito" some quando a pesquisa confirma; permanece (texto refinado) onde contraria ou é inconclusiva; correções de fato na resolução quando a pesquisa mostrar erro. Nunca mudar gabarito de fato/doutrina sem decisão do usuário.
