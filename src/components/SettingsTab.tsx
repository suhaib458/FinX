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
  Award,
  TrendingUp,
  Moon,
  Sun,
  CreditCard,
  ChevronRight,
  Star,
  NotebookText,
  Briefcase,
  Bot,
  Bell,
  Target,
  FileText
} from "lucide-react";
import { translations } from "../translations";
import { auth } from "../lib/firebase";
import { useWebAuthn, isRunningInIframe } from "../hooks/useWebAuthn";
import ProfilePhotoManager from "./ProfilePhotoManager";
import PhoneNumberManager from "./PhoneNumberManager";
import AccountLinkingManager from "./AccountLinkingManager";
import SubscriptionModal from "./SubscriptionModal";
import { UserSubscription, getUserSubscription } from "../lib/subscription";

interface SettingsTabProps {
  lang: "ar" | "en";
  setLang: (l: "ar" | "en") => void;
  onResetOnboarding: () => void;
  onLogout?: () => void;
  onNavigateRewards?: () => void;
  onNavigateSimulation?: () => void;
  onNavigateNotes?: () => void;
  onNavigateCareerProfile?: () => void;
  onNavigateInterviewSimulator?: () => void;
  onNavigateProjects?: () => void;
  onNavigateNotifications?: () => void;
  onNavigateCoach?: () => void;
}

export default function SettingsTab({
  lang,
  setLang,
  onResetOnboarding,
  onLogout,
  onNavigateRewards,
  onNavigateSimulation,
  onNavigateNotes,
  onNavigateCareerProfile,
  onNavigateInterviewSimulator,
  onNavigateProjects,
  onNavigateNotifications,
  onNavigateCoach
}: SettingsTabProps) {
  const t = translations[lang];
  const isRtl = lang === "ar";

  const { isSupported, registerPasskey } = useWebAuthn();
  const [hasPasskey, setHasPasskey] = useState(false);
  const [message, setMessage] = useState("");
  const [showSubscription, setShowSubscription] = useState(false);
  const [subscription, setSubscription] = useState<UserSubscription>({ plan: "free" });
  const [isDarkMode, setIsDarkMode] = useState(
    typeof document !== "undefined" ? document.documentElement.classList.contains("dark") : false
  );

  useEffect(() => {
    const passkeyEnabled = localStorage.getItem(`FinX_Passkey_${auth.currentUser?.uid}`);
    if (passkeyEnabled === "true") {
      setHasPasskey(true);
    }
    
    if (auth.currentUser) {
      getUserSubscription(auth.currentUser.uid).then(setSubscription);
    }
  }, []);

  const handleEnableBiometric = async () => {
    if (!auth.currentUser || !auth.currentUser.email) return;
    setMessage("");

    if (isRunningInIframe()) {
      return;
    }

    const result = await registerPasskey(
      auth.currentUser.uid,
      auth.currentUser.email,
    );
    if (result.success) {
      localStorage.setItem(`FinX_Passkey_${auth.currentUser.uid}`, "true");
      setHasPasskey(true);
      setMessage(isRtl ? "تم تفعيل الدخول بالبصمة بنجاح!" : "Biometric login successfully activated!");
    } else {
      setMessage(isRtl ? `فشل التفعيل: ${result.message}` : `Activation failed: ${result.message}`);
    }
  };

  const handleDisableBiometric = () => {
    if (!auth.currentUser) return;
    localStorage.removeItem(`FinX_Passkey_${auth.currentUser.uid}`);
    setHasPasskey(false);
    setMessage(isRtl ? "تم تعطيل البصمة." : "Passkey disabled.");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleToggleTheme = () => {
    const isDark = document.documentElement.classList.contains("dark");
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
    }
  };
  
  const NavItem = ({ icon: Icon, title, description, onClick }: { icon: any, title: string, description: string, onClick?: () => void }) => (
    <div
      className="rounded-2xl p-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors shadow-sm"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="pt-0.5">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{title}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[200px] leading-relaxed">
              {description}
            </p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 font-bold shrink-0 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
          <ChevronRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className={`flex-1 overflow-y-auto px-4 py-6 space-y-8 bg-slate-50 dark:bg-[#020617] ${isRtl ? "text-right" : "text-left"}`}>
      
      {/* Title Header */}
      <div>
        <p className="text-[10px] tracking-wider text-slate-500 dark:text-slate-400 uppercase font-mono">
          {isRtl ? "مركز التحكم الشامل" : "UNIFIED CONTROL CENTER"}
        </p>
        <h2 className={`text-2xl font-bold text-slate-900 dark:text-white mt-1 ${isRtl ? "font-arabic" : "font-sans"}`}>
          {isRtl ? "الإعدادات والأدوات" : "Settings & Tools"}
        </h2>
      </div>

      {/* Subscription Plan Management */}
      <div 
        className="rounded-3xl p-6 bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-900 dark:to-blue-900 text-white cursor-pointer hover:opacity-95 transition-opacity relative overflow-hidden group shadow-lg shadow-indigo-600/20"
        onClick={() => setShowSubscription(true)}
      >
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
        <div className="flex items-center justify-between relative z-10">
          <div>
            <h4 className="text-base font-bold flex items-center gap-2 mb-2">
              <CreditCard className="w-5 h-5" />
              {isRtl ? "باقة الاشتراك والمزايا" : "Subscription Plan & Perks"}
            </h4>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-bold bg-white/20 text-white`}>
                {subscription.plan === 'elite' && <Star className="w-3.5 h-3.5 fill-current" />}
                {subscription.plan.toUpperCase()}
              </span>
              <span className="text-xs text-indigo-100 font-medium hidden sm:block">
                {isRtl ? "انقر للترقية وإدارة الباقة" : "Tap to manage or upgrade"}
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform border border-white/20">
            <ChevronRight className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </div>

      {/* 1. Identity & Profile */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2">
          {isRtl ? "الهوية والملف الشخصي" : "Identity & Profile"}
        </h3>
        <ProfilePhotoManager lang={lang} />
        <PhoneNumberManager lang={lang} />
      </section>

      {/* 2. Advanced Tools (FinX Universe) */}
      <section className="space-y-4">
         <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2 flex items-center gap-2">
          <Cpu className="w-4 h-4" />
          {isRtl ? "أدوات FinX الذكية" : "FinX Smart Tools"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NavItem 
            icon={Bot} 
            title={isRtl ? "المستشار المالي & تحليل الكشوفات" : "Smart Advisor & Statement Analytics"} 
            description={isRtl ? "تحليل الكشوفات والتخطيط المالي" : "Analyze statements & get financial planning"}
            onClick={onNavigateCoach}
          />
          <NavItem 
            icon={Briefcase} 
            title={isRtl ? "الملف المهني & تحليل السيرة" : "Career Profile & CV Analysis"} 
            description={isRtl ? "إدارة المهارات والتقديم للوظائف" : "Manage skills and apply for jobs"}
            onClick={onNavigateCareerProfile}
          />
          <NavItem 
            icon={Users} 
            title={isRtl ? "محاكي المقابلات بالذكاء الاصطناعي" : "AI Interview Simulator"} 
            description={isRtl ? "استعد لمقابلات العمل بتقييم فوري" : "Prep for job interviews with instant feedback"}
            onClick={onNavigateInterviewSimulator}
          />
          <NavItem 
            icon={Target} 
            title={isRtl ? "المشاريع والاستثمارات" : "Projects & Investments"} 
            description={isRtl ? "فرص التمويل وإدارة المشاريع الناشئة" : "Funding opportunities & startup management"}
            onClick={onNavigateProjects}
          />
        </div>
      </section>
      
      {/* 3. Communication & Extras */}
      <section className="space-y-4">
         <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2">
          {isRtl ? "التواصل والإضافات" : "Communication & Extras"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NavItem 
            icon={Bell} 
            title={isRtl ? "مركز الإشعارات" : "Notification Center"} 
            description={isRtl ? "تنبيهات الفرص، المالية والوظائف" : "Alerts for opportunities, finances & jobs"}
            onClick={onNavigateNotifications}
          />
          <NavItem 
            icon={Award} 
            title={isRtl ? "مركز المكافآت" : "Rewards Center"} 
            description={isRtl ? "استعرض إنجازاتك ونقاطك" : "View achievements and points"}
            onClick={onNavigateRewards}
          />
          <NavItem 
            icon={NotebookText} 
            title={t.notes || "Notes"} 
            description={isRtl ? "مذكراتك المالية مع المساعد الذكي" : "Your financial notes with the coach"}
            onClick={onNavigateNotes}
          />
        </div>
      </section>

      {/* 4. Appearance & Language */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2">
          {isRtl ? "المظهر واللغة" : "Appearance & Language"}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Theme Toggle */}
          <div className="rounded-2xl p-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              {isDarkMode ? <Moon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
              {isRtl ? "مظهر التطبيق" : "App Theme"}
            </h4>
            <div className="flex bg-slate-100 dark:bg-slate-800 dark:bg-slate-800/50 rounded-xl p-1 relative">
              <div 
                className={`absolute inset-y-1 ${isRtl ? 'right-1' : 'left-1'} w-[calc(50%-0.25rem)] bg-white dark:bg-slate-700 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600/50 transition-all duration-300 ease-out`}
                style={{ transform: isDarkMode ? `translateX(${isRtl ? '-' : ''}100%)` : `translateX(0)` }}
              />
              <button
                onClick={() => isDarkMode && handleToggleTheme()}
                className={`flex-1 py-3 text-xs font-bold z-10 transition-colors flex items-center justify-center gap-2 ${!isDarkMode ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                <Sun className="w-4 h-4" />
                {isRtl ? "الوضع الفاتح" : "Light Mode"}
              </button>
              <button
                onClick={() => !isDarkMode && handleToggleTheme()}
                className={`flex-1 py-3 text-xs font-bold z-10 transition-colors flex items-center justify-center gap-2 ${isDarkMode ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                <Moon className="w-4 h-4" />
                {isRtl ? "الوضع الداكن" : "Dark Mode"}
              </button>
            </div>
          </div>

          {/* Language Selection */}
          <div className="rounded-2xl p-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Languages className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              {t.language}
            </h4>
            <div className="flex gap-3">
              <button
                onClick={() => setLang("ar")}
                className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-colors shadow-sm ${
                  lang === "ar"
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                العربية
              </button>
              <button
                onClick={() => setLang("en")}
                className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-colors shadow-sm ${
                  lang === "en"
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                English
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Integrations & Accounts */}
      <section className="space-y-4">
         <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2">
          {isRtl ? "الربط والحسابات" : "Integrations & Accounts"}
        </h3>
        <AccountLinkingManager lang={lang} />
      </section>

      {/* 6. Security (Biometrics) */}
      {!isRunningInIframe() && isSupported && (
        <section className="space-y-4">
           <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2">
            {isRtl ? "الأمان" : "Security"}
          </h3>
          <div className="rounded-2xl p-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                <Fingerprint className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {t.biometricLogin}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {t.biometricDesc}
                </p>
                {message && (
                  <div
                    className={`mt-2 text-xs font-medium ${
                      message.includes("بنجاح") || message.includes("تم") || message.includes("success") || message.includes("Passkey disabled")
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-500 dark:text-red-400"
                    }`}
                  >
                    {message}
                  </div>
                )}
                {hasPasskey ? (
                  <button
                    onClick={handleDisableBiometric}
                    className="mt-4 w-full py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 text-xs font-bold rounded-xl transition-colors border border-red-100 dark:border-red-500/20 flex justify-center items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    {isRtl ? "إلغاء تفعيل البصمة" : "Disable Biometric Login"}
                  </button>
                ) : (
                  <button
                    onClick={handleEnableBiometric}
                    className="mt-4 w-full py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors border border-slate-200 dark:border-slate-700 flex justify-center items-center gap-2"
                  >
                    <Fingerprint className="w-4 h-4" />
                    {t.enableBiometric}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 7. Danger Zone */}
      <section className="space-y-4 pt-6">
        <h3 className="text-xs font-bold text-red-500 dark:text-red-400 uppercase tracking-wider px-2">
          {isRtl ? "منطقة الخطر" : "Danger Zone"}
        </h3>
        
        <div className="rounded-2xl p-4 bg-red-50/50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10 space-y-3">
          <button
            onClick={onResetOnboarding}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="text-right">
                <span className="block text-sm font-bold">{t.resetTitle}</span>
                <span className="block text-xs opacity-80 mt-0.5">{t.resetDesc}</span>
              </div>
            </div>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors mt-3 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  <LogOut className={`w-5 h-5 text-slate-600 dark:text-slate-400 ${isRtl ? 'rotate-180' : ''}`} />
                </div>
                <div className="text-right">
                  <span className="block text-sm font-bold">{t.logout}</span>
                </div>
              </div>
            </button>
          )}
        </div>
      </section>

      {/* Subscription Modal wrapper */}
      {showSubscription && (
        <SubscriptionModal
          lang={lang}
          onClose={() => setShowSubscription(false)}
        />
      )}
    </div>
  );
}
