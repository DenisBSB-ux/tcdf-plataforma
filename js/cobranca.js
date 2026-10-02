/* ================= TIPO DE COBRANÇA (como a questão foi redigida) =================
   Classificação feita lendo cada questão (enunciado, gabarito e resolução).
   Guardada pelo uid — não altera a questão nem o progresso.

   Valor: TIPO[:armadilha][?]
     TIPO — L literal · T literal com troca · I interpretativa · J jurisprudência
            H caso hipotético · R resposta lógica · C cálculo
     armadilha (itens com gabarito Errado) — inv inverte a regra · ext
            extrapola/generaliza · res restringe indevidamente · ter troca termo,
            sujeito ou competência · num troca prazo/número · mis mistura institutos
     ? — classificação duvidosa (conferir)

   A etiqueta só aparece depois de responder: "literal com troca" e a
   armadilha denunciam que o gabarito é Errado. Pelo mesmo motivo o filtro do
   simulado junta L e T no grupo "Lei seca".

   Matérias classificadas: RJU LC840 (piloto), Administrativo (geral) (299 questões). */

const COBRANCA_TIPOS = {
  L: ['📜', 'Literal', 'Cópia do texto da lei (lei seca)'],
  T: ['🔀', 'Literal com troca', 'Texto da lei com uma palavra ou dado trocado — a pegadinha está na troca'],
  I: ['🧠', 'Interpretativa', 'Exige entender o sentido do texto, combinar dispositivos ou a doutrina'],
  J: ['⚖️', 'Jurisprudência', 'Cobra entendimento do STF, STJ, TCU ou súmula'],
  H: ['🧩', 'Caso hipotético', 'Aplicar a regra a uma situação concreta'],
  R: ['💡', 'Resposta lógica', 'Dá para acertar por raciocínio ou bom senso, mesmo sem dominar a matéria'],
  C: ['🔢', 'Cálculo', 'Exige fazer contas'],
};
const COBRANCA_ARMADILHAS = {
  inv: 'inverte a regra (diz permitido o que a lei veda, ou o contrário, ou tira a exceção)',
  ext: 'extrapola: generaliza ou amplia o que a lei restringe',
  res: 'restringe indevidamente o que a lei diz de forma ampla',
  ter: 'troca um termo, sujeito, instrumento ou competência',
  num: 'troca prazo, número ou percentual',
  mis: 'mistura dois institutos (ex.: reintegração × recondução)',
};
// grupos do filtro do simulado (L e T juntos para não denunciar o gabarito)
const COBRANCA_GRUPOS = [
  ['lei', '📜 Lei seca', ['L','T']],
  ['I', '🧠 Interpretativa', ['I']],
  ['J', '⚖️ Jurisprudência', ['J']],
  ['H', '🧩 Caso hipotético', ['H']],
  ['R', '💡 Resposta lógica', ['R']],
  ['C', '🔢 Cálculo', ['C']],
];

const COBRANCA = {
  'rju-lc840-1':'H', 'rju-lc840-2':'T:ter', 'rju-lc840-3':'T:ter', 'rju-lc840-4':'L', 'rju-lc840-5':'T:inv', 'rju-lc840-6':'L', 'rju-lc840-7':'T:ext', 'rju-lc840-8':'L', 'rju-lc840-9':'L', 'rju-lc840-10':'T:mis',
  'rju-lc840-11':'R:ext', 'rju-lc840-12':'H', 'rju-lc840-13':'T:inv', 'rju-lc840-14':'T:ext', 'rju-lc840-15':'L', 'rju-lc840-16':'T:mis', 'rju-lc840-17':'T:inv', 'rju-lc840-18':'H:inv?', 'rju-lc840-19':'T:mis', 'rju-lc840-20':'T:inv',
  'rju-lc840-21':'R:inv', 'rju-lc840-22':'T:res', 'rju-lc840-23':'L', 'rju-lc840-24':'L', 'rju-lc840-25':'T:inv', 'rju-lc840-26':'T:res', 'rju-lc840-27':'H', 'rju-lc840-28':'H:inv', 'rju-lc840-29':'L', 'rju-lc840-30':'L',
  'rju-lc840-31':'H:inv', 'rju-lc840-32':'T:ter', 'rju-lc840-33':'T:ext', 'rju-lc840-34':'R', 'rju-lc840-35':'H:mis', 'rju-lc840-36':'H', 'rju-lc840-37':'I', 'rju-lc840-38':'T:num', 'rju-lc840-39':'T:ter', 'rju-lc840-40':'L',
  'rju-lc840-41':'L', 'rju-lc840-42':'L', 'rju-lc840-43':'L', 'rju-lc840-44':'L', 'rju-lc840-45':'T:inv', 'rju-lc840-46':'T:mis', 'rju-lc840-47':'T:mis', 'rju-lc840-48':'L', 'rju-lc840-49':'L', 'rju-lc840-50':'T:ext',
  'rju-lc840-51':'L', 'rju-lc840-52':'L', 'rju-lc840-53':'L', 'rju-lc840-54':'L', 'rju-lc840-55':'L', 'rju-lc840-56':'T:ext', 'rju-lc840-57':'L', 'rju-lc840-58':'T:inv', 'rju-lc840-59':'I', 'rju-lc840-60':'L',
  'rju-lc840-61':'L', 'rju-lc840-62':'T:inv', 'rju-lc840-63':'L', 'rju-lc840-64':'L', 'rju-lc840-65':'L', 'rju-lc840-66':'T:num', 'rju-lc840-67':'J', 'rju-lc840-68':'T:ext', 'rju-lc840-69':'T:inv', 'rju-lc840-70':'L',
  'rju-lc840-71':'L', 'rju-lc840-72':'T:num', 'rju-lc840-73':'L', 'rju-lc840-74':'L', 'rju-lc840-75':'R', 'rju-lc840-76':'L', 'rju-lc840-77':'L', 'rju-lc840-78':'L', 'rju-lc840-79':'L', 'rju-lc840-80':'L',
  'rju-lc840-81':'T:inv', 'rju-lc840-82':'T:ext', 'rju-lc840-83':'L', 'rju-lc840-84':'L', 'rju-lc840-85':'R', 'rju-lc840-86':'I', 'rju-lc840-87':'I:ext', 'rju-lc840-88':'L', 'rju-lc840-89':'R', 'rju-lc840-90':'R:inv',
  'rju-lc840-91':'T:ter', 'rju-lc840-92':'L', 'rju-lc840-93':'L', 'rju-lc840-94':'L', 'rju-lc840-95':'L', 'rju-lc840-96':'L', 'rju-lc840-97':'L', 'rju-lc840-98':'L', 'rju-lc840-99':'L', 'rju-lc840-100':'T:inv',
  'rju-lc840-101':'I:ext', 'rju-lc840-102':'T:inv', 'rju-lc840-103':'I', 'rju-lc840-104':'T:ter', 'rju-lc840-105':'L', 'rju-lc840-106':'I:ext', 'rju-lc840-107':'R:ext', 'rju-lc840-108':'T:ter', 'rju-lc840-109':'T:res', 'rju-lc840-110':'L',
  'rju-lc840-111':'L', 'rju-lc840-112':'I:ext', 'rju-lc840-113':'T:ext', 'rju-lc840-114':'L', 'rju-lc840-115':'H:ter', 'rju-lc840-116':'H:ext', 'rju-lc840-117':'H:ter?', 'rju-lc840-118':'T:res', 'rju-lc840-119':'H:inv', 'rju-lc840-120':'L',
  'rju-lc840-121':'R:res', 'rju-lc840-122':'L', 'rju-lc840-123':'H', 'rju-lc840-124':'T:mis', 'rju-lc840-125':'H:mis', 'rju-lc840-126':'H:ext', 'rju-lc840-127':'H', 'rju-lc840-128':'T:inv', 'rju-lc840-129':'T:inv', 'rju-lc840-130':'L',
  'rju-lc840-131':'L', 'rju-lc840-132':'I', 'rju-lc840-133':'H', 'rju-lc840-134':'T:ter?', 'rju-lc840-135':'H', 'rju-lc840-136':'H:ter', 'rju-lc840-137':'H', 'rju-lc840-138':'H:num', 'rju-lc840-139':'H:inv', 'rju-lc840-140':'L',
  'rju-lc840-141':'L', 'rju-lc840-142':'H:inv', 'rju-lc840-143':'L', 'rju-lc840-144':'L', 'rju-lc840-145':'H:ter', 'rju-lc840-146':'T:mis', 'rju-lc840-147':'L', 'rju-lc840-148':'T:inv', 'rju-lc840-149':'L', 'rju-lc840-150':'T:num',
  'rju-lc840-151':'L', 'rju-lc840-152':'L', 'rju-lc840-153':'L', 'rju-lc840-154':'L', 'rju-lc840-155':'T:num', 'rju-lc840-156':'T:ter', 'rju-lc840-157':'T:ter', 'rju-lc840-158':'L', 'rju-lc840-159':'T:res', 'rju-lc840-160':'L',
  'rju-lc840-161':'L', 'rju-lc840-162':'L', 'rju-lc840-163':'T:inv', 'rju-lc840-164':'L', 'rju-lc840-165':'T:num', 'rju-lc840-166':'T:res', 'rju-lc840-167':'L', 'rju-lc840-168':'L', 'rju-lc840-169':'L', 'rju-lc840-170':'L',
  'rju-lc840-171':'T:num', 'rju-lc840-172':'T:ter', 'rju-lc840-173':'J', 'rju-lc840-174':'L', 'rju-lc840-175':'L', 'rju-lc840-176':'T:inv', 'rju-lc840-177':'T:inv', 'rju-lc840-178':'T:inv', 'rju-lc840-179':'T:inv', 'rju-lc840-180':'L',
  'rju-lc840-181':'T:ext', 'rju-lc840-182':'T:res', 'rju-lc840-183':'H', 'rju-lc840-184':'T:mis', 'rju-lc840-185':'L', 'rju-lc840-186':'R', 'rju-lc840-187':'L', 'rju-lc840-188':'L', 'rju-lc840-189':'I', 'rju-lc840-190':'T:ter',
  'rju-lc840-191':'L', 'rju-lc840-192':'L', 'rju-lc840-193':'R:ext', 'rju-lc840-194':'T:res', 'rju-lc840-195':'L', 'rju-lc840-196':'L', 'rju-lc840-197':'L', 'rju-lc840-198':'L', 'rju-lc840-199':'R:inv', 'rju-lc840-200':'I?',

  'administrativo-geral-1':'J', 'administrativo-geral-2':'H', 'administrativo-geral-3':'H', 'administrativo-geral-4':'J', 'administrativo-geral-5':'L', 'administrativo-geral-6':'T:inv', 'administrativo-geral-7':'L', 'administrativo-geral-8':'T:mis', 'administrativo-geral-9':'I', 'administrativo-geral-10':'L',
  'administrativo-geral-11':'L', 'administrativo-geral-12':'J', 'administrativo-geral-13':'L', 'administrativo-geral-14':'J', 'administrativo-geral-15':'L', 'administrativo-geral-16':'T:inv', 'administrativo-geral-17':'T:inv', 'administrativo-geral-18':'L', 'administrativo-geral-19':'L', 'administrativo-geral-20':'I',
  'administrativo-geral-21':'H', 'administrativo-geral-22':'T:mis', 'administrativo-geral-23':'L', 'administrativo-geral-24':'H', 'administrativo-geral-25':'L', 'administrativo-geral-26':'L', 'administrativo-geral-27':'T:ext', 'administrativo-geral-28':'T:ext', 'administrativo-geral-29':'L', 'administrativo-geral-30':'L',
  'administrativo-geral-31':'T:ter', 'administrativo-geral-32':'L', 'administrativo-geral-33':'T:ter', 'administrativo-geral-34':'J', 'administrativo-geral-35':'L', 'administrativo-geral-36':'L', 'administrativo-geral-37':'T:inv', 'administrativo-geral-38':'T:mis', 'administrativo-geral-39':'L', 'administrativo-geral-40':'L',
  'administrativo-geral-41':'T:inv', 'administrativo-geral-42':'I', 'administrativo-geral-43':'L', 'administrativo-geral-44':'T:ext', 'administrativo-geral-45':'L', 'administrativo-geral-46':'L', 'administrativo-geral-47':'I', 'administrativo-geral-48':'I', 'administrativo-geral-49':'H', 'administrativo-geral-50':'L',
  'administrativo-geral-51':'J', 'administrativo-geral-52':'T:inv', 'administrativo-geral-53':'J', 'administrativo-geral-54':'T:inv', 'administrativo-geral-55':'I', 'administrativo-geral-56':'T:inv', 'administrativo-geral-57':'T:mis', 'administrativo-geral-58':'H', 'administrativo-geral-59':'L', 'administrativo-geral-60':'L',
  'administrativo-geral-61':'T:inv', 'administrativo-geral-62':'T:ext', 'administrativo-geral-63':'L', 'administrativo-geral-64':'L', 'administrativo-geral-65':'L', 'administrativo-geral-66':'I', 'administrativo-geral-67':'T:ter', 'administrativo-geral-68':'L', 'administrativo-geral-69':'L', 'administrativo-geral-70':'T:inv',
  'administrativo-geral-71':'H', 'administrativo-geral-72':'L', 'administrativo-geral-73':'H', 'administrativo-geral-74':'H', 'administrativo-geral-75':'L', 'administrativo-geral-76':'L', 'administrativo-geral-77':'L', 'administrativo-geral-78':'I', 'administrativo-geral-79':'L', 'administrativo-geral-80':'L',
  'administrativo-geral-81':'L', 'administrativo-geral-82':'L', 'administrativo-geral-83':'T:ter', 'administrativo-geral-84':'H', 'administrativo-geral-85':'H', 'administrativo-geral-86':'H', 'administrativo-geral-87':'T:inv', 'administrativo-geral-88':'L', 'administrativo-geral-89':'T:inv', 'administrativo-geral-90':'T:mis',
  'administrativo-geral-91':'T:ext', 'administrativo-geral-92':'T:mis', 'administrativo-geral-93':'L', 'administrativo-geral-94':'I', 'administrativo-geral-95':'L', 'administrativo-geral-96':'T:inv', 'administrativo-geral-97':'L', 'administrativo-geral-98':'I', 'administrativo-geral-99':'H', 'administrativo-geral-100':'L',
  'administrativo-geral-101':'L', 'administrativo-geral-102':'I', 'administrativo-geral-103':'L', 'administrativo-geral-104':'T:mis', 'administrativo-geral-105':'I', 'administrativo-geral-106':'L', 'administrativo-geral-107':'J', 'administrativo-geral-108':'H', 'administrativo-geral-109':'H', 'administrativo-geral-110':'L',
  'administrativo-geral-111':'T:res', 'administrativo-geral-112':'T:ext', 'administrativo-geral-113':'I', 'administrativo-geral-114':'I', 'administrativo-geral-115':'J', 'administrativo-geral-116':'L', 'administrativo-geral-117':'J', 'administrativo-geral-118':'T:ter', 'administrativo-geral-119':'J', 'administrativo-geral-120':'J',
  'administrativo-geral-121':'J:inv', 'administrativo-geral-122':'J:inv', 'administrativo-geral-123':'J:inv', 'administrativo-geral-124':'L', 'administrativo-geral-125':'J', 'administrativo-geral-126':'J', 'administrativo-geral-127':'J', 'administrativo-geral-128':'J', 'administrativo-geral-129':'J:inv', 'administrativo-geral-130':'J',
  'administrativo-geral-131':'T:inv', 'administrativo-geral-132':'T:ext', 'administrativo-geral-133':'T:ext', 'administrativo-geral-134':'I', 'administrativo-geral-135':'H', 'administrativo-geral-136':'T:ext', 'administrativo-geral-137':'L', 'administrativo-geral-138':'H', 'administrativo-geral-139':'T:ter', 'administrativo-geral-140':'L',
  'administrativo-geral-142':'L', 'administrativo-geral-143':'L', 'administrativo-geral-144':'H', 'administrativo-geral-145':'L', 'administrativo-geral-146':'L', 'administrativo-geral-147':'L', 'administrativo-geral-148':'L', 'administrativo-geral-149':'L', 'administrativo-geral-150':'I', 'administrativo-geral-151':'L',
  'administrativo-geral-152':'I', 'administrativo-geral-153':'I', 'administrativo-geral-154':'T:inv', 'administrativo-geral-155':'H', 'administrativo-geral-156':'I', 'administrativo-geral-157':'J', 'administrativo-geral-158':'L', 'administrativo-geral-159':'T:ter', 'administrativo-geral-160':'J:inv', 'administrativo-geral-161':'J:ext',
  'administrativo-geral-162':'T:ext', 'administrativo-geral-163':'I', 'administrativo-geral-164':'L', 'administrativo-geral-165':'L', 'administrativo-geral-166':'H', 'administrativo-geral-167':'T:mis', 'administrativo-geral-168':'L', 'administrativo-geral-169':'T:ter', 'administrativo-geral-170':'T:ter', 'administrativo-geral-171':'T:mis',
  'administrativo-geral-172':'L', 'administrativo-geral-173':'I', 'administrativo-geral-174':'J', 'administrativo-geral-175':'J', 'administrativo-geral-176':'I', 'administrativo-geral-177':'L', 'administrativo-geral-178':'T:ter', 'administrativo-geral-179':'I', 'administrativo-geral-180':'J', 'administrativo-geral-181':'H',
  'administrativo-geral-182':'H', 'administrativo-geral-183':'L', 'administrativo-geral-184':'T:inv', 'administrativo-geral-185':'L', 'administrativo-geral-186':'L', 'administrativo-geral-187':'L', 'administrativo-geral-188':'L', 'administrativo-geral-189':'L', 'administrativo-geral-190':'J', 'administrativo-geral-191':'J',
  'administrativo-geral-192':'I', 'administrativo-geral-193':'J', 'administrativo-geral-194':'I', 'administrativo-geral-195':'L', 'administrativo-geral-196':'T:inv', 'administrativo-geral-197':'T:ter', 'administrativo-geral-198':'J', 'administrativo-geral-199':'H', 'administrativo-geral-200':'L', 'administrativo-geral-201':'J',
  'administrativo-geral-202':'L', 'administrativo-geral-203':'I', 'administrativo-geral-204':'J', 'administrativo-geral-205':'L', 'administrativo-geral-206':'L', 'administrativo-geral-207':'I', 'administrativo-geral-208':'I', 'administrativo-geral-209':'L', 'administrativo-geral-210':'L', 'administrativo-geral-211':'T:mis',
  'administrativo-geral-212':'I', 'administrativo-geral-213':'T:inv', 'administrativo-geral-214':'J:inv', 'administrativo-geral-215':'J:inv', 'administrativo-geral-216':'J', 'administrativo-geral-217':'J', 'administrativo-geral-218':'J:inv', 'administrativo-geral-219':'H', 'administrativo-geral-220':'L', 'administrativo-geral-221':'T:mis',
  'administrativo-geral-222':'T:inv', 'administrativo-geral-223':'L', 'administrativo-geral-224':'L', 'administrativo-geral-225':'L', 'administrativo-geral-226':'L', 'administrativo-geral-227':'L', 'administrativo-geral-228':'L', 'administrativo-geral-229':'L', 'administrativo-geral-230':'I', 'administrativo-geral-231':'H',
  'administrativo-geral-232':'J', 'administrativo-geral-233':'H', 'administrativo-geral-234':'I', 'administrativo-geral-235':'L', 'administrativo-geral-236':'J', 'administrativo-geral-237':'T:mis', 'administrativo-geral-238':'T:res', 'administrativo-geral-239':'L', 'administrativo-geral-240':'T:ter', 'administrativo-geral-241':'L?',
  'administrativo-geral-242':'T:inv', 'administrativo-geral-243':'H', 'administrativo-geral-244':'H', 'administrativo-geral-245':'I', 'administrativo-geral-246':'L', 'administrativo-geral-247':'L', 'administrativo-geral-248':'T:ter', 'administrativo-geral-249':'L', 'administrativo-geral-250':'I', 'administrativo-geral-251':'J',
  'administrativo-geral-252':'T:mis', 'administrativo-geral-253':'T:ext', 'administrativo-geral-254':'L', 'administrativo-geral-255':'I', 'administrativo-geral-256':'L', 'administrativo-geral-257':'T:mis', 'administrativo-geral-258':'T:ext', 'administrativo-geral-259':'L', 'administrativo-geral-260':'L', 'administrativo-geral-261':'L',
  'administrativo-geral-262':'I', 'administrativo-geral-263':'I', 'administrativo-geral-264':'I', 'administrativo-geral-265':'L', 'administrativo-geral-266':'T:ter', 'administrativo-geral-267':'I', 'administrativo-geral-268':'I', 'administrativo-geral-269':'T:mis', 'administrativo-geral-270':'T:ext', 'administrativo-geral-271':'L',
  'administrativo-geral-272':'L', 'administrativo-geral-273':'L', 'administrativo-geral-274':'L', 'administrativo-geral-275':'I', 'administrativo-geral-276':'H', 'administrativo-geral-277':'H', 'administrativo-geral-278':'L', 'administrativo-geral-279':'L', 'administrativo-geral-280':'T:mis', 'administrativo-geral-281':'T:ter',
  'administrativo-geral-282':'L', 'administrativo-geral-283':'H', 'administrativo-geral-284':'L', 'administrativo-geral-285':'L', 'administrativo-geral-286':'L', 'administrativo-geral-287':'T:ter', 'administrativo-geral-288':'I', 'administrativo-geral-289':'H', 'administrativo-geral-290':'L', 'administrativo-geral-291':'T:ext',
  'administrativo-geral-292':'L', 'administrativo-geral-293':'L', 'administrativo-geral-294':'T:mis', 'administrativo-geral-295':'T:ter', 'administrativo-geral-296':'T:inv', 'administrativo-geral-297':'J:inv', 'administrativo-geral-298':'T:ext', 'administrativo-geral-299':'J', 'administrativo-geral-300':'L',
};

function cobrancaDaQuestao(q){
  const v = q && COBRANCA[q.uid];
  const m = v && v.match(/^([A-Z])(?::(\w+))?(\?)?$/);
  return m ? { tipo: m[1], armadilha: m[2] || null, duvida: !!m[3] } : null;
}
function grupoCobranca(q){
  const c = cobrancaDaQuestao(q);
  if(!c) return null;
  const g = COBRANCA_GRUPOS.find(([,,tipos]) => tipos.includes(c.tipo));
  return g ? g[0] : null;
}
function materiaTemCobranca(materia){
  return ALL_QUESTIONS.some(q => q.materia===materia && COBRANCA[q.uid]);
}
// etiqueta mostrada depois de responder
function cobrancaTag(q){
  const c = cobrancaDaQuestao(q);
  if(!c) return '';
  const [ic, nome, desc] = COBRANCA_TIPOS[c.tipo] || ['', c.tipo, ''];
  const arm = c.armadilha && COBRANCA_ARMADILHAS[c.armadilha];
  const dica = desc + (arm ? '. Armadilha: ' + arm : '') + (c.duvida ? '. (classificação duvidosa)' : '');
  return `<span class="tag tag-cobranca tag-cobranca-${c.tipo}" title="${esc(dica)}">${ic} ${esc(nome)}${arm ? ' · ' + esc(arm.split(/[:(]/)[0].trim()) : ''}${c.duvida ? ' ?' : ''}</span>`;
}
