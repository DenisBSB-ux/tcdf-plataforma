#!/usr/bin/env node
// Integridade dos textos de lei (js/*-texto.js) alterados por rotina automática.
// Uso: node verificar_textos.js [<ref-base>] <arquivo.js> ...   (ref-base padrão: origin/main; use "-" para só validar a estrutura)
// Falha (exit 1) se: o arquivo não carrega; algum artigo tem linha vazia/não-texto; ou SUMIU alguma chave (artigo) em relação à base.
const fs = require('fs'), cp = require('child_process'), vm = require('vm');
let args = process.argv.slice(2); let ref = 'origin/main';
if (args.length && !args[0].endsWith('.js')) ref = args.shift();
function carregar(src, nome) {
  const m = src.match(/^const (\w+_TEXTO)\s*=/m); if (!m) throw new Error('sem const NOME_TEXTO');
  return vm.runInNewContext(src + ';' + m[1], {}, { timeout: 5000 });
}
let erros = 0;
for (const f of args) {
  try {
    const novo = carregar(fs.readFileSync(f, 'utf8'));
    const chaves = Object.keys(novo);
    if (!chaves.length) throw new Error('nenhum artigo');
    for (const [k, v] of Object.entries(novo)) {
      if (!Array.isArray(v) || !v.length) throw new Error('artigo ' + k + ' sem linhas');
      v.forEach((l, i) => { if (typeof l !== 'string' || !l.trim()) throw new Error('artigo ' + k + ' linha ' + i + ' vazia'); });
    }
    if (ref !== '-') {
      let antigo = null;
      try { antigo = carregar(cp.execSync('git show ' + ref + ':' + f, { encoding: 'utf8', maxBuffer: 1 << 28 })); } catch (_) { /* arquivo novo */ }
      if (antigo) { const sumiu = Object.keys(antigo).filter(k => !(k in novo)); if (sumiu.length) throw new Error('artigos que sumiram: ' + sumiu.slice(0, 10).join(', ')); }
    }
    console.log('ok', f, chaves.length, 'artigos');
  } catch (e) { erros++; console.error('FALHOU', f, '-', e.message); }
}
process.exit(erros ? 1 : 0);
