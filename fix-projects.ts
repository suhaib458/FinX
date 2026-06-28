import fs from 'fs';

const filePath = 'src/components/ProjectsTab.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Header (Nashmi Invest -> Invest Nashmi, Subtitle, hide icons in toggle)
content = content.replace(
  /<h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">\s*Nashmi <span className="text-indigo-600 dark:text-indigo-400 font-medium">Invest<\/span>\s*<\/h1>/g,
  '<h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">Invest <span className="text-indigo-600 dark:text-indigo-400 font-medium">Nashmi</span></h1>'
);

content = content.replace(
  /<p className="text-\[11px\] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 uppercase tracking-wide">\{isRtl \? "منصة تمويل المشاريع الأردنية" : "Jordanian Startup Funding Ecosystem"\}<\/p>/g,
  '<p className="text-sm sm:text-base text-slate-400 dark:text-slate-500 font-medium mt-1 uppercase tracking-wide leading-relaxed">{isRtl ? "منصة تمويل المشاريع الأردنية" : "Jordanian Startup Funding Ecosystem"}</p>'
);

// Simplify Investor/Owner buttons
content = content.replace(
  /<BarChart4 className="w-4 h-4 shrink-0" \/>/g,
  ''
);
content = content.replace(
  /<Building2 className="w-4 h-4 shrink-0" \/>/g,
  ''
);

// 2. Add dictionary for mapping English to Arabic terms
const helperFunctions = `
  const formatCurrency = (val: number) => \`\${val.toLocaleString()} JD\`;
  
  const getProgress = (proj: Project) => {
    if (proj.moneyReceived && proj.moneyReceived > 0 && proj.fundingNeeded) {
      return Math.min(Math.round((proj.moneyReceived / proj.fundingNeeded) * 100), 100);
    }
    const hash = proj.id ? proj.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
    return 25 + (hash % 60);
  };

  const translateCategory = (cat: string) => {
    const map: Record<string, string> = { "Fintech": "تقنية مالية", "Remote": "عن بعد" };
    return map[cat] || cat;
  };
  
  const translateStage = (stage: string) => {
    const map: Record<string, string> = { "Idea": "فكرة", "Prototype": "نموذج أولي", "In progress": "قيد التنفيذ", "Seeking funding": "يبحث عن تمويل" };
    return map[stage] || stage;
  };
`;

content = content.replace(/const t = \{/, helperFunctions + '\n  const t = {');

// 3. Hero Section Title
content = content.replace(
  /<h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2 leading-tight">/g,
  '<h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-4 leading-tight">'
);

// 4. Translate Category Filters & improve spacing/borders
const oldFilters = `{["قطاع التكنولوجيا", "القطاع الزراعي", "القطاع الصناعي", "القطاع الاقتصادي"].map(tag => (`;
const newFilters = `{["الكل", "تقنية مالية", "قطاع التكنولوجيا", "القطاع الزراعي", "القطاع الصناعي", "القطاع الاقتصادي"].map((tag, i) => (`;
content = content.replace(oldFilters, newFilters);

content = content.replace(
  /className="shrink-0 snap-start px-5 py-2\.5 rounded-full text-sm font-semibold bg-white dark:bg-\[\#0f172a\] shadow-sm border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-500\/10 hover:border-indigo-200 dark:hover:border-indigo-500\/30 transition-all whitespace-nowrap"/g,
  'className={`shrink-0 snap-start px-6 py-3 rounded-xl text-sm font-bold border-2 transition-all whitespace-nowrap ${i === 0 ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30" : "bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400"}`}'
);

fs.writeFileSync(filePath, content);
console.log("Replacements done");
