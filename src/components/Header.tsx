import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  Settings as SettingsIcon, 
  Globe,
  Bell,
  Activity,
  Briefcase
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
  
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
      linkTab: 'coach'
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

  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, right: 0 } as any);

  const calculatePosition = () => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      let left: number | string = 'auto';
      let right: number | string = 'auto';
      const dropdownWidth = 260; // compact width
      
      if (window.innerWidth < 400) {
        left = 16;
        right = 16; // stretch or auto
      } else {
        if (isRtl) {
          right = window.innerWidth - rect.right - (dropdownWidth / 2) + (rect.width / 2);
          if (right as number < 16) {
             right = 16;
          }
        } else {
          left = rect.left - (dropdownWidth / 2) + (rect.width / 2);
          if ((left as number) + dropdownWidth > window.innerWidth - 16) {
            left = window.innerWidth - dropdownWidth - 16;
          }
          if (left as number < 16) left = 16;
        }
      }

      setDropdownPos({
        top: rect.bottom + 12,
        left,
        right,
      });
    }
  };

  useEffect(() => {
    if (menuOpen) {
      calculatePosition();
      window.addEventListener('resize', calculatePosition);
      window.addEventListener('scroll', calculatePosition, true);
      return () => {
        window.removeEventListener('resize', calculatePosition);
        window.removeEventListener('scroll', calculatePosition, true);
      };
    }
  }, [menuOpen, isRtl]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-[#020617]/90 backdrop-blur-2xl border-b border-slate-200/60 dark:border-slate-800/40 shadow-sm dark:shadow-[0_4px_30px_rgba(0,0,0,0.1)] transition-all">
      <div 
        className="flex items-center justify-between px-5 sm:px-8 py-3 w-full max-w-7xl mx-auto h-[72px] sm:h-20" 
        dir="ltr"
      >
        {/* LEFT SIDE: Unified Menu Button */}
        <div className="flex items-center gap-3">

          {/* Unified Settings & Menu Area */}
          <div ref={menuRef} className="relative">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className={`relative p-2.5 sm:px-4 sm:py-2.5 rounded-full border transition-all duration-300 active:scale-95 focus:outline-none flex items-center justify-center gap-2.5 shadow-sm hover:shadow-md ${menuOpen ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-indigo-600 dark:text-indigo-400' : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800/80'}`}
              title={lang === "ar" ? "القائمة والإعدادات" : "Menu & Settings"}
            >
              <SettingsIcon className={`w-5 h-5 transition-transform duration-500 ease-out ${menuOpen ? 'rotate-90' : 'rotate-0'}`} />
              <span className="text-sm font-semibold hidden sm:block tracking-wide">
                {lang === "ar" ? "القائمة" : "Menu"}
              </span>
              {unreadCount > 0 && (
                <span className="absolute sm:top-2 sm:right-2.5 top-1.5 right-1.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 ring-2 ring-[#020617] shadow-[0_0_8px_rgba(244,63,94,0.6)]"></span>
                </span>
              )}
            </button>

            {/* Unified Dropdown Panel */}
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
                className={`w-[240px] sm:w-[260px] max-w-[calc(100vw-2rem)] max-h-[250px] flex flex-col bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] overflow-hidden transform transition-all duration-200 ease-out origin-top ${menuOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'}`}
                dir={isRtl ? "rtl" : "ltr"}
              >
                {/* Compact Quick Actions Menu */}
                <div className="p-1.5 flex flex-col gap-0.5 relative z-10 w-full animate-in fade-in duration-300">
                  {/* Internal top gradient flare */}
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent opacity-50" />
                  
                  {/* Profile & Settings (Existing) */}
                  <button 
                    onClick={() => { setMenuOpen(false); setActiveTab("settings"); }}
                    className="w-full flex items-center justify-between p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded flex items-center justify-center bg-slate-200/50 dark:bg-[#0f172a] border border-slate-200/60 dark:border-slate-800/60 shadow-sm shrink-0">
                        <SettingsIcon className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300 group-hover:rotate-45 transition-transform duration-500" />
                      </div>
                      <span className="text-[12px] font-semibold text-slate-800 dark:text-slate-200">
                        {lang === 'ar' ? 'الإعدادات والتفضيلات' : 'Profile & Settings'}
                      </span>
                    </div>
                  </button>

                  <div className="h-px w-full bg-slate-100 dark:bg-slate-800/60 my-0.5" />

                  {/* Notifications */}
                  <button 
                    onClick={() => { setMenuOpen(false); /* maybe open notifications page if it existed, but just close for now or handle appropriately */ }}
                    className="w-full flex items-center justify-between p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded flex items-center justify-center bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 shadow-sm shrink-0">
                        <Bell className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <span className="text-[12px] font-semibold text-slate-800 dark:text-slate-200">
                        {lang === 'ar' ? 'الإشعارات' : 'Notifications'}
                      </span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-[16px] h-4">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Financial Health */}
                  <button 
                    onClick={() => { setMenuOpen(false); setActiveTab("healthScore"); }}
                    className="w-full flex items-center justify-between p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded flex items-center justify-center bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 shadow-sm shrink-0">
                        <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <span className="text-[12px] font-semibold text-slate-800 dark:text-slate-200">
                        {lang === 'ar' ? 'الصحة المالية' : 'Financial Health'}
                      </span>
                    </div>
                  </button>

                  {/* Job Match */}
                  <button 
                    onClick={() => { setMenuOpen(false); setActiveTab("coach"); }}
                    className="w-full flex items-center justify-between p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded flex items-center justify-center bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 shadow-sm shrink-0">
                        <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <span className="text-[12px] font-semibold text-slate-800 dark:text-slate-200">
                        {lang === 'ar' ? 'مواءمة وظيفية' : 'Job Match'}
                      </span>
                    </div>
                  </button>

                  <div className="h-px w-full bg-slate-100 dark:bg-slate-800/60 my-0.5" />

                  {/* Language toggle kept slim at bottom */}
                  <button 
                    onClick={() => { setLang(lang === "ar" ? "en" : "ar"); setMenuOpen(false); }}
                    className="w-full flex items-center justify-between p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded flex items-center justify-center bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 shadow-sm shrink-0">
                        <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:rotate-180 transition-transform duration-700" />
                      </div>
                      <span className="text-[12px] font-semibold text-slate-800 dark:text-slate-200">
                        {lang === 'ar' ? 'تغيير اللغة' : 'Change Language'}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {lang === 'ar' ? 'EN' : 'AR'}
                    </span>
                  </button>
                </div>
              </div>,
              document.body
            )}
          </div>
        </div>

        {/* RIGHT SIDE: FinX Logo & Name */}
        <div 
          className="flex items-center gap-3.5 cursor-pointer group" 
          onClick={() => setActiveTab("home")}
          dir="ltr"
        >
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-200 tracking-wide font-sans hidden sm:block">
            {appName}
          </span>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 group-hover:scale-105 transition-all duration-300">
            <span className="text-slate-900 dark:text-white text-sm font-black font-sans tracking-tight">FX</span>
          </div>
        </div>
      </div>
    </header>
  );
}
