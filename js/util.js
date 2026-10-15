/* ---------------- util ---------------- */
function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}
function pct(n,d){ return d ? Math.round((n/d)*100) : 0; }

function aplicarTema(){
  document.body.classList.toggle('theme-light', STATE.theme==='light');
}
// paletas de cor pro botão 🎨 — trocam só as variáveis de destaque (--gold e
// --gold-bright), que já são usadas em botões, bordas e realces pela interface
// inteira, então uma única troca de variável já muda o layout todo
const CORTEMA_KEY = 'tcdf-cor-tema-v1';
const PALETAS_CORES = {
  'Dourado (padrão)': { gold:'#b08d3e', goldBright:'#d1ab54', paper:'#f6f1e4', paperDim:'#ece4d0', paperLine:'#d8cba9' },
  'Azul':              { gold:'#3e6ab0', goldBright:'#5c8ad1', paper:'#eef2f8', paperDim:'#dde6f1', paperLine:'#c3d3e6' },
  'Verde':             { gold:'#3e8a5a', goldBright:'#5cad78', paper:'#eef6ef', paperDim:'#dcebde', paperLine:'#bdd9c1' },
  'Roxo':              { gold:'#7a4eb0', goldBright:'#9c72d1', paper:'#f3eef8', paperDim:'#e6dcf1', paperLine:'#d0bde6' },
  'Vermelho':          { gold:'#b0463e', goldBright:'#d1685c', paper:'#f8eeee', paperDim:'#f1dcdc', paperLine:'#e6bdbd' },
};
// tinge o layout inteiro: fundo (--paper e variações), não só o destaque
// dourado — antes só os botões/bordas mudavam, o fundo bege ficava sempre igual
function aplicarCorTema(){
  const nome = STATE.corTema && PALETAS_CORES[STATE.corTema] ? STATE.corTema : 'Dourado (padrão)';
  const paleta = PALETAS_CORES[nome];
  const raiz = document.documentElement.style;
  raiz.setProperty('--gold', paleta.gold);
  raiz.setProperty('--gold-bright', paleta.goldBright);
  raiz.setProperty('--paper', paleta.paper);
  raiz.setProperty('--paper-dim', paleta.paperDim);
  raiz.setProperty('--paper-line', paleta.paperLine);
}
function alternarCorPicker(){
  STATE.corPickerAberto = !STATE.corPickerAberto;
  render();
}
function escolherCorTema(nome){
  if(!PALETAS_CORES[nome]) return;
  STATE.corTema = nome;
  STATE.corPickerAberto = false;
  aplicarCorTema();
  storageSet(CORTEMA_KEY, nome).catch(()=>{});
  render();
}
function alternarTema(){
  STATE.theme = STATE.theme==='light' ? 'dark' : 'light';
  aplicarTema();
  storageSet(THEME_KEY, STATE.theme).catch(()=>{});
  render();
}

function renderZoomControl(){
  const pctVal = Math.round(STATE.zoomLevel*100);
  return `<div class="zoom-control" title="Ajustar tamanho do texto">
    <button data-zoom="out" ${STATE.zoomLevel<=0.8?'disabled':''}>A−</button>
    <span class="zoom-pct">${pctVal}%</span>
    <button data-zoom="in" ${STATE.zoomLevel>=1.6?'disabled':''}>A+</button>
  </div>`;
}
function ajustarZoom(direcao){
  let z = STATE.zoomLevel;
  z = direcao==='in' ? Math.min(1.6, +(z+0.1).toFixed(2)) : Math.max(0.8, +(z-0.1).toFixed(2));
  STATE.zoomLevel = z;
  storageSet(ZOOM_KEY, String(z)).catch(()=>{});
  render();
}
// HTML das edições manuais (enunciado/resolução/resumo flash) vai pra tela como
// HTML de verdade, e também é sincronizado pela nuvem — então passa sempre por
// aqui, que só deixa a formatação que o editor produz (negrito, itálico,
// tachado, marca-texto). Sem o DOMPurify (CDN fora do ar), cai pra texto puro.
const TAGS_EDICAO_PERMITIDAS = ['b','strong','i','em','s','strike','u','mark','span','font','br','p','div','ul','ol','li','sub','sup','blockquote','img'];
function limparHtmlEditado(html){
  if(!html) return '';
  if(typeof DOMPurify !== 'undefined' && DOMPurify.sanitize){
    return DOMPurify.sanitize(String(html), { ALLOWED_TAGS: TAGS_EDICAO_PERMITIDAS, ALLOWED_ATTR: ['style','class','color','data-img','alt'] });
  }
  return esc(htmlParaTextoPlano(html));
}

function esc(str){
  // remove marcadores de citação tipo "[cite: 4]" ou "[cite: 4, 7]" que vêm do
  // material de origem — não fazem sentido pro usuário final da plataforma
  str = (str||'').replace(/\s*\[cite:\s*\d+(?:\s*,\s*\d+)*\]/gi, '');
  return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

// confirma que existe uma sequência real de algarismos romanos (I...II ou II...III)
// antes de tratar qualquer "I"/"V"/"X" isolado como item de lista — sem essa
// checagem, palavras/iniciais comuns do texto poderiam ser quebradas por engano
function temListaRomana(texto){
  return /\bI\b[\s\S]{0,400}?\bII\b/.test(texto) || /\bII\b[\s\S]{0,400}?\bIII\b/.test(texto);
}
function quebrarItensRomanos(texto){
  if(!texto || !temListaRomana(texto)) return texto;
  // aceita tanto "I O princípio" (espaço direto) quanto "I. Configura-se" (com
  // ponto logo após o algarismo) — formatos diferentes de origem usam um ou outro
  return texto.replace(/\s*\b(I|II|III|IV|V|VI|VII|VIII|IX|X)\b(\.?)(?=\s+\w)/g, '\n$1$2');
}

// separa a frase de contexto/introdução (ex.: "Com base na LODF, julgue o
// próximo item.") da assertiva/item propriamente dita, colocando cada uma em
// um parágrafo visualmente distinto — sem isso as duas ficam grudadas num
// bloco só de texto corrido
function separarContextoDoItem(texto){
  if(!texto) return texto;
  // acha a frase de contexto completa (ex.: "julgue os itens seguintes, conforme
  // a Lei Maria da Penha.") e quebra só depois dela terminar de verdade — em vez
  // de quebrar logo após "julgue...item(ns)", que falhava quando havia uma
  // cláusula extra no meio (", conforme a Lei X") antes do ponto final real
  const m = texto.match(/julgue\s+(?:o\s+(?:próximo\s+)?item|a\s+assertiva|os\s+itens?)\b[\s\S]{0,80}?[.!?:]\s+/i);
  if(!m) return texto;
  const fim = m.index + m[0].length;
  return texto.slice(0, fim).trimEnd() + '\n\n' + texto.slice(fim);
}

// tira da tela a frase-comando de abertura ("Com base em X, julgue o item a
// seguir em certo (C) ou errado (E).") e deixa só o texto da questão. Frases
// completas ANTES do comando (cenário/caso) são mantidas — sai só a frase que
// contém o "julgue ...". Nada é apagado dos dados: é só exibição.
const _ABREV_FRASE = new Set(['n','nº','no','art','arts','inc','incs','gov','fed','dr','dra','sr','sra','cf','cap','ex','par','ss','nr','av','obs','ref','pág','pp','vol','min','sec','dep','sen','prof','dist','al','alin','parág','párag','p','v','resp','cons']);
function _fimDeFrase(t, i){
  const c = t[i];
  if(c!=='.' && c!=='!' && c!=='?' && c!==':') return false;
  const nx = t[i+1];
  if(nx!==undefined && !/\s/.test(nx)) return false;
  if(c==='.'){
    const resto = t.slice(i+1).replace(/^\s+/, '');
    if(/^[a-zà-ÿ]/.test(resto)) return false;                                  // frase não recomeça com minúscula
    const fechando = /[)"”»\]]$/.test(t.slice(0, i));                          // ... (LRF). / ... "x".
    if(fechando) return true;
    const prev = (t.slice(Math.max(0, i-10), i).match(/([A-Za-zÀ-ÿ0-9]+)$/) || [])[1] || '';
    if(/^\d+$/.test(prev)) return true;
    if(_ABREV_FRASE.has(prev.toLowerCase()) && !/^[A-ZÀ-Ý]{2,}$/.test(prev)) return false;   // n., art., Gov., Fed. ...
  }
  return true;
}
function removerComandoJulgue(texto){
  if(!texto) return texto;
  const m = /\bjulgues?\s+(?:\([^)]{0,25}\)\s*)?(?:o|os|a|as|esse|este|cada|item|itens|assertiva|afirmativa|proposição)\b|\bjulgue\s*[;:]|\bjulgue-[oa]s?\b/i.exec(texto);
  if(!m || m.index > 3000) return texto;
  // começo da frase que contém o "julgue"
  let ini = 0;
  for(let i = m.index-1; i >= 0; i--){ if(_fimDeFrase(texto, i)){ ini = i+1; break; } }
  // fim dessa frase ("julgue;" / "julgue:" já fecha o comando)
  let fim = texto.length;
  const pt = /^julgue\s*[;:]/i.exec(texto.slice(m.index));
  if(pt){ fim = m.index + pt[0].length; }
  else { for(let i = m.index; i < texto.length; i++){ if(_fimDeFrase(texto, i)){ fim = i+1; break; } } }
  if(!pt && fim === texto.length){ // "…de acordo com a CF.A condenação…" (ponto colado na próxima frase)
    const g = /[A-Za-zà-ÿ)]\.(?=[A-ZÀ-Ý](?:[a-zà-ÿ]|\s))/.exec(texto.slice(m.index));
    if(g) fim = m.index + g.index + 2;
  }
  const frase = texto.slice(ini, fim);
  // só é comando se a frase for de fato uma instrução (e não o verbo "julgar" dentro do item)
  if(frase.length > 420 || !/\b(item|itens|assertiva|afirmativa|seguinte|seguintes|subsequente|subsecutivo|a seguir|certo|errado)\b|\(C\)|C ou E|\bjulgue\s*[;:]|\bjulgue-[oa]s?\b/i.test(frase)) return texto;
  const antes = texto.slice(0, ini).trim();
  const depois = texto.slice(fim).trim();
  if(depois.length < 15) return texto; // não deixa a questão vazia
  return (antes ? antes + '\n\n' : '') + depois;
}

function limparEnunciado(texto, tipo){
  if(!texto) return '';
  let out = texto
    .replace(/\n?\s*\(\s*\)\s*(Certo|Errado)?\s*$/gim, '')
    .replace(/(\n\s*\(\s*\)\s*)+$/g, '')
    .replace(/\s*(Certo\s+Errado|Errado\s+Certo)\s*$/i, '') // remove "Certo Errado" solto no fim, sem parênteses
    .replace(/^\d+[.)]\s*/, ''); // remove numeração inicial, ex.: "13) " ou "18. "
  // ordem importa: quebra os itens romanos primeiro; se separarContextoDoItem
  // rodasse antes, a quebra dupla de parágrafo que ele insere seria engolida
  // pelo \s* da regex de itens romanos (que colapsa qualquer espaço/quebra
  // anterior a "I"/"II"/etc. em uma quebra simples só)
  if(tipo!=='MC') out = removerComandoJulgue(out);
  out = quebrarItensRomanos(out);
  out = separarContextoDoItem(out);
  if(tipo==='MC'){
    // remove a listagem de alternativas (a) ... b) ... c) ...) do corpo do enunciado —
    // ela já aparece separadamente, como botões clicáveis, logo abaixo; sem isso a
    // mesma informação apareceria duas vezes na tela
    const semAlternativas = out
      .replace(/\n\s*a\)\s[\s\S]*$/i, '')
      .replace(/\s(?=[a-e]\)\s)[\s\S]*$/i, '')
      .trimEnd();
    // só aplica a limpeza se ainda sobrar um enunciado com conteúdo de verdade —
    // evita deixar a caixa em branco quando a extração "come" o texto todo
    if(semAlternativas.length >= 10) out = semAlternativas;
  }
  return out.trimEnd();
}

const STOPWORDS_PT = new Set(['a','o','as','os','de','da','do','das','dos','e','ou','que','se','em','no','na','nos','nas','um','uma','uns','umas','ao','aos','à','às','para','por','com','sem','sob','sobre','entre','até','desde','como','mais','menos','muito','pouco','já','não','sim','ser','são','é','foi','ter','tem','têm','seu','sua','seus','suas','este','esta','isto','esse','essa','isso','aquele','aquela','aquilo','ele','ela','eles','elas','nós','vós','lhe','lhes','me','te','também','apenas','só','pelo','pela','pelos','pelas','deve','devem','pode','podem','assim','cujo','cuja']);

function extrairPalavrasSignificativas(texto){
  if(!texto) return [];
  const palavras = texto
    .toLowerCase()
    .replace(/[.,;:()"'“”]/g,' ')
    .split(/\s+/)
    .filter(w=>w.length>=5 && !STOPWORDS_PT.has(w));
  return Array.from(new Set(palavras)).slice(0,8);
}

// palavras-chave da resposta correta: pra múltipla escolha, vem do texto da
// alternativa certa; pra Certo/Errado não existe "alternativa" com texto próprio,
// então usamos os termos determinantes do próprio enunciado (é a assertiva que
// está sendo julgada certa ou errada)
function palavrasChaveDaRespostaCorreta(q){
  if(q.t==='MC'){
    const g = gabaritoEfetivo(q);
    if(!q.alt || !g) return [];
    const correta = q.alt.find(a=>a.letra.toUpperCase()===g.toUpperCase());
    if(!correta || !correta.texto) return [];
    return extrairPalavrasSignificativas(correta.texto);
  }
  if(q.t==='CE'){
    return extrairPalavrasSignificativas(q.q || '');
  }
  return [];
}

// termos decisivos clássicos de banca (CEBRASPE em especial): palavras restritivas
// ou absolutas que costumam ser o ponto de virada de uma assertiva Certo/Errado.
// Estilo visual PRÓPRIO (sublinhado + cor), diferente do negrito de gabarito,
// pra não confundir as duas fontes de destaque.
const TERMOS_DECISIVOS = [
  'exclusivamente','unicamente','tão somente','tão-somente','somente','apenas',
  'sempre','nunca','jamais','todo','toda','todos','todas','nenhum','nenhuma',
  'absolutamente','obrigatoriamente','necessariamente','impreterivelmente',
  'incondicionalmente','indistintamente','invariavelmente','qualquer',
  'em qualquer hipótese','sob nenhuma hipótese','de forma alguma','sim','não',
];
// recebe HTML JÁ ESCAPADO (esc(texto)) e injeta o sublinhado sem tocar o que
// já é tag — mesmo cuidado usado em destacarPalavrasChave, pra combinar as duas
function destacarTermosDecisivos(htmlEscapado){
  if(!htmlEscapado) return '';
  let html = htmlEscapado;
  const ordenados = [...TERMOS_DECISIVOS].sort((a,b)=>b.length-a.length);
  ordenados.forEach(termo=>{
    const escapado = termo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g,'\\s+');
    const re = new RegExp(`\\b(${escapado})\\b`, 'gi');
    html = html.replace(re, (m, offset) => /<[^>]*$/.test(html.slice(0, offset)) ? m : `<u class="kw-decisivo">${m}</u>`);
  });
  return html;
}
// palavras-chave do texto da questão (antes e depois de responder): além dos
// termos absolutos/restritivos (sublinhado vermelho), marca causa/consequência,
// suficiência/dispensa, relativização e direção/quantidade — as palavras onde a
// banca costuma esconder a armadilha. Recebe HTML já escapado.
const TERMOS_CHAVE = [
  'por si só','suficiente','suficientes','basta','bastando','independentemente','independe','independem',
  'dispensa','dispensada','dispensado','dispensável','afasta','afastada','afastado','afastam','afastamento',
  'exceto','salvo','ressalvado','ressalvada','não se aplica','não se aplicam',
  'visto que','uma vez que','já que','porque','pois','por força de','de tal modo que','de modo que','em razão de','por causa de',
  'ocasionando','ocasionado','ocasiona','causa','causando','decorre','decorrente','resulta','resultando','implica','acarreta','provoca','consequência','consequentemente',
  'sobretudo','principalmente','inclusive','mesmo que','ainda que','embora','contudo','porém','entretanto','todavia','desde que','apesar de',
  'pode','podem','poderá','poderão','em regra','geralmente','via de regra','normalmente','tende','tendem','costuma','frequentemente','eventualmente','em geral',
  'aumento','redução','diminuição','queda','elevação','ampliação','restrição','majoração','maior','menor','máximo','mínimo',
  'integral','integralmente','parcial','parcialmente','imediato','imediatamente','automático','automaticamente','prévio','prévia','posterior','anterior','antes','depois','após',
  'vedado','vedada','proibido','proibida','permitido','permitida','obrigatório','obrigatória','facultativo','facultativa','privativa','privativo','compete',
  'necessário','necessária','necessariamente','necessários','necessárias','exclusivo','exclusiva','exclusivamente','somente','apenas','unicamente','só',
  'sempre','nunca','jamais','todo','toda','todos','todas','qualquer','nenhum','nenhuma','nem','não','sem','tampouco','tal como','assim como','bem como',
  'deve','devem','deverá','deverão','dever','tem de','precisa','precisam','vinculado','vinculada','vinculação','vincula','discricionário','discricionária','discricionariedade',
  'competência','atribuição','prazo','mínimo','máxima','mínima','absoluto','absoluta','relativo','relativa','limite','limites','limitado','limitada','ilimitado','ilimitada',
  'prevê','estabelece','determina','exige','admite','permite','autoriza','impede','veda','proíbe','garante','assegura','limita','submete','depende','dependem','constitui','constituem','configura','caracteriza','define','responde','respondem','responsabiliza','obriga','possui','possuem','cabe','caberá','abrange','alcança','pressupõe','condiciona','dispõe','impõe','faculta','reconhece','admitida','admitido','vinculante','aplicável','cabível','legítimo','legítima','legal','ilegal','nulo','nula','válido','válida','inválido','inválida','público','pública','privado','privada','geral','específico','específica','especial','principal','secundário','secundária','único','única','mesmo','mesma','próprio','própria','distintos',
  'caracteriza-se','consiste','define-se','denomina-se','corresponde','equivale','equivalem','difere','diferente','distinto','distinta','ao passo que','enquanto',
];
let _reChave = null;
function destacarPalavrasChaveQuestao(htmlEscapado){
  let html = destacarTermosDecisivos(htmlEscapado);
  if(!html) return '';
  if(!_reChave){
    const alt = [...TERMOS_CHAVE].sort((a,b)=>b.length-a.length).map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/ /g,'\\s+')).join('|');
    // + advérbios em -mente e adjetivos em -ável/-ível
    _reChave = new RegExp('(?<![\\p{L}\\p{N}])(?:' + alt + '|\\p{L}{4,}mente|\\p{L}{3,}[áí]vel|\\p{L}{3,}[áí]veis)(?![\\p{L}\\p{N}])', 'giu');
  }
  // só mexe no texto entre tags (nunca dentro de <u ...> etc.)
  return html.replace(/(<[^>]*>)|([^<]+)/g, (m, tag, txt) => tag ? tag : txt.replace(_reChave, x => `<b class="kw-chave">${x}</b>`));
}
function destacarPalavrasChave(texto, palavrasExtras){
  if(!texto) return '';
  let html = destacarTermosDecisivos(esc(texto));
  // negrito só nas palavras-chave extraídas estritamente da resposta correta —
  // nada de padrão genérico (referência legal, conector modal etc.) que não vem
  // diretamente do gabarito da questão
  if(palavrasExtras && palavrasExtras.length){
    const ordenadas = [...palavrasExtras].sort((a,b)=>b.length-a.length);
    ordenadas.forEach(palavra=>{
      const escapada = palavra.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`\\b(${escapada}\\w*)\\b`, 'gi');
      html = html.replace(re, (m, offset) => /<[^>]*$/.test(html.slice(0, offset)) ? m : `<strong class="kw-gabarito">${m}</strong>`);
    });
  }
  return html;
}

// quebra um texto corrido em frases (nova sentença = novo parágrafo), evitando
// quebrar em abreviações jurídicas comuns (art., §, nº, inc., etc.) ou em siglas
function dividirEmFrases(texto){
  if(!texto) return [];
  const marcado = texto.replace(
    /\b(art|arts|inc|par|§|nº|n°|no|ed|op|cit|cf|vs|sr|sra|dr|dra|min|des|ex)\.\s/gi,
    m => m.replace('.', '\u0000')
  );
  const partes = marcado
    .split(/(?<=[.!?])\s+(?=[A-ZÀ-Ú"“(])|\n+/)
    .map(p => p.replace(/\u0000/g, '.').trim())
    .filter(Boolean);
  return partes.length ? partes : [texto.trim()];
}

// confirma que existe uma lista alfabética real (pelo menos "a)" e "b)") antes de
// tratar qualquer letra solta como item de lista — evita falso positivo em
// referências avulsas como "art. 5º, a)"
function temListaAlfabetica(texto){
  return /\ba\)/i.test(texto) && /\bb\)/i.test(texto);
}
// quebra de linha antes de cada item alfabético (a) b) c)...), inclusive o caso
// "c. e d)" (quando duas letras são combinadas numa análise só)
function quebrarItensAlfabeticos(texto){
  if(!texto || !temListaAlfabetica(texto)) return texto;
  return texto.replace(/\s*\b([a-e])(\)|\.\s*e\s*[a-e]\))/gi, '\n$1$2');
}

// combina a quebra em frases (item 5) com o destaque de palavras-chave (item 6):
// cada frase vira um parágrafo próprio, já com os termos relevantes marcados
// Limpa a justificativa para exibição: tira a frase que só repete o veredito
// ("O item está **Errado**.", "Gabarito: Errado.", "Portanto, o item está errado.")
// — o veredito já aparece acima — e frases repetidas. **negrito** vira marcação.
function limparResolucao(r){
  if(!r) return r;
  const VER = '(?:certo|errado|correto|incorreto|certa|errada|correta|incorreta|falso|falsa|verdadeiro|verdadeira)';
  const soVeredito = new RegExp('^(?:portanto|assim|logo|dessa forma|desse modo|em suma|conclus[ãa]o)?[,:;\\s-]*(?:o\\s+|a\\s+)?(?:item|assertiva|afirmativa|afirma[çc][ãa]o|proposi[çc][ãa]o|quest[ãa]o|gabarito)\\b[^.\\n]{0,50}?\\b'+VER+'\\s*[.!]*$','i');
  const iniVeredito = new RegExp('^\\s*(?:(?:o|a)\\s+(?:item|assertiva|afirmativa|afirma[çc][ãa]o)\\s+(?:est[áa]|[ée]|fica)\\s+'+VER+'|gabarito\\s*:\\s*'+VER+')\\s*[.:!;]\\s*','i');
  const vistos = new Set();
  const out = [];
  String(r).split(/\n+/).forEach(linha=>{
    let l = linha.replace(/\*\*([^*\n]+)\*\*/g,'\u0001$1\u0002').replace(/(^|\s)\*(?=\S)([^*\n]+)\*/g,'$1$2');
    const plano = l.replace(/[\u0001\u0002]/g,'').trim();
    if(!plano) return;
    if(plano.length <= 110 && soVeredito.test(plano)) return;
    let p = plano, prev;
    do { prev = p; p = p.replace(iniVeredito,''); } while(p !== prev);
    if(p !== plano){ l = l.replace(/[\u0001\u0002]/g,''); do { prev = l; l = l.replace(iniVeredito,''); } while(l !== prev); }
    const chave = l.replace(/[\u0001\u0002]/g,'').toLowerCase().replace(/[^a-z0-9à-ÿ]+/g,' ').trim();
    if(!chave || vistos.has(chave)) return;
    vistos.add(chave);
    out.push(l.trim());
  });
  return out.join('\n');
}
function formatarTextoComDestaque(texto, palavrasExtras){
  if(!texto) return '';
  const comQuebras = quebrarItensAlfabeticos(texto);
  const frases = dividirEmFrases(comQuebras);
  return frases.map(f => `<p>${destacarPalavrasChave(f, palavrasExtras).replace(/\u0001([^\u0002]*)\u0002/g,'<b>$1</b>').replace(/[\u0001\u0002]/g,'')}</p>`).join('');
}


// tela cheia (navegador): vale para o modo normal e o modo foco; o ícone do
// botão é redesenhado quando o estado muda (inclusive ao sair com Esc)
function alternarTelaCheia(){
  try{
    if(document.fullscreenElement) document.exitFullscreen();
    else (document.documentElement.requestFullscreen||function(){return Promise.reject();}).call(document.documentElement).catch(()=>{});
  }catch(_){}
}
document.addEventListener('fullscreenchange', ()=>{ try{ if(typeof render==='function' && STATE.quiz) render(); }catch(_){} });
