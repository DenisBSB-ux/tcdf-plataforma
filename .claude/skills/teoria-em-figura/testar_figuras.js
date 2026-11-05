// Testa no navegador, com as questões REAIS de uma lista: cartões casam com uma única questão, as demais mostram a "resolução em figura",
// nada estoura a largura (PC 1280 px e celular 380 px). Uso: node testar_figuras.js <lista.md> "<Matéria>" [regex-da-matéria-nos-cartões]
// Precisa do site servido: python3 -m http.server 8399 (raiz do repositório).
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const fs = require('fs');
(async () => {
  const [lista, mat] = process.argv.slice(2);
  if (!lista || !mat) { console.error('uso: node testar_figuras.js <lista.md> "<Matéria>"'); process.exit(2); }
  const md = fs.readFileSync(lista, 'utf8'); const b = await chromium.launch(); let ruim = false;
  for (const [nome, vw, mob] of [['larga', 1280, false], ['estreita', 380, true]]) {
    const p = await (await b.newContext({ viewport: { width: vw, height: 1000 }, isMobile: mob, hasTouch: mob })).newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    await p.goto('http://localhost:8399/index.html'); await p.waitForTimeout(1500);
    const r = await p.evaluate(([md, vw, mat]) => {
      USUARIO_ATUAL = { uid: 't', email: 't@t', nome: 'Teste' }; AUTH_RESOLVIDO = true; APP_INICIADO = true;
      const r0 = parseMarkdownQuestoes(md); const arr = Array.isArray(r0) ? r0 : (r0.questoes || r0.results || []);
      const qs = arr.map((x, i) => Object.assign({}, x, { uid: 'x-' + i, materia: mat }));
      ALL_QUESTIONS.push(...qs, Object.assign({}, qs[0], { uid: 'x-aux', n: 99999, q: 'Auxiliar do teste' })); reindex(); STATE.materia = mat; STATE.tab = 'simulado';
      const usados = new Map(); const out = { total: qs.length, teoria: 0, resumo: 0, texto: 0, repetidos: 0, largura: 0, semFigura: [] };
      for (const q of qs) { const c = teoriaCartaoDaQuestao(q); if (c) { usados.set(c, (usados.get(c) || 0) + 1); } }
      out.repetidos = [...usados.values()].filter(v => v > 1).length;
      for (const q of qs) {
        USUARIO_ATUAL = { uid: 't', email: 't@t', nome: 'Teste' }; AUTH_RESOLVIDO = true; APP_INICIADO = true; STATE.materia = mat; STATE.tab = 'simulado';
        STATE.quiz = { queue: [q.uid, 'x-aux'], idx: 0, respostas: {}, finished: false, materia: mat, tema: 'todos' }; render(); pickAnswer(q.t === 'MC' ? 'A' : 'Certo', q.uid);
        const f = document.querySelector('.cartao-teoria');
        if (!f) { out.texto++; out.semFigura.push(q.n); continue; }
        if (f.classList.contains('ct-resumo')) out.resumo++; else out.teoria++;
        if (f.scrollWidth > f.clientWidth + 2 || f.getBoundingClientRect().width > vw + 1) out.largura++;
      }
      return out; }, [md, vw, mat]);
    console.log(nome, JSON.stringify(r), errs.slice(0, 2));
    if (r.repetidos || r.largura || errs.length) ruim = true;
  }
  await b.close(); process.exit(ruim ? 1 : 0);
})();
