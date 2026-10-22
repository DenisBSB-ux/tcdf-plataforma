/**
 * revisao_ia.js
 * Módulo Autônomo de Sinalização e Confirmação de Legislação Atualizada por IA
 */

// ==============================================================================
// 1. INJEÇÃO DOS ESTILOS VISUAIS
// ==============================================================================
(function injetarEstilosRevisao() {
  const idEstilo = "estilos-revisao-ia";
  if (document.getElementById(idEstilo)) return;

  const style = document.createElement("style");
  style.id = idEstilo;
  style.innerHTML = `
    .banner-revisao-ia {
      background-color: #fffbeb !important;
      border: 1px solid #f59e0b !important;
      border-radius: 8px !important;
      padding: 12px 16px !important;
      margin: 14px 0 !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05) !important;
    }
    .banner-revisao-ia .cabecalho-revisao {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      font-weight: 700 !important;
      color: #b45309 !important;
      font-size: 13.5px !important;
      margin-bottom: 6px !important;
    }
    .banner-revisao-ia .justificativa-ia {
      font-size: 13px !important;
      color: #374151 !important;
      background: #ffffff !important;
      padding: 8px 12px !important;
      border-radius: 6px !important;
      border-left: 3px solid #f59e0b !important;
      margin: 8px 0 !important;
      line-height: 1.4 !important;
    }
    .banner-revisao-ia .botoes-confirmacao {
      display: flex !important;
      gap: 8px !important;
      margin-top: 10px !important;
      flex-wrap: wrap !important;
    }
    .btn-aprovar-ia {
      background-color: #10b981 !important;
      color: #ffffff !important;
      border: none !important;
      padding: 7px 14px !important;
      border-radius: 5px !important;
      font-size: 12px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      transition: background 0.2s !important;
    }
    .btn-aprovar-ia:hover {
      background-color: #059669 !important;
    }
    .btn-reverter-ia {
      background-color: #ef4444 !important;
      color: #ffffff !important;
      border: none !important;
      padding: 7px 14px !important;
      border-radius: 5px !important;
      font-size: 12px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      transition: background 0.2s !important;
    }
    .btn-reverter-ia:hover {
      background-color: #dc2626 !important;
    }
  `;
  document.head.appendChild(style);
})();

// ==============================================================================
// 2. FUNÇÕES DE CONFIRMAÇÃO E REVERSÃO (FIRESTORE)
// ==============================================================================

/**
 * Ação: O usuário clica em Confirmar
 */
window.aprovarRevisaoIA = async function(idQuestao) {
  try {
    const db = (typeof firebase !== "undefined" && firebase.firestore) ? firebase.firestore() : null;
    if (!db) {
      alert("Instância do Firebase Firestore não encontrada na página.");
      return;
    }

    await db.collection("progresso").doc(idQuestao).update({
      alerta_revisao: false,
      status_confirmacao: "aprovada_pelo_usuario",
      confirmada_em: new Date().toISOString()
    });

    const banner = document.getElementById(`alerta-ia-${idQuestao}`);
    if (banner) {
      banner.style.backgroundColor = "#ecfdf5";
      banner.style.borderColor = "#10b981";
      banner.innerHTML = `<span style="color: #047857; font-weight: 700;">✅ Resolução validada e confirmada por você com sucesso!</span>`;
      setTimeout(() => banner.remove(), 2500);
    }
  } catch (erro) {
    console.error("Erro ao aprovar resolução:", erro);
    alert("Erro ao salvar confirmação no banco.");
  }
};

/**
 * Ação: O usuário clica em Reverter
 */
window.reverterRevisaoIA = async function(idQuestao) {
  try {
    const db = (typeof firebase !== "undefined" && firebase.firestore) ? firebase.firestore() : null;
    if (!db) return;

    const docRef = db.collection("progresso").doc(idQuestao);
    const snap = await docRef.get();
    if (!snap.exists) return;

    const dados = snap.data();
    const resolucaoOriginal = dados.resolucao_anterior || dados.resolucao;

    await docRef.update({
      resolucao: resolucaoOriginal,
      alerta_revisao: false,
      status_confirmacao: "revertida_pelo_usuario",
      revertida_em: new Date().toISOString()
    });

    const banner = document.getElementById(`alerta-ia-${idQuestao}`);
    if (banner) {
      banner.style.backgroundColor = "#fef2f2";
      banner.style.borderColor = "#ef4444";
      banner.innerHTML = `<span style="color: #b91c1c; font-weight: 700;">↩ Resolução original restaurada com sucesso!</span>`;
      setTimeout(() => banner.remove(), 2500);
    }
  } catch (erro) {
    console.error("Erro ao reverter questão:", erro);
    alert("Erro ao reverter no banco.");
  }
};

// ==============================================================================
// 3. RENDERIZADOR DO BANNER
// ==============================================================================
window.renderizarAlertaRevisaoIA = function(questao, elementoContainer) {
  if (!questao || !questao.alerta_revisao) return;

  const idQ = questao.id;
  if (document.getElementById(`alerta-ia-${idQ}`)) return; // Evita duplicar

  const materia = questao.materia_monitorada || "Legislação";
  const justificativa = questao.justificativa_ia || "Dispositivo legal atualizado conforme jurisprudência e normas vigentes.";

  const containerAlerta = document.createElement("div");
  containerAlerta.className = "banner-revisao-ia";
  containerAlerta.id = `alerta-ia-${idQ}`;

  containerAlerta.innerHTML = `
    <div class="cabecalho-revisao">
      <span>🟡 Legislação Atualizada pela IA (${materia})</span>
      <small style="opacity: 0.8;">Revisada em: ${questao.revisada_em || "Hoje"}</small>
    </div>
    <div class="justificativa-ia">
      <strong>Fundamentação da alteração:</strong> ${justificativa}
    </div>
    <div class="botoes-confirmacao">
      <button class="btn-aprovar-ia" onclick="aprovarRevisaoIA('${idQ}')">
        ✓ Confirmar Atualização
      </button>
      <button class="btn-reverter-ia" onclick="reverterRevisaoIA('${idQ}')">
        ✕ Reverter para Original
      </button>
    </div>
  `;

  if (elementoContainer) {
    elementoContainer.prepend(containerAlerta);
  }
};

// ==============================================================================
// 4. OBSERVADOR AUTOMÁTICO DO DOM (AUTO-HOOK)
// ==============================================================================
// Monitora a tela: sempre que uma questão for aberta na tela, verifica e injeta o alerta
const observadorQuestoes = new MutationObserver(() => {
  // Procura por containers comuns de resolução ou questão no seu site
  const containerResolucao = document.querySelector(".resolucao, .comentario, .gabarito-comentado, #resolucao, .box-resolucao");
  
  // Se o objeto da questão atual estiver no escopo global (comum em SPAs)
  const questaoAtual = window.questaoAtual || window.itemAtual;

  if (containerResolucao && questaoAtual && questaoAtual.alerta_revisao) {
    window.renderizarAlertaRevisaoIA(questaoAtual, containerResolucao);
  }
});

observadorQuestoes.observe(document.body, { childList: true, subtree: true });