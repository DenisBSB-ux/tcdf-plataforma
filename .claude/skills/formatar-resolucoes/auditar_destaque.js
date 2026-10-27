// Mede, questão a questão, se o pop-up de teoria abre NO TRECHO ESPECÍFICO do assunto (PADRAO §5).
// Uso (raiz do repositório): MATERIA="<Matéria>" node .claude/skills/formatar-resolucoes/auditar_destaque.js <lista.md>
// Saída (JSON): comBotaoLei, exato (⚖️ cita § / inciso / alínea e o texto foi localizado), sugerido (⚖️ só com o artigo: o site destacou o caput ou o
// parágrafo mais próximo — vale refinar a ⚖️ para o dispositivo exato), semAlvo (BLOQUEIA: abre o artigo sem destaque), fichas (doutrina: seção e linha).
const { execSync, spawn } = require('child_process'); const fs = require('fs'); const path = require('path');
const { chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
const f = process.argv[2]; if (!f) { console.log('uso: MATERIA="..." node auditar_destaque.js <lista.md>'); process.exit(2); }
const srv = spawn('python3', ['-m', 'http.server', '8396'], { stdio: 'ignore', cwd: process.cwd() });
(async () => {
  await new Promise(r => setTimeout(r, 1000));
  const b = await chromium.launch({ args: ['--no-sandbox'] }); const p = await b.newPage();
  await p.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await p.goto('http://localhost:8396/index.html'); await p.waitForTimeout(1500);
  const o = await p.evaluate(async ([md, mat]) => {
    const R = parseMarkdownQuestoes(md).results; const c = { total: R.length, comBotaoLei: 0, exato: 0, sugerido: 0, semAlvo: 0, listaSugerido: [], listaSemAlvo: [], fichas: 0, fichaSemLinha: 0, listaFichaSemLinha: [] };
    for (let i = 0; i < R.length; i++) {
      const q = R[i]; q.uid = 'a' + i; q.materia = q.materia || mat; q.tema = q.tema || q.assunto || ''; BY_UID[q.uid] = q;
      const l = teoriaLeisDaQuestao(q);
      if (l.length) {
        c.comBotaoLei++; await leiAbrir(l[0].norma + ':' + l[0].n, q.uid); await new Promise(r => setTimeout(r, 15));
        const corpo = document.getElementById('lei-corpo'); const al = corpo.querySelectorAll('.lei-alvo').length;
        const lm = String(q.r || '').match(/⚖️\s*([^\n]*)/); const ln = lm ? lm[1] : '';
        const preciso = /▸|§|inciso|par[áa]grafo|[IVX]+\b/.test(ln) && !corpo.classList.contains('lei-alvo-sugerido');
        if (!al) { c.semAlvo++; c.listaSemAlvo.push(i + 1); } else if (preciso) c.exato++; else { c.sugerido++; c.listaSugerido.push(i + 1); }
      } else {
        const k = doutrinaDaQuestao(q); if (!k) continue; c.fichas++;
        await doutrinaAbrir(k, q.uid); await new Promise(r => setTimeout(r, 15));
        if (!document.querySelectorAll('#lei-corpo .lei-alvo').length) { c.fichaSemLinha++; c.listaFichaSemLinha.push(i + 1); }
      }
    }
    return c;
  }, [fs.readFileSync(f, 'utf8'), process.env.MATERIA || '']);
  console.log(JSON.stringify(o)); await b.close(); srv.kill();
})();
