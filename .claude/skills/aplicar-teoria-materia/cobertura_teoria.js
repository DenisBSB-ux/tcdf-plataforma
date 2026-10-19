// Lista as questões de uma matéria que NÃO ganham botão de pop-up de lei/teoria (usa o próprio app, com o importador real).
// Uso (na raiz do repositório): node .claude/skills/aplicar-teoria-materia/cobertura_teoria.js <lista.md> "<Nome da matéria>"
// Requer playwright (npm root -g) e Chromium; sobe um servidor estático temporário (porta 8398).
const { execSync, spawn } = require('child_process'); const fs = require('fs'); const path = require('path');
const { chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
const [arq, materia] = process.argv.slice(2);
if (!arq || !materia) { console.log('uso: node cobertura_teoria.js <lista.md> "<matéria>"'); process.exit(2); }
const md = fs.readFileSync(arq, 'utf8'); const srv = spawn('python3', ['-m', 'http.server', '8398'], { stdio: 'ignore' });
(async () => {
  await new Promise(r => setTimeout(r, 1000));
  const b = await chromium.launch({ args: ['--no-sandbox'] }); const p = await b.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); await p.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await p.goto('http://localhost:8398/index.html'); await p.waitForTimeout(1200);
  const out = await p.evaluate(([md, mat]) => parseMarkdownQuestoes(md).results.map((q, i) => {
    q.materia = mat; q.uid = 'x' + i; const h = teoriaBotaoHtml(q);
    return { n: i + 1, botoes: (h.match(/data-lei-ver="[^"]*"/g) || []).map(x => x.slice(14, -1)), link: /href=/.test(h),
      linha: ((String(q.r).match(/⚖️\s*([^\n]*)/) || [])[1] || '').replace(/\*/g, '') };
  }), [md, materia]);
  const sem = out.filter(o => !o.botoes.length);
  console.log(`total ${out.length} | com pop-up ${out.length - sem.length} | sem ${sem.length}`);
  sem.forEach(o => console.log(`#${o.n} ${o.link ? '(só link do Planalto)' : '(nada)'} | ${o.linha || '(sem linha ⚖️)'}`));
  if (errs.length) console.log('erros de página:', errs);
  await b.close(); srv.kill(); process.exit(0);
})();
