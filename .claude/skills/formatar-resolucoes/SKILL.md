---
name: formatar-resolucoes
description: Reescreve as resoluções (### Resolução) de uma matéria do TCDF Plataforma no formato padrão com símbolos (⚖️ 📌 🔑 ⚠️ 🪤 💡), para reimportar com o botão "🔁 Substituir por matéria". Use quando o usuário pedir para atualizar/padronizar as resoluções de uma matéria (ex.: Lei 14.133, Contratos, IN 5, Decreto 44.330).
---

# Formatar resoluções de uma matéria

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
7. Aplicar a todas as matérias do mesmo jeito (a lógica é geral). Matéria específica: perguntar antes (ex.: o usuário já pediu para remover `### Resumo Flash` dos arquivos da Lei 14.133; para outras matérias, confirmar).

## Formato da resolução
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

A plataforma mostra um pop-up explicativo ao passar o mouse em cada símbolo (`SIMBOLOS_RESOLUCAO` em `js/util.js`); ele só atua no símbolo que **abre o parágrafo**, então mantenha cada bloco em uma linha própria começando pelo símbolo.

## Gabarito do arquivo × texto da lei
- **Nunca mude o gabarito.** Se a resolução que você escreveria contradiz o gabarito do arquivo, escreva a resolução **neutra** (a regra, sem afirmar o que contradiz a lei) e acrescente no ⚠️: "**Conferir o gabarito.** ..." com o motivo e o dispositivo. Foram marcadas assim, na Lei 14.133, as questões sobre **adesão à ata (carona)** (limite global: o arquivo marca o quíntuplo do Decreto 7.892/2013; a Lei 14.133 fixa o dobro) e **audiência pública** (a lei diz "poderá convocar"), entre outras.
- **Dispositivo incerto:** se não tiver certeza do parágrafo ou inciso, cite só o artigo; se não tiver certeza nem do artigo, omita a linha ⚖️.
- Critérios de armadilha criados pelo usuário (ex.: **PRAZ**) podem não constar do Guia: use o nome mais fiel ao uso e avise o usuário.
- Se a resolução antiga já trouxer o aviso "gabarito resolvido por IA, sem gabarito oficial", mantenha-o no ⚠️ (o script faz isso sozinho).

## Script
`montar_resolucoes.py` (nesta pasta) lê as questões em lotes (`dump`), recebe as resoluções que você escreve em `bNN.py` e monta o arquivo final (`build`), preservando tudo fora da seção Resolução. Trabalhe em lotes de ~18 questões.

## Passo a passo
1. Ler o arquivo e contar as questões (`## QUESTÃO n`).
2. Para cada questão, reescrever só `### Resolução` no formato acima, a partir do enunciado, do gabarito e da resolução antiga (use `montar_resolucoes.py dump` e `build`).
3. **Conferir** antes de entregar:
   - mesmo número de questões e mesmos IDs;
   - enunciados e gabaritos idênticos ao original (comparar texto);
   - nenhuma resolução repete o gabarito;
   - nenhum valor/artigo novo que não estava no material original ou na lei;
   - o arquivo, sem a seção Resolução, é idêntico ao original (comparar com a seção mascarada);
   - o importador da plataforma (`parseMarkdownQuestoes`) lê todas as questões e mantém enunciados e gabaritos.
4. Entregar o arquivo completo da matéria.
5. Orientar o usuário a reimportar com **🔁 Substituir por matéria** (progresso, edições e flashcards acompanham as questões que continuam).
6. Se a mudança envolver código da plataforma: subir a versão (`vNNN`) em todas as ocorrências do `index.html`, commit com os trailers pedidos e merge do PR na `main`.

## Histórico
- Modelo definido em conversa de 16/10/2026, com a questão da dispensa para pesquisa e desenvolvimento (art. 75, IV, "c", Lei 14.133/2021) como exemplo.
- A Lei 14.133 (232 questões do arquivo `questoes-lei-14-133-220-2026-10-16.md`) foi a primeira matéria a receber o formato (16/10/2026); as demais seguem o mesmo padrão.
