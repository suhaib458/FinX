import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Sparkles, Wifi, Shield, ShieldCheck, Eye, EyeOff, Lock, AlertTriangle, 
  Clock, Smartphone, Key, Settings, Trash2, X, RefreshCw, Activity,
  ChevronRight, AlertCircle, Fingerprint, ShieldAlert, History, Lightbulb
} from "lucide-react";
import { ActiveCard } from "../types";
import { auth } from "../lib/firebase";

interface VirtualCardProps {
  activeCard?: ActiveCard | null;
  lang: "ar" | "en";
  isRtl: boolean;
  onRemoveCard?: () => void;
}

type SecurityEvent = {
  id: string;
  type: string;
  date: Date;
  device: string;
  method: string;
  status: "success" | "blocked" | "warning";
};

type TrustedDevice = {
  id: string;
  name: string;
  os: string;
  browser: string;
  lastActive: Date;
  status: "trusted" | "temporary" | "unknown";
};

import { useCardReveal } from '../hooks/useCardReveal';

export default React.memo(function VirtualCard({ activeCard, lang, isRtl, onRemoveCard }: VirtualCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  
  const [showSecurityCenter, setShowSecurityCenter] = useState(false);
  const [isEmergencyLocked, setIsEmergencyLocked] = useState(false);
  
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>([
    { id: "1", name: "Current Device", os: navigator.platform || "Unknown OS", browser: "Web Browser", lastActive: new Date(), status: "trusted" }
  ]);
  
  const [riskScore, setRiskScore] = useState(0); // 0-100, 0 is best
  const [securityScore, setSecurityScore] = useState(85); // 0-100, 100 is best
  
  const [blurActive, setBlurActive] = useState(false);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const addEvent = (type: string, status: "success" | "blocked" | "warning", method: string = "Passkey") => {
    setSecurityEvents(prev => [{
      id: Date.now().toString(),
      type,
      date: new Date(),
      device: "Current Device",
      method,
      status
    }, ...prev]);
  };

  const {
    isRevealed,
    revealTimeLeft,
    isAuthenticating,
    showConfirmReveal,
    setShowConfirmReveal,
    handleRevealConfirm,
    handleHide
  } = useCardReveal(
    isEmergencyLocked,
    riskScore,
    setRiskScore,
    addEvent
  );

  const toggleEmergencyLock = () => {
    const newLocked = !isEmergencyLocked;
    setIsEmergencyLocked(newLocked);
    if (newLocked) {
      handleHide();
      addEvent("Emergency Lock Activated", "warning", "User Action");
      setSecurityScore(Math.min(securityScore + 10, 100));
    } else {
      addEvent("Emergency Lock Deactivated", "success", "User Action");
    }
  };

  // Blur on tab inactive
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setBlurActive(true);
        handleHide(); // Auto hide on blur
      } else {
        setBlurActive(false);
      }
    };
    
    const handleWindowBlur = () => {
      setBlurActive(true);
    };
    const handleWindowFocus = () => {
      setBlurActive(false);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [handleHide]);

  // Inactivity timeout (5 mins = 300000ms)
  useEffect(() => {
    const resetInactivity = () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = setTimeout(() => {
        handleHide();
        setBlurActive(true);
      }, 300000);
    };

    window.addEventListener("mousemove", resetInactivity);
    window.addEventListener("keypress", resetInactivity);
    window.addEventListener("touchstart", resetInactivity);
    resetInactivity();

    return () => {
      window.removeEventListener("mousemove", resetInactivity);
      window.removeEventListener("keypress", resetInactivity);
      window.removeEventListener("touchstart", resetInactivity);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [handleHide]);

  // Handle Privacy Mode pressing
  const handlePressStart = () => {
    if (isPrivacyMode && isRevealed) {
      setIsPressing(true);
    }
  };
  
  const handlePressEnd = () => {
    if (isPrivacyMode) {
      setIsPressing(false);
    }
  };

  const canSeeDetails = isRevealed && (!isPrivacyMode || isPressing) && !blurActive && !isEmergencyLocked;

  const displayPan = canSeeDetails 
    ? (activeCard?.cardNumber || "4092 1234 5678 9010")
    : "•••• •••• •••• " + (activeCard?.cardNumber?.slice(-4) || "4092");

  const displayCvv = canSeeDetails ? (activeCard?.cvv || "123") : "***";

  return (
    <div className="w-full flex flex-col items-center">
      {/* Security Status Bar */}
      <div className="w-full max-w-md flex justify-between items-center mb-4 px-2">
        <button 
          onClick={() => setShowSecurityCenter(true)}
          className="flex items-center gap-2 text-xs font-medium bg-bg-secondary text-text-secondary px-3 py-1.5 rounded-full hover:bg-bg-secondary transition-colors"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          {isRtl ? "مركز الأمان" : "Security Center"}
        </button>
        
        {isEmergencyLocked ? (
          <span className="flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-500/10 px-3 py-1.5 rounded-full">
            <Lock className="w-3.5 h-3.5" />
            {isRtl ? "مغلق طوارئ" : "Emergency Locked"}
          </span>
        ) : riskScore > 50 ? (
          <span className="flex items-center gap-1.5 text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-3 py-1.5 rounded-full">
            <AlertTriangle className="w-3.5 h-3.5" />
            {isRtl ? "خطر أمني محتمل" : "Security Alert"}
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-full">
            <Fingerprint className="w-3.5 h-3.5" />
            {isRtl ? "محمي بالبصمة" : "Passkey Protected"}
          </span>
        )}
      </div>

      {/* The Premium Virtual Card */}
      <div 
        className={`group relative w-full aspect-[1.586/1] max-w-md mx-auto mb-6 perspective-1000 ${blurActive ? 'blur-md transition-all duration-300' : 'transition-all duration-300'}`}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
      >
        <div className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
          
          {/* FRONT FACE */}
          <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] overflow-hidden rounded-[20px] bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#020617] border border-white/10 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] transform transition-all group-hover:shadow-[0_25px_50px_-12px_rgba(79,70,229,0.3)] cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
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
                    {activeCard?.bankName || "FinX Premium"}
                  </span>
                </div>
              </div>

              {/* Middle Row (Chip & Number) */}
              <div className="flex flex-col gap-5 mb-2">
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
                  {"•••• •••• •••• " + (activeCard?.cardNumber?.slice(-4) || "4092")}
                </div>
              </div>
            </div>
          </div>
          
          {/* BACK FACE */}
          <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] overflow-hidden rounded-[20px] bg-gradient-to-bl from-[#0f172a] via-[#1e1b4b] to-[#020617] border border-white/10 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] flex flex-col justify-between cursor-pointer" onClick={() => setIsFlipped(false)}>
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            <div className="w-full h-12 bg-black/80 mt-6 relative z-10"></div>
            
            <div className="px-6 pb-6 flex flex-col flex-1 mt-4 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-wider font-medium text-text-secondary">{isRtl ? "رقم البطاقة" : "Card Number"}</span>
                <span className="font-mono text-sm font-bold text-white tracking-widest">{displayPan}</span>
              </div>
              
              <div className="flex justify-between items-center text-slate-300 mb-4">
                <span className="text-xs uppercase tracking-wider font-medium">{isRtl ? "اسم حامل البطاقة" : "Cardholder Name"}</span>
                <span className="font-semibold text-sm text-white truncate max-w-[150px]">{activeCard?.cardholderName || (auth.currentUser?.displayName || (isRtl ? "عضو مميز" : "PREMIUM MEMBER"))}</span>
              </div>
              
              <div className="flex items-center justify-between mt-auto pt-2">
                 <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-4 border border-white/5 transition-colors">
                    <span className="text-[10px] text-indigo-300 font-bold tracking-wider">CVV</span>
                    <span className="font-mono text-white tracking-widest font-bold">{displayCvv}</span>
                 </div>
                 <div className="flex flex-col items-end">
                    <span className="text-[10px] text-text-secondary uppercase tracking-wider mb-1">{isRtl ? "تاريخ الانتهاء" : "Expires"}</span>
                    <span className="text-sm font-mono font-bold text-indigo-200">{activeCard?.expiryDate || "12/28"}</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-3 w-full max-w-md">
        {isRevealed ? (
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-bold text-indigo-900 dark:text-indigo-300">
                  {isPrivacyMode ? (isRtl ? "اضغط مطولاً للعرض" : "Hold to view") : (isRtl ? "بطاقة مكشوفة" : "Card Revealed")}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-mono font-bold text-sm bg-white dark:bg-indigo-950 px-2 py-1 rounded-md shadow-sm">
                <Clock className="w-3.5 h-3.5" />
                {revealTimeLeft}s
              </div>
            </div>
            <button 
              onClick={handleHide}
              className="p-3 bg-bg-secondary text-text-primary rounded-xl hover:bg-bg-secondary transition-colors border border-border-primary shadow-sm"
              title={isRtl ? "إخفاء البطاقة" : "Hide Card"}
            >
              <Lock className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setShowConfirmReveal(true)}
            disabled={isEmergencyLocked}
            className={`w-full py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-sm ${
              isEmergencyLocked 
                ? "bg-border-primary text-text-secondary cursor-not-allowed" 
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20 active:scale-[0.98]"
            }`}
          >
            {isEmergencyLocked ? <Lock className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            {isRtl ? "عرض تفاصيل البطاقة" : "Reveal Card Details"}
          </button>
        )}
      </div>

      {/* Reveal Confirmation Dialog */}
      {showConfirmReveal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-primary rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-border-primary animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-100 dark:border-indigo-500/20">
              <Fingerprint className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-center text-text-primary mb-2">
              {isRtl ? "التحقق من الهوية" : "Reveal Card Details"}
            </h3>
            <p className="text-center text-text-secondary text-sm mb-6 leading-relaxed">
              {isRtl 
                ? "لأسباب أمنية، سيتم التحقق من هويتك قبل عرض تفاصيل البطاقة الكاملة." 
                : "For your security, your identity will be verified before revealing your full card information."}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirmReveal(false)}
                className="flex-1 py-3 rounded-xl font-bold text-text-primary bg-bg-secondary hover:bg-bg-secondary transition-colors"
              >
                {isRtl ? "إلغاء" : "Cancel"}
              </button>
              <button 
                onClick={handleRevealConfirm}
                disabled={isAuthenticating}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center shadow-md shadow-indigo-500/20"
              >
                {isAuthenticating ? <RefreshCw className="w-5 h-5 animate-spin" /> : (isRtl ? "متابعة" : "Continue")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Center Modal */}
      {showSecurityCenter && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-primary sm:rounded-3xl rounded-t-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-border-primary animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-500" />
                {isRtl ? "مركز الأمان" : "Security Center"}
              </h2>
              <button onClick={() => setShowSecurityCenter(false)} className="p-2 bg-bg-secondary rounded-full hover:bg-bg-secondary transition-colors">
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            {/* Security Score */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-900/20 rounded-2xl p-5 mb-6 border border-indigo-100 dark:border-indigo-800/30">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <div className="text-xs font-bold text-indigo-600/80 dark:text-indigo-400/80 uppercase tracking-wider mb-1">
                    {isRtl ? "درجة الأمان" : "Security Score"}
                  </div>
                  <div className="text-3xl font-black text-indigo-900 dark:text-indigo-100 flex items-baseline gap-1">
                    {securityScore}<span className="text-sm font-medium text-indigo-500 dark:text-indigo-400">/ 100</span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  securityScore >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                  securityScore >= 60 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                  'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                }`}>
                  {securityScore >= 80 ? (isRtl ? 'ممتاز' : 'Excellent') : 
                   securityScore >= 60 ? (isRtl ? 'جيد' : 'Good') : (isRtl ? 'ضعيف' : 'Poor')}
                </div>
              </div>
              
              <div className="w-full bg-indigo-200/50 dark:bg-indigo-900/50 rounded-full h-2 mb-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    securityScore >= 80 ? 'bg-emerald-500' : securityScore >= 60 ? 'bg-amber-500' : 'bg-red-500'
                  }`} 
                  style={{ width: `${securityScore}%` }}
                />
              </div>
              <p className="text-xs text-indigo-700 dark:text-indigo-300/80 leading-relaxed font-medium mt-3">
                {isRtl 
                  ? "حسابك محمي بتقنيات التشفير المتقدمة." 
                  : "Your account is protected by advanced encryption."}
              </p>
            </div>

            <div className="space-y-4">
              {/* Emergency Lock */}
              <div className="bg-surface-card rounded-2xl p-4 border border-border-primary flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isEmergencyLocked ? 'bg-red-100 dark:bg-red-500/20 text-danger' : 'bg-bg-secondary text-text-secondary'}`}>
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-text-primary">
                      {isRtl ? "قفل الطوارئ" : "Emergency Lock"}
                    </h4>
                    <p className="text-xs text-text-secondary">
                      {isRtl ? "إيقاف جميع عمليات العرض" : "Block all card reveals"}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={toggleEmergencyLock}
                  className={`w-12 h-6 rounded-full relative transition-colors ${isEmergencyLocked ? 'bg-red-500' : 'bg-border-primary'}`}
                >
                  <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${isEmergencyLocked ? 'translate-x-6' : ''}`} />
                </button>
              </div>

              {/* Privacy Mode */}
              <div className="bg-surface-card rounded-2xl p-4 border border-border-primary flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPrivacyMode ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'bg-bg-secondary text-text-secondary'}`}>
                    <EyeOff className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-text-primary">
                      {isRtl ? "وضع الخصوصية" : "Privacy Mode"}
                    </h4>
                    <p className="text-xs text-text-secondary">
                      {isRtl ? "اضغط مطولاً لرؤية الأرقام" : "Hold to view numbers"}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setIsPrivacyMode(!isPrivacyMode);
                    setSecurityScore(prev => Math.min(!isPrivacyMode ? prev + 5 : prev - 5, 100));
                  }}
                  className={`w-12 h-6 rounded-full relative transition-colors ${isPrivacyMode ? 'bg-indigo-500' : 'bg-border-primary'}`}
                >
                  <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${isPrivacyMode ? 'translate-x-6' : ''}`} />
                </button>
              </div>

              {/* AI Fraud Detection */}
              <div className="bg-surface-card rounded-2xl p-4 border border-border-primary">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                    <h4 className="font-bold text-sm text-text-primary">
                      {isRtl ? "محرك الذكاء الاصطناعي للاحتيال" : "AI Fraud Engine"}
                    </h4>
                  </div>
                  <div className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                    riskScore < 30 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                    riskScore < 70 ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                    'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                  }`}>
                    {riskScore < 30 ? (isRtl ? 'آمن' : 'Low Risk') : 
                     riskScore < 70 ? (isRtl ? 'متوسط' : 'Medium Risk') : (isRtl ? 'عالي' : 'High Risk')}
                  </div>
                </div>
                <div className="w-full bg-bg-secondary/50 rounded-full h-1.5 mb-2 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${
                    riskScore < 30 ? 'bg-emerald-500' : riskScore < 70 ? 'bg-amber-500' : 'bg-red-500'
                  }`} style={{ width: `${Math.max(riskScore, 5)}%` }} />
                </div>
                <p className="text-[10px] text-text-secondary">
                  {isRtl ? "يتم تحليل سلوكك باستمرار لمنع الوصول غير المصرح به." : "Your behavior is continuously analyzed to prevent unauthorized access."}
                </p>
              </div>

              {/* Reveal Analytics & Card Health */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-card rounded-2xl p-4 border border-border-primary">
                  <div className="flex items-center gap-2 mb-3">
                    <History className="w-4 h-4 text-text-secondary" />
                    <h4 className="font-bold text-xs text-text-primary">
                      {isRtl ? "تحليلات العرض" : "Reveal Analytics"}
                    </h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-text-secondary">{isRtl ? "اليوم" : "Today"}</span>
                      <span className="text-xs font-bold text-text-primary">
                        {securityEvents.filter(e => e.type === "Card Revealed" && e.date.toDateString() === new Date().toDateString()).length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-text-secondary">{isRtl ? "متوسط المدة" : "Avg Duration"}</span>
                      <span className="text-xs font-bold text-text-primary">12s</span>
                    </div>
                  </div>
                </div>
                <div className="bg-surface-card rounded-2xl p-4 border border-border-primary">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck className="w-4 h-4 text-text-secondary" />
                    <h4 className="font-bold text-xs text-text-primary">
                      {isRtl ? "صحة البطاقة" : "Card Health"}
                    </h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-text-secondary">{isRtl ? "التشفير" : "Encryption"}</span>
                      <span className="text-[10px] font-bold text-emerald-500">AES-256</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-text-secondary">{isRtl ? "جودة النسخ" : "OCR Quality"}</span>
                      <span className="text-[10px] font-bold text-emerald-500">{isRtl ? "ممتاز" : "Excellent"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reveal History */}
              <div className="bg-surface-card rounded-2xl p-4 border border-border-primary">
                <div className="flex items-center gap-2 mb-4">
                  <History className="w-5 h-5 text-text-secondary" />
                  <h4 className="font-bold text-sm text-text-primary">
                    {isRtl ? "سجل النشاط الأمني" : "Security Timeline"}
                  </h4>
                </div>
                
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                  {securityEvents.length > 0 ? securityEvents.map(event => (
                    <div key={event.id} className="flex items-start gap-3">
                      <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                        event.status === 'success' ? 'bg-emerald-500' : 
                        event.status === 'blocked' ? 'bg-red-500' : 'bg-amber-500'
                      }`} />
                      <div>
                        <p className="text-xs font-bold text-text-primary">{event.type}</p>
                        <p className="text-[10px] text-text-secondary">
                          {event.date.toLocaleTimeString()} • {event.device} • {event.method}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-xs text-text-secondary text-center py-2">
                      {isRtl ? "لا يوجد نشاط مسجل" : "No recent activity"}
                    </p>
                  )}
                </div>
              </div>

              {/* Security Recommendations */}
              <div className="bg-surface-card rounded-2xl p-4 border border-border-primary">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  <h4 className="font-bold text-sm text-text-primary">
                    {isRtl ? "توصيات أمنية" : "Security Recommendations"}
                  </h4>
                </div>
                <div className="space-y-2">
                  {!isPrivacyMode && (
                    <div className="flex items-center gap-2 text-xs text-text-secondary bg-bg-secondary p-2 rounded-lg">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                      {isRtl ? "قم بتفعيل وضع الخصوصية لزيادة الأمان في الأماكن العامة." : "Enable Privacy Mode for added security in public places."}
                    </div>
                  )}
                  {securityScore < 100 && (
                    <div className="flex items-center gap-2 text-xs text-text-secondary bg-bg-secondary p-2 rounded-lg">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      {isRtl ? "راجع الأجهزة الموثوقة للتأكد من عدم وجود أجهزة غير معروفة." : "Review trusted devices to ensure there are no unknown ones."}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-text-secondary bg-bg-secondary p-2 rounded-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    {isRtl ? "تأكد من تفعيل الإشعارات للحصول على تنبيهات الأمان الفورية." : "Ensure notifications are enabled for instant security alerts."}
                  </div>
                </div>
              </div>

              {/* Trusted Devices */}
              <div className="bg-surface-card rounded-2xl p-4 border border-border-primary">
                <div className="flex items-center gap-2 mb-4">
                  <Smartphone className="w-5 h-5 text-text-secondary" />
                  <h4 className="font-bold text-sm text-text-primary">
                    {isRtl ? "الأجهزة الموثوقة" : "Trusted Devices"}
                  </h4>
                </div>
                
                <div className="space-y-3">
                  {trustedDevices.map(device => (
                    <div key={device.id} className="flex items-center justify-between p-3 rounded-xl bg-bg-secondary border border-border-primary">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-text-secondary" />
                        <div>
                          <p className="text-xs font-bold text-text-primary">{device.name}</p>
                          <p className="text-[10px] text-text-secondary">{device.os} • {device.browser}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                        device.status === 'trusted' ? 'text-accent-green bg-emerald-50 dark:bg-emerald-500/10' :
                        device.status === 'temporary' ? 'text-accent-orange bg-amber-50 dark:bg-amber-500/10' :
                        'text-danger bg-red-50 dark:bg-red-500/10'
                      }`}>
                        {device.status === 'trusted' ? (isRtl ? "موثوق" : "Trusted") :
                         device.status === 'temporary' ? (isRtl ? "مؤقت" : "Temporary") :
                         (isRtl ? "غير معروف" : "Unknown")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Remove Card */}
              {onRemoveCard && (
                <button 
                  onClick={() => {
                    if (window.confirm(isRtl ? "هل أنت متأكد من رغبتك في إزالة هذه البطاقة؟ سيتم حذف جميع البيانات المشفرة." : "Are you sure you want to remove this card? All encrypted data will be deleted.")) {
                      setShowSecurityCenter(false);
                      onRemoveCard();
                    }
                  }}
                  className="w-full py-3.5 mt-4 rounded-xl flex items-center justify-center gap-2 font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 transition-colors text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  {isRtl ? "إزالة البطاقة بأمان" : "Securely Remove Card"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
