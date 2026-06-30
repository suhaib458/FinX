import React, { useState, useEffect } from "react";
import { User, Briefcase, ChevronRight, Play, CheckCircle, FileText, BrainCircuit, Activity, BarChart3, AlertTriangle, ArrowRight } from "lucide-react";
import { getCareerProfile, CareerProfile } from "../lib/career";
import { saveInterviewSession, getInterviewHistory, InterviewSession } from "../lib/interview";
import { auth } from "../lib/firebase";
import { translations } from "../translations";

interface Props {
  lang: "ar" | "en";
}

type Mode = "setup" | "interview" | "result" | "history";

export default function AIInterviewSimulator({ lang }: Props) {
  const isRtl = lang === "ar";
  const [mode, setMode] = useState<Mode>("setup");
  const [profile, setProfile] = useState<CareerProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  // Setup state
  const [jobRole, setJobRole] = useState("");
  const [careerField, setCareerField] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [numQuestions, setNumQuestions] = useState(3);
  
  // Interview state
  const [questions, setQuestions] = useState<{ question: string; answer?: string; feedback?: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  
  // Result state
  const [result, setResult] = useState<Partial<InterviewSession>>({});
  const [historyData, setHistoryData] = useState<InterviewSession[]>([]);

  const isMountedRef = useRef(true);
  const fetchAbortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    const fetchProfile = async () => {
      if (auth.currentUser) {
        const data = await getCareerProfile(auth.currentUser.uid);
        if (!isMountedRef.current) return;
        if (data) {
          setProfile(data);
          if (data.careerFields?.[0]) setCareerField(data.careerFields[0]);
        }
        const hist = await getInterviewHistory(auth.currentUser.uid);
        if (!isMountedRef.current) return;
        setHistoryData(hist);
      }
      if (isMountedRef.current) setLoadingProfile(false);
    };
    fetchProfile();
    return () => {
      isMountedRef.current = false;
      if (fetchAbortControllerRef.current) {
        fetchAbortControllerRef.current.abort();
      }
    };
  }, []);

  const viewHistory = () => setMode("history");

  const handleStartInterview = async () => {
    if (!jobRole) return;
    setIsGenerating(true);
    try {
      let token = "";
      if (auth.currentUser) {
        token = await auth.currentUser.getIdToken();
      }

      if (fetchAbortControllerRef.current) {
        fetchAbortControllerRef.current.abort();
      }
      fetchAbortControllerRef.current = new AbortController();

      const response = await fetch("/api/interview-generate", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        signal: fetchAbortControllerRef.current.signal,
        body: JSON.stringify({
          lang, 
          jobRole, 
          careerField, 
          difficulty, 
          numQuestions,
          careerProfile: profile
        })
      });
      const data = await response.json();
      if (!isMountedRef.current) return;
      if (data.questions) {
        setQuestions(data.questions.map((q: string) => ({ question: q })));
        setMode("interview");
      }
    } catch (e: any) {
      if (e.name === "AbortError" || !isMountedRef.current) return;
      console.error(e);
    } finally {
      if (isMountedRef.current) setIsGenerating(false);
    }
  };

  const finishInterview = async (completedQs: typeof questions) => {
    setIsScoring(true);
    setMode("result");
    try {
      let token = "";
      if (auth.currentUser) {
        token = await auth.currentUser.getIdToken();
      }

      if (fetchAbortControllerRef.current) {
        fetchAbortControllerRef.current.abort();
      }
      fetchAbortControllerRef.current = new AbortController();

      const response = await fetch("/api/interview-score", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        signal: fetchAbortControllerRef.current.signal,
        body: JSON.stringify({ lang, questions: completedQs, jobRole, careerField, difficulty })
      });
      const scoreData = await response.json();
      if (!isMountedRef.current) return;
      setResult(scoreData);
      
      if (auth.currentUser) {
        await saveInterviewSession(auth.currentUser.uid, {
          jobRole,
          careerField,
          difficulty,
          language: lang,
          questions: scoreData.questions || completedQs,
          overallScore: scoreData.overallScore,
          communicationScore: scoreData.communicationScore,
          technicalScore: scoreData.technicalScore,
          confidenceScore: scoreData.confidenceScore,
          strengths: scoreData.strengths,
          weaknesses: scoreData.weaknesses,
          improvements: scoreData.improvements,
        });
      }
    } catch (e: any) {
      if (e.name === "AbortError" || !isMountedRef.current) return;
      console.error(e);
    } finally {
      if (isMountedRef.current) setIsScoring(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-[#F7F8FA] dark:bg-transparent">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (mode === "setup") {
    return (
      <div className={`flex-1 overflow-y-auto bg-[#F7F8FA] dark:bg-transparent p-4 lg:p-8 ${isRtl ? "text-right" : "text-left"}`}>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex justify-between items-center bg-indigo-600 text-white rounded-3xl p-8 shadow-sm">
            <div>
              <h1 className="text-2xl font-bold mb-2">{isRtl ? "محاكي المقابلات الشخصية بالذكاء الاصطناعي" : "AI Interview Simulator"}</h1>
              <p className="text-indigo-100 opacity-90 text-sm">{isRtl ? "تدرّب على المقابلات الحقيقية واحصل على تقييم فوري من خبير الموارد البشرية الذكي." : "Practice real interviews and get instant feedback from the smart HR expert."}</p>
            </div>
            {historyData.length > 0 && (
              <button 
                onClick={viewHistory}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors font-medium flex-shrink-0"
              >
                {isRtl ? "سجل التقييمات" : "View History"}
              </button>
            )}
          </div>

          {!profile && (
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 flex items-start gap-4">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-amber-800 dark:text-amber-400">{isRtl ? "لم يتم بناء الملف المهني" : "Career Profile Missing"}</h3>
                <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">{isRtl ? "ننصحك برفع سيرتك الذاتية في قسم الدردشة ليتم تخصيص المقابلة بناءً على مهاراتك الفعلية." : "We recommend uploading your CV in the chat first to personalize the interview based on your actual skills."}</p>
              </div>
            </div>
          )}

          <div className="bg-surface-primary rounded-3xl p-6 shadow-sm border border-border-primary space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">{isRtl ? "المسمى الوظيفي المستهدف" : "Target Job Role"}</label>
              <input type="text" value={jobRole} onChange={(e) => setJobRole(e.target.value)} placeholder={isRtl ? "مثال: مبرمج الواجهات الأمامية" : "e.g., Frontend Developer"} className="w-full bg-bg-secondary border border-border-primary rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">{isRtl ? "مجال العمل" : "Career Field"}</label>
              <input type="text" value={careerField} onChange={(e) => setCareerField(e.target.value)} placeholder={isRtl ? "مثال: تقنية المعلومات" : "e.g., Information Technology"} className="w-full bg-bg-secondary border border-border-primary rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">{isRtl ? "مستوى الصعوبة" : "Difficulty"}</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full bg-bg-secondary border border-border-primary rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="easy">{isRtl ? "سهل (مبتدئ)" : "Easy (Junior)"}</option>
                  <option value="medium">{isRtl ? "متوسط (خبرة)" : "Medium (Mid-level)"}</option>
                  <option value="hard">{isRtl ? "صعب (متقدم)" : "Hard (Senior/Lead)"}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">{isRtl ? "عدد الأسئلة" : "Number of Questions"}</label>
                <select value={numQuestions} onChange={(e) => setNumQuestions(parseInt(e.target.value))} className="w-full bg-bg-secondary border border-border-primary rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                  <option value={7}>7</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleStartInterview}
              disabled={!jobRole || isGenerating}
              className={`w-full py-4 mt-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                !jobRole || isGenerating 
                  ? "bg-border-primary text-text-secondary cursor-not-allowed" 
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30"
              }`}
            >
              {isGenerating ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Play className="w-5 h-5 fill-current" />
              )}
              {isRtl ? "ابدأ المقابلة" : "Start Interview"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "interview") {
    return (
      <div className={`flex-1 overflow-y-auto bg-[#F7F8FA] dark:bg-transparent p-4 lg:p-8 ${isRtl ? "text-right" : "text-left"}`}>
        <div className="max-w-4xl w-full mx-auto flex flex-col space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {isRtl ? "المقابلة الشخصية" : "Interview Session"}
            </h2>
            <span className="text-sm font-medium text-text-secondary bg-surface-primary px-3 py-1 rounded-lg border border-border-primary">
              {isRtl ? `${questions.length} أسئلة` : `${questions.length} Questions`}
            </span>
          </div>

          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={idx} className="bg-surface-primary rounded-3xl p-6 shadow-sm border border-border-primary flex flex-col">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {idx + 1}
                    </span>
                  </div>
                  <div className="pt-1.5">
                    <h3 className="text-sm font-bold text-text-secondary mb-1">
                      {isRtl ? `السؤال ${idx + 1}` : `Question ${idx + 1}`}
                    </h3>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
                      {q.question}
                    </h2>
                  </div>
                </div>

                <textarea 
                  value={q.answer || ""}
                  onChange={(e) => {
                    const updatedQs = [...questions];
                    updatedQs[idx].answer = e.target.value;
                    setQuestions(updatedQs);
                  }}
                  placeholder={isRtl ? "اكتب إجابتك هنا بوضوح وتفصيل..." : "Type your answer here clearly and in detail..."}
                  className="w-full min-h-[120px] bg-bg-secondary/50 border border-border-primary rounded-2xl p-4 text-text-primary resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 pb-8">
            <button 
              onClick={() => finishInterview(questions)}
              disabled={questions.some(q => !(q.answer || "").trim())}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg"
            >
              {isRtl ? "إنهاء المقابلة" : "Finish Interview"}
              <CheckCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "result") {
    if (isScoring) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#F7F8FA] dark:bg-transparent space-y-6">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-4 border-border-primary rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center"><BarChart3 className="w-8 h-8 text-indigo-500 animate-pulse" /></div>
          </div>
          <p className="text-lg font-medium text-text-secondary">
            {isRtl ? "جاري تقييم أدائك في المقابلة..." : "Evaluating your interview performance..."}
          </p>
        </div>
      );
    }

    return (
      <div className={`flex-1 overflow-y-auto bg-[#F7F8FA] dark:bg-transparent p-4 lg:p-8 ${isRtl ? "text-right" : "text-left"}`}>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header Score Card */}
          <div className="bg-surface-primary rounded-3xl p-8 shadow-sm border border-border-primary flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <svg className="w-36 h-36 transform -rotate-90">
                <circle cx="72" cy="72" r="64" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                <circle cx="72" cy="72" r="64" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={402} strokeDashoffset={402 - (402 * (result.overallScore || 0)) / 100} className="text-emerald-500 transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-800 dark:text-slate-100">{result.overallScore || 0}%</span>
                <span className="text-xs text-text-secondary uppercase">{isRtl ? "النتيجة" : "SCORE"}</span>
              </div>
            </div>
            <div className="flex-1 space-y-4 w-full">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {isRtl ? "اكتملت المقابلة!" : "Interview Completed!"}
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-bg-secondary/50 rounded-xl p-4 border border-border-primary">
                  <p className="text-xs text-text-secondary mb-1">{isRtl ? "التواصل" : "Communication"}</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{result.communicationScore || 0}%</p>
                </div>
                <div className="bg-bg-secondary/50 rounded-xl p-4 border border-border-primary">
                  <p className="text-xs text-text-secondary mb-1">{isRtl ? "التقنية" : "Technical"}</p>
                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{result.technicalScore || 0}%</p>
                </div>
                <div className="bg-bg-secondary/50 rounded-xl p-4 border border-border-primary">
                  <p className="text-xs text-text-secondary mb-1">{isRtl ? "الثقة" : "Confidence"}</p>
                  <p className="text-lg font-bold text-accent-orange">{result.confidenceScore || 0}%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl p-6 border border-emerald-100 dark:border-emerald-800/30">
              <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5" />
                {isRtl ? "نقاط القوة" : "Strengths"}
              </h3>
              <ul className="space-y-3">
                {result.strengths?.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm text-emerald-700 dark:text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-rose-50 dark:bg-rose-900/10 rounded-3xl p-6 border border-rose-100 dark:border-rose-800/30">
              <h3 className="text-lg font-bold text-rose-800 dark:text-rose-400 flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5" />
                {isRtl ? "مجالات التحسين" : "Areas for Improvement"}
              </h3>
              <ul className="space-y-3">
                {result.weaknesses?.map((w, i) => (
                  <li key={i} className="flex gap-2 text-sm text-rose-700 dark:text-rose-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 flex-shrink-0" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Feedback per question */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">
              {isRtl ? "مراجعة الإجابات" : "Answers Review"}
            </h3>
            {result.questions?.map((q, i) => (
              <div key={i} className="bg-surface-primary rounded-2xl p-6 border border-border-primary">
                <p className="font-bold text-text-primary mb-4">س: {q.question}</p>
                <div className="bg-bg-secondary/50 rounded-xl p-4 mb-4">
                  <p className="text-sm font-medium text-text-secondary mb-1">{isRtl ? "إجابتك:" : "Your Answer:"}</p>
                  <p className="text-text-primary text-sm">{q.answer}</p>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-xl p-4">
                  <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-1">{isRtl ? "ملاحظات الخبير:" : "Expert Feedback:"}</p>
                  <p className="text-text-primary text-sm">{q.feedback}</p>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => setMode("setup")} className="w-full py-4 rounded-xl font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all flex items-center justify-center">
            {isRtl ? "بدء مقابلة جديدة" : "Start New Interview"}
          </button>
        </div>
      </div>
    );
  }

  if (mode === "history") {
    return (
      <div className={`flex-1 overflow-y-auto bg-[#F7F8FA] dark:bg-transparent p-4 lg:p-8 ${isRtl ? "text-right" : "text-left"}`}>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {isRtl ? "سجل المقابلات السابقة" : "Previous Interviews History"}
            </h2>
            <button onClick={() => setMode("setup")} className="px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-xl font-medium">
              {isRtl ? "عودة للبدء" : "Back to Setup"}
            </button>
          </div>
          
          {historyData.map((session, idx) => (
            <div key={idx} className="bg-surface-primary rounded-3xl p-6 border border-border-primary flex flex-col md:flex-row items-center gap-6 shadow-sm">
              <div className="relative">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                  <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251} strokeDashoffset={251 - (251 * (session.overallScore || 0)) / 100} className="text-indigo-500" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-slate-800 dark:text-slate-100">{session.overallScore || 0}%</span>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{session.jobRole}</h3>
                <p className="text-sm text-text-secondary">
                  {session.careerField} • {session.difficulty} level
                </p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {session.strengths?.slice(0,2).map((s, idx) => (
                    <span key={idx} className="px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 text-xs rounded border border-emerald-100 dark:border-emerald-500/20">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
