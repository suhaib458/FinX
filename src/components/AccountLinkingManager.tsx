import React, { useState, useEffect } from "react";
import { auth } from "../lib/firebase";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithPopup,
} from "firebase/auth";
import {
  Key,
  Lock,
  Mail,
  Chrome,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

interface AccountLinkingManagerProps {
  lang: "ar" | "en";
}

export default function AccountLinkingManager({
  lang,
}: AccountLinkingManagerProps) {
  const isRtl = lang === "ar";

  const [providers, setProviders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<{
    text: string;
    type: "error" | "success";
  } | null>(null);

  const refreshProviders = () => {
    if (!auth.currentUser) return;
    const currentProviders = auth.currentUser.providerData.map(
      (p) => p.providerId,
    );
    setProviders(currentProviders);
  };

  useEffect(() => {
    refreshProviders();
  }, [auth.currentUser]);

  const hasPassword = providers.includes("password");
  const hasGoogle = providers.includes("google.com");

  const handleLinkPassword = async () => {
    if (!auth.currentUser) return;
    if (newPassword.length < 6) {
      setMessage({
        type: "error",
        text: isRtl
          ? "كلمة المرور يجب أن تتكون من 6 أحرف على الأقل."
          : "Password must be at least 6 characters.",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // 1. Try to update password directly (automatically links password credential if not present)
      await updatePassword(auth.currentUser, newPassword);

      // 2. Reload user and refresh providers
      await auth.currentUser.reload();
      refreshProviders();

      setMessage({
        type: "success",
        text: isRtl
          ? "تم تعيين كلمة المرور وربطها بنجاح! يمكنك الآن تسجيل الدخول باستخدام البريد وكلمة المرور."
          : "Password successfully linked! You can now sign in using your email and password.",
      });
      setNewPassword("");
    } catch (err: any) {
      console.error("[Account Linking] Error setting password:", err);

      if (err.code === "auth/requires-recent-login") {
        try {
          // Attempt silent/popup re-auth since they logged in with Google recently
          if (hasGoogle) {
            const provider = new GoogleAuthProvider();
            await reauthenticateWithPopup(auth.currentUser, provider);
            await updatePassword(auth.currentUser, newPassword);
            await auth.currentUser.reload();
            refreshProviders();
            setMessage({
              type: "success",
              text: isRtl
                ? "تم تعيين كلمة المرور بنجاح!"
                : "Password successfully linked!",
            });
            setNewPassword("");
          } else {
            setMessage({
              type: "error",
              text: isRtl
                ? "لقد انتهت صلاحية الجلسة. يرجى تسجيل الخروج والدخول مجدداً."
                : "Session expired. Please log out and sign back in to continue.",
            });
          }
        } catch (reauthErr: any) {
          setMessage({
            type: "error",
            text: isRtl
              ? "يرجى تسجيل الخروج وإعادة الدخول لتأكيد الإجراء."
              : "Please log out and sign back in to perform this security action.",
          });
        }
      } else {
        setMessage({
          type: "error",
          text: err.message || "An error occurred during linking.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!auth.currentUser) return null;

  return (
    <div className="rounded-2xl p-4.5 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-4">
      <div className="space-y-1">
        <label className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wide flex items-center gap-1.5">
          <Key className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          {isRtl ? "طرق تسجيل الدخول المرتبطة" : "Linked Sign-In Methods"}
        </label>
        <p className="text-[11px] text-slate-700 dark:text-slate-400 leading-relaxed">
          {isRtl
            ? "يمكنك ربط أكثر من طريقة لتسجيل الدخول للحفاظ على أمان حسابك وسهولة الوصول إليه."
            : "Link multiple authentication methods to keep your account secure and accessible."}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex flex-col gap-2">
          {/* Google Connection Status */}
          <div
            className={`flex items-center justify-between p-3 rounded-xl border ${hasGoogle ? "bg-indigo-500/10 border-indigo-500/20" : "bg-slate-100 dark:bg-slate-800 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50"}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${hasGoogle ? "bg-indigo-500/20 text-indigo-500 dark:text-indigo-300" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-400"}`}
              >
                <Chrome className="w-4 h-4" />
              </div>
              <div>
                <p
                  className={`text-xs font-bold ${hasGoogle ? "text-indigo-200" : "text-slate-700 dark:text-slate-400"}`}
                >
                  Google Sign-In
                </p>
                <p className="text-[10px] text-slate-700 dark:text-slate-400">
                  {auth.currentUser.email}
                </p>
              </div>
            </div>
            {hasGoogle && (
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded border border-indigo-400/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {isRtl ? "مرتبط" : "Linked"}
              </span>
            )}
          </div>

          {/* Password Connection Status */}
          <div
            className={`flex items-center justify-between p-3 rounded-xl border ${hasPassword ? "bg-emerald-500/10 border-emerald-500/20" : "bg-slate-100 dark:bg-slate-800 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50"}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${hasPassword ? "bg-emerald-500/20 text-emerald-500 dark:text-emerald-300" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-400"}`}
              >
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p
                  className={`text-xs font-bold ${hasPassword ? "text-emerald-200" : "text-slate-700 dark:text-slate-400"}`}
                >
                  Email & Password
                </p>
                <p className="text-[10px] text-slate-700 dark:text-slate-400">
                  {auth.currentUser.email}
                </p>
              </div>
            </div>
            {hasPassword && (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {isRtl ? "مرتبط" : "Linked"}
              </span>
            )}
          </div>
        </div>
      </div>

      {!hasPassword && (
        <div className="pt-2 border-t border-slate-300 dark:border-slate-800/80 mt-2 space-y-3">
          <div className="flex items-center gap-2 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg leading-snug">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {isRtl
              ? "حسابك يستخدم Google فقط. أضف كلمة مرور لتتمكن من الدخول بالبريد مستقبلاً."
              : "Your account solely relies on Google. Add a password to enable Email/Password login."}
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-700 dark:text-slate-400" />
              </div>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={
                  isRtl
                    ? "كلمة مرور جديدة (6 أحرف على الأقل)"
                    : "New Password (min 6 chars)"
                }
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block pl-10 p-3"
                dir={isRtl ? "rtl" : "ltr"}
              />
            </div>
            <button
              onClick={handleLinkPassword}
              disabled={loading || newPassword.length < 6}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 dark:text-white font-bold py-3 px-4 rounded-xl transition-colors text-xs whitespace-nowrap"
            >
              {loading
                ? isRtl
                  ? "جاري الحفظ..."
                  : "Saving..."
                : isRtl
                  ? "ربط كلمة المرور"
                  : "Set Password"}
            </button>
          </div>
        </div>
      )}

      {message && (
        <div
          className={`p-3 rounded-xl border text-[11px] font-semibold leading-snug ${
            message.type === "error"
              ? "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
