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
  const link = TEORIA.links[teoriaSlug(materia)];
  if(link){ leitorAbrirDrive(link, pagina, rotulo || link.nome); return true; }
  alert('Nenhuma apostila cadastrada para esta matéria. Na aba 06 Teoria (PDF), cole o link do Drive ou guarde o PDF neste aparelho.');
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
function teoriaBotaoHtml(q){
  const t = teoriaPaginaDaQuestao(q); if(!t) return '';
  return `<button class="btn-corrigir-gabarito btn-ui" data-teoria-ver="${esc(q.uid)}" title="Abrir a apostila em ${esc(t.rotulo)} (página ${t.pagina})">📖 Teoria · pág. ${t.pagina}</button>`;
}
function teoriaBotaoHtml(q){
  const t = teoriaPaginaDaQuestao(q); if(!t) return '';
  return `<button class="btn-corrigir-gabarito btn-ui" data-teoria-ver="${esc(q.uid)}" title="Abrir a apostila em ${esc(t.rotulo)} (página ${t.pagina})">📖 Teoria · pág. ${t.pagina}</button>`;
}
function teoriaVerDaQuestao(uid){
  const q = BY_UID[uid]; const t = teoriaPaginaDaQuestao(q); if(!t) return;
  teoriaAbrirMateria(q.materia, t.pagina, `Apostila · ${t.rotulo}`);
}

function renderTeoria(){
  const materia = STATE.materia; const k = teoriaSlug(materia);
  if(!TEORIA.carregado && !TEORIA.carregando) setTimeout(teoriaCarregarTudo, 0);
  if(TEORIA.locais[k]===undefined) teoriaLocal(materia).then(()=>render());
  const link = TEORIA.links[k]; const local = TEORIA.locais[k];
  const msg = TEORIA.msg ? `<div class="teoria-msg ${TEORIA.msg.tipo}">${esc(TEORIA.msg.txt)}</div>` : '';
  const linhaLink = link ? `
    <div class="teoria-linha"><span class="teoria-ico">☁️</span>
      <button type="button" class="teoria-nome" data-teoria-ler="1" title="Abrir na plataforma">${esc(link.nome)}</button>
      <span class="teoria-meta">Google Drive</span>
      <a class="btn-ui" href="${esc(link.url)}" target="_blank" rel="noopener">Abrir no Drive ↗</a>
      <button type="button" class="btn-ui teoria-rem" data-teoria-rem-link="1">Remover</button></div>` : '';
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
        <input type="url" id="teoria-url" class="teoria-input" placeholder="https://drive.google.com/file/d/…/view" value="${link ? esc(link.url) : ''}">
        <input type="text" id="teoria-nome" class="teoria-input teoria-input-nome" placeholder="Nome (opcional)" value="${link ? esc(link.nome) : ''}">
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
  const v = t('[data-teoria-ver]'); if(v){ teoriaVerDaQuestao(v.dataset.teoriaVer); return; }
  if(t('[data-teoria-ler]')){ teoriaAbrirMateria(STATE.materia, 1); return; }
  if(t('[data-teoria-salvar-link]')){ teoriaSalvarLink(STATE.materia, document.getElementById('teoria-url').value, document.getElementById('teoria-nome').value.trim()); return; }
  if(t('[data-teoria-rem-link]')){ teoriaRemoverLink(STATE.materia); return; }
  if(t('[data-teoria-rem-local]')){ teoriaRemoverLocal(STATE.materia); }
});
document.addEventListener('change', (ev)=>{
  if(ev.target && ev.target.id==='teoria-arquivo'){ teoriaEnviarLocal(STATE.materia, Array.from(ev.target.files||[])); ev.target.value=''; }
});
