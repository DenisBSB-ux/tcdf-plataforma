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
r = mb(B({ lapides: { 'c:u9': now } }), B({ chutes: { u9: { ts: now + 10 } } })); t('chute remarcado depois', !!r.chutes.u9);
r = mb(B({ lapides: { 's:55': now } }), B({ simuladosSalvos: [{ ts: 55 }] })); t('simulado excluído', r.simuladosSalvos.length === 0);
// 7. substituir por matéria: geração e mapa de uids
const velho = B({ perguntas: { 'm-1': P(3, 2, [H(1, true)]), 'm-2': P(1, 0, [H(5, false)]) }, chutes: { 'm-1': { ts: 5 } } });
const novo = B({ perguntas: { 'm-7': P(2, 1, [H(1, true)]), 'm-1': P(9, 9, [H(1, true)]) }, geracao: 100, migracao: { de: 0, id: 100, mapa: { 'm-1': 'm-7' } } });
r = mb(novo, velho); t('migração por mapa', r.perguntas['m-7'] && r.perguntas['m-7'].tentativas >= 2 && r.perguntas['m-1'].tentativas === 9 && !r.perguntas['m-2'] && r.chutes['m-7']);
r = mb(velho, novo); t('migração por mapa (inverso)', r.perguntas['m-7'] && r.perguntas['m-1'].tentativas === 9 && !r.perguntas['m-2']);
// 8. idempotência: mesclar duas vezes dá o mesmo resultado
const a = B({ perguntas: { u1: P(2, 1, [H(1, true), H(2, false)]) } }), b2 = B({ perguntas: { u1: P(3, 2, [H(1, true), H(3, true)]) } });
const m1 = mb(a, b2), m2 = mb(m1, b2);
t('idempotente', JSON.stringify(m1.perguntas) === JSON.stringify(m2.perguntas));
// 9. sessões e simulados salvos somam sem duplicar
r = mb(B({ sessoes: [{ ts: 1 }, { ts: 2 }] }), B({ sessoes: [{ ts: 2 }, { ts: 3 }] })); t('sessões sem duplicar', r.sessoes.length === 3);

console.log('merge: ' + ok + ' ok, ' + bad + ' falhas');
process.exit(bad ? 1 : 0);
