import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, DocumentSnapshot } from 'firebase/firestore';

export class UserRepository {
  private static userDocListeners: Map<string, {
    count: number;
    unsubscribe: () => void;
    callbacks: Set<(doc: DocumentSnapshot) => void>;
    lastSnapshot: DocumentSnapshot | null;
  }> = new Map();

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
    let listenerState = this.userDocListeners.get(uid);

    if (!listenerState) {
      const callbacks = new Set<(doc: DocumentSnapshot) => void>();
      callbacks.add(callback);
      
      const unsubscribe = onSnapshot(this.getUserDocRef(uid), (docSnap) => {
        const state = this.userDocListeners.get(uid);
        if (state) {
          state.lastSnapshot = docSnap;
          state.callbacks.forEach(cb => cb(docSnap));
        }
      });

      listenerState = {
        count: 1,
        unsubscribe,
        callbacks,
        lastSnapshot: null
      };
      
      this.userDocListeners.set(uid, listenerState);
    } else {
      listenerState.count += 1;
      listenerState.callbacks.add(callback);
      
      if (listenerState.lastSnapshot) {
        callback(listenerState.lastSnapshot);
      }
    }

    return () => {
      const state = this.userDocListeners.get(uid);
      if (state) {
        state.callbacks.delete(callback);
        state.count -= 1;
        if (state.count === 0) {
          state.unsubscribe();
          this.userDocListeners.delete(uid);
        }
      }
    };
  }
}
