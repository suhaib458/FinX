import fs from 'fs';

const filePath = 'src/components/ProjectsTab.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Update projects.map to use activeCategory
const originalMap = /\{projects\.map\(proj => \{/g;
content = content.replace(originalMap, '{projects.filter(p => activeCategory === "الكل" || p.category === activeCategory).map(proj => {');

fs.writeFileSync(filePath, content);
console.log("Filtering applied");
