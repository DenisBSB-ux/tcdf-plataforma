# TCDF Plataforma — instruções do projeto

- App estático (HTML/JS) de estudo para o concurso do TCDF. Mudou JS/CSS: subir `vNNN` em todas as ocorrências do `index.html`.
- **Listas de questões (.md):** ao criar, atualizar, reduzir ou entregar qualquer lista de matéria, siga **sempre** `.claude/skills/formatar-resolucoes/PADRAO.md` (padrão único) e o roteiro `ATUALIZAR_LISTA.md`; feche com `bash .claude/skills/formatar-resolucoes/finalizar_lista.sh <pasta> <original.md> "<Matéria>"`. Todas as matérias saem iguais.
- Responder em português, curto. Uma lista por vez. Não colocar identificador de modelo em arquivos do repositório.
- Fluxo de publicação já autorizado: commit com os trailers pedidos, cherry-pick sobre `origin/main` novo, push com `--force-with-lease`, PR e squash-merge.
- Antes de subir código: `bash tests/run.sh` (merge entre aparelhos, textos de lei, sintaxe, versão). O GitHub roda o mesmo em todo PR (`.github/workflows/testes.yml`).
- **Figuras (teoria/resolução em figura):** o passo a passo e as ferramentas estão em `.claude/skills/teoria-em-figura/SKILL.md`. **Ao fim de cada mudança, avisar o usuário se ela precisa do upload das listas ou se a plataforma resolve sozinha**: layout, cores, botões, destaques e código = só atualizar o site; cartões novos, texto/gabarito/numeração de questões e listas novas = o usuário envia o `.md` atual da matéria (uma por vez) e reimporta com 🔁 Substituir por matéria. A nuvem exige login: não dá para buscar a lista de lá.
- **Questões sem fonte para o cartão de teoria:** ficam com a resolução em figura (já automática); antes, tentar fontes externas. Não pedir fonte ao usuário (só decisão de gabarito em dúvida). Ver a skill `teoria-em-figura`.
- **Ao final de cada matéria** (cartões + segunda busca integrados e publicados), enviar de novo ao usuário a lista `.md` atualizada e dizer se ele precisa reimportar. Pedido do usuário em 10/11/2026.
- **Ordem do envio (pedido do usuário em 11/11/2026):** a lista `.md` atualizada é SEMPRE a última coisa enviada: primeiro o resumo em texto, depois o `SendUserFile` da lista como último passo do turno, sem texto depois dele.
