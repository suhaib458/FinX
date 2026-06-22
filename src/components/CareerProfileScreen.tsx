import React, { useState, useEffect } from "react";
import { 
  User, BookOpen, Star, Sparkles, Building, 
  MapPin, CheckCircle, Percent, Github, Linkedin, Briefcase, ChevronRight
} from "lucide-react";
import { getCareerProfile, CareerProfile } from "../lib/career";
import { auth } from "../lib/firebase";

interface CareerProfileScreenProps {
  lang: "ar" | "en";
}

export default function CareerProfileScreen({ lang }: CareerProfileScreenProps) {
  const [profile, setProfile] = useState<CareerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isRtl = lang === "ar";

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
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-[#020617]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-[#020617] ${isRtl ? 'text-right' : 'text-left'}`}>
        <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <User className="w-10 h-10 text-slate-400 dark:text-slate-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          {isRtl ? "لم يتم بناء ملفك المهني بعد" : "No Career Profile Yet"}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm mb-8">
          {isRtl 
            ? "قم برفع سيرتك الذاتية في الدردشة مع المستشار ليتم تحليلها وبناء ملفك المهني تلقائياً."
            : "Upload your CV in the chat with the coach to automatically build your career profile."}
        </p>
      </div>
    );
  }

  return (
    <div className={`flex-1 overflow-y-auto bg-slate-50 dark:bg-[#020617] p-4 lg:p-8 ${isRtl ? 'text-right' : 'text-left'}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header & Score */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center gap-8">
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
            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center md:justify-start gap-2">
              <Briefcase className="w-5 h-5" />
              {profile.careerFields?.[0] || (isRtl ? "مستكشف مسارات" : "Career Explorer")}
            </p>
            <div className={`flex flex-wrap gap-3 mt-6 justify-center md:justify-start`}>
              {profile.linkedinUrl ? (
                <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#0077B5]/10 text-[#0077B5] rounded-full font-medium text-sm hover:bg-[#0077B5]/20 transition-colors">
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
              ) : (
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full font-medium text-sm hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                  <Linkedin className="w-4 h-4" />
                  {isRtl ? "+ ربط" : "+ Connect"}
                </button>
              )}
              {profile.githubUrl ? (
                <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-800/10 dark:bg-white/10 text-slate-800 dark:text-white rounded-full font-medium text-sm hover:bg-slate-800/20 dark:hover:bg-white/20 transition-colors">
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              ) : (
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full font-medium text-sm hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                  <Github className="w-4 h-4" />
                  {isRtl ? "+ ربط" : "+ Connect"}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Education & Basics */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-6">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              {isRtl ? "التعليم والخلفية" : "Education & Background"}
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{isRtl ? "الجامعة" : "University"}</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{profile.university || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{isRtl ? "التخصص" : "Major"}</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{profile.major || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{isRtl ? "السنة الدراسية" : "Academic Year"}</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{profile.academicYear || "-"}</p>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-amber-500" />
              {isRtl ? "المهارات والأدوات" : "Skills & Tools"}
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills?.length > 0 ? (
                profile.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg text-sm font-medium border border-amber-500/20">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-slate-500 dark:text-slate-400 text-sm">-</p>
              )}
            </div>
          </div>

          {/* Interests & Fields */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              {isRtl ? "الاهتمامات المهنية" : "Career Interests"}
            </h3>
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">{isRtl ? "المجالات" : "Fields"}</p>
                <div className="flex flex-wrap gap-2">
                  {profile.careerFields?.length > 0 ? (
                    profile.careerFields.map((field, index) => (
                      <span key={index} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm font-medium border border-emerald-500/20">
                        {field}
                      </span>
                    ))
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400 text-sm">-</p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">{isRtl ? "اهتمامات أخرى" : "Other Interests"}</p>
                <div className="flex flex-wrap gap-2">
                  {profile.interests?.length > 0 ? (
                    profile.interests.map((interest, index) => (
                      <span key={index} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700">
                        {interest}
                      </span>
                    ))
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400 text-sm">-</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Languages */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-6">
              <MapPin className="w-5 h-5 text-blue-500" />
              {isRtl ? "اللغات" : "Languages"}
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.languages?.length > 0 ? (
                profile.languages.map((language, index) => (
                  <span key={index} className="px-3 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium border border-blue-500/20">
                    {language}
                  </span>
                ))
              ) : (
                <p className="text-slate-500 dark:text-slate-400 text-sm">-</p>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
