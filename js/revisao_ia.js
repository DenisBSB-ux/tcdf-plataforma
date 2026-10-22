/**
 * revisao_ia.js - Supressao Total de Badges de Perfil/Armadilha e IA
 */
(function() {
  const style = document.createElement('style');
  style.id = 'estilos-limpeza-badges';
  style.innerHTML = `
    /* Oculta universalmente qualquer badge ou barra no topo da resolucao */
    .armadilha-box, .badge-literalidade, .badge-armadilha, .badge-perfil,
    .barra-armadilha, .info-armadilha, .perfil-item, [data-armadilha],
    [class*="armadilha"], [class*="perfil-tag"] {
    }
  `;
  document.head.appendChild(style);

  function limparBadges() {
    document.querySelectorAll('.resolucao, .comentario, .gabarito-comentado, #resolucao, [class*="resolucao"]').forEach(box => {
      box.querySelectorAll('div, p, span, header').forEach(el => {
        const txt = el.textContent || '';
        if (txt.includes('ITEM CERTO') || txt.includes('ITEM ERRADO') || txt.includes('Texto copiado da lei') || el.dataset.armadilha) {
          const linha = el.closest('.armadilha-box, .barra-armadilha') || el;
          const proximo = linha.nextElementSibling;
          if (proximo && proximo.tagName === 'HR') proximo.remove();
          linha.remove();
        }
      });
      const primeiroHr = box.querySelector('hr:first-child');
      if (primeiroHr) primeiroHr.remove();
    });
  }

  const observer = new MutationObserver(limparBadges);
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('DOMContentLoaded', limparBadges);
})();
