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

      // Cleanup dupes
      content = content.replace(/dark:text-slate-400 dark:text-slate-400 dark:text-slate-400/g, 'dark:text-slate-400');
      content = content.replace(/dark:text-slate-400 dark:text-slate-400/g, 'dark:text-slate-400');
      content = content.replace(/text-slate-700 dark:text-slate-400 dark:text-slate-400/g, 'text-slate-700 dark:text-slate-400');
      
      content = content.replace(/dark:text-slate-300 dark:text-slate-300/g, 'dark:text-slate-300');
      content = content.replace(/dark:text-slate-200 dark:text-slate-200/g, 'dark:text-slate-200');
      content = content.replace(/dark:text-slate-100 dark:text-slate-100/g, 'dark:text-slate-100');
      
      content = content.replace(/group-hover\/cat:text-slate-900 dark:text-slate-100/g, 'group-hover/cat:text-slate-900 dark:group-hover/cat:text-slate-100');
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

processDir('src');
