import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, TrendingUp, Gift } from 'lucide-react';

export default function SavingsChallenge() {
  const navigate = useNavigate();
  const [joined, setJoined] = useState(false);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary pb-20 font-sans" dir="rtl">
      <header className="px-4 py-3 flex items-center justify-between sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-surface-primary shadow-sm border border-border-primary hover:bg-bg-secondary transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">تحدي التوفير</h1>
        <div className="w-9 h-9" />
      </header>

      <div className="px-4 space-y-4 mt-4">
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-6 rounded-[1.25rem] shadow-lg relative overflow-hidden flex flex-col items-center text-center">
           <TrendingUp className="w-12 h-12 mb-4 text-amber-200" />
           <h2 className="text-xl font-black mb-2 tracking-tight">بطل التوفير الأسبوعي!</h2>
           <p className="text-amber-100 text-xs leading-relaxed">وفّر 10 JOD من مصروفك لهذا الأسبوع واحصل على مكافأة إضافية.</p>
        </div>

        <div className="bg-surface-primary p-5 rounded-[1.25rem] border border-border-primary shadow-sm text-center">
           <Gift className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
           <div className="text-xs text-text-secondary mb-1">المكافأة المتوقعة</div>
           <div className="text-2xl font-black text-text-primary">2.00 JOD</div>
        </div>

        {!joined ? (
          <button onClick={() => setJoined(true)} className="w-full bg-amber-500 hover:bg-accent-orange text-white p-3.5 rounded-2xl font-bold text-base active:scale-[0.98] transition-transform shadow-md mt-2">
            انضم للتحدي الآن
          </button>
        ) : (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 text-accent-green p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 text-center font-bold text-sm mt-2">
            لقد انضممت للتحدي! راقب مصروفك!
          </div>
        )}
      </div>
    </div>
  );
}
