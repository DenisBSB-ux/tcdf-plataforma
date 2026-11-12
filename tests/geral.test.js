// Verificações gerais do repositório. Rodar: node tests/geral.test.js
const fs = require('fs'), path = require('path'), vm = require('vm'), cp = require('child_process');
const raiz = path.join(__dirname, '..'); let ok = 0, bad = 0;
const t = (nome, cond, extra) => { if (cond) ok++; else { bad++; console.error('FALHOU:', nome, extra || ''); } };

// 1. sintaxe de todos os .js do app
const js = fs.readdirSync(path.join(raiz, 'js')).filter(f => f.endsWith('.js'));
let erroSintaxe = [];
for (const f of js) { try { new vm.Script(fs.readFileSync(path.join(raiz, 'js', f), 'utf8'), { filename: f }); } catch (e) { erroSintaxe.push(f + ': ' + e.message); } }
t('sintaxe de js/*.js', !erroSintaxe.length, erroSintaxe.slice(0, 3).join(' | '));
try { new vm.Script(fs.readFileSync(path.join(raiz, 'sw.js'), 'utf8'), { filename: 'sw.js' }); t('sintaxe de sw.js', true); } catch (e) { t('sintaxe de sw.js', false, e.message); }

// 2. versão ?v= única no index.html e todo script/estilo local referenciado existe
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
const versoes = [...new Set(html.match(/(?<=[?=']|^)v\d{3,}(?=['"&]|$)/g) || [])];
t('versão única no index.html', versoes.length === 1, versoes.join(','));
const refs = [...html.matchAll(/(?:src|href)="((?:js|css)\/[^"?]+)/g)].map(m => m[1]);
t('arquivos referenciados existem', refs.every(r => fs.existsSync(path.join(raiz, r))), refs.filter(r => !fs.existsSync(path.join(raiz, r))).join(','));

// 2b. app instalável: manifesto válido e ícones existentes
try {
  const man = JSON.parse(fs.readFileSync(path.join(raiz, 'manifest.webmanifest'), 'utf8'));
  t('manifesto: nome, start_url e display', !!(man.name && man.start_url && man.display === 'standalone'));
  t('manifesto: ícones existem', (man.icons || []).length >= 2 && man.icons.every(i => fs.existsSync(path.join(raiz, i.src))));
  t('index.html liga o manifesto', /rel="manifest"\s+href="manifest\.webmanifest"/.test(html));
} catch (e) { t('manifesto válido', false, e.message); }

// 3. textos de lei: carregam, sem artigo vazio, e toda entrada de LEI_FONTES aponta para arquivo e global existentes
const teoria = fs.readFileSync(path.join(raiz, 'js', 'teoria.js'), 'utf8');
const bloco = teoria.match(/const LEI_FONTES = \{[\s\S]*?\n\};/);
t('LEI_FONTES encontrado', !!bloco);
if (bloco) {
  const fontes = vm.runInNewContext(bloco[0] + ';LEI_FONTES', {});
  let falhas = [];
  for (const [k, v] of Object.entries(fontes)) {
    try {
      const d = vm.runInNewContext(fs.readFileSync(path.join(raiz, v.arquivo), 'utf8') + ';' + v.global, {});
      if (!Object.keys(d).length) falhas.push(k + ' vazio');
      for (const [art, linhas] of Object.entries(d)) if (!Array.isArray(linhas) || !linhas.length || linhas.some(l => typeof l !== 'string' || !l.trim())) { falhas.push(k + ' art ' + art); break; }
    } catch (e) { falhas.push(k + ': ' + e.message.slice(0, 40)); }
  }
  t('textos de lei íntegros (' + Object.keys(fontes).length + ')', !falhas.length, falhas.slice(0, 4).join(' | '));
}

// 4. funções puras de js/cartao.js e js/util.js
const ctx = { esc: s => String(s), console };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(raiz, 'js', 'cartao.js'), 'utf8') + ';this.CV = cartaoValor; this.CD = cartaoDiff; this.NN = _ccNorm;', ctx);
t('cartão: 12/3 não é quórum 2/3', ctx.CV('Decreto de 12/3/2020 fixa 90 dias').big === '90');
t('cartão: quórum 2/3 reconhecido', ctx.CV('aprovado por 2/3 dos membros em 60 dias').big === '2/3');
t('cartão: 2,5% difere de 25%', ctx.NN('2,5%') !== ctx.NN('25%'));
const u = fs.readFileSync(path.join(raiz, 'js', 'util.js'), 'utf8');
const ctx2 = { temListaAlfabetica: () => true };
vm.createContext(ctx2);
vm.runInContext(u.slice(u.indexOf('function quebrarItensAlfabeticos'), u.indexOf('// combina a quebra em frases')) + ';this.q = quebrarItensAlfabeticos;', ctx2);
t('util: não quebra "147-B)"', ctx2.q('Analise: a) um b) dois, art. 147-B) fim') === 'Analise:\na) um\nb) dois, art. 147-B) fim');

// 4b. revisão do dia (repetição espaçada)
const est = fs.readFileSync(path.join(raiz, 'js', 'estudo.js'), 'utf8');
const DIA = 86400000, agora = Date.now();
const q = (n, t) => ({ uid: 'q' + n, t: t || 'CE', duplicataOculta: false });
const ctx3 = { BY_UID: { q1: q(1), q2: q(2), q3: q(3), q4: q(4), q5: q(5, 'sem_gabarito') }, getBucket: () => ({ perguntas: {
  q1: { historico: [{ ts: agora - 2*DIA, c: false }] },                                  // errou há 2 dias → vence
  q2: { historico: [{ ts: agora - 3*60000, c: false }] },                                // errou agora há pouco → ainda não
  q3: { historico: [{ ts: agora - 10*DIA, c: true }, { ts: agora - 8*DIA, c: true }] },   // 2 acertos, há 8 dias → vence (7)
  q4: { historico: [{ ts: agora - 20*DIA, c: true }] },                                   // 1 acerto há 20 dias → vence (3)
  q5: { historico: [{ ts: agora - 20*DIA, c: false }] } } }) };                           // fora do escopo
vm.createContext(ctx3);
vm.runInContext(est.slice(est.indexOf('const REVISAO_INTERVALOS_DIAS'), est.indexOf('function iniciarRevisaoDeHoje')) + ';this.rev = revisaoDeHoje;', ctx3);
const revs = ctx3.rev('X', agora).map(x => x.uid);
t('revisão: vencidas entram, recentes e fora do escopo não', revs.join() === 'q1,q4,q3' || (revs.length === 3 && revs.includes('q1') && revs.includes('q3') && revs.includes('q4') && !revs.includes('q2') && !revs.includes('q5')), revs.join());
t('revisão: erradas primeiro', revs[0] === 'q1');

// 4c. "Teoria em figura" (piloto): estrutura dos cartões
try {
  const cx = { console, esc: s => String(s) }; vm.createContext(cx);
  vm.runInContext(fs.readdirSync(path.join(raiz, 'js')).filter(f => /^teoria-cartoes.*\.js$/.test(f)).sort((a, b) => (b === 'teoria-cartoes.js') - (a === 'teoria-cartoes.js') || a.localeCompare(b)).map(f => fs.readFileSync(path.join(raiz, 'js', f), 'utf8')).join('\n') + ';this.C = TEORIA_CARTOES; this.H = cartaoTeoriaHtml; this.G = teoriaCartaoDaQuestao;', cx);
  const ok = cx.C.length > 0 && cx.C.every(c => c.titulo && c.regra && c.base && c.armadilha && Array.isArray(c.pontos) && c.pontos.length >= 3 && c.pontos.every(p => p.t && p.d));
  t('cartões de teoria: estrutura (' + cx.C.length + ')', ok);
  const ns = cx.C.map(c => c.n + ':' + (c.h || '')); t('cartões de teoria: sem número repetido', new Set(ns).size === ns.length);
  t('cartões de teoria: código do enunciado distingue questões com o mesmo número', cx.G({ materia: 'Direito Tributário', n: 24, q: 'qualquer' }) !== null);
  t('cartões de teoria: marcadores = pontos', cx.C.every(c => (c.regra.match(/\{\d\|[^}]+\}/g) || []).length === c.pontos.length && c.pontos.length <= 5));
  t('cartões de teoria: só na matéria certa', cx.H({ materia: 'Direito Tributário', n: cx.C[0].n }).includes('cartao-teoria') && cx.H({ materia: 'Direito Civil', n: cx.C[0].n }) === '');
} catch (e) { t('cartões de teoria', false, e.message); }


// 4d. "Limpar a resposta": a cura do histórico não traz de volta a resposta que o usuário limpou de propósito
try {
  const arm = fs.readFileSync(path.join(raiz, 'js', 'armazenamento.js'), 'utf8');
  const ini = arm.indexOf('function curarRespostasDoHistorico'), fim = arm.indexOf('\n}\n', ini) + 3;
  const cx = { BY_UID: { u1: { uid: 'u1', t: 'CE' } }, gabaritoEfetivo: () => 'Certo', getBucket: () => ({ perguntas: { u1: { tentativas: 2, ultimoResultado: true } } }) };
  vm.createContext(cx); vm.runInContext(arm.slice(ini, fim) + ';this.cura = curarRespostasDoHistorico;', cx);
  const quiz = () => ({ materia: 'M', queue: ['u1'], respostas: {} });
  const q1 = quiz(); cx.cura(q1);
  const q2 = quiz(); q2.limpas = { u1: true }; cx.cura(q2);
  t('limpar resposta: sem marca, a cura traz do histórico; com marca, não', !!q1.respostas.u1 && !q2.respostas.u1);
  const est = fs.readFileSync(path.join(raiz, 'js', 'estudo.js'), 'utf8');
  t('limpar resposta: o botão e o reiniciar marcam "limpas"', /function resetQuestaoAtual[\s\S]*?quiz\.limpas/.test(est) && /function resetSimuladoAtual[\s\S]*?quiz\.limpas/.test(est) && /delete quiz\.limpas\[uid\]/.test(est));
} catch (e) { t('limpar resposta', false, e.message); }


// 4e. Reta Final: lógica pura (fases, nível do erro, agenda dos cartões, lacunas)
try {
  const rf = fs.readFileSync(path.join(raiz, 'js', 'reta-final.js'), 'utf8');
  const cx = { esc: x => String(x) }; vm.createContext(cx);
  vm.runInContext(rf + ';this.F = retaFaseDeDias; this.N = retaNivelErro; this.A = retaAgenda; this.R = retaRotuloIntervalo; this.P1 = retaPartesDeRegra; this.P2 = retaPartesComChaves;', cx);
  t('reta: fases por dias', cx.F(16).id === 'cobrir' && cx.F(8).id === 'cobrir' && cx.F(7).id === 'fixar' && cx.F(3).id === 'fixar' && cx.F(2).id === 'leve' && cx.F(1).id === 'leve' && cx.F(0).id === 'dia' && cx.F(-1).id === 'pos');
  const D = 864e5, now = 1e13, H = (ts, c) => ({ ts, c });
  t('reta: nunca errou não é erro', cx.N({ historico: [H(now-D, true)], ultimoResultado: true }) === null);
  t('reta: errou na última = nível 0', cx.N({ historico: [H(now-3*D, true), H(now-D, false)], ultimoResultado: false }).nivel === 0);
  t('reta: acertos espaçados sobem o nível', cx.N({ historico: [H(now-5*D, false), H(now-3*D, true)], ultimoResultado: true }).nivel === 1
    && cx.N({ historico: [H(now-5*D, false), H(now-3*D, true), H(now-D, true)], ultimoResultado: true }).nivel === 2
    && cx.N({ historico: [H(now-6*D, false), H(now-4*D, true), H(now-2*D, true), H(now-D*0.5, true)], ultimoResultado: true }).nivel === 3);
  t('reta: acertos no mesmo dia contam uma vez só', cx.N({ historico: [H(now-3*D, false), H(now-D, true), H(now-D+60000, true), H(now-D+120000, true)], ultimoResultado: true }).nivel === 1);
  t('reta: reincidência conta os erros', cx.N({ historico: [H(1, false), H(2, false), H(3, false)], ultimoResultado: false }).reinc === 3);
  const a1 = cx.A(null, 3, now, 16), a2 = cx.A(a1, 3, now, 16), a3 = cx.A(a2, 3, now, 16);
  t('reta: agenda cresce (1 → 2 → mais) e respeita o teto de 1/3 do tempo', a1.i === 1 && a2.i === 2 && a3.i > 2 && a3.i <= 5 && cx.A(a3, 4, now, 16).i <= 5);
  t('reta: perto da prova o intervalo fica curto', cx.A(a3, 4, now, 3).i <= 1 && cx.A(null, 4, now, 3).i <= 1);
  t('reta: errei volta hoje e conta lapso', cx.A(a3, 1, now, 16).d - now <= 15*60000 && cx.A(a3, 1, now, 16).l === 1 && cx.A(a3, 1, now, 16).r === 0);
  t('reta: rótulos dos botões', cx.R(null, 1, now, 16) === 'volta hoje' && cx.R(null, 3, now, 16) === 'amanhã' && /^em \d+ dias$/.test(cx.R(a2, 3, now, 16)));
  t('reta: lacunas a partir de {i|palavra}', JSON.stringify(cx.P1('O {0|ICMS} não compõe a {1|base de cálculo}.')) === JSON.stringify([{ t: 'O ' }, { l: 'ICMS' }, { t: ' não compõe a ' }, { l: 'base de cálculo' }, { t: '.' }]));
  t('reta: lacunas a partir das palavras-chave', cx.P2('A regressividade pesa mais em quem ganha menos', ['regressividade', 'ganha menos', 'inexistente']).filter(p => p.l).length === 2);
} catch (e) { t('reta final', false, e.message); }

// 5. nenhum JS usa lookbehind em regex literal (quebra Safari < 16.4)
const comLookbehind = js.filter(f => !/texto|dados|doutrina/.test(f) && /\/[^\/\n]*\(\?<[=!][^\/\n]*\/[gimsuy]*[,;)\s]/.test(fs.readFileSync(path.join(raiz, 'js', f), 'utf8').replace(/new RegExp\([^)]*\)/g, '')));
t('sem lookbehind em regex literal', !comLookbehind.length, comLookbehind.join(','));

// 6. cartões de teoria: todos ligam por número + código do enunciado (sem código, renumerar a lista os trocaria de questão),
//    sem duplicata, e as expressões de matéria reconhecem os nomes em uso (cartão que não casa com o nome da matéria nunca aparece)
try {
  const cartoes = [];
  global.TEORIA_CARTOES = cartoes; global.window = global;
  for (const f of ['teoria-cartoes.js', ...js.filter(f => /^teoria-cartoes-.*\.js$/.test(f))]) (0, eval)(fs.readFileSync(path.join(raiz, 'js', f), 'utf8'));
  const semH = cartoes.filter(c => c.n !== undefined && !c.h);
  t('cartões: todos têm código do enunciado (h)', !semH.length, semH.length + ' sem h, ex.: ' + semH.slice(0, 2).map(c => c.n + ' ' + c.titulo).join(' | '));
  const chaves = cartoes.map(c => String(c.m) + '|' + c.n + '|' + c.h), dup = chaves.filter((k, i) => chaves.indexOf(k) !== i);
  t('cartões: sem duplicata (matéria|n|h)', !dup.length, dup.slice(0, 3).join(' ; '));
  const nomes = { 'Administrativo (geral)': /adm geral|administrativo \(geral\)/i, 'Adm Geral & Pub': null, 'Analise Dados IA': null, 'Análise de Dados e IA': null, 'D.Tributário': null, 'LODF': null, 'Adm (LGPD + LAI)': null };
  for (const nome of Object.keys(nomes)) t('cartões: algum cartão reconhece a matéria "' + nome + '"', cartoes.some(c => c.m && c.m.test(nome)));
} catch (e) { t('cartões de teoria', false, e.message); }

// 7. Reta Final · plano por matéria (js/reta-7dias.js): distribuição pelo tempo e dias disponíveis; calendário e datas
try {
  const r7 = fs.readFileSync(path.join(raiz, 'js', 'reta-7dias.js'), 'utf8');
  const cx = {}; vm.createContext(cx);
  vm.runInContext(r7.slice(r7.indexOf('/* R7-PURO-INI */'), r7.indexOf('/* R7-PURO-FIM */')) + ';this.P = reta7Distribuir; this.D = reta7DiffDias; this.S = reta7SomaDias; this.C = reta7Calendario;', cx);
  const stats = Array.from({ length: 20 }, (_, i) => ({ mat: 'M' + String(i).padStart(2, '0'), score: 1 - i / 20, w: 2 - i / 20 }));   // M00 é a mais fraca
  const dias8 = Array.from({ length: 8 }, (_, i) => ({ d: '2026-11-' + String(11 + i).padStart(2, '0'), min: 240 }));
  const a = cx.P(stats, dias8), soma = o => Object.values(o).reduce((x, y) => x + y, 0);
  t('reta7: 8 dias x 4h usam exatamente 32h e ninguém fica de fora', soma(a.porMateria) === 1920 && a.fora.length === 0 && Object.keys(a.porMateria).length === 20);
  t('reta7: nenhum dia estoura o tempo e todos são usados', a.agenda.every((d, i) => d.reduce((x, b) => x + b.min, 0) <= 240 && d.length > 0));
  t('reta7: mais fracas ganham mais tempo e vêm antes', a.porMateria.M00 > a.porMateria.M19 && a.agenda[0].some(b => b.mat === 'M00') && !a.agenda[0].some(b => b.mat === 'M19'));
  t('reta7: tempo mínimo por matéria é 45 min com folga', Object.values(a.porMateria).every(m => m >= 45 && m % 15 === 0));
  const dd = m => a.agenda.map((d, i) => d.some(b => b.mat === m) ? i : -1).filter(i => i >= 0);
  t('reta7: a mesma matéria aparece em mais de um dia (1ª e 2ª passada)', stats.slice(0, 10).every(s => dd(s.mat).length >= 2 || a.agenda.flat().some(b => b.mat === s.mat && b.t === '12')));
  const b = cx.P(stats, [{ d: '2026-11-12', min: 120 }, { d: '2026-11-13', min: 60 }]);
  t('reta7: pouco tempo: só as mais fracas entram (15 min por matéria)', soma(b.porMateria) === 180 && b.fora.length === 8 && b.fora.includes('M19') && !b.fora.includes('M00'));
  t('reta7: sem dias disponíveis tudo fica de fora', cx.P(stats, []).fora.length === 20);
  t('reta7: um dia só', cx.P(stats.slice(0, 3), [{ d: '2026-11-12', min: 180 }]).agenda[0].reduce((x, y) => x + y.min, 0) === 180);
  const cal = cx.C('2026-11-11', 11, { horas: 3, dias: { '2026-11-12': { on: false }, '2026-11-14': { on: true, min: 90 } } });   // 11/11 é quarta
  t('reta7: calendário (seg a sex por padrão, folga e override)', cal.length === 11 && cal[0].on && !cal[1].on && !cal[3].on === false && cal[3].on && cal[3].min === 90 && cal[4].dw === 0 && !cal[4].on && cal[0].min === 180);
  t('reta7: datas', cx.D('2026-11-11', '2026-11-13') === 2 && cx.S('2026-11-30', 1) === '2026-12-01' && cx.D('2026-11-13', '2026-11-11') === -2);
} catch (e) { t('reta 7 dias', false, e.message); }

// 8. Treino por matéria (js/treino.js + js/treino-<matéria>.js): só matérias liberadas, com dados íntegros
try {
  const tr = fs.readFileSync(path.join(raiz, 'js', 'treino.js'), 'utf8');
  const lib = JSON.parse(tr.match(/TREINO_LIBERADAS = (\[[^\]]*\])/)[1].replace(/'/g, '"'));
  t('treino: há matéria liberada', lib.length >= 1);
  const r7 = fs.readFileSync(path.join(raiz, 'js', 'reta-7dias.js'), 'utf8'), mapa = r7.match(/R7_RESUMO_MAPA = \[([\s\S]*?)\n\];/)[1];
  lib.forEach(slug => {
    const arq = path.join(raiz, 'js', 'treino-' + slug + '.js');
    t('treino: arquivo de ' + slug + ' existe e está no mapa de matérias', fs.existsSync(arq) && mapa.includes("'" + slug + "'"));
    const cx = { TREINO_TCDF: {} }; vm.createContext(cx); vm.runInContext(fs.readFileSync(arq, 'utf8'), cx);
    const d = cx.TREINO_TCDF[slug];
    t('treino: ' + slug + ' tem flashcards e lacunas', d && d.flash.length >= 50 && d.lacunas.length >= 30);
    t('treino: ' + slug + ' flashcards com frente e verso', d.flash.every(f => f.f && f.v && f.n && f.h));
    const ruins = d.lacunas.filter(x => { const bl = x.p.filter(p => p.l !== undefined); const frase = x.p.map(p => p.t !== undefined ? p.t : p.l).join(''); return !bl.length || bl.length > 3 || !x.d || !x.d.length || x.d.some(w => bl.some(b => b.l.toLowerCase() === w.toLowerCase()) || frase.toLowerCase().includes(w.toLowerCase())) || bl.some(b => !b.l.trim()) || /＿|\[\[|\]\]/.test(frase); });
    t('treino: ' + slug + ' lacunas íntegras (1 a 3 espaços, distratores fora da frase e das respostas)', !ruins.length, ruins.slice(0, 2).map(x => x.n).join(','));
    const ch = d.lacunas.map(x => x.n + ':' + x.h); t('treino: ' + slug + ' sem lacuna duplicada', new Set(ch).size === ch.length);
  });
} catch (e) { t('treino', false, e.message); }
// 8b. Matérias "atualizadas" (selo na Reta Final): têm resumo por assunto e flashcards com o texto da questão
try {
  const r7 = fs.readFileSync(path.join(raiz, 'js', 'reta-7dias.js'), 'utf8');
  const atual = JSON.parse(r7.match(/R7_ATUALIZADAS = (\[[^\]]*\])/)[1].replace(/'/g, '"'));
  const resumos = fs.readFileSync(path.join(raiz, 'js', 'resumos-dados.js'), 'utf8');
  const R = JSON.parse(resumos.match(/const RESUMOS_TCDF = (\{[\s\S]*\});\s*$/)[1]);
  t('selo: há matéria atualizada', atual.length >= 1);
  atual.forEach(slug => {
    const a = R[slug] && R[slug].assuntos;
    t('selo: ' + slug + ' tem resumo por assunto com relevância', Array.isArray(a) && a.length >= 2 && a.every(x => x.nome && x.md && typeof x.pct === 'number') && !!R[slug].geral);
    const src = fs.readFileSync(path.join(raiz, 'js', 'treino-' + slug + '.js'), 'utf8');
    const d = JSON.parse(src.split('\n')[1].replace(/^TREINO_TCDF\["[^"]+"\]\s*=\s*/, '').replace(/;\s*$/, ''));
    t('selo: ' + slug + ' tem flashcards com o texto da questão e resposta', d.flash.length >= 50 && d.flash.every(f => f.k === 'questao' && f.f && f.g && f.v));
  });
} catch (e) { t('selo', false, e.message); }

console.log('geral: ' + ok + ' ok, ' + bad + ' falhas');
process.exit(bad ? 1 : 0);
