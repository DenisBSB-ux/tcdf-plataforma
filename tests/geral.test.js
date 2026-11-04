// Verificações gerais do repositório. Rodar: node tests/geral.test.js
const fs = require('fs'), path = require('path'), vm = require('vm'), cp = require('child_process');
const raiz = path.join(__dirname, '..'); let ok = 0, bad = 0;
const t = (nome, cond, extra) => { if (cond) ok++; else { bad++; console.error('FALHOU:', nome, extra || ''); } };

// 1. sintaxe de todos os .js do app
const js = fs.readdirSync(path.join(raiz, 'js')).filter(f => f.endsWith('.js'));
let erroSintaxe = [];
for (const f of js) { try { new vm.Script(fs.readFileSync(path.join(raiz, 'js', f), 'utf8'), { filename: f }); } catch (e) { erroSintaxe.push(f + ': ' + e.message); } }
t('sintaxe de js/*.js', !erroSintaxe.length, erroSintaxe.slice(0, 3).join(' | '));

// 2. versão ?v= única no index.html e todo script/estilo local referenciado existe
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
const versoes = [...new Set(html.match(/v\d{3}/g) || [])];
t('versão única no index.html', versoes.length === 1, versoes.join(','));
const refs = [...html.matchAll(/(?:src|href)="((?:js|css)\/[^"?]+)/g)].map(m => m[1]);
t('arquivos referenciados existem', refs.every(r => fs.existsSync(path.join(raiz, r))), refs.filter(r => !fs.existsSync(path.join(raiz, r))).join(','));

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

// 5. nenhum JS usa lookbehind em regex literal (quebra Safari < 16.4)
const comLookbehind = js.filter(f => !/texto|dados|doutrina/.test(f) && /\/[^\/\n]*\(\?<[=!][^\/\n]*\/[gimsuy]*[,;)\s]/.test(fs.readFileSync(path.join(raiz, 'js', f), 'utf8').replace(/new RegExp\([^)]*\)/g, '')));
t('sem lookbehind em regex literal', !comLookbehind.length, comLookbehind.join(','));

console.log('geral: ' + ok + ' ok, ' + bad + ' falhas');
process.exit(bad ? 1 : 0);
