import React, { useState, useRef, useEffect } from "react";
import { Camera, X, Check, RefreshCw, CreditCard, ShieldCheck, Zap, AlertCircle, ChevronRight, Loader2 } from "lucide-react";
import { translations } from "../translations";
import { auth } from "../lib/firebase";

interface CardScannerProps {
  lang: "ar" | "en";
  onSaveCard: (cardData: any) => void;
  onCancel: () => void;
}

export default function CardScanner({ lang, onSaveCard, onCancel }: CardScannerProps) {
  const t = translations[lang];
  const isRtl = lang === "ar";
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<any | null>(null);
  const [scanStep, setScanStep] = useState<"front" | "back">("front");
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  
  const previousFrameRef = useRef<ImageData | null>(null);
  const stableFramesCountRef = useRef(0);
  const checkIntervalRef = useRef<number | null>(null);
  
  // Review form state
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [brand, setBrand] = useState("");
  const [bankName, setBankName] = useState("");
  const [cvv, setCvv] = useState("");
  const [balance, setBalance] = useState("");

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const captureAndScanRef = useRef<() => void>(() => {});
  useEffect(() => {
    captureAndScanRef.current = captureAndScan;
  }); // update every render is fine, or we can just leave it as is if we put captureAndScan at the top

  const checkStability = () => {
    if (!videoRef.current || isScanning || !!error) return;
    const video = videoRef.current;
    
    // We need the video to be playing and have dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0 || video.paused) return;

    const checkCanvas = document.createElement('canvas');
    checkCanvas.width = 64;
    checkCanvas.height = 64;
    const ctx = checkCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    
    const sx = video.videoWidth * 0.1;
    const sy = video.videoHeight * 0.3;
    const sWidth = video.videoWidth * 0.8;
    const sHeight = video.videoHeight * 0.4;
    
    ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, 64, 64);
    
    const currentFrame = ctx.getImageData(0, 0, 64, 64);
    
    // Check contrast to avoid triggering on a blank wall or completely dark room
    let minLuma = 255;
    let maxLuma = 0;
    const data = currentFrame.data;
    for (let i = 0; i < data.length; i += 4) {
      const luma = data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114;
      if (luma < minLuma) minLuma = luma;
      if (luma > maxLuma) maxLuma = luma;
    }
    const contrast = maxLuma - minLuma;

    if (contrast < 40) {
      stableFramesCountRef.current = 0;
      setCountdown(null);
      previousFrameRef.current = currentFrame;
      return;
    }
    
    if (previousFrameRef.current) {
      let diff = 0;
      const data1 = currentFrame.data;
      const data2 = previousFrameRef.current.data;
      // sample every 4th pixel (step of 16 in RGBA array)
      for (let i = 0; i < data1.length; i += 16) {
        diff += Math.abs(data1[i] - data2[i]); // R
        diff += Math.abs(data1[i+1] - data2[i+1]); // G
        diff += Math.abs(data1[i+2] - data2[i+2]); // B
      }
      
      const avgDiff = diff / (1024 * 3);
      
      if (avgDiff < 20) { // Threshold for stability
        stableFramesCountRef.current += 1;
      } else {
        stableFramesCountRef.current = 0;
        setCountdown(null);
      }
    }
    
    previousFrameRef.current = currentFrame;

    // Stable for 1 interval = 1 second. Start countdown
    if (stableFramesCountRef.current >= 1) {
      setCountdown((prev) => {
        if (prev === null) return 3;
        if (prev === 1) {
           stableFramesCountRef.current = 0;
           setTimeout(() => {
             captureAndScanRef.current();
           }, 0);
           return null;
        }
        return prev - 1;
      });
    }
  };

  useEffect(() => {
    if (scannedData || error || isScanning) {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      setCountdown(null);
      stableFramesCountRef.current = 0;
      previousFrameRef.current = null;
      return;
    }

    stableFramesCountRef.current = 0;
    previousFrameRef.current = null;
    setCountdown(null);

    checkIntervalRef.current = window.setInterval(checkStability, 1000);

    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, [scannedData, error, isScanning, scanStep]);

  const startCamera = async () => {
    setError(null);
    stopCamera();
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      setStream(mediaStream);
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'NotFoundError') {
        setError(isRtl ? "تعذر الوصول إلى الكاميرا. يرجى التحقق من الأذونات." : "Could not access camera. Please check permissions.");
      } else {
        setError(isRtl ? "تعذر الوصول إلى الكاميرا." : "Could not access camera.");
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const mediaStream = videoRef.current.srcObject as MediaStream;
      mediaStream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const processImages = async (imagesBase64: string[]) => {
    setIsScanning(true);
    setError(null);
    if (videoRef.current) {
      videoRef.current.pause();
    }
    
    try {
      let token = "";
      if (auth.currentUser) {
        token = await auth.currentUser.getIdToken();
      }
      const response = await fetch("/api/parse-card", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ imageBase64: imagesBase64, language: lang })
      });
      
      if (!response.ok) throw new Error("API Error");
      
      const data = await response.json();
      
      setCardholderName(data.cardholderName || "");
      setCardNumber(data.cardNumber || "");
      setExpiryDate(data.expiryDate || "");
      setBrand(data.brand || "Visa");
      setBankName(data.bankName || "");
      setCvv(data.cvv || "");
      setBalance(data.balance || "");
      
      setScannedData(data);
      stopCamera();
    } catch (err) {
      console.error("Scanning failed", err);
      setError(isRtl ? "فشل المسح. يرجى المحاولة مرة أخرى." : "Scan failed. Please try again.");
      if (videoRef.current) videoRef.current.play();
    } finally {
      setIsScanning(false);
    }
  };

  const captureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setCountdown(null);
    stableFramesCountRef.current = 0;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageBase64 = canvas.toDataURL('image/jpeg', 0.8);
    
    if (scanStep === "front") {
      setFrontImage(imageBase64);
      setScanStep("back");
    } else {
      await processImages([frontImage!, imageBase64]);
    }
  };

  const skipBackScan = async () => {
    if (frontImage) {
      await processImages([frontImage]);
    }
  };

  const handleRetake = () => {
    setScannedData(null);
    setScanStep("front");
    setFrontImage(null);
    startCamera();
  };
  
  const handleSave = () => {
    // Mask card number for security before saving
    const last4 = cardNumber.replace(/\s/g, '').slice(-4) || "****";
    const maskedNumber = `**** **** **** ${last4}`;
    
    onSaveCard({
      cardholderName,
      cardNumber: maskedNumber, // Only save masked!
      expiryDate,
      brand,
      bankName,
      balance
    });
  };

  if (scannedData) {
    return (
      <div className="flex flex-col h-full bg-[#F7F8FA] dark:bg-transparent text-text-primary pb-20 p-5 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold">{isRtl ? "مراجعة التفاصيل" : "Review Details"}</h2>
          <button onClick={onCancel} className="p-2 bg-border-primary rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="bg-gradient-to-tr from-indigo-900 to-indigo-700 rounded-2xl p-6 shadow-xl mb-8 relative overflow-hidden">
          {/* Card Mockup */}
          <div className="absolute top-0 right-0 p-4 opacity-50"><CreditCard className="w-24 h-24 text-white/10" /></div>
          
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div className="font-bold text-white tracking-widest text-lg">{bankName || "BANK"}</div>
            <div className="font-bold text-white/80 italic">{brand}</div>
          </div>
          
          <div className="mb-6 relative z-10">
            <div className="font-mono text-xl tracking-wider text-white">
              {cardNumber || "**** **** **** ****"}
            </div>
          </div>
          
          <div className="flex justify-between items-end relative z-10">
            <div>
              <div className="text-[10px] text-indigo-200 uppercase tracking-wider mb-1">{isRtl ? "حامل البطاقة" : "Cardholder"}</div>
              <div className="font-semibold text-white tracking-wide">{cardholderName || "NAME"}</div>
            </div>
            <div>
               <div className="text-[10px] text-indigo-200 uppercase tracking-wider mb-1">{isRtl ? "تاريخ الانتهاء" : "Expires"}</div>
               <div className="font-mono text-white">{expiryDate || "MM/YY"}</div>
            </div>
          </div>
        </div>

        <div className="bg-surface-primary rounded-2xl p-5 border border-border-primary shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-primary/60">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-accent-green" />
            </div>
            <p className="text-sm font-medium text-text-secondary">
              {isRtl ? "المعلومات الحساسة مخفية في النظام تلقائيًا ولن يتم حفظ رقم البطاقة الكامل." : "Sensitive data will be masked. We never store your full card number."}
            </p>
          </div>

          <div className="space-y-4">
             <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">{isRtl ? "اسم البنك" : "Bank Name"}</label>
                <input 
                  type="text" 
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-bg-primary border border-border-primary rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
             </div>
             <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">{isRtl ? "الاسم على البطاقة" : "Name on Card"}</label>
                <input 
                  type="text" 
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  className="w-full bg-bg-primary border border-border-primary rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">{isRtl ? "رقم البطاقة" : "Card Number"}</label>
                  <input 
                    type="text" 
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-bg-primary border border-border-primary rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">{isRtl ? "تاريخ الانتهاء" : "Expiry"}</label>
                  <input 
                    type="text" 
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-bg-primary border border-border-primary rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                  />
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">{isRtl ? "الرقم السري (CVV)" : "CVV"}</label>
                  <input 
                    type="text" 
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="w-full bg-bg-primary border border-border-primary rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">{isRtl ? "الرصيد" : "Balance"}</label>
                  <input 
                    type="text" 
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    className="w-full bg-bg-primary border border-border-primary rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                  />
                </div>
             </div>
          </div>
        </div>
        
        <div className="flex gap-3 mt-auto">
           <button 
             onClick={handleRetake}
             className="flex-1 py-3.5 bg-bg-secondary hover:bg-bg-secondary text-text-primary font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
           >
             <RefreshCw className="w-4 h-4" />
             {isRtl ? "إعادة المسح" : "Retake"}
           </button>
           <button 
             onClick={handleSave}
             className="flex-[2] py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-colors flex items-center justify-center gap-2"
           >
             <Zap className="w-4 h-4 fill-current" />
             {isRtl ? "حفظ وبدء التحليل" : "Save & Analyze"}
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black relative pb-safe">
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="absolute top-0 inset-x-0 p-5 flex justify-between items-center z-40 bg-gradient-to-b from-black/60 to-transparent">
        <h2 className="text-white font-semibold text-lg drop-shadow-md">
          {isRtl ? "مسح البطاقة" : "Scan Card"}
        </h2>
        <button onClick={onCancel} className="relative z-50 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full transition-colors text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden flex items-center justify-center">
        {error ? (
          <div className="absolute inset-0 bg-transparent flex flex-col items-center justify-center p-6 z-30">
            <div className="w-full max-w-sm bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 flex flex-col items-center shadow-2xl relative overflow-hidden">
              {/* Top accent line */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
              
              {/* Premium Icon Container */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-900/40 to-slate-800/40 border border-indigo-500/20 flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 rounded-full bg-indigo-500/10 blur-xl"></div>
                <Camera className="w-10 h-10 text-indigo-300 relative z-10" strokeWidth={1.5} />
                <div className="absolute bottom-1 right-1 w-7 h-7 bg-slate-900 rounded-full flex items-center justify-center border border-white/10 shadow-lg">
                   <AlertCircle className="w-4 h-4 text-rose-400" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3 text-center tracking-wide">
                {isRtl ? "الكاميرا غير متاحة" : "Camera Unavailable"}
              </h3>
              
              <p className="text-text-secondary text-[15px] text-center mb-8 leading-relaxed font-medium">
                {isRtl 
                  ? "يبدو أننا لا نستطيع الوصول إلى الكاميرا في الوقت الحالي. يرجى التحقق من صلاحيات المتصفح أو المتابعة عبر هاتفك المحمول." 
                  : "We couldn't access your camera. Please check your browser permissions or try using your mobile device."}
              </p>
              
              <button 
                onClick={startCamera}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold rounded-xl shadow-[0_4px_20px_rgba(79,70,229,0.3)] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <RefreshCw className="w-4 h-4" />
                {isRtl ? "أعد المحاولة" : "Try Again"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              muted 
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Overlay to guide card alignment */}
            <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center">
               <div className={`w-[85%] aspect-[1.586/1] border-2 rounded-xl relative transition-colors duration-300 shadow-[0_0_0_4000px_rgba(0,0,0,0.5)] ${countdown !== null ? 'border-emerald-500/80 bg-emerald-500/10' : 'border-white/80'}`}>
                 <div className={`absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 rounded-tl-lg transition-colors duration-300 ${countdown !== null ? 'border-emerald-400' : 'border-indigo-500'}`}></div>
                 <div className={`absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 rounded-tr-lg transition-colors duration-300 ${countdown !== null ? 'border-emerald-400' : 'border-indigo-500'}`}></div>
                 <div className={`absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 rounded-bl-lg transition-colors duration-300 ${countdown !== null ? 'border-emerald-400' : 'border-indigo-500'}`}></div>
                 <div className={`absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 rounded-br-lg transition-colors duration-300 ${countdown !== null ? 'border-emerald-400' : 'border-indigo-500'}`}></div>
                 
                 {countdown !== null && (
                   <div className="absolute inset-0 flex items-center justify-center">
                     <span className="text-7xl font-bold text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] animate-pulse">
                       {countdown}
                     </span>
                   </div>
                 )}
               </div>
               <p className={`mt-8 font-medium tracking-wide drop-shadow-lg text-center transition-colors duration-300 ${countdown !== null ? 'text-emerald-400' : 'text-white opacity-90'}`}>
                 {countdown !== null
                   ? (isRtl ? "جاري الالتقاط... اثبت" : "Capturing... hold still")
                   : (scanStep === "front" 
                     ? (isRtl ? "قم بمحاذاة الوجه الأمامي للبطاقة" : "Align front of card")
                     : (isRtl ? "الآن قم بمحاذاة الوجه الخلفي (اختياري)" : "Now align back of card (optional)"))}
               </p>
            </div>
          </>
        )}
      </div>
      
      <div className="absolute bottom-0 inset-x-0 p-8 flex flex-col justify-center items-center pb-24 z-20 bg-gradient-to-t from-black via-black/80 to-transparent gap-4">
        <button 
          onClick={captureAndScan}
          disabled={isScanning || !!error}
          className={`w-20 h-20 rounded-full p-1.5 backdrop-blur-xl bg-white/10 border border-white/20 flex items-center justify-center transition-all hover:bg-white/20 active:scale-[0.96] shadow-[0_8px_32px_rgba(0,0,0,0.5)] ${isScanning || !!error ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <div className="w-full h-full bg-white rounded-full flex items-center justify-center shadow-inner">
            {isScanning ? (
              <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
            ) : (
              <Camera className="w-7 h-7 text-slate-900" />
            )}
          </div>
        </button>
        
        {scanStep === "back" && !isScanning && !error && (
          <button 
            onClick={skipBackScan}
            className="px-6 py-2 rounded-full bg-white/10 border border-white/20 text-white font-medium hover:bg-white/20 active:scale-95 transition-all text-sm"
          >
            {isRtl ? "تخطي والمسح" : "Skip & Analyze"}
          </button>
        )}
      </div>
    </div>
  );
}
