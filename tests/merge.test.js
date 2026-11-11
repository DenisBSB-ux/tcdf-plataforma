// Testes do merge de progresso entre aparelhos (js/nuvem.js). Rodar: node tests/merge.test.js
// Extrai só as funções puras de merge do arquivo-fonte e simula dois aparelhos (A e B).
const fs = require('fs'), path = require('path'), vm = require('vm');
const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'nuvem.js'), 'utf8');
const ini = src.indexOf('// Troca de numeração'), fim = src.indexOf('function mergeRemoteProgressoNaMemoria');
if (ini < 0 || fim < 0) { console.error('não achei o trecho de merge em js/nuvem.js'); process.exit(2); }
const ctx = { Date, Math, console, somarProgressoDaQuestao: (a, b) => ({ ...a, tentativas: (a.tentativas||0) + (b.tentativas||0), acertos: (a.acertos||0) + (b.acertos||0), historico: (a.historico||[]).concat(b.historico||[]) }) };
vm.createContext(ctx);
vm.runInContext(src.slice(ini, fim) + ';this.mergeBucket = mergeBucket;', ctx);
const mb = ctx.mergeBucket;

const now = Date.now(), H = (ts, c) => ({ ts, c });
const B = o => ({ perguntas: {}, flash: {}, sessoes: [], simuladosSalvos: [], chutes: {}, ...o });
const P = (t, a, hist) => ({ tentativas: t, acertos: a, ultimoResultado: hist.length ? hist[hist.length-1].c : null, historico: hist });
let ok = 0, bad = 0;
const t = (nome, cond) => { if (cond) ok++; else { bad++; console.error('FALHOU:', nome); } };

// 1. respostas de dois aparelhos somam sem encolher contadores
let r = mb(B({ perguntas: { u1: P(50, 30, [H(1, true)]) } }), B({ perguntas: { u1: P(52, 31, [H(3, true)]) } }));
t('contadores não encolhem', r.perguntas.u1.tentativas === 52 && r.perguntas.u1.historico.length === 2);
// 2. pergunta só num lado é preservada nos dois sentidos
r = mb(B({ perguntas: { a: P(1, 1, [H(1, true)]) } }), B({ perguntas: { b: P(1, 0, [H(2, false)]) } }));
t('união de perguntas', r.perguntas.a && r.perguntas.b);
r = mb(B({ perguntas: { b: P(1, 0, [H(2, false)]) } }), B({ perguntas: { a: P(1, 1, [H(1, true)]) } }));
t('união de perguntas (inverso)', r.perguntas.a && r.perguntas.b);
// 3. histórico vazio com contadores não é descartado
r = mb(B(), B({ perguntas: { u5: { tentativas: 4, acertos: 3, historico: [] } } }));
t('histórico vazio preservado', r.perguntas.u5 && r.perguntas.u5.tentativas === 4);
// 4. apagar histórico da matéria (resetEm) não volta com o merge
const antigo = B({ perguntas: { u1: P(3, 2, [H(now-5000, true), H(now-4000, false), H(now-3000, true)]) }, chutes: { u2: { ts: now-3000 } }, sessoes: [{ ts: now-2000, total: 3 }] });
const zerado = B({ resetEm: now-1000 });
r = mb(zerado, antigo); t('reset local vence', !Object.keys(r.perguntas).length && !Object.keys(r.chutes).length && !r.sessoes.length);
r = mb(antigo, zerado); t('reset remoto vence', !Object.keys(r.perguntas).length);
r = mb(B({ resetEm: now-1000, perguntas: { u1: P(1, 1, [H(now-500, true)]) } }), antigo); t('resposta pós-reset sobrevive', r.perguntas.u1.tentativas === 1);
// 5. desfazer resposta não volta
const com2 = B({ perguntas: { u1: P(2, 1, [H(1, true), H(2, false)]) } });
const desfeito = B({ perguntas: { u1: P(1, 1, [H(1, true)]) }, desfeitos: { u1: { ts: now, keys: ['2-false'] } } });
r = mb(desfeito, com2); t('desfazer (local)', r.perguntas.u1.tentativas === 1 && r.perguntas.u1.historico.length === 1);
r = mb(com2, desfeito); t('desfazer (remoto)', r.perguntas.u1.tentativas === 1);
r = mb(B({ desfeitos: { u1: { ts: now, keys: ['1-true'] } } }), B({ perguntas: { u1: P(1, 1, [H(1, true)]) } })); t('desfazer até zero', !r.perguntas.u1);
// 6. chute desmarcado e simulado excluído
r = mb(B({ lapides: { 'c:u9': now } }), B({ chutes: { u9: { ts: 100 } } })); t('chute desmarcado', !r.chutes.u9);
r = mb(B({ lapides: { 'c:u9': now } }), B({ chutes: { u9: { ts: now + 10 } } })); t('chute remarcado depois', !!(r.estudo && r.estudo.u9 && r.estudo.u9.n === 'teoria') && !Object.keys(r.chutes).length);
r = mb(B({ lapides: { 's:55': now } }), B({ simuladosSalvos: [{ ts: 55 }] })); t('simulado excluído', r.simuladosSalvos.length === 0);
// 7. substituir por matéria: geração e mapa de uids
const velho = B({ perguntas: { 'm-1': P(3, 2, [H(1, true)]), 'm-2': P(1, 0, [H(5, false)]) }, chutes: { 'm-1': { ts: 5 } } });
const novo = B({ perguntas: { 'm-7': P(2, 1, [H(1, true)]), 'm-1': P(9, 9, [H(1, true)]) }, geracao: 100, migracao: { de: 0, id: 100, mapa: { 'm-1': 'm-7' } } });
r = mb(novo, velho); t('migração por mapa', r.perguntas['m-7'] && r.perguntas['m-7'].tentativas >= 2 && r.perguntas['m-1'].tentativas === 9 && !r.perguntas['m-2'] && r.estudo && r.estudo['m-7'] && r.estudo['m-7'].n === 'teoria');
r = mb(velho, novo); t('migração por mapa (inverso)', r.perguntas['m-7'] && r.perguntas['m-1'].tentativas === 9 && !r.perguntas['m-2']);
// 7b. duas trocas seguidas (Substituir 2x) antes do outro aparelho sincronizar: as respostas dele não podem ser descartadas
{
  const aparelho = B({ perguntas: { 'm-1': P(2, 1, [H(1, true), H(9, false)]) } });                       // geração 0, ainda na numeração original
  const g2 = B({ perguntas: { 'm-7': P(1, 1, [H(1, true)]) }, geracao: 200, migracao: { de: 100, id: 200, mapa: { 'm-3': 'm-7' } },
    migracoes: [{ de: 0, id: 100, mapa: { 'm-1': 'm-3' } }, { de: 100, id: 200, mapa: { 'm-3': 'm-7' } }] });
  r = mb(g2, aparelho); t('duas trocas: respostas do aparelho antigo seguem a questão', r.perguntas['m-7'] && r.perguntas['m-7'].tentativas >= 2 && !r.perguntas['m-1']);
  r = mb(aparelho, g2); t('duas trocas (inverso)', r.perguntas['m-7'] && r.perguntas['m-7'].tentativas >= 2 && r.geracao === 200);
  const quebrada = B({ perguntas: { 'm-7': P(1, 1, [H(1, true)]) }, geracao: 200, migracao: { de: 100, id: 200, mapa: { 'm-3': 'm-7' } } });
  r = mb(quebrada, aparelho); t('cadeia incompleta continua descartando (numeração não confiável)', !r.perguntas['m-1'] && r.perguntas['m-7'].tentativas === 1);
}
// 8. idempotência: mesclar duas vezes dá o mesmo resultado
const a = B({ perguntas: { u1: P(2, 1, [H(1, true), H(2, false)]) } }), b2 = B({ perguntas: { u1: P(3, 2, [H(1, true), H(3, true)]) } });
const m1 = mb(a, b2), m2 = mb(m1, b2);
t('idempotente', JSON.stringify(m1.perguntas) === JSON.stringify(m2.perguntas));
// 9. sessões e simulados salvos somam sem duplicar
r = mb(B({ sessoes: [{ ts: 1 }, { ts: 2 }] }), B({ sessoes: [{ ts: 2 }, { ts: 3 }] })); t('sessões sem duplicar', r.sessoes.length === 3);


// agenda de revisão dos cartões (srs, Reta Final): vale a revisão mais recente por questão; não se perde ao mesclar; apagar histórico a limpa
{
  const A = B({ srs: { u1: { i: 2, e: 2.5, r: 2, l: 0, d: now + 2 * 864e5, t: now - 1000 }, u2: { i: 1, e: 2.3, r: 1, l: 0, d: now + 864e5, t: now - 5000 } } });
  const Bb = B({ srs: { u1: { i: 5, e: 2.6, r: 3, l: 0, d: now + 5 * 864e5, t: now }, u3: { i: 1, e: 2.3, r: 1, l: 0, d: now, t: now - 100 } } });
  const m = mb(A, Bb), m2 = mb(Bb, A);
  t('srs: união por questão', m.srs.u1 && m.srs.u2 && m.srs.u3);
  t('srs: vale a revisão mais recente', m.srs.u1.i === 5 && m2.srs.u1.i === 5);
  const ord = o => JSON.stringify(Object.keys(o).sort().map(k => [k, o[k]]));
  t('srs: merge simétrico', ord(m.srs) === ord(m2.srs));
  const semAgenda = mb(B({}), B({}));
  t('srs: bucket sem agenda continua sem o campo', semAgenda.srs === undefined);
  const R = now - 500;
  const rs = mb(B({ resetEm: R }), B({ srs: { u1: { i: 2, t: R - 10 }, u2: { i: 1, t: now } } }));
  t('srs: apagar histórico descarta a agenda anterior ao reset', rs.srs && !rs.srs.u1 && !!rs.srs.u2);
}

// 5. marcas Teoria/Revisar/Avançar (estudo): vale a mais recente por questão, inclusive a remoção
r = mb(B({ estudo: { q1: { n: 'teoria', t: 10 } } }), B({ estudo: { q1: { n: 'revisar', t: 20 }, q2: { n: 'avancar', t: 5 } } }));
t('estudo: mais recente vence e união', r.estudo.q1.n === 'revisar' && r.estudo.q2.n === 'avancar');
r = mb(B({ estudo: { q1: { n: '', t: 30 } } }), B({ estudo: { q1: { n: 'teoria', t: 10 } } }));
t('estudo: remoção mais nova sincroniza', r.estudo.q1.n === '');
r = mb(B({ estudo: { q1: { n: 'teoria', t: 10 } } }), B({ estudo: { q1: { n: '', t: 5 } } }));
t('estudo: marca mais nova vence remoção antiga', r.estudo.q1.n === 'teoria');
// 6. chute de aparelho antigo vira Teoria; não sobrescreve marca escolhida depois
r = mb(B(), B({ chutes: { q3: { ts: 50 } } }));
t('chute antigo vira teoria', r.estudo.q3.n === 'teoria' && !Object.keys(r.chutes).length);
r = mb(B({ estudo: { q3: { n: 'avancar', t: 100 } } }), B({ chutes: { q3: { ts: 50 } } }));
t('chute não sobrescreve marca existente', r.estudo.q3.n === 'avancar');
// 7. apagar histórico limpa as marcas anteriores ao reset
r = mb(B({ resetEm: now }), B({ estudo: { q4: { n: 'teoria', t: now - 1000 } } }));
t('reset limpa marcas antigas', !r.estudo || !r.estudo.q4);

console.log('merge: ' + ok + ' ok, ' + bad + ' falhas');
process.exit(bad ? 1 : 0);

