import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, TrendingUp, Gift, Trophy, Activity, CheckCircle2 } from 'lucide-react';
import { useFamilyMembers, useFamilyAuth } from '../FamilyContext';

export default function SavingsChallenge() {
  const navigate = useNavigate();
  const { members, updateMember } = useFamilyMembers();
  const { isChildAuth, activeChildId } = useFamilyAuth();
  const child = members.find(m => m.id === activeChildId) || members.find(m => m.role === 'child');
  
  const [joined, setJoined] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isChildAuth) {
      navigate('/family', { replace: true });
    }
  }, [navigate, isChildAuth]);

  if (!isChildAuth || !child) return null;

  useEffect(() => {
    if (joined && child) {
      // Calculate progress based on remaining limit vs spent
      const targetSavings = 10.0;
      const unspent = child.weeklyLimit - child.spentThisWeek;
      const currentProgress = Math.min((unspent / targetSavings) * 100, 100);
      setProgress(currentProgress);
    }
  }, [joined, child]);

  const handleJoin = () => {
    setJoined(true);
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary pb-20 font-sans" dir="rtl">
      <header className="px-4 py-3 flex items-center justify-between sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-md border-b border-border-primary/50">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-surface-primary shadow-sm border border-border-primary hover:bg-bg-secondary transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">تحدي التوفير</h1>
        <div className="w-9 h-9" />
      </header>

      <div className="px-4 space-y-5 mt-5">
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-6 rounded-[1.5rem] shadow-xl relative overflow-hidden flex flex-col items-center text-center">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
           <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl transform -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
           
           <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm border border-white/30 mb-4">
             <TrendingUp className="w-10 h-10 text-white" />
           </div>
           
           <h2 className="text-2xl font-black mb-2 tracking-tight">بطل التوفير الأسبوعي!</h2>
           <p className="text-amber-50 text-sm leading-relaxed max-w-[260px]">وفّر 10 JOD من مصروفك الأسبوعي واحصل على مكافأة فورية ونقاط إضافية.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface-primary p-4 rounded-[1.25rem] border border-border-primary shadow-sm flex flex-col items-center justify-center text-center">
             <Gift className="w-6 h-6 text-emerald-500 mb-2" />
             <div className="text-xs text-text-secondary mb-1">مكافأة نقدية</div>
             <div className="text-xl font-black text-text-primary">2.00 JOD</div>
          </div>
          <div className="bg-surface-primary p-4 rounded-[1.25rem] border border-border-primary shadow-sm flex flex-col items-center justify-center text-center">
             <Trophy className="w-6 h-6 text-yellow-500 mb-2" />
             <div className="text-xs text-text-secondary mb-1">نقاط إضافية</div>
             <div className="text-xl font-black text-text-primary">+500 نقطة</div>
          </div>
        </div>

        {joined && (
          <div className="bg-surface-primary p-5 rounded-[1.25rem] border border-border-primary shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" />
                تقدمك الحالي
              </h3>
              <div className="font-bold text-indigo-600 dark:text-indigo-400">
                {Math.round(progress)}%
              </div>
            </div>
            
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner mb-3">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <p className="text-xs text-text-secondary text-center">
              {progress >= 100 
                ? "أنت بطل التوفير! لقد حققت الهدف 🎉" 
                : "استمر في توفير مصروفك لتحصل على المكافأة!"}
            </p>
          </div>
        )}

        {!joined ? (
          <button 
            onClick={handleJoin} 
            className="w-full bg-amber-500 hover:bg-accent-orange text-white p-4 rounded-2xl font-bold text-base active:scale-[0.98] transition-all shadow-md mt-2 flex items-center justify-center gap-2"
          >
            انضم للتحدي الآن
          </button>
        ) : progress >= 100 ? (
           <button 
             className="w-full bg-emerald-500 text-white p-4 rounded-2xl font-bold text-base active:scale-[0.98] transition-all shadow-md mt-2 flex items-center justify-center gap-2"
           >
             <CheckCircle2 className="w-5 h-5" />
             استلم المكافأة الآن
           </button>
        ) : (
          <div className="bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 p-4 rounded-2xl border-2 border-emerald-200 dark:border-emerald-800/50 text-center font-bold text-sm mt-2 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            لقد انضممت للتحدي بنجاح
          </div>
        )}
      </div>
    </div>
  );
}
