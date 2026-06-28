import React, { useEffect, useState } from "react";
import { Flame, Award, Gift, Clock, Search, Lock, Zap, CheckCircle2, History } from "lucide-react";
import { RewardsService, RewardProfile, RewardActivity, RewardsCatalogItem } from "../lib/rewards";

interface RewardsTabProps {
  lang: "ar" | "en";
  isPro: boolean;
  profile: RewardProfile;
  uid?: string;
}

export default function RewardsTab({ lang, isPro, profile, uid }: RewardsTabProps) {
  const isRtl = lang === "ar";
  const [history, setHistory] = useState<RewardActivity[]>([]);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    if (uid) {
      RewardsService.getHistory(uid).then(setHistory);
    }
  }, [uid, profile.points]); // refresh history when points change

  const achievementsList = [
    { id: "first_goal", icon: <CheckCircle2 className="w-5 h-5 text-accent-green" />, title: lang === "ar" ? "أول هدف" : "First Goal Created", desc: lang === "ar" ? "قمت بإنشاء أول أهدافك المالية" : "Created your first financial goal" },
    { id: "7_day_streak", icon: <Flame className="w-5 h-5 text-orange-400" />, title: lang === "ar" ? "بطل الاستمرارية - أسبوع" : "7-Day Streak", desc: lang === "ar" ? "استخدمت التطبيق 7 أيام متتالية" : "Used the app for 7 consecutive days" },
    { id: "budget_master", icon: <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />, title: lang === "ar" ? "سيد الميزانية" : "Budget Master", desc: lang === "ar" ? "التزمت بميزانيتك لمدة شهر" : "Stuck to your budget for a month" }
  ];

  const handleRedeem = async (itemId: string) => {
    if (!uid) return;
    setRedeeming(itemId);
    try {
      const res = await RewardsService.redeemReward(uid, itemId);
      if (res.success) {
        alert(lang === "ar" ? "تم استبدال المكافأة بنجاح!" : "Reward redeemed successfully!");
      } else {
        alert(res.error || "Failed to redeem");
      }
    } catch (e) {
      alert("Error redeeming reward");
    }
    setRedeeming(null);
  };

  const catalog = RewardsService.getRewardsCatalog();

  return (
    <div className={`p-4 sm:p-6 pb-24 overflow-y-auto no-scrollbar h-full ${isRtl ? 'font-arabic' : 'font-sans'}`} dir="ltr">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Top Engagement Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 rounded-3xl bg-surface-primary border border-border-primary flex flex-col items-center justify-center text-center relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none"></div>
            <Award className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mb-3" />
            <h2 className="text-4xl font-bold text-text-primary font-mono tracking-tight">{profile.points}</h2>
            <p className="text-text-primary dark:text-text-secondary text-sm mt-1">{lang === "ar" ? "النقاط الحالية" : "Current Points"}</p>
            {isPro && (
              <div className="absolute top-4 right-4 flex items-center gap-1 text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                <Zap className="w-3 h-3" /> 2x Multiplier
              </div>
            )}
          </div>
          
          <div className="p-6 rounded-3xl bg-surface-primary border border-border-primary flex flex-col items-center justify-center text-center relative overflow-hidden shadow-lg">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/10 blur-[50px] rounded-full pointer-events-none"></div>
            <Flame className="w-8 h-8 text-orange-400 mb-3" />
            <h2 className="text-4xl font-bold text-text-primary font-mono tracking-tight">{profile.currentStreak}</h2>
            <p className="text-text-primary dark:text-text-secondary text-sm mt-1 mb-2">{lang === "ar" ? "سلسلة الأيام الحالية" : "Current Streak"}</p>
            <div className="text-[11px] text-text-primary dark:text-text-secondary font-medium px-3 py-1 bg-surface-primary rounded-full border border-border-primary">
              {lang === "ar" ? "أفضل سلسلة:" : "Longest:"} <span className="text-orange-400 font-bold">{profile.longestStreak}</span>
            </div>
          </div>
        </div>

        {/* Next Reward Progress */}
        <div className="p-6 rounded-3xl bg-surface-primary border border-border-primary relative overflow-hidden">
          <div className="flex items-center justify-between mb-3 relative z-10">
            <h3 className="font-bold text-text-primary">
              {lang === "ar" ? "التقدم نحو المكافأة التالية" : "Progress Toward Next Reward"}
            </h3>
            <span className="text-sm font-mono text-indigo-600 dark:text-indigo-400 font-bold">{profile.points} / 500</span>
          </div>
          <div className="w-full h-3 bg-white dark:bg-slate-950 rounded-full overflow-hidden mt-2 relative z-10">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-blue-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
              style={{ width: `${Math.min((profile.points / 500) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-text-primary dark:text-text-secondary mt-4 leading-relaxed relative z-10">
            {lang === "ar" 
              ? "استمر في تسجيل الدخول يومياً وإكمال أهدافك لجمع المزيد من النقاط. الاشتراك في باقة نشمي برو يضاعف نقاطك 2x!"
              : "Keep logging in daily and completing your goals to earn more points. Nashmi Pro doubles your earnings 2x!"}
          </p>
        </div>

        {/* Rewards Store */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-text-primary">{lang === "ar" ? "سوق المكافآت" : "Rewards Catalog"}</h3>
            <span className="text-xs font-medium text-text-primary dark:text-text-secondary bg-surface-primary px-3 py-1 rounded-full border border-border-primary">
              {catalog.length} {lang === "ar" ? "عناصر" : "Items"}
            </span>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {catalog.map((item) => {
              const canAfford = profile.points >= item.cost;
              return (
                <div key={item.id} className="flex flex-col p-5 rounded-3xl bg-surface-primary border border-slate-300 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-colors group relative overflow-hidden">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${canAfford ? 'bg-gradient-to-br from-indigo-500/20 to-blue-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400' : 'bg-surface-primary border-border-primary text-text-primary dark:text-text-secondary'}`}>
                      {item.iconType === 'lock' ? <Lock className="w-5 h-5" /> : item.iconType === 'coffee' ? <Gift className="w-5 h-5" /> : <Gift className="w-5 h-5" />}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold font-mono border ${canAfford ? 'bg-emerald-500/10 text-accent-green border-emerald-500/20' : 'bg-surface-primary text-text-primary dark:text-text-secondary border-border-primary'}`}>
                      {item.cost} pts
                    </div>
                  </div>
                  <h4 className={`font-bold text-base mb-1 ${canAfford ? 'text-text-primary' : 'text-text-primary dark:text-text-secondary'}`}>{lang === "ar" ? item.titleAr : item.titleEn}</h4>
                  
                  <div className="mt-auto pt-4 flex items-center gap-3">
                    <button 
                      onClick={() => handleRedeem(item.id)}
                      disabled={!canAfford || redeeming === item.id}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${canAfford ? 'bg-indigo-600 hover:bg-indigo-500 text-text-primary shadow-lg shadow-indigo-500/20' : 'bg-surface-primary text-text-primary dark:text-text-secondary cursor-not-allowed border border-border-primary'}`}
                    >
                      {redeeming === item.id ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        lang === "ar" ? "استبدال الآن" : "Redeem Now"
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Achievements section */}
        <div>
          <h3 className="text-lg font-bold text-text-primary mb-4">{lang === "ar" ? "الإنجازات" : "Achievements"}</h3>
          <div className="space-y-3">
            {achievementsList.map((ach) => {
              const isUnlocked = profile.achievements.includes(ach.id);
              return (
                <div key={ach.id} className={`flex items-center gap-4 p-4 rounded-2xl border ${isUnlocked ? 'bg-surface-primary border-slate-300 dark:border-slate-700' : 'bg-surface-primary border-slate-200/80 dark:border-slate-800/50 opacity-60'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${isUnlocked ? 'bg-bg-secondary border-slate-600' : 'bg-[#F7F8FA] dark:bg-transparent border-border-primary'}`}>
                    {isUnlocked ? ach.icon : <Lock className="w-5 h-5 text-text-primary dark:text-text-secondary" />}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-bold text-sm ${isUnlocked ? 'text-text-primary' : 'text-text-primary dark:text-text-secondary'}`}>{ach.title}</h4>
                    <p className="text-xs text-text-primary dark:text-text-secondary mt-1">{ach.desc}</p>
                  </div>
                  {isUnlocked && <div className="text-[10px] font-bold uppercase tracking-wider text-accent-green bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">{lang === "ar" ? "مكتمل" : "Unlocked"}</div>}
                </div>
              )
            })}
          </div>
        </div>

        {/* History Log */}
        <div>
          <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <History className="w-5 h-5 opacity-70" />
            {lang === "ar" ? "سجل النشاط" : "Activity Log"}
          </h3>
          <div className="bg-surface-primary rounded-3xl border border-border-primary overflow-hidden">
            {history.length === 0 ? (
              <div className="p-8 text-center text-text-primary dark:text-text-secondary text-sm">
                {lang === "ar" ? "لا يوجد نشاط مسجل بعد." : "No activity recorded yet."}
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {history.map((record) => (
                  <div key={record.id} className="p-4 flex items-center justify-between hover:bg-slate-900/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                        record.type === 'earn' ? 'bg-emerald-500/10 border-emerald-500/20 text-accent-green' :
                        record.type === 'redeem' ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400' :
                        record.type === 'streak' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                        'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                      }`}>
                        {record.type === 'earn' ? <Award className="w-4 h-4" /> :
                         record.type === 'redeem' ? <Gift className="w-4 h-4" /> :
                         <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{record.title}</p>
                        <p className="text-[10px] text-text-primary dark:text-text-secondary mt-0.5">{record.date.toLocaleString(lang === "ar" ? 'ar-SA' : 'en-US')}</p>
                      </div>
                    </div>
                    {record.pointsAmount !== 0 && (
                      <span className={`font-mono text-sm font-bold ${record.pointsAmount > 0 ? 'text-accent-green' : 'text-rose-600 dark:text-rose-400'}`}>
                        {record.pointsAmount > 0 ? '+' : ''}{record.pointsAmount}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
