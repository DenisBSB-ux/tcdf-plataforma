/* Selo "Atualização legal" por matéria: data da última conferência de mudanças em leis, decretos,
   jurisprudência e afins. Mantido à mão ou pela rotina semanal (.claude/skills/atualizacao-legal-semanal).
   re = regex (sem distinção de maiúsculas) aplicada ao nome da matéria; data = AAAA-MM-DD da última conferência;
   resumo = o que foi conferido/mudou. Matéria sem entrada (ou sem data) aparece como "sem conferência registrada". */
const ATUALIZACOES_LEGAIS = [
  { re: '8\\.?429|9\\.?784|2\\.?834|improbidade', data: '2026-10-20', resumo: 'ADIs 7156/7236 (STF, 1º/7/2026): perda da função (art. 12 §1º), prescrição (art. 23 §5º), indisponibilidade (art. 16), ANPC (art. 17-B §3º). Tema 1199 e ADIs 7042/7043 mantidos.' },
  { re: '14\\.?133|licita|contrata', data: '', resumo: '' },
  { re: 'IN (n[ºo°] ?)?5\\b|instru[çc][ãa]o normativa', data: '', resumo: '' },
  { re: '44\\.?330', data: '', resumo: '' },
];
function atualizacaoLegalDaMateria(m){
  const e = ATUALIZACOES_LEGAIS.find(x => new RegExp(x.re, 'i').test(m || ''));
  return e ? { data: e.data || '', resumo: e.resumo || '' } : { data: '', resumo: '' };
}
function atualizacaoLegalBadge(m){
  const a = atualizacaoLegalDaMateria(m);
  if(!a.data) return `<span class="badge-atualizacao-legal sem" title="Ainda não houve conferência de mudanças em leis, decretos e jurisprudência desta matéria.">⚖️ sem conferência registrada</span>`;
  const [y, mo, d] = a.data.split('-');
  const dias = Math.floor((Date.now() - new Date(a.data + 'T12:00:00').getTime()) / 86400000);
  const velha = dias > 30;
  return `<span class="badge-atualizacao-legal${velha ? ' velha' : ''}" title="${esc(a.resumo || 'Última conferência de mudanças em leis, decretos e jurisprudência.')}">⚖️ Atualizada em ${d}/${mo}/${y}</span>`;
}
