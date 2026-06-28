import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Send, CheckCircle2 } from 'lucide-react';

export default function RequestMoney() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = () => {
    if (!amount || !reason) return;
    
    const saved = localStorage.getItem('finx_family_requests');
    const requests = saved ? JSON.parse(saved) : [
      { id: '1', childName: 'أحمد', amount: 15.00, reason: 'شراء لعبة جديدة', status: 'pending', date: 'منذ ساعتين' },
      { id: '2', childName: 'سارة', amount: 5.00, reason: 'قرطاسية للمدرسة', status: 'pending', date: 'منذ 5 ساعات' },
    ];
    
    requests.push({
      id: Date.now().toString(),
      childName: 'أحمد', // assuming current child
      amount: parseFloat(amount),
      reason,
      status: 'pending',
      date: 'الآن'
    });
    
    localStorage.setItem('finx_family_requests', JSON.stringify(requests));
    
    setSuccess(true);
    setTimeout(() => {
      navigate('/family/child', { replace: true });
    }, 2000);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-indigo-600 text-white flex flex-col items-center justify-center p-6 font-sans animate-in fade-in" dir="rtl">
        <CheckCircle2 className="w-24 h-24 mb-6 animate-bounce text-emerald-400" />
        <h1 className="text-3xl font-bold mb-2">تم إرسال الطلب!</h1>
        <p className="text-indigo-100 text-center">سيتم إشعار ولي الأمر بطلبك قريباً.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary pb-20 font-sans" dir="rtl">
      <header className="px-4 py-3 flex items-center justify-between sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-surface-primary shadow-sm border border-border-primary hover:bg-bg-secondary transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">طلب مصروف إضافي</h1>
        <div className="w-9 h-9" />
      </header>

      <div className="px-4 space-y-4 mt-4">
        <div className="bg-surface-primary rounded-[1.25rem] p-5 border border-border-primary shadow-sm">
          <label className="block text-xs font-medium text-text-secondary mb-2">المبلغ المطلوب (JOD)</label>
          <input 
            type="number" 
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full text-3xl font-bold bg-transparent outline-none border-b-2 border-indigo-100 dark:border-indigo-900/30 pb-2 focus:border-indigo-500 transition-colors text-left"
            dir="ltr"
          />
        </div>

        <div className="bg-surface-primary rounded-[1.25rem] p-5 border border-border-primary shadow-sm">
          <label className="block text-xs font-medium text-text-secondary mb-2">سبب الطلب (اختياري)</label>
          <textarea 
            placeholder="مثال: شراء كتاب للمدرسة..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full h-20 bg-bg-primary rounded-xl p-3 outline-none border border-border-primary focus:border-indigo-500 transition-colors resize-none text-sm"
          />
        </div>

        <button 
          onClick={handleSubmit}
          disabled={!amount}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-bg-secondary disabled:text-text-secondary text-white p-3.5 rounded-2xl font-bold text-base mt-6 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4 rotate-180" />
          إرسال الطلب
        </button>
      </div>
    </div>
  );
}
