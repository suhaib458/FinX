import React, { useState, useEffect } from "react";
import { MessageSquare, Hash, Users, ExternalLink, Lock, MessagesSquare } from "lucide-react";
import { getAccessToken, googleSignIn } from "../lib/firebase";

interface WorkspaceChatProps {
  lang: "ar" | "en";
}

export default function WorkspaceChat({ lang }: WorkspaceChatProps) {
  const isRtl = lang === "ar";
  const [spaces, setSpaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsAuth, setNeedsAuth] = useState(false);

  const authenticateGoogle = async () => {
    try {
      setLoading(true);
      setError("");
      await googleSignIn();
      setNeedsAuth(false);
      fetchSpaces();
    } catch (err: any) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        setError(err.message || "Authentication failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSpaces = async () => {
    try {
      setLoading(true);
      setError("");
      let token = await getAccessToken();
      
      if (!token) {
         setNeedsAuth(true);
         setLoading(false);
         return;
      }

      const res = await fetch(`https://chat.googleapis.com/v1/spaces`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
            setNeedsAuth(true);
            return;
        }
        throw new Error("Failed to fetch Chat spaces");
      }

      const data = await res.json();
      setSpaces(data.spaces || []);
    } catch (err: any) {
      console.error("Error fetching spaces", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  return (
    <div className={`flex flex-col h-full bg-[#F7F8FA] dark:bg-transparent p-4 sm:p-6 pb-24 ${isRtl ? 'font-arabic text-right' : 'font-sans text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto w-full">
         <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-surface-primary border border-border-primary rounded-2xl flex items-center justify-center shadow-sm">
               <MessagesSquare className="w-6 h-6 text-accent-green" />
            </div>
            <div>
               <h1 className="text-2xl font-bold text-text-primary">
                  {isRtl ? "جوجل شات" : "Google Chat"}
               </h1>
               <p className="text-sm text-text-secondary">
                  {isRtl ? "مساحات العمل والمحادثات الخاصة بك" : "Your workspaces and conversations"}
               </p>
            </div>
         </div>

         {error && (
             <div className="mb-6 bg-red-500/10 border border-red-500/20 text-danger p-4 rounded-xl text-sm">
                 {error}
             </div>
         )}

         {needsAuth ? (
             <div className="bg-surface-primary border border-border-primary rounded-3xl p-8 text-center shadow-sm max-w-lg mx-auto mt-12">
                 <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageSquare className="w-8 h-8" />
                 </div>
                 <h2 className="text-xl font-bold text-text-primary mb-3">
                     {isRtl ? "الربط مع جوجل شات" : "Connect Google Chat"}
                 </h2>
                 <p className="text-text-secondary text-sm mb-8 leading-relaxed">
                     {isRtl 
                       ? "قم بتسجيل الدخول بحساب جوجل الخاص بك لمنح فنيكس الوصول إلى مساحات العمل والمحادثات." 
                       : "Sign in with your Google account to grant FinX access to view your spaces and conversations."}
                 </p>
                 <button 
                    onClick={authenticateGoogle}
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl w-full flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
                 >
                     {loading ? (
                         <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                     ) : (
                         <>
                            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"></path><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"></path></svg>
                            {isRtl ? "المتابعة باستخدام جوجل" : "Continue with Google"}
                         </>
                     )}
                 </button>
             </div>
         ) : loading && spaces.length === 0 ? (
             <div className="flex items-center justify-center p-12">
                 <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
             </div>
         ) : spaces.length === 0 ? (
             <div className="bg-surface-primary border border-border-primary rounded-3xl p-12 text-center shadow-sm">
                 <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                 <h3 className="text-lg font-bold text-text-primary mb-2">
                     {isRtl ? "لا توجد مساحات عمل" : "No Spaces Found"}
                 </h3>
                 <p className="text-text-secondary">
                     {isRtl ? "لم يتم العثور على أية محادثات أو مساحات عمل في حسابك." : "No conversations or workspaces were found in your account."}
                 </p>
             </div>
         ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {spaces.map((space) => (
                     <div 
                       key={space.name} 
                       className="bg-surface-primary border border-border-primary rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm cursor-default"
                     >
                        <div className="flex items-center gap-4 truncate">
                           <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 text-accent-green rounded-full flex items-center justify-center shrink-0">
                               {space.type === "ROOM" ? <Hash className="w-5 h-5" /> : space.type === "DIRECT_MESSAGE" ? <Users className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                           </div>
                           <div className="truncate">
                              <h3 className="font-bold text-text-primary text-base truncate">
                                 {space.displayName || (isRtl ? "محادثة خاصة" : "Direct Message")}
                              </h3>
                              <p className="text-xs text-text-secondary truncate mt-0.5">
                                 {space.type === "ROOM" ? (isRtl ? "مساحة عمل" : "Space") : (isRtl ? "محادثة مباشرة" : "Direct Message")}
                              </p>
                           </div>
                        </div>
                     </div>
                 ))}
             </div>
         )}
      </div>
    </div>
  );
}
