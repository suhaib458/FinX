import React, { useState } from "react";
import { 
  TrendingUp, 
  Scale, 
  Flame, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Coins, 
  BadgeHelp,
  ChevronDown,
  ChevronUp,
  Target,
  Car
} from "lucide-react";
import { translations } from "../translations";
import { FinancialAnalysis } from "../types";

interface HealthRatioProps {
  lang: "ar" | "en";
  analysis: FinancialAnalysis;
}

export default function HealthRatio({ lang, analysis }: HealthRatioProps) {
  const t = translations[lang];
  const isRtl = lang === "ar";
  const score = analysis.healthScore;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getScoreColor = (val: number) => {
    if (val >= 80) return "text-accent-green";
    if (val >= 60) return "text-accent-orange";
    return "text-rose-600 dark:text-rose-400";
  };

  const getScoreLabel = (val: number) => {
    if (val >= 85) return t.excellentState;
    if (val >= 70) return t.goodState;
    if (val >= 50) return t.fairState;
    return t.cautionState;
  };

  // Calculate dynamic metrics
  const savingsRate = Math.round(analysis.savingsRate);
  
  // Estimate debt ratio (assuming Housing & Bills or fixed expenses)
  const debtExpense = analysis.categories.find(c => c.name.includes("السكن") || c.name.toLowerCase().includes("housing"))?.value || (analysis.monthlyExpenses * 0.3);
  const debtRatio = analysis.monthlyIncome > 0 ? Math.round((debtExpense / analysis.monthlyIncome) * 100) : 0;
  
  // Goal Progress logic (Based on savings target)
  const goalTarget = analysis.monthlyIncome * 0.2; // 20% target
  const goalProgress = goalTarget > 0 ? Math.min(100, Math.round(((analysis.monthlyIncome - analysis.monthlyExpenses) / goalTarget) * 100)) : 0;
  
  // Spending profile
  const discretionaryExpense = analysis.categories.find(c => c.name.includes("التسوق") || c.name.toLowerCase().includes("shopping"))?.value || (analysis.monthlyExpenses * 0.2);
  const spendingRatio = analysis.monthlyIncome > 0 ? Math.round((discretionaryExpense / analysis.monthlyIncome) * 100) : 0;

  // Matrix categories
  const breakdownElements = [
    {
      id: "savings",
      title: isRtl ? "مؤشر الادخار" : "Savings Score",
      desc: isRtl ? "يقيس مدى قدرتك على الاحتفاظ بجزء من دخلك كمدخرات شهرية مستدامة." : "Measures your ability to retain a portion of your income as sustainable monthly savings.",
      icon: <TrendingUp className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />,
      rating: `${savingsRate}%`,
      progress: Math.min(100, savingsRate * 3), // Visual scale multiplier
      stateColor: savingsRate >= 20 ? "bg-emerald-500/10 text-accent-green border-emerald-500/20" : savingsRate >= 10 ? "bg-amber-500/10 text-accent-orange border-amber-500/20" : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      statusText: savingsRate >= 20 ? (isRtl ? "مستدام" : "Excellent") : savingsRate >= 10 ? (isRtl ? "جيد" : "Moderate") : (isRtl ? "منخفض" : "Critical"),
    },
    {
      id: "debt",
      title: isRtl ? "مؤشر الديون" : "Debt Score",
      desc: isRtl ? "يعكس التزاماتك المالية الشهرية كنسبة مئوية من إجمالي الدخل." : "Reflects your fixed monthly financial commitments as a percentage of gross income.",
      icon: <Scale className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />,
      rating: `${debtRatio}%`,
      progress: Math.max(0, 100 - debtRatio), // Inverse visualization
      stateColor: debtRatio <= 25 ? "bg-emerald-500/10 text-accent-green border-emerald-500/20" : debtRatio <= 40 ? "bg-amber-500/10 text-accent-orange border-amber-500/20" : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      statusText: debtRatio <= 25 ? (isRtl ? "آمن تماماً" : "Fully Secure") : debtRatio <= 40 ? (isRtl ? "معتدل" : "Average") : (isRtl ? "مرتفع الديون" : "High Burden"),
    },
    {
      id: "discipline",
      title: isRtl ? "مؤشر الإنفاق" : "Spending Score",
      desc: isRtl ? "يقيم حجم نفقاتك الكمالية مقابل نفقاتك الأساسية ومدخراتك." : "Evaluates discretionary spending against baseline essential expenses and savings.",
      icon: <Flame className="w-4.5 h-4.5 text-rose-600 dark:text-rose-400" />,
      rating: `${spendingRatio}%`,
      progress: Math.max(0, 100 - (spendingRatio * 2)),
      stateColor: spendingRatio <= 15 ? "bg-emerald-500/10 text-accent-green border-emerald-500/20" : spendingRatio <= 30 ? "bg-amber-500/10 text-accent-orange border-amber-500/20" : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      statusText: spendingRatio <= 15 ? (isRtl ? "منضبط" : "Disciplined") : spendingRatio <= 30 ? (isRtl ? "شبه منفلت" : "Emotional") : (isRtl ? "استهلاك مفرط" : "Overspending"),
    }
  ];

  return (
    <div 
      className={`flex-1 overflow-y-auto px-4 py-5 space-y-5 ${isRtl ? 'text-right' : 'text-left'}`}
    >
      {/* Title bar */}
      <div>
        <p className="text-[10px] tracking-wider text-text-primary dark:text-text-secondary uppercase font-mono">
          {isRtl ? "تفاصيل وتصنيف النتيجة" : "FINANCIAL SCORE DECODED"}
        </p>
        <h2 className={`text-xl font-bold text-slate-900 dark:text-zinc-100 ${isRtl ? 'font-arabic' : 'font-sans'}`}>
          {t.detailedAnalysis}
        </h2>
      </div>

      {/* Big Interactive Arc score Dial */}
      <div className="relative overflow-hidden rounded-3xl bg-surface-primary/50 p-6 border border-border-primary text-center flex flex-col items-center">
        <div className="absolute top-0 left-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>

        {/* Large Score Indicator Circle */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 128 128">
            <circle
              cx="64"
              cy="64"
              r="52"
              className="text-slate-800/60"
              strokeWidth="7"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="64"
              cy="64"
              r="52"
              className={score >= 80 ? "text-indigo-500" : score >= 60 ? "text-accent-orange" : "text-rose-600 dark:text-rose-400"}
              strokeWidth="8"
              strokeDasharray={326}
              strokeDashoffset={326 - (326 * score) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          
          {/* Text labels inside Circle */}
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-0.5 mt-1">
            <span className="text-3xl font-black font-mono text-text-primary leading-none">
              {score}
            </span>
            <span className="text-[10px] text-zinc-400 tracking-wider font-mono">
              / 100
            </span>
          </div>
        </div>

        {/* Breakdown detail feedback */}
        <div className="mt-4 space-y-1">
          <h3 className={`text-base font-bold ${getScoreColor(score)}`}>
            {getScoreLabel(score)}
          </h3>
          <p className="text-[11px] text-text-primary leading-relaxed max-w-xs">
            {analysis.scoreExplanation}
          </p>
        </div>
      </div>

      {/* Health Evaluation Matrix (Detailed Grid) */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
          {t.analysisCategoryTitle}
        </h3>
        <div className="space-y-2">
          {breakdownElements.map((el) => {
            const isExpanded = expandedId === el.id;
            return (
              <div 
                key={el.id}
                onClick={() => setExpandedId(isExpanded ? null : el.id)}
                className="bg-surface-primary/50 border border-border-primary rounded-xl overflow-hidden cursor-pointer hover:border-indigo-500/20 transition-all duration-300"
              >
                {/* Header Line */}
                <div className="p-3.5 flex items-center justify-between gap-3.5 relative">
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-950 flex items-center justify-center border border-slate-850 shrink-0">
                      {el.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center w-full mb-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{el.title}</h4>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${el.stateColor}`}>
                          {el.statusText}
                        </span>
                      </div>
                      
                      {/* Metric & Progress Bar */}
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] text-text-primary dark:text-text-secondary font-mono font-bold w-8 text-right shrink-0">
                          {el.rating}
                        </p>
                        <div className="h-1.5 flex-1 bg-bg-secondary rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${el.progress >= 80 ? 'bg-emerald-500' : el.progress >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                            style={{ width: `${Math.min(100, Math.max(0, el.progress))}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center shrink-0 ml-2">
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-text-primary dark:text-text-secondary hover:text-text-primary dark:hover:text-text-primary" /> : <ChevronDown className="w-4 h-4 text-text-primary dark:text-text-secondary hover:text-text-primary dark:hover:text-text-primary" />}
                  </div>
                </div>

                {/* Expanded Description panel */}
                {isExpanded && (
                  <div className="px-3.5 pb-4.5 pt-1.5 border-t border-slate-950 bg-slate-950/45 text-[11px] text-text-primary dark:text-text-secondary leading-relaxed font-sans">
                    {el.desc}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
