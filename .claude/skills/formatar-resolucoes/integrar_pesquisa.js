// Integra a pesquisa de fatos (pesq_out_*.json) às fichas de js/doutrina-df.js.
// Uso (raiz do repositório): node .claude/skills/formatar-resolucoes/integrar_pesquisa.js <pasta_com_pesq_out> [--aplicar]
// Sem --aplicar só mostra o que mudaria. Regras: seção existente (mesmo título) recebe as linhas novas; senão cria seção; chaves e fontes entram sem duplicar.
const fs = require('fs'), path = require('path');
const pasta = process.argv[2], aplicar = process.argv.includes('--aplicar');
const arq = 'js/doutrina-df.js'; const src = fs.readFileSync(arq, 'utf8');
const cab = src.slice(0, src.indexOf('const DOUTRINA_DF'));
const D = (new Function(src.replace(/^[\s\S]*?const\s+DOUTRINA_DF\s*=/, 'return ').replace(/;\s*$/, '')))();
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
let novas = 0, existentes = 0, linhas = 0;
for (const f of fs.readdirSync(pasta).filter(x => /^pesq_out_\d+\.json$/.test(x)).sort()) {
  for (const o of JSON.parse(fs.readFileSync(path.join(pasta, f), 'utf8'))) {
    const d = D[o.ficha]; if (!d) { console.log('ficha desconhecida:', o.ficha, 'q', o.n); continue; }
    if (!o.linhas || !o.linhas.length || o.origem === 'inconclusivo' && !o.fontes.length) continue;
    let sec = d.secs.find(s => norm(s.titulo) === norm(o.secao));
    if (!sec) { sec = { titulo: o.secao, lei: [], peg: '', chaves: [] }; d.secs.push(sec); novas++; } else existentes++;
    o.linhas.forEach(l => { if (!sec.lei.some(x => norm(x) === norm(l))) { sec.lei.push(l); linhas++; } });
    if (o.peg && !sec.peg) sec.peg = o.peg;
    sec.chaves = sec.chaves || [];
    (o.chaves || []).forEach(c => { try { new RegExp(c, 'iu'); if (!sec.chaves.includes(c)) sec.chaves.push(c); } catch (_) { console.log('regex inválida ignorada:', c); } });
    (o.fontes || []).forEach(([nome, url]) => { if (url && !d.fontes.some(x => x[1] === url)) d.fontes.push([nome, url]); });
  }
}
console.log({ secoesNovas: novas, secoesAmpliadas: existentes, linhasNovas: linhas });
if (aplicar) {
  const novoCab = cab.replace('fichas elaboradas SOMENTE a partir da apostila do usuário', 'fichas elaboradas a partir da apostila do usuário e, onde a linha traz "(Fonte: …)" e a URL consta em `fontes`, de fontes externas confiáveis (out/2026)');
  fs.writeFileSync(arq, novoCab + 'const DOUTRINA_DF = ' + JSON.stringify(D, null, 1) + ';\n');
  console.log('js/doutrina-df.js atualizado');
}
