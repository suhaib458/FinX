import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import type { FamilyProfile } from '../types';

export default function WalletDetails({ family }: { family: FamilyProfile }) {
  const navigate = useNavigate();

  const transactions = [
    { id: '1', title: 'إيداع من البطاقة البنكية', amount: 50.00, type: 'deposit', date: 'اليوم, 10:30 ص' },
    { id: '2', title: 'مصروف أحمد', amount: -15.00, type: 'withdrawal', date: 'أمس, 08:00 ص' },
    { id: '3', title: 'مصروف سارة', amount: -10.00, type: 'withdrawal', date: 'أمس, 08:05 ص' },
  ];

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary pb-20 font-sans" dir="rtl">
      <header className="px-4 py-3 flex items-center justify-between sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-surface-primary shadow-sm border border-border-primary hover:bg-bg-secondary transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">محفظة العائلة</h1>
        <div className="w-9 h-9" />
      </header>

      <div className="px-4 space-y-4 mt-4">
        <div className="bg-indigo-600 text-white p-5 rounded-[1.25rem] shadow-lg relative overflow-hidden flex flex-col items-center">
          <h2 className="text-xs opacity-80 mb-1.5 font-medium">الرصيد الإجمالي</h2>
          <div className="text-3xl font-extrabold tracking-tight mb-5">{family.walletBalance.toFixed(2)} JOD</div>
          
          <div className="flex gap-3 w-full">
            <button onClick={() => navigate('/family/topup')} className="flex-1 bg-white text-indigo-600 py-2.5 rounded-xl font-bold text-xs shadow-sm active:scale-[0.98] transition-transform">
              إضافة أموال
            </button>
            <button className="flex-1 bg-indigo-500 text-white py-2.5 rounded-xl font-bold text-xs shadow-sm active:scale-[0.98] transition-transform">
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
    </div>
  );
}
