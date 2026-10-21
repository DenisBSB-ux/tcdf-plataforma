# TCDF Plataforma — instruções do projeto

- App estático (HTML/JS) de estudo para o concurso do TCDF. Mudou JS/CSS: subir `vNNN` em todas as ocorrências do `index.html`.
- **Listas de questões (.md):** ao criar, atualizar, reduzir ou entregar qualquer lista de matéria, siga **sempre** `.claude/skills/formatar-resolucoes/PADRAO.md` (padrão único) e o roteiro `ATUALIZAR_LISTA.md`; feche com `bash .claude/skills/formatar-resolucoes/finalizar_lista.sh <pasta> <original.md> "<Matéria>"`. Todas as matérias saem iguais.
- Responder em português, curto. Uma lista por vez. Não colocar identificador de modelo em arquivos do repositório.
- Fluxo de publicação já autorizado: commit com os trailers pedidos, cherry-pick sobre `origin/main` novo, push com `--force-with-lease`, PR e squash-merge.
