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

   Matérias classificadas: RJU LC840 (piloto), Administrativo (geral) (299 questões),
   Lei 14.133 (220 questões), Direito Civil (210 questões). */

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
  'lei-14-133-220-1':'T:ter', 'lei-14-133-220-2':'L', 'lei-14-133-220-3':'H', 'lei-14-133-220-4':'T:inv', 'lei-14-133-220-5':'T:inv', 'lei-14-133-220-6':'T:inv', 'lei-14-133-220-7':'T:inv', 'lei-14-133-220-8':'T:inv', 'lei-14-133-220-9':'L', 'lei-14-133-220-10':'L',
  'lei-14-133-220-11':'L', 'lei-14-133-220-12':'T:mis', 'lei-14-133-220-13':'L', 'lei-14-133-220-14':'L', 'lei-14-133-220-15':'L', 'lei-14-133-220-16':'L', 'lei-14-133-220-17':'L', 'lei-14-133-220-18':'T:res', 'lei-14-133-220-19':'T:inv', 'lei-14-133-220-20':'T:ter',
  'lei-14-133-220-21':'L', 'lei-14-133-220-22':'L', 'lei-14-133-220-23':'L', 'lei-14-133-220-24':'T:ext', 'lei-14-133-220-25':'L', 'lei-14-133-220-26':'L', 'lei-14-133-220-27':'L', 'lei-14-133-220-28':'T:inv', 'lei-14-133-220-29':'T:ext', 'lei-14-133-220-30':'T:num',
  'lei-14-133-220-31':'L', 'lei-14-133-220-32':'L', 'lei-14-133-220-33':'L', 'lei-14-133-220-34':'L', 'lei-14-133-220-35':'L', 'lei-14-133-220-36':'L', 'lei-14-133-220-37':'L', 'lei-14-133-220-38':'T:res', 'lei-14-133-220-39':'L', 'lei-14-133-220-40':'L',
  'lei-14-133-220-41':'L', 'lei-14-133-220-42':'T:ter', 'lei-14-133-220-43':'T:inv', 'lei-14-133-220-44':'L', 'lei-14-133-220-45':'T:inv', 'lei-14-133-220-46':'T:inv', 'lei-14-133-220-47':'T:ter', 'lei-14-133-220-48':'T:res', 'lei-14-133-220-49':'L', 'lei-14-133-220-50':'H',
  'lei-14-133-220-51':'L', 'lei-14-133-220-52':'L', 'lei-14-133-220-53':'H', 'lei-14-133-220-54':'L', 'lei-14-133-220-55':'L', 'lei-14-133-220-56':'H', 'lei-14-133-220-57':'L', 'lei-14-133-220-58':'L', 'lei-14-133-220-59':'L', 'lei-14-133-220-60':'L',
  'lei-14-133-220-61':'L', 'lei-14-133-220-62':'T:inv', 'lei-14-133-220-63':'L', 'lei-14-133-220-64':'T:mis', 'lei-14-133-220-65':'L', 'lei-14-133-220-66':'L', 'lei-14-133-220-67':'L', 'lei-14-133-220-68':'L', 'lei-14-133-220-69':'L', 'lei-14-133-220-70':'L',
  'lei-14-133-220-71':'L', 'lei-14-133-220-72':'T:inv', 'lei-14-133-220-73':'T:res', 'lei-14-133-220-74':'L', 'lei-14-133-220-75':'L', 'lei-14-133-220-76':'T:inv', 'lei-14-133-220-77':'L', 'lei-14-133-220-78':'L', 'lei-14-133-220-79':'T:inv', 'lei-14-133-220-80':'T:inv',
  'lei-14-133-220-81':'L', 'lei-14-133-220-82':'T:inv', 'lei-14-133-220-83':'T:inv', 'lei-14-133-220-84':'T:inv', 'lei-14-133-220-85':'L', 'lei-14-133-220-86':'L', 'lei-14-133-220-87':'L', 'lei-14-133-220-88':'L', 'lei-14-133-220-89':'L', 'lei-14-133-220-90':'L',
  'lei-14-133-220-91':'L', 'lei-14-133-220-92':'L', 'lei-14-133-220-93':'L', 'lei-14-133-220-94':'T:num', 'lei-14-133-220-95':'L', 'lei-14-133-220-96':'T:inv', 'lei-14-133-220-97':'L', 'lei-14-133-220-98':'L', 'lei-14-133-220-99':'L', 'lei-14-133-220-100':'T:ext',
  'lei-14-133-220-101':'L', 'lei-14-133-220-102':'L', 'lei-14-133-220-103':'L', 'lei-14-133-220-104':'T:inv?', 'lei-14-133-220-105':'T:inv', 'lei-14-133-220-106':'L', 'lei-14-133-220-107':'L', 'lei-14-133-220-108':'T:inv', 'lei-14-133-220-109':'L', 'lei-14-133-220-110':'L',
  'lei-14-133-220-111':'T:inv', 'lei-14-133-220-112':'T:num?', 'lei-14-133-220-113':'T:inv', 'lei-14-133-220-114':'T:mis', 'lei-14-133-220-115':'L', 'lei-14-133-220-116':'T:inv', 'lei-14-133-220-117':'L', 'lei-14-133-220-118':'T:ext', 'lei-14-133-220-119':'L', 'lei-14-133-220-120':'T:inv',
  'lei-14-133-220-121':'L', 'lei-14-133-220-122':'T:res', 'lei-14-133-220-123':'L', 'lei-14-133-220-124':'T:num', 'lei-14-133-220-125':'T:inv', 'lei-14-133-220-126':'T:ext', 'lei-14-133-220-127':'T:ter', 'lei-14-133-220-128':'L', 'lei-14-133-220-129':'L', 'lei-14-133-220-130':'L',
  'lei-14-133-220-131':'L', 'lei-14-133-220-132':'T:inv', 'lei-14-133-220-133':'L', 'lei-14-133-220-134':'T:inv', 'lei-14-133-220-135':'T:inv', 'lei-14-133-220-136':'L', 'lei-14-133-220-137':'T:res', 'lei-14-133-220-138':'L', 'lei-14-133-220-139':'L', 'lei-14-133-220-140':'T:inv',
  'lei-14-133-220-141':'L', 'lei-14-133-220-142':'T:ter', 'lei-14-133-220-143':'L', 'lei-14-133-220-144':'L', 'lei-14-133-220-145':'L', 'lei-14-133-220-146':'L', 'lei-14-133-220-147':'L', 'lei-14-133-220-148':'T:ter', 'lei-14-133-220-149':'T:inv', 'lei-14-133-220-150':'L',
  'lei-14-133-220-151':'T:ext', 'lei-14-133-220-152':'T:inv', 'lei-14-133-220-153':'T:inv', 'lei-14-133-220-154':'L', 'lei-14-133-220-155':'L', 'lei-14-133-220-156':'L', 'lei-14-133-220-157':'L', 'lei-14-133-220-158':'L', 'lei-14-133-220-159':'T:inv', 'lei-14-133-220-160':'L',
  'lei-14-133-220-161':'L', 'lei-14-133-220-162':'L', 'lei-14-133-220-163':'L', 'lei-14-133-220-164':'L', 'lei-14-133-220-165':'I', 'lei-14-133-220-166':'L', 'lei-14-133-220-167':'T:inv', 'lei-14-133-220-168':'T:inv', 'lei-14-133-220-169':'L', 'lei-14-133-220-170':'T:inv',
  'lei-14-133-220-171':'L', 'lei-14-133-220-172':'L', 'lei-14-133-220-173':'T:mis', 'lei-14-133-220-174':'T:inv', 'lei-14-133-220-175':'L', 'lei-14-133-220-176':'R', 'lei-14-133-220-177':'L', 'lei-14-133-220-178':'T:ext', 'lei-14-133-220-179':'L', 'lei-14-133-220-180':'T:inv',
  'lei-14-133-220-181':'T:num', 'lei-14-133-220-182':'L', 'lei-14-133-220-183':'L', 'lei-14-133-220-184':'L', 'lei-14-133-220-185':'T:inv', 'lei-14-133-220-186':'I', 'lei-14-133-220-187':'L', 'lei-14-133-220-188':'L', 'lei-14-133-220-189':'T:mis', 'lei-14-133-220-190':'T:ter',
  'lei-14-133-220-191':'L', 'lei-14-133-220-192':'T:ext', 'lei-14-133-220-193':'L', 'lei-14-133-220-194':'T:res', 'lei-14-133-220-195':'T:inv', 'lei-14-133-220-196':'T:inv', 'lei-14-133-220-197':'T:inv', 'lei-14-133-220-198':'L', 'lei-14-133-220-199':'L', 'lei-14-133-220-200':'L',
  'lei-14-133-220-201':'T:inv', 'lei-14-133-220-202':'L', 'lei-14-133-220-203':'T:inv', 'lei-14-133-220-204':'L', 'lei-14-133-220-205':'L', 'lei-14-133-220-206':'L', 'lei-14-133-220-207':'L', 'lei-14-133-220-208':'L', 'lei-14-133-220-209':'L', 'lei-14-133-220-210':'T:inv',
  'lei-14-133-220-211':'T:num', 'lei-14-133-220-212':'L', 'lei-14-133-220-213':'T:inv', 'lei-14-133-220-214':'T:ext', 'lei-14-133-220-215':'L', 'lei-14-133-220-216':'T:inv', 'lei-14-133-220-217':'T:inv', 'lei-14-133-220-218':'T:inv', 'lei-14-133-220-219':'L', 'lei-14-133-220-220':'L',
  'direito-civil-1':'T:inv', 'direito-civil-2':'T:inv', 'direito-civil-3':'L', 'direito-civil-4':'T:inv', 'direito-civil-5':'T:mis', 'direito-civil-6':'T:inv', 'direito-civil-7':'L', 'direito-civil-8':'T:ter', 'direito-civil-9':'T:inv', 'direito-civil-10':'L',
  'direito-civil-11':'T:num', 'direito-civil-12':'I', 'direito-civil-13':'T:inv', 'direito-civil-14':'T:ter', 'direito-civil-15':'L', 'direito-civil-16':'L', 'direito-civil-17':'T:inv', 'direito-civil-18':'L', 'direito-civil-19':'L', 'direito-civil-20':'T:ter',
  'direito-civil-21':'L', 'direito-civil-22':'L', 'direito-civil-23':'T:inv', 'direito-civil-24':'L', 'direito-civil-25':'T:inv', 'direito-civil-26':'J:inv', 'direito-civil-27':'T:mis', 'direito-civil-28':'L', 'direito-civil-29':'T:ter', 'direito-civil-30':'T:res',
  'direito-civil-31':'L', 'direito-civil-32':'L', 'direito-civil-33':'L', 'direito-civil-34':'L', 'direito-civil-35':'L', 'direito-civil-36':'L', 'direito-civil-37':'T:res', 'direito-civil-38':'T:inv', 'direito-civil-39':'T:inv', 'direito-civil-40':'T:inv',
  'direito-civil-41':'J', 'direito-civil-42':'T:inv', 'direito-civil-43':'L', 'direito-civil-44':'T:inv', 'direito-civil-45':'T:ter', 'direito-civil-46':'L', 'direito-civil-47':'L', 'direito-civil-48':'L', 'direito-civil-49':'T:inv', 'direito-civil-50':'T:ext',
  'direito-civil-51':'L', 'direito-civil-52':'L', 'direito-civil-53':'T:res', 'direito-civil-54':'L', 'direito-civil-55':'L', 'direito-civil-56':'T:inv', 'direito-civil-57':'T:inv', 'direito-civil-58':'L', 'direito-civil-59':'L', 'direito-civil-60':'T:inv',
  'direito-civil-61':'L', 'direito-civil-62':'T:ter', 'direito-civil-63':'T:inv', 'direito-civil-64':'L', 'direito-civil-65':'L', 'direito-civil-66':'T:ter', 'direito-civil-67':'T:inv', 'direito-civil-68':'T:res', 'direito-civil-69':'T:inv', 'direito-civil-70':'T:inv',
  'direito-civil-71':'T:res', 'direito-civil-72':'T:inv', 'direito-civil-73':'T:inv', 'direito-civil-74':'T:inv', 'direito-civil-75':'L', 'direito-civil-76':'T:inv', 'direito-civil-77':'L', 'direito-civil-78':'L', 'direito-civil-79':'T:res', 'direito-civil-80':'L',
  'direito-civil-81':'L', 'direito-civil-82':'L', 'direito-civil-83':'L', 'direito-civil-84':'L', 'direito-civil-85':'T:inv', 'direito-civil-86':'T:inv', 'direito-civil-87':'L', 'direito-civil-88':'L', 'direito-civil-89':'L', 'direito-civil-90':'T:inv',
  'direito-civil-91':'T:inv', 'direito-civil-92':'L', 'direito-civil-93':'T:inv', 'direito-civil-94':'T:inv', 'direito-civil-95':'T:ext', 'direito-civil-96':'T:inv', 'direito-civil-97':'L', 'direito-civil-98':'T:res', 'direito-civil-99':'L', 'direito-civil-100':'L',
  'direito-civil-101':'L', 'direito-civil-102':'L', 'direito-civil-103':'L', 'direito-civil-104':'L', 'direito-civil-105':'L', 'direito-civil-106':'T:ter', 'direito-civil-107':'L', 'direito-civil-108':'T:res', 'direito-civil-109':'L', 'direito-civil-110':'L',
  'direito-civil-111':'T:inv', 'direito-civil-112':'L', 'direito-civil-113':'T:inv', 'direito-civil-114':'L', 'direito-civil-115':'L', 'direito-civil-116':'L', 'direito-civil-117':'L', 'direito-civil-118':'L', 'direito-civil-119':'T:ext', 'direito-civil-120':'L',
  'direito-civil-121':'L', 'direito-civil-122':'L', 'direito-civil-123':'L', 'direito-civil-124':'T:ter', 'direito-civil-125':'L', 'direito-civil-126':'L', 'direito-civil-127':'L', 'direito-civil-128':'L', 'direito-civil-129':'L', 'direito-civil-130':'L',
  'direito-civil-131':'L', 'direito-civil-132':'L', 'direito-civil-133':'L', 'direito-civil-134':'T:inv', 'direito-civil-135':'T:mis', 'direito-civil-136':'T:res', 'direito-civil-137':'L', 'direito-civil-138':'L', 'direito-civil-139':'L', 'direito-civil-140':'T:inv',
  'direito-civil-141':'L', 'direito-civil-142':'T:ter', 'direito-civil-143':'T:inv', 'direito-civil-144':'L', 'direito-civil-145':'L', 'direito-civil-146':'L', 'direito-civil-147':'L', 'direito-civil-148':'L', 'direito-civil-149':'T:inv', 'direito-civil-150':'L',
  'direito-civil-151':'T:inv', 'direito-civil-152':'L', 'direito-civil-153':'L', 'direito-civil-154':'L', 'direito-civil-155':'L', 'direito-civil-156':'L', 'direito-civil-157':'L', 'direito-civil-158':'T:inv', 'direito-civil-159':'L', 'direito-civil-160':'L',
  'direito-civil-161':'T:inv', 'direito-civil-162':'J', 'direito-civil-163':'T:inv', 'direito-civil-164':'J:inv', 'direito-civil-165':'L', 'direito-civil-166':'L', 'direito-civil-167':'L', 'direito-civil-168':'T:inv', 'direito-civil-169':'T:inv', 'direito-civil-170':'T:inv',
  'direito-civil-171':'T:inv', 'direito-civil-172':'L', 'direito-civil-173':'L', 'direito-civil-174':'L', 'direito-civil-175':'L', 'direito-civil-176':'T:inv', 'direito-civil-177':'L', 'direito-civil-178':'L', 'direito-civil-179':'L', 'direito-civil-180':'L',
  'direito-civil-181':'L', 'direito-civil-182':'L', 'direito-civil-183':'L', 'direito-civil-184':'L', 'direito-civil-185':'L', 'direito-civil-186':'L', 'direito-civil-187':'L', 'direito-civil-188':'L', 'direito-civil-189':'L', 'direito-civil-190':'T:ext',
  'direito-civil-191':'T:inv', 'direito-civil-192':'L', 'direito-civil-193':'T:inv', 'direito-civil-194':'L', 'direito-civil-195':'J', 'direito-civil-196':'L', 'direito-civil-197':'L', 'direito-civil-198':'L', 'direito-civil-199':'L', 'direito-civil-200':'L',
  'direito-civil-201':'L', 'direito-civil-202':'T:inv', 'direito-civil-203':'L', 'direito-civil-204':'L', 'direito-civil-205':'L', 'direito-civil-206':'L', 'direito-civil-207':'T:inv', 'direito-civil-208':'J', 'direito-civil-209':'J', 'direito-civil-210':'J',
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
