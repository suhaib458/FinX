import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  Settings as SettingsIcon, 
  Globe,
  Bell,
  Activity,
  Briefcase,
  ShieldAlert,
  MessageSquare
} from "lucide-react";
import { User } from "firebase/auth";

interface HeaderProps {
  user: User;
  lang: "ar" | "en";
  setLang: (lang: "ar" | "en") => void;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  appName: string;
  tabTitle: string;
  points?: number;
  streak?: number;
  isPro?: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'health' | 'career' | 'security' | 'system';
  isRead: boolean;
  time: string;
  linkTab?: string;
}

export default function Header({ lang, setLang, setActiveTab, appName }: HeaderProps) {
  const isRtl = lang === "ar";
  
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: "n1",
      title: lang === 'ar' ? 'تحديث درجة الصحة المالية' : 'Health Score Updated',
      message: lang === 'ar' ? 'زادت درجة صحتك المالية بخمس نقاط عبر تقليل مصاريفك!' : 'Your financial health score increased by 5 points by reducing expenses!',
      type: 'health',
      isRead: false,
      time: lang === 'ar' ? 'منذ ساعتين' : '2h ago',
      linkTab: 'healthScore'
    },
    {
      id: "n2",
      title: lang === 'ar' ? 'مواءمة وظيفية' : 'New Job Match',
      message: lang === 'ar' ? 'لقد وجدنا وظيفة عن بعد تتناسب مع مهاراتك بشكل مثالي.' : 'We found a remote job that perfectly matches your skills.',
      type: 'career',
      isRead: false,
      time: lang === 'ar' ? 'منذ يوم' : '1d ago',
      linkTab: 'career'
    },
    {
      id: "n3",
      title: lang === 'ar' ? 'نصيحة الميزانية' : 'Budget Tips',
      message: lang === 'ar' ? 'أنت قريب من ميزانية الترفيه هذا الشهر.' : 'You are close to your entertainment budget limit for this month.',
      type: 'system',
      isRead: true,
      time: lang === 'ar' ? 'منذ يومين' : '2d ago'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = (n: AppNotification) => {
    handleMarkAsRead(n.id);
    if (n.linkTab) setActiveTab(n.linkTab);
    setNotificationsOpen(false);
  };

  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, right: 0 } as any);

  const calculatePosition = () => {
    if (notifRef.current) {
      const rect = notifRef.current.getBoundingClientRect();
      let left: number | string = 'auto';
      let right: number | string = 'auto';
      
      if (window.innerWidth < 400) {
        left = 16;
      } else {
        if (isRtl) {
          right = window.innerWidth - rect.right;
        } else {
          left = rect.left;
        }
      }

      setDropdownPos({
        top: rect.bottom + 8,
        left,
        right,
      });
    }
  };

  useEffect(() => {
    if (notificationsOpen) {
      calculatePosition();
      window.addEventListener('resize', calculatePosition);
      window.addEventListener('scroll', calculatePosition, true);
      return () => {
        window.removeEventListener('resize', calculatePosition);
        window.removeEventListener('scroll', calculatePosition, true);
      };
    }
  }, [notificationsOpen, isRtl]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        notifRef.current && !notifRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#020617]/90 backdrop-blur-2xl border-b border-slate-800/40 shadow-[0_4px_30px_rgba(0,0,0,0.1)] transition-all">
      <div 
        className="flex items-center justify-between px-5 sm:px-8 py-3 w-full max-w-7xl mx-auto h-[72px] sm:h-20" 
        dir="ltr"
      >
        {/* LEFT SIDE: Settings, Notifications, Language */}
        <div className="flex items-center gap-3" dir={isRtl ? 'rtl' : 'ltr'}>
          <button 
            onClick={() => setActiveTab("settings")}
            className="p-2.5 rounded-full bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 transition-all active:scale-95 flex items-center justify-center cursor-pointer shadow-sm hover:shadow-md"
            title={lang === "ar" ? "الإعدادات" : "Settings"}
          >
            <SettingsIcon className="w-5 h-5 text-slate-400" />
          </button>

          {/* Notifications Area */}
          <div ref={notifRef} className="relative">
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className={`relative p-2.5 rounded-full border transition-all duration-200 active:scale-95 focus:outline-none flex items-center justify-center shadow-sm hover:shadow-md ${notificationsOpen ? 'bg-slate-800 border-slate-700 text-indigo-400' : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-200 hover:bg-slate-800'}`}
              title={lang === "ar" ? "الإشعارات" : "Notifications"}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500 ring-2 ring-[#020617]"></span>
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {typeof document !== 'undefined' && createPortal(
              <div 
                ref={dropdownRef}
                style={{
                  position: 'fixed',
                  top: dropdownPos.top ? `${dropdownPos.top}px` : '-9999px',
                  left: dropdownPos.left !== 'auto' ? `${dropdownPos.left}px` : 'auto',
                  right: dropdownPos.right !== 'auto' ? `${dropdownPos.right}px` : 'auto',
                  zIndex: 999999,
                }}
                className={`w-[calc(100vw-2rem)] max-w-[360px] sm:max-w-[380px] bg-[#0f172a] border border-slate-800/80 rounded-xl shadow-2xl shadow-black/50 overflow-hidden transform transition-all duration-200 ${notificationsOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
              >
                <div className="flex items-center justify-between p-4 border-b border-slate-800/80 bg-slate-900/50">
                  <span className="text-sm font-semibold text-slate-200">
                    {lang === 'ar' ? 'الإشعارات' : 'Notifications'}
                  </span>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors cursor-pointer"
                    >
                      {lang === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all as read'}
                    </button>
                  )}
                </div>
                
                <div className="max-h-[350px] overflow-y-auto no-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
                      <Bell className="w-10 h-10 mb-3 opacity-20" />
                      <span className="text-sm">
                        {lang === 'ar' ? 'لا توجد إشعارات جديدة' : 'No new notifications'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {notifications.map(n => (
                        <div 
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`p-4 border-b border-slate-800/50 hover:bg-slate-800/50 cursor-pointer transition-colors relative flex gap-3.5 ${!n.isRead ? 'bg-slate-900/80' : ''}`}
                        >
                          {!n.isRead && (
                            <div className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-1.5' : 'left-1.5'} w-1.5 h-1.5 bg-indigo-500 rounded-full`} />
                          )}
                          <div className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 mt-0.5 ${
                            n.type === 'health' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                            n.type === 'career' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            n.type === 'security' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                            'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          }`}>
                            {n.type === 'health' ? <Activity className="w-4 h-4" /> : 
                             n.type === 'career' ? <Briefcase className="w-4 h-4" /> :
                             n.type === 'security' ? <ShieldAlert className="w-4 h-4" /> :
                             <MessageSquare className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 flex flex-col min-w-0" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                            <span className={`text-[13px] font-semibold truncate ${!n.isRead ? 'text-slate-200' : 'text-slate-300'}`}>
                              {n.title}
                            </span>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed whitespace-pre-wrap">
                              {n.message}
                            </p>
                            <span className="text-[10px] text-slate-500 mt-2 font-medium">
                              {n.time}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>,
              document.body
            )}
          </div>

          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="group flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 transition-all duration-200 active:scale-95 cursor-pointer shadow-sm hover:shadow-md"
            title={lang === "ar" ? "Switch to English" : "التبديل للعربية"}
          >
            <Globe className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
            <span className="text-xs font-bold uppercase tracking-widest font-mono">
              {lang === "ar" ? "EN" : "AR"}
            </span>
          </button>
        </div>

        {/* RIGHT SIDE: FinX Logo & Name */}
        <div 
          className="flex items-center gap-3.5 cursor-pointer group" 
          onClick={() => setActiveTab("home")}
          dir="ltr"
        >
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-200 tracking-wide font-sans hidden sm:block">
            {appName}
          </span>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 group-hover:scale-105 transition-all duration-300">
            <span className="text-white text-sm font-black font-sans tracking-tight">FX</span>
          </div>
        </div>
      </div>
    </header>
  );
}
