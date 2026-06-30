import React, { useState, useEffect, useMemo } from "react";
import { Bell, Briefcase, DollarSign, Settings, Clock, AlertCircle, Trash2, MoreVertical, Check, Target, Building2, User, Search, Pin, PinOff, Info, AlertTriangle, ShieldAlert } from "lucide-react";
import { auth, db } from "../lib/firebase";
import { NotificationService } from "../services/NotificationService";
import type { SystemNotification } from "../types";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNotifications, useNotificationUnreadCount } from "../contexts/NotificationContext";

interface NotificationCenterProps {
  lang: "ar" | "en";
  setActiveTab?: (tab: any) => void;
}

type TabType = "all" | "finance" | "debt" | "projects" | "career" | "account";
type FilterType = "all" | "unread" | "pinned";

export default function NotificationCenter({ lang, setActiveTab }: NotificationCenterProps) {
  const isRtl = lang === "ar";
  const { notifications, loading } = useNotifications();
  const [activeTab, setActiveTabLocal] = useState<TabType>("all");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (e: React.MouseEvent, n: SystemNotification) => {
    e.stopPropagation();
    if (!n.id || n.readStatus || !auth.currentUser) return;
    await NotificationService.markAsRead(auth.currentUser.uid, n.id);
    setOpenMenuId(null);
  };
  
  const handleMarkAllRead = async () => {
    if (!auth.currentUser) return;
    await NotificationService.markAllAsRead(auth.currentUser.uid, notifications);
  };

  const handleDelete = async (e: React.MouseEvent, n: SystemNotification) => {
    e.stopPropagation();
    if (!n.id || !auth.currentUser) return;
    await NotificationService.deleteNotification(auth.currentUser.uid, n.id);
    setOpenMenuId(null);
  };

  const handleDeleteAll = async () => {
    if (!auth.currentUser) return;
    await NotificationService.deleteAllNotifications(auth.currentUser.uid, notifications);
  };

  const handleOpenNotification = async (n: any) => {
    if (!n.readStatus && auth.currentUser && n.id && !n.isGroup) {
      await NotificationService.markAsRead(auth.currentUser.uid, n.id);
    }
    
    if (n.isGroup) {
       setExpandedGroups(prev => ({...prev, [n.id!]: !prev[n.id!]}));
       return;
    }
    
    if (setActiveTab) {
      if (n.actionUrl) {
        setActiveTab(n.actionUrl);
      } else {
        switch (n.category) {
          case "debt": setActiveTab("debtPlanner"); break;
          case "finance": setActiveTab("analytics"); break;
          case "projects": setActiveTab("projects"); break;
          case "career": setActiveTab("careerProfile"); break;
          case "account": setActiveTab("settings"); break;
          case "system": setActiveTab("home"); break;
        }
      }
    }
  };

  const [showSettings, setShowSettings] = useState(false);
  const [disabledCategories, setDisabledCategories] = useState<string[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadSettings = async () => {
      if (!auth.currentUser) return;
      try {
        const docRef = doc(db, "users", auth.currentUser.uid, "settings", "notifications");
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setDisabledCategories(snap.data().disabledCategories || []);
        }
      } catch (e) {
        console.error("Error loading settings", e);
      }
    };
    loadSettings();
  }, []);

  const toggleCategory = async (catId: string) => {
    if (!auth.currentUser) return;
    const newDisabled = disabledCategories.includes(catId) 
      ? disabledCategories.filter(id => id !== catId)
      : [...disabledCategories, catId];
    
    setDisabledCategories(newDisabled);
    try {
      const docRef = doc(db, "users", auth.currentUser.uid, "settings", "notifications");
      await setDoc(docRef, { disabledCategories: newDisabled }, { merge: true });
    } catch (e) {
      console.error(e);
    }
  };

  const handlePin = async (e: React.MouseEvent, n: SystemNotification) => {
    e.stopPropagation();
    if (!n.id || !auth.currentUser) return;
    await NotificationService.togglePinNotification(auth.currentUser.uid, n.id, !!n.isPinned);
    setOpenMenuId(null);
  };

  const processNotifications = useMemo(() => {
    let result = notifications.filter(n => !disabledCategories.includes(n.category));
    
    if (activeTab !== "all") {
      result = result.filter(n => n.category === activeTab || (activeTab === "account" && n.category === "system"));
    }
    
    if (activeFilter === "unread") {
      result = result.filter(n => !n.readStatus);
    } else if (activeFilter === "pinned") {
      result = result.filter(n => n.isPinned);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n => 
        n.title.toLowerCase().includes(q) || 
        n.message.toLowerCase().includes(q)
      );
    }

    // Grouping logic (same title, same category, unread, created within 24h)
    const grouped: any[] = [];
    const skipIds = new Set<string>();

    result.forEach((n) => {
      if (skipIds.has(n.id!)) return;
      
      if (!n.readStatus) {
        const sim = result.filter(r => 
          r.id !== n.id && 
          !r.readStatus && 
          r.title === n.title && 
          r.category === n.category &&
          !skipIds.has(r.id!)
        );

        if (sim.length > 0) {
          const group = [n, ...sim];
          group.forEach(g => skipIds.add(g.id!));
          grouped.push({
            isGroup: true,
            id: `group-${n.id}`,
            title: n.title,
            category: n.category,
            items: group,
            createdAt: n.createdAt,
            readStatus: false,
            isPinned: n.isPinned
          });
          return;
        }
      }
      grouped.push(n);
    });

    return grouped;
  }, [notifications, disabledCategories, activeTab, activeFilter, searchQuery]);

  const processedNotes = processNotifications;
  const pinnedNotes = processedNotes.filter(n => n.isPinned);
  const unpinnedNotes = processedNotes.filter(n => !n.isPinned);

  const timelineSections = useMemo(() => {
    const today: any[] = [];
    const yesterday: any[] = [];
    const thisWeek: any[] = [];
    const thisMonth: any[] = [];
    const older: any[] = [];

    const now = new Date();
    unpinnedNotes.forEach(n => {
      const date = n.createdAt?.toDate?.() || new Date(n.createdAt || Date.now());
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
      
      if (diffDays === 0) today.push(n);
      else if (diffDays === 1) yesterday.push(n);
      else if (diffDays < 7) thisWeek.push(n);
      else if (diffDays < 30) thisMonth.push(n);
      else older.push(n);
    });

    return [
      { label: isRtl ? "اليوم" : "Today", data: today },
      { label: isRtl ? "أمس" : "Yesterday", data: yesterday },
      { label: isRtl ? "هذا الأسبوع" : "This Week", data: thisWeek },
      { label: isRtl ? "هذا الشهر" : "This Month", data: thisMonth },
      { label: isRtl ? "الأقدم" : "Older", data: older }
    ].filter(s => s.data.length > 0);
  }, [unpinnedNotes, isRtl]);

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case "critical": return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "success": return <Check className="w-4 h-4 text-emerald-500" />;
      case "info": return <Info className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  const getIcon = (cat: string) => {
    switch(cat) {
      case "career": return <Briefcase className="w-5 h-5 text-purple-500" />;
      case "finance": return <DollarSign className="w-5 h-5 text-emerald-500" />;
      case "debt": return <Target className="w-5 h-5 text-rose-500" />;
      case "projects": return <Building2 className="w-5 h-5 text-blue-500" />;
      case "account": return <User className="w-5 h-5 text-text-secondary" />;
      case "system": return <Settings className="w-5 h-5 text-text-secondary" />;
      default: return <Bell className="w-5 h-5 text-indigo-500" />;
    }
  };

  const getRelativeTime = (timestamp: any) => {
    if (!timestamp) return isRtl ? "الآن" : "Just now";
    const date = timestamp.toDate?.() || new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return isRtl ? "قبل دقيقة" : "Just now";
    if (diffMins < 60) return isRtl ? `قبل ${diffMins} دقيقة` : `${diffMins}m ago`;
    if (diffHours < 24) return isRtl ? `قبل ${diffHours} ساعة` : `${diffHours}h ago`;
    if (diffDays === 1) return isRtl ? "أمس" : "Yesterday";
    return isRtl ? `قبل ${diffDays} يوم` : `${diffDays}d ago`;
  };

  const tabs: { id: TabType, labelAr: string, labelEn: string }[] = [
    { id: "all", labelAr: "الكل", labelEn: "All" },
    { id: "finance", labelAr: "المالية", labelEn: "Finance" },
    { id: "debt", labelAr: "الديون", labelEn: "Debt" },
    { id: "projects", labelAr: "المشاريع", labelEn: "Projects" },
    { id: "career", labelAr: "المسار المهني", labelEn: "Career" },
    { id: "account", labelAr: "الحساب", labelEn: "Account" }
  ];

  const renderNotification = (n: any) => {
    if (n.isGroup) {
      const isExpanded = expandedGroups[n.id];
      return (
        <div key={n.id} className="space-y-2">
          <div 
            onClick={() => handleOpenNotification(n)}
            className="relative bg-surface-primary rounded-2xl p-4 sm:p-5 transition-all cursor-pointer shadow-sm border border-border-primary group hover:bg-bg-secondary"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-bg-secondary flex items-center justify-center shrink-0 relative">
                {getIcon(n.category)}
                <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-surface-primary">
                  {n.items.length}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-text-primary text-[15px]">
                  {isRtl ? `${n.items.length} إشعارات متطابقة` : `${n.items.length} Similar Notifications`}
                </h4>
                <p className="text-sm text-text-secondary mt-0.5">
                  {n.title}
                </p>
              </div>
            </div>
          </div>
          {isExpanded && (
            <div className={`space-y-2 ${isRtl ? 'pr-4 border-r-2 border-border-primary' : 'pl-4 border-l-2 border-border-primary'}`}>
              {n.items.map((subItem: any) => renderNotification({...subItem, isGroup: false}))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div 
        key={n.id} 
        onClick={() => handleOpenNotification(n)}
        className={`relative bg-surface-primary rounded-2xl p-4 sm:p-5 transition-all cursor-pointer group hover:bg-bg-secondary border ${n.readStatus ? "border-transparent" : "border-border-primary shadow-sm"}`}
      >
        <div className="flex gap-4 items-start">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${n.readStatus ? "bg-bg-secondary opacity-70" : "bg-bg-secondary"}`}>
            {getIcon(n.category)}
          </div>
          <div className="flex-1 min-w-0 pr-8 sm:pr-0">
            <div className="flex justify-between items-start mb-1">
              <h4 className={`text-[15px] truncate pr-2 flex items-center gap-2 ${n.readStatus ? "font-medium text-text-primary" : "font-bold text-text-primary"}`}>
                {getPriorityIcon(n.priority)}
                {n.title}
              </h4>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[13px] font-medium text-text-secondary flex items-center gap-1">
                  {getRelativeTime(n.createdAt)}
                </span>
                {!n.readStatus && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
              </div>
            </div>
            <p className={`text-sm leading-relaxed mt-0.5 ${n.readStatus ? "text-text-secondary" : "text-text-secondary"}`}>
              {n.message}
            </p>
          </div>
        </div>

        {/* Actions Menu */}
        <div className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
          <button 
            onClick={(e) => handlePin(e, n)}
            className="p-1.5 text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-primary shadow-sm border border-transparent hover:border-border-primary transition-all"
          >
            {n.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === n.id ? null : n.id!); }}
            className="p-1.5 text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-primary shadow-sm border border-transparent hover:border-border-primary transition-all"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          
          {openMenuId === n.id && (
            <div className={`absolute top-full mt-1 w-48 bg-surface-primary rounded-xl shadow-lg border border-border-primary overflow-hidden z-20 ${isRtl ? 'left-0' : 'right-0'}`}>
              {!n.readStatus && (
                <button 
                  onClick={(e) => handleMarkAsRead(e, n)}
                  className="w-full px-4 py-3 text-sm font-medium text-text-primary hover:bg-bg-secondary flex items-center gap-2 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  {isRtl ? "تحديد كمقروء" : "Mark as read"}
                </button>
              )}
              <button 
                onClick={(e) => handleDelete(e, n)}
                className="w-full px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2 transition-colors border-t border-border-primary"
              >
                <Trash2 className="w-4 h-4" />
                {isRtl ? "حذف" : "Delete"}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-[#F7F8FA] dark:bg-slate-950">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const unreadCount = useNotificationUnreadCount();

  return (
    <div className={`flex-1 overflow-y-auto bg-bg-primary p-4 lg:p-8 ${isRtl ? "text-right" : "text-left"}`}>
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col gap-5 pt-2">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary flex items-center gap-3 tracking-tight">
              {isRtl ? "الإشعارات" : "Notifications"}
              {unreadCount > 0 && (
                <span className="bg-rose-500 text-white text-[13px] font-bold px-2.5 py-0.5 rounded-full flex items-center justify-center min-w-[28px] shadow-sm">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </h1>
            <div className="flex items-center gap-1 sm:gap-2">
              <button 
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0}
                className="hidden sm:flex items-center justify-center gap-2 text-sm font-semibold text-text-secondary hover:text-text-primary bg-transparent hover:bg-bg-secondary px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
              >
                <Check className="w-4 h-4 shrink-0" />
                <span>{isRtl ? "تحديد كـ مقروء" : "Mark all read"}</span>
              </button>
              <button 
                onClick={handleDeleteAll}
                disabled={notifications.length === 0}
                className="hidden sm:flex items-center justify-center gap-2 text-sm font-semibold text-text-secondary hover:text-rose-600 dark:hover:text-rose-400 bg-transparent hover:bg-rose-50 dark:hover:bg-rose-500/10 px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4 shrink-0" />
                <span>{isRtl ? "حذف الكل" : "Delete all"}</span>
              </button>
              <button 
                onClick={() => setShowSettings(true)}
                className="flex items-center justify-center w-10 h-10 text-text-secondary hover:text-text-primary bg-transparent hover:bg-bg-secondary rounded-full transition-colors shrink-0"
                title={isRtl ? "الإعدادات" : "Settings"}
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Mobile Buttons */}
          <div className="flex sm:hidden items-center gap-2 w-full">
            <button 
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-text-primary bg-bg-secondary hover:bg-slate-200 dark:hover:bg-slate-700 min-h-[40px] rounded-xl transition-colors disabled:opacity-50"
            >
              <Check className="w-4 h-4 shrink-0" />
              <span>{isRtl ? "مقروء" : "Mark read"}</span>
            </button>
            <button 
              onClick={handleDeleteAll}
              disabled={notifications.length === 0}
              className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-rose-600 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 min-h-[40px] rounded-xl transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              <span>{isRtl ? "حذف الكل" : "Delete all"}</span>
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col gap-4 w-full">
          {/* Search */}
          <div className="relative w-full">
            <Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary`} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRtl ? "البحث..." : "Search..."}
              className={`w-full bg-surface-primary border border-border-primary rounded-[16px] py-3.5 ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-[15px] text-text-primary placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all`}
            />
          </div>

          {/* Unified Filters Row */}
          <div className="flex overflow-x-auto hide-scrollbar gap-1.5 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {(["all", "unread", "pinned"] as FilterType[]).map(f => (
              <button
                key={f}
                onClick={() => { setActiveFilter(f); setActiveTabLocal("all"); }}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                  activeFilter === f && activeTab === "all"
                    ? 'bg-text-primary text-surface-primary' 
                    : 'bg-transparent text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                }`}
              >
                {f === "all" ? (isRtl ? "الكل" : "All") : f === "unread" ? (isRtl ? "غير مقروءة" : "Unread") : (isRtl ? "المهمة" : "Pinned")}
              </button>
            ))}
            <div className="w-px h-5 bg-border-primary mx-1 my-auto shrink-0" />
            {tabs.filter(t => t.id !== "all").map((tab) => (
               <button
                 key={tab.id}
                 onClick={() => { setActiveTabLocal(tab.id); setActiveFilter("all"); }}
                 className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                   activeTab === tab.id 
                    ? 'bg-text-primary text-surface-primary' 
                    : 'bg-transparent text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                 }`}
               >
                 {isRtl ? tab.labelAr : tab.labelEn}
               </button>
            ))}
          </div>
        </div>

        {processedNotes.length === 0 ? (
          <div className="py-24 sm:py-32 px-6 text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 mb-6 flex items-center justify-center">
              <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 stroke-[1.5]" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2 tracking-tight">{isRtl ? "لا توجد إشعارات" : "No Notifications"}</h3>
            <p className="text-text-secondary text-[15px]">{isRtl ? "أنت على اطلاع بكل جديد." : "You're all caught up."}</p>
          </div>
        ) : (
          <div className="space-y-8 pb-10">
            
            {/* Pinned Section */}
            {pinnedNotes.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider px-1 flex items-center gap-2">
                  <Pin className="w-3.5 h-3.5" />
                  {isRtl ? "المثبتة" : "Pinned"}
                </h3>
                <div className="space-y-2">
                  {pinnedNotes.map((n) => renderNotification(n))}
                </div>
              </div>
            )}

            {/* Timeline Sections */}
            {timelineSections.map((section, idx) => (
              <div key={idx} className="space-y-3">
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider px-1">
                  {section.label}
                </h3>
                <div className="space-y-2">
                  {section.data.map((n: any) => renderNotification(n))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`bg-surface-primary rounded-3xl w-full max-w-md overflow-hidden ${isRtl ? "text-right" : "text-left"}`}>
            <div className="p-6 border-b border-border-primary">
              <h2 className="text-xl font-bold text-text-primary">
                {isRtl ? "إعدادات الإشعارات" : "Notification Settings"}
              </h2>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {tabs.filter(t => t.id !== "all").map(tab => (
                <div key={tab.id} className="flex items-center justify-between">
                  <span className="font-medium text-text-primary">{isRtl ? tab.labelAr : tab.labelEn}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={!disabledCategories.includes(tab.id)}
                      onChange={() => toggleCategory(tab.id)}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-border-primary flex justify-end">
              <button 
                onClick={() => setShowSettings(false)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
              >
                {isRtl ? "تم" : "Done"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

