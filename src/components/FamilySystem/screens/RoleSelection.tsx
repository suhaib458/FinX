import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowRight } from 'lucide-react';
import { ParentIllustration } from '../components/Illustrations/ParentIllustration';
import { ChildIllustration } from '../components/Illustrations/ChildIllustration';

export default function RoleSelection() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="flex-1 flex flex-col bg-bg-primary" dir="rtl">
      {/* Mobile-style header */}
      <header className="px-4 py-3 flex items-center sticky top-0 z-50">
        <button onClick={handleBack} className="p-2 rounded-full bg-surface-primary shadow-sm border border-border-primary hover:bg-bg-secondary transition-colors text-text-primary">
          <ArrowRight className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 flex flex-col px-5 pt-1 pb-4 overflow-y-auto items-center justify-center max-w-md mx-auto w-full">
        <div className="w-11 h-11 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-2 shadow-sm border border-indigo-100 dark:border-indigo-800/30 shrink-0">
          <Users className="w-6 h-6" />
        </div>
        
        <h1 className="text-xl font-extrabold mb-0.5 tracking-tight text-text-primary text-center">
          النظام العائلي المالي
        </h1>
        <p className="text-text-secondary mb-4 text-xs text-center">
          اختر نوع الحساب للمتابعة
        </p>
        
        <div className="w-full grid grid-cols-1 gap-3.5 pb-2">
          {/* Parent Card */}
          <div className="bg-surface-card rounded-[1.25rem] p-3.5 border border-border-primary shadow-sm flex flex-col items-center transition-all hover:border-purple-500/50 hover:shadow-purple-500/10 hover:shadow-xl">
            {/* Illustration Area */}
            <div className="w-full max-w-[160px] h-20 bg-gradient-to-b from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-900/5 rounded-2xl flex items-center justify-center overflow-hidden border border-purple-100 dark:border-purple-500/20 mb-2.5 shrink-0">
               <ParentIllustration className="w-full h-full object-cover" />
            </div>
            
            <div className="flex flex-col text-center w-full">
              <h2 className="text-base font-bold text-text-primary mb-0.5">ولي أمر (الأب)</h2>
              <p className="text-xs text-text-secondary mb-3">
                إدارة المحفظة والمهام والمصروفات
              </p>
              <button 
                onClick={() => navigate('/family/auth/parent')}
                className="w-full h-[46px] rounded-xl bg-accent-purple hover:bg-purple-700 text-white font-bold transition-all text-[13px] shadow-sm shadow-purple-500/20 active:scale-[0.98] flex items-center justify-center"
              >
                تسجيل دخول الأب
              </button>
            </div>
          </div>
          
          {/* Child Card */}
          <div className="bg-surface-card rounded-[1.25rem] p-3.5 border border-border-primary shadow-sm flex flex-col items-center transition-all hover:border-emerald-500/50 hover:shadow-emerald-500/10 hover:shadow-xl">
            {/* Illustration Area */}
            <div className="w-full max-w-[160px] h-20 bg-gradient-to-b from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-900/5 rounded-2xl flex items-center justify-center overflow-hidden border border-emerald-100 dark:border-emerald-500/20 mb-2.5 shrink-0">
               <ChildIllustration className="w-full h-full object-cover" />
            </div>

            <div className="flex flex-col text-center w-full">
              <h2 className="text-base font-bold text-text-primary mb-0.5">ابن / ابنة</h2>
              <p className="text-xs text-text-secondary mb-3">
                متابعة المصروف والمهام والمدخرات
              </p>
              <button 
                onClick={() => navigate('/family/auth/child')}
                className="w-full h-[46px] rounded-xl bg-accent-green hover:bg-emerald-700 text-white font-bold transition-all text-[13px] shadow-sm shadow-emerald-500/20 active:scale-[0.98] flex items-center justify-center"
              >
                تسجيل دخول الابن
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
