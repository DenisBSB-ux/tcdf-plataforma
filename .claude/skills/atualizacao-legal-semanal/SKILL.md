---
name: atualizacao-legal-semanal
description: Rotina semanal do TCDF Plataforma que confere mudanças em leis, decretos, súmulas e jurisprudência das matérias e atualiza o selo "Atualizada em" (js/atualizacoes-legais.js). Use na rotina agendada ou quando o usuário pedir para conferir atualizações legais.
---

# Atualização legal semanal

Objetivo: manter o selo `⚖️ Atualizada em DD/MM/AAAA` de cada matéria (arquivo `js/atualizacoes-legais.js`) fiel à última conferência de mudanças em leis, decretos, súmulas e jurisprudência.

## Passos
1. Ler `js/atualizacoes-legais.js` e a lista de normas em `LEI_FONTES` (`js/teoria.js`). Cada entrada do selo corresponde a uma matéria (regex `re`).
2. Para cada matéria/norma, pesquisar na web (WebSearch, ≥2 fontes; Drive de normas oficiais primeiro quando houver) mudanças recentes: nova lei/decreto/IN alterando a norma, revogações, súmulas novas ou canceladas, julgamentos do STF/STJ/TCU/TCDF sobre os temas cobrados. Sites oficiais (Planalto, STF etc.) costumam estar bloqueados: use o que a busca devolver e diga que o acórdão/texto oficial não foi conferido.
3. Sem mudança: só atualizar `data` (AAAA-MM-DD de hoje) e, se útil, o `resumo`.
4. Com mudança: atualizar `data` e `resumo` (uma frase com a mudança e a fonte); NÃO alterar gabaritos nem textos de lei sozinho. Listar no PR as questões/dispositivos afetados e o que o usuário precisa decidir (regras em `formatar-resolucoes`: lei prevalece sobre gabarito divergente, avisar antes de alterar; riscar trecho vencido no pop-up com `~~...~~`).
5. Subir a versão (`vNNN` e data/hora em `index.html`), commit com os trailers, push na branch de trabalho e abrir PR. Não fazer merge: o usuário revisa. Corpo do PR: tabela matéria | conferido | mudou? | fonte | pendência.
6. Nunca inventar artigo, valor ou julgamento; sem fonte, escrever "não localizei".

## Critérios de análise (valem aqui e em toda lista nova)
Os critérios completos estão em `.claude/skills/formatar-resolucoes/SKILL.md`, seção "Checklist único de análise de toda lista". Na rotina semanal: o selo do painel (`js/atualizacoes-legais.js`) só muda de data depois de pesquisa real; quando algo mudou, descrever a mudança no `resumo` e listar no PR as matérias e os dispositivos cujas questões precisam de selo/badge ou de gabarito revisto (as listas ficam com o usuário, não no repositório). Nunca registrar "conferido" sem fonte.
