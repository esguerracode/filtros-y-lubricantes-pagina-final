import fs from 'fs';
import path from 'path';

const artifactsDir = 'C:\\Users\\esgue\\.gemini\\antigravity\\brain\\a6ac72f0-2573-4410-bd2b-b47306d54637';
const targetDir = path.resolve('./public/images/products');

const files = fs.readdirSync(artifactsDir);
const genFiles = files.filter(f => f.startsWith('gen_') && f.endsWith('.png'));

const targets = ['111', '112', '113', '114', '115', '116', '117', '118', '119', '120', '122', '123', '124', '125'];

for (const target of targets) {
    // Find the generated file starting with gen_{target}_
    const matchedFiles = genFiles.filter(f => f.startsWith(`gen_${target}_`));
    if (matchedFiles.length > 0) {
        // get the latest one by parsing the timestamp or just taking the last element if sorted alphabetically (timestamp increases)
        matchedFiles.sort();
        const latestFile = matchedFiles[matchedFiles.length - 1];

        const sourcePath = path.join(artifactsDir, latestFile);
        const destPath = path.join(targetDir, `${target}.png`);

        fs.copyFileSync(sourcePath, destPath);
        console.log(`Copied ${latestFile} to ${target}.png`);
    } else {
        console.log(`No generated file found for ${target}`);
    }
}
