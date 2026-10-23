// Design Clean Moderno, Pop-up de Fontes e Destaques
const FONTES_OFICIAIS_MATERIAS = {
  "pdpm": { titulo: "PDPM Mulheres", normas: ["II Plano Distrital de Políticas para Mulheres (PDPM)", "Decreto 42.590/2021"], orgaos: ["Secretaria da Mulher DF", "DODF"] },
  "primeiros": { titulo: "Primeiros Socorros", normas: ["Diretrizes AHA", "Protocolos CBMDF"], orgaos: ["CBMDF", "Ministério da Saúde"] },
  "44330": { titulo: "Decreto Distrital nº 44.330/2023", normas: ["Decreto Distrital nº 44.330/2023", "Lei 14.133/2021"], orgaos: ["GDF", "PNCP"] },
  "840": { titulo: "RJU - LC nº 840/2011", normas: ["LC Distrital 840/2011"], orgaos: ["TCDF", "CLDF"] },
  "lotcdf": { titulo: "Lei Orgânica do TCDF", normas: ["LC Distrital nº 1/1994"], orgaos: ["TCDF"] },
  "reg_interno": { titulo: "Regimento Interno do TCDF", normas: ["Resolução TCDF nº 296/2016"], orgaos: ["TCDF"] },
  "afo": { titulo: "AFO - Orçamento", normas: ["LRF (LC 101/00)", "Lei 4.320/64"], orgaos: ["Planalto", "STN"] },
  "padrao": { titulo: "Legislação Aplicada", normas: ["CF/88", "Legislação Federal e Distrital"], orgaos: ["Planalto", "DODF", "TCDF"] }
};

(function() {
  const style = document.createElement("style");
  style.innerHTML = `
    body, .app { background-color: #0b1120 !important; color: #e2e8f0 !important; }
    .frase-dia, [class*="frase"], .quote-box, .app > div:has(> em, > q) {
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8)) !important;
      border: 1px solid rgba(245, 158, 11, 0.3) !important;
      border-left: 4px solid #f59e0b !important;
      border-radius: 12px !important;
      padding: 14px 20px !important;
      margin: 16px 0 !important;
      color: #f8fafc !important;
    }
    table tbody tr { background: #1e293b !important; border-radius: 10px !important; }
    table tbody tr:hover { background: #283548 !important; }
    .badge-materia-atualizada { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); padding: 2px 7px; border-radius: 6px; font-size: 11px; font-weight: 700; margin-left: 8px; }
    .btn-fontes-popup { background: rgba(245, 158, 11, 0.12); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); padding: 3px 8px; border-radius: 5px; font-size: 11px; font-weight: 600; cursor: pointer; margin-left: 6px; }
    .arm-box, .badge-literalidade { display: none !important; }
    .modal-fontes-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 99999; backdrop-filter: blur(5px); }
    .modal-fontes-card { background: #1e293b; border: 1px solid #334155; border-radius: 14px; width: 90%; max-width: 500px; padding: 24px; color: #f8fafc; }
  `;
  document.head.appendChild(style);

  window.abrirModalFontes = function(chave) {
    const m = document.getElementById("modal-fontes-tcdf");
    if (m) m.remove();
    const d = FONTES_OFICIAIS_MATERIAS[chave] || FONTES_OFICIAIS_MATERIAS["padrao"];
    const b = document.createElement("div");
    b.id = "modal-fontes-tcdf";
    b.className = "modal-fontes-backdrop";
    b.onclick = (e) => { if (e.target === b) b.remove(); };
    b.innerHTML = `
      <div class="modal-fontes-card">
        <h3 style="color:#fbbf24;margin-top:0;">🏛️ Auditoria Jurídica Oficial</h3>
        <p><b>Matéria:</b> ${d.titulo}</p>
        <p><b>Normas:</b><br>${d.normas.join("<br>")}</p>
        <p><b>Portais:</b><br>${d.orgaos.join("<br>")}</p>
        <button onclick="document.getElementById('modal-fontes-tcdf').remove()" style="margin-top:10px;padding:6px 12px;background:#334155;color:#fff;border:none;border-radius:6px;cursor:pointer;">Fechar</button>
      </div>`;
    document.body.appendChild(b);
  };

  function aprimorarTabela() {
    document.querySelectorAll("table tbody tr").forEach(linha => {
      if (linha.dataset.clean) return;
      linha.dataset.clean = "true";
      const cNome = linha.querySelector("td:nth-child(2)");
      const cData = linha.querySelector("td:last-child");
      if (cNome && cData) {
        const txt = cNome.textContent.toLowerCase();
        let ch = "padrao";
        if (txt.includes("pdpm")) ch = "pdpm";
        else if (txt.includes("socorros")) ch = "primeiros";
        else if (txt.includes("44.330") || txt.includes("44330")) ch = "44330";
        else if (txt.includes("840")) ch = "840";
        else if (txt.includes("afo")) ch = "afo";
        
        cNome.innerHTML += '<span class="badge-materia-atualizada">✨ 2026</span>';
        cData.innerHTML += ` <button class="btn-fontes-popup" onclick="event.stopPropagation();window.abrirModalFontes('${ch}')">ℹ️ Fontes</button>`;
      }
    });
  }

  new MutationObserver(aprimorarTabela).observe(document.body, { childList: true, subtree: true });
})();
