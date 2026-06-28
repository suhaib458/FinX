import fs from 'fs';

const filePath = 'src/components/ProjectsTab.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Remove strict height from project cards
const cardRegex = /className="flex flex-col shrink-0 snap-center w-\[85vw\] sm:w-\[400px\] h-\[480px\] bg-white/g;
content = content.replace(cardRegex, 'className="flex flex-col shrink-0 snap-center w-[85vw] sm:w-[380px] bg-white');

// For owner requests it's a grid, the cards are fine with h-full.

fs.writeFileSync(filePath, content);
console.log("Removed fixed height from project cards");
