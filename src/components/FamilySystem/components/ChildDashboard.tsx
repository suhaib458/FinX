import React, { useEffect } from 'react';
import { Wallet, Target, TrendingUp, Trophy, ArrowUpRight, ChevronRight, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { FamilyMember } from '../types';
import { useFamilyContext } from '../FamilyContext';

export default function ChildDashboard({ profile: initialProfile }: { profile: FamilyMember }) {
  const navigate = useNavigate();
  const { members } = useFamilyContext();
  
  // Use context member data to ensure reactivity
  const profile = members.find(m => m.id === initialProfile.id) || initialProfile;

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
    <div className="space-y-5 pb-20 font-sans" dir="rtl">
      {/* Mobile-style header */}
      <header className="px-4 py-3 flex items-center justify-between sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-md border-b border-border-primary/50">
        <button onClick={() => navigate('/family')} className="p-2.5 rounded-full bg-surface-primary shadow-sm border border-border-primary hover:bg-bg-secondary active:scale-95 transition-all">
          <ChevronRight className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-black tracking-tight">محفظتي الذكية</h1>
        <button onClick={() => navigate('/family/child/profile')} className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm border-2 border-transparent hover:border-indigo-500 active:scale-95 transition-all overflow-hidden">
          {profile.avatar ? (
            <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            profile.name.charAt(0)
          )}
        </button>
      </header>

      <div className="px-4 space-y-6">
        {/* Wallet Summary */}
        <div className={`bg-gradient-to-br from-slate-900 to-indigo-950 dark:from-slate-800 dark:to-slate-900 text-white p-6 rounded-[1.5rem] shadow-xl relative overflow-hidden ${profile.isCardFrozen ? 'opacity-75 grayscale-[50%]' : 'transition-transform'}`}>
          {profile.isCardFrozen && (
            <div className="absolute inset-0 bg-rose-900/40 backdrop-blur-[2px] z-20 flex items-center justify-center">
              <div className="bg-rose-500 text-white font-bold px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                <span>البطاقة مجمدة</span>
              </div>
            </div>
          )}
          
          {/* Card background effects */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl transform translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl transform -translate-x-1/4 translate-y-1/4 pointer-events-none"></div>
          
          <div className="relative z-10 flex justify-between items-start mb-6">
            <div>
              <h2 className="text-sm text-slate-300 mb-1 font-medium tracking-wide">الرصيد المتاح</h2>
              <div className="text-4xl font-black tracking-tight drop-shadow-sm flex items-end gap-1.5">
                {profile.allowance.toFixed(2)} <span className="text-xl font-bold text-slate-300 pb-1">JOD</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-white/10 shadow-sm">
               <Trophy className="w-4 h-4 text-yellow-400" />
               {profile.score} نقطة
            </div>
          </div>
          
          <div className="mt-2 relative z-10">
            <div className="flex justify-between text-xs mb-2 text-slate-300 font-medium px-1">
               <span>تم إنفاق {profile.spentThisWeek.toFixed(2)} JOD</span>
               <span>الحد: {profile.weeklyLimit.toFixed(2)} JOD</span>
            </div>
            <div className="h-2.5 bg-black/40 rounded-full overflow-hidden shadow-inner border border-white/5">
               <div 
                 className={`h-full rounded-full transition-all duration-1000 ease-out ${progress > 80 ? 'bg-rose-500' : progress > 50 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                 style={{ width: `${progress}%` }}
               ></div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
           <button 
             onClick={() => !profile.isCardFrozen && navigate('/family/child/request')}
             disabled={profile.isCardFrozen}
             className="bg-surface-primary p-4 rounded-[1.25rem] border border-border-primary flex flex-col items-center justify-center gap-3 shadow-sm hover:border-emerald-500 hover:shadow-md hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
           >
             <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 rounded-full flex items-center justify-center">
               <ArrowUpRight className="w-6 h-6" />
             </div>
             <span className="font-bold text-sm text-text-primary">طلب مصروف</span>
           </button>
           
           <button 
             onClick={() => !profile.isCardFrozen && navigate('/family/child/rewards')} 
             disabled={profile.isCardFrozen}
             className="bg-surface-primary p-4 rounded-[1.25rem] border border-border-primary flex flex-col items-center justify-center gap-3 shadow-sm hover:border-indigo-500 hover:shadow-md hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
           >
             <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 rounded-full flex items-center justify-center">
               <Target className="w-6 h-6" />
             </div>
             <span className="font-bold text-sm text-text-primary">المهام والمكافآت</span>
           </button>
        </div>

        {/* Educational Hub preview */}
        <div>
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            تحدي التوفير
          </h3>
          <div onClick={() => navigate('/family/child/challenge')} className="bg-gradient-to-r from-amber-500 to-orange-500 p-5 rounded-[1.25rem] shadow-md flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none transform translate-x-1/2 -translate-y-1/2 transition-transform group-hover:scale-110"></div>
             
             <div className="relative z-10">
               <div className="font-black text-lg text-white mb-1">وفر 10 JOD هذا الأسبوع</div>
               <div className="text-sm font-medium text-amber-100">احصل على مكافأة 2 JOD!</div>
             </div>
             <button className="relative z-10 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl font-bold text-sm shadow-sm transition-colors border border-white/30 pointer-events-none whitespace-nowrap">
               ابدأ التحدي
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
