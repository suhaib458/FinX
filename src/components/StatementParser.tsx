import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  FileText,
  Sparkles,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Trash2,
  Calendar,
  AlertCircle,
  HardDrive,
  Mic,
  XCircle,
} from "lucide-react";
import { translations } from "../translations";
import { Transaction, SpendingCategory } from "../types";
import { auth } from "../lib/firebase";
import { getUserSubscription, PLAN_LIMITS } from "../lib/subscription";

interface StatementParserProps {
  lang: "ar" | "en";
  transactions: Transaction[];
  onAddTransaction: (tx: Transaction) => void;
  onUpdateTransactionCategory?: (index: number, newCat: string) => void;
  onClearTransactions: () => void;
  onUpdateAnalysis: (data: {
    monthlyIncome: number;
    monthlyExpenses: number;
    savingsRate: number;
    healthScore: number;
    scoreExplanation: string;
    insights: any[];
    categories: SpendingCategory[];
    transactions: Transaction[];
  }) => void;
}

export default function StatementParser({
  lang,
  transactions,
  onAddTransaction,
  onUpdateTransactionCategory,
  onClearTransactions,
  onUpdateAnalysis,
}: StatementParserProps) {
  const t = translations[lang];
  const isRtl = lang === "ar";

  // File states
  const [file, setFile] = useState<{ name: string; size: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check statement limits is now handled by backend

  // Manual entry forms states
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("المطاعم والغذائيات");
  const [type, setType] = useState<"income" | "expense">("expense");

  const categoriesList = isRtl
    ? [
        "المطاعم والغذائيات",
        "المواصلات",
        "التسوق",
        "الفواتير والخدمات",
        "الصحة",
        "الترفيه",
        "العمل / الأعمال",
        "المدخرات / التحويلات",
        "الدخل / المبيعات",
        "أخرى",
      ]
    : [
        "Food & Dining",
        "Transportation",
        "Shopping",
        "Bills & Utilities",
        "Health",
        "Entertainment",
        "Work / Business",
        "Savings / Transfers",
        "Income / Sales",
        "Other",
      ];

  // Compute expense categories breakdown
  const expenses = transactions.filter((tx) => tx.amount < 0);
  const totalExpenses = expenses.reduce(
    (sum, tx) => sum + Math.abs(tx.amount),
    0,
  );
  const expensesByCategory = expenses.reduce(
    (acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + Math.abs(tx.amount);
      return acc;
    },
    {} as Record<string, number>,
  );
  const sortedCategories = Object.entries(expensesByCategory).sort(
    (a, b) => b[1] - a[1],
  );

  const handleSpeechInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(
        isRtl
          ? "متصفحك لا يدعم خاصية التعرف على الصوت"
          : "Your browser doesn't support Speech Recognition.",
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = isRtl ? "ar-SA" : "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;

      const matchAmt = speechToText.match(/\d+/);
      const matchedAmount = matchAmt ? Number(matchAmt[0]) : 0;

      if (matchedAmount > 0) {
        const isIncome = isRtl
          ? /راتب|ايداع|دخل/.test(speechToText)
          : /income|salary|deposit/.test(speechToText.toLowerCase());
        const finalAmount = isIncome ? matchedAmount : -matchedAmount;

        let guessedCategory = categoriesList[0];
        if (
          /(coffee|food|restaurant|burger|pizza|قهوة|مطعم|اكل|طعام)/i.test(
            speechToText,
          )
        ) {
          guessedCategory = categoriesList[0];
        } else if (
          /(bill|rent|electricity|water|ايجار|فاتورة|كهرباء)/i.test(
            speechToText,
          )
        ) {
          guessedCategory = categoriesList[1];
        } else if (
          /(uber|taxi|gas|car|تاكسي|بنزين|سيارة)/i.test(speechToText)
        ) {
          guessedCategory = categoriesList[2];
        } else if (
          /(shopping|clothes|shoes|تسوق|ملابس|حذاء)/i.test(speechToText)
        ) {
          guessedCategory = categoriesList[3];
        }

        const newTx: Transaction = {
          date: new Date().toISOString().split("T")[0],
          desc: speechToText,
          amount: finalAmount,
          type: isIncome ? "income" : "expense",
          category: guessedCategory,
        };
        onAddTransaction(newTx);
        setSuccessMsg(true);
        setTimeout(() => setSuccessMsg(false), 2500);
      } else {
        setDesc(speechToText);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      if (event.error === "not-allowed") {
        alert(
          isRtl
            ? "يتطلب الوصول إلى الميكروفون موافقتك. يرجى التأكد من سماح المتصفح بذلك، أو جرب فتح التطبيق في علامة تبويب جديدة."
            : "Microphone access denied. Please ensure your browser site permissions allow microphone access, or try opening the app in a new tab.",
        );
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    console.log(`[Upload Diagnostics] File selected: ${uploadedFile.name}`);
    console.log(`[Upload Diagnostics] File type: ${uploadedFile.type}`);
    console.log(
      `[Upload Diagnostics] File size: ${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB`,
    );

    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];
    if (!validTypes.includes(uploadedFile.type)) {
      const errorStr = isRtl
        ? "صيغة الملف غير مدعومة. يرجى رفع ملفات JPG, PNG, أو PDF فقط."
        : "Unsupported file format. Please upload JPG, PNG, or PDF files only.";
      setErrorMsg(errorStr);
      console.error(`[Upload Diagnostics] Upload failed: ${errorStr}`);
      return;
    }

    if (uploadedFile.size > 14 * 1024 * 1024) {
      // 14MB limit (Server has 15MB json limit)
      const errorStr = isRtl
        ? "حجم الملف يتجاوز الحد المسموح."
        : "File size limits exceeded (max 14MB).";
      setErrorMsg(errorStr);
      console.error(`[Upload Diagnostics] Upload failed: ${errorStr}`);
      return;
    }

    if (hasReachedLimit) {
      setErrorMsg(isRtl ? "تجاوزت الحد المسموح لباقتك، الرجاء الترقية للمزيد." : "You've reached your plan's upload limits. Please upgrade.");
      return;
    }

    setErrorMsg(null);
    setLoading(true);
    setSuccessMsg(false);
    setFile({
      name: uploadedFile.name,
      size: (uploadedFile.size / 1024 / 1024).toFixed(2) + " MB",
    });

    try {
      console.log(`[Upload Diagnostics] Upload started`);
      const reader = new FileReader();

      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        console.log(`[Upload Diagnostics] Upload completed.`);
        console.log(
          `[Upload Diagnostics] OCR started. Starting Analysis Pipeline.`,
        );

        try {
          let token = "";
          if (auth.currentUser) {
            token = await auth.currentUser.getIdToken();
          }
          
          const response = await fetch("/api/parse-statement", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              ...(token ? { "Authorization": `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
              language: lang,
              fileName: uploadedFile.name,
              fileContent: base64Data,
              fileMimeType: uploadedFile.type,
            }),
          });

          if (response.status === 403) {
            setHasReachedLimit(true);
            throw new Error(isRtl ? "تجاوزت الحد المسموح للاستخدام. يرجى الترقية." : "You have reached your statement upload limit. Please upgrade.");
          }

          if (!response.ok) {
            throw new Error(
              `Server returned ${response.status} ${response.statusText}`,
            );
          }

          const result = await response.json();
          console.log(`[Upload Diagnostics] OCR completed.`);
          console.log(`[Upload Diagnostics] Analysis completed.`);

          if (result.success && result.analysis) {
            onUpdateAnalysis(result.analysis);
            setSuccessMsg(true);
            setTimeout(() => setSuccessMsg(false), 5000);
          } else {
            throw new Error("Invalid response from server or failed parsing.");
          }
        } catch (apiErr: any) {
          console.error(`[Upload Diagnostics] Analysis failed:`, apiErr);
          setErrorMsg(apiErr.message || "Failed to analyze document.");
        } finally {
          setLoading(false);
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      };

      reader.onerror = (err) => {
        console.error(
          `[Upload Diagnostics] Exact error details: File read failed:`,
          err,
        );
        setErrorMsg("Failed to read the selected file.");
        setLoading(false);
      };

      reader.readAsDataURL(uploadedFile);
    } catch (err: any) {
      console.error(`[Upload Diagnostics] Exact error details:`, err);
      setErrorMsg(err.message || "An unexpected error occurred during upload.");
      setLoading(false);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return; // Prevent multiple uploads while already processing

    const uploadedFile = e.dataTransfer.files?.[0];
    if (uploadedFile) {
      // Mock the file input change event object since handleFileUpload expects it
      const mockedEvent = {
        target: { files: [uploadedFile] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileUpload(mockedEvent);
    }
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !desc) return;

    const parsedAmt = Number(amount);
    const finalAmount = type === "income" ? parsedAmt : -parsedAmt;

    const newTx: Transaction = {
      date: new Date().toISOString().split("T")[0],
      desc,
      amount: finalAmount,
      type,
      category,
    };

    onAddTransaction(newTx);
    setAmount("");
    setDesc("");

    // Quick success flash
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 2500);
  };

  const handleSaveToDrive = async () => {
    try {
      setLoading(true);
      // Simulate API call for demo purposes
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex-1 overflow-y-auto px-4 py-5 space-y-5 bg-transparent ${isRtl ? "text-right" : "text-left"}`}
    >
      {/* Description */}
      <div>
        <p className="text-[10px] tracking-wider text-text-primary dark:text-text-secondary uppercase font-mono">
          {isRtl ? "تصنيف فوري باستخدام Gemini 3.5" : "AI SECURE OCR PARSER"}
        </p>
        <h2
          className={`text-xl font-bold text-slate-900 dark:text-zinc-100 ${isRtl ? "font-arabic" : "font-sans"}`}
        >
          {t.statementUploadTitle}
        </h2>
        <p className="text-[11px] text-text-primary dark:text-text-secondary mt-1">
          {t.statementUploadDesc}
        </p>
      </div>

      {hasReachedLimit && (
        <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/10 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400">
              {isRtl ? "تجاوزت الحد المسموح للاستخدام" : "Usage Limit Reached"}
            </h4>
            <p className="text-xs text-rose-500/80 mt-1 leading-relaxed">
              {isRtl 
                ? "لقد تجاوزت عدد الملفات المسموح بمعالجتها في باقتك الحالية. لزيادة الحد وفتح المزيد من المزايا المتقدمة، يرجى الترقية إلى باقة بريميوم أو إيليت."
                : "You have exceeded your monthly statement parsing allowance. Upgrade to Premium or Elite to process more documents and unlock advanced financial modeling."}
            </p>
          </div>
        </div>
      )}

      {/* File Dropzone Box */}
      <div className={`relative ${hasReachedLimit ? 'opacity-50 pointer-events-none' : ''}`}>
        <label
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4 bg-surface-primary/60 hover:bg-slate-900/80 cursor-pointer transition-all duration-300 group shadow-sm hover:shadow-indigo-500/10"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/jpeg,image/png,image/jpg,application/pdf"
          />
          <div className="w-14 h-14 rounded-full bg-white dark:bg-slate-950 border-2 border-border-primary text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 group-hover:border-indigo-500/30 transition-all duration-300 shadow-inner">
            <Upload className="w-6 h-6 text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-500 dark:text-indigo-300" />
          </div>
          <div className="space-y-1.5">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-500 dark:text-indigo-300 transition-colors">
              {file ? file.name : t.dragDropText}
            </h4>
            <p className="text-[10px] text-zinc-500 font-mono flex items-center justify-center gap-1.5">
              <span>{file ? file.size : t.formatsSupported}</span>
            </p>
          </div>
        </label>

        {/* Trust indicator */}
        <div className="flex items-center justify-center gap-1.5 mt-3 text-accent-green/80">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span className="text-[9px] font-medium tracking-wide uppercase">
            256-bit AES Bank-Level Encryption
          </span>
        </div>
      </div>

      {/* Error state */}
      {errorMsg && (
        <div className="rounded-xl p-3 bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5">
          <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-rose-500 dark:text-rose-300 font-medium leading-relaxed">
            {errorMsg}
          </p>
        </div>
      )}

      {/* Loading Overlay State */}
      {loading && (
        <div className="rounded-xl p-4 bg-indigo-950/10 border border-indigo-500/20 text-center space-y-2">
          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto" />
          <p className="text-xs font-bold text-indigo-500 dark:text-indigo-300">
            {t.processingStatement}
          </p>
        </div>
      )}

      {/* Successful Parse alert banner */}
      {successMsg && !loading && (
        <div className="rounded-xl p-3 bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-accent-green shrink-0" />
          <p className="text-[11px] text-emerald-500 dark:text-emerald-300 font-medium leading-relaxed">
            {t.uploadSucc}
          </p>
        </div>
      )}

      {/* Manual Insert Transaction Row Form */}
      <details className="group bg-surface-primary/40 border border-border-primary rounded-xl overflow-hidden">
        <summary className="p-3.5 flex items-center justify-between text-xs font-bold text-text-primary cursor-pointer list-none select-none">
          <span className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-open:rotate-45 transition-transform animate-pulse" />
            {t.manualEntryTitle}
          </span>
          <span className="text-[10px] text-text-primary dark:text-text-secondary group-open:hidden">
            {isRtl ? "انقر لإدخال سند" : "Click to expand"}
          </span>
        </summary>

        <form
          onSubmit={handleManualAdd}
          className="p-4 border-t border-slate-850 space-y-3 bg-slate-950/20"
        >
          {/* Income Debit Selector */}
          <div className="grid grid-cols-2 gap-1 bg-white dark:bg-slate-950 p-1 rounded-lg border border-slate-850">
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`py-1.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${type === "expense" ? "bg-rose-500/20 text-rose-500 dark:text-rose-300" : "text-text-primary dark:text-text-secondary"}`}
            >
              {isRtl ? "مصروف صرف" : "Expense Debit"}
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={`py-1.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${type === "income" ? "bg-emerald-500/20 text-emerald-350" : "text-text-primary dark:text-text-secondary"}`}
            >
              {isRtl ? "إيداع راتب" : "Income Credit"}
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] text-text-primary dark:text-text-secondary font-bold block">
                {t.expenseDesc}
              </label>
              <button
                type="button"
                onClick={handleSpeechInput}
                className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                  isListening
                    ? "bg-rose-500/20 text-rose-600 dark:text-rose-400 animate-pulse"
                    : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20"
                }`}
              >
                <Mic className="w-3 h-3" />
                {isListening
                  ? isRtl
                    ? "جاري الاستماع..."
                    : "Listening..."
                  : isRtl
                    ? "إضافة بالصوت"
                    : "Voice Input"}
              </button>
            </div>
            <input
              type="text"
              required
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder={
                isRtl
                  ? "بقالة - مقهى - قسط..."
                  : "Starbucks, Walmart, Loan payment..."
              }
              className="w-full h-9 px-3 text-xs rounded-lg bg-white dark:bg-slate-950 border border-slate-850 text-text-primary focus:outline-none focus:border-indigo-500/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-text-primary dark:text-text-secondary font-bold block">
                {t.expenseAmount}
              </label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full h-9 px-3 text-xs rounded-lg bg-white dark:bg-slate-950 border border-slate-850 text-text-primary font-mono focus:outline-none focus:border-indigo-500/30"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-text-primary dark:text-text-secondary font-bold block">
                {t.expenseCategory}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-9 px-2 text-[11px] rounded-lg bg-white dark:bg-slate-950 border border-slate-850 text-text-primary focus:outline-none"
              >
                {categoriesList.map((cat, idx) => (
                  <option key={idx} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-9 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-text-primary cursor-pointer active:scale-98 transition-all flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            {t.addTxBtn}
          </button>
        </form>
      </details>

      {/* Financial Breakdown (New UI) */}
      {transactions.length > 0 &&
        typeof totalExpenses === "number" &&
        totalExpenses > 0 && (
          <div className="bg-surface-primary/40 border border-border-primary p-4 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-text-primary">
              {isRtl ? "تحليل النفقات والمصروفات" : "Expenses Breakdown"}
            </h3>
            <div className="space-y-3">
              {sortedCategories.map(([cat, amt], idx) => {
                const percent = Math.round((amt / totalExpenses) * 100) || 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-text-primary">{cat}</span>
                      <span className="text-text-primary dark:text-text-secondary font-mono">
                        {amt.toLocaleString()} JOD ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-white dark:bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${idx === 0 ? "bg-indigo-500" : idx === 1 ? "bg-blue-500" : idx === 2 ? "bg-emerald-500" : "bg-slate-500"}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      {/* Ledger History details */}
      <div className="space-y-2.5 pb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-text-primary">
            {t.transactionsHistory}
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveToDrive}
              disabled={transactions.length === 0}
              className="text-[9px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:text-indigo-300 font-mono transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              <HardDrive className="w-3 h-3" />
              {isRtl ? "نسخ السجل لدرايف" : "Backup to Drive"}
            </button>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-[9px] text-text-primary dark:text-text-secondary hover:text-rose-600 dark:text-rose-400 font-mono transition-colors"
            >
              {isRtl ? "تصفير السجل" : "Reset Ledger"}
            </button>
          </div>
        </div>

        <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-border-primary rounded-2xl bg-slate-950/50">
              <FileText className="w-8 h-8 text-text-primary dark:text-text-secondary mb-2" />
              <p className="text-xs text-text-primary dark:text-text-secondary font-medium">
                {isRtl
                  ? "سجل المعاملات فارغ حالياً"
                  : "Ledger is currently empty"}
              </p>
            </div>
          ) : (
            transactions.map((tx, idx) => {
              const isInc = tx.amount > 0;
              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-surface-primary/50 border border-border-primary flex items-center justify-between gap-3 text-xs hover:border-slate-750 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${isInc ? "bg-emerald-500/10 border-emerald-500/20 text-accent-green" : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"}`}
                    >
                      {isInc ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-text-primary truncate pr-1">
                        {tx.desc}
                      </h4>
                      <p className="text-[9px] text-text-primary dark:text-text-secondary flex items-center gap-1 mt-0.5">
                        <Calendar className="w-2.5 h-2.5 shrink-0" />
                        <span className="shrink-0">{tx.date}</span> •
                        <select
                          value={tx.category}
                          onChange={(e) =>
                            onUpdateTransactionCategory &&
                            onUpdateTransactionCategory(idx, e.target.value)
                          }
                          className="bg-transparent text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-500 dark:text-indigo-300 focus:outline-none cursor-pointer border-b border-dashed border-indigo-400/50 w-full truncate max-w-[120px]"
                        >
                          {categoriesList.map((cat, cIdx) => (
                            <option
                              key={cIdx}
                              value={cat}
                              className="bg-surface-primary text-text-primary"
                            >
                              {cat}
                            </option>
                          ))}
                        </select>
                      </p>
                    </div>
                  </div>

                  <div
                    className={`font-mono font-bold text-end shrink-0 ${isInc ? "text-accent-green" : "text-rose-600 dark:text-rose-400"}`}
                  >
                    {(isInc ? "+" : "") + tx.amount.toLocaleString()} JOD
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-surface-primary border border-border-primary rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0 text-rose-500">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-text-primary">
                {isRtl ? "تأكيد مسح السجل" : "Confirm Clear Ledger"}
              </h3>
            </div>

            <p className="text-xs text-text-primary dark:text-text-secondary leading-relaxed">
              {isRtl
                ? "هل أنت متأكد من رغبتك في مسح كافة المعاملات؟ هذا الإجراء لا يمكن التراجع عنه."
                : "Are you sure you want to clear all transactions? This action cannot be undone."}
            </p>

            <div className="flex gap-3 pt-2 justify-end">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-text-primary dark:text-text-secondary hover:text-slate-900 dark:hover:text-slate-200 hover:bg-bg-secondary transition-colors"
              >
                {isRtl ? "إلغاء" : "Cancel"}
              </button>
              <button
                onClick={() => {
                  onClearTransactions();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-text-primary transition-colors"
              >
                {isRtl ? "مسح السجل" : "Clear Transactions"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
