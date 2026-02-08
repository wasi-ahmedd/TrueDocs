
import fs from 'fs';
import path from 'path';

const inputPath = 'C:\\Users\\lenovo\\Downloads\\bip39.txt';
const outputPath = path.join(process.cwd(), 'client', 'src', 'lib', 'bip39Dict.ts');

try {
    const content = fs.readFileSync(inputPath, 'utf-8');
    const words = content.split(/\r?\n/).filter(w => w.trim().length > 0);

    const tsContent = `// Auto-generated from bip39.txt
export const BIP39_WORDS = ${JSON.stringify(words, null, 2)};
`;

    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, tsContent);
    console.log(`Successfully generated bip39Dict.ts with ${words.length} words.`);
} catch (err) {
    console.error("Error generating dictionary:", err);
    process.exit(1);
}
