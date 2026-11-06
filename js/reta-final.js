/* ============ RETA FINAL ============
   Aba única de revisão de reta final: Hoje (plano do dia), Caderno de erros (por causa e nível), Cartões de lacuna
   (repetição espaçada comprimida até a prova), Prontidão (mapa por assunto) e Cola de véspera (folha para imprimir).
   Usa só dados que já existem: histórico de respostas (perguntas), chutes, classificação de armadilha, teoria em figura
   e resolução em figura. A agenda dos cartões fica em bucket.srs[uid] (sincroniza entre aparelhos; ver mergeBucket). */

/* ---------- lógica pura (testada em tests/geral.test.js) ---------- */

// fase da reta final conforme os dias que faltam para a prova
function retaFaseDeDias(d){
  if(d < 0) return { id:'pos', nome:'Depois da prova' };
  if(d === 0) return { id:'dia', nome:'Dia da prova' };
  if(d <= 2) return { id:'leve', nome:'D-2 e D-1 · Leve' };
  if(d <= 7) return { id:'fixar', nome:'D-7 a D-3 · Fixar' };
  return { id:'cobrir', nome:'D-16 a D-8 · Cobrir lacunas' };
}

// nível do erro, pelo histórico: 0 Novo (errou na última), 1 Aprendendo, 2 Quase, 3 Dominado (3 acertos espaçados ≥ 20 h)
function retaNivelErro(p){
  if(!p) return null;
  const h = Array.isArray(p.historico) ? p.historico : [];
  const erros = h.filter(x => x && x.c === false).length;
  if(!erros && p.ultimoResultado !== false) return null;                 // nunca errou: não é erro
  const ultimo = h.length ? h[h.length-1].c : p.ultimoResultado;
  if(ultimo === false || ultimo === null || ultimo === undefined) return { nivel:0, reinc:erros, ultimoTs: h.length ? (h[h.length-1].ts||0) : 0 };
  let acertos = 0, ref = null;
  for(let i = h.length-1; i >= 0; i--){
    if(!h[i] || h[i].c !== true) break;
    if(ref === null || (ref - (h[i].ts||0)) >= 20*3600e3){ acertos++; ref = h[i].ts||0; }
  }
  return { nivel: Math.max(1, Math.min(3, acertos)), reinc:erros, ultimoTs: h.length ? (h[h.length-1].ts||0) : 0 };
}

// agenda de um cartão (SM-2 simplificado). nota: 1 errei, 2 difícil, 3 bom, 4 fácil. dias = dias até a prova.
// O intervalo nunca passa de 1/3 do tempo que falta: com 16 dias, nenhum cartão fica mais de 5 dias sem voltar.
function retaAgenda(st, nota, agora, dias){
  st = st || { i:0, e:2.3, r:0, l:0 };
  let i = st.i||0, e = st.e||2.3, r = st.r||0, l = st.l||0, minutos = 0;
  const teto = dias > 0 ? Math.max(1, Math.floor(dias/3)) : 30;
  if(nota === 1){ l++; r = 0; e = Math.max(1.3, e-0.2); i = 0; minutos = 10; }                    // volta ainda hoje
  else if(nota === 2){ e = Math.max(1.3, e-0.15); i = r === 0 ? 1 : Math.max(1, i*1.2); r++; }
  else if(nota === 3){ i = r === 0 ? 1 : (r === 1 ? 2 : Math.max(2, i*e)); r++; }
  else { e = Math.min(2.8, e+0.1); i = r === 0 ? 3 : (r === 1 ? 5 : Math.max(3, i*e*1.3)); r++; }
  if(i > teto) i = teto;
  i = Math.round(i*10)/10;
  const d = minutos ? agora + minutos*60000 : agora + i*86400000;
  return { i, e:Math.round(e*100)/100, r, l, d, t:agora };
}
function retaRotuloIntervalo(st, nota, agora, dias){
  const n = retaAgenda(st, nota, agora, dias);
  if(nota === 1) return 'volta hoje';
  const d = Math.max(1, Math.round(n.i));
  return d === 1 ? 'amanhã' : 'em ' + d + ' dias';
}

// partes de um texto com marcas {i|palavra}: [{t:'texto'},{l:'palavra'}]
function retaPartesDeRegra(txt){
  const partes = []; let i = 0; const re = /\{(\d)\|([^}]+)\}/g; let m;
  txt = String(txt||'');
  while((m = re.exec(txt))){ if(m.index > i) partes.push({ t:txt.slice(i, m.index) }); partes.push({ l:m[2] }); i = m.index + m[0].length; }
  if(i < txt.length) partes.push({ t:txt.slice(i) });
  return partes;
}
// partes de um texto com lacunas nas palavras-chave (as que aparecem no texto, sem sobreposição, até 5)
function retaPartesComChaves(txt, chaves){
  txt = String(txt||''); const marcas = [];
  (chaves||[]).slice(0, 5).forEach(k => {
    if(!k || k.length < 3) return;
    const pos = txt.toLowerCase().indexOf(String(k).toLowerCase());
    if(pos < 0 || marcas.some(m => pos < m.fim && pos + k.length > m.ini)) return;
    marcas.push({ ini:pos, fim:pos + k.length });
  });
  marcas.sort((a,b) => a.ini - b.ini);
  const partes = []; let cur = 0;
  marcas.forEach(m => { if(m.ini > cur) partes.push({ t:txt.slice(cur, m.ini) }); partes.push({ l:txt.slice(m.ini, m.fim) }); cur = m.fim; });
  if(cur < txt.length) partes.push({ t:txt.slice(cur) });
  return partes;
}

/* ---------- dados da plataforma ---------- */
function retaHoje0(){ const d = new Date(); d.setHours(0,0,0,0); return d.getTime(); }
function retaDias(){ const p = new Date(PROVA_TCDF.data); p.setHours(0,0,0,0); return Math.round((p.getTime() - retaHoje0())/86400000); }
function retaMaterias(){ return (STATE.retaEscopo === 'materia' && STATE.materia) ? [STATE.materia] : materiasDisponiveis(); }
function retaQuestoes(materias){
  const set = new Set(materias);
  return ALL_QUESTIONS.filter(q => set.has(q.materia) && !q.duplicataOculta && (q.t === 'CE' || q.t === 'MC'));
}
function retaPeso(q){ const n = String(q.nv||''); return /alta/i.test(n) ? 3 : (/m[eé]dia/i.test(n) ? 2 : 1); }
function retaNomeCausa(q){
  if(q.t !== 'CE') return 'Alternativa trocada';
  let a = null; try{ a = armEfetiva(q); }catch(_){}
  if(!a) return 'Sem classificação';
  if(!a.errado) return 'Item certo mal lido';
  return (ARM_TIPOS[a.p] && ARM_TIPOS[a.p].nome) || 'Sem classificação';
}

// cartão de lacuna da questão (ou null): a figura de teoria quando existe; senão a resolução em figura
function retaCloze(q){
  let c = null; try{ c = teoriaCartaoDaQuestao(q); }catch(_){}
  if(c){
    const partes = retaPartesDeRegra(c.regra);
    if(partes.some(p => p.l)) return { partes, titulo:c.titulo, figura:() => cartaoTeoriaHtml(q) };
    return null;
  }
  if(typeof textoResolucaoAtualizado !== 'function') return null;
  const linhas = String(textoResolucaoAtualizado(q) || '').split(/\n/).map(l => l.trim()).filter(Boolean);
  const reg = linhas.find(l => /^📌/u.test(l)), ch = linhas.find(l => /^🔑/u.test(l));
  if(!reg || !ch) return null;
  const txt = _crLimpa(reg.replace(/^📌\s*/u, '')), chaves = _crLimpa(ch.replace(/^🔑\s*/u, '')).split(/\s*[·|]\s*/).filter(Boolean);
  const partes = retaPartesComChaves(txt, chaves);
  if(!partes.some(p => p.l)) return null;
  return { partes, titulo:q.tema || 'Revisão', figura:() => (typeof cartaoResolucaoHtml === 'function' ? cartaoResolucaoHtml(q) : '') };
}

let _retaCache = null;
function retaCartoes(materias){
  const chave = materias.join('|') + '#' + ALL_QUESTIONS.length;
  if(_retaCache && _retaCache.chave === chave) return _retaCache.lista;
  const lista = [];
  retaQuestoes(materias).forEach(q => { const cz = retaCloze(q); if(cz) lista.push({ q, uid:q.uid, mat:q.materia, cz }); });
  _retaCache = { chave, lista };
  return lista;
}
function retaAgendaDe(uid, mat){ const b = getBucket(mat); return (b.srs && b.srs[uid]) || null; }

// erros do escopo: { uid, q, mat, nivel, reinc, causa, ultimoTs }
function retaErros(materias){
  const out = [];
  materias.forEach(m => {
    const b = getBucket(m);
    Object.entries(b.perguntas || {}).forEach(([uid, p]) => {
      const q = BY_UID[uid]; if(!q || q.materia !== m || q.duplicataOculta) return;
      const n = retaNivelErro(p); if(!n) return;
      out.push({ uid, q, mat:m, nivel:n.nivel, reinc:n.reinc, ultimoTs:n.ultimoTs, causa:retaNomeCausa(q), chute:!!(b.chutes && b.chutes[uid]) });
    });
  });
  return out;
}
const RETA_NIVEIS = [ { n:'Novo', cls:'n', ico:'🟥' }, { n:'Aprendendo', cls:'a', ico:'🟧' }, { n:'Quase', cls:'q', ico:'🟦' }, { n:'Dominado', cls:'d', ico:'🟩' } ];

// erros que "voltaram" hoje: nível 0 sempre; níveis 1 e 2 quando o intervalo (que encolhe perto da prova) venceu
function retaErrosDeHoje(erros, agora, dias){
  const dia = 86400000, f = dias <= 3 ? 0.5 : 1;
  const iv = [0, f*dia, 2*f*dia];
  const hoje0 = retaHoje0();
  const lista = erros.filter(e => e.nivel < 3 && (e.ultimoTs >= hoje0 || e.nivel === 0 || (agora - e.ultimoTs) >= iv[e.nivel]));
  return lista.sort((a,b) => (b.reinc - a.reinc) || (retaPeso(b.q) - retaPeso(a.q)) || (a.ultimoTs - b.ultimoTs));
}

/* ---------- plano do dia ---------- */
function retaPlano(materias){
  const agora = Date.now(), dias = retaDias(), fase = retaFaseDeDias(dias), hoje0 = retaHoje0();
  const erros = retaErros(materias);
  const blocos = [];
  const feitoHoje = (e) => e.ultimoTs >= hoje0;
  const materiaMaisFrequente = (itens) => { const c = {}; itens.forEach(e => { c[e.mat] = (c[e.mat]||0) + 1; }); return Object.entries(c).sort((a,b) => b[1]-a[1])[0]; };

  if(fase.id !== 'dia' && fase.id !== 'pos'){
    // 1) erros que voltaram
    const el = retaErrosDeHoje(erros, agora, dias).slice(0, 8);
    if(el.length){
      const pend = el.filter(e => !feitoHoje(e)), top = materiaMaisFrequente(pend.length ? pend : el);
      blocos.push({ id:'erros', ico:'🗂️', titulo:'Erros que voltaram', sub: el.length + ' questões' + (top ? ' · mais em ' + top[0] : ''), min:Math.ceil(el.length*1.2), total:el.length, feitos:el.length-pend.length,
        alvo:{ tipo:'quiz', materia:top ? top[0] : null, uids:(pend.length ? pend : el).filter(e => !top || e.mat === top[0]).map(e => e.uid), rotulo:'Reta Final · erros que voltaram' } });
    }
    // 2) cartões de lacuna vencidos (+ novos, conforme a fase)
    const cartoes = retaCartoes(materias);
    const vencidos = [], novos = [];
    let feitosCart = 0;
    cartoes.forEach(c => { const s = retaAgendaDe(c.uid, c.mat);
      if(s && s.t >= hoje0) feitosCart++;
      if(s && s.d <= agora) vencidos.push(c); else if(!s) novos.push(c); });
    const limiteNovos = fase.id === 'leve' ? 0 : (fase.id === 'fixar' ? 5 : 10);
    const novosHoje = cartoes.filter(c => { const s = retaAgendaDe(c.uid, c.mat); return s && s.t >= hoje0 && (s.r||0) + (s.l||0) <= 1 && s.l === 0 && s.r === 1; }).length;
    const novosPlano = limiteNovos ? Math.max(0, limiteNovos - novosHoje) : 0;
    const peso = c => (retaErrosPorUid(erros, c.uid) ? 4 : 0) + retaPeso(c.q);
    const fila = vencidos.sort((a,b) => peso(b) - peso(a)).slice(0, 30).concat(novos.sort((a,b) => peso(b) - peso(a)).slice(0, novosPlano));
    if(fila.length || feitosCart){
      blocos.push({ id:'cartoes', ico:'🃏', titulo:'Cartões de lacuna', sub: vencidos.length + ' vencidos' + (novosPlano ? ' · ' + Math.min(novosPlano, novos.length) + ' novos' : ''), min:Math.max(3, Math.ceil(fila.length*0.4)), total:fila.length + feitosCart, feitos:feitosCart,
        alvo:{ tipo:'cartoes', fila:fila.map(c => c.uid), rotulo:'Reta Final · cartões de hoje' } });
    }
    if(fase.id !== 'leve'){
      // 3) treino da pegadinha nº 1 (sua causa de erro mais frequente)
      const porCausa = {}; erros.filter(e => e.causa !== 'Sem classificação' && e.causa !== 'Item certo mal lido' && e.causa !== 'Alternativa trocada').forEach(e => { porCausa[e.causa] = (porCausa[e.causa]||0) + 1; });
      const topCausa = Object.entries(porCausa).sort((a,b) => b[1]-a[1])[0];
      if(topCausa){
        const cand = retaQuestoes(materias).filter(q => q.t === 'CE' && retaNomeCausa(q) === topCausa[0]);
        const doMesmo = materiaMaisFrequente(cand.map(q => ({ mat:q.materia })));
        const escolha = cand.filter(q => !doMesmo || q.materia === doMesmo[0]).map(q => ({ q, p:(getBucket(q.materia).perguntas||{})[q.uid] }))
          .sort((a,b) => ((a.p ? 1 : 0) - (b.p ? 1 : 0)) || (retaPeso(b.q) - retaPeso(a.q))).slice(0, 6);
        if(escolha.length >= 3) blocos.push({ id:'pegadinha', ico:'🪤', titulo:'Treino de pegadinha: “' + topCausa[0] + '”', sub: escolha.length + ' itens · sua causa nº 1 de erro', min:Math.ceil(escolha.length*1.2), total:escolha.length,
          feitos:escolha.filter(x => x.p && (((x.p.historico||[]).slice(-1)[0]||{}).ts||0) >= hoje0).length,
          alvo:{ tipo:'quiz', materia:doMesmo[0], uids:escolha.map(x => x.q.uid), rotulo:'Reta Final · pegadinha ' + topCausa[0] } });
      }
      // 4) chutes
      const chutes = [];
      materias.forEach(m => Object.entries(getBucket(m).chutes || {}).forEach(([uid, c]) => { const q = BY_UID[uid]; if(q && q.materia === m && !q.duplicataOculta) chutes.push({ uid, q, mat:m, ts:(c&&c.ts)||0, feito:(((getBucket(m).perguntas||{})[uid]||{}).historico||[]).some(h => (h.ts||0) >= hoje0) }); }));
      const ch = chutes.sort((a,b) => (a.ts - b.ts)).slice(0, 5);
      if(ch.length){ const topC = materiaMaisFrequente(ch);
        blocos.push({ id:'chutes', ico:'🎲', titulo:'Chutes para confirmar', sub: ch.length + ' questões · acerto sem domínio', min:Math.ceil(ch.length*1.2), total:ch.length, feitos:ch.filter(x => x.feito).length,
          alvo:{ tipo:'quiz', materia:topC[0], uids:ch.filter(x => x.mat === topC[0]).map(x => x.uid), rotulo:'Reta Final · chutes' } }); }
    }
    // 5) relâmpago de 5 minutos: erros "quase dominados"
    const quase = erros.filter(e => e.nivel === 2).sort((a,b) => a.ultimoTs - b.ultimoTs).slice(0, 10);
    if(quase.length >= 3){ const topQ = materiaMaisFrequente(quase);
      blocos.push({ id:'relampago', ico:'⚡', titulo:'Relâmpago de 5 minutos', sub: quase.length + ' itens de assuntos “quase dominados”', min:5, total:quase.length, feitos:quase.filter(feitoHoje).length,
        alvo:{ tipo:'quiz', materia:topQ[0], uids:quase.filter(e => e.mat === topQ[0]).map(e => e.uid), rotulo:'Reta Final · relâmpago' } }); }
  }
  blocos.forEach(b => { b.feito = b.total > 0 && b.feitos >= b.total; });
  return { blocos, fase, dias };
}
function retaErrosPorUid(erros, uid){ return erros.some(e => e.uid === uid); }

/* ---------- prontidão ---------- */
// chance estimada de acertar: acerto suavizado, dando mais peso às respostas recentes; chute acertado vale meio acerto
function retaChance(p, chute){
  if(!p || !p.tentativas) return null;
  const h = Array.isArray(p.historico) ? p.historico.slice(-6) : [];
  let a = 0, w = 0;
  h.forEach((x, i) => { const pe = 1 + i*0.5; w += pe; a += pe * (x.c === true ? (chute ? 0.5 : 1) : 0); });
  const rec = w ? a/w : (p.acertos||0)/Math.max(1, p.tentativas);
  const glob = (p.acertos||0)/Math.max(1, p.tentativas);
  return Math.max(0, Math.min(1, 0.6*rec + 0.4*glob));
}
function retaProntidao(materias){
  const linhas = [];
  materias.forEach(m => {
    const b = getBucket(m), porTema = {};
    retaQuestoes([m]).forEach(q => {
      const t = q.tema || 'Geral'; const o = porTema[t] || (porTema[t] = { tema:t, mat:m, total:0, resp:0, soma:0, peso:0 });
      const w = retaPeso(q); o.total++; o.peso += w;
      const c = retaChance((b.perguntas||{})[q.uid], !!(b.chutes && b.chutes[q.uid]));
      if(c !== null){ o.resp++; o.soma += c * w; }
    });
    const temas = Object.values(porTema).map(o => ({ ...o, chance: o.resp ? o.soma / Math.max(1e-9, retaPesoResp(m, o.tema)) : null, cobertura: o.resp / Math.max(1, o.total) }));
    if(temas.length) linhas.push({ mat:m, temas });
  });
  return linhas;
}
function retaPesoResp(m, tema){
  const b = getBucket(m); let w = 0;
  retaQuestoes([m]).forEach(q => { if((q.tema||'Geral') === tema && retaChance((b.perguntas||{})[q.uid], false) !== null) w += retaPeso(q); });
  return w;
}
// "pontos em jogo": ganho esperado, em % da nota, se o assunto subir a 85%. Cada matéria pesa igual; dentro dela, peso = incidência × nº de questões.
function retaPontos(linhas){
  const itens = [];
  linhas.forEach(l => {
    const pesoMat = l.temas.reduce((s,t) => s + t.peso, 0) || 1;
    l.temas.forEach(t => {
      const chance = t.chance === null ? 0.4 : t.chance;          // nunca respondido: assume 40%
      const ganho = Math.max(0, 0.85 - chance) * (t.peso / pesoMat) * (100 / linhas.length);
      itens.push({ mat:l.mat, tema:t.tema, chance:t.chance, cobertura:t.cobertura, ganho });
    });
  });
  return itens.sort((a,b) => b.ganho - a.ganho);
}

/* ---------- cola de véspera ---------- */
function retaCola(mat){
  const b = getBucket(mat);
  const erros = retaErros([mat]).filter(e => e.nivel < 3).sort((a,b2) => (b2.reinc - a.reinc) || (retaPeso(b2.q) - retaPeso(a.q)));
  const chutes = Object.keys(b.chutes || {}).map(u => BY_UID[u]).filter(q => q && q.materia === mat);
  const linhas = q => String(textoResolucaoAtualizado(q) || '').split(/\n/).map(l => l.trim()).filter(Boolean);
  const pega = (q, re) => { const l = linhas(q).find(x => re.test(x)); return l ? _crLimpa(l.replace(re, '')) : ''; };
  const uniq = arr => { const s = new Set(); return arr.filter(x => x && !s.has(x) && s.add(x)); };
  const alvo = erros.map(e => e.q).concat(chutes);
  return {
    pegadinhas: uniq(alvo.map(q => pega(q, /^🪤\s*/u))).slice(0, 10),
    regras: uniq(erros.slice(0, 40).map(e => pega(e.q, /^📌\s*/u))).slice(0, 12),
    macetes: uniq(alvo.map(q => pega(q, /^💡\s*/u))).slice(0, 12),
    chutes: uniq(chutes.map(q => pega(q, /^📌\s*/u))).slice(0, 8),
    qErros: erros.length
  };
}

/* ---------- interface ---------- */
function retaFmtMin(n){ return n + ' min'; }
function retaAbrirQuiz(materia, uids, rotulo){
  uids = (uids||[]).filter(u => BY_UID[u] && (!materia || BY_UID[u].materia === materia));
  if(!uids.length) return;
  materia = materia || BY_UID[uids[0]].materia;
  if(STATE.quiz) salvarQuizEmAndamento();
  STATE.materia = materia; STATE.tema = 'todos'; STATE.viewImportar = false; STATE.flashDeck = null;
  setLocalTab(materia, 'simulado');
  STATE.quiz = { queue:uids, idx:0, respostas:{}, finished:false, materia, tema:'todos', origemErros:true, treinoArmadilha:rotulo };
  salvarQuizEmAndamento();
  render();
}
function retaIniciarCartoes(uids, rotulo){
  const mats = retaMaterias(); const porUid = {}; retaCartoes(mats).forEach(c => { porUid[c.uid] = c; });
  const fila = (uids||[]).filter(u => porUid[u]);
  if(!fila.length) return;
  STATE.retaSessao = { fila, idx:0, revelado:false, rot:rotulo, n:[0,0,0,0], total:fila.length };
  render();
}
function retaAvaliar(nota){
  const s = STATE.retaSessao; if(!s || !s.revelado) return;
  const uid = s.fila[s.idx], q = BY_UID[uid]; if(!q) return;
  const b = getBucket(q.materia), agora = Date.now();
  b.srs[uid] = retaAgenda(b.srs[uid], nota, agora, retaDias());
  marcarProgressoSujo(q.materia); saveProgress();
  s.n[nota-1]++;
  if(nota === 1 && s.fila.length - s.idx > 2) s.fila.splice(Math.min(s.fila.length, s.idx + 6), 0, uid);   // errou: volta já nesta sessão
  s.idx++; s.revelado = false;
  if(s.idx >= s.fila.length) s.fim = true;
  render();
}

function retaCabecalho(dias, fase){
  const total = 30, rest = Math.max(0, Math.min(total, dias)), off = 276.5 * (1 - rest/total);
  const rotulo = dias > 0 ? 'D-' + dias : (dias === 0 ? 'HOJE' : 'D+' + Math.abs(dias));
  const fases = [['cobrir','D-16 a D-8 · Cobrir lacunas'],['fixar','D-7 a D-3 · Fixar'],['leve','D-2 e D-1 · Leve'],['dia','Véspera · Cola']];
  return `<div class="reta-topo">
    <div class="reta-anel" aria-label="${esc(rotulo)} para a prova"><svg width="96" height="96" viewBox="0 0 104 104"><circle cx="52" cy="52" r="44" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="9"/><circle cx="52" cy="52" r="44" fill="none" stroke="var(--gold)" stroke-width="9" stroke-linecap="round" stroke-dasharray="276.5" stroke-dashoffset="${off.toFixed(1)}" transform="rotate(-90 52 52)"/></svg>
      <div class="reta-anel-n"><b>${esc(rotulo)}</b><span>${esc(PROVA_TCDF.rotulo)}</span></div></div>
    <div class="reta-topo-t"><h2 class="section-title" style="margin:0;">Reta Final</h2>
      <p class="section-desc" style="margin:4px 0 8px;">Um só lugar para revisar: o app decide o que estudar hoje, em que ordem e por quanto tempo, a partir dos seus erros, chutes e do que mais cai.</p>
      <div class="reta-fases">${fases.map(f => `<span class="${f[0] === fase.id || (f[0]==='dia' && (fase.id==='dia')) ? 'on' : ''}">${f[1]}</span>`).join('')}</div></div></div>`;
}
function retaAbas(){
  const a = STATE.retaAba || 'hoje';
  const abas = [['hoje','🎯 Hoje'],['erros','🗂️ Caderno de erros'],['cartoes','🃏 Cartões'],['prontidao','📊 Prontidão'],['vespera','📄 Cola de véspera']];
  return `<div class="reta-abas" role="tablist">${abas.map(x => `<button role="tab" aria-selected="${a===x[0]}" class="${a===x[0]?'on':''}" data-reta-aba="${x[0]}">${x[1]}</button>`).join('')}</div>
  <div class="reta-escopo"><span>Escopo:</span>
    <button class="${STATE.retaEscopo==='materia'?'':'on'}" data-reta-escopo="todas">🌐 Todas as matérias</button>
    <button class="${STATE.retaEscopo==='materia'?'on':''}" data-reta-escopo="materia">📚 ${esc(STATE.materia||'Esta matéria')}</button>
    <span class="reta-escopo-links"><button data-reta-classico="erros" title="A lista simples de erros e chutes desta matéria">Lista clássica de erros</button><button data-reta-classico="flashcards" title="Os flashcards de resumo desta matéria">Flashcards de resumo</button></span></div>`;
}

function retaHtmlHoje(mats){
  const { blocos, fase, dias } = retaPlano(mats);
  const total = blocos.reduce((s,b) => s + b.min, 0), feitoMin = blocos.filter(b => b.feito).reduce((s,b) => s + b.min, 0);
  const pct = total ? Math.round(100*blocos.reduce((s,b) => s + (b.total ? Math.min(1, b.feitos/b.total) : 0)*b.min, 0)/total) : 0;
  if(fase.id === 'dia') return `<div class="card-reta"><h3>🍀 Dia da prova</h3><p class="section-desc">Hoje não se estuda matéria nova. Respire, revise só a cola de véspera se precisar e confie no que já fez.</p><button class="btn btn-gold" data-reta-aba="vespera">Abrir a cola de véspera</button></div>`;
  if(fase.id === 'pos') return `<div class="card-reta"><h3>Prova concluída</h3><p class="section-desc">A Reta Final termina na data da prova. Os cartões e erros continuam disponíveis nas outras abas.</p></div>`;
  if(!blocos.length) return `<div class="card-reta"><h3>Nada vencido hoje 🎉</h3><p class="section-desc">Você está em dia com os erros e cartões deste escopo. Use a aba <b>Cartões</b> para antecipar revisões ou a <b>Prontidão</b> para ver onde ainda dá para ganhar pontos.</p></div>`;
  const dicaFase = { cobrir:'Cobrir lacunas: amplie o que ainda não viu e corrija os erros novos.', fixar:'Fixar: poucos assuntos novos; foco em erros, cartões vencidos e chutes.', leve:'Leve: sem matéria nova. Cartões já vistos e a cola de véspera.' }[fase.id] || '';
  return `<div class="reta-grade">
    <div class="card-reta"><h3>Plano de hoje <small>· ${retaFmtMin(total)}</small></h3>
      <p class="section-desc" style="margin:0 0 10px;">${esc(dicaFase)}</p>
      <div class="reta-barra"><i style="width:${pct}%"></i></div>
      <div class="reta-barra-leg"><span>${blocos.filter(b=>b.feito).length} de ${blocos.length} blocos</span><span>${retaFmtMin(Math.max(0,total-feitoMin))} restantes</span></div>
      <ul class="reta-plano">${blocos.map(b => `<li class="${b.feito?'ok':''}"><span class="reta-chk">${b.feito?'✓':''}</span><div class="t"><b>${b.ico} ${esc(b.titulo)}</b><small>${esc(b.sub)} · feito: ${b.feitos}/${b.total}</small></div><span class="min">${retaFmtMin(b.min)}</span><button class="btn btn-sm ${b.feito?'':'btn-gold'}" data-reta-bloco="${b.id}">${b.feito?'Refazer':'Começar'}</button></li>`).join('')}</ul>
      <button class="btn btn-gold reta-cta" data-reta-bloco="proximo">▶ Começar o próximo bloco</button></div>
    <div class="card-reta"><h3>Como o plano é feito</h3>
      <p class="section-desc" style="margin:0 0 6px;">Erros que voltaram (nível e intervalo), cartões vencidos e novos conforme a fase, a sua causa de erro nº 1, chutes e um relâmpago com os “quase dominados”. Cada item sai da lista quando você faz.</p>
      <p class="section-desc" style="margin:0;">Os intervalos encolhem perto da prova: nenhum cartão fica mais de ⅓ do tempo que falta sem voltar.</p></div></div>`;
}

function retaHtmlErros(mats){
  const erros = retaErros(mats);
  const ativos = erros.filter(e => e.nivel < 3);
  const filtro = STATE.retaFiltroErros || 'todos';
  const porCausa = {}; ativos.forEach(e => { porCausa[e.causa] = (porCausa[e.causa]||0) + 1; });
  const causas = Object.entries(porCausa).sort((a,b) => b[1]-a[1]);
  const maxC = causas.length ? causas[0][1] : 1, totalC = ativos.length || 1;
  const cores = ['var(--c1)','var(--c2)','var(--c0)','var(--c4)','var(--c3)'];
  if(!erros.length) return emptyState('🗂️','Caderno de erros vazio','Quando você errar questões, elas aparecem aqui, agrupadas pela causa e com o nível de domínio.');
  const niveis = [0,1,2,3].map(n => erros.filter(e => e.nivel === n).length);
  let lista = erros;
  if(filtro === 'reinc') lista = erros.filter(e => e.reinc >= 2 && e.nivel < 3);
  else if(filtro === 'chutes') lista = erros.filter(e => e.chute);
  else if(filtro === 'dominados') lista = erros.filter(e => e.nivel === 3);
  else if(/^causa:/.test(filtro)) lista = ativos.filter(e => e.causa === filtro.slice(6));
  else lista = ativos;
  lista = lista.slice().sort((a,b) => (a.nivel - b.nivel) || (b.reinc - a.reinc) || (retaPeso(b.q) - retaPeso(a.q))).slice(0, 40);
  const chip = (id, txt, n) => `<button class="chip ${filtro===id?'selected':''}" data-reta-filtro="${esc(id)}">${esc(txt)}${n!==undefined?` (${n})`:''}</button>`;
  return `<div class="reta-grade">
    <div class="card-reta"><h3>Por que você erra</h3><p class="section-desc" style="margin:0 0 8px;">${ativos.length} erros em aberto, agrupados pela armadilha da banca (a classificação das listas).</p>
      ${causas.map(([c,n],i) => `<div class="reta-causa" data-reta-filtro="causa:${esc(c)}" title="Filtrar por esta causa"><span>${esc(c)}</span><div class="b"><i style="width:${Math.max(6,Math.round(100*n/maxC))}%;background:${cores[i%cores.length]}"></i></div><b>${Math.round(100*n/totalC)}%</b></div>`).join('')}</div>
    <div class="card-reta"><h3>Níveis de domínio</h3><p class="section-desc" style="margin:0 0 8px;">O erro só sai depois de 3 acertos espaçados (≥ 20 h). Cada erro volta ao início e conta como reincidência.</p>
      <div class="reta-niveis">${RETA_NIVEIS.map((n,i) => `<span class="cx ${n.cls}">${n.ico} ${n.n} · ${niveis[i]}</span>`).join('')}</div>
      <div class="reta-filtros">${chip('todos','Em aberto',ativos.length)}${chip('reinc','Reincidentes',erros.filter(e=>e.reinc>=2&&e.nivel<3).length)}${chip('chutes','Chutes',erros.filter(e=>e.chute).length)}${chip('dominados','Dominados',niveis[3])}</div></div></div>
    <div class="card-reta" style="margin-top:14px;"><h3>Fila ${esc(filtro==='todos'?'':'· ' + filtro.replace(/^causa:/,''))}</h3>
      ${lista.length ? lista.map(e => retaLinhaErro(e)).join('') : '<p class="section-desc">Nada neste filtro.</p>'}
      ${lista.length > 1 && lista.every(e => e.mat === lista[0].mat) ? `<button class="btn btn-primary" data-reta-treino="${esc(lista.map(e=>e.uid).join(','))}" data-reta-materia="${esc(lista[0].mat)}" style="margin-top:10px;">Refazer estes ${lista.length}</button>` : ''}</div>`;
}
function retaLinhaErro(e){
  const n = RETA_NIVEIS[e.nivel], q = e.q;
  const fig = (()=>{ try{ return (teoriaCartaoDaQuestao(q) ? cartaoTeoriaHtml(q) : (typeof cartaoResolucaoHtml==='function' ? cartaoResolucaoHtml(q) : '')); }catch(_){ return ''; } })();
  const aberto = STATE.retaFigura === e.uid;
  return `<div class="reta-erro"><div class="reta-erro-cab"><span class="cx ${n.cls}">${n.ico} ${n.n}</span>${e.reinc>=2?`<span class="cx rr">reincidente ×${e.reinc}</span>`:''}<span class="chip">${esc(e.mat)}${q.tema?' · '+esc(q.tema):''}</span><span class="chip">${esc(e.causa)}</span>${e.chute?'<span class="chip">🎲 chute</span>':''}</div>
    <p>${esc(limparEnunciado(q.q, q.t) || '')}</p>
    <div class="reta-erro-acoes">${fig?`<button class="btn btn-gold btn-sm" data-reta-figura="${esc(e.uid)}">${aberto?'Esconder a figura':'Ver a teoria em figura'}</button>`:''}<button class="btn btn-sm" data-reta-refazer="${esc(e.uid)}" data-reta-materia="${esc(e.mat)}">Refazer</button></div>
    ${aberto?`<div class="reta-fig">${fig}</div>`:''}</div>`;
}

function retaHtmlCartoes(mats){
  const s = STATE.retaSessao;
  if(s && s.fim){
    const ok = s.n[2] + s.n[3], tot = s.total;
    return `<div class="card-reta" style="text-align:center;"><h3>Sessão concluída 🎉</h3><p class="section-desc">${tot} cartões · errei ${s.n[0]} · difícil ${s.n[1]} · bom ${s.n[2]} · fácil ${s.n[3]}${s.n[0]?' · os errados voltaram ainda nesta sessão':''}.</p>
      <p class="section-desc">${ok >= tot*0.8 ? 'Ótimo ritmo! Os intervalos já foram reagendados para a prova.' : 'Os cartões difíceis voltam amanhã.'}</p>
      <button class="btn btn-gold" data-reta-sair="1">Voltar</button></div>`;
  }
  if(s){
    const uid = s.fila[s.idx], q = BY_UID[uid], cz = q && retaCloze(q);
    if(!q || !cz){ s.idx++; if(s.idx >= s.fila.length){ s.fim = true; } return retaHtmlCartoes(mats); }
    const st = retaAgendaDe(uid, q.materia), dias = retaDias(), agora = Date.now();
    const partes = cz.partes.map(p => p.t !== undefined ? esc(p.t) : (s.revelado ? `<mark class="reta-resp">${esc(p.l)}</mark>` : `<span class="reta-lac" style="min-width:${Math.max(70, p.l.length*9)}px">&nbsp;</span>`)).join('');
    const rot = n => retaRotuloIntervalo(st, n, agora, dias);
    return `<div class="reta-sessao"><div class="reta-sessao-cab"><span>${esc(s.rot||'Cartões')}</span><b>${Math.min(s.idx+1, s.fila.length)} de ${s.fila.length}</b><button class="btn btn-sm" data-reta-sair="1">Sair</button></div>
      <div class="reta-barra"><i style="width:${Math.round(100*s.idx/Math.max(1,s.fila.length))}%"></i></div>
      <div class="card-reta reta-flash"><div class="reta-flash-tit">${esc(q.materia)} · ${esc(cz.titulo||q.tema||'')}</div>
        <div class="reta-cloze">${partes}</div>
        ${s.revelado ? `<div class="reta-flash-fig">${cz.figura()}</div>` : `<button class="btn btn-gold" data-reta-revelar="1">Mostrar resposta <small>(espaço)</small></button>`}</div>
      ${s.revelado ? `<div class="reta-notas"><button class="n1" data-reta-nota="1">Errei<small>volta hoje</small></button><button class="n2" data-reta-nota="2">Difícil<small>${esc(rot(2))}</small></button><button class="n3" data-reta-nota="3">Bom<small>${esc(rot(3))}</small></button><button class="n4" data-reta-nota="4">Fácil<small>${esc(rot(4))}</small></button></div>` : ''}
      <p class="reta-atalhos">Atalhos: <kbd>espaço</kbd> mostrar · <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> <kbd>4</kbd> avaliar · no celular, deslize: ← errei, → bom</p></div>`;
  }
  const agora = Date.now(), dias = retaDias(), cart = retaCartoes(mats);
  const vencidos = cart.filter(c => { const x = retaAgendaDe(c.uid, c.mat); return x && x.d <= agora; });
  const novos = cart.filter(c => !retaAgendaDe(c.uid, c.mat));
  const fracos = cart.filter(c => retaErrosPorUidMat(c.uid, c.mat));
  const chutes = cart.filter(c => (getBucket(c.mat).chutes||{})[c.uid]);
  const deck = (id, ico, txt, lista) => `<button class="reta-deck" data-reta-deck="${id}" ${lista.length?'':'disabled'}><b>${ico} ${txt}</b><span>${lista.length} cartões</span></button>`;
  const porMat = {}; cart.forEach(c => { porMat[c.mat] = (porMat[c.mat]||0) + 1; });
  return `<div class="reta-grade">
    <div class="card-reta"><h3>Escolha um baralho</h3><div class="reta-decks">
      ${deck('vencidos','🔔','Vencem hoje',vencidos)}${deck('fracos','🎯','Lacunas fracas',fracos)}${deck('novos','🆕','Novos',novos.slice(0,10))}${deck('chutes','🎲','Chutes',chutes)}</div>
      <p class="section-desc" style="margin:12px 0 0;">Intervalo calculado para a prova: ${dias>0?'com '+dias+' dias, nenhum cartão passa de '+Math.max(1,Math.floor(dias/3))+' dia(s) sem voltar.':'a prova já passou ou é hoje.'}</p></div>
    <div class="card-reta"><h3>Cartões de lacuna, feitos sozinhos</h3><p class="section-desc" style="margin:0 0 8px;">Cada “Teoria em figura” e cada “Resolução em figura” tem palavras-chave marcadas. O app as transforma em lacunas: você completa de cabeça e o verso é a própria figura.</p>
      <div class="reta-filtros">${Object.entries(porMat).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([m,n]) => `<span class="chip">${esc(m)} · ${n}</span>`).join('')}</div></div></div>`;
}
function retaErrosPorUidMat(uid, mat){ const p = (getBucket(mat).perguntas||{})[uid]; const n = retaNivelErro(p); return !!(n && n.nivel < 3); }
function retaFilaDeDeck(id, mats){
  const agora = Date.now(), cart = retaCartoes(mats);
  if(id === 'vencidos') return cart.filter(c => { const x = retaAgendaDe(c.uid, c.mat); return x && x.d <= agora; }).sort((a,b) => retaAgendaDe(a.uid,a.mat).d - retaAgendaDe(b.uid,b.mat).d).map(c => c.uid);
  if(id === 'novos') return cart.filter(c => !retaAgendaDe(c.uid, c.mat)).sort((a,b) => retaPeso(b.q) - retaPeso(a.q)).slice(0, 10).map(c => c.uid);
  if(id === 'fracos') return cart.filter(c => retaErrosPorUidMat(c.uid, c.mat)).map(c => c.uid);
  if(id === 'chutes') return cart.filter(c => (getBucket(c.mat).chutes||{})[c.uid]).map(c => c.uid);
  return [];
}

function retaCorChance(c){ return c === null ? 'rgba(255,255,255,.12)' : (c < .5 ? '#ee8f8f' : (c < .65 ? '#e6bb62' : (c < .8 ? '#9bd6a8' : '#74cb9f'))); }
function retaHtmlProntidao(mats){
  const linhas = retaProntidao(mats), pontos = retaPontos(linhas);
  if(!linhas.length) return emptyState('📊','Sem dados ainda','Responda algumas questões para o mapa de prontidão aparecer.');
  const geral = (()=>{ let s=0,w=0; linhas.forEach(l => l.temas.forEach(t => { if(t.chance!==null){ s+=t.chance*t.peso; w+=t.peso; } })); return w ? s/w : null; })();
  const topo = pontos.slice(0, 6);
  const ganhoTop5 = pontos.slice(0,5).reduce((s,x) => s + x.ganho, 0);
  return `<div class="reta-grade">
    <div class="card-reta" style="grid-column:1/-1;"><h3>Mapa de prontidão</h3><p class="section-desc" style="margin:0 0 10px;">Chance estimada de acertar cada assunto hoje (acertos recentes pesam mais; chute acertado vale meio). É uma <b>estimativa</b>, não uma promessa de nota.</p>
      ${linhas.map(l => { const resp = l.temas.filter(t => t.chance!==null); const m = resp.length ? resp.reduce((s,t)=>s+t.chance*t.peso,0)/resp.reduce((s,t)=>s+t.peso,0) : null;
        return `<div class="reta-mat"><div class="reta-mat-cab"><b>${esc(l.mat)}</b><span>${m===null?'sem respostas':Math.round(m*100)+'%'}</span></div>
          <div class="reta-tiles">${l.temas.slice().sort((a,b)=>(a.chance===null?-1:a.chance)-(b.chance===null?-1:b.chance)).slice(0,14).map(t => `<div class="reta-tile" style="background:${retaCorChance(t.chance)}" title="${esc(t.tema)} · ${t.resp}/${t.total} respondidas"><span>${t.chance===null?'—':Math.round(t.chance*100)+'%'}</span><small>${esc(t.tema)}</small></div>`).join('')}</div></div>`; }).join('')}
      <div class="reta-leg"><span>baixa</span><i style="background:#ee8f8f"></i><i style="background:#e6bb62"></i><i style="background:#9bd6a8"></i><i style="background:#74cb9f"></i><span>alta</span><i style="background:rgba(255,255,255,.12)"></i><span>sem respostas</span></div></div>
    <div class="card-reta"><h3>Onde estão os pontos</h3><ul class="reta-pontos">${topo.map(x => `<li><span>${esc(x.mat)} · ${esc(x.tema)}</span><b>+${x.ganho.toFixed(1)}%</b></li>`).join('')}</ul>
      <p class="section-desc" style="margin:8px 0 0;">Ganho esperado, em % da nota, se o assunto subir a 85%. Cada matéria pesa igual; dentro dela, peso = incidência × nº de questões.</p></div>
    <div class="card-reta"><h3>Visão geral</h3><div class="reta-geral">${geral===null?'—':Math.round(geral*100)+'%'}</div><p class="section-desc" style="margin:0;">Chance média estimada hoje. Subir os 5 assuntos de maior ganho a 85% somaria cerca de <b>+${ganhoTop5.toFixed(1)}%</b> à nota.</p></div></div>`;
}

function retaHtmlVespera(mats){
  const mat = (STATE.retaColaMateria && materiasDisponiveis().includes(STATE.retaColaMateria)) ? STATE.retaColaMateria : (STATE.materia || materiasDisponiveis()[0]);
  const c = retaCola(mat);
  const lista = arr => arr.length ? `<ul>${arr.map(x => `<li>${_ctDestacaTexto(x)}</li>`).join('')}</ul>` : '<p class="vazio">Nada por aqui ainda (responda mais questões desta matéria).</p>';
  return `<div class="reta-cola-barra no-print"><span>Matéria:</span>${materiasDisponiveis().map(m => `<button class="chip ${m===mat?'selected':''}" data-reta-cola="${esc(m)}">${esc(m)}</button>`).join('')}<button class="btn btn-gold" data-reta-imprimir="1" style="margin-left:auto;">🖨 Imprimir / salvar PDF</button></div>
  <div class="reta-folha" id="reta-folha"><h2>${esc(mat)} · cola de véspera</h2>
    <h4>Pegadinhas que mais te pegaram</h4>${lista(c.pegadinhas)}
    <h4>Regras dos seus erros (${c.qErros} em aberto)</h4>${lista(c.regras)}
    <h4>Macetes</h4>${lista(c.macetes)}
    <h4>Seus chutes (revisar)</h4>${lista(c.chutes)}
    <p class="rodape">Gerada do seu histórico: erros em aberto, chutes, macetes e armadilhas das resoluções. Sem questões novas, só reforço.</p></div>
  <p class="section-desc no-print">Uma folha por matéria, para ler na véspera.</p>`;
}

function renderReta(){
  const mats = retaMaterias(), dias = retaDias(), fase = retaFaseDeDias(dias);
  const aba = STATE.retaAba || 'hoje';
  let corpo = '';
  try{
    if(aba === 'hoje') corpo = retaHtmlHoje(mats);
    else if(aba === 'erros') corpo = retaHtmlErros(mats);
    else if(aba === 'cartoes') corpo = retaHtmlCartoes(mats);
    else if(aba === 'prontidao') corpo = retaHtmlProntidao(mats);
    else corpo = retaHtmlVespera(mats);
  }catch(e){ corpo = `<div class="card-reta"><h3>Não foi possível montar esta aba</h3><p class="section-desc">${esc(e && e.message || String(e))}</p></div>`; }
  if(STATE.retaSessao && aba === 'cartoes') return `<div class="reta">${corpo}</div>`;
  return `<div class="reta">${retaCabecalho(dias, fase)}${retaAbas()}${corpo}</div>`;
}

/* ---------- eventos (delegação; chamado por render()) ---------- */
let _retaTecla = false, _retaToque = null;
function retaAnexar(){
  const r = document.getElementById('app'); if(!r) return;
  const q = sel => r.querySelectorAll(sel);
  q('[data-reta-aba]').forEach(el => el.addEventListener('click', () => { STATE.retaAba = el.dataset.retaAba; STATE.retaSessao = null; render(); }));
  q('[data-reta-escopo]').forEach(el => el.addEventListener('click', () => { STATE.retaEscopo = el.dataset.retaEscopo; STATE.retaSessao = null; render(); }));
  q('[data-reta-classico]').forEach(el => el.addEventListener('click', () => { setLocalTab(STATE.materia, el.dataset.retaClassico); render(); }));
  q('[data-reta-filtro]').forEach(el => el.addEventListener('click', () => { STATE.retaFiltroErros = el.dataset.retaFiltro; render(); }));
  q('[data-reta-figura]').forEach(el => el.addEventListener('click', () => { STATE.retaFigura = STATE.retaFigura === el.dataset.retaFigura ? null : el.dataset.retaFigura; render(); }));
  q('[data-reta-refazer]').forEach(el => el.addEventListener('click', () => retaAbrirQuiz(el.dataset.retaMateria, [el.dataset.retaRefazer], 'Reta Final · refazer erro')));
  q('[data-reta-treino]').forEach(el => el.addEventListener('click', () => retaAbrirQuiz(el.dataset.retaMateria, el.dataset.retaTreino.split(','), 'Reta Final · erros')));
  q('[data-reta-deck]').forEach(el => el.addEventListener('click', () => retaIniciarCartoes(retaFilaDeDeck(el.dataset.retaDeck, retaMaterias()), 'Baralho: ' + el.textContent.replace(/\s*\d+ cartões.*/,'').trim())));
  q('[data-reta-sair]').forEach(el => el.addEventListener('click', () => { STATE.retaSessao = null; render(); }));
  q('[data-reta-revelar]').forEach(el => el.addEventListener('click', () => { if(STATE.retaSessao){ STATE.retaSessao.revelado = true; render(); } }));
  q('[data-reta-nota]').forEach(el => el.addEventListener('click', () => retaAvaliar(parseInt(el.dataset.retaNota, 10))));
  q('[data-reta-cola]').forEach(el => el.addEventListener('click', () => { STATE.retaColaMateria = el.dataset.retaCola; render(); }));
  q('[data-reta-imprimir]').forEach(el => el.addEventListener('click', () => { document.body.classList.add('imprimindo-cola'); window.print(); setTimeout(() => document.body.classList.remove('imprimindo-cola'), 500); }));
  q('[data-reta-bloco]').forEach(el => el.addEventListener('click', () => {
    const { blocos } = retaPlano(retaMaterias());
    const b = el.dataset.retaBloco === 'proximo' ? (blocos.find(x => !x.feito) || blocos[0]) : blocos.find(x => x.id === el.dataset.retaBloco);
    if(!b) return;
    if(b.alvo.tipo === 'cartoes'){ STATE.retaAba = 'cartoes'; retaIniciarCartoes(b.alvo.fila, b.alvo.rotulo); }
    else retaAbrirQuiz(b.alvo.materia, b.alvo.uids, b.alvo.rotulo);
  }));
  const fl = r.querySelector('.reta-flash'); if(fl && STATE.retaSessao){
    fl.addEventListener('touchstart', e => { const t = e.changedTouches[0]; _retaToque = { x:t.clientX, y:t.clientY }; }, { passive:true });
    fl.addEventListener('touchend', e => { if(!_retaToque || !STATE.retaSessao || !STATE.retaSessao.revelado){ _retaToque = null; return; }
      const t = e.changedTouches[0], dx = t.clientX - _retaToque.x, dy = t.clientY - _retaToque.y; _retaToque = null;
      if(Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy)*1.5) retaAvaliar(dx < 0 ? 1 : 3); }, { passive:true });
  }
  if(!_retaTecla){
    _retaTecla = true;
    document.addEventListener('keydown', e => {
      const s = STATE.retaSessao; if(!s || s.fim || (STATE.retaAba || 'hoje') !== 'cartoes' || getLocalTab(STATE.materia) !== 'reta') return;
      const el = document.activeElement; if(el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
      if(e.code === 'Space'){ e.preventDefault(); if(!s.revelado){ s.revelado = true; render(); } }
      else if(s.revelado && /^[1-4]$/.test(e.key)){ e.preventDefault(); retaAvaliar(parseInt(e.key, 10)); }
    });
  }
}
