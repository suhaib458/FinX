import fs from 'fs';

const filePath = 'src/components/ProjectsTab.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Replace the gradient-only header with an actual image in projects map
const projImgRegex = /<div className="h-44 bg-slate-100 dark:bg-slate-900 relative group cursor-pointer shrink-0" onClick=\{\(\) => setActiveProject\(proj\)\}>\s*<div className="absolute inset-0 bg-gradient-to-t from-black\/80 via-black\/20 to-transparent z-10" \/>\s*<div className="absolute inset-0 opacity-40 bg-\[radial-gradient\(ellipse_at_center,_var\(--tw-gradient-stops\)\)\] from-indigo-500 via-transparent to-transparent group-hover:scale-110 transition-transform duration-700"><\/div>/g;

const newProjImg = `<div className="h-44 bg-slate-100 dark:bg-slate-900 relative group cursor-pointer shrink-0 overflow-hidden" onClick={() => setActiveProject(proj)}>
                   <img src={\`https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&q=80&auto=format&fit=crop\`} alt={proj.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 z-10" />`;

content = content.replace(projImgRegex, newProjImg);

fs.writeFileSync(filePath, content);
console.log("Replaced project header with image");
