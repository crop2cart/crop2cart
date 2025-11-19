const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const content = fs.readFileSync(envPath, 'utf8');
const lines = content.split('\n');

console.log('Total lines:', lines.length);
console.log('File encoding: UTF-8');
console.log('');

const env = {};
lines.forEach((line, idx) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      env[key] = value;
      console.log(`✓ Line ${idx}: ${key}`);
      console.log(`  Value length: ${value.length}`);
      console.log(`  First 50 chars: ${value.substring(0, 50)}`);
    }
  }
});

console.log('\n=== Parsed Variables ===');
Object.keys(env).forEach(key => {
  console.log(`${key}: ${env[key].length} chars`);
});
