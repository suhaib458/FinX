import React, { useState } from "react";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles, 
  DollarSign, 
  Lightbulb, 
  TrendingUp, 
  Wallet, 
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  Mail
} from "lucide-react";
import { translations } from "../translations";
import { FinancialAnalysis } from "../types";
import { getAccessToken, googleSignIn } from "../lib/auth";

interface DashboardProps {
  lang: "ar" | "en";
  analysis: FinancialAnalysis;
  setActiveTab: (tab: "home" | "coach" | "simulation" | "healthScore" | "upload" | "settings") => void;
}

export default function Dashboard({ lang, analysis, setActiveTab }: DashboardProps) {
  const t = translations[lang];
  const isRtl = lang === "ar";
  
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);

  // Financial values
  const income = analysis.monthlyIncome;
  const expense = analysis.monthlyExpenses;
  const savings = income - expense;
  const savingsRate = analysis.savingsRate;
  const score = analysis.healthScore;

  const handleSendReport = async () => {
    let token = await getAccessToken();
    let userEmail = "";
    if (!token) {
      const result = await googleSignIn();
      if (!result) return;
      token = result.accessToken;
      userEmail = result.user.email || "";
    } else {
      // In a real app we might fetch the profile, but for simplicity we just use 'me'
      userEmail = "me"; 
    }

    try {
      setSendingEmail(true);
      const emailContent = [
        `To: ${userEmail === "me" ? "" : userEmail}`,
        `Subject: ${isRtl ? "تقرير صحتك المالية من FinX" : "Your FinX Financial Health Report"}`,
        `Content-Type: text/plain; charset=utf-8`,
        ``,
        `${isRtl ? "مرحباً، إليك ملخص صحتك المالية:" : "Hello, here is your financial health summary:"}`,
        `${isRtl ? "الدخل الشهري:" : "Monthly Income:"} ${income} JOD`,
        `${isRtl ? "المصروفات:" : "Monthly Expenses:"} ${expense} JOD`,
        `${isRtl ? "درجة الصحة:" : "Health Score:"} ${score}/100`,
        ``,
        `${analysis.scoreExplanation}`,
        ``,
        `${isRtl ? "نتمنى لك يوماً سعيداً!" : "Have a great day!"}`
      ].join('\n');

      const encodedEmail = btoa(unescape(encodeURIComponent(emailContent)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ raw: encodedEmail })
      });

      if (response.ok) {
        setEmailSuccess(true);
        setTimeout(() => setEmailSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to send email:", err);
    } finally {
      setSendingEmail(false);
    }
  };

  // Set score descriptions
  const getScoreColor = (val: number) => {
    if (val >= 80) return "text-emerald-400";
    if (val >= 60) return "text-amber-400";
    return "text-rose-400";
  };

  const getScoreBg = (val: number) => {
    if (val >= 80) return "bg-emerald-500/10 border-emerald-500/20";
    if (val >= 60) return "bg-amber-500/10 border-amber-500/20";
    return "bg-rose-500/10 border-rose-500/20";
  };

  const getScoreLabel = (val: number) => {
    if (val >= 85) return t.excellentState;
    if (val >= 70) return t.goodState;
    if (val >= 50) return t.fairState;
    return t.cautionState;
  };

  return (
    <div 
      className="flex-1 overflow-y-auto px-4 py-5 space-y-5"
      style={{ direction: isRtl ? "rtl" : "ltr" }}
    >
      {/* Onboarding Summary Header */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-800/60">
        <div>
          <p className="text-[10px] tracking-wider text-slate-400 uppercase font-mono">
            {isRtl ? "شريك الإدارة الذكية" : "AI FINTECH COPILOT"}
          </p>
          <h2 className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300 ${isRtl ? 'font-arabic' : 'font-sans'}`}>
            {isRtl ? `مرحباً بك في ${t.appName}` : "Your Portfolio Snapshot"}
          </h2>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleSendReport}
            disabled={sendingEmail}
            title={isRtl ? "إرسال التقرير للإيميل" : "Email Report"}
            className="flex h-8 w-8 hover:scale-105 active:scale-95 transition-all rounded-full bg-slate-900 border border-slate-850 items-center justify-center text-slate-400 hover:text-indigo-400 cursor-pointer disabled:opacity-50"
          >
            {emailSuccess ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Mail className="w-4 h-4" />}
          </button>
          <div className="flex h-8 w-8 rounded-full bg-slate-900 border border-slate-850 items-center justify-center text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Balance Card & Savings indicators - Sophisticated Dark Premium Gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-700 p-5 text-white shadow-xl shadow-indigo-500/20 border border-indigo-500/20">
        <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-indigo-100 flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5 text-indigo-200" />
            {t.balanceSummary}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/20 text-white font-mono font-medium backdrop-blur-md">
            JOD
          </span>
        </div>

        {/* Big Balance */}
        <div className="space-y-1">
          <h3 className="text-3xl font-extrabold tracking-tight text-white font-mono">
            {(savings >= 0 ? "+" : "") + savings.toLocaleString()}
          </h3>
          <p className="text-xs text-indigo-100/90 font-medium">
            {t.savings} ({(savingsRate).toFixed(1)}%)
          </p>
        </div>

        {/* Split Inflow / Outflow Widgets */}
        <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-white/10">
          <div className="space-y-1">
            <span className="text-[10px] text-indigo-150 flex items-center gap-1/2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {t.totalIncome}
            </span>
            <p className="text-base font-bold text-emerald-300 font-mono flex items-center gap-0.5">
              {income.toLocaleString()}
              <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
            </p>
          </div>
          <div className="space-y-1 border-l border-white/10 pl-4 rtl:border-l-0 rtl:border-r rtl:pl-0 rtl:pr-4">
            <span className="text-[10px] text-indigo-150 flex items-center gap-1/2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              {t.totalExpenses}
            </span>
            <p className="text-base font-bold text-rose-300 font-mono flex items-center gap-0.5">
              {expense.toLocaleString()}
              <ArrowDownRight className="w-3.5 h-3.5 shrink-0" />
            </p>
          </div>
        </div>
      </div>

      {/* Financial Health Score Mini Meter */}
      <div 
        onClick={() => setActiveTab("healthScore")}
        className="rounded-2xl p-4 bg-slate-900/50 border border-slate-800 hover:border-indigo-500/30 active:scale-98 transition-all cursor-pointer flex items-center justify-between gap-4"
      >
        <div className="space-y-1.5 flex-1">
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">
            {t.scoreTitle}
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-black font-mono ${getScoreColor(score)}`}>
              {score}
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${getScoreBg(score)} ${getScoreColor(score)}`}>
              {getScoreLabel(score)}
            </span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400 line-clamp-1">
            {analysis.scoreExplanation}
          </p>
        </div>
        
        {/* Visual score slider block */}
        <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center shrink-0 relative">
          <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 48 48">
            <circle
              cx="24"
              cy="24"
              r="18"
              className="text-slate-800"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="24"
              cy="24"
              r="18"
              className={score >= 80 ? "text-indigo-500" : score >= 60 ? "text-amber-400" : "text-rose-400"}
              strokeWidth="4"
              strokeDasharray={113}
              strokeDashoffset={113 - (113 * score) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <span className="absolute text-[10px] font-black text-slate-200">{score}%</span>
        </div>
      </div>

      {/* Quick forecasting teaser button (Call to action) */}
      <div 
        onClick={() => setActiveTab("simulation")}
        className="group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-r from-indigo-950/40 via-slate-900/50 to-indigo-900/20 border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 active:scale-[0.99] flex items-center justify-between"
      >
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
        <div className="absolute -left-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
        
        <div className="relative z-10 flex items-start gap-4">
          <div className="mt-1 w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
              {t.tryScenario}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed max-w-[220px]">
              {t.tryScenarioDesc}
            </p>
          </div>
        </div>
        
        <div className="relative z-10 bg-indigo-600 group-hover:bg-indigo-500 text-white p-2.5 rounded-full shadow-md transition-all group-hover:shadow-indigo-500/25 shrink-0 group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
          {isRtl ? <ArrowLeft className="w-4 h-4 stroke-[2.5]" /> : <ArrowRight className="w-4 h-4 stroke-[2.5]" />}
        </div>
      </div>

      {/* Segmented Spending Category Progress bars (Collapsible) */}
      <details className="group rounded-2xl bg-slate-900/50 border border-slate-800 border-t-0 p-0 [&_summary::-webkit-details-marker]:hidden">
        <summary className="p-4 cursor-pointer text-xs font-bold text-slate-300 flex items-center justify-between outline-none">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            {t.spendingBreakdown}
          </span>
          <span className="text-[10px] font-mono font-medium text-slate-400 group-open:hidden">
            {isRtl ? "عرض التفاصيل" : "View Details"} &gt;
          </span>
        </summary>
        <div className="space-y-3.5 px-4 pb-4">
          {analysis.categories.map((cat, idx) => {
            const pct = expense > 0 ? (cat.value / expense) * 100 : 0;
            return (
              <div key={idx} className="space-y-1.5 group/cat">
                <div className="flex items-center justify-between text-[11px] font-medium">
                  <span className="text-slate-300 flex items-center gap-2 max-w-[190px] truncate group-hover/cat:text-slate-100 transition-colors">
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: cat.color, boxShadow: `0 0 8px ${cat.color}80` }}
                    ></span>
                    {cat.name}
                  </span>
                  <span className="text-slate-400 font-mono group-hover/cat:text-slate-300 transition-colors">
                    {cat.value.toLocaleString()} ({pct.toFixed(0)}%)
                  </span>
                </div>
                {/* Visual bar tracker */}
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full rounded-full transition-all duration-[1500ms] ease-out"
                    style={{ 
                      width: `${pct}%`, 
                      backgroundColor: cat.color,
                      boxShadow: `0 0 10px ${cat.color}60`
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </details>

      {/* Dynamic Proactive AI Insights Box */}
      <div className="space-y-2.5 pb-2">
        <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Lightbulb className="w-4 h-4 text-indigo-400" />
          {t.smartInsights}
        </h3>
        <div className="space-y-2">
          {analysis.insights.map((ins, idx) => (
            <div 
              key={idx} 
              className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 flex gap-3 items-start hover:border-slate-700 transition-colors"
            >
              <div className="shrink-0 mt-0.5">
                {ins.type === "warning" ? (
                  <AlertTriangle className="w-4.5 h-4.5 text-rose-400" />
                ) : ins.type === "success" ? (
                  <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />
                ) : (
                  <HelpCircle className="w-4.5 h-4.5 text-indigo-400" />
                )}
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono block">
                  {ins.type === "warning" ? t.warningType : ins.type === "success" ? t.successType : t.neutralType}
                </span>
                <h4 className="text-xs font-extrabold text-slate-200">
                  {ins.title}
                </h4>
                <p className="text-[11px] leading-relaxed text-slate-400">
                  {ins.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
