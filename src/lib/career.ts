import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export interface CareerProfile {
  fullName: string;
  university?: string;
  major?: string;
  academicYear?: string;
  skills: string[];
  languages: string[];
  interests: string[];
  careerFields: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  lastUpdated?: any;
}

export const saveCareerProfile = async (uid: string, profile: Partial<CareerProfile>): Promise<boolean> => {
  try {
    const docRef = doc(db, "users", uid);
    await setDoc(docRef, { careerProfile: { ...profile, lastUpdated: serverTimestamp() } }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving career profile:", error);
    return false;
  }
};

export const getCareerProfile = async (uid: string): Promise<CareerProfile | null> => {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.careerProfile as CareerProfile || null;
    }
    return null;
  } catch (error) {
    console.error("Error getting career profile:", error);
    return null;
  }
};
