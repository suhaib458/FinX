import React, { useEffect } from 'react';
import { Shield, CreditCard, Activity, Bell, ChevronRight, ChevronLeft, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { FamilyProfile } from '../types';
import { auth } from '../../../lib/firebase';

interface ParentDashboardProps {
  family: FamilyProfile;
}

export default function ParentDashboard({ family }: ParentDashboardProps) {
  const navigate = useNavigate();
  const pendingRequests = 2; // Mock

  useEffect(() => {
    // Role validation: Parent must have passed the authentication gateway
    if (!sessionStorage.getItem('parent_auth')) {
      navigate('/family/auth/parent', { replace: true });
    }
  }, [navigate]);

  if (!sessionStorage.getItem('parent_auth')) return null;

  return (
    <div className="space-y-4 pb-20 font-sans" dir="rtl">
      {/* Mobile-style header */}
      <header className="px-4 py-3 flex items-center justify-between sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-md">
        <button onClick={() => navigate('/family')} className="p-2 rounded-full bg-surface-primary shadow-sm border border-border-primary hover:bg-bg-secondary transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">لوحة تحكم العائلة</h1>
        <div onClick={() => navigate('/family/settings')} className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors">
           م
        </div>
      </header>

      <div className="px-4 space-y-4">
        {/* Wallet Summary */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white p-5 rounded-[1.25rem] shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div onClick={() => navigate('/family/wallet')} className="cursor-pointer">
              <h2 className="text-xs opacity-80 mb-1 font-medium tracking-wide">رصيد العائلة (Family Wallet)</h2>
              <div className="text-3xl font-extrabold tracking-tight">{family.walletBalance.toFixed(2)} <span className="text-lg">JOD</span></div>
            </div>
            <button onClick={() => navigate('/family/topup')} className="bg-white/20 hover:bg-white/30 backdrop-blur-md p-2.5 rounded-xl transition-colors active:scale-95">
               <CreditCard className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-4 flex gap-3">
            <div className="bg-black/20 rounded-xl px-3 py-2.5 flex-1 cursor-pointer" onClick={() => navigate('/family/wallet/transactions')}>
               <div className="text-[10px] opacity-70 mb-0.5">الإنفاق الأسبوعي</div>
               <div className="font-bold text-sm">145.50 JOD</div>
            </div>
            <div className="bg-black/20 rounded-xl px-3 py-2.5 flex-1 cursor-pointer" onClick={() => navigate('/family/requests')}>
               <div className="text-[10px] opacity-70 mb-0.5">طلبات معلقة</div>
               <div className="font-bold text-sm">{pendingRequests} طلبات</div>
            </div>
          </div>
        </div>

        {/* Children List */}
        <div>
          <h3 className="font-bold text-base mb-3 text-text-primary flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-500" />
            أفراد العائلة
          </h3>
          <div className="space-y-2.5">
            {family.members.filter(m => m.role === 'child').map(child => (
              <div 
                key={child.id}
                onClick={() => navigate(`/family/child/${child.id}`)}
                className="bg-surface-primary p-3 rounded-2xl border border-border-primary flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-base">
                    {child.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-text-primary text-base">{child.name}</div>
                    <div className="text-[11px] text-text-secondary flex items-center gap-1 mt-0.5">
                      <Activity className="w-3 h-3" />
                      المتبقي: {(child.weeklyLimit - child.spentThisWeek).toFixed(2)} JOD
                    </div>
                  </div>
                </div>
                <ChevronLeft className="w-4 h-4 text-text-secondary" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
           <button onClick={() => navigate('/family/requests')} className="bg-surface-primary p-3 rounded-2xl border border-border-primary flex flex-col items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all">
             <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full flex items-center justify-center">
               <Bell className="w-5 h-5" />
             </div>
             <span className="font-medium text-sm text-text-primary">الطلبات ({pendingRequests})</span>
           </button>
           <button onClick={() => navigate('/family/settings')} className="bg-surface-primary p-3 rounded-2xl border border-border-primary flex flex-col items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all">
             <div className="w-10 h-10 bg-bg-secondary text-text-secondary rounded-full flex items-center justify-center">
               <Settings className="w-5 h-5" />
             </div>
             <span className="font-medium text-sm text-text-primary">الإعدادات</span>
           </button>
        </div>
      </div>
    </div>
  );
}
