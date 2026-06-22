import React, { useState, useEffect } from "react";
import { Check, X, Star, ShieldCheck, Zap, CreditCard, ChevronRight, RotateCcw } from "lucide-react";
import { translations } from "../translations";
import { auth } from "../lib/firebase";
import { UserSubscription, getUserSubscription, upgradePlanDemo } from "../lib/subscription";

interface SubscriptionModalProps {
  lang: "ar" | "en";
  onClose: () => void;
}

export default function SubscriptionModal({ lang, onClose }: SubscriptionModalProps) {
  const t = translations[lang];
  const isRtl = lang === "ar";
  const [currentPlan, setCurrentPlan] = useState<UserSubscription>({ plan: "free" });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<"premium" | "elite" | null>(null);

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

  const handleSubscribe = async (plan: "premium" | "elite") => {
    if (!auth.currentUser) return;
    setActionLoading(plan);
    try {
      // In a real app we'd redirect to Stripe Checkout
      // const res = await fetch('/api/create-checkout-session', { method: 'POST', body: JSON.stringify({ plan, uid: auth.currentUser.uid }) });
      // const { url } = await res.json();
      // window.location.href = url;
      
      // Demo fallback
      await upgradePlanDemo(auth.currentUser.uid, plan);
      setCurrentPlan({ plan, status: "active" });
    } catch (e) {
      console.error(e);
    }
    setActionLoading(null);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
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
        isRtl ? "المستشاراليومي الذكي" : "Daily Pro Advisor"
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
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden relative flex flex-col my-8">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="bg-slate-50 dark:bg-[#020617] border-b border-slate-200 dark:border-slate-800 p-6 sm:p-8 text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none transform -translate-x-1/2 translate-y-1/2"></div>
          
           <h2 className={`text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-2 ${isRtl ? 'font-arabic' : 'font-sans'}`}>
             {isRtl ? "معمارية الباقات والاشتراكات" : "FinX Subscription Architecture"}
           </h2>
           <p className="text-[13px] sm:text-sm font-medium text-slate-700 dark:text-slate-400 max-w-lg mx-auto">
             {isRtl ? "اختر الباقة المناسبة لطموحك المالي والمهني، وقم بالترقية للحصول على أدوات الذكاء الاصطناعي الكاملة." : "Choose the tier that matches your financial trajectory. Upgrade to unlock full AI capabilities."}
           </p>
        </div>

        <div className="p-5 sm:p-6 flex-1 bg-white dark:bg-[#0f172a]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 max-w-4xl mx-auto">
            {plans.map((plan) => {
              const isActive = currentPlan.plan === plan.id;
              
              return (
                <div key={plan.id} className={`relative flex flex-col rounded-[20px] border p-5 transition-all duration-300 ${plan.popular ? 'border-indigo-500 shadow-xl shadow-indigo-500/10 dark:shadow-indigo-500/20 scale-100 md:scale-[1.02] bg-white dark:bg-slate-900 md:z-10' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#020617] opacity-90 hover:opacity-100'}`}>
                  {plan.popular && (
                    <div className="absolute -top-2.5 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                      <Star className="w-2.5 h-2.5 fill-white" />
                      {isRtl ? "الأكثر شعبية" : "Most Popular"}
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <h3 className={`text-base font-bold text-slate-900 dark:text-white ${isRtl ? 'font-arabic' : 'font-sans'}`}>{plan.name}</h3>
                    <p className="text-[11px] sm:text-xs text-slate-700 dark:text-slate-400 mt-1">{plan.desc}</p>
                  </div>
                  
                  <div className="mb-4 flex items-baseline gap-1 border-b border-slate-200 dark:border-slate-800/60 pb-4">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{plan.price}</span>
                    {plan.price !== "$0" && <span className="text-[11px] text-slate-700 dark:text-slate-400 font-semibold">{plan.period}</span>}
                  </div>

                  <div className="flex-1 space-y-2.5 mb-5">
                    {plan.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 text-emerald-500" />
                        </div>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-snug">{feat}</span>
                      </div>
                    ))}
                    {plan.missing.map((feat, i) => (
                      <div key={`m-${i}`} className="flex items-start gap-2 opacity-50">
                        <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                          <X className="w-2.5 h-2.5 text-slate-700 dark:text-slate-400" />
                        </div>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-400 leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto pt-3">
                    {isActive ? (
                      <button disabled className="w-full py-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 text-xs flex items-center justify-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" />
                        {isRtl ? "الباقة الحالية" : "Current Plan"}
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleSubscribe(plan.id as "premium" | "elite")}
                        disabled={actionLoading !== null}
                        className={`w-full py-2.5 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer
                          ${plan.popular 
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25' 
                            : 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900'}`}
                      >
                        {actionLoading === plan.id ? (
                          <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <CreditCard className="w-3.5 h-3.5" />
                            {isRtl ? "ترقية الآن" : "Upgrade"}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 text-center text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> {isRtl ? "تشفير آمن" : "Secure Encryption"}</span>
            <span className="hidden sm:inline">&bull;</span>
            <span className="flex items-center gap-1"><RotateCcw className="w-3 h-3" /> {isRtl ? "إلغاء في أي وقت" : "Cancel Anytime"}</span>
            <span className="hidden sm:inline">&bull;</span>
            <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {isRtl ? "مزامنة فورية" : "Instant Activation"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
