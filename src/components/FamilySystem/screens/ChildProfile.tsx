import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Camera, User, Wallet, Target } from 'lucide-react';
import { useFamilyMembers, useFamilyAuth } from '../FamilyContext';

import { ProfileService } from '../../../services/ProfileService';

export default function ChildProfile() {
  const navigate = useNavigate();
  const { members, updateMember } = useFamilyMembers();
  const { isChildAuth, activeChildId } = useFamilyAuth();
  const child = members.find(m => m.id === activeChildId) || members.find(m => m.role === 'child');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isChildAuth) {
      navigate('/family', { replace: true });
    }
  }, [navigate, isChildAuth]);

  if (!isChildAuth || !child) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setUploading(true);
        // Reuse the existing ProfileService image processing and upload infrastructure
        const processedBlob = await ProfileService.processImageFile(file);
        
        // Use a deterministic UID for the child inside the family context to save to Firebase Storage
        const childUid = `family-child-${child.id}`;
        const downloadURL = await ProfileService.uploadProfilePhoto(childUid, processedBlob);
        
        // Update the context state with the uploaded URL
        updateMember(child.id, { avatar: downloadURL });
      } catch (error) {
        console.error("Failed to upload child profile photo", error);
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary pb-20 font-sans" dir="rtl">
      <header className="px-4 py-3 flex items-center justify-between sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-md border-b border-border-primary/50">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-surface-primary shadow-sm border border-border-primary hover:bg-bg-secondary transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">حسابي</h1>
        <div className="w-9 h-9" />
      </header>

      <div className="px-4 space-y-5 mt-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900/50 border-4 border-bg-primary shadow-lg overflow-hidden flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-3xl">
              {child.avatar ? (
                <img src={child.avatar} alt={child.name} className="w-full h-full object-cover" />
              ) : (
                child.name.charAt(0)
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-md border-2 border-bg-primary active:scale-95 transition-transform disabled:opacity-50"
            >
              {uploading ? (
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
          <h2 className="text-2xl font-black">{child.name}</h2>
          <div className="text-text-secondary text-sm flex items-center gap-1.5 mt-1">
             <User className="w-4 h-4" />
             <span>حساب الأبناء (الجيل الذكي)</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mt-6">
           <div className="bg-surface-primary p-4 rounded-[1.25rem] border border-border-primary shadow-sm flex flex-col items-center">
             <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center mb-2">
               <Wallet className="w-5 h-5" />
             </div>
             <div className="text-xs text-text-secondary mb-1">الرصيد المتاح</div>
             <div className="text-lg font-black">{child.allowance.toFixed(2)} JOD</div>
           </div>

           <div className="bg-surface-primary p-4 rounded-[1.25rem] border border-border-primary shadow-sm flex flex-col items-center">
             <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center mb-2">
               <Target className="w-5 h-5" />
             </div>
             <div className="text-xs text-text-secondary mb-1">المهام المنجزة</div>
             <div className="text-lg font-black">12 مهمة</div>
           </div>
        </div>

        {/* Info Cards */}
        <div className="bg-surface-primary p-5 rounded-[1.25rem] border border-border-primary shadow-sm mt-4">
          <h3 className="font-bold text-base mb-4">تفاصيل الحساب</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-border-primary/50">
              <span className="text-sm text-text-secondary">العمر</span>
              <span className="font-bold text-sm">12 سنة</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-border-primary/50">
              <span className="text-sm text-text-secondary">المرحلة الدراسية</span>
              <span className="font-bold text-sm">الصف السادس</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-border-primary/50">
              <span className="text-sm text-text-secondary">الحد الأسبوعي</span>
              <span className="font-bold text-sm">{child.weeklyLimit.toFixed(2)} JOD</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">نسبة الإنفاق</span>
              <span className="font-bold text-sm">
                {Math.round((child.spentThisWeek / child.weeklyLimit) * 100)}%
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
