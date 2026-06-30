import React, { useRef, useState, useEffect } from "react";
import { Download, RefreshCw, X, ShieldAlert, Sparkles, Target, CheckCircle2, FileText } from "lucide-react";
import { toJpeg } from "html-to-image";
import { jsPDF } from "jspdf";
import { auth } from "../lib/firebase";
import { NotificationService } from "../services/NotificationService";

interface ReportPreviewModalProps {
  lang: "ar" | "en";
  messages: any[];
  onClose: () => void;
  userName?: string;
}

export default function ReportPreviewModal({ lang, messages, onClose, userName = "Nashmi User" }: ReportPreviewModalProps) {
  const isRtl = lang === "ar";
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const isMountedRef = useRef(true);
  const fetchAbortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (fetchAbortControllerRef.current) {
        fetchAbortControllerRef.current.abort();
      }
    };
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      let token = "";
      if (auth.currentUser) {
        token = await auth.currentUser.getIdToken();
      }
      
      if (fetchAbortControllerRef.current) {
        fetchAbortControllerRef.current.abort();
      }
      fetchAbortControllerRef.current = new AbortController();

      const response = await fetch("/api/coach-summary", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        signal: fetchAbortControllerRef.current.signal,
        body: JSON.stringify({ messages, language: lang, userName })
      });
      if (!response.ok) throw new Error("Failed to generate summary");
      const data = await response.json();
      if (!isMountedRef.current) return;
      setReport(data);

      if (auth.currentUser) {
        await NotificationService.createNotification(auth.currentUser.uid, {
          title: isRtl ? "تم إنشاء تقرير جديد" : "New Report Generated",
          message: isRtl ? "تم الانتهاء من إعداد تقرير الاستشارة المالية بنجاح." : "Your financial consultation report has been generated successfully.",
          category: "finance",
          type: "system"
        });
      }

    } catch (err: any) {
      if (err.name === "AbortError" || !isMountedRef.current) return;
      setError(err.message || "An error occurred");
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    
    try {
      setPdfGenerating(true);
      setError(null);
      
      const dataUrl = await toJpeg(reportRef.current, {
        quality: 1,
        backgroundColor: "#020617",
        pixelRatio: 2
      });
      
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = Math.max(297, (reportRef.current.offsetHeight * pdfWidth) / reportRef.current.offsetWidth);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [pdfWidth, pdfHeight]
      });
      
      pdf.addImage(dataUrl, "JPEG", 0, 0, pdfWidth, pdfHeight);
      
      const date = new Date().toISOString().split('T')[0];
      pdf.save(`FinX_Summary_${date}.pdf`);
      
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err) {
      console.log("PDF generation failed", err);
      setError(lang === "ar" ? "فشل إنشاء ملف PDF" : "Failed to extract and generate PDF");
    } finally {
      setPdfGenerating(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm ${isRtl ? 'font-arabic' : 'font-sans'}`} dir="ltr">
      <div className="bg-surface-primary border border-border-primary rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-300 dark:border-slate-800/80 bg-surface-primary/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">{lang === 'ar' ? 'ملخص الاستشارة' : 'Consultation Report Preview'}</h2>
              <p className="text-xs text-text-primary dark:text-text-secondary">{lang === 'ar' ? 'تقرير ذكي للمحادثة' : 'Smart conversation summary'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-text-primary dark:text-text-secondary hover:text-slate-900 dark:hover:text-white hover:bg-bg-secondary rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 no-scrollbar relative bg-[#F7F8FA] dark:bg-transparent">
          {loading && !report ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-text-primary dark:text-text-secondary animate-pulse">
                {lang === 'ar' ? 'جاري تحليل النقاش وإنشاء التقرير...' : 'Analyzing discussion and generating report...'}
              </p>
            </div>
          ) : error ? (
            <div className="bg-rose-500/10 border border-rose-500/30 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
              <ShieldAlert className="w-10 h-10 text-rose-600 dark:text-rose-400 mb-3" />
              <h3 className="text-text-primary font-bold mb-2">{lang === 'ar' ? 'حدث خطأ' : 'Error Occurred'}</h3>
              <p className="text-text-primary dark:text-text-secondary text-sm">{error}</p>
              <button onClick={fetchSummary} className="mt-4 px-4 py-2 bg-bg-secondary hover:bg-bg-secondary text-text-primary rounded-lg text-sm font-medium transition-colors">
                {lang === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
              </button>
            </div>
          ) : report ? (
            <div className="flex justify-center">
              {/* PDF Document Container - This gets captured by html-to-image */}
              <div 
                ref={reportRef} 
                className="w-[210mm] min-h-[297mm] bg-[#F7F8FA] dark:bg-transparent p-10 sm:p-14 relative overflow-hidden"
              >
                {/* PDF Graphics */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/5 rounded-full pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/5 rounded-full pointer-events-none"></div>
                
                {/* FinX Header Log */}
                <div className="border-b-2 border-border-primary pb-6 mb-8 flex items-end justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                      <span className="text-text-primary text-lg font-black font-sans tracking-tight">FX</span>
                    </div>
                    <div>
                      <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{report.title}</h1>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-widest px-2 py-0.5 rounded-sm bg-indigo-500/10 border border-indigo-500/20">AI Generated</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-text-primary dark:text-text-secondary uppercase tracking-widest font-mono mb-1">{lang === 'ar' ? 'نشمي برو' : 'NASHMI PRO'}</p>
                    <p className="text-sm font-medium text-text-primary">{new Date().toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p className="text-xs text-text-primary dark:text-text-secondary mt-0.5">{userName}</p>
                  </div>
                </div>

                {/* Body Content */}
                <div className="space-y-8 relative z-10">
                  {/* Summary */}
                  <div className="bg-slate-900/30 p-6 rounded-2xl border border-slate-300 dark:border-slate-800/80">
                    <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      {lang === 'ar' ? 'نظرة عامة' : 'Executive Summary'}
                    </h3>
                    <p className="text-text-primary text-sm leading-relaxed">{report.summary}</p>
                  </div>

                  {/* Key Points & Goals Matrix */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest border-b border-border-primary pb-2">
                        {lang === 'ar' ? 'أهم النقاط' : 'Key Points'}
                      </h3>
                      <ul className="space-y-3">
                        {report.keyPoints?.map((point: string, i: number) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></span>
                            <span className="text-sm text-text-primary leading-relaxed">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest border-b border-border-primary pb-2 flex items-center gap-2">
                        <Target className="w-4 h-4 text-accent-green" />
                        {lang === 'ar' ? 'الأهداف المرصودة' : 'Identified Goals'}
                      </h3>
                      <ul className="space-y-3">
                        {report.goals?.map((goal: string, i: number) => (
                          <li key={i} className="flex items-start gap-2.5 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
                            <CheckCircle2 className="w-4 h-4 text-accent-green mt-0.5 shrink-0" />
                            <span className="text-sm font-medium text-emerald-100">{goal}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Recommendations & Action Plan */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest border-b border-border-primary pb-2">
                      {lang === 'ar' ? 'التوصيات وخطة العمل' : 'Recommendations & Action Plan'}
                    </h3>
                    
                    <div className="space-y-4">
                      {report.recommendations?.map((rec: string, i: number) => (
                        <div key={i} className="flex gap-4 p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/10">
                          <div className="w-8 h-8 shrink-0 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold font-mono text-sm border border-indigo-500/30">
                            R{i + 1}
                          </div>
                          <p className="text-sm text-text-primary leading-relaxed mt-1">{rec}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                      {report.actionPlan?.map((plan: string, i: number) => (
                        <div key={i} className="p-4 rounded-xl bg-surface-primary border border-border-primary flex flex-col gap-2">
                          <span className="text-xs font-bold text-text-primary dark:text-text-secondary uppercase">Step 0{i + 1}</span>
                          <p className="text-sm text-text-primary font-medium">{plan}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Warnings */}
                  {report.warnings && report.warnings.length > 0 && (
                    <div className="bg-rose-950/20 p-5 rounded-2xl border border-rose-500/20">
                      <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4" />
                        {lang === 'ar' ? 'ملاحظات وتحذيرات' : 'Warnings & Cautions'}
                      </h3>
                      <ul className="space-y-2">
                        {report.warnings.map((warn: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-rose-200 text-sm">
                            <span className="mt-1 opacity-70">•</span>
                            {warn}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>

                {/* Footer */}
                <div className="mt-12 pt-6 border-t border-border-primary text-center opacity-60">
                  <p className="text-[10px] uppercase tracking-widest text-text-primary dark:text-text-secondary font-mono">
                    Generated securely by FinX Intelligence | © {new Date().getFullYear()}
                  </p>
                </div>

              </div>
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-300 dark:border-slate-800/80 bg-surface-primary flex items-center justify-end gap-3 rounded-b-3xl">
          <button 
            onClick={fetchSummary}
            disabled={loading || pdfGenerating}
            className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-bg-secondary hover:bg-bg-secondary text-text-primary text-sm font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading && !pdfGenerating ? 'animate-spin' : ''}`} />
            {lang === 'ar' ? 'إعادة التوليد' : 'Regenerate'}
          </button>
          
          <button 
            onClick={handleDownloadPdf}
            disabled={loading || pdfGenerating || !report || successMsg}
            className={`px-6 py-2.5 rounded-xl text-text-primary text-sm font-bold shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 ${successMsg ? 'bg-accent-green hover:bg-emerald-500 shadow-emerald-500/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'}`}
          >
            {pdfGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>{lang === 'ar' ? 'جاري انشاء PDF...' : 'Generating PDF...'}</span>
              </>
            ) : successMsg ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{lang === 'ar' ? 'تم إنشاء PDF بنجاح' : 'PDF generated successfully'}</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{lang === 'ar' ? 'تحميل التقرير PDF' : 'Download PDF'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
