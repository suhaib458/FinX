import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Target, CheckCircle2, Lock, Clock } from 'lucide-react';
import { useFamilyMembers, useFamilyAuth } from '../FamilyContext';

export default function RewardsTasks() {
  const navigate = useNavigate();
  const { members, updateMember } = useFamilyMembers();
  const { isChildAuth, activeChildId } = useFamilyAuth();
  const child = members.find(m => m.id === activeChildId) || members.find(m => m.role === 'child');

  useEffect(() => {
    if (!isChildAuth) {
      navigate('/family', { replace: true });
    }
  }, [navigate, isChildAuth]);

  if (!isChildAuth || !child) return null;

  const [tasks, setTasks] = useState([
    { id: '1', title: 'تنظيف الغرفة', reward: 2.00, status: 'pending' },
    { id: '2', title: 'إنهاء الواجبات المدرسية مبكراً', reward: 3.00, status: 'completed' },
    { id: '3', title: 'مساعدة في ترتيب المطبخ', reward: 1.50, status: 'pending' },
    { id: '4', title: 'قراءة كتاب لمدة ساعة', reward: 5.00, status: 'locked' },
    { id: '5', title: 'ممارسة الرياضة', reward: 2.50, status: 'expired' },
  ]);

  const handleComplete = (taskId: string, reward: number, status: string) => {
    if (status !== 'pending') return;
    
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: 'completed' } : t
    ));
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary pb-20 font-sans" dir="rtl">
      <header className="px-4 py-3 flex items-center justify-between sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-md border-b border-border-primary/50">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-surface-primary shadow-sm border border-border-primary hover:bg-bg-secondary transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">المهام والمكافآت</h1>
        <div className="w-9 h-9" />
      </header>

      <div className="px-4 space-y-5 mt-5">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-800 text-white p-6 rounded-[1.5rem] shadow-xl relative overflow-hidden flex flex-col items-center text-center">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
           <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl transform -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
           <Target className="w-12 h-12 mb-3 text-indigo-200" />
           <h2 className="text-xl font-black mb-1">انجز المهام واكسب!</h2>
           <p className="text-indigo-100/90 text-sm leading-relaxed max-w-[250px]">كل مهمة تنجزها تضاف قيمتها إلى رصيدك فوراً.</p>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-4">المهام الحالية</h3>
          <div className="space-y-3">
            {tasks.map(task => {
              const isCompleted = task.status === 'completed';
              const isPending = task.status === 'pending';
              const isLocked = task.status === 'locked';
              const isExpired = task.status === 'expired';

              let borderColor = 'border-border-primary';
              let icon = null;
              
              if (isCompleted) {
                borderColor = 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-900/10';
                icon = <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
              } else if (isPending) {
                borderColor = 'border-indigo-200 dark:border-indigo-900/50 hover:border-indigo-400';
                icon = <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 text-transparent" />;
              } else if (isLocked) {
                borderColor = 'border-border-primary opacity-60';
                icon = <Lock className="w-4 h-4 text-slate-400" />;
              } else if (isExpired) {
                borderColor = 'border-rose-200/50 dark:border-rose-900/30 opacity-60 bg-rose-50/30 dark:bg-rose-900/10';
                icon = <Clock className="w-4 h-4 text-rose-400" />;
              }

              return (
                <div 
                  key={task.id} 
                  onClick={() => handleComplete(task.id, task.reward, task.status)}
                  className={`p-4 rounded-2xl border-2 ${borderColor} flex items-center justify-between shadow-sm transition-all ${isPending ? 'cursor-pointer active:scale-[0.98]' : 'cursor-default'}`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-6 h-6 flex items-center justify-center shrink-0`}>
                      {icon}
                    </div>
                    <div className={`font-bold text-[15px] ${isCompleted ? 'text-text-secondary line-through' : isLocked || isExpired ? 'text-text-secondary' : 'text-text-primary'}`}>
                      {task.title}
                    </div>
                  </div>
                  <div className={`font-black text-sm px-3 py-1 rounded-full ${
                    isCompleted ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 
                    isPending ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' : 
                    'bg-slate-100 dark:bg-slate-800 text-text-secondary'
                  }`}>
                    +{task.reward.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
