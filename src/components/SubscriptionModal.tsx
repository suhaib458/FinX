import React, { useState, useEffect } from "react";
import { Check, X, Star, ShieldCheck, Zap, CreditCard, RotateCcw, SlidersHorizontal, ArrowRight, ArrowLeft } from "lucide-react";
import { translations } from "../translations";
import { auth } from "../lib/firebase";
import { UserSubscription, getUserSubscription, upgradePlan, SubscriptionPlan } from "../lib/subscription";
import { ActiveCard, Transaction } from "../types";
import CardScanner from "./CardScanner";

interface SubscriptionModalProps {
  lang: "ar" | "en";
  onClose: () => void;
  activeCard?: ActiveCard | null;
  onSaveCard?: (cardData: ActiveCard) => void;
  onAddTransaction?: (tx: Transaction) => void;
  onSubscriptionSuccess?: () => void;
}

export default function SubscriptionModal({ 
  lang, 
  onClose,
  activeCard,
  onSaveCard,
  onAddTransaction,
  onSubscriptionSuccess 
}: SubscriptionModalProps) {
  const t = translations[lang];
  const isRtl = lang === "ar";
  const [currentPlan, setCurrentPlan] = useState<UserSubscription>({ plan: "free" });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<"premium" | "elite" | null>(null);

  const [showScanner, setShowScanner] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedPlanInfo, setSelectedPlanInfo] = useState<{id: SubscriptionPlan, name: string, price: string} | null>(null);

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [localActiveCard, setLocalActiveCard] = useState<ActiveCard | null | undefined>(activeCard);

  useEffect(() => {
    setLocalActiveCard(activeCard);
  }, [activeCard]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsMouseDown(true);
    setIsDragging(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
    setTimeout(() => setIsDragging(false), 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    
    if (Math.abs(x - startX) > 5) {
      setIsDragging(true);
    }
    
    const walk = (x - startX) * 1.5;
    if (isRtl) {
      scrollRef.current.scrollLeft = scrollLeft + walk;
    } else {
      scrollRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  useEffect(() => {
    if (auth.currentUser) {
      getUserSubscription(auth.currentUser.uid).then((sub) => {
        setCurrentPlan(sub);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const handleUpgradeClick = (planId: SubscriptionPlan, name: string, price: string) => {
    setSelectedPlanInfo({ id: planId, name, price });
    if (!(localActiveCard || activeCard)) {
      setShowScanner(true);
    } else {
      setShowConfirm(true);
    }
  };

  const executePurchase = async () => {
    const cardToUse = localActiveCard || activeCard;
    if (!auth.currentUser || !selectedPlanInfo || !cardToUse) return;
    setActionLoading(selectedPlanInfo.id as "premium" | "elite");
    try {
      await upgradePlan(auth.currentUser.uid, selectedPlanInfo.id);
      setCurrentPlan({ plan: selectedPlanInfo.id, status: "active" });
      
      if (onAddTransaction) {
        const cost = parseFloat(selectedPlanInfo.price.replace(/[^0-9.]/g, ''));
        onAddTransaction({
          date: new Date().toISOString().split("T")[0],
          desc: isRtl 
            ? `اشتراك: ${selectedPlanInfo.name} - تم الدفع ببطاقة تنتهي بـ ${cardToUse.cardNumber.slice(-4)}`
            : `Subscription: ${selectedPlanInfo.name} - Paid with card ending in ${cardToUse.cardNumber.slice(-4)}`,
          amount: -cost,
          type: "expense",
          category: "Subscriptions"
        });
      }
      
      setShowConfirm(false);
      setShowSuccess(true);
      
      setTimeout(() => {
        if (onSubscriptionSuccess) onSubscriptionSuccess();
        onClose();
      }, 3000);
    } catch (e) {
      console.error(e);
    }
    setActionLoading(null);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (showScanner) {
    return (
      <div className="fixed inset-0 z-[110] bg-black" dir={isRtl ? 'rtl' : 'ltr'}>
        <CardScanner 
          lang={lang} 
          onSaveCard={(cardData) => {
            if (onSaveCard) onSaveCard(cardData);
            setLocalActiveCard(cardData);
            setShowScanner(false);
            setShowConfirm(true);
          }}
          onCancel={() => setShowScanner(false)}
        />
      </div>
    );
  }

  const currentActiveCard = localActiveCard || activeCard;

  if (showConfirm && currentActiveCard) {
    return (
      <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="bg-surface-primary rounded-3xl p-6 w-full max-w-sm shadow-2xl relative">
          <button 
            onClick={() => setShowConfirm(false)}
            className="absolute top-4 right-4 p-2 bg-bg-secondary rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
          
          <h2 className="text-xl font-bold mb-6 text-center">{isRtl ? "تأكيد الترقية" : "Confirm Upgrade"}</h2>
          
          <div className="bg-bg-secondary p-4 rounded-2xl mb-6">
            <div className="text-sm text-text-secondary mb-2">{isRtl ? "الباقة" : "Plan"}</div>
            <div className="font-bold mb-4">{selectedPlanInfo?.name} - {selectedPlanInfo?.price}</div>
            
            <div className="text-sm text-text-secondary mb-2">{isRtl ? "سيتم استخدام البطاقة التالية:" : "Payment Method"}</div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <div className="font-bold text-sm">{currentActiveCard.bankName || "Bank"} • {currentActiveCard.brand || "Card"}</div>
                <div className="text-xs text-text-secondary font-mono mt-0.5">{currentActiveCard.cardNumber}</div>
                <div className="text-xs text-text-secondary">{isRtl ? "تنتهي في:" : "Exp:"} {currentActiveCard.expiryDate}</div>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => {
              setShowConfirm(false);
              setShowScanner(true);
            }}
            className="w-full py-3 mb-3 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors text-sm"
          >
            {isRtl ? "استخدام بطاقة أخرى" : "Use Another Card"}
          </button>
          
          <button 
            onClick={executePurchase}
            disabled={actionLoading !== null}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-colors flex items-center justify-center gap-2"
          >
            {actionLoading !== null ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              isRtl ? "تأكيد الترقية" : "Confirm Purchase"
            )}
          </button>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="bg-surface-primary rounded-3xl p-8 w-full max-w-sm shadow-2xl flex flex-col items-center text-center animate-in zoom-in duration-300">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6">
            <Check className="w-10 h-10 text-accent-green" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{isRtl ? "تمت ترقية اشتراكك بنجاح" : "Subscription Upgraded"}</h2>
          <p className="text-text-secondary font-medium">
            {isRtl ? `مرحبًا بك في باقة ${selectedPlanInfo?.name}` : `Welcome to ${selectedPlanInfo?.name}`}
          </p>
        </div>
      </div>
    );
  }

  const plans = [
    {
      id: "free",
      name: isRtl ? "الباقة المجانية" : "Free Plan",
      price: "$0",
      period: isRtl ? "/ شهر" : "/ mo",
      desc: isRtl ? "الأساسيات لإدارة أموالك" : "Basics for managing your money",
      features: [
        isRtl ? "تحليل 2 كشف حساب شهرياً" : "2 statement analyses / mo",
        isRtl ? "10 رسائل للمستشار الذكي" : "10 AI Coach messages",
        isRtl ? "تتبع النفقات الأساسي" : "Basic expense tracking"
      ],
      missing: [
        isRtl ? "تقارير الائتمان المتقدمة" : "Advanced credit reports",
        isRtl ? "البحث الذكي عن وظائف" : "Smart Job Matching",
        isRtl ? "المستشار الشخصي (CFO)" : "AI Personal CFO"
      ]
    },
    {
      id: "premium",
      name: isRtl ? "البرو (Premium)" : "FinX Premium",
      price: "$9.99",
      period: isRtl ? "/ شهر" : "/ mo",
      desc: isRtl ? "أدوات احترافية للنمو المالي" : "Pro tools for financial growth",
      popular: true,
      features: [
        isRtl ? "تحليل 10 كشوفات حساب" : "10 statement analyses",
        isRtl ? "100 رسالة للمستشار الذكي" : "100 AI Coach messages",
        isRtl ? "تحليل ذكي للسيرة الذاتية (CV)" : "Smart CV Analysis",
        isRtl ? "المستشار اليومي الذكي" : "Daily Pro Advisor"
      ],
      missing: [
         isRtl ? "البحث الذكي عن وظائف (شبيه بـ LinkedIn)" : "Social Job Matching",
         isRtl ? "دعم أولوية VIP" : "Priority VIP Support"
      ]
    },
    {
      id: "elite",
      name: isRtl ? "النخبة (Elite)" : "FinX Elite",
      price: "$24.99",
      period: isRtl ? "/ شهر" : "/ mo",
      desc: isRtl ? "مجموعة الصلاحيات الكاملة اللامحدودة" : "The complete unlimited suite",
      features: [
        isRtl ? "كشوفات حساب ورسائل لامحدودة" : "Unlimited statements & messages",
        isRtl ? "مولد خطابات تقديم ذكي" : "AI Cover Letter Gen",
        isRtl ? "توافق مهني بنظام ذكي للوظائف" : "Smart Job Matching Grid",
        isRtl ? "مستشار مالي (Personal CFO) مع تنبؤ شامل" : "Personal AI CFO & Forecasting",
        isRtl ? "أولوية الدعم الفني" : "Priority VIP support"
      ],
      missing: []
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-[#040814]/95 backdrop-blur-3xl flex flex-col overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
      <button 
        onClick={onClose}
        className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-50 backdrop-blur-md"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="pt-12 pb-4 px-4 shrink-0 text-center relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-1">
          {isRtl ? "الارتقاء المالي والمهني" : "Elevate Your Journey"}
        </h2>
        <p className="text-xs sm:text-sm font-medium text-text-secondary max-w-sm mx-auto">
          {isRtl ? "اسحب لليسار أو اليمين لاكتشاف الباقات" : "Swipe left or right to explore plans"}
        </p>
      </div>

      <div className="flex-1 min-h-0 relative touch-pan-x">
        <div 
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`w-full h-full flex overflow-x-auto ${isDragging ? 'snap-none' : 'snap-x snap-mandatory'} px-[12.5vw] sm:px-[calc(50%-150px)] gap-4 pb-8 pt-4 no-scrollbar items-center cursor-grab active:cursor-grabbing`}
        >
          {plans.map((plan) => {
            const isActive = currentPlan.plan === plan.id;
            
            return (
              <div 
                key={plan.id} 
                className={`snap-center shrink-0 w-[75vw] sm:w-[300px] max-w-[300px] relative flex flex-col rounded-3xl border p-5 sm:p-6 transition-all duration-300 h-auto
                  ${plan.popular 
                    ? 'border-indigo-500/50 bg-slate-900/80 shadow-[0_0_40px_-15px_rgba(99,102,241,0.4)] backdrop-blur-xl scale-100 sm:scale-105 z-10' 
                    : 'border-white/10 bg-white/5 backdrop-blur-lg scale-95 sm:scale-100 opacity-90'} ${isDragging ? 'pointer-events-none' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-indigo-500/30 whitespace-nowrap z-10">
                    <Star className="w-3 h-3 fill-white" />
                    {isRtl ? "الأكثر شعبية" : "Most Popular"}
                  </div>
                )}
                
                <div className="mb-4 mt-2">
                  <h3 className="text-lg sm:text-xl font-black text-white">{plan.name}</h3>
                  <p className="text-xs text-text-secondary mt-1">{plan.desc}</p>
                </div>
                
                <div className="mb-4 flex items-baseline gap-1 border-b border-white/10 pb-4">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono">{plan.price}</span>
                  {plan.price !== "$0" && <span className="text-xs text-text-secondary font-semibold">{plan.period}</span>}
                </div>

                <div className="flex-1 space-y-3 mb-6">
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-emerald-400" />
                      </div>
                      <span className="text-sm font-bold text-slate-200">{feat}</span>
                    </div>
                  ))}
                  {plan.missing.map((feat, i) => (
                    <div key={`m-${i}`} className="flex items-center gap-3 opacity-40">
                      <div className="w-5 h-5 rounded-full border border-slate-600 flex items-center justify-center shrink-0">
                        <X className="w-3 h-3 text-text-secondary" />
                      </div>
                      <span className="text-sm font-medium text-text-secondary line-through decoration-slate-600">{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto shrink-0 pt-2">
                  {isActive ? (
                    <button disabled className="w-full h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 text-sm flex items-center justify-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      {isRtl ? "الباقة الحالية" : "Current Plan"}
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleUpgradeClick(plan.id as "premium" | "elite", plan.name, plan.price)}
                      disabled={actionLoading !== null}
                      className={`w-full h-12 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden group
                        ${plan.popular 
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
                          : 'bg-white hover:bg-slate-100 text-slate-900'}`}
                    >
                      {actionLoading === plan.id ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          {isRtl ? "الترقية الآن" : "Upgrade Now"}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="shrink-0 p-6 pt-2 pb-8 bg-gradient-to-t from-[#020617] to-transparent">
        <div className="flex items-center justify-center gap-4 text-xs font-medium text-text-secondary">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> {isRtl ? "تشفير آمن" : "Secure Encryption"}</span>
          <span className="w-1 h-1 rounded-full bg-slate-700"></span>
          <span className="flex items-center gap-1.5"><RotateCcw className="w-4 h-4" /> {isRtl ? "إلغاء مرن" : "Flexible Cancel"}</span>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}

