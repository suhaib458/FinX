import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Check, X } from 'lucide-react';

export default function Requests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState<any[]>(() => {
    const saved = localStorage.getItem('finx_family_requests');
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', childName: 'أحمد', amount: 15.00, reason: 'شراء لعبة جديدة', status: 'pending', date: 'منذ ساعتين' },
      { id: '2', childName: 'سارة', amount: 5.00, reason: 'قرطاسية للمدرسة', status: 'pending', date: 'منذ 5 ساعات' },
    ];
  });

  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    if (processingId) return;
    setProcessingId(id);
    
    // Simulate API request to backend to update request status
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setRequests(prev => {
      const newReqs = prev.filter(req => req.id !== id);
      localStorage.setItem('finx_family_requests', JSON.stringify(newReqs));
      return newReqs;
    });
    setProcessingId(null);
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary pb-20 font-sans" dir="rtl">
      <header className="px-4 py-3 flex items-center justify-between sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-surface-primary shadow-sm border border-border-primary hover:bg-bg-secondary transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">الطلبات المعلقة</h1>
        <div className="w-9 h-9" />
      </header>

      <div className="px-4 space-y-3 mt-4">
        {requests.map(req => (
          <div key={req.id} className="bg-surface-primary rounded-[1.25rem] p-4 border border-border-primary shadow-sm relative overflow-hidden">
            {processingId === req.id && (
              <div className="absolute inset-0 bg-white/50 dark:bg-bg-secondary/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-bold text-base mb-1">{req.childName} يطلب {req.amount.toFixed(2)} JOD</div>
                <div className="text-xs text-text-secondary">{req.reason}</div>
              </div>
              <div className="text-[10px] text-text-secondary bg-bg-secondary px-2 py-1 rounded-md">{req.date}</div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleAction(req.id, 'approved')}
                disabled={processingId !== null}
                className="flex-1 bg-emerald-500 hover:bg-accent-green text-white p-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform disabled:opacity-70 disabled:active:scale-100"
              >
                <Check className="w-4 h-4" />
                موافقة
              </button>
              <button 
                onClick={() => handleAction(req.id, 'rejected')}
                disabled={processingId !== null}
                className="flex-1 bg-rose-50 dark:bg-rose-900/20 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/40 p-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform disabled:opacity-70 disabled:active:scale-100"
              >
                <X className="w-4 h-4" />
                رفض
              </button>
            </div>
          </div>
        ))}

        {requests.length === 0 && (
          <div className="text-center text-sm text-text-secondary mt-10">
            لا توجد طلبات معلقة حالياً.
          </div>
        )}
      </div>
    </div>
  );
}
