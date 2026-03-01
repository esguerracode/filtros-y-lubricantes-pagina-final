import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';

const DIR = './public/images/products';
const OUT_DIR = './public/images/products/ux_optimized';
const CANVAS = 1024;
const PADDING = 100;

// No more watermarked images, we regenerated them natively using AI
const WATERMARK_TARGETS = [];

async function applyUXUISkill(filename) {
    const filePath = join(DIR, filename);
    const outPath = join(OUT_DIR, filename);

    try {
        const itemSize = CANVAS - PADDING * 2;

        let image = sharp(filePath);
        const metadata = await image.metadata();

        // If this image is from premium filters, let's crop the bottom 12% to remove the typical watermark logo.
        if (WATERMARK_TARGETS.includes(filename)) {
            const cropHeight = Math.floor(metadata.height * 0.88);
            image = image.extract({ left: 0, top: 0, width: metadata.width, height: cropHeight });
        }

        // Ensure image is processed with a 100% white background, centered, with padding.
        await image
            .resize(itemSize, itemSize, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            })
            .extend({
                top: PADDING,
                bottom: PADDING,
                left: PADDING,
                right: PADDING,
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            })
            .flatten({ background: { r: 255, g: 255, b: 255 } })
            .png({ quality: 85, compressionLevel: 9, effort: 10 })
            .toFile(outPath);

        console.log(`✅ [UX_IMG_001] Processed with UX/UI Rules: ${filename}`);
        return true;
    } catch (err) {
        console.error(`❌ [UX_IMG_001] Error in ${filename}: ${err.message}`);
        return false;
    }
}

async function main() {
    console.log('=== Invocando Skill: UX_IMG_001 (Image Composition & UX Specialist) ===\n');
    console.log('REGLAS APLICADAS:');
    console.log('- Fondo mandatario R: 255, G: 255, B: 255 (Blanco Puro)');
    console.log(`- Respiración (Padding): ${PADDING}px simétrico`);
    console.log(`- Recorte Anti-Watermark: 12% inferior para productos de terceros`);
    console.log(`- Resolución final: ${CANVAS}x${CANVAS}px estandarizado\n`);

    const { mkdir } = await import('fs/promises');
    try {
        await mkdir(OUT_DIR, { recursive: true });
    } catch (err) { }

    const files = await readdir(DIR);
    const pngFiles = files.filter(f => f.endsWith('.png') && !f.includes('_opt'));

    for (const file of pngFiles) {
        await applyUXUISkill(file);
    }

    console.log('\n=== Proceso finalizado. Imágenes listas para copiar. ===');
}

main().catch(console.error);
