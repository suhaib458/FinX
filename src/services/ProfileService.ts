import { auth, storage } from '../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { UserRepository } from '../repositories/UserRepository';

export class ProfileService {
  static async processImageFile(file: File): Promise<Blob> {
    return new Promise<Blob>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const size = Math.min(img.width, img.height);
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
        } catch(e) {
          reject(e);
        }
      };
      img.onerror = () => reject(new Error("Failed to decode image"));
      img.src = URL.createObjectURL(file);
    });
  }

  static async uploadProfilePhoto(uid: string, blob: Blob, onProgress?: (progress: number) => void): Promise<string> {
    const storageRef = ref(storage, `profile-images/${uid}/avatar.webp`);
    const uploadTask = uploadBytesResumable(storageRef, blob, { contentType: 'image/webp' });

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (onProgress) {
             const prog = snapshot.totalBytes > 0 
                ? (snapshot.bytesTransferred / snapshot.totalBytes) * 100 
                : 0;
             onProgress(prog);
          }
        },
        (error) => reject(error),
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            await UserRepository.updateProfilePhotoURL(uid, downloadURL);
            resolve(downloadURL);
          } catch (e) {
            reject(e);
          }
        }
      );
    });
  }

  static async removeProfilePhoto(uid: string): Promise<void> {
    const storageRef = ref(storage, `profile-images/${uid}/avatar`);
    await deleteObject(storageRef).catch(e => { /* Ignore object not found */ });
    await UserRepository.updateProfilePhotoURL(uid, null);
  }

  static async saveOnboardingProfile(uid: string, payload: any, profileBasics?: any): Promise<void> {
    await UserRepository.saveOnboardingSettings(uid, payload);
    if (profileBasics) {
      await UserRepository.saveProfileBasics(uid, profileBasics);
    }
  }

  static subscribeToProfilePhoto(uid: string, callback: (photoURL: string | null) => void) {
    return UserRepository.subscribeToUserDoc(uid, (docSnap) => {
      if (docSnap.exists() && docSnap.data().profilePhotoURL) {
        callback(docSnap.data().profilePhotoURL);
      } else {
        callback(null);
      }
    });
  }
  
  static async getProfilePhotoURL(uid: string): Promise<string | null> {
    const docSnap = await UserRepository.getUserDoc(uid);
    if (docSnap.exists() && docSnap.data().profilePhotoURL) {
      return docSnap.data().profilePhotoURL;
    }
    return null;
  }
  
  static async getOnboardingSettings(uid: string): Promise<any> {
    const docSnap = await UserRepository.getOnboardingSettings(uid);
    return docSnap.exists() ? docSnap.data() : null;
  }
}
