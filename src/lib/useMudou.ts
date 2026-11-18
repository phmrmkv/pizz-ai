import { useEffect, useRef } from 'react';

/** true só na renderização em que o valor mudou (não na primeira); serve para animar a troca de um número. */
export function useMudou<T>(valor: T): boolean {
  const anterior = useRef(valor);
  const mudou = anterior.current !== valor;
  useEffect(() => {
    anterior.current = valor;
  });
  return mudou;
}
