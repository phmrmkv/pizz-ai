// Interações da página (docs/transicoes.md). Tudo aqui é melhoria: se este arquivo
// não carregar, a página continua legível com âncoras e CSS puros.

const reduzido = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Curva do sistema, cubic-bezier(0.22, 1, 0.36, 1), resolvida por Newton-Raphson
// para a rolagem por JS seguir a mesma sensação das transições em CSS.
function curvaSuave(t: number): number {
  const x1 = 0.22, y1 = 1, x2 = 0.36, y2 = 1;
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (u: number) => ((ax * u + bx) * u + cx) * u;
  const dsx = (u: number) => (3 * ax * u + 2 * bx) * u + cx;
  let u = t;
  for (let i = 0; i < 6; i++) {
    const d = dsx(u);
    if (Math.abs(d) < 1e-6) break;
    u -= (sx(u) - t) / d;
  }
  u = Math.min(1, Math.max(0, u));
  return ((ay * u + by) * u + cy) * u;
}

let rolagemAtual = 0;
function rolarAte(y: number, aoTerminar?: () => void) {
  cancelAnimationFrame(rolagemAtual);
  const inicio = window.scrollY;
  const distancia = y - inicio;
  if (Math.abs(distancia) < 2) {
    window.scrollTo(0, y);
    aoTerminar?.();
    return;
  }
  // Mínimo e máximo vêm dos tokens --dur-scroll-min/max; com movimento reduzido, rolagem curta (300 ms).
  const tok = (n: string, padrao: number) => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(n)) || padrao;
  const duracao = reduzido() ? 300 : Math.min(tok('--dur-scroll-max', 900), Math.max(tok('--dur-scroll-min', 450), Math.abs(distancia) * 0.25));
  const t0 = performance.now();
  const passo = (agora: number) => {
    const p = Math.min(1, (agora - t0) / duracao);
    window.scrollTo(0, inicio + distancia * curvaSuave(p));
    if (p < 1) rolagemAtual = requestAnimationFrame(passo);
    else aoTerminar?.();
  };
  rolagemAtual = requestAnimationFrame(passo);
}

for (const ev of ['wheel', 'touchstart', 'keydown'] as const) {
  window.addEventListener(ev, () => cancelAnimationFrame(rolagemAtual), { passive: true });
}

// Menu do celular
const menuBotao = document.querySelector<HTMLButtonElement>('[data-menu-botao]');
const menuPainel = document.querySelector<HTMLElement>('[data-menu-painel]');
function fecharMenu(devolverFoco = false) {
  if (!menuBotao || !menuPainel || !menuPainel.hasAttribute('data-aberto')) return;
  menuPainel.removeAttribute('data-aberto');
  menuBotao.setAttribute('aria-expanded', 'false');
  if (devolverFoco) menuBotao.focus();
}
if (menuBotao && menuPainel) {
  menuBotao.addEventListener('click', () => {
    const abrir = !menuPainel.hasAttribute('data-aberto');
    menuPainel.toggleAttribute('data-aberto', abrir);
    menuBotao.setAttribute('aria-expanded', String(abrir));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuPainel.hasAttribute('data-aberto')) fecharMenu(true);
  });
  // Clique fora do menu fecha (sem roubar o foco do que foi clicado)
  document.addEventListener('click', (e) => {
    if (!menuPainel.hasAttribute('data-aberto')) return;
    const alvo = e.target as Node;
    if (!menuPainel.contains(alvo) && !menuBotao.contains(alvo)) fecharMenu();
  });
}

// Âncoras internas: rolagem suave com a curva do sistema, foco no destino e hash na URL.
document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const link = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
  if (!link) return;
  const id = decodeURIComponent(link.hash.slice(1));
  const alvo = id ? document.getElementById(id) : null;
  if (!alvo) return;
  e.preventDefault();
  if (link.closest('[data-menu-painel]')) fecharMenu();
  history.pushState(null, '', `#${id}`);
  const margem = parseFloat(getComputedStyle(alvo).scrollMarginTop) || 0;
  const y = id === 'inicio' ? 0 : alvo.getBoundingClientRect().top + window.scrollY - margem;
  rolarAte(Math.max(0, y), () => {
    if (!alvo.hasAttribute('tabindex')) alvo.setAttribute('tabindex', '-1');
    alvo.focus({ preventScroll: true });
  });
});

// Cabeçalho: borda aparece quando a página sai do topo.
const cabecalho = document.querySelector<HTMLElement>('[data-cabecalho]');
if (cabecalho) {
  const marcar = () => (cabecalho.dataset.rolado = String(window.scrollY > 8));
  marcar();
  window.addEventListener('scroll', marcar, { passive: true });
}

// Seção atual no menu (sublinhado em tomate)
const nav = document.querySelector<HTMLElement>('[data-nav]');
if (nav && 'IntersectionObserver' in window) {
  const links = [...nav.querySelectorAll<HTMLAnchorElement>('a[href*="#"]')];
  const secoes = links
    .map((a) => document.getElementById(a.hash.slice(1)))
    .filter((s): s is HTMLElement => !!s);
  const visiveis = new Set<string>();
  const io = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((en) => (en.isIntersecting ? visiveis.add(en.target.id) : visiveis.delete(en.target.id)));
      const atual = secoes.find((s) => visiveis.has(s.id));
      links.forEach((a) => (atual && a.hash === `#${atual.id}` ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  secoes.forEach((s) => io.observe(s));
}

// Diálogos nativos: o navegador devolve o foco ao botão que abriu ao fechar.
document.querySelectorAll<HTMLElement>('[data-abrir]').forEach((gatilho) => {
  gatilho.addEventListener('click', () => {
    const d = document.getElementById(gatilho.dataset.abrir ?? '') as HTMLDialogElement | null;
    if (!d) return;
    // Volta o formulário da lista ao estado inicial
    d.querySelector<HTMLElement>('[data-lista-form]')?.removeAttribute('hidden');
    d.querySelector<HTMLElement>('[data-lista-ok]')?.setAttribute('hidden', '');
    d.querySelector<HTMLFormElement>('form')?.reset();
    d.showModal();
  });
});
document.querySelectorAll<HTMLDialogElement>('dialog.dlg').forEach((d) => {
  d.querySelectorAll('[data-fechar]').forEach((b) => b.addEventListener('click', () => d.close()));
  // Clique no fundo: só vale se o botão do mouse foi apertado e solto no fundo (o próprio <dialog>)
  let apertouNoFundo = false;
  d.addEventListener('pointerdown', (e) => (apertouNoFundo = e.target === d));
  d.addEventListener('click', (e) => {
    if (e.target === d && apertouNoFundo) d.close();
    apertouNoFundo = false;
  });
});
const formLista = document.querySelector<HTMLFormElement>('[data-form-lista]');
formLista?.addEventListener('submit', (e) => {
  // Validação do navegador já passou; nada é enviado: mostra o aviso no lugar do formulário.
  e.preventDefault();
  const d = formLista.closest('dialog');
  d?.querySelector<HTMLElement>('[data-lista-form]')?.setAttribute('hidden', '');
  const ok = d?.querySelector<HTMLElement>('[data-lista-ok]');
  ok?.removeAttribute('hidden');
  ok?.querySelector<HTMLElement>('[data-fechar]')?.focus();
});

// Demonstração: a conversa se monta uma vez quando aparece na tela e pode ser pausada.
const demo = document.querySelector<HTMLElement>('[data-demo]');
if (demo) {
  const controle = demo.querySelector<HTMLButtonElement>('[data-demo-controle]');
  const alvos = [...demo.querySelectorAll<HTMLElement>('[data-passo]')];
  const intervalos = [400, 1200, 1300, 1400, 1700, 1500, 1100]; // espera antes de cada mensagem (ms)
  let proximo = 0;
  let timer = 0;
  let estado: 'rodando' | 'pausada' | 'concluida' = 'rodando';

  const mostrar = (etapa: number) => alvos.forEach((el) => el.classList.toggle('visto', Number(el.dataset.passo) <= etapa));
  const rotulo = () => {
    if (!controle) return;
    controle.textContent = estado === 'rodando' ? 'Pausar' : estado === 'pausada' ? 'Continuar' : 'Ver de novo';
  };
  const agendar = () => {
    if (proximo >= intervalos.length) {
      estado = 'concluida';
      demo.classList.add('concluida');
      rotulo();
      return;
    }
    timer = window.setTimeout(() => {
      mostrar(proximo + 1);
      proximo += 1;
      agendar();
    }, intervalos[proximo]);
  };
  const iniciar = () => {
    clearTimeout(timer);
    proximo = 0;
    estado = 'rodando';
    demo.classList.remove('concluida');
    demo.classList.add('rodando');
    mostrar(0);
    if (controle) controle.hidden = false;
    rotulo();
    agendar();
  };

  if (!reduzido() && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          io.disconnect();
          iniciar();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(demo);
    controle?.addEventListener('click', () => {
      if (estado === 'rodando') {
        clearTimeout(timer);
        estado = 'pausada';
        rotulo();
      } else if (estado === 'pausada') {
        estado = 'rodando';
        rotulo();
        agendar();
      } else {
        iniciar();
      }
    });
  }
}
