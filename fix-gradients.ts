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

      content = content.replace(/from-white to-slate-400 bg-clip-text/g, 'from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text');
      content = content.replace(/from-white to-slate-300 bg-clip-text/g, 'from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text');
      content = content.replace(/from-white to-slate-200 bg-clip-text/g, 'from-slate-900 to-slate-600 dark:from-white dark:to-slate-200 bg-clip-text');
      content = content.replace(/from-white to-indigo-[0-9]00 bg-clip-text/g, 'from-slate-900 to-indigo-600 dark:from-white dark:to-indigo-400 bg-clip-text');
      content = content.replace(/from-white to-slate-300 tracking-tight/g, 'from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 tracking-tight');
      content = content.replace(/from-white to-slate-200 tracking-wide/g, 'from-slate-900 to-slate-600 dark:from-white dark:to-slate-200 tracking-wide');
      content = content.replace(/from-white to-indigo-[0-9]00 tracking-wider/g, 'from-slate-900 to-indigo-600 dark:from-white dark:to-indigo-400 tracking-wider');
      content = content.replace(/from-white to-indigo-[0-9]00/g, 'from-slate-900 to-indigo-600 dark:from-white dark:to-indigo-400');
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

processDir('src');
