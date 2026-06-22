import React, { useState, useEffect } from "react";
import {
  Mail,
  Lock,
  User,
  LogIn,
  UserPlus,
  ArrowRight,
  X,
  Fingerprint,
} from "lucide-react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { auth, googleSignIn } from "../lib/firebase";
import { translations } from "../translations";
import { useWebAuthn, isRunningInIframe } from "../hooks/useWebAuthn";

interface AuthProps {
  lang: "ar" | "en";
}

export default function Auth({ lang }: AuthProps) {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const { isSupported, loginWithPasskey } = useWebAuthn();

  const isRtl = lang === "ar";

  // Try to prefill email if biometric was used previously
  useEffect(() => {
    try {
      const stored = localStorage.getItem("FinX_SecureCredentials");
      if (stored) {
        const decoded = JSON.parse(atob(stored));
        if (decoded.email) setEmail(decoded.email);
      }
    } catch (e) {}
  }, []);

  const saveCredentials = (e: string, p: string) => {
    try {
      localStorage.setItem(
        "FinX_SecureCredentials",
        btoa(JSON.stringify({ email: e, password: p })),
      );
    } catch (err) {}
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const sanitizedEmail = email.trim(); // Remove whitespace/hidden chars causing auth/invalid-credential
    try {
      console.log(
        `[Auth Diagnostics] Executing ${mode} for email: '${sanitizedEmail}'`,
      );

      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, sanitizedEmail, password);
        saveCredentials(sanitizedEmail, password);
      } else {
        await signInWithEmailAndPassword(auth, sanitizedEmail, password);
        saveCredentials(sanitizedEmail, password);
      }
    } catch (err: any) {
      console.error(
        "[Auth Diagnostics] Firebase Authentication Error Payload:",
        err,
      );
      console.error("[Auth Diagnostics] Error Code:", err.code);
      console.error("[Auth Diagnostics] Error Message:", err.message);

      let displayError = err.message || "Authentication failed";

      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/email-already-in-use"
      ) {
        try {
          // If Email Enumeration Protection is enabled, this may throw or return empty array.
          const methods = await fetchSignInMethodsForEmail(
            auth,
            sanitizedEmail,
          );
          const hasGoogle = methods.includes("google.com");
          const hasPassword = methods.includes("password");

          if (hasGoogle && !hasPassword) {
             displayError = isRtl 
               ? 'هذا الحساب يستخدم شبكة Google فقط للمصادقة. يرجى المتابعة بالضغط على "المتابعة باستخدام Google" أو إضافة كلمة مرور من إعدادات حسابك بعد الدخول.' 
               : 'This account was created using Google Sign-In. Continue with Google, or sign in and set a password in Settings.';
          } else if (hasGoogle && hasPassword && err.code === 'auth/invalid-credential') {
             displayError = isRtl ? 'كلمة المرور غير صحيحة.' : 'Invalid email or password.';
          } else if (err.code === 'auth/email-already-in-use') {
             displayError = isRtl ? 'البريد الإلكتروني مسجل مسبقاً.' : 'Email is already in use.';
          } else if (err.code === 'auth/invalid-credential') {
             displayError = isRtl 
               ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.' 
               : 'Invalid email or password. Please try again.';
          }
        } catch (fetchErr) {
          // If fetchSignInMethodsForEmail fails (e.g. Email Enumeration Protection is enabled)
          if (err.code === "auth/invalid-credential") {
            displayError = isRtl
              ? "البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى التأكد من البيانات أو تسجيل الدخول باستخدام Google."
              : 'Invalid email or password. Please check your credentials or try "Continue with Google".';
          } else if (err.code === "auth/email-already-in-use") {
            displayError = isRtl
              ? "البريد الإلكتروني موجود مسبقاً."
              : "Email is already in use.";
          }
        }
      } else if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        // Fallback for older SDK versions that might still use these
        displayError = isRtl
          ? "البريد الإلكتروني أو كلمة المرور غير صحيحة."
          : "Invalid email or password.";
      }

      setError(displayError);
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setError("");
    setMessage("");

    if (isRunningInIframe()) {
      setError(
        isRtl
          ? "يتطلب تسجيل الدخول بالبصمة فتح التطبيق في نافذة مستقلة."
          : "Biometric login requires the app to be opened in a full browser tab.",
      );
      return;
    }

    try {
      const stored = localStorage.getItem("FinX_SecureCredentials");
      if (!stored) {
        setError(
          isRtl
            ? "لم يتم العثور على البصمة مرتبطة بحساب. يرجى تسجيل الدخول يدوياً وتفعيلها من الإعدادات."
            : "No biometric profile linked. Log in manually first and enable it in Settings.",
        );
        return;
      }

      const result = await loginWithPasskey();
      if (!result.success) {
        setError(
          isRtl
            ? `فشلت المصادقة الحيوية: ${result.message}`
            : `Biometric error: ${result.message}`,
        );
        return;
      }

      setLoading(true);
      const decoded = JSON.parse(atob(stored));
      const sanitizedEmail = decoded.email?.trim();

      console.log(
        `[Auth Diagnostics] Executing Passkey Login for email: '${sanitizedEmail}'`,
      );

      await signInWithEmailAndPassword(auth, sanitizedEmail, decoded.password);
    } catch (err: any) {
      console.error(
        "[Auth Diagnostics] Biometric Login Firebase Authentication Error:",
        err,
      );
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError("");
    setLoading(true);
    try {
      console.log(`[Auth Diagnostics] Executing Google OAuth popup...`);
      await googleSignIn();
    } catch (err: any) {
      console.error("[Auth Diagnostics] Google Authentication Error:", err);
      // Ignore if the popup was closed by the user
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        setError(err.message || "Google Auth failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const sanitizedEmail = email.trim();
      console.log(
        `[Auth Diagnostics] Executing Password Reset for email: '${sanitizedEmail}'`,
      );

      // Email Enumeration Protection prevents checking if email exists. We just send it.
      await sendPasswordResetEmail(auth, sanitizedEmail);
      setMessage(
        isRtl
          ? "إذا كان هذا البريد مسجلاً، فسيتم إرسال رابط إعادة تعيين كلمة المرور إليه."
          : "If an account exists, a password reset link will be sent.",
      );
      setMode("login");
    } catch (err: any) {
      console.error("[Auth Diagnostics] Reset Password Error:", err);
      // Don't leak if email exists or not to user usually, but keeping error display as requested
      setError(err.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    if (mode === "forgot") {
      return (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label
              className={`block text-xs text-slate-700 dark:text-slate-400 mb-1 ${isRtl ? "text-right" : "text-left"}`}
            >
              {isRtl ? "البريد الإلكتروني" : "Email Address"}
            </label>
            <div className="relative">
              <Mail
                className={`absolute top-3 w-5 h-5 text-slate-700 dark:text-slate-400 ${isRtl ? "right-3" : "left-3"}`}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl py-3 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors ${isRtl ? "pr-10 text-right" : "pl-10 text-left"}`}
                placeholder={isRtl ? "name@example.com" : "name@example.com"}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-slate-900 dark:text-white font-bold py-3 px-4 rounded-xl transition-colors mt-2"
          >
            {loading
              ? isRtl
                ? "جاري الإرسال..."
                : "Sending..."
              : isRtl
                ? "إرسال رابط التعيين"
                : "Send Reset Link"}
          </button>
          <button
            type="button"
            onClick={() => setMode("login")}
            className="w-full text-xs text-slate-700 dark:text-slate-400 mt-4 underline decoration-slate-600 underline-offset-4"
          >
            {isRtl ? "العودة إلى تسجيل الدخول" : "Back to login"}
          </button>
        </form>
      );
    }

    return (
      <form onSubmit={handleEmailAuth} className="space-y-4">
        <div>
          <label
            className={`block text-xs text-slate-700 dark:text-slate-400 mb-1 ${isRtl ? "text-right" : "text-left"}`}
          >
            {isRtl ? "البريد الإلكتروني" : "Email Address"}
          </label>
          <div className="relative">
            <Mail
              className={`absolute top-3 w-5 h-5 text-slate-700 dark:text-slate-400 ${isRtl ? "right-3" : "left-3"}`}
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl py-3 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors ${isRtl ? "pr-10 text-right" : "pl-10 text-left"}`}
              placeholder={isRtl ? "name@example.com" : "name@example.com"}
            />
          </div>
        </div>

        <div>
          <label
            className={`block text-xs text-slate-700 dark:text-slate-400 mb-1 ${isRtl ? "text-right" : "text-left"}`}
          >
            {isRtl ? "كلمة المرور" : "Password"}
          </label>
          <div className="relative">
            <Lock
              className={`absolute top-3 w-5 h-5 text-slate-700 dark:text-slate-400 ${isRtl ? "right-3" : "left-3"}`}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className={`w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl py-3 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors ${isRtl ? "pr-10 text-right" : "pl-10 text-left"}`}
              placeholder="••••••••"
            />
          </div>
        </div>

        {mode === "login" && (
          <div className={`flex ${isRtl ? "justify-start" : "justify-end"}`}>
            <button
              type="button"
              onClick={() => setMode("forgot")}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:text-indigo-300 transition-colors"
            >
              {isRtl ? "هل نسيت كلمة المرور؟" : "Forgot Password?"}
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-slate-900 dark:text-white font-bold py-3 px-4 rounded-xl transition-colors mt-2"
        >
          {loading
            ? isRtl
              ? "جاري المعالجة..."
              : "Processing..."
            : mode === "login"
              ? isRtl
                ? "تسجيل الدخول"
                : "Sign In"
              : isRtl
                ? "إنشاء حساب جديد"
                : "Create Account"}
        </button>

        {isSupported &&
          mode === "login" &&
          (isRunningInIframe() ? (
            <div className="space-y-3 mt-3">
              <button
                type="button"
                onClick={() => window.open(window.location.href, "_blank")}
                className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 text-xs"
              >
                <Fingerprint className="w-4 h-4" />
                {isRtl
                  ? "افتح في نافذة مستقلة للدخول بالبصمة"
                  : "Open in new tab for Biometric Login"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleBiometricLogin}
              disabled={loading}
              className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 mt-3"
            >
              <Fingerprint className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              {isRtl ? "الدخول بالبصمة / الوجه" : "Passkey / Biometric Login"}
            </button>
          ))}

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300 dark:border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-400">
              {isRtl ? "أو المتابعة باستخدام" : "Or continue with"}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </button>

        <p className="text-center text-xs text-slate-700 dark:text-slate-400 mt-6">
          {mode === "login"
            ? isRtl
              ? "ليس لديك حساب؟"
              : "Don't have an account?"
            : isRtl
              ? "لديك حساب بالفعل؟"
              : "Already have an account?"}
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="ml-1 text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
          >
            {mode === "login"
              ? isRtl
                ? "سجل الآن"
                : "Sign Up"
              : isRtl
                ? "سجل الدخول"
                : "Sign In"}
          </button>
        </p>
      </form>
    );
  };

  return (
    <div
      className={`flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-50 dark:from-[#020617] via-white dark:via-slate-900 to-slate-100 dark:to-slate-950 ${isRtl ? "font-arabic" : "font-sans"}`}
    >
      <div className="w-full max-w-[320px]">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-700 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20">
            <span className="text-slate-900 dark:text-white font-black text-xl font-sans">FX</span>
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300">
            {isRtl ? "مرحباً بك في فنيكس" : "Welcome to FinX"}
          </h1>
          <p className="text-slate-700 dark:text-slate-400 mt-2 text-sm">
            {mode === "login"
              ? isRtl
                ? "سجل دخولك للمتابعة"
                : "Sign in to continue your journey"
              : mode === "signup"
                ? isRtl
                  ? "قم بإنشاء حسابك الجديد"
                  : "Create your new account"
                : isRtl
                  ? "استعادة حسابك"
                  : "Recover your account"}
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/50 rounded-xl p-3 flex items-start gap-2">
            <span className="text-red-400 text-xs">{error}</span>
          </div>
        )}

        {message && (
          <div className="mb-4 bg-green-500/10 border border-green-500/50 rounded-xl p-3 flex items-start gap-2">
            <span className="text-green-400 text-xs">{message}</span>
          </div>
        )}

        {renderForm()}
      </div>
    </div>
  );
}
