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

   Matérias classificadas: RJU LC840 (piloto). */

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
