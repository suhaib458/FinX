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

      content = content.replace(/(?<!dark:)text-emerald-400/g, 'text-emerald-600 dark:text-emerald-400');
      content = content.replace(/(?<!dark:)text-emerald-300/g, 'text-emerald-500 dark:text-emerald-300');
      
      content = content.replace(/(?<!dark:)text-rose-400/g, 'text-rose-600 dark:text-rose-400');
      content = content.replace(/(?<!dark:)text-rose-300/g, 'text-rose-500 dark:text-rose-300');
      
      content = content.replace(/(?<!dark:)text-amber-400/g, 'text-amber-600 dark:text-amber-400');
      content = content.replace(/(?<!dark:)text-amber-300/g, 'text-amber-500 dark:text-amber-300');
      
      content = content.replace(/(?<!dark:)text-blue-400/g, 'text-blue-600 dark:text-blue-400');
      content = content.replace(/(?<!dark:)text-blue-300/g, 'text-blue-500 dark:text-blue-300');
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

processDir('src');
