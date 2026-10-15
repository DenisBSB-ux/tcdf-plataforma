/* ================= ANÁLISE DE ARMADILHAS DA BANCA =================
   Classifica cada item Certo/Errado pelo tipo de armadilha usada na redação
   e cruza com os erros do usuário (por que errou, não só onde errou).

   Campos da questão (vêm do arquivo importado; ausentes = "não classificada"):
     ap  armadilha principal (GEN SUF DIS JUS INV TRO RES EXT) — só item Errado
     as  armadilha secundária (opcional)
     sc  sinal de item Certo (REL LIT COE ABS-L)
     tr  trecho-chave (palavras exatas do enunciado; várias partes separadas por " | ")
     ex  explicação em uma frase
     ao  origem da classificação: 'gemini' | 'ia' | 'manual'
   Correção manual do usuário: EDICOES_USUARIO[uid].arm = "P+S~SINAL" (origem manual;
   prevalece sobre o arquivo e sincroniza junto com as demais edições). */

const ARM_TIPOS = {
  GEN: { nome:'Generalização', def:'Torna absoluto o que é relativo', sinais:'sempre, nunca, todo, qualquer, exclusivamente', ex:'"Todo ato administrativo é discricionário"', cor:'#c2410c', bg:'#ffedd5', macete:'Desconfie do absoluto: a regra não tem exceção mesmo?' },
  SUF: { nome:'Suficiência falsa', def:'Promove um meio parcial a bastante', sinais:'suficiente, por si só, basta', ex:'"Denúncias informais são suficientes para a fiscalização"', cor:'#a16207', bg:'#fef9c3', macete:'"Basta" raramente basta: falta algum requisito?' },
  DIS: { nome:'Dispensa / exceção inventada', def:'Cria uma exceção ou isenção que não existe', sinais:'afasta, dispensa, independentemente, não se aplica', ex:'"Fica afastada a exigibilidade do dever de accountability"', cor:'#15803d', bg:'#dcfce7', macete:'Quem disse que pode dispensar? Procure a exceção na lei.' },
  JUS: { nome:'Justificativa falsa', def:'Fato verdadeiro ligado a uma conclusão falsa', sinais:'visto que, uma vez que, porque, por força de, de tal modo que', ex:'"...visto que a prestação de contas está vinculada à soberania estatal"', cor:'#0f766e', bg:'#ccfbf1', macete:'Teste o conectivo: a premissa realmente leva à conclusão?' },
  INV: { nome:'Inversão', def:'Troca causa e efeito, ordem ou dependência', sinais:'(sem palavra fixa)', ex:'"O controle social ocorre independentemente da transparência"', cor:'#1d4ed8', bg:'#dbeafe', macete:'Quem depende de quem? Confira a ordem e a causa.' },
  TRO: { nome:'Troca de conceitos', def:'Atribui a um conceito a característica de outro', sinais:'termos vizinhos: eficácia/eficiência, nominal/efetiva', ex:'"Eficiência mede o alcance das metas"', cor:'#6d28d9', bg:'#ede9fe', macete:'Termo vizinho? Confira o conceito, o órgão, o prazo e o número.' },
  RES: { nome:'Restrição indevida', def:'Limita o que é amplo', sinais:'apenas, somente, restrito a, exclusivamente', ex:'"Accountability se aplica apenas ao setor público"', cor:'#be185d', bg:'#fce7f3', macete:'"Apenas/somente": a lei não alcança mais gente ou mais casos?' },
  EXT: { nome:'Extrapolação', def:'Acrescenta algo que a lei ou a teoria não diz', sinais:'detalhe extra, geralmente no fim do item', ex:'"...sob pena de demissão imediata"', cor:'#b91c1c', bg:'#fee2e2', macete:'Olhe o final do item: o detalhe extra está na lei?' },
};
const ARM_ORDEM = ['GEN','SUF','DIS','JUS','INV','TRO','RES','EXT'];
const ARM_SINAIS = {
  'REL':   { nome:'Relativização', por:'"pode", "em regra", "geralmente", "tende a" tornam o item defensável' },
  'LIT':   { nome:'Literalidade', por:'Texto copiado da lei ou da doutrina' },
  'COE':   { nome:'Coerência interna', por:'Premissa, conectivo e conclusão se sustentam do início ao fim' },
  'ABS-L': { nome:'Absoluto legal', por:'A própria lei é absoluta ("compete privativamente", "é vedado")' },
};
const ARM_SINAIS_ORDEM = ['REL','LIT','COE','ABS-L'];

/* ---------- leitura da classificação efetiva ---------- */
function armCodificar(p, s, sinal){ return (p||'') + '+' + (s||'') + '~' + (sinal||''); }
function armDecodificar(str){
  const m = String(str||'').match(/^([A-Z]*)\+([A-Z]*)~([A-Z-]*)$/);
  return m ? { p:m[1], s:m[2], sinal:m[3] } : null;
}
/* chave de busca na base pré-classificada: início + fim do enunciado normalizado (sem acentos/pontuação) */
function armNorm(t){ return String(t||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim(); }
function armChave(txt){
  txt = String(txt||'').replace(/\n?\s*\(\s*\)\s*(Certo|Errado)?\s*$/gim,'').replace(/\s*(Certo\s+Errado|Errado\s+Certo)\s*$/i,'').replace(/^\s*\d+[.)]\s*/,'');
  const n = armNorm(txt); return n.length<=140 ? n : n.slice(0,100)+'~'+n.slice(-40); }
let ARM_IDX = null;
function armIndice(){
  if(ARM_IDX) return ARM_IDX;
  ARM_IDX = { fp:new Map(), uid:new Map() };
  if(typeof ARM_DADOS!=='undefined'){
    (ARM_DADOS.i||[]).forEach(r=>{ // r = [chave, uid|'', pref60, p, s, sinal, trecho, expl]
      ARM_IDX.fp.set(r[0], r); if(r[1]) ARM_IDX.uid.set(r[1], r);
    });
  }
  return ARM_IDX;
}
// aplica (uma vez) a classificação pré-existente do banco à questão, se ela ainda não traz a sua
function armHidratar(q){
  if(q._armH) return; q._armH = true;
  if(q.ap || q.sc || q.ao) return;
  const ix = armIndice();
  let r = ix.fp.get(armChave(q.q));
  if(!r){ const u = ix.uid.get(q.uid); if(u && armNorm(q.q).slice(0,60)===u[2]) r = u; }
  if(!r) return;
  if(r[3]) q.ap = r[3]; if(r[4]) q.as = r[4]; if(r[5]) q.sc = r[5];
  if(r[6]) q.tr = r[6]; if(r[7]) q.ex = r[7];
  q.ao = 'ia';
}
function armEfetiva(q){
  if(!q || q.t!=='CE') return null;
  armHidratar(q);
  const ed = EDICOES_USUARIO[q.uid] && EDICOES_USUARIO[q.uid].arm;
  const man = ed ? armDecodificar(ed) : null;
  const edq = EDICOES_USUARIO[q.uid] || {};
  const exEd = typeof edq.arm_ex === 'string' ? edq.arm_ex : undefined;
  const trEd = typeof edq.arm_tr === 'string' ? edq.arm_tr : undefined;
  const errado = gabaritoEfetivo(q)==='Errado';
  if(man){
    return { p: errado ? man.p : '', s: errado ? man.s : '', sinal: errado ? '' : man.sinal,
             trecho: trEd!==undefined ? trEd : (q.tr||''), expl: exEd!==undefined ? exEd : (q.ex||''), origem:'manual', errado, classificada: !!(errado ? man.p : true) };
  }
  const p = (q.ap||'').toUpperCase(), s = (q.as||'').toUpperCase(), sinal = (q.sc||'').toUpperCase();
  const classificada = errado ? !!p : !!(p||sinal||q.ao);
  return { p, s, sinal, trecho: trEd!==undefined ? trEd : (q.tr||''), expl: exEd!==undefined ? exEd : (q.ex||''), origem: (exEd!==undefined||trEd!==undefined) ? 'manual' : (q.ao||'ia'), errado, classificada };
}
function armCodigos(a){ return a ? [a.p, a.s].filter(c=>c && ARM_TIPOS[c]) : []; }
function armTemClassificacao(q){ const a = armEfetiva(q); return !!(a && a.classificada); }
function materiaTemArmadilhas(materia){
  return ALL_QUESTIONS.some(q => { if(q.materia!==materia || q.duplicataOculta) return false; armHidratar(q); return q.ap || (EDICOES_USUARIO[q.uid] && EDICOES_USUARIO[q.uid].arm); });
}

/* ---------- etiquetas ---------- */
function armChip(cod, grande){
  const t = ARM_TIPOS[cod]; if(!t) return '';
  return `<span class="arm-chip${grande?' arm-chip-g':''}" style="background:${t.bg};color:${t.cor};border-color:${t.cor};" title="${esc(t.nome)} — ${esc(t.def)}">${cod}</span>`;
}
function armChipSinal(cod){
  const t = ARM_SINAIS[cod]; if(!t) return '';
  return `<span class="arm-chip arm-chip-sinal" title="${esc(t.nome)} — ${esc(t.por)}">${cod}</span>`;
}

/* ---------- destaque do trecho-chave dentro do HTML do enunciado ---------- */
const ARM_DESTACADOS = new Set(); // uids cujo trecho foi marcado direto no texto da questão
function armDestacarTrecho(html, trecho, uid){
  if(uid) ARM_DESTACADOS.delete(uid);
  if(!html || !trecho) return html;
  const partes = String(trecho).split(' | ').map(s=>s.trim()).filter(Boolean);
  if(!partes.length) return html;
  const box = document.createElement('div');
  box.innerHTML = html;
  partes.forEach(parte=>{
    const nos = [];
    const walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
    let n; while((n = walker.nextNode())) nos.push(n);
    const texto = nos.map(x=>x.nodeValue).join('');
    const alvo = parte.replace(/\s+/g,' ');
    let ini = texto.indexOf(parte);
    let tam = parte.length;
    if(ini<0){
      // tolera espaços diferentes entre as palavras
      const re = new RegExp(alvo.split(' ').map(w=>w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('\\s+'));
      const m = texto.match(re);
      if(!m) return;
      ini = m.index; tam = m[0].length;
    }
    const fim = ini + tam;
    let pos = 0;
    nos.forEach(no=>{
      const len = no.nodeValue.length;
      const a = Math.max(ini, pos), b = Math.min(fim, pos+len);
      if(a<b){
        const r = document.createRange();
        r.setStart(no, a-pos); r.setEnd(no, b-pos);
        const mk = document.createElement('mark');
        mk.className = 'arm-trecho';
        try{ r.surroundContents(mk); if(uid) ARM_DESTACADOS.add(uid); }catch(e){ /* trecho cruza elementos: ignora */ }
      }
      pos += len;
    });
  });
  return box.innerHTML;
}

/* ---------- bloco mostrado depois de responder ---------- */
function armPainelHtml(q){
  const a = armEfetiva(q);
  if(!a) return '';
  const uid = q.uid;
  const editando = STATE.armEditUid === uid;
  const lapis = `<button class="arm-btn-edit btn-ui" data-arm-edit="${esc(uid)}" title="Editar a classificação, o trecho e a explicação desta armadilha">✏️ Editar</button>`;
  if(editando) return armEditorHtml(q, a);
  const origemTxt = a.origem==='manual' ? 'manual' : (a.origem==='gemini' ? 'Gemini' : 'IA');
  if(!a.classificada){
    return `<div class="arm-box arm-box-vazia"><span class="arm-rot">Armadilha da banca</span> <span class="arm-nc">não classificada</span> ${lapis}</div>`;
  }
  if(a.errado){
    const cods = armCodigos(a);
    const p = ARM_TIPOS[a.p];
    return `<div class="arm-box">
      <div class="arm-linha"><span class="arm-rot">Armadilha da banca</span> ${cods.map(c=>armChip(c,true)).join('<span class="arm-mais">+</span>')} ${lapis}<span class="arm-origem">classificação: ${origemTxt}</span></div>
      ${(a.trecho && !ARM_DESTACADOS.has(uid)) ? `<div class="arm-expl"><b>Trecho:</b> <mark class="arm-trecho">${esc(a.trecho.replace(/ \| /g,' … '))}</mark></div>` : ''}
      ${a.expl ? `<div class="arm-expl">${esc(a.expl)}</div>` : ''}
      ${p ? `<div class="arm-macete">💡 ${esc(p.nome)}: ${esc(p.macete)}</div>` : ''}
    </div>`;
  }
  const s = ARM_SINAIS[a.sinal];
  return `<div class="arm-box arm-box-certo">
    <div class="arm-linha"><span class="arm-rot">Item certo</span> ${s ? armChipSinal(a.sinal)+` <span class="arm-expl-inline">${esc(s.nome)} — ${esc(s.por)}</span>` : '<span class="arm-nc">sem sinal de veracidade registrado</span>'} ${lapis}<span class="arm-origem">classificação: ${origemTxt}</span></div>
    ${a.sinal==='ABS-L' ? `<div class="arm-macete">⚠ Contra-armadilha: a palavra absoluta aqui vem da própria lei — não marque Errado só por vê-la.</div>` : ''}
  </div>`;
}
function armEditorHtml(q, a){
  const uid = q.uid;
  const opts = (sel, vazio) => `<option value="">${vazio}</option>` + ARM_ORDEM.map(c=>`<option value="${c}" ${sel===c?'selected':''}>${c} — ${esc(ARM_TIPOS[c].nome)}</option>`).join('');
  const sinais = `<option value="">— nenhum —</option>` + ARM_SINAIS_ORDEM.map(c=>`<option value="${c}" ${a.sinal===c?'selected':''}>${c} — ${esc(ARM_SINAIS[c].nome)}</option>`).join('');
  return `<div class="arm-box arm-box-edit">
    <div class="arm-linha"><span class="arm-rot">Corrigir classificação</span></div>
    ${a.errado ? `<div class="arm-edit-grid">
        <label>Principal <select id="arm-sel-p">${opts(a.p,'— escolha —')}</select></label>
        <label>Secundária <select id="arm-sel-s">${opts(a.s,'— nenhuma —')}</select></label>
      </div>` : `<div class="arm-edit-grid"><label>Sinal de item certo <select id="arm-sel-sinal">${sinais}</select></label></div>`}
    ${a.errado ? `<label class="arm-edit-txt">Trecho do item (copie exatamente como está no texto da questão)<textarea id="arm-txt-tr" rows="2">${esc(a.trecho||'')}</textarea></label>
    <label class="arm-edit-txt">Explicação da armadilha<textarea id="arm-txt-ex" rows="3">${esc(a.expl||'')}</textarea></label>` : ''}
    <div class="arm-edit-acoes">
      <button class="btn-ui btn-ui-salvar" data-arm-save="${esc(uid)}">💾 Salvar (origem: manual)</button>
      <button class="btn-ui" data-arm-cancel="1">Cancelar</button>
      ${a.origem==='manual' ? `<button class="btn-ui" data-arm-reset="${esc(uid)}">↺ Voltar à original</button>` : ''}
    </div>
  </div>`;
}
document.addEventListener('click', (ev)=>{
  const t = ev.target.closest && ev.target.closest('[data-arm-edit],[data-arm-save],[data-arm-cancel],[data-arm-reset]');
  if(!t) return;
  if(t.dataset.armEdit){ STATE.armEditUid = t.dataset.armEdit; render(); return; }
  if(t.dataset.armCancel){ STATE.armEditUid = null; render(); return; }
  const uid = t.dataset.armSave || t.dataset.armReset;
  const q = BY_UID[uid]; if(!q) return;
  if(t.dataset.armReset){
    if(EDICOES_USUARIO[uid]){ delete EDICOES_USUARIO[uid].arm; delete EDICOES_USUARIO[uid].arm_ex; delete EDICOES_USUARIO[uid].arm_tr; if(!Object.keys(EDICOES_USUARIO[uid]).length) delete EDICOES_USUARIO[uid]; }
  } else {
    const g = id => { const el = document.getElementById(id); return el ? el.value : ''; };
    const errado = gabaritoEfetivo(q)==='Errado';
    let p = g('arm-sel-p'), s = g('arm-sel-s'), sinal = g('arm-sel-sinal');
    if(errado && !p){ alert('Todo item Errado precisa de pelo menos uma armadilha principal.'); return; }
    if(s===p) s = '';
    if(!EDICOES_USUARIO[uid]) EDICOES_USUARIO[uid] = {};
    EDICOES_USUARIO[uid].arm = armCodificar(errado?p:'', errado?s:'', errado?'':sinal);
    if(errado){
      const orig = { tr: q.tr||'', ex: q.ex||'' };
      const tr = g('arm-txt-tr').trim(), ex = g('arm-txt-ex').trim();
      if(tr !== orig.tr) EDICOES_USUARIO[uid].arm_tr = tr; else delete EDICOES_USUARIO[uid].arm_tr;
      if(ex !== orig.ex) EDICOES_USUARIO[uid].arm_ex = ex; else delete EDICOES_USUARIO[uid].arm_ex;
    }
  }
  salvarEdicoesUsuario();
  marcarProgressoSujo(q.materia); pushToCloud();
  STATE.armEditUid = null;
  render();
});

/* ---------- flashcards: verso com armadilha, trecho e macete ---------- */
function armFlashHtml(q){
  const a = armEfetiva(q);
  if(!a || !a.classificada || !a.errado) return '';
  const cods = armCodigos(a);
  const p = ARM_TIPOS[a.p];
  return `<div class="arm-flash">
    <div>${cods.map(c=>armChip(c,true)).join('<span class="arm-mais">+</span>')} ${p ? `<b>${esc(p.nome)}</b>` : ''}</div>
    ${a.trecho ? `<div><b>Trecho:</b> <mark class="arm-trecho">${esc(a.trecho.replace(/ \| /g,' … '))}</mark></div>` : ''}
    ${p ? `<div>💡 ${esc(p.macete)}</div>` : ''}
  </div>`;
}

/* ================= ESTATÍSTICAS ================= */
function armCorTaxa(pct){
  if(pct > 40) return { bg:'#fee2e2', fg:'#8f2a22', barra:'#dc2626', nome:'vermelho' };
  if(pct >= 20) return { bg:'#fef3c7', fg:'#6f4b0a', barra:'#d97706', nome:'amarelo' };
  return { bg:'#dcfce7', fg:'#166534', barra:'#16a34a', nome:'verde' };
}
function armSemana(ts){
  const d = new Date(ts); d.setHours(0,0,0,0);
  d.setDate(d.getDate() - ((d.getDay()+6)%7)); // segunda-feira
  return d.getTime();
}
// escopo: nome da matéria, ou null para todas
function armCalcular(escopo){
  const tipos = {}; ARM_ORDEM.forEach(c => tipos[c] = { cod:c, itens:0, resp:0, quedas:0, tempos:[] });
  const semanas = {};   // { cod: { semana: {n, q} } }
  const mapa = {};      // { cod: { assunto: {n, q} } }
  const assuntoN = {};
  const desc = { resp:0, quedas:0 };
  let totalCE = 0, classificadas = 0;
  ALL_QUESTIONS.forEach(q=>{
    if(q.duplicataOculta || q.t!=='CE') return;
    if(escopo && q.materia!==escopo) return;
    totalCE++;
    const a = armEfetiva(q);
    if(!a || !a.classificada) return;
    classificadas++;
    const bucket = PROGRESS[q.materia];
    const p = bucket && bucket.perguntas && bucket.perguntas[q.uid];
    const respondida = !!(p && p.tentativas>0);
    const caiu = respondida && p.ultimoResultado===false;
    if(a.errado){
      armCodigos(a).forEach(c=>{
        const T = tipos[c]; T.itens++;
        if(respondida){ T.resp++; if(caiu) T.quedas++; }
        (p && p.historico || []).forEach(h=>{
          if(h && typeof h.t==='number') T.tempos.push(h.t);
          if(h && h.ts){
            const sm = armSemana(h.ts);
            semanas[c] = semanas[c] || {};
            const w = semanas[c][sm] = semanas[c][sm] || { n:0, q:0 };
            w.n++; if(h.c===false) w.q++;
          }
        });
        if(respondida){
          const as = q.tema || 'Geral';
          mapa[c] = mapa[c] || {};
          const cel = mapa[c][as] = mapa[c][as] || { n:0, q:0 };
          cel.n++; if(caiu) cel.q++;
          assuntoN[as] = (assuntoN[as]||0)+1;
        }
      });
    } else if((a.sinal==='ABS-L' || a.sinal==='REL') && respondida){
      desc.resp++; if(caiu) desc.quedas++;
    }
  });
  const lista = ARM_ORDEM.map(c=>{
    const T = tipos[c];
    const taxa = T.resp ? (T.quedas*100/T.resp) : null;
    const tempo = T.tempos.length ? T.tempos.reduce((s,x)=>s+x,0)/T.tempos.length : null;
    return { ...T, taxa, tempo };
  });
  const elegiveis = lista.filter(x=>x.resp>=5).sort((a,b)=>b.taxa-a.taxa);
  return { lista, perigosa: elegiveis[0]||null, desc, totalCE, classificadas, semanas, mapa, assuntoN };
}

/* ================= TELAS ================= */
function armBarra(pct, cor){ return `<div class="arm-barra"><div style="width:${Math.max(2,Math.min(100,pct))}%;background:${cor};"></div></div>`; }
function armLinhasEvolucao(S){
  const todas = new Set(); ARM_ORDEM.forEach(c=>Object.keys(S.semanas[c]||{}).forEach(k=>todas.add(+k)));
  const sem = Array.from(todas).sort((a,b)=>a-b);
  if(sem.length<2) return `<div class="arm-vazio">A evolução aparece quando houver respostas em pelo menos 2 semanas diferentes.</div>`;
  const W=640,H=200,pl=34,pb=22,pt=10,pr=10;
  const x = i => pl + (sem.length===1?0:(i*(W-pl-pr)/(sem.length-1)));
  const y = v => pt + (100-v)*(H-pt-pb)/100;
  let svg = `<svg viewBox="0 0 ${W} ${H}" class="arm-svg" role="img" aria-label="Evolução da taxa de queda por armadilha">`;
  [0,20,40,60,80,100].forEach(v=>{ svg += `<line x1="${pl}" x2="${W-pr}" y1="${y(v)}" y2="${y(v)}" stroke="currentColor" opacity=".12"/><text x="${pl-4}" y="${y(v)+3}" font-size="9" text-anchor="end" fill="currentColor" opacity=".6">${v}%</text>`; });
  sem.forEach((s,i)=>{ if(sem.length<=8 || i%Math.ceil(sem.length/8)===0) svg += `<text x="${x(i)}" y="${H-6}" font-size="9" text-anchor="middle" fill="currentColor" opacity=".6">${new Date(s).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})}</text>`; });
  ARM_ORDEM.forEach(c=>{
    const pts = sem.map((s,i)=>{ const w=(S.semanas[c]||{})[s]; return w && w.n ? [x(i), y(w.q*100/w.n)] : null; }).filter(Boolean);
    if(!pts.length) return;
    const cor = ARM_TIPOS[c].cor;
    svg += `<polyline fill="none" stroke="${cor}" stroke-width="2" points="${pts.map(p=>p.join(',')).join(' ')}"/>` + pts.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="3" fill="${cor}"/>`).join('');
  });
  svg += `</svg><div class="arm-legenda">${ARM_ORDEM.map(c=>`<span><i style="background:${ARM_TIPOS[c].cor}"></i>${c}</span>`).join('')}</div>`;
  return svg;
}
function armMapaCalor(S){
  const assuntos = Object.keys(S.assuntoN).sort((a,b)=>S.assuntoN[b]-S.assuntoN[a]).slice(0,12);
  const cods = ARM_ORDEM.filter(c=>S.mapa[c]);
  if(!assuntos.length || !cods.length) return `<div class="arm-vazio">O mapa aparece depois que você responder itens classificados.</div>`;
  return `<div class="arm-mapa-wrap"><table class="arm-mapa"><thead><tr><th></th>${assuntos.map(a=>`<th title="${esc(a)}">${esc(a.length>22?a.slice(0,21)+'…':a)}</th>`).join('')}</tr></thead><tbody>
    ${cods.map(c=>`<tr><th>${armChip(c)}</th>${assuntos.map(a=>{
      const cel = (S.mapa[c]||{})[a];
      if(!cel) return '<td class="arm-cel-vazia">·</td>';
      const pct = Math.round(cel.q*100/cel.n), cor = armCorTaxa(pct);
      return `<td style="background:${cor.bg};color:${cor.fg};" title="${cel.q} erros em ${cel.n} respondidos">${pct}%<small>${cel.n}</small></td>`;
    }).join('')}</tr>`).join('')}
  </tbody></table></div>`;
}
function renderArmadilhas(){
  const escopoTodas = !!STATE.armEscopoTodas;
  const escopo = escopoTodas ? null : STATE.materia;
  const S = armCalcular(escopo);
  const cob = S.totalCE ? Math.round(S.classificadas*100/S.totalCE) : 0;
  const per = S.perigosa;
  const corPer = per ? armCorTaxa(per.taxa) : null;
  const dpct = S.desc.resp ? Math.round(S.desc.quedas*100/S.desc.resp) : null;
  const corDesc = dpct!==null ? armCorTaxa(dpct) : null;
  const linhaBarra = (x)=>{
    if(x.resp<5){
      return `<div class="arm-row arm-row-fraca"><div class="arm-row-cod">${armChip(x.cod)}<span>${esc(ARM_TIPOS[x.cod].nome)}</span></div>
        <div class="arm-row-info">${x.itens ? `amostra insuficiente: ${x.resp} de 5 itens respondidos (${x.itens} no banco)` : 'sem itens deste tipo no banco'}</div></div>`;
    }
    const cor = armCorTaxa(x.taxa);
    return `<div class="arm-row"><div class="arm-row-cod">${armChip(x.cod)}<span>${esc(ARM_TIPOS[x.cod].nome)}</span></div>
      <div class="arm-row-taxa">${armBarra(x.taxa, cor.barra)}<b style="color:${cor.fg};background:${cor.bg};">${Math.round(x.taxa)}%</b><small>${x.quedas}/${x.resp}</small></div>
      <div class="arm-row-tempo">${x.tempo!==null ? armBarra(Math.min(100, x.tempo*100/120), '#64748b')+`<small>${Math.round(x.tempo)}s</small>` : '<small>sem tempo</small>'}</div></div>`;
  };
  const ordenadas = S.lista.filter(x=>x.resp>=5).sort((a,b)=>b.taxa-a.taxa).concat(S.lista.filter(x=>x.resp<5));
  const barrasOrd = ordenadas.map(linhaBarra).join('');
  return `<div class="arm-tela">
    <div class="arm-cab">
      <div><h3>🎯 Análise de armadilhas da banca</h3>
      <div class="arm-sub">${S.classificadas} de ${S.totalCE} itens Certo/Errado classificados (${cob}%) · ${escopoTodas ? 'todas as matérias' : esc(STATE.materia||'')}</div></div>
      <div class="arm-escopo"><button class="tab-btn ${!escopoTodas?'active':''}" data-arm-escopo="mat">Esta matéria</button><button class="tab-btn ${escopoTodas?'active':''}" data-arm-escopo="todas">Todas</button></div>
    </div>
    ${!S.classificadas ? `<div class="arm-vazio">Nenhum item classificado neste escopo. Importe o arquivo com os campos <b>Armadilha / Trecho / Explicação</b> (ver "Guia de armadilhas"). Questões antigas continuam funcionando e aparecem como "não classificada".</div>` : `
    <div class="arm-cards">
      <div class="arm-card" style="${per?`background:${corPer.bg};color:${corPer.fg};`:''}">
        <div class="arm-card-rot">Armadilha mais perigosa</div>
        ${per ? `<div class="arm-card-val">${armChip(per.cod,true)} ${Math.round(per.taxa)}%</div><div class="arm-card-sub">${esc(ARM_TIPOS[per.cod].nome)} · caiu em ${per.quedas} de ${per.resp} itens</div>
          <button class="btn btn-gold btn-sm" id="btn-treino-arm" data-arm-treino="${per.cod}">🏋 Treinar ${per.cod} agora</button>`
        : `<div class="arm-card-sub">Precisa de pelo menos 5 itens respondidos do mesmo tipo.</div>`}
      </div>
      <div class="arm-card" style="${corDesc?`background:${corDesc.bg};color:${corDesc.fg};`:''}">
        <div class="arm-card-rot">Excesso de desconfiança</div>
        ${dpct!==null ? `<div class="arm-card-val">${dpct}%</div><div class="arm-card-sub">${S.desc.quedas} de ${S.desc.resp} itens CERTOS com sinal ABS-L ou REL que você marcou Errado${S.desc.resp<5?' (amostra pequena)':''}</div>`
        : `<div class="arm-card-sub">Sem itens certos com ABS-L/REL respondidos ainda.</div>`}
      </div>
    </div>
    <div class="arm-bloco"><h4>Taxa de queda por armadilha <small>· quantos itens errados daquele tipo você marcou como certos (mín. 5 itens) · à direita: tempo médio</small></h4>
      <div class="arm-leg-cores"><span style="background:#fee2e2;color:#8f2a22;">acima de 40%</span><span style="background:#fef3c7;color:#6f4b0a;">20% a 40%</span><span style="background:#dcfce7;color:#166534;">abaixo de 20%</span></div>
      ${barrasOrd}
    </div>
    <div class="arm-bloco"><h4>Evolução por semana</h4>${armLinhasEvolucao(S)}</div>
    <div class="arm-bloco"><h4>Armadilha × assunto <small>· taxa de queda (número pequeno = itens respondidos)</small></h4>${armMapaCalor(S)}</div>`}
  </div>`;
}
document.addEventListener('click', (ev)=>{
  const e = ev.target.closest && ev.target.closest('[data-arm-escopo]');
  if(e){ STATE.armEscopoTodas = e.dataset.armEscopo==='todas'; render(); return; }
  const t = ev.target.closest && ev.target.closest('[data-arm-treino]');
  if(t) armIniciarTreino(t.dataset.armTreino);
});
// modo treino: sessão só com itens (Errados) da armadilha escolhida, na matéria atual
function armIniciarTreino(cod){
  const uids = ALL_QUESTIONS.filter(q => q.materia===STATE.materia && !q.duplicataOculta && q.t==='CE' && gabaritoEfetivo(q)==='Errado' && armCodigos(armEfetiva(q)).includes(cod)).map(q=>q.uid);
  if(!uids.length){ alert('Esta matéria não tem itens classificados com '+cod+'. Troque de matéria para treinar essa armadilha.'); return; }
  setLocalTab(STATE.materia, 'simulado');
  startQuiz(uids, { subconjunto:true, rotulo:cod }); // subconjunto: a fila não é completada com o resto da matéria
}

/* ---------- filtro por armadilha (seleção múltipla) ---------- */
function armChipsFiltroHtml(base, setup){
  const cont = {}; ARM_ORDEM.forEach(c=>cont[c]=0);
  base.forEach(q=>{ const a = armEfetiva(q); if(a && a.classificada && a.errado) armCodigos(a).forEach(c=>cont[c]++); });
  const sel = setup.armSel || new Set();
  const chips = ARM_ORDEM.filter(c=>cont[c]).map(c=>`<span class="chip ${sel.has(c)?'selected':''}" data-arm-filtro="${c}" title="${esc(ARM_TIPOS[c].nome)}">${c} (${cont[c]})</span>`).join('');
  if(!chips) return '';
  return `<div class="setup-mini-field"><label title="Seleção múltipla. Sem nenhuma marcada, entram todas as questões. Marcar uma armadilha mostra só itens ERRADOS daquele tipo (entrega o gabarito — use para treino).">Armadilha da banca</label>
    <div class="chip-row" id="chip-armadilha">${chips}</div></div>`;
}
function armPassaFiltro(q, setup){
  if(!setup.armSel || !setup.armSel.size) return true;
  const a = armEfetiva(q);
  return !!(a && a.classificada && a.errado && armCodigos(a).some(c=>setup.armSel.has(c)));
}
document.addEventListener('click', (ev)=>{
  const t = ev.target.closest && ev.target.closest('[data-arm-filtro]');
  if(!t) return;
  const setup = getSetup(STATE.materia);
  if(!setup.armSel) setup.armSel = new Set();
  const c = t.dataset.armFiltro;
  setup.armSel.has(c) ? setup.armSel.delete(c) : setup.armSel.add(c);
  render();
});

/* ================= GUIA (resumo a cores) ================= */
function renderGuiaArmadilhas(){
  const cartoes = ARM_ORDEM.map(c=>{
    const t = ARM_TIPOS[c];
    return `<div class="guia-card" style="border-color:${t.cor};background:${t.bg};color:#1f2937;">
      <div class="guia-card-topo" style="background:${t.cor};"><b>${c}</b> ${esc(t.nome)}</div>
      <div class="guia-card-corpo">
        <div><b style="color:${t.cor};">O que faz:</b> ${esc(t.def)}</div>
        <div><b style="color:${t.cor};">Palavras-sinal:</b> ${esc(t.sinais)}</div>
        <div class="guia-ex">${esc(t.ex)}</div>
        <div class="guia-mac">💡 ${esc(t.macete)}</div>
      </div></div>`;
  }).join('');
  const sinais = ARM_SINAIS_ORDEM.map(c=>`<div class="guia-sinal"><span class="arm-chip arm-chip-sinal">${c}</span> <b>${esc(ARM_SINAIS[c].nome)}</b> — ${esc(ARM_SINAIS[c].por)}</div>`).join('');
  const passos = ['Divida o item em <b>premissa</b>, <b>conectivo</b> e <b>conclusão</b>.','Marque as palavras <b>absolutas</b>, <b>restritivas</b> e os <b>conectivos causais</b>.','Teste a <b>premissa</b>: ela é verdadeira?','Teste o <b>conectivo</b>: a premissa realmente leva à conclusão?','<b>Classifique</b> pelo tipo de armadilha. Nenhuma encontrada → o item tende a estar <b>certo</b>.'];
  const m = (i)=>`<b style="color:${ARM_TIPOS[ARM_ORDEM[i]].cor};">${ARM_ORDEM[i]}</b>`;
  return `<div class="guia-tela">
    <h3>📘 Guia de armadilhas da banca</h3>
    <div class="guia-grid">${cartoes}</div>
    <div class="guia-faixa"><b>Combinações:</b> a banca empilha armadilhas — cada questão aceita um tipo principal e, opcionalmente, um secundário (ex.: DIS + JUS, SUF + INV).</div>
    <h4>Sinais de item certo</h4>
    <div class="guia-sinais">${sinais}</div>
    <div class="guia-alerta">⚠ Pegadinha: <b>ABS-L</b> existe para você não marcar ERRADO só por ver uma palavra absoluta. Sinal é alerta para ler com atenção, nunca resposta automática. Palavra-sinal sozinha não classifica: o tipo só vale se o trecho realmente falseia o item.</div>
    <h4>Método de 5 passos</h4>
    <ol class="guia-passos">${passos.map(p=>`<li>${p}</li>`).join('')}</ol>
    <div class="guia-macete"><b>Macete:</b> ${m(0)}te ${m(1)}oca, ${m(2)}cute ${m(3)}tiça: ${m(4)}erte, ${m(5)}ca, ${m(6)}tringe, ${m(7)}trapola.
      <div class="guia-macete-sub">GEN-SUF-DIS-JUS · INV-TRO-RES-EXT</div></div>
    <div class="guia-conclusao">🟣 <b>Conclusão:</b> saber por que errou vale mais que saber em qual assunto errou. Na Análise de Armadilhas veja qual tipo mais derruba você e treine só ele.</div>
  </div>`;
}
