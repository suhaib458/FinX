import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Users, ShieldAlert, CreditCard } from 'lucide-react';
import ProfilePhotoManager from '../../ProfilePhotoManager';
import { useFamilyContext } from '../FamilyContext';

export default function FamilySettings() {
  const navigate = useNavigate();
  const { members, updateMember } = useFamilyContext();
  const parent = members.find(m => m.role === 'parent');

  useEffect(() => {
    const isParent = sessionStorage.getItem('parent_auth') === 'true';
    if (!isParent) {
      navigate('/family', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary pb-20 font-sans" dir="rtl">
      <header className="px-4 py-3 flex items-center justify-between sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-surface-primary shadow-sm border border-border-primary hover:bg-bg-secondary transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">إعدادات العائلة</h1>
        <div className="w-9 h-9" />
      </header>

      <div className="px-4 space-y-6 mt-4">
        {/* Father Profile Photo Section */}
        <div className="bg-surface-primary rounded-[1.25rem] border border-border-primary overflow-hidden shadow-sm p-4">
          <h2 className="font-bold text-base mb-4 text-text-primary">صورة الحساب (الأب)</h2>
          <ProfilePhotoManager 
            lang="ar" 
            onPhotoChange={(url) => {
              if (parent) {
                updateMember(parent.id, { avatar: url || undefined });
              }
            }}
          />
        </div>

        <div className="bg-surface-primary rounded-[1.25rem] border border-border-primary overflow-hidden shadow-sm">
          <div 
            onClick={() => navigate('/family/settings/members')}
            className="p-3.5 border-b border-border-primary/50 flex items-center justify-between cursor-pointer hover:bg-bg-secondary/20 active:bg-slate-100 dark:active:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm">إدارة الأفراد</span>
            </div>
            <ChevronRight className="w-4 h-4 text-text-secondary rotate-180" />
          </div>
          
          <div 
            onClick={() => navigate('/family/settings/cards')}
            className="p-3.5 border-b border-border-primary/50 flex items-center justify-between cursor-pointer hover:bg-bg-secondary/20 active:bg-slate-100 dark:active:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm">بطاقات الدفع المرتبطة</span>
            </div>
            <ChevronRight className="w-4 h-4 text-text-secondary rotate-180" />
          </div>

          <div 
            onClick={() => navigate('/family/settings/limits')}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-bg-secondary/20 active:bg-slate-100 dark:active:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-full flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm">حدود الإنفاق الشاملة</span>
            </div>
            <ChevronRight className="w-4 h-4 text-text-secondary rotate-180" />
          </div>
        </div>
      </div>
    </div>
  );
}
