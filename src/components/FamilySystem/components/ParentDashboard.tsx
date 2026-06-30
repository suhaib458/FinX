import React, { useEffect, useState } from 'react';
import { Shield, CreditCard, Activity, Bell, ChevronRight, ChevronLeft, Settings, Wallet, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { FamilyProfile } from '../types';
import { auth } from '../../../lib/firebase';
import Avatar from '../../Avatar'; // Using existing Avatar component if we need it later, let's just stick to the text one for now or check Task 8
import { useFamilyMembers, useFamilyRequests, useFamilyWallet, useFamilyAuth } from '../FamilyContext';

interface ParentDashboardProps {
  family: FamilyProfile;
}

export default function ParentDashboard({ family }: ParentDashboardProps) {
  const navigate = useNavigate();
  const { requests } = useFamilyRequests();
  const { isParentAuth } = useFamilyAuth();
  const pendingRequests = requests.length;

  useEffect(() => {
    // Role validation: Parent must have passed the authentication gateway
    if (!isParentAuth) {
      navigate('/family/auth/parent', { replace: true });
    }
  }, [navigate, isParentAuth]);

  if (!isParentAuth) return null;

  // Assuming father is first parent or auth.currentUser
  const parentMember = family.members.find(m => m.role === 'parent');
  const parentName = parentMember?.name || 'الأب';
  
  // 1. Family profile image
  // 2. Existing application profile image (auth.currentUser.photoURL)
  // 3. Default avatar (initial)
  const profileImage = parentMember?.avatar || auth.currentUser?.photoURL;

  return (
    <div className="space-y-6 pb-24 font-sans bg-[#0B0F19] min-h-screen text-white" dir="rtl">
      {/* Mobile-style header */}
      <header className="px-5 py-4 flex items-center justify-between sticky top-0 z-50 bg-[#0B0F19]/90 backdrop-blur-xl border-b border-white/5">
        <button onClick={() => navigate('/family')} className="p-2.5 rounded-full bg-white/5 shadow-sm border border-white/10 hover:bg-white/10 transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold tracking-tight bg-gradient-to-l from-white to-white/70 bg-clip-text text-transparent">لوحة تحكم العائلة</h1>
        <div onClick={() => navigate('/family/settings')} className="w-10 h-10 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-full flex items-center justify-center text-indigo-300 font-bold text-sm cursor-pointer hover:bg-indigo-500/30 transition-colors relative overflow-hidden">
           {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
           ) : (
              parentName.charAt(0)
           )}
        </div>
      </header>

      <div className="px-5 space-y-6">
        {/* Premium Wallet Summary Card */}
        <div className="relative rounded-[2rem] p-[1px] overflow-hidden group shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/40 via-purple-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
          
          <div className="relative bg-[#131B2C] h-full rounded-[2rem] p-6 overflow-hidden border border-white/10">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
            
            <div className="relative z-10 flex justify-between items-start mb-6">
              <div onClick={() => navigate('/family/wallet')} className="cursor-pointer group/balance">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                    <Wallet className="w-4 h-4 text-indigo-400" />
                  </div>
                  <h2 className="text-xs text-white/60 font-medium tracking-wide">رصيد العائلة (Family Wallet)</h2>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[2.5rem] font-extrabold tracking-tight bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent leading-none">
                    {family.walletBalance.toFixed(2)}
                  </span>
                  <span className="text-sm font-semibold text-white/50">JOD</span>
                </div>
              </div>
              <button onClick={() => navigate('/family/topup')} className="bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md p-3 rounded-2xl transition-all active:scale-95 shadow-lg flex items-center justify-center">
                 <CreditCard className="w-5 h-5 text-indigo-300" />
              </button>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-3 relative z-10">
              <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => navigate('/family/wallet/transactions')}>
                 <div className="flex items-center gap-1.5 mb-1.5">
                   <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
                   <div className="text-xs text-white/50 font-medium">الإنفاق الأسبوعي</div>
                 </div>
                 <div className="font-bold text-base">145.50 <span className="text-[10px] text-white/40">JOD</span></div>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => navigate('/family/requests')}>
                 <div className="flex items-center gap-1.5 mb-1.5">
                   <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                   <div className="text-xs text-white/50 font-medium">طلبات معلقة</div>
                 </div>
                 <div className="font-bold text-base flex items-center gap-1.5">
                   {pendingRequests} <span className="text-[10px] text-white/40">طلبات</span>
                   {pendingRequests > 0 && (
                     <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                     </span>
                   )}
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
           <button onClick={() => navigate('/family/requests')} className="bg-[#131B2C] p-4 rounded-3xl border border-white/5 flex flex-col items-center justify-center gap-3 shadow-lg active:scale-[0.98] transition-all hover:bg-white/5 relative group">
             {pendingRequests > 0 && (
               <div className="absolute top-3 left-3 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-rose-500/30">
                 {pendingRequests}
               </div>
             )}
             <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
               <Bell className="w-6 h-6" />
             </div>
             <span className="font-medium text-sm text-white/90">
               {pendingRequests > 0 ? `الطلبات (${pendingRequests})` : 'الطلبات'}
             </span>
           </button>
           
           <button onClick={() => navigate('/family/settings')} className="bg-[#131B2C] p-4 rounded-3xl border border-white/5 flex flex-col items-center justify-center gap-3 shadow-lg active:scale-[0.98] transition-all hover:bg-white/5 group">
             <div className="w-12 h-12 bg-white/5 text-white/70 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
               <Settings className="w-6 h-6" />
             </div>
             <span className="font-medium text-sm text-white/90">الإعدادات</span>
           </button>
        </div>

        {/* Children List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-white/90 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              أفراد العائلة
            </h3>
            <button onClick={() => navigate('/family/settings/members')} className="text-xs text-indigo-400 font-medium hover:text-indigo-300">
              إدارة
            </button>
          </div>
          
          <div className="space-y-3">
            {family.members.filter(m => m.role === 'child').map(child => (
              <div 
                key={child.id}
                onClick={() => navigate(`/family/child/${child.id}`)}
                className="bg-[#131B2C] p-4 rounded-3xl border border-white/5 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all shadow-lg hover:border-white/10 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center text-indigo-300 font-bold text-lg">
                    {child.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-white/90 text-base mb-1">{child.name}</div>
                    <div className="text-xs text-white/50 flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded-md w-fit">
                      <Activity className="w-3.5 h-3.5 text-emerald-400" />
                      المتبقي: {(child.weeklyLimit - child.spentThisWeek).toFixed(2)} JOD
                    </div>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <ChevronLeft className="w-4 h-4 text-white/50" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
