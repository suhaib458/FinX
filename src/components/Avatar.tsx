import React, { useState, useEffect } from 'react';
import { User as UserIcon } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

interface AvatarProps {
  uid: string;
  className?: string;
  iconClassName?: string;
}

export default function Avatar({ uid, className = "w-7 h-7", iconClassName = "w-4 h-4" }: AvatarProps) {
  const [photoURL, setPhotoURL] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    
    const unsubscribe = onSnapshot(doc(db, "users", uid), (docSnap) => {
      if (docSnap.exists() && docSnap.data().profilePhotoURL) {
        setPhotoURL(docSnap.data().profilePhotoURL);
      } else {
        setPhotoURL(null);
      }
    });

    return () => unsubscribe();
  }, [uid]);

  return (
    <div className={`rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-300 dark:border-slate-700 cursor-pointer ${className}`}>
      {photoURL ? (
        <img src={photoURL} alt="User Avatar" className="w-full h-full object-cover" />
      ) : (
        <UserIcon className={`text-slate-700 dark:text-slate-400 ${iconClassName}`} />
      )}
    </div>
  );
}
