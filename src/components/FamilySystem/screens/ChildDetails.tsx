import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Settings, Activity, Ban, CheckCircle2 } from 'lucide-react';
import { useFamilyMembers, useFamilyAuth } from '../FamilyContext';

export default function ChildDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { members, updateMember } = useFamilyMembers();
  const { isParentAuth } = useFamilyAuth();
  
  useEffect(() => {
    if (!isParentAuth) {
      navigate('/family', { replace: true });
    }
  }, [navigate, isParentAuth]);

  const child = members.find(m => m.id === id);

  if (!isParentAuth || !child) return null;

  const handleToggleFreeze = () => {
    updateMember(child.id, { isCardFrozen: !child.isCardFrozen });
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary pb-20 font-sans" dir="rtl">
      <header className="px-4 py-3 flex items-center justify-between sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-md">
        <button onClick={() => navigate('/family/parent')} className="p-2 rounded-full bg-surface-primary shadow-sm border border-border-primary hover:bg-bg-secondary transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">{child.name}</h1>
        <button onClick={() => navigate('/family/settings/limits')} className="p-2 rounded-full bg-surface-primary shadow-sm border border-border-primary hover:bg-bg-secondary transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </header>

      <div className="px-4 space-y-4 mt-4">
        <div className="bg-surface-primary p-5 rounded-[1.25rem] shadow-sm border border-border-primary flex flex-col items-center">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-2xl mb-3">
            {child.name.charAt(0)}
          </div>
          <h2 className="text-xl font-bold">{child.allowance.toFixed(2)} JOD</h2>
          <p className="text-text-secondary text-xs">الرصيد المتاح</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
           <div className="bg-surface-primary p-3 rounded-2xl border border-border-primary shadow-sm">
             <div className="text-text-secondary text-xs mb-1">الإنفاق الأسبوعي</div>
             <div className="font-bold text-base">{child.spentThisWeek.toFixed(2)} JOD</div>
           </div>
           <div className="bg-surface-primary p-3 rounded-2xl border border-border-primary shadow-sm">
             <div className="text-text-secondary text-xs mb-1">الحد الأسبوعي</div>
             <div className="font-bold text-base">{child.weeklyLimit.toFixed(2)} JOD</div>
           </div>
        </div>

        <button 
          onClick={handleToggleFreeze}
          className={`w-full p-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border active:scale-[0.98] transition-transform ${
            child.isCardFrozen 
              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-200 dark:border-emerald-800/50' 
              : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 border-rose-200 dark:border-rose-800/50'
          }`}
        >
          {child.isCardFrozen ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              تفعيل البطاقة
            </>
          ) : (
            <>
              <Ban className="w-4 h-4" />
              تجميد البطاقة
            </>
          )}
        </button>

        <div>
          <h3 className="font-bold text-base mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            سجل العمليات
          </h3>
          <div className="bg-surface-primary rounded-2xl border border-border-primary p-4 text-center text-sm text-text-secondary">
            لا توجد عمليات مسجلة هذا الأسبوع.
          </div>
        </div>
      </div>
    </div>
  );
}
