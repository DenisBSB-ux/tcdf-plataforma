/* ================= TEORIA (PDF) — sem Firebase Storage (100% gratuito) =================
   Dois jeitos de ter a apostila de cada matéria, que podem coexistir:
   1) Link do Google Drive: o app guarda só o texto do link (no aparelho e, logado, na nuvem:
      documento progresso/_teoria_{uid}) e mostra o arquivo dentro da plataforma (pré-visualização do Drive).
   2) PDF neste aparelho: o arquivo fica no IndexedDB; o leitor do app (PDF.js) abre direto na página certa. */
const PDFJS_VERSAO = '3.11.174';
const PDFJS_BASE = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSAO}/`;
const TEORIA_MAX_MB = 200;
const TEORIA = { links:{}, locais:{}, carregado:false, carregando:false, msg:null };
const TEORIA_LINKS_KEY = 'teoria-links';

function teoriaSlug(materia){ return slugify(materia); }
/* link cadastrado pela conta; senão o link público padrão do índice (se a matéria tiver um) */
function teoriaLinkDaMateria(materia){
  const k = teoriaSlug(materia); if(TEORIA.links[k]) return TEORIA.links[k];
  if(typeof TEORIA_INDICE==='undefined') return null;
  const chave = Object.keys(TEORIA_INDICE).find(c=> k.startsWith(c));
  const url = chave && TEORIA_INDICE[chave].drive;
  return url ? { url, nome:'Apostila (Drive)', id: teoriaIdDrive(url), padrao:true } : null;
}
function teoriaFormatarTamanho(b){
  if(b >= 1048576) return (b/1048576).toFixed(1).replace('.',',') + ' MB';
  return Math.max(1, Math.round(b/1024)) + ' KB';
}
function teoriaIdDrive(url){
  const u = String(url||'').trim();
  let m = u.match(/drive\.google\.com\/file\/d\/([\w-]{10,})/) || u.match(/drive\.google\.com\/(?:open|uc)\?[^#]*\bid=([\w-]{10,})/);
  return m ? m[1] : '';
}
function teoriaLinkValido(url){ return /^https:\/\/(drive|docs)\.google\.com\//.test(String(url||'').trim()); }

/* ---- persistência: IndexedDB (aparelho) + Firestore (links, só logado) ---- */
function teoriaDocRef(){ return (FIREBASE_OK && fbDb && USUARIO_ATUAL) ? fbDb.collection('progresso').doc('_teoria_'+USUARIO_ATUAL.uid) : null; }
async function teoriaCarregarTudo(){
  if(TEORIA.carregando) return; TEORIA.carregando = true;
  try{ const v = await idbGet(TEORIA_LINKS_KEY); if(v) TEORIA.links = JSON.parse(v); }catch(_){}
  const ref = teoriaDocRef();
  if(ref){
    try{
      const d = await ref.get();
      if(d.exists && d.data().links){ TEORIA.links = Object.assign({}, TEORIA.links, JSON.parse(d.data().links)); try{ await idbSet(TEORIA_LINKS_KEY, JSON.stringify(TEORIA.links)); }catch(_){} }
    }catch(_){ /* sem permissão ou offline: segue com o que há no aparelho */ }
  }
  TEORIA.carregado = true; TEORIA.carregando = false; render();
}
async function teoriaSalvarLinks(){
  try{ await idbSet(TEORIA_LINKS_KEY, JSON.stringify(TEORIA.links)); }catch(_){}
  const ref = teoriaDocRef();
  if(ref){ try{ await ref.set({ dono: USUARIO_ATUAL.uid, links: JSON.stringify(TEORIA.links), atualizado: Date.now() }); }catch(e){ return false; } }
  return true;
}
async function teoriaLocal(materia){
  const k = teoriaSlug(materia);
  if(TEORIA.locais[k] !== undefined) return TEORIA.locais[k];
  let v = null; try{ v = (await idbGet('teoria-pdf:'+k)) || null; }catch(_){}
  TEORIA.locais[k] = v; return v;
}

/* ---- ações da aba ---- */
async function teoriaSalvarLink(materia, url, nome){
  url = String(url||'').trim();
  if(!teoriaLinkValido(url)){ TEORIA.msg = { tipo:'err', txt:'Cole o link de compartilhamento do Google Drive (começa com https://drive.google.com/…).' }; render(); return; }
  TEORIA.links[teoriaSlug(materia)] = { url, nome: nome || 'Apostila no Drive', id: teoriaIdDrive(url) };
  const ok = await teoriaSalvarLinks();
  TEORIA.msg = ok ? { tipo:'ok', txt: USUARIO_ATUAL ? 'Link salvo (neste aparelho e na nuvem).' : 'Link salvo neste aparelho. Entre com Google para sincronizar com os outros aparelhos.' } : { tipo:'err', txt:'Link salvo só neste aparelho (não foi possível gravar na nuvem).' };
  render();
}
async function teoriaRemoverLink(materia){
  if(!confirm('Remover o link do Drive desta matéria? O arquivo no Drive não é afetado.')) return;
  delete TEORIA.links[teoriaSlug(materia)]; await teoriaSalvarLinks(); TEORIA.msg = { tipo:'ok', txt:'Link removido.' }; render();
}
async function teoriaEnviarLocal(materia, arquivos){
  const f = (arquivos||[])[0]; if(!f) return;
  if(!/\.pdf$/i.test(f.name) || f.size > TEORIA_MAX_MB*1048576){ TEORIA.msg = { tipo:'err', txt:`Escolha um PDF de até ${TEORIA_MAX_MB} MB.` }; render(); return; }
  try{
    const buf = await f.arrayBuffer(); const k = teoriaSlug(materia);
    const reg = { nome:f.name, bytes:f.size, quando:Date.now(), dados:buf };
    await idbSet('teoria-pdf:'+k, reg); TEORIA.locais[k] = reg;
    TEORIA.msg = { tipo:'ok', txt:'PDF guardado neste aparelho. Use "Ler aqui" para abri-lo no leitor da plataforma.' };
  }catch(e){ TEORIA.msg = { tipo:'err', txt:'Não foi possível guardar o PDF neste aparelho: ' + (e && e.message || e) }; }
  render();
}
async function teoriaRemoverLocal(materia){
  if(!confirm('Remover o PDF guardado neste aparelho?')) return;
  const k = teoriaSlug(materia);
  try{ await idbSet('teoria-pdf:'+k, null); }catch(_){}
  TEORIA.locais[k] = null; TEORIA.msg = { tipo:'ok', txt:'PDF removido deste aparelho.' }; render();
}

/* ================= LEITOR DE PDF DA PLATAFORMA ================= */
const LEITOR = { aberto:false, pdf:null, pag:1, total:0, zoom:null, renderTask:null, rotulo:'' };
let pdfjsPromessa = null;
function pdfjsCarregar(){
  if(window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  if(pdfjsPromessa) return pdfjsPromessa;
  pdfjsPromessa = new Promise((ok, falha)=>{
    const s = document.createElement('script'); s.src = PDFJS_BASE + 'pdf.min.js';
    s.onload = ()=>{ window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_BASE + 'pdf.worker.min.js'; ok(window.pdfjsLib); };
    s.onerror = ()=>{ pdfjsPromessa = null; falha(new Error('Não foi possível carregar o leitor de PDF (sem conexão?).')); };
    document.head.appendChild(s);
  });
  return pdfjsPromessa;
}
function leitorEl(){
  let el = document.getElementById('leitor-pdf'); if(el) return el;
  el = document.createElement('div'); el.id = 'leitor-pdf'; el.className = 'leitor-pdf'; el.hidden = true;
  el.innerHTML = `
    <div class="leitor-barra">
      <span class="leitor-titulo" id="leitor-titulo"></span>
      <span class="leitor-ctrl" id="leitor-ctrl-pdf">
        <button type="button" class="btn-ui" data-leitor="prev" title="Página anterior (←)">‹</button>
        <input type="number" id="leitor-pag" min="1" value="1" aria-label="Página"> <span id="leitor-total"></span>
        <button type="button" class="btn-ui" data-leitor="next" title="Próxima página (→)">›</button>
        <button type="button" class="btn-ui" data-leitor="zoom-" title="Diminuir (−)">−</button>
        <button type="button" class="btn-ui" data-leitor="zoom+" title="Aumentar (+)">+</button>
        <button type="button" class="btn-ui" data-leitor="largura" title="Ajustar à largura">↔</button>
      </span>
      <a class="btn-ui" id="leitor-externo" target="_blank" rel="noopener" hidden>Abrir no Drive ↗</a>
      <button type="button" class="btn-ui" data-leitor="fechar" title="Fechar (Esc)">✕ Fechar</button>
    </div>
    <div class="leitor-aviso" id="leitor-aviso" hidden></div>
    <div class="leitor-corpo" id="leitor-corpo"><canvas id="leitor-canvas"></canvas></div>
    <iframe id="leitor-iframe" class="leitor-iframe" title="Apostila" allow="autoplay" hidden></iframe>`;
  document.body.appendChild(el); return el;
}
function leitorAvisar(txt){ const a = document.getElementById('leitor-aviso'); a.hidden = !txt; a.textContent = txt||''; }
function leitorFechar(){
  const el = document.getElementById('leitor-pdf'); if(!el) return;
  el.hidden = true; LEITOR.aberto = false; document.body.classList.remove('leitor-aberto');
  document.getElementById('leitor-iframe').src = 'about:blank';
  if(LEITOR.renderTask){ try{ LEITOR.renderTask.cancel(); }catch(_){} }
  if(LEITOR.pdf){ try{ LEITOR.pdf.destroy(); }catch(_){} LEITOR.pdf = null; }
}
async function leitorDesenhar(){
  if(!LEITOR.pdf) return;
  const n = Math.max(1, Math.min(LEITOR.total, LEITOR.pag)); LEITOR.pag = n;
  document.getElementById('leitor-pag').value = n;
  const pg = await LEITOR.pdf.getPage(n);
  const corpo = document.getElementById('leitor-corpo'); const canvas = document.getElementById('leitor-canvas');
  const base = pg.getViewport({ scale:1 });
  if(!LEITOR.zoom) LEITOR.zoom = Math.min(2.2, Math.max(.5, (corpo.clientWidth - 24) / base.width));
  const vp = pg.getViewport({ scale: LEITOR.zoom }); const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(vp.width*dpr); canvas.height = Math.floor(vp.height*dpr);
  canvas.style.width = Math.floor(vp.width)+'px'; canvas.style.height = Math.floor(vp.height)+'px';
  if(LEITOR.renderTask){ try{ LEITOR.renderTask.cancel(); }catch(_){} }
  LEITOR.renderTask = pg.render({ canvasContext: canvas.getContext('2d'), viewport: vp, transform: dpr!==1 ? [dpr,0,0,dpr,0,0] : null });
  try{ await LEITOR.renderTask.promise; }catch(_){}
  corpo.scrollTop = 0;
}
function leitorIr(delta, abs){ if(!LEITOR.pdf) return; LEITOR.pag = abs ? abs : LEITOR.pag + delta; leitorDesenhar(); }
async function leitorAbrirPdf(dados, pagina, rotulo){
  const el = leitorEl(); el.hidden = false; LEITOR.aberto = true; document.body.classList.add('leitor-aberto');
  document.getElementById('leitor-titulo').textContent = rotulo || 'Apostila';
  document.getElementById('leitor-iframe').hidden = true; document.getElementById('leitor-iframe').src = 'about:blank';
  document.getElementById('leitor-corpo').hidden = false; document.getElementById('leitor-ctrl-pdf').hidden = false;
  document.getElementById('leitor-externo').hidden = true; leitorAvisar('Carregando…');
  try{
    const lib = await pdfjsCarregar();
    if(LEITOR.pdf){ try{ LEITOR.pdf.destroy(); }catch(_){} }
    LEITOR.pdf = await lib.getDocument({ data: new Uint8Array(dados.slice(0)) }).promise;
    LEITOR.total = LEITOR.pdf.numPages; LEITOR.zoom = null; LEITOR.pag = Math.min(Math.max(1, pagina||1), LEITOR.total);
    document.getElementById('leitor-total').textContent = '/ ' + LEITOR.total; document.getElementById('leitor-pag').max = LEITOR.total;
    leitorAvisar(''); await leitorDesenhar();
  }catch(e){ leitorAvisar('Não foi possível abrir o PDF: ' + (e && e.message || e)); }
}
function leitorAbrirDrive(link, pagina, rotulo){
  const el = leitorEl(); el.hidden = false; LEITOR.aberto = true; document.body.classList.add('leitor-aberto');
  document.getElementById('leitor-titulo').textContent = rotulo || 'Apostila';
  document.getElementById('leitor-corpo').hidden = true; document.getElementById('leitor-ctrl-pdf').hidden = true;
  const ifr = document.getElementById('leitor-iframe'); ifr.hidden = false;
  ifr.src = link.id ? `https://drive.google.com/file/d/${link.id}/preview` : link.url;
  const ext = document.getElementById('leitor-externo'); ext.hidden = false; ext.href = link.url;
  leitorAvisar(pagina ? `📖 Vá à página ${pagina} da apostila (a pré-visualização do Drive não pula sozinha). Para abrir direto na página, guarde o PDF neste aparelho.` : '');
}
document.addEventListener('click', (ev)=>{
  const b = ev.target.closest && ev.target.closest('[data-leitor]'); if(!b) return;
  const a = b.dataset.leitor;
  if(a==='fechar') leitorFechar(); else if(a==='prev') leitorIr(-1); else if(a==='next') leitorIr(1);
  else if(a==='zoom+'){ LEITOR.zoom = Math.min(4, (LEITOR.zoom||1)*1.2); leitorDesenhar(); }
  else if(a==='zoom-'){ LEITOR.zoom = Math.max(.3, (LEITOR.zoom||1)/1.2); leitorDesenhar(); }
  else if(a==='largura'){ LEITOR.zoom = null; leitorDesenhar(); }
});
document.addEventListener('change', (ev)=>{ if(ev.target && ev.target.id==='leitor-pag') leitorIr(0, parseInt(ev.target.value,10)||1); });
document.addEventListener('keydown', (ev)=>{
  if(!LEITOR.aberto) return;
  const digitando = ev.target && ev.target.tagName==='INPUT';
  if(ev.key==='Escape'){ ev.stopImmediatePropagation(); leitorFechar(); return; }
  if(digitando){ ev.stopImmediatePropagation(); return; }
  if(ev.key==='ArrowLeft'||ev.key==='PageUp'){ ev.stopImmediatePropagation(); ev.preventDefault(); leitorIr(-1); }
  else if(ev.key==='ArrowRight'||ev.key==='PageDown'){ ev.stopImmediatePropagation(); ev.preventDefault(); leitorIr(1); }
  else if(ev.key==='+'||ev.key==='='){ ev.stopImmediatePropagation(); LEITOR.zoom=Math.min(4,(LEITOR.zoom||1)*1.2); leitorDesenhar(); }
  else if(ev.key==='-'){ ev.stopImmediatePropagation(); LEITOR.zoom=Math.max(.3,(LEITOR.zoom||1)/1.2); leitorDesenhar(); }
  else ev.stopImmediatePropagation();
}, true);

/* abre a apostila da matéria (PDF do aparelho, senão link do Drive) */
async function teoriaAbrirMateria(materia, pagina, rotulo){
  if(!TEORIA.carregado) await teoriaCarregarTudo();
  const local = await teoriaLocal(materia);
  if(local && local.dados){ leitorAbrirPdf(local.dados, pagina, rotulo || local.nome); return true; }
  const link = teoriaLinkDaMateria(materia);
  if(link){ leitorAbrirDrive(link, pagina, rotulo || link.nome); return true; }
  alert('Nenhuma apostila está disponível para esta matéria no momento.');
  return false;
}

/* ---- link "Teoria" na resolução: abre a página da apostila ligada ao artigo da questão ---- */
function teoriaPaginaDaQuestao(q){
  if(typeof TEORIA_INDICE==='undefined' || !q || !q.materia) return null;
  const chave = Object.keys(TEORIA_INDICE).find(k=> slugify(q.materia).startsWith(k));
  if(!chave) return null;
  const idx = TEORIA_INDICE[chave];
  let refs = []; try{ refs = refsArtigosDaQuestao(q); }catch(_){}
  for(const r of refs){
    const normas = r.norma ? [r.norma] : ['CTN','CF'];
    for(const nm of normas){ const p = idx.paginas[`${nm}:${r.n}`]; if(p) return { chave, pagina:p, rotulo:`${nm} art. ${r.n}`, pdf:idx.pdf }; }
  }
  return null;
}
/* artigos fora da apostila: leva ao texto oficial (Planalto), ancorado no artigo */
const TEORIA_LEI_URL = {
  'CTN':'https://www.planalto.gov.br/ccivil_03/leis/l5172compilado.htm',
  'CF':'https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm',
  'LC 116':'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp116.htm',
  'LC 87':'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp87.htm',
  'Lei 9.430':'https://www.planalto.gov.br/ccivil_03/leis/l9430.htm',
  'Decreto-lei 1.598':'https://www.planalto.gov.br/ccivil_03/decreto-lei/del1598.htm',
  'LC 109':'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp109.htm',
  'ADCT':'https://www.planalto.gov.br/ccivil_03/constituicao/adct.htm',
  'EC 132':'https://www.planalto.gov.br/ccivil_03/constituicao/emendas/emc/emc132.htm'
};
function teoriaLeiDaQuestao(q){
  if(!q || !q.materia || typeof TEORIA_INDICE==='undefined') return null;
  if(!Object.keys(TEORIA_INDICE).some(k=> slugify(q.materia).startsWith(k))) return null;
  let refs = []; try{ refs = refsArtigosDaQuestao(q); }catch(_){}
  for(const r of refs){
    const base = TEORIA_LEI_URL[r.norma]; if(base && r.n) return { url: `${base}#art${r.n}`, rotulo: `${r.norma} art. ${r.n}` };
  }
  return null;
}
/* normas cujo texto oficial está dentro da plataforma (carregado só ao abrir): arquivo, nome, limite */
const LEI_FONTES = {
  CTN:{ arquivo:'js/ctn-texto.js', global:'CTN_TEXTO', titulo:'Código Tributário Nacional · Lei 5.172/1966', max:218 },
  CF:{ arquivo:'js/cf-texto.js', global:'CF_TEXTO', titulo:'Constituição Federal de 1988', max:250 },
  'RI TCDF':{ arquivo:'js/ri-texto.js', global:'RITCDF_TEXTO', titulo:'Regimento Interno do TCDF · Res. 296/2016 (arts. 119 em diante: texto de 2016, sem emendas)', max:306 },
  'IN 5':{ arquivo:'js/in5-texto.js', global:'IN5_TEXTO', titulo:'Instrução Normativa SEGES/MP 5/2017 (atualizada) · arts. 1º a 75', max:75 },
  'Lei 14.133':{ arquivo:'js/l14133-texto.js', global:'L14133_TEXTO', titulo:'Lei 14.133/2021 · Licitações e Contratos Administrativos', max:194 },
  'Decreto 44.330':{ arquivo:'js/d44330-texto.js', global:'D44330_TEXTO', titulo:'Decreto Distrital 44.330/2023 · regulamenta a Lei 14.133 no DF', max:272 },
  LODF:{ arquivo:'js/lodf-texto.js', global:'LODF_TEXTO', titulo:'Lei Orgânica do Distrito Federal', max:365 },
  'LC 1':{ arquivo:'js/lc1-texto.js', global:'LC1_TEXTO', titulo:'Lei Orgânica do TCDF · Lei Complementar 1/1994', max:101 },
  'LC 116':{ arquivo:'js/lc116-texto.js', global:'LC116_TEXTO', titulo:'Lei Complementar 116/2003 · ISS', max:10 },
  'LC 87':{ arquivo:'js/lc87-texto.js', global:'LC87_TEXTO', titulo:'Lei Complementar 87/1996 · Lei Kandir (ICMS)', max:36 },
  'Lei 9.430':{ arquivo:'js/l9430-texto.js', global:'L9430_TEXTO', titulo:'Lei 9.430/1996', max:88 },
  'Decreto-lei 1.598':{ arquivo:'js/del1598-texto.js', global:'DEL1598_TEXTO', titulo:'Decreto-Lei 1.598/1977 · Lucro real', max:67 },
  ADCT:{ arquivo:'js/adct-texto.js', global:'ADCT_TEXTO', titulo:'ADCT · Ato das Disposições Constitucionais Transitórias', max:138 },
  'EC 132':{ arquivo:'js/ec132-texto.js', global:'EC132_TEXTO', titulo:'Emenda Constitucional 132/2023 · Reforma Tributária', max:23 },
  SUM:{ arquivo:'js/sumulas-texto.js', global:'SUMULAS_TEXTO', titulo:'Súmulas do STF', max:0 },
  'LC 109':{ arquivo:'js/lc109-texto.js', global:'LC109_TEXTO', titulo:'Lei Complementar 109/2001 · Previdência Complementar', max:79 }
};
function teoriaLeisDaQuestao(q){
  if(!q) return [];
  let refs = []; try{ refs = refsArtigosDaQuestao(q); }catch(_){}
  const vistos = new Set(), out = [];
  const m = String(q.r||'').match(/⚖️\s*([^\n]*)/); const linha = m ? m[1].replace(/\*+/g,'') : '';
  let mm;
  if((mm = linha.match(/Art\.?\s*(\d+(?:-[A-Z])?)[^·]*·\s*ADCT/))) refs = refs.concat([{ norma:'ADCT', n:mm[1], txt:true }]);
  if((mm = linha.match(/Art\.?\s*(\d+)[^·]*·\s*EC 132/))) refs = refs.concat([{ norma:'EC 132', n:+mm[1] }]);
  if((mm = linha.match(/S[úu]mula Vinculante\s*(\d+)/i))) refs = refs.concat([{ norma:'SUM', n:'SV '+mm[1], txt:true }]);
  else if((mm = linha.match(/S[úu]mula\s*(\d+)\s*·\s*STF/i))) refs = refs.concat([{ norma:'SUM', n:'S '+mm[1], txt:true }]);
  refs.forEach(r=>{ const f = LEI_FONTES[r.norma]; const k = r.norma+':'+r.n; if(f && (r.txt || (r.n>=1 && r.n<=f.max)) && !vistos.has(k)){ vistos.add(k); out.push({ norma:r.norma, n:r.n }); } });
  // um botão só: o artigo citado primeiro na linha ⚖️ (os demais ficam a um ‹ › de distância no pop-up)
  const p1 = linha.match(/Art\.?\s*(\d+(?:-[A-Z])?)/);
  if(p1){ const i = out.findIndex(l=> String(l.n)===p1[1]); if(i>0) out.unshift(out.splice(i,1)[0]); }
  return out.slice(0,1);
}

/* ---- fichas de doutrina (sem artigo de lei): síntese própria a partir de fontes públicas ---- */
const DOUTRINA = {
  eficacia:{ titulo:'Eficácia e aplicabilidade das normas constitucionais', secs:[
    { titulo:'Eficácia plena', lei:['Eficácia plena · aplicabilidade direta, imediata e integral.','Produzem todos os efeitos desde a entrada em vigor, sem depender de lei. Ex.: art. 22 (competências privativas da União).'] },
    { titulo:'Eficácia contida (restringível)', lei:['Eficácia contida · aplicabilidade direta e imediata, mas restringível.','Produzem efeitos desde logo, porém a lei (ou a própria Constituição) pode reduzir o alcance. Sem a lei restritiva, funcionam como normas de eficácia plena. Ex.: art. 5º, XIII (livre exercício de profissão, atendidas as qualificações que a lei estabelecer).'],
      peg:'Eficácia contida não é "dependente de lei": ela já vale; a lei só pode restringir.' },
    { titulo:'Eficácia limitada', lei:['Eficácia limitada (ou reduzida) · aplicabilidade indireta, mediata e reduzida.','Dependem de lei para produzir todos os efeitos. Mesmo assim têm eficácia jurídica: vinculam o legislador, revogam normas anteriores incompatíveis e impedem a edição de normas contrárias.','Dividem-se em: normas de princípio institutivo (organizam instituições; ex.: art. 18, § 2º) e normas programáticas (programas de ação social, econômica e cultural dirigidos ao legislador; ex.: art. 196, 205).'],
      peg:'Não existe norma constitucional sem eficácia; a diferença é de grau. Norma programática não gera direito subjetivo pleno, mas tem eficácia jurídica.' },
    { titulo:'Classificação de José Afonso da Silva', lei:['Classificação tricotômica de José Afonso da Silva (Aplicabilidade das normas constitucionais, 1968): eficácia plena, contida e limitada.','O STF adota essa classificação. O autor passou a preferir o termo "normas dirigentes" em vez de "programáticas".'] }
  ], fontes:[['Grupo GEN · eficácia e aplicabilidade','https://blog.grupogen.com.br/juridico/postagens/artigos/eficacia-e-aplicabilidade-das-normas-constitucionais/'],['Jus.com.br · eficácia e aplicabilidade','https://jus.com.br/artigos/33391/a-eficacia-e-aplicabilidade-das-normas-constitucionais']] },
  mpc:{ titulo:'MP de Contas e mandado de segurança · STF', secs:[
    { titulo:'Tese do STF (Tema 1044)', lei:['O ==Ministério Público de Contas não tem legitimidade== para impetrar mandado de segurança contra acórdão do Tribunal de Contas perante o qual atua (RE 1.178.617, repercussão geral, Tema 1044, 2019).','Fundamento: o MP de Contas não tem fisionomia institucional própria nem personalidade para demandar contra o órgão do qual faz parte; é ente despersonalizado ligado à estrutura do Tribunal de Contas.'], peg:'Independência funcional dos membros não equivale a capacidade para impetrar MS contra a própria Corte.' },
    { titulo:'Base: estrutura e autonomia', lei:['ADI 789 (1994): o MP junto ao Tribunal de Contas integra a estrutura do próprio Tribunal.','Mais recentemente (ADI 5.254, 2024), o STF reafirmou que o MP de Contas não tem autonomia administrativa e financeira, embora seus membros mantenham independência funcional.','Antes da tese do STF, o STJ admitia a legitimidade para defesa de prerrogativas institucionais (RMS 52.741-GO); esse entendimento cedeu à tese fixada pelo STF.'] }
  ], fontes:[['Dizer o Direito · MP de Contas e mandado de segurança','https://www.dizerodireito.com.br/2019/06/ministerio-publico-do-tribunal-de.html'],['Conjur · MP de Contas não pode impetrar MS','https://www.conjur.com.br/2019-abr-28/mp-contas-nao-impetrar-ms-tribunal-contas//?print=1'],['Trilhante · Tema 1044 do STF','https://informativos.trilhante.com.br/temas-stf/tema-1044-stf']] },
  geracoes:{ titulo:'Gerações (dimensões) dos direitos fundamentais · Bonavides', secs:[
    { titulo:'1ª geração · liberdade', lei:['Direitos de liberdade: civis e políticos, exercidos pelo indivíduo contra o Estado (postura de não interferência).'] },
    { titulo:'2ª geração · igualdade', lei:['Direitos de igualdade: sociais, econômicos e culturais, que exigem prestações do Estado.'] },
    { titulo:'3ª geração · fraternidade', lei:['Direitos de fraternidade (solidariedade): coletivos e difusos, de titularidade indeterminada. Ex.: meio ambiente.'] },
    { titulo:'4ª e 5ª gerações', lei:['Para Paulo Bonavides, a 4ª geração decorre da globalização: direito à democracia (especialmente direta), à informação e ao pluralismo. A 5ª é o direito à paz.'],
      peg:'A numeração varia entre autores (ex.: Uadi Lammêgo Bulos); a tríade liberdade, igualdade e fraternidade é a base comum. Há quem prefira "dimensões" a "gerações".' }
  ], fontes:[['Âmbito Jurídico · gerações ou dimensões','https://ambitojuridico.com.br/geracoes-ou-dimensoes-dos-direitos-fundamentais/'],['Jus.com.br · dimensões dos direitos fundamentais','https://jus.com.br/artigos/14844/antecedentes-e-desenvolvimento-historico-dos-direitos-fundamentais-em-dimensoes-ou-geracoes']] }
};
/* fichas de Administração (js/doutrina-adm.js, carregado ao abrir): assunto da questão -> ficha */
const DOUTRINA_TEMAS = [
  [/^1\.[123]/,'abordagens','Abordagens da administração'],[/^[23](\.\d)? Admin|^2 Evol|^3(\.\d)? Adm/,'evolucao','Patrimonialismo, burocracia e gerencial'],
  [/^4\.1\.[56]|^4\.1\.5/,'accountability','Accountability e transparência'],[/^4(\.|\s)/,'governanca','Governança pública'],
  [/^5 /,'funcoes','Funções administrativas'],[/^6\.[12]/,'swot','SWOT e matriz GUT'],[/^6\.5/,'bsc','BSC e mapa estratégico'],
  [/^7/,'processos','Gestão de processos'],[/^8\.4/,'lideranca','Liderança e poder'],[/^8\.5/,'motivacao','Motivação'],
  [/^9 |Fora do edital/,'ferramentas','PDCA, 5W2H, competências e projetos']
];
const DOUTRINA_TEXTO = [
  [/accountability|transpar[êe]ncia|controle social/i,'accountability'],[/governan[çc]a|governabilidade|decreto.{0,6}9\.203/i,'governanca'],
  [/SWOT|FOFA|matriz GUT/i,'swot'],[/balanced scorecard|BSC|mapa estrat[ée]gico/i,'bsc'],[/BPMN|processo|cadeia de valor|POP\b/i,'processos'],
  [/lideran|poder (legítimo|coercitivo)/i,'lideranca'],[/motiva|Herzberg|Maslow/i,'motivacao'],[/patrimonialis|burocr[áa]tic|gerencial|nova gest[ãa]o p[úu]blica|racional-legal|reforma/i,'evolucao'],
  [/Taylor|Fayol|contingenc|sist[êe]mic|relações humanas|comportamental/i,'abordagens'],[/PDCA|5W2H|compet[êe]ncia|benchmarking|projeto/i,'ferramentas'],
  [/planejamento|organiza[çc][ãa]o|dire[çc][ãa]o|controle|departamentaliza|amplitude|estrutura|fun[çc][õo]es/i,'funcoes'],
  [/pol[íi]ticas p[úu]blicas/i,'governanca']
];
function doutrinaDaQuestao(q){
  if(!q) return null; const t = String(q.q||'') + ' ' + String(q.tema||'');
  if(/Bonavides|gera[çc][õo]es|dimens[õo]es.{0,30}direitos fundamentais/i.test(t)) return 'geracoes';
  if(/efic[áa]cia (plena|contida|limitada)|normas (constitucionais )?program[áa]ticas|classifica[çc][ãa]o tripartite|aplicabilidade das normas|restringida pelo legislador infraconstitucional/i.test(t)) return 'eficacia';
  if(/^reg/i.test(String(q.materia||'')) && /mandado de seguran[çc]a/i.test(String(q.q||'')) && /Minist[ée]rio P[úu]blico|MP\b/.test(String(q.q||''))) return 'mpc';
  const tema = String(q.tema||'').trim();
  if(!/^adm(inistra[çc][ãa]o)? geral/i.test(String(q.materia||''))) return null;   // os códigos de assunto repetem entre matérias
  for(const tm of [tema, String(q.temaOriginal||'').trim()]) for(const [re,k] of DOUTRINA_TEMAS) if(re.test(tm)) return 'adm:'+k;
  // assunto ausente ou fora do padrão: procura o tema no texto da questão
  for(const [re,k] of DOUTRINA_TEXTO) if(re.test(t)) return 'adm:'+k;
  return null;
}
function doutrinaTitulo(chave){
  if(DOUTRINA[chave]) return DOUTRINA[chave].titulo.split(' · ')[0];
  const k = String(chave).replace(/^adm:/,''); const t = DOUTRINA_TEMAS.find(x=>x[1]===k); return t ? t[2] : 'Doutrina';
}
let doutrinaAdmPromessa = null;
function doutrinaAdmCarregar(){
  if(typeof DOUTRINA_ADM!=='undefined') return Promise.resolve();
  if(doutrinaAdmPromessa) return doutrinaAdmPromessa;
  doutrinaAdmPromessa = new Promise((ok,falha)=>{
    const sc = document.createElement('script'); sc.src = 'js/doutrina-adm.js?v=' + ((window.__TCDF_BUILD__||{}).versao||'');
    sc.onload = ok; sc.onerror = ()=>{ doutrinaAdmPromessa = null; falha(new Error('Não foi possível carregar a doutrina.')); };
    document.head.appendChild(sc);
  });
  return doutrinaAdmPromessa;
}
async function doutrinaAbrir(chave, uid){
  const el = leiEl(); LEI.modo = 'apostila'; LEI.q = uid; LEI.aberta = true; el.hidden = false; el.classList.add('modo-apostila');
  let d = DOUTRINA[chave];
  if(!d){
    document.getElementById('lei-corpo').textContent = 'Carregando…';
    try{ await doutrinaAdmCarregar(); }catch(e){ document.getElementById('lei-corpo').textContent = e.message; return; }
    d = DOUTRINA_ADM[String(chave).replace(/^adm:/,'')];
  }
  if(!d){ leiFechar(); return; }
  LEI.secs = d.secs.map(x=> Object.assign({ doutrina:d }, x)); LEI.i = 0; apostilaDesenhar();
}
function teoriaBotaoHtml(q){
  let h = '';
  const t = teoriaPaginaDaQuestao(q);
  let leis = teoriaLeisDaQuestao(q);
  if(t){   // a teoria da apostila aparece dentro do pop-up da lei do mesmo artigo
    const [nm, n] = t.rotulo.replace(' art. ',':').split(':');
    if(!leis.some(l=> l.norma===nm && String(l.n)===String(n))) leis = [{ norma:nm, n:+n }].concat(leis).slice(0,1);
  }
  leis.forEach(l=>{ h += `<button class="btn-corrigir-gabarito btn-ui" data-lei-ver="${l.norma}:${l.n}" data-lei-q="${esc(q.uid)}" title="Ler o texto oficial: ${l.norma==='SUM' ? l.n : l.norma+' art. '+l.n}">⚖️ ${l.norma==='SUM' ? l.n.replace(/^S /,'Súmula ') : l.norma+' art. '+l.n}</button>`; });
  const dk = (!t && !leis.length) ? doutrinaDaQuestao(q) : null;
  if(dk) h += `<button class="btn-corrigir-gabarito btn-ui" data-doutrina="${dk}" data-lei-q="${esc(q.uid)}" title="Ler a síntese de doutrina sobre o tema">📖 Doutrina · ${esc(doutrinaTitulo(dk))}</button>`;
  if(!t && !leis.length && !dk){
    const l = teoriaLeiDaQuestao(q);
    if(l) h += `<a class="btn-corrigir-gabarito btn-ui" href="${esc(l.url)}" target="_blank" rel="noopener" title="Este artigo não está no texto da plataforma: abrir o texto oficial (Planalto)">⚖️ Lei · ${esc(l.rotulo)} ↗</a>`;
  }
  return h;
}

/* ---- texto oficial dentro da plataforma (js/ctn-texto.js, js/cf-texto.js) ---- */
const LEI = { aberta:false, norma:'CTN', n:'1', q:null, modo:'lei', secs:[], i:0 };
const leiCarregando = {};
function leiCarregar(norma){
  const f = LEI_FONTES[norma]; let d = null; try{ d = eval(f.global); }catch(_){}
  if(d) return Promise.resolve();
  if(leiCarregando[norma]) return leiCarregando[norma];
  leiCarregando[norma] = new Promise((ok,falha)=>{
    const sc = document.createElement('script'); sc.src = f.arquivo + '?v=' + ((window.__TCDF_BUILD__||{}).versao||'');
    sc.onload = ok; sc.onerror = ()=>{ delete leiCarregando[norma]; falha(new Error('Não foi possível carregar o texto da norma.')); };
    document.head.appendChild(sc);
  });
  return leiCarregando[norma];
}
function leiOrdem(norma){
  const d = eval(LEI_FONTES[norma].global); if(d.__ordem) return d.__ordem;
  if(norma==='SUM'){ const k0 = Object.keys(d); Object.defineProperty(d,'__ordem',{ value:k0, enumerable:false }); return k0; }
  const k = Object.keys(d).sort((a,b)=>{ const x=a.split('-'), y=b.split('-'); return (+x[0]-+y[0]) || String(x[1]||'').localeCompare(String(y[1]||'')); });
  Object.defineProperty(d,'__ordem',{ value:k, enumerable:false }); return k;
}

/* ---- dispositivo citado na linha ⚖️ da questão (ex.: Art. 150 ▸ VI ▸ "a" e § 2º) ---- */
function leiAlvosDaQuestao(q, norma, n){
  const m = String((q && q.r) || '').match(/⚖️\s*([^\n]*)/); if(!m) return [];
  const linha = m[1].replace(/\*+/g,'').replace(/[“”]/g,'"');
  const pos = linha.search(new RegExp('Art\\.?\\s*'+String(n).replace('-','\\-')+'\\b')); if(pos<0) return [];
  const resto = linha.slice(pos).replace(/^Art\.?\s*[\w-]+[º°]?\s*/,'').split('·')[0];
  const alvos = []; let cur = null;
  const novo = ()=>{ cur = { par:null, inc:null, ali:[] }; alvos.push(cur); return cur; };
  resto.split(/▸|,|\se\s/).map(x=>x.trim()).filter(Boolean).forEach(t=>{
    let mm;
    if((mm = t.match(/^§\s*(\d+)/))){ novo().par = mm[1]; }
    else if(/^par[áa]grafo [úu]nico/i.test(t)){ novo().par = 'U'; }
    else if((mm = t.match(/^([IVXL]+)$/))){ if(!cur || cur.inc || cur.ali.length) { const p = cur && cur.par; novo().par = p||null; } cur.inc = mm[1]; }
    else if((mm = t.match(/^"?([a-z])"?$/))){ (cur||novo()).ali.push(mm[1]); }
  });
  return alvos.filter(a=>a.par||a.inc||a.ali.length);
}
function leiMarcar(ps, alvos){
  const marca = new Set();
  const ehPar = p=> /^(§|Parágrafo único)/.test(p);
  const ini = []; ps.forEach((p,i)=>{ if(ehPar(p)) ini.push(i); });
  alvos.forEach(a=>{
    let a0 = 1, a1 = ini.length ? ini[0] : ps.length;         // escopo: caput + incisos
    if(a.par){
      const k = ini.findIndex(i=> a.par==='U' ? /^Parágrafo único/.test(ps[i]) : new RegExp('^§\\s*'+a.par+'\\b').test(ps[i]));
      if(k<0) return; a0 = ini[k]; a1 = k+1<ini.length ? ini[k+1] : ps.length;
      if(!a.inc && !a.ali.length){ for(let i=a0;i<a1;i++) marca.add(i); return; }
      a0++;
    }
    if(!a.inc){ for(let i=a0;i<a1;i++) if(a.ali.some(l=> new RegExp('^'+l+'\\)').test(ps[i]))) marca.add(i); return; }
    const ri = new RegExp('^'+a.inc+'\\s*[-–]');
    let i = a0; while(i<a1 && !ri.test(ps[i])) i++; if(i>=a1) return;
    marca.add(i); let j = i+1;
    while(j<a1 && !/^[IVXL]+\s*[-–]/.test(ps[j])){ if(!a.ali.length || a.ali.some(l=> new RegExp('^'+l+'\\)').test(ps[j]))) marca.add(j); j++; }
  });
  if(!marca.size && !alvos.length) return null;
  return marca.size ? marca : null;
}
function leiEl(){
  let el = document.getElementById('lei-modal'); if(el) return el;
  el = document.createElement('div'); el.id = 'lei-modal'; el.className = 'lei-modal'; el.hidden = true;
  el.innerHTML = `<div class="lei-caixa" role="dialog" aria-label="Texto oficial">
    <div class="lei-barra"><strong id="lei-titulo"></strong>
      <span class="lei-nav"><button type="button" class="btn-ui" data-lei="prev" title="Artigo anterior (←)">‹</button>
      <input type="text" id="lei-n" size="6" aria-label="Artigo"><button type="button" class="btn-ui" data-lei="next" title="Próximo artigo (→)">›</button></span>
      <a class="btn-ui" id="lei-ext" target="_blank" rel="noopener">Planalto ↗</a>
      <button type="button" class="btn-ui" data-lei="fechar" title="Fechar (Esc)">✕</button></div>
    <div class="lei-corpo" id="lei-corpo"></div></div>`;
  el.addEventListener('mousedown', ev=>{ if(ev.target===el) leiFechar(); });
  document.body.appendChild(el); return el;
}
function leiFechar(){ const el = document.getElementById('lei-modal'); if(el) el.hidden = true; LEI.aberta = false; }
function leiPasso(delta){
  const ord = leiOrdem(LEI.norma); let i = ord.indexOf(LEI.n);
  if(i<0){ i = ord.findIndex(k=> parseInt(k,10) >= parseInt(LEI.n,10)); if(i<0) i = ord.length-1; if(delta>0) delta = 0; }
  const novo = ord[Math.max(0, Math.min(ord.length-1, i+delta))]; if(novo!==LEI.n) LEI.q = null; LEI.n = novo; leiDesenhar();
}
function leiDesenhar(){
  const f = LEI_FONTES[LEI.norma], d = eval(f.global), n = LEI.n;
  document.getElementById('lei-titulo').textContent = f.titulo;
  document.getElementById('lei-n').value = n;
  const ext = document.getElementById('lei-ext'); if(TEORIA_LEI_URL[LEI.norma]){ ext.href = `${TEORIA_LEI_URL[LEI.norma]}#art${String(n).replace(/-.*/,'')}`; ext.hidden = false; } else { ext.removeAttribute('href'); ext.hidden = true; }
  const ps = d[n] || null;
  const corpo = document.getElementById('lei-corpo');
  const marca = (ps && LEI.q) ? leiMarcar(ps, leiAlvosDaQuestao(BY_UID[LEI.q], LEI.norma, n)) : null;
  corpo.classList.toggle('lei-com-alvo', !!marca);
  corpo.innerHTML = ps ? ps.map((p,i)=>{
    const m = p.match(/^(.*?)(\s*\((?:Reda[çc][ãa]o|Inclu[ií]d|Revogad|Vide|Vig[êe]ncia|Produ[çc][ãa]o|Regulament|Promulga|Vetad|Execu[çc]).*)$/i);
    const txt = m && i>0 ? m[1] : p; const nota = m && i>0 ? m[2] : '';
    const cls = i===0 ? 'lei-art' : /^(§|Parágrafo único)/.test(p) ? 'lei-par' : 'lei-inc';
    return `<p class="${cls}${marca && marca.has(i) ? ' lei-alvo' : ''}">${esc(txt)}${nota ? ` <span class="lei-nota">${esc(nota.trim())}</span>` : ''}</p>`;
  }).join('') : `<p class="lei-nota">O artigo ${esc(n)} foi revogado ou não consta do texto da plataforma. Consulte a fonte oficial.</p>`;
  corpo.scrollTop = 0;
  const al = corpo.querySelector('.lei-alvo'); if(al) corpo.scrollTop = Math.max(0, al.offsetTop - 70);
  leiApostilaAnexar(n);
}
/* teoria da apostila do mesmo artigo, no fim do pop-up da lei */
function apostilaSecoesDoArtigo(q, norma, n){
  const t = teoriaPaginaDaQuestao(q); if(!t || typeof TEORIA_TEXTO==='undefined') return [];
  const sec = (TEORIA_TEXTO[t.chave] || []).filter(x=> x.norma===norma && x.artigos.includes(+n));
  const m = String(q.r||'').match(/⚖️\s*([^\n]*)/); const linha = m ? m[1].replace(/\*+/g,'') : '';
  const rom = (linha.match(/▸\s*([IVXL]+)\b/)||[])[1]; const par = (linha.match(/§\s*(\d+)/)||[])[1];
  const pontos = x=>{ let p = 0; if(rom && new RegExp('(^|[^A-Z])'+rom+'([^A-Z]|$)').test(x.titulo)) p += 2; if(par && new RegExp('§\\s*'+par).test(x.titulo)) p += 2; if(!rom && !par && /caput/i.test(x.titulo)) p += 1; return p; };
  sec.sort((a,b)=> pontos(b)-pontos(a));
  const mx = sec.length ? pontos(sec[0]) : 0;
  return mx>0 ? sec.filter(x=> pontos(x)===mx) : sec;   // só o trecho que a questão cita (se houver)
}
async function leiApostilaAnexar(n){
  const q = LEI.q && BY_UID[LEI.q]; if(!q || !teoriaPaginaDaQuestao(q) || (LEI.norma!=='CF' && LEI.norma!=='CTN')) return;
  const norma = LEI.norma, chave = String(n);
  try{ await apostilaCarregar(); }catch(_){ return; }
  if(!LEI.aberta || LEI.norma!==norma || String(LEI.n)!==chave) return;
  const secs = apostilaSecoesDoArtigo(q, norma, n); if(!secs.length) return;
  const corpo = document.getElementById('lei-corpo'); if(!corpo || corpo.querySelector('.lei-apostila')) return;
  corpo.insertAdjacentHTML('beforeend', `<div class="lei-apostila"><div class="lei-apostila-tit">📖 Na apostila</div>` + secs.map(x=>
    `<div class="lei-apostila-sec"><strong>${esc(x.titulo)}</strong> <span class="lei-nota">pág. ${x.pagina}</span>`
    + (x.peg ? `<div class="lei-peg"><strong>⚠️ Pegadinha provável.</strong> ${esc(x.peg)}</div>` : '')
    + `<button type="button" class="btn-ui lei-pdf" data-lei-pdf="${x.pagina}">Abrir o PDF nesta página</button></div>`).join('') + `</div>`);
}
async function leiAbrir(ref, uid){
  const [norma, n] = String(ref).split(':'); if(!LEI_FONTES[norma]) return;
  const el = leiEl(); LEI.modo = 'lei'; LEI.q = uid || null; LEI.norma = norma; LEI.n = String(n); el.hidden = false; LEI.aberta = true;
  el.classList.remove('modo-apostila');
  document.getElementById('lei-corpo').textContent = 'Carregando…';
  try{ await leiCarregar(norma); leiDesenhar(); }catch(e){ document.getElementById('lei-corpo').textContent = e.message; }
}
document.addEventListener('click', (ev)=>{
  const dv = ev.target.closest && ev.target.closest('[data-doutrina]'); if(dv){ doutrinaAbrir(dv.dataset.doutrina, dv.dataset.leiQ); return; }
  const v = ev.target.closest && ev.target.closest('[data-lei-ver]'); if(v){ leiAbrir(v.dataset.leiVer, v.dataset.leiQ); return; }
  const pdf = ev.target.closest && ev.target.closest('[data-lei-pdf]'); if(pdf){ const q = BY_UID[LEI.q]; leiFechar(); if(q) teoriaAbrirMateria(q.materia, +pdf.dataset.leiPdf, 'Apostila'); return; }
  const b = ev.target.closest && ev.target.closest('[data-lei]'); if(!b) return;
  const a = b.dataset.lei;
  if(a==='fechar') leiFechar();
  else if(LEI.modo==='apostila'){ const d = a==='prev' ? -1 : 1; LEI.i = Math.max(0, Math.min(LEI.secs.length-1, LEI.i+d)); apostilaDesenhar(); }
  else if(a==='prev') leiPasso(-1); else if(a==='next') leiPasso(1);
});
document.addEventListener('change', (ev)=>{ if(ev.target && ev.target.id==='lei-n' && LEI.modo==='lei'){ LEI.n = String(ev.target.value).trim().toUpperCase() || '1'; leiPasso(0); } });
document.addEventListener('keydown', (ev)=>{
  if(!LEI.aberta) return;
  if(ev.target && ev.target.tagName==='INPUT'){ ev.stopImmediatePropagation(); return; }
  ev.stopImmediatePropagation();
  if(ev.key==='Escape') leiFechar();
  else if(ev.key==='ArrowLeft'){ ev.preventDefault(); document.querySelector('[data-lei=prev]').click(); }
  else if(ev.key==='ArrowRight'){ ev.preventDefault(); document.querySelector('[data-lei=next]').click(); }
}, true);


/* ---- trecho da apostila no mesmo pop-up (js/teoria-dt.js) ---- */
let apostilaPromessa = null;
function apostilaCarregar(){
  if(typeof TEORIA_TEXTO!=='undefined') return Promise.resolve();
  if(apostilaPromessa) return apostilaPromessa;
  apostilaPromessa = new Promise((ok,falha)=>{
    const sc = document.createElement('script'); sc.src = 'js/teoria-dt.js?v=' + ((window.__TCDF_BUILD__||{}).versao||'');
    sc.onload = ok; sc.onerror = ()=>{ apostilaPromessa = null; falha(new Error('Não foi possível carregar a apostila.')); };
    document.head.appendChild(sc);
  });
  return apostilaPromessa;
}
function apostilaSecoes(q){
  const t = teoriaPaginaDaQuestao(q); if(!t || typeof TEORIA_TEXTO==='undefined') return [];
  const lista = TEORIA_TEXTO[t.chave] || []; const [nm, n] = t.rotulo.replace(' art. ',':').split(':');
  let sec = lista.filter(x=> x.norma===nm && x.artigos.includes(+n));
  const m = String(q.r||'').match(/⚖️\s*([^\n]*)/); const linha = m ? m[1].replace(/\*+/g,'') : '';
  const rom = (linha.match(/▸\s*([IVXL]+)\b/)||[])[1]; const par = (linha.match(/§\s*(\d+)/)||[])[1];
  const pontos = x=>{ const ti = x.titulo; let p = 0;
    if(rom && new RegExp('(^|[^A-Z])'+rom+'([^A-Z]|$)').test(ti)) p += 2;
    if(par && new RegExp('§\\s*'+par).test(ti)) p += 2;
    if(!rom && !par && /caput/i.test(ti)) p += 1; return p; };
  return sec.sort((a,b)=> pontos(b)-pontos(a));
}
function apostilaDesenhar(){
  const q = BY_UID[LEI.q]; const x = LEI.secs[LEI.i]; if(!x) return;
  if(x.doutrina){
    document.getElementById('lei-titulo').textContent = `Doutrina · ${x.titulo}`;
    document.getElementById('lei-n').value = `${LEI.i+1}/${LEI.secs.length}`;
    document.getElementById('lei-ext').removeAttribute('href');
    const c = document.getElementById('lei-corpo'); c.classList.remove('lei-com-alvo');
    c.innerHTML = x.lei.map((p,i)=>`<p class="${i===0 ? 'lei-art' : 'lei-inc'}">${esc(p)}</p>`).join('')
      + (x.peg ? `<div class="lei-peg"><strong>⚠️ Pegadinha provável.</strong> ${esc(x.peg)}</div>` : '')
      + `<p class="lei-nota">${esc(x.doutrina.titulo)}. Síntese própria; fontes: ` + x.doutrina.fontes.map(f=> f[1] ? `<a href="${esc(f[1])}" target="_blank" rel="noopener">${esc(f[0])}</a>` : esc(f[0])).join(' · ') + `.</p>`;
    c.scrollTop = 0; return;
  }
  document.getElementById('lei-titulo').textContent = `Apostila · ${x.titulo}`;
  document.getElementById('lei-n').value = `${LEI.i+1}/${LEI.secs.length}`;
  document.getElementById('lei-ext').removeAttribute('href');
  const corpo = document.getElementById('lei-corpo'); corpo.classList.remove('lei-com-alvo');
  corpo.innerHTML = x.lei.map((p,i)=>`<p class="${i===0 ? 'lei-art' : /^(§|Parágrafo único)/.test(p) ? 'lei-par' : 'lei-inc'}">${esc(p)}</p>`).join('')
    + (x.peg ? `<div class="lei-peg"><strong>⚠️ Pegadinha provável.</strong> ${esc(x.peg)}</div>` : '')
    + `<p class="lei-nota">Apostila de ${esc(q.materia)} · página ${x.pagina}. <button type="button" class="btn-ui lei-pdf" data-lei-pdf="${x.pagina}">Abrir o PDF nesta página</button></p>`;
  corpo.scrollTop = 0;
}
async function apostilaAbrir(uid){
  const q = BY_UID[uid]; if(!q) return;
  const el = leiEl(); LEI.modo = 'apostila'; LEI.q = uid; LEI.aberta = true; el.hidden = false; el.classList.add('modo-apostila');
  document.getElementById('lei-corpo').textContent = 'Carregando…';
  try{ await apostilaCarregar(); }catch(e){ document.getElementById('lei-corpo').textContent = e.message; return; }
  LEI.secs = apostilaSecoes(q); LEI.i = 0;
  if(!LEI.secs.length){ leiFechar(); teoriaVerDaQuestao(uid); return; }
  apostilaDesenhar();
}
function teoriaVerDaQuestao(uid){
  const q = BY_UID[uid]; const t = teoriaPaginaDaQuestao(q); if(!t) return;
  teoriaAbrirMateria(q.materia, t.pagina, `Apostila · ${t.rotulo}`);
}

function renderTeoria(){
  const materia = STATE.materia; const k = teoriaSlug(materia);
  if(!TEORIA.carregado && !TEORIA.carregando) setTimeout(teoriaCarregarTudo, 0);
  if(TEORIA.locais[k]===undefined) teoriaLocal(materia).then(()=>render());
  const link = teoriaLinkDaMateria(materia); const local = TEORIA.locais[k];
  const msg = TEORIA.msg ? `<div class="teoria-msg ${TEORIA.msg.tipo}">${esc(TEORIA.msg.txt)}</div>` : '';
  const linhaLink = link ? `
    <div class="teoria-linha"><span class="teoria-ico">☁️</span>
      <button type="button" class="teoria-nome" data-teoria-ler="1" title="Abrir na plataforma">${esc(link.nome)}</button>
      <span class="teoria-meta">Google Drive</span>
      <a class="btn-ui" href="${esc(link.url)}" target="_blank" rel="noopener">Abrir no Drive ↗</a>
      ${link.padrao ? '' : '<button type="button" class="btn-ui teoria-rem" data-teoria-rem-link="1">Remover</button>'}</div>` : '';
  const linhaLocal = (local && local.nome) ? `
    <div class="teoria-linha"><span class="teoria-ico">📄</span>
      <button type="button" class="teoria-nome" data-teoria-ler="1" title="Abrir no leitor da plataforma">${esc(local.nome)}</button>
      <span class="teoria-meta">${teoriaFormatarTamanho(local.bytes)} · neste aparelho</span>
      <button type="button" class="btn-ui teoria-rem" data-teoria-rem-local="1">Remover</button></div>` : '';
  return `<div class="teoria-wrap">
    <div class="section-eyebrow">${esc(materia||'')}</div>
    <h2 class="section-title">Teoria (PDF)</h2>
    <p class="teoria-sub">Cadastre a apostila desta matéria e leia dentro da plataforma. Sem custo: o arquivo fica no seu Google Drive e/ou neste aparelho.</p>
    ${msg}
    <div class="teoria-bloco"><div class="teoria-tit">☁️ Link do Google Drive</div>
      <div class="teoria-form">
        <input type="url" id="teoria-url" class="teoria-input" placeholder="https://drive.google.com/file/d/…/view" value="${link && !link.padrao ? esc(link.url) : ''}">
        <input type="text" id="teoria-nome" class="teoria-input teoria-input-nome" placeholder="Nome (opcional)" value="${link && !link.padrao ? esc(link.nome) : ''}">
        <button type="button" class="btn btn-gold btn-sm" data-teoria-salvar-link="1">Salvar link</button>
      </div>
      <div class="teoria-dica">No Drive: botão direito no PDF → Compartilhar → "Qualquer pessoa com o link" (leitor) → Copiar link. A pré-visualização não pula para a página sozinha; o botão da questão mostra o número da página.</div>
    </div>
    <div class="teoria-bloco"><div class="teoria-tit">📄 PDF neste aparelho <span class="teoria-tag">abre direto na página da questão</span></div>
      <div class="teoria-acoes"><label class="btn btn-sm teoria-up">⬆ Escolher PDF<input type="file" id="teoria-arquivo" accept="application/pdf,.pdf" hidden></label>
        <span class="teoria-dica">Fica só neste navegador (não sincroniza). Até ${TEORIA_MAX_MB} MB.</span></div>
    </div>
    ${linhaLink}${linhaLocal}${(!link && !(local&&local.nome)) ? '<div class="teoria-vazio">Nenhuma apostila cadastrada para esta matéria ainda.</div>' : ''}
  </div>`;
}

document.addEventListener('click', (ev)=>{
  const t = ev.target.closest && ev.target.closest.bind(ev.target);
  if(!t) return;
  
  if(t('[data-teoria-ler]')){ teoriaAbrirMateria(STATE.materia, 1); return; }
  if(t('[data-teoria-salvar-link]')){ teoriaSalvarLink(STATE.materia, document.getElementById('teoria-url').value, document.getElementById('teoria-nome').value.trim()); return; }
  if(t('[data-teoria-rem-link]')){ teoriaRemoverLink(STATE.materia); return; }
  if(t('[data-teoria-rem-local]')){ teoriaRemoverLocal(STATE.materia); }
});
document.addEventListener('change', (ev)=>{
  if(ev.target && ev.target.id==='teoria-arquivo'){ teoriaEnviarLocal(STATE.materia, Array.from(ev.target.files||[])); ev.target.value=''; }
});
