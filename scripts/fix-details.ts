import fs from 'fs';

const filePath = 'src/components/ProjectsTab.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Update handleInvest message
content = content.replace(
  /"I am interested in discussing an investment in your project."/g,
  '"أنا مهتم بمناقشة الاستثمار في مشروعكم."'
);

// Helper for status badge
const statusHelper = `
  const getStatusText = (status: string) => {
    if (status === 'accepted') return 'مقبول';
    if (status === 'declined') return 'مرفوض';
    return 'قيد المراجعة';
  };
`;
content = content.replace(/const getProgress =/, statusHelper + '\n  const getProgress =');

// 1. Funding Details Cards in renderProjectPitchPage
const oldFundingBlockStart = '{/* Financial Highlight */}';
const oldFundingBlockEnd = '{/* Status Tracking */}';
const startF = content.indexOf(oldFundingBlockStart);
const endF = content.indexOf(oldFundingBlockEnd, startF);

if (startF !== -1 && endF !== -1) {
  const newFundingBlock = `{/* Financial Highlight */}
              <div className="flex flex-col gap-4">
                 <h3 className="text-lg font-bold flex items-center gap-2 mb-2 text-slate-900 dark:text-white">
                   <Banknote className="w-5 h-5 text-emerald-500" />
                   {isRtl ? "تفاصيل التمويل" : "Funding Details"}
                 </h3>
                 <div className="flex overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 gap-4 scrollbar-hide">
                    {(() => {
                      const pct = getProgress(proj);
                      const raised = Math.round((proj.fundingNeeded * pct) / 100);
                      const remaining = proj.fundingNeeded - raised;
                      return (
                        <>
                          <div className="flex-col shrink-0 snap-center w-[75vw] sm:w-[200px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                            <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-bold mb-2">{isRtl ? "التمويل المطلوب" : "Funding Goal"}</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(proj.fundingNeeded)}</p>
                          </div>
                          <div className="flex-col shrink-0 snap-center w-[75vw] sm:w-[200px] bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl p-5 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                               <p className="text-emerald-700 dark:text-emerald-400 text-xs uppercase tracking-wider font-bold">{isRtl ? "تم جمعه" : "Raised Amount"}</p>
                               <span className="text-xs font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md">{pct}%</span>
                            </div>
                            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(raised)}</p>
                          </div>
                          <div className="flex-col shrink-0 snap-center w-[75vw] sm:w-[200px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5 shadow-sm">
                            <p className="text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider font-bold mb-2">{isRtl ? "المبلغ المتبقي" : "Remaining Amount"}</p>
                            <p className="text-2xl font-black text-slate-700 dark:text-slate-300">{formatCurrency(remaining)}</p>
                          </div>
                        </>
                      );
                    })()}
                 </div>
              </div>

              `;
  content = content.substring(0, startF) + newFundingBlock + content.substring(endF);
} else {
  console.log("Funding block not found");
}

fs.writeFileSync(filePath, content);
console.log("Details page modified");
