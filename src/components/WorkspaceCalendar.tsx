import React, { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Video, Users, ChevronLeft, ChevronRight, Plus, ExternalLink, CalendarDays } from "lucide-react";
import { getAccessToken, googleSignIn } from "../lib/firebase";

interface WorkspaceCalendarProps {
  lang: "ar" | "en";
}

export default function WorkspaceCalendar({ lang }: WorkspaceCalendarProps) {
  const isRtl = lang === "ar";
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsAuth, setNeedsAuth] = useState(false);

  const authenticateGoogle = async () => {
    try {
      setLoading(true);
      setError("");
      await googleSignIn();
      setNeedsAuth(false);
      fetchEvents();
    } catch (err: any) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        setError(err.message || "Authentication failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");
      let token = await getAccessToken();
      
      if (!token) {
         setNeedsAuth(true);
         setLoading(false);
         return;
      }

      // Time min: midnight today
      const timeMin = new Date();
      timeMin.setHours(0, 0, 0, 0);

      // Time max: 7 days from now
      const timeMax = new Date();
      timeMax.setDate(timeMax.getDate() + 7);

      const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin.toISOString()}&timeMax=${timeMax.toISOString()}&singleEvents=true&orderBy=startTime`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
            setNeedsAuth(true);
            return;
        }
        throw new Error("Failed to fetch calendar events");
      }

      const data = await res.json();
      setEvents(data.items || []);
    } catch (err: any) {
      console.error("Error fetching events", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const formatEventTime = (event: any) => {
     if (event.start?.date) {
         return isRtl ? "طوال اليوم" : "All Day";
     }
     if (event.start?.dateTime) {
         const d = new Date(event.start.dateTime);
         return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
     }
     return "";
  };

  const formatEventDate = (event: any) => {
    const startObj = event.start?.dateTime || event.start?.date;
    if (!startObj) return "";
    const d = new Date(startObj);
    return isRtl 
       ? new Intl.DateTimeFormat('ar-EG', { weekday: 'short', month: 'short', day: 'numeric' }).format(d)
       : new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(d);
  };

  return (
    <div className={`flex flex-col h-full bg-[#F7F8FA] dark:bg-transparent p-4 sm:p-6 pb-24 ${isRtl ? 'font-arabic text-right' : 'font-sans text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto w-full">
         <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-surface-primary border border-border-primary rounded-2xl flex items-center justify-center shadow-sm">
               <CalendarDays className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
               <h1 className="text-2xl font-bold text-text-primary">
                  {isRtl ? "تقويم جوجل" : "Google Calendar"}
               </h1>
               <p className="text-sm text-text-secondary">
                  {isRtl ? "مزامنة وعرض أحداثك القادمة" : "Sync and view your upcoming events"}
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
                    <Calendar className="w-8 h-8" />
                 </div>
                 <h2 className="text-xl font-bold text-text-primary mb-3">
                     {isRtl ? "الربط مع تقويم جوجل" : "Connect Google Calendar"}
                 </h2>
                 <p className="text-text-secondary text-sm mb-8 leading-relaxed">
                     {isRtl 
                       ? "قم بتسجيل الدخول بحساب جوجل الخاص بك لمنح فنيكس صلاحية قراءة مواعيدك وتنظيم يومك." 
                       : "Sign in with your Google account to grant FinX access to view your events and organize your day."}
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
         ) : loading && events.length === 0 ? (
             <div className="flex items-center justify-center p-12">
                 <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
             </div>
         ) : events.length === 0 ? (
             <div className="bg-surface-primary border border-border-primary rounded-3xl p-12 text-center shadow-sm">
                 <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                 <h3 className="text-lg font-bold text-text-primary mb-2">
                     {isRtl ? "لا توجد مواعيد قادمة" : "No Upcoming Events"}
                 </h3>
                 <p className="text-text-secondary">
                     {isRtl ? "لم يتم العثور على أية أحداث في تقويمك للأيام السبعة القادمة." : "No events found in your calendar for the next 7 days."}
                 </p>
             </div>
         ) : (
             <div className="space-y-4">
                 {events.map((evt) => (
                     <a 
                       key={evt.id} 
                       href={evt.htmlLink}
                       target="_blank"
                       rel="noreferrer"
                       className="block bg-surface-primary border border-border-primary rounded-2xl p-4 sm:p-5 hover:shadow-md transition-shadow group"
                     >
                         <div className="flex items-start justify-between">
                            <div className="w-full">
                                <h3 className="font-bold text-text-primary text-base mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                   {evt.summary || (isRtl ? "بدون عنوان" : "Untitled Event")}
                                </h3>
                                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-sm text-text-secondary">
                                   <div className="flex items-center gap-1.5">
                                      <Calendar className="w-4 h-4 text-text-secondary" />
                                      {formatEventDate(evt)}
                                   </div>
                                   <div className="flex items-center gap-1.5">
                                      <Clock className="w-4 h-4 text-text-secondary" />
                                      {formatEventTime(evt)}
                                   </div>
                                   {evt.location && (
                                     <div className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-text-secondary" />
                                        <span className="truncate max-w-[150px]">{evt.location}</span>
                                     </div>
                                   )}
                                   {evt.hangoutLink && (
                                     <div className="flex items-center gap-1.5 text-blue-600 mt-1 sm:mt-0">
                                        <Video className="w-4 h-4" />
                                        <span>{isRtl ? "مكالمة فيديو" : "Video Call"}</span>
                                     </div>
                                   )}
                                </div>
                            </div>
                         </div>
                     </a>
                 ))}
             </div>
         )}
      </div>
    </div>
  );
}
