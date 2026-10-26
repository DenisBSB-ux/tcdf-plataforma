# Roteiro de atualização de uma lista (padrão único — ver PADRAO.md)

Uma lista por vez. Ferramentas desta pasta; arquivos de trabalho numa pasta de rascunho (scratchpad). **Leia `PADRAO.md` antes.**

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
