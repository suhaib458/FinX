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
      
      content = content.replace(/dark:hover:text-slate-800 dark:text-slate-200/g, 'dark:hover:text-slate-200');
      content = content.replace(/dark:hover:text-slate-800 dark:hover:text-slate-200/g, 'dark:hover:text-slate-200');
      content = content.replace(/hover:text-slate-800 dark:hover:text-slate-200/g, 'hover:text-slate-900 dark:hover:text-slate-200');
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

processDir('src');
