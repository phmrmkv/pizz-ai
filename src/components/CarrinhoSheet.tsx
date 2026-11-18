import { useState } from 'react';
import { MinusIcon, PlusIcon, ShoppingCartIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Toaster } from '@/components/ui/sonner';
import { DESCONTO, brl, pizzaPorId, tamanhos, type TamanhoId } from '@/data/catalogo';
import { QT_MAX, alterarQuantidade, precoUnitario, remover, resumir, useCarrinho } from '@/lib/carrinho';
import { useMudou } from '@/lib/useMudou';

type Props = {
  /** URL da miniatura de cada pizza (id -> src), gerada pelo Astro. */
  miniaturas: Record<number, string>;
};

const chave = (pizzaId: number, tamanho: TamanhoId) => `${pizzaId}@${tamanho}`;

export default function CarrinhoSheet({ miniaturas }: Props) {
  const itens = useCarrinho();
  const resumo = resumir(itens);
  const [aberto, setAberto] = useState(false);
  const [saindo, setSaindo] = useState<string | null>(null);
  const contadorMudou = useMudou(resumo.quantidade);
  const totalMudou = useMudou(resumo.total);

  const finalizar = () => {
    setAberto(false);
    toast.info('Demonstração: nada foi cobrado', {
      description: 'Este site é um projeto de estudo. Nenhum pedido foi enviado e nenhum valor será cobrado.',
      duration: 9000,
    });
  };

  // O item esmaece (150 ms, igual ao fechar do guia) e só então sai do carrinho.
  const tirar = (pizzaId: number, tamanho: TamanhoId, depois: () => void) => {
    setSaindo(chave(pizzaId, tamanho));
    window.setTimeout(() => {
      depois();
      setSaindo(null);
    }, 150);
  };

  return (
    <>
      <Sheet open={aberto} onOpenChange={setAberto}>
        <SheetTrigger asChild>
          <button
            type="button"
            className="botao-carrinho inline-flex h-11 items-center gap-2 rounded-lg px-4 font-semibold"
          >
            <ShoppingCartIcon className="size-5" aria-hidden="true" />
            <span>Carrinho</span>
            <span key={resumo.quantidade} data-muda={contadorMudou} className="contador">
              {resumo.quantidade}
            </span>
            <span className="sr-only">{resumo.quantidade === 1 ? 'item' : 'itens'}</span>
          </button>
        </SheetTrigger>

        <SheetContent className="w-full gap-0 p-0 sm:max-w-md" rotuloFechar="Fechar">
          <SheetHeader className="p-5 pr-16">
            <SheetTitle className="text-xl">Suas Pizzas</SheetTitle>
            <SheetDescription>Pedido de demonstração, com {Math.round(DESCONTO * 100)}% de desconto.</SheetDescription>
          </SheetHeader>

          {itens.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
              <p className="text-muted-foreground">Seu carrinho está vazio.</p>
              <SheetClose className="press inline-flex h-11 items-center rounded-full border border-input px-6 font-medium hover:bg-accent">
                Ver o cardápio
              </SheetClose>
            </div>
          ) : (
            <ul className="flex-1 divide-y divide-border overflow-y-auto px-5" aria-label="Itens do carrinho">
              {itens.map((item, i) => {
                const pizza = pizzaPorId(item.pizzaId);
                if (!pizza) return null;
                const tam = tamanhos[item.tamanho];
                const nome = `${pizza.nome} (${tam.nome})`;
                const k = chave(item.pizzaId, item.tamanho);
                return (
                  <li
                    key={k}
                    className="carrinho-item flex items-center gap-3 py-4"
                    style={{ ['--i' as string]: Math.min(i, 6) }}
                    data-saindo={saindo === k}
                  >
                    <img
                      src={miniaturas[pizza.id]}
                      alt=""
                      width={56}
                      height={56}
                      className="size-14 shrink-0 rounded-full bg-bolha object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{nome}</div>
                      <div className="text-sm text-muted-foreground tabular-nums">
                        {brl(precoUnitario(item.pizzaId, item.tamanho))} cada
                      </div>
                      <div className="mt-1 inline-flex items-center rounded-lg border border-input" role="group" aria-label={`Quantidade de ${nome}`}>
                        <button
                          type="button"
                          className="passo inline-flex size-11 items-center justify-center rounded-l-lg"
                          onClick={() =>
                            item.qt > 1
                              ? alterarQuantidade(item.pizzaId, item.tamanho, -1)
                              : tirar(item.pizzaId, item.tamanho, () => remover(item.pizzaId, item.tamanho))
                          }
                          aria-label={`Diminuir quantidade de ${nome}`}
                        >
                          <MinusIcon className="size-4" aria-hidden="true" />
                        </button>
                        <output className="min-w-8 text-center font-semibold tabular-nums">{item.qt}</output>
                        <button
                          type="button"
                          className="passo inline-flex size-11 items-center justify-center rounded-r-lg"
                          onClick={() => alterarQuantidade(item.pizzaId, item.tamanho, 1)}
                          disabled={item.qt >= QT_MAX}
                          aria-label={`Aumentar quantidade de ${nome}`}
                        >
                          <PlusIcon className="size-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="passo inline-flex size-11 shrink-0 items-center justify-center self-start rounded-full text-muted-foreground hover:text-destructive"
                      onClick={() => tirar(item.pizzaId, item.tamanho, () => remover(item.pizzaId, item.tamanho))}
                      aria-label={`Remover ${nome}`}
                    >
                      <Trash2Icon className="size-5" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <SheetFooter className="gap-0 border-t p-5">
            <dl className="text-sm">
              <div className="flex justify-between py-2">
                <dt className="font-semibold">Subtotal</dt>
                <dd className="tabular-nums">{brl(resumo.subtotal)}</dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="font-semibold">Desconto (-{Math.round(DESCONTO * 100)}%)</dt>
                <dd className="tabular-nums">{resumo.desconto > 0 ? `- ${brl(resumo.desconto)}` : brl(0)}</dd>
              </div>
              <div className="flex justify-between border-t py-3 text-xl font-semibold">
                <dt>Total</dt>
                <dd key={resumo.total} data-muda={totalMudou} className="total-valor tabular-nums">
                  {brl(resumo.total)}
                </dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={finalizar}
              disabled={itens.length === 0}
              className="press botao-compra inline-flex h-12 items-center justify-center rounded-full px-6 font-semibold"
            >
              Finalizar a compra
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <Toaster position="bottom-center" />
    </>
  );
}
