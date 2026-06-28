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

    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg(isRtl ? "حجم الملف الأقصى هو 25 ميجابايت" : "Maximum file size is 25MB");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      console.log("Upload Stage 1: File selected", file.name, file.size);
      
      // Image Processing: Crop to square and compress to webp
      const processedBlob = await new Promise<Blob>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            const size = Math.min(img.width, img.height);
            // Max size of 512x512 for profile avatar optimization
            const finalSize = Math.min(size, 512); 
            
            canvas.width = finalSize;
            canvas.height = finalSize;
            
            const ctx = canvas.getContext("2d");
            if (!ctx) {
               return reject(new Error("Canvas context not available"));
            }
            
            const startX = (img.width - size) / 2;
            const startY = (img.height - size) / 2;
            
            ctx.drawImage(img, startX, startY, size, size, 0, 0, finalSize, finalSize);
            
            canvas.toBlob((blob) => {
              if (blob) {
                console.log("Upload Stage 2: Image processed successfully into blob", blob.size);
                resolve(blob);
              }
              else reject(new Error("Blob creation failed"));
            }, 'image/webp', 0.85);
          } catch(e) {
            reject(e);
          }
        };
        img.onerror = () => {
           reject(new Error("Failed to decode image"));
        };
        img.src = URL.createObjectURL(file);
      });

      console.log("Upload Stage 3: Upload started");
      const storageRef = ref(storage, `profile-images/${auth.currentUser.uid}/avatar.webp`);
      const uploadTask = uploadBytesResumable(storageRef, processedBlob, { contentType: 'image/webp' });

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const prog = snapshot.totalBytes > 0 
              ? (snapshot.bytesTransferred / snapshot.totalBytes) * 100 
              : 0;
          console.log(`Upload Stage 4: Upload progress ${prog.toFixed(2)}%`);
          setProgress(prog);
        },
        (error) => {
          console.error("Firebase Storage Upload Error:", error);
          setUploading(false);
          setProgress(0);
          if (fileInputRef.current) fileInputRef.current.value = '';
          
          if (error.code === 'storage/unknown') {
            setErrorMsg("Storage Bucket not found. Please enable Firebase Storage in your console. (404)");
          } else if (error.code === 'storage/unauthorized') {
            setErrorMsg("Permission denied. Check your Firestore Storage Rules.");
          } else {
            setErrorMsg(error.message || "Failed to upload image. Please try again.");
          }
        },
        async () => {
          console.log("Upload Stage 5: Upload completed");
          setProgress(100);
          
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log("Upload Stage 6: Download URL generated", downloadURL);
            
            const userRef = doc(db, "users", auth.currentUser!.uid);
            await setDoc(userRef, { profilePhotoURL: downloadURL }, { merge: true });
            console.log("Upload Stage 7: Firestore updated with new profilePhotoURL");
            
            setPhotoURL(downloadURL);
          } catch (dbError: any) {
            console.error("Failed to retrieve URL or save to Firestore", dbError);
            setErrorMsg(dbError.message || "Failed to save photo URL to database.");
          }

          setTimeout(() => {
            setUploading(false);
            setProgress(0);
          }, 1000);
          
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      );

    } catch (error: any) {
      console.error("Upload Pipeline Error:", error);
      setErrorMsg(error.message || "Failed to process image before upload.");
      setUploading(false);
      setProgress(0);
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
    <div className="bg-surface-primary border border-border-primary rounded-2xl p-4 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative group">
          <div className="w-20 h-20 rounded-full border-2 border-indigo-500 overflow-hidden bg-bg-secondary flex items-center justify-center shrink-0">
            {photoURL ? (
              <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <Camera className="w-8 h-8 text-text-primary dark:text-text-secondary" />
            )}
          </div>
          
          {uploading && (
            <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center">
              <span className="text-text-primary text-[10px] font-bold">{Math.round(progress)}%</span>
              <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>

        <div className={`flex flex-col gap-2 ${isRtl ? 'text-right' : 'text-left'} flex-1`}>
          <h3 className="text-sm font-bold text-text-primary">{auth.currentUser?.displayName || "User"}</h3>
          <p className="text-xs text-text-primary dark:text-text-secondary">{auth.currentUser?.email}</p>
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
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-text-primary text-[11px] font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              {photoURL ? t.changePhotoBtn : t.uploadPhotoBtn}
            </button>
            
            {photoURL && !uploading && (
              <button 
                onClick={handleRemovePhoto}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t.removePhotoBtn}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {errorMsg && (
        <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2">
          {errorMsg}
        </div>
      )}
    </div>
  );
}
