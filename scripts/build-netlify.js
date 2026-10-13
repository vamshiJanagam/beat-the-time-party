const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'node_modules', 'three', 'build', 'three.module.js');
const destinationDir = path.join(root, 'public', 'vendor');
const destination = path.join(destinationDir, 'three.module.js');
if (!fs.existsSync(source)) {
  console.error('Three.js was not installed. Netlify should install dependencies from package-lock.json before building.');
  process.exit(1);
}
fs.mkdirSync(destinationDir, { recursive: true });
fs.copyFileSync(source, destination);
console.log('Prepared the Three.js browser module for the static game.');
