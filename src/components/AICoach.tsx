import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  BrainCircuit,
  AlertCircle,
  Trash2,
  Mic,
  MicOff,
  Paperclip,
  X,
  Download,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  MessageSquarePlus,
  Play,
  Pause,
  Square,
  RefreshCcw,
  ExternalLink,
  Briefcase,
  Copy,
  Check,
  CheckSquare,
} from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { translations } from "../translations";
import { ChatMessage } from "../types";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  orderBy,
  deleteDoc,
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { getUserSubscription, PLAN_LIMITS } from "../lib/subscription";
import { saveCareerProfile, getCareerProfile, CareerProfile } from "../lib/career";
import ReportPreviewModal from "./ReportPreviewModal";
import Avatar from "./Avatar";
import JobResultCard from "./JobResultCard";
import { useAICoachHistory } from "../hooks/useAICoachHistory";

interface AICoachProps {
  lang: "ar" | "en";
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  activeConversationId: string | null;
  setActiveConversationId: React.Dispatch<React.SetStateAction<string | null>>;
  analysis: any;
  onAction?: () => void;
  pendingPrompt?: string | null;
  clearPendingPrompt?: () => void;
}

// Global declaration for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function AICoach({
  lang,
  messages,
  setMessages,
  activeConversationId,
  setActiveConversationId,
  analysis,
  onAction,
  pendingPrompt,
  clearPendingPrompt,
}: AICoachProps) {
  const t = translations[lang];
  const isRtl = lang === "ar";
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);

  useEffect(() => {
    // Check messaging limits
    if (auth.currentUser && messages.length > 0) {
      getUserSubscription(auth.currentUser.uid).then(sub => {
        const limits = PLAN_LIMITS[sub.plan];
        const userMsgCount = messages.filter(m => m.role === 'user').length;
        if (limits.aiCoachMessages !== -1 && userMsgCount >= limits.aiCoachMessages) {
          setHasReachedLimit(true);
        } else {
          setHasReachedLimit(false);
        }
      });
    }
  }, [messages.length]);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Message interaction states
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const {
    conversations,
    showHistorySidebar,
    setShowHistorySidebar,
    conversationToDelete,
    setConversationToDelete,
    showClearAllConfirm,
    setShowClearAllConfirm,
    createNewChat,
    saveConversation,
    loadConversation,
    deleteConversation,
    executeDeleteAllConversations
  } = useAICoachHistory(
    activeConversationId,
    setActiveConversationId,
    setMessages,
    t.chatGreeting,
    window.innerWidth < 640
  );

  const confirmDeleteConversation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setConversationToDelete(id);
  };

  const requestDeleteAllConversations = () => {
    setShowClearAllConfirm(true);
  };

  // Message Interaction Functions
  const copyTextToClipboard = async (text: string, msgId: string) => {
    console.log(
      `[Copy Diagnostics] Message ID: ${msgId}, Character count: ${text.length}`,
    );
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        console.log(
          `[Copy Diagnostics] Successfully copied via navigator.clipboard.`,
        );
        return true;
      } else {
        throw new Error("Clipboard API not available or not secure context");
      }
    } catch (err) {
      console.warn(
        `[Copy Diagnostics] navigator.clipboard failed, falling back to execCommand. Error:`,
        err,
      );
      // Fallback for older browsers or non-secure contexts (iframes)
      const textArea = document.createElement("textarea");
      textArea.value = text;
      // Fixed properties to prevent scrolling and ensure it holds long text
      textArea.style.position = "fixed";
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.width = "2em";
      textArea.style.height = "2em";
      textArea.style.padding = "0";
      textArea.style.border = "none";
      textArea.style.outline = "none";
      textArea.style.boxShadow = "none";
      textArea.style.background = "transparent";
      textArea.setAttribute("readonly", "");
      document.body.appendChild(textArea);

      textArea.focus();
      textArea.select();

      try {
        const successful = document.execCommand("copy");
        console.log(
          `[Copy Diagnostics] Fallback execCommand success: ${successful}`,
        );
        return successful;
      } catch (fallbackErr) {
        console.error(
          `[Copy Diagnostics] Fallback execCommand failed.`,
          fallbackErr,
        );
        return false;
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  const copyMessage = async (msg: ChatMessage) => {
    const success = await copyTextToClipboard(msg.content, msg.id);
    if (success) {
      setCopiedMessageId(msg.id);
      setTimeout(() => setCopiedMessageId(null), 2000);
    }
  };

  const copySelectedMessages = async () => {
    const textsToCopy = messages
      .filter((m) => selectedMessages.includes(m.id))
      .map((m) => m.content)
      .join("\n\n");

    await copyTextToClipboard(textsToCopy, "bulk_selection");
    setSelectionMode(false);
    setSelectedMessages([]);
  };

  const deleteMessage = async (id: string) => {
    console.log(`[Delete Diagnostics] Initiating deletion for Message ID: ${id}`);
    const previousMessages = [...messages];
    try {
      const updatedMessages = messages.filter((m) => m.id !== id);
      console.log(`[Delete Diagnostics] State update status: Preparing to update from ${messages.length} to ${updatedMessages.length} messages.`);
      
      setMessages(updatedMessages);
      console.log(`[Delete Diagnostics] Database request status: Syncing to Firestore...`);
      await saveConversation(updatedMessages);
      
      setMessageToDelete(null);
    } catch (err) {
      console.error(`[Delete Diagnostics] Permission errors / Deletion failure:`, err);
      // Revert the UI update and alert the user
      setMessages(previousMessages);
      alert(lang === "ar" ? "فشل حذف الرسالة، يرجى المحاولة مرة أخرى." : "Failed to delete message, please try again.");
    }
  };

  const bulkDeleteMessages = async () => {
    console.log(`[Delete Diagnostics] Initiating bulk deletion. Target count: ${selectedMessages.length}`);
    const previousMessages = [...messages];
    try {
      const updatedMessages = messages.filter((m) => !selectedMessages.includes(m.id));
      setMessages(updatedMessages);
      await saveConversation(updatedMessages);
      
      setSelectionMode(false);
      setSelectedMessages([]);
    } catch (err) {
      console.error(`[Delete Diagnostics] Bulk delete error:`, err);
      // Revert the UI update and alert the user
      setMessages(previousMessages);
      alert(lang === "ar" ? "فشل حذف الرسائل، يرجى المحاولة مرة أخرى." : "Failed to delete messages, please try again.");
    }
  };

  const toggleMessageSelection = (id: string) => {
    setSelectedMessages((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id],
    );
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in generic input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      if (selectionMode && e.ctrlKey && e.key === "a") {
        e.preventDefault();
        setSelectedMessages(
          messages.filter((m) => m.id !== "greet").map((m) => m.id),
        );
      }

      if (selectionMode && selectedMessages.length > 0 && e.key === "Delete") {
        e.preventDefault();
        setShowBulkDeleteConfirm(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectionMode, selectedMessages, messages]);

  // Audio Recording State
  const [isAudioRecording, setIsAudioRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // File Attachments State
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        setAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      };

      mediaRecorder.start();
      setIsAudioRecording(true);
      setRecordingTime(0);

      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Failed to access microphone", err);
      alert(
        lang === "ar"
          ? "يرجى السماح بالوصول إلى الميكروفون."
          : "Microphone permission is required.",
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isAudioRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    }

    setIsAudioRecording(false);

    if (timerIntervalRef.current !== null) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setIsPlayingPreview(false);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
  };

  const togglePlayPreview = () => {
    if (!audioPlayerRef.current && audioUrl) {
      audioPlayerRef.current = new Audio(audioUrl);
      audioPlayerRef.current.onended = () => setIsPlayingPreview(false);
    }

    if (audioPlayerRef.current) {
      if (isPlayingPreview) {
        audioPlayerRef.current.pause();
        setIsPlayingPreview(false);
      } else {
        audioPlayerRef.current.play();
        setIsPlayingPreview(true);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  // Auto Scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments((prev) => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const toBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleSend = async (textToSend: string) => {
    if (
      (!textToSend.trim() && attachments.length === 0 && !audioBlob) ||
      loading
    )
      return;

    if (isAudioRecording) {
      stopRecording();
    }

    const userMsgId = Date.now().toString();
    const hasAudio = !!audioBlob;
    const attachmentCount = attachments.length + (hasAudio ? 1 : 0);
    const audioTextSuffix = hasAudio
      ? `\n[🎵 ${lang === "ar" ? "رسالة صوتية" : "Voice message"}]`
      : "";
    const attachmentsSuffix =
      attachmentCount > 0
        ? `\n[${attachmentCount} attachment(s) included]`
        : "";

    const newUserMsg: ChatMessage = {
      id: userMsgId,
      role: "user",
      content: textToSend + audioTextSuffix + attachmentsSuffix,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const messagesWithUser = [...messages, newUserMsg];
    setMessages(messagesWithUser);
    saveConversation(messagesWithUser);
    setInput("");

    // Store copies of current attachments and clear UI state
    const currentAttachments = [...attachments];
    const currentAudioBlob = audioBlob;
    setAttachments([]);
    deleteRecording(); // clears audio UI state
    setLoading(true);

    try {
      const payloadMessages = messages.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        content: m.content,
      }));

      payloadMessages.push({ role: "user", content: textToSend });

      // Convert attachments to base64
      const processedAttachments: any[] = await Promise.all(
        currentAttachments.map(async (f) => {
          const b64 = await toBase64(f);
          return { mimeType: f.type, data: b64, name: f.name };
        }),
      );

      if (currentAudioBlob) {
        const audioB64 = await toBase64(currentAudioBlob);
        processedAttachments.push({
          mimeType: currentAudioBlob.type || "audio/webm",
          data: audioB64,
          name: "voice-message.webm",
        });
      }

      const hasCV = currentAttachments.some((f) => 
        f.name.toLowerCase().includes("cv") || 
        f.name.toLowerCase().includes("resume") || 
        f.name.toLowerCase().includes("سيرة")
      );

      // Add typing indicator immediately
      const coachMsgId = (Date.now() + 1).toString();
      const newResponseMsg: ChatMessage = {
        id: coachMsgId,
        role: "assistant",
        content: hasCV 
          ? (isRtl ? "جاري تحليل السيرة الذاتية..." : "CV analysis in progress...")
          : (isRtl ? "جاري التحليل..." : "Thinking..."),
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      const messagesWithAssistant = [...messagesWithUser, newResponseMsg];
      setMessages(messagesWithAssistant);

      // Send a reduced payload to save context
      const slicedMessages = payloadMessages.slice(
        Math.max(payloadMessages.length - 10, 0),
      );

      const maxRetries = 3;
      const retryDelays = [2000, 5000, 10000];
      let attempt = 0;
      let success = false;
      let lastErrorText = "";

      while (attempt <= maxRetries && !success) {
        if (attempt > 0) {
          await new Promise((res) => setTimeout(res, retryDelays[attempt - 1]));
          const retryMsg = hasCV 
            ? (isRtl ? `جاري تحليل السيرة الذاتية... (محاولة ${attempt + 1})` : `CV analysis in progress... (Attempt ${attempt + 1})`)
            : (isRtl ? `جاري التحليل... (محاولة ${attempt + 1})` : `Thinking... (Attempt ${attempt + 1})`);
            
          setMessages((currentMessages) => {
            return currentMessages.map((m) =>
              m.id === coachMsgId
                ? { ...m, content: retryMsg }
                : m,
            );
          });
        }

        try {
          let userCareerProfile = null;
          let token = "";
          if (auth.currentUser) {
            userCareerProfile = await getCareerProfile(auth.currentUser.uid);
            token = await auth.currentUser.getIdToken();
          }
          
          const response = await fetch("/api/coach-stream", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              ...(token ? { "Authorization": `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
              messages: slicedMessages,
              language: lang,
              attachments: processedAttachments,
              retryAttempt: attempt + 1,
              careerProfile: userCareerProfile,
              portfolioDetails: {
                income: analysis.monthlyIncome,
                expenses: analysis.monthlyExpenses,
                savingsRate: analysis.savingsRate,
                healthScore: analysis.healthScore,
                categories: analysis.categories,
                transactions: analysis.transactions?.slice(0, 30) // limit to recent 30 to not blow up context
              },
            }),
          });

          if (!response.ok) {
            throw new Error((response.status === 503) ? "503" : "HTTP error " + response.status);
          }

          const reader = response.body?.getReader();
          const decoder = new TextDecoder("utf-8");

          let accumulatedResponse = "";
          let buffer = "";
          let hit503Error = false;
          let hitNonRetryableError = false;

          if (reader) {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });

              let newlineIndex;
              while ((newlineIndex = buffer.indexOf("\n\n")) >= 0) {
                const line = buffer.slice(0, newlineIndex).trim();
                buffer = buffer.slice(newlineIndex + 2);

                if (line.startsWith("data: ")) {
                  const dataStr = line.substring(6).trim();
                  if (dataStr === "[DONE]") break;
                  try {
                    const parsed = JSON.parse(dataStr);
                    
                    if (parsed.cvError) {
                      lastErrorText = parsed.text;
                      if (parsed.is503) {
                         hit503Error = true;
                      } else {
                         hitNonRetryableError = true;
                      }
                      break; 
                    }
                    
                    if (parsed.groundingChunks) {
                      setMessages((currentMessages) => {
                        return currentMessages.map((m) =>
                          m.id === coachMsgId
                            ? { ...m, metadata: { ...m.metadata, groundingChunks: parsed.groundingChunks } }
                            : m,
                        );
                      });
                    }
                    
                    if (parsed.text) {
                      if (accumulatedResponse === "") {
                        accumulatedResponse = parsed.text;
                      } else {
                        accumulatedResponse += parsed.text;
                      }

                      setMessages((currentMessages) => {
                        return currentMessages.map((m) =>
                          m.id === coachMsgId
                            ? { ...m, content: accumulatedResponse || "..." }
                            : m,
                        );
                      });
                    }
                  } catch (e) {
                    // ignore parse error
                  }
                }
              }
              if (hit503Error || hitNonRetryableError) {
                 break;
              }
            }
          }

          if (hit503Error) {
             throw new Error("503");
          } else if (hitNonRetryableError) {
             attempt = maxRetries; // force exit loop
             throw new Error("NON_RETRYABLE");
          } else {
             success = true;
          }

        } catch (err: any) {
           if (attempt >= maxRetries || err.message === "NON_RETRYABLE") {
             const fallbackContent = lastErrorText || t.errorCoach;
             setMessages((currentMessages) => {
               return currentMessages.map((m) =>
                 m.id === coachMsgId
                   ? { ...m, content: fallbackContent, isError: true, rawPrompt: textToSend, rawAttachments: currentAttachments }
                   : m,
               );
             });
             // Also restore attachments to state as requested
             setAttachments(currentAttachments);
             break;
           }
        }
        attempt++;
      }

      setMessages((currentMessages) => {
        saveConversation(currentMessages);
        return currentMessages;
      });
      if (onAction) onAction();
    } catch (err) {
      console.error("AI Coach Fetch error:", err);
      // Outer catch blocks errors that happen before network request
      const coachMsgId = (Date.now() + 1).toString();
      const fallbackMsg: ChatMessage = {
        id: coachMsgId,
        role: "assistant",
        content: t.errorCoach,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isError: true,
        rawPrompt: textToSend,
        rawAttachments: currentAttachments,
      };

      const messagesWithFallback = [...messagesWithUser, fallbackMsg];
      setMessages(messagesWithFallback);
      saveConversation(messagesWithFallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pendingPrompt && pendingPrompt.trim() !== "") {
      console.log(`[Diagnostics] Executing pending prompt: ${pendingPrompt}`);
      
      // Delay slightly to ensure UI is ready and scrolling works
      const timer = setTimeout(() => {
        handleSend(pendingPrompt);
      }, 500);

      if (clearPendingPrompt) clearPendingPrompt();
      
      return () => clearTimeout(timer);
    }
  }, [pendingPrompt]);

  const [showReportPreview, setShowReportPreview] = useState(false);

  // Save conversation explicitly when messages are added to prevent loops

  const getMarkdownComponents = (msg: ChatMessage) => ({
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || "");
      const isJobOrJson = match && (match[1] === "job" || match[1] === "json");
      const isCareerProfile = match && match[1] === "careerProfile";
      
      const rawStr = String(children).replace(/\n$/, "");

      if (!inline && isCareerProfile) {
        try {
          const profileData = JSON.parse(rawStr) as CareerProfile;
          // Asynchronously save to Firebase if authenticated
          if (auth.currentUser) {
            saveCareerProfile(auth.currentUser.uid, profileData);
          }
          // Do not render anything for the career profile block
          return null;
        } catch (err) {
          console.error("Failed to parse career profile:", err);
          return null;
        }
      }
      
      // Heuristic: even if it's not explicitly labeled as job/json, if it loosely looks like a JSON job object/array, try parsing it.
      const looksLikeJobJson = !inline && (rawStr.trim().startsWith("{") || rawStr.trim().startsWith("[")) && rawStr.includes('"company"');
      
      if (!inline && (isJobOrJson || looksLikeJobJson)) {
        try {
          const jobData = JSON.parse(rawStr);
          console.log("PARSED JOBS", jobData);
          
          const renderJob = (job: any, index: number) => {
             if (job && (job.title || job.company || job.jobTitle || job.companyName)) {
                const normalizedJob = {
                   title: job.title || job.jobTitle || "Job Title",
                   company: job.company || job.companyName || "Unknown Company",
                   location: job.location || "Location not specified",
                   matchScore: job.matchScore || job.score || "",
                   url: job.url || job.link || "#",
                   whyMatches: job.whyMatches || job.matchReason || "",
                   source: job.source || "",
                   summary: job.summary || "",
                   missingSkills: job.missingSkills || ""
                };
                return <JobResultCard key={index} job={normalizedJob} extractMetadata={msg.metadata?.groundingChunks} isRtl={isRtl} />;
             }
             return null;
          };

          if (Array.isArray(jobData)) {
            const renderedJobs = jobData.map((job, idx) => renderJob(job, idx)).filter(Boolean);
            if (renderedJobs.length > 0) return <div className="flex flex-col gap-2 my-2">{renderedJobs}</div>;
          } else {
            const renderedOutput = renderJob(jobData, 0);
            if (renderedOutput) return renderedOutput;
          }
        } catch (e) {
          // Attempt multiple objects or lenient regex extraction
          try {
             const matches = rawStr.match(/\{[\s\S]*?\}(?=\s*\{|$)/g);
             let parsedJobs: any[] = [];
             
             if (matches && matches.length > 0) {
               // First try JSON.parse
               parsedJobs = matches.map(m => {
                 try { return JSON.parse(m); } catch(err) { return null; }
               }).filter(Boolean);
             }
             
             // If JSON array/objects parsing yielded nothing, use a lenient regex extractor
             if (parsedJobs.length === 0) {
                // Heuristic regex to pull out standard fields from a busted JSON string
                const extractVal = (str: string, key: string) => {
                   const r = new RegExp(`"${key}"\\s*:\\s*"([^"]*)"`, 'i');
                   const m = r.exec(str);
                   return m ? m[1] : "";
                };
                
                // If it's a single block, just extract one
                if (extractVal(rawStr, 'title') || extractVal(rawStr, 'company')) {
                   parsedJobs.push({
                      title: extractVal(rawStr, 'title') || extractVal(rawStr, 'jobTitle'),
                      company: extractVal(rawStr, 'company') || extractVal(rawStr, 'companyName'),
                      location: extractVal(rawStr, 'location'),
                      matchScore: extractVal(rawStr, 'matchScore') || extractVal(rawStr, 'score'),
                      url: extractVal(rawStr, 'url') || extractVal(rawStr, 'link'),
                      whyMatches: extractVal(rawStr, 'whyMatches') || extractVal(rawStr, 'matchReason'),
                      source: extractVal(rawStr, 'source') || extractVal(rawStr, 'source'),
                   });
                }
                
                // If we STILL have nothing, and there are multiple raw jobs dumped consecutively without arrays
                const possibleBlocks = rawStr.split('}{');
                if (possibleBlocks.length > 1 && parsedJobs.length === 0) {
                   possibleBlocks.forEach(blk => {
                      const b = "{" + blk.replace(/^\{?/, '').replace(/}?$/, '') + "}";
                      if (extractVal(b, 'title') || extractVal(b, 'company')) {
                         parsedJobs.push({
                            title: extractVal(b, 'title'),
                            company: extractVal(b, 'company'),
                            location: extractVal(b, 'location'),
                            url: extractVal(b, 'url'),
                            matchScore: extractVal(b, 'matchScore'),
                            whyMatches: extractVal(b, 'whyMatches'),
                            source: extractVal(b, 'source'),
                         });
                      }
                   });
                }
             }
               
             if (parsedJobs.length > 0) {
                return (
                  <div className="flex flex-col gap-2 my-2">
                     {parsedJobs.map((jobData, idx) => {
                        const normalizedJob = {
                           title: jobData.title || jobData.jobTitle || "Job Title",
                           company: jobData.company || jobData.companyName || "Unknown Company",
                           location: jobData.location || "Location not specified",
                           matchScore: jobData.matchScore || jobData.score || "",
                           url: jobData.url || jobData.link || "#",
                           whyMatches: jobData.whyMatches || jobData.matchReason || "",
                           source: jobData.source || "",
                           summary: jobData.summary || "",
                           missingSkills: jobData.missingSkills || ""
                        };
                        return <JobResultCard key={idx} job={normalizedJob} extractMetadata={msg.metadata?.groundingChunks} isRtl={isRtl} />;
                     })}
                  </div>
                );
             }
          } catch(err2) {
             // throw to fallback
          }

          if (rawStr.length > 100) {
             console.error("JSON PARSE ERROR on job block", rawStr);
             return (
               <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl p-4 my-3 text-rose-600 dark:text-rose-400 text-sm">
                 {isRtl ? "تم العثور على وظائف ولكن تعذر عرضها." : "Jobs found but unable to display them."}
               </div>
             );
          } else {
             return (
               <div className="bg-bg-secondary border border-border-primary/50 rounded-xl p-4 my-3 skeleton-loader animate-pulse">
                 <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
                 <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-2"></div>
                 <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
               </div>
             );
          }
        }
      }
      return !inline ? (
        <pre
          className="bg-slate-950/50 rounded-xl p-3 my-2 overflow-x-auto border border-slate-200/80 dark:border-slate-800/50 text-[11px]"
          {...props}
        >
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      ) : (
        <code
          className="bg-bg-secondary dark:bg-slate-800/50 px-1.5 py-0.5 rounded text-indigo-500 dark:text-indigo-300 font-mono text-[11px]"
          {...props}
        >
          {children}
        </code>
      );
    },
    a: ({ node, ...props }: any) => {
      // Is it a job card? Check if the link contains typical job keywords or if we just style all links like Action buttons
      return (
        <a
          {...props}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 mt-2 mb-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 hover:border-indigo-500/50 font-semibold rounded-lg transition-all cursor-pointer text-[13px] shadow-sm shadow-indigo-900/10 active:scale-95 break-words max-w-full overflow-hidden"
        >
          <ExternalLink className="w-4 h-4 shrink-0" />
          <span className="truncate min-w-0">{props.children}</span>
        </a>
      );
    },
    strong: ({ node, ...props }: any) => (
      <strong className="text-indigo-500 dark:text-indigo-300 font-bold" {...props} />
    ),
    ul: ({ node, ...props }: any) => (
      <ul className={`list-none space-y-3 mt-3 mb-3`} {...props} />
    ),
    ol: ({ node, ...props }: any) => (
      <ol
        className={`list-decimal list-outside space-y-3 mt-3 mb-3 ml-4`}
        {...props}
      />
    ),
    li: ({ node, ...props }: any) => (
      <li
        className={`text-text-primary leading-relaxed flex items-start gap-2 relative`}
        {...props}
      >
        <span className="mt-1.5 shrink-0 block w-1.5 h-1.5 rounded-full bg-indigo-500/50" />
        <span className="flex-1 min-w-0 break-words">{props.children}</span>
      </li>
    ),
    p: ({ node, ...props }: any) => (
      <p
        className="mb-2 last:mb-0 leading-relaxed text-text-primary break-words"
        {...props}
      />
    ),
    pre: ({ node, ...props }: any) => (
      <pre
        className="p-3 bg-white dark:bg-slate-950 rounded-xl overflow-x-auto my-3 text-[11px] font-mono border border-border-primary"
        {...props}
      />
    ),
    h1: ({ node, ...props }: any) => (
      <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-3 mt-4 border-b border-border-primary pb-2">
        <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        {props.children}
      </h1>
    ),
    h2: ({ node, ...props }: any) => (
      <h2 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 mb-2 mt-3">
        <Briefcase className="w-4.5 h-4.5 inline-block text-indigo-600 dark:text-indigo-400 mr-2 align-text-bottom" />
        {props.children}
      </h2>
    ),
    h3: ({ node, ...props }: any) => (
      <h3 className="text-sm font-bold text-text-primary mb-1 mt-2">
        {props.children}
      </h3>
    ),
  });

  return (
    <div
      className={`relative flex-1 flex h-full overflow-hidden bg-[#F7F8FA] dark:bg-transparent ${isRtl ? "flex-row-reverse text-right" : "flex-row text-left"}`}
    >
      {/* Sidebar for History */}
      {showHistorySidebar && (
        <div
          className={`absolute top-0 bottom-0 ${isRtl ? 'right-0' : 'left-0'} sm:relative z-20 h-full w-full sm:w-[260px] md:w-72 shrink-0 border-${isRtl ? "l" : "r"} border-border-primary bg-[#F7F8FA] dark:bg-transparent sm:bg-surface-primary/40 flex flex-col shadow-2xl sm:shadow-none`}
        >
          <div className="p-4 border-b border-border-primary flex items-center justify-between shrink-0">
            <h3 className="text-text-primary text-sm font-semibold flex items-center gap-2">
              <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              {lang === "ar" ? "المحادثات السابقة" : "Chat History"}
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={createNewChat}
                className="p-1.5 rounded-md hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 transition-colors"
                title={lang === "ar" ? "محادثة جديدة" : "New Chat"}
              >
                <MessageSquarePlus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowHistorySidebar(false)}
                className="p-1.5 rounded-md hover:bg-bg-secondary text-text-primary dark:text-text-secondary sm:hidden"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {conversations.length === 0 && (
              <div className="text-xs text-text-primary dark:text-text-secondary text-center mt-6">
                {lang === "ar"
                  ? "لا توجد محادثات سابقة"
                  : "No previous conversations"}
              </div>
            )}
            {conversations.map((convo) => (
              <div
                key={convo.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors group relative ${activeConversationId === convo.id ? "bg-indigo-500/15 border border-indigo-500/30" : "hover:bg-bg-secondary dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800/50"}`}
                onClick={() => {
                  loadConversation(convo);
                  if (window.innerWidth < 640) setShowHistorySidebar(false);
                }}
              >
                <div
                  className={`text-sm tracking-tight text-text-primary mb-1.5 line-clamp-2 ${isRtl ? "pl-6" : "pr-6"}`}
                >
                  {convo.title || "New Chat"}
                </div>
                <div className="text-[10px] text-text-primary dark:text-text-secondary truncate opacity-80">
                  {convo.lastMessagePreview}
                </div>
                <button
                  onClick={(e) => confirmDeleteConversation(e, convo.id)}
                  className={`absolute top-2.5 ${isRtl ? "left-2" : "right-2"} p-1.5 rounded text-text-primary dark:text-text-secondary hover:bg-bg-secondary hover:text-rose-600 dark:text-rose-400 opacity-0 group-hover:opacity-100 transition-all`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          {conversations.length > 0 && (
            <div className="p-3 border-t border-border-primary shrink-0">
              <button
                onClick={requestDeleteAllConversations}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/30 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {lang === "ar" ? "مسح السجل بالكامل" : "Clear All History"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Premium Minimal Header */}
        {!selectionMode ? (
          <div className="h-[60px] px-5 border-b border-border-primary/60 bg-[#F7F8FA] dark:bg-transparent shrink-0 flex items-center justify-between z-10 w-full relative">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHistorySidebar(!showHistorySidebar)}
                className={`p-2 -ml-2 rounded-md text-text-primary dark:text-text-secondary hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white transition-all group ${showHistorySidebar ? "hidden sm:block" : "block"}`}
              >
                {isRtl ? (
                  <PanelLeftOpen className="w-[18px] h-[18px] -scale-x-100 group-hover:scale-x-[-1.05] transition-transform" />
                ) : (
                  <PanelLeftClose className="w-[18px] h-[18px] group-hover:scale-105 transition-transform" />
                )}
              </button>

              <div className="flex items-center gap-3">
                <h2 className="text-sm font-semibold text-text-primary tracking-tight">
                  {t.coachTitle}
                </h2>
                <div className="h-3.5 w-px bg-bg-secondary"></div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)] animate-pulse"></div>
                  <span className="text-[10px] font-medium text-accent-green uppercase tracking-wider">
                    {lang === "ar" ? "متصل" : "Online"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 mt-0">
              <button
                onClick={() => setShowReportPreview(true)}
                disabled={messages.length <= 1}
                title={lang === "ar" ? "تصدير كملف PDF" : "Export PDF"}
                className="text-text-primary dark:text-text-secondary hover:text-slate-900 dark:hover:text-slate-200 p-2 rounded-md hover:bg-bg-secondary dark:hover:bg-slate-800/80 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed group"
              >
                <Download className="w-[18px] h-[18px] group-hover:-translate-y-0.5 transition-transform" />
              </button>
              <button
                onClick={createNewChat}
                title={lang === "ar" ? "محادثة جديدة" : "New Chat"}
                className="text-text-primary dark:text-text-secondary hover:text-slate-900 dark:hover:text-slate-200 p-2 rounded-md hover:bg-bg-secondary dark:hover:bg-slate-800/80 transition-all cursor-pointer group"
              >
                <MessageSquarePlus className="w-[18px] h-[18px] group-hover:scale-105 transition-transform" />
              </button>
            </div>
          </div>
        ) : (
          <div className="h-[60px] px-5 border-b border-indigo-500/30 bg-indigo-500/10 shrink-0 flex items-center justify-between z-10 w-full relative">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectionMode(false);
                  setSelectedMessages([]);
                }}
                className="p-1.5 -ml-1 text-text-primary dark:text-text-secondary hover:text-slate-900 dark:hover:text-slate-200 rounded-md hover:bg-slate-800/50 transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
              <span className="text-xs font-semibold text-indigo-500 dark:text-indigo-300">
                {selectedMessages.length} {isRtl ? "محددة" : "selected"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={copySelectedMessages}
                disabled={selectedMessages.length === 0}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-bg-secondary hover:bg-bg-secondary text-text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                {isRtl ? "نسخ الكل" : "Copy"}
              </button>
              <button
                onClick={() => setShowBulkDeleteConfirm(true)}
                disabled={selectedMessages.length === 0}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isRtl ? "حذف الكل" : "Delete"}
              </button>
            </div>
          </div>
        )}

        {/* Main scrolling Chat container */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 min-w-0">
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            const isSelected = selectedMessages.includes(msg.id);
            return (
              <div
                key={msg.id}
                tabIndex={0}
                className={`flex w-full group items-start gap-2 focus:outline-none ${isUser ? (isRtl ? "justify-end flex-row" : "justify-end flex-row-reverse") : "justify-start"}`}
              >
                {selectionMode && msg.id !== "greet" && (
                  <button
                    onClick={() => toggleMessageSelection(msg.id)}
                    className={`mt-2 shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? "bg-indigo-500 border-indigo-500" : "border-slate-600 bg-transparent"}`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-text-primary" />}
                  </button>
                )}

                <div
                  className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${isSelected ? "opacity-80" : ""}`}
                >
                  {/* Profile Avatar indicator */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                      isUser
                        ? "bg-surface-primary border-none text-indigo-600 dark:text-indigo-400"
                        : "bg-indigo-950/30 border-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                    }`}
                  >
                    {isUser && auth.currentUser ? (
                      <Avatar
                        uid={auth.currentUser.uid}
                        className="w-8 h-8"
                        iconClassName="w-4 h-4"
                      />
                    ) : isUser ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4.5 h-4.5" />
                    )}
                  </div>

                  {/* Text Bubble */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div
                      className={`p-3.5 rounded-2xl text-[12.5px] shadow-sm leading-relaxed break-words select-text selection:bg-indigo-500/30 selection:text-text-primary ${
                        isUser
                          ? "bg-indigo-600 text-white rounded-tr-none border border-indigo-500 shadow-md shadow-indigo-500/10"
                          : "bg-surface-primary text-text-primary border border-border-primary rounded-tl-none markdown-container"
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      ) : msg.content.includes("CV analysis in progress") || msg.content.includes("جاري تحليل السيرة الذاتية") ? (
                        <div className="flex items-center gap-3 py-1">
                          <div className="flex gap-1.5 h-4 items-center pl-1">
                            <span className="w-1 bg-indigo-500 h-full animate-bounce rounded-full" style={{ animationDelay: "0ms" }}></span>
                            <span className="w-1 bg-indigo-500 h-3/4 animate-bounce rounded-full" style={{ animationDelay: "150ms" }}></span>
                            <span className="w-1 bg-indigo-500 h-full animate-bounce rounded-full" style={{ animationDelay: "300ms" }}></span>
                          </div>
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400 font-mono tracking-tight text-[13px]">{msg.content}</span>
                        </div>
                      ) : (
                        <Markdown
                          remarkPlugins={[remarkGfm]}
                          components={getMarkdownComponents(msg)}
                        >
                          {(() => {
                             let content = msg.content;
                             // Auto-fence naked JSON objects assuming they are meant to be parsed
                             if (!content.includes('```')) {
                                content = content.replace(/(\{\s*"title"[\s\S]*?\})/g, "\n\n```json\n$1\n```\n\n");
                                content = content.replace(/(\[\s*\{\s*"title"[\s\S]*?\}\s*\])/g, "\n\n```json\n$1\n```\n\n");
                             }
                             return content;
                          })()}
                        </Markdown>
                      )}
                    </div>
                    <div
                      className={`flex items-center gap-2 text-[8.5px] text-text-primary dark:text-text-secondary block ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      <span>{msg.timestamp}</span>
                      {copiedMessageId === msg.id && (
                        <span className="text-accent-green flex items-center gap-0.5">
                          <Check className="w-3 h-3" />{" "}
                          {isRtl ? "تم النسخ" : "Copied"}
                        </span>
                      )}
                    </div>
                    {msg.isError && msg.rawPrompt !== undefined && (
                      <div className={`flex ${isRtl ? "justify-start" : "justify-start"}`}>
                        <button
                          onClick={() => {
                            if (msg.rawAttachments) {
                              setAttachments(msg.rawAttachments);
                            }
                            handleSend(msg.rawPrompt || "");
                          }}
                          className="mt-1.5 flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors cursor-pointer"
                        >
                          <RefreshCcw className="w-3.5 h-3.5" />
                          {isRtl ? "إعادة المحاولة" : "Retry"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hover Actions (Desktop) / Visible on selection mode */}
                {!selectionMode && (
                  <div
                    className={`opacity-0 group-hover:opacity-100 group-focus:opacity-100 focus-within:opacity-100 transition-opacity flex items-center gap-0.5 mt-2 ${isRtl ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <button
                      onClick={() => {
                        setSelectionMode(true);
                        toggleMessageSelection(msg.id);
                      }}
                      className="p-1.5 rounded-md hover:bg-bg-secondary text-text-primary dark:text-text-secondary hover:text-indigo-600 dark:text-indigo-400 transition-colors cursor-pointer"
                      title={isRtl ? "تحديد" : "Select"}
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => copyMessage(msg)}
                      className="p-1.5 rounded-md hover:bg-bg-secondary text-text-primary dark:text-text-secondary hover:text-indigo-600 dark:text-indigo-400 transition-colors cursor-pointer"
                      title={isRtl ? "نسخ" : "Copy"}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {msg.id !== "greet" && (
                      <button
                        onClick={() => setMessageToDelete(msg.id)}
                        className="p-1.5 rounded-md hover:bg-bg-secondary text-text-primary dark:text-text-secondary hover:text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                        title={isRtl ? "حذف" : "Delete"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading Bubble */}
          {loading && (
            <div className={`flex gap-3 max-w-[85%] ${isRtl ? "" : ""}`}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border bg-indigo-950/30 border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                <Bot className="w-4.5 h-4.5 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl text-xs bg-surface-primary/50 border border-border-primary rounded-tl-none text-indigo-600 dark:text-indigo-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                  <span className="text-[11px] text-text-primary dark:text-text-secondary pl-1">
                    {t.coachTyping}
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input zone */}
        <div className="p-3.5 border-t border-slate-850 bg-slate-950/80 shrink-0 space-y-3.5">
          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {attachments.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-bg-secondary dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-[10px] text-text-primary"
                >
                  <Paperclip className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                  <span className="truncate max-w-[120px]">{file.name}</span>
                  <button
                    onClick={() => removeAttachment(idx)}
                    className="text-text-primary dark:text-text-secondary hover:text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Real chat form input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex flex-col gap-2 relative w-full"
          >
            {isAudioRecording && (
              <div
                className={`flex items-center justify-between bg-surface-primary border border-red-500/50 rounded-xl h-11 px-4 animate-pulse relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-red-500/5"></div>
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-ping"></div>
                  <span className="text-red-400 font-mono text-sm tracking-widest">
                    {formatTime(recordingTime)}
                  </span>
                </div>
                <div className="flex-1 flex justify-center items-center px-4 relative z-10 gap-1.5 h-4">
                  <div
                    className="w-1 bg-red-400/80 h-full animate-bounce rounded-full"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-1 bg-red-400/80 h-2/3 animate-bounce rounded-full"
                    style={{ animationDelay: "100ms" }}
                  ></div>
                  <div
                    className="w-1 bg-red-400/80 h-full animate-bounce rounded-full"
                    style={{ animationDelay: "200ms" }}
                  ></div>
                  <div
                    className="w-1 bg-red-400/80 h-1/2 animate-bounce rounded-full"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                  <div
                    className="w-1 bg-red-400/80 h-full animate-bounce rounded-full"
                    style={{ animationDelay: "400ms" }}
                  ></div>
                </div>
                <button
                  type="button"
                  onClick={stopRecording}
                  className="w-8 h-8 flex items-center justify-center bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors relative z-10 cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
            )}

            {audioBlob && !isAudioRecording && (
              <div className="flex items-center gap-3 bg-bg-secondary dark:bg-slate-800/80 p-3 rounded-xl border border-slate-300 dark:border-slate-700">
                <button
                  type="button"
                  onClick={togglePlayPreview}
                  className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center hover:bg-indigo-500/30 shrink-0 cursor-pointer transition-colors"
                >
                  {isPlayingPreview ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>

                <div className="flex-1 h-1.5 bg-surface-primary rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-indigo-500 rounded-full transition-all duration-1000 ${isPlayingPreview ? "w-full" : "w-0"}`}
                    style={{ transitionTimingFunction: "linear" }}
                  ></div>
                </div>

                <span className="text-xs text-text-primary dark:text-text-secondary font-mono shrink-0">
                  {formatTime(recordingTime)}
                </span>

                <div className="flex items-center gap-0.5 border-l border-slate-300 dark:border-slate-700 pl-2 ml-1">
                  <button
                    type="button"
                    onClick={() => {
                      deleteRecording();
                      startRecording();
                    }}
                    className="p-1.5 text-text-primary dark:text-text-secondary hover:text-indigo-600 dark:text-indigo-400 transition-colors cursor-pointer rounded-lg hover:bg-bg-secondary"
                    title={lang === "ar" ? "إعادة التسجيل" : "Re-record"}
                  >
                    <RefreshCcw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={deleteRecording}
                    className="p-1.5 text-text-primary dark:text-text-secondary hover:text-rose-600 dark:text-rose-400 transition-colors cursor-pointer rounded-lg hover:bg-bg-secondary"
                    title={lang === "ar" ? "حذف" : "Delete"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {!isAudioRecording && (
              <div className="flex items-center gap-2 relative w-full">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-xl bg-surface-primary border border-border-primary text-text-primary dark:text-text-secondary hover:text-indigo-600 dark:text-indigo-400 hover:border-indigo-500/40 transition-colors cursor-pointer"
                >
                  <Paperclip className="w-4.5 h-4.5" />
                </button>

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading || hasReachedLimit}
                  placeholder={
                    hasReachedLimit
                      ? isRtl ? "لقد وصلت للحد المتاح في باقتك." : "Plan limit reached."
                      : t.askAnythingPlaceholder
                  }
                  className={`flex-1 h-11 px-4 text-xs rounded-xl bg-white dark:bg-slate-950 border ${hasReachedLimit ? 'border-rose-500/50 text-rose-500 placeholder-rose-500/50' : 'text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none transition-all'} border-border-primary focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/25`}
                />

                <button
                  type="button"
                  onClick={startRecording}
                  disabled={!!audioBlob || hasReachedLimit}
                  className="w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-xl border bg-surface-primary border-border-primary text-text-primary dark:text-text-secondary hover:text-indigo-600 dark:text-indigo-400 hover:border-indigo-500/40 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Mic className="w-4.5 h-4.5" />
                </button>

                <button
                  type="submit"
                  disabled={
                    hasReachedLimit ||
                    (!input.trim() && attachments.length === 0 && !audioBlob) ||
                    loading
                  }
                  className="w-11 h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-500 hover:to-blue-600 active:scale-95 text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:pointer-events-none shadow-md shadow-indigo-500/10 cursor-pointer flex-shrink-0"
                >
                  <Send
                    className={`w-4.5 h-4.5 text-white transition-transform ${isRtl ? "-scale-x-100" : ""}`}
                  />
                </button>
              </div>
            )}
          </form>
        </div>

        {messageToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface-primary border border-border-primary rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
              <div
                className={`p-4 border-b border-slate-300 dark:border-slate-800/80 flex items-start gap-4 ${isRtl ? "flex-row-reverse text-right" : ""}`}
              >
                <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0 border border-rose-500/20">
                  <Trash2 className="w-5 h-5 text-rose-500" />
                </div>
                <div className="pt-0.5">
                  <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-100">
                    {isRtl ? "حذف الرسالة" : "Delete Message"}
                  </h3>
                  <p className="text-xs text-text-primary dark:text-text-secondary mt-1 leading-relaxed">
                    {isRtl
                      ? "هل أنت متأكد من حذف هذه الرسالة؟ لا يمكن التراجع عن هذا الإجراء."
                      : "Are you sure you want to delete this message? This cannot be undone."}
                  </p>
                </div>
              </div>
              <div
                className={`p-4 bg-surface-primary flex items-center gap-3 ${isRtl ? "flex-row" : "flex-row-reverse"}`}
              >
                <button
                  onClick={() => deleteMessage(messageToDelete)}
                  className="flex-1 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-text-primary font-semibold text-xs transition-colors"
                >
                  {isRtl ? "تأكيد الحذف" : "Delete"}
                </button>
                <button
                  onClick={() => setMessageToDelete(null)}
                  className="flex-1 py-2 rounded-xl bg-bg-secondary hover:bg-bg-secondary text-text-primary font-semibold text-xs transition-colors"
                >
                  {isRtl ? "إلغاء" : "Cancel"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showBulkDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface-primary border border-border-primary rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
              <div
                className={`p-4 border-b border-slate-300 dark:border-slate-800/80 flex items-start gap-4 ${isRtl ? "flex-row-reverse text-right" : ""}`}
              >
                <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0 border border-rose-500/20">
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                </div>
                <div className="pt-0.5">
                  <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-100">
                    {isRtl ? "حذف جماعي للرسائل" : "Bulk Delete Messages"}
                  </h3>
                  <p className="text-xs text-text-primary dark:text-text-secondary mt-1 leading-relaxed">
                    {isRtl
                      ? `هل أنت متأكد من حذف ${selectedMessages.length} رسالة محددة؟ لا يمكن التراجع عن هذا الإجراء.`
                      : `Are you sure you want to delete ${selectedMessages.length} selected messages? This cannot be undone.`}
                  </p>
                </div>
              </div>
              <div
                className={`p-4 bg-surface-primary flex items-center gap-3 ${isRtl ? "flex-row" : "flex-row-reverse"}`}
              >
                <button
                  onClick={() => {
                    bulkDeleteMessages();
                    setShowBulkDeleteConfirm(false);
                  }}
                  className="flex-1 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-text-primary font-semibold text-xs transition-colors"
                >
                  {isRtl ? "تأكيد الحذف" : "Delete All"}
                </button>
                <button
                  onClick={() => setShowBulkDeleteConfirm(false)}
                  className="flex-1 py-2 rounded-xl bg-bg-secondary hover:bg-bg-secondary text-text-primary font-semibold text-xs transition-colors"
                >
                  {isRtl ? "إلغاء" : "Cancel"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showClearAllConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface-primary border border-border-primary rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
              <div
                className={`p-4 border-b border-slate-300 dark:border-slate-800/80 flex items-start gap-4 ${isRtl ? "flex-row-reverse text-right" : ""}`}
              >
                <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0 border border-rose-500/20">
                  <Trash2 className="w-5 h-5 text-rose-500" />
                </div>
                <div className="pt-0.5">
                  <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-100">
                    {isRtl ? "مسح جميع المحادثات" : "Delete All History"}
                  </h3>
                  <p className="text-xs text-text-primary dark:text-text-secondary mt-1 leading-relaxed">
                    {isRtl
                      ? "هل أنت متأكد من حذف جميع محادثاتك السابقة بالكامل؟ يتم مسح السجلات نهائياً ولا يمكن التراجع عن هذا."
                      : "Are you sure you want to completely delete all chat history? This will permanently remove all conversations and messages."}
                  </p>
                </div>
              </div>
              <div
                className={`p-4 bg-surface-primary flex items-center gap-3 ${isRtl ? "flex-row" : "flex-row-reverse"}`}
              >
                <button
                  onClick={executeDeleteAllConversations}
                  className="flex-1 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-text-primary font-semibold text-xs transition-colors"
                >
                  {isRtl ? "نعم، احذف الكل" : "Delete Everything"}
                </button>
                <button
                  onClick={() => setShowClearAllConfirm(false)}
                  className="flex-1 py-2 rounded-xl bg-bg-secondary hover:bg-bg-secondary text-text-primary font-semibold text-xs transition-colors"
                >
                  {isRtl ? "إلغاء" : "Cancel"}
                </button>
              </div>
            </div>
          </div>
        )}

        {conversationToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface-primary border border-border-primary rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
              <div
                className={`p-4 border-b border-slate-300 dark:border-slate-800/80 flex items-start gap-4 ${isRtl ? "flex-row-reverse text-right" : ""}`}
              >
                <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0 border border-rose-500/20">
                  <Trash2 className="w-5 h-5 text-rose-500" />
                </div>
                <div className="pt-0.5">
                  <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-100">
                    {isRtl ? "حذف المحادثة" : "Delete Chat History"}
                  </h3>
                  <p className="text-xs text-text-primary dark:text-text-secondary mt-1 leading-relaxed">
                    {isRtl
                      ? "هل أنت متأكد من حذف هذه المحادثة وجميع الرسائل بداخلها؟"
                      : "Are you sure you want to delete this conversation and all its messages?"}
                  </p>
                </div>
              </div>
              <div
                className={`p-4 bg-surface-primary flex items-center gap-3 ${isRtl ? "flex-row" : "flex-row-reverse"}`}
              >
                <button
                  onClick={() => deleteConversation(conversationToDelete)}
                  className="flex-1 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-text-primary font-semibold text-xs transition-colors"
                >
                  {isRtl ? "حذف المحادثة" : "Delete Chat"}
                </button>
                <button
                  onClick={() => setConversationToDelete(null)}
                  className="flex-1 py-2 rounded-xl bg-bg-secondary hover:bg-bg-secondary text-text-primary font-semibold text-xs transition-colors"
                >
                  {isRtl ? "إلغاء" : "Cancel"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showReportPreview && (
          <ReportPreviewModal
            lang={lang}
            messages={messages}
            onClose={() => setShowReportPreview(false)}
            userName={auth.currentUser?.displayName || "Nashmi User"}
          />
        )}
      </div>
    </div>
  );
}
