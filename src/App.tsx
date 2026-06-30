import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
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
import HealthRatio from "./components/HealthRatio";
import StatementParser from "./components/StatementParser";
import CardScanner from "./components/CardScanner";
import SettingsTab from "./components/SettingsTab";
import LaunchVideo from "./components/LaunchVideo";
import WelcomeScreen from "./components/WelcomeScreen";
import Auth from "./components/Auth";
import Avatar from "./components/Avatar";
import { NotificationProvider } from "./contexts/NotificationContext";

import { auth, db } from "./lib/firebase";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { UserRepository } from "./repositories/UserRepository";
import { ProfileService } from "./services/ProfileService";

import FinancialNotes from "./components/FinancialNotes";
import ServicesTab from "./components/ServicesTab";
import DebtPlanner from "./components/DebtPlanner";
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
import SearchTab from "./components/SearchTab";
import SavedTab from "./components/SavedTab";
import AnalyticsTab from "./components/AnalyticsTab";
import RecommendationsTab from "./components/RecommendationsTab";
import { FinanceService } from "./services/FinanceService";
import { translations } from "./translations";
import { FinancialAnalysis, ChatMessage, Transaction, SpendingCategory, ActiveCard } from "./types";
import { 
  perfectProfile, 
  perfectProfileEnglish, 
  debtProfile, 
  debtProfileEnglish 
} from "./profiles";

import { RewardsService, RewardProfile } from "./lib/rewards";
import { getUserSubscription } from "./lib/subscription";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

function AppContent() {
  // Authentication State from Context
  const { currentUser: user, authLoading: authChecking, isPhoneVerified, verifyPhone, logout } = useAuth();

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
  const [activeTab, setActiveTab] = useState<"home" | "scan" | "coach" | "simulation" | "healthScore" | "upload" | "settings" | "notes" | "nashmiPro" | "rewards" | "services" | "calendar" | "chat" | "projects" | "careerProfile" | "interviewSimulator" | "notifications" | "search" | "saved" | "analytics" | "recommendations" | "debtPlanner">("home");

  // 4. User Role
  const [userRole, setUserRole] = useState<string | null>(null);

  // 4.5 Active Card
  const [activeCard, setActiveCard] = useState<ActiveCard | null>(() => {
    const saved = localStorage.getItem("finx_active_card");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

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
  const [isPro, setIsPro] = useState<boolean>(false);
  const addPoints = React.useCallback(async (amount: number, reason: string = "App engagement") => {
    if (!user) return;
    await RewardsService.awardPoints(user.uid, amount, isPro, reason);
  }, [user, isPro]);

  const handleAICoachAction = React.useCallback(() => addPoints(10), [addPoints]);
  const clearPendingCoachPrompt = React.useCallback(() => setPendingCoachPrompt(null), []);
  const handleSendToCoach = React.useCallback((prompt: string) => {
    setPendingCoachPrompt(prompt);
    addPoints(20);
    setActiveTab("coach");
  }, [addPoints]);
  const handleNotesAddTransaction = React.useCallback((tx: Transaction) => {
    handleAddTransaction(tx);
    addPoints(30);
  }, [addPoints]);

  // Track Firebase Auth State (handled by AuthContext now)
  useEffect(() => {
    if (!user) {
      setActiveTab("home");
    }
  }, [user]);

  useEffect(() => {
    let unsubProfile: (() => void) | undefined;
    let isMounted = true;
    const initializeUserApp = async (currentUser: User) => {
        try {
          const sub = await getUserSubscription(currentUser.uid);
          if (!isMounted) return;
          const currentIsPro = sub.plan === "premium" || sub.plan === "elite";
          setIsPro(currentIsPro);

          const profile = await RewardsService.initializeProfile(currentUser.uid);
          if (!isMounted) return;
          const { streakUpdated, newStreak } = await RewardsService.processDailyStreak(currentUser.uid, profile);
          
          const finProfile = await FinanceService.getFinancialProfile(currentUser.uid);
          if (!isMounted) return;
          if (finProfile) {
            setAnalysis(finProfile);
          }

          if (streakUpdated && newStreak >= 7) {
             await RewardsService.unlockAchievement(currentUser.uid, "7_day_streak", "7-Day Streak", 50, currentIsPro);
          }
          if (!isMounted) return;

          const [onboardingData, activeCardDoc, userDocSnap] = await Promise.all([
            ProfileService.getOnboardingSettings(currentUser.uid),
            getDoc(doc(db, "users", currentUser.uid, "settings", "activeCard")),
            UserRepository.getUserDoc(currentUser.uid)
          ]);
          
          if (!isMounted) return;

          if (onboardingData) {
             setUserRole(onboardingData.selectedRole || null);
          }

          if (activeCardDoc.exists()) {
             const data = activeCardDoc.data() as ActiveCard;
             setActiveCard(data);
             localStorage.setItem("finx_active_card", JSON.stringify(data));
          }

          unsubProfile = RewardsService.subscribeToProfile(currentUser.uid, (data) => {
            if (isMounted) setRewardProfile(data);
          });
          
          if (!userDocSnap.exists() || !userDocSnap.data()?.welcomeCardSeen) {
            setShowWelcome(true);
          } else {
            setShowWelcome(false);
          }
        } catch (e) {
          console.error("Error initializing user app:", e);
        }
    };

    if (user && isPhoneVerified) {
       initializeUserApp(user);
    }
    
    return () => {
      isMounted = false;
      if (unsubProfile) unsubProfile();
    };
  }, [user, isPhoneVerified]);

  // Auto-save Financial Profile when it changes
  useEffect(() => {
    if (user && analysis && analysis.monthlyIncome > 0) {
      const timeoutId = setTimeout(() => {
        FinanceService.saveFinancialProfile(user.uid, analysis);
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [analysis, user]);

  const handleLogout = async () => {
    setActiveTab("home");
    await logout();
  };

  // Track preferences across language swaps
  useEffect(() => {
    localStorage.setItem("finx_language", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'; 
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

  // Ensure system welcome greeting is present on empty chat startup
  useEffect(() => {
    setChatHistory(prev => {
      if (prev.length === 0) {
        return [
          {
            id: "greet",
            role: "assistant",
            content: translations[lang].chatGreeting,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ];
      }
      return prev;
    });
  }, [lang]);

  // Dynamic Transaction Additions (Recalculates totals & scores instantly!)
  const handleAddTransaction = React.useCallback((newTx: Transaction) => {
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
      const updatedCategories = prev.categories.map(c => 
        c.name === newTx.category && newTx.amount < 0
          ? { ...c, value: c.value + Math.abs(newTx.amount) }
          : c
      );
      
      let finalCategories = updatedCategories;
      const matchCat = prev.categories.find(c => c.name === newTx.category);
      if (!matchCat && newTx.amount < 0) {
        finalCategories = [...updatedCategories, {
          name: newTx.category,
          value: Math.abs(newTx.amount),
          color: "#0891B2"
        }];
      }

      return {
        ...prev,
        monthlyIncome: calculatedIncome,
        monthlyExpenses: calculatedExpenses,
        savingsRate: newSavingsRate,
        healthScore: finalScore,
        transactions: updatedTxList,
        categories: finalCategories,
      };
    });
  }, []);

  // Clear transactional files history
  const handleClearTransactions = React.useCallback(() => {
    setAnalysis(lang === "ar" ? perfectProfile : perfectProfileEnglish);
  }, [lang]);

  const handleUpdateTransactionCategory = React.useCallback((index: number, newCategory: string) => {
    setAnalysis(prev => {
      const newTransactions = [...prev.transactions];
      newTransactions[index] = { ...newTransactions[index], category: newCategory };
      return { ...prev, transactions: newTransactions };
    });
  }, []);

  // Render proper screen tab view
  const renderActiveScreen = () => {
    switch (activeTab) {
      case "projects":
        return <ProjectsTab lang={lang} user={user} setActiveTab={setActiveTab} />;
      case "home":
        return <Dashboard lang={lang} analysis={analysis} setActiveTab={setActiveTab} userRole={userRole} activeCard={activeCard} />;
      case "coach":
        return <AICoach 
                 lang={lang} 
                 messages={chatHistory} 
                 setMessages={setChatHistory} 
                 activeConversationId={activeCoachChatId} 
                 setActiveConversationId={setActiveCoachChatId} 
                 analysis={analysis} 
                 onAction={handleAICoachAction} 
                 pendingPrompt={pendingCoachPrompt}
                 clearPendingPrompt={clearPendingCoachPrompt}
               />;
      case "notes":
        return <FinancialNotes 
           lang={lang} 
           onSendToCoach={handleSendToCoach}
           onAddTransaction={handleNotesAddTransaction}
        />;
      case "healthScore":
        return <HealthRatio lang={lang} analysis={analysis} />;
      case "scan":
        return (
          <CardScanner 
            lang={lang} 
            onSaveCard={(cardData: ActiveCard) => {
              // Add a mockup transaction to trigger expense analysis
              const mockAnalysisTransaction = {
                id: Math.random().toString(36).substr(2, 9),
                date: new Date().toISOString().split("T")[0],
                desc: "INITIAL CARD SYNC",
                amount: 0,
                type: "expense" as const,
                category: "Other",
                note: `Linked card ${cardData.brand} ending in ${cardData.cardNumber.slice(-4)}`
              };
              
              handleAddTransaction(mockAnalysisTransaction);
              addPoints(50);
              
              // Persist active card
              setActiveCard(cardData);
              localStorage.setItem("finx_active_card", JSON.stringify(cardData));
              
              if (user) {
                setDoc(doc(db, "users", user.uid, "settings", "activeCard"), cardData);
              }
              
              // Move to dashboard or coach to show expense analysis started
              setActiveTab("home");
            }}
            onCancel={() => setActiveTab("home")}
          />
        );
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
            onNavigateNotes={() => setActiveTab('notes')}
            onNavigateCareerProfile={() => setActiveTab('careerProfile')}
            onNavigateInterviewSimulator={() => setActiveTab('interviewSimulator')}
            onNavigateProjects={() => setActiveTab('projects')}
            onNavigateNotifications={() => setActiveTab('notifications')}
            onNavigateCoach={() => setActiveTab('coach')}
            activeCard={activeCard}
            onSaveCard={(cardData) => {
              setActiveCard(cardData);
              localStorage.setItem("finx_active_card", JSON.stringify(cardData));
              if (user) {
                setDoc(doc(db, "users", user.uid, "settings", "activeCard"), cardData);
              }
            }}
            onAddTransaction={handleAddTransaction}
            onSubscriptionSuccess={() => {
               setIsPro(true);
            }}
          />
        );
      case "careerProfile":
        return <CareerProfileScreen lang={lang} />;
      case "interviewSimulator":
        return <AIInterviewSimulator lang={lang} />;
      case "notifications":
        return <NotificationCenter lang={lang} setActiveTab={setActiveTab} />;
      case "search":
        return <SearchTab lang={lang} user={user!} setActiveTab={setActiveTab} />;
      case "saved":
        return <SavedTab lang={lang} user={user!} />;
      case "analytics":
        return <AnalyticsTab lang={lang} user={user!} userRole={userRole} />;
      case "recommendations":
        return <RecommendationsTab lang={lang} user={user!} userRole={userRole} setActiveTab={setActiveTab} />;
      case "debtPlanner":
        return <DebtPlanner lang={lang} />;
      default:
        return <Dashboard lang={lang} analysis={analysis} setActiveTab={setActiveTab} userRole={userRole} activeCard={activeCard} />;
    }
  };

  const isRtl = lang === "ar";
  const t = translations[lang];

  // If in onboarding mood, render exclusively
  if (showOnboarding) {
    return (
      <DeviceShell lang={lang}>
        <Onboarding lang={lang} onComplete={completeOnboarding} setUserRole={setUserRole} />
      </DeviceShell>
    );
  }

  if (authChecking) {
    return (
      <DeviceShell lang={lang}>
        <div className="flex-1 flex items-center justify-center bg-bg-primary text-text-secondary">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DeviceShell>
    );
  }

  if (!user || (user && !isPhoneVerified)) {
    return (
      <DeviceShell lang={lang}>
        <Auth lang={lang} user={user} onVerified={verifyPhone} />
      </DeviceShell>
    );
  }

  // Common navigation bar metadata items
  const tabs = [
    { id: "home", label: t.home, icon: <Home className="w-5 h-5" /> },
    { id: "services", label: lang === "ar" ? "الخدمات" : "Services", icon: <Briefcase className="w-5 h-5" /> },
    { id: "coach", label: t.coach, icon: <BrainCircuit className="w-5 h-5" /> },
    { id: "projects", label: "نشمي", icon: <Building2 className="w-5 h-5" /> },
  ] as const;

  const getTabTitle = () => {
    switch (activeTab) {
      case "projects": return "نشمي";
      case "home": return t.home;
      case "services": return lang === "ar" ? "الخدمات" : "Services";
      case "notes": return t.notes || "Notes";
      case "coach": return t.coach;
      case "careerProfile": return lang === "ar" ? "ملفي المهني" : "Career Profile";
      case "upload": return t.upload || "Upload";
      case "scan": return lang === "ar" ? "مسح البطاقة" : "Scan Card";
      case "settings": return t.settings || "Settings";
      case "healthScore": return t.healthScore || "Health Score";
      case "calendar": return lang === "ar" ? "تقويم جوجل" : "Google Calendar";
      case "chat": return lang === "ar" ? "جوجل شات" : "Google Chat";
      default: return "";
    }
  };

  return (
    <DeviceShell lang={lang}>
      <AnimatePresence mode="wait">
        {showWelcome ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 z-50"
          >
            <WelcomeScreen 
              lang={lang} 
              name={user.displayName || user.email?.split('@')[0] || null} 
              onComplete={async () => {
                setShowWelcome(false);
                setActiveTab("home");
                if (user) {
                  await setDoc(doc(db, "users", user.uid), { welcomeCardSeen: true }, { merge: true });
                }
              }} 
            />
          </motion.div>
        ) : (
          <motion.div
            key="main-app"
            initial={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 flex flex-col"
          >
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
      <div className="flex-1 overflow-hidden flex flex-col relative bg-bg-primary">
        {renderActiveScreen()}
      </div>

      {/* Structured Bottom Navigation dock */}
      <div 
        className="bg-bg-primary border-t border-border-primary text-text-primary py-1.5 px-2 shrink-0 select-none pb-safe relative z-50"
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
                    ? "text-indigo-600 dark:text-indigo-400 bg-surface-primary shadow-inner font-extrabold" 
                    : "text-text-secondary hover:text-text-primary dark:hover:text-text-primary hover:bg-bg-secondary"
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
                onClick={() => setActiveTab("scan")}
                className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-full flex items-center justify-center text-white shadow-[0_4px_12px_rgba(79,70,229,0.25)] border-[4px] border-bg-primary hover:shadow-[0_6px_16px_rgba(79,70,229,0.4)] transition-all"
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
                    ? "text-indigo-600 dark:text-indigo-400 bg-surface-primary shadow-inner font-extrabold" 
                    : "text-text-secondary hover:text-text-primary dark:hover:text-text-primary hover:bg-bg-secondary"
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
          </motion.div>
        )}
      </AnimatePresence>
    </DeviceShell>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
}
