import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowDownRight, ArrowUpRight, X } from 'lucide-react';
import { useFamilyContext } from '../FamilyContext';

export default function WalletDetails() {
  const navigate = useNavigate();
  const { familyProfile, walletBalance, setWalletBalance, members, updateMember } = useFamilyContext();
  
  useEffect(() => {
    const isParent = sessionStorage.getItem('parent_auth') === 'true';
    if (!isParent) {
      navigate('/family', { replace: true });
    }
  }, [navigate]);

  const [showTransfer, setShowTransfer] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [selectedChild, setSelectedChild] = useState(members.find(m => m.role === 'child')?.id || '');
  const [error, setError] = useState('');

  if (sessionStorage.getItem('parent_auth') !== 'true') return null;

  const transactions = [
    { id: '1', title: 'إيداع من البطاقة البنكية', amount: 50.00, type: 'deposit', date: 'اليوم, 10:30 ص' },
    { id: '2', title: 'مصروف أحمد', amount: -15.00, type: 'withdrawal', date: 'أمس, 08:00 ص' },
    { id: '3', title: 'مصروف سارة', amount: -10.00, type: 'withdrawal', date: 'أمس, 08:05 ص' },
  ];

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const amount = parseFloat(transferAmount);
    if (!amount || amount <= 0) {
      setError('الرجاء إدخال مبلغ صحيح');
      return;
    }
    
    if (amount > walletBalance) {
      setError('الرصيد غير كافٍ');
      return;
    }
    
    if (!selectedChild) {
      setError('الرجاء اختيار طفل');
      return;
    }

    const child = members.find(m => m.id === selectedChild);
    if (!child) return;

    // Deduct from wallet
    setWalletBalance(prev => prev - amount);
    // Add to child
    updateMember(child.id, { allowance: child.allowance + amount });
    
    setShowTransfer(false);
    setTransferAmount('');
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary pb-20 font-sans" dir="rtl">
      <header className="px-4 py-3 flex items-center justify-between sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-md">
        <button onClick={() => navigate('/family/parent')} className="p-2 rounded-full bg-surface-primary shadow-sm border border-border-primary hover:bg-bg-secondary transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">محفظة العائلة</h1>
        <div className="w-9 h-9" />
      </header>

      <div className="px-4 space-y-4 mt-4">
        <div className="bg-indigo-600 text-white p-5 rounded-[1.25rem] shadow-lg relative overflow-hidden flex flex-col items-center">
          <h2 className="text-xs opacity-80 mb-1.5 font-medium">الرصيد الإجمالي</h2>
          <div className="text-3xl font-extrabold tracking-tight mb-5">{walletBalance.toFixed(2)} JOD</div>
          
          <div className="flex gap-3 w-full">
            <button onClick={() => navigate('/family/topup')} className="flex-1 bg-white text-indigo-600 py-2.5 rounded-xl font-bold text-xs shadow-sm active:scale-[0.98] transition-transform">
              إضافة أموال
            </button>
            <button onClick={() => setShowTransfer(true)} className="flex-1 bg-indigo-500 text-white py-2.5 rounded-xl font-bold text-xs shadow-sm active:scale-[0.98] transition-transform hover:bg-indigo-400">
              تحويل
            </button>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-base mb-3">سجل العمليات</h3>
          <div className="space-y-2.5">
            {transactions.map(t => (
              <div key={t.id} className="bg-surface-primary p-3 rounded-2xl border border-border-primary flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${t.type === 'deposit' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30'}`}>
                    {t.type === 'deposit' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{t.title}</div>
                    <div className="text-[10px] text-text-secondary mt-0.5">{t.date}</div>
                  </div>
                </div>
                <div className={`font-bold text-sm ${t.type === 'deposit' ? 'text-accent-green' : 'text-text-primary'}`}>
                  {t.type === 'deposit' ? '+' : ''}{t.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showTransfer && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowTransfer(false)}></div>
          <div className="relative bg-surface-primary w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 border border-border-primary">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-text-primary">تحويل إلى طفل</h3>
              <button onClick={() => setShowTransfer(false)} className="p-2 bg-bg-secondary rounded-full text-text-secondary hover:text-text-primary">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">اختر الطفل</label>
                <select 
                  value={selectedChild}
                  onChange={(e) => setSelectedChild(e.target.value)}
                  className="w-full bg-bg-secondary/50 border border-border-primary rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-text-primary"
                >
                  {members.filter(m => m.role === 'child').map(child => (
                    <option key={child.id} value={child.id}>{child.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">المبلغ (JOD)</label>
                <input 
                  type="number" 
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="0.00" 
                  className="w-full bg-bg-secondary/50 border border-border-primary rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-text-primary text-left"
                  dir="ltr"
                />
              </div>

              {error && (
                <div className="bg-rose-50 text-rose-600 p-3 rounded-xl border border-rose-200 text-sm font-bold text-center">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] mt-2"
              >
                تأكيد التحويل
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
