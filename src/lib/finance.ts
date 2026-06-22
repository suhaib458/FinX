import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { FinancialAnalysis } from "../types";

export const saveFinancialProfile = async (uid: string, analysis: FinancialAnalysis): Promise<boolean> => {
  try {
    const docRef = doc(db, "users", uid);
    await setDoc(docRef, { financialProfile: { ...analysis, lastUpdated: serverTimestamp() } }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving financial profile:", error);
    return false;
  }
};

export const getFinancialProfile = async (uid: string): Promise<FinancialAnalysis | null> => {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.financialProfile as FinancialAnalysis || null;
    }
    return null;
  } catch (error) {
    console.error("Error getting financial profile:", error);
    return null;
  }
};
