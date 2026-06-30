import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, KeyRound, User, Loader2, AlertCircle } from 'lucide-react';
import { useFamilyAuth } from '../FamilyContext';

export default function ChildAuth() {
  const navigate = useNavigate();
  const [childId, setChildId] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginAsChild } = useFamilyAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Mock child auth verification
    setTimeout(() => {
      setLoading(false);
      // In a real app we'd verify the PIN against the child's profile
      if (pin.length >= 4) {
        loginAsChild(childId);
        navigate('/family/child');
      } else {
        setError('رمز الدخول غير صحيح. يرجى المحاولة مرة أخرى.');
      }
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col bg-bg-primary h-full" dir="rtl">
      <header className="px-4 py-3 flex items-center sticky top-0 z-50">
        <button onClick={() => navigate('/family')} className="p-2 rounded-full bg-surface-primary shadow-sm border border-border-primary hover:bg-bg-secondary transition-colors text-text-primary">
          <ArrowRight className="w-5 h-5" />
        </button>
      </header>
      
      <div className="flex-1 flex flex-col px-5 pt-1 pb-4 overflow-y-auto items-center justify-center max-w-md mx-auto w-full">
        <div className="bg-surface-card rounded-[1.25rem] p-6 border border-border-primary shadow-sm w-full flex flex-col items-center">
          <div className="text-center mb-8 w-full">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-accent-green rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-surface-card shadow-sm">
            <User className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mb-2">دخول الأبناء</h1>
          <p className="text-sm text-text-secondary">أدخل معرّف الحساب ورمز الدخول الخاص بك</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 w-full">
            <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
            <p className="text-sm text-danger font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 w-full">
          <div className="relative">
            <User className="w-5 h-5 absolute right-4 top-3.5 text-text-secondary" />
            <input
              type="text"
              required
              placeholder="معرّف الحساب (مثال: أحمد)"
              value={childId}
              onChange={e => setChildId(e.target.value)}
              className="w-full bg-surface-primary border border-border-primary rounded-2xl py-3.5 pr-12 pl-4 text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              dir="rtl"
            />
          </div>
          
          <div className="relative">
            <KeyRound className="w-5 h-5 absolute right-4 top-3.5 text-text-secondary" />
            <input
              type="password"
              required
              maxLength={4}
              placeholder="رمز الدخول السري (PIN)"
              value={pin}
              onChange={e => setPin(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full bg-surface-primary border border-border-primary rounded-2xl py-3.5 pr-12 pl-4 text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm font-mono tracking-widest text-lg"
              dir="rtl"
            />
          </div>

          <button
            type="submit"
            disabled={loading || pin.length < 4}
            className="w-full py-3.5 rounded-2xl bg-accent-green hover:bg-emerald-700 text-white font-bold transition-all flex items-center justify-center gap-2 mt-2 shadow-md shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'دخول للحساب'}
          </button>
        </form>
        </div>
      </div>
    </div>
  );
}
