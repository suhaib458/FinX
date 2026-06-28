import fs from 'fs';

const filePath = 'src/components/ProjectsTab.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// I will wrap the entire Hero section correctly
content = content.replace(/\{\/\* Unified Hero Section \*\/\}\s*<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mt-2">/, '{/* Unified Hero Section */}\n        <div className="flex flex-col gap-6 mt-2">\n          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">');

fs.writeFileSync(filePath, content);
console.log("Fixed extra div");
