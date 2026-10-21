// Conta quantas questões a PLATAFORMA enxerga como distintas (regra mesmaQuestao: início+fim do enunciado). Lista < esperado = a importação "perde" questões.
// Uso (na raiz do repo): node .claude/skills/formatar-resolucoes/contar_distintas.js <lista.md>
const { execSync, spawn } = require('child_process'); const fs = require('fs'); const path = require('path');
const { chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
const srv = spawn('python3', ['-m', 'http.server', '8397'], { stdio: 'ignore' });
(async () => {
  await new Promise(r => setTimeout(r, 1000));
  const b = await chromium.launch({ args: ['--no-sandbox'] }); const p = await b.newPage(); await p.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await p.goto('http://localhost:8397/index.html'); await p.waitForTimeout(1500);
  const o = await p.evaluate(md => { const r = parseTxtQuestions(md).results; const ch = r.map(x => chaveDeEnunciado(x.q)); const pai = r.map((_, i) => i); const f = i => pai[i] === i ? i : (pai[i] = f(pai[i]));
    for (let i = 0; i < r.length; i++) for (let j = i + 1; j < r.length; j++) if (ch[i] && ch[j] && finalDaChave(ch[i]) === finalDaChave(ch[j]) && mesmaQuestao(ch[i], ch[j])) pai[f(j)] = f(i);
    const gr = {}; r.forEach((_, i) => { (gr[f(i)] = gr[f(i)] || []).push(i); });
    return { total: r.length, distintas: Object.keys(gr).length, grupos: Object.values(gr).filter(g => g.length > 1) }; }, fs.readFileSync(process.argv[2], 'utf8'));
  console.log(JSON.stringify(o)); await b.close(); srv.kill();
})().catch(e => { console.log('ERR', e.message); srv.kill(); });
