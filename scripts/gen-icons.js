// Gera ícones PNG a partir de um SVG embutido (sem depender de arquivos externos)
// Uso: npm run gen:icons  (adiciona --force para sobrescrever)
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const force = process.argv.includes('--force');
const outDir = path.resolve('assets/icons');
await fs.mkdir(outDir, { recursive: true });

// SVG base (24x24) escalável
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
 <rect width="24" height="24" rx="5" fill="#0b0f0d"/>
 <path d="M3 12h4l2-3 4 6 3-4h5" stroke="#2dbd6e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
 <circle cx="20" cy="8" r="2" stroke="#7fe3b1" stroke-width="2" fill="none"/>
</svg>`;

async function writeIcon(name, size, { maskable } = {}){
  const file = path.join(outDir, name);
  try{
    const stat = await fs.stat(file);
    if(!force && stat.size > 0){
      console.log('Skip', name);
      return;
    }
  }catch{}
  let pipeline = sharp(Buffer.from(svg));
  if(maskable){
    const inner = Math.round(size * 0.72);
    const pad = Math.round((size - inner)/2);
    pipeline = pipeline
      .resize(inner, inner, { fit: 'contain', background: '#0b0f0d' })
      .extend({ top: pad, bottom: pad, left: pad, right: pad, background: '#0b0f0d' })
      .resize(size, size); // garante canvas exato
  }else{
    pipeline = pipeline.resize(size, size, { fit: 'contain', background: '#0b0f0d' });
  }
  await pipeline.png().toFile(file);
  console.log('Generated', name);
}

await writeIcon('icon-192.png', 192);
await writeIcon('icon-512.png', 512);
await writeIcon('maskable-192.png', 192, { maskable: true });

console.log('Pronto. Se atualizou ícones, considere aumentar versão do CACHE no sw.js ou aguardar expiração.');