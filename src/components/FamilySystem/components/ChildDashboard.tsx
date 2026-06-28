import React, { useEffect } from 'react';
import { Wallet, Target, TrendingUp, Trophy, ArrowUpRight, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { FamilyMember } from '../types';

interface ChildDashboardProps {
  profile: FamilyMember;
}

export default function ChildDashboard({ profile }: ChildDashboardProps) {
  const navigate = useNavigate();

  useEffect(() => {
    // Simple role validation: Child must have a valid session token
    if (!sessionStorage.getItem('child_auth')) {
      navigate('/family/auth/child', { replace: true });
    }
  }, [navigate]);

  const remaining = profile.weeklyLimit - profile.spentThisWeek;
  const progress = Math.min((profile.spentThisWeek / profile.weeklyLimit) * 100, 100);
  
  if (!sessionStorage.getItem('child_auth')) return null;

  return (
    <div className="space-y-4 pb-20 font-sans" dir="rtl">
      {/* Mobile-style header */}
      <header className="px-4 py-3 flex items-center justify-between sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-md">
        <button onClick={() => navigate('/family')} className="p-2 rounded-full bg-surface-primary shadow-sm border border-border-primary hover:bg-bg-secondary transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">محفظتي الذكية</h1>
        <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center text-accent-green font-bold text-sm">
           أ
        </div>
      </header>

      <div className="px-4 space-y-4">
        {/* Wallet Summary */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white p-5 rounded-[1.25rem] shadow-lg relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform" onClick={() => navigate('/family/wallet/transactions')}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <h2 className="text-xs opacity-90 mb-1 font-medium tracking-wide">رصيدي المتاح (My Allowance)</h2>
              <div className="text-3xl font-extrabold tracking-tight">{profile.allowance.toFixed(2)} <span className="text-lg">JOD</span></div>
            </div>
            <div className="bg-white/20 backdrop-blur-md px-2.5 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1.5">
               <Trophy className="w-3.5 h-3.5 text-yellow-300" />
               {profile.score} نقطة
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-[11px] mb-1.5 opacity-90 font-medium">
               <span>تم إنفاق {profile.spentThisWeek.toFixed(2)}</span>
               <span>الحد: {profile.weeklyLimit.toFixed(2)}</span>
            </div>
            <div className="h-2 bg-black/20 rounded-full overflow-hidden">
               <div 
                 className={`h-full rounded-full ${progress > 80 ? 'bg-rose-400' : 'bg-white'}`}
                 style={{ width: `${progress}%` }}
               ></div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
           <button 
             onClick={() => navigate('/family/child/request')}
             className="bg-surface-primary p-3 rounded-2xl border border-border-primary flex flex-col items-center justify-center gap-2 shadow-sm hover:border-emerald-500 active:scale-[0.98] transition-all"
           >
             <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full flex items-center justify-center">
               <ArrowUpRight className="w-5 h-5" />
             </div>
             <span className="font-bold text-sm text-text-primary">طلب مصروف</span>
           </button>
           
           <button onClick={() => navigate('/family/child/rewards')} className="bg-surface-primary p-3 rounded-2xl border border-border-primary flex flex-col items-center justify-center gap-2 shadow-sm hover:border-indigo-500 active:scale-[0.98] transition-all">
             <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-full flex items-center justify-center">
               <Target className="w-5 h-5" />
             </div>
             <span className="font-bold text-sm text-text-primary">المهام والمكافآت</span>
           </button>
        </div>

        {/* Educational Hub preview */}
        <div>
          <h3 className="font-bold text-base mb-3 text-text-primary flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-500" />
            تحدي التوفير
          </h3>
          <div onClick={() => navigate('/family/child/challenge')} className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 p-4 rounded-2xl border border-amber-200 dark:border-amber-800/50 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform">
             <div>
               <div className="font-bold text-sm text-amber-900 dark:text-amber-100 mb-0.5">وفّر 10 JOD هذا الأسبوع</div>
               <div className="text-[11px] text-amber-700 dark:text-amber-300">احصل على مكافأة 2 JOD!</div>
             </div>
             <button className="px-3 py-1.5 bg-amber-500 hover:bg-accent-orange text-white rounded-xl font-bold text-xs shadow-sm transition-colors pointer-events-none">
               ابدأ
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
