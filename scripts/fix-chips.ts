import fs from 'fs';

const filePath = 'src/components/ProjectsTab.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Add state variable
content = content.replace(
  'const [role, setRole] = useState<"owner" | "investor">("investor");',
  'const [role, setRole] = useState<"owner" | "investor">("investor");\n  const [activeCategory, setActiveCategory] = useState("الكل");'
);

// 2. Modify map for categories to use activeCategory
const oldMap = /\{\["الكل", "تقنية مالية", "قطاع التكنولوجيا", "القطاع الزراعي", "القطاع الصناعي", "القطاع الاقتصادي"\]\.map\(\(tag, i\) => \([\s\S]*?className=\{`shrink-0 snap-start px-6 py-3 rounded-full text-sm font-bold border-2 transition-all whitespace-nowrap \$\{i === 0 \? "bg-indigo-600 border-indigo-600 text-white shadow-md" : "bg-white dark:bg-\[#0f172a\] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400"}`\}\>([\s\S]*?)<\/button>\s*\)\)\}/;

const newMap = `{["الكل", "تقنية مالية", "قطاع التكنولوجيا", "القطاع الزراعي", "القطاع الصناعي", "القطاع الاقتصادي"].map((tag) => (
              <button 
                key={tag} 
                onClick={() => setActiveCategory(tag)}
                className={\`shrink-0 snap-start px-6 py-3 h-12 rounded-full text-sm font-bold border-2 transition-all whitespace-nowrap \${activeCategory === tag ? "bg-indigo-600 border-indigo-600 text-white shadow-md" : "bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400"}\`}>
                {tag}
              </button>
            ))}`;

content = content.replace(oldMap, newMap);

fs.writeFileSync(filePath, content);
console.log("Replaced Category Chips Map");
