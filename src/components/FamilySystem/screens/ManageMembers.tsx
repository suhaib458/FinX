import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Plus, X, Loader2 } from 'lucide-react';
import type { FamilyProfile, FamilyMember } from '../types';
import { useFamilyMembers, useFamilyAuth } from '../FamilyContext';

interface ManageMembersProps {
  family: FamilyProfile;
}

export default function ManageMembers({ family }: ManageMembersProps) {
  const navigate = useNavigate();
  const { members, setMembers } = useFamilyMembers();
  const { isParentAuth } = useFamilyAuth();
  const [showAddMember, setShowAddMember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [memberAge, setMemberAge] = useState('');

  useEffect(() => {
    if (!isParentAuth) {
      navigate('/family', { replace: true });
    }
  }, [navigate, isParentAuth]);

  if (!isParentAuth) return null;

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName) return;
    
    setLoading(true);
    setTimeout(() => {
      const newMember: FamilyMember = {
        id: `child-${Date.now()}`,
        name: memberName,
        role: 'child',
        avatar: '',
        allowance: 0,
        spentThisWeek: 0,
        weeklyLimit: 50,
        isCardFrozen: false,
        score: 0
      };
      
      setMembers(prev => [...prev, newMember]);
      
      setLoading(false);
      setShowAddMember(false);
      setMemberName('');
      setMemberAge('');
    }, 1000);
  };


  return (
    <div className="min-h-screen bg-bg-primary text-text-primary pb-20 font-sans" dir="rtl">
      <header className="px-4 py-3 flex items-center justify-between sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-surface-primary shadow-sm border border-border-primary hover:bg-bg-secondary transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">إدارة الأفراد</h1>
        <button onClick={() => setShowAddMember(true)} className="p-2 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">
          <Plus className="w-5 h-5" />
        </button>
      </header>

      <div className="px-4 mt-6 space-y-4">
        {members.filter(m => m.role === 'child').map(child => (
          <div key={child.id} onClick={() => navigate(`/family/child/${child.id}`)} className="bg-surface-primary rounded-2xl p-4 flex items-center justify-between border border-border-primary shadow-sm cursor-pointer hover:bg-bg-secondary transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                {child.name.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-base">{child.name}</div>
                <div className="text-xs text-text-secondary">ابن / ابنة</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-text-secondary rotate-180" />
          </div>
        ))}
      </div>

      {showAddMember && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddMember(false)}></div>
          <div className="relative bg-surface-primary w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 border border-border-primary">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-text-primary">إضافة فرد جديد</h3>
              <button onClick={() => setShowAddMember(false)} className="p-2 bg-bg-secondary rounded-full text-text-secondary hover:text-text-primary dark:hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">الاسم الكامل</label>
                <input 
                  type="text" 
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder="اسم الفرد" 
                  className="w-full bg-bg-secondary/50 border border-border-primary rounded-xl px-4 py-3 text-right focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-text-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">العمر</label>
                <input 
                  type="number" 
                  value={memberAge}
                  onChange={(e) => setMemberAge(e.target.value)}
                  placeholder="العمر" 
                  className="w-full bg-bg-secondary/50 border border-border-primary rounded-xl px-4 py-3 text-right focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-text-primary"
                />
              </div>
              <button 
                type="submit" 
                disabled={loading || memberName.length < 2}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 mt-6 shadow-md shadow-indigo-500/20"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'إضافة الفرد'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
