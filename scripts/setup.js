const fs = require('fs');
const path = require('path');

function copyEnv(dir) {
  const example = path.join(__dirname, '..', dir, '.env.example');
  const target = path.join(__dirname, '..', dir, '.env');
  if (!fs.existsSync(target)) {
    fs.copyFileSync(example, target);
    console.log(`✓ ${dir}/.env criado`);
  } else {
    console.log(`· ${dir}/.env já existe, pulando`);
  }
}

copyEnv('backend');
copyEnv('frontend');
console.log('\nSetup concluído. Rode: npm run dev\n');
