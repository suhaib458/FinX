import fs from 'fs';

const filePath = 'src/components/ProjectsTab.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

content = content.replace(
  /<span className="font-bold flex items-center gap-1.5 mb-2"><X className="w-4 h-4"\/> The Problem<\/span>/g,
  '<span className="font-bold flex items-center gap-1.5 mb-2"><X className="w-4 h-4"/> {isRtl ? "المشكلة" : "The Problem"}</span>'
);

content = content.replace(
  /<span className="font-bold flex items-center gap-1.5 mb-2"><CheckCircle2 className="w-4 h-4"\/> The Solution<\/span>/g,
  '<span className="font-bold flex items-center gap-1.5 mb-2"><CheckCircle2 className="w-4 h-4"/> {isRtl ? "الحل" : "The Solution"}</span>'
);

fs.writeFileSync(filePath, content);
console.log("Replaced Problem/Solution strings");
