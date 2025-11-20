// transitions.js

// Verifica se o navegador suporta a API View Transitions
if ("startViewTransition" in document) {
  document.addEventListener("DOMContentLoaded", () => {
    // Pega todos os links <a>
    document.querySelectorAll("a").forEach(link => {
      // Só intercepta se for link interno (mesmo domínio)
      if (link.hostname === window.location.hostname) {
        link.addEventListener("click", e => {
          e.preventDefault();
          const url = link.href;

          // Cria a transição
          document.startViewTransition(() => {
            window.location.href = url;
          });
        });
      }
    });
  });
}
