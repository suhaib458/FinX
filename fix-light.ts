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

      // Make backgrounds solid or stronger in light mode
      content = content.replace(/bg-white\/[0-9]+/g, 'bg-white');
      content = content.replace(/bg-slate-50\/[0-9]+/g, 'bg-slate-50');
      content = content.replace(/bg-slate-100\/[0-9]+/g, 'bg-slate-100');
      content = content.replace(/(?<!dark:)bg-slate-200\/[0-9]+/g, 'bg-slate-100 dark:bg-slate-800');

      // Make slate text stronger in light mode: 500->600, 400->600
      content = content.replace(/(?<!dark:)text-slate-400\b/g, 'text-slate-700 dark:text-slate-400');
      content = content.replace(/(?<!dark:)text-slate-500\b/g, 'text-slate-600 dark:text-slate-400');
      content = content.replace(/(?<!dark:)text-slate-600\b/g, 'text-slate-700 dark:text-slate-400');

      // Cleanup dupes
      content = content.replace(/text-slate-600 dark:text-slate-600 dark:text-slate-400/g, 'text-slate-600 dark:text-slate-400');
      content = content.replace(/text-slate-700 dark:text-slate-700 dark:text-slate-400/g, 'text-slate-700 dark:text-slate-400');
      content = content.replace(/dark:text-slate-500/g, 'dark:text-slate-400');
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

processDir('src');
