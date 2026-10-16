// Confere que o importador da plataforma (parseMarkdownQuestoes) lê o arquivo final igual ao original.
// Uso (na raiz do repositório): node .claude/skills/formatar-resolucoes/verificar_importador.js <original.md> <final.md>
// Requer playwright (npm root -g) e Chromium; sobe um servidor estático temporário.
const { execSync, spawn } = require('child_process'); const fs = require('fs'); const path = require('path');
const root = execSync('npm root -g').toString().trim();
const { chromium } = require(path.join(root, 'playwright'));
const [ori, fin] = process.argv.slice(2);
if (!ori || !fin) { console.log('uso: node verificar_importador.js <original.md> <final.md>'); process.exit(2); }
const MD = fs.readFileSync(fin, 'utf8'), OR = fs.readFileSync(ori, 'utf8');
const srv = spawn('python3', ['-m', 'http.server', '8399'], { stdio: 'ignore' });
(async () => {
  await new Promise(r => setTimeout(r, 1000));
  const b = await chromium.launch({ args: ['--no-sandbox'] }); const p = await b.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); await p.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await p.goto('http://localhost:8399/index.html'); await p.waitForTimeout(1200);
  const out = await p.evaluate(([md, or]) => {
    const a = parseMarkdownQuestoes(md), o = parseMarkdownQuestoes(or); const R = a.results, O = o.results;
    const ruins = [];
    R.forEach((q, i) => { const linhas = limparResolucao(q.r).split('\n').filter(Boolean).length; const d = document.createElement('div');
      d.innerHTML = formatarTextoComDestaque(limparResolucao(q.r)); if (d.querySelectorAll('p').length !== linhas || d.querySelectorAll('.sim-dica').length !== linhas) ruins.push(i); });
    return { lidas: R.length, originais: O.length, ignoradas: a.ignoradas, semGabarito: a.semGabarito,
      enunciadosIguais: R.every((q, i) => q.q === O[i].q), gabaritosDivergentes: R.map((q, i) => q.g === O[i].g ? -1 : i).filter(i => i >= 0),
      comResumoFlash: R.filter(q => q.rf).length, comArtigo: R.filter(q => q.art || q.artn).length, resolucoesMalFormatadas: ruins };
  }, [MD, OR]);
  console.log(JSON.stringify(out, null, 1), errs.length ? errs : ''); await b.close(); srv.kill(); process.exit(0);
})();
