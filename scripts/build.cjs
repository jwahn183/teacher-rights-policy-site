const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'dist');
const files = require('./public-files.cjs');
fs.mkdirSync(out, { recursive: true });
// Superseded generated files only; original designs are retained in archive/.
for (const legacy of ['final.css', 'final.js', 'policy-data.js']) {
  const target = path.join(out, legacy);
  if (fs.existsSync(target)) fs.unlinkSync(target);
}
for (const file of files) {
  const source = fs.readFileSync(path.join(root, file));
  if (!source.length) throw new Error(`Empty source: ${file}`);
  fs.mkdirSync(path.dirname(path.join(out, file)), { recursive: true });
  fs.writeFileSync(path.join(out, file), source);
}
console.log(`Built ${files.length} static files in dist/`);
