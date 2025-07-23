// Save as binToHex.ts or binToHex.js

import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(".", 'output.bin');

// Read binary file
const buffer = fs.readFileSync(filePath);

// Convert buffer to hex string
const hexString = buffer.toString('hex');

// Print or save the hex string
console.log('✅ Hex string:');
console.log(hexString);

// Optional: Save to file
fs.writeFileSync(path.join(".", 'output_hex.txt'), hexString);
console.log('✅ Hex string saved to output_hex.txt');
