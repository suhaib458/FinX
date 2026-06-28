import React, { useState, useEffect, useRef } from "react";
import { 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  Smartphone, 
  AlertCircle, 
  MessageSquare,
  Lock,
  ChevronDown,
  Edit2,
  Trash2,
  X
} from "lucide-react";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { createNotification } from "../lib/notifications";

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

  // Phone Input State (for inline verification flow)
  const [countryCode, setCountryCode] = useState("+962");
  const [phoneNumberStr, setPhoneNumberStr] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [newCountryCode, setNewCountryCode] = useState("+962");
  const [newPhoneNumberStr, setNewPhoneNumberStr] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  // Verification State
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [mockCodeSent, setMockCodeSent] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;
    const fetchPrefs = async () => {
      try {
        const docRef = doc(db, `users/${auth.currentUser!.uid}/settings/smsPreferences`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as SmsPreferences;
          setPrefs(data);
          if (data.phoneNumber && !data.verified) {
             // Pre-fill inline verification inputs if unverified
             // Note: assuming basic splitting is not strictly needed if we just show it, 
             // but we can set phoneNumberStr to the full number for the verify flow if we want.
             // For simplicity, we just use the raw value.
          }
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

  const openPhoneModal = () => {
    setNewCountryCode("+962");
    setNewPhoneNumberStr("");
    setEditError(null);
    setIsPhoneModalOpen(true);
  };

  const handleSavePhone = async () => {
    setEditError(null);
    if (!newPhoneNumberStr || newPhoneNumberStr.length < 7) {
      setEditError(isRtl ? "رقم الهاتف غير صالح" : "Invalid phone number");
      return;
    }
    const fullNumber = `${newCountryCode}${newPhoneNumberStr.startsWith('0') ? newPhoneNumberStr.substring(1) : newPhoneNumberStr}`;
    
    const newPrefs: SmsPreferences = {
      ...(prefs as SmsPreferences),
      phoneNumber: fullNumber,
      verified: false // Requires re-verification
    };

    try {
      const docRef = doc(db, `users/${auth.currentUser!.uid}/settings/smsPreferences`);
      await setDoc(docRef, newPrefs, { merge: true });
      setPrefs(newPrefs);
      setIsPhoneModalOpen(false);
      // Reset inline verify state
      setCountryCode(newCountryCode);
      setPhoneNumberStr(newPhoneNumberStr);
      setMockCodeSent(false);
      setVerificationCode("");
    } catch (e) {
      console.error(e);
      setEditError(isRtl ? "فشل الحفظ" : "Failed to save");
    }
  };

  const handleRemovePhone = async () => {
    const newPrefs: SmsPreferences = {
      ...(prefs as SmsPreferences),
      phoneNumber: "",
      verified: false
    };
    try {
      const docRef = doc(db, `users/${auth.currentUser!.uid}/settings/smsPreferences`);
      await setDoc(docRef, newPrefs, { merge: true });
      setPrefs(newPrefs);
      setShowRemoveConfirm(false);

      await createNotification(auth.currentUser!.uid, {
        title: isRtl ? "تم إزالة رقم الهاتف" : "Phone Number Removed",
        message: isRtl ? "تم إزالة رقم الهاتف الخاص بك ولن نتمكن من تحليل رسائلك." : "Your phone number has been removed. We will no longer analyze your messages.",
        category: "account",
        type: "system"
      });

    } catch (e) {
      console.error(e);
    }
  };

  const handleSendCode = async () => {
    setError(null);
    // If the user already has an unverified number saved, use that. 
    // Otherwise use the inline inputs.
    const numberToVerify = prefs?.phoneNumber ? prefs.phoneNumber : `${countryCode}${phoneNumberStr}`;
    
    if (!numberToVerify || numberToVerify.length < 7) {
      setError(isRtl ? "رقم الهاتف غير صالح" : "Invalid phone number");
      return;
    }

    setIsVerifying(true);
    try {
      // MOCK OTP FLOW: Simulate network delay instead of actual Firebase SMS setup
      // to allow testing in the preview environment without real SMS quotas.
      setTimeout(() => {
        setMockCodeSent(true);
        setIsVerifying(false);
        // Pre-fill dummy code for easier testing
        setVerificationCode("123456");
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setError(isRtl ? "فشل إرسال الرمز" : "Failed to send code");
      setIsVerifying(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!mockCodeSent || !verificationCode) return;
    setError(null);
    setIsVerifying(true);

    try {
      // MOCK OTP FLOW: Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      if (verificationCode !== "123456") {
        throw new Error("Invalid mock code. Use 123456.");
      }
      
      const fullNumber = prefs?.phoneNumber ? prefs.phoneNumber : `${countryCode}${phoneNumberStr.startsWith('0') ? phoneNumberStr.substring(1) : phoneNumberStr}`;
      const newPrefs: SmsPreferences = {
        ...(prefs as SmsPreferences),
        phoneNumber: fullNumber,
        verified: true,
        verifiedAt: new Date().toISOString()
      };
      
      const docRef = doc(db, `users/${auth.currentUser!.uid}/settings/smsPreferences`);
      await setDoc(docRef, newPrefs);
      setPrefs(newPrefs);
      setMockCodeSent(false);

      await createNotification(auth.currentUser!.uid, {
        title: isRtl ? "تم تأكيد رقم الهاتف" : "Phone Number Verified",
        message: isRtl ? `تم التحقق من رقم هاتفك بنجاح: ${fullNumber}` : `Your phone number ${fullNumber} has been successfully verified.`,
        category: "account",
        type: "system"
      });

    } catch (err: any) {
      console.error(err);
      setError(isRtl ? "رمز التحقق غير صحيح (استخدم 123456)" : "Invalid verification code (use 123456)");
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
      {/* 1. Phone Verification Status / Input Card */}
      {!prefs?.phoneNumber ? (
        <div className="rounded-2xl p-8 bg-bg-secondary/50 border border-border-primary flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <Phone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-sm font-medium text-text-primary">
            {isRtl ? "لم يتم ربط رقم هاتف بعد." : "No phone number linked yet."}
          </p>
          <button 
            onClick={openPhoneModal}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2"
          >
            <Phone className="w-4 h-4" />
            {isRtl ? "إضافة رقم هاتف" : "Add Phone Number"}
          </button>
        </div>
      ) : (
        <div className="rounded-2xl p-5 bg-surface-primary border border-border-primary space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Phone className="w-4 h-4 text-text-primary dark:text-text-secondary" />
              {isRtl ? "رقم الهاتف المسجل" : "Registered Phone Number"}
            </h4>
            <div className="flex items-center gap-2">
              <button onClick={openPhoneModal} className="p-1.5 text-text-secondary hover:text-indigo-500 hover:bg-indigo-500/10 rounded-lg transition-colors" title={isRtl ? "تعديل رقم الهاتف" : "Edit Phone Number"}>
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => setShowRemoveConfirm(true)} className="p-1.5 text-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title={isRtl ? "إزالة رقم الهاتف" : "Remove Phone Number"}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className={`flex items-center justify-between p-4 rounded-xl border ${prefs.verified ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
            <div>
              <p className={`font-mono text-lg font-bold tracking-wider ${prefs.verified ? 'text-accent-green' : 'text-accent-orange'}`}>
                {prefs.phoneNumber}
              </p>
              {prefs.verified ? (
                <p className="text-[11px] text-emerald-500/70 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isRtl ? "مُوثق منذ" : "Verified since"} {new Date(prefs.verifiedAt || "").toLocaleDateString(isRtl ? 'ar-SA' : 'en-US')}
                </p>
              ) : (
                <p className="text-[11px] text-amber-600 dark:text-amber-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {isRtl ? "غير موثق" : "Unverified"}
                </p>
              )}
            </div>
            {prefs.verified && (
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-accent-green" />
              </div>
            )}
          </div>

          {!prefs.verified && (
            <div className="space-y-4 pt-2">
              {!mockCodeSent ? (
                <>
                  {error && <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {error}</p>}
                  <button
                    onClick={handleSendCode}
                    disabled={isVerifying}
                    className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-text-primary font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
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
                  <p className="text-sm text-text-primary">
                    {isRtl ? `تم إرسال رمز لـ ${prefs.phoneNumber}` : `Code sent to ${prefs.phoneNumber}`}
                  </p>
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 p-2 rounded-lg mb-2">
                    {isRtl ? "بيئة تجريبية: أدخل 123456 كرمز التحقق." : "Test Mode: Enter 123456 as the verification code."}
                  </div>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full h-14 bg-surface-primary border border-slate-300 dark:border-slate-700 rounded-xl px-4 text-center text-2xl tracking-[0.5em] font-mono text-text-primary focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  {error && <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {error}</p>}
                  <button
                    onClick={handleVerifyCode}
                    disabled={isVerifying || verificationCode.length < 6}
                    className="w-full h-12 rounded-xl bg-accent-green hover:bg-emerald-500 text-text-primary font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
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
      )}

      {/* 2. SMS Intelligence Settings Card */}
      <div className={`rounded-2xl p-5 bg-surface-primary border ${prefs?.verified ? 'border-indigo-500/30' : 'border-border-primary opacity-60 pointer-events-none'} transition-all`}>
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${prefs?.verified ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-bg-secondary border-slate-300 dark:border-slate-700'}`}>
            <MessageSquare className={`w-5 h-5 ${prefs?.verified ? 'text-indigo-600 dark:text-indigo-400' : 'text-text-primary dark:text-text-secondary'}`} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-primary">
              {isRtl ? "إعدادات تحليل رسائل البنك" : "SMS Analysis Settings"}
            </h4>
            <p className="text-xs text-text-primary dark:text-text-secondary mt-0.5">
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
          
          <div className="pl-4 ml-2 border-l-2 border-slate-300 dark:border-slate-800/80 space-y-4 py-2 opacity-100 transition-opacity">
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

      {/* Phone Modal */}
      {isPhoneModalOpen && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="bg-surface-primary rounded-t-3xl sm:rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="p-5 border-b border-border-primary flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                {isRtl ? "تعديل رقم الهاتف" : "Edit Phone Number"}
              </h3>
              <button onClick={() => setIsPhoneModalOpen(false)} className="text-text-secondary hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {editError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-danger text-sm font-medium rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {editError}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1.5">
                  {isRtl ? "رقم الهاتف الجديد" : "New Phone Number"}
                </label>
                <div className="flex items-center gap-2 w-full max-w-full">
                  <div className="relative shrink-0">
                    <select 
                      value={newCountryCode}
                      onChange={(e) => setNewCountryCode(e.target.value)}
                      className={`h-12 w-[100px] bg-bg-secondary border border-border-primary rounded-xl px-3 text-text-primary text-sm font-mono appearance-none focus:outline-none focus:border-indigo-500 ${isRtl ? 'pl-8' : 'pr-8'}`}
                    >
                      {COUNTRIES.map(c => (
                        <option key={c.code} value={c.code}>{c.code}</option>
                      ))}
                    </select>
                    <ChevronDown className={`w-4 h-4 text-text-primary dark:text-text-secondary absolute top-4 pointer-events-none ${isRtl ? 'left-3' : 'right-3'}`} />
                  </div>
                  <input
                    type="tel"
                    value={newPhoneNumberStr}
                    onChange={(e) => setNewPhoneNumberStr(e.target.value.replace(/\D/g, ''))}
                    placeholder={isRtl ? "123 456 789" : "Phone number..."}
                    className="flex-1 min-w-0 w-full h-12 bg-bg-secondary border border-border-primary rounded-xl px-4 text-text-primary font-mono tracking-wider focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-border-primary flex gap-3">
              <button
                onClick={() => setIsPhoneModalOpen(false)}
                className="flex-1 py-3 text-sm font-bold text-text-secondary bg-bg-secondary rounded-xl hover:bg-bg-secondary transition-colors"
              >
                {isRtl ? "إلغاء" : "Cancel"}
              </button>
              <button
                onClick={handleSavePhone}
                className="flex-1 py-3 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors"
              >
                {isRtl ? "حفظ" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Confirm Dialog */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="bg-surface-primary rounded-t-3xl sm:rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-2">
              {isRtl ? "إزالة رقم الهاتف" : "Remove Phone Number"}
            </h3>
            <p className="text-sm text-text-secondary mb-6">
              {isRtl ? "هل أنت متأكد من إزالة رقم الهاتف؟ لن نتمكن من تحليل رسائلك المالية." : "Are you sure you want to remove your phone number? We will no longer be able to analyze your financial messages."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRemoveConfirm(false)}
                className="flex-1 py-3 text-sm font-bold text-text-secondary bg-bg-secondary rounded-xl hover:bg-bg-secondary transition-colors"
              >
                {isRtl ? "إلغاء" : "Cancel"}
              </button>
              <button
                onClick={handleRemovePhone}
                className="flex-1 py-3 text-sm font-bold text-white bg-danger rounded-xl hover:bg-red-700 transition-colors"
              >
                {isRtl ? "إزالة" : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleRow({ label, desc, isActive, onToggle, isDisabled = false, isMaster = false }: {
  label: string, desc: string, isActive: boolean, onToggle: () => void, isDisabled?: boolean, isMaster?: boolean
}) {
  return (
    <div className={`flex items-center justify-between gap-4 ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div>
        <p className={`text-sm font-semibold ${isMaster ? 'text-indigo-500 dark:text-indigo-300' : 'text-text-primary'}`}>{label}</p>
        <p className="text-[11px] text-text-primary dark:text-text-secondary mt-0.5">{desc}</p>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          isActive ? (isMaster ? 'bg-indigo-500' : 'bg-emerald-500') : 'bg-slate-200 dark:bg-slate-700'
        }`}
      >
        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
          isActive ? 'translate-x-6' : 'translate-x-0'
        }`} />
      </button>
    </div>
  );
}
