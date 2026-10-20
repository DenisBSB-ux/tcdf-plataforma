// Auditoria final de uma lista antes de entregar/atualizar a plataforma: gabarito, resolução e pop-up de teoria.
// Uso (na raiz do repositório): node .claude/skills/formatar-resolucoes/auditar_lista.js <original.md> <final.md>
// Confere TAMBÉM a plataforma: teoriaBotaoHtml (o botão que o aluno vê) para cada questão. Para listas com ficha de doutrina (ex.: Administração Geral e Pública) passe MATERIA="Administração Geral e Pública".
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
  const o = await p.evaluate(async ([md, or, MAT]) => {
    const R = parseMarkdownQuestoes(md).results, O = parseMarkdownQuestoes(or).results, rows = [];
    for (let i = 0; i < R.length; i++) {
      const q = R[i], l = teoriaLeisDaQuestao(q); let texto = false, ref = '';
      if (l.length) { ref = l[0].norma + ':' + l[0].n; try { await leiCarregar(l[0].norma); const d = eval(LEI_FONTES[l[0].norma].global); texto = !!(d[String(l[0].n)] && d[String(l[0].n)].length); } catch (_) {} }
      q.uid = q.uid || ('u' + i); q.materia = q.materia || MAT; q.tema = q.tema || q.assunto || '';
      const html = teoriaBotaoHtml(q); const botao = /data-lei-ver|data-doutrina/.test(html);
      let vide = false;
      if (l.length) { try { const dd = eval(LEI_FONTES[l[0].norma].global); const ps0 = dd[String(l[0].n)] || []; const mk = leiMarcar(ps0, leiAlvosDaQuestao(q, l[0].norma, l[0].n)); const ps = mk ? ps0.filter((_, ii) => mk.has(ii)) : ps0.slice(0, 1); vide = ps.some(x => /\(Vide (ADI|ADC|ADPF|ADO|Medida Provis|S[úu]mula|Tema)|\(Vig[êe]ncia\)|\(Vide Decreto/i.test(x)); } catch (_) {} }
      const juris = /(STF|STJ|TST|TSE|TCU|Tema \d|S[úu]mula|jurisprud|entendimento (consolidado|sumulado|do Supremo)|repercuss[ãa]o geral|recentemente|Lei n?[º.]* ?14\.\d{3}|Emenda Constitucional)/i.test((q.q || '') + ' ' + (q.r || ''));
      const conferido = /(Atualiza[çc][ãa]o verificada|Verificado em|Conferido em)/i.test(q.r || '');
      let badge = false; try { badge = !!questaoAtualizadaAviso(q); } catch (_) {}
      rows.push({ n: i + 1, vide, juris, conferido, badge, g: q.g || '', gIgual: !!O[i] && q.g === O[i].g, res: !!(q.r && q.r.length > 30), pop: l.length > 0 || botao, botao, texto: texto || (botao && l.length === 0), ref });
    }
    const semArtigo = []; md.split(/\n(?=## QUESTÃO )/).slice(1).forEach((bl, k) => { if (/^⚖️/m.test(bl) && !/^\*\*Artigo:\*\*/m.test(bl)) semArtigo.push(k + 1); });
    const ids = md.match(/\*\*ID:\*\* \S+/g) || [];
    window.__semArtigo = semArtigo;
    const mcSemErros = []; md.split(/\n(?=## QUESTÃO )/).slice(1).forEach((bl, k) => { if (/^- \*\*[A-E]\)\*\*/m.test(bl) && !/^⚠️ ERROS/m.test(bl)) mcSemErros.push(k + 1); });
    window.__mcSemErros = mcSemErros;
    return { lidas: R.length, originais: O.length, idsUnicos: new Set(ids).size === ids.length, rows, semArtigo, mcSemErros: window.__mcSemErros };
  }, [MD, OR, process.env.MATERIA || '']);
  const f = (fn) => o.rows.filter(fn).map(x => x.n);
  console.log(JSON.stringify({ lidas: o.lidas, originais: o.originais, idsUnicos: o.idsUnicos,
    semGabarito: f(x => !x.g), gabaritoAlterado: f(x => !x.gIgual), semResolucao: f(x => !x.res),
    semBotaoNaPlataforma: f(x => !x.botao), atualizacaoAConferir: f(x => (x.vide || x.juris) && !x.conferido), dispositivoComVideADI: f(x => x.vide), semPopup: f(x => !x.pop), popupSemTexto: f(x => x.pop && !x.texto), semCampoArtigo: o.semArtigo, comBadgeAtualizada: f(x => x.badge), mcSemBlocoErros: o.mcSemErros }, null, 1));
  await b.close(); srv.kill(); process.exit(0);
})();
