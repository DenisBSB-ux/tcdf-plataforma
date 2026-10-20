/* Selo "Atualização legal" por matéria: data da última conferência de mudanças em leis, decretos,
   jurisprudência e afins. Mantido à mão ou pela rotina semanal (.claude/skills/atualizacao-legal-semanal).
   re = regex (sem distinção de maiúsculas) aplicada ao nome da matéria; data = AAAA-MM-DD da última conferência;
   resumo = o que foi conferido/mudou. Matéria sem entrada (ou sem data) aparece como "sem conferência registrada". */
const ATUALIZACOES_LEGAIS = [
  { re: '8\\.?429|9\\.?784|2\\.?834|improbidade', data: '2026-10-20', resumo: 'ADIs 7156/7236 (STF, 1º/7/2026): perda da função (art. 12 §1º), prescrição (art. 23 §5º), indisponibilidade (art. 16), ANPC (art. 17-B §3º). Tema 1199 e ADIs 7042/7043 mantidos. Lei 9.784: sem alteração localizada; Súmula 633 do STJ vigente.' },
  { re: '14\\.?133|licita|contrat', data: '2026-10-20', resumo: 'Sem alteração legislativa da Lei 14.133 localizada em 2026. Valores reajustados pelo Decreto 12.807/2025 (+4,41%, desde 1º/1/2026): art. 75, I e II, e art. 6º, XXII, ganharam nota no pop-up (fonte secundária, conferir no DOU).' },
  { re: 'IN (n[ºo°] ?)?5\\b|instru[çc][ãa]o normativa', data: '2026-10-20', resumo: 'IN SEGES 5/2017 segue vigente (gov.br: atualizada em 14/4/2026). Nova IN SEGES/MGI 147/2026 (reembolso-creche em dedicação exclusiva de mão de obra).' },
  { re: '44\\.?330', data: '2026-10-20', resumo: 'Decreto 44.330/2023 foi alterado pelos Decretos 46.308/2024 e 47.386/2025 (há referência ao 48.509/2026). O texto da plataforma já traz a remissão aos arts. 164-168 no art. 3º (alteração de 2024), indicando versão consolidada; os decretos de 2025/2026 não foram confirmados.' },
  { re: 'regimento|RI TCDF|TCDF|org[âa]nica|controle externo', data: '2026-10-20', resumo: 'Sem alteração de 2026 localizada no Regimento Interno (Res. 296/2016) nem na Lei Orgânica (LC 1/1994); fonte oficial não acessada.' },
  { re: 'tribut|ICMS|ISS|IBS|CBS|reforma|9\\.?430|lucro', data: '2026-10-20', resumo: 'Reforma tributária: LC 214/2025 regulamentada em 2026 (decretos e resoluções do CGIBS), LC 227/2026 e LC 225/2026 alteraram a Lei 9.430. Conferir ICMS/ISS (LC 87/LC 116) no texto consolidado.' },
  { re: 'previd|109', data: '2026-10-20', resumo: 'LC 109/2001: última alteração detectada em 15/6/2026 (dispositivo não identificado). STJ: art. 69 §1º afasta exigência de plano para todos os empregados (Lei 8.212, art. 28 §9º, "p").' },
  { re: 'constitucional|CF|direitos fundamentais', data: '2026-10-20', resumo: 'Emendas constitucionais de 2026 não localizadas em fonte confiável; conferir no Planalto.' },
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

/* Questão cuja resolução traz o selo "Atualização verificada em DD/MM/AAAA: ..." com mudança real
   (selos de "sem alteração localizada / mantido" não geram aviso). */
function questaoAtualizadaAviso(q){
  const m = String((q && q.r) || '').match(/Atualiza[çc][ãa]o verificada em (\d{2}\/\d{2}\/\d{4}):\s*([^\n]*)/i);
  if(!m || /n[ãa]o localizei|sem altera|sem mudan|mantid[oa]s?\b(?!.*(ADI|inconstitucion))/i.test(m[2]) && !/ADI 7236|invalidaram|declarou inconstitucional|dispensaram/i.test(m[2])) return '';
  return `<div class="aviso-questao-atualizada"><span class="tag-cobranca" title="${esc(m[2])}">⚠️ Atenção: Questão atualizada em ${m[1].slice(0,5)}</span></div>`;
}
