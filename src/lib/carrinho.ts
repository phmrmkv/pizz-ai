import { useSyncExternalStore } from 'react';
import { DESCONTO, pizzaPorId, type TamanhoId } from '@/data/catalogo';

export type ItemCarrinho = {
  readonly pizzaId: number;
  readonly tamanho: TamanhoId;
  readonly qt: number;
};

export type Resumo = {
  readonly quantidade: number;
  readonly subtotal: number;
  readonly desconto: number;
  readonly total: number;
};

const CHAVE = 'pizzaria-carrinho';
export const QT_MAX = 99;

const VAZIO: readonly ItemCarrinho[] = [];
let itens: readonly ItemCarrinho[] = VAZIO;
let carregado = false;
const ouvintes = new Set<() => void>();

const limitar = (qt: number) => Math.min(QT_MAX, Math.max(1, Math.trunc(qt)));

function lerSalvo(): readonly ItemCarrinho[] {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (!bruto) return VAZIO;
    const dados: unknown = JSON.parse(bruto);
    if (!Array.isArray(dados)) return VAZIO;
    const lista: ItemCarrinho[] = [];
    for (const d of dados as Record<string, unknown>[]) {
      const pizzaId = Number(d?.pizzaId);
      const tamanho = Number(d?.tamanho);
      const qt = Number(d?.qt);
      if (!pizzaPorId(pizzaId) || ![0, 1, 2].includes(tamanho) || !Number.isFinite(qt) || qt < 1) continue;
      if (lista.some((i) => i.pizzaId === pizzaId && i.tamanho === tamanho)) continue;
      lista.push({ pizzaId, tamanho: tamanho as TamanhoId, qt: limitar(qt) });
    }
    return lista;
  } catch {
    return VAZIO;
  }
}

function salvar() {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(itens));
  } catch {
    /* sem armazenamento (modo privado, cota): o carrinho vale só nesta visita */
  }
}

function emitir() {
  ouvintes.forEach((o) => o());
}

function definir(novos: readonly ItemCarrinho[]) {
  itens = novos.length ? novos : VAZIO;
  salvar();
  emitir();
}

export function adicionar(pizzaId: number, tamanho: TamanhoId, qt: number) {
  const existe = itens.some((i) => i.pizzaId === pizzaId && i.tamanho === tamanho);
  definir(
    existe
      ? itens.map((i) => (i.pizzaId === pizzaId && i.tamanho === tamanho ? { ...i, qt: limitar(i.qt + qt) } : i))
      : [...itens, { pizzaId, tamanho, qt: limitar(qt) }],
  );
}

/** Soma delta à quantidade; chegando a zero, o item sai do carrinho. */
export function alterarQuantidade(pizzaId: number, tamanho: TamanhoId, delta: number) {
  definir(
    itens
      .map((i) => (i.pizzaId === pizzaId && i.tamanho === tamanho ? { ...i, qt: Math.min(QT_MAX, i.qt + delta) } : i))
      .filter((i) => i.qt > 0),
  );
}

export function remover(pizzaId: number, tamanho: TamanhoId) {
  definir(itens.filter((i) => !(i.pizzaId === pizzaId && i.tamanho === tamanho)));
}

export function quantidadeNoCarrinho(pizzaId: number, tamanho: TamanhoId): number {
  return itens.find((i) => i.pizzaId === pizzaId && i.tamanho === tamanho)?.qt ?? 0;
}

export function precoUnitario(pizzaId: number, tamanho: TamanhoId): number {
  return pizzaPorId(pizzaId)?.precos[tamanho] ?? 0;
}

export function resumir(lista: readonly ItemCarrinho[]): Resumo {
  let quantidade = 0;
  let subtotal = 0;
  for (const i of lista) {
    quantidade += i.qt;
    subtotal += precoUnitario(i.pizzaId, i.tamanho) * i.qt;
  }
  const desconto = Math.round(subtotal * DESCONTO);
  return { quantidade, subtotal, desconto, total: subtotal - desconto };
}

function assinar(aviso: () => void) {
  if (!carregado) {
    carregado = true;
    const salvo = lerSalvo();
    if (salvo.length) itens = salvo;
    window.addEventListener('storage', (e) => {
      if (e.key === CHAVE || e.key === null) {
        itens = lerSalvo();
        emitir();
      }
    });
  }
  ouvintes.add(aviso);
  return () => {
    ouvintes.delete(aviso);
  };
}

/** Lista do carrinho; no servidor e na hidratação vem vazia, depois lê o localStorage. */
export function useCarrinho(): readonly ItemCarrinho[] {
  return useSyncExternalStore(assinar, () => itens, () => VAZIO);
}
