import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, CreditCard, CheckCircle2 } from 'lucide-react';
import { useFamilyContext } from '../FamilyContext';

export default function TopUpFlow() {
  const navigate = useNavigate();
  const { setWalletBalance } = useFamilyContext();
  const [amount, setAmount] = useState<string>('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const isParent = sessionStorage.getItem('parent_auth') === 'true';
    if (!isParent) {
      navigate('/family', { replace: true });
    }
  }, [navigate]);

  const handleTopUp = () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    
    setWalletBalance(prev => prev + val);
    
    setSuccess(true);
    setTimeout(() => {
      navigate('/family/wallet', { replace: true });
    }, 2000);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-emerald-500 text-white flex flex-col items-center justify-center p-6 font-sans animate-in fade-in" dir="rtl">
        <CheckCircle2 className="w-24 h-24 mb-6 animate-bounce" />
        <h1 className="text-3xl font-bold mb-2">تم الشحن بنجاح!</h1>
        <p className="text-emerald-100 text-center">تم إضافة المبلغ إلى محفظة العائلة.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary pb-20 font-sans" dir="rtl">
      <header className="px-4 py-3 flex items-center justify-between sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-surface-primary shadow-sm border border-border-primary hover:bg-bg-secondary transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">إضافة أموال</h1>
        <div className="w-9 h-9" />
      </header>

      <div className="px-4 space-y-4 mt-4">
        <div className="bg-surface-primary rounded-[1.25rem] p-5 border border-border-primary shadow-sm">
          <label className="block text-xs font-medium text-text-secondary mb-2">المبلغ (JOD)</label>
          <input 
            type="number" 
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full text-3xl font-bold bg-transparent outline-none border-b-2 border-indigo-100 dark:border-indigo-900/30 pb-2 focus:border-indigo-500 transition-colors text-left"
            dir="ltr"
          />
        </div>

        <div>
          <h3 className="font-bold text-xs mb-2 text-text-secondary">اختر طريقة الدفع</h3>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-500 p-3 rounded-2xl flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-7 bg-indigo-600 rounded flex items-center justify-center text-white">
              <CreditCard className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm">البطاقة البنكية الأساسية</div>
              <div className="text-[10px] text-text-secondary">**** **** **** 4242</div>
            </div>
            <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>
        </div>

        <button 
          onClick={handleTopUp}
          disabled={!amount}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-bg-secondary disabled:text-text-secondary text-white p-3.5 rounded-2xl font-bold text-base mt-6 active:scale-[0.98] transition-all shadow-md"
        >
          تأكيد الدفع
        </button>
      </div>
    </div>
  );
}
