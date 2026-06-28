import React, { useState } from "react";
import { 
  Briefcase, Rocket, Filter, ChevronRight, ChevronLeft, Building2, TrendingUp, 
  Target, Globe, Calendar, FileText, ImageIcon, Video, CheckCircle2, 
  AlertCircle, Users, Eye, Heart, Download, ShieldAlert, Sparkles, X, Plus, Play, Info, Clock, MapPin, Upload, PieChart, Percent, Check
} from "lucide-react";

interface NashmiProTabProps {
  lang: "ar" | "en";
  isPro?: boolean;
}

type UserMode = "founder" | "investor";
type FounderTab = "create" | "my_projects";
type ProjectStatus = "draft" | "review" | "approved" | "published";

export default function NashmiProTab({ lang }: NashmiProTabProps) {
  const isRtl = lang === "ar";
  const [mode, setMode] = useState<UserMode>("investor");
  
  // Founder States
  const [founderTab, setFounderTab] = useState<FounderTab>("create");
  
  // Form States
  const [formData, setFormData] = useState({
    name: "",
    idea: "",
    sector: "",
    location: "",
    description: "",
    requiredFunding: "",
    roi: "",
    licenseFile: null as File | null
  });

  const [founderProjects, setFounderProjects] = useState<any[]>([]);

  // Investor States
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  const mockProjects = [
    {
      id: "1",
      name: isRtl ? "منصة فودتيك" : "FoodTech Platform",
      sector: isRtl ? "تكنولوجيا الغذاء" : "Food Tech",
      location: isRtl ? "عمان" : "Amman",
      requiredFunding: 150000,
      currentFunding: 45000,
      roi: "15%",
      shareValue: isRtl ? "1000 دينار / حصة" : "1000 JOD / Share",
      duration: isRtl ? "3 سنوات" : "3 Years",
      investors: 4,
      status: "published",
      image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      idea: isRtl ? "منصة لتقليل الهدر الغذائي في المطاعم." : "Platform to reduce food waste in restaurants.",
      problem: isRtl ? "هدر أطنان من الطعام الصالح يومياً في المطاعم والفنادق." : "Tons of good food wasted daily.",
      solution: isRtl ? "ربط المطاعم بالجمعيات والأفراد بأسعار مخفضة." : "Connecting restaurants with charities.",
      aiScore: 82,
      strengths: isRtl ? ["سوق واعد", "أثر بيئي واجتماعي"] : ["Promising market", "Eco/Social impact"],
      risks: isRtl ? ["مخاطر لوجستية"] : ["Logistical risks"],
    },
    {
      id: "2",
      name: isRtl ? "حلول الدفع الذكية" : "Smart Pay Solutions",
      sector: isRtl ? "تكنولوجيا مالية" : "FinTech",
      location: isRtl ? "إربد" : "Irbid",
      requiredFunding: 300000,
      currentFunding: 280000,
      roi: "20%",
      shareValue: isRtl ? "5000 دينار / حصة" : "5000 JOD / Share",
      duration: isRtl ? "5 سنوات" : "5 Years",
      investors: 12,
      status: "published",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      idea: isRtl ? "تطبيق موحد لجميع بوابات الدفع." : "Unified app for all payment gateways.",
      problem: isRtl ? "تعدد بوابات الدفع يعقد العمليات للشركات الصغيرة." : "Multiple gateways complicate operations.",
      solution: isRtl ? "API واحد للجميع." : "One API for all.",
      aiScore: 94,
      strengths: isRtl ? ["نموذج عمل مجرب", "فريق ذو خبرة"] : ["Proven business model", "Experienced team"],
      risks: isRtl ? ["تغيرات تنظيمية"] : ["Regulatory changes"],
    }
  ];

  const handlePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.idea) return;
    
    const newProject = {
      ...formData,
      id: Date.now().toString(),
      status: "review", // Always starts as under review
      date: new Date().toLocaleDateString(),
    };
    setFounderProjects([newProject, ...founderProjects]);
    setFormData({ name: "", idea: "", sector: "", location: "", description: "", requiredFunding: "", roi: "", licenseFile: null });
    setFounderTab("my_projects");
  };

  const renderFounderDashboard = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {[
          { id: "create", label: isRtl ? "نشر مشروع" : "Publish Project", icon: Plus },
          { id: "my_projects", label: isRtl ? "مشاريعي" : "My Projects", icon: Building2 },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFounderTab(tab.id as FounderTab)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              founderTab === tab.id 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                : "bg-white/5 text-text-secondary hover:bg-white/10 hover:text-white border border-white/5"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {founderTab === "create" && (
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-[2rem] p-6 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center">
              <Rocket className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{isRtl ? "إطلاق مشروع جديد" : "Launch New Project"}</h2>
              <p className="text-text-secondary text-sm">{isRtl ? "أدخل بيانات مشروعك ليتم مراجعتها وطرحها للمستثمرين" : "Enter your project details to be reviewed and published to investors"}</p>
            </div>
          </div>

          <form onSubmit={handlePublishSubmit} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">{isRtl ? "اسم المشروع" : "Project Name"}</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors" placeholder={isRtl ? "مثال: منصة فودتيك" : "e.g., FoodTech Platform"} />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">{isRtl ? "القطاع" : "Sector"}</label>
                <select required value={formData.sector} onChange={e => setFormData({...formData, sector: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors appearance-none">
                  <option value="">{isRtl ? "اختر القطاع" : "Select Sector"}</option>
                  <option value="تكنولوجيا">تكنولوجيا</option>
                  <option value="تكنولوجيا مالية">تكنولوجيا مالية</option>
                  <option value="طبي">طبي</option>
                  <option value="تعليم">تعليم</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">{isRtl ? "الموقع الجغرافي (المحافظة)" : "Location (Governorate)"}</label>
                <select required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors appearance-none">
                  <option value="">{isRtl ? "اختر الموقع" : "Select Location"}</option>
                  <option value="عمان">عمان</option>
                  <option value="إربد">إربد</option>
                  <option value="الزرقاء">الزرقاء</option>
                  <option value="العقبة">العقبة</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">{isRtl ? "فكرة المشروع" : "Project Idea"}</label>
                <input required type="text" value={formData.idea} onChange={e => setFormData({...formData, idea: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors" placeholder={isRtl ? "ما هي المشكلة التي يحلها المشروع؟" : "What is the core idea?"} />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-300 mb-2">{isRtl ? "وصف مختصر" : "Short Description"}</label>
                <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors resize-none" placeholder={isRtl ? "اشرح مشروعك بوضوح وإيجاز..." : "Explain your project clearly..."} />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">{isRtl ? "المبلغ المطلوب (دينار)" : "Required Funding (JOD)"}</label>
                <div className="relative">
                  <PieChart className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                  <input required type="number" value={formData.requiredFunding} onChange={e => setFormData({...formData, requiredFunding: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors" placeholder="100000" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">{isRtl ? "نسبة الأرباح / العائد المقترح" : "Expected ROI / Profit Share"}</label>
                <div className="relative">
                  <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                  <input required type="text" value={formData.roi} onChange={e => setFormData({...formData, roi: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors" placeholder="15%" />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-300 mb-2">{isRtl ? "رفع ترخيص المشروع (PDF)" : "Upload License (PDF)"}</label>
                <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all cursor-pointer group">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h3 className="text-white font-bold mb-1">{isRtl ? "اضغط لرفع الملف أو اسحب وأفلت" : "Click to upload or drag and drop"}</h3>
                  <p className="text-sm text-text-secondary">PDF, MAX 5MB</p>
                </div>
              </div>

            </div>

            <div className="pt-6 border-t border-white/10 flex justify-end">
              <button type="submit" className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-base transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40">
                {isRtl ? "إرسال للمراجعة" : "Submit for Review"}
              </button>
            </div>
          </form>
        </div>
      )}

      {founderTab === "my_projects" && (
        <div className="space-y-6">
          {founderProjects.length === 0 ? (
            <div className="text-center py-20 bg-white/5 border border-white/10 rounded-[2rem]">
              <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-10 h-10 text-indigo-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{isRtl ? "لا توجد مشاريع مضافة" : "No Projects Added"}</h2>
              <p className="text-text-secondary max-w-sm mx-auto mb-6">{isRtl ? "ابدأ رحلتك الاستثمارية من خلال نشر مشروعك الأول هنا." : "Start your investment journey by publishing your first project here."}</p>
              <button onClick={() => setFounderTab("create")} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-500 transition-colors">
                {isRtl ? "إضافة مشروع جديد" : "Add New Project"}
              </button>
            </div>
          ) : (
            founderProjects.map(proj => (
              <div key={proj.id} className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-[2rem] p-6 sm:p-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4">
                   {proj.status === "review" && (
                     <span className="px-3 py-1.5 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-full border border-amber-500/30 flex items-center gap-1.5 backdrop-blur-md">
                       <Clock className="w-4 h-4" />
                       {isRtl ? "قيد المراجعة" : "Under Review"}
                     </span>
                   )}
                   {proj.status === "approved" && (
                     <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/30 flex items-center gap-1.5 backdrop-blur-md">
                       <CheckCircle2 className="w-4 h-4" />
                       {isRtl ? "تمت الموافقة" : "Approved"}
                     </span>
                   )}
                   {proj.status === "published" && (
                     <span className="px-3 py-1.5 bg-indigo-500/20 text-indigo-400 text-xs font-bold rounded-full border border-indigo-500/30 flex items-center gap-1.5 backdrop-blur-md">
                       <Globe className="w-4 h-4" />
                       {isRtl ? "منشور" : "Published"}
                     </span>
                   )}
                 </div>
                 
                 <div className="flex items-start gap-5 mb-8 pt-2">
                   <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20 p-[1px]">
                     <div className="w-full h-full bg-slate-900/40 backdrop-blur-md rounded-[15px] flex items-center justify-center">
                       <Building2 className="w-8 h-8 text-indigo-400" />
                     </div>
                   </div>
                   <div className="pt-1">
                     <h3 className="text-xl font-bold text-white mb-1.5">{proj.name}</h3>
                     <p className="text-sm text-text-secondary">{isRtl ? "تاريخ التقديم:" : "Submitted on:"} {proj.date}</p>
                   </div>
                 </div>

                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <div className="text-xs text-text-secondary mb-1">{isRtl ? "القطاع" : "Sector"}</div>
                      <div className="font-bold text-white truncate">{proj.sector}</div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <div className="text-xs text-text-secondary mb-1">{isRtl ? "الموقع" : "Location"}</div>
                      <div className="font-bold text-white truncate">{proj.location}</div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <div className="text-xs text-text-secondary mb-1">{isRtl ? "التمويل" : "Funding"}</div>
                      <div className="font-bold text-indigo-400 truncate">{Number(proj.requiredFunding).toLocaleString()} JOD</div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <div className="text-xs text-text-secondary mb-1">{isRtl ? "العائد" : "ROI"}</div>
                      <div className="font-bold text-emerald-400 truncate">{proj.roi}</div>
                    </div>
                 </div>

                 <div className="bg-indigo-500/5 rounded-2xl p-4 border border-indigo-500/10 flex gap-4 items-start">
                   <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                   <p className="text-sm text-slate-300 leading-relaxed">
                     {proj.status === "review" 
                       ? (isRtl ? "يتم الآن مراجعة بياناتك والتراخيص المرفقة من قبل فريقنا المختص. سيتم الرد عليك قريباً." : "Your data and licenses are being reviewed by our team. We will get back to you soon.")
                       : (isRtl ? "هذا المشروع مفعل ويمكن للمستثمرين الاطلاع عليه الآن." : "This project is active and visible to investors.")
                     }
                   </p>
                 </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  const renderInvestorMarketplace = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Filters */}
      <div className="flex flex-wrap gap-3 pb-2">
        <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20">
          <Filter className="w-4 h-4" /> {isRtl ? "فلترة متقدمة" : "Filters"}
        </button>
        <select className="px-5 py-2.5 bg-white/5 text-white border border-white/10 rounded-xl text-sm outline-none focus:border-indigo-500 appearance-none min-w-[120px]">
          <option value="" className="text-slate-900">{isRtl ? "القطاع" : "Sector"}</option>
          <option value="tech" className="text-slate-900">تكنولوجيا</option>
          <option value="health" className="text-slate-900">طبي</option>
        </select>
        <select className="px-5 py-2.5 bg-white/5 text-white border border-white/10 rounded-xl text-sm outline-none focus:border-indigo-500 appearance-none min-w-[120px]">
          <option value="" className="text-slate-900">{isRtl ? "المحافظة" : "Governorate"}</option>
          <option value="amman" className="text-slate-900">عمان</option>
          <option value="irbid" className="text-slate-900">إربد</option>
        </select>
        <select className="px-5 py-2.5 bg-white/5 text-white border border-white/10 rounded-xl text-sm outline-none focus:border-indigo-500 appearance-none min-w-[120px]">
          <option value="" className="text-slate-900">{isRtl ? "نسبة العائد" : "ROI"}</option>
          <option value="high" className="text-slate-900">+20%</option>
          <option value="mid" className="text-slate-900">10-20%</option>
        </select>
        <select className="px-5 py-2.5 bg-white/5 text-white border border-white/10 rounded-xl text-sm outline-none focus:border-indigo-500 appearance-none min-w-[140px]">
          <option value="" className="text-slate-900">{isRtl ? "اكتمال التمويل" : "Funding %"}</option>
          <option value="almost" className="text-slate-900">+80%</option>
          <option value="new" className="text-slate-900">جديد</option>
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        {mockProjects.map(proj => {
          const progress = (proj.currentFunding / proj.requiredFunding) * 100;
          return (
            <div 
              key={proj.id} 
              onClick={() => setSelectedProject(proj)}
              className="bg-slate-900/40 backdrop-blur-md border border-white/10 hover:border-indigo-500/50 rounded-[2rem] overflow-hidden cursor-pointer group transition-all hover:shadow-[0_0_30px_rgba(79,70,229,0.15)] flex flex-col"
            >
              <div className="h-56 relative overflow-hidden shrink-0">
                <img src={proj.image} alt={proj.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-80"></div>
                
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                  <div className="flex flex-col gap-2">
                    <span className="px-3 py-1.5 bg-black/60 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/10 w-fit">
                      {proj.sector}
                    </span>
                    <span className="px-3 py-1.5 bg-black/60 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/10 flex items-center gap-1 w-fit">
                      <MapPin className="w-3 h-3 text-indigo-400" /> {proj.location}
                    </span>
                  </div>
                  <span className="px-3 py-1.5 bg-emerald-500/90 text-white text-xs font-bold rounded-full shadow-lg">
                    {isRtl ? "منشور ومفتوح" : "Active"}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">{proj.name}</h3>
                    <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">{proj.idea}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 my-6">
                  <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                    <div className="text-xs text-text-secondary mb-1">{isRtl ? "العائد" : "ROI"}</div>
                    <div className="text-lg font-bold text-emerald-400">{proj.roi}</div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                    <div className="text-xs text-text-secondary mb-1">{isRtl ? "قيمة الحصة" : "Share Value"}</div>
                    <div className="text-sm font-bold text-white mt-1.5">{proj.shareValue}</div>
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-text-secondary">{isRtl ? "التمويل المطلوب:" : "Required:"} <span className="text-white font-bold">{proj.requiredFunding.toLocaleString()} JOD</span></span>
                    <span className="text-indigo-400 font-bold">{Math.round(progress)}% {isRtl ? "مكتمل" : "Funded"}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mb-6">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${progress}%` }}></div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                     <button className="py-3 border border-indigo-500/30 text-indigo-400 rounded-xl font-bold text-sm hover:bg-indigo-500/10 transition-colors">
                       {isRtl ? "التفاصيل" : "Details"}
                     </button>
                     <button className="py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20">
                       {isRtl ? "استثمار" : "Invest"}
                     </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderProjectDetails = () => {
    if (!selectedProject) return null;
    const progress = (selectedProject.currentFunding / selectedProject.requiredFunding) * 100;

    return (
      <div className="fixed inset-0 bg-[#040814]/95 backdrop-blur-3xl z-50 overflow-y-auto animate-in slide-in-from-bottom-8 duration-500">
        <div className="max-w-5xl mx-auto pb-24">
          
          <div className="h-[40vh] min-h-[300px] relative">
            <img src={selectedProject.image} alt={selectedProject.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent"></div>
            
            <button onClick={() => setSelectedProject(null)} className="absolute top-6 right-6 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10 border border-white/10">
              <X className="w-5 h-5" />
            </button>

            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
              <div className="flex items-center gap-3 mb-4">
                 <span className="px-3 py-1.5 bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-full border border-indigo-500/30 backdrop-blur-md">
                   {selectedProject.sector}
                 </span>
                 <span className="px-3 py-1.5 bg-white/10 text-white text-xs font-bold rounded-full border border-white/10 flex items-center gap-1 backdrop-blur-md">
                   <MapPin className="w-3 h-3" /> {selectedProject.location}
                 </span>
                 <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/30 flex items-center gap-1 backdrop-blur-md">
                   <CheckCircle2 className="w-3 h-3" /> {isRtl ? "حالة المشروع: منشور" : "Status: Published"}
                 </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white">{selectedProject.name}</h1>
            </div>
          </div>

          <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-10">
              <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-400" />
                  {isRtl ? "فكرة المشروع" : "Project Idea"}
                </h2>
                <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
                   <p className="text-slate-300 leading-relaxed text-base">
                     {selectedProject.idea}
                   </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  {isRtl ? "المشكلة والحل" : "Problem & Solution"}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-rose-500/5 border border-rose-500/10 p-6 rounded-[2rem]">
                    <h3 className="text-rose-400 font-bold mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" /> {isRtl ? "المشكلة" : "Problem"}
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed">{selectedProject.problem}</p>
                  </div>
                  <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-[2rem]">
                    <h3 className="text-emerald-400 font-bold mb-3 flex items-center gap-2">
                      <Check className="w-5 h-5" /> {isRtl ? "الحل" : "Solution"}
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed">{selectedProject.solution}</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  {isRtl ? "الملفات والتراخيص" : "Files & Licenses"}
                </h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="flex-1 px-6 py-4 bg-white/5 border border-white/10 rounded-[1.5rem] flex items-center gap-4 hover:bg-white/10 transition-colors group">
                    <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6 text-rose-400" />
                    </div>
                    <div className="text-left rtl:text-right flex-1">
                      <div className="text-sm font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">{isRtl ? "رخصة المشروع (PDF)" : "Project License (PDF)"}</div>
                      <div className="text-xs text-text-secondary">تم الرفع والتحقق من FinX</div>
                    </div>
                    <Download className="w-5 h-5 text-text-secondary group-hover:text-indigo-400" />
                  </button>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 sticky top-6">
                <h3 className="text-lg font-bold text-white mb-6 border-b border-white/10 pb-4">{isRtl ? "بيانات التمويل" : "Funding Data"}</h3>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-text-secondary">{isRtl ? "المطلوب" : "Target"}</span>
                      <span className="text-white font-bold">{selectedProject.requiredFunding.toLocaleString()} JOD</span>
                    </div>
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-text-secondary">{isRtl ? "تم جمعه" : "Raised"}</span>
                      <span className="text-indigo-400 font-bold">{selectedProject.currentFunding.toLocaleString()} JOD</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-text-secondary font-bold">
                      <span>{Math.round(progress)}%</span>
                      <span>{selectedProject.investors} {isRtl ? "مستثمر" : "Investors"}</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-text-secondary">{isRtl ? "قيمة الحصة" : "Share Value"}</span>
                      <span className="font-bold text-white">{selectedProject.shareValue}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-text-secondary">{isRtl ? "العائد المتوقع" : "Expected ROI"}</span>
                      <span className="font-bold text-emerald-400">{selectedProject.roi}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-text-secondary">{isRtl ? "المدة" : "Duration"}</span>
                      <span className="font-bold text-white">{selectedProject.duration}</span>
                    </div>
                  </div>

                  <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-base shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-1 mt-2">
                    {isRtl ? "استثمار الآن" : "Invest Now"}
                  </button>

                  <div className="flex gap-3">
                    <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium text-sm transition-colors border border-white/10">
                      {isRtl ? "تواصل مع المؤسس" : "Contact Founder"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full bg-transparent ${isRtl ? 'font-arabic text-right' : 'font-sans text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Top Toggle Area */}
      <div className="pt-8 px-6 sm:px-10 pb-6 border-b border-white/5 bg-gradient-to-b from-[#020617] to-transparent sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 p-[1px] shadow-xl shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-900 rounded-[15px] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                نشمي <span className="text-indigo-400 font-light text-xl">Invest</span>
              </h1>
              <p className="text-sm text-text-secondary font-medium mt-0.5">{isRtl ? "منصة تمويل المشاريع الأردنية" : "Jordanian Startup Funding Ecosystem"}</p>
            </div>
          </div>

          <div className="flex bg-white/5 border border-white/10 p-1.5 rounded-2xl backdrop-blur-md w-full max-w-[320px] sm:w-auto">
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMode("investor");
              }}
              className={`flex-1 sm:px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === 'investor' ? 'bg-indigo-600 text-white shadow-lg' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
            >
              {isRtl ? "مستثمر" : "Investor"}
            </button>
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMode("founder");
              }}
              className={`flex-1 sm:px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === 'founder' ? 'bg-indigo-600 text-white shadow-lg' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
            >
              {isRtl ? "صاحب مشروع" : "Founder"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-32 no-scrollbar">
        <div className="max-w-6xl mx-auto">
          {mode === "founder" ? renderFounderDashboard() : renderInvestorMarketplace()}
        </div>
      </div>

      {renderProjectDetails()}
      
    </div>
  );
}
