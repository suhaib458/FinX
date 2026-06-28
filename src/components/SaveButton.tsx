import React, { useState, useEffect } from "react";
import { Bookmark, Loader2 } from "lucide-react";
import { SavedService, SavedItemType } from "../lib/saved";
import { auth } from "../lib/firebase";

interface SaveButtonProps {
  itemType: SavedItemType;
  itemId: string;
  title: string;
  subtitle?: string;
  metadata?: any;
  className?: string;
  iconOnly?: boolean;
}

export default function SaveButton({ itemType, itemId, title, subtitle, metadata, className = "", iconOnly = false }: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  useEffect(() => {
    let mounted = true;
    const checkSaved = async () => {
      // Small delay to ensure auth is ready
      await new Promise(r => setTimeout(r, 500));
      if (!auth.currentUser) {
        if (mounted) setLoading(false);
        return;
      }
      try {
        const saved = await SavedService.isSaved(auth.currentUser.uid, itemType, itemId);
        if (mounted) {
          setIsSaved(saved);
          setLoading(false);
        }
      } catch (err) {
        console.warn(err);
        if (mounted) setLoading(false);
      }
    };
    checkSaved();
    return () => { mounted = false; };
  }, [itemType, itemId]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!auth.currentUser) {
      showToast("Please log in to save items.");
      return;
    }
    
    // Optimistic UI update
    const previousState = isSaved;
    setIsSaved(!isSaved); 
    setLoading(true);

    try {
      const newState = await SavedService.toggleSaveItem(auth.currentUser.uid, itemType, itemId, title, subtitle, metadata);
      setIsSaved(newState);
      showToast(newState ? "Saved successfully!" : "Removed from saved items");
    } catch (err) {
      console.warn("Failed to toggle save", err);
      setIsSaved(previousState);
      showToast("Failed to update saved item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className={`relative inline-flex items-center justify-center transition-all ${
          isSaved 
            ? "text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            : "text-text-secondary hover:text-slate-600 dark:text-text-secondary dark:hover:text-slate-300"
        } ${className}`}
        title={isSaved ? "Saved" : "Save"}
      >
        {loading && !isSaved && !iconOnly ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Bookmark className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
        )}
      </button>

      {toastMsg && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-lg font-medium text-sm animate-in slide-in-from-top-4 whitespace-nowrap">
          {toastMsg}
        </div>
      )}
    </>
  );
}
