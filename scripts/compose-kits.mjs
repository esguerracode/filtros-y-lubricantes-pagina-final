import sharp from 'sharp';

async function composeKitGrid(items, outId) {
    const canvasSize = 1024;
    const canvas = sharp({ create: { width: canvasSize, height: canvasSize, channels: 3, background: { r: 255, g: 255, b: 255 } } });
    const composites = [];

    // Calculate grid
    const cols = Math.ceil(Math.sqrt(items.length));
    const rows = Math.ceil(items.length / cols);
    const cellWidth = Math.floor(canvasSize / cols);
    const cellHeight = Math.floor(canvasSize / rows);
    const itemSize = Math.min(cellWidth, cellHeight) - 60; // Padding to separate them

    for (let i = 0; i < items.length; i++) {
        const id = items[i];
        const col = i % cols;
        const row = Math.floor(i / cols);

        try {
            const resized = await sharp(`public/images/products/${id}.png`)
                .resize(itemSize, itemSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
                .toBuffer();

            composites.push({
                input: resized,
                left: col * cellWidth + 30 + Math.floor((cellWidth - itemSize) / 2),
                top: row * cellHeight + 30 + Math.floor((cellHeight - itemSize) / 2),
                blend: 'multiply'
            });
        } catch (e) {
            console.log(`Missing ${id}.png for kit ${outId}`);
        }
    }

    await canvas.composite(composites)
        .png({ quality: 80, compressionLevel: 9 })
        .toFile(`public/images/products/${outId}.png`);

    console.log(`Created grid kit ${outId}.png`);
}

async function run() {
    console.log('Building composed kit images as a grid... no overlaps!');

    // 101: Toyota Revo
    await composeKitGrid([111, 112, 113, 114, 102, 102], 101);

    // 103: Toyota Vigo
    await composeKitGrid([115, 116, 113, 117, 102, 102], 103);

    // 104: Nissan NP300 Gasolina
    await composeKitGrid([118, 119, 120, 105], 104);

    // 106: Nissan NP300 Diesel
    await composeKitGrid([118, 119, 122, 123, 102, 102], 106);

    // 107: Ford Ranger Nacional
    await composeKitGrid([111, 119, 124, 125, 126, 126, 126, 126], 107);

    // 108: Ford Ranger Original
    await composeKitGrid([128, 130, 129, 127, 126, 126, 126, 126], 108);
}
run();
