import fs from 'fs';

const filePath = 'src/components/ProjectsTab.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Remove extra px-2
content = content.replace(/className="px-2"/g, 'className=""');
content = content.replace(/className="pt-10 border-t border-slate-200\/80 dark:border-slate-800\/80 px-2"/g, 'className="pt-10 border-t border-slate-200/80 dark:border-slate-800/80"');
content = content.replace(/className="pt-10 border-t border-slate-200\/80 dark:border-slate-800\/80 px-2 mt-4"/g, 'className="pt-10 border-t border-slate-200/80 dark:border-slate-800/80 mt-4"');

fs.writeFileSync(filePath, content);
