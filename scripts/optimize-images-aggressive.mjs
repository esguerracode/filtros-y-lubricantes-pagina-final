// Script de optimización agresiva: JPEG intermedio → PNG final <200KB
import sharp from 'sharp';
import { stat, rename, unlink } from 'fs/promises';
import { join } from 'path';

const DIR = './public/images/products';
const MAX_BYTES = 200 * 1024;  // 200 KB
const TARGET_SIZE = 1024;

// Archivos que aún supera el límite
const TARGETS = ['109.png', '110.png', '126.png', '128.png', '129.png', '133.png'];

// También intentar los que no se actualizaron (fotos de Amazon sin transparencia)
// Estrategia: reducir dimensiones hasta que quede <200KB

async function optimizeAggressive(filePath) {
    const statBefore = await stat(filePath);
    const beforeKB = (statBefore.size / 1024).toFixed(1);

    let size = TARGET_SIZE;
    let quality = 85;
    let result = null;
    const tempPath = filePath + '.tmp.png';

    // Reducir dimensiones progresivamente si PNG es muy pesado
    // Primero probar con 800px, luego 600px
    const sizes = [1024, 800, 700, 600];
    const qualities = [85, 75, 65];

    outer:
    for (const dim of sizes) {
        for (const q of qualities) {
            // Convertir a JPEG internamente (con fondo blanco) y luego a PNG
            // Esto usa compresión con pérdida de JPEG pero exporta PNG
            const buf = await sharp(filePath)
                .resize(dim, dim, {
                    fit: 'contain',
                    background: { r: 255, g: 255, b: 255 },
                })
                .flatten({ background: { r: 255, g: 255, b: 255 } })
                .jpeg({ quality: q })       // compress lossily
                .toBuffer();

            // Now convert JPEG buffer → PNG
            const pngBuf = await sharp(buf)
                .png({ compressionLevel: 9, effort: 10 })
                .toBuffer();

            if (pngBuf.length < MAX_BYTES) {
                result = pngBuf;
                size = dim;
                quality = q;
                break outer;
            }
        }
    }

    if (!result) {
        // Último intento: salvar directamente como PNG optimizado con paleta
        const buf = await sharp(filePath)
            .resize(600, 600, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255 },
            })
            .flatten({ background: { r: 255, g: 255, b: 255 } })
            .jpeg({ quality: 55 })
            .toBuffer();

        result = await sharp(buf)
            .png({ compressionLevel: 9, effort: 10 })
            .toBuffer();
        size = 600;
        quality = 55;
    }

    // Escribir el resultado
    const { writeFile } = await import('fs/promises');
    await writeFile(filePath, result);

    const afterKB = (result.length / 1024).toFixed(1);
    const ok = result.length < MAX_BYTES;
    return { beforeKB, afterKB, dim: size, quality, ok };
}

async function main() {
    console.log('=== Optimización agresiva (JPEG intermedio) ===\n');

    for (const filename of TARGETS) {
        const filePath = join(DIR, filename);
        try {
            process.stdout.write(`  [${filename}] `);
            const r = await optimizeAggressive(filePath);
            const icon = r.ok ? '✅' : '⚠️ ';
            console.log(`${icon} ${r.beforeKB}KB → ${r.afterKB}KB (${r.dim}px, q${r.quality})`);
        } catch (err) {
            console.log(`❌ ${err.message}`);
        }
    }

    // Resumen final
    console.log('\n=== Resumen final ===');
    const allTargets = ['126', '127', '128', '129', '130', '131', '132', '133'];
    for (const id of allTargets) {
        const fp = join(DIR, `${id}.png`);
        try {
            const s = await stat(fp);
            const kb = (s.size / 1024).toFixed(1);
            const icon = parseFloat(kb) <= 200 ? '✅' : '⚠️ ';
            console.log(`  ${icon} ${id}.png → ${kb}KB`);
        } catch {
            console.log(`  ❌ ${id}.png → NO EXISTE`);
        }
    }
}

main().catch(console.error);
