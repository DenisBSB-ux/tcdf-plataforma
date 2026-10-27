// Consulta o texto de lei CARREGADO na plataforma (único jeito de confirmar dispositivo — nunca citar artigo de memória).
// Uso (de qualquer pasta):  node lei.js "Lei 14.133" 94 95        → texto dos artigos
//                           node lei.js busca "Lei 14.133" "termo" → artigos que contêm o termo
//                           node lei.js normas                     → siglas disponíveis (chaves de LEI_FONTES em js/teoria.js)
const fs = require('fs'), path = require('path');
const RAIZ = path.resolve(__dirname, '../../..');
const teoria = fs.readFileSync(path.join(RAIZ, 'js/teoria.js'), 'utf8');
const FONTES = {};
for (const m of teoria.matchAll(/^\s*(?:'([^']+)'|([A-Z0-9]+)):\{\s*arquivo:'([^']+)'/gm)) FONTES[m[1] || m[2]] = m[3];
function carrega(sigla) {
  const arq = FONTES[sigla]; if (!arq) { console.error('norma não carregada na plataforma:', sigla, '| disponíveis:', Object.keys(FONTES).join(', ')); process.exit(1); }
  const s = fs.readFileSync(path.join(RAIZ, arq), 'utf8');
  return (new Function(s.replace(/^[\s\S]*?const\s+\w+\s*=/, 'return ').replace(/;\s*$/, '')))();
}
if (require.main === module) {
const a = process.argv.slice(2);
if (a[0] === 'normas') console.log(Object.keys(FONTES).join('\n'));
else if (a[0] === 'busca') { const o = carrega(a[1]), t = a[2].toLowerCase(); Object.keys(o).forEach(n => { if (o[n].join(' ').toLowerCase().includes(t)) console.log('Art.', n, '|', o[n][0].slice(0, 110)); }); }
else { const o = carrega(a[0]); a.slice(1).forEach(n => console.log((o[n] || ['(artigo não carregado)']).join('\n') + '\n')); }
}
module.exports = { FONTES, carrega };
