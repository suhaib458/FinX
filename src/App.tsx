import React, { useState, useEffect } from "react";
import { 
  Home, 
  BrainCircuit, 
  TrendingUp, 
  Gauge, 
  FileText, 
  Settings as SettingsIcon,
  Languages,
  Sparkles,
  PlayCircle,
  LogOut,
  NotebookText,
  Briefcase,
  ScanLine,
  Building2
} from "lucide-react";

import DeviceShell from "./components/DeviceShell";
import Onboarding from "./components/Onboarding";
import Dashboard from "./components/Dashboard";
import AICoach from "./components/AICoach";
import Simulator from "./components/Simulator";
import HealthRatio from "./components/HealthRatio";
import StatementParser from "./components/StatementParser";
import SettingsTab from "./components/SettingsTab";
import LaunchVideo from "./components/LaunchVideo";
import WelcomeScreen from "./components/WelcomeScreen";
import Auth from "./components/Auth";
import Avatar from "./components/Avatar";

import { auth } from "./lib/firebase";
import { onAuthStateChanged, User, signOut } from "firebase/auth";

import FinancialNotes from "./components/FinancialNotes";
import ServicesTab from "./components/ServicesTab";
import MagneticWrapper from "./components/MagneticWrapper";
import Header from "./components/Header";
import NashmiProTab from "./components/NashmiProTab";
import RewardsTab from "./components/RewardsTab";
import WorkspaceCalendar from "./components/WorkspaceCalendar";
import WorkspaceChat from "./components/WorkspaceChat";
import CareerProfileScreen from "./components/CareerProfileScreen";
import AIInterviewSimulator from "./components/AIInterviewSimulator";
import ProjectsTab from "./components/ProjectsTab";
import NotificationCenter from "./components/NotificationCenter";
import { getFinancialProfile, saveFinancialProfile } from "./lib/finance";
import { translations } from "./translations";
import { FinancialAnalysis, ChatMessage, Transaction, SpendingCategory } from "./types";
import { 
  perfectProfile, 
  perfectProfileEnglish, 
  debtProfile, 
  debtProfileEnglish 
} from "./profiles";

import { RewardsService, RewardProfile } from "./lib/rewards";

export default function App() {
  // Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Rewards Engine State
  const [rewardProfile, setRewardProfile] = useState<RewardProfile>({
    points: 0,
    lifetimePoints: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: '',
    achievements: []
  });

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
  const [activeTab, setActiveTab] = useState<"home" | "coach" | "simulation" | "healthScore" | "upload" | "settings" | "notes" | "nashmiPro" | "rewards" | "services" | "calendar" | "chat" | "projects" | "careerProfile" | "interviewSimulator" | "notifications">("home");

  // 5. Consolidated Financial Analysis State
  const [analysis, setAnalysis] = useState<FinancialAnalysis>(perfectProfile);

  // 6. Conversational chat history state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [activeCoachChatId, setActiveCoachChatId] = useState<string | null>(null);
  const [pendingCoachPrompt, setPendingCoachPrompt] = useState<string | null>(null);


  // 7. Cinematic Launch Video State
  const [showLaunchVideo, setShowLaunchVideo] = useState<boolean>(false);
  const [showWelcome, setShowWelcome] = useState<boolean>(false);

  // 8. Engagement & Pro State
  const [isPro, setIsPro] = useState<boolean>(() => {
    return localStorage.getItem("finx_pro_status") === "true";
  });
  const addPoints = async (amount: number, reason: string = "App engagement") => {
    if (!user) return;
    await RewardsService.awardPoints(user.uid, amount, isPro, reason);
  };

  // Track Firebase Auth State
  useEffect(() => {
    let unsubProfile: (() => void) | undefined;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const profile = await RewardsService.initializeProfile(currentUser.uid);
          const { streakUpdated, newStreak } = await RewardsService.processDailyStreak(currentUser.uid, profile);
          
          const finProfile = await getFinancialProfile(currentUser.uid);
          if (finProfile) {
            setAnalysis(finProfile);
          }

          if (streakUpdated && newStreak >= 7) {
             await RewardsService.unlockAchievement(currentUser.uid, "7_day_streak", "7-Day Streak", 50, isPro);
          }

          unsubProfile = RewardsService.subscribeToProfile(currentUser.uid, (data) => {
            setRewardProfile(data);
          });
          
          if (!sessionStorage.getItem("finx_welcome_shown")) {
            setShowWelcome(true);
            sessionStorage.setItem("finx_welcome_shown", "true");
          }
        } catch (e) {
          console.error("Error setting up Rewards ecosystem:", e);
        }
      } else {
        setActiveTab("home");
        if (unsubProfile) unsubProfile();
      }

      setAuthChecking(false);
    });
    
    return () => {
      unsubscribe();
      if (unsubProfile) unsubProfile();
    };
  }, [isPro]);

  // Auto-save Financial Profile when it changes
  useEffect(() => {
    if (user && analysis && analysis.monthlyIncome > 0) {
      saveFinancialProfile(user.uid, analysis);
    }
  }, [analysis, user]);

  const handleLogout = async () => {
    sessionStorage.removeItem("finx_welcome_shown");
    setActiveTab("home");
    await signOut(auth);
  };

  // Track preferences across language swaps
  useEffect(() => {
    localStorage.setItem("finx_language", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = 'ltr'; // FORCE LTR layout at the root level

    // Choose the appropriate profile template centered on local language
    setAnalysis(lang === "ar" ? perfectProfile : perfectProfileEnglish);
  }, [lang]);

  // Handle onboarding status
  const completeOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem("finx_onboarding_dismissed", "true");
    setActiveTab("home");
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
    setAnalysis(lang === "ar" ? perfectProfile : perfectProfileEnglish);
  };

  const handleUpdateTransactionCategory = (index: number, newCategory: string) => {
    setAnalysis(prev => {
      const newTransactions = [...prev.transactions];
      newTransactions[index].category = newCategory;
      return { ...prev, transactions: newTransactions };
    });
  };

  // Render proper screen tab view
  const renderActiveScreen = () => {
    switch (activeTab) {
      case "projects":
        return <ProjectsTab lang={lang} user={user} />;
      case "home":
        return <Dashboard lang={lang} analysis={analysis} setActiveTab={setActiveTab} />;
      case "coach":
        return <AICoach 
                 lang={lang} 
                 messages={chatHistory} 
                 setMessages={setChatHistory} 
                 activeConversationId={activeCoachChatId} 
                 setActiveConversationId={setActiveCoachChatId} 
                 analysis={analysis} 
                 onAction={() => addPoints(10)} 
                 pendingPrompt={pendingCoachPrompt}
                 clearPendingPrompt={() => setPendingCoachPrompt(null)}
               />;
      case "notes":
        return <FinancialNotes 
           lang={lang} 
           onSendToCoach={(prompt: string) => {
             setPendingCoachPrompt(prompt);
             addPoints(20);
             setActiveTab("coach");
           }}
           onAddTransaction={(tx) => { handleAddTransaction(tx); addPoints(30); }}
        />;
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
            onUpdateTransactionCategory={handleUpdateTransactionCategory}
            onClearTransactions={handleClearTransactions}
            onUpdateAnalysis={setAnalysis}
          />
        );
      case "nashmiPro":
        return <NashmiProTab lang={lang} isPro={isPro} />;
      case "services":
        return <ServicesTab 
          lang={lang} 
          onNavigate={(tab) => setActiveTab(tab)}
          onSendToCoach={(prompt: string) => {
            setPendingCoachPrompt(prompt);
            setActiveTab("coach");
          }}
        />;
      case "rewards":
        return <RewardsTab lang={lang} isPro={isPro} profile={rewardProfile} uid={user?.uid} />;
      case "calendar":
        return <WorkspaceCalendar lang={lang} />;
      case "chat":
        return <WorkspaceChat lang={lang} />;
      case "settings":
        return (
          <SettingsTab 
            lang={lang} 
            setLang={setLang} 
            onResetOnboarding={resetOnboarding}
            onLogout={handleLogout}
            onNavigateRewards={() => setActiveTab('rewards')}
            onNavigateSimulation={() => setActiveTab('simulation')}
            onNavigateNotes={() => setActiveTab('notes')}
            onNavigateCareerProfile={() => setActiveTab('careerProfile')}
            onNavigateInterviewSimulator={() => setActiveTab('interviewSimulator')}
            onNavigateProjects={() => setActiveTab('projects')}
            onNavigateNotifications={() => setActiveTab('notifications')}
            onNavigateCoach={() => setActiveTab('coach')}
          />
        );
      case "careerProfile":
        return <CareerProfileScreen lang={lang} />;
      case "interviewSimulator":
        return <AIInterviewSimulator lang={lang} />;
      case "notifications":
        return <NotificationCenter lang={lang} />;
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

  if (authChecking) {
    return (
      <DeviceShell lang={lang}>
        <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-[#020617] text-slate-700 dark:text-slate-400">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DeviceShell>
    );
  }

  if (!user) {
    return (
      <DeviceShell lang={lang}>
        <Auth lang={lang} />
      </DeviceShell>
    );
  }

  if (showWelcome) {
    return (
      <DeviceShell lang={lang}>
        <WelcomeScreen 
          lang={lang} 
          name={user.displayName || user.email?.split('@')[0] || null} 
          onComplete={() => {
            setShowWelcome(false);
            setActiveTab("home");
          }} 
        />
      </DeviceShell>
    );
  }

  // Common navigation bar metadata items
  const tabs = [
    { id: "home", label: t.home, icon: <Home className="w-5 h-5" /> },
    { id: "services", label: lang === "ar" ? "الخدمات" : "Services", icon: <Briefcase className="w-5 h-5" /> },
    { id: "coach", label: t.coach, icon: <BrainCircuit className="w-5 h-5" /> },
    { id: "projects", label: lang === "ar" ? "المشاريع والاستثمار" : "Projects", icon: <Building2 className="w-5 h-5" /> },
  ] as const;

  const getTabTitle = () => {
    switch (activeTab) {
      case "projects": return lang === "ar" ? "المشاريع والاستثمار" : "Projects & Investments";
      case "home": return t.home;
      case "services": return lang === "ar" ? "الخدمات" : "Services";
      case "notes": return t.notes || "Notes";
      case "simulation": return t.simulation;
      case "coach": return t.coach;
      case "careerProfile": return lang === "ar" ? "ملفي المهني" : "Career Profile";
      case "upload": return t.upload || "Upload";
      case "settings": return t.settings || "Settings";
      case "healthScore": return t.healthScore || "Health Score";
      case "calendar": return lang === "ar" ? "تقويم جوجل" : "Google Calendar";
      case "chat": return lang === "ar" ? "جوجل شات" : "Google Chat";
      default: return "";
    }
  };

  return (
    <DeviceShell lang={lang}>
      
      <Header 
        user={user}
        lang={lang}
        setLang={setLang}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        appName={t.appName}
        tabTitle={getTabTitle()}
        points={rewardProfile.points}
        streak={rewardProfile.currentStreak}
        isPro={isPro}
      />

      {/* Main active route scroll screen container */}
      <div className="flex-1 overflow-hidden flex flex-col relative bg-gradient-to-b from-slate-50 dark:from-[#020617] via-white dark:via-slate-900 to-slate-100 dark:to-slate-950">
        {renderActiveScreen()}
      </div>

      {/* Structured Bottom Navigation dock */}
      <div 
        className="bg-slate-50 dark:bg-[#020617] border-t border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 py-1.5 px-2 shrink-0 select-none pb-safe relative z-50"
      >
        <nav className="grid grid-cols-5 gap-1 relative" dir={isRtl ? 'rtl' : 'ltr'}>
          {tabs.slice(0, 2).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <MagneticWrapper
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                isActive={isActive}
                className={`flex flex-col items-center justify-center py-2 rounded-xl transition-colors cursor-pointer w-full ${
                  isActive 
                    ? "text-indigo-600 dark:text-indigo-400 bg-white dark:bg-[#0f172a]/40 shadow-inner font-extrabold" 
                    : "text-slate-700 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-700 dark:text-slate-300 hover:bg-[#0f172a]/20"
                }`}
              >
                <div className={`transition-transform duration-300 ${isActive ? "scale-105 text-indigo-600 dark:text-indigo-400" : ""}`}>
                  {tab.icon}
                </div>
                <span className={`text-[8.5px] mt-1 text-center font-medium block truncate w-full ${isRtl ? "font-arabic" : ""}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-0.5 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                )}
              </MagneticWrapper>
            );
          })}

          {/* Central Floating Action Button */}
          <div className="flex justify-center items-center relative">
            <div className="absolute -top-2.5">
              <MagneticWrapper 
                onClick={() => setActiveTab("upload")}
                className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-full flex items-center justify-center text-white shadow-[0_4px_12px_rgba(79,70,229,0.25)] border-[4px] border-slate-50 dark:border-[#020617] hover:shadow-[0_6px_16px_rgba(79,70,229,0.4)] transition-all"
              >
                <ScanLine className="w-6 h-6" />
              </MagneticWrapper>
            </div>
          </div>

          {tabs.slice(2).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <MagneticWrapper
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                isActive={isActive}
                className={`flex flex-col items-center justify-center py-2 rounded-xl transition-colors cursor-pointer w-full ${
                  isActive 
                    ? "text-indigo-600 dark:text-indigo-400 bg-white dark:bg-[#0f172a]/40 shadow-inner font-extrabold" 
                    : "text-slate-700 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-700 dark:text-slate-300 hover:bg-[#0f172a]/20"
                }`}
              >
                <div className={`transition-transform duration-300 ${isActive ? "scale-105 text-indigo-600 dark:text-indigo-400" : ""}`}>
                  {tab.icon}
                </div>
                <span className={`text-[8.5px] mt-1 text-center font-medium block truncate w-full ${isRtl ? "font-arabic" : ""}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-0.5 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                )}
              </MagneticWrapper>
            );
          })}
        </nav>
      </div>

      {showLaunchVideo && <LaunchVideo onComplete={() => setShowLaunchVideo(false)} />}

    </DeviceShell>
  );
}
