import React, { useState, useEffect } from "react";
import { 
  Car, 
  Briefcase, 
  Heart, 
  Coins, 
  Landmark, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  TrendingUp,
  Info,
  CalendarDays
} from "lucide-react";
import { translations } from "../translations";
import { FinancialAnalysis, SimulationScenario } from "../types";
import { getAccessToken, googleSignIn } from "../lib/auth";

interface SimulatorProps {
  lang: "ar" | "en";
  analysis: FinancialAnalysis;
}

export default function Simulator({ lang, analysis }: SimulatorProps) {
  const t = translations[lang];
  const isRtl = lang === "ar";

  // Available Scenarios list
  const scenarios: SimulationScenario[] = [
    { id: "save", type: "business", titleAr: "توفير أكثر", titleEn: "Save More", iconName: "business", defaultValue: 100, min: 50, max: 1000, step: 50, unitAr: "د.أ شهرياً", unitEn: "JOD/mo" },
    { id: "loan", type: "loan", titleAr: "أخذ قرض", titleEn: "Take a Loan", iconName: "loan", defaultValue: 5000, min: 1000, max: 30000, step: 1000, unitAr: "د.أ", unitEn: "JOD" },
    { id: "car", type: "car", titleAr: "شراء سيارة", titleEn: "Buy a Car", iconName: "car", defaultValue: 3000, min: 1000, max: 15000, step: 500, unitAr: "د.أ", unitEn: "JOD" },
    { id: "investment", type: "investment", titleAr: "بدء استثمار", titleEn: "Start Investing", iconName: "investment", defaultValue: 150, min: 50, max: 1500, step: 50, unitAr: "د.أ شهرياً", unitEn: "JOD/mo" }
  ];

  const [activeScenarioId, setActiveScenarioId] = useState("save");
  const activeScenario = scenarios.find(s => s.id === activeScenarioId)!;

  // Custom configuration states for sliders
  const [downpayment, setDownpayment] = useState(activeScenario.defaultValue);
  const [monthlyInstallment, setMonthlyInstallment] = useState(120);
  const [durationYears, setDurationYears] = useState(3);
  const [addingToCalendar, setAddingToCalendar] = useState(false);
  const [calendarSuccess, setCalendarSuccess] = useState(false);

  const handleSaveToCalendar = async () => {
    let token = await getAccessToken();
    if (!token) {
      const result = await googleSignIn();
      if (!result) return;
      token = result.accessToken;
    }

    try {
      setAddingToCalendar(true);
      const scenLabel = isRtl ? activeScenario.titleAr : activeScenario.titleEn;
      
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + durationYears);
      
      const event = {
        summary: isRtl ? `هدف مالي: ${scenLabel}` : `Financial Goal: ${scenLabel}`,
        description: isRtl 
          ? `دفعة: ${downpayment} د.أ\nقسط: ${monthlyInstallment} د.أ/شهر\nمدة: ${durationYears} سنوات.` 
          : `Downpayment: ${downpayment} JOD\nMonthly: ${monthlyInstallment} JOD\nDuration: ${durationYears} years.`,
        start: {
          date: futureDate.toISOString().split('T')[0],
        },
        end: {
          date: futureDate.toISOString().split('T')[0],
        }
      };

      const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      });

      if (res.ok) {
        setCalendarSuccess(true);
        setTimeout(() => setCalendarSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingToCalendar(false);
    }
  };

  // Sync state values when active scenario is updated
  useEffect(() => {
    setDownpayment(activeScenario.defaultValue);
    if (activeScenarioId === "investment" || activeScenarioId === "save") {
      setMonthlyInstallment(activeScenario.defaultValue);
      setDurationYears(activeScenarioId === "save" ? 2 : 5);
    } else if (activeScenarioId === "loan") {
      setMonthlyInstallment(150);
      setDurationYears(4);
    } else {
      setMonthlyInstallment(125);
      setDurationYears(3);
    }
  }, [activeScenarioId]);

  // Current budget bounds
  const income = analysis.monthlyIncome;
  const expense = analysis.monthlyExpenses;
  const currentSavingsAccumulated = 2400; // Simulated current backup savings pool
  const currentMonthlyNetBuffer = income - expense;

  // Compute dynamic mathematical outcomes
  let year1Proj = currentSavingsAccumulated;
  let year3Proj = currentSavingsAccumulated;
  let year5Proj = currentSavingsAccumulated;
  let simulatedScore = analysis.healthScore;
  let feasibility: "perfect" | "warning" | "dangerous" = "perfect";

  if (activeScenarioId === "investment" || activeScenarioId === "save") {
    // Investment/Save accumulates (Save 4%, Invest 8%)
    const annualRate = activeScenarioId === "investment" ? 0.08 : 0.04;
    const monthlyRate = annualRate / 12;

    const computeCompound = (months: number) => {
      let principal = currentSavingsAccumulated; // No downpayment cost for save/invest, just starts
      let balance = principal * Math.pow(1 + monthlyRate, months);
      
      // Monthly savings buffer * months
      for (let m = 1; m <= months; m++) {
        // user puts monthlyInstallment + regular saving leftovers
        const regularLeftovers = currentMonthlyNetBuffer - monthlyInstallment;
        const add = regularLeftovers > 0 ? regularLeftovers : 0;
        
        balance = balance * (1 + monthlyRate) + (monthlyInstallment + add);
      }
      return Math.round(balance);
    };

    year1Proj = computeCompound(12);
    year3Proj = computeCompound(36);
    year5Proj = computeCompound(60);

    // Investment boosts score
    const bonus = Math.round(monthlyInstallment / 30) + 4;
    simulatedScore = Math.min(100, analysis.healthScore + bonus);
    feasibility = "perfect";

  } else {
    // Normal spending / Debt scenarios
    const upfrontCost = activeScenarioId === "loan" ? -downpayment * 0.02 : downpayment; // small fee for loan, huge for others
    const monthlyDrain = monthlyInstallment;

    const computeSpend = (months: number) => {
      let balance = currentSavingsAccumulated;
      if (activeScenarioId === "loan") {
        balance += downpayment; // Added loaned lump sum to balance
      } else {
        balance -= upfrontCost; // Spent upfront capital
      }

      // Add monthly inflows and subtract drains
      for (let m = 1; m <= months; m++) {
        balance = balance + currentMonthlyNetBuffer - monthlyDrain;
      }
      return Math.round(balance);
    };

    year1Proj = computeSpend(12);
    year3Proj = computeSpend(36);
    year5Proj = computeSpend(60);

    // Compute feasibility and score delta
    const installmentImpactPct = income > 0 ? (monthlyDrain / income) * 100 : 0;
    
    if (installmentImpactPct > 40 || year1Proj < 0) {
      feasibility = "dangerous";
      simulatedScore = Math.max(15, analysis.healthScore - 25);
    } else if (installmentImpactPct > 22 || year3Proj < 1000) {
      feasibility = "warning";
      simulatedScore = Math.max(30, analysis.healthScore - 12);
    } else {
      feasibility = "perfect";
      simulatedScore = Math.min(98, analysis.healthScore - 2);
    }
  }

  // Compute simulated savings rate
  const baseSavingsRate = analysis.savingsRate;
  let simulatedSavingsRate = baseSavingsRate;
  if (activeScenarioId === "investment") {
    // Investing doesn't reduce income vs expense, but technically "savings rate" to an investment is still "saving" or shifting allocation. 
    // Usually investment counts as good savings. Let's just boost it slightly or keep it.
    const addedSavingsRate = income > 0 ? (monthlyInstallment / income) * 100 : 0;
    simulatedSavingsRate = Math.min(99, baseSavingsRate + (addedSavingsRate * 0.5));
  } else {
    // Adding debt reduces the real savings rate
    const addedExpenseRate = income > 0 ? (monthlyInstallment / income) * 100 : 0;
    simulatedSavingsRate = Math.max(0, baseSavingsRate - addedExpenseRate);
  }

  // Choose icon representation helper
  const renderScenarioIcon = (type: string, active: boolean) => {
    const cls = `w-5 h-5 ${active ? "text-white" : "text-slate-400"}`;
    switch (type) {
      case "car": return <Car className={cls} />;
      case "business": return <Briefcase className={cls} />;
      case "marriage": return <Heart className={cls} />;
      case "investment": return <Coins className={cls} />;
      case "loan": return <Landmark className={cls} />;
      default: return <Coins className={cls} />;
    }
  };

  const getScenarioLabel = (id: string) => {
    const sc = scenarios.find(s => s.id === id);
    if (!sc) return "";
    return isRtl ? sc.titleAr : sc.titleEn;
  };

  return (
    <div 
      className="flex-1 overflow-y-auto px-4 py-5 space-y-5"
      style={{ direction: isRtl ? "rtl" : "ltr" }}
    >
      {/* Page Header */}
      <div>
        <p className="text-[10px] tracking-wider text-slate-400 uppercase font-mono">
          {isRtl ? "محاكاة خيارات ميزانيتك" : "DECISION SIMULATION SANDBOX"}
        </p>
        <h2 className={`text-xl font-bold text-zinc-100 ${isRtl ? 'font-arabic' : 'font-sans'}`}>
          {t.scenarioSimulator}
        </h2>
        <p className="text-[11px] text-slate-400 mt-1">
          {t.scenarioDesc}
        </p>
      </div>

      {/* 1. Pick scenario tab list */}
      <div className="space-y-2">
        <label className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wide">
          {t.selectScenario}
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {scenarios.map((sc) => {
            const isActive = sc.id === activeScenarioId;
            return (
              <button
                key={sc.id}
                onClick={() => setActiveScenarioId(sc.id)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isActive 
                    ? "bg-gradient-to-tr from-indigo-600 to-blue-700 border-indigo-500 text-white scale-102 shadow-lg shadow-indigo-500/25" 
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                {renderScenarioIcon(sc.type, isActive)}
                <span className="text-[8px] md:text-[9px] font-bold mt-1.5 text-center leading-tight truncate w-full">
                  {isRtl ? sc.titleAr : sc.titleEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Configure sliders */}
      <div className="rounded-2xl p-5 bg-slate-900/50 border border-slate-800 space-y-4 hover:border-slate-700 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300">
        <label className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-wide block border-b border-slate-800/60 pb-1.5 mb-1">
          {t.configureDecision} — {getScenarioLabel(activeScenarioId)}
        </label>

        {/* Dynamic primary Downpayment / upfront cash slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">
              {activeScenarioId === "investment" || activeScenarioId === "save" ? (isRtl ? "المبلغ الأولي المبدئي:" : "Initial Base Amount:") : activeScenarioId === "loan" ? (isRtl ? "مبلغ التمويل المقترح:" : "Principal Loan Amount:") : (isRtl ? "الدفعة النقدية الأولى الكاش:" : "Downpayment Cash:")}
            </span>
            <span className="font-bold text-indigo-400 font-mono">
              {downpayment.toLocaleString()} JOD
            </span>
          </div>
          <input
            type="range"
            min={activeScenario.min}
            max={activeScenario.max}
            step={activeScenario.step}
            value={downpayment}
            onChange={(e) => setDownpayment(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <span className="text-[9px] text-slate-500 block">
            {activeScenario.min.toLocaleString()} — {activeScenario.max.toLocaleString()} {isRtl ? "د.أ" : "JOD"}
          </span>
        </div>

        {/* Monthly commitment installment slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">
              {activeScenarioId === "investment" || activeScenarioId === "save" ? (isRtl ? "مبلغ الاستقطاع الشهري:" : "Monthly saving/investing:") : (isRtl ? "القسط الشهري الملتزم به:" : "Monthly Budget Commitment:")}
            </span>
            <span className="font-bold text-indigo-400 font-mono">
              {monthlyInstallment.toLocaleString()} {isRtl ? "د.أ/شهر" : "JOD/mo"}
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={1500}
            step={10}
            value={monthlyInstallment}
            onChange={(e) => setMonthlyInstallment(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
          />
          <div className="flex justify-between text-[9px] text-slate-500">
            <span>10 {isRtl ? "د.أ" : "JOD"}</span>
            <span className="text-[#818cf8]">
              {isRtl ? "تأثير شهري" : "Monthly commitment"}
            </span>
            <span>1500 {isRtl ? "د.أ" : "JOD"}</span>
          </div>
        </div>

        {/* Duration / Repayment term Years slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">
              {activeScenarioId === "investment" ? (isRtl ? "أفق خطة الاستثمار:" : "Investment horizon:") : (isRtl ? "فترة سداد الأقساط (سنوات):" : "Term amortisation duration:")}
            </span>
            <span className="font-bold text-indigo-400 font-mono">
              {durationYears} {durationYears === 1 ? (isRtl ? "سنة واحدة" : "Year") : (isRtl ? "سنوات" : "Years")}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={durationYears}
            onChange={(e) => setDurationYears(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <span className="text-[9px] text-slate-500 block">
            1 — 10 {isRtl ? "سنوات سداد" : "Years timeline"}
          </span>
        </div>
      </div>

      {/* 3. Timeline results & Forecast Bars */}
      <div className="rounded-2xl p-4 bg-slate-900/55 border border-slate-800 space-y-4">
        <label className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wide block">
          {t.timelineResults}
        </label>

        {/* Dynamic bar charts */}
        <div className="space-y-3 pt-1">
          {/* year 1 progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-300">{t.shortTerm}</span>
              <span className={`font-mono ${year1Proj >= 0 ? "text-indigo-400" : "text-rose-400"}`}>
                {year1Proj.toLocaleString()} JOD
              </span>
            </div>
            {/* Visual Bar line */}
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden relative">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${year1Proj >= 0 ? "bg-gradient-to-r from-indigo-500 to-blue-600 shadow-[0_0_8px_rgba(99,102,241,0.4)]" : "bg-rose-500"}`}
                style={{ width: `${Math.min(100, Math.max(8, (Math.abs(year1Proj) / 12000) * 100))}%` }}
              />
            </div>
          </div>

          {/* year 3 progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-300">{t.mediumTerm}</span>
              <span className={`font-mono ${year3Proj >= 0 ? "text-indigo-400" : "text-rose-400"}`}>
                {year3Proj.toLocaleString()} JOD
              </span>
            </div>
            {/* Visual Bar line */}
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden relative">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${year3Proj >= 0 ? "bg-gradient-to-r from-indigo-500 to-blue-600 shadow-[0_0_8px_rgba(99,102,241,0.4)]" : "bg-rose-500"}`}
                style={{ width: `${Math.min(100, Math.max(8, (Math.abs(year3Proj) / 25000) * 100))}%` }}
              />
            </div>
          </div>

          {/* year 5 progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-300">{t.longTerm}</span>
              <span className={`font-mono ${year5Proj >= 0 ? "text-indigo-400" : "text-rose-400"}`}>
                {year5Proj.toLocaleString()} JOD
              </span>
            </div>
            {/* Visual Bar line */}
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden relative">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${year5Proj >= 0 ? "bg-gradient-to-r from-indigo-500 to-blue-600 shadow-[0_0_8px_rgba(99,102,241,0.4)]" : "bg-rose-500"}`}
                style={{ width: `${Math.min(100, Math.max(8, (Math.abs(year5Proj) / 35000) * 100))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Dynamic score changes & Advice Certificate stamp */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2">
          
          {/* Before vs After details */}
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">{isRtl ? "معدل الادخار الشهري المتبقى:" : "Revised Savings Rate:"}</span>
            <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-850">
              <span className="text-[10px] text-slate-500 font-mono">
                {baseSavingsRate.toFixed(1)}% ➔
              </span>
              <span className={`font-bold font-mono ${simulatedSavingsRate >= 20 ? "text-indigo-400" : simulatedSavingsRate >= 5 ? "text-amber-400" : "text-rose-400"}`}>
                {simulatedSavingsRate.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">{t.impactOnScore}</span>
            <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-850">
              <span className="text-[10px] text-slate-500 font-mono">
                {analysis.healthScore} ➔
              </span>
              <span className={`font-bold font-mono ${simulatedScore >= 80 ? "text-indigo-400" : simulatedScore >= 60 ? "text-amber-400" : "text-rose-400"}`}>
                {simulatedScore}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] text-slate-500 block">
              {t.decisionFeasibility}
            </span>

            {feasibility === "perfect" ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex gap-2.5 items-start">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-emerald-300 font-medium leading-relaxed">
                  {t.feasiblePerfect} {activeScenarioId === "investment" && (isRtl ? "هذه الخطوة تساهم مباشرة في تعجيل وصولك للحرية المالية." : "This strategy significantly builds emergency buffers.")}
                </p>
              </div>
            ) : feasibility === "warning" ? (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-2.5 items-start">
                <AlertTriangle className="w-4.5 h-4.5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-300 font-medium leading-relaxed">
                  {t.feasibleWarning} {isRtl ? "احرص على ألا تلتهم الديون أكثر من ثلث رصيدك الفائض تجنباً للضغوط المعيشية المفاجئة." : "Ensure recurring installments never exceed 30% of your left-over cushion."}
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex gap-2.5 items-start">
                <XCircle className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-rose-300 font-medium leading-relaxed">
                  {t.feasibleDangerous} {isRtl ? "نفقات هذا القرار المضاف تهدد استقرارك برصيد بنكي مكشوف قريباً! لا ينصح به." : "This commitment will deplete your liquidity and might lead to chronic debt cycles soon."}
                </p>
              </div>
            )}
          </div>
          
          <div className="mt-3 flex items-center justify-end">
            <button
              onClick={handleSaveToCalendar}
              disabled={addingToCalendar || feasibility === "dangerous"}
              className={`text-xs px-4 py-2 flex items-center gap-2 rounded-xl transition-all cursor-pointer font-bold ${calendarSuccess ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"}`}
            >
              {calendarSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {isRtl ? "تم الحفظ بنجاح!" : "Saved to Calendar!"}
                </>
              ) : (
                <>
                  <CalendarDays className="w-4 h-4 text-indigo-400" />
                  {isRtl ? "تحديد كهدف في تقويم جوجل" : "Set Goal in Google Calendar"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
