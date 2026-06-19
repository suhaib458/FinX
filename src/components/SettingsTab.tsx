import React, { useState, useEffect } from "react";
import { 
  Globe, 
  Settings, 
  ShieldCheck, 
  Users, 
  Cpu, 
  RotateCcw,
  Check,
  Languages,
  LogOut,
  Fingerprint,
  Award
} from "lucide-react";
import { translations } from "../translations";
import { auth } from "../lib/firebase";
import { useWebAuthn } from "../hooks/useWebAuthn";
import ProfilePhotoManager from "./ProfilePhotoManager";
import PhoneNumberManager from "./PhoneNumberManager";

interface SettingsTabProps {
  lang: "ar" | "en";
  setLang: (l: "ar" | "en") => void;
  activeProfileName: "balanced" | "debt";
  onLoadProfile: (profileType: "balanced" | "debt") => void;
  onResetOnboarding: () => void;
  onLogout?: () => void;
  onNavigateRewards?: () => void;
}

export default function SettingsTab({ 
  lang, 
  setLang, 
  activeProfileName, 
  onLoadProfile, 
  onResetOnboarding,
  onLogout,
  onNavigateRewards
}: SettingsTabProps) {
  const t = translations[lang];
  const isRtl = lang === "ar";
  
  const { isSupported, registerPasskey } = useWebAuthn();
  const [hasPasskey, setHasPasskey] = useState(false);
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    // Check if the user has a Passkey locally enabled
    const passkeyEnabled = localStorage.getItem(`FinX_Passkey_${auth.currentUser?.uid}`);
    if (passkeyEnabled === 'true') {
      setHasPasskey(true);
    }
  }, []);

  const handleEnableBiometric = async () => {
    if (!auth.currentUser || !auth.currentUser.email) return;
    setMessage(isRtl ? 'جاري تفعيل البصمة...' : 'Enabling Passkey...');
    
    // WebAuthn Passkeys require active user gesture verification.
    const success = await registerPasskey(auth.currentUser.uid, auth.currentUser.email);
    if (success) {
      localStorage.setItem(`FinX_Passkey_${auth.currentUser.uid}`, 'true');
      setHasPasskey(true);
      setMessage(isRtl ? 'تم تفعيل البصمة بنجاح!' : 'Passkey enabled successfully!');
    } else {
      setMessage(isRtl ? 'فشل التفعيل أو تم الإلغاء.' : 'Action failed or cancelled.');
    }
    setTimeout(() => setMessage(''), 3000);
  };
  
  const handleDisableBiometric = () => {
    if (!auth.currentUser) return;
    localStorage.removeItem(`FinX_Passkey_${auth.currentUser.uid}`);
    setHasPasskey(false);
    setMessage(isRtl ? 'تم تعطيل البصمة.' : 'Passkey disabled.');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div 
      className={`flex-1 overflow-y-auto px-4 py-5 space-y-5 ${isRtl ? 'text-right' : 'text-left'}`}
    >
      {/* Title Header */}
      <div>
        <p className="text-[10px] tracking-wider text-slate-400 uppercase font-mono">
          {isRtl ? "تخصيص الخيارات الفنية" : "SYSTEM CONTROL CARD"}
        </p>
        <h2 className={`text-xl font-bold text-zinc-100 ${isRtl ? 'font-arabic' : 'font-sans'}`}>
          {t.settingsTitle}
        </h2>
      </div>

      {/* Profile Photo Manager */}
      <ProfilePhotoManager lang={lang} />

      {/* Rewards Center Link */}
      <div className="rounded-2xl p-4 bg-slate-900/50 border border-slate-800 space-y-3 cursor-pointer hover:bg-slate-800 transition-colors" onClick={onNavigateRewards}>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-400" />
              {isRtl ? "مركز المكافآت" : "Rewards Center"}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isRtl ? "استعرض إنجازاتك، نقاطك، واكتشف الهدايا" : "View achievements, points, and discover rewards"}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20">
            &rarr;
          </div>
        </div>
      </div>

      {/* Language Switch Capsule Selector */}
      <div className="rounded-2xl p-4 bg-slate-900/50 border border-slate-800 space-y-3">
        <label className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
          <Languages className="w-4 h-4 text-indigo-400" />
          {t.languageSelect}
        </label>
        
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-900 select-none">
          <button
            onClick={() => setLang("ar")}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${lang === "ar" ? "bg-gradient-to-r from-indigo-600 to-blue-700 text-white font-arabic shadow-md shadow-indigo-500/10" : "text-slate-400 hover:text-slate-300"}`}
          >
            {lang === "ar" && <Check className="w-3.5 h-3.5" />}
            {t.arabic}
          </button>
          <button
            onClick={() => setLang("en")}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${lang === "en" ? "bg-gradient-to-r from-indigo-600 to-blue-700 text-white shadow-md shadow-indigo-500/10" : "text-slate-400 hover:text-slate-300"}`}
          >
            {lang === "en" && <Check className="w-3.5 h-3.5" />}
            {t.english}
          </button>
        </div>
      </div>

      {/* 2. Demonstration Dashboard Presets (DEMO Profile Loader) */}
      <div className="rounded-2xl p-4.5 bg-slate-900/50 border border-slate-800 space-y-3">
        <div className="space-y-1">
          <label className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wide flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-indigo-400" />
            {t.demoBannerTitle}
          </label>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {t.demoBannerDesc}
          </p>
        </div>

        <div className="space-y-2 pt-1 border-t border-slate-800/60">
          <button
            onClick={() => onLoadProfile("balanced")}
            className={`w-full p-3 rounded-xl border text-start flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
              activeProfileName === "balanced" 
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-sm" 
                : "bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-800"
            }`}
          >
            <span className={isRtl ? "font-arabic" : ""}>{t.switchPerfectProfile}</span>
            {activeProfileName === "balanced" && (
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300">
                {isRtl ? "نشط" : "Active"}
              </span>
            )}
          </button>

          <button
            onClick={() => onLoadProfile("debt")}
            className={`w-full p-3 rounded-xl border text-start flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
              activeProfileName === "debt" 
                ? "bg-rose-500/10 border-rose-500/30 text-rose-300 shadow-sm" 
                : "bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-800"
            }`}
          >
            <span className={isRtl ? "font-arabic" : ""}>{t.switchHighDebtProfile}</span>
            {activeProfileName === "debt" && (
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-rose-400/20 text-rose-300">
                {isRtl ? "نشط" : "Active"}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 3. Replay Tutorial Onboarding */}
      <div className="rounded-2xl p-4 bg-slate-900/40 border border-slate-800 flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-slate-200">
            {isRtl ? "إعادة جولة ترحيب فنيكس" : "Replay Hello Tutorial"}
          </h4>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            {isRtl ? "تشغيل خطوات الدليل لمشاهدة الانيميشن" : "Re-trigger the flow for the presentation."}
          </p>
        </div>
        <button
          onClick={onResetOnboarding}
          className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 active:scale-95 text-indigo-400 hover:text-indigo-300 rounded-xl transition-all cursor-pointer"
        >
          <RotateCcw className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Biometric Security */}
      {isSupported && (
        <div className="rounded-2xl p-4.5 bg-slate-900/50 border border-slate-800 space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wide flex items-center gap-1.5">
              <Fingerprint className="w-4 h-4 text-indigo-400" />
              {isRtl ? "الأمان وبصمة الدخول" : "Biometric Security"}
            </label>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {isRtl ? "سجل دخولك باستخدام بصمة الوجه أو الأصبع بدلاً من كلمة المرور عبر ميزة Passkeys المدعومة بنظام جهازك." : "Sign in securely using Face ID, Touch ID, or Windows Hello via Passkeys without entering your password."}
            </p>
            {message && <p className="text-[10px] text-emerald-400 mt-2">{message}</p>}
          </div>

          <div className="pt-2">
            {!hasPasskey ? (
               <button
                 onClick={handleEnableBiometric}
                 className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer text-xs font-bold shadow-md shadow-indigo-500/20"
               >
                 <ShieldCheck className="w-4 h-4" />
                 {isRtl ? "تفعيل الدخول عبر البصمة" : "Enable Passkey Login"}
               </button>
            ) : (
               <button
                 onClick={handleDisableBiometric}
                 className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer text-xs font-bold"
               >
                 <RotateCcw className="w-4 h-4" />
                 {isRtl ? "إيقاف البصمة وحذف السجل" : "Disable Biometric Login"}
               </button>
            )}
          </div>
        </div>
      )}

      {/* Phone Number & SMS Intelligence */}
      <PhoneNumberManager lang={lang} />

      {/* 4. Privacy, Credentials & Enterprise Encryption Statement */}
      <div className="rounded-2xl p-4.5 bg-gradient-to-r from-blue-950/20 to-slate-900 border border-slate-850 space-y-3">
        <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <ShieldCheck className="w-4.5 h-4.5 text-blue-400" />
          {t.secureCryptography}
        </h4>
        <p className="text-[11px] leading-relaxed text-slate-400">
          {t.cryptDesc}
        </p>
      </div>

      {onLogout && (
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 transition-colors cursor-pointer text-xs font-bold"
        >
          <LogOut className="w-4 h-4" />
          {isRtl ? "تسجيل الخروج" : "Sign Out"}
        </button>
      )}

      {/* Debug details */}
      <div className="text-center text-[10px] text-zinc-600 font-mono pt-4 select-none">
        {t.appSubtitle} {t.appVersion} • Codebase Verified
      </div>
    </div>
  );
}
