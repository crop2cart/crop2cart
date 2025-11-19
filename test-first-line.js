const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const content = fs.readFileSync(envPath, 'utf8');
const lines = content.split('\n');

console.log('Checking first line specifically:\n');
const line0 = lines[0];
console.log(`Raw length: ${line0.length}`);
console.log(`Full line: "${line0}"`);
console.log(`Char codes: ${Array.from(line0).map((c, i) => `${i}:${c.charCodeAt(0)}`).join(' | ')}`);

const match = line0.match(/^([^=]+)=(.*)$/);
if (match) {
  console.log(`\n✓ Matched!`);
  console.log(`Key: "${match[1]}"`);
  console.log(`Value: "${match[2]}"`);
} else {
  console.log(`\n✗ Did not match regex`);
}
