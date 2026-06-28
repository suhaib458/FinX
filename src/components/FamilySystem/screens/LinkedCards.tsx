import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, CreditCard, Plus, X, Loader2 } from 'lucide-react';

export default function LinkedCards() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([
    { id: 1, type: 'Visa', last4: '4242', exp: '12/26', isPrimary: true }
  ]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !expiry) return;
    
    setLoading(true);
    setTimeout(() => {
      setCards(prev => [...prev, {
        id: Date.now(),
        type: cardNumber.startsWith('5') ? 'MasterCard' : 'Visa',
        last4: cardNumber.slice(-4) || '0000',
        exp: expiry,
        isPrimary: false
      }]);
      setLoading(false);
      setShowAddCard(false);
      setCardNumber('');
      setExpiry('');
    }, 1000);
  };

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

      <div className="px-4 mt-6 space-y-4">
        {cards.map(card => (
          <div key={card.id} className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-8">
                <CreditCard className="w-8 h-8 opacity-80" />
                <div className="font-bold text-lg opacity-80">{card.type}</div>
              </div>
              <div className="text-xl font-mono tracking-widest mb-2">**** **** **** {card.last4}</div>
              <div className="flex justify-between text-sm opacity-80">
                <span>{card.isPrimary ? 'البطاقة الأساسية' : 'بطاقة إضافية'}</span>
                <span>{card.exp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddCard && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddCard(false)}></div>
          <div className="relative bg-surface-primary w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 border border-border-primary">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-text-primary">إضافة بطاقة جديدة</h3>
              <button onClick={() => setShowAddCard(false)} className="p-2 bg-bg-secondary rounded-full text-text-secondary hover:text-text-primary dark:hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleAddCard} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">رقم البطاقة</label>
                <input 
                  type="text" 
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
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
                    maxLength={3}
                    placeholder="123" 
                    className="w-full bg-bg-secondary/50 border border-border-primary rounded-xl px-4 py-3 text-left font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-text-primary"
                    required
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading || cardNumber.length < 15 || expiry.length < 5}
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
