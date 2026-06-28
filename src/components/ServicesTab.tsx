import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Building2, 
  CreditCard, 
  Receipt, 
  Wallet, 
  TrendingUp, 
  Target, 
  Briefcase, 
  FileText, 
  Code, 
  GraduationCap, 
  BrainCircuit, 
  FileSearch, 
  Cpu, 
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CalendarDays,
  MessagesSquare,
  Search,
  X,
  BoxSelect
} from "lucide-react";

interface ServicesTabProps {
  lang: "ar" | "en";
  onNavigate?: (tab: "home" | "coach" | "simulation" | "healthScore" | "upload" | "settings" | "notes" | "nashmiPro" | "rewards" | "services" | "calendar" | "chat" | "projects" | "debtPlanner") => void;
  onSendToCoach?: (prompt: string) => void;
}

export default function ServicesTab({ lang, onNavigate, onSendToCoach }: ServicesTabProps) {
  const isRtl = lang === "ar";
  
  const translations = {
    ar: {
      title: "دليل الخدمات",
      subtitle: "اكتشف مجموعة متكاملة من الخدمات المالية والمهنية المدعومة بالذكاء الاصطناعي لرفع كفاءة أعمالك وتحقيق أهدافك.",
      financial: "الخدمات المالية",
      career: "الخدمات المهنية",
      ai: "خدمات الذكاء الاصطناعي",
    },
    en: {
      title: "Services Directory",
      subtitle: "Discover a full suite of AI-powered financial and career services to optimize your workflows and reach your goals.",
      financial: "Financial Services",
      career: "Career Services",
      ai: "AI Services",
    }
  };
  
  const t = translations[lang];

  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

  const handleAction = (serviceTitle: string, targetMode: "tab" | "coach" | "route", targetData: string) => {
    if (targetMode === "route") {
      navigate(targetData);
    } else if (targetMode === "coach" && onSendToCoach) {
      onSendToCoach(targetData);
    } else if (targetMode === "tab" && onNavigate) {
      onNavigate(targetData as any);
    }
  };

  const financialServices = [
    { 
      title: lang === "ar" ? "النظام العائلي" : "Family System", 
      desc: lang === "ar" ? "نظام إدارة الموارد المالية لعائلتك." : "Manage your family's finances together.",
      icon: <Building2 className="w-5 h-5 text-purple-500" />, 
      action: () => handleAction("Family System", "route", "/family") 
    },
    { 
      title: lang === "ar" ? "تحليل كشف الحساب" : "Statement Analysis", 
      desc: lang === "ar" ? "معالجة فورية وتصنيف للعمليات البنكية." : "Instant categorization of bank transactions.",
      icon: <Receipt className="w-5 h-5 text-indigo-500" />, 
      action: () => handleAction("Bank Statement Analysis", "tab", "upload") 
    },
    { 
      title: lang === "ar" ? "تحليل البطاقات الائتمانية" : "Card Analysis", 
      desc: lang === "ar" ? "اكتشف أنماط الإنفاق والمصاريف المخفية." : "Discover spending patterns and hidden fees.",
      icon: <CreditCard className="w-5 h-5 text-blue-500" />, 
      action: () => handleAction("Credit Card Analysis", "tab", "scan") 
    },
    { 
      title: lang === "ar" ? "الصحة المالية" : "Health Score", 
      desc: lang === "ar" ? "مؤشر يوضح استقرار وضعك المالي." : "Index showing the strength of your finances.",
      icon: <Sparkles className="w-5 h-5 text-amber-500" />, 
      action: () => handleAction("Financial Health Score", "tab", "healthScore") 
    },
    { 
      title: lang === "ar" ? "خطة سداد الديون الذكية" : "Smart Debt Repayment", 
      desc: lang === "ar" ? "تخلص من الديون بذكاء وابدأ بناء ثروتك." : "Eliminate debt intelligently and build wealth.",
      icon: <TrendingUp className="w-5 h-5 text-cyan-500" />, 
      action: () => handleAction("Debt Analysis", "tab", "debtPlanner") 
    },
  ];

  const careerServices = [
    { 
      title: lang === "ar" ? "تحليل السيرة الذاتية" : "CV Analysis", 
      desc: lang === "ar" ? "مراجعة شاملة لسيرتك لتحديد نقاط القوة." : "Review your CV to identify strengths.",
      icon: <FileText className="w-5 h-5 text-indigo-500" />, 
      action: () => handleAction("CV Analysis", "coach", lang === "ar" ? "الرجاء تحليل ملف السيرة الذاتية الخاص بي لتحديد التركيز والمهارات." : "Please analyze my CV to identify strengths and formatting issues.") 
    },
    { 
      title: lang === "ar" ? "ترشيحات الوظائف" : "Job Search", 
      desc: lang === "ar" ? "اكتشاف فرص التوظيف الحقيقية الموافقة." : "Discover job openings matching your skillset.",
      icon: <Briefcase className="w-5 h-5 text-blue-500" />, 
      action: () => handleAction("Job Search", "coach", lang === "ar" ? "الرجاء البحث عن وظائف تناسب مهاراتي وخبراتي الحالية." : "Please find real job openings that match my current skills.") 
    },
    { 
      title: lang === "ar" ? "تطوير المهارات" : "Skills Development", 
      desc: lang === "ar" ? "المهارات المطلوبة لترقيتك." : "Skills required in the market.",
      icon: <Code className="w-5 h-5 text-emerald-500" />, 
      action: () => handleAction("Skills Matching", "coach", lang === "ar" ? "ما هي المهارات التي تنقصني للوصول إلى أهدافي المهنية؟" : "What skills am I missing for my career goals?") 
    },
    { 
      title: lang === "ar" ? "أفضل الدورات" : "Course Recommendations", 
      desc: lang === "ar" ? "توصيات لزيادة دخلك وقيمتك المادية." : "Best programs to increase market value.",
      icon: <GraduationCap className="w-5 h-5 text-rose-500" />, 
      action: () => handleAction("Course Recommendations", "coach", lang === "ar" ? "الرجاء اقتراح دورات أو شهادات لزيادة الدخل وتطوير المسار المهني." : "Please suggest courses or certifications to advance my career and increase income.") 
    },
  ];

  const aiServices = [
    { 
      title: lang === "ar" ? "المستشار الذكي" : "AI Advisor", 
      desc: lang === "ar" ? "مساعدك للإجابة عن تعقيدات أموالك." : "Assistant to answer financial questions.",
      icon: <BrainCircuit className="w-5 h-5 text-purple-500" />, 
      action: () => handleAction("Smart Advisor", "tab", "coach") 
    },
    { 
      title: lang === "ar" ? "تحليل المستندات" : "Document Parsing", 
      desc: lang === "ar" ? "تحليل مالي للمستندات." : "Fast parsing of financial files.",
      icon: <FileSearch className="w-5 h-5 text-indigo-500" />, 
      action: () => handleAction("Document Analysis", "coach", lang === "ar" ? "لدي مستندات أريد منك مراجعتها واستخراج البيانات المهمة منها." : "I have documents that I want you to review and extract insights from.") 
    },
    { 
      title: lang === "ar" ? "التحليل البصري" : "Image Analysis", 
      desc: lang === "ar" ? "معالجة وتحليل الإيصالات بالصور." : "Analyze receipts and images.",
      icon: <Cpu className="w-5 h-5 text-emerald-500" />, 
      action: () => handleAction("Image Analysis", "coach", lang === "ar" ? "سأقوم برفع صورة ورجاءاً قم بتحليل محتواها وتوضيحه." : "I will upload an image. Please analyze its contents for me.") 
    },
  ];

  const allCategories = [
    { title: t.financial, items: financialServices },
    { title: t.career, items: careerServices },
    { title: t.ai, items: aiServices },
  ];

  const normalizeForSearch = (str: string) => {
    return str
      .toLowerCase()
      .replace(/[ً-ّ]/g, "") // remove arabic diacritics
      .replace(/[أإآ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/[^\w\s\u0600-\u06FF]/g, "") // remove punctuation
      .replace(/\s+/g, " ") // collapse spaces
      .trim();
  };

  const getScore = (service: { title: string, desc: string }, normalizedQuery: string) => {
    const title = normalizeForSearch(service.title);
    const desc = normalizeForSearch(service.desc);
    
    if (title === normalizedQuery) return 100;
    if (title.includes(normalizedQuery)) return 50;
    if (desc.includes(normalizedQuery)) return 10;
    
    const queryWords = normalizedQuery.split(" ").filter(Boolean);
    if (queryWords.length > 1) {
       if (queryWords.every(w => title.includes(w))) return 40;
       if (queryWords.every(w => desc.includes(w))) return 5;
    }
    return 0;
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return <>{text}</>;
    
    const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const queryWords = query.trim().split(/\s+/).map(w => 
      escapeRegExp(w).replace(/ا/g, '[اأإآ]').replace(/ه/g, '[هة]').replace(/ي/g, '[يى]')
    );
    const regexPattern = queryWords.join('|');
    
    try {
      const regex = new RegExp(`(${regexPattern})`, 'gi');
      const parts = text.split(regex);
      return (
        <>
          {parts.map((part, i) => {
            const isMatch = (i % 2 !== 0);
            if (isMatch && part) {
               return <span key={i} className="bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-[3px] px-0.5 transition-colors">{part}</span>;
            }
            return <span key={i}>{part}</span>;
          })}
        </>
      );
    } catch(e) {
      return <>{text}</>;
    }
  };

  const normalizedQuery = normalizeForSearch(searchQuery);

  const filteredCategories = allCategories.map(cat => {
    if (!normalizedQuery) return { ...cat, maxScore: 0 };

    const scoredItems = cat.items.map(item => ({
      ...item,
      score: getScore({ title: item.title, desc: item.desc }, normalizedQuery)
    })).filter(item => item.score > 0);

    scoredItems.sort((a, b) => b.score - a.score);

    return {
      title: cat.title,
      items: scoredItems,
      maxScore: scoredItems.length > 0 ? Math.max(...scoredItems.map(i => i.score)) : 0
    };
  }).filter(cat => cat.items.length > 0);

  if (normalizedQuery) {
    filteredCategories.sort((a, b) => b.maxScore - a.maxScore);
  }

  const renderBentoSection = (title: string, services: any[]) => {
    return (
      <div className="mb-10 sm:mb-12">
        <div className="flex items-center gap-4 mb-6 sm:mb-8 px-2">
          <div className="w-2 h-6 sm:h-8 rounded-full bg-indigo-600 dark:bg-indigo-500"></div>
          <h3 className={`text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight ${isRtl ? 'font-arabic' : 'font-sans'}`}>
            {title}
          </h3>
          <div className="h-px bg-border-primary flex-1 ml-4 rtl:ml-0 rtl:mr-4"></div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 sm:gap-5 lg:gap-6">
          {services.map((service, index) => {
            // Distinctive colors per card
            const palette = [
              { bg: 'bg-indigo-50 dark:bg-indigo-500/10', border: 'border-indigo-100 dark:border-indigo-500/20', titleHover: 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400', arrowHover: 'group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500' },
              { bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-100 dark:border-emerald-500/20', titleHover: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400', arrowHover: 'group-hover:bg-accent-green dark:group-hover:bg-emerald-500' },
              { bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-100 dark:border-blue-500/20', titleHover: 'group-hover:text-blue-600 dark:group-hover:text-blue-400', arrowHover: 'group-hover:bg-blue-600 dark:group-hover:bg-blue-500' },
              { bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-100 dark:border-rose-500/20', titleHover: 'group-hover:text-rose-600 dark:group-hover:text-rose-400', arrowHover: 'group-hover:bg-rose-600 dark:group-hover:bg-rose-500' },
            ];
            const color = palette[index % palette.length];

            return (
              <div 
                key={index}
                onClick={service.action}
                className="w-[calc(50%-8px)] sm:w-[calc(33.333%-14px)] lg:w-[calc(33.333%-16px)] aspect-square relative rounded-[20px] bg-surface-primary border border-border-primary/80 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-indigo-500/5 transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center p-3 shadow-sm text-center"
              >
                {/* Center: Icon */}
                <div className={`w-12 h-12 sm:w-14 sm:h-14 mb-3 shrink-0 rounded-[14px] flex items-center justify-center border transition-all duration-300 ${color.bg} ${color.border} group-hover:scale-110 group-hover:shadow-md [&>svg]:w-6 [&>svg]:h-6`}>
                  {service.icon}
                </div>
                
                {/* Center: Text */}
                <h4 className={`text-[14px] sm:text-[15px] font-bold text-text-primary leading-[1.4] transition-colors w-full px-2 ${color.titleHover} ${isRtl ? 'font-arabic' : 'font-sans'}`}>
                  {highlightMatch(service.title, searchQuery)}
                </h4>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`flex-1 overflow-y-auto pb-28 pt-8 ${isRtl ? "text-right" : "text-left"}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Smart Search Bar Area */}
        <div className="mb-10 relative group max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-4 rtl:pl-0 rtl:right-0 rtl:pr-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-text-secondary group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRtl ? "ابحث عن خدمة، أداة، أو استشارة..." : "Search for a service, tool, or consultation..."}
            className={`w-full bg-surface-primary border-2 border-border-primary rounded-2xl py-4
              ${isRtl ? 'pr-12 pl-12 font-arabic' : 'pl-12 pr-12 font-sans'} 
              text-text-primary placeholder-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm text-base`}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-4 rtl:pr-0 rtl:left-0 rtl:pl-4 flex items-center cursor-pointer text-text-secondary hover:text-slate-600 dark:hover:text-slate-300"
              aria-label="Clear search"
            >
              <div className="w-6 h-6 rounded-full bg-bg-secondary flex items-center justify-center transition-colors">
                <X className="h-3.5 w-3.5" />
              </div>
            </button>
          )}
        </div>

        {filteredCategories.length > 0 ? (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
              {filteredCategories.map(cat => (
                <React.Fragment key={cat.title}>
                  {renderBentoSection(cat.title, cat.items)}
                </React.Fragment>
              ))}
           </div>
        ) : (
           <div className="text-center py-20 px-4 animate-in fade-in duration-300">
             <div className="w-16 h-16 bg-bg-secondary/80 rounded-3xl flex items-center justify-center mx-auto mb-5 rotate-3 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
               <BoxSelect className="w-7 h-7 text-text-secondary dark:text-text-secondary" />
             </div>
             <h3 className="text-xl font-bold text-text-primary mb-2">
               {isRtl ? "لم يتم العثور على نتائج" : "No results found"}
             </h3>
             <p className="text-text-secondary max-w-sm mx-auto text-sm leading-relaxed">
               {isRtl 
                 ? `لم نتمكن من العثور على أية خدمات تطابق "${searchQuery}". جرب استخدام كلمات مفتاحية أخرى.` 
                 : `We couldn't find any services matching "${searchQuery}". Try using different keywords.`}
             </p>
           </div>
        )}
        
      </div>
    </div>
  );
}

