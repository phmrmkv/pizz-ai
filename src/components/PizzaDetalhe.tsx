import { useEffect, useRef, useState, type ReactNode } from 'react';
import { MinusIcon, PlusIcon } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { brl, pizzas, tamanhos, type Pizza, type TamanhoId } from '@/data/catalogo';
import { QT_MAX, adicionar, quantidadeNoCarrinho } from '@/lib/carrinho';
import { useMudou } from '@/lib/useMudou';

/** As fotos chegam do Astro já otimizadas (<Picture>), uma por pizza, nos slots p1, p2, ... */
type Props = { [slot: `p${number}`]: ReactNode };

export default function PizzaDetalhe(props: Props) {
  const [aberto, setAberto] = useState(false);
  const [pizza, setPizza] = useState<Pizza | null>(null);
  const [tamanho, setTamanho] = useState<TamanhoId>(2);
  const [qt, setQt] = useState(1);
  const qtMudou = useMudou(qt);
  // Elemento que tinha o foco ao abrir: o foco volta para ele ao fechar (não há DialogTrigger).
  const origem = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const abrir = (slug: string) => {
      const achada = pizzas.find((p) => p.slug === slug);
      if (!achada) return;
      origem.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setPizza(achada);
      setTamanho(2);
      setQt(1);
      setAberto(true);
    };
    const aoClicar = (e: Event) => abrir((e as CustomEvent<string>).detail);
    window.addEventListener('abrir-pizza', aoClicar);
    // Clique que veio antes de esta ilha carregar
    if (window.__pizzaPendente) {
      abrir(window.__pizzaPendente);
      window.__pizzaPendente = undefined;
    }
    return () => window.removeEventListener('abrir-pizza', aoClicar);
  }, []);

  const preco = pizza ? pizza.precos[tamanho] : 0;

  const confirmar = () => {
    if (!pizza) return;
    const antes = quantidadeNoCarrinho(pizza.id, tamanho);
    adicionar(pizza.id, tamanho, qt);
    const somada = quantidadeNoCarrinho(pizza.id, tamanho) - antes;
    toast.success('Adicionada ao carrinho', {
      description: `${somada} × ${pizza.nome} (${tamanhos[tamanho].nome})`,
    });
    setAberto(false);
  };

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogContent
        className="max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto p-0 sm:max-w-3xl"
        rotuloFechar="Fechar"
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          origem.current?.focus();
        }}
      >
        {pizza && (
          <div className="grid sm:grid-cols-2">
            <div className="flex items-center justify-center px-6 pt-10 pb-2 sm:p-8">
              <div className="pizza-bolha size-56 overflow-hidden rounded-full sm:size-72">
                {props[`p${pizza.id}`]}
              </div>
            </div>

            <div className="flex flex-col gap-5 p-6 sm:p-8 sm:pl-2">
              <DialogHeader>
                <DialogTitle className="text-2xl font-semibold tracking-tight">{pizza.nome}</DialogTitle>
                <DialogDescription className="text-base leading-relaxed">{pizza.descricao}</DialogDescription>
              </DialogHeader>

              <fieldset>
                <legend className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Tamanho</legend>
                <div className="grid grid-cols-3 gap-2">
                  {tamanhos.map((t) => (
                    <label
                      key={t.id}
                      className="tamanho-opcao flex min-h-14 cursor-pointer flex-col items-center justify-center rounded-lg border border-input px-2 py-2 text-center text-sm font-semibold"
                    >
                      <input
                        type="radio"
                        name="tamanho"
                        value={t.id}
                        checked={tamanho === t.id}
                        onChange={() => setTamanho(t.id)}
                        className="sr-only"
                      />
                      <span>{t.nome}</span>
                      <span className="text-xs font-normal opacity-90">{t.peso}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Preço</div>
                  <div className="text-3xl font-semibold tracking-tight tabular-nums" aria-live="polite">{brl(preco)}</div>
                </div>
                <div className="inline-flex items-center rounded-lg border border-input" role="group" aria-label="Quantidade">
                  <button
                    type="button"
                    className="passo inline-flex size-11 items-center justify-center rounded-l-lg"
                    onClick={() => setQt((q) => Math.max(1, q - 1))}
                    disabled={qt <= 1}
                    aria-label="Diminuir quantidade"
                  >
                    <MinusIcon className="size-4" aria-hidden="true" />
                  </button>
                  <output className="min-w-8 text-center text-base font-semibold tabular-nums" aria-live="polite">
                    <span key={qt} data-muda={qtMudou} className="passo-num inline-block">{qt}</span>
                  </output>
                  <button
                    type="button"
                    className="passo inline-flex size-11 items-center justify-center rounded-r-lg"
                    onClick={() => setQt((q) => Math.min(QT_MAX, q + 1))}
                    disabled={qt >= QT_MAX}
                    aria-label="Aumentar quantidade"
                  >
                    <PlusIcon className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="mt-auto flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={confirmar}
                  className="press botao-compra inline-flex h-12 items-center justify-center rounded-full px-6 font-semibold"
                >
                  Adicionar ao carrinho
                </button>
                <DialogClose className="press inline-flex h-11 items-center justify-center rounded-full text-sm font-medium text-muted-foreground hover:text-foreground">
                  Cancelar
                </DialogClose>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
