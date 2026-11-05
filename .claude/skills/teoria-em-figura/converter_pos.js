// Converte cartões escritos com `pos:K` (posição na lista) em `n:<número do cabeçalho>, h:'<código do enunciado>'`.
// Uso: node converter_pos.js <indice.json> <entrada.js> <saida.js>
// O código (h) é o mesmo FNV-1a de teoria-cartoes.js (_ctHash): texto sem acentos/pontuação, minúsculo.
const fs = require('fs');
const [indice, entrada, saida] = process.argv.slice(2);
const idx = JSON.parse(fs.readFileSync(indice, 'utf8'));
const hash = txt => { const s = String(txt || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ''); let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(36); };
let src = fs.readFileSync(entrada, 'utf8');
src = src.replace(/(\{\s*m:\s*\/[^/]+\/i?,\s*)pos:\s*(\d+)\s*,/g, (m, pre, pos) => { const x = idx[+pos - 1]; if (!x) throw new Error('pos inválida ' + pos); return pre + 'n:' + x.n + ", h:'" + hash(x.q) + "', "; });
if (/\bpos:\s*\d+/.test(src)) throw new Error('sobrou pos');
fs.writeFileSync(saida, src); console.log('ok');
