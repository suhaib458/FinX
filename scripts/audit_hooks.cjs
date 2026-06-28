const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', (filePath) => {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('useEffect')) {
    console.log(`\n\n--- ${filePath} ---`);
    const lines = content.split('\n');
    let inEffect = false;
    let braceCount = 0;
    lines.forEach((line, index) => {
      if (line.includes('useEffect(')) {
        inEffect = true;
        braceCount = 0;
      }
      if (inEffect) {
        console.log(`${index + 1}: ${line}`);
        braceCount += (line.match(/\{/g) || []).length;
        braceCount -= (line.match(/\}/g) || []).length;
        if (braceCount === 0 && line.includes('}')) {
          inEffect = false;
        }
      }
    });
  }
});
