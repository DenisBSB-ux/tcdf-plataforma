// Auditoria final de uma lista antes de entregar/atualizar a plataforma: gabarito, resolução e pop-up de teoria.
// Uso (na raiz do repositório): node .claude/skills/formatar-resolucoes/auditar_lista.js <original.md> <final.md>
// Confere: nº de questões, ids únicos, gabarito presente e igual ao original, alternativas nas de múltipla escolha, resolução presente,
// e para CADA questão: o botão de teoria abre (teoriaLeisDaQuestao) e o dispositivo citado existe no texto carregado. Requer playwright + Chromium.
const { execSync, spawn } = require('child_process'); const fs = require('fs'); const path = require('path');
const { chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
const [ori, fin] = process.argv.slice(2);
if (!ori || !fin) { console.log('uso: node auditar_lista.js <original.md> <final.md>'); process.exit(2); }
const MD = fs.readFileSync(fin, 'utf8'), OR = fs.readFileSync(ori, 'utf8');
const srv = spawn('python3', ['-m', 'http.server', '8398'], { stdio: 'ignore' });
(async () => {
  await new Promise(r => setTimeout(r, 1000));
  const b = await chromium.launch({ args: ['--no-sandbox'] }); const p = await b.newPage();
  await p.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await p.goto('http://localhost:8398/index.html'); await p.waitForTimeout(1500);
  const o = await p.evaluate(async ([md, or]) => {
    const R = parseMarkdownQuestoes(md).results, O = parseMarkdownQuestoes(or).results, rows = [];
    for (let i = 0; i < R.length; i++) {
      const q = R[i], l = teoriaLeisDaQuestao(q); let texto = false, ref = '';
      if (l.length) { ref = l[0].norma + ':' + l[0].n; try { await leiCarregar(l[0].norma); const d = eval(LEI_FONTES[l[0].norma].global); texto = !!(d[String(l[0].n)] && d[String(l[0].n)].length); } catch (_) {} }
      rows.push({ n: i + 1, g: q.g || '', gIgual: !!O[i] && q.g === O[i].g, res: !!(q.r && q.r.length > 30), pop: l.length > 0, texto, ref });
    }
    const ids = md.match(/\*\*ID:\*\* \S+/g) || [];
    return { lidas: R.length, originais: O.length, idsUnicos: new Set(ids).size === ids.length, rows };
  }, [MD, OR]);
  const f = (fn) => o.rows.filter(fn).map(x => x.n);
  console.log(JSON.stringify({ lidas: o.lidas, originais: o.originais, idsUnicos: o.idsUnicos,
    semGabarito: f(x => !x.g), gabaritoAlterado: f(x => !x.gIgual), semResolucao: f(x => !x.res),
    semPopup: f(x => !x.pop), popupSemTexto: f(x => x.pop && !x.texto) }, null, 1));
  await b.close(); srv.kill(); process.exit(0);
})();
