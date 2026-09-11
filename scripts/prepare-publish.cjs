// Produce an isolated source checkout without touching the user's existing Git history.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const out = path.join(root,'.site-publish','current');
const files = [...require('./public-files.cjs'),'package.json','package-lock.json','.gitignore','.openai/hosting.json','scripts/build.cjs','scripts/serve.cjs','scripts/public-files.cjs','tests/site.test.cjs'];
for (const file of files) {
  fs.mkdirSync(path.dirname(path.join(out,file)),{recursive:true});
  fs.copyFileSync(path.join(root,file),path.join(out,file));
}
console.log('Prepared isolated publishing source in .site-publish/current/');
