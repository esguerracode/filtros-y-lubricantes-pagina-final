import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';

const DIR = './public/images/products';
const MAX_KB = 200;
const TARGET_SIZE = 1024;

// Imágenes que definitivamente necesitan optimización (>200KB)
const TARGETS = ['126.png', '128.png', '129.png', '130.png', '131.png', '132.png', '133.png'];

async function optimizeImage(filePath) {
    const statBefore = await stat(filePath);
    const beforeKB = (statBefore.size / 1024).toFixed(1);

    const tempPath = filePath.replace('.png', '_opt.png');

    // Estrategia: resize a 1024x1024 con fondo blanco + PNG compresión máxima
    await sharp(filePath)
        .resize(TARGET_SIZE, TARGET_SIZE, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .flatten({ background: { r: 255, g: 255, b: 255 } })  // elimina transparencia
        .png({
            compressionLevel: 9,
            effort: 10,
            palette: false,
        })
        .toFile(tempPath);

    const statAfter = await stat(tempPath);
    const afterKB = (statAfter.size / 1024).toFixed(1);

    // Reemplazar si el resultado es más pequeño (o si el original supera el límite)
    if (statAfter.size < statBefore.size || statBefore.size > MAX_KB * 1024) {
        const { rename } = await import('fs/promises');
        const { unlink } = await import('fs/promises');
        await unlink(filePath);
        await rename(tempPath, filePath);
        return { beforeKB, afterKB: (await stat(filePath).then(s => s.size / 1024)).toFixed(1), replaced: true };
    } else {
        const { unlink } = await import('fs/promises');
        await unlink(tempPath);
        return { beforeKB, afterKB: beforeKB, replaced: false };
    }
}

async function main() {
    console.log('=== Optimizando imágenes PNG → 1024x1024, <200KB ===\n');

    for (const filename of TARGETS) {
        const filePath = join(DIR, filename);
        try {
            process.stdout.write(`  [${filename}] `);
            const result = await optimizeImage(filePath);
            const status = parseFloat(result.afterKB) <= MAX_KB ? '✅' : '⚠️';
            const arrow = result.replaced ? '→' : '(sin cambio)';
            console.log(`${status} ${result.beforeKB}KB ${arrow} ${result.afterKB}KB`);
        } catch (err) {
            console.log(`❌ ERROR: ${err.message}`);
        }
    }

    // Verificar estado final de TODOS los archivos que necesitaban reemplazo
    console.log('\n=== Estado final de imágenes críticas ===');
    const files = await readdir(DIR);
    const pngFiles = files.filter(f => f.endsWith('.png'));

    const critical = ['109', '113', '114', '115', '116', '117', '118', '119', '120', '121', '122',
        '123', '124', '125', '126', '127', '128', '129', '130', '131', '132', '133'];

    for (const id of critical) {
        const fname = `${id}.png`;
        if (pngFiles.includes(fname)) {
            const s = await stat(join(DIR, fname));
            const kb = (s.size / 1024).toFixed(1);
            const icon = parseFloat(kb) >= 10 && parseFloat(kb) <= MAX_KB ? '✅' : parseFloat(kb) > MAX_KB ? '⚠️ ' : '❌ ';
            console.log(`  ${icon} ${fname}: ${kb}KB`);
        } else {
            console.log(`  ❌  ${fname}: NO EXISTE`);
        }
    }
}

main().catch(console.error);
