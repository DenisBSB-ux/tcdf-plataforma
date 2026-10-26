---
name: atualizacao-legal-semanal
description: Rotina semanal do TCDF Plataforma que confere mudanças em leis, decretos, súmulas e jurisprudência de TODAS as matérias, registra as alterações em js/atualizacoes-legais.js (selo + ALTERACOES_LEGAIS) para a plataforma sinalizar matérias e questões afetadas, e abre PR. Use na rotina agendada ou quando o usuário pedir para conferir atualizações legais.
---

# Atualização legal semanal (versão 26/10/2026)

Objetivo: manter fiel o selo `⚖️ DD/MM/AAAA` de cada matéria e registrar cada mudança em `ALTERACOES_LEGAIS` (`js/atualizacoes-legais.js`), que a plataforma usa para: (a) contar alterações no selo da matéria (clique abre o painel), (b) etiquetar as questões que citam o dispositivo (🔔 norma alterada), (c) alimentar o filtro "Só questões atualizadas". Também aparecem sozinhas as etiquetas 🔄 (gabarito revisado, linha ⚠️ "Gabarito ajustado…") e ❓ (gabarito a conferir).

## 0. Acesso ao repositório (obrigatório, foi o que falhou em 26/10/2026)
A sessão da rotina pode iniciar SEM o repositório. Antes de qualquer coisa:
1. `ToolSearch` com `select:mcp__claude-code-remote__add_repo,mcp__claude-code-remote__check_repo_access` e chame `add_repo` (owner `denisbsb-ux`, repo `tcdf-plataforma`, access `push`); depois clone/`register_repo_root` conforme a resposta.
2. Se mesmo assim o repositório não vier ou o push der 403: NÃO encerre em silêncio. Entregue o conteúdo pronto (diff do `js/atualizacoes-legais.js`) no resumo e em arquivo, notifique o usuário dizendo "push negado" e peça para autorizar o repositório na rotina. Nunca declare sucesso sem PR aberto.

## 1. Escopo: todas as matérias (lista dinâmica, vale para matérias novas)
NÃO use lista fixa. Gere a lista lendo as chaves de `EDITAL` em `js/edital.js` (`node -e` ou grep `^  '...': {`) e, em `js/teoria.js`, as normas de `LEI_FONTES`; toda matéria/norma encontrada deve ter entrada em `ATUALIZACOES_LEGAIS` (crie com `re` que case o nome da matéria; sem entrada a plataforma mostra "⚖️ sem conferência"). Ao adicionar uma matéria nova ao app (lista nova, `EDITAL`, norma nova em `LEI_FONTES`), crie já a entrada do selo — a rotina da semana seguinte passa a conferi-la sozinha. Não pule matéria: se não pesquisou, mantenha a data e diga "não conferida" no PR.

## 2. Pesquisa (por matéria/norma)
Use `LEI_FONTES` (`js/teoria.js`) e o `resumo` atual como ponto de partida. WebSearch com ≥2 fontes (Drive de normas oficiais primeiro, se houver; depois Planalto/STF/STJ/TCU/TCDF/DODF e Estratégia, Gran, QConcursos, EC Concursos, Conjur, Migalhas, Dizer o Direito). Procure: lei/decreto/EC/IN novos ou revogações, alterações de artigos cobrados, súmulas/temas novos ou cancelados, julgamentos de ADI/RE. Sites oficiais costumam estar bloqueados: registre "texto oficial não conferido". Nunca invente número, artigo ou data; sem fonte, escreva "não localizei".

## 3. Registro (arquivo `js/atualizacoes-legais.js`)
- Sem mudança: atualize só `data` (hoje) e, se útil, acrescente "Reconferido em DD/MM/AAAA: nada novo localizado (fontes)".
- Com mudança: atualize `data`/`resumo` e acrescente item em `ALTERACOES_LEGAIS` com: `id` (kebab, ex. `ec141-2026`), `mat` (regex do nome da matéria), `titulo`, `resumo` (1–3 frases, com o que mudou e o que pode afetar), `fonte`, `registrada` (AAAA-MM-DD de hoje), `status` (`confirmada` só se o texto oficial já estiver carregado em `js/*-texto.js`; senão `a-conferir`), `dispositivos` (`[{norma:'CF', n:7}]`; norma exatamente como no campo Artigo da lista — `CF`, `Lei 14.133` etc.), `termo` (regex opcional que restringe às questões do assunto), `gabarito` (decisão tomada ou '' se pendente). Sem `dispositivos` o item vale só para a matéria.
- Item resolvido (usuário decidiu / texto oficial carregado): mude `status` para `confirmada` e preencha `gabarito`; não apague (histórico). Itens com mais de 90 dias e resolvidos podem ser removidos.
- NÃO altere gabaritos, listas nem textos de lei sozinho. Quando uma mudança contradiz gabarito, liste no PR: nº/ID da questão (ou dispositivo), gabarito atual, o que a norma passa a dizer, fonte, e a decisão pendente.

## 4. Versão, commit e PR
Suba `vNNN` em todas as ocorrências do `index.html` (e a data/hora de build) — o `CLAUDE.md` do repositório manda. Commit com os trailers pedidos, push na branch de trabalho, abra PR (sem merge; o usuário revisa). Corpo do PR: tabela `matéria | conferido? | mudou? | fonte | pendência` + seção "Gabaritos/questões afetadas (decisão do usuário)". Teste antes: `node --check js/atualizacoes-legais.js` e carregar `index.html` sem erro.
