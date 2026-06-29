import React, { useState } from "react";
import { Sparkles, ArrowRight, ArrowLeft, Briefcase, BookOpen, Rocket, LineChart, PieChart, Upload, Search, Target, CheckCircle2, UserCircle2, Loader2 } from "lucide-react";
import { translations } from "../translations";
import { auth } from "../lib/firebase";
import { ProfileService } from "../services/ProfileService";

interface OnboardingProps {
  lang: "ar" | "en";
  onComplete: () => void;
  setUserRole: (role: string) => void;
}

type Role = "job_seeker" | "student" | "founder" | "investor" | "finance_tracker";
type Goal = "upload_cv" | "search_jobs" | "practice_interviews" | "analyze_finances" | "upload_statement" | "create_project" | "explore_investments";

export default function Onboarding({ lang, onComplete, setUserRole }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Profile Basics
  const [fullName, setFullName] = useState("");
  const [universityCompany, setUniversityCompany] = useState("");
  const [majorRole, setMajorRole] = useState("");

  const t = translations[lang];
  const isRtl = lang === "ar";

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      await saveAndComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const saveAndComplete = async () => {
    setSaving(true);
    setErrorMsg("");
    try {
      if (selectedRole) {
        setUserRole(selectedRole);
      }
      
      const payload = {
        selectedRole,
        selectedGoal,
        profileBasics: {
          fullName,
          universityCompany,
          majorRole,
        },
        preferredLanguage: lang,
        onboardingCompleted: true,
        updatedAt: new Date().toISOString()
      };

      if (auth.currentUser) {
        let profileBasics = null;
        // Save basic profile info if provided
        if (fullName || universityCompany || majorRole) {
           profileBasics = {
             name: fullName,
             organization: universityCompany,
             title: majorRole,
             updatedAt: new Date().toISOString()
           };
        }
        await ProfileService.saveOnboardingProfile(auth.currentUser.uid, payload, profileBasics);
      } else {
        localStorage.setItem("finx_onboarding_data", JSON.stringify(payload));
      }
      
      onComplete();
    } catch (err) {
      console.error(err);
      setErrorMsg(t.savingFailed || "Failed to save profile.");
      setSaving(false);
    }
  };

  const roles: { id: Role; label: string; icon: React.ReactNode }[] = [
    { id: "job_seeker", label: t.roleJobSeeker, icon: <Briefcase className="w-5 h-5" /> },
    { id: "student", label: t.roleStudent, icon: <BookOpen className="w-5 h-5" /> },
    { id: "founder", label: t.roleFounder, icon: <Rocket className="w-5 h-5" /> },
    { id: "investor", label: t.roleInvestor, icon: <LineChart className="w-5 h-5" /> },
    { id: "finance_tracker", label: t.roleFinance, icon: <PieChart className="w-5 h-5" /> },
  ];

  const goals: { id: Goal; label: string; icon: React.ReactNode; validFor: Role[] }[] = [
    { id: "upload_cv", label: t.goalUploadCV, icon: <Upload className="w-5 h-5" />, validFor: ["job_seeker", "student"] },
    { id: "search_jobs", label: t.goalSearchJobs, icon: <Search className="w-5 h-5" />, validFor: ["job_seeker", "student"] },
    { id: "practice_interviews", label: t.goalPracticeInterviews, icon: <Target className="w-5 h-5" />, validFor: ["job_seeker", "student"] },
    { id: "analyze_finances", label: t.goalAnalyzeFinances, icon: <PieChart className="w-5 h-5" />, validFor: ["finance_tracker", "student", "founder"] },
    { id: "upload_statement", label: t.goalUploadStatement, icon: <Upload className="w-5 h-5" />, validFor: ["finance_tracker"] },
    { id: "create_project", label: t.goalCreateProject, icon: <Rocket className="w-5 h-5" />, validFor: ["founder"] },
    { id: "explore_investments", label: t.goalExploreInvestments, icon: <LineChart className="w-5 h-5" />, validFor: ["investor"] },
  ];

  const filteredGoals = goals.filter(g => selectedRole ? g.validFor.includes(selectedRole) : true);

  return (
    <div className={`flex-1 flex flex-col justify-between p-6 bg-[#F7F8FA] dark:bg-transparent text-text-primary transition-all duration-500 overflow-y-auto ${isRtl ? 'text-right' : 'text-left'}`}>
      {/* Brand Header */}
      <div className="flex items-center justify-between pt-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-blue-700 flex items-center justify-center shadow-md">
            <span className="font-extrabold text-white text-sm font-sans">FX</span>
          </div>
          <h1 className="text-lg font-bold tracking-wider text-text-primary">
            {t.appName}
          </h1>
        </div>
        <button 
          onClick={handleSkip}
          className="text-xs font-semibold text-text-secondary hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-1.5 rounded-full border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-colors"
        >
          {t.skipOnboarding}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full py-8">
        
        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 mb-8 shadow-inner">
               <Sparkles className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300">
              {t.onboardingTitle}
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed max-w-sm mx-auto">
              {t.welcomeSub}
            </p>
          </div>
        )}

        {/* Step 1: Role Selection */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-text-primary mb-2">{t.selectRole}</h2>
            </div>
            <div className="space-y-3">
              {roles.map(role => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${
                    selectedRole === role.id 
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300' 
                      : 'border-border-primary bg-surface-primary/50 text-text-primary hover:border-indigo-300 hover:bg-[#F7F8FA] dark:hover:bg-slate-800'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    selectedRole === role.id ? 'bg-indigo-600 text-white' : 'bg-bg-secondary'
                  }`}>
                    {role.icon}
                  </div>
                  <span className="font-semibold text-sm">{role.label}</span>
                  {selectedRole === role.id && <CheckCircle2 className="w-5 h-5 ml-auto rtl:ml-0 rtl:mr-auto text-indigo-600 dark:text-indigo-400" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Goal Selection */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-text-primary mb-2">{t.selectGoal}</h2>
            </div>
            <div className="space-y-3">
              {filteredGoals.map(goal => (
                <button
                  key={goal.id}
                  onClick={() => setSelectedGoal(goal.id)}
                  className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${
                    selectedGoal === goal.id 
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300' 
                      : 'border-border-primary bg-surface-primary/50 text-text-primary hover:border-indigo-300 hover:bg-[#F7F8FA] dark:hover:bg-slate-800'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    selectedGoal === goal.id ? 'bg-indigo-600 text-white' : 'bg-bg-secondary'
                  }`}>
                    {goal.icon}
                  </div>
                  <span className="font-semibold text-sm">{goal.label}</span>
                  {selectedGoal === goal.id && <CheckCircle2 className="w-5 h-5 ml-auto rtl:ml-0 rtl:mr-auto text-indigo-600 dark:text-indigo-400" />}
                </button>
              ))}
              {filteredGoals.length === 0 && (
                <div className="text-center text-text-secondary text-sm mt-8">
                  No specific goals found for this role. You can proceed.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Profile Setup */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto bg-bg-secondary rounded-full flex items-center justify-center mb-4">
                <UserCircle2 className="w-8 h-8 text-text-secondary" />
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-2">{t.profileSetup}</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5 px-1">{t.fullName}</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-surface-primary border border-border-primary rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                  placeholder={isRtl ? "مثال: أحمد عبد الله..." : "e.g. John Doe"}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5 px-1">{t.universityCompany}</label>
                <input 
                  type="text" 
                  value={universityCompany}
                  onChange={(e) => setUniversityCompany(e.target.value)}
                  className="w-full bg-surface-primary border border-border-primary rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5 px-1">{t.majorRole}</label>
                <input 
                  type="text" 
                  value={majorRole}
                  onChange={(e) => setMajorRole(e.target.value)}
                  className="w-full bg-surface-primary border border-border-primary rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="text-sm text-red-500 text-center bg-red-50 dark:bg-red-500/10 rounded-lg p-3">
                {errorMsg}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="space-y-6 pt-4 shrink-0 max-w-md mx-auto w-full">
        {/* Progress Indicator */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step 
                  ? "w-8 bg-indigo-600 dark:bg-indigo-500" 
                  : i < step 
                    ? "w-4 bg-indigo-300 dark:bg-indigo-800/50" 
                    : "w-4 bg-border-primary"
              }`}
            />
          ))}
        </div>

        {/* Buttons Controls */}
        <div className="flex items-center gap-3">
          {step > 0 && (
            <button
              onClick={handleBack}
              disabled={saving}
              className="flex items-center justify-center w-12 h-12 rounded-2xl bg-surface-primary border border-border-primary text-text-primary dark:text-text-secondary hover:bg-[#F7F8FA] dark:hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              <ArrowLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          )}

          <button
            onClick={handleNext}
            disabled={saving || (step === 1 && !selectedRole) || (step === 2 && !selectedGoal && filteredGoals.length > 0)}
            className={`flex-1 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="opacity-90">{t.savingProfile}</span>
              </>
            ) : (
              <>
                <span>{step === 3 ? t.finishOnboarding : t.next}</span>
                {step < 3 && <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
