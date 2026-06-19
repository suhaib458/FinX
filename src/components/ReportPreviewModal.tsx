import React, { useRef, useState, useEffect } from "react";
import { Download, RefreshCw, X, ShieldAlert, Sparkles, Target, CheckCircle2, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/coach-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, language: lang, userName })
      });
      if (!response.ok) throw new Error("Failed to generate summary");
      const data = await response.json();
      setReport(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    
    try {
      setLoading(true);
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: "#020617",
      });
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`FinX_Report_${new Date().getTime()}.pdf`);
    } catch (err) {
      console.error("PDF generation failed", err);
      alert("Failed to generate PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm ${isRtl ? 'font-arabic' : 'font-sans'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-200">{lang === 'ar' ? 'ملخص الاستشارة' : 'Consultation Report Preview'}</h2>
              <p className="text-xs text-slate-400">{lang === 'ar' ? 'تقرير ذكي للمحادثة' : 'Smart conversation summary'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 no-scrollbar relative bg-[#020617]">
          {loading && !report ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-slate-400 animate-pulse">
                {lang === 'ar' ? 'جاري تحليل النقاش وإنشاء التقرير...' : 'Analyzing discussion and generating report...'}
              </p>
            </div>
          ) : error ? (
            <div className="bg-rose-500/10 border border-rose-500/30 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
              <ShieldAlert className="w-10 h-10 text-rose-400 mb-3" />
              <h3 className="text-slate-200 font-bold mb-2">{lang === 'ar' ? 'حدث خطأ' : 'Error Occurred'}</h3>
              <p className="text-slate-400 text-sm">{error}</p>
              <button onClick={fetchSummary} className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-colors">
                {lang === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
              </button>
            </div>
          ) : report ? (
            <div className="flex justify-center">
              {/* PDF Document Container - This gets captured by html2canvas */}
              <div 
                ref={reportRef} 
                className="w-[210mm] min-h-[297mm] bg-[#020617] p-10 sm:p-14 relative overflow-hidden"
              >
                {/* PDF Graphics */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/5 blur-[100px] rounded-full pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/5 blur-[100px] rounded-full pointer-events-none"></div>
                
                {/* FinX Header Log */}
                <div className="border-b-2 border-slate-800 pb-6 mb-8 flex items-end justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                      <span className="text-white text-lg font-black font-sans tracking-tight">FX</span>
                    </div>
                    <div>
                      <h1 className="text-2xl font-black text-slate-100 tracking-tight">{report.title}</h1>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest px-2 py-0.5 rounded-sm bg-indigo-500/10 border border-indigo-500/20">AI Generated</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-mono mb-1">{lang === 'ar' ? 'نشمي برو' : 'NASHMI PRO'}</p>
                    <p className="text-sm font-medium text-slate-300">{new Date().toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{userName}</p>
                  </div>
                </div>

                {/* Body Content */}
                <div className="space-y-8 relative z-10">
                  {/* Summary */}
                  <div className="bg-slate-900/30 p-6 rounded-2xl border border-slate-800/80">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      {lang === 'ar' ? 'نظرة عامة' : 'Executive Summary'}
                    </h3>
                    <p className="text-slate-200 text-sm leading-relaxed">{report.summary}</p>
                  </div>

                  {/* Key Points & Goals Matrix */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest border-b border-slate-800 pb-2">
                        {lang === 'ar' ? 'أهم النقاط' : 'Key Points'}
                      </h3>
                      <ul className="space-y-3">
                        {report.keyPoints?.map((point: string, i: number) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></span>
                            <span className="text-sm text-slate-300 leading-relaxed">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
                        <Target className="w-4 h-4 text-emerald-400" />
                        {lang === 'ar' ? 'الأهداف المرصودة' : 'Identified Goals'}
                      </h3>
                      <ul className="space-y-3">
                        {report.goals?.map((goal: string, i: number) => (
                          <li key={i} className="flex items-start gap-2.5 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                            <span className="text-sm font-medium text-emerald-100">{goal}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Recommendations & Action Plan */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest border-b border-slate-800 pb-2">
                      {lang === 'ar' ? 'التوصيات وخطة العمل' : 'Recommendations & Action Plan'}
                    </h3>
                    
                    <div className="space-y-4">
                      {report.recommendations?.map((rec: string, i: number) => (
                        <div key={i} className="flex gap-4 p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/10">
                          <div className="w-8 h-8 shrink-0 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold font-mono text-sm border border-indigo-500/30">
                            R{i + 1}
                          </div>
                          <p className="text-sm text-slate-200 leading-relaxed mt-1">{rec}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                      {report.actionPlan?.map((plan: string, i: number) => (
                        <div key={i} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
                          <span className="text-xs font-bold text-slate-500 uppercase">Step 0{i + 1}</span>
                          <p className="text-sm text-slate-300 font-medium">{plan}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Warnings */}
                  {report.warnings && report.warnings.length > 0 && (
                    <div className="bg-rose-950/20 p-5 rounded-2xl border border-rose-500/20">
                      <h3 className="text-sm font-bold text-rose-400 uppercase tracking-widest mb-3 flex items-center gap-2">
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
                <div className="mt-12 pt-6 border-t border-slate-800 text-center opacity-60">
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">
                    Generated securely by FinX Intelligence | © {new Date().getFullYear()}
                  </p>
                </div>

              </div>
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800/80 bg-[#0f172a] flex items-center justify-end gap-3 rounded-b-3xl">
          <button 
            onClick={fetchSummary}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {lang === 'ar' ? 'إعادة التوليد' : 'Regenerate'}
          </button>
          
          <button 
            onClick={handleDownloadPdf}
            disabled={loading || !report}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading && !!report ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Download className="w-4 h-4" />
            )}
            {lang === 'ar' ? 'تحميل التقرير PDF' : 'Download PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
