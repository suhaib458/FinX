import fs from 'fs';

const filePath = 'src/components/ProjectsTab.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

content = content.replace('pt-10 pb-40', 'pt-6 pb-24');

fs.writeFileSync(filePath, content);
console.log("Replaced large paddings");
