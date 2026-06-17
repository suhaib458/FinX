import React, { useState, useEffect } from "react";
import { 
  Home, 
  BrainCircuit, 
  TrendingUp, 
  Gauge, 
  FileText, 
  Settings as SettingsIcon,
  Languages,
  Sparkles
} from "lucide-react";

import DeviceShell from "./components/DeviceShell";
import Onboarding from "./components/Onboarding";
import Dashboard from "./components/Dashboard";
import AICoach from "./components/AICoach";
import Simulator from "./components/Simulator";
import HealthRatio from "./components/HealthRatio";
import StatementParser from "./components/StatementParser";
import SettingsTab from "./components/SettingsTab";

import { translations } from "./translations";
import { FinancialAnalysis, ChatMessage, Transaction, SpendingCategory } from "./types";
import { 
  perfectProfile, 
  perfectProfileEnglish, 
  debtProfile, 
  debtProfileEnglish 
} from "./profiles";

export default function App() {
  // 1. Language State
  const [lang, setLang] = useState<"ar" | "en">(() => {
    const saved = localStorage.getItem("finx_language");
    return (saved === "ar" || saved === "en") ? saved : "ar";
  });

  // 2. Onboarding Slide State
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    const saved = localStorage.getItem("finx_onboarding_dismissed");
    return saved !== "true";
  });

  // 3. Navigation State
  const [activeTab, setActiveTab] = useState<"home" | "coach" | "simulation" | "healthScore" | "upload" | "settings">("home");

  // 4. Demo Profile Engine State
  const [profileType, setProfileType] = useState<"balanced" | "debt">("balanced");

  // 5. Consolidated Financial Analysis State
  const [analysis, setAnalysis] = useState<FinancialAnalysis>(perfectProfile);

  // 6. Conversational chat history state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // Track preferences across language swaps
  useEffect(() => {
    localStorage.setItem("finx_language", lang);
    
    // Choose the appropriate profile template centered on local language
    if (profileType === "balanced") {
      setAnalysis(lang === "ar" ? perfectProfile : perfectProfileEnglish);
    } else {
      setAnalysis(lang === "ar" ? debtProfile : debtProfileEnglish);
    }
  }, [lang, profileType]);

  // Handle onboarding status
  const completeOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem("finx_onboarding_dismissed", "true");
  };

  const resetOnboarding = () => {
    setShowOnboarding(true);
    localStorage.removeItem("finx_onboarding_dismissed");
  };

  // Re-populate system welcome greeting on chat startup or language shift
  useEffect(() => {
    const welcomeText = translations[lang].chatGreeting;
    setChatHistory([
      {
        id: "greet",
        role: "assistant",
        content: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  }, [lang]);

  // Dynamic Transaction Additions (Recalculates totals & scores instantly!)
  const handleAddTransaction = (newTx: Transaction) => {
    setAnalysis((prev) => {
      // Append item to existing stack
      const updatedTxList = [newTx, ...prev.transactions];

      // Re-evaluate monthly aggregate sums
      let calculatedIncome = 0;
      let calculatedExpenses = 0;

      updatedTxList.forEach((item) => {
        if (item.amount > 0) {
          calculatedIncome += item.amount;
        } else {
          calculatedExpenses += Math.abs(item.amount);
        }
      });

      // Recalculate savings percentage
      const newSavingsLeft = calculatedIncome - calculatedExpenses;
      const newSavingsRate = calculatedIncome > 0 ? (newSavingsLeft / calculatedIncome) * 100 : 0;

      // Dynamically refine scores
      let finalScore = prev.healthScore;
      if (newTx.amount < 0) {
        // Reduced score slightly for debit expenses
        finalScore = Math.max(10, finalScore - Math.round(Math.abs(newTx.amount) / 400));
      } else {
        // Boosted score for inflows
        finalScore = Math.min(100, finalScore + Math.round(newTx.amount / 500));
      }

      // Automatically assign transaction values to category list
      const updatedCategories = [...prev.categories];
      const matchCat = updatedCategories.find(c => c.name === newTx.category);
      if (matchCat && newTx.amount < 0) {
        matchCat.value += Math.abs(newTx.amount);
      } else if (!matchCat && newTx.amount < 0) {
        updatedCategories.push({
          name: newTx.category,
          value: Math.abs(newTx.amount),
          color: "#0891B2"
        });
      }

      return {
        ...prev,
        monthlyIncome: calculatedIncome,
        monthlyExpenses: calculatedExpenses,
        savingsRate: newSavingsRate,
        healthScore: finalScore,
        transactions: updatedTxList,
        categories: updatedCategories,
      };
    });
  };

  // Clear transactional files history
  const handleClearTransactions = () => {
    const baseProfile = profileType === "balanced"
      ? (lang === "ar" ? perfectProfile : perfectProfileEnglish)
      : (lang === "ar" ? debtProfile : debtProfileEnglish);
    
    setAnalysis(baseProfile);
  };

  // Switch demo account profiles elegantly
  const handleLoadProfile = (type: "balanced" | "debt") => {
    setProfileType(type);
    if (type === "balanced") {
      setAnalysis(lang === "ar" ? perfectProfile : perfectProfileEnglish);
    } else {
      setAnalysis(lang === "ar" ? debtProfile : debtProfileEnglish);
    }
  };

  // Render proper screen tab view
  const renderActiveScreen = () => {
    switch (activeTab) {
      case "home":
        return <Dashboard lang={lang} analysis={analysis} setActiveTab={setActiveTab} />;
      case "coach":
        return <AICoach lang={lang} messages={chatHistory} setMessages={setChatHistory} analysis={analysis} />;
      case "simulation":
        return <Simulator lang={lang} analysis={analysis} />;
      case "healthScore":
        return <HealthRatio lang={lang} analysis={analysis} />;
      case "upload":
        return (
          <StatementParser 
            lang={lang} 
            transactions={analysis.transactions} 
            onAddTransaction={handleAddTransaction}
            onClearTransactions={handleClearTransactions}
            onUpdateAnalysis={setAnalysis}
          />
        );
      case "settings":
        return (
          <SettingsTab 
            lang={lang} 
            setLang={setLang} 
            activeProfileName={profileType} 
            onLoadProfile={handleLoadProfile}
            onResetOnboarding={resetOnboarding}
          />
        );
      default:
        return <Dashboard lang={lang} analysis={analysis} setActiveTab={setActiveTab} />;
    }
  };

  const isRtl = lang === "ar";
  const t = translations[lang];

  // If in onboarding mood, render exclusively
  if (showOnboarding) {
    return (
      <DeviceShell lang={lang}>
        <Onboarding lang={lang} onComplete={completeOnboarding} />
      </DeviceShell>
    );
  }

  // Common navigation bar metadata items
  const tabs = [
    { id: "home", label: t.home, icon: <Home className="w-5 h-5" /> },
    { id: "upload", label: t.transactionsHistory || t.upload, icon: <FileText className="w-5 h-5" /> },
    { id: "simulation", label: t.simulation, icon: <TrendingUp className="w-5 h-5" /> },
    { id: "coach", label: t.coach, icon: <BrainCircuit className="w-5 h-5" /> },
  ] as const;

  return (
    <DeviceShell lang={lang}>
      
      {/* Dynamic Header bar */}
      <div 
        className="px-4 py-3 bg-[#020617] border-b border-slate-800 flex items-center justify-between shrink-0 select-none"
        style={{ direction: isRtl ? "rtl" : "ltr" }}
      >
        <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setActiveTab("home")}>
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-blue-700 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-white text-xs font-black font-sans">FX</span>
          </div>
          <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-wider">
            {t.appName}
          </span>
        </div>

        {/* Global actions: Language cap, Profile badge, Quick triggers */}
        <div className="flex items-center gap-2">
          {/* Active Profile color indicator */}
          <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${profileType === "balanced" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"}`}>
            {profileType === "balanced" ? (isRtl ? "رصيد متزن" : "Balanced") : (isRtl ? "ديون زائدة" : "High Debt")}
          </span>

          {/* Quick toggle directly on top header */}
          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors uppercase font-mono"
          >
            <Languages className="w-3 h-3 text-indigo-400" />
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
          >
            <SettingsIcon className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Main active route scroll screen container */}
      <div className="flex-1 overflow-hidden flex flex-col relative bg-gradient-to-b from-[#020617] via-slate-900 to-slate-950">
        {renderActiveScreen()}
      </div>

      {/* Structured Bottom Navigation dock */}
      <div 
        className="bg-[#020617] border-t border-slate-800 text-slate-100 py-1.5 px-2 shrink-0 select-none pb-safe"
        style={{ direction: isRtl ? "rtl" : "ltr" }}
      >
        <nav className="grid grid-cols-4 gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-2 rounded-xl transition-all cursor-pointer ${
                  isActive 
                    ? "text-indigo-400 bg-[#0f172a]/40 shadow-inner font-extrabold" 
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <div className={`transition-transform duration-300 ${isActive ? "scale-105 text-indigo-400" : ""}`}>
                  {tab.icon}
                </div>
                <span className={`text-[8.5px] mt-1 text-center font-medium block truncate w-full ${isRtl ? "font-arabic" : ""}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-0.5 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

    </DeviceShell>
  );
}
