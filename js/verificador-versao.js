// Verificador ativo de versão: mesmo que o navegador tenha carregado uma cópia
// guardada em cache por algum motivo fora do nosso controle (proxy, extensão,
// política de rede corporativa etc.), este script confere periodicamente a
// versão REAL do servidor (com cache:'no-store', ignorando qualquer cache) e
// avisa com um botão de atualizar se detectar uma versão mais nova no ar.
(function(){
  async function checarNovaVersao(){
    try{
      const resp = await fetch(location.pathname + (location.pathname.includes('?')?'&':'?') + '_cachebust=' + Date.now(), { cache:'no-store' });
      if(!resp.ok) return;
      const texto = await resp.text();
      const m = texto.match(/versao:\s*'([^']+)',\s*build:\s*'([^']+)'/);
      if(m && window.__TCDF_BUILD__ && (m[1]!==window.__TCDF_BUILD__.versao || m[2]!==window.__TCDF_BUILD__.build)){
        mostrarBannerNovaVersao();
      }
    }catch(e){ /* sem rede no momento — tenta de novo na próxima checagem */ }
  }
  function mostrarBannerNovaVersao(){
    if(document.getElementById('banner-nova-versao')) return;
    const div = document.createElement('div');
    div.id = 'banner-nova-versao';
    div.innerHTML = '⚡ Existe uma versão mais nova desta página no ar. <button id="btn-atualizar-agora" style="margin-left:10px;padding:5px 14px;border-radius:6px;border:none;background:#c8a24a;color:#1c1a15;font-weight:700;cursor:pointer;">Atualizar agora</button>';
    div.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#1c1a15;color:#f3ede0;padding:12px 16px;text-align:center;z-index:99999;font-family:sans-serif;font-size:14px;box-shadow:0 -2px 10px rgba(0,0,0,0.3);';
    document.body.appendChild(div);
    document.getElementById('btn-atualizar-agora').addEventListener('click', ()=>{
      // location.reload() sozinho pode ainda receber uma cópia em cache do
      // CDN do GitHub Pages (o Cache-Control da resposta do servidor manda
      // mais que qualquer meta tag ou opção do fetch do lado do cliente).
      // Um parâmetro de query novo força uma URL nunca vista antes, que o
      // CDN não tem em cache — é isso que de fato garante pegar a versão nova.
      location.href = location.pathname + '?_v=' + Date.now();
    });
  }
  setTimeout(checarNovaVersao, 3000);
  setInterval(checarNovaVersao, 5*60*1000);
})();
