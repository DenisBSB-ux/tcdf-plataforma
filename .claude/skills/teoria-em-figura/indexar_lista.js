// Lê a lista (.md) com o MESMO parser da plataforma e grava o índice por posição: [{pos, n, q}].
// Uso: node indexar_lista.js <lista.md> <indice.json>      (precisa do site servido: python3 -m http.server 8399, na raiz do repositório)
// Por que posição: listas com número de cabeçalho repetido; o cartão se liga por número + código do enunciado (ver SKILL.md).
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const fs = require('fs');
(async () => {
  const [lista, saida] = process.argv.slice(2);
  if (!lista || !saida) { console.error('uso: node indexar_lista.js <lista.md> <indice.json>'); process.exit(2); }
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('http://localhost:8399/index.html'); await p.waitForTimeout(1500);
  const md = fs.readFileSync(lista, 'utf8');
  const r = await p.evaluate(md => { const r0 = parseMarkdownQuestoes(md); const a = Array.isArray(r0) ? r0 : (r0.questoes || r0.results || []); return a.map((x, i) => ({ pos: i + 1, n: x.n, q: x.q })); }, md);
  fs.writeFileSync(saida, JSON.stringify(r));
  const norm = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  const rep = r.length - new Set(r.map(x => x.n)).size;
  console.log(r.length + ' questões; números de cabeçalho repetidos: ' + rep + '; enunciados idênticos: ' + (r.length - new Set(r.map(x => norm(x.q))).size));
  await b.close();
})();
