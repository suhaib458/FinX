import fs from 'fs';

const filePath = 'src/components/ProjectsTab.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Investment Requests - Investor View
const oldInvestorReqs = /\{investorRequests\.length > 0 && \(\s*<div className="pt-10 mt-8 border-t border-slate-200\/80 dark:border-slate-800\/80">([\s\S]*?)<\/div>\s*\)\}/;

const newInvestorReqs = `{investorRequests.length > 0 && (
          <div className="pt-10 mt-8 border-t border-slate-200/80 dark:border-slate-800/80">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              {isRtl ? "طلباتي الاستثمارية" : "My Investment Requests"}
            </h3>
            <div className="flex flex-col gap-3 w-full">
              {investorRequests.map(req => (
                <div key={req.id} className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between gap-4 cursor-pointer">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                      <Briefcase className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h4 className="font-bold text-base text-slate-900 dark:text-white truncate">{req.projectName}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {req.message.includes('interested') ? "أنا مهتم بمناقشة الاستثمار في مشروعكم." : req.message}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] text-slate-400 font-medium">اليوم</span>
                      <span className={\`text-[11px] px-3 py-1 rounded-full font-bold uppercase tracking-wide \${
                        req.status === 'accepted' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20' :
                        req.status === 'declined' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-500/20' :
                        'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-500/20'
                      }\`}>
                        {getStatusText(req.status)}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 rtl:rotate-180" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}`;

content = content.replace(oldInvestorReqs, newInvestorReqs);

// Investment Requests - Owner View
const oldOwnerReqsRegex = /\{ownerRequests\.length > 0 && \(\s*<div className="pt-10 border-t border-slate-200\/80 dark:border-slate-800\/80">([\s\S]*?)<\/div>\s*\)\}/;

const newOwnerReqs = `{ownerRequests.length > 0 && (
              <div className="pt-10 border-t border-slate-200/80 dark:border-slate-800/80">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3 px-2">
                  <MessageSquare className="w-6 h-6 text-indigo-500" />
                  {isRtl ? "طلبات الاستثمار الواردة" : "Incoming Investment Requests"}
                </h3>
                <div className="flex flex-col gap-3 w-full px-2">
                  {ownerRequests.map(req => (
                    <div key={req.id} className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between gap-4 cursor-pointer">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-500/20">
                          <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <h4 className="font-bold text-base text-slate-900 dark:text-white truncate">{req.investorName}</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {req.projectName} - {req.message.includes('interested') ? "أنا مهتم بمناقشة الاستثمار في مشروعكم." : req.message}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[10px] text-slate-400 font-medium">اليوم</span>
                          <span className={\`text-[11px] px-3 py-1 rounded-full font-bold uppercase tracking-wide \${
                            req.status === 'accepted' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20' :
                            req.status === 'declined' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-500/20' :
                            'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-500/20'
                          }\`}>
                            {getStatusText(req.status)}
                          </span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400 rtl:rotate-180" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}`;

content = content.replace(oldOwnerReqsRegex, newOwnerReqs);

// Details page: Contact / Invest CTA
const buttonsRegex = /<button[^>]*onClick=\{handleInvest\}[^>]*>[\s\S]*?<\/button>\s*<div className="flex gap-3">\s*<button className="flex-1 w-full md:w-auto px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-all flex items-center justify-center gap-2">[\s\S]*?<\/button>\s*<SaveButton[\s\S]*?\/>\s*<\/div>/;

const newButtons = `<div className="flex flex-col gap-3">
               <button className="w-full px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
                 <MessageSquare className="w-5 h-5" />
                 {t.contactFounder}
               </button>
               <div className="flex gap-3">
                 <button 
                   onClick={handleInvest}
                   disabled={investing}
                   className="flex-1 w-full px-6 py-3 bg-white dark:bg-[#0f172a] border-2 border-slate-200 dark:border-slate-800 hover:border-indigo-600 dark:hover:border-indigo-400 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                   {investing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Briefcase className="w-4 h-4 text-indigo-500" />}
                   {isRtl ? "طلب استثمار" : "Invest"}
                 </button>
                 <SaveButton itemType="project" itemId={proj.id!} title={proj.name} subtitle={proj.summary || proj.problem} className="px-4 py-3 bg-white dark:bg-[#0f172a] border-2 border-slate-200 dark:border-slate-800 hover:border-indigo-600 dark:hover:border-indigo-400 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-all flex items-center justify-center shadow-sm" />
               </div>
            </div>`;

content = content.replace(buttonsRegex, newButtons);

// Details page: Status Tracking Block (Remove overlapping details, keep clean)
const statusTrackRegex = /\{\/\* Status Tracking \*\/\}\s*<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">[\s\S]*?<\/div>\s*<\/div>/;

const newStatusTrack = `{/* Status Tracking */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                 <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                   <ShieldCheck className="w-5 h-5 text-emerald-500" />
                   {isRtl ? "حالة المشروع" : "Project Status"}
                 </h3>
                 <div className="space-y-4">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-500/20">
                         <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                       </div>
                       <div>
                         <p className="text-sm font-bold text-slate-900 dark:text-white">
                           {isRtl ? "مدقق أمنياً ومالياً" : "Verified by FinX"}
                         </p>
                         <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Identity & market viability checked.</p>
                       </div>
                    </div>
                 </div>
              </div>
            </div>`;
content = content.replace(statusTrackRegex, newStatusTrack);

fs.writeFileSync(filePath, content);
console.log("Reqs modified");
