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
  Mail,
} from "lucide-react";
import { translations } from "../translations";
import { FinancialAnalysis } from "../types";

interface DashboardProps {
  lang: "ar" | "en";
  analysis: FinancialAnalysis;
  setActiveTab: (
    tab:
      | "home"
      | "coach"
      | "simulation"
      | "healthScore"
      | "upload"
      | "settings",
  ) => void;
}

export default function Dashboard({
  lang,
  analysis,
  setActiveTab,
}: DashboardProps) {
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
    try {
      setSendingEmail(true);
      // Simulating API call for Hackathon Demo without breaking or throwing warnings
      await new Promise((resolve) => setTimeout(resolve, 800));
      setEmailSuccess(true);
      setTimeout(() => setEmailSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to send email:", err);
    } finally {
      setSendingEmail(false);
    }
  };

  // Set score descriptions
  const getScoreColor = (val: number) => {
    if (val >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (val >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-rose-600 dark:text-rose-400";
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
      className={`flex-1 overflow-y-auto px-4 py-5 space-y-5 ${isRtl ? "text-right" : "text-left"}`}
    >
      {/* Main Balance Card & Savings indicators - Luxury Green Banking Theme */}
      <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 dark:from-[#0c2e21] dark:via-[#084832] dark:to-[#04281c] p-5 text-white shadow-[0_10px_40px_-10px_rgba(4,40,28,0.3)] dark:shadow-[0_10px_40px_-10px_rgba(4,40,28,0.7)] border border-emerald-500/20 dark:border-emerald-800/40 transform transition-all duration-300">
        {/* Subtle decorative glows / light reflections */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 dark:bg-emerald-400/5 rounded-full blur-3xl pointer-events-none transform translate-x-1/4 -translate-y-1/4"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-48 h-48 bg-emerald-600/15 dark:bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>

        {/* Top bar: Chip and Label */}
        <div className="flex items-center justify-between mb-5 relative z-10 w-full">
          <div className="flex flex-col gap-1 items-start">
            <span className="text-[9px] text-emerald-100/90 font-medium tracking-wide uppercase">
              {t.balanceSummary}
            </span>
            <div className="w-8 h-6 rounded bg-gradient-to-br from-amber-200/90 to-amber-500/70 shadow-sm border border-amber-300/30 flex items-center justify-center opacity-80 backdrop-blur-sm">
              <div className="w-full h-full border border-amber-900/10 rounded relative opacity-60">
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-amber-900/20"></div>
                <div className="absolute left-1/2 top-0 w-[1px] h-full bg-amber-900/20"></div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-emerald-900/40 border border-emerald-700/50 backdrop-blur-md px-2 py-0.5 rounded-full shadow-inner">
            <Wallet className="w-3 h-3 text-emerald-100" />
            <span className="text-[10px] text-white font-mono font-bold tracking-widest">
              FinX <span className="text-emerald-500 dark:text-emerald-300 font-sans">PRO</span>
            </span>
          </div>
        </div>

        {/* Big Balance */}
        <div className="space-y-1 mb-4 relative z-10 w-full">
          <div className="flex items-baseline gap-1">
            <span className="text-[11px] text-emerald-100/80 font-mono font-medium -mt-1 block">
              JOD
            </span>
            <h3 className="text-[32px] leading-none font-extrabold tracking-tight text-white font-mono drop-shadow-md">
              {savings.toLocaleString()}
            </h3>
          </div>
        </div>

        {/* Split Inflow / Outflow Widgets w/ Glassmorphism */}
        <div className="grid grid-cols-2 gap-2 mt-2 relative z-10 w-full">
          <div className="bg-emerald-800/30 dark:bg-[#031d14]/40 backdrop-blur-sm border border-emerald-500/20 dark:border-emerald-800/30 rounded-xl p-2.5 flex flex-col items-start shadow-sm transition-all hover:bg-emerald-800/50 dark:hover:bg-[#031d14]/60">
            <span className="text-[9px] text-emerald-100/80 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1">
              <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-emerald-500/30 text-emerald-100">
                <ArrowDownRight className="w-2 h-2" />
              </span>
              {t.totalIncome}
            </span>
            <p className="text-[15px] font-bold text-white font-mono tracking-tight mt-0.5">
              +{income.toLocaleString()}
            </p>
          </div>
          <div className="bg-emerald-800/30 dark:bg-[#031d14]/40 backdrop-blur-sm border border-emerald-500/20 dark:border-emerald-800/30 rounded-xl p-2.5 flex flex-col items-start shadow-sm transition-all hover:bg-emerald-800/50 dark:hover:bg-[#031d14]/60">
            <span className="text-[9px] text-emerald-100/80 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1">
               <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-rose-500/30 text-rose-100">
                <ArrowUpRight className="w-2 h-2" />
              </span>
              {t.totalExpenses}
            </span>
            <p className="text-[15px] font-bold text-white font-mono tracking-tight mt-0.5">
              -{expense.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Financial Health Score Mini Meter */}
      <div
        onClick={() => setActiveTab("healthScore")}
        className="rounded-2xl p-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/30 active:scale-98 transition-all cursor-pointer flex items-center justify-between gap-4"
      >
        <div className="space-y-1.5 flex-1">
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">
            {t.scoreTitle}
          </span>
          <div className="flex items-center gap-2">
            <span
              className={`text-2xl font-black font-mono ${getScoreColor(score)}`}
            >
              {score}
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${getScoreBg(score)} ${getScoreColor(score)}`}
            >
              {getScoreLabel(score)}
            </span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-400 line-clamp-1">
            {analysis.scoreExplanation}
          </p>
        </div>

        {/* Visual score slider block */}
        <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-950 border border-slate-850 flex items-center justify-center shrink-0 relative">
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
              className={
                score >= 80
                  ? "text-indigo-500"
                  : score >= 60
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-rose-600 dark:text-rose-400"
              }
              strokeWidth="4"
              strokeDasharray={113}
              strokeDashoffset={113 - (113 * score) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <span className="absolute text-[10px] font-black text-slate-800 dark:text-slate-200">
            {score}%
          </span>
        </div>
      </div>

      {/* Quick forecasting teaser button (Call to action) */}
      <div
        onClick={() => setActiveTab("simulation")}
        className="group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-r from-indigo-50 via-white to-indigo-50/50 dark:from-indigo-950/40 dark:via-slate-900/50 dark:to-indigo-900/20 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/10 active:scale-[0.99] flex items-center justify-between"
      >
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
        <div className="absolute -left-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>

        <div className="relative z-10 flex items-start gap-4">
          <div className="mt-1 w-10 h-10 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/20 dark:border-indigo-500/30 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
              {t.tryScenario}
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-400 leading-relaxed max-w-[220px]">
              {t.tryScenarioDesc}
            </p>
          </div>
        </div>

        <div className="relative z-10 bg-indigo-600 group-hover:bg-indigo-500 text-white p-2.5 rounded-full shadow-md transition-all group-hover:shadow-indigo-500/25 shrink-0 group-hover:translate-x-1">
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </div>
      </div>

      {/* Credit Card Upload Feature */}
      <div
        onClick={() => setActiveTab("upload")}
        className="group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-r from-emerald-50 via-white to-emerald-50/50 dark:from-emerald-950/40 dark:via-slate-900/50 dark:to-emerald-900/20 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 dark:hover:shadow-emerald-500/10 active:scale-[0.99] flex items-center justify-between"
      >
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
        <div className="absolute -left-6 -top-6 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/20 transition-all"></div>

        <div className="relative z-10 flex items-start gap-4">
          <div className="mt-1 w-10 h-10 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/20 dark:border-emerald-500/30 group-hover:scale-110 transition-transform">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-emerald-600 dark:text-emerald-400"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" x2="22" y1="10" y2="10" />
            </svg>
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
              {t.statementUploadTitle ||
                (isRtl ? "ربط البطاقة الائتمانية" : "Connect Credit Card")}
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-400 leading-relaxed max-w-[220px]">
              {isRtl
                ? "حلل مصاريفك تلقائيا واربط بطاقاتك لتحليل الدخل والإنفاق."
                : "Upload your card statement to let AI categorize expenses securely."}
            </p>
          </div>
        </div>

        <div className="relative z-10 bg-emerald-600 group-hover:bg-emerald-500 text-white p-2.5 rounded-full shadow-md transition-all group-hover:shadow-emerald-500/25 shrink-0 group-hover:translate-x-1">
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </div>
      </div>

      {/* Segmented Spending Category Progress bars (Collapsible) */}
      <details className="group rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 border-t-0 p-0 [&_summary::-webkit-details-marker]:hidden">
        <summary className="p-4 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between outline-none">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            {t.spendingBreakdown}
          </span>
          <span className="text-[10px] font-mono font-medium text-slate-700 dark:text-slate-400 group-open:hidden">
            {isRtl ? "عرض التفاصيل" : "View Details"} &gt;
          </span>
        </summary>
        <div className="space-y-3.5 px-4 pb-4">
          {analysis.categories.map((cat, idx) => {
            const pct = expense > 0 ? (cat.value / expense) * 100 : 0;
            return (
              <div key={idx} className="space-y-1.5 group/cat">
                <div className="flex items-center justify-between text-[11px] font-medium">
                  <span className="text-slate-700 dark:text-slate-300 flex items-center gap-2 max-w-[190px] truncate group-hover/cat:text-slate-900 dark:group-hover/cat:text-slate-100 transition-colors">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                      style={{
                        backgroundColor: cat.color,
                        boxShadow: `0 0 8px ${cat.color}80`,
                      }}
                    ></span>
                    {cat.name}
                  </span>
                  <span className="text-slate-700 dark:text-slate-400 font-mono group-hover/cat:text-slate-700 dark:text-slate-300 transition-colors">
                    {cat.value.toLocaleString()} ({pct.toFixed(0)}%)
                  </span>
                </div>
                {/* Visual bar tracker */}
                <div className="w-full h-2.5 bg-white dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-[1500ms] ease-out"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: cat.color,
                      boxShadow: `0 0 10px ${cat.color}60`,
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
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Lightbulb className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          {t.smartInsights}
        </h3>
        <div className="space-y-2">
          {analysis.insights.map((ins, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex gap-3 items-start hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div className="shrink-0 mt-0.5">
                {ins.type === "warning" ? (
                  <AlertTriangle className="w-4.5 h-4.5 text-rose-600 dark:text-rose-400" />
                ) : ins.type === "success" ? (
                  <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />
                ) : (
                  <HelpCircle className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
                )}
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] uppercase tracking-wider text-slate-700 dark:text-slate-400 font-mono block">
                  {ins.type === "warning"
                    ? t.warningType
                    : ins.type === "success"
                      ? t.successType
                      : t.neutralType}
                </span>
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  {ins.title}
                </h4>
                <p className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-400">
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
