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

      content = content.replace(/dark:group-hover:text-indigo-500 dark:text-indigo-300/g, 'dark:group-hover:text-indigo-300');
      content = content.replace(/dark:group-hover:text-emerald-500 dark:text-emerald-300/g, 'dark:group-hover:text-emerald-300');
      content = content.replace(/dark:group-hover:text-rose-500 dark:text-rose-300/g, 'dark:group-hover:text-rose-300');
      content = content.replace(/dark:group-hover:text-amber-500 dark:text-amber-300/g, 'dark:group-hover:text-amber-300');
      content = content.replace(/dark:group-hover:text-blue-500 dark:text-blue-300/g, 'dark:group-hover:text-blue-300');
      
      content = content.replace(/dark:hover:text-indigo-500 dark:text-indigo-300/g, 'dark:hover:text-indigo-300');
      content = content.replace(/dark:hover:text-emerald-500 dark:text-emerald-300/g, 'dark:hover:text-emerald-300');
      content = content.replace(/dark:hover:text-rose-500 dark:text-rose-300/g, 'dark:hover:text-rose-300');
      content = content.replace(/dark:hover:text-amber-500 dark:text-amber-300/g, 'dark:hover:text-amber-300');
      content = content.replace(/dark:hover:text-blue-500 dark:text-blue-300/g, 'dark:hover:text-blue-300');
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

processDir('src');
