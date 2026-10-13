// Figuras nas edições (enunciado / resolução / resumo flash): colar (Ctrl+V),
// arrastar ou escolher um arquivo. A imagem é reduzida (máx. 1200 px, JPEG) e
// guardada À PARTE (IndexedDB) — o HTML da edição só leva <img data-img="id">,
// para não estourar o limite de 1 MB do documento de progresso no Firestore.
// Com a sincronização ativa, cada figura vai para o próprio documento
// "{codigo}__img__{id}" da coleção "progresso" (as regras já permitem).
const IMAGENS_KEY = 'tcdf-imagens-usuario-v1';
const IMAGENS_ENVIADAS_KEY = 'tcdf-imagens-enviadas-v1';
let IMAGENS_USUARIO = {};          // { id: 'data:image/jpeg;base64,...' }
let IMAGENS_ENVIADAS = new Set();  // ids já gravados na nuvem
const _imgBuscando = new Set();
let _imgSalvarTimer = null;
const GIF_VAZIO = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

function salvarImagensUsuario(){
  clearTimeout(_imgSalvarTimer);
  _imgSalvarTimer = setTimeout(async ()=>{
    try{
      await storageSet(IMAGENS_KEY, JSON.stringify(IMAGENS_USUARIO));
      await storageSet(IMAGENS_ENVIADAS_KEY, JSON.stringify(Array.from(IMAGENS_ENVIADAS)));
    }catch(e){ console.error('Falha ao salvar figuras', e); }
  }, 300);
}
async function carregarImagensLocais(){
  try{ const r = await storageGet(IMAGENS_KEY); if(r && r.value) IMAGENS_USUARIO = JSON.parse(r.value); }catch(e){}
  try{ const r = await storageGet(IMAGENS_ENVIADAS_KEY); if(r && r.value) IMAGENS_ENVIADAS = new Set(JSON.parse(r.value)); }catch(e){}
}
function novoIdImagem(){ return 'i'+Date.now().toString(36)+Math.random().toString(36).slice(2,7); }

function comprimirImagem(file, maxLado){
  maxLado = maxLado || 1200;
  return new Promise((resolve, reject)=>{
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = ()=>{
      let esc = Math.min(1, maxLado/Math.max(im.naturalWidth, im.naturalHeight));
      let dataUrl = '';
      for(let tent=0; tent<4; tent++){
        const w = Math.max(1, Math.round(im.naturalWidth*esc)), h = Math.max(1, Math.round(im.naturalHeight*esc));
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0,0,w,h); x.drawImage(im,0,0,w,h);
        let q = 0.85; dataUrl = c.toDataURL('image/jpeg', q);
        while(dataUrl.length > 600000 && q > 0.45){ q -= 0.1; dataUrl = c.toDataURL('image/jpeg', q); }
        if(dataUrl.length <= 600000) break;
        esc *= 0.75;
      }
      URL.revokeObjectURL(url);
      dataUrl.length <= 650000 ? resolve(dataUrl) : reject(new Error('imagem grande demais'));
    };
    im.onerror = ()=>{ URL.revokeObjectURL(url); reject(new Error('arquivo não é uma imagem válida')); };
    im.src = url;
  });
}

async function registrarFigura(file){
  const dataUrl = await comprimirImagem(file);
  const id = novoIdImagem();
  IMAGENS_USUARIO[id] = dataUrl;
  salvarImagensUsuario();
  enviarImagemNuvem(id);
  return { id, dataUrl };
}

/* ---------- nuvem ---------- */
async function enviarImagemNuvem(id){
  try{
    if(typeof sincronizacaoAtiva!=='function' || !sincronizacaoAtiva() || IMAGENS_ENVIADAS.has(id) || !IMAGENS_USUARIO[id]) return;
    await comLimiteDeTempo(fbDb.collection('progresso').doc(`${STATE.syncCode}__img__${id}`).set(sanitizarParaFirestore(comDono({
      tipo:'imagem', id, dataUrl: IMAGENS_USUARIO[id], updatedAt: Date.now(),
    }))), 20000, 'tempo esgotado ao enviar figura');
    IMAGENS_ENVIADAS.add(id); salvarImagensUsuario();
  }catch(e){ console.warn('Figura ficou só neste aparelho por enquanto', e); }
}
function enviarImagensPendentes(){
  Object.keys(IMAGENS_USUARIO).forEach(id=>{ if(!IMAGENS_ENVIADAS.has(id)) enviarImagemNuvem(id); });
}
async function buscarImagemNuvem(id){
  if(_imgBuscando.has(id)) return;
  _imgBuscando.add(id);
  try{
    if(typeof sincronizacaoAtiva!=='function' || !sincronizacaoAtiva()) return;
    const doc = await comLimiteDeTempo(fbDb.collection('progresso').doc(`${STATE.syncCode}__img__${id}`).get(), 15000, 'tempo esgotado ao buscar figura');
    if(doc.exists && doc.data().dataUrl){
      IMAGENS_USUARIO[id] = doc.data().dataUrl; IMAGENS_ENVIADAS.add(id); salvarImagensUsuario();
      if(typeof render==='function' && (STATE.quiz || STATE.flashDeck) && !edicaoAtual) render();
    }
  }catch(e){ console.warn('Figura ainda não disponível neste aparelho', e); }
}

/* ---------- exibição / salvamento ---------- */
// põe o src real nos <img data-img="id"> do HTML (só para exibir)
function hidratarImagens(html){
  if(!html || html.indexOf('data-img')<0) return html;
  return html.replace(/<img\b[^>]*\bdata-img="([^"]+)"[^>]*>/g, (m, id)=>{
    const d = IMAGENS_USUARIO[id];
    if(!d) buscarImagemNuvem(id);
    return `<img data-img="${id}" src="${d || GIF_VAZIO}" alt="figura" ${d?'':'data-pendente="1" '}>`;
  });
}
// antes de salvar: figuras coladas como data: viram registro à parte
function prepararEditorParaSalvar(div){
  if(!div) return;
  div.querySelectorAll('img').forEach(img=>{
    const src = img.getAttribute('src') || '';
    let id = img.getAttribute('data-img');
    if(!id && src.startsWith('data:image/')){
      if(src.length > 650000){ img.remove(); return; }
      id = novoIdImagem(); IMAGENS_USUARIO[id] = src; img.setAttribute('data-img', id);
      salvarImagensUsuario(); enviarImagemNuvem(id);
    }
    if(!id) img.remove();
  });
}

/* ---------- inserir no editor ---------- */
let _ultimoEditavel = null, _ultimoRange = null;
function _editavelDoNo(no){
  const el = no && (no.nodeType===1 ? no : no.parentElement);
  return el && el.closest ? el.closest('.campo-editavel-conteudo[contenteditable="true"]') : null;
}
document.addEventListener('selectionchange', ()=>{
  const sel = window.getSelection && window.getSelection();
  if(!sel || !sel.rangeCount) return;
  const ed = _editavelDoNo(sel.anchorNode);
  if(ed){ _ultimoEditavel = ed; _ultimoRange = sel.getRangeAt(0).cloneRange(); }
});
function inserirFiguraNoEditor(id, dataUrl){
  let ed = (_ultimoEditavel && document.body.contains(_ultimoEditavel)) ? _ultimoEditavel
    : (document.querySelector('[id^="conteudo-r-"][contenteditable="true"]') || document.querySelector('.campo-editavel-conteudo[contenteditable="true"]'));
  if(!ed){ alert('Clique em "✏️ Editar questão" e depois no campo onde quer colocar a figura.'); return; }
  ed.focus();
  const sel = window.getSelection();
  sel.removeAllRanges();
  if(_ultimoRange && ed.contains(_ultimoRange.startContainer)) sel.addRange(_ultimoRange);
  else { const r = document.createRange(); r.selectNodeContents(ed); r.collapse(false); sel.addRange(r); }
  document.execCommand('insertHTML', false, `<img data-img="${id}" src="${dataUrl}" alt="figura">`);
}
async function inserirArquivosDeImagem(files){
  for(const f of files){
    try{ const {id, dataUrl} = await registrarFigura(f); inserirFiguraNoEditor(id, dataUrl); }
    catch(e){ alert('Não consegui inserir a figura: '+(e.message||e)); }
  }
}
document.addEventListener('paste', (ev)=>{
  if(!_editavelDoNo(ev.target)) return;
  const itens = Array.from((ev.clipboardData && ev.clipboardData.items) || []);
  const imgs = itens.filter(i=>i.kind==='file' && i.type.startsWith('image/')).map(i=>i.getAsFile()).filter(Boolean);
  if(!imgs.length) return;
  ev.preventDefault();
  inserirArquivosDeImagem(imgs);
}, true);
document.addEventListener('dragover', (ev)=>{ if(_editavelDoNo(ev.target) && ev.dataTransfer && Array.from(ev.dataTransfer.types||[]).includes('Files')) ev.preventDefault(); });
document.addEventListener('drop', (ev)=>{
  if(!_editavelDoNo(ev.target)) return;
  const imgs = Array.from((ev.dataTransfer && ev.dataTransfer.files) || []).filter(f=>f.type.startsWith('image/'));
  if(!imgs.length) return;
  ev.preventDefault();
  inserirArquivosDeImagem(imgs);
});
document.addEventListener('mousedown', (ev)=>{
  if(ev.target.closest && ev.target.closest('[data-editar-acao="figura"]')) ev.preventDefault(); // não perde o cursor do texto
});
document.addEventListener('click', (ev)=>{
  const b = ev.target.closest && ev.target.closest('[data-editar-acao="figura"]');
  if(!b) return;
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'image/*'; inp.multiple = true;
  inp.onchange = ()=>{ inserirArquivosDeImagem(Array.from(inp.files||[])); };
  inp.click();
});
