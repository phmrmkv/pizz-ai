// Gera favicon.svg, apple-touch-icon.png e og-image.png (1200x630) a partir de formas desenhadas aqui.
// Logo PROVISÓRIO. Uso: node scripts/gerar-marca.mjs
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

const MASSA = '#d9902f', MOLHO = '#cf3f27', QUEIJO = '#f6cf6b', VERDE = '#33200f';

// O mesmo "ponto-pizza" do logo (viewBox -1 -3 28 28)
const ponto = `
  <path d="M12 12 L23 12 A11 11 0 1 1 12 1 Z" fill="${QUEIJO}" stroke="${MASSA}" stroke-width="2.2" stroke-linejoin="round"/>
  <circle cx="8" cy="9" r="1.7" fill="${MOLHO}"/><circle cx="9" cy="16" r="1.7" fill="${MOLHO}"/><circle cx="16" cy="17" r="1.7" fill="${MOLHO}"/>
  <path d="M14.2 9.8 L14.2 -1 A11 11 0 0 1 25 9.8 Z" fill="${QUEIJO}" stroke="${MASSA}" stroke-width="2.2" stroke-linejoin="round"/>`;

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="${VERDE}"/>
  <g transform="translate(8 9) scale(1.9)">${ponto}</g>
</svg>`;
writeFileSync('public/favicon.svg', favicon);
await sharp(Buffer.from(favicon.replace('rx="14"', 'rx="0"'))).resize(180, 180).png().toFile('public/apple-touch-icon.png');

// Pizza grande para a og-image
const pontos = [[60, 58], [46, 98], [62, 142], [85, 82], [80, 120], [76, 46], [80, 156], [36, 76], [38, 124]];
const calab = pontos.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="11.5" fill="#a62819"/><circle cx="${x}" cy="${y}" r="8" fill="#c8402c"/>`).join('');
const marg = pontos.map(([x, y], i) => {
  const X = 200 - x + (i % 2 ? 5 : -4), Y = y + ((i % 3) - 1) * 6;
  return i % 3 === 0 ? `<circle cx="${X}" cy="${Y}" r="10.5" fill="#e0452e"/><circle cx="${X}" cy="${Y}" r="6" fill="#f26a4f"/>`
    : i % 3 === 1 ? `<circle cx="${X}" cy="${Y}" r="9" fill="#fff6df"/>`
    : `<ellipse cx="${X}" cy="${Y}" rx="10" ry="5.2" fill="#3e8e4f" transform="rotate(25 ${X} ${Y})"/>`;
}).join('');
const pizza = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="520" height="520">
  <defs><clipPath id="e"><rect width="100" height="200"/></clipPath><clipPath id="d"><rect x="100" width="100" height="200"/></clipPath></defs>
  <circle cx="100" cy="100" r="96" fill="${MASSA}"/><circle cx="100" cy="100" r="85" fill="${MOLHO}"/><circle cx="100" cy="100" r="80" fill="${QUEIJO}"/>
  <g clip-path="url(#e)">${calab}</g><g clip-path="url(#d)">${marg}</g>
  <line x1="100" y1="14" x2="100" y2="186" stroke="#6b2a08" stroke-width="2" stroke-dasharray="2 5" stroke-linecap="round" opacity="0.5"/>
</svg>`;

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${VERDE}"/>
  <g transform="translate(690 70) scale(2.45)">${pizza.replace(/<\/?svg[^>]*>/g, '')
    .replace('<defs>', '<defs>')}</g>
  <text x="70" y="270" font-family="Segoe UI, Arial, sans-serif" font-weight="800" font-size="150" letter-spacing="-6" fill="#fff3dc">Pizz</text>
  <g transform="translate(335 165) scale(4.7)">${ponto}</g>
  <text x="452" y="270" font-family="Segoe UI, Arial, sans-serif" font-weight="800" font-size="150" letter-spacing="-6" fill="#fff3dc">ai</text>
  <text x="74" y="360" font-family="Segoe UI, Arial, sans-serif" font-weight="600" font-size="42" fill="#e6cba0">Conte quem vai comer.</text>
  <text x="74" y="414" font-family="Segoe UI, Arial, sans-serif" font-weight="600" font-size="42" fill="#e6cba0">A IA monta o pedido.</text>
  <rect x="74" y="500" width="400" height="52" rx="26" fill="#f0b24d"/>
  <text x="274" y="535" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-weight="700" font-size="26" fill="#2b1b10">Projeto em desenvolvimento</text>
</svg>`;
await sharp(Buffer.from(og)).png({ compressionLevel: 9 }).toFile('public/og-image.png');
console.log('ok');
