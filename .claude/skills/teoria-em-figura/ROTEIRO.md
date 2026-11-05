# Roteiro: "Teoria em figura" para questões de Direito Tributário
Você produz cartões de teoria (dados JS) para um bloco de questões. NUNCA cite lei de memória.

## Entradas
- Lista: <lista.md>  (blocos `## QUESTÃO n`; leia Enunciado, Gabarito e a linha ⚖️ da Resolução).
- Texto da lei: `node /home/user/tcdf-plataforma/.claude/skills/formatar-resolucoes/lei.js "CF" 150` (siglas: CF, CTN, "Lei 9.430", "LC 116", "LC 87", "ADCT", "EC 132", "Decreto-lei 1.598"). Leia o(s) artigo(s) citados na linha ⚖️ ANTES de escrever cada cartão. Se o dispositivo não estiver carregado ("artigo não carregado") ou for jurisprudência/súmula sem texto carregado, PULE a questão e registre em skip.

## Saída (um arquivo JS por bloco, caminho dado na tarefa)
```js
/* Teoria em figura — Direito Tributário, bloco X */
TEORIA_CARTOES.push(
  { m:/tribut/i, n:24, titulo:'Conceito de tributo', base:'CTN, art. 3º', fonte:[['CTN',3]],
    regra:'Tributo é toda {0|prestação pecuniária} {1|compulsória}, ... {4|atividade administrativa plenamente vinculada}.',
    pontos:[ { ico:'💰', t:'Pecuniária', d:'em moeda, ou valor que nela se possa exprimir' }, ... ],
    armadilha:'Troca típica que a banca faz (curta).' },
);
```
Campos: `n` = número do `## QUESTÃO n`; `fonte` = lista [sigla do lei.js, número do artigo] de TODO artigo usado; `base` = citação legível (ex.: 'CF, art. 150, III, "b"'); `regra` = 1–2 frases (≤ 300 caracteres) com o núcleo da regra que a questão testa, com 3 a 5 marcadores `{i|palavra-chave}` (i = 0..4, em ordem, cada i usado uma vez, o marcador i corresponde ao ponto i); `pontos` = exatamente o mesmo número de itens que marcadores (3 a 5), cada um `{ico (1 emoji), t (≤ 28 caracteres), d (≤ 70 caracteres)}`; `armadilha` ≤ 140 caracteres.
## Regras de ouro
1. A figura ensina a REGRA da lei — não diga se o enunciado está certo/errado, não repita o gabarito. Ela deve servir a quem errar a questão.
2. Palavras marcadas e números devem estar no texto lido da lei (copie literalmente os termos-chave; não parafraseie números, prazos, alíquotas, quóruns).
3. Não invente artigo, inciso, prazo, jurisprudência. Se tiver dúvida, omita o detalhe.
4. Questões com "Conferir o gabarito" na resolução: faça a figura só da regra literal da lei (neutra) ou pule.
5. Várias questões sobre o mesmo dispositivo: faça cartões DIFERENTES, cada um focado no que aquela questão testa (títulos distintos), sem repetir o mesmo texto.
6. Aspas simples dentro de strings devem ser escapadas (\') ou use aspas duplas no texto. Sem identificador de modelo em nenhum arquivo.
7. Escreva também `skip` num arquivo de texto ao lado (`<saida>.skip.txt`): `n: motivo` por linha.
## Conferência antes de entregar
Rode: node .claude/skills/teoria-em-figura/validar.js <arquivo.js>  e corrija até não haver ERRO. Responda só com: quantos cartões, quantos pulados, e avisos que não resolveu.
