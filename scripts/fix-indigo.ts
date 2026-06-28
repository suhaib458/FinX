import fs from 'fs';
import path from 'path';

function processDir(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');

      content = content.replace(/(?<!dark:)text-indigo-400/g, 'text-indigo-600 dark:text-indigo-400');
      content = content.replace(/(?<!dark:)text-indigo-300/g, 'text-indigo-500 dark:text-indigo-300');
      
      content = content.replace(/dark:text-indigo-600 dark:text-indigo-400/g, 'dark:text-indigo-400');
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

processDir('src');
