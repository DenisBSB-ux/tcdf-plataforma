# Roteiro: cartões "Teoria em figura" com FONTE EXTERNA (Direito Tributário)
Complementa ROTEIRO.md (leia-o primeiro: formato, campos, limites, regras de ouro). Aqui as questões foram puladas porque o texto de lei carregado não cobre o tema (jurisprudência/súmula, doutrina, economia tributária, norma não carregada).
## O que fazer
1. Para cada questão do seu lote: leia enunciado, gabarito e resolução na lista (caminho no ROTEIRO.md) e entenda a regra testada.
2. Pesquise com WebSearch/WebFetch em FONTE CONFIÁVEL, nesta ordem de preferência: STF (portal.stf.jus.br — súmulas, teses de repercussão geral, informativos), STJ, Senado/Câmara (texto de lei), Receita Federal, Tesouro/ENAP, livros/artigos de universidades públicas. Não use blogs de cursinho nem fóruns. Se um site recusar acesso automatizado, NÃO tente contornar: use outra fonte.
3. Só faça o cartão se encontrar a regra/tese em texto LITERAL na fonte e ela for coerente com o gabarito da questão (ou neutra se a resolução mandar "Conferir o gabarito"). Caso contrário, pule e registre o motivo em skip.
## Campos extras no cartão
- Em vez de `fonte:[…]` (lei carregada), use `ext:{ nome:'STF, Súmula 323', url:'https://…', trecho:'citação literal curta (≤ 250 caracteres) copiada da fonte' }` (`fonte` pode ficar ausente se não usar lei carregada; se usar, mantenha).
- `base` descreve a fonte (ex.: 'STF, Súmula 323').
- A `regra` e os pontos devem refletir o `trecho` literal; não acrescente números, prazos ou teses que não estejam nele.
- Nada de afirmar "o STF decidiu" sem o texto da tese na fonte.
## Entrega
Arquivo JS (TEORIA_CARTOES.push(...)) e `.skip.txt` nos caminhos dados. Rode `node .claude/skills/teoria-em-figura/validar.js <arquivo>`: cartões com `ext` não são checados contra a lei, mas estrutura e marcadores sim; corrija ERROs. Responda só com contagens e dúvidas, listando para cada cartão a URL usada.
