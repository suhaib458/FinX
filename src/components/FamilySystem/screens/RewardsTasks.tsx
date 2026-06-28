import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Target, CheckCircle2 } from 'lucide-react';

export default function RewardsTasks() {
  const navigate = useNavigate();

  const tasks = [
    { id: '1', title: 'تنظيف الغرفة', reward: 2.00, isCompleted: false },
    { id: '2', title: 'إنهاء الواجبات المدرسية مبكراً', reward: 3.00, isCompleted: true },
    { id: '3', title: 'مساعدة في ترتيب المطبخ', reward: 1.50, isCompleted: false },
  ];

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary pb-20 font-sans" dir="rtl">
      <header className="px-4 py-3 flex items-center justify-between sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-surface-primary shadow-sm border border-border-primary hover:bg-bg-secondary transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">المهام والمكافآت</h1>
        <div className="w-9 h-9" />
      </header>

      <div className="px-4 space-y-4 mt-4">
        <div className="bg-indigo-600 text-white p-5 rounded-[1.25rem] shadow-lg relative overflow-hidden flex flex-col items-center">
           <Target className="w-10 h-10 mb-3 text-indigo-300" />
           <h2 className="text-lg font-bold mb-1">انجز المهام واكسب!</h2>
           <p className="text-indigo-200 text-xs text-center text-balance leading-relaxed">كل مهمة تنجزها تضاف قيمتها إلى مصروفك مباشرة بعد موافقة والديك.</p>
        </div>

        <div>
          <h3 className="font-bold text-base mb-3 mt-4">المهام الحالية</h3>
          <div className="space-y-2.5">
            {tasks.map(task => (
              <div key={task.id} className={`bg-surface-primary p-3.5 rounded-2xl border ${task.isCompleted ? 'border-emerald-500' : 'border-border-primary'} flex items-center justify-between shadow-sm`}>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${task.isCompleted ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600 text-transparent'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className={`font-bold text-sm ${task.isCompleted ? 'text-text-secondary line-through' : ''}`}>{task.title}</div>
                </div>
                <div className={`font-bold text-sm ${task.isCompleted ? 'text-text-secondary' : 'text-accent-green'}`}>
                  +{task.reward.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
