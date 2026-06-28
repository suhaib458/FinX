import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  CalendarDays, 
  Download, 
  Activity, 
  PieChart, 
  Target, 
  AlertCircle,
  Loader2,
  FileText,
  Sparkles,
  X,
  CheckCircle2,
  Trash2
} from "lucide-react";
import { AnalyticsService, AnalyticsReport, ReportType } from "../lib/analytics";
import { translations } from "../translations";

interface AnalyticsTabProps {
  lang: "ar" | "en";
  user: User;
  userRole?: string | null;
}

export default function AnalyticsTab({ lang, user, userRole }: AnalyticsTabProps) {
  const [reports, setReports] = useState<AnalyticsReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filterType, setFilterType] = useState<ReportType>("monthly");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<ReportType>("monthly");
  const [toastMsg, setToastMsg] = useState("");
  const [reportToDelete, setReportToDelete] = useState<AnalyticsReport | null>(null);
  const [deleting, setDeleting] = useState(false);

  const t = translations[lang];
  const isRtl = lang === "ar";
  
  const fetchReports = async () => {
    setLoading(true);
    const data = await AnalyticsService.getReports(user.uid);
    setReports(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, [user.uid]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    const newReport = await AnalyticsService.generateReport(user.uid, userRole || null, modalType);
    setReports(prev => [newReport, ...prev]);
    setGenerating(false);
    setShowModal(false);
    showToast(isRtl ? "تم إنشاء التقرير بنجاح" : "Report generated successfully!");
  };

  const handleDeleteReport = async () => {
    if (!reportToDelete) return;
    setDeleting(true);
    try {
      await AnalyticsService.deleteReport(user.uid, reportToDelete.id);
      setReports(prev => prev.filter(r => r.id !== reportToDelete.id));
      showToast(isRtl ? "تم حذف التقرير بنجاح" : "Report deleted successfully");
      setReportToDelete(null);
    } catch (err) {
      showToast(isRtl ? "فشل حذف التقرير" : "Failed to delete report");
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = (report: AnalyticsReport) => {
    if (!report || (!report.metrics && !report.summary)) {
      showToast(isRtl ? "بيانات التقرير غير متوفرة للتنزيل" : "Report data is unavailable for download");
      return;
    }
    
    try {
      const data = JSON.stringify(report, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const date = new Date(report.createdAt).toISOString().split('T')[0];
      const type = report.reportType.charAt(0).toUpperCase() + report.reportType.slice(1);
      a.download = `FinX_${type}_Report_${date}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(isRtl ? "تم تنزيل التقرير" : "Report downloaded successfully");
    } catch (err) {
      showToast(isRtl ? "حدث خطأ أثناء التنزيل" : "Error downloading report");
    }
  };

  const getMetricLabel = (key: string) => {
    const labels: Record<string, { ar: string; en: string }> = {
      applications: { ar: "الطلبات المرسلة", en: "Applications Sent" },
      profileViews: { ar: "مشاهدات الملف", en: "Profile Views" },
      matchRate: { ar: "معدل التطابق", en: "Match Rate" },
      investorViews: { ar: "مشاهدات المستثمرين", en: "Investor Views" },
      fundingSecured: { ar: "التمويل المكتسب", en: "Funding Secured" },
      messages: { ar: "الرسائل", en: "Messages" },
      projectsSaved: { ar: "نشمي المحفوظة", en: "Saved نشمي" },
      messagesSent: { ar: "الرسائل المرسلة", en: "Messages Sent" },
      newMatches: { ar: "تطابقات جديدة", en: "New Matches" },
      savingsRate: { ar: "معدل الادخار", en: "Savings Rate" },
      expenses: { ar: "المصاريف", en: "Expenses" },
      healthScore: { ar: "الصحة المالية", en: "Health Score" },
    };
    return labels[key] ? (isRtl ? labels[key].ar : labels[key].en) : key;
  };

  const renderReportCard = (report: AnalyticsReport) => {
    return (
      <div key={report.id} className="bg-surface-primary border border-border-primary rounded-2xl p-5 mb-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                {isRtl ? "تقرير" : "Report"} • {report.reportType}
              </h3>
              <p className="text-xs text-text-secondary">
                {new Date(report.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-JO' : 'en-US')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => handleDownload(report)} className="p-2 text-text-secondary hover:text-indigo-600 transition-colors bg-bg-secondary hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
              <Download className="w-4 h-4" />
            </button>
            <button onClick={() => setReportToDelete(report)} className="p-2 text-text-secondary hover:text-rose-600 transition-colors bg-bg-secondary hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-bg-secondary/50 rounded-xl p-4 mb-4 border border-border-primary">
          <p className="text-sm text-text-primary font-medium leading-relaxed">
            {report.summary}
          </p>
        </div>

        {Object.keys(report.metrics).length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            {Object.entries(report.metrics).map(([key, val]) => (
              <div key={key} className="bg-white dark:bg-slate-950 border border-border-primary rounded-xl p-3 text-center">
                <span className="block text-[10px] uppercase text-text-secondary font-bold mb-1 truncate px-1">
                  {getMetricLabel(key)}
                </span>
                <span className="text-lg font-black text-text-primary font-mono">
                  {val}
                </span>
              </div>
            ))}
          </div>
        )}

        {report.insights.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              {isRtl ? "أبرز الرؤى" : "Key Insights"}
            </h4>
            {report.insights.map((ins, idx) => (
              <div key={idx} className="flex gap-3 p-3 rounded-xl bg-surface-primary border border-border-primary">
                <div className="shrink-0 mt-0.5">
                  {ins.type === "positive" ? <TrendingUp className="w-4 h-4 text-emerald-500" /> :
                   ins.type === "warning" ? <AlertCircle className="w-4 h-4 text-rose-500" /> :
                   <Target className="w-4 h-4 text-amber-500" />}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-text-primary">{ins.title}</h5>
                  <p className="text-[11px] text-text-secondary leading-snug mt-0.5">{ins.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const filteredReports = reports.filter(r => r.reportType === filterType);

  return (
    <div className={`flex flex-col h-full bg-[#F7F8FA] dark:bg-transparent ${isRtl ? 'text-right' : 'text-left'} relative`}>
      {toastMsg && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-lg font-medium text-sm animate-in slide-in-from-top-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {toastMsg}
        </div>
      )}
      
      <div className="p-4 sm:p-6 bg-surface-primary border-b border-border-primary shrink-0">
        <h2 className={`text-xl sm:text-2xl font-black text-text-primary flex items-center gap-2 mb-6 ${isRtl ? "justify-end flex-row-reverse" : ""}`}>
          <PieChart className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          {t.analytics || "Reports & Analytics"}
        </h2>
        
        <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 ${isRtl ? "sm:flex-row-reverse" : ""}`}>
          <div className="grid grid-cols-3 sm:flex sm:items-center gap-2 w-full sm:w-auto">
            {(["daily", "weekly", "monthly"] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type as ReportType)}
                className={`px-4 py-2.5 sm:py-2 text-xs font-bold rounded-xl transition-all capitalize whitespace-nowrap ${
                  filterType === type ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" : "bg-bg-secondary text-text-secondary hover:text-text-primary dark:hover:text-slate-300"
                }`}
              >
                {type === "daily" ? (isRtl ? "يومي" : "Daily") : type === "weekly" ? (isRtl ? "أسبوعي" : "Weekly") : (isRtl ? "شهري" : "Monthly")}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white px-5 py-3 sm:py-2.5 rounded-xl transition-all flex items-center justify-center shadow-lg shadow-indigo-500/20 font-bold text-sm shrink-0"
          >
            {isRtl ? "إنشاء تقرير" : "Generate Report"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-text-secondary h-full">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
            <span className="text-sm font-medium">{isRtl ? "جاري التحميل..." : "Loading reports..."}</span>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-text-secondary h-full bg-surface-primary border border-border-primary rounded-3xl">
            <div className="w-20 h-20 bg-bg-secondary rounded-2xl flex items-center justify-center mb-6 border border-border-primary">
              <FileText className="w-10 h-10 text-text-secondary dark:text-text-secondary" />
            </div>
            <p className="text-lg font-bold text-text-primary mb-2">{isRtl ? "لا توجد تقارير حالياً" : "No reports available"}</p>
            <p className="text-sm text-text-secondary max-w-sm mb-6">{isRtl ? "قم بإنشاء تقرير جديد للبدء" : "Generate a new report to get started."}</p>
            <button 
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 font-bold text-sm"
            >
              <Sparkles className="w-4 h-4 text-indigo-200" />
              {isRtl ? "إنشاء تقرير" : "Generate Report"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map(renderReportCard)}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !generating && setShowModal(false)} />
          <div className="bg-surface-primary rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden border border-border-primary animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border-primary flex justify-between items-center">
              <h3 className="text-lg font-black text-text-primary flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                {isRtl ? "إنشاء تقرير جديد" : "Generate New Report"}
              </h3>
              <button onClick={() => !generating && setShowModal(false)} className="p-2 text-text-secondary hover:text-slate-600 dark:hover:text-white transition-colors rounded-xl hover:bg-bg-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-text-primary">{isRtl ? "اختر الفترة الزمنية" : "Select Report Period"}</label>
                <div className="grid grid-cols-1 gap-3">
                  <button onClick={() => setModalType("daily")} className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all ${modalType === 'daily' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'border-border-primary bg-transparent hover:border-slate-300 dark:hover:border-slate-700'}`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${modalType === 'daily' ? 'border-indigo-500' : 'border-slate-300 dark:border-slate-600'}`}>
                      {modalType === 'daily' && <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full" />}
                    </div>
                    <div className="text-left rtl:text-right">
                      <div className="font-bold text-text-primary mb-1">{isRtl ? "يومي" : "Daily Report"}</div>
                      <div className="text-xs text-text-secondary">{isRtl ? "بيانات اليوم فقط." : "Today's data only."}</div>
                    </div>
                  </button>
                  <button onClick={() => setModalType("weekly")} className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all ${modalType === 'weekly' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'border-border-primary bg-transparent hover:border-slate-300 dark:hover:border-slate-700'}`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${modalType === 'weekly' ? 'border-indigo-500' : 'border-slate-300 dark:border-slate-600'}`}>
                      {modalType === 'weekly' && <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full" />}
                    </div>
                    <div className="text-left rtl:text-right">
                      <div className="font-bold text-text-primary mb-1">{isRtl ? "أسبوعي" : "Weekly Report"}</div>
                      <div className="text-xs text-text-secondary">{isRtl ? "بيانات آخر 7 أيام." : "Last 7 days."}</div>
                    </div>
                  </button>
                  <button onClick={() => setModalType("monthly")} className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all ${modalType === 'monthly' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'border-border-primary bg-transparent hover:border-slate-300 dark:hover:border-slate-700'}`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${modalType === 'monthly' ? 'border-indigo-500' : 'border-slate-300 dark:border-slate-600'}`}>
                      {modalType === 'monthly' && <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full" />}
                    </div>
                    <div className="text-left rtl:text-right">
                      <div className="font-bold text-text-primary mb-1">{isRtl ? "شهري" : "Monthly Report"}</div>
                      <div className="text-xs text-text-secondary">{isRtl ? "بيانات الشهر الحالي." : "Current month."}</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border-primary bg-bg-primary/50 flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)} 
                disabled={generating}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
              >
                {isRtl ? "إلغاء" : "Cancel"}
              </button>
              <button 
                onClick={handleGenerate}
                disabled={generating}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {generating ? (isRtl ? "جاري الإنشاء..." : "Generating...") : (isRtl ? "إنشاء" : "Generate")}
              </button>
            </div>
          </div>
        </div>
      )}

      {reportToDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !deleting && setReportToDelete(null)} />
          <div className="bg-surface-primary rounded-3xl shadow-2xl w-full max-w-sm relative z-10 overflow-hidden border border-border-primary animate-in fade-in zoom-in-95 duration-200 text-center">
            <div className="p-6">
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-200 dark:border-rose-500/20">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-text-primary mb-2">
                {isRtl ? "هل أنت متأكد من حذف هذا التقرير؟" : "Are you sure you want to delete this report?"}
              </h3>
              <p className="text-sm text-text-secondary">
                {isRtl ? "لا يمكن التراجع عن هذا الإجراء." : "This action cannot be undone."}
              </p>
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button 
                onClick={() => setReportToDelete(null)} 
                disabled={deleting}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
              >
                {isRtl ? "إلغاء" : "Cancel"}
              </button>
              <button 
                onClick={handleDeleteReport}
                disabled={deleting}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {deleting ? (isRtl ? "جاري الحذف..." : "Deleting...") : (isRtl ? "حذف التقرير" : "Delete Report")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
