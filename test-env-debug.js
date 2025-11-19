const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const content = fs.readFileSync(envPath, 'utf8');
const lines = content.split('\n');

console.log('Total lines:', lines.length);
console.log('File size:', content.length, 'bytes\n');

lines.forEach((line, idx) => {
  console.log(`Line ${idx} (${line.length} chars): "${line.substring(0, 100)}"`);
  const hasEquals = line.includes('=');
  console.log(`  Has =: ${hasEquals}, Starts with #: ${line.trim().startsWith('#')}`);
});
