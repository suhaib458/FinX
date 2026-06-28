import fs from 'fs';

const filePath = 'src/components/ProjectsTab.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Fix Toggle overlapping with Bell
// Move the toggle inside the Hero Section so it's not at the absolute top right/left.
// First, remove the Top Toggle Area from the root of ProjectsTab.
const topToggleRegex = /\{\/\* Top Toggle Area \*\/\}\s*\{\!activeProject && \!showCreate && \([\s\S]*?<\/div>\s*\)\}/;
content = content.replace(topToggleRegex, '');

// Now inject it into the hero sections of both views.
// Investor View Hero
const investorHeroRegex = /\{\/\* Unified Hero Section \*\/\}\s*<div className="flex flex-col gap-6 px-2 mt-2">\s*\{\/\* Main Title \/ Branding \*\/\}\s*<div className="flex items-center gap-4">([\s\S]*?)<\/div>\s*\{\/\* Hero Heading & Description \*\/\}/;

const toggleJSX = `
            <div className="flex bg-slate-200/50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/50 p-1.5 rounded-2xl w-full sm:w-auto shrink-0 shadow-inner mt-4 sm:mt-0">
              <button 
                onClick={() => setRole("investor")}
                className={\`flex-1 sm:w-36 py-2.5 rounded-[12px] text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 \${role === 'investor' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}\`}
              >
                {t.investorRole}
              </button>
              <button 
                onClick={() => setRole("owner")}
                className={\`flex-1 sm:w-36 py-2.5 rounded-[12px] text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 \${role === 'owner' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}\`}
              >
                {t.ownerRole}
              </button>
            </div>
`;

content = content.replace(investorHeroRegex, (match, p1) => {
  return `{/* Unified Hero Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mt-2">
          {/* Main Title / Branding */}
          <div className="flex items-center gap-4">
${p1}
          </div>
          ${toggleJSX}
        </div>
        
        {/* Hero Heading & Description */}`;
});

// Fix the H1 clipping in Investor hero
content = content.replace(/<h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">\s*Invest <span className="text-indigo-600 dark:text-indigo-400 font-medium">Nashmi<\/span>\s*<\/h1>/,
  '<h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Invest <span className="text-indigo-600 dark:text-indigo-400 font-medium">Nashmi</span></h1>'
);


// Same for Owner View Hero
const ownerHeroRegex = /<div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">\s*<div className="flex-1 space-y-4 text-center md:text-start">([\s\S]*?)<\/button>\s*<\/div>/;

content = content.replace(ownerHeroRegex, (match, p1) => {
  return `<div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 space-y-4 text-center md:text-start">
${p1}
            </button>
          </div>
          
          <div className="relative z-50 mt-6 md:mt-0 flex justify-center w-full md:w-auto">
${toggleJSX}
          </div>`;
});


// 3. Fix Projects Carousel collapse
// Add shrink-0 and specific layout to the carousel wrapper
const carouselWrapperRegex = /<div className="flex overflow-x-auto snap-x snap-mandatory pb-8 pt-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-2 lg:px-2 gap-6 scrollbar-hide">/;
content = content.replace(carouselWrapperRegex, '<div className="flex overflow-x-auto snap-x snap-mandatory pb-8 pt-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-2 lg:px-2 gap-6 scrollbar-hide shrink-0 min-h-[460px]">');

// Restore card fixed height or proper flex
const cardRegex = /<div key=\{proj\.id\} className="flex flex-col shrink-0 snap-center w-\[85vw\] sm:w-\[380px\] bg-white/g;
content = content.replace(cardRegex, '<div key={proj.id} className="flex flex-col shrink-0 snap-center w-[85vw] sm:w-[380px] h-[460px] bg-white');

// 4. Fix empty horizontal area 
// Make the empty placeholder look good or shrink
const emptyPlaceholderRegex = /<div className="flex flex-col items-center justify-center flex-1 py-16 px-6 bg-slate-50 dark:bg-slate-900\/50 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center min-h-\[50vh\] w-full">/;
content = content.replace(emptyPlaceholderRegex, '<div className="flex flex-col items-center justify-center py-16 px-6 bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center shrink-0 min-h-[300px] w-full mt-6">');

fs.writeFileSync(filePath, content);
console.log("Applied fixes");
