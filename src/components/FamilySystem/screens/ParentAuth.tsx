import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Fingerprint, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import { useFamilyAuth } from '../FamilyContext';
import { useAuth } from '../../../contexts/AuthContext';

export default function ParentAuth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginAsParent } = useFamilyAuth();
  const { isAuthenticated } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Authenticate with Firebase for parent role
      await signInWithEmailAndPassword(auth, email, password);
      loginAsParent();
      setLoading(false);
      navigate('/family/parent');
    } catch (err: any) {
      setLoading(false);
      console.error(err);
      setError('بيانات الدخول غير صحيحة. يرجى المحاولة مرة أخرى.'); // Invalid credentials
    }
  };

  const handleBiometric = () => {
    if (!isAuthenticated) {
      setError('يرجى تسجيل الدخول بالبريد الإلكتروني أولاً.');
      return;
    }
    
    // Mock biometric for demonstration
    setLoading(true);
    setTimeout(() => {
      loginAsParent();
      setLoading(false);
      navigate('/family/parent');
    }, 1500);
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
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mb-2">دخول ولي الأمر</h1>
          <p className="text-sm text-text-secondary">يرجى تأكيد هويتك للوصول إلى لوحة التحكم</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 w-full">
            <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
            <p className="text-sm text-danger font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 w-full">
          <div className="relative">
            <Mail className="w-5 h-5 absolute right-4 top-3.5 text-text-secondary" />
            <input
              type="email"
              required
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-surface-primary border border-border-primary rounded-2xl py-3.5 pr-12 pl-4 text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              dir="rtl"
            />
          </div>
          
          <div className="relative">
            <Lock className="w-5 h-5 absolute right-4 top-3.5 text-text-secondary" />
            <input
              type="password"
              required
              placeholder="كلمة المرور"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-surface-primary border border-border-primary rounded-2xl py-3.5 pr-12 pl-4 text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              dir="rtl"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all flex items-center justify-center gap-2 mt-2 shadow-md shadow-indigo-500/20"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'متابعة'}
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center w-full">
          <div className="w-full flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-border-primary"></div>
            <span className="text-xs text-text-secondary font-medium uppercase tracking-wider">أو</span>
            <div className="flex-1 h-px bg-border-primary"></div>
          </div>
          
          <button 
            onClick={handleBiometric}
            className="w-16 h-16 rounded-full bg-surface-primary shadow-md border border-border-primary flex items-center justify-center text-indigo-600 dark:text-indigo-400 hover:scale-105 active:scale-95 transition-all"
          >
            <Fingerprint className="w-8 h-8" />
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
