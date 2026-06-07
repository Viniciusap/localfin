'use strict';

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');

// Node version check
const major = parseInt(process.versions.node.split('.')[0], 10);
if (major < 18) {
  console.error(
    `\n  ❌  Node.js 18+ required. Running: v${process.version}` +
    `\n     Download: https://nodejs.org\n`
  );
  process.exit(1);
}

// Dependency check — only install what's missing
function hasDeps(dir) {
  return fs.existsSync(path.join(root, dir, 'node_modules'));
}

const needsRoot     = !hasDeps('.');
const needsBackend  = !hasDeps('backend');
const needsFrontend = !hasDeps('frontend');

if (needsRoot || needsBackend || needsFrontend) {
  console.log('\n  📦  First run — installing dependencies…\n');
  const run = (cmd) => execSync(cmd, { stdio: 'inherit', cwd: root });

  // Root must come first (concurrently lives here)
  if (needsRoot)     run('npm install');
  if (needsBackend)  run('npm install --prefix backend');
  if (needsFrontend) run('npm install --prefix frontend');

  console.log();
}

// .env files — idempotent, never overwrites existing
function ensureEnv(dir) {
  const example = path.join(root, dir, '.env.example');
  const target  = path.join(root, dir, '.env');
  if (!fs.existsSync(target) && fs.existsSync(example)) {
    fs.copyFileSync(example, target);
    console.log(`  ✓  ${dir}/.env created from .env.example`);
  }
}

ensureEnv('backend');
ensureEnv('frontend');
