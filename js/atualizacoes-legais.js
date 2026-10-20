/* Selo "Atualização legal" por matéria: data da última conferência de mudanças em leis, decretos,
   jurisprudência e afins. Mantido à mão ou pela rotina semanal (.claude/skills/atualizacao-legal-semanal).
   re = regex (sem distinção de maiúsculas) aplicada ao nome da matéria; data = AAAA-MM-DD da última conferência;
   resumo = o que foi conferido/mudou. Matéria sem entrada (ou sem data) aparece como "sem conferência registrada". */
const ATUALIZACOES_LEGAIS = [
  { re: 'AFO|or[çc]ament|administra[çc][ãa]o financeira|4\\.?320|responsabilidade fiscal', data: '2026-10-20', resumo: 'Lei 4.320/1964 e LRF (LC 101/2000) conferidas com o compilado do Planalto (via terceiros, obtido em 12/10/2026): LRF alterada por LC 173/2020, 177/2021, 178/2021, 200/2023, 208/2024 (art. 39-A da Lei 4.320), 212/2025 e 224/2025; CF art. 165 § 2º com redação da EC 109/2021. Decreto distrital 32.598/2010 conferido no arquivo do Drive. Decreto 10.426/2020 (atualizado até o Decreto 12.841/2026), Decreto 93.872/1986 e Portaria MOG 42/1999 conferidos nos arquivos do Drive. MCASP, MTO e Decreto 7.185/2010 consultados só em parte ou não carregados: conferir.' },
  { re: 'PDPM|mulher|Maria da Penha|11\\.?340', data: '2026-10-20', resumo: 'Lei 11.340/2006 conferida com o compilado do Planalto (PDF do Drive, com a Lei 15.383/2026): alterações recentes — Lei 14.994/2024 (art. 24-A: reclusão de 2 a 5 anos e multa), Leis 15.380, 15.383, 15.384 (violência vicária, art. 7º VI), 15.411, 15.412, 15.438 e 15.455/2026; art. 16 com nota "Vide ADI 7267". Decreto 42.590/2021 e o Anexo do II PDPM (2020-2023) conferidos no arquivo do Drive (pop-up com os arts. 1º a 12 e os 9 eixos do Anexo). Pontos da consulta pública seguem só a apostila.' },
  { re: 'primeiros socorros|socorro|ressuscita', data: '2026-10-20', resumo: 'Diretrizes conferidas por pesquisa (textos oficiais da AHA não abertos): primeiros socorros AHA e Cruz Vermelha 2024 (torniquete em sangramento grave de membro, sem evidência para pontos de pressão, resfriar queimadura por 10 a 20 minutos) e atualização de RCP e ECC da AHA de 2025 (engasgo em adultos e crianças com golpes nas costas alternados com compressões abdominais; lactente com golpes nas costas e compressões torácicas; cadeia de sobrevivência única). A técnica das compressões no lactente (calcanhar da mão ou polegares) está em fontes secundárias: conferir. Código Penal art. 135 por fonte secundária.' },
  { re: '8\\.?429|9\\.?784|2\\.?834|improbidade', data: '2026-10-20', resumo: 'ADIs 7156/7236 (STF, 1º/7/2026): perda da função (art. 12 §1º), prescrição (art. 23 §5º), indisponibilidade (art. 16), ANPC (art. 17-B §3º). Tema 1199 e ADIs 7042/7043 mantidos. Lei 9.784: sem alteração localizada; Súmula 633 do STJ vigente.' },
  { re: '14\\.?133|licita|contrat', data: '2026-10-20', resumo: 'Sem alteração legislativa da Lei 14.133 localizada em 2026. Valores reajustados pelo Decreto 12.807/2025 (+4,41%, desde 1º/1/2026): art. 75, I e II, e art. 6º, XXII, ganharam nota no pop-up (fonte secundária, conferir no DOU).' },
  { re: 'IN (n[ºo°] ?)?5\\b|instru[çc][ãa]o normativa', data: '2026-10-20', resumo: 'IN SEGES 5/2017 segue vigente (gov.br: atualizada em 14/4/2026). Nova IN SEGES/MGI 147/2026 (reembolso-creche em dedicação exclusiva de mão de obra).' },
  { re: '44\\.?330', data: '2026-10-20', resumo: 'Lista conferida com o texto da plataforma (consolidado até o Decreto 46.308/2024; art. 12 § 3º alterado pelo Decreto 45.422/2024). Decretos 47.386/2025 e 48.509/2026 citados nas fontes, não confirmados.' },
  { re: 'regimento|RI TCDF|TCDF|org[âa]nica|controle externo', data: '2026-10-20', resumo: 'Sem alteração de 2026 localizada no Regimento Interno (Res. 296/2016) nem na Lei Orgânica (LC 1/1994); fonte oficial não acessada.' },
  { re: 'tribut|ICMS|ISS|IBS|CBS|reforma|9\\.?430|lucro', data: '2026-10-20', resumo: 'Lista conferida: nenhuma emenda constitucional de 2026 alterou a CF/ADCT sobre o tema; ADI contra a EC 103/2019 (art. 149 §§ 1º-A a 1º-C) sem resultado final localizado; SV 57 mantida. Lei 9.430: LC 225/2026 (art. 83, §§ 5º e 7º, devedor contumaz) e LC 227/2026 (art. 81, VIII) já constam do texto da plataforma. LC 214/2025 e suas regulamentações de 2026: texto oficial não conferido.' },
  { re: 'previd|109', data: '2026-10-20', resumo: 'LC 109/2001: última alteração detectada em 15/6/2026 (dispositivo não identificado). STJ: art. 69 §1º afasta exigência de plano para todos os empregados (Lei 8.212, art. 28 §9º, "p").' },
  { re: 'LGPD|LAI|13\\.?709|12\\.?527|acesso [àa] informa|dados pessoais', data: '2026-10-20', resumo: 'LAI (Lei 12.527): texto oficial conferido (Planalto, compilado de 2021); nenhuma alteração em 2025/2026 localizada; art. 12 com redação ligada à Lei 14.129/2021. LGPD: art. 5º VIII/XIX (Lei 15.352/2026) e art. 55-A (MP 1.317/2025; Lei 15.452/2026) trocaram "Autoridade" por "Agência" Nacional de Proteção de Dados; texto transcrito de dossiê de terceiros (não oficial) e só dos artigos transcritos; conferir no Planalto.' },
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
  return `<span class="tag tag-cobranca tag-cobranca-A" title="${esc(m[2])}">⚠️ Atenção: Questão atualizada em ${m[1].slice(0,5)}</span>`;
}
