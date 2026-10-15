/* ================= FREQUÊNCIA E PREVISÃO POR ASSUNTO =================
   Duas coisas diferentes, mostradas separadas:

   1. Frequência nesta base: em quantas das provas presentes NESTA base de
      questões o assunto aparece. É um fato sobre a base, não uma previsão —
      a base é uma amostra (poucas questões por prova), então um assunto que
      não aparece numa prova da base pode ter caído nela.

   2. Estimativa (previsão): chance de o assunto cair (>= 1 item) numa próxima
      prova, por um modelo Beta-Binomial com pesos:
        - peso de cada prova = recência (meia-vida de 4 anos) × semelhança com
          a prova-alvo (mesmo órgão TCDF 1,0; outro órgão do DF 0,7; outro 0,5);
        - prior = taxa média dos assuntos da matéria, com força de 2 provas;
        - intervalo de 80% (quantis 10% e 90% da Beta posterior).
      Validação: para os anos mais recentes da base, o modelo é ajustado só com
      as provas anteriores e prevê as provas daquele ano; o erro (Brier) é
      comparado com o palpite simples (taxa média, igual pra todo assunto). A
      estimativa só é marcada como "validada" se errar pelo menos 5% menos que
      esse palpite.

   Identificação da prova (corrige a base): a banca/cargo/ano vêm do texto
   "bc" da própria questão — o ano é o da prova escrito ali (o campo "ar" às
   vezes traz outro ano), o sufixo ", Auditor de Controle Externo, TCDF"
   acrescentado pelo gerador de questões é descartado, especialidades do mesmo
   concurso contam como uma prova só, e questões de "Elaboração própria" (não
   são de prova) ficam de fora, assim como questões cujo "bc" não traz o ano
   da prova (não dá pra saber de qual prova são). */

const MEIA_VIDA_ANOS = 4;
const FORCA_PRIOR = 2;
const ORGAO_ALVO = /\bTC\s*DF\b|\bTCDF\b/i;

// { id, banca, cargo, orgao, ano } da prova de onde veio a questão, ou null
// quando não é questão de prova real
function identificarProva(q){
  if(!q || !q.bc || isInedita(q)) return null;
  let txt = String(q.bc).trim();
  if(/^elabora[cç][aã]o/i.test(txt)) return null;
  txt = txt.replace(/,\s*Auditor de Controle Externo,\s*TCDF\s*$/i, '').trim();
  const anos = txt.match(/\b(19|20)\d{2}\b/g);
  // sem ano escrito no "bc" não dá pra saber de qual prova é: o campo "ar" é
  // o ano em que a questão foi coletada, não o da prova (ex.: "CEBRASPE,
  // Auditor de Controle Externo (TCDF)" vem com ar=2024, e não houve prova do
  // TCDF em 2024) — fica sem ano e fora da contagem de provas
  const ano = anos ? Number(anos[anos.length-1]) : null;
  // banca = texto antes do primeiro separador (" - ", " — " ou ","); o resto
  // começa pelo cargo, até a primeira "/" ou " — "
  const m = txt.match(/^(.+?)(?:\s-\s|\s—\s|,\s*)(.*)$/);
  let banca = (m ? m[1] : txt).replace(/\s*\(CESPE\)\s*/i, '').trim().toUpperCase();
  if(!banca || banca==='—') return null;
  const resto = m ? m[2] : '';
  const cargo = (resto.split(/\/|\s—\s/)[0] || '').replace(/\b(19|20)\d{2}\b/g, '').trim();
  const orgaoM = cargo.match(/\(([^)]+)\)/) || txt.match(/\/([^/]+)\//);
  const orgao = orgaoM ? orgaoM[1].trim() : '';
  return { id: [banca, cargo.toUpperCase(), ano||''].join('|'), banca, cargo, orgao, ano };
}
function anoDaQuestao(q){
  const p = identificarProva(q);
  return (p && p.ano) || q.ar || null;
}
function pesoDaProva(prova, anoRef){
  const idade = Math.max(0, (anoRef||prova.ano||0) - (prova.ano||anoRef||0));
  const recencia = Math.pow(0.5, idade / MEIA_VIDA_ANOS);
  const alvo = prova.cargo + ' ' + prova.orgao;
  const semelhanca = ORGAO_ALVO.test(alvo) ? 1 : (/\bDF\b|TJDFT|CLDF/i.test(alvo) ? 0.7 : 0.5);
  return recencia * semelhanca;
}

/* ---- Beta: função beta incompleta regularizada e quantil ---- */
function _lnGama(x){
  const c = [76.18009172947146,-86.50532032941677,24.01409824083091,-1.231739572450155,0.1208650973866179e-2,-0.5395239384953e-5];
  let y = x, tmp = x + 5.5; tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for(let j=0;j<6;j++) ser += c[j] / ++y;
  return -tmp + Math.log(2.5066282746310005 * ser / x);
}
function _betacf(a, b, x){
  let qab=a+b, qap=a+1, qam=a-1, c=1, d=1-qab*x/qap;
  if(Math.abs(d)<1e-30) d=1e-30; d=1/d; let h=d;
  for(let m=1;m<=200;m++){
    const m2=2*m; let aa=m*(b-m)*x/((qam+m2)*(a+m2));
    d=1+aa*d; if(Math.abs(d)<1e-30) d=1e-30; c=1+aa/c; if(Math.abs(c)<1e-30) c=1e-30; d=1/d; h*=d*c;
    aa=-(a+m)*(qab+m)*x/((a+m2)*(qap+m2));
    d=1+aa*d; if(Math.abs(d)<1e-30) d=1e-30; c=1+aa/c; if(Math.abs(c)<1e-30) c=1e-30; d=1/d;
    const del=d*c; h*=del; if(Math.abs(del-1)<3e-7) break;
  }
  return h;
}
function betaIncompleta(x, a, b){
  if(x<=0) return 0; if(x>=1) return 1;
  const bt = Math.exp(_lnGama(a+b)-_lnGama(a)-_lnGama(b)+a*Math.log(x)+b*Math.log(1-x));
  return x < (a+1)/(a+b+2) ? bt*_betacf(a,b,x)/a : 1 - bt*_betacf(b,a,1-x)/b;
}
function quantilBeta(p, a, b){
  let lo=0, hi=1;
  for(let i=0;i<50;i++){ const mid=(lo+hi)/2; if(betaIncompleta(mid,a,b)<p) lo=mid; else hi=mid; }
  return (lo+hi)/2;
}

/* ---- modelo ---- */
// provas: [{ ano, peso, temas:Set }]; devolve { media, lo, hi } pro tema
function estimarTema(provas, tema, prior){
  let a = prior * FORCA_PRIOR, b = (1-prior) * FORCA_PRIOR;
  provas.forEach(p => { if(p.temas.has(tema)) a += p.peso; else b += p.peso; });
  return { media: a/(a+b), lo: quantilBeta(0.10, a, b), hi: quantilBeta(0.90, a, b) };
}
function taxaMedia(provas, temas){
  if(!provas.length || !temas.length) return 0.1;
  let s = 0; temas.forEach(t => { s += provas.filter(p=>p.temas.has(t)).length / provas.length; });
  return Math.min(0.95, Math.max(0.02, s / temas.length));
}
// backtest: para os até 3 anos mais recentes com provas, ajusta com as provas
// anteriores e prevê as daquele ano; compara Brier com o palpite simples
function validarModelo(provas, temas){
  const anos = [...new Set(provas.map(p=>p.ano).filter(Boolean))].sort((x,y)=>x-y);
  let errModelo = 0, errBase = 0, n = 0;
  anos.slice(-3).forEach(Y=>{
    const treino = provas.filter(p => p.ano && p.ano < Y);
    const teste = provas.filter(p => p.ano === Y);
    if(treino.length < 5 || !teste.length) return;
    const tr = treino.map(p => ({ ...p, peso: pesoDaProva(p, Y-1) }));
    const prior = taxaMedia(treino, temas);
    temas.forEach(t=>{
      const est = estimarTema(tr, t, prior).media;
      teste.forEach(p=>{
        const y = p.temas.has(t) ? 1 : 0;
        errModelo += (est-y)*(est-y); errBase += (prior-y)*(prior-y); n++;
      });
    });
  });
  if(!n || !errBase) return { nTestes: n, habilidade: null, validado: false };
  const habilidade = 1 - errModelo/errBase;
  // precisa errar pelo menos 5% menos que o palpite simples (menos que isso é ruído)
  return { nTestes: n, habilidade, validado: n >= 20 && habilidade >= 0.05 };
}

function analisarTemasDaMateria(materiaKey){
  const qs = ALL_QUESTIONS.filter(q => q.materia===materiaKey && !q.duplicataOculta && (q.t==='CE'||q.t==='MC'));
  const provasMap = {};
  qs.forEach(q=>{
    const p = identificarProva(q);
    if(!p || !p.ano || !q.tema) return;
    (provasMap[p.id] = provasMap[p.id] || { ...p, temas: new Set() }).temas.add(q.tema);
  });
  const provas = Object.values(provasMap);
  const totalProvas = provas.length;
  if(totalProvas===0) return [];
  const anoRef = Math.max(...provas.map(p=>p.ano||0));
  provas.forEach(p => { p.peso = pesoDaProva(p, anoRef); });
  const recentes = provas.filter(p => p.ano && p.ano >= anoRef-4);
  const temas = temasDisponiveis(materiaKey).filter(t => !ehForaDoEdital(t));
  const prior = taxaMedia(provas, temas);
  const validacao = validarModelo(provas, temas);
  const confianca = totalProvas>=15 ? 'alta' : (totalProvas>=5 ? 'media' : 'baixa');
  return temas.map(tema=>{
    const total = qs.filter(q => q.tema===tema).length;
    if(!total) return null;
    const nProvasComTema = provas.filter(p => p.temas.has(tema)).length;
    const provasRecentesComTema = recentes.filter(p => p.temas.has(tema)).length;
    const est = estimarTema(provas, tema, prior);
    return {
      tema, total, nProvasComTema, totalProvas,
      frequencia: nProvasComTema/totalProvas,
      provasRecentesComTema, totalProvasRecentes: recentes.length,
      estimativa: est.media, intervalo: [est.lo, est.hi],
      confianca, validacao, anoRef,
    };
  }).filter(Boolean).sort((a,b)=> b.estimativa-a.estimativa || b.total-a.total);
}

function _pct(x){ return Math.round(x*100) + '%'; }

// quadro da questão: só a frequência nas provas desta base
function narrativaBancaBanner(q){
  if(isInedita(q) || !q.tema || !q.materia) return '';
  const d = analisarTemasDaMateriaCached(q.materia).find(a => a.tema===q.tema);
  if(!d) return '';
  const dica = 'Frequência: provas desta base (amostra) em que o assunto aparece.';
  return `<div class="narr-banner narr-estavel narr-numeros" title="${esc(dica)}">
    <span class="narr-icone">📊</span>
    <span class="narr-texto">${d.nProvasComTema}/${d.totalProvas} provas (${_pct(d.frequencia)})</span>
  </div>`;
}
