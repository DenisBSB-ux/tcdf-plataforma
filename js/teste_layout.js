/**
 * teste_layout.js
 * Visual Clean, Pop-up de Fontes e Destaques (Exclusivo para teste.html)
 */
const FONTES_OFICIAIS_MATERIAS = {
  "pdpm": {
    titulo: "PDPM Mulheres",
    normas: ["II Plano Distrital de Políticas para Mulheres (PDPM)", "Decreto Distrital nº 42.590/2021", "Diretrizes de Proteção à Mulher do DF"],
    orgaos: ["Secretaria da Mulher do DF (mulher.df.gov.br)", "Diário Oficial do DF (dodf.df.gov.br)"]
  },
  "primeiros": {
    titulo: "Primeiros Socorros",
    normas: ["Diretrizes Internacionais de Suporte Básico de Vida (AHA)", "Protocolos de Atendimento Pré-Hospitalar do CBMDF", "Normas Regulamentadoras (NR-7)"],
    orgaos: ["Corpo de Bombeiros Militar do DF", "Ministério da Saúde (gov.br/saude)"]
  },
  "44330": {
    titulo: "Decreto Distrital nº 44.330/2023",
    normas: ["Decreto Distrital nº 44.330/2023 (Regulamento de Licitações do DF)", "Lei Federal nº 14.133/2021", "Instruções Normativas da SEGES"],
    orgaos: ["Governo do Distrito Federal (GDF)", "Portal Nacional de Contratações Públicas (PNCP)"]
  },
  "840": {
    titulo: "RJU - Lei Complementar nº 840/2011",
    normas: ["Lei Complementar Distrital nº 840/2011 e alterações vigentes", "Jurisprudência consolidada do TJDFT e TCDF"],
    orgaos: ["Tribunal de Contas do DF (tc.df.gov.br)", "Portal da CLDF (cl.df.gov.br)"]
  },
  "lotcdf": {
    titulo: "Lei Orgânica do TCDF",
    normas: ["Lei Complementar Distrital nº 1/1994 (LOTCDF)", "Emendas à LOTCDF"],
    orgaos: ["Tribunal de Contas do Distrito Federal (tc.df.gov.br)"]
  },
  "reg_interno": {
    titulo: "Regimento Interno do TCDF",
    normas: ["Resolução TCDF nº 296/2016 e Emendas Regimentais vigentes"],
    orgaos: ["Plenário do TCDF (tc.df.gov.br/jurisprudencia)"]
  },
  "afo": {
    titulo: "AFO - Orçamento Público",
    normas: ["Lei de Responsabilidade Fiscal (LC 101/2000)", "Lei nº 4.320/1964", "CF/88 (arts. 165 a 169) e Emendas Constitucionais"],
    orgaos: ["Portal do Planalto (planalto.gov.br)", "Secretaria do Tesouro Nacional (STN)"]
  },
  "padrao": {
    titulo: "Legislação Aplicada ao TCDF",
    normas: ["Constituição Federal de 1988", "Legislação Federal e Distrital vigente"],
    orgaos: ["Portal da Legislação (planalto.gov.br)", "Diário Oficial do DF (dodf.df.gov.br)", "Supremo Tribunal Federal (stf.jus.br)"]
  }
};

(function() {
  const style = document.createElement("style");
  style.id = "estilos-pagina-teste";
  style.innerHTML = `
    /* Faixa superior indicando ambiente de teste */
    #barra-aviso-teste {
      background: #f59e0b;
      color: #000;
      text-align: center;
      padding: 6px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    body, .app {
      background-color: #0b1120 !important;
      color: #e2e8f0 !important;
      font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif !important;
    }
    .frase-dia, [class*="frase"], .quote-box, .app > div:has(> em, > q) {
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8)) !important;
      border: 1px solid rgba(245, 158, 11, 0.3) !important;
      border-left: 4px solid #f59e0b !important;
      border-radius: 12px !important;
      padding: 14px 20px !important;
      margin: 16px 0 !important;
      color: #f8fafc !important;
      font-weight: 500 !important;
    }
    table, .tabela-stats, [class*="tabela"] {
      border-collapse: separate !important;
      border-spacing: 0 6px !important;
      width: 100% !important;
    }
    table thead th {
      background: transparent !important;
      color: #94a3b8 !important;
      font-size: 12px !important;
      text-transform: uppercase !important;
      font-weight: 600 !important;
      border: none !important;
      padding: 10px 14px !important;
    }
    table tbody tr {
      background: #1e293b !important;
      border-radius: 10px !important;
      transition: all 0.2s ease !important;
    }
    table tbody tr:hover {
      background: #283548 !important;
    }
    table tbody td {
      border: none !important;
      padding: 12px 14px !important;
      font-size: 13.5px !important;
      color: #cbd5e1 !important;
    }
    .badge-materia-atualizada {
      display: inline-flex;
      align-items: center;
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 2px 7px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      margin-left: 8px;
    }
    .btn-fontes-popup {
      background: rgba(245, 158, 11, 0.12);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.3);
      padding: 3px 8px;
      border-radius: 5px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      margin-left: 6px;
      transition: all 0.2s;
    }
    .btn-fontes-popup:hover {
      background: rgba(245, 158, 11, 0.25);
      color: #fef3c7;
    }
    .arm-box, .badge-literalidade, [class*="armadilha"] {
      display: none !important;
    }
    .modal-fontes-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      backdrop-filter: blur(5px);
    }
    .modal-fontes-card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 14px;
      width: 90%;
      max-width: 500px;
      padding: 24px;
      color: #f8fafc;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }
  `;
  document.head.appendChild(style);

  // Injeta a barra informativa no topo da tela de teste
  window.addEventListener("DOMContentLoaded", () => {
    const banner = document.createElement("div");
    banner.id = "barra-aviso-teste";
    banner.innerHTML = "🧪 AMBIENTE DE TESTES (NOVO LAYOUT CLEAN + POPUP DE FONTES) — Página Original Intacta";
    document.body.prepend(banner);
  });

  window.abrirModalFontes = function(chaveMateria) {
    const modalAntigo = document.getElementById("modal-fontes-tcdf");
    if (modalAntigo) modalAntigo.remove();

    const dados = FONTES_OFICIAIS_MATERIAS[chaveMateria] || FONTES_OFICIAIS_MATERIAS["padrao"];
    const backdrop = document.createElement("div");
    backdrop.id = "modal-fontes-tcdf";
    backdrop.className = "modal-fontes-backdrop";
    backdrop.onclick = (e) => { if (e.target === backdrop) backdrop.remove(); };

    backdrop.innerHTML = `
      <div class="modal-fontes-card">
        <h3 style="color:#fbbf24; margin-top:0;">🏛️ Auditoria Jurídica Oficial</h3>
        <p><b>Matéria:</b> ${dados.titulo}</p>
        <p><b>Legislação Aplicada:</b><br>${dados.normas.join("<br>")}</p>
        <p><b>Portais Oficiais:</b><br>${dados.orgaos.join("<br>")}</p>
        <button style="margin-top:14px; background:#334155; color:#fff; border:none; padding:7px 16px; border-radius:6px; cursor:pointer;" onclick="document.getElementById('modal-fontes-tcdf').remove()">Fechar</button>
      </div>
    `;
    document.body.appendChild(backdrop);
  };

  function aprimorarTabela() {
    document.querySelectorAll("table tbody tr").forEach(linha => {
      if (linha.dataset.cleanEnhanced) return;
      linha.dataset.cleanEnhanced = "true";

      const celulaNome = linha.querySelector("td:nth-child(2)");
      const celulaData = linha.querySelector("td:last-child");

      if (celulaNome && celulaData) {
        const textoNome = celulaNome.textContent.toLowerCase();
        let chave = "padrao";
        if (textoNome.includes("pdpm") || textoNome.includes("mulher")) chave = "pdpm";
        else if (textoNome.includes("socorros")) chave = "primeiros";
        else if (textoNome.includes("44.330") || textoNome.includes("44330")) chave = "44330";
        else if (textoNome.includes("840")) chave = "840";
        else if (textoNome.includes("lotcdf") || textoNome.includes("orgânica do tcdf")) chave = "lotcdf";
        else if (textoNome.includes("reg. interno")) chave = "reg_interno";
        else if (textoNome.includes("afo")) chave = "afo";

        celulaNome.innerHTML += '<span class="badge-materia-atualizada">✨ 2026</span>';
        celulaData.innerHTML += ` <button class="btn-fontes-popup" onclick="event.stopPropagation(); window.abrirModalFontes('${chave}')">ℹ️ Fontes</button>`;
      }
    });
  }

  const observer = new MutationObserver(aprimorarTabela);
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener("DOMContentLoaded", aprimorarTabela);
})();
