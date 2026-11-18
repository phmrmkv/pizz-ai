# Pizz.ai

Landing page de demonstração da **Pizz.ai**, um assistente com IA que monta o pedido de pizza: a pessoa conversa ("somos 4, um não come carne, queremos gastar até R$ 120"), e a IA sugere sabores e tamanhos, divide meio a meio, lembra preferências e envia o pedido para a pizzaria parceira.

O produto está em desenvolvimento: não há pizzarias parceiras nem pedidos reais. Os botões abrem avisos, nada é enviado, e a conversa da página é um exemplo ilustrativo. O logo é provisório.

Feito com Astro (saída estática), Tailwind CSS 4 e TypeScript. Sem React: os diálogos são `<dialog>` nativos. Ilustração da pizza em SVG, sem imagens.

## Como rodar

- `npm install`
- `npm run dev`, `npm run check`, `npm run build`, `npm run preview`
- `node scripts/gerar-marca.mjs` refaz `favicon.svg`, `apple-touch-icon.png` e `og-image.png` (sharp)

Site publicado em: https://pizzai.libertycondominio.online (hospedagem estática com `public/.htaccess`).

Origem: começou como estudo de curso (Projeto Pizzaria). A versão original em HTML + CSS + JavaScript está em `referencias/original/`, fora do build.

Produto em desenvolvimento pela PHMR Tech Solutions. Projeto de Paulo H. M. Rabelo · [PHMR Tech Solutions](https://phmr.libertycondominio.online)
