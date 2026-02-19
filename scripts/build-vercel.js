const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const clientDist = path.join(rootDir, 'client', 'dist');
const publicDir = path.join(rootDir, 'public');

console.log('Building all packages...');
execSync('npm run build:all', { stdio: 'inherit', cwd: rootDir });

console.log('Consolidating build output...');

if (fs.existsSync(publicDir)) {
  console.log('Cleaning up existing public directory...');
  fs.rmSync(publicDir, { recursive: true, force: true });
}

if (fs.existsSync(clientDist)) {
  console.log('Copying client/dist to public...');
  fs.mkdirSync(publicDir, { recursive: true });

  const copyRecursiveSync = (src, dest) => {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
      fs.mkdirSync(dest, { recursive: true });
      fs.readdirSync(src).forEach((childItemName) => {
        copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
      });
    } else {
      fs.copyFileSync(src, dest);
    }
  };

  copyRecursiveSync(clientDist, publicDir);
  console.log('Build output consolidated successfully.');
} else {
  console.error('Error: client/dist directory not found. Build might have failed.');
  process.exit(1);
}
