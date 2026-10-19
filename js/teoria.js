/* ================= TEORIA (PDF) NA NUVEM — Firebase Storage =================
   Cada conta guarda seus PDFs em  teoria/{uid}/{matéria}/{carimbo}-{nome}.pdf
   (regras em storage.rules: só o dono lê e grava). Sem login ou sem o Storage
   ativado no projeto, a aba explica o que falta em vez de falhar em silêncio. */
const TEORIA_MAX_MB = 50;
const TEORIA = { lista:{}, carregando:false, msg:null, progresso:null };

function teoriaPasta(materia){
  return `teoria/${USUARIO_ATUAL.uid}/${slugify(materia)}`;
}
function teoriaFormatarTamanho(b){
  if(b >= 1048576) return (b/1048576).toFixed(1).replace('.',',') + ' MB';
  return Math.max(1, Math.round(b/1024)) + ' KB';
}
function teoriaMensagemDeErro(e){
  const c = (e && e.code) || '';
  if(c==='storage/unauthorized') return 'Sem permissão: publique o arquivo storage.rules no Firebase (Storage → Regras) e entre com a sua conta Google.';
  if(c==='storage/bucket-not-found' || c==='storage/project-not-found' || c==='storage/unknown') return 'O Firebase Storage ainda não está ativado neste projeto. Ative em Firebase Console → Storage (exige o plano Blaze) e publique o storage.rules.';
  if(c==='storage/quota-exceeded') return 'A cota do Storage acabou.';
  if(c==='storage/canceled') return 'Envio cancelado.';
  return 'Erro: ' + ((e && e.message) || c || 'desconhecido');
}
function teoriaDisponivel(){
  if(!FIREBASE_OK || typeof fbStorage==='undefined' || !fbStorage) return 'O Firebase Storage não está disponível nesta sessão (sem conexão ou biblioteca não carregada).';
  if(!USUARIO_ATUAL) return 'Entre com Google (barra lateral) para guardar PDFs na nuvem.';
  return '';
}
async function teoriaCarregar(materia, manterMsg){
  if(teoriaDisponivel()) return;
  TEORIA.carregando = true; if(!manterMsg) TEORIA.msg = null; render();
  try{
    const res = await fbStorage.ref(teoriaPasta(materia)).listAll();
    const itens = await Promise.all(res.items.map(async it=>{
      const m = await it.getMetadata();
      return { caminho: it.fullPath, nome: (m.customMetadata && m.customMetadata.nomeOriginal) || it.name, bytes: m.size, quando: m.updated || m.timeCreated };
    }));
    itens.sort((a,b)=> String(b.quando).localeCompare(String(a.quando)));
    TEORIA.lista[materia] = itens;
  }catch(e){ TEORIA.msg = { tipo:'err', txt: teoriaMensagemDeErro(e) }; TEORIA.lista[materia] = TEORIA.lista[materia] || []; }
  TEORIA.carregando = false; render();
}
function teoriaEnviar(materia, arquivos){
  const erro = teoriaDisponivel(); if(erro){ TEORIA.msg = { tipo:'err', txt:erro }; render(); return; }
  const fila = Array.from(arquivos||[]);
  const invalidos = fila.filter(f=> !/\.pdf$/i.test(f.name) || f.size > TEORIA_MAX_MB*1048576);
  if(invalidos.length){ TEORIA.msg = { tipo:'err', txt:`Só PDFs de até ${TEORIA_MAX_MB} MB: ${invalidos.map(f=>f.name).join(', ')}` }; render(); if(invalidos.length===fila.length) return; }
  const validos = fila.filter(f=> !invalidos.includes(f));
  (async()=>{
    for(let i=0;i<validos.length;i++){
      const f = validos[i];
      const nomeSeguro = f.name.replace(/[^\w.\-]+/g,'_');
      const ref = fbStorage.ref(`${teoriaPasta(materia)}/${Date.now()}-${nomeSeguro}`);
      try{
        await new Promise((ok,falha)=>{
          const tarefa = ref.put(f, { contentType:'application/pdf', customMetadata:{ nomeOriginal:f.name, materia } });
          tarefa.on('state_changed', s=>{
            TEORIA.progresso = { nome:f.name, pct: Math.round(100*s.bytesTransferred/(s.totalBytes||1)), n:i+1, de:validos.length };
            const el = document.getElementById('teoria-progresso'); if(el) el.textContent = `Enviando ${TEORIA.progresso.n} de ${TEORIA.progresso.de}: ${f.name} (${TEORIA.progresso.pct}%)`;
          }, falha, ok);
        });
      }catch(e){ TEORIA.msg = { tipo:'err', txt: teoriaMensagemDeErro(e) }; TEORIA.progresso = null; render(); return; }
    }
    TEORIA.progresso = null; TEORIA.msg = { tipo:'ok', txt: validos.length>1 ? `${validos.length} PDFs enviados.` : 'PDF enviado.' };
    teoriaCarregar(materia, true);
  })();
}
async function teoriaAbrir(caminho){
  try{ const url = await fbStorage.ref(caminho).getDownloadURL(); window.open(url, '_blank', 'noopener'); }
  catch(e){ TEORIA.msg = { tipo:'err', txt: teoriaMensagemDeErro(e) }; render(); }
}
async function teoriaRemover(materia, caminho){
  const it = (TEORIA.lista[materia]||[]).find(x=>x.caminho===caminho);
  if(!confirm(`Remover "${it ? it.nome : 'este PDF'}" da nuvem? Não dá para desfazer.`)) return;
  try{ await fbStorage.ref(caminho).delete(); TEORIA.msg = { tipo:'ok', txt:'PDF removido.' }; }
  catch(e){ TEORIA.msg = { tipo:'err', txt: teoriaMensagemDeErro(e) }; }
  teoriaCarregar(materia, true);
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
async function teoriaVerDaQuestao(uid){
  const q = BY_UID[uid]; const t = teoriaPaginaDaQuestao(q); if(!t) return;
  const erro = teoriaDisponivel();
  if(erro){ alert(erro); return; }
  try{
    const res = await fbStorage.ref(teoriaPasta(q.materia)).listAll();
    if(!res.items.length){ alert('Nenhum PDF de teoria enviado para esta matéria. Envie na aba 06 Teoria (PDF).'); return; }
    const metas = await Promise.all(res.items.map(async it=>({ it, nome: ((await it.getMetadata()).customMetadata||{}).nomeOriginal || it.name })));
    const alvo = (metas.find(m=> new RegExp(t.pdf||'', 'i').test(m.nome)) || metas[0]).it;
    const url = await alvo.getDownloadURL();
    window.open(url + '#page=' + t.pagina, '_blank', 'noopener');
  }catch(e){ alert(teoriaMensagemDeErro(e)); }
}

function renderTeoria(){
  const materia = STATE.materia;
  const indisponivel = teoriaDisponivel();
  const lista = TEORIA.lista[materia];
  // primeira visita à aba: busca a lista na nuvem
  if(!indisponivel && lista===undefined && !TEORIA.carregando) setTimeout(()=>teoriaCarregar(materia), 0);
  const msg = TEORIA.msg ? `<div class="teoria-msg ${TEORIA.msg.tipo}">${esc(TEORIA.msg.txt)}</div>` : '';
  const linhas = (lista||[]).map(it=>`
    <div class="teoria-linha">
      <span class="teoria-ico">📄</span>
      <button type="button" class="teoria-nome" data-teoria-abrir="${esc(it.caminho)}" title="Abrir em outra aba">${esc(it.nome)}</button>
      <span class="teoria-meta">${teoriaFormatarTamanho(it.bytes)} · ${new Date(it.quando).toLocaleDateString('pt-BR')}</span>
      <button type="button" class="btn-ui teoria-rem" data-teoria-remover="${esc(it.caminho)}" title="Remover da nuvem">Remover</button>
    </div>`).join('');
  return `<div class="teoria-wrap">
    <div class="section-eyebrow">${esc(materia||'')}</div>
    <h2 class="section-title">Teoria (PDF)</h2>
    <p class="teoria-sub">Guarde na nuvem os PDFs de teoria desta matéria. Só você os vê, em qualquer aparelho em que entrar com Google. Limite de ${TEORIA_MAX_MB} MB por arquivo.</p>
    ${indisponivel ? `<div class="teoria-msg err">${esc(indisponivel)}</div>` : `
      <div class="teoria-acoes">
        <label class="btn btn-gold btn-sm teoria-up">⬆ Enviar PDF<input type="file" id="teoria-arquivo" accept="application/pdf,.pdf" multiple hidden></label>
        <span id="teoria-progresso" class="teoria-prog">${TEORIA.progresso ? `Enviando ${TEORIA.progresso.n} de ${TEORIA.progresso.de}: ${esc(TEORIA.progresso.nome)} (${TEORIA.progresso.pct}%)` : ''}</span>
      </div>`}
    ${msg}
    ${TEORIA.carregando ? '<div class="teoria-vazio">Carregando…</div>' : (linhas || (indisponivel ? '' : '<div class="teoria-vazio">Nenhum PDF enviado para esta matéria ainda.</div>'))}
  </div>`;
}

document.addEventListener('click', (ev)=>{
  const v = ev.target.closest && ev.target.closest('[data-teoria-ver]');
  if(v){ teoriaVerDaQuestao(v.dataset.teoriaVer); return; }
  const a = ev.target.closest && ev.target.closest('[data-teoria-abrir]');
  if(a){ teoriaAbrir(a.dataset.teoriaAbrir); return; }
  const r = ev.target.closest && ev.target.closest('[data-teoria-remover]');
  if(r){ teoriaRemover(STATE.materia, r.dataset.teoriaRemover); }
});
document.addEventListener('change', (ev)=>{
  if(ev.target && ev.target.id==='teoria-arquivo'){ teoriaEnviar(STATE.materia, ev.target.files); ev.target.value=''; }
});
