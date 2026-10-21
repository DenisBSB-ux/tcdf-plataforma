# Roteiro de atualização de uma lista (padrão final, 21/10/2026)

Uma lista por vez. Ferramentas desta pasta; arquivos de trabalho numa pasta de rascunho.

## 1. Preparar
`python3 preparar_lista.py lista.md pasta/` → `pasta/base.md` (limpa: sem ID, Explicação, Ano redundante, "Fonte:", "Atualização verificada", "texto não carregado"), `pasta/tarefas.md`, `pasta/modelo_respostas.py`.
- Reduzir antes, se pedido: `montar_resolucoes.py repetidas` → `montar_resolucoes.py reduzir <arq> <idx,...> <saida>` (mais recentes; mantém a proporção por assunto).
- Lista nova ou sem resolução padrão: `montar_resolucoes.py build` (+ `pipeline.sh`), `faltantes` e `classificar` (após "sim").

## 2. Redigir (`pasta/respostas.py`)
- `E[nº] = ('trecho literal e único', 'palavra que torna o item certo')` para todo item **Errado** (` | ` para mais de uma parte, mesmo nº de partes).
- `C[nº] = [palavras-chave]` só quando a sugestão automática não serve (itens **Certo**).
- `M[nº] = {'B': 'correto, ~~errado~~ (dispositivo).'}` uma linha por letra errada das **múltipla escolha**; letras com o mesmo motivo viram uma linha (`Letras B e D:`) automaticamente.
- Pesquisar a norma/diretriz vigente; corrigir resolução e gabarito **só com autorização** do usuário (senão "Conferir o gabarito" no ⚠️ e relatar na entrega).

## 3. Aplicar e conferir
`python3 aplicar_padrao.py pasta/base.md pasta/respostas.py saida.md` (valida trecho literal/único, partes, letras do ERROS).
Depois: `verificar_resolucoes.py original saida [--gabaritos-alterados i,j] [--removidas i,j]`, `verificar_importador.js original saida`, `MATERIA="Nome" node auditar_lista.js original saida`.

## 4. Entrega (curta, em português)
Arquivo `.md` completo + 1 linha por: gabaritos alterados, itens sem pop-up, pendências do usuário. Orientar "🔁 Substituir por matéria" e Ctrl+F5. Se mexer em JS/CSS: subir `vNNN`, commit com trailers, PR e squash-merge.

## Regras do padrão (resumo)
Sem ID/Explicação/Fonte/selo; 📌 🔑 💡 (+ ⚖️/⚠️/🪤 quando couber); armadilha única; ERROS objetivo com `~~termo errado~~` e sem repetição; `**Trecho:**` + `**Correção:**` nos errados e `**Trecho:**` (palavras-chave) nos certos; pop-up em toda questão (lei em `js/*-texto.js` ou ficha em `js/doutrina-*.js`); enunciado nunca alterado.
