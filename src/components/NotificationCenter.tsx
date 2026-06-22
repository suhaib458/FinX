import React, { useState, useEffect } from "react";
import { Bell, Briefcase, DollarSign, Target, Settings, CheckCircle, Clock, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { auth } from "../lib/firebase";
import { getNotifications, SystemNotification, markAsRead, markAllAsRead } from "../lib/notifications";

interface NotificationCenterProps {
  lang: "ar" | "en";
}

export default function NotificationCenter({ lang }: NotificationCenterProps) {
  const isRtl = lang === "ar";
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    if (auth.currentUser) {
      const data = await getNotifications(auth.currentUser.uid);
      setNotifications(data);
    }
    setLoading(false);
  };

  const handleMarkAsRead = async (n: SystemNotification) => {
    if (!n.id || n.readStatus || !auth.currentUser) return;
    await markAsRead(auth.currentUser.uid, n.id);
    setNotifications(prev => prev.map(p => p.id === n.id ? { ...p, readStatus: true } : p));
  };
  
  const handleMarkAllRead = async () => {
    if (!auth.currentUser) return;
    await markAllAsRead(auth.currentUser.uid, notifications);
    setNotifications(prev => prev.map(p => ({ ...p, readStatus: true })));
  }

  const getIcon = (cat: string) => {
    switch(cat) {
      case "career": return <Briefcase className="w-5 h-5 text-indigo-500" />;
      case "finance": return <DollarSign className="w-5 h-5 text-emerald-500" />;
      case "investment": return <Target className="w-5 h-5 text-amber-500" />;
      default: return <Settings className="w-5 h-5 text-slate-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 dark:bg-[#020617]">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.readStatus).length;

  return (
    <div className={`flex-1 overflow-y-auto bg-slate-50 dark:bg-[#020617] p-4 lg:p-8 ${isRtl ? "text-right" : "text-left"}`}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-6 h-6 text-indigo-600" />
              {isRtl ? "مركز الإشعارات" : "Notification Center"}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isRtl ? `لديك ${unreadCount} إشعار غير مقروء` : `You have ${unreadCount} unread notifications`}
            </p>
          </div>
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllRead}
              className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 px-4 py-2 rounded-xl transition-colors"
            >
              {isRtl ? "تحديد الكل كمقروء" : "Mark all as read"}
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{isRtl ? "لا توجد إشعارات" : "No Notifications"}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{isRtl ? "أنت مطلع على كل شيء!" : "You're all caught up!"}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                onClick={() => handleMarkAsRead(n)}
                className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border transition-all cursor-pointer ${n.readStatus ? "border-slate-200 dark:border-slate-800" : "border-indigo-200 dark:border-indigo-500/50 shadow-md shadow-indigo-500/5"}`}
              >
                <div className="flex gap-4 items-start">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${n.readStatus ? "bg-slate-100 dark:bg-slate-800" : "bg-indigo-50 dark:bg-indigo-500/10"}`}>
                    {getIcon(n.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className={`text-base ${n.readStatus ? "font-medium text-slate-700 dark:text-slate-300" : "font-bold text-slate-900 dark:text-white"}`}>{n.title}</h4>
                      {!n.readStatus && <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />}
                    </div>
                    <p className={`text-sm mt-1 ${n.readStatus ? "text-slate-500 dark:text-slate-400" : "text-slate-600 dark:text-slate-300"}`}>{n.message}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {n.createdAt ? new Date(n.createdAt.toDate?.() || n.createdAt).toLocaleDateString() : "Just now"}
                      </span>
                    </div>
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
