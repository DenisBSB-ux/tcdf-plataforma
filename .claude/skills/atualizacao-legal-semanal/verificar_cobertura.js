// Uso (raiz do repositório): node .claude/skills/atualizacao-legal-semanal/verificar_cobertura.js [AAAA-MM-DD]
// Confere se TODA matéria (chaves de EDITAL em js/edital.js + _materias_extras de fontes_oficiais.json) tem selo em ATUALIZACOES_LEGAIS
// com data >= a data dada (padrão: ontem). Sai com código 1 e lista as pendentes: a rotina só pode abrir o PR com 0 pendências.
const fs = require('fs'); const path = require('path');
global.window = global; global.document = { addEventListener() {} }; global.esc = String;
(0, eval)(fs.readFileSync('js/edital.js', 'utf8') + ';global.ED=EDITAL');
(0, eval)(fs.readFileSync('js/atualizacoes-legais.js', 'utf8') + ';global.AL=ATUALIZACOES_LEGAIS');
const fo = JSON.parse(fs.readFileSync(path.join(__dirname, 'fontes_oficiais.json'), 'utf8'));
const materias = [...new Set([...Object.keys(ED), ...(fo._materias_extras || [])])];
const ontem = new Date(Date.now() - 86400000).toISOString().slice(0, 10); const desde = process.argv[2] || ontem;
const pend = [];
for (const m of materias) {
  const e = AL.find(x => new RegExp(x.re, 'i').test(m));
  if (!e) pend.push(m + ' → SEM selo (crie a entrada em ATUALIZACOES_LEGAIS)');
  else if (!e.data || e.data < desde) pend.push(m + ' → selo de ' + (e.data || 'sem data') + ' (anterior a ' + desde + '): não conferida');
}
console.log('matérias:', materias.length, '| pendentes:', pend.length); pend.forEach(p => console.log(' -', p));
process.exit(pend.length ? 1 : 0);
