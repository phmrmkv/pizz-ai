// Interações da página. Tudo aqui é melhoria: sem este arquivo, a página continua legível.

declare global {
  interface Window {
    /** Pizza clicada antes de a ilha do detalhe terminar de carregar. */
    __pizzaPendente?: string;
  }
}

// Cabeçalho: a borda aparece quando a página sai do topo.
const cabecalho = document.querySelector<HTMLElement>('[data-cabecalho]');
if (cabecalho) {
  const marcar = () => (cabecalho.dataset.rolado = String(window.scrollY > 8));
  marcar();
  window.addEventListener('scroll', marcar, { passive: true });
}

// Cartão de pizza: avisa a ilha do detalhe (Dialog) qual pizza abrir.
document.addEventListener('click', (e) => {
  const alvo = (e.target as Element | null)?.closest<HTMLElement>('[data-abrir-pizza]');
  if (!alvo) return;
  const slug = alvo.dataset.abrirPizza ?? '';
  window.__pizzaPendente = slug;
  window.dispatchEvent(new CustomEvent('abrir-pizza', { detail: slug }));
});

export {};
