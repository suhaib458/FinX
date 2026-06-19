import React, { useState, useEffect, useRef } from "react";
import { 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  Smartphone, 
  AlertCircle, 
  MessageSquare,
  Lock,
  ChevronDown
} from "lucide-react";
import { auth, db } from "../lib/firebase";
import { RecaptchaVerifier, linkWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

interface PhoneNumberManagerProps {
  lang: "ar" | "en";
}

interface SmsPreferences {
  phoneNumber: string;
  verified: boolean;
  verifiedAt?: string;
  smsIntelligenceEnabled: boolean;
  salaryDetectionEnabled: boolean;
  depositDetectionEnabled: boolean;
  purchaseDetectionEnabled: boolean;
  expenseCategorizationEnabled: boolean;
}

const COUNTRIES = [
  { code: "+962", nameEn: "Jordan", nameAr: "الأردن", length: 9 },
  { code: "+966", nameEn: "Saudi Arabia", nameAr: "السعودية", length: 9 },
  { code: "+971", nameEn: "UAE", nameAr: "الإمارات", length: 9 },
  { code: "+1", nameEn: "US/Canada", nameAr: "أمريكا/كندا", length: 10 },
  { code: "+44", nameEn: "UK", nameAr: "بريطانيا", length: 10 },
];

export default function PhoneNumberManager({ lang }: PhoneNumberManagerProps) {
  const isRtl = lang === "ar";
  const [prefs, setPrefs] = useState<SmsPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  // Phone Input State
  const [countryCode, setCountryCode] = useState("+962");
  const [phoneNumberStr, setPhoneNumberStr] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Verification State
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;
    const fetchPrefs = async () => {
      try {
        const docRef = doc(db, `users/${auth.currentUser!.uid}/settings/smsPreferences`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPrefs(docSnap.data() as SmsPreferences);
        } else {
          setPrefs({
            phoneNumber: "",
            verified: false,
            smsIntelligenceEnabled: false,
            salaryDetectionEnabled: false,
            depositDetectionEnabled: false,
            purchaseDetectionEnabled: false,
            expenseCategorizationEnabled: false
          });
        }
      } catch (err) {
        console.error("Failed to load SMS preferences", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrefs();
  }, []);

  useEffect(() => {
    // Cleanup recaptcha on unmount
    return () => {
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear();
        (window as any).recaptchaVerifier = null;
      }
    };
  }, []);

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
    }
  };

  const handleSendCode = async () => {
    setError(null);
    if (!phoneNumberStr || phoneNumberStr.length < 7) {
      setError(isRtl ? "رقم الهاتف غير صالح" : "Invalid phone number");
      return;
    }

    const fullNumber = `${countryCode}${phoneNumberStr.startsWith('0') ? phoneNumberStr.substring(1) : phoneNumberStr}`;
    
    setIsVerifying(true);
    try {
      setupRecaptcha();
      const appVerifier = (window as any).recaptchaVerifier;
      if (!auth.currentUser) throw new Error("No user");
      
      const confResult = await linkWithPhoneNumber(auth.currentUser, fullNumber, appVerifier);
      setConfirmationResult(confResult);
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/credential-already-in-use") {
         setError(isRtl ? "رقم الهاتف مرتبط بحساب آخر." : "Phone number is already linked to another account.");
      } else {
         setError(err.message || (isRtl ? "فشل إرسال الرمز" : "Failed to send code"));
      }
      setIsVerifying(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!confirmationResult || !verificationCode) return;
    setError(null);
    setIsVerifying(true);

    try {
      await confirmationResult.confirm(verificationCode);
      
      const fullNumber = `${countryCode}${phoneNumberStr.startsWith('0') ? phoneNumberStr.substring(1) : phoneNumberStr}`;
      const newPrefs: SmsPreferences = {
        ...(prefs as SmsPreferences),
        phoneNumber: fullNumber,
        verified: true,
        verifiedAt: new Date().toISOString()
      };
      
      const docRef = doc(db, `users/${auth.currentUser!.uid}/settings/smsPreferences`);
      await setDoc(docRef, newPrefs);
      setPrefs(newPrefs);
      setConfirmationResult(null);
    } catch (err: any) {
      console.error(err);
      setError(isRtl ? "رمز التحقق غير صحيح" : "Invalid verification code");
    } finally {
      setIsVerifying(false);
    }
  };

  const togglePref = async (key: keyof SmsPreferences) => {
    if (!prefs || !prefs.verified) return;
    const newValue = !prefs[key];
    const newPrefs = { ...prefs, [key]: newValue };
    setPrefs(newPrefs);

    try {
      const docRef = doc(db, `users/${auth.currentUser!.uid}/settings/smsPreferences`);
      await updateDoc(docRef, { [key]: newValue });
    } catch (err) {
      console.error("Failed to update prefs", err);
      // Revert on fail
      setPrefs(prefs);
    }
  };

  if (loading) return null;

  return (
    <div className="space-y-6">
      {/* Container header for Phone & SMS Section */}
      <div className="flex items-center gap-3 pb-2 border-b border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
          <Smartphone className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-200">
            {isRtl ? "رقم الهاتف وذكاء الرسائل (SMS)" : "Phone Number & SMS Intelligence"}
          </h3>
          <p className="text-xs text-slate-500">
            {isRtl ? "قم بربط رقم هاتفك لتحليل معاملاتك المالية بأمان." : "Verify your phone to safely analyze financial transactions."}
          </p>
        </div>
      </div>

      <div id="recaptcha-container"></div>

      {/* 1. Phone Verification Status / Input Card */}
      <div className="rounded-2xl p-5 bg-[#0f172a] border border-slate-800 space-y-4">
        <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Phone className="w-4 h-4 text-slate-400" />
          {isRtl ? "رقم الهاتف المسجل" : "Registered Phone Number"}
        </h4>

        {prefs?.verified ? (
          <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <div>
              <p className="font-mono text-lg font-bold text-emerald-400 tracking-wider">
                {prefs.phoneNumber}
              </p>
              <p className="text-[11px] text-emerald-500/70 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isRtl ? "مُوثق منذ" : "Verified since"} {new Date(prefs.verifiedAt || "").toLocaleDateString(isRtl ? 'ar-SA' : 'en-US')}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {!confirmationResult ? (
              <>
                <div className="flex gap-2">
                  <div className="relative">
                    <select 
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="h-12 w-[100px] bg-slate-900 border border-slate-700 rounded-xl px-3 text-slate-200 text-sm font-mono appearance-none focus:outline-none focus:border-indigo-500"
                    >
                      {COUNTRIES.map(c => (
                        <option key={c.code} value={c.code}>{c.code} ({isRtl ? c.nameAr : c.nameEn})</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-4 pointer-events-none" />
                  </div>
                  <input
                    type="tel"
                    value={phoneNumberStr}
                    onChange={(e) => setPhoneNumberStr(e.target.value.replace(/\D/g, ''))}
                    placeholder={isRtl ? "رقم الهاتف المتبقي..." : "Phone number..."}
                    className="flex-1 h-12 bg-slate-900 border border-slate-700 rounded-xl px-4 text-slate-200 font-mono tracking-wider focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                {error && <p className="text-[11px] text-rose-400 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {error}</p>}
                
                <button
                  onClick={handleSendCode}
                  disabled={isVerifying || !phoneNumberStr}
                  className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                  {isVerifying ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    isRtl ? "إرسال رمز التحقق" : "Send Verification Code"
                  )}
                </button>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-slate-300">
                  {isRtl ? `تم إرسال رمز لـ ${countryCode}${phoneNumberStr}` : `Code sent to ${countryCode}${phoneNumberStr}`}
                </p>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full h-14 bg-slate-900 border border-slate-700 rounded-xl px-4 text-center text-2xl tracking-[0.5em] font-mono text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                {error && <p className="text-[11px] text-rose-400 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {error}</p>}
                <button
                  onClick={handleVerifyCode}
                  disabled={isVerifying || verificationCode.length < 6}
                  className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  {isVerifying ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    isRtl ? "تأكيد الرمز" : "Verify Code"
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. SMS Intelligence Settings Card */}
      <div className={`rounded-2xl p-5 bg-[#0f172a] border ${prefs?.verified ? 'border-indigo-500/30' : 'border-slate-800 opacity-60 pointer-events-none'} transition-all`}>
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${prefs?.verified ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-slate-800 border-slate-700'}`}>
            <MessageSquare className={`w-5 h-5 ${prefs?.verified ? 'text-indigo-400' : 'text-slate-500'}`} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-200">
              {isRtl ? "إعدادات تحليل رسائل البنك" : "SMS Analysis Settings"}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {isRtl ? "يتطلب إرادة وصلاحية للتحليل التلقائي" : "Requires explicit consent for automated analysis"}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <ToggleRow 
            label={isRtl ? "تفعيل تحليل SMS الأساسي" : "Enable SMS Intelligence"}
            desc={isRtl ? "متطلب أساسي لباقي الميزات" : "Core requirement for all SMS features"}
            isActive={prefs?.smsIntelligenceEnabled || false}
            onToggle={() => togglePref('smsIntelligenceEnabled')}
            isMaster={true}
          />
          
          <div className="pl-4 ml-2 border-l-2 border-slate-800/80 space-y-4 py-2 opacity-100 transition-opacity">
            <ToggleRow 
              label={isRtl ? "اكتشاف الراتب" : "Salary Detection"}
              desc={isRtl ? "لحديث خطة الدخل تلقائياً" : "Automatically updates income plans"}
              isActive={prefs?.salaryDetectionEnabled || false}
              isDisabled={!prefs?.smsIntelligenceEnabled}
              onToggle={() => togglePref('salaryDetectionEnabled')}
            />
            <ToggleRow 
              label={isRtl ? "اكتشاف الإيداعات" : "Deposit Detection"}
              desc={isRtl ? "تتبع التحويلات الواردة" : "Track incoming transfers"}
              isActive={prefs?.depositDetectionEnabled || false}
              isDisabled={!prefs?.smsIntelligenceEnabled}
              onToggle={() => togglePref('depositDetectionEnabled')}
            />
            <ToggleRow 
              label={isRtl ? "اكتشاف المشتريات" : "Purchase Detection"}
              desc={isRtl ? "تسجيل الحركات اليومية" : "Log daily transactions"}
              isActive={prefs?.purchaseDetectionEnabled || false}
              isDisabled={!prefs?.smsIntelligenceEnabled}
              onToggle={() => togglePref('purchaseDetectionEnabled')}
            />
            <ToggleRow 
              label={isRtl ? "تصنيف النفقات تلقائياً" : "Expense Categorization"}
              desc={isRtl ? "استخدام AI لتصنيف المشتريات" : "Use AI to categorize purchases"}
              isActive={prefs?.expenseCategorizationEnabled || false}
              isDisabled={!prefs?.smsIntelligenceEnabled}
              onToggle={() => togglePref('expenseCategorizationEnabled')}
            />
          </div>
        </div>
      </div>

      {/* 3. Privacy & Permissions */}
      <div className="rounded-2xl p-5 bg-slate-900 border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          {isRtl ? "بياناتك بأمان تام" : "Your data is strictly private"}
        </h4>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          {isRtl 
            ? "نحن لا نقرأ رسائلك الخاصة. نظام FinX مدرب حصرياً للبحث عن رسائل البنوك التي تحتوي على كلمات مفتاحية مالية (مثل: خصم، إيداع). لا يتم إرسال أي رسائل غير متعلقة للمخدمات أبداً. يمكنك إلغاء جميع الصلاحيات في أي وقت." 
            : "We do not read your private messages. The FinX engine is trained exclusively to scan for bank messages containing financial keywords (e.g., deducted, deposited). Non-financial messages never leave your device. You can revoke all permissions at any time."}
        </p>
      </div>

    </div>
  );
}

function ToggleRow({ label, desc, isActive, onToggle, isDisabled = false, isMaster = false }: {
  label: string, desc: string, isActive: boolean, onToggle: () => void, isDisabled?: boolean, isMaster?: boolean
}) {
  return (
    <div className={`flex items-center justify-between gap-4 ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div>
        <p className={`text-sm font-semibold ${isMaster ? 'text-indigo-300' : 'text-slate-300'}`}>{label}</p>
        <p className="text-[11px] text-slate-500 mt-0.5">{desc}</p>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          isActive ? (isMaster ? 'bg-indigo-500' : 'bg-emerald-500') : 'bg-slate-700'
        }`}
      >
        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
          isActive ? 'translate-x-6' : 'translate-x-0'
        }`} />
      </button>
    </div>
  );
}
