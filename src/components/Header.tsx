import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useFloating, offset, flip, shift, size, autoUpdate } from "@floating-ui/react";
import { 
  Settings as SettingsIcon, 
  Globe,
  Bell,
  Activity,
  Briefcase,
  Bookmark,
  PieChart,
  Sparkles
} from "lucide-react";
import { User } from "firebase/auth";
import { subscribeToNotifications, SystemNotification } from "../lib/notifications";

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

export default function Header({ user, lang, setLang, activeTab, setActiveTab, appName }: HeaderProps) {
  const isRtl = lang === "ar";
  
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const [notifications, setNotifications] = useState<SystemNotification[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToNotifications(user.uid, (notes) => {
      setNotifications(notes);
    });
    return () => unsubscribe();
  }, [user]);

  const unreadCount = notifications.filter(n => !n.readStatus).length;

  const boundaryElement = typeof document !== 'undefined' ? document.getElementById('device-shell') || undefined : undefined;

  const { refs, floatingStyles } = useFloating({
    open: menuOpen,
    onOpenChange: setMenuOpen,
    placement: 'bottom-end',
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(12),
      flip({ padding: 16, boundary: boundaryElement }),
      shift({ padding: 16, boundary: boundaryElement }),
      size({
        boundary: boundaryElement,
        apply({ availableWidth, availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            maxWidth: `calc(100vw - 32px)`,
            maxHeight: `${Math.max(250, availableHeight - 32)}px`,
            width: 'min(320px, calc(100vw - 32px))'
          });
        },
        padding: 16,
      })
    ],
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        refs.reference.current && !(refs.reference.current as any).contains(e.target as Node) &&
        refs.floating.current && !(refs.floating.current as any).contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [refs.reference, refs.floating]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#F7F8FA]/80 dark:bg-transparent/80 backdrop-blur-2xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm dark:shadow-[0_4px_40px_rgba(0,0,0,0.2)] transition-all">
      <div 
        className="flex items-center justify-between px-5 sm:px-8 py-3 w-full max-w-7xl mx-auto h-[72px] sm:h-20" 
        dir="ltr"
      >
        {/* LEFT SIDE: Actions */}
        <div 
          ref={containerRef}
          onMouseMove={handleMouseMove}
          className="relative flex items-center gap-1 sm:gap-2 p-1.5 rounded-full bg-[#F7F8FA]/80 dark:bg-slate-800/40 backdrop-blur-md border border-slate-200/60 dark:border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all duration-500 overflow-hidden group/container"
        >
          {/* Radial light effect following cursor */}
          <div 
            className="pointer-events-none absolute inset-0 transition-opacity duration-500 opacity-0 group-hover/container:opacity-100 z-0 mix-blend-screen"
            style={{
              background: `radial-gradient(80px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.15), transparent 40%)`
            }}
          />

          <button 
            onClick={() => setActiveTab("saved")}
            className={`group relative p-2.5 sm:p-3 rounded-full transition-all duration-300 active:scale-[0.95] focus:outline-none flex items-center justify-center overflow-hidden z-10 ${
              activeTab === "saved" 
                ? 'text-indigo-600 dark:text-indigo-400 bg-white dark:bg-white/10 shadow-sm' 
                : 'text-text-primary hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
            }`}
            title={lang === "ar" ? "المحفوظات" : "Saved Items"}
          >
            <Bookmark className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${activeTab === 'saved' ? 'fill-current scale-105' : 'group-hover:scale-110'}`} />
            {activeTab === "saved" && (
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
            )}
          </button>

          {/* Unified Settings & Menu Area */}
          <div ref={menuRef} className="relative z-10">
            <button 
              ref={refs.setReference}
              onClick={() => setMenuOpen(!menuOpen)}
              className={`group relative p-2.5 sm:px-4 sm:py-2.5 rounded-full transition-all duration-300 active:scale-[0.95] focus:outline-none flex items-center justify-center gap-2 overflow-hidden ${
                menuOpen 
                  ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-text-primary hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
              title={lang === "ar" ? "الإعدادات" : "Menu & Settings"}
            >
              <SettingsIcon className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${menuOpen ? 'rotate-90 scale-105' : 'group-hover:scale-110 group-hover:rotate-45'}`} />
              <span className={`text-sm font-semibold hidden sm:block tracking-wide transition-colors duration-300 ${menuOpen ? 'text-indigo-600 dark:text-indigo-400' : 'group-hover:text-indigo-600 dark:group-hover:text-indigo-300'}`}>
                {lang === "ar" ? "" : "Menu"}
              </span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-[0_0_8px_rgba(244,63,94,0.6)]">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
              {menuOpen && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
              )}
            </button>

            {/* Unified Dropdown Panel */}
            {typeof document !== 'undefined' && createPortal(
              <div 
                ref={refs.setFloating}
                style={{
                  ...floatingStyles,
                  zIndex: 999999,
                }}
                className={`flex flex-col bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl border border-border-primary/80 rounded-2xl shadow-[0_16px_40px_rgb(0,0,0,0.12)] dark:shadow-[0_16px_40px_rgb(0,0,0,0.5)] overflow-hidden transform transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top ${menuOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
                dir={isRtl ? "rtl" : "ltr"}
              >
                {/* Compact Quick Actions Menu */}
                <div className="p-1.5 flex flex-col gap-0.5 relative z-10 w-full overflow-y-auto max-h-[calc(100vh-100px)]">
                  {/* Internal top gradient flare */}
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-200 dark:via-indigo-500/50 to-transparent opacity-50" />
                  
                  {/* Profile & Settings */}
                  <button 
                    onClick={() => { setMenuOpen(false); setActiveTab("settings"); }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all duration-200 group active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-200/50 dark:bg-[#1e293b] border border-slate-200/60 dark:border-slate-700/60 shadow-sm shrink-0 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors">
                        <SettingsIcon className="w-4 h-4 text-text-primary group-hover:rotate-90 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]" />
                      </div>
                      <span className="text-[13px] font-semibold text-text-primary group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                        {lang === 'ar' ? 'الإعدادات والتفضيلات' : 'Profile & Settings'}
                      </span>
                    </div>
                  </button>

                  <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent my-1" />

                  {/* Notifications */}
                  <button 
                    type="button"
                    onClick={(e) => { 
                      e.preventDefault();
                      e.stopPropagation();
                      setMenuOpen(false); 
                      setActiveTab("notifications"); 
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all duration-200 group relative z-50 active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 shadow-sm shrink-0 group-hover:bg-white dark:group-hover:bg-indigo-500/20 transition-colors">
                        <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]" />
                      </div>
                      <span className="text-[13px] font-semibold text-text-primary group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                        {lang === 'ar' ? 'الإشعارات' : 'Notifications'}
                      </span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-[18px] h-5 shadow-sm">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>

                  <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent my-1" />

                  {/* Language toggle kept slim at bottom */}
                  <button 
                    onClick={() => { setLang(lang === "ar" ? "en" : "ar"); setMenuOpen(false); }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all duration-200 group active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-bg-secondary/40 border border-border-primary/60 shadow-sm shrink-0 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors">
                        <Globe className="w-4 h-4 text-text-secondary group-hover:rotate-180 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]" />
                      </div>
                      <span className="text-[13px] font-semibold text-text-primary group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                        {lang === 'ar' ? 'تغيير اللغة' : 'Change Language'}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider bg-bg-secondary px-2 py-1 rounded-md border border-slate-200/50 dark:border-slate-700/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
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
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 tracking-wide font-sans hidden sm:block">
            {appName}
          </span>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 group-hover:scale-105 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
            <span className="text-text-primary text-sm font-black font-sans tracking-tight">FX</span>
          </div>
        </div>
      </div>
    </header>
  );
}
