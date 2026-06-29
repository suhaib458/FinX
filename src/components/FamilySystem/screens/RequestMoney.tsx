import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Send, CheckCircle2, DollarSign } from 'lucide-react';
import { useFamilyContext } from '../FamilyContext';

export default function RequestMoney() {
  const navigate = useNavigate();
  const { addRequest, members } = useFamilyContext();
  const child = members.find(m => m.role === 'child') || members[1];
  
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const quickAmounts = [1, 2, 5, 10];

  const handleSubmit = () => {
    setError('');
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('الرجاء إدخال مبلغ صحيح');
      return;
    }
    
    if (!reason.trim()) {
      setError('الرجاء إدخال سبب الطلب');
      return;
    }
    
    addRequest({
      id: Date.now().toString(),
      childName: child?.name || 'الابن',
      amount: parseFloat(amount),
      reason,
      status: 'pending',
      date: 'الآن'
    });
    
    setSuccess(true);
    setTimeout(() => {
      navigate('/family/child', { replace: true });
    }, 2500);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col items-center justify-center p-6 font-sans animate-in fade-in" dir="rtl">
        <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-bounce" />
        </div>
        <h1 className="text-3xl font-black mb-2 text-center">تم إرسال الطلب!</h1>
        <p className="text-text-secondary text-center max-w-[250px]">سيصل إشعار لوالديك بطلبك، سيتم تحديث رصيدك فور الموافقة.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary pb-20 font-sans" dir="rtl">
      <header className="px-4 py-3 flex items-center justify-between sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-md border-b border-border-primary/50">
        <button onClick={() => navigate(-1)} className="p-2.5 rounded-full bg-surface-primary shadow-sm border border-border-primary hover:bg-bg-secondary active:scale-95 transition-all">
          <ChevronRight className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">طلب مصروف إضافي</h1>
        <div className="w-10 h-10" />
      </header>

      <div className="px-4 space-y-6 mt-6">
        <div className="bg-surface-primary rounded-[1.5rem] p-6 border border-border-primary shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
          
          <label className="block text-sm font-bold text-text-primary mb-1">المبلغ المطلوب</label>
          <p className="text-xs text-text-secondary mb-4">أدخل المبلغ الذي تحتاجه</p>
          
          <div className="relative flex items-center border-b-2 border-border-primary focus-within:border-indigo-500 transition-colors pb-2">
            <span className="text-2xl font-bold text-text-secondary pl-3">JOD</span>
            <input 
              type="number" 
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError('');
              }}
              className="w-full text-4xl font-black bg-transparent outline-none text-left text-text-primary placeholder:text-border-primary"
              dir="ltr"
            />
          </div>
          
          <div className="flex items-center gap-2 mt-5">
            {quickAmounts.map(amt => (
              <button
                key={amt}
                onClick={() => {
                  setAmount(amt.toString());
                  setError('');
                }}
                className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all active:scale-95 ${amount === amt.toString() ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-bg-primary text-text-secondary border-border-primary hover:border-indigo-300'}`}
              >
                +{amt}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-surface-primary rounded-[1.5rem] p-6 border border-border-primary shadow-sm">
          <label className="block text-sm font-bold text-text-primary mb-1">سبب الطلب</label>
          <p className="text-xs text-text-secondary mb-3">لماذا تحتاج هذا المبلغ؟</p>
          <textarea 
            placeholder="مثال: أريد شراء لعبة جديدة أو أداة مدرسية..."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError('');
            }}
            className="w-full h-24 bg-bg-primary rounded-xl p-4 outline-none border border-border-primary focus:border-indigo-500 transition-colors resize-none text-sm leading-relaxed"
          />
        </div>

        {error && (
          <div className="bg-rose-50/50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 p-3 rounded-xl border border-rose-200 dark:border-rose-800/50 text-sm font-bold text-center">
            {error}
          </div>
        )}

        <button 
          onClick={handleSubmit}
          disabled={!amount || parseFloat(amount) <= 0 || !reason.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:dark:bg-slate-800 disabled:text-slate-400 disabled:dark:text-slate-500 text-white p-4 rounded-2xl font-bold text-base mt-2 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2"
        >
          <Send className="w-5 h-5 rotate-180" />
          إرسال الطلب للوالدين
        </button>
      </div>
    </div>
  );
}
