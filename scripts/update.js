const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');

function rimraf(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`✓ removed ${path.relative(root, dir)}`);
  }
}

function run(cmd) {
  execSync(cmd, { stdio: 'inherit', cwd: root });
}

console.log('\n  localfin — updating...\n');

rimraf(path.join(root, 'node_modules'));
rimraf(path.join(root, 'backend', 'node_modules'));
rimraf(path.join(root, 'frontend', 'node_modules'));

console.log('\n  reinstalling dependencies...\n');
run('npm run setup');

console.log('\n  Done. Run: npm run dev\n');
