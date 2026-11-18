/** Catálogo da pizzaria. Preços em centavos (inteiros) para o cálculo não acumular erro de ponto flutuante. */

export type TamanhoId = 0 | 1 | 2;

export type Tamanho = {
  readonly id: TamanhoId;
  readonly nome: string;
  readonly sigla: string;
  readonly peso: string;
};

export const tamanhos: readonly [Tamanho, Tamanho, Tamanho] = [
  { id: 0, nome: 'Pequena', sigla: 'P', peso: '320g' },
  { id: 1, nome: 'Média', sigla: 'M', peso: '530g' },
  { id: 2, nome: 'Grande', sigla: 'G', peso: '860g' },
];

export type Pizza = {
  readonly id: number;
  readonly slug: string;
  readonly nome: string;
  readonly descricao: string;
  /** Preço por tamanho (pequena, média, grande), em centavos. */
  readonly precos: readonly [number, number, number];
};

export const pizzas: readonly Pizza[] = [
  { id: 1, slug: 'mussarela', nome: 'Mussarela', descricao: 'Molho de tomate, mussarela derretida e orégano.', precos: [2015, 5095, 8050] },
  { id: 2, slug: 'calabresa', nome: 'Calabresa', descricao: 'Calabresa fatiada e cebola sobre mussarela e molho de tomate.', precos: [2025, 5049, 8010] },
  { id: 3, slug: 'quatro-queijos', nome: 'Quatro Queijos', descricao: 'Mussarela, provolone, parmesão e gorgonzola.', precos: [2036, 5042, 8099] },
  { id: 4, slug: 'americana', nome: 'Americana', descricao: 'Mussarela, bacon, ovo e cebola.', precos: [2047, 5015, 8055] },
  { id: 5, slug: 'portuguesa', nome: 'Portuguesa', descricao: 'Presunto, ovo, cebola, azeitona e mussarela.', precos: [2059, 5098, 8019] },
  { id: 6, slug: 'moda-da-casa', nome: 'Moda da Casa', descricao: 'Receita da casa com mussarela, legumes e ervas frescas.', precos: [2014, 5058, 8002] },
  { id: 7, slug: 'chocolate', nome: 'Chocolate', descricao: 'Pizza doce com chocolate ao leite derretido e granulado.', precos: [2085, 5099, 8009] },
];

export const DESCONTO = 0.1;

const formatador = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const brl = (centavos: number): string => formatador.format(centavos / 100);

export const pizzaPorId = (id: number): Pizza | undefined => pizzas.find((p) => p.id === id);
