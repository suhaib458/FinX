import React, { useState, useRef, useEffect } from 'react';
import { Camera, Trash2, Upload } from 'lucide-react';
import { auth, db, storage } from '../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { translations } from '../translations';

export default function ProfilePhotoManager({ lang }: { lang: 'ar' | 'en' }) {
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[lang] as any;
  const isRtl = lang === 'ar';

  useEffect(() => {
    const fetchUserPhoto = async () => {
      if (!auth.currentUser) return;
      try {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists() && userDoc.data().profilePhotoURL) {
          setPhotoURL(userDoc.data().profilePhotoURL);
        }
      } catch (err) {
        console.error("Error fetching user photo:", err);
      }
    };
    fetchUserPhoto();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Maximum file size is 5MB");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploading(true);

    try {
      // Image Processing: Crop to square and compress to webp
      const processedBlob = await new Promise<Blob>((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const size = Math.min(img.width, img.height);
          // Max size of 512x512 for profile avatar optimization
          const finalSize = Math.min(size, 512); 
          
          canvas.width = finalSize;
          canvas.height = finalSize;
          
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("Canvas context not available"));
          
          const startX = (img.width - size) / 2;
          const startY = (img.height - size) / 2;
          
          ctx.drawImage(img, startX, startY, size, size, 0, 0, finalSize, finalSize);
          
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Blob creation failed"));
          }, 'image/webp', 0.85);
          
          URL.revokeObjectURL(img.src);
        };
        img.onerror = () => reject(new Error("Failed to decode image"));
      });

      const storageRef = ref(storage, `profile-images/${auth.currentUser.uid}/avatar.webp`);
      const uploadTask = uploadBytesResumable(storageRef, processedBlob, { contentType: 'image/webp' });

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(prog);
        },
        (error) => {
          console.error("Upload failed", error);
          setErrorMsg(error.message || "Failed to upload image. Make sure Storage Rules are configured.");
          setUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            const userRef = doc(db, "users", auth.currentUser!.uid);
            await setDoc(userRef, { profilePhotoURL: downloadURL }, { merge: true });
            setPhotoURL(downloadURL);
          } catch (dbError: any) {
            console.error("Failed to save to Firestore", dbError);
            setErrorMsg(dbError.message || "Failed to save photo URL to database.");
          }
          setUploading(false);
          setProgress(0);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      );
    } catch (processError: any) {
      console.error(processError);
      setErrorMsg(processError.message || "Failed to process image before upload.");
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    if (!auth.currentUser) return;
    try {
      const storageRef = ref(storage, `profile-images/${auth.currentUser.uid}/avatar`);
      await deleteObject(storageRef).catch(e => { /* Ignore object not found */ });
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { profilePhotoURL: null });
      setPhotoURL(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative group">
          <div className="w-20 h-20 rounded-full border-2 border-indigo-500 overflow-hidden bg-slate-800 flex items-center justify-center shrink-0">
            {photoURL ? (
              <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <Camera className="w-8 h-8 text-slate-500" />
            )}
          </div>
          
          {uploading && (
            <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center">
              <span className="text-white text-[10px] font-bold">{Math.round(progress)}%</span>
              <div className="w-10 h-1 bg-slate-700 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>

        <div className={`flex flex-col gap-2 ${isRtl ? 'text-right' : 'text-left'} flex-1`}>
          <h3 className="text-sm font-bold text-slate-200">{auth.currentUser?.displayName || "User"}</h3>
          <p className="text-xs text-slate-400">{auth.currentUser?.email}</p>
          <div className="flex flex-wrap gap-2 mt-1">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/jpeg, image/png, image/webp" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              {photoURL ? t.changePhotoBtn : t.uploadPhotoBtn}
            </button>
            
            {photoURL && !uploading && (
              <button 
                onClick={handleRemovePhoto}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t.removePhotoBtn}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {errorMsg && (
        <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2">
          {errorMsg}
        </div>
      )}
    </div>
  );
}
