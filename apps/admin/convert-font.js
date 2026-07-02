const fs = require('fs');

const fontFile = fs.readFileSync('./public/fonts/NotoSansBengali-Regular.ttf');
const base64 = fontFile.toString('base64');

const output = `export const notoSansBengaliBase64 = "${base64}";\n`;

fs.writeFileSync('./src/lib/notoSansBengaliFont.ts', output);

console.log('Font converted successfully!');
console.log('Output size:', base64.length, 'characters');