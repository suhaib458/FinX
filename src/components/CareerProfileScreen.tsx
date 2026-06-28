import React, { useState, useEffect } from "react";
import { 
  User, BookOpen, Star, Sparkles, Building, 
  MapPin, CheckCircle, Percent, Github, Linkedin, Briefcase, ChevronRight,
  X, Edit2, Trash2, Globe
} from "lucide-react";
import { getCareerProfile, saveCareerProfile, CareerProfile } from "../lib/career";
import { auth } from "../lib/firebase";

interface CareerProfileScreenProps {
  lang: "ar" | "en";
}

export default function CareerProfileScreen({ lang }: CareerProfileScreenProps) {
  const [profile, setProfile] = useState<CareerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isRtl = lang === "ar";

  const [toastMsg, setToastMsg] = useState("");
  const [connecting, setConnecting] = useState<"linkedin" | "github" | null>(null);

  // Languages Modal State
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [langName, setLangName] = useState("");
  const [langLevel, setLangLevel] = useState(isRtl ? "متوسط" : "Intermediate");
  const [editLangIndex, setEditLangIndex] = useState<number | null>(null);
  const [langError, setLangError] = useState("");

  const openAddLanguage = () => {
    setLangName("");
    setLangLevel(isRtl ? "متوسط" : "Intermediate");
    setEditLangIndex(null);
    setLangError("");
    setIsLangModalOpen(true);
  };

  const openEditLanguage = (index: number, languageStr: string) => {
    let name = languageStr;
    let level = isRtl ? "متوسط" : "Intermediate";
    if (languageStr.includes('-')) {
      const parts = languageStr.split('-');
      name = parts[0].trim();
      level = parts.slice(1).join('-').trim();
    }
    setLangName(name);
    setLangLevel(level);
    setEditLangIndex(index);
    setLangError("");
    setIsLangModalOpen(true);
  };

  const handleDeleteLanguage = async (index: number) => {
    if (!profile) return;
    const newLanguages = [...(profile.languages || [])];
    newLanguages.splice(index, 1);
    
    const updatedProfile = { ...profile, languages: newLanguages };
    setProfile(updatedProfile);
    
    if (auth.currentUser) {
      await saveCareerProfile(auth.currentUser.uid, updatedProfile);
      showToast(isRtl ? "تم حذف اللغة" : "Language deleted");
    }
  };

  const handleSaveLanguage = async () => {
    if (!profile) return;
    const trimmedName = langName.trim();
    if (!trimmedName) {
      setLangError(isRtl ? "يرجى إدخال اسم اللغة" : "Please enter a language name");
      return;
    }

    const languageStr = `${trimmedName} - ${langLevel}`;
    const newLanguages = [...(profile.languages || [])];
    
    if (editLangIndex !== null) {
      newLanguages[editLangIndex] = languageStr;
    } else {
      newLanguages.push(languageStr);
    }

    const updatedProfile = { ...profile, languages: newLanguages };
    setProfile(updatedProfile);
    setIsLangModalOpen(false);
    
    if (auth.currentUser) {
      await saveCareerProfile(auth.currentUser.uid, updatedProfile);
      showToast(isRtl ? "تم حفظ اللغة بنجاح" : "Language saved successfully");
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleConnect = async (e: React.MouseEvent, platform: "linkedin" | "github") => {
    e.preventDefault();
    e.stopPropagation();
    
    setConnecting(platform);
    
    // Simulate connection flow or OAuth redirect
    setTimeout(() => {
      setConnecting(null);
      showToast(
        isRtl 
          ? `ميزة ربط ${platform === 'linkedin' ? 'LinkedIn' : 'GitHub'} ستتوفر قريباً ضمن تحديثاتنا القادمة.` 
          : `${platform === 'linkedin' ? 'LinkedIn' : 'GitHub'} connection will be available soon in an upcoming update.`
      );
    }, 1500);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (auth.currentUser) {
        const data = await getCareerProfile(auth.currentUser.uid);
        setProfile(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const calculateScore = (p: CareerProfile | null) => {
    if (!p) return 0;
    let score = 0;
    if (p.fullName) score += 10;
    if (p.university || p.major) score += 20;
    if (p.skills && p.skills.length > 0) score += 20;
    if (p.interests && p.interests.length > 0) score += 10;
    if (p.languages && p.languages.length > 0) score += 10;
    if (p.careerFields && p.careerFields.length > 0) score += 10;
    if (p.linkedinUrl) score += 10;
    if (p.githubUrl) score += 10;
    return score;
  };

  const score = calculateScore(profile);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F7F8FA] dark:bg-transparent">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center p-6 bg-[#F7F8FA] dark:bg-transparent ${isRtl ? 'text-right' : 'text-left'}`}>
        <div className="w-20 h-20 bg-border-primary rounded-full flex items-center justify-center mb-6">
          <User className="w-10 h-10 text-text-secondary dark:text-text-secondary" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          {isRtl ? "لم يتم بناء ملفك المهني بعد" : "No Career Profile Yet"}
        </h2>
        <p className="text-text-secondary text-center max-w-sm mb-8">
          {isRtl 
            ? "قم برفع سيرتك الذاتية في الدردشة مع المستشار ليتم تحليلها وبناء ملفك المهني تلقائياً."
            : "Upload your CV in the chat with the coach to automatically build your career profile."}
        </p>
      </div>
    );
  }

  return (
    <div className={`flex-1 overflow-y-auto bg-[#F7F8FA] dark:bg-transparent p-4 lg:p-8 ${isRtl ? 'text-right' : 'text-left'}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header & Score */}
        <div className="bg-surface-primary rounded-3xl p-6 lg:p-8 shadow-sm border border-border-primary flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-slate-100 dark:text-slate-800"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={351.8}
                strokeDashoffset={351.8 - (351.8 * score) / 100}
                className="text-indigo-500 transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{score}%</span>
            </div>
          </div>
          <div className="flex-1 text-center md:text-start">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {profile.fullName || (isRtl ? "مستخدم جديد" : "New User")}
            </h1>
            <p className="text-sm text-text-secondary font-medium flex items-center justify-center md:justify-start gap-1.5 mb-3">
              <Briefcase className="w-4 h-4" />
              {profile.careerFields?.[0] || (isRtl ? "مستكشف مسارات" : "Career Explorer")}
            </p>
            <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start overflow-hidden max-h-[120px]">
              {profile.major && (
                <span className="px-3 py-1.5 bg-bg-secondary/50 text-text-primary rounded-lg text-xs font-semibold border border-border-primary/50 flex items-center">
                  {profile.major}
                </span>
              )}
              {profile.careerFields?.slice(0, 3).map((field, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-bg-secondary/50 text-text-primary rounded-lg text-xs font-semibold border border-border-primary/50 flex items-center">
                  {field}
                </span>
              ))}
              {profile.careerFields && profile.careerFields.length > 3 && (
                <span className="px-3 py-1.5 bg-bg-secondary/50 text-text-secondary rounded-lg text-xs font-semibold border border-border-primary/50 flex items-center">
                  +{profile.careerFields.length - 3} {isRtl ? "المزيد" : "More"}
                </span>
              )}
            </div>
            <div className={`flex flex-wrap gap-2 mt-4 justify-center md:justify-start`}>
              {profile.linkedinUrl ? (
                <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#0077B5]/10 text-[#0077B5] rounded-full font-medium text-sm hover:bg-[#0077B5]/20 transition-colors">
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
              ) : (
                <button 
                  onClick={(e) => handleConnect(e, 'linkedin')}
                  disabled={connecting === 'linkedin'}
                  className="flex items-center gap-2 px-4 py-2 bg-border-primary text-text-secondary rounded-full font-medium text-sm hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  {connecting === 'linkedin' ? (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-500 border-t-transparent animate-spin" />
                  ) : (
                    <Linkedin className="w-4 h-4" />
                  )}
                  {isRtl ? "+ ربط" : "+ Connect"}
                </button>
              )}
              {profile.githubUrl ? (
                <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-800/10 dark:bg-white/10 text-text-primary rounded-full font-medium text-sm hover:bg-slate-800/20 dark:hover:bg-white/20 transition-colors">
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              ) : (
                <button 
                  onClick={(e) => handleConnect(e, 'github')}
                  disabled={connecting === 'github'}
                  className="flex items-center gap-2 px-4 py-2 bg-border-primary text-text-secondary rounded-full font-medium text-sm hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  {connecting === 'github' ? (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-500 border-t-transparent animate-spin" />
                  ) : (
                    <Github className="w-4 h-4" />
                  )}
                  {isRtl ? "+ ربط" : "+ Connect"}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Education & Basics */}
          <div className="bg-surface-primary rounded-3xl p-5 shadow-sm border border-border-primary">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              {isRtl ? "التعليم والخلفية" : "Education & Background"}
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-text-secondary mb-1">{isRtl ? "الجامعة" : "University"}</p>
                <p className="font-semibold text-sm text-text-primary">{profile.university || "-"}</p>
              </div>
              <div className="w-full h-px bg-bg-secondary"></div>
              <div>
                <p className="text-xs text-text-secondary mb-1">{isRtl ? "التخصص" : "Major"}</p>
                <p className="font-semibold text-sm text-text-primary">{profile.major || "-"}</p>
              </div>
              <div className="w-full h-px bg-bg-secondary"></div>
              <div>
                <p className="text-xs text-text-secondary mb-1">{isRtl ? "السنة الدراسية" : "Academic Year"}</p>
                <p className="font-semibold text-sm text-text-primary">{profile.academicYear || "-"}</p>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-surface-primary rounded-3xl p-5 shadow-sm border border-border-primary">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-amber-500" />
              {isRtl ? "المهارات والأدوات" : "Skills & Tools"}
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills?.length > 0 ? (
                profile.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-2 h-10 flex items-center bg-amber-500/10 text-accent-orange rounded-xl text-sm font-bold border border-amber-500/20 whitespace-nowrap">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-text-secondary text-sm">-</p>
              )}
            </div>
          </div>

          {/* Interests & Fields */}
          <div className="bg-surface-primary rounded-3xl p-5 shadow-sm border border-border-primary">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              {isRtl ? "الاهتمامات المهنية" : "Career Interests"}
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">{isRtl ? "المجالات الرئيسية" : "Primary Fields"}</p>
                <div className="flex flex-wrap gap-2">
                  {profile.careerFields?.length > 0 ? (
                    profile.careerFields.map((field, index) => (
                      <span key={index} className="px-3 py-1.5 bg-emerald-500/10 text-accent-green rounded-lg text-sm font-bold border border-emerald-500/20">
                        {field}
                      </span>
                    ))
                  ) : (
                    <p className="text-text-secondary text-sm">-</p>
                  )}
                </div>
              </div>
              {profile.interests?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">{isRtl ? "اهتمامات أخرى" : "Secondary Interests"}</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest, index) => (
                      <span key={index} className="px-3 py-1.5 bg-bg-secondary text-text-primary rounded-lg text-sm font-medium border border-border-primary">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Languages */}
          <div className="bg-surface-primary rounded-3xl p-5 shadow-sm border border-border-primary">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                {isRtl ? "اللغات" : "Languages"}
              </h3>
              {profile.languages?.length > 0 && (
                <button 
                  onClick={openAddLanguage}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg hover:bg-blue-500/20 transition-colors"
                >
                  {isRtl ? "+ إضافة" : "+ Add"}
                </button>
              )}
            </div>
            
            {profile.languages?.length > 0 ? (
              <div className="space-y-2">
                {profile.languages.map((language, index) => {
                  const hasHyphen = language.includes('-');
                  return (
                    <div key={index} className="flex items-center justify-between bg-bg-secondary/50 p-3 rounded-xl border border-border-primary/50">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        <span className="text-sm font-semibold text-text-primary">
                          {hasHyphen ? language.split('-')[0].trim() : language}
                        </span>
                        {hasHyphen && (
                          <>
                            <span className="text-text-secondary dark:text-text-secondary mx-1">—</span>
                            <span className="text-sm text-text-secondary">
                              {language.split('-').slice(1).join('-').trim()}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => openEditLanguage(index, language)}
                          className="p-1.5 text-text-secondary hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteLanguage(index)}
                          className="p-1.5 text-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-between bg-bg-secondary/50 p-4 rounded-xl border border-border-primary/50">
                <p className="text-text-secondary text-sm font-medium">
                  {isRtl ? "لم تتم إضافة أي لغات بعد." : "No languages added yet."}
                </p>
                <button 
                  onClick={openAddLanguage}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg hover:bg-blue-500/20 transition-colors"
                >
                  {isRtl ? "+ إضافة لغة" : "+ Add Language"}
                </button>
              </div>
            )}
          </div>
          
        </div>
      </div>
      
      {toastMsg && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-lg font-medium text-sm animate-in slide-in-from-top-4 whitespace-nowrap">
          {toastMsg}
        </div>
      )}

      {/* Language Modal */}
      {isLangModalOpen && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="bg-surface-primary rounded-t-3xl sm:rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-border-primary flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                {editLangIndex !== null 
                  ? (isRtl ? "تعديل اللغة" : "Edit Language")
                  : (isRtl ? "إضافة لغة" : "Add Language")}
              </h3>
              <button onClick={() => setIsLangModalOpen(false)} className="text-text-secondary hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4">
              {langError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-danger text-sm font-medium rounded-xl">
                  {langError}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1.5">
                  {isRtl ? "اسم اللغة" : "Language Name"}
                </label>
                <input
                  type="text"
                  value={langName}
                  onChange={(e) => setLangName(e.target.value)}
                  placeholder={isRtl ? "مثال: English, Français, العربية..." : "e.g., English, Français, Arabic..."}
                  className="w-full bg-bg-secondary border border-border-primary rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1.5">
                  {isRtl ? "مستوى الإجادة" : "Proficiency Level"}
                </label>
                <select
                  value={langLevel}
                  onChange={(e) => setLangLevel(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-primary rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none font-medium"
                >
                  {isRtl ? (
                    <>
                      <option value="مبتدئ">مبتدئ</option>
                      <option value="متوسط">متوسط</option>
                      <option value="جيد">جيد</option>
                      <option value="متقدم">متقدم</option>
                      <option value="لغة أم">لغة أم</option>
                    </>
                  ) : (
                    <>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Fluent">Fluent</option>
                      <option value="Native">Native</option>
                    </>
                  )}
                </select>
              </div>
            </div>
            <div className="p-5 border-t border-border-primary flex gap-3">
              <button
                onClick={() => setIsLangModalOpen(false)}
                className="flex-1 py-3 text-sm font-bold text-text-secondary bg-bg-secondary rounded-xl hover:bg-bg-secondary transition-colors"
              >
                {isRtl ? "إلغاء" : "Cancel"}
              </button>
              <button
                onClick={handleSaveLanguage}
                className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
              >
                {isRtl ? "حفظ" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
