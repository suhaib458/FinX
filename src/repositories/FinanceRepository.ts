import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { FinancialAnalysis } from '../types';

export class FinanceRepository {
  static getFinancialProfileRef(uid: string) {
    return doc(db, 'users', uid);
  }

  static async getFinancialProfile(uid: string) {
    return getDoc(this.getFinancialProfileRef(uid));
  }

  static async saveFinancialProfile(uid: string, analysisData: FinancialAnalysis) {
    return setDoc(this.getFinancialProfileRef(uid), { 
      financialProfile: { 
        ...analysisData, 
        lastUpdated: serverTimestamp() 
      } 
    }, { merge: true });
  }
}
