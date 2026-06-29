import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, DocumentSnapshot } from 'firebase/firestore';

export class UserRepository {
  static getUserDocRef(uid: string) {
    return doc(db, 'users', uid);
  }

  static getProfileBasicsRef(uid: string) {
    return doc(db, 'users', uid, 'profile', 'basics');
  }

  static getOnboardingSettingsRef(uid: string) {
    return doc(db, 'users', uid, 'settings', 'onboarding');
  }

  static async getUserDoc(uid: string) {
    return getDoc(this.getUserDocRef(uid));
  }
  
  static async getProfileBasics(uid: string) {
    return getDoc(this.getProfileBasicsRef(uid));
  }

  static async getOnboardingSettings(uid: string) {
    return getDoc(this.getOnboardingSettingsRef(uid));
  }

  static async updateProfilePhotoURL(uid: string, url: string | null) {
    const ref = this.getUserDocRef(uid);
    if (url === null) {
      return updateDoc(ref, { profilePhotoURL: null });
    }
    return setDoc(ref, { profilePhotoURL: url }, { merge: true });
  }

  static async saveProfileBasics(uid: string, data: any) {
    return setDoc(this.getProfileBasicsRef(uid), data, { merge: true });
  }

  static async saveOnboardingSettings(uid: string, data: any) {
    return setDoc(this.getOnboardingSettingsRef(uid), data, { merge: true });
  }

  static subscribeToUserDoc(uid: string, callback: (doc: DocumentSnapshot) => void) {
    return onSnapshot(this.getUserDocRef(uid), callback);
  }
}
