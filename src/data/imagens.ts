import mussarela from '@/assets/pizzas/mussarela.png';
import calabresa from '@/assets/pizzas/calabresa.png';
import quatroQueijos from '@/assets/pizzas/quatro-queijos.png';
import americana from '@/assets/pizzas/americana.png';
import portuguesa from '@/assets/pizzas/portuguesa.png';
import modaDaCasa from '@/assets/pizzas/moda-da-casa.png';
import chocolate from '@/assets/pizzas/chocolate.png';

/** Só o Astro (páginas e layouts) importa este arquivo; as ilhas React recebem URLs prontas. */
export const imagens: Record<string, ImageMetadata> = {
  mussarela,
  calabresa,
  'quatro-queijos': quatroQueijos,
  americana,
  portuguesa,
  'moda-da-casa': modaDaCasa,
  chocolate,
};
