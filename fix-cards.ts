import fs from 'fs';

const filePath = 'src/components/ProjectsTab.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const startMarker = '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-6 sm:gap-8 mb-8 px-2">';
const endMarker = '          </div>\n        )}';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const newCardsCarousel = `<div className="flex overflow-x-auto snap-x snap-mandatory pb-8 pt-4 -mx-4 px-4 sm:mx-0 sm:px-2 gap-6 scrollbar-hide">
            {projects.map(proj => {
              const pct = getProgress(proj);
              return (
              <div key={proj.id} className="flex flex-col shrink-0 snap-center w-[85vw] sm:w-[400px] h-[480px] bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800/80 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:border-indigo-500/30 transition-all duration-300">
                <div className="h-44 bg-slate-100 dark:bg-slate-900 relative group cursor-pointer shrink-0" onClick={() => setActiveProject(proj)}>
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                   <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent group-hover:scale-110 transition-transform duration-700"></div>
                   <div className="absolute bottom-4 left-5 right-5 z-20 flex flex-wrap justify-between items-end gap-2">
                     <div className="flex flex-wrap gap-2">
                       <span className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-[11px] font-bold tracking-wide border border-white/20">
                         {translateCategory(proj.category)}
                       </span>
                       <span className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-[11px] font-bold tracking-wide border border-white/20 flex items-center gap-1">
                         <MapPin className="w-3.5 h-3.5" />
                         {translateCategory(proj.location)}
                       </span>
                     </div>
                     <span className="inline-block px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-md text-emerald-100 text-[11px] font-bold shadow-sm">
                       {translateStage(proj.stage)}
                     </span>
                   </div>
                </div>

                <div className="p-6 flex flex-col flex-1 min-h-0">
                  <div className="mb-3">
                     <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight hover:text-indigo-500 transition-colors cursor-pointer line-clamp-2" onClick={() => setActiveProject(proj)}>{proj.name}</h3>
                     <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1.5">
                       <Briefcase className="w-4 h-4 shrink-0" />
                       <span className="font-medium truncate">{proj.founderName}</span>
                     </p>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed line-clamp-2">
                    {proj.problem}
                  </p>

                  <div className="mt-auto flex flex-col gap-6">
                    <div className="space-y-2">
                       <div className="flex justify-between items-end">
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{isRtl ? "نسبة التمويل" : "Funding Progress"}</span>
                          <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                            {pct}%
                          </span>
                       </div>
                       <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: \`\${pct}%\` }}></div>
                       </div>
                    </div>

                    <div className="flex items-center gap-3 pt-5 border-t border-slate-100 dark:border-slate-800/80">
                      <button onClick={() => setActiveProject(proj)} className="flex-1 h-14 bg-indigo-600 hover:bg-indigo-700 text-white text-base font-bold rounded-2xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 active:scale-[0.98]">
                        <span>{t.viewDetails}</span>
                      </button>
                      <button className="w-14 h-14 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50 rounded-2xl transition-all shrink-0 shadow-sm" onClick={() => setActiveProject(proj)}>
                        <Eye className="w-5 h-5 shrink-0" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )})}
`;
  
  content = content.substring(0, startIndex) + newCardsCarousel + content.substring(endIndex);
  fs.writeFileSync(filePath, content);
  console.log("Cards replaced");
} else {
  console.log("Not found", startIndex, endIndex);
}
