import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, CreditCard, Plus, X, Loader2, Sparkles, Wifi, ScanLine } from 'lucide-react';
import { useFamilyCards, useFamilyAuth } from '../FamilyContext';
import CardScanner from '../../CardScanner';

export default function LinkedCards() {
  const navigate = useNavigate();
  const { cards, addCard } = useFamilyCards();
  const { isParentAuth } = useFamilyAuth();
  
  useEffect(() => {
    if (!isParentAuth) {
      navigate('/family', { replace: true });
    }
  }, [navigate, isParentAuth]);

  if (!isParentAuth) return null;

  const [showAddCard, setShowAddCard] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i=0, len=match.length; i<len; i+=4) {
      parts.push(match.substring(i, i+4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };

  const isFormValid = cardNumber.replace(/\s+/g, '').length === 16 && expiry.length === 5 && cvv.length === 3;

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setLoading(true);
    const cleanNumber = cardNumber.replace(/\s+/g, '');
    
    setTimeout(() => {
      addCard({
        id: Date.now(),
        type: cleanNumber.startsWith('5') ? 'MasterCard' : 'Visa',
        last4: cleanNumber.slice(-4),
        exp: expiry,
        isPrimary: cards.length === 0
      });
      setLoading(false);
      setShowAddCard(false);
      setCardNumber('');
      setExpiry('');
      setCvv('');
    }, 500);
  };

  if (showScanner) {
    return (
      <CardScanner 
        lang="ar" 
        onSaveCard={(data) => {
          if (data.cardNumber) setCardNumber(formatCardNumber(data.cardNumber));
          if (data.expiry) setExpiry(data.expiry);
          if (data.cvc) setCvv(data.cvc);
          setShowScanner(false);
        }}
        onCancel={() => setShowScanner(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary pb-20 font-sans" dir="rtl">
      <header className="px-4 py-3 flex items-center justify-between sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-surface-primary shadow-sm border border-border-primary hover:bg-bg-secondary transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">بطاقات الدفع</h1>
        <button onClick={() => setShowAddCard(true)} className="p-2 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-accent-green hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors">
          <Plus className="w-5 h-5" />
        </button>
      </header>

      <div className="px-4 mt-6 space-y-5">
        {cards.map(card => (
          <div key={card.id} className="relative w-full aspect-[1.586/1] max-w-md mx-auto overflow-hidden rounded-[20px] bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#020617] border border-white/10 shadow-xl flex flex-col justify-between">
            {/* Glow Effects & Patterns */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none transform translate-x-1/4 -translate-y-1/4"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none transform -translate-x-1/4 translate-y-1/4"></div>
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            
            <div className="relative z-10 p-6 h-full flex flex-col justify-between">
              {/* Top Row */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
                  <span className="text-xl font-black tracking-tight text-white font-sans drop-shadow-md">
                    FinX Premium
                  </span>
                </div>
                <div className="text-[10px] font-bold text-indigo-200 bg-white/10 px-2.5 py-1 rounded-md border border-white/5 backdrop-blur-sm">
                  {card.isPrimary ? 'بطاقة أساسية' : 'بطاقة إضافية'}
                </div>
              </div>

              {/* Middle Row (Chip & Number) */}
              <div className="flex flex-col gap-4 mb-2">
                <div className="flex justify-between items-center w-full">
                  <div className="w-11 h-8 rounded bg-gradient-to-br from-[#e5e7eb] via-[#9ca3af] to-[#4b5563] relative overflow-hidden flex items-center justify-center opacity-90 shadow-sm border border-slate-300/20">
                     <div className="absolute inset-0 border border-black/10 rounded"></div>
                     <div className="w-full h-[1px] bg-black/20 absolute top-1/2"></div>
                     <div className="h-full w-[1px] bg-black/20 absolute left-1/3"></div>
                     <div className="h-full w-[1px] bg-black/20 absolute right-1/3"></div>
                  </div>
                  <Wifi className="w-6 h-6 text-slate-300 opacity-80 rotate-90" />
                </div>
                <div className="text-2xl sm:text-3xl font-mono tracking-[0.18em] sm:tracking-[0.25em] text-slate-200 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                  **** **** **** {card.last4}
                </div>
              </div>
              
              {/* Bottom Row */}
              <div className="flex justify-between items-end mt-auto">
                 <span className="text-sm font-semibold text-white/90">{card.type}</span>
                 <div className="flex flex-col items-end">
                    <span className="text-[10px] text-white/50 uppercase tracking-wider mb-1">تاريخ الانتهاء</span>
                    <span className="text-sm font-mono font-bold text-indigo-200">{card.exp}</span>
                 </div>
              </div>
            </div>
          </div>
        ))}

        {cards.length === 0 && (
          <div className="text-center text-sm text-text-secondary mt-10 p-6 bg-surface-primary rounded-2xl border border-border-primary">
            لا توجد بطاقات مرتبطة حالياً. أضف بطاقتك الأولى للبدء.
          </div>
        )}
      </div>

      {showAddCard && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddCard(false)}></div>
          <div className="relative bg-surface-primary w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 border border-border-primary">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-text-primary">إضافة بطاقة جديدة</h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowScanner(true)}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-full font-bold text-xs hover:bg-indigo-100 transition-colors"
                >
                  <ScanLine className="w-3.5 h-3.5" />
                  مسح
                </button>
                <button onClick={() => setShowAddCard(false)} className="p-2 bg-bg-secondary rounded-full text-text-secondary hover:text-text-primary dark:hover:text-slate-300">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleAddCard} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">رقم البطاقة</label>
                <input 
                  type="text" 
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="0000 0000 0000 0000" 
                  className="w-full bg-bg-secondary/50 border border-border-primary rounded-xl px-4 py-3 text-left font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-text-primary"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">تاريخ الانتهاء</label>
                  <input 
                    type="text" 
                    value={expiry}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, '');
                      if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2, 4);
                      setExpiry(val);
                    }}
                    placeholder="MM/YY" 
                    className="w-full bg-bg-secondary/50 border border-border-primary rounded-xl px-4 py-3 text-left font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-text-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">رمز CVV</label>
                  <input 
                    type="password" 
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    maxLength={4}
                    placeholder="123" 
                    className="w-full bg-bg-secondary/50 border border-border-primary rounded-xl px-4 py-3 text-left font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-text-primary"
                    required
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading || cardNumber.length < 15 || expiry.length < 5 || cvv.length < 3}
                className="w-full bg-accent-green hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 mt-6 shadow-md shadow-emerald-500/20"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'حفظ البطاقة'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
