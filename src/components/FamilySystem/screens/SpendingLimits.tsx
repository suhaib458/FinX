import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ShieldAlert, Save, CheckCircle, Globe, Gamepad2, CreditCard, ShoppingBag, Landmark } from 'lucide-react';
import type { FamilyProfile } from '../types';

interface SpendingLimitsProps {
  family: FamilyProfile;
}

export default function SpendingLimits({ family }: SpendingLimitsProps) {
  const navigate = useNavigate();
  const [selectedChildId, setSelectedChildId] = useState(
    family.members.find(m => m.role === 'child')?.id || ''
  );

  useEffect(() => {
    const isParent = sessionStorage.getItem('parent_auth') === 'true';
    if (!isParent) {
      navigate('/family', { replace: true });
    }
  }, [navigate]);
  
  const [limits, setLimits] = useState({
    allowGaming: family.spendingRules.allowGaming || false,
    allowOnlinePurchases: family.spendingRules.allowOnlinePurchases || false,
    allowInternational: false,
    allowATMWithdrawal: true,
    maxTransactionAmount: family.spendingRules.maxTransactionAmount || 50,
    weeklyLimit: 100,
    monthlyLimit: 400,
    digitalServicesLimit: 20
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary pb-20 font-sans" dir="rtl">
      <header className="px-4 py-3 flex items-center justify-between sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-surface-primary shadow-sm border border-border-primary hover:bg-bg-secondary transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">حدود الإنفاق</h1>
        <div className="w-9 h-9" />
      </header>

      <div className="px-4 mt-6 space-y-6">
        
        {/* Child Selector */}
        <div className="bg-surface-primary rounded-2xl p-5 border border-border-primary shadow-sm">
          <label className="block text-xs font-bold text-text-secondary mb-2">تحديد الابن</label>
          <select 
            value={selectedChildId}
            onChange={(e) => setSelectedChildId(e.target.value)}
            className="w-full bg-bg-primary border border-border-primary rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-indigo-500 font-bold"
          >
            {family.members.filter(m => m.role === 'child').map(child => (
              <option key={child.id} value={child.id}>{child.name}</option>
            ))}
          </select>
        </div>

        {/* Global Limits */}
        <div className="bg-surface-primary rounded-2xl p-5 border border-border-primary shadow-sm space-y-5">
          <h2 className="text-base font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2 mb-2">
            <ShieldAlert className="w-5 h-5" />
            الحدود الدورية للمصروف
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">الحد الأسبوعي (JOD)</label>
              <input 
                type="number" 
                value={limits.weeklyLimit} 
                onChange={e => setLimits({...limits, weeklyLimit: Number(e.target.value)})}
                className="w-full bg-bg-primary border border-border-primary rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-indigo-500 transition-colors font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">الحد الشهري (JOD)</label>
              <input 
                type="number" 
                value={limits.monthlyLimit} 
                onChange={e => setLimits({...limits, monthlyLimit: Number(e.target.value)})}
                className="w-full bg-bg-primary border border-border-primary rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-indigo-500 transition-colors font-mono"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-bold text-text-secondary mb-1.5">الحد الأقصى للعملية الواحدة (JOD)</label>
            <input 
              type="number" 
              value={limits.maxTransactionAmount} 
              onChange={e => setLimits({...limits, maxTransactionAmount: Number(e.target.value)})}
              className="w-full bg-bg-primary border border-border-primary rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-indigo-500 transition-colors font-mono"
            />
          </div>
        </div>

        {/* Category Controls */}
        <div className="bg-surface-primary rounded-2xl p-5 border border-border-primary shadow-sm space-y-6">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2 mb-2">
            <ShoppingBag className="w-5 h-5 text-emerald-500" />
            ضوابط الفئات
          </h2>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm mb-0.5">المشتريات عبر الإنترنت</div>
                <div className="text-xs text-text-secondary">مواقع التسوق الإلكتروني</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={limits.allowOnlinePurchases} onChange={e => setLimits({...limits, allowOnlinePurchases: e.target.checked})} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500 rtl:peer-checked:after:-translate-x-full rtl:after:right-[2px] rtl:after:left-auto"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-accent-purple rounded-lg">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm mb-0.5">الألعاب والترفيه</div>
                <div className="text-xs text-text-secondary">متجر التطبيقات وبلايستيشن</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={limits.allowGaming} onChange={e => setLimits({...limits, allowGaming: e.target.checked})} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500 rtl:peer-checked:after:-translate-x-full rtl:after:right-[2px] rtl:after:left-auto"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-accent-orange rounded-lg">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm mb-0.5">السحب النقدي (ATM)</div>
                <div className="text-xs text-text-secondary">السحب من أجهزة الصراف الآلي</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={limits.allowATMWithdrawal} onChange={e => setLimits({...limits, allowATMWithdrawal: e.target.checked})} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500 rtl:peer-checked:after:-translate-x-full rtl:after:right-[2px] rtl:after:left-auto"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-lg">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm mb-0.5">المدفوعات الدولية</div>
                <div className="text-xs text-text-secondary">العمليات بغير العملة المحلية</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={limits.allowInternational} onChange={e => setLimits({...limits, allowInternational: e.target.checked})} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500 rtl:peer-checked:after:-translate-x-full rtl:after:right-[2px] rtl:after:left-auto"></div>
            </label>
          </div>
        </div>

        <button 
          onClick={handleSave} 
          disabled={saving || saved}
          className={`w-full py-4 rounded-2xl font-bold text-white shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${saved ? 'bg-emerald-500 hover:bg-accent-green shadow-emerald-500/25' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25'} disabled:opacity-70 disabled:cursor-not-allowed`}
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : saved ? (
            <>
              <CheckCircle className="w-5 h-5" />
              تم الحفظ بنجاح
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              حفظ التعديلات
            </>
          )}
        </button>
      </div>
    </div>
  );
}
